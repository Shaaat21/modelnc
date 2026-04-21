import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'

function CheckoutCancel() {
  return (
    <>
      <SiteNav />
      <main className="checkout_result">
        <p className="checkout_label">Checkout Canceled</p>
        <h1>No payment was completed.</h1>
        <p>Your cart was not charged. You can return to the shop and start a new secure checkout.</p>
        <Link to="/maindisplay">Return to shop</Link>
      </main>
    </>
  )
}

export default CheckoutCancel
