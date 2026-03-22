import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";
import { restaurantAPI } from "../services/api";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otp, setOTP] = useState("");
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    try {
      const response = await restaurantAPI.login(formData);

      if (!response.data.success) {
        setError(response.data.message);
        // console.error('Login error:', response.data);
        // Check if the error is due to email verification
        if (response.data.data && response.data.data.isVerified === false) {
          setNeedsVerification(true);
          setVerificationEmail(response.data.data.email);
        }

        toast.error(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        return;
      }

      const { restaurant, token } = response.data.data;

      // Store token
      localStorage.setItem("token", token);

      // Store restaurant data
      localStorage.setItem(
        "restaurant",
        JSON.stringify({
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          address: restaurant.address,
          owner: restaurant.owner,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          isActive: restaurant.isActive,
          locationUrl: restaurant.locationUrl,
          images: restaurant.images,
        })
      );

      // Store individual fields for easier access
      localStorage.setItem("restaurantId", restaurant._id);
      localStorage.setItem("restaurantName", restaurant.name);
      localStorage.setItem("restaurantEmail", restaurant.email);

      // Show success toast
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      if (
        err.response?.data?.data &&
        err.response?.data?.data.isVerified === false
      ) {
        setNeedsVerification(true);
        setVerificationEmail(err.response?.data?.data.email);
      }
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleVerifyEmail = async () => {
    setSendingEmail(true);
    try {
      // Call your API endpoint to resend verification email
      const response = await restaurantAPI.resendEmailOTP({
        email: verificationEmail,
      });

      if (response.data.success) {
        setShowOTPPopup(true); // Show OTP popup after successful email send
        toast.success("Verification email sent successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else {
        toast.error(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (err) {
      toast.error("Failed to send verification email. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setSendingEmail(false);
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
        email: verificationEmail,
        otp: otp,
      });

      if (response?.data?.success) {
        toast.success("Email verified successfully!", { theme: "dark" });
        setShowOTPPopup(false);
        setNeedsVerification(false);
        // Try to log in again automatically
        handleSubmit(new Event("submit"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed", {
        theme: "dark",
      });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setSendingResetEmail(true);

    try {
      const response = await restaurantAPI.forgotPassword({
        email: forgotPasswordEmail,
      });
      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Password reset instructions have been sent to your email",
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
        // Clear state and hide popup on success
        setShowForgotPasswordPopup(false);
        setForgotPasswordEmail("");
      } else {
        toast.error(response.data.message || "Failed to send reset email", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      console.log("Forgot Password Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
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
      setSendingResetEmail(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />

      {/* OTP Verification Popup */}
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
            {verifyingOTP && (
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
              Please enter the OTP sent to {verificationEmail}
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
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowOTPPopup(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4a90e2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="login-box">
        <div className="login-header">
          <h1>Foodzy Restaurant</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div className="form-footer">
            <div className="remember-me"></div>
            <div
              className="auth-links"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {needsVerification && (
                <button
                  type="button"
                  className="verify-email"
                  onClick={handleVerifyEmail}
                  disabled={sendingEmail}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: sendingEmail ? "not-allowed" : "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: sendingEmail ? 0.7 : 1,
                  }}
                >
                  {sendingEmail ? (
                    <>
                      <ClipLoader color="#007bff" size={15} />
                      Sending Email...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              )}
              <button
                type="button"
                className="forgot-password"
                onClick={() => setShowForgotPasswordPopup(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: needsVerification ? "auto" : "0",
                }}
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          <div className="signup-section">
            <p>Don't have an account?</p>
            <button
              type="button"
              className="signup-link-button"
              onClick={() => navigate("/auth/signup")}
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Forgot Password Popup */}
        {showForgotPasswordPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Forgot Password</h3>
              {sendingResetEmail ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "150px",
                  }}
                >
                  <ClipLoader size={40} color="#4a90e2" />
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      style={{
                        width: "93%",
                        padding: "12px",
                        marginBottom: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                  <div className="popup-buttons">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPasswordPopup(false);
                        setForgotPasswordEmail("");
                        setError("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingResetEmail}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#4a90e2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {sendingResetEmail ? (
                        <ClipLoader size={20} color="#4a90e2" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              )}
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
