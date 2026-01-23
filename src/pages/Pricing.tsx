import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  activateMySubscription,
  cancelMySubscription,
  getMySubscription,
  isSubscriptionActive,
  type Plan,
} from "../lib/subscriptionDb";

export default function Pricing() {
  const nav = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    { active: boolean; plan?: Plan; expiresAt?: string } | null
  >(null);

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email ?? null);

    if (!data.user) {
      setStatus(null);
      return;
    }

    const sub = await getMySubscription();
    setStatus(
      sub
        ? { active: isSubscriptionActive(sub), plan: sub.plan, expiresAt: sub.expires_at }
        : { active: false }
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  const subscribe = async (plan: Plan) => {
    if (!userEmail) {
      alert("Please login first.");
      nav("/login");
      return;
    }

    setLoading(true);
    try {
      await activateMySubscription(plan);
      alert("✅ Subscription activated (DB demo).");
      await refresh();
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Failed"));
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!userEmail) {
      alert("Please login first.");
      nav("/login");
      return;
    }

    setLoading(true);
    try {
      await cancelMySubscription();
      alert("✅ Subscription cancelled (DB demo).");
      await refresh();
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Pricing</h1>
      <p className="mt-2 text-white/70">
        This is DB demo mode. Next step we connect Razorpay to activate subscription.
      </p>

      <div className="mt-4 text-sm text-white/70">
        Login:{" "}
        {userEmail ? (
          <span className="text-white font-semibold">{userEmail}</span>
        ) : (
          <span className="text-yellow-300">Not logged in</span>
        )}
      </div>

      <div className="mt-2 text-sm text-white/70">
        Status:{" "}
        {status?.active ? (
          <span className="text-green-300 font-semibold">
            Active ({status.plan}) — expires {status.expiresAt?.slice(0, 10)}
          </span>
        ) : (
          <span className="text-yellow-300 font-semibold">Not active</span>
        )}
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
            disabled={loading}
            onClick={() => subscribe("monthly")}
            className="mt-6 w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Subscribe (DB Demo)"}
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
            disabled={loading}
            onClick={() => subscribe("yearly")}
            className="mt-6 w-full bg-white/10 hover:bg-white/15 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Subscribe (DB Demo)"}
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <button
          disabled={loading}
          onClick={cancel}
          className="text-sm text-white/70 hover:text-white underline disabled:opacity-50"
        >
          Cancel subscription (DB Demo)
        </button>
      </div>
    </div>
  );
}
