import "./App.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import ProtectedRoute from "./Ecommerce/ProtectedRoute";
import Navbar from "./Ecommerce/Users/Navbar";
import AdminNavbar from "./Ecommerce/AdminNavbar";
import Cart from "./Ecommerce/Users/Cart";
import UserProfile from "./Ecommerce/Users/UserProfile";

// Lazy-loaded pages
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const AdminAddProduct = lazy(() => import("./Ecommerce/AddProduct"));
const AdminProductList = lazy(() => import("./Ecommerce/ProductList"));
const AdminOrders = lazy(() => import("./Ecommerce/AdminOrders"));
const UserProductList = lazy(() => import("./Ecommerce/Users/ProductList"));
const AdminUsersList = lazy(() => import("./Ecommerce/AdminUsers"));
const Dashboardadmin = lazy(() => import("./Ecommerce/AdminDashboard"));
const UsersOrders = lazy(() => import("./Ecommerce/Users/UserOrders"));

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const location = useLocation();

  // ✅ Restore cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Firebase auth + user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) setUserRole(userDoc.data().role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  // ✅ Conditional Navbar (User vs Admin)
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/add-product";
  const NavbarToShow =
    userRole === "admin" && isAdminRoute ? (
      <AdminNavbar user={user} handleLogout={handleLogout} />
    ) : (
      <Navbar cart={cart} user={user} handleLogout={handleLogout} />
    );

  return (
    <Suspense
      fallback={<div className="text-center mt-10">Loading components...</div>}
    >
      {NavbarToShow}

      <Routes>
        {/* ✅ User Routes */}
        <Route
          path="/"
          element={<UserProductList cart={cart} setCart={setCart} />}
        />
        <Route
          path="/products"
          element={<UserProductList cart={cart} setCart={setCart} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUserRole={setUserRole} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/my-orders" element={<UsersOrders />} />
<Route path="/UserProfile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* ✅ Admin Routes */}
        <Route
          path="/add-product"
          element={
            <ProtectedRoute role={userRole} requiredRole="admin">
              <AdminAddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <ProtectedRoute role={userRole} requiredRole="admin">
              <AdminProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedRoute role={userRole} requiredRole="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute role={userRole} requiredRole="admin">
              <div className="text-center mt-10 text-2xl font-semibold">
                👥 Users Management Page (Coming Soon)
              </div>
              <AdminUsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={userRole} requiredRole="admin">
              <Dashboardadmin />
            </ProtectedRoute>
          }
        />

        {/* ✅ 404 */}
        <Route
          path="*"
          element={
            <p className="text-center mt-10 text-2xl">404 - Page Not Found</p>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
