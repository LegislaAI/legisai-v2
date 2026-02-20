# Usar a aplicação com Cloudflare Tunnel

O frontend chama a API via `NEXT_PUBLIC_API_URL`. Em produção pelo tunnel, o navegador acessa a URL do tunnel (ex: `https://xxx.trycloudflare.com`), então **localhost** no browser é a máquina de quem está acessando, não a sua. Por isso é preciso expor **os dois** serviços (API e frontend) e apontar o frontend para a URL pública da API.

## Passo a passo

### 1. Subir a API (porta 3333)

No projeto `legis-api`:

```bash
cd legis-api
yarn start:dev
# ou: npm run start:dev
```

### 2. Criar tunnel da API

Em **outro terminal**:

```bash
cloudflared tunnel --url http://localhost:3333
```

Anote a URL que aparecer (ex: `https://api-abc123.trycloudflare.com`). Essa é a URL pública da sua API.

### 3. Subir o frontend (porta 3002)

No projeto `legisai-v2`:

```bash
cd legisai-v2
npm run dev
# (se a porta for 3000, use 3000 nos passos abaixo)
```

### 4. Apontar o frontend para a API pelo tunnel

Antes de criar o tunnel do frontend, o frontend precisa usar a URL da API do tunnel.

**Opção A – variável ao rodar (recomendado para teste):**

Substitua `https://api-abc123.trycloudflare.com` pela URL que você anotou no passo 2:

```bash
NEXT_PUBLIC_API_URL=https://api-abc123.trycloudflare.com npm run dev
```

**Opção B – arquivo `.env.local`:**

Crie ou edite `legisai-v2/.env.local`:

```
NEXT_PUBLIC_API_URL=https://api-abc123.trycloudflare.com
```

Reinicie o `npm run dev` para carregar a nova variável.

### 5. Criar tunnel do frontend

Em **mais um terminal**:

```bash
cloudflared tunnel --url http://localhost:3002
```

(Se o Next.js estiver na 3000, use `http://localhost:3000`.)

A URL que aparecer (ex: `https://frontend-xyz.trycloudflare.com`) é a que você abre no navegador. A partir daí, o frontend vai chamar a API na URL do passo 2 e tudo deve funcionar.

## Resumo

| Serviço   | Porta local | Comando tunnel                          |
|----------|-------------|----------------------------------------|
| API      | 3333        | `cloudflared tunnel --url http://localhost:3333` |
| Frontend | 3002        | `cloudflared tunnel --url http://localhost:3002` |

Sempre crie **primeiro** o tunnel da API, copie a URL e use em `NEXT_PUBLIC_API_URL` antes de abrir o tunnel do frontend.
