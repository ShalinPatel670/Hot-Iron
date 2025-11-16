# Backend API

FastAPI server for the Hot Iron auction system.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
uvicorn backend.server:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### GET /health
Health check endpoint.

### GET /sellers
Returns list of available sellers.

### POST /auction/run
Run a reverse auction.

**Request body:**
```json
{
  "buyer_address": "chicago, il",  // Optional
  "lat": 41.8781,                  // Optional (if no address)
  "lon": -87.6298,                 // Optional (if no address)
  "quantity_tons": 10000
}
```

**Response:**
```json
{
  "winner": { ... },
  "bids": [ ... ],
  "buyer_location": { "lat": 41.8781, "lon": -87.6298 }
}
```

### POST /auction/run-by-address
Convenience endpoint for address-based auctions.

**Query parameters:**
- `buyer_address`: String address
- `quantity_tons`: Float quantity

## Known Addresses

The static geocoder supports:
- "central us warehouse" (Chicago)
- "chicago, il"
- "pittsburgh, pa"

Or provide lat/lon coordinates directly.

