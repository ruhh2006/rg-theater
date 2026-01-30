import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { isAdmin, isCreator, getMyRole, type Role } from "./lib/roles";

/* Pages */
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Anime from "./pages/Anime";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Watch from "./pages/Watch";
import Search from "./pages/Search";

/* Creator system pages */
import ApplyCreator from "./pages/ApplyCreator";
import Creator from "./pages/Creator";
import CreatorUpload from "./pages/CreatorUpload";
import Creators from "./pages/Creators";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorProfilePublic from "./pages/CreatorProfilePublic";

/* Admin pages */
import Admin from "./pages/Admin";
import Approvals from "./pages/Approvals";
import AdminCreators from "./pages/AdminCreators";
import AdminReports from "./pages/AdminReports";

/* Legal */
import Legal from "./pages/Legal";

/* Components */
import NavSearch from "./components/NavSearch";

/* Protect admin routes */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    isAdmin().then(setAllowed).catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking admin access...
      </div>
    );
  }
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/* Protect creator routes */
function CreatorGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    isCreator().then(setAllowed).catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking creator access...
      </div>
    );
  }
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>("user");
  const [booting, setBooting] = useState(true);

  const refreshRole = async () => {
    try {
      const r = await getMyRole();
      setRole(r);
    } catch {
      setRole("user");
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        const u = data.session?.user ?? null;
        setUser(u);
        setBooting(false);

        if (u) refreshRole();
        else setRole("user");
      } catch {
        if (cancelled) return;
        setUser(null);
        setRole("user");
        setBooting(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) refreshRole();
      else setRole("user");
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const showApplyCreator = !user || (role !== "creator" && role !== "admin");

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        {/* NAVBAR */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 gap-4 flex-wrap">
          <Link
            to="/"
            className="text-2xl font-extrabold text-red-600 no-underline whitespace-nowrap"
          >
            RG Theater
          </Link>

          <nav className="flex items-center gap-4 md:gap-6 text-sm text-white/80 flex-wrap">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/movies" className="hover:text-white">Movies</Link>
            <Link to="/series" className="hover:text-white">Series</Link>
            <Link to="/anime" className="hover:text-white">Anime</Link>

            <Link to="/creators" className="hover:text-white">Creators</Link>

            {showApplyCreator && (
              <Link to="/apply-creator" className="hover:text-white">
                Apply as Creator
              </Link>
            )}

            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/legal" className="hover:text-white">Legal</Link>

            {/* Logged-in only links */}
            {user && (
              <>
                <Link to="/creator" className="hover:text-white">Creator</Link>
                <Link to="/creator/profile" className="hover:text-white">Profile</Link>

                {/* Admin menu (shows only if admin by guard anyway, but link is ok) */}
                <Link to="/admin" className="hover:text-white">Admin</Link>
                <Link to="/approvals" className="hover:text-white">Approvals</Link>
                <Link to="/creator-apps" className="hover:text-white">Creator Apps</Link>
                <Link to="/reports" className="hover:text-white">Reports</Link>
              </>
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
              <Link to="/login" className="hover:text-white">Login</Link>
            )}
          </nav>
        </header>

        {/* ROUTES */}
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/search" element={<Search />} />

          {/* Public Creator pages */}
          <Route path="/creators" element={<Creators />} />
          <Route path="/c/:id" element={<CreatorProfilePublic />} />

          {/* Apply as creator */}
          <Route path="/apply-creator" element={<ApplyCreator />} />

          {/* Creator private */}
          <Route
            path="/creator"
            element={
              user ? (
                <CreatorGuard>
                  <Creator />
                </CreatorGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/creator/upload"
            element={
              user ? (
                <CreatorGuard>
                  <CreatorUpload />
                </CreatorGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/creator/profile"
            element={
              user ? (
                <CreatorGuard>
                  <CreatorProfile />
                </CreatorGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin */}
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
          <Route
            path="/approvals"
            element={
              user ? (
                <AdminGuard>
                  <Approvals />
                </AdminGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/creator-apps"
            element={
              user ? (
                <AdminGuard>
                  <AdminCreators />
                </AdminGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/reports"
            element={
              user ? (
                <AdminGuard>
                  <AdminReports />
                </AdminGuard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

