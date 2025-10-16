// // components/ProtectedRoute.jsx
// import { Navigate } from "react-router-dom";

// function ProtectedRoute({ children, role, requiredRole }) {
//   // Not logged in
//   if (!role) return <Navigate to="/login" replace />;

//   // If requiredRole exists and doesn't match user's role
//   if (requiredRole && role !== requiredRole) {
//     // Redirect admins to admin dashboard, users to user dashboard
//     if (role === "admin") return <Navigate to="/admin-products" replace />;
//     if (role === "user") return <Navigate to="/products" replace />;
//   }

//   // Authorized
//   return children;
// }

// export default ProtectedRoute;



// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role, requiredRole }) {
  if (!role) return <Navigate to="/login" replace />;

  if (requiredRole && role !== requiredRole) {
    // Redirect according to role
    if (role === "admin") return <Navigate to="/admin-products" replace />;
    if (role === "user") return <Navigate to="/products" replace />;
  }

  return children;
}

export default ProtectedRoute;

