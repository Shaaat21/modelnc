import { Navigate, useParams } from 'react-router-dom'
import ProductPage from './ProductPage'
import { getCatalogProduct } from '../productCatalog'

function ProductRoute() {
  const { slug } = useParams()
  const product = getCatalogProduct(slug)

  if (!product) {
    return <Navigate to="/maindisplay" replace />
  }

  return <ProductPage product={product} />
}

export default ProductRoute
