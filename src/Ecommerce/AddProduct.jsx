import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getFirestore,
  collection,
} from "@firebase/firestore";
import app from "../firebase";

function AddProduct() {
  const [productDetails, setProductDetails] = useState({
    productName: "",
    Amount: 0,
    Discount: 0,
    Image: "",
    FinalPrice: 0,
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const db = getFirestore(app);
  const id = searchParams.get("id"); // for editing

  // Fetch product data if editing
  const fetchProductDetail = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, "products", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProductDetails(snap.data());
      } else {
        alert("Product not found");
        navigate("/admin-products");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  // Automatically calculate final price when Amount or Discount changes
  useEffect(() => {
    const { Amount, Discount } = productDetails;
    if (Amount >= 0 && Discount >= 0) {
      const final = Amount - (Amount * Discount) / 100;
      setProductDetails((prev) => ({ ...prev, FinalPrice: final }));
    }
  }, [productDetails.Amount, productDetails.Discount]);

  // Add or update product
  const handleProduct = async () => {
    const { productName, Amount, Discount, Image, FinalPrice } = productDetails;
    if (!productName || !Amount || !Image) {
      alert("Please fill all fields!");
      return;
    }

    try {
      if (id) {
        // Update existing product
        await updateDoc(doc(db, "products", id), {
          productName,
          Amount,
          Discount,
          Image,
          FinalPrice,
          UpdatedAt: new Date(),
        });
        alert("Product updated successfully!");
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          productName,
          Amount,
          Discount,
          Image,
          FinalPrice,
          CreatedAt: new Date(),
        });
        alert("Product added successfully!");
      }

      navigate("/admin-products"); // Redirect to Admin Product List
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">
        {id ? "Update Product" : "Add Product"}
      </h1>

      {/* Product Name */}
      <input
        placeholder="Product Name"
        className="border p-2 rounded mb-4 w-64"
        value={productDetails.productName}
        onChange={(e) =>
          setProductDetails({ ...productDetails, productName: e.target.value })
        }
      />

      {/* Amount */}
      <input
        placeholder="Amount"
        type="number"
        className="border p-2 rounded mb-4 w-64"
        value={productDetails.Amount}
        onChange={(e) =>
          setProductDetails({
            ...productDetails,
            Amount: Number(e.target.value),
          })
        }
      />

      {/* Discount */}
      <input
        placeholder="Discount (%)"
        type="number"
        className="border p-2 rounded mb-4 w-64"
        value={productDetails.Discount}
        onChange={(e) =>
          setProductDetails({
            ...productDetails,
            Discount: Number(e.target.value),
          })
        }
      />

      {/* Image */}
      <input
        placeholder="Image URL"
        className="border p-2 rounded mb-4 w-64"
        value={productDetails.Image}
        onChange={(e) =>
          setProductDetails({ ...productDetails, Image: e.target.value })
        }
      />

      {/* Display Final Price */}
      <p className="text-lg font-semibold mb-6">
        💰 Final Price after discount:{" "}
        <span className="text-green-600">
          ₹{productDetails.FinalPrice.toFixed(2)}
        </span>
      </p>

      {/* Button */}
      <button
        onClick={handleProduct}
        className="bg-gradient-to-r from-[#fca5f1] to-[#B5FFFF] rounded-full p-2 w-64"
      >
        {id ? "Update Product" : "Add Product"}
      </button>
    </div>
  );
}

export default AddProduct;
