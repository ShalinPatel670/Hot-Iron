"""
Auction logic for reverse auctions.
"""
from typing import List
from .models import Seller, Point, Bid, Geocoder


def run_reverse_auction(
    sellers: List[Seller],
    buyer_location: Point,
    quantity_tons: float,
):
    """
    Simple reverse auction: each seller submits a price; lowest net price wins.
    
    Args:
        sellers: List of Seller objects
        buyer_location: Point representing buyer's location
        quantity_tons: Quantity of steel to purchase in tons
        
    Returns:
        Tuple of (winning_bid, all_bids)
    """
    bids: List[Bid] = []

    for s in sellers:
        quote = s.quote_price(
            buyer_location=buyer_location,
            quantity_tons=quantity_tons,
        )
        bid = Bid(
            seller=s,
            distance_km=quote["distance_km"],
            transport_mode=quote["transport_mode"],
            cost_per_ton=quote["cost_per_ton"],
            risk_buffer_per_ton=quote["risk_buffer_per_ton"],
            offer_price_per_ton=quote["offer_price_per_ton"],
            gross_total_undiscounted=quote["gross_total_undiscounted"],
            volume_discount_pct=quote["volume_discount_pct"],
            volume_discount_total=quote["volume_discount_total"],
            gross_total=quote["gross_total"],
            is_eaf=quote["is_eaf"],
            eaf_discount_total=quote["eaf_discount_total"],
            net_price_per_ton=quote["net_price_per_ton"],
            net_total=quote["net_total"],
            quantity_tons=quantity_tons,
        )
        bids.append(bid)

    # Winner is the lowest net price per ton
    winning_bid = min(bids, key=lambda b: b.net_price_per_ton)
    return winning_bid, bids


def run_reverse_auction_for_address(
    sellers: List[Seller],
    buyer_address: str,
    geocoder: Geocoder,
    quantity_tons: float,
):
    """
    Convenience wrapper: take a buyer address string, geocode it,
    then run the auction.
    
    Args:
        sellers: List of Seller objects
        buyer_address: String address to geocode
        geocoder: Geocoder instance
        quantity_tons: Quantity of steel to purchase in tons
        
    Returns:
        Tuple of (winning_bid, all_bids)
    """
    buyer_location = geocoder.geocode(buyer_address)
    return run_reverse_auction(
        sellers=sellers,
        buyer_location=buyer_location,
        quantity_tons=quantity_tons,
    )

