import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faEye,
  faEyeSlash,
  faTrash,
  faCloudUpload,
} from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Signup.css";
import { restaurantAPI, commonAPI } from "../services/api";

// // Add location pin icon using FontAwesome
// const LocationPinIcon = () => (
//   <FontAwesomeIcon icon={faLocationDot} />
// );

// // Add eye icon for password visibility
// const EyeIcon = ({ visible }) => (
//   <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
// );

const CUISINE_TYPES = [
  "Indian",
  "Chinese",
  "SouthIndian",
  "Thai",
  "Continental",
  "Italian",
  "Mexican",
  "Japanese",
  "Korean",
  "Lebanese",
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    locationUrl: "",
    cuisine: [],
    owner: {
      name: "",
      phone: "",
      upiId: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
    },
    images: [],
    restaurantType: "food", // Default to food type
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otp, setOTP] = useState("");
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendingOTP, setResendingOTP] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prevState) => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleCuisineChange = (cuisineType) => {
    setFormData((prevState) => {
      const currentCuisines = prevState.cuisine;
      if (currentCuisines.includes(cuisineType)) {
        // Remove cuisine if already selected
        return {
          ...prevState,
          cuisine: currentCuisines.filter((c) => c !== cuisineType),
        };
      } else {
        // Add cuisine if not selected
        return {
          ...prevState,
          cuisine: [...currentCuisines, cuisineType],
        };
      }
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file", { theme: "dark" });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB", { theme: "dark" });
      return;
    }

    try {
      setUploadProgress(true);

      // Create FormData and upload image
      const imageFormData = new FormData();
      imageFormData.append("image", file);

      const response = await commonAPI.uploadImage(imageFormData);

      // Update form with the returned image URL
      setFormData((prev) => ({
        ...prev,
        images: [response.data?.data?.imageUrl], // Store the URL instead of the file
      }));

      setUploadProgress(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image. Please try again.", {
        theme: "dark",
      });
      setUploadProgress(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.name.trim()) {
      toast.error("Restaurant name is required", { theme: "dark" });
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required", { theme: "dark" });
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required", { theme: "dark" });
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required", { theme: "dark" });
      return;
    }
    if (!formData.owner.accountNumber?.trim()) {
      toast.error("Account number is required", { theme: "dark" });
      return;
    }
    if (!formData.owner.accountHolderName?.trim()) {
      toast.error("Account holder name is required", { theme: "dark" });
      return;
    }
    if (!formData.owner.ifscCode?.trim()) {
      toast.error("IFSC code is required", { theme: "dark" });
      return;
    }
    if (!formData.restaurantType) {
      toast.error("Please select restaurant type", { theme: "dark" });
      return;
    }
    if (!formData.address.street.trim()) {
      toast.error("Street address is required", { theme: "dark" });
      return;
    }
    if (!formData.address.city.trim()) {
      toast.error("City is required", { theme: "dark" });
      return;
    }
    if (!formData.address.state.trim()) {
      toast.error("State is required", { theme: "dark" });
      return;
    }
    if (!formData.address.zipCode.trim()) {
      toast.error("ZIP code is required", { theme: "dark" });
      return;
    }
    if (!formData.locationUrl.trim()) {
      toast.error("Google Maps location URL is required", { theme: "dark" });
      return;
    }
    if (formData.cuisine.length === 0) {
      toast.error("Please select at least one cuisine type", { theme: "dark" });
      return;
    }
    if (!formData.owner.name.trim()) {
      toast.error("Owner name is required", { theme: "dark" });
      return;
    }
    if (!formData.owner.phone.trim()) {
      toast.error("Owner phone number is required", { theme: "dark" });
      return;
    }
    if (formData.images.length === 0) {
      toast.error("Please upload at least one restaurant image", {
        theme: "dark",
      });
      return;
    }

    setLoading(true);

    try {
      // Format the data according to the API requirements
      const formattedData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
        },
        locationUrl: formData.locationUrl,
        cuisine: formData.cuisine,
        owner: {
          name: formData.owner.name,
          phone: formData.owner.phone,
          upiId: formData.owner.upiId,
          accountNumber: formData.owner.accountNumber,
          accountHolderName: formData.owner.accountHolderName,
          ifscCode: formData.owner.ifscCode,
        },
        images: formData.images,
        restaurantType: formData.restaurantType,
      };

      // Make the API call
      const response = await restaurantAPI.register(formattedData);
      console.log("Registration successful:", response.data);

      // Show success toast with registration message
      if (response?.data?.success) {
        toast.success(response?.data?.message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });

        // Store email and show OTP popup
        setRegisteredEmail(response?.data?.data?.email);
        setShowOTPPopup(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP", { theme: "dark" });
      return;
    }

    setVerifyingOTP(true);
    try {
      const response = await restaurantAPI.verifyEmail({
        email: registeredEmail,
        otp: otp,
      });

      if (response?.data?.success) {
        toast.success("Email verified successfully!", { theme: "dark" });
        setShowOTPPopup(false);
        // Navigate to login page after successful verification
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed", {
        theme: "dark",
      });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        setFormData((prevState) => ({
          ...prevState,
          locationUrl: googleMapsUrl,
        }));
        setIsLocating(false);
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="signup-container">
      <ToastContainer />
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ClipLoader color="#4a90e2" size={50} />
            <p style={{ color: "#4a90e2", marginTop: "10px" }}>
              Registering your restaurant...
            </p>
          </div>
        </div>
      )}

      {showOTPPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "400px",
            }}
          >
            {resendingOTP && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1001,
                  borderRadius: "8px",
                }}
              >
                <ClipLoader color="#4a90e2" size={35} />
              </div>
            )}
            <h2 style={{ marginBottom: "20px", color: "#333" }}>
              Email Verification
            </h2>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              Please enter the OTP sent to {registeredEmail}
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Enter OTP"
              style={{
                width: "90%",
                padding: "12px",
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
            <button
              onClick={handleVerifyOTP}
              disabled={verifyingOTP}
              style={{
                width: "98%",
                padding: "12px",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: verifyingOTP ? "not-allowed" : "pointer",
                opacity: verifyingOTP ? 0.7 : 1,
                marginBottom: "15px",
              }}
            >
              {verifyingOTP ? "Verifying..." : "Verify OTP"}
            </button>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={async () => {
                  try {
                    setResendingOTP(true);
                    await restaurantAPI.resendEmailOTP({
                      email: registeredEmail,
                    });
                    toast.success("OTP resent successfully!", {
                      theme: "dark",
                    });
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message || "Failed to resend OTP",
                      { theme: "dark" }
                    );
                  } finally {
                    setResendingOTP(false);
                  }
                }}
                disabled={resendingOTP}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4a90e2",
                  textDecoration: "underline",
                  cursor: resendingOTP ? "not-allowed" : "pointer",
                  opacity: resendingOTP ? 0.7 : 1,
                  padding: "0",
                  fontSize: "14px",
                }}
              >
                {resendingOTP ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="signup-box">
        <div className="signup-header">
          <h1>Restaurant Signup</h1>
          <p>Create your restaurant account to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">Restaurant Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter restaurant name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div
              className="password-input-container"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                style={{ flex: 1 }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Restaurant Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter restaurant phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Restaurant Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="restaurantType"
                  value="food"
                  checked={formData.restaurantType === "food"}
                  onChange={handleChange}
                />
                Food
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="restaurantType"
                  value="grocery"
                  checked={formData.restaurantType === "grocery"}
                  onChange={handleChange}
                />
                Grocery
              </label>
            </div>
          </div>

          <div className="address-section">
            <h3>Restaurant Address</h3>
            <div className="form-group">
              <label htmlFor="address.street">Street Address</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Enter street address"
                required
              />
            </div>

            <div className="address-grid">
              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.state">State</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="Enter ZIP code"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="locationUrl">Google Maps Location URL</label>
            <div className="location-input-container">
              <input
                type="url"
                id="locationUrl"
                name="locationUrl"
                value={formData.locationUrl}
                onChange={handleChange}
                placeholder="Enter Google Maps URL or click the pin to get current location"
                required
                className="location-input"
              />
              <button
                type="button"
                className={`location-pin-button ${
                  isLocating ? "locating" : ""
                }`}
                onClick={handleGetLocation}
                disabled={isLocating}
              >
                <FontAwesomeIcon icon={faLocationDot} />
              </button>
            </div>
            {locationError && (
              <div className="error-message">{locationError}</div>
            )}
          </div>

          {formData.restaurantType === "food" && (
            <div className="form-group">
              <label>Cuisine Types</label>
              <div className="cuisine-buttons">
                {CUISINE_TYPES.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    className={`cuisine-button ${
                      formData.cuisine.includes(cuisine) ? "selected" : ""
                    }`}
                    onClick={() => handleCuisineChange(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Restaurant Images *</label>
            <div className="image-upload-container">
              {formData.images.length > 0 ? (
                <div className="image-preview">
                  <img src={formData.images[0]} alt="Restaurant Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    onChange={handleImageChange}
                    accept="image/*"
                    required
                    disabled={loading}
                    className="file-input"
                  />
                  <FontAwesomeIcon
                    icon={faCloudUpload}
                    className="upload-icon"
                  />
                  <p>Click or drag image to upload</p>
                </div>
              )}
              {uploadProgress && (
                <div className="upload-progress">
                  <ClipLoader size={20} color="#4a90f3" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>
          </div>

          <div className="owner-section">
            <h3>Owner Details</h3>
            <div className="form-group">
              <label htmlFor="owner.name">Owner Name</label>
              <input
                type="text"
                id="owner.name"
                name="owner.name"
                value={formData.owner.name}
                onChange={handleChange}
                placeholder="Enter owner name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner.phone">Owner Phone</label>
              <input
                type="tel"
                id="owner.phone"
                name="owner.phone"
                value={formData.owner.phone}
                onChange={handleChange}
                placeholder="Enter owner phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner.upiId">UPI ID</label>
              <input
                type="text"
                id="owner.upiId"
                name="owner.upiId"
                value={formData.owner.upiId}
                onChange={handleChange}
                placeholder="Enter UPI ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner.accountNumber">Account Number</label>
              <input
                type="text"
                id="owner.accountNumber"
                name="owner.accountNumber"
                value={formData.owner.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner.accountHolderName">
                Account Holder Name
              </label>
              <input
                type="text"
                id="owner.accountHolderName"
                name="owner.accountHolderName"
                value={formData.owner.accountHolderName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner.ifscCode">IFSC Code</label>
              <input
                type="text"
                id="owner.ifscCode"
                name="owner.ifscCode"
                value={formData.owner.ifscCode}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="signup-submit-button"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Restaurant Account"}
          </button>

          <div className="login-section">
            <p>Already have an account?</p>
            <button
              type="button"
              className="login-link-button"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
