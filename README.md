# Barista Cafe Management System

A modern web application for cafe management with real-time inventory tracking, order processing, and a responsive customer interface.


## Features

### Customer Experience
- **Interactive Menu**
  - Browse menu items by category
  - Recommended items section with high-quality food images
  - Real-time inventory status (available/unavailable)
  - Size selection for applicable items (S, R, L)

- **Intuitive Shopping Cart**
  - Add/remove items seamlessly
  - Adjust quantities
  - View real-time price calculation

- **Elegant UI/UX**
  - Animated transitions and interactions
  - Mobile-responsive design
  - Engaging welcome page with coffee animations

### Admin Tools
- **Inventory Management**
  - Add/edit products
  - Update availability status
  - Real-time inventory tracking

- **Order Processing**
  - View incoming orders
  - Update order status
  - Order history and analytics

- **Sales Dashboard**
  - Track sales performance
  - View top-selling items
  - Sales reports and analytics

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Framer Motion for animations
  - TailwindCSS for styling
  - Context API for state management

- **Backend**
  - Supabase for database and authentication
  - Real-time data synchronization

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/purushottam2256/barista-cafe.git
cd barista-cafe
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Database Schema

The application uses the following tables in Supabase:

- **orders** - Stores customer orders
- **inventory** - Tracks available items and quantities
- **menu** - Defines the cafe menu structure
- **sales** - Records completed transactions

## Directory Structure

```
barista-cafe/
├── public/                  # Static assets
│   ├── food-images/         # Food and beverage images
│   └── logos/               # Brand logos
├── src/
│   ├── components/          # React components
│   │   ├── admin/           # Admin-specific components
│   │   └── ui/              # Reusable UI components
│   ├── context/             # React context providers
│   ├── pages/               # Page components
│   └── utils/               # Utility functions and data
├── .env.local               # Environment variables (create this)
└── package.json             # Project dependencies
```

## Usage

### Customer Interface
- Visit the home page to see the welcome animation
- Browse the menu by categories
- Add items to your cart
- View cart and proceed to checkout

### Admin Interface
- Navigate to the `/admin` route
- Log in with admin credentials
- Manage inventory, view orders, and access sales data

## Development

### Adding New Menu Items
1. Update the `menuData.ts` file to include new items
2. Add appropriate images to the `public/food-images` directory
3. Update the item map in `RecommendedItems.tsx` if needed

### Customizing the Theme
The application uses TailwindCSS for styling. You can modify the theme in `tailwind.config.ts`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Your Name - Initial work and development

---

##future scopes

-adding payment getway
-adding google maps
-make it more secure and robust


Made with ☕ by pj


