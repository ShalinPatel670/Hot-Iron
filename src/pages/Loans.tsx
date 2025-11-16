import { useState, useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import PageShell from '../components/PageShell'
import Tag from '../components/Tag'
import ChartShell from '../components/ChartShell'
import { useAuctionData } from '../context/AuctionDataContext'
import { Loan } from '../types'
import { useNotifications } from '../context/NotificationContext'
import { CHART_COLORS } from '../utils/chartData'

export default function Loans() {
  const { pushNotification } = useNotifications()
  const { latestRun, auctionHistory } = useAuctionData()
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)

  // Calculate amortization schedule for selected loan
  const amortizationData = useMemo(() => {
    if (!selectedLoan) return []
    
    // Parse tenor (e.g., "12 months" -> 12)
    const tenorMatch = selectedLoan.tenor.match(/(\d+)/)
    const months = tenorMatch ? parseInt(tenorMatch[1]) : 12
    
    // Use a representative loan amount (80% of max amount for example)
    const loanAmount = selectedLoan.maxAmount * 0.8
    const annualRate = selectedLoan.effectiveRate / 100
    const monthlyRate = annualRate / 12
    
    // Calculate monthly payment using standard amortization formula
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1)
    
    let remainingBalance = loanAmount
    const schedule = []
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment
      
      schedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        total: monthlyPayment,
        remainingBalance: Math.max(0, remainingBalance),
      })
    }
    
    return schedule
  }, [selectedLoan])

  // Generate loan recommendations based on auction runs
  const loans: Loan[] = useMemo(() => {
    if (!latestRun) return []

    const baseLoans: Loan[] = [ 
      {
        id: 'LOAN-001',
        lenderName: 'Test Lender #1',
        lenderRating: 'AAA',
        effectiveRate: 4.2,
        tenor: '12 months',
        maxAmount: Math.max(latestRun.winner.net_total * 1.2, 1000000),
        linkedTo: {
          type: 'auction',
          id: 'latest',
          name: `Latest Auction: ${latestRun.winner.seller_name}`,
        },
        netCostImpact: 2.1,
        co2Note: latestRun.winner.is_eaf
          ? 'enables access to 100% green share'
          : 'enables access to standard steel',
      },
      {
        id: 'LOAN-002',
        lenderName: 'Test Lender #2',
        lenderRating: 'AA',
        effectiveRate: 4.8,
        tenor: '18 months',
        maxAmount: Math.max(latestRun.winner.net_total * 1.5, 1500000),
        linkedTo: {
          type: 'auction',
          id: 'latest',
          name: `Latest Auction: ${latestRun.winner.seller_name}`,
        },
        netCostImpact: 1.8,
        co2Note: latestRun.winner.is_eaf
          ? 'enables access to 100% green share'
          : 'enables access to standard steel',
      },
    ]

    // Add loans for historical auctions if available
    if (auctionHistory.length > 1) {
      const historicalLoan: Loan = {
        id: 'LOAN-003',
        lenderName: 'Test Lender #3',
        lenderRating: 'A',
        effectiveRate: 5.2,
        tenor: '24 months',
        maxAmount: Math.max(
          auctionHistory.reduce((sum, run) => sum + run.winner.net_total, 0) * 1.1,
          2000000
        ),
        linkedTo: {
          type: 'auction',
          id: 'historical',
          name: `${auctionHistory.length} Historical Auctions`,
        },
        netCostImpact: 2.5,
        co2Note: `enables financing for ${auctionHistory.length} auction${auctionHistory.length !== 1 ? 's' : ''}`,
      }
      baseLoans.push(historicalLoan)
    }

    return baseLoans
  }, [latestRun, auctionHistory])

  if (loans.length === 0) {
    return (
      <PageShell>
        <div className="glass p-12 text-center text-white/40">
          <div className="text-sm">No loan recommendations available</div>
          <div className="text-xs mt-2">Run an auction to see financing options</div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        {/* Loan List */}
        <div className="space-y-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => setSelectedLoan(loan)}
              className={`glass p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${
                selectedLoan?.id === loan.id ? 'ring-2 ring-constructivist-red' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-off-white mb-1">{loan.lenderName}</h3>
                  <div className="flex items-center gap-2">
                    <Tag variant="info">{loan.lenderRating}</Tag>
                    <span className="text-sm text-white/60">Effective Rate: {loan.effectiveRate}% APR</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-white/60 mb-1">Tenor</div>
                  <div className="text-lg font-semibold text-off-white">{loan.tenor}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Maximum Amount</div>
                  <div className="text-lg font-semibold text-off-white">
                    ${(loan.maxAmount / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Linked to:</span>
                  <Tag variant="default">
                    {loan.linkedTo.type === 'order' ? 'Order' : 'Auction'}: {loan.linkedTo.name}
                  </Tag>
                </div>
                <div className="text-sm text-carbon-green font-medium">
                  {loan.co2Note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loan Detail Panel */}
        {selectedLoan && (
          <div className="glass p-6 sticky top-6 h-fit">
            <h2 className="text-2xl font-bold text-off-white mb-6">{selectedLoan.lenderName}</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-white/60">Lender Rating:</span>
                <Tag variant="info">{selectedLoan.lenderRating}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Effective Rate:</span>
                <span className="text-off-white font-semibold">{selectedLoan.effectiveRate}% APR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Tenor:</span>
                <span className="text-off-white font-semibold">{selectedLoan.tenor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Maximum Amount:</span>
                <span className="text-off-white font-semibold">
                  ${selectedLoan.maxAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="glass-strong p-4 rounded-lg mb-6">
              <div className="text-sm text-white/60 mb-2">Net Cost Impact</div>
              <div className="text-2xl font-bold text-off-white">
                {selectedLoan.netCostImpact > 0 ? '+' : ''}{selectedLoan.netCostImpact}%
              </div>
              <div className="text-xs text-white/50 mt-1">vs not financing</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-white/60 mb-2">CO₂ Impact</div>
              <div className="text-carbon-green font-semibold">{selectedLoan.co2Note}</div>
            </div>

            <ChartShell
              title="Cost Breakdown"
              subtitle="Repayment schedule over time"
            >
              {amortizationData.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px] text-white/40">
                  <div className="text-center">
                    <div className="text-sm">Select a loan to view repayment schedule</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={amortizationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis 
                      dataKey="month" 
                      stroke={CHART_COLORS.secondary}
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { fill: CHART_COLORS.secondary } }}
                    />
                    <YAxis 
                      stroke={CHART_COLORS.secondary}
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: `1px solid ${CHART_COLORS.grid}`,
                        borderRadius: '8px',
                        color: CHART_COLORS.primary
                      }}
                      formatter={(value: number, name: string) => {
                        return [`$${value.toFixed(2)}`, name === 'principal' ? 'Principal' : name === 'interest' ? 'Interest' : 'Total']
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="principal" 
                      stackId="1"
                      stroke={CHART_COLORS.co2} 
                      fill={CHART_COLORS.co2}
                      name="Principal"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interest" 
                      stackId="1"
                      stroke={CHART_COLORS.cost} 
                      fill={CHART_COLORS.cost}
                      name="Interest"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartShell>

            <div className="mt-6 p-4 glass-strong rounded-lg mb-4">
              <p className="text-sm text-white/70">
                This loan allows you to secure financing for your auction purchases at a blended premium of{' '}
                {selectedLoan.netCostImpact}% over not financing.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (selectedLoan) {
                    pushNotification({
                      type: 'loan',
                      title: 'Term sheet requested',
                      body: `Your request for a term sheet from ${selectedLoan.lenderName} has been submitted. You will receive it within 24 hours.`,
                      severity: 'info',
                      channels: ['email', 'push'],
                      entityRef: {
                        type: 'loan',
                        id: selectedLoan.id,
                        name: selectedLoan.lenderName,
                      },
                    })
                    alert('Term sheet request submitted')
                  }
                }}
                className="w-full glass p-3 rounded-lg text-off-white hover:bg-white/10 transition-colors"
              >
                Request Term Sheet
              </button>
              <button
                onClick={() => {
                  if (selectedLoan) {
                    pushNotification({
                      type: 'loan',
                      title: 'Loan offer accepted',
                      body: `You have accepted the loan offer from ${selectedLoan.lenderName}. The loan will be processed within 2-3 business days.`,
                      severity: 'success',
                      channels: ['email', 'push'],
                      entityRef: {
                        type: 'loan',
                        id: selectedLoan.id,
                        name: selectedLoan.lenderName,
                      },
                    })
                    alert('Loan offer accepted')
                  }
                }}
                className="w-full bg-constructivist-red hover:bg-constructivist-red/90 text-off-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Accept Offer
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
