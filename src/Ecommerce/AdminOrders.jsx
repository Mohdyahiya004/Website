import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let q;
    try {
      // Try ordering by createdAt (most recent first)
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    } catch (e) {
      console.warn("⚠️ createdAt field missing, fallback to unordered query.");
      q = query(collection(db, "orders"));
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setError(""); // clear any old error
      },
      (err) => {
        console.error("❌ Firestore snapshot error:", err);
        setError("Failed to load orders. Check Firestore permissions.");
      }
    );

    return () => unsub();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`✅ Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("❌ Failed to update order status");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
        📦 Admin - Manage Orders
      </h1>

      {error && (
        <p className="text-center text-red-600 font-semibold mb-4">{error}</p>
      )}

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              className="border border-gray-300 rounded-lg p-5 bg-white shadow-md hover:shadow-lg transition"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  🧾 Order ID: {order.id.slice(0, 8)}...
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "Pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : order.status === "Processing"
                      ? "bg-blue-200 text-blue-800"
                      : order.status === "Shipped"
                      ? "bg-purple-200 text-purple-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p>
                <b>User:</b> {order.userEmail || "Unknown"}
              </p>
              <p>
                <b>Mobile:</b> {order.userMobile || "N/A"}
              </p>
              <p>
                <b>Date:</b>{" "}
                {order.createdAt?.seconds
                  ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                  : "Unknown"}
              </p>
              <p className="font-semibold text-lg mt-2">
                💰 Total: ₹{order.totalAmount}
              </p>

              <hr className="my-3" />

              {/* Product List */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border p-2 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-600">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">₹{item.Amount}</p>
                  </div>
                ))}
              </div>

              {/* Status Update Dropdown */}
              <div className="mt-4">
                <label className="font-semibold text-sm block mb-1">
                  Update Status:
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="border rounded px-3 py-1 w-full focus:ring-2 focus:ring-red-400 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
