import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import bg from '../mainbg3.mp4'
import { catalogProducts } from '../productCatalog'

function MainDisplay() {
  return (
    <>
      <video src={bg} autoPlay loop muted playsInline className="background-video" />
      <SiteNav />
      <Link className="back_link" to="/">
        Go Back
      </Link>

      <main className="page_items">
        {catalogProducts.map((product) => (
          <section className="item" key={product.slug}>
            <h2>{product.collectionLabel}</h2>
            <article>
              <Link to={product.route}>
                <img src={product.image} alt={product.title} />
              </Link>
              <p>{product.title}</p>
              <p>Stripe checkout</p>
            </article>
          </section>
        ))}
      </main>

      <footer>
        <p>&copy; 2026 Company Name. All rights reserved dresites.</p>
      </footer>
    </>
  )
}

export default MainDisplay
