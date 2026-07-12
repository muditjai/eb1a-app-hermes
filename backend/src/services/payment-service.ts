import Stripe from "stripe";

export interface CheckoutInput {
  userToken: string;
  petitionId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export function createPaymentService(options: { mode?: "mock" | "stripe"; stripeSecretKey?: string; priceId?: string }) {
  const mode = options.mode ?? (options.stripeSecretKey ? "stripe" : "mock");
  const stripe = options.stripeSecretKey ? new Stripe(options.stripeSecretKey) : null;

  return {
    async createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
      if (mode === "mock" || !stripe) {
        return {
          id: `cs_mock_${input.petitionId}`,
          url: `https://stripe.mock/checkout/${input.petitionId}?user=${encodeURIComponent(input.userToken)}`
        };
      }

      if (!options.priceId) {
        throw new Error("STRIPE_PRICE_ID is required when Stripe mode is enabled");
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: options.priceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          userToken: input.userToken,
          petitionId: input.petitionId
        }
      });

      return { id: session.id, url: session.url ?? input.successUrl };
    }
  };
}
