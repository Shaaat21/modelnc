import { Link, useSearchParams } from 'react-router-dom'
import SiteNav from '../components/SiteNav'

function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <>
      <SiteNav />
      <main className="checkout_result">
        <p className="checkout_label">Order Received</p>
        <h1>Payment confirmation is processing.</h1>
        <p>
          Your order is only marked paid after Stripe sends a verified webhook to Supabase. Keep this reference for
          support: {sessionId ?? 'pending'}.
        </p>
        <Link to="/maindisplay">Continue shopping</Link>
      </main>
    </>
  )
}

export default CheckoutSuccess
