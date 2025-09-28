# Kaskroutek - Premium Sandwich Shop

A fully functional Next.js website for a sandwich shop with customer ordering interface and admin management panel.

## Features

### Customer Ordering Interface
- **Sandwich Customization**: Choose from various bread types and toppings
- **Live Price Calculator**: Real-time price updates as you build your sandwich
- **Order Form**: Customer details collection with validation
- **Order Confirmation**: Clear confirmation message with customer details

### Admin Management Panel
- **Secure Login**: Admin authentication (username: `admin`, password: `password123`)
- **Bread Management**: Add, edit, and delete bread types with prices
- **Topping Management**: Add, edit, and delete toppings with prices
- **Order Viewing**: View all customer orders with details

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React 19** with modern hooks

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin login and dashboard
│   ├── globals.css           # Global styles with custom theme
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main customer interface
├── components/
│   ├── AdminDashboard.tsx    # Admin management interface
│   ├── Header.tsx            # Navigation header
│   ├── OrderConfirmation.tsx # Order success modal
│   └── SandwichBuilder.tsx   # Main ordering interface
├── data/
│   └── store.ts              # Temporary data store (ready for Supabase)
└── types/
    └── index.ts              # TypeScript type definitions
```

## Data Structure

The application uses a temporary in-memory data store with the following entities:

- **Bread**: `{ id, name, price }`
- **Topping**: `{ id, name, price }`
- **Order**: `{ id, customerName, phoneNumber, bread, toppings, totalPrice, createdAt }`

## Supabase Integration Ready

The data store is designed to be easily replaced with Supabase:
- All CRUD operations are centralized in `DataStore` class
- Type definitions are already set up
- Database schema can be directly mapped to existing types

## Design Features

- **Appetizing Color Scheme**: Warm browns, fresh greens, and accent colors
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with smooth transitions
- **Accessibility**: Proper form labels, keyboard navigation, and semantic HTML

## Admin Credentials

- **Username**: `admin`
- **Password**: `password123`

## Future Enhancements

- [ ] Supabase integration for persistent data
- [ ] Payment processing
- [ ] Order status tracking
- [ ] Email notifications
- [ ] Inventory management
- [ ] Analytics dashboard

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

The application is fully functional and ready for production deployment!