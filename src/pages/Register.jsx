// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    const { name, number, email, password } = form;

    if (!name || number|| !email || !password) {
      alert("Please fill all fields!");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2️⃣ Update display name
      await updateProfile(user, { displayName: name });

      // 2️⃣ Update display number
      await updateProfile(user, { displayName: name });

      // 3️⃣ Send email verification
      await sendEmailVerification(user);

      // 4️⃣ Add user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        number,
        email,
        role: "user",
        createdAt: new Date(),
        emailVerified: false,
      });

      alert(
        `Registration successful! ✅\nPlease verify your email (${email}) before logging in.`
      );
      navigate("/login"); // Redirect to login page
    } catch (error) {
      alert("Registration failed: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl mb-6 font-bold">Register</h1>

      {/* Name input */}
      <input
        type="text"
        placeholder="Full Name"
        className="border p-2 rounded mb-4 w-64"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      {/* Number input */}
      <input
        type="tel"
        placeholder="Mobile Number"
        className="border p-2 rounded mb-4 w-64"
        value={form.number}
        onChange={(e) => setForm({ ...form, number: e.target.value })}
      />
      {/* Email input */}
      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded mb-4 w-64"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {/* Password input with show/hide */}
      <div className="relative w-64 mb-6">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border p-2 rounded w-full pr-10"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
        >
          {showPassword ? "👁️" : "🙈 "}{" "}
        </button>
      </div>

      {/* Register button */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className={`w-64 p-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

export default Register;
