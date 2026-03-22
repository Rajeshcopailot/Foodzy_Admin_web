import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faLeaf,
  faDrumstickBite,
  faStar,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/ProfileScreen.css";
import { restaurantAPI } from "../services/api";
import { toast } from "react-toastify";

const ProfileScreen = () => {
  const restaurantId = localStorage.getItem("restaurantId");
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await restaurantAPI.restaurantProfile({ restaurantId });
      if (response?.data?.success) {
        setProfile(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch profile data", {
        theme: "dark",
      });
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          className="profile-avatar"
          src={profile.images[0]}
          alt={profile.name}
        />
        <h2 className="profile-name">{profile.name}</h2>
        <p className="profile-type">
          <FontAwesomeIcon icon={faDrumstickBite} /> {profile.restaurantType}
        </p>
        <div className="profile-info">
          <p>
            <FontAwesomeIcon icon={faEnvelope} /> {profile.email}
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} /> {profile.phone}
          </p>
          <p>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> {profile.address.street},{" "}
            {profile.address.city}, {profile.address.state},{" "}
            {profile.address.zipCode}
          </p>
          <a
            href={profile.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-location"
          >
            View Location
          </a>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <FontAwesomeIcon icon={faShoppingCart} className="stat-icon" />
          <h3>Total Orders</h3>
          <p>{profile.totalOrders} orders</p>
        </div>
        <div className="stat-card">
          <FontAwesomeIcon icon={faStar} className="stat-icon" />
          <h3>Average Rating</h3>
          <p>
            {profile.averageRating} ({profile.totalRatings} ratings)
          </p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Cuisine</h3>
        <p>
          <FontAwesomeIcon icon={faLeaf} /> {profile.cuisine.join(", ")}
        </p>
      </div>

      <div className="profile-section">
        <h3>Owner Details</h3>
        <p>Name: {profile.owner.name}</p>
        <p>Phone: {profile.owner.phone}</p>
        <p>UPI ID: {profile.owner.upiId}</p>
        <p>
          Account: {profile.owner.accountNumber} (
          {profile.owner.accountHolderName})
        </p>
        <p>IFSC: {profile.owner.ifscCode}</p>
      </div>
    </div>
  );
};

export default ProfileScreen;