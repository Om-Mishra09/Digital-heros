import Stripe from 'stripe';

// Initialize Stripe; ensure process.env.STRIPE_SECRET_KEY is populated in your Vercel Environment Variables.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // fallback explicitly or ignore if TS complains
});

export default async function handler(req: any, res: any) {
  // CORS / Methods check
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { priceId, userId } = req.body;

    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing priceId or userId in request body' });
    }

    // Obtain Request Origin dynamically for redirects (Vercel populates this appropriately)
    const origin = req.headers.origin || 'http://localhost:5173';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      // Attach metadata to identify user upon webhook fulfillment event
      client_reference_id: userId,
      metadata: {
        userId,
      },
      // You can enable customer_email if req body passed the user email or retrieve it during webhook.
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT_ERROR]:', error.message);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
