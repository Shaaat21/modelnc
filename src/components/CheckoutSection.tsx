import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from '../lib/format'
import { isSupabaseConfigured, supabase } from '../utils/supabase'
import type { ProductRow } from '../types'

type CheckoutSectionProps = {
  productSlug: string
}

type CheckoutSessionResponse = {
  sessionId: string
  sessionUrl: string
}

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

function CheckoutSection({ productSlug }: CheckoutSectionProps) {
  const [product, setProduct] = useState<ProductRow | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const formattedTotal = useMemo(() => {
    if (!product) {
      return ''
    }

    return formatMoney(product.unit_amount * quantity, product.currency)
  }, [product, quantity])

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setIsLoadingProduct(true)
      setErrorMessage('')

      if (!isSupabaseConfigured || !supabase) {
        setErrorMessage('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
        setIsLoadingProduct(false)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, description, currency, unit_amount, active, image_url, stripe_price_id, created_at, updated_at')
        .eq('slug', productSlug)
        .eq('active', true)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error.message)
        setProduct(null)
      } else if (!data) {
        setErrorMessage('This product is not available.')
        setProduct(null)
      } else {
        setProduct(data)
      }

      setIsLoadingProduct(false)
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productSlug])

  async function handleCheckout() {
    if (isSubmitting) {
      return
    }

    setErrorMessage('')

    if (!stripePublishableKey) {
      setErrorMessage('Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY.')
      return
    }

    if (!supabase) {
      setErrorMessage('Supabase is not configured.')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.functions.invoke<CheckoutSessionResponse>('create-checkout-session', {
        body: {
          productSlug,
          quantity,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data?.sessionId || !data.sessionUrl) {
        throw new Error('Checkout session was not returned.')
      }

      window.location.assign(data.sessionUrl)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Checkout failed.')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="Checkout_section" aria-live="polite">
      <div>
        <p className="checkout_label">Secure Checkout</p>
        <h2>{product?.name ?? 'Checkout'}</h2>
        {isLoadingProduct ? (
          <p className="checkout_status">Loading product...</p>
        ) : product ? (
          <p className="checkout_status">{formattedTotal}</p>
        ) : (
          <p className="checkout_status">Unavailable</p>
        )}
      </div>

      <label className="quantity_control">
        <span>Qty</span>
        <input
          min="1"
          max="10"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
          disabled={isSubmitting}
        />
      </label>

      <button
        type="button"
        className="cart_button"
        onClick={handleCheckout}
        disabled={!product || isLoadingProduct || isSubmitting}
      >
        {isSubmitting ? 'Opening Stripe...' : 'Buy with Stripe'}
      </button>

      <p className="wallet_note">Apple Pay appears in Stripe Checkout when it is available.</p>

      {errorMessage ? <p className="checkout_error">{errorMessage}</p> : null}
    </section>
  )
}

export default CheckoutSection
