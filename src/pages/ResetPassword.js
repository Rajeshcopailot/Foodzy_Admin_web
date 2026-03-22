import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { restaurantAPI } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../styles/ResetPassword.css";
import { useLocation } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  // Check token validity when page loads
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setPageLoading(false);
        return;
      }

      try {
        // You can add an API endpoint to validate the token if needed
        // For now, we'll just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPageLoading(false);
      } catch (error) {
        setPageLoading(false);
        toast.error("Invalid or expired reset link", {
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

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswords = () => {
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please enter both passwords", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        token: token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await restaurantAPI.resetPassword(requestBody);

      if (response.data.success) {
        toast.success(response.data.message || "Password reset successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });

        // Clear form data
        setFormData({
          password: "",
          confirmPassword: "",
        });

        // Redirect to login page after successful reset
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password", {
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
      console.log("Reset Password Error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";

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

      // If token is invalid or has expired, redirect to login
      if (
        errorMessage.toLowerCase().includes("token") &&
        (errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("expired"))
      ) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="reset-password-container">
        <div
          className="reset-password-box"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <ClipLoader size={50} color="#4a90e2" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <h2>Invalid Reset Link</h2>
          <p>The password reset link is invalid or has expired.</p>
          <button onClick={() => navigate("/login")} className="back-to-login">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <ToastContainer />
      <div className="reset-password-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword.password ? "text" : "password"}
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={() => togglePasswordVisibility("password")}
              >
                <FontAwesomeIcon
                  icon={showPassword.password ? faEyeSlash : faEye}
                />
              </span>
            </div>
          </div>
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                <FontAwesomeIcon
                  icon={showPassword.confirmPassword ? faEyeSlash : faEye}
                />
              </span>
            </div>
          </div>
          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
        <div className="back-link">
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
