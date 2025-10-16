// src/Ecommerce/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStatsAndChart = async () => {
      // ------------------------
      // Summary Stats
      // ------------------------
      const productsSnap = await getDocs(collection(db, "products"));
      const ordersSnap = await getDocs(collection(db, "orders"));
      const usersSnap = await getDocs(collection(db, "users"));

      setStats({
        products: productsSnap.size,
        orders: ordersSnap.size,
        users: usersSnap.size,
      });

      // ------------------------
      // Orders Chart (Revenue per Day)
      // ------------------------
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt"));
      const ordersDocs = await getDocs(ordersQuery);

      const chartMap = {};

      ordersDocs.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt || !data.totalAmount) return;
        const date = new Date(data.createdAt.seconds * 1000).toLocaleDateString();
        chartMap[date] = (chartMap[date] || 0) + data.totalAmount;
      });

      const chartArray = Object.keys(chartMap).map((date) => ({
        date,
        revenue: chartMap[date],
      }));

      setChartData(chartArray);
    };

    fetchStatsAndChart();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📊 Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-600">Products</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.products}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-600">Orders</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.orders}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-600">Users</h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.users}</p>
        </div>
      </div>

      {/* Orders/Revenue Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center">No orders yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Navigation Links */}
      <div className="flex justify-center gap-6">
        <button
          onClick={() => (window.location.href = "/admin-products")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Manage Products
        </button>
        <button
          onClick={() => (window.location.href = "/admin-orders")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          View Orders
        </button>
        <button
          onClick={() => (window.location.href = "/admin-users")}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
        >
          View Users
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
