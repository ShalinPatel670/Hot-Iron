// Shared constants and utilities for charts across the application

export const BASELINE_CO2_PER_TON = 1.9 // kg CO2 per ton for conventional steel
export const EAF_CO2_PER_TON = 0.6 // kg CO2 per ton for EAF steel
export const BASELINE_PRICE_PER_TON = 800 // USD per ton baseline price

// Chart color tokens matching the app theme
export const CHART_COLORS = {
  cost: '#ef4444', // constructivist-red
  co2: '#10b981', // carbon-green
  blended: '#f59e0b', // amber
  primary: '#ffffff', // off-white
  secondary: '#9ca3af', // gray-400
  background: 'rgba(255, 255, 255, 0.05)',
  grid: 'rgba(255, 255, 255, 0.1)',
}

// Calculate CO2 savings for a given auction run
export function calculateCo2Savings(quantityTons: number, isEaf: boolean): number {
  if (!isEaf) return 0
  return (BASELINE_CO2_PER_TON - EAF_CO2_PER_TON) * quantityTons * 1000 // Convert to kg
}

// Calculate green premium percentage
export function calculateGreenPremium(netPricePerTon: number, isEaf: boolean): number {
  if (!isEaf) return 0
  return ((netPricePerTon - BASELINE_PRICE_PER_TON) / BASELINE_PRICE_PER_TON) * 100
}

