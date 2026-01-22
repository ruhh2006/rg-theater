import { useNavigate } from "react-router-dom";
import { subscribe, unsubscribe, isSubscribed } from "../lib/subscription";

export default function Pricing() {
  const nav = useNavigate();
  const subscribed = isSubscribed();

  const handleSubscribe = () => {
    subscribe();
    alert("✅ Subscription activated (DEMO). Premium unlocked!");
    nav("/");
    window.location.reload();
  };

  const handleReset = () => {
    unsubscribe();
    alert("✅ Subscription removed (DEMO). Premium locked again.");
    nav("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Pricing</h1>
      <p className="mt-2 text-white/70">
        Demo mode: Subscribe unlocks premium on this device.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-3xl">
        <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
          <h2 className="text-xl font-semibold">Monthly</h2>
          <p className="text-4xl font-extrabold mt-2">₹50</p>
          <ul className="mt-4 space-y-2 text-white/70 text-sm">
            <li>• Premium content access</li>
            <li>• 1080p / 4K (where available)</li>
            <li>• Ad-free experience</li>
          </ul>
          <button
            onClick={handleSubscribe}
            className="mt-6 w-full bg-red-600 hover:bg-red-500 py-3 rounded font-semibold"
          >
            Subscribe (Demo)
          </button>
        </div>

        <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
          <h2 className="text-xl font-semibold">Yearly</h2>
          <p className="text-4xl font-extrabold mt-2">₹499</p>
          <ul className="mt-4 space-y-2 text-white/70 text-sm">
            <li>• Best value plan</li>
            <li>• Premium content access</li>
            <li>• 1080p / 4K (where available)</li>
          </ul>
          <button
            onClick={handleSubscribe}
            className="mt-6 w-full bg-white/10 hover:bg-white/15 py-3 rounded font-semibold"
          >
            Subscribe (Demo)
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-3xl flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-white/70">
          Status:{" "}
          {subscribed ? (
            <span className="text-green-400 font-semibold">Subscribed</span>
          ) : (
            <span className="text-yellow-400 font-semibold">Not subscribed</span>
          )}
        </div>

        <button
          onClick={handleReset}
          className="text-sm text-white/70 hover:text-white underline"
        >
          Reset subscription (Demo)
        </button>
      </div>
    </div>
  );
}
