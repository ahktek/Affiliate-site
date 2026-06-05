# services/

External integrations (AI Gateway, email providers, analytics, third-party APIs).
Each service is a thin module that wraps SDK calls and is consumed by
`createServerFn` handlers under `src/lib/*.functions.ts`. Do not import
service modules directly from React components — always route through a
server function so secrets stay server-side.

Examples (to be added):
- `ai-gateway.ts` — Lovable AI Gateway client (chat, embeddings)
- `analytics.ts` — server-side event logging
