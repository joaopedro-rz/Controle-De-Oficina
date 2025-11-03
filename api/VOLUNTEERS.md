Voluntários — Estrutura atual

O projeto utiliza NestJS + TypeORM com PostgreSQL para persistência real dos voluntários (entidade `volunteers`), não há mais store em memória.

Endpoints (exemplo):
- GET /volunteers?page=1&limit=20&q=nome&status=active
- GET /volunteers/:id
- POST /volunteers
- PUT /volunteers/:id
- DELETE /volunteers/:id (marca como inativo)

Migrações
- As migrações são geradas e executadas via TypeORM CLI (scripts no `api/package.json`).
- O `AppModule` lê `DATABASE_*` ou `DB_*` do `.env`. Para geração local, o `src/data-source.ts` já carrega o `.env` da raiz ou `api/.env`.

Observações:
- Para desenvolvimento via Docker Compose, a API sobe em `http://localhost:3001` mapeada para a porta 4000 do container.
