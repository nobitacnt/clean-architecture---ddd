# 🚀 INSTALLATION INSTRUCTIONS

## Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Docker (optional, for easy database setup)

## Quick Install (3 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Database
```bash
# Option A: Using Docker (recommended)
docker-compose up -d

# Option B: Use your own PostgreSQL
# Make sure PostgreSQL is running on localhost:5432
```

### Step 3: Configure Environment
```bash
cp .env.example .env

# Edit .env file (if needed)
# Default: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/order_db?schema=public"
```

### Step 4: Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### Step 5: Start Server
```bash
npm run dev
```

🎉 **Done!** Server is running at:
- REST API: http://localhost:3000/api/orders
- GraphQL: http://localhost:3000/graphql
- Health: http://localhost:3000/health

## Verify Installation

### Test Health Endpoint
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Test Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-customer",
    "items": [{
      "productId": "test-product",
      "productName": "Test Product",
      "quantity": 1,
      "price": 100
    }]
  }'
```

### Test GraphQL
Open http://localhost:3000/graphql and run:
```graphql
query {
  orders(page: 1, limit: 10) {
    id
    customerId
    totalAmount
    status
  }
}
```

## Troubleshooting

### Port 3000 already in use
```bash
# Change port in .env
PORT=3001
```

### Database connection error
```bash
# Check PostgreSQL is running
docker-compose ps

# Check connection string in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/order_db?schema=public"

# Restart database
docker-compose restart
```

### Prisma Client not generated
```bash
npm run prisma:generate
```

### Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

```bash
# 1. Start database
docker-compose up -d

# 2. Start development server with hot-reload
npm run dev

# 3. Make changes to code
# Server automatically restarts

# 4. View database
npm run prisma:studio

# 5. Stop database when done
docker-compose down
```

## Production Build

```bash
# Build
npm run build

# Start
npm start
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open database GUI |
| `npm run lint` | Lint code |
| `npm run format` | Format code |
| `npm test` | Run tests |

## Need Help?

1. Check **QUICKSTART.md** for detailed guide
2. Check **ARCHITECTURE.md** for architecture details
3. Check **README.md** for API documentation
4. Check logs: `docker-compose logs` (for database)

---

**Ready to code!** 🎉
