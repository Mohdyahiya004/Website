// src/Ecommerce/ProductList.jsx (Admin)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getFirestore,
  query,
  orderBy,
  limit,
} from "@firebase/firestore";
import app from "../firebase";

function ProductList() {
  const navigate = useNavigate();
  const db = getFirestore(app);
  const [list, setList] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const result = await getDocs(
        query(collection(db, "products"), orderBy("Amount", "asc"), limit(50))
      );
      setList(result.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", id));
        setList((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Admin Product List</h1>

      {/* Add Product button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate("/add-product")}
          className="bg-gradient-to-r from-[#fca5f1] to-[#B5FFFF] rounded-full p-2"
        >
          Add Product
        </button>
      </div>

      {/* Product grid */}
      <div className="flex flex-wrap gap-6 justify-center">
        {list.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 w-[300px] cursor-pointer flex flex-col items-center"
            // onClick={() => navigate(`/add-product?id=${item.id}`)}
            onClick={() => navigate(`/add-product?id=${item.id}`)}

          >
            {/* Image container */}
            <div className="w-[250px] h-[250px] flex items-center justify-center overflow-hidden mb-2">
              <img
                src={item.Image}
                alt={item.productName}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>

            <p className="text-center">
              <b>Name:</b> {item.productName}
            </p>
            <p className="text-center">
              <b>Amount:</b><p className="text-red-600 line-through"> ₹{item.Amount}</p> 
            </p>
            <p className="text-center">
              <b>Discount:</b> ₹{item.Discount}%
            </p>
            <p className="text-center">
              <b>Final Price:</b> ₹{item.FinalPrice}
            </p>

            <button
              onClick={(e) => handleDelete(e, item.id)}
              className="mt-2 bg-red-500 text-white rounded-full p-2 w-full"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
