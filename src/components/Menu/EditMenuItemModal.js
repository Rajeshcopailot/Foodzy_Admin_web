import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCloudUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { commonAPI } from "../../services/api";
import "./AddMenuItemModal.css";

const MENU_CATEGORIES = ["Main Course", "Snacks", "Drinks", "Starter", "Bread", "Dessert"];

const EditMenuItemModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountType: "none",
    discountValue: "",
    category: "",
    image: "",
    isVegetarian: false,
    restaurantId: localStorage.getItem("restaurantId"),
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        discountType: item.discountType || "none",
        discountValue: item.discountValue || "",
        category: item.category,
        image: item.image,
        isVegetarian: item.isVegetarian,
      });
      setImagePreview(item.image);
    }
  }, [item]);

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          // Show local preview immediately
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);

          // Upload the image immediately
          try {
            setUploadProgress(true);
            const formData = new FormData();
            formData.append("image", file);

            const response = await commonAPI.uploadImage(formData);
            if (response.data.success) {
              const imageUrl = response.data.data.imageUrl;
              setFormData((prev) => ({ ...prev, image: imageUrl }));
              setImagePreview(imageUrl);
              toast.success("Image uploaded successfully");
            } else {
              throw new Error(
                response.data.message || "Failed to upload image"
              );
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.message || "Failed to upload image");
            handleRemoveImage();
          } finally {
            setUploadProgress(false);
          }
        } else {
          toast.error("Please select an image file");
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.image) {
        throw new Error("Please select and upload an image");
      }

      const restaurantId = localStorage.getItem("restaurantId");
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discountValue: formData.discountValue
          ? parseFloat(formData.discountValue)
          : undefined,
        restaurantId,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to update menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Menu Item</h2>
          <button
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="discountType">Discount Type</label>
            <select
              id="discountType"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="none">None</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          {formData.discountType !== 'none' && (
            <div className="form-group">
              <label htmlFor="discountValue">
                {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
              </label>
              <input
                type="number"
                id="discountValue"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="0"
                max={formData.discountType === 'percentage' ? "100" : undefined}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              {MENU_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Item Image *</label>
            <div className="image-upload-container">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    required
                    disabled={isSubmitting}
                    ref={fileInputRef}
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

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              Vegetarian
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ClipLoader size={20} color="#ffffff" />
              ) : (
                "Update Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItemModal;
