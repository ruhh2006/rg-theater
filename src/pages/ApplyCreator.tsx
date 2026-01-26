import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type AppRow = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  portfolio_url: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
};

export default function ApplyCreator() {
  const nav = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [appRow, setAppRow] = useState<AppRow | null>(null);

  const [fullName, setFullName] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const user = u.user;

    if (!user) {
      setLoading(false);
      setUserId(null);
      setUserEmail(null);
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email ?? null);

    const { data, error } = await supabase
      .from("creator_applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      const row = data as AppRow;
      setAppRow(row);
      setFullName(row.full_name ?? "");
      setPortfolioUrl(row.portfolio_url ?? "");
      setMessage(row.message ?? "");
    } else {
      setAppRow(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (!loading && !userId) {
    return <Navigate to="/login" replace />;
  }

  const submit = async () => {
    if (!userId) return;
    if (!fullName.trim()) return alert("Enter your name");
    if (!portfolioUrl.trim()) return alert("Enter portfolio URL (YouTube/Instagram/Drive)");
    if (!agree) return alert("Please accept the terms");

    try {
      const payload = {
        user_id: userId,
        email: userEmail,
        full_name: fullName.trim(),
        portfolio_url: portfolioUrl.trim(),
        message: message.trim(),
        status: "pending",
        rejection_reason: null,
      };

      // upsert (one per user)
      const { error } = await supabase
        .from("creator_applications")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      alert("✅ Application submitted! Status: Pending review.");
      await load();
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Failed"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const status = appRow?.status ?? "none";

  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold">Apply as Creator</h1>
        <p className="mt-2 text-white/70">
          RG Theater is invite-only for creators. Apply and we’ll review your portfolio.
        </p>

        {/* Status */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <div className="text-white/70">Status:</div>
          {status === "none" && <div className="text-yellow-300 font-semibold">Not applied</div>}
          {status === "pending" && <div className="text-yellow-300 font-semibold">Pending review</div>}
          {status === "approved" && (
            <div className="text-green-300 font-semibold">
              Approved ✅ — You can upload now!
              <div className="mt-2">
                <button
                  onClick={() => nav("/creator")}
                  className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold"
                >
                  Go to Creator Dashboard
                </button>
              </div>
            </div>
          )}
          {status === "rejected" && (
            <div className="text-red-300 font-semibold">
              Rejected ❌
              <div className="mt-2 text-white/70 font-normal">
                Reason: {appRow?.rejection_reason ?? "No reason provided"}
              </div>
              <div className="mt-2 text-white/70 font-normal">
                You can update portfolio/message and submit again.
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <label className="text-xs text-white/60">Full Name</label>
            <input
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Portfolio URL</label>
            <input
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="YouTube / Instagram / Drive link"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Message (optional)</label>
            <textarea
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you create (anime/short films/web series)"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I confirm I will upload only original/licensed content.
          </label>

          <button
            onClick={submit}
            className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold"
          >
            {status === "rejected" ? "Re-Submit Application" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
