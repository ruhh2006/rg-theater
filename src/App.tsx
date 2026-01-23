import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "./lib/supabase";

/* Pages */
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Anime from "./pages/Anime";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import Admin from "./pages/Admin";

/* Components */
import NavSearch from "./components/NavSearch";

/* Admin role check */
import { isAdmin } from "./lib/admin";

/* Protect admin route */
function AdminGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    isAdmin().then(setAllowed);
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking permissions...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        {/* NAVBAR */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 gap-4">
          <Link
            to="/"
            className="text-2xl font-extrabold text-red-600 no-underline whitespace-nowrap"
          >
            RG Theater
          </Link>

          <nav className="flex items-center gap-4 md:gap-6 text-sm text-white/80 flex-wrap">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/movies" className="hover:text-white">
              Movies
            </Link>
            <Link to="/series" className="hover:text-white">
              Series
            </Link>
            <Link to="/anime" className="hover:text-white">
              Anime
            </Link>
            <Link to="/pricing" className="hover:text-white">
              Pricing
            </Link>

            {user && (
              <Link to="/admin" className="hover:text-white">
                Admin
              </Link>
            )}

            <NavSearch />

            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
                className="text-white/70 hover:text-white underline"
                title={user.email ?? ""}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="hover:text-white">
                Login
              </Link>
            )}
          </nav>
        </header>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/search" element={<Search />} />

          {/* ADMIN (ROLE PROTECTED) */}
          <Route
            path="/admin"
            element={
              user ? (
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}




