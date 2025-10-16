import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

function UserOrders() {
  const auth = getAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 🟢 Real-time Firestore Listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(userOrders);
      localStorage.setItem("userOrders", JSON.stringify(userOrders)); // cache
    });

    return () => unsub();
  }, []);

  // 🟡 Restore cache on refresh
  useEffect(() => {
    const cached = localStorage.getItem("userOrders");
    if (cached) setOrders(JSON.parse(cached));
  }, []);

  const handleOpenModal = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
  const statusColors = ["#facc15", "#3b82f6", "#8b5cf6", "#16a34a"];

  const getStatusIndex = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
        📦 My Orders
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              className="border border-gray-300 rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => handleOpenModal(order)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">
                  🧾 Order ID: {order.id.slice(0, 8)}...
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-sm text-white capitalize"
                  style={{
                    backgroundColor: statusColors[getStatusIndex(order.status)],
                  }}
                >
                  {order.status || "pending"}
                </span>
              </div>
              <p>
                <b>Date:</b>{" "}
                {order.createdAt?.seconds
                  ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                  : "Unknown"}
              </p>
              <p>
                <b>Mobile:</b> {order.userMobile || "N/A"}
              </p>
              <p>
                <b>Name:</b> {order.Name || "N/A"}
              </p>
              <p className="font-semibold text-lg mt-2 text-green-600">
                💰 ₹{order.totalAmount?.toFixed(2) || 0}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal - Detailed Order View */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-600"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
                Order Details
              </h2>

              {/* Products List */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3">
                  🛍 Products in this Order
                </h3>
                <div className="flex flex-wrap gap-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center border p-2 rounded shadow-sm w-28"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-contain mb-1"
                      />
                      <p className="text-sm text-center font-medium">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        ₹{item.Amount?.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        ₹{item.FinalPrice?.toFixed(2)} after discount
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="text-right text-lg font-bold text-green-700 mt-4">
                Total Amount: ₹{selectedOrder.totalAmount?.toFixed(2) || 0}
              </div>

              {/* Tracking Steps */}
              <div className="mt-8 mb-3">
                <h3 className="text-lg font-semibold mb-3">
                  🚚 Live Order Tracking
                </h3>
                <div className="flex justify-between items-center relative">
                  {steps.map((step, index) => {
                    const isActive =
                      index <= getStatusIndex(selectedOrder.status);
                    return (
                      <div
                        key={step}
                        className="flex-1 flex flex-col items-center relative"
                      >
                        {index < steps.length - 1 && (
                          <motion.div
                            className="absolute top-3 left-1/2 w-full h-1 -translate-x-1/2"
                            animate={{
                              scaleX: isActive ? 1 : 0,
                              backgroundColor: isActive
                                ? statusColors[index]
                                : "#d1d5db",
                            }}
                            style={{ originX: 0 }}
                          />
                        )}
                        <motion.div
                          className="w-6 h-6 rounded-full border-2 z-10"
                          animate={{
                            scale: isActive ? 1.2 : 1,
                            backgroundColor: isActive
                              ? statusColors[index]
                              : "#fff",
                            borderColor: statusColors[index],
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        ></motion.div>
                        <p
                          className={`mt-2 text-sm font-medium ${
                            isActive ? "" : "text-gray-400"
                          }`}
                          style={{
                            color: isActive ? statusColors[index] : "#9ca3af",
                          }}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserOrders;
