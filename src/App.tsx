import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AuctionPage from './pages/Auction'
import MyOrders from './pages/MyOrders'
import Loans from './pages/Loans'
import Analytics from './pages/Analytics'
import MyAccount from './pages/MyAccount'
import { NotificationProvider } from './context/NotificationContext'
import { AuctionDataProvider } from './context/AuctionDataContext'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuctionDataProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auction" element={<AuctionPage />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/account" element={<MyAccount />} />
            </Routes>
          </Layout>
        </AuctionDataProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App

