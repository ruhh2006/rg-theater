import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      nav("/");
    }
  };

  const signUp = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert("Account created! You can now log in.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-white/10 bg-white/5 rounded-2xl p-6">
        <h1 className="text-3xl font-extrabold mb-6">Login</h1>

        {error && (
          <div className="mb-4 text-sm text-red-400">{error}</div>
        )}

        <input
          className="w-full mb-3 bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold mb-3"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-lg font-semibold"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
