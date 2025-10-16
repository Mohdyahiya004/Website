import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { ShoppingCart, Search, User } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

function Navbar({ cart, setSearchTerm }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    MobileNumber: "",
    role: "",
  });
  const [localSearch, setLocalSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Track auth state and fetch user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({
            email: data.email || "",
            name: data.name || "",
            MobileNumber: data.MobileNumber || "",
            role: data.role || "",
          });
        }
      } else {
        setUser(null);
        setUserInfo({ email: "", name: "", MobileNumber: "", role: "" });
      }
    });

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserInfo({ email: "", name: "", MobileNumber: "", role: "" });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(localSearch);
  };

  // Nav button with hover & active underline
  const NavButton = ({ to, label }) => {
    const isActive = location.pathname === to;
    return (
      <button
        onClick={() => navigate(to)}
        className={`relative font-medium py-1 px-2 transition-colors ${
          isActive ? "text-red-600" : "text-white hover:text-red-600"
        } after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-red-600 after:w-0 hover:after:w-full after:transition-all after:duration-300 ${
          isActive ? "after:w-full" : ""
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="flex flex-wrap items-center justify-between px-6 py-3 bg-black text-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex gap-2 items-center text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src="/logo.jpg"
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover"
        />
        Crown & Coffee
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white rounded-full px-3 py-1 w-64"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="flex-grow text-black bg-transparent outline-none px-2"
        />
        <button type="submit" className="text-amber-900">
          <Search size={20} />
        </button>
      </form>

      {/* Nav items */}
      <div className="flex items-center gap-6 text-lg relative">
        <NavButton to="/" label="Home" />

        {/* Cart */}
        <button
          onClick={() => navigate("/cart")}
          className="relative flex items-center hover:text-red-500 transition"
        >

          <ShoppingCart size={22} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-black text-xs font-bold rounded-full px-1.5">
              {cart.length}
            </span>
          )}
        </button>
          <NavButton to="/my-orders" label="My Orders" />


        {/* User dropdown */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 border border-white px-3 py-1 rounded-full hover:bg-gray-800 transition"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User size={20} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg p-4 z-50">
                <p>
                  <b>Name:</b> {userInfo.name}
                </p>
                <p>
                  <b>Email:</b> {userInfo.email}
                </p>
                <p>
                  <b>Mobile:</b> {userInfo.MobileNumber}
                </p>
                <p>
                  <b>Role:</b> {userInfo.role}
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full bg-red-600 text-white py-1 rounded hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="border border-white px-4 py-1 rounded-full hover:bg-red-600"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
