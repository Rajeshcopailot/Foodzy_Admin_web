// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faCalendarWeek,
  faCalendarAlt,
  faStar,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Dashboard.css";
import { restaurantAPI } from "../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: { today: 0, week: 0, month: 0 },
    sales: { today: 0, week: 0, month: 0 },
    recentRatings: [
      {
        id: 1,
        customerName: "John Doe",
        rating: 4.5,
        comment: "Great food!",
        date: "2024-01-30",
      },
      {
        id: 2,
        customerName: "Jane Smith",
        rating: 5,
        comment: "Excellent service",
        date: "2024-01-29",
      },
      {
        id: 3,
        customerName: "Mike Johnson",
        rating: 4,
        comment: "Good experience",
        date: "2024-01-28",
      },
    ],
  });
  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const restaurantId = localStorage.getItem("restaurantId");
    // const restaurantId = JSON.stringify(localStorage.getItem("restaurantId"));
    console.log("Restaurant ID:", restaurantId);
    if (!restaurantId) {
      console.error("Restaurant ID not found in local storage");
      return;
    }

    try {
      const response = await restaurantAPI.restaurantStats({
        restaurantId,
      });

      if (response?.data?.success) {
        console.log("Dashboard data:", response.data.data);
        setStats(response.data.data); // Update the stats with the API response data
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch dashboard data",
        {
          theme: "dark",
        }
      );
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      {/* <h1>Dashboard</h1> */}

      <div className="stats-grid">
        {/* Orders Stats */}
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="stat-content">
            <h3>Today's Orders</h3>
            <p className="stat-number">{stats.orders.today}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarWeek} />
          </div>
          <div className="stat-content">
            <h3>This Week's Orders</h3>
            <p className="stat-number">{stats.orders.week}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="stat-content">
            <h3>This Month's Orders</h3>
            <p className="stat-number">{stats.orders.month}</p>
          </div>
        </div>

        {/* Amount Stats */}
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="stat-content">
            <h3>Today's Revenue</h3>
            <p className="stat-number">{formatCurrency(stats.sales.today)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="stat-content">
            <h3>Weekly Revenue</h3>
            <p className="stat-number">{formatCurrency(stats.sales.week)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-number">{formatCurrency(stats.sales.month)}</p>
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="recent-ratings">
        <h2>Recent Ratings</h2>
        <div className="ratings-grid">
          {stats.recentRatings.map((rating) => (
            <div key={rating.id} className="rating-card">
              <div className="rating-header">
                <h4>{rating.customerName}</h4>
                <div className="rating-stars">
                  <FontAwesomeIcon icon={faStar} />
                  <span>{rating.rating}</span>
                </div>
              </div>
              <p className="rating-comment">{rating.comment}</p>
              <p className="rating-date">
                {new Date(rating.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
