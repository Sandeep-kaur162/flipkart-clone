# Flipkart Clone - Full Stack E-Commerce Application

A functional e-commerce web application replicating Flipkart's design and user experience.

## Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios, React Toastify, React Icons
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL

## Features

- Product listing with grid layout (Flipkart-style cards)
- Search by product name / brand
- Filter by category (sidebar + top nav bar)
- Product detail page with image carousel, specs table, ratings
- Add to Cart / Buy Now
- Cart management (add, update quantity, remove)
- Checkout with shipping address form (2-step: address → review)
- Order placement with order ID confirmation
- Order history
- Wishlist
- Responsive design (mobile, tablet, desktop)

## Database Schema

```
users          → id, name, email, phone
categories     → id, name, slug, image_url
products       → id, name, description, price, original_price, discount_percent,
                 stock, category_id, brand, rating, rating_count, images[], specifications{}
addresses      → id, user_id, full_name, phone, address_line1/2, city, state, pincode
cart           → id, user_id, product_id, quantity
orders         → id, order_id, user_id, address_id, total_amount, status, payment_method
order_items    → id, order_id, product_id, quantity, price
wishlist       → id, user_id, product_id
```

## Setup Instructions

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 1. Database Setup

```bash
# Create database
createdb flipkart_clone

# Run schema
psql -d flipkart_clone -f backend/src/db/schema.sql

# Seed sample data
psql -d flipkart_clone -f backend/src/db/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env from example
cp .env.example .env
# Edit .env with your DATABASE_URL

npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env from example
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api

npm run dev
# App runs on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products (search, category, pagination) |
| GET | /api/products/:id | Product detail |
| GET | /api/categories | All categories |
| GET | /api/cart | Get cart items |
| POST | /api/cart | Add to cart |
| PUT | /api/cart/:id | Update quantity |
| DELETE | /api/cart/:id | Remove item |
| DELETE | /api/cart | Clear cart |
| GET | /api/orders | Order history |
| GET | /api/orders/:orderId | Order detail |
| POST | /api/orders | Place order |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist | Add to wishlist |
| DELETE | /api/wishlist/:productId | Remove from wishlist |

## Assumptions

- A default guest user (id=1) is pre-seeded — no login required
- All cart/order/wishlist operations use this default user
- Product images use external URLs (Flipkart CDN / placeholders)
- Payment is simulated (COD, UPI, Card options — no real gateway)
- Stock is decremented on order placement

## Deployment

- **Frontend**: Deploy `frontend/` to Vercel or Netlify (`npm run build` → `dist/`)
- **Backend**: Deploy to Render or Railway (set `DATABASE_URL` env var)
- **Database**: Use Render PostgreSQL, Railway PostgreSQL, or Supabase
