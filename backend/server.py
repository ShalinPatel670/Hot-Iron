"""
FastAPI server for the auction backend.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any
from .models import Point, StaticGeocoder, Seller, Bid
from .auction import run_reverse_auction, run_reverse_auction_for_address
from .models import make_default_sellers

app = FastAPI(title="Hot Iron Auction API", version="1.0.0")

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize geocoder and sellers
geocoder = StaticGeocoder()
default_sellers = make_default_sellers()


# Request/Response models
class AuctionRunRequest(BaseModel):
    buyer_address: Optional[str] = Field(None, description="Buyer warehouse address")
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Latitude")
    lon: Optional[float] = Field(None, ge=-180, le=180, description="Longitude")
    quantity_tons: float = Field(..., gt=0, description="Quantity in tons")

    @field_validator('quantity_tons')
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('quantity_tons must be positive')
        if v > 100000:
            raise ValueError('quantity_tons cannot exceed 100,000')
        return v

    @model_validator(mode='after')
    def validate_location(self):
        # Ensure we have either address or coordinates
        if not self.buyer_address and (self.lat is None or self.lon is None):
            raise ValueError('Must provide either buyer_address or both lat and lon')
        return self


class SellerResponse(BaseModel):
    name: str
    location: Dict[str, float]
    msrp: float
    base_cost: float
    risk_aversion: float
    is_eaf: bool


class BidResponse(BaseModel):
    seller_name: str
    distance_km: float
    transport_mode: str
    cost_per_ton: float
    risk_buffer_per_ton: float
    offer_price_per_ton: float
    gross_total_undiscounted: float
    volume_discount_pct: float
    volume_discount_total: float
    gross_total: float
    is_eaf: bool
    eaf_discount_total: float
    net_price_per_ton: float
    net_total: float
    quantity_tons: float


class AuctionRunResponse(BaseModel):
    winner: BidResponse
    bids: List[BidResponse]
    buyer_location: Dict[str, float]


def bid_to_response(bid: Bid) -> BidResponse:
    """Convert Bid to BidResponse."""
    return BidResponse(
        seller_name=bid.seller.name,
        distance_km=bid.distance_km,
        transport_mode=bid.transport_mode,
        cost_per_ton=bid.cost_per_ton,
        risk_buffer_per_ton=bid.risk_buffer_per_ton,
        offer_price_per_ton=bid.offer_price_per_ton,
        gross_total_undiscounted=bid.gross_total_undiscounted,
        volume_discount_pct=bid.volume_discount_pct,
        volume_discount_total=bid.volume_discount_total,
        gross_total=bid.gross_total,
        is_eaf=bid.is_eaf,
        eaf_discount_total=bid.eaf_discount_total,
        net_price_per_ton=bid.net_price_per_ton,
        net_total=bid.net_total,
        quantity_tons=bid.quantity_tons,
    )


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/sellers", response_model=List[SellerResponse])
async def get_sellers():
    """Get list of available sellers."""
    return [
        SellerResponse(
            name=seller.name,
            location={"lat": seller.location.lat, "lon": seller.location.lon},
            msrp=seller.msrp,
            base_cost=seller.base_cost,
            risk_aversion=seller.risk_aversion,
            is_eaf=seller.is_eaf,
        )
        for seller in default_sellers
    ]


@app.post("/auction/run", response_model=AuctionRunResponse)
async def run_auction(request: AuctionRunRequest):
    """
    Run a reverse auction.
    
    Requires either buyer_address or both lat/lon coordinates.
    """
    try:
        # Determine buyer location
        if request.lat is not None and request.lon is not None:
            buyer_location = Point(lat=request.lat, lon=request.lon)
        elif request.buyer_address:
            try:
                buyer_location = geocoder.geocode(request.buyer_address)
            except KeyError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Address not found: {str(e)}. Known addresses: central us warehouse, chicago il, pittsburgh pa"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="Must provide either buyer_address or both lat and lon"
            )

        # Run auction
        winner, bids = run_reverse_auction(
            sellers=default_sellers,
            buyer_location=buyer_location,
            quantity_tons=request.quantity_tons,
        )

        return AuctionRunResponse(
            winner=bid_to_response(winner),
            bids=[bid_to_response(bid) for bid in bids],
            buyer_location={"lat": buyer_location.lat, "lon": buyer_location.lon},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/auction/run-by-address", response_model=AuctionRunResponse)
async def run_auction_by_address(
    buyer_address: str = Query(..., description="Buyer warehouse address"),
    quantity_tons: float = Query(..., gt=0, description="Quantity in tons"),
):
    """
    Run auction using address string (convenience endpoint).
    """
    try:
        if quantity_tons <= 0:
            raise HTTPException(status_code=400, detail="quantity_tons must be positive")
        if quantity_tons > 100000:
            raise HTTPException(status_code=400, detail="quantity_tons cannot exceed 100,000")

        winner, bids = run_reverse_auction_for_address(
            sellers=default_sellers,
            buyer_address=buyer_address,
            geocoder=geocoder,
            quantity_tons=quantity_tons,
        )

        buyer_location = geocoder.geocode(buyer_address)

        return AuctionRunResponse(
            winner=bid_to_response(winner),
            bids=[bid_to_response(bid) for bid in bids],
            buyer_location={"lat": buyer_location.lat, "lon": buyer_location.lon},
        )
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Address not found: {str(e)}. Known addresses: central us warehouse, chicago il, pittsburgh pa"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

