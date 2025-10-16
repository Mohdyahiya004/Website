// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false); // toggle for reset password
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password!");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch role from Firestore
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        alert("No role assigned. Contact admin.");
        return;
      }

      const role = snap.data().role;
      setUserRole(role);

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin-products");
      } else {
        navigate("/products");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email to reset password!");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert(`✅ Password reset link sent to ${email}`);
      setResetMode(false); // return to login view
    } catch (err) {
      alert("Error sending reset email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl mb-4 font-bold text-center">Login</h1>

      <div className="flex flex-col gap-2 w-64">
        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded mb-2 w-full"
        />

        {!resetMode && (
          <>
            {/* Password input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? "👁️" : "🙈 "}
              </button>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded mt-2 w-full hover:bg-blue-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {/* Reset password button */}
        {resetMode ? (
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="bg-yellow-500 text-white p-2 rounded mt-2 w-full hover:bg-yellow-600 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        ) : (
          <p
            className="text-blue-500 underline cursor-pointer mt-2 text-center"
            onClick={() => setResetMode(true)}
          >
            Forgot Password?
          </p>
        )}

        {/* Toggle back to login */}
        {resetMode && (
          <p
            className="text-blue-500 underline cursor-pointer mt-2 text-center"
            onClick={() => setResetMode(false)}
          >
            Back to Login
          </p>
        )}

        {/* Navigation to Register */}
        {!resetMode && (
          <p className="text-center mt-2">
            New user?{" "}
            <span
              className="text-blue-500 underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
