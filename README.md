**Hot Iron
**
A market-design platform for auctioning green-steel production capacity and converting low volatility into cheaper financing.

Hot Iron is an applied-economics + systems project exploring how to use auction design, ESG-linked lending, and volatility-based financing models to lower the real cost of green steel.
The core idea: green steel is structurally lower-volatility than conventional HRC, and that stability can be monetized through cheaper debt. Hot Iron prototypes the architecture, math, and mechanisms required to deliver that value to buyers, suppliers, and lenders.

1. Problem

Steel buyers want predictable pricing.
Steel suppliers need liquidity.
Lenders want low-risk, ESG-positive deals.

Today’s green-steel market has:

High capital intensity (e.g., $1.5M per MW electrolyzer CAPEX)

Opaque pricing and thin liquidity

Weak alignment between buyers, mills, and project-finance lenders

No infrastructure for forward capacity commitments or standardized commercial terms

As a result, buyers pay a premium, suppliers face financing gaps, and lenders can’t reliably underwrite long-term contracts.

2. Hot Iron’s Approach

Hot Iron introduces a single platform for auctioning production capacity, bundling:

Time on the manufacturing line
Buyers bid for deliverable slots—matching what suppliers actually know they can produce.

A standardized term-sheet package
Incoterms, payment schedule, insurance, and delivery specs are pre-baked so auctions clear without protracted negotiation.

This structure mirrors the equipment-financing model used in other industrial markets but applies it to steel.

3. Financing Model (Core Insight)

Green steel exhibits significantly lower spot and futures volatility than traditional steel.
Lower volatility → lower perceived credit risk → lower cost of debt.

We convert that into explicit savings:

Debt per ton
Debt/Ton
=
0.7
×
(
100
 MW
×
$
1.5
M/MW
)
15,200
 tons/year
≈
$
6,908
/
ton
Debt/Ton=
15,200 tons/year
0.7×(100 MW×$1.5M/MW)
	​

≈$6,908/ton
Financing Savings
Savings/Ton
≈
(
Debt/Ton
)
×
Δ
𝑟
×
9.11
+
54
Savings/Ton≈(Debt/Ton)×Δr×9.11+54

Typical Δr values yield $200–$300/ton in interest savings.

These savings become shared upside for buyers and suppliers participating in the auction.

4. Auction Design

The auction matches:

Buyers: post project spec (tons, grades, delivery windows)

Suppliers/OEMs: commit capacity only for what they can deliver

Lenders: provide pre-committed term sheets at known spreads based on risk classification

Clearing objective:
maximize supplier utilization, minimize buyer cost, maintain lender IRR targets.

Hot Iron simulates this across heterogeneous demand and supply distributions.

5. System Architecture

Hot Iron includes:

🧮 Quant/Modeling Layer

Stochastic simulation of steel price paths

ESG-spread modeling

Debt-amortization curves

Auction clearing algorithm (variant of multi-unit uniform-price auction with capacity constraints)

📦 Data Layer

Historical HRC/green-steel volatility datasets

Capacity, ramp rate, and delivery-window priors

Term-sheet and financing assumptions

⚙️ Application Layer

Auction engine

Deal-packaging module (slots + standardized terms)

Reporting for buyer cost, supplier margin, lender IRR
