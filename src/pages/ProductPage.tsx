import { Link } from 'react-router-dom'
import CheckoutSection from '../components/CheckoutSection'
import SiteNav from '../components/SiteNav'
import type { CatalogProduct } from '../productCatalog'

type ProductPageProps = {
  product: CatalogProduct
}

function ProductPage({ product }: ProductPageProps) {
  return (
    <>
      <SiteNav />
      <main className="model_video_page product_page">
        <section className="model_video">
          <h2>{product.collectionLabel}</h2>
          {product.video ? (
            <video autoPlay preload="metadata" playsInline loop muted className="model-video" poster={product.image}>
              <source src={product.video} type="video/mp4" />
            </video>
          ) : (
            <img className="model-photo" src={product.image} alt={product.title} />
          )}
        </section>

        <section className="outfit_display">
          <h2>{product.title}</h2>
          <article>
            <p>Limited studio piece</p>
            <p>
              Pricing is loaded from Supabase and verified again inside the checkout Edge Function before Stripe is
              created.
            </p>
            <Link to="/maindisplay">Back to shop</Link>
          </article>
        </section>

        <CheckoutSection productSlug={product.slug} />
      </main>

      <footer>
        <p>&copy; 2026 Company Name. All rights reserved dresites.</p>
      </footer>
    </>
  )
}

export default ProductPage
