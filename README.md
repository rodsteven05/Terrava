# LandChain

A web-based land selling and management system with blockchain payment verification and GIS mapping.

## Features

- GIS-based interactive land maps using Leaflet
- Private SHA-256 blockchain ledger for payment records
- Role-based user accounts (buyer, seller, admin)
- Land listing management with verification
- Buyer inquiries and seller replies
- Admin dashboard with sales reports

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Leaflet
- **Backend:** Node.js, Express, Sequelize, PostgreSQL
- **Blockchain:** Custom SHA-256 linked chain stored in PostgreSQL

## Setup

### Requirements

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE landchain;
   ```

3. Update `server/.env` with your database credentials.

4. Seed the database:
   ```bash
   cd server
   npm run seed
   ```

5. Run the application:
   ```bash
   npm run dev
   ```

The frontend will run at http://localhost:5173 and the backend at http://localhost:5000.

### Default Accounts

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | Admin@gmail.com        | Admin123@  |
| Seller| seller@landchain.com   | seller123  |
| Buyer | buyer@landchain.com    | buyer123   |

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/listings` - Browse listings
- `POST /api/listings` - Create listing
- `GET /api/listings/:id` - Listing details
- `POST /api/inquiries` - Send inquiry
- `POST /api/transactions` - Record payment (creates blockchain block)
- `GET /api/blockchain/validate` - Validate chain integrity
- `GET /api/admin/dashboard` - Admin stats

## License

For academic purposes.
