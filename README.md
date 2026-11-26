# People for Animals (PFA) Portal

A comprehensive portal for managing animal rescues, clinical cases, wildlife, inventory, and donations for People for Animals (PFA).

## Features

- **Rescue Management**: Track cases from reporting to clinical recovery.
- **Wildlife Portal**: Specialized tracking for avian and exotic rescues.
- **Inventory & Medical**: Real-time stock tracking for medicines and housekeeping supplies.
- **ABC (Animal Birth Control)**: Manage sterilization programs and records.
- **Donation Tracking**: Secure logging of financial support.
- **Reports & Analytics**: Dashboard for census and trends.
- **Secure Auth**: Role-based access control for Admins, Doctors, and Data Entry.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js (Express), Prisma ORM, PostgreSQL.
- **Testing**: Jest, Supertest, React Testing Library.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Database Setup

For a fresh local database, run:

```bash
npx prisma migrate deploy
npx prisma generate
# Optional sample data
npx prisma db seed
```

For an existing database with cases, first apply migrations through
`20261011000000`, run `npm run backfill:case-numbers`, then deploy the remaining
migrations and regenerate Prisma.

1. **Install PostgreSQL**:
   - Download and install PostgreSQL from the official website: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - During installation, set a password for the default `postgres` user (remember this password).
   - The default port is `5432`.

2. **Create a Database**:
   - Open pgAdmin (installed with PostgreSQL) or use the command line tool `psql`.
   - Connect to your PostgreSQL server using the `postgres` user.
   - Create a new database named `pfa_db` (or any name you prefer):
     ```sql
     CREATE DATABASE pfa_db;
     ```

3. **Configure DATABASE_URL**:
   - The `DATABASE_URL` follows the format: `postgresql://username:password@host:port/database?schema=public`
   - For a local PostgreSQL installation with default settings:
     - Username: `postgres`
     - Password: The password you set during installation
     - Host: `localhost`
     - Port: `5432`
     - Database: `pfa_db`
     - Example: `postgresql://postgres:mypassword@localhost:5432/pfa_db?schema=public`
   - Copy `.env.example` to `.env` and update the `DATABASE_URL` with your connection string.

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your DATABASE_URL
   ```
4. Initialize the database:
   ```bash
   npx prisma db push
   npx prisma generate
   npx prisma db seed
   ```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Testing

The project uses a dual-project Jest configuration for both backend and frontend tests.

### Running All Tests

```bash
npm test
```

### Backend Tests (Server)

Located in `server/tests/`. Built with `supertest` and mocked Prisma.

```bash
# Run only server tests
npx jest --selectProjects server
```

### Frontend Tests (Client)

Located in `src/` (e.g., `App.test.tsx`). Built with React Testing Library and JSDOM.

```bash
# Run only client tests
npx jest --selectProjects client
```

## Project Structure

- `server/`: Express backend modules and API routes.
- `src/`: React frontend source code.
- `prisma/`: Database schema and migrations.
- `metadata.json`: Application metadata and permissions.

## Security

- **Data Sanitization**: Core utility used to strip relational/immutable fields before DB writes.
- **Mocking**: All tests use mocked database and APIs to ensure isolation.
- **RBAC**: UI and API routes are restricted based on user roles (Admin, Doctor, Data Entry).
