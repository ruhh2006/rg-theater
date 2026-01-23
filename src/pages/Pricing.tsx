import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getMySubscription, isSubscriptionActive } from "../lib/subscriptionDb";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Pricing() {
  const nav = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<string>("Checking...");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);

    if (!data.user) {
      setStatus("Not logged in");
      return;
    }

    const sub = await getMySubscription();
    setStatus(isSubscriptionActive(sub) ? `Active (${sub?.plan})` : "Not active");
  };

  useEffect(() => {
    refresh();
  }, []);

  const pay = async (plan: "monthly" | "yearly") => {
    if (!user) {
      alert("Please login first.");
      nav("/login");
      return;
    }

    setBusy(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay SDK failed to load");

      // Create order (Netlify Function)
      const orderRes = await fetch("/.netlify/functions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const payload = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(payload?.error ? JSON.stringify(payload.error) : "Order error");
      }

      const { order, keyId } = payload;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RG Theater",
        description: plan === "monthly" ? "Monthly Subscription" : "Yearly Subscription",
        order_id: order.id,
        handler: async (response: any) => {
          // Verify payment + activate subscription (Netlify Function)
          const verifyRes = await fetch("/.netlify/functions/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan,
              userId: user.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const out = await verifyRes.json();
          if (!verifyRes.ok) {
            alert("Payment verification failed: " + (out.error || "unknown"));
            return;
          }

          alert("✅ Payment success! Subscription activated.");
          await refresh();
        },
        theme: { color: "#ef4444" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert("❌ " + (e.message || "Payment failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Pricing</h1>
      <p className="mt-2 text-white/70">
        Razorpay Test payment → activates Supabase subscription.
      </p>

      <div className="mt-4 text-sm text-white/70">
        Login:{" "}
        {user?.email ? (
          <span className="text-white font-semibold">{user.email}</span>
        ) : (
          <span className="text-yellow-300">Not logged in</span>
        )}
      </div>

      <div className="mt-2 text-sm text-white/70">
        Subscription: <span className="text-white">{status}</span>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-3xl">
        <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
          <h2 className="text-xl font-semibold">Monthly</h2>
          <p className="text-4xl font-extrabold mt-2">₹50</p>
          <ul className="mt-4 space-y-2 text-white/70 text-sm">
            <li>• Premium content access</li>
            <li>• 1080p / 4K (where available)</li>
          </ul>
          <button
            disabled={busy}
            onClick={() => pay("monthly")}
            className="mt-6 w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {busy ? "Please wait..." : "Pay ₹50 (Test)"}
          </button>
        </div>

        <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
          <h2 className="text-xl font-semibold">Yearly</h2>
          <p className="text-4xl font-extrabold mt-2">₹499</p>
          <ul className="mt-4 space-y-2 text-white/70 text-sm">
            <li>• Best value</li>
            <li>• Premium content access</li>
          </ul>
          <button
            disabled={busy}
            onClick={() => pay("yearly")}
            className="mt-6 w-full bg-white/10 hover:bg-white/15 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {busy ? "Please wait..." : "Pay ₹499 (Test)"}
          </button>
        </div>
      </div>
    </div>
  );
}

