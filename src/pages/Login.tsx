import { useState } from "react";
import { useNavigate } from "react-router-dom";

const KEY = "rg_theater_user_email";

function setLoggedIn(email: string) {
  localStorage.setItem(KEY, email);
}

function getLoggedInEmail(): string | null {
  return localStorage.getItem(KEY);
}

function logout() {
  localStorage.removeItem(KEY);
}

export default function Login() {
  const nav = useNavigate();
  const existing = getLoggedInEmail();

  const [email, setEmail] = useState(existing ?? "");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo login: accept any email + password
    if (!email.trim()) {
      alert("Enter email");
      return;
    }
    if (!password.trim()) {
      alert("Enter password");
      return;
    }

    setLoggedIn(email.trim());
    alert("✅ Logged in (DEMO)");
    nav("/");
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    alert("Logged out");
    nav("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold">Login</h1>
        <p className="mt-2 text-white/70 text-sm">
          Demo login for RG Theater (real auth will be added later).
        </p>

        {existing && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
            Logged in as: <span className="text-white font-semibold">{existing}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input
              className="mt-1 w-full p-3 rounded-lg bg-black border border-white/10 outline-none"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Password</label>
            <input
              className="mt-1 w-full p-3 rounded-lg bg-black border border-white/10 outline-none"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold">
            Login (Demo)
          </button>

          <button
            type="button"
            onClick={() => alert("Google login will be added later with Supabase")}
            className="w-full bg-white/10 hover:bg-white/15 py-3 rounded-lg font-semibold"
          >
            Continue with Google
          </button>

          {existing && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-white/70 hover:text-white underline py-2"
            >
              Logout
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
