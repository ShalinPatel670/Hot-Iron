Hot Iron

A market-design platform for auctioning green-steel production capacity and converting low volatility into cheaper financing.

Hot Iron is a quantitative and systems project exploring how auction design, ESG-linked lending, and volatility-based financing models can lower the real cost of green steel.
The core idea: green steel is structurally lower-volatility than conventional HRC, and that stability can be monetized through cheaper debt. Hot Iron prototypes the architecture, math, and mechanisms required to deliver that value to buyers, suppliers, and lenders.

1. Problem

Steel buyers want predictable pricing.
Steel suppliers need liquidity.
Lenders want low-risk, ESG-positive deals.

Today's green-steel market has:

High capital intensity (for example, 1.5M USD per MW electrolyzer CAPEX)

Opaque pricing and thin liquidity

Weak alignment between buyers, mills, and project finance lenders

No infrastructure for forward capacity commitments or standardized commercial terms

As a result, buyers pay a premium, suppliers face financing gaps, and lenders cannot reliably underwrite long-term contracts.

2. Hot Iron's Approach

Hot Iron introduces a platform for auctioning production capacity by bundling two components:

Time on the manufacturing line
Buyers bid for deliverable slots that match what suppliers know they can produce.

A standardized term-sheet package
Incoterms, payment schedules, insurance, and delivery specs are pre-packaged so auctions clear without lengthy bilateral negotiation.

This structure mirrors the equipment-financing model used in other industrial markets and applies it to steel.

3. Financing Model

Green steel exhibits significantly lower spot and futures volatility compared to traditional steel.
Lower volatility reduces perceived credit risk, which reduces the cost of debt.

We convert this into explicit savings.

Debt per ton
DebtPerTon = (0.7 * (100 MW * 1.5M USD per MW)) / 15,200 tons per year
≈ 6,908 USD per ton

Financing savings
SavingsPerTon ≈ (DebtPerTon) * (DeltaRate) * 9.11 + 54


Typical DeltaRate values produce approximately 200 to 300 USD per ton in interest savings.
These savings can be shared between buyers and suppliers participating in the auction.

4. Auction Design

The auction aligns:

Buyers posting project specs such as tons, grade, delivery windows

Suppliers and OEMs committing capacity only for what they can reliably deliver

Lenders providing pre-committed term sheets at known spreads based on risk classification

Clearing objective:
maximize supplier utilization, minimize buyer cost, and maintain lender IRR targets.

Hot Iron simulates this across varied supply curves and buyer demand distributions.

5. System Architecture
Quant and Modeling Layer

Stochastic simulation of steel price paths

ESG spread modeling

Debt amortization curves

Auction clearing algorithms (multi-unit, capacity-constrained variants)

Data Layer

Historical pricing datasets for HRC and green steel

Capacity, ramp rate, and delivery-window priors

Term sheet and financing assumptions

Application Layer

Auction engine

Deal packaging module (production slots plus standardized commercial terms)

Reporting for buyer cost, supplier margin, and lender IRR

6. What This Project Demonstrates

Hot Iron is a validated architecture showing:

Lower green-steel volatility can be monetized directly

Financing savings are large enough to narrow the cost gap with conventional steel

Auction-based forward commitments create liquidity and price discovery

Buyers, suppliers, and lenders can be aligned through one mechanism

7. Repository Structure
hot-iron/
  models/       quantitative models for volatility, financing, and debt-per-ton
  auctions/     auction logic and clearing mechanisms
  data/         pricing history and synthetic supplier-buyer profiles
  notebooks/    exploratory analysis and simulation results
  docs/         economic specs, term sheets, and model notes
  README.md
