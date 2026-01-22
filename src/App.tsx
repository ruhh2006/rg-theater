import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Anime from "./pages/Anime";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Watch from "./pages/Watch";

import { isSubscribed } from "./lib/subscription";
import { getUserEmail, logoutUser } from "./lib/session";

export default function App() {
  const subscribed = isSubscribed();
  const email = getUserEmail();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        {/* NAVBAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <Link to="/" className="text-2xl font-extrabold text-red-600 no-underline">
            RG Theater
          </Link>

          <div className="flex items-center gap-6 text-sm text-white/80">
            <Link to="/" className="no-underline hover:text-white">Home</Link>
            <Link to="/movies" className="no-underline hover:text-white">Movies</Link>
            <Link to="/series" className="no-underline hover:text-white">Series</Link>
            <Link to="/anime" className="no-underline hover:text-white">Anime</Link>
            <Link to="/pricing" className="no-underline hover:text-white">Pricing</Link>

            {/* Subscription badge */}
            <span
              className={
                subscribed
                  ? "text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/20"
                  : "text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"
              }
            >
              {subscribed ? "Subscribed" : "Not Subscribed"}
            </span>

            {/* Login / Logout */}
            {email ? (
              <button
                onClick={() => {
                  logoutUser();
                  window.location.reload();
                }}
                className="text-white/70 hover:text-white underline"
                title={email}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="no-underline hover:text-white">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


