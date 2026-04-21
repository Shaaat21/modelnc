import Stripe from 'npm:stripe@18.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

function requiredEnv(name: string) {
  const value = Deno.env.get(name)

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function getPaymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null) {
  if (!paymentIntent) {
    return null
  }

  return typeof paymentIntent === 'string' ? paymentIntent : paymentIntent.id
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  try {
    const stripe = new Stripe(requiredEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-02-25.clover',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return jsonResponse({ error: 'Missing Stripe signature.' }, 400)
    }

    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(body, signature, requiredEnv('STRIPE_WEBHOOK_SECRET'))

    const supabaseAdmin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id ?? session.client_reference_id

      if (!orderId) {
        return jsonResponse({ received: true, warning: 'No order id on session.' })
      }

      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          checkout_session_id: session.id,
          payment_intent_id: getPaymentIntentId(session.payment_intent),
          customer_email: session.customer_details?.email ?? null,
          paid_at: new Date().toISOString(),
          metadata: {
            stripe_event_id: event.id,
            stripe_payment_status: session.payment_status,
          },
        })
        .eq('id', orderId)

      if (error) {
        return jsonResponse({ error: 'Could not update order.' }, 500)
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.order_id

      if (orderId) {
        const { error } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            payment_intent_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
            metadata: {
              stripe_event_id: event.id,
            },
          })
          .eq('id', orderId)

        if (error) {
          return jsonResponse({ error: 'Could not update order.' }, 500)
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id ?? session.client_reference_id

      if (orderId) {
        await supabaseAdmin.from('orders').update({ status: 'canceled' }).eq('id', orderId).eq('status', 'pending')
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.order_id

      if (orderId) {
        await supabaseAdmin.from('orders').update({ status: 'failed' }).eq('id', orderId).eq('status', 'pending')
      }
    }

    return jsonResponse({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook failed.'
    return jsonResponse({ error: message }, 400)
  }
})
