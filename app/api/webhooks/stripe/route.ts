import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata?.userId || session.client_reference_id;

      if (userId) {
        const tier = session.mode === "subscription" ? "plus" : "abitur";

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          tier,
          status: "active",
          current_period_end: session.subscription
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        });

        await supabase
          .from("profiles")
          .update({ subscription_tier: tier })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", sub.user_id);

          await supabase
            .from("subscriptions")
            .update({ tier: "free" })
            .eq("stripe_customer_id", customerId);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub) {
        await supabase
          .from("profiles")
          .update({ subscription_tier: "free" })
          .eq("id", sub.user_id);

        await supabase
          .from("subscriptions")
          .update({ status: "canceled", tier: "free" })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
