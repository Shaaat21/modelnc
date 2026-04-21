import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './index.css'
import CheckoutCancel from './pages/CheckoutCancel'
import CheckoutSuccess from './pages/CheckoutSuccess'
import MainDisplay from './pages/MainDisplay'
import ProductPage from './pages/ProductPage'
import ProductRoute from './pages/ProductRoute'
import { catalogProducts } from './productCatalog'

const legacyProductRoutes = catalogProducts.map((product) => ({
  path: product.legacyRoute.replace('/', ''),
  element: <ProductPage product={product} />,
}))

const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
    },
    {
      path: 'maindisplay',
      element: <MainDisplay />,
    },
    {
      path: 'products/:slug',
      element: <ProductRoute />,
    },
    {
      path: 'checkout/success',
      element: <CheckoutSuccess />,
    },
    {
      path: 'checkout/cancel',
      element: <CheckoutCancel />,
    },
    ...legacyProductRoutes,
  ],
  { basename },
)

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
