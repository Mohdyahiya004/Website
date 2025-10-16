import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import Footer from "./Footer";
import ProductModal from "./ProductModal";
import "react-toastify/dist/ReactToastify.css";

function ProductList({ cart, setCart, searchTerm = "" }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  // Fetch products in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const productData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productData);

      const initialQuantities = {};
      productData.forEach((p) => (initialQuantities[p.id] = 1));
      setQuantities(initialQuantities);
    });

    return () => unsub();
  }, []);

  // ✅ Add product to cart with correct FinalPrice
  const addToCart = (product) => {
    const finalPrice =
      product.Discount && product.Discount > 0
        ? Math.round(product.Amount - (product.Amount * product.Discount) / 100)
        : product.Amount;

    const newItem = {
      id: product.id,
      productName: product.productName,
      size: "Default",
      quantity: 1,
      Amount: product.Amount,
      Discount: product.Discount || 0,
      FinalPrice: finalPrice, // ✅ Always store it
      Image: product.Image,
    };

    setCart((prevCart) => [...prevCart, newItem]);

    toast.success(`${product.productName} added to cart! 🛒`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const filteredProducts = products.filter((p) =>
    p.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const incrementQty = (id) => {
    setQuantities({ ...quantities, [id]: (quantities[id] || 1) + 1 });
  };

  const decrementQty = (id) => {
    setQuantities({
      ...quantities,
      [id]: Math.max(1, (quantities[id] || 1) - 1),
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center text-amber-900">
        ☕ Explore Our Products
      </h1>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const finalPrice =
              product.Discount && product.Discount > 0
                ? Math.round(
                    product.Amount - (product.Amount * product.Discount) / 100
                  )
                : product.Amount;

            return (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col justify-between"
              >
                <img
                  src={product.Image}
                  alt={product.productName}
                  className="w-full h-61 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                />

                <div className="mt-3 flex flex-col flex-wrap">
                  <h2 className="text-lg font-semibold text-black">
                    {product.productName}
                  </h2>

                  <div className="mt-2">
                    <b>Price:</b>{" "}
                    <span className="text-red-600 line-through">
                      ₹{product.Amount}
                    </span>
                    <br />
                    <b>Discount:</b> <span>{product.Discount || 0}%</span>
                    <br />
                    <b>Final Price:</b>{" "}
                    <span className="text-green-600">₹{finalPrice}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <label className="font-semibold">Qty:</label>
                    <button
                      onClick={() => decrementQty(product.id)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">
                      {quantities[product.id]}
                    </span>
                    <button
                      onClick={() => incrementQty(product.id)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-amber-900 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Go to Cart Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/cart")}
          className="bg-yellow-500 text-white py-2 px-6 rounded-full text-lg hover:bg-yellow-600 transition"
        >
          Go to Cart ({cart.length})
        </button>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          allProducts={products}
          cart={cart}
          setCart={setCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default ProductList;
