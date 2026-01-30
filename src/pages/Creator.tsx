import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isCreator } from "../lib/roles";
import { fetchMyUploads, type DbContentRow } from "../lib/contentApi";

function badgeClass(status: DbContentRow["status"]) {
  if (status === "approved") return "bg-green-500/20 text-green-300 border-green-500/20";
  if (status === "pending") return "bg-yellow-500/20 text-yellow-300 border-yellow-500/20";
  return "bg-red-500/20 text-red-300 border-red-500/20";
}

function badgeLabel(status: DbContentRow["status"]) {
  if (status === "approved") return "APPROVED";
  if (status === "pending") return "PENDING";
  return "REJECTED";
}

function StatusBadge({ status }: { status: DbContentRow["status"] }) {
  return (
    <span className={"text-[11px] px-2 py-1 rounded border " + badgeClass(status)}>
      {badgeLabel(status)}
    </span>
  );
}

export default function Creator() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<DbContentRow[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const rows = await fetchMyUploads();
      setUploads(rows);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load uploads");
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isCreator().then((ok) => {
      setAllowed(ok);
      if (ok) load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking creator access...
      </div>
    );
  }

  if (!allowed) return <Navigate to="/" replace />;

  const pending = uploads.filter((x) => x.status === "pending").length;
  const approved = uploads.filter((x) => x.status === "approved").length;
  const rejected = uploads.filter((x) => x.status === "rejected").length;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold">Creator Dashboard</h1>
          <p className="mt-2 text-white/70">
            Upload your web series, short films, or creator videos. Admin approval required.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link
            to="/creator/profile"
            className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg font-semibold"
          >
            Edit Profile
          </Link>
          <Link
            to="/creator/upload"
            className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold"
          >
            Upload Content
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Pending</div>
          <div className="text-2xl font-extrabold text-yellow-300">{pending}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Approved</div>
          <div className="text-2xl font-extrabold text-green-300">{approved}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Rejected</div>
          <div className="text-2xl font-extrabold text-red-300">{rejected}</div>
        </div>
      </div>

      {/* Uploads list */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-bold">My Uploads</h2>
          <button
            onClick={load}
            className="text-sm bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {err && <div className="mt-4 text-sm text-red-300">❌ {err}</div>}

        {loading ? (
          <div className="mt-6 text-white/70">Loading your uploads...</div>
        ) : uploads.length === 0 ? (
          <div className="mt-6 text-white/70">
            No uploads yet. Click <b>Upload Content</b> to submit your first video.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {uploads.map((x) => (
              <div
                key={x.id}
                className="flex items-center justify-between gap-4 border border-white/10 rounded-xl bg-black/30 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black">
                    <img
                      src={x.thumbnail || "/posters/poster1.jpg"}
                      alt={x.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="font-semibold">{x.title}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {x.type.toUpperCase()} • {x.language} • {x.year} • {x.quality} •{" "}
                      {x.is_free ? "FREE" : "PREMIUM"}
                    </div>

                    {x.status === "rejected" && (
                      <div className="mt-2 text-xs text-red-300">
                        Rejected —{" "}
                        {x.rejection_reason ? `Reason: ${x.rejection_reason}` : "No reason given."}
                      </div>
                    )}

                    {x.status === "pending" && (
                      <div className="mt-2 text-xs text-yellow-300">
                        Pending — admin review in progress.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {x.status === "rejected" && (
                    <Link
                      to={`/creator/resubmit/${x.id}`}
                      className="text-sm bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg"
                    >
                      Edit & Resubmit
                    </Link>
                  )}
                  <StatusBadge status={x.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
