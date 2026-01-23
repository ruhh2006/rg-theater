import { useParams, Link, useNavigate } from "react-router-dom";
import { getCatalog } from "../lib/catalogStore";
import { isSubscribed as getSubscribed } from "../lib/subscription";

export default function Watch() {
  const { id } = useParams();
  const nav = useNavigate();

  const catalog = getCatalog();
  const item = catalog.find((x) => x.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Content not found</h1>
        <Link to="/" className="underline text-white/70 hover:text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const isPremium = !item.isFree;
  const subscribed = getSubscribed();
  const canWatch = !isPremium || subscribed;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => nav(-1)} className="text-white/70 hover:text-white">
          ← Back
        </button>

        <div className="text-sm text-white/70">
          {item.language} • {item.year} • {item.quality}
        </div>
      </div>

      <div className="px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">{item.title}</h1>

        <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative">
          <div className="h-[55vh] bg-black">
            {canWatch ? (
              item.videoUrl ? (
                <video className="w-full h-full" controls src={item.videoUrl} />
              ) : (
                <div className="h-full flex items-center justify-center text-white/50">
                  No demo video added yet.
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-white/50">
                Locked
              </div>
            )}
          </div>

          {isPremium && !subscribed && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="max-w-md text-center p-6 rounded-2xl border border-white/10 bg-black/60">
                <div className="text-xl font-bold">🔒 Premium Content</div>
                <p className="mt-2 text-white/70 text-sm">
                  Subscribe to watch this title in 1080p / 4K.
                </p>
                <Link
                  to="/pricing"
                  className="inline-block mt-5 bg-red-600 hover:bg-red-500 px-5 py-3 rounded font-semibold"
                >
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-white/70 text-sm">
          Access:{" "}
          <span className={item.isFree ? "text-green-400" : "text-yellow-400"}>
            {item.isFree ? "FREE" : "PREMIUM"}
          </span>
          {" • "}
          Subscription:{" "}
          {subscribed ? (
            <span className="text-green-400 font-semibold">Active</span>
          ) : (
            <span className="text-yellow-400 font-semibold">Not active</span>
          )}
        </div>
      </div>
    </div>
  );
}


