# SCP Frontend - Next.js Application

Production-ready Next.js frontend for the Supplier-Consumer Platform MVP.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack React Query
- **Forms:** react-hook-form + zod
- **i18n:** next-intl (RU/KZ locales)
- **Date/Currency:** dayjs, custom KZT formatter
- **Testing:** Vitest + Testing Library

## Features

✅ Role-based authentication (Owner/Admin/Sales/Consumer)  
✅ Link management (supplier-consumer connections)  
✅ Product catalog (link-gated with KZT pricing)  
✅ Orders & complaints workflows  
✅ Chat with escalation  
✅ Incidents management with CSV export  
✅ Admin panel  
✅ RU/KZ localization  
✅ Mock API (in-memory route handlers)  
✅ Responsive UI with Tailwind  

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # Mock API route handlers
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Main app pages
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities (currency, date, roles, i18n)
├── types/                 # TypeScript type definitions
├── public/locales/        # i18n translations (RU/KZ)
└── tests/                 # Vitest tests
```

## Development Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run test         # Run tests with Vitest
npm run test:watch   # Run tests in watch mode
```

## First Steps

1. **Choose a role** on the auth page:
   - **Owner** - Full access to supplier management
   - **Admin** - Link approvals & complaint handling
   - **Sales** - Chat & order management
   - **Consumer** - Browse catalog & place orders

2. **Explore features:**
   - Owner/Admin: Approve link requests in `/links`
   - Consumer: Browse catalog in `/catalog` (requires approved link)
   - All roles: Access dashboard for role-specific overview

## Mock Data

The app uses in-memory mock data with pre-seeded:
- 1 approved link (Supplier ↔ Restaurant "Astana")
- 1 pending link request
- 4 sample products in catalog
- Mock users for each role

## Internationalization

Switch between Russian (RU) and Kazakh (KZ) using the globe icon in the top navigation.

Translations are in:
- `public/locales/ru/common.json`
- `public/locales/kz/common.json`

## Testing

Run tests:
```bash
npm run test
```

Sample tests included:
- Component rendering (RoleBadge)
- Utility functions (currency formatting)

## Environment

No environment variables required for local development. All data is mocked in-memory via Next.js Route Handlers (`/app/api/*`).

## Deployment

See root [`README.md`](../README.md) and [`Dockerfile`](../Dockerfile) for Docker deployment instructions.

## Notes

- **Link-gated catalog**: Consumers must have an approved link to see product prices
- **Role permissions**: Enforced in UI navigation and page-level checks
- **Archival instead of delete**: All entities support soft delete via `archived` flag
- **KZT currency**: Custom formatter shows ₸ symbol with proper thousands separators
