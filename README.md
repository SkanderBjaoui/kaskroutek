# Kaskroutek - Premium Sandwich Shop

A fully functional Next.js website for a sandwich shop with customer ordering interface and admin management panel.

## Features

### Customer Ordering Interface
- **Sandwich Customization**: Choose from various bread types and toppings
- **Live Price Calculator**: Real-time price updates as you build your sandwich
- **Order Form**: Customer details collection with validation
- **Order Confirmation**: Clear confirmation message with customer details
- **Loyalty Points System**: Earn and redeem points for orders
- **Telegram Notifications**: Real-time order alerts to admin

### Admin Management Panel
- **Secure Login**: Admin authentication
- **Bread Management**: Add, edit, and delete bread types with prices
- **Topping Management**: Add, edit, and delete toppings with prices
- **Order Viewing**: View all customer orders with details
- **Loyalty Points Management**: Track and manage customer points
- **Order Status Updates**: Mark orders as delivered to award points

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React 19** with modern hooks
- **Supabase** for database and auth

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with your configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

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
│   └── supabaseStore.ts      # Supabase-backed data store
└── types/
    └── index.ts              # TypeScript type definitions
```

## Database Schema (Context-Only)

Warning: This schema is for context only and is not meant to be run. Table order and constraints may not be valid for execution.

```sql
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.breads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  price numeric NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT breads_pkey PRIMARY KEY (id)
);
CREATE TABLE public.loyalty_points (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  phone_number character varying NOT NULL UNIQUE,
  customer_name character varying NOT NULL,
  total_points numeric NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT loyalty_points_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_name character varying NOT NULL,
  phone_number character varying NOT NULL,
  bread_id uuid,
  toppings jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL,
  status character varying DEFAULT 'awaiting_confirmation'::character varying CHECK (status::text = ANY (ARRAY['awaiting_confirmation'::character varying::text, 'confirmed'::character varying::text, 'in_preparation'::character varying::text, 'delivery'::character varying::text, 'delivered'::character varying::text, 'cancelled'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  payment_method character varying NOT NULL DEFAULT 'cash'::character varying CHECK (payment_method::text = ANY (ARRAY['cash'::character varying, 'points'::character varying]::text[])),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_bread_id_fkey FOREIGN KEY (bread_id) REFERENCES public.breads(id)
);
CREATE TABLE public.points_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['earn'::text, 'spend'::text, 'adjustment_add'::text, 'adjustment_subtract'::text])),
  reason text,
  related_order_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT points_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT points_transactions_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.toppings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  price numeric NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category character varying DEFAULT 'extra'::character varying CHECK (category::text = ANY (ARRAY['salads'::character varying::text, 'meats'::character varying::text, 'condiments'::character varying::text, 'extra'::character varying::text])),
  CONSTRAINT toppings_pkey PRIMARY KEY (id)
);
```

## Design Features

- **Appetizing Color Scheme**: Warm browns, fresh greens, and accent colors
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with smooth transitions
- **Accessibility**: Proper form labels, keyboard navigation, and semantic HTML

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

The application is fully functional and ready for production deployment!