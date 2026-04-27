import { useState } from "react";
import toast from "react-hot-toast";
import { getApiError } from "../../lib/api/client.js";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useApplyCoupon, useCreateCheckout, useSubscriptionStatus, useVerifyPayment } from "./useSubscription.js";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function SubscriptionPage() {
  const user = useAuthStore((state) => state.user);
  const [coupon, setCoupon] = useState("");
  const status = useSubscriptionStatus();
  const applyCoupon = useApplyCoupon();
  const checkout = useCreateCheckout();
  const verifyPayment = useVerifyPayment();

  const subscription = status.data;
  const isActive = subscription?.status === "active";

  async function handleCoupon() {
    try {
      const result = await applyCoupon.mutateAsync(coupon);
      toast.success(result.message);
      setCoupon("");
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  async function handleCheckout() {
    try {
      const session = await checkout.mutateAsync();

      if (session.isMock) {
        await verifyPayment.mutateAsync({
          razorpay_payment_id: "dev_mock_payment",
          razorpay_subscription_id: session.subscriptionId,
          razorpay_signature: "dev_mock_signature",
        });
        toast.success("Development payment activated");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Payment window could not load. Please try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: session.keyId,
        subscription_id: session.subscriptionId,
        name: "SimpleStack",
        description: "SimpleStack monthly plan",
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: "#63b3ed" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          await verifyPayment.mutateAsync(response);
          toast.success("Subscription activated");
        },
      });

      razorpay.open();
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Billing</div>
          <div className="page-subtitle">Keep SimpleStack active for your projects.</div>
        </div>
      </div>

      <div className="billing-hero panel-glass stack">
        <div className="badge badge-blue">₹100/month</div>
        <h1 className="billing-title">One simple plan. Everything included.</h1>
        <p className="muted">
          Create content, upload media, and connect your website. Your plan includes a 3-day grace period after expiry.
        </p>
        <div className="row">
          <button className="btn btn-primary" disabled={checkout.isPending || verifyPayment.isPending || isActive} onClick={handleCheckout}>
            {isActive ? "Plan active" : checkout.isPending ? "Starting..." : "Start ₹100/month"}
          </button>
          <span className={`badge ${isActive ? "badge-green" : "badge-yellow"}`}>
            {status.isPending ? "Checking..." : `${subscription?.status ?? "inactive"} · ${subscription?.plan ?? "none"}`}
          </span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel stack">
          <div className="section-title">Have a coupon?</div>
          <div className="field">
            <label className="field-label">Coupon code</label>
            <input
              className="field-input"
              placeholder="SANSKARDEEP"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value.toUpperCase())}
            />
          </div>
          <button className="btn btn-secondary" disabled={!coupon || applyCoupon.isPending} onClick={handleCoupon}>
            {applyCoupon.isPending ? "Applying..." : "Apply coupon"}
          </button>
          {subscription?.plan === "coupon" && (
            <div className="alert alert-success">This plan is now free for you.</div>
          )}
        </div>

        <div className="panel stack">
          <div className="section-title">Current plan</div>
          <div className="stack-sm">
            <div className="row"><span className="muted">Status</span><span className="badge badge-blue">{subscription?.status ?? "inactive"}</span></div>
            <div className="row"><span className="muted">Plan</span><strong>{subscription?.plan ?? "none"}</strong></div>
            <div className="row"><span className="muted">Expiry</span><strong>{subscription?.expiry ? new Date(subscription.expiry).toLocaleDateString("en-IN") : "Never"}</strong></div>
            <div className="row"><span className="muted">Grace period</span><strong>{subscription?.graceDays ?? 3} days</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
