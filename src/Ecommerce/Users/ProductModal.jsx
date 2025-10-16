import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";
import { toast } from "react-toastify";

function ProductModal({ product, allProducts, cart, setCart, onClose }) {
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState(product);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("S"); // default size S

  const sizes = ["S", "M", "L", "XL"]; // Sizes to show

  // Quantity handlers
  const incrementQty = () => setQuantity(quantity + 1);
  const decrementQty = () => setQuantity(Math.max(1, quantity - 1));

  // Add to cart
  const addToCart = () => {
    if (!selectedSize) {
      alert("Please select a size!");
      return;
    }

    const alreadyInCart = cart.find(
      (item) => item.id === currentProduct.id && item.size === selectedSize
    );

    if (alreadyInCart) {
      setCart(
        cart.map((item) =>
          item.id === currentProduct.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: currentProduct.id,
          productName: currentProduct.productName,
          size: selectedSize,
          quantity,
          Amount: currentProduct.Amount * quantity,
          Image: currentProduct.Image,
        },
      ]);
    }

    toast.success(
      `${currentProduct.productName} (${selectedSize}) x${quantity} added to cart!`
    );
  };

  // When clicking a product in the swiper
  const handleSwiperClick = (p) => {
    setCurrentProduct(p);
    setQuantity(1);
    setSelectedSize("S");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl relative p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-red-600"
        >
          <X size={24} />
        </button>

        {/* Product details */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={currentProduct.Image}
            alt={currentProduct.productName}
            className="w-full md:w-1/3 h-61 object-cover rounded-lg"
          />
          <div className="flex-1 flex flex-col gap-2">
            <h2 className="text-2xl font-bold">{currentProduct.productName}</h2>
            

            {/* Sizes selection */}
            <div>
              <p className="font-semibold mt-2">Select Size:</p>
              <div className="flex gap-2 mt-1">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 border rounded ${
                      selectedSize === size
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-lg font-semibold mt-2">
              {currentProduct.Discount && (
              <p>
                <b>Price:</b>
                <span className="text-red-600 line-through">
                  ₹{currentProduct.Amount}
                </span>
                <br />
                <b>Discount:</b>
                <span className="">{currentProduct.Discount}%</span>
                <br />
              </p>
            )}
              <b>Final Price:</b>
              <span className="text-green-600 ">
                ₹{currentProduct.FinalPrice}
              </span>
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={decrementQty}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span className="px-3 py-1 border rounded">{quantity}</span>
              <button
                onClick={incrementQty}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>

            <button
              onClick={addToCart}
              className="mt-4 bg-amber-900 text-white px-4 py-2 rounded hover:bg-amber-800 transition flex items-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>
        </div>

        {/* Horizontal swiper for 10 products */}
        <div className="mt-6 overflow-x-auto flex gap-4">
          {allProducts.slice(0, 10).map((p) => (
            <div
              key={p.id}
              className="min-w-[120px] cursor-pointer transform hover:scale-105 transition"
              onClick={() => handleSwiperClick(p)}
            >
              <img
                src={p.Image}
                alt={p.productName}
                className="w-full h-28 object-cover rounded-lg"
              />
              <p className="text-sm mt-1 text-center">{p.productName}</p>
            </div>
          ))}
        </div>

        {/* Shop Now button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/products")}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
