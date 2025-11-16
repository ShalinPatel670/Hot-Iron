"""
Data models for the auction system.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Protocol, Literal, Tuple
import math
import random


# ---------- GEO MODEL ----------

@dataclass(frozen=True)
class Point:
    """
    Geographic point in degrees.
    """
    lat: float
    lon: float

    def distance_km_to(self, other: "Point") -> float:
        """
        Great-circle distance between two points on Earth using the haversine formula.
        Returns distance in kilometers.
        """
        R = 6371.0  # Earth radius in km
        lat1 = math.radians(self.lat)
        lon1 = math.radians(self.lon)
        lat2 = math.radians(other.lat)
        lon2 = math.radians(other.lon)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


class Geocoder(Protocol):
    """
    Abstraction layer: any geocoder just needs to return a Point.
    Replace StaticGeocoder with a real geocoding service in production.
    """
    def geocode(self, address: str) -> Point:
        ...


class StaticGeocoder:
    """
    Very simple geocoder for demos/tests.
    In production, replace with a real geocoding service.
    """
    def __init__(self):
        self._address_book = {
            "central us warehouse": Point(41.8781, -87.6298),  # Chicago
            "chicago, il": Point(41.8781, -87.6298),
            "pittsburgh, pa": Point(40.4406, -79.9959),
        }

    def geocode(self, address: str) -> Point:
        key = address.strip().lower()
        if key not in self._address_book:
            raise KeyError(
                f"Unknown address in StaticGeocoder: {address!r}. "
                f"Known keys: {list(self._address_book.keys())}"
            )
        return self._address_book[key]

    def geocode_from_coords(self, lat: float, lon: float) -> Point:
        """
        Create a Point directly from coordinates.
        """
        return Point(lat=lat, lon=lon)


TransportMode = Literal["truck", "rail", "ocean"]


# ---------- SELLER / BID MODEL ----------

@dataclass
class Seller:
    name: str
    location: Point                 # actual geo coords
    msrp: float                     # nominal price per ton of steel [$/t]
    base_cost: float                # production cost per ton [$/t], no distance
    risk_aversion: float            # 1.0–1.5, higher = bigger risk buffer
    is_eaf: bool                    # True if seller offers EAF-based (green) steel

    def distance_to(self, buyer_location: Point) -> float:
        return self.location.distance_km_to(buyer_location)

    # ----- MODE-AWARE, COST-SCALED LOGISTICS (distance-based mode) -----

    @staticmethod
    def choose_transport_mode(distance_km: float) -> TransportMode:
        """
        Simple distance-based routing:
          - ≤ 500 km    -> truck
          - 500–3000 km -> rail
          - > 3000 km   -> ocean
        """
        if distance_km <= 500:
            return "truck"
        elif distance_km <= 3000:
            return "rail"
        else:
            return "ocean"

    def logistics_cost_per_ton(
        self,
        distance_km: float,
    ) -> Tuple[float, TransportMode]:
        """
        Logistics cost per ton based on:
          - distance in km
          - transport mode (chosen by distance)
          - base_cost (scaled as a fraction of base_cost per 1000 km)

        Rough calibration (per 1000 km):
          - truck: ~1% of base_cost per 1000 km
          - rail:  ~0.5%
          - ocean: ~0.2%
        """
        mode = self.choose_transport_mode(distance_km)

        if mode == "truck":
            fraction_per_1000km = 0.010  # 1% of base_cost per 1000 km
        elif mode == "rail":
            fraction_per_1000km = 0.005  # 0.5%
        elif mode == "ocean":
            fraction_per_1000km = 0.002  # 0.2%
        else:
            fraction_per_1000km = 0.007  # fallback

        logistics_cost = self.base_cost * fraction_per_1000km * (distance_km / 1000.0)
        return logistics_cost, mode

    def production_cost(self, buyer_location: Point) -> float:
        """
        Cost per ton including distance-based logistics (mode-aware).
        """
        distance_km = self.distance_to(buyer_location)
        logistics_cost, _ = self.logistics_cost_per_ton(distance_km)
        return self.base_cost + logistics_cost

    def risk_buffer(self) -> float:
        """
        Risk buffer per ton based on margin and risk aversion.

        risk_aversion in [1.0, 1.5]:
          - 1.0  → 0 extra buffer
          - 1.5  → 50% of baseline margin as extra buffer
        """
        baseline_margin = max(self.msrp - self.base_cost, 0)
        return (self.risk_aversion - 1.0) * baseline_margin

    @staticmethod
    def volume_discount_pct(quantity_tons: float) -> float:
        """
        Simple piecewise volume discount based on order size.

        Returns a fraction in [0, 0.15], e.g. 0.07 = 7% discount.
        Larger orders monotonically decrease per-ton prices.
        """
        if quantity_tons <= 1_000:
            return 0.00    # no discount
        elif quantity_tons <= 5_000:
            return 0.03    # 3%
        elif quantity_tons <= 20_000:
            return 0.07    # 7%
        else:
            return 0.12    # 12% for very large orders

    def quote_price(
        self,
        buyer_location: Point,
        quantity_tons: float,
    ) -> dict:
        """
        Compute this seller's offer and net price, including:
          - production + logistics cost
          - risk buffer
          - volume discount (all sellers)
          - EAF discount (if is_eaf == True)

        EAF discount is a flat discount on total price *after* volume discount:
          eaf_discount_total = risk_aversion * 0.06 * gross_total_after_volume
        """
        distance_km = self.distance_to(buyer_location)
        logistics_cost, mode = self.logistics_cost_per_ton(distance_km)

        # Base cost + logistics
        cost_per_ton = self.base_cost + logistics_cost

        # Add risk buffer to form offer (per ton, before discounts)
        buffer_per_ton = self.risk_buffer()
        offer_price_per_ton = cost_per_ton + buffer_per_ton*0.5

        # Total gross price BEFORE volume discount
        gross_total_undiscounted = offer_price_per_ton * quantity_tons

        # Volume discount on gross total
        volume_pct = self.volume_discount_pct(quantity_tons)
        volume_discount_total = gross_total_undiscounted * volume_pct
        gross_total_after_volume = gross_total_undiscounted - volume_discount_total

        # EAF discount (if applicable) – applied on volume-discounted total
        eaf_discount_total = 0.0
        if self.is_eaf:
            eaf_discount_total = self.risk_aversion * 0.06 * gross_total_after_volume

        net_total = gross_total_after_volume - eaf_discount_total
        net_price_per_ton = net_total / quantity_tons

        return {
            "seller": self.name,
            "distance_km": distance_km,
            "transport_mode": mode,
            "cost_per_ton": cost_per_ton,
            "risk_buffer_per_ton": buffer_per_ton,
            "offer_price_per_ton": offer_price_per_ton,
            "gross_total_undiscounted": gross_total_undiscounted,
            "volume_discount_pct": volume_pct,
            "volume_discount_total": volume_discount_total,
            "gross_total": gross_total_after_volume,
            "is_eaf": self.is_eaf,
            "eaf_discount_total": eaf_discount_total,
            "net_total": net_total,
            "net_price_per_ton": net_price_per_ton,
        }


@dataclass
class Bid:
    seller: Seller
    distance_km: float
    transport_mode: TransportMode
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

    @property
    def total_net_cost(self) -> float:
        return self.net_total


# ---------- DEFAULT SELLERS ----------

def make_default_sellers() -> List[Seller]:
    """
    Create steel sellers with hand-tuned parameters.

    Distances are computed in km using lat/lon coordinates.
    Logistics are mode-aware and scaled as a fraction of base_cost per 1000 km.
    is_eaf is a rough proxy for whether they offer EAF-based steel.

    All EAF (green) sellers have msrp = 1000 (fixed).
    Parameters are loosely tuned so that typical net prices end up
    in the ballpark of recent market HRC levels (~800–900 $/t),
    before large volume discounts.
    """

    def jitter(base: float, pct: float = 0.03) -> float:
        return base * (1 + random.uniform(-pct, pct))

    sellers = [
        # ----- EAF / GREEN STEEL (msrp = 1000) -----
        Seller(
            name="Nucor",
            location=Point(35.2271, -80.8431),  # Charlotte, US
            msrp=1000.0,
            base_cost=780.0,
            risk_aversion=1.20,
            is_eaf=True,
        ),
        Seller(
            name="U.S. Steel",
            location=Point(40.4406, -79.9959),  # Pittsburgh, US
            msrp=1000.0,
            base_cost=790.0,
            risk_aversion=1.30,
            is_eaf=True,
        ),
        Seller(
            name="ArcelorMittal",
            location=Point(49.6117, 6.1319),    # Luxembourg
            msrp=1000.0,
            base_cost=795.0,
            risk_aversion=1.25,
            is_eaf=True,
        ),
        Seller(
            name="Nippon Steel",
            location=Point(35.6762, 139.6503),  # Tokyo, Japan
            msrp=1000.0,
            base_cost=800.0,
            risk_aversion=1.30,
            is_eaf=True,
        ),
        Seller(
            name="POSCO",
            location=Point(36.0190, 129.3435),  # Pohang, Korea
            msrp=1000.0,
            base_cost=790.0,
            risk_aversion=1.28,
            is_eaf=True,
        ),
        Seller(
            name="Baosteel",
            location=Point(31.2304, 121.4737),  # Shanghai, China
            msrp=980.0,
            base_cost=785.0,
            risk_aversion=1.22,
            is_eaf=True,
        ),

        # ----- NON-EAF / STANDARD STEEL -----
        Seller(
            name="Tata Steel",
            location=Point(22.8046, 86.2029),   # Jamshedpur, India
            msrp=790.0,
            base_cost=750.0,
            risk_aversion=1.35,
            is_eaf=False,
        ),
        Seller(
            name="Thyssenkrupp",
            location=Point(51.4352, 6.7627),    # Duisburg, Germany
            msrp=820.0,
            base_cost=770.0,
            risk_aversion=1.32,
            is_eaf=False,
        ),
        Seller(
            name="Cleveland-Cliffs",
            location=Point(41.4993, -81.6944),  # Cleveland, US
            msrp=765.0,
            base_cost=720.0,
            risk_aversion=1.30,
            is_eaf=False,
        ),
        Seller(
            name="JSW Steel",
            location=Point(15.3490, 74.1230),   # Approx. Vijayanagar, India
            msrp=720.0,
            base_cost=670.0,
            risk_aversion=1.33,
            is_eaf=False,
        ),
        Seller(
            name="China Steel Corp",
            location=Point(22.6400, 120.3000),  # Kaohsiung, Taiwan
            msrp=745.0,
            base_cost=700.0,
            risk_aversion=1.27,
            is_eaf=False,
        ),
    ]

    # Add small randomness so the profiles aren't totally rigid
    for s in sellers:
        s.base_cost = jitter(s.base_cost, 0.02)
        # Only jitter msrp for non-EAF sellers; keep green steel at exactly 1000
        if not s.is_eaf:
            s.msrp = jitter(s.msrp, 0.02)
        else:
            s.msrp = 1000.0

    return sellers

