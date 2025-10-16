import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { User, ShoppingCart } from "lucide-react";

function AdminNavbar() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activePage, setActivePage] = useState(window.location.pathname);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      setAdmin(user || null)
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const NavButton = ({ to, label }) => (
    <button
      onClick={() => {
        navigate(to);
        setActivePage(to);
      }}
      className={`relative font-medium transition-colors text-white py-1 
        after:content-[''] after:absolute after:left-0 after:-bottom-0.5 
        after:h-0.5 after:bg-red-600 after:w-0 hover:after:w-full 
        hover:after:transition-all after:duration-300 hover:text-red-600
        ${activePage === to ? "after:w-full text-red-600" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-black text-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex gap-2 items-center text-2xl font-bold cursor-pointer"
        onClick={() => {
          navigate("/admin");
          setActivePage("/admin");
        }}
      >
        <img
          src="/logo.jpg"
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover"
        />
        Admin Panel
      </div>

      {/* Navigation links */}
      <div className="flex items-center gap-6 text-lg">
        <NavButton to="/admin" label="Dashboard" />
        <NavButton to="/admin-products" label="Products" />
        <NavButton to="/add-product" label="Add Products" />
        <NavButton to="/admin-orders" label="Orders" /> {/* ✅ Added this */}
        <NavButton label="Users" to="/admin-users" />
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-4 relative">
        {admin && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:text-red-600"
            >
              <User size={22} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg p-3 w-48">
                <p className="font-semibold">{admin.displayName || "Admin"}</p>
                <p className="text-sm text-gray-600 truncate">{admin.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="border border-white px-4 py-1 rounded-full hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
