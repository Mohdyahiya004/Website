import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Cart({ cart, setCart }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const [userMobile, setUserMobile] = useState("");
  const [userId, setUserId] = useState(null);

  // Load cart in real-time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setUserId(user.uid);
    const cartDocRef = doc(db, "userCarts", user.uid);

    const unsub = onSnapshot(cartDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCart(docSnap.data().items || []);
      }
    });

    // Fetch user mobile
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setUserMobile(snap.data().MobileNumber || "");
    });

    return () => unsub();
  }, [auth.currentUser, setCart]);

  // Save cart to Firestore on change
  useEffect(() => {
    if (!userId) return;
    const cartDocRef = doc(db, "userCarts", userId);
    setDoc(cartDocRef, { items: cart }, { merge: true });
  }, [cart, userId]);

  // Remove item
  const removeFromCart = (id, size) => {
    setCart(cart.filter((item) => !(item.id === id && item.size === size)));
    toast.info("Item removed from cart", { autoClose: 1500 });
  };

  // Update quantity
  const updateQuantity = (id, size, qty) => {
    if (qty < 1) return;
    setCart(
      cart.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity: qty } : item
      )
    );
  };

  // Place order
  const placeOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.warning("Please login first!");
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Prepare order items with FinalPrice
    const orderItems = cart.map((item) => {
      const Amount = Number(item.Amount) || 0;
      const Discount = Number(item.Discount) || 0;
      const FinalPrice = Number(
        (Amount - (Amount * Discount) / 100).toFixed(2)
      );

      return {
        productId: item.id,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        Amount,
        Discount,
        FinalPrice,
        image: item.Image,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.FinalPrice * (i.quantity || 1),
      0
    );

    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        userMobile: userMobile || "Not Provided",
        items: orderItems,
        totalAmount: Number(totalAmount.toFixed(2)),
        status: "Pending",
        createdAt: new Date(),
      });

      toast.success("✅ Order placed successfully!", { autoClose: 2000 });
      setCart([]);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Error placing order: " + error.message);
    }
  };

  // Calculate total cart amount after discount
  const totalCartAmount = cart
    .reduce((sum, item) => {
      const Amount = Number(item.Amount) || 0;
      const Discount = Number(item.Discount) || 0;
      const FinalPrice = Amount - (Amount * Discount) / 100;
      return sum + FinalPrice * (item.quantity || 1);
    }, 0)
    .toFixed(2);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
        🛒 Your Cart
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {cart.map((item) => {
            const Amount = Number(item.Amount) || 0;
            const Discount = Number(item.Discount) || 0;
            const FinalPrice = Amount - (Amount * Discount) / 100;

            return (
              <div
                key={`${item.id}-${item.size}`}
                className="flex justify-between items-center border p-3 rounded-lg bg-white shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.Image}
                    alt={item.productName}
                    className="w-20 h-20 object-contain rounded"
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">
                      {item.productName} ({item.size})
                    </p>
                    <p className="text-gray-500 line-through text-sm">
                      ₹{Amount.toFixed(2)}
                    </p>
                    <p className="text-green-700 font-bold text-base">
                      ₹{FinalPrice.toFixed(2)} × {item.quantity}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="text-red-600 font-bold"
                >
                  ✕
                </button>
              </div>
            );
          })}

          {/* Cart Summary */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t pt-4 mt-4 gap-2">
            <p className="font-bold text-lg">
              Total ({cart.reduce((s, i) => s + (i.quantity || 1), 0)} items): ₹
              {totalCartAmount}
            </p>
            <p className="text-gray-600">📞 Mobile: {userMobile || "N/A"}</p>
            <button
              onClick={placeOrder}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
