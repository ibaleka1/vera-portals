import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${session.customer}:${session.metadata.plan}`).toString('base64');
      
      return res.status(200).json({ 
        success: true,
        token: token,
        plan: session.metadata.plan,
        email: session.customer_email
      });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ error: error.message });
  }
}
