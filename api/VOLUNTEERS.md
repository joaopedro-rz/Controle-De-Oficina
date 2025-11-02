Voluntários — Endpoints e migration

Este projeto inclui endpoints simples para gerenciamento de voluntários em memória e uma sugestão de migration SQL para PostgreSQL em `api/db/001_create_volunteers.sql`.

Endpoints disponíveis (exemplo):
- GET /volunteers?page=1&limit=20&q=nome&status=active
- GET /volunteers/:id
- POST /volunteers
- PUT /volunteers/:id
- DELETE /volunteers/:id (marca como inativo)

Para criar a tabela no PostgreSQL execute o SQL em `api/db/001_create_volunteers.sql` contra o banco (ex.: `psql -f api/db/001_create_volunteers.sql`). A migration usa `pgcrypto` para geração de UUIDs.

Observações:
- O backend atualmente usa um `DataStoreService` em memória. Para persistência real, substitua a camada de acesso por TypeORM/Prisma/pg e execute a migration.
