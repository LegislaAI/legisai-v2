# 🧭 Documentação do Projeto Padrão Executivo's Digital Next.js 15

## 📌 Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Instalação e Execução](#instalação-e-execução)
4. [Scripts Disponíveis](#scripts-disponíveis)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Rotas e Navegação](#rotas-e-navegação)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Estrutura Git](#estrutura-git)

---

## 📖 Visão Geral

Projeto padrão desenvolvido com **Next.js 15(App Router)** e **React 18** para ser utilizado como base do desenvolvimento de projetos futuros da Executivo's Digital.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Axios**
- **ESLint + Prettier + Husky**

---

## 🧪 Instalação e Execução

```bash
# Clonar repositório
npx create-next-app@latest -e https://github.com/ExecutivosDigital/base-project-web

cd base-project-web

# Instalar dependências
yarn

# Executar localmente
yarn dev

```

---

## 🚀 Scripts Disponíveis

1. Rodar projeto localmente:

   ```
   yarn dev
   ```

2. Criar build de produção:

   ```
   yarn build
   ```

3. Realizar checagem de padronização de código:

   ```
   yarn lint
   ```

   ***

## 📁 Estrutura de Pastas

```
.
├── src/                        # Código-fonte principal
│   ├── app/                    # App Router do Next 15
│   │   ├── page.tsx            # Página principal
│   │   ├── globals.css         # Estilizações e configurações do TailwindCSS
│   │   ├── layout.tsx          # Layout global
│   │   └── dashboard/          # Página "Dashboard"
│   │       ├── page.tsx        # Tela do Dashboard
│   │       ├── layout.tsx      # Layout da tela do Dashboard
│   │       └── components/     # Componentes específicos da tela
│   │           └── example.tsx # Exemplo de componente da tela
│   ├── components/             # Componentes reutilizáveis
│   ├── lib/                    # Configurações, helpers e utilitários
│   └── context/                # Contextos globais (auth, tema, etc.)
├── public/                     # Arquivos estáticos (imagens, favicon, etc.)
├── .env.local                  # Variáveis de ambiente locais
└── tsconfig.json               # Configuração do TypeScript
```

---

## 🧭 Rotas e Navegação

```
/login → Tela de autenticação

/ → Home
```

---

## 🔐 Variáveis de Ambiente

```
NEXT_PUBLIC_API_URL=""
```

```
NEXT_PUBLIC_USER_TOKEN=""
```

---

## 🌿 Estrutura Git

Por padrão, o projeto já cria a branch origin/main. Para gerenciamento de branches, utilizamos a seguinte estrutura

```
origin/main
origin/pre-main
origin/dev
```

Para inicializar a branch, deve-se rodar

```
git push --set-upstream origin "nome-da-branch"
```
