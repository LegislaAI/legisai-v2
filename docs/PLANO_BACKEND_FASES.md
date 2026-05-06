# Plano de Backend — LegisDados
## Substituição de Mocks + Novas Features com IA

> **Data:** 2026-05-04  
> **Projeto:** LegisDados (SaaS legislativo)  
> **Stack:** NestJS 10 + Prisma 6 + Next.js 16 + OpenRouter + Gemini 2.0 Flash  
> **Skills de apoio:** `backend-nestjs-legisdados` · `prisma-safe-migrations` · `ai-openrouter-gemini` · `mock-to-real-replacement`

---

## Diagnóstico: O que é mock vs real hoje

| Tela | Componente | Status | Arquivo do mock |
|---|---|---|---|
| `/plenario` | Insights da Semana | **MOCK** | `page.tsx` (inline hardcoded) |
| `/plenario/deliberativa/[id]` → `/dashboard` | Dashboard IA completo | **MOCK** | `dashboard/_lib/mockSessionDashboard.ts` |
| `/deputados/[id]` → aba Proposições | Lista de proposições | **MOCK** | `TabProposicoes.tsx` (arrays `MOCK_PROPOSICOES_*`) |
| `/deputados/[id]` → aba Presenças | Presença por comissão | **MOCK** | `TabPresencas.tsx` (objeto `MOCK_PRESENCAS`) |
| `/deputados/[id]` → aba Despesas | CEAP detalhado | **REAL** (parcial) | — |
| `/deputados/[id]` → aba Posicionamento | Votações + Temas | **REAL** | — |

---

## Ordem de execução recomendada

| # | Fase | Esforço | Risco | Impacto |
|---|---|---|---|---|
| 1 | Proposições do Deputado | Baixo | Zero | Alto |
| 2 | Presenças do Deputado | Baixo | Zero | Alto |
| 3 | Dashboard IA da Sessão | Médio | Baixo | Muito alto |
| 4 | Insights da Semana | Médio | Baixo | Médio |
| 5 | CEAP completo (Despesas) | Alto | Baixo | Médio |
| 6 | Posicionamento avançado | Médio | Baixo | Médio |

---

## FASE 1 — Proposições do Deputado

**Tela:** `/deputados/[id]` → aba "Proposições"  
**Mock atual:** `TabProposicoes.tsx` — arrays `MOCK_PROPOSICOES_AUTOR` (7 itens) e `MOCK_PROPOSICOES_COAUTOR` (5 itens)  
**Dado real disponível:** Tabela `PropositionAuthor` + `Proposition` — já populadas pelo ETL

### O banco já tem os dados?

```bash
# No legis-api, verificar contagem
npx prisma studio
# Tabela PropositionAuthor → verificar se há registros com politicianId preenchido
```

### Endpoint a criar (backend — legis-api)

**Arquivo:** `src/modules/politician/politician-proposicoes.service.ts` (novo)  
**Rota:** adicionar em `politician.controller.ts`

```
GET /politician/:id/proposicoes
Query: role (AUTHOR|CO_AUTHOR|ANY), page, pageSize, year, search
```

**Código do service:**

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/database/prisma.service'

@Injectable()
export class PoliticianProposicoesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProposicoes(
    politicianId: string,
    role: 'AUTHOR' | 'CO_AUTHOR' | 'ANY' = 'ANY',
    page = 1,
    pageSize = 20,
    year?: number,
    search?: string,
  ) {
    const where = {
      politicianId,
      ...(role === 'AUTHOR' && { proponente: true }),
      ...(role === 'CO_AUTHOR' && { proponente: false }),
      proposition: {
        ...(year && { year }),
        ...(search && { description: { contains: search, mode: 'insensitive' as const } }),
      },
    }

    const [authors, total] = await Promise.all([
      this.prisma.propositionAuthor.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { proposition: { include: { type: true, situation: true } } },
        orderBy: { proposition: { presentationDate: 'desc' } },
      }),
      this.prisma.propositionAuthor.count({ where }),
    ])

    return {
      data: authors.map(a => ({
        id: a.proposition.id,
        sigla_tipo: a.proposition.type.acronym,
        numero: a.proposition.number,
        ano: a.proposition.year,
        ementa: a.proposition.description,
        dt_apresentacao: a.proposition.presentationDate,
        situacao_descricao: a.proposition.situation?.name ?? a.proposition.situationDescription,
        proponente: a.proponente ?? false,
        uri: a.proposition.url,
        relevanceScore: calcRelevanceScore(a.proposition, a.proponente ?? false),
      })),
      total,
      pages: Math.ceil(total / pageSize),
      page,
    }
  }
}

function calcRelevanceScore(prop: any, isAuthor: boolean): number {
  let score = 0
  if (isAuthor) score += 30
  if (prop.regime === 'URGÊNCIA') score += 25
  if (['PEC', 'PLP', 'PL'].includes(prop.type?.acronym ?? '')) score += 15
  if (!prop.situationDescription?.toLowerCase().includes('arquiv')) score += 20
  const ageYears = (Date.now() - new Date(prop.presentationDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (ageYears < 2) score += 10
  return Math.min(score, 100)
}
```

**Adicionar no controller:**

```typescript
@Get(':id/proposicoes')
async getProposicoes(
  @Param('id') id: string,
  @Query('role') role: 'AUTHOR' | 'CO_AUTHOR' | 'ANY' = 'ANY',
  @Query('page') page = 1,
  @Query('pageSize') pageSize = 20,
  @Query('year') year?: number,
  @Query('search') search?: string,
) {
  return this.proposicoesService.getProposicoes(id, role, +page, +pageSize, year ? +year : undefined, search)
}
```

### Substituição no frontend

Arquivo: `legisai-v2/src/app/(private)/(sidebar)/deputados/[id]/_components/TabProposicoes.tsx`

1. Remover `MOCK_PROPOSICOES_AUTOR` e `MOCK_PROPOSICOES_COAUTOR`
2. Substituir por chamada: `GetAPI('/politician/${id}/proposicoes?role=${activeRole}&page=${page}')`
3. Adicionar estados `loading`, `error`, `data`
4. Mapear `res.data.data` para o array do componente

### Verificação

```bash
curl "http://localhost:3001/politician/{id}/proposicoes?role=AUTHOR&page=1" | jq .
```

---

## FASE 2 — Presenças do Deputado

**Tela:** `/deputados/[id]` → aba "Presenças"  
**Mock atual:** `TabPresencas.tsx` — objeto `MOCK_PRESENCAS` com 4 comissões fictícias  
**Dado real disponível:** Tabela `PoliticianPresence` — se ETL de presenças rodou

### Verificar se há dados

```bash
# Prisma Studio → tabela PoliticianPresence
# Ou:
SELECT count(*) FROM "PoliticianPresence";
```

### Endpoint a criar (backend)

**Arquivo:** `src/modules/politician/politician-presencas.service.ts` (novo)

```
GET /politician/:id/presencas
Query: dataInicio (ISO), dataFim (ISO), type (COMMITTEE|PLENARY|ALL)
```

**Código do service:**

```typescript
@Injectable()
export class PoliticianPresencasService {
  constructor(private readonly prisma: PrismaService) {}

  async getPresencas(politicianId: string, dataInicio: Date, dataFim: Date) {
    const presences = await this.prisma.politicianPresence.findMany({
      where: {
        politicianId,
        eventDate: { gte: dataInicio, lte: dataFim },
        presenceType: 'FUNCTIONAL',
      },
      include: {
        event: { include: { eventType: true } },
        department: true,
      },
      orderBy: { eventDate: 'desc' },
    })

    const total = presences.length
    const present = presences.filter(p => p.situation === 'PRESENÇA').length
    const absent = presences.filter(p => p.situation === 'AUSÊNCIA').length
    const justified = presences.filter(p => p.situation === 'AUSÊNCIA JUSTIFICADA').length

    // Agrupar por comissão
    const byCommittee = new Map<string, any>()
    for (const p of presences) {
      if (!p.departmentId) continue
      if (!byCommittee.has(p.departmentId)) {
        byCommittee.set(p.departmentId, {
          departmentId: p.departmentId,
          sigla: p.department?.acronym ?? '',
          nome: p.department?.name ?? '',
          present: 0, absent: 0, justified: 0, total: 0,
          eventos: [],
        })
      }
      const entry = byCommittee.get(p.departmentId)!
      entry.total++
      if (p.situation === 'PRESENÇA') entry.present++
      else if (p.situation === 'AUSÊNCIA') entry.absent++
      else if (p.situation === 'AUSÊNCIA JUSTIFICADA') entry.justified++
      entry.eventos.push({
        eventId: p.eventId,
        data: p.eventDate,
        tipo: p.event?.eventType?.name ?? '',
        titulo: p.event?.description ?? '',
        attendanceStatus: p.situation === 'PRESENÇA' ? 'PRESENT' : 'ABSENT',
      })
    }

    const perCommittee = [...byCommittee.values()].map(c => ({
      ...c,
      percentage: c.total > 0 ? (c.present / c.total) * 100 : 0,
    }))

    return {
      overall: {
        percentage: total > 0 ? (present / total) * 100 : 0,
        totalPresent: present,
        totalAbsent: absent,
        totalJustified: justified,
        totalEvents: total,
      },
      perCommittee,
      period: {
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
      },
    }
  }
}
```

### Substituição no frontend

Arquivo: `legisai-v2/src/app/(private)/(sidebar)/deputados/[id]/_components/TabPresencas.tsx`

1. Remover `MOCK_PRESENCAS`
2. Substituir por `GetAPI('/politician/${id}/presencas?dataInicio=...&dataFim=...')`
3. O shape do response é idêntico ao mock — troca direta

---

## FASE 3 — Dashboard IA da Sessão Plenária

**Tela:** `/plenario/deliberativa/[id]` → botão "Gerar..." → `/dashboard`  
**Mock atual:** `dashboard/_lib/mockSessionDashboard.ts` com JSON completo fictício  
**Dados necessários:** Transcrição da sessão (`EventSpeaker.transcription`) + Gemini 2.0 Flash

### Diagrama do fluxo

```
Usuário clica "Gerar análise"
        ↓
Frontend: POST /api/plenary/session-summary?format=json
  body: { text: transcricao, eventId: id }
        ↓
Route handler (legisai-v2/src/app/api/plenary/session-summary/route.ts)
  → Monta prompt JSON estruturado
  → Chama OpenRouter → Gemini 2.0 Flash (timeout: 60s)
  → JSON.parse (com limpeza de ```json)
  → PATCH /event/:id/ai-dashboard (salva no banco)
        ↓
Frontend: redireciona para /dashboard
  → GET /event/details/:id → lê event.aiDashboardJson
  → Renderiza dados reais no lugar do mock
```

### Migration Prisma necessária

Adicionar em `legis-api/prisma/schema.prisma` (model Event):

```prisma
aiDashboardJson        Json?
aiDashboardGeneratedAt DateTime?
```

Rodar:
```bash
cd legis-api
npx prisma migrate dev --name add_ai_dashboard_json
npx prisma generate
```

### Endpoint PATCH no backend (NestJS)

Adicionar em `event.controller.ts`:
```
PATCH /event/:id/ai-dashboard
Body: { aiDashboardJson: object }
```

```typescript
@Patch(':id/ai-dashboard')
async updateAiDashboard(
  @Param('id') id: string,
  @Body() body: { aiDashboardJson: Record<string, unknown> },
) {
  return this.eventService.updateAiDashboard(id, body.aiDashboardJson)
}
```

Em `event.service.ts`:
```typescript
async updateAiDashboard(id: string, json: Record<string, unknown>) {
  return this.prisma.event.update({
    where: { id },
    data: { aiDashboardJson: json, aiDashboardGeneratedAt: new Date() },
  })
}
```

### Atualização do route.ts (frontend)

Arquivo: `legisai-v2/src/app/api/plenary/session-summary/route.ts`

Adicionar branch `if (format === 'json')`:
- Usar prompt estruturado (ver skill `ai-openrouter-gemini`)
- `JSON.parse` com limpeza de backticks
- PATCH no backend se `eventId` informado
- Retornar `NextResponse.json(parsed)`

### Atualização do componente /dashboard

```typescript
// Remover import:
import { MOCK_DASHBOARD } from './_lib/mockSessionDashboard'

// Substituir por:
const event = await GetAPI(`/event/details/${id}`)
const dashboard = event.data.aiDashboardJson

// Se null → mostrar botão "Gerar análise" (não crashar)
if (!dashboard) return <GeneratePrompt eventId={id} />
```

### Tratamento de erros (obrigatório)

| Cenário | Comportamento |
|---|---|
| Timeout da IA (>60s) | Status 504 + mensagem "Análise demorou demais, tente novamente" |
| JSON inválido da IA | Retry com prompt simplificado; se falhar → status 422 |
| eventId não existe | 404 do backend → mensagem "Sessão não encontrada" |
| `aiDashboardJson` é null | Exibir botão "Gerar análise" |

---

## FASE 4 — Insights da Semana (Plenário)

**Tela:** `/plenario` → bloco "Insights da semana"  
**Mock atual:** 4 bullets hardcoded com dados fictícios  
**Fonte real:** Cruzamentos entre `Event`, `EventProposition`, `Proposition`, `PoliticianPresence`

### Novo endpoint (backend)

```
GET /event/weekly-insights
```

> **Atenção:** Registrar esta rota ANTES de `GET /event/:id` no controller, pois `weekly-insights` seria interpretado como `:id` pela ordem de registro.

```typescript
@Get('weekly-insights')
async getWeeklyInsights() {
  return this.insightsService.getWeeklyInsights()
}
```

### Nova tabela no Prisma (cache de insights)

```prisma
model SystemCache {
  key       String   @id
  value     Json
  cachedAt  DateTime
  expiresAt DateTime

  @@map("system_cache")
}
```

### Lógica de cálculo (event-insights.service.ts)

```typescript
@Injectable()
export class EventInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyInsights() {
    // Verificar cache (TTL: 1 hora)
    const cached = await this.prisma.systemCache.findUnique({ where: { key: 'weekly-insights' } })
    if (cached && cached.expiresAt > new Date()) {
      return cached.value
    }

    const hoje = new Date()
    const em7dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const insights = await Promise.all([
      this.calcPrazosRegimental(hoje, em7dias),
      this.calcProximaComissaoGeral(hoje),
      this.calcProposicaoEmPauta(hoje, em7dias),
      this.calcQuorumMedio(inicioMes, hoje),
    ])

    const result = { generatedAt: hoje.toISOString(), insights: insights.filter(Boolean) }

    // Salvar cache por 1 hora
    await this.prisma.systemCache.upsert({
      where: { key: 'weekly-insights' },
      create: { key: 'weekly-insights', value: result, cachedAt: hoje, expiresAt: new Date(hoje.getTime() + 3600_000) },
      update: { value: result, cachedAt: hoje, expiresAt: new Date(hoje.getTime() + 3600_000) },
    })

    return result
  }

  private async calcPrazosRegimental(dataInicio: Date, dataFim: Date) {
    const count = await this.prisma.eventProposition.count({
      where: {
        event: { startDate: { gte: dataInicio, lte: dataFim } },
        situation: { contains: 'prazo', mode: 'insensitive' },
      },
    })
    if (count === 0) return null
    return { type: 'prazo_regimental', text: `${count} matéria${count > 1 ? 's vencem' : ' vence'} prazo regimental nos próximos 7 dias úteis`, value: count, referenceDate: null, propositionId: null, eventId: null }
  }

  private async calcProximaComissaoGeral(hoje: Date) {
    const event = await this.prisma.event.findFirst({
      where: {
        startDate: { gte: hoje },
        eventType: { acronym: 'CG' },
      },
      orderBy: { startDate: 'asc' },
    })
    if (!event) return null
    const data = event.startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    return { type: 'comissao_agendada', text: `Comissão Geral agendada para ${data}`, value: null, referenceDate: event.startDate.toISOString(), propositionId: null, eventId: event.id }
  }

  private async calcProposicaoEmPauta(dataInicio: Date, dataFim: Date) {
    const ep = await this.prisma.eventProposition.findFirst({
      where: { event: { startDate: { gte: dataInicio, lte: dataFim } } },
      include: { proposition: { include: { type: true } }, event: true },
      orderBy: { sequence: 'asc' },
    })
    if (!ep) return null
    const sigla = `${ep.proposition.type.acronym} ${ep.proposition.number}/${ep.proposition.year}`
    return { type: 'pauta_plenario', text: `${sigla} entra em pauta de Plenário esta semana`, value: null, referenceDate: ep.event.startDate.toISOString(), propositionId: ep.propositionId, eventId: ep.eventId }
  }

  private async calcQuorumMedio(dataInicio: Date, dataFim: Date) {
    const [present, total] = await Promise.all([
      this.prisma.politicianPresence.count({ where: { eventDate: { gte: dataInicio, lte: dataFim }, situation: 'PRESENÇA', eventClass: 'COMMITTEE_DELIBERATIVE' } }),
      this.prisma.politicianPresence.count({ where: { eventDate: { gte: dataInicio, lte: dataFim }, eventClass: 'COMMITTEE_DELIBERATIVE' } }),
    ])
    if (total === 0) return null
    const pct = Math.round((present / total) * 100)
    return { type: 'quorum_medio', text: `Quórum médio das comissões deliberativas: ${pct}%`, value: pct, referenceDate: null, propositionId: null, eventId: null }
  }
}
```

### Migration para SystemCache

```bash
cd legis-api
npx prisma migrate dev --name add_system_cache
npx prisma generate
```

### Substituição no frontend

Arquivo: `legisai-v2/src/app/(private)/(sidebar)/plenario/page.tsx`

```typescript
// Substituir bullets hardcoded por:
const [insights, setInsights] = useState<Insight[]>([])

useEffect(() => {
  GetAPI('/event/weekly-insights')
    .then(res => setInsights(res.data.insights ?? []))
    .catch(() => {}) // não travar a página se insights falhar
}, [])

// Renderizar:
{insights.map(insight => (
  <li key={insight.type}>{insight.text}</li>
))}
```

---

## FASE 5 — CEAP Completo (Despesas)

**Tela:** `/deputados/[id]` → aba "Despesas e Financeiro"  
**Status atual:** Cotas (parlamentar + gabinete) são reais. CEAP detalhado por categoria ainda vem da API pública.

### Nova tabela Prisma

```prisma
model DeputadoDespesa {
  id             String    @id @default(cuid())
  politicianId   String
  ano            Int
  mes            Int
  tipoDespesa    String
  fornecedor     String
  cnpjCpf        String?
  valorLiquido   Float
  valorDocumento Float?
  dataDocumento  DateTime?
  urlDocumento   String?
  numDocumento   String?
  createdAt      DateTime  @default(now())

  politician Politician @relation(fields: [politicianId], references: [id])

  @@index([politicianId, ano, mes])
  @@index([politicianId, tipoDespesa])
  @@map("deputado_despesa")
}
```

Adicionar relação em `Politician`:
```prisma
despesas DeputadoDespesa[]
```

### Script ETL para popular (legis-api/scripts/sync-ceap.ts)

```typescript
// Busca da API pública da Câmara:
// GET https://dadosabertos.camara.leg.br/api/v2/deputados/{id}/despesas?ano={ano}&pagina={page}
// Salva no banco paginando até não ter mais registros

async function syncCeapForDeputado(politicianId: string, ano: number) {
  let page = 1
  while (true) {
    const res = await fetch(
      `https://dadosabertos.camara.leg.br/api/v2/deputados/${politicianId}/despesas?ano=${ano}&pagina=${page}&itens=100`
    )
    const json = await res.json()
    if (!json.dados || json.dados.length === 0) break

    await prisma.deputadoDespesa.createMany({
      data: json.dados.map((d: any) => ({
        politicianId,
        ano,
        mes: d.mes,
        tipoDespesa: d.tipoDespesa,
        fornecedor: d.nomeFornecedor,
        cnpjCpf: d.cnpjCpfFornecedor,
        valorLiquido: d.valorLiquido,
        valorDocumento: d.valorDocumento,
        dataDocumento: d.dataDocumento ? new Date(d.dataDocumento) : null,
        urlDocumento: d.urlDocumento,
        numDocumento: d.numDocumento,
      })),
      skipDuplicates: true,
    })
    page++
  }
}
```

### Endpoint

```
GET /politician/:id/despesas/ceap
Query: ano, page, pageSize, categoria
```

---

## FASE 6 — Posicionamento Avançado + Atuação Parlamentar

### Endpoint: votações com alinhamento

```
GET /politician/:id/posicionamento/votacoes
```

Calcular % de alinhamento com partido via join `VotingPolitician` × `VotingOrientation`.

### Endpoint: discursos resumo

```
GET /politician/:id/discursos/resumo
```

Buscar em `EventSpeaker` pelo nome do deputado (usando `ParliamentarianAlias`).

---

## Regras de segurança para não quebrar nada

1. **Toda migration usa `--create-only` primeiro** para revisar o SQL antes de aplicar
2. **Campos novos sempre nullable (`?`)** — nunca `NOT NULL` sem valor padrão
3. **Rota `GET /event/weekly-insights` registrada ANTES de `GET /event/:id`** no controller
4. **Não modificar `PoliticianService.findDetails()`** — função mais crítica do sistema
5. **Frontend: always use optional chaining** — `event?.aiDashboardJson?.meta?.titulo`
6. **OpenRouter: `OPENROUTER_API_KEY` apenas no `.env.local`** — nunca no código
7. **Timeout de 60s obrigatório** em toda chamada à IA
8. **Mock files deletados** somente após confirmar endpoint funcionando em dev

---

## Checklist por fase (copy-paste para execução)

### Fase 1 — Proposições
- [ ] Verificar se `PropositionAuthor` tem dados no banco
- [ ] Criar `politician-proposicoes.service.ts`
- [ ] Adicionar rota `GET /politician/:id/proposicoes` no controller
- [ ] Injetar service no `PoliticianModule`
- [ ] Testar com curl
- [ ] Substituir mock em `TabProposicoes.tsx`
- [ ] Deletar constantes `MOCK_PROPOSICOES_*`
- [ ] `yarn tsc --noEmit` sem erros

### Fase 2 — Presenças
- [ ] Verificar se `PoliticianPresence` tem dados no banco
- [ ] Criar `politician-presencas.service.ts`
- [ ] Adicionar rota `GET /politician/:id/presencas` no controller
- [ ] Testar com curl
- [ ] Substituir `MOCK_PRESENCAS` em `TabPresencas.tsx`
- [ ] `yarn tsc --noEmit` sem erros

### Fase 3 — Dashboard IA
- [ ] Adicionar `aiDashboardJson Json?` e `aiDashboardGeneratedAt DateTime?` no schema
- [ ] `npx prisma migrate dev --name add_ai_dashboard_json`
- [ ] Adicionar `PATCH /event/:id/ai-dashboard` no backend
- [ ] Atualizar `session-summary/route.ts` com branch `format=json`
- [ ] Testar POST com Postman/curl
- [ ] Verificar que JSON é salvo no banco
- [ ] Substituir `MOCK_DASHBOARD` no componente `/dashboard`
- [ ] Deletar `mockSessionDashboard.ts`

### Fase 4 — Insights da Semana
- [ ] Adicionar model `SystemCache` no schema
- [ ] `npx prisma migrate dev --name add_system_cache`
- [ ] Criar `event-insights.service.ts`
- [ ] Registrar rota `GET /event/weekly-insights` ANTES de `GET /event/:id`
- [ ] Testar se os 4 insights retornam dados reais
- [ ] Substituir bullets hardcoded no `plenario/page.tsx`

### Fase 5 — CEAP
- [ ] Adicionar model `DeputadoDespesa` no schema
- [ ] `npx prisma migrate dev --name add_deputado_despesa`
- [ ] Criar script `scripts/sync-ceap.ts`
- [ ] Rodar sync para 1 deputado como teste
- [ ] Criar endpoint `GET /politician/:id/despesas/ceap`
- [ ] Conectar ao frontend

---

## Skills de apoio

| Quando precisar | Usar skill |
|---|---|
| Criar endpoint NestJS novo | `backend-nestjs-legisdados` |
| Alterar schema.prisma com segurança | `prisma-safe-migrations` |
| Criar ou modificar chamada à IA | `ai-openrouter-gemini` |
| Substituir um mock por dado real | `mock-to-real-replacement` |
| Entender a API da Câmara | `api-camara-dadosabertos` |
| Calcular KPIs legislativos | `kpis-cruzamento-tabelas` |
