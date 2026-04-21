import Stripe from 'npm:stripe@18.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts'

type CheckoutRequest = {
  productSlug?: unknown
  quantity?: unknown
}

type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  currency: string
  unit_amount: number
  stripe_price_id: string | null
}

const checkoutSlugPattern = /^[a-z0-9][a-z0-9-]{1,80}$/

function requiredEnv(name: string) {
  const value = Deno.env.get(name)

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

function validateRequest(payload: CheckoutRequest) {
  const productSlug = typeof payload.productSlug === 'string' ? payload.productSlug.trim() : ''
  const quantity = Number(payload.quantity ?? 1)

  if (!checkoutSlugPattern.test(productSlug)) {
    throw new Error('Invalid product.')
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error('Invalid quantity.')
  }

  return { productSlug, quantity }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed.', 405)
  }

  try {
    const stripe = new Stripe(requiredEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-02-25.clover',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseUrl = requiredEnv('SUPABASE_URL')
    const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    const siteUrl = requiredEnv('SITE_URL').replace(/\/$/, '')

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const body = (await req.json().catch(() => null)) as CheckoutRequest | null

    if (!body) {
      return errorResponse('Invalid JSON payload.', 400)
    }

    const { productSlug, quantity } = validateRequest(body)

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, slug, name, description, currency, unit_amount, stripe_price_id')
      .eq('slug', productSlug)
      .eq('active', true)
      .maybeSingle<Product>()

    if (productError) {
      return errorResponse('Could not load product.', 500)
    }

    if (!product) {
      return errorResponse('Product is not available.', 404)
    }

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const {
      data: { user },
    } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } }

    const amountTotal = product.unit_amount * quantity
    const productSnapshot = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      currency: product.currency,
      unit_amount: product.unit_amount,
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        product_id: product.id,
        quantity,
        currency: product.currency,
        amount_subtotal: amountTotal,
        amount_total: amountTotal,
        status: 'pending',
        product_snapshot: productSnapshot,
        metadata: {},
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return errorResponse('Could not create order.', 500)
    }

    const metadata = {
      order_id: order.id,
      product_id: product.id,
      product_slug: product.slug,
      user_id: user?.id ?? '',
    }

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = product.stripe_price_id
      ? {
          price: product.stripe_price_id,
          quantity,
        }
      : {
          price_data: {
            currency: product.currency,
            unit_amount: product.unit_amount,
            product_data: {
              name: product.name,
              description: product.description ?? undefined,
              metadata: {
                product_id: product.id,
                product_slug: product.slug,
              },
            },
          },
          quantity,
        }

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [lineItem],
        success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout/cancel`,
        client_reference_id: order.id,
        metadata,
        payment_intent_data: {
          metadata,
        },
        automatic_tax: {
          enabled: Deno.env.get('STRIPE_AUTOMATIC_TAX') === 'true',
        },
      },
      {
        idempotencyKey: `checkout-order-${order.id}`,
      },
    )

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        checkout_session_id: session.id,
        metadata: {
          stripe_checkout_session_id: session.id,
        },
      })
      .eq('id', order.id)

    if (updateError) {
      return errorResponse('Could not attach checkout session to order.', 500)
    }

    if (!session.url) {
      return errorResponse('Stripe did not return a checkout URL.', 500)
    }

    return jsonResponse({ sessionId: session.id, sessionUrl: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout session failed.'
    return errorResponse(message, 500)
  }
})
