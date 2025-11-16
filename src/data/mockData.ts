import { Auction, Order, Loan, Activity, AnalyticsData, Notification, NotificationSeverity, NotificationChannel } from '../types'

export const mockAuctions: Auction[] = [
  {
    id: '1',
    title: 'US HRC – EAF, Q2 Delivery',
    region: 'US',
    product: 'Hot Rolled Coil (HRC)',
    currentPrice: 850,
    co2Intensity: 0.6,
    baselineCo2: 1.9,
    volumeTotal: 50000,
    volumeRemaining: 32000,
    auctionType: 'Uniform-price',
    deliveryWindow: 'Q2 2024',
    endDate: '2024-03-15',
  },
  {
    id: '2',
    title: 'EU HRC – DRI + EAF',
    region: 'EU',
    product: 'Hot Rolled Coil (HRC)',
    currentPrice: 920,
    co2Intensity: 0.4,
    baselineCo2: 1.8,
    volumeTotal: 30000,
    volumeRemaining: 15000,
    auctionType: 'Pay-as-bid',
    deliveryWindow: 'Q3 2024',
    endDate: '2024-04-20',
  },
  {
    id: '3',
    title: 'India HRC – EAF',
    region: 'India',
    product: 'Hot Rolled Coil (HRC)',
    currentPrice: 720,
    co2Intensity: 0.8,
    baselineCo2: 2.1,
    volumeTotal: 40000,
    volumeRemaining: 28000,
    auctionType: 'Uniform-price',
    deliveryWindow: 'Q2 2024',
    endDate: '2024-03-10',
  },
]

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    product: 'Hot Rolled Coil (HRC)',
    region: 'US',
    volume: 10000,
    price: 875,
    co2VsBaseline: -68,
    greenShare: 85,
    status: 'Settled',
    counterparty: 'GreenSteel Inc',
    createdAt: '2024-01-15',
    settledAt: '2024-01-20',
  },
  {
    id: 'ORD-002',
    product: 'Hot Rolled Coil (HRC)',
    region: 'EU',
    volume: 5000,
    price: 910,
    co2VsBaseline: -78,
    greenShare: 100,
    status: 'In transit',
    counterparty: 'EcoMetal EU',
    createdAt: '2024-02-01',
  },
  {
    id: 'ORD-003',
    product: 'Hot Rolled Coil (HRC)',
    region: 'US',
    volume: 15000,
    price: 860,
    co2VsBaseline: -65,
    greenShare: 70,
    status: 'Pending',
    counterparty: 'LowCarbon Steel Co',
    createdAt: '2024-02-10',
  },
]

export const mockLoans: Loan[] = [
  {
    id: 'LOAN-001',
    lenderName: 'Sustainable Finance Bank',
    lenderRating: 'AAA',
    effectiveRate: 4.2,
    tenor: '12 months',
    maxAmount: 10000000,
    linkedTo: {
      type: 'order',
      id: 'ORD-003',
      name: 'US HRC Order',
    },
    netCostImpact: 2.1,
    co2Note: 'enables access to 70% green share',
  },
  {
    id: 'LOAN-002',
    lenderName: 'Green Trade Capital',
    lenderRating: 'AA',
    effectiveRate: 4.8,
    tenor: '18 months',
    maxAmount: 15000000,
    linkedTo: {
      type: 'auction',
      id: '1',
      name: 'US HRC – EAF, Q2 Delivery',
    },
    netCostImpact: 1.8,
    co2Note: 'enables access to 85% green share',
  },
]

export const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    type: 'auction',
    title: 'Bid placed on US HRC – EAF, Q2 Delivery',
    status: 'LIVE AUCTION',
    timestamp: '2024-02-12T10:30:00Z',
  },
  {
    id: 'ACT-002',
    type: 'order',
    title: 'Order ORD-002 settled',
    status: 'ORDER SETTLED',
    timestamp: '2024-02-01T14:20:00Z',
  },
  {
    id: 'ACT-003',
    type: 'loan',
    title: 'Loan LOAN-001 approved',
    status: 'LOAN PENDING',
    timestamp: '2024-02-10T09:15:00Z',
  },
]

export const mockAnalytics: AnalyticsData = {
  co2Reduced: [
    { date: '2024-01', value: 1200 },
    { date: '2024-02', value: 1850 },
    { date: '2024-03', value: 2100 },
  ],
  greenPremium: [
    { date: '2024-01', value: 3.2 },
    { date: '2024-02', value: 4.1 },
    { date: '2024-03', value: 3.8 },
  ],
  regionalBreakdown: [
    { region: 'US', volume: 25000, co2Intensity: 0.65 },
    { region: 'EU', volume: 5000, co2Intensity: 0.4 },
    { region: 'India', volume: 0, co2Intensity: 0 },
  ],
}

export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'auction',
    title: 'New auction ending soon',
    body: 'US HRC – EAF, Q2 Delivery auction closes in 3 days. Current price: $850/ton',
    severity: 'critical',
    channels: ['email', 'push'],
    entityRef: {
      type: 'auction',
      id: '1',
      name: 'US HRC – EAF, Q2 Delivery',
    },
    timestamp: '2024-02-12T10:30:00Z',
  },
  {
    id: 'NOTIF-002',
    type: 'order',
    title: 'Order settled',
    body: 'Order ORD-002 has been settled successfully. 5,000 tons of HRC from EcoMetal EU.',
    severity: 'success',
    channels: ['email', 'push'],
    entityRef: {
      type: 'order',
      id: 'ORD-002',
      name: 'Order ORD-002',
    },
    timestamp: '2024-02-01T14:20:00Z',
    readAt: '2024-02-01T15:00:00Z',
  },
  {
    id: 'NOTIF-003',
    type: 'loan',
    title: 'Loan application pending',
    body: 'Your loan application LOAN-001 is pending review from Sustainable Finance Bank.',
    severity: 'warning',
    channels: ['email'],
    entityRef: {
      type: 'loan',
      id: 'LOAN-001',
      name: 'Loan LOAN-001',
    },
    timestamp: '2024-02-10T09:15:00Z',
  },
  {
    id: 'NOTIF-004',
    type: 'auction',
    title: 'Bid placed successfully',
    body: 'Your bid of $850/ton for 1,000 tons has been placed on US HRC – EAF, Q2 Delivery.',
    severity: 'info',
    channels: ['push'],
    entityRef: {
      type: 'auction',
      id: '1',
      name: 'US HRC – EAF, Q2 Delivery',
    },
    timestamp: '2024-02-12T10:30:00Z',
  },
  {
    id: 'NOTIF-005',
    type: 'order',
    title: 'Order in transit',
    body: 'Order ORD-002 is now in transit. Expected delivery: Q2 2024.',
    severity: 'info',
    channels: ['email', 'push'],
    entityRef: {
      type: 'order',
      id: 'ORD-002',
      name: 'Order ORD-002',
    },
    timestamp: '2024-02-02T08:00:00Z',
  },
  {
    id: 'NOTIF-006',
    type: 'system',
    title: 'System maintenance scheduled',
    body: 'Scheduled maintenance will occur on March 15, 2024 from 2:00 AM to 4:00 AM UTC.',
    severity: 'info',
    channels: ['email'],
    timestamp: '2024-02-10T12:00:00Z',
    readAt: '2024-02-10T12:30:00Z',
  },
]

export function activitiesToNotifications(activities: Activity[]): Notification[] {
  return activities.map((activity) => {
    const severityMap: Record<string, NotificationSeverity> = {
      'LIVE AUCTION': 'critical',
      'ORDER SETTLED': 'success',
      'LOAN PENDING': 'warning',
    }

    const channelMap: Record<string, NotificationChannel[]> = {
      'LIVE AUCTION': ['email', 'push'],
      'ORDER SETTLED': ['email', 'push'],
      'LOAN PENDING': ['email'],
    }

    return {
      id: `NOTIF-${activity.id}`,
      type: activity.type,
      title: activity.title,
      body: activity.title,
      severity: severityMap[activity.status] || 'info',
      channels: channelMap[activity.status] || ['push'],
      entityRef: activity.metadata?.entityRef,
      timestamp: activity.timestamp,
    }
  })
}

