import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const customerId = checkoutSession.metadata?.customerId;

        if (customerId) {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              status: 'ACTIVE',
              stripeCustomerId: checkoutSession.customer as string,
              stripeSubscriptionId: checkoutSession.subscription as string,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const customer = await prisma.customer.findUnique({
          where: { stripeCustomerId },
        });

        if (customer) {
          let status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' = 'ACTIVE';
          if (subscription.status === 'past_due') {
            status = 'PAST_DUE';
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'CANCELLED';
          }

          await prisma.customer.update({
            where: { id: customer.id },
            data: { status },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        await prisma.customer.updateMany({
          where: { stripeCustomerId },
          data: { status: 'CANCELLED' },
        });
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
