# Amanah Backend

A complete backend foundation for **Amanah** - a manual personal finance application for personal use and close family/friends.

## 🎯 Overview

Amanah is a calm, flexible, secure, and portfolio-quality personal finance application. Everything is manual (no bank APIs, no stock APIs, no automation) but fully editable.

## 🛠 Tech Stack

- **Backend**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL using Supabase
- **Auth**: Supabase Auth (email + password)
- **API Style**: REST
- **ORM**: Direct Supabase SQL (no Prisma)

## 📋 Features

- ✅ User accounts (via Supabase Auth)
- ✅ Manual money tracking (Cash, Bank accounts, Stocks)
- ✅ Clear net worth calculation
- ✅ Full CRUD for Accounts, Stocks, Transactions, Categories
- ✅ Expense & income tracking
- ✅ Zakat calculation (strict, safe side)
- ✅ Islamic reminders (read-only, curated)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- PostgreSQL database (via Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amanah-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=3000
   NODE_ENV=development
   GOLD_PRICE_PER_GRAM=5000
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL schema from `database/schema.sql`
   - This will create all tables, indexes, RLS policies, and triggers

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000/api`

## 📁 Project Structure

```
src/
 ├─ auth/              # Authentication (signup, signin, signout)
 ├─ profiles/          # User profiles
 ├─ accounts/          # Cash and bank accounts
 ├─ stocks/            # Stock holdings (manual values)
 ├─ categories/        # Expense and income categories
 ├─ transactions/      # Financial transactions
 ├─ zakat/             # Zakat calculation
 ├─ reminders/         # Islamic reminders (read-only)
 ├─ common/            # Shared services, guards, decorators
 ├─ app.module.ts      # Root module
 └─ main.ts            # Application entry point
```

## 🔐 Security

- **Row Level Security (RLS)**: All tables have RLS enabled
- **User Isolation**: Every user can only access their own data
- **JWT Authentication**: All protected routes require valid Supabase JWT tokens
- **Input Validation**: All DTOs are validated using class-validator

## 📊 Database Schema

### Tables

- **profiles**: User profile information
- **accounts**: Cash and bank accounts
- **stocks**: Manual stock holdings
- **categories**: Expense and income categories
- **transactions**: All financial transactions
- **zakat_records**: Historical zakat calculations
- **reminders**: Islamic reminders (read-only)

### Automatic Balance Updates

The database includes triggers that automatically update account balances when transactions are:
- Created (income increases, expense decreases)
- Updated (reverses old transaction, applies new transaction)
- Deleted (reverses the transaction effect)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Profiles
- `GET /api/profiles/me` - Get current user profile
- `PUT /api/profiles/me` - Update current user profile

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get stock by ID
- `POST /api/stocks` - Create stock
- `PUT /api/stocks/:id` - Update stock
- `DELETE /api/stocks/:id` - Delete stock

### Categories
- `GET /api/categories` - Get all categories (optional `?type=expense|income`)
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Transactions
- `GET /api/transactions` - Get all transactions (optional filters: `?startDate`, `?endDate`, `?categoryId`)
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Zakat
- `GET /api/zakat/calculate` - Calculate zakat
- `GET /api/zakat/history` - Get zakat calculation history
- `GET /api/zakat/net-worth` - Get net worth

### Reminders
- `GET /api/reminders` - Get all reminders (optional `?type=quran|hadith|dua`)
- `GET /api/reminders/random` - Get random reminder
- `GET /api/reminders/:id` - Get reminder by ID

## 💰 Zakat Calculation

Zakat is calculated based on:
- **Assets included**: Cash, bank balances, and stock values
- **Nisab**: 87.48 grams of gold (configurable via `GOLD_PRICE_PER_GRAM`)
- **Rate**: 2.5% of total assets if above nisab
- **Safe-side bias**: Adds 1% buffer to ensure conservative calculation

## 🔄 Transaction Balance Updates

Transactions automatically update account balances:
- **Income transactions**: Increase account balance
- **Expense transactions**: Decrease account balance
- **Updates**: Reverse old transaction effect, apply new transaction effect
- **Deletes**: Reverse the transaction effect

This is handled by database triggers, ensuring data consistency.

## 🧪 Development

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Linting
npm run lint

# Testing
npm run test
```

## 📝 Notes

- All data entry is manual (no API integrations)
- Everything is fully editable
- RLS ensures complete data isolation between users
- Reminders table is read-only for all users
- Account and category deletion is prevented if they have transactions

## 📄 License

Private - For personal use only

