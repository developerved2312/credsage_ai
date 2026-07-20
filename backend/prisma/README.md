# Prisma 7 Database Configuration

This directory contains Prisma 7 schema and configuration files for CredSage AI.

## Files

- **schema.prisma**: Database schema with models, relations, and configurations
- **prisma.config.ts**: Advanced Prisma Client generation configuration (Prisma 7)
- **seed.ts**: Database seeding script for development/testing

## Prisma 7 Features

### Enabled Preview Features

1. **typedSql**: Type-safe raw SQL queries
2. **relationJoins**: Optimized relation loading
3. **fullTextSearch**: PostgreSQL full-text search
4. **views**: Database views support

### Configuration Highlights

- **engineType**: Library engine for improved performance
- **binaryTargets**: Multi-platform support (macOS ARM64, Linux musl)
- **Connection Pooling**: Separate DATABASE_URL and DIRECT_URL for optimal performance

## Commands

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Create and Run Migrations
```bash
npm run prisma:migrate
```

### Deploy Migrations to Production
```bash
npm run prisma:migrate:prod
```

### Open Prisma Studio
```bash
npm run prisma:studio
```

### Seed Database
```bash
npm run prisma:seed
```

### Validate Schema
```bash
npm run prisma:validate
```

### Format Schema
```bash
npm run prisma:format
```

### Reset Database (Warning: Destructive!)
```bash
npm run prisma:reset
```

## Environment Variables

Required environment variables:

```env
# Pooled connection for queries
DATABASE_URL="postgresql://user:password@localhost:5432/credsage"

# Direct connection for migrations
DIRECT_URL="postgresql://user:password@localhost:5432/credsage"
```

### Connection Pooling

Prisma 7 supports connection pooling via:
- **Prisma Accelerate** (managed service)
- **PgBouncer** (self-hosted)

Example with PgBouncer:
```env
DATABASE_URL="postgresql://user:password@pooler:6543/credsage?pgbouncer=true"
DIRECT_URL="postgresql://user:password@postgres:5432/credsage"
```

## Schema Design

### Key Features

- **UUID Primary Keys**: Using @db.Uuid for globally unique identifiers
- **Decimal Types**: Financial precision with @db.Decimal
- **JsonB Fields**: Efficient JSON storage for SHAP values
- **Timestamptz**: Timezone-aware timestamps
- **Indexed Queries**: Strategic indexes for performance
- **Cascading Deletes**: Automatic cleanup of related records

### Models

- **User**: User accounts and authentication
- **CreditScore**: Credit score predictions with ML insights
- **Portfolio**: Investment portfolios
- **Investment**: Individual investments
- **ChatConversation**: AI chatbot conversations
- **ChatMessage**: Chat messages
- **SystemLog**: Application logging

## Best Practices

1. **Always use migrations** for schema changes
2. **Test migrations** on development database first
3. **Use transactions** for multi-step operations
4. **Index frequently queried fields**
5. **Use connection pooling** in production
6. **Monitor slow queries** with built-in logging
7. **Backup before running reset**

## Troubleshooting

### Connection Issues

```bash
# Test database connection
npx prisma db pull --schema=./prisma/schema.prisma
```

### Migration Issues

```bash
# Mark migration as applied (if already applied manually)
npx prisma migrate resolve --applied "20240101000000_migration_name"

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back "20240101000000_migration_name"
```

### Client Generation Issues

```bash
# Clear generated files and regenerate
rm -rf node_modules/.prisma
npm run prisma:generate
```

## Learn More

- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Prisma 7 Preview Features](https://www.prisma.io/docs/concepts/components/preview-features)
- [Connection Pooling Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
