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

- **Frontend:**
  - React 18 with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - React Router for navigation

- **Backend:**
  - Python 3.8+
  - FastAPI for REST API
  - Pydantic for data validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.8+ (for backend)

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Start the backend server:
```bash
uvicorn backend.server:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

See `backend/README.md` for detailed API documentation.

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://localhost:8000`):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
├── backend/              # Python FastAPI backend
│   ├── models.py        # Data models (Point, Seller, Bid)
│   ├── auction.py       # Auction logic
│   ├── server.py        # FastAPI application
│   └── requirements.txt # Python dependencies
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── context/         # React contexts (Notifications, AuctionData)
│   ├── lib/             # API client and utilities
│   ├── types/           # TypeScript type definitions
│   ├── data/            # Mock data (legacy)
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
└── pricingformula.py    # Original pricing logic (legacy)
```

## Features

- **Dashboard:** Overview of cost vs carbon position with KPIs and recent activity from auction runs
- **Auction:** Run reverse auctions with buyer location and quantity inputs. View winner and full bid book
- **My Orders:** Track executed purchases derived from auction results with detailed order information
- **Loans:** View trade finance options linked to auction results
- **Analytics:** Historical analysis of CO₂ savings and green premium metrics from auction history
- **My Account:** Organization profile, team management, and notification settings

## Backend Integration

The frontend communicates with the FastAPI backend to:
- Run reverse auctions with buyer location and quantity
- Retrieve seller information
- Get detailed bid breakdowns including transport modes, discounts, and pricing

### Known Addresses

The backend geocoder supports these demo addresses:
- "central us warehouse" (Chicago)
- "chicago, il"
- "pittsburgh, pa"

Or provide latitude/longitude coordinates directly.

### API Endpoints

- `GET /health` - Health check
- `GET /sellers` - List available sellers
- `POST /auction/run` - Run reverse auction with request body:
  ```json
  {
    "buyer_address": "chicago, il",  // Optional
    "lat": 41.8781,                  // Optional
    "lon": -87.6298,                 // Optional
    "quantity_tons": 10000
  }
  ```

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

## Development Notes

- Auction results are persisted in localStorage for demo continuity
- Orders are automatically created from successful auction runs
- Analytics metrics are computed from auction history
- Loan recommendations are generated based on latest auction results

## License

This project is a demo application.
