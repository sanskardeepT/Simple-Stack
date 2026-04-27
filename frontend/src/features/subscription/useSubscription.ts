import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyCouponApi, createCheckoutApi, subscriptionStatusApi, verifyPaymentApi, type SubscriptionStatus } from "../../lib/api/subscription.api.js";

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ["subscription", "status"],
    queryFn: async () => {
      const response = await subscriptionStatusApi();
      return response.data.data as SubscriptionStatus;
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await applyCouponApi(code);
      return response.data.data as { subscription: SubscriptionStatus; message: string };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription", "status"] });
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async () => {
      const response = await createCheckoutApi();
      return response.data.data as {
        keyId: string;
        subscriptionId: string;
        amount: number;
        currency: "INR";
        isMock: boolean;
      };
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => {
      const response = await verifyPaymentApi(payload);
      return response.data.data as { subscription: SubscriptionStatus };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription", "status"] });
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
