import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";

function UserProfile() {
  const auth = getAuth();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchAddress = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().address) {
        setAddress(snap.data().address);
      }
    };
    fetchAddress();
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { address },
      { merge: true }
    );
    toast.success("Address saved successfully!");
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-red-600">🏠 My Address</h1>

      <input
        type="text"
        name="street"
        value={address.street}
        onChange={handleChange}
        placeholder="Street"
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        name="city"
        value={address.city}
        onChange={handleChange}
        placeholder="City"
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        name="state"
        value={address.state}
        onChange={handleChange}
        placeholder="State"
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        name="pincode"
        value={address.pincode}
        onChange={handleChange}
        placeholder="Pincode"
        className="border p-2 w-full mb-2 rounded"
      />

      <button
        onClick={saveAddress}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Address
      </button>
    </div>
  );
}

export default UserProfile;
