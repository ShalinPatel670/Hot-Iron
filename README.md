# Green Carbon Auction Desk

A responsive web application for industrial buyers to bid on low-carbon steel and arrange trade finance for those purchases.

## Design Philosophy

This application blends **Russian Constructivism** (bold geometry, diagonals, strong typography, limited palette) with **Apple-style glassmorphism** (frosted translucent surfaces, subtle blur, soft depth). The UI is designed to feel like a serious trading terminal for sustainability teams.

### Visual Language

- **Color Palette:**
  - Base background: Near-black `#05060A` with subtle vertical gradient
  - Primary foreground: Soft off-white `#F5F5F7`
  - Accent 1 (Constructivist Red): `#FF3B30` for primary CTAs
  - Accent 2 (Carbon Green): `#3DD68C` for green steel metrics

- **Typography:** Modern grotesk sans-serif (Inter/SF Pro/system UI) with uppercase page titles and oversized KPI numbers

- **Layout:** Persistent left sidebar, two- and three-column grids, constructivist diagonals, and glassmorphism effects

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── PageShell.tsx
│   ├── StatCard.tsx
│   ├── AuctionCard.tsx
│   ├── Table.tsx
│   ├── Tag.tsx
│   ├── Pill.tsx
│   ├── ChartShell.tsx
│   ├── Modal.tsx
│   ├── Drawer.tsx
│   └── Skeleton.tsx
├── pages/           # Page components
│   ├── Dashboard.tsx
│   ├── Auction.tsx
│   ├── MyOrders.tsx
│   ├── Loans.tsx
│   ├── Analytics.tsx
│   └── MyAccount.tsx
├── data/            # Mock data
│   └── mockData.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles and Tailwind directives
```

## Features

- **Dashboard:** Overview of cost vs carbon position with KPIs and recent activity
- **Auction:** Browse and bid on green steel auctions with bid simulator
- **My Orders:** Track executed purchases with detailed order information
- **Loans:** View trade finance options linked to orders and auctions
- **Analytics:** Historical and scenario analysis with export capabilities
- **My Account:** Organization profile, team management, and notification settings

## Responsive Design

The application is fully responsive:
- **Desktop:** Full sidebar navigation, multi-column layouts
- **Tablet:** Collapsible sidebar, stacked layouts
- **Mobile:** Hamburger menu, single-column layouts, slide-in drawer navigation

## Browser Support

Modern browsers that support:
- ES2020+
- CSS Grid and Flexbox
- CSS backdrop-filter (for glassmorphism effects)

## License

This project is a demo application with mock data. No backend is included.

