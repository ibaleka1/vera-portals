import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, email, name } = req.body;
  
  const prices = {
    explorer: process.env.STRIPE_PRICE_EXPLORER,
    regulator: process.env.STRIPE_PRICE_REGULATOR,
    integrator: process.env.STRIPE_PRICE_INTEGRATOR
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: prices[plan],
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.DOMAIN}/portal-${plan}.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/?canceled=true`,
      customer_email: email,
      metadata: {
        plan: plan,
        customerName: name
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message });
  }
}
