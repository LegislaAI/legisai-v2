# Auditoria do Módulo Administrativo

> **Sistema auditado:** Painel administrativo do SaaS LegisDados.
> **O que foi analisado:** a tela administrativa (frontend, projeto `legisai-v2-ai-dash`, pasta `src/app/admin`) **e** a parte do servidor que ela usa (backend, projeto `legis-api`).
> **Data da auditoria:** 28/05/2026.
> **Regra seguida:** nenhum arquivo de código foi alterado. Este documento é o único arquivo criado.

---

## Glossário rápido (para leitura sem jargão)

- **Frontend / tela:** o que o administrador vê e clica no navegador.
- **Backend / servidor / API:** o programa que roda nos bastidores, guarda os dados e executa as ações.
- **Endpoint / rota:** um “endereço” no servidor que a tela chama para pedir ou alterar algo (ex.: `/admin/users`).
- **Token (JWT):** um “crachá digital” que o sistema entrega quando você faz login. A cada ação, a tela mostra esse crachá ao servidor para provar quem você é.
- **CRUD:** as 4 operações básicas sobre um dado — **C**riar, **R**ead (ler/listar), **U**pdate (editar) e **D**elete (apagar).
- **IDOR:** falha em que o sistema executa uma ação sobre um registro **sem checar se aquele registro pertence a quem pediu** — permitindo que um usuário mexa nos dados de outro.
- **Auditoria (audit log):** registro automático de “quem fez o quê e quando”, para investigação posterior.

---

## 1. Resumo Executivo

O painel administrativo está **funcional e bem organizado** para o dia a dia: o administrador consegue listar e editar usuários, operar assinaturas, criar parceiros (cupons), gerar “planos sob medida” com link de pagamento e ajustar as configurações do sistema. As telas têm busca, paginação, estados de carregamento, confirmação antes de ações destrutivas e mensagens de erro — sinais de um produto cuidado. O acesso ao painel é protegido em duas camadas: o **porteiro de rota** (middleware) impede que quem não é administrador abra as telas, e o servidor exige perfil de administrador em cada operação. Para o uso normal, o sistema entrega o que promete.

O problema mais grave **não está nas telas, e sim na fundação de segurança do servidor**. Encontramos três falhas críticas. Duas são do tipo “IDOR”: existe uma ação (desligar a renovação automática de uma assinatura) e uma ação de edição de perfil (que inclui troca de e-mail e senha) que o servidor executa **sem verificar se o registro pertence a quem está pedindo**. Na prática, qualquer usuário logado comum — não precisa ser administrador — consegue, com uma ferramenta simples, **trocar a senha da conta de outra pessoa e tomar posse dela**, ou desligar a cobrança recorrente de qualquer cliente. Isso é risco de fraude, prejuízo financeiro e exposição de dados (LGPD).

A terceira falha crítica é mais sutil, mas igualmente séria: quando o administrador **desativa uma conta** ou **remove o status de administrador** de alguém, essa decisão **não tem efeito imediato no servidor**. O “crachá digital” (token) vale **90 dias** e o servidor confia nele sem reconsultar o banco de dados. Ou seja: uma conta desativada por fraude continua acessando o sistema por até 90 dias, e um administrador que foi rebaixado mantém os poderes de administrador por até 90 dias. As duas ações administrativas que mais importam em uma emergência hoje **são apenas cosméticas no curto prazo**.

Há ainda um conjunto de lacunas de **completude do produto**: o sistema registra tudo na auditoria, mas **não existe tela para o administrador ver esse histórico**; existe um mecanismo de reprocessar pagamentos com falha (webhooks), mas **sem tela**; e **não é possível gerenciar os planos e preços de assinatura pelo painel** (só listar) — qualquer ajuste de preço exige um técnico mexendo direto no banco de dados. Some-se a isso alguns ajustes de “higiene de segurança” do servidor (CORS liberado para qualquer origem, documentação técnica da API exposta publicamente, validação de dados sem “lista branca”).

**Prioridade de gestão:** tratar as três falhas críticas **antes de qualquer crescimento de base de usuários** — elas são exploráveis hoje e o impacto é alto (tomada de conta e prejuízo financeiro). Em seguida, fechar as lacunas de auditoria/webhooks/planos, que afetam a operação e o controle do negócio. Os itens de higiene podem entrar logo depois. No total: **3 problemas críticos, 9 médios e 3 baixos**.

---

## 2. Mapa da Estrutura

### 2.1. Frontend — as telas (projeto `legisai-v2-ai-dash`)

Tudo do administrativo vive em `src/app/admin/`:

```
src/
├── middleware.ts ............ "Porteiro de rota": decide quem pode abrir cada página
│                              (gate de /admin exige perfil ADMIN).
├── context/
│   └── ApiContext.tsx ....... "Carteiro": leva os pedidos da tela ao servidor e anexa o
│                              crachá (token). Faz logout automático se o token expira (401).
└── app/
    └── admin/
        ├── layout.tsx ....... Moldura do painel: cabeçalho "LegisDados / Admin" e
        │                      menu lateral (Visão geral, Usuários, Assinaturas,
        │                      Planos sob medida, Parceiros, Configurações).
        ├── page.tsx ......... Página inicial do admin: cartões que levam a cada seção.
        ├── users/
        │   └── page.tsx ..... USUÁRIOS: lista com busca e paginação; modal com 3 abas
        │                      (Dados de cadastro, Permissão, Conta ativa/desativada).
        ├── signatures/
        │   └── page.tsx ..... ASSINATURAS: lista por status; modal para ajustar prazo,
        │                      cancelar e desligar renovação automática.
        ├── custom-plans/
        │   └── page.tsx ..... PLANOS SOB MEDIDA: cria oferta personalizada e gera link
        │                      de pagamento exclusivo; lista e cancela ofertas.
        ├── partners/
        │   └── page.tsx ..... PARCEIROS: cadastra cupom (código, desconto, comissão,
        │                      carteira Asaas); edita e ativa/desativa.
        ├── config/
        │   └── page.tsx ..... CONFIGURAÇÕES: liga/desliga avaliação gratuita (trial),
        │                      telefone de suporte, instruções de reembolso etc.
        ├── _components/
        │   └── UserCombobox.tsx .. Campo de busca de usuário (usado em Planos sob medida).
        └── _lib/
            └── admin-api.ts .. Funções utilitárias para falar com o servidor:
                                `list` (ler), `post` (criar/acionar), `patch` (editar).
                                ⚠️ NÃO existe função de DELETE (apagar) aqui.
```

### 2.2. Backend — o servidor (projeto `legis-api`, pasta `src/`)

Partes que sustentam o administrativo:

```
src/
├── main.ts .................. Liga o servidor. Define CORS, validação de dados e
│                              expõe a documentação da API (/api e /reference).
├── app.module.ts ............ Monta o sistema e instala o "AuthGuard" global (login).
├── modules/
│   ├── admin/ ............... CÉREBRO DO PAINEL:
│   │   ├── controllers/admin.controller.ts .. Define as rotas /admin/* (usuários,
│   │   │                                       assinaturas, config, auditoria, webhooks).
│   │   ├── services/admin.service.ts ........ Faz o trabalho de verdade (lê/grava no banco).
│   │   ├── services/admin-audit.service.ts .. Grava o histórico de auditoria.
│   │   └── dto/admin.dto.ts ................. Regras de validação dos dados recebidos.
│   ├── custom-plan/ ......... Planos sob medida (controller admin + controller público
│   │                          com token + serviço).
│   ├── partner/ ............. Parceiros/cupons (controller admin + serviço + validação).
│   ├── signature/ .......... Assinaturas e planos de assinatura. Inclui a rota de
│   │                          "desligar renovação" usada pelo painel.
│   └── account/ ............. Contas de usuário: cadastro, login, edição de perfil,
│                              recuperação de senha.
└── shared/
    ├── auth/
    │   ├── auth.guard.ts ..... Confere o crachá (token) em toda requisição.
    │   ├── admin.guard.ts .... Exige que o crachá diga "perfil = ADMIN".
    │   └── auth.module.ts .... Define que o crachá vale 90 dias.
    ├── decorators/AdminOnly.decorator.ts ... "Selo" que tranca um controller para admins.
    └── config/system-config.service.ts .... Lê/grava as configurações do sistema.
```

### 2.3. Como a tela conversa com o servidor (visão de fluxo)

| Tela do admin | Rota chamada no servidor | Quem atende no servidor | OK? |
|---|---|---|---|
| Usuários — listar/buscar | `GET /admin/users` | admin.controller.ts:28 | ✅ |
| Usuários — editar dados | `PATCH /admin/users/:id` | admin.controller.ts:69 | ✅ |
| Usuários — mudar permissão | `PATCH /admin/users/:id/role` | admin.controller.ts:51 | ✅ |
| Usuários — ativar/desativar | `PATCH /admin/users/:id/active` | admin.controller.ts:60 | ✅ |
| Assinaturas — listar | `GET /admin/signatures` | admin.controller.ts:87 | ✅ |
| Assinaturas — ajustar prazo/ativar | `POST /admin/signatures/:id/activate` | admin.controller.ts:101 | ✅ |
| Assinaturas — cancelar | `POST /admin/signatures/:id/cancel` | admin.controller.ts:96 | ✅ |
| Assinaturas — desligar renovação | `POST /signature/:id/cancel-renewal` | user-signature.controller.ts:99 | ⚠️ rota NÃO-admin, sem dono, sem auditoria (ver P-001 e P-004) |
| Planos sob medida — listar | `GET /admin/custom-plans` | admin-custom-plan.controller.ts:18 | ✅ |
| Planos sob medida — criar | `POST /admin/custom-plans` | admin-custom-plan.controller.ts:13 | ✅ |
| Planos sob medida — cancelar | `POST /admin/custom-plans/:id/cancel` | admin-custom-plan.controller.ts:31 | ✅ |
| Planos (catálogo p/ selects) | `GET /admin/signature-plans` | admin.controller.ts:80 | ✅ |
| Parceiros — listar/buscar | `GET /admin/partners` | admin-partner.controller.ts:20 | ✅ |
| Parceiros — criar | `POST /admin/partners` | admin-partner.controller.ts:33 | ✅ |
| Parceiros — editar/ativar | `PATCH /admin/partners/:id` | admin-partner.controller.ts:38 | ✅ |
| Configurações — listar | `GET /admin/config` | admin.controller.ts:128 | ✅ |
| Configurações — salvar | `PATCH /admin/config/:key` | admin.controller.ts:133 | ✅ |

**Rotas que existem no servidor mas NÃO têm tela (capacidade “órfã”):**
`GET /admin/audit` (admin.controller.ts:144), `GET /admin/webhooks` (admin.controller.ts:112), `POST /admin/webhooks/:id/reprocess` (admin.controller.ts:121), `GET /admin/users/:id` (admin.controller.ts:37) e `PATCH /admin/users/:id/payment-id` (admin.controller.ts:42).

---

## 3. Mapa de Funcionalidades por Entidade

Legenda: ✅ existe / ⚠️ incompleto / ❌ não existe.

### 3.1. Usuário (conta de cliente)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Criar (pelo admin) | ❌ | — | Admin não cria conta. Só há cadastro público (`/user/signup`). |
| Listar / buscar | ✅ | users/page.tsx:57; admin.service.ts:26 | Busca por nome, e-mail e CPF/CNPJ, com paginação. |
| Ver detalhes | ⚠️ | admin.controller.ts:37 | Rota `GET /admin/users/:id` existe, mas **nenhuma tela usa**. |
| Editar dados | ✅ | users/page.tsx:388; admin.service.ts:131 | Nome, e-mail, telefone, CPF/CNPJ, profissão, CEP, número. |
| Mudar permissão (ADMIN/USER) | ✅ | users/page.tsx:493; admin.service.ts:95 | Com confirmação. Mas ver P-003 (efeito não é imediato). |
| Ativar / desativar | ✅ (soft) | users/page.tsx:543; admin.service.ts:113 | “Desativar” bloqueia login novo, mas ver P-003. |
| Apagar de vez (delete) | ❌ | — | Não há exclusão definitiva. Avaliar exigência de LGPD (P-014). |

### 3.2. Assinatura (UserSignature)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Criar (pelo admin) | ❌ | — | Nasce do fluxo de pagamento, não do painel. |
| Listar / filtrar por status | ✅ | signatures/page.tsx:67; admin.service.ts:193 | Filtro: ativa, em atraso, inativa, expirada. |
| Ajustar prazo / reativar | ✅ | signatures/page.tsx:316; admin.service.ts:237 | Data manual ou atalhos (+30/+90/+365 dias). |
| Cancelar imediatamente | ✅ | signatures/page.tsx:337; admin.service.ts:219 | Com confirmação. Registrado na auditoria. |
| Desligar renovação automática | ⚠️ | signatures/page.tsx:361; user-signature.service.ts:484 | **Funciona, mas por rota insegura e sem auditoria** (P-001, P-004). |
| Apagar de vez | ❌ | — | Por design (mantém histórico financeiro). |

### 3.3. Plano sob medida (CustomPlan)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Criar + gerar link | ✅ | custom-plans/page.tsx:138; custom-plan.service.ts:75 | Gera token assinado com validade configurável. |
| Listar | ✅ | custom-plans/page.tsx:103; custom-plan.service.ts:146 | Com status (Ativo/Expirado/Utilizado/Cancelado). |
| Editar | ❌ | — | Não dá para editar; só criar outro. (Documentado na própria tela.) |
| Cancelar | ✅ | custom-plans/page.tsx:178; custom-plan.service.ts:181 | Invalida o link. Registrado na auditoria. |
| Reexibir o link depois | ❌ | custom-plans/page.tsx:553 | Por design: o link só aparece no momento da criação. |

### 3.4. Parceiro / Cupom (Partner)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Criar | ✅ | partners/page.tsx:61; partners.service.ts:28 | Código, desconto %, comissão %, carteira Asaas. |
| Listar / buscar | ✅ | partners/page.tsx:45; partners.service.ts:100 | Busca por código ou nome. |
| Editar | ✅ | partners/page.tsx:353; partners.service.ts:67 | Nome, carteira, desconto, comissão. |
| Ativar / desativar | ✅ (soft) | partners/page.tsx:445; partners.service.ts:67 | Desativar rejeita o cupom no checkout. |
| Apagar de vez | ❌ | — | Só desativação. |

### 3.5. Plano de assinatura (SignaturePlan — catálogo base)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Criar | ❌ | — | **Sem gestão pelo painel.** |
| Listar | ✅ | admin.service.ts:182 | Usado apenas para preencher menus de seleção. |
| Editar preço/nível | ❌ | — | **Preços só mudam direto no banco** (ver P-007). |
| Apagar | ❌ | — | — |

### 3.6. Configuração do sistema (SystemConfig)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Ler | ✅ | config/page.tsx:79; admin.service.ts:320 | Trial, suporte, reembolso etc. |
| Editar | ✅ | config/page.tsx:105; admin.service.ts:324 | Aplicado na hora. Registrado na auditoria. |
| Criar chave nova | ⚠️ | system-config.service.ts:32 | Aceita **qualquer** chave, inclusive errada (P-013). |

### 3.7. Auditoria e Webhooks (operação)

| Funcionalidade | Existe? | Onde no código | Observação |
|---|---|---|---|
| Gravar auditoria | ✅ | admin-audit.service.ts:9 | Automático nas ações do AdminService. |
| **Ver** auditoria | ⚠️ | admin.controller.ts:144 | Rota existe, **mas não há tela** (P-005). |
| Listar webhooks de pagamento | ⚠️ | admin.controller.ts:112 | Rota existe, **sem tela** (P-006). |
| Reprocessar webhook com falha | ⚠️ | admin.controller.ts:121 | Rota existe, **sem tela** (P-006). |

---

## 4. Problemas Encontrados

> Os IDs estão em ordem de severidade (críticos primeiro). “Onde” aponta arquivo e linha.

---

### 🔴 CRÍTICOS

---

**ID:** P-001
**Título:** Qualquer usuário logado pode desligar a renovação automática (cobrança recorrente) de QUALQUER assinatura
**Categoria:** Segurança (IDOR)
**Severidade:** 🔴 Crítico
**Onde:**
- Rota: `legis-api/src/modules/signature/controllers/user-signature.controller.ts:99-102`
- Lógica: `legis-api/src/modules/signature/services/user-signature.service.ts:484-518`
- Quem chama no painel: `legisai-v2-ai-dash/src/app/admin/signatures/page.tsx:370`

**O que acontece hoje (em linguagem simples):**
Existe uma ação chamada “desligar renovação automática”. O servidor recebe apenas o **número (ID) da assinatura** e desliga a cobrança — **sem checar se aquela assinatura pertence a quem está pedindo**. A rota não é restrita a administradores; basta estar logado (qualquer cliente comum). Como os IDs seguem um padrão, uma pessoa mal-intencionada com conhecimento técnico básico consegue desligar a renovação de assinaturas de outros clientes em massa. O painel admin usa essa mesma rota; ela funciona para o admin por acaso (admin também está logado), mas a porta fica aberta para todos.

**O que deveria acontecer:**
O servidor deveria confirmar que a assinatura pertence ao usuário que fez o pedido. No caso do administrador, deveria existir uma rota **separada e restrita a admins** (como já existe para “cancelar” e “ativar”), que também grave na auditoria.

**Como corrigir (passo a passo para quem não programa):**
1. Peça ao desenvolvedor para criar uma rota administrativa dedicada, por exemplo `POST /admin/signatures/:id/cancel-renewal`, dentro do controller de admin, protegida pelo selo `@AdminOnly()` e gravando auditoria (igual às outras ações de assinatura).
2. Apontar o botão do painel para essa nova rota (em `signatures/page.tsx:370`).
3. Na rota original de cliente (`/signature/:id/cancel-renewal`), exigir o usuário do crachá e **verificar que a assinatura é dele** antes de desligar; recusar caso contrário.
4. Testar: logar como um cliente A e tentar desligar a renovação de uma assinatura do cliente B — deve ser **recusado**.

**Esforço estimado:** Baixo.

---

**ID:** P-002
**Título:** Qualquer usuário logado pode editar o perfil de outra pessoa — inclusive trocar e-mail e senha (tomada de conta)
**Categoria:** Segurança (IDOR / sequestro de conta)
**Severidade:** 🔴 Crítico
**Onde:**
- Rota: `legis-api/src/modules/account/controllers/user.controller.ts:54-79`
- Lógica: `legis-api/src/modules/account/services/user.service.ts:90-123`

**O que acontece hoje (em linguagem simples):**
A rota de “editar perfil” recebe o **ID do usuário pela URL** e altera os dados desse ID — **sem conferir se é a própria pessoa**. A edição inclui **e-mail e senha**. Resultado: qualquer cliente logado pode trocar a senha da conta de qualquer outra pessoa e assumir o controle dela. É a falha mais perigosa do sistema, porque leva a sequestro de conta e exposição de dados pessoais (risco de LGPD).
*(Observação: esta rota é do módulo de Contas, não do painel admin. Mas é o servidor que sustenta todo o SaaS, e a falha é crítica — por isso entra na auditoria.)*

**O que deveria acontecer:**
O servidor deve ignorar o ID vindo da URL e usar **somente a identidade do crachá (token)** para saber qual conta editar — assim ninguém edita a conta de outro.

**Como corrigir (passo a passo para quem não programa):**
1. Peça ao desenvolvedor para alterar a rota de edição de perfil para **usar a identidade do token** (o mesmo mecanismo `@CurrentUserId()` já usado em outras rotas) em vez do ID da URL.
2. Alternativamente, manter o ID na URL mas **recusar** se ele for diferente do dono do token.
3. Testar: logar como cliente A e tentar editar (trocar senha de) a conta do cliente B — deve ser **recusado**.

**Esforço estimado:** Baixo.

---

**ID:** P-003
**Título:** Desativar conta e remover permissão de administrador NÃO têm efeito imediato — duram só na próxima vez que a pessoa fizer login (até 90 dias depois)
**Categoria:** Segurança / Incompleto
**Severidade:** 🔴 Crítico
**Onde:**
- Validade do crachá: `legis-api/src/shared/auth/auth.module.ts:13-16` (`expiresIn: '90d'`)
- Conferência do crachá: `legis-api/src/shared/auth/auth.guard.ts:40-50` (lê o perfil de dentro do token, **não consulta o banco**)
- Login confere “ativo”: `legis-api/src/modules/account/services/user.service.ts:80-83`

**O que acontece hoje (em linguagem simples):**
Quando alguém faz login, recebe um “crachá” que vale **90 dias** e que carrega o perfil (ADMIN ou USER) **congelado** naquele momento. O servidor confia no crachá e **não reconsulta o banco de dados** a cada ação. Consequências:
- **Desativar uma conta** só impede **novos** logins. Quem já está logado continua entrando normalmente por até 90 dias. Se você desativa uma conta por fraude/abuso, o fraudador segue acessando.
- **Remover o status de administrador** de alguém só vale quando o crachá dele expirar (até 90 dias). Até lá, ele continua conseguindo chamar as ações de administrador direto no servidor.
*(A tela do painel até bloqueia o admin rebaixado mais cedo, porque o porteiro de rota reconsulta o perfil no banco — `middleware.ts:126`. Mas o servidor em si continua aceitando o crachá antigo, então as ações administrativas via chamada direta continuam funcionando.)*

**O que deveria acontecer:**
Desativar ou rebaixar deveria cortar o acesso **na hora**. As duas correções comuns: (a) o servidor reconsultar no banco se a conta está ativa e qual é o perfil atual, a cada requisição; e/ou (b) reduzir muito a validade do crachá e usar um mecanismo de renovação, permitindo invalidar sessões.

**Como corrigir (passo a passo para quem não programa):**
1. Decisão de produto: o “porteiro” do servidor (AuthGuard) deve **reconsultar o banco** em cada requisição para confirmar que a conta está ativa e qual o perfil atual (mais seguro, custo pequeno de desempenho).
2. Alternativa/complemento: reduzir a validade do crachá (ex.: de 90 dias para algumas horas) e implementar renovação automática + lista de sessões revogadas.
3. Após desativar/rebaixar, o sistema deveria poder **invalidar a sessão atual** da pessoa.
4. Testar: desativar uma conta logada e confirmar que, na ação seguinte, ela é **deslogada/recusada**; rebaixar um admin logado e confirmar que ele perde o acesso administrativo **imediatamente**.

**Esforço estimado:** Médio.

---

### 🟡 MÉDIOS

---

**ID:** P-004
**Título:** A ação “desligar renovação automática” não é registrada na auditoria
**Categoria:** Incompleto / Segurança (rastreabilidade)
**Severidade:** 🟡 Médio
**Onde:** `legis-api/src/modules/signature/services/user-signature.service.ts:484-518` (não chama `audit.log`); contraste com `admin.service.ts:219` e `:237`, que registram.

**O que acontece hoje (em linguagem simples):**
A página inicial do painel e a tela de configurações afirmam que “toda alteração é registrada na auditoria”. Mas a ação de desligar a renovação automática passa por uma rota de cliente que **não grava** esse histórico. Se um administrador desligar a renovação de uma assinatura, **não fica registro** de quem fez. Isso quebra a promessa de rastreabilidade e atrapalha investigações.

**O que deveria acontecer:**
Toda ação administrativa sobre assinaturas (incluindo desligar renovação) deveria ser gravada na auditoria, com quem fez e quando.

**Como corrigir (passo a passo para quem não programa):**
1. Ao criar a rota admin dedicada do P-001, incluir o registro de auditoria (igual a “cancelar”/“ativar”).
2. Testar: desligar a renovação pelo painel e confirmar que aparece um novo registro de auditoria.

**Esforço estimado:** Baixo (resolve junto com P-001).

---

**ID:** P-005
**Título:** Não existe tela para o administrador ver o histórico de auditoria
**Categoria:** Faltando
**Severidade:** 🟡 Médio
**Onde:** Servidor pronto em `admin.controller.ts:144` (`GET /admin/audit`) e `admin-audit.service.ts:27`; **nenhuma página** correspondente em `src/app/admin/`.

**O que acontece hoje (em linguagem simples):**
O sistema grava diligentemente quem fez o quê, mas **o administrador não tem como ver isso pelo painel**. O dado existe e fica guardado, porém invisível. Para consultar, hoje seria preciso um técnico acessando o banco. É uma promessa do produto (“fica registrado na auditoria”) sem entrega da consulta.

**O que deveria acontecer:**
Uma tela “Auditoria” no menu, listando as ações (data, administrador, ação, alvo, antes/depois), com paginação e, idealmente, filtros.

**Como corrigir (passo a passo para quem não programa):**
1. Adicionar “Auditoria” ao menu lateral (`layout.tsx:4`).
2. Criar a página `src/app/admin/audit/page.tsx` que consome `GET /admin/audit` (a função `list` já existe em `admin-api.ts`).
3. Mostrar em tabela com paginação; opcional: filtro por administrador.

**Esforço estimado:** Médio (o servidor já está pronto; falta a tela).

---

**ID:** P-006
**Título:** Não existe tela para acompanhar e reprocessar pagamentos com falha (webhooks)
**Categoria:** Faltando
**Severidade:** 🟡 Médio
**Onde:** Servidor pronto em `admin.controller.ts:112` (listar) e `:121` (reprocessar); **sem tela**.

**O que acontece hoje (em linguagem simples):**
Quando o sistema de pagamento (Asaas) avisa sobre uma cobrança, o evento é guardado e processado em segundo plano. Se algum evento falhar, **existe no servidor** uma forma de listá-lo e mandar processar de novo — mas **não há tela** para o administrador fazer isso. Na prática, um pagamento que “travou” depende de intervenção técnica no banco/servidor, em vez de um botão no painel.

**O que deveria acontecer:**
Uma tela “Webhooks/Pagamentos” listando eventos (com filtro “somente pendentes”) e um botão “Reprocessar”.

**Como corrigir (passo a passo para quem não programa):**
1. Adicionar item ao menu e criar `src/app/admin/webhooks/page.tsx`.
2. Consumir `GET /admin/webhooks?onlyPending=true` para listar e `POST /admin/webhooks/:id/reprocess` para reprocessar.
3. Mostrar status, tentativas e último erro de cada evento.

**Esforço estimado:** Médio (servidor pronto).

---

**ID:** P-007
**Título:** Não é possível gerenciar planos e preços de assinatura pelo painel
**Categoria:** Faltando
**Severidade:** 🟡 Médio
**Onde:** Só há listagem em `admin.service.ts:182` (`GET /admin/signature-plans`); não existe criar/editar/remover plano.

**O que acontece hoje (em linguagem simples):**
O painel apenas **lê** os planos (para preencher menus de seleção em “Planos sob medida” e na configuração do trial). **Não há como criar um plano novo nem alterar preço, nome ou nível** pela interface. Qualquer mudança de preço exige um técnico editando o banco de dados diretamente — arriscado e lento para uma decisão comercial comum.

**O que deveria acontecer:**
Uma área para criar/editar planos (nome, nível, preços PIX e cartão, desconto anual, se é interno), com as devidas validações.

**Como corrigir (passo a passo para quem não programa):**
1. Decisão de produto: confirmar quais campos do plano o time comercial precisa ajustar.
2. Desenvolvedor cria as rotas administrativas de criar/editar plano (com auditoria) e uma tela “Planos” no painel.
3. Como mexe em preço (sensível), incluir confirmação e registro de auditoria.

**Esforço estimado:** Alto (precisa de telas e rotas novas, com cuidado por envolver preço).

---

**ID:** P-008
**Título:** Validação de dados sem “lista branca” — campos extras enviados não são descartados
**Categoria:** Segurança (hardening / mass assignment)
**Severidade:** 🟡 Médio
**Onde:** `legis-api/src/main.ts:14-18` (`ValidationPipe` sem `whitelist`); efeito visível em `partners.service.ts:84` (grava o objeto recebido direto no banco).

**O que acontece hoje (em linguagem simples):**
A “peneira” que valida os dados recebidos confere os campos esperados, mas **não remove campos extras** que venham junto no pedido. Em alguns pontos (ex.: edição de parceiro) o objeto recebido é gravado quase direto no banco. Isso abre espaço para alguém **injetar campos não previstos** e alterar dados que não deveriam ser editáveis. Como hoje só administradores chamam essas rotas, o risco imediato é menor — mas é uma fragilidade que não custa caro fechar.

**O que deveria acontecer:**
A peneira deveria **descartar automaticamente** qualquer campo não declarado (e, idealmente, recusar pedidos com campos desconhecidos).

**Como corrigir (passo a passo para quem não programa):**
1. Pedir ao desenvolvedor para ligar as opções `whitelist: true` e `forbidNonWhitelisted: true` na validação global (`main.ts`).
2. Rodar os testes e clicar pelas telas para garantir que nada quebrou (campos legítimos continuam funcionando).

**Esforço estimado:** Baixo.

---

**ID:** P-009
**Título:** Servidor aceita chamadas de qualquer site (CORS liberado)
**Categoria:** Segurança (hardening)
**Severidade:** 🟡 Médio
**Onde:** `legis-api/src/main.ts:10` (`NestFactory.create(AppModule, { cors: true })`).

**O que acontece hoje (em linguagem simples):**
O servidor está configurado para aceitar requisições vindas de **qualquer endereço da internet**. Para uma API que lida com dados pessoais e pagamentos, o recomendado é permitir apenas os endereços oficiais do produto (o app e a landing page). Liberar tudo amplia a superfície para abusos, especialmente combinado com as falhas de IDOR (P-001/P-002).

**O que deveria acontecer:**
Permitir apenas as origens conhecidas (domínios oficiais do sistema).

**Como corrigir (passo a passo para quem não programa):**
1. Listar os domínios oficiais (ex.: o do app e o da landing page).
2. Pedir ao desenvolvedor para restringir o CORS a essa lista, em vez de `true`.
3. Testar o app e a landing para garantir que continuam funcionando.

**Esforço estimado:** Baixo.

---

**ID:** P-010
**Título:** Documentação técnica da API exposta publicamente
**Categoria:** Segurança (exposição de informação)
**Severidade:** 🟡 Médio
**Onde:** `legis-api/src/main.ts:23-39` (Swagger em `/api` e Scalar em `/reference`, sem proteção).

**O que acontece hoje (em linguagem simples):**
O servidor publica, em endereços abertos, o “mapa completo” de todas as rotas da API. Isso facilita muito a vida de quem queira explorar as falhas de IDOR (P-001/P-002), pois entrega de bandeja a lista de endpoints e formatos. Em produção, essa documentação deveria ser fechada (ou exigir login).

**O que deveria acontecer:**
A documentação deveria ser desativada em produção ou protegida por senha/login de administrador.

**Como corrigir (passo a passo para quem não programa):**
1. Decidir: desligar em produção, ou proteger com autenticação.
2. Desenvolvedor condiciona a publicação da documentação ao ambiente (só em desenvolvimento) ou adiciona proteção.

**Esforço estimado:** Baixo.

---

**ID:** P-011
**Título:** Se faltar uma configuração de ambiente, o painel admin “abre sem porteiro” (falha aberta)
**Categoria:** Segurança / Quebrado (em cenário de má configuração)
**Severidade:** 🟡 Médio
**Onde:** `legisai-v2-ai-dash/src/middleware.ts:123-125` (quando `NEXT_PUBLIC_API_URL` não está definida, faz `NextResponse.next()` sem checar o perfil).

**O que acontece hoje (em linguagem simples):**
O “porteiro de rota” do painel só confere se você é administrador **se** uma variável de configuração (o endereço da API) estiver definida. Se essa configuração faltar, o porteiro **deixa passar sem checar** e as telas do admin aparecem para qualquer um logado. *(Mesmo nesse caso, o servidor ainda recusaria as ações por exigir perfil ADMIN — então os dados não vazam por aqui sozinhos. Mas a tela não deveria abrir.)* É uma “falha aberta”: diante de um erro de configuração, o sistema escolhe o caminho **menos** seguro.

**O que deveria acontecer:**
Na dúvida (configuração ausente), o porteiro deveria **bloquear** o acesso, não liberar.

**Como corrigir (passo a passo para quem não programa):**
1. Pedir ao desenvolvedor para, quando a configuração faltar, **redirecionar para fora do admin** (ex.: para a home ou login), em vez de deixar passar.
2. Garantir que a configuração de ambiente esteja sempre presente em produção (checklist de deploy).

**Esforço estimado:** Baixo.

---

**ID:** P-012
**Título:** Editar usuário pelo admin pode quebrar (erro genérico) se o e-mail já existir em outra conta
**Categoria:** Incompleto (tratamento de erro)
**Severidade:** 🟡 Médio
**Onde:** `legis-api/src/modules/admin/services/admin.service.ts:131-158` (grava o e-mail sem verificar duplicidade); comparar com o cadastro, que verifica em `user.service.ts:166-169`.

**O que acontece hoje (em linguagem simples):**
Ao editar os dados de um usuário pelo painel, se o administrador colocar um e-mail que **já pertence a outra conta**, o sistema tenta gravar e o banco rejeita (e-mail é único). O administrador vê uma **mensagem de erro genérica e confusa**, sem explicar que o problema é o e-mail repetido. Não há perda de dados, mas a experiência é ruim e pode parecer um “bug travando tudo”.

**O que deveria acontecer:**
Antes de salvar, verificar se o e-mail já existe em outra conta e, em caso afirmativo, mostrar uma mensagem clara (“Este e-mail já está em uso por outro usuário”).

**Como corrigir (passo a passo para quem não programa):**
1. Desenvolvedor adiciona, no salvamento de dados do usuário (admin), uma verificação de e-mail duplicado com mensagem amigável.
2. Testar: editar um usuário colocando o e-mail de outro — deve aparecer mensagem clara, não erro genérico.

**Esforço estimado:** Baixo.

---

### 🟢 BAIXOS

---

**ID:** P-013
**Título:** Configurações aceitam qualquer “chave”, inclusive digitada errada
**Categoria:** Incompleto (integridade de dados)
**Severidade:** 🟢 Baixo
**Onde:** `legis-api/src/modules/admin/services/admin.service.ts:324-335` e `system-config.service.ts:32-38` (grava qualquer chave via “upsert”).

**O que acontece hoje (em linguagem simples):**
A tela de configurações só mostra/edita chaves que já existem, então no uso normal não há risco. Mas o servidor, por baixo, aceita gravar **qualquer** chave de configuração. Se uma chave for criada errada (por integração futura, teste ou erro de digitação em uma chamada direta), ela passa a aparecer na seção “Outros” da tela, poluindo a interface e gerando confusão.

**O que deveria acontecer:**
O servidor deveria aceitar **apenas** uma lista conhecida de chaves de configuração.

**Como corrigir (passo a passo para quem não programa):**
1. Listar as configurações válidas do sistema (trial, suporte, reembolso etc.).
2. Desenvolvedor faz o servidor recusar chaves fora dessa lista.

**Esforço estimado:** Baixo.

---

**ID:** P-014
**Título:** Não há exclusão definitiva de dados (usuários, parceiros) — só desativação
**Categoria:** Faltando (conformidade LGPD a verificar)
**Severidade:** 🟢 Baixo
**Onde:** Ausência de DELETE em `admin-api.ts:14-53` (só `list`, `post`, `patch`); entidades usam desativação “suave”.

**O que acontece hoje (em linguagem simples):**
O sistema, por design, **não apaga** dados — desativa. Isso é bom para histórico financeiro, mas a **LGPD** dá ao usuário o “direito de ser esquecido” (exclusão de dados pessoais sob solicitação). Não encontramos um fluxo para isso no painel. Pode ser uma exigência legal dependendo do tipo de dado guardado.

**O que deveria acontecer:**
Avaliar com jurídico se é necessário um fluxo de exclusão/anonimização de dados pessoais a pedido do titular.

**Como corrigir (passo a passo para quem não programa):**
1. Validar com o jurídico a obrigatoriedade e o escopo (apagar vs. anonimizar).
2. Se necessário, desenvolvedor cria um fluxo controlado de exclusão/anonimização com auditoria.

**Esforço estimado:** Médio (depende da decisão jurídica).

---

**ID:** P-015
**Título:** Rotas administrativas sem uso (capacidade ociosa)
**Categoria:** Incompleto (organização)
**Severidade:** 🟢 Baixo
**Onde:** `admin.controller.ts:37` (`GET /admin/users/:id`) e `admin.controller.ts:42` (`PATCH /admin/users/:id/payment-id`) — nenhuma tela usa.

**O que acontece hoje (em linguagem simples):**
Existem duas funções prontas no servidor que **nenhuma tela usa**: ver detalhes completos de um usuário e alterar o “ID de pagamento” de um usuário. Não causam dano, mas indicam funcionalidades planejadas e não finalizadas (ou abandonadas). Vale decidir: completar a tela correspondente ou remover para manter o sistema enxuto.

**O que deveria acontecer:**
Decidir caso a caso: usar (criar a tela) ou remover a rota não utilizada.

**Como corrigir (passo a passo para quem não programa):**
1. Revisar com o time se essas funções ainda fazem parte do plano.
2. Completar a interface ou remover o código ocioso.

**Esforço estimado:** Baixo.

---

## 5. Plano de Ação Priorizado

Ordem recomendada de execução, pensando como um roadmap de projeto.

### Fase 0 — Emergência de segurança (fazer ANTES de crescer a base de usuários)

| Ordem | Item | Por quê | Esforço |
|---|---|---|---|
| 1 | **P-002** — Corrigir edição de perfil (tomada de conta) | Falha mais perigosa: troca de senha alheia = sequestro de conta + risco LGPD. | Baixo |
| 2 | **P-001** — Corrigir “desligar renovação” (IDOR) + criar rota admin dedicada | Permite sabotar cobranças de qualquer cliente; prejuízo financeiro. | Baixo |
| 3 | **P-003** — Tornar “desativar conta” e “rebaixar admin” imediatos | As duas ações de emergência do admin hoje não funcionam de fato por até 90 dias. | Médio |
| 4 | **P-004** — Auditar a ação de renovação | Sai “de graça” junto com o P-001 e fecha a lacuna de rastreabilidade. | Baixo |

### Fase 1 — Higiene de segurança (logo em seguida)

| Ordem | Item | Por quê | Esforço |
|---|---|---|---|
| 5 | **P-010** — Fechar/proteger a documentação da API | Reduz o “mapa de ataque” exposto publicamente. | Baixo |
| 6 | **P-009** — Restringir CORS aos domínios oficiais | Diminui a superfície de abuso. | Baixo |
| 7 | **P-008** — Ligar “lista branca” na validação | Fecha brecha de campos extras / mass assignment. | Baixo |
| 8 | **P-011** — Corrigir “falha aberta” do porteiro do admin | Em erro de configuração, bloquear em vez de liberar. | Baixo |

### Fase 2 — Completude do produto (controle do negócio)

| Ordem | Item | Por quê | Esforço |
|---|---|---|---|
| 9 | **P-005** — Tela de Auditoria | Entrega a promessa de rastreabilidade; servidor já pronto. | Médio |
| 10 | **P-006** — Tela de Webhooks/Pagamentos | Permite resolver pagamentos travados sem técnico no banco. | Médio |
| 11 | **P-007** — Gestão de planos e preços | Hoje preço só muda no banco; decisão comercial fica refém de TI. | Alto |
| 12 | **P-012** — Mensagem clara para e-mail duplicado na edição | Melhora a experiência e evita “parece que travou”. | Baixo |

### Fase 3 — Ajustes finos e conformidade

| Ordem | Item | Por quê | Esforço |
|---|---|---|---|
| 13 | **P-013** — Restringir chaves de configuração válidas | Evita poluição/erro na tela de configurações. | Baixo |
| 14 | **P-014** — Avaliar exclusão/anonimização LGPD | Possível obrigação legal; validar com jurídico. | Médio |
| 15 | **P-015** — Limpar/finalizar rotas ociosas | Mantém o sistema enxuto e claro. | Baixo |

---

## Encerramento da auditoria

- **Total de problemas encontrados: 15.**
  - 🔴 **Críticos: 3** (P-001, P-002, P-003)
  - 🟡 **Médios: 9** (P-004 a P-012)
  - 🟢 **Baixos: 3** (P-013, P-014, P-015)
- **Pontos fortes confirmados:** painel bem estruturado; proteção de rota em duas camadas (middleware + servidor); confirmação em ações destrutivas; busca/paginação/estados de carregamento tratados; login bloqueia conta desativada; webhook de pagamento com verificação de token em tempo constante; fluxo de “plano sob medida” completo de ponta a ponta (criação → link → checkout público → consumo).
- **Itens marcados para verificação manual:** P-014 (necessidade jurídica de exclusão de dados — LGPD) depende de decisão do jurídico, não de leitura de código.
- **Nenhum arquivo de código foi alterado.** Este relatório é o único arquivo criado.

**Arquivo salvo em:**
`c:\Users\mayco\OneDrive\Documentos\Projetos\New legis\Web-Api\legisai-v2-ai-dash\AUDITORIA_ADMIN.md`
