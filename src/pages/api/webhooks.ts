import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

const CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed';
// const CUSTOMER_SUBSCRIPTIONS_CREATED = 'customer.subscription.created';
const CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated';
const CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted';

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk 
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  CHECKOUT_SESSION_COMPLETED,
  // CUSTUMER_SUBSCRIPTIONS_CREATED,
  CUSTOMER_SUBSCRIPTION_UPDATED,
  CUSTOMER_SUBSCRIPTION_DELETED,
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') {
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOKS_SECRET);
    } catch (error) {
      return res.status(400).send(`Webhooks error: ${error.message}`);
    }

    const { type } = event;

    if(relevantEvents.has(type)){
      try {
        
        switch (type) {
          // case CUSTUMER_SUBSCRIPTIONS_CREATED:
          case CUSTOMER_SUBSCRIPTION_UPDATED:
          case CUSTOMER_SUBSCRIPTION_DELETED:
            const subscription = event.data.object as Stripe.Subscription;
            
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );

          break;
          case CHECKOUT_SESSION_COMPLETED:
            const checkoutSession = event.data.object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );

            break;
          default:
            throw new Error("Unhandled event.");
        }
      } catch (err) {
        //warning per sentry or bugsnag
        return res.json({ error: 'Webhook handler failed.' });  
      }
    }

    res.status(200).json({received: true});
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}