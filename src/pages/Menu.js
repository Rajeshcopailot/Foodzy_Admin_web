import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLeaf,
  faEdit,
  faTrash,
  faDrumstickBite,
} from "@fortawesome/free-solid-svg-icons";
import { menuAPI } from "../services/api";
import AddMenuItemModal from "../components/Menu/AddMenuItemModal";
import EditMenuItemModal from "../components/Menu/EditMenuItemModal";
import DeleteConfirmationModal from "../components/Menu/DeleteConfirmationModal";
import "../styles/Menu.css";

const MENU_CATEGORIES = [
  'Main Course',
  'Snacks',
  'Drinks',
  'Starter',
  'Bread',
  'Dessert'
];

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchMenuItems = async () => {
    try {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) {
        throw new Error("Restaurant ID not found");
      }
      const response = await menuAPI.getMenu(restaurantId);
      if (response.data.success) {
        const menuData = response.data.data;
        // Handle both array and grouped object formats from API
        if (Array.isArray(menuData)) {
          setMenuItems(menuData);
        } else if (typeof menuData === 'object' && menuData !== null) {
          // Flatten grouped object into array
          const flattenedItems = Object.values(menuData).flat();
          setMenuItems(flattenedItems);
        } else {
          setMenuItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddMenuItem = async (itemData) => {
    try {
      await menuAPI.addMenuItem(itemData);
      toast.success("Menu item added successfully");
      fetchMenuItems();
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error(error.message || "Failed to add menu item");
    }
  };

  const handleEditMenuItem = async (itemData) => {
    try {
      await menuAPI.updateMenuItem(selectedItem._id, itemData);
      toast.success("Menu item updated successfully");
      fetchMenuItems();
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error(error.message || "Failed to update menu item");
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await menuAPI.deleteMenuItem(selectedItem._id);
      toast.success("Menu item deleted successfully");
      fetchMenuItems();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error(error.message || "Failed to delete menu item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleToggleAvailability = async (itemId, currentAvailability) => {
    try {
      await menuAPI.updateItemAvailability(itemId, {
        isAvailable: !currentAvailability,
      });
      toast.success("Item availability updated");
      fetchMenuItems();
    } catch (error) {
      console.error("Error updating item availability:", error);
      toast.error("Failed to update item availability");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery || searchCategory || minPrice || maxPrice) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchCategory, minPrice, maxPrice]);

  const handleSearch = async () => {
    try {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) {
        throw new Error("Restaurant ID not found");
      }

      const searchParams = {
        ...(searchQuery && { query: searchQuery.trim() }),
        ...(searchCategory && { category: searchCategory }),
        ...(minPrice && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) })
      };

      // If no search parameters, fetch all menu items
      if (Object.keys(searchParams).length === 0) {
        return fetchMenuItems();
      }

      const response = await menuAPI.getMenu(restaurantId, searchParams);
      if (response.data.success) {
        const menuData = response.data.data;
        // Handle both array and grouped object formats from API
        if (Array.isArray(menuData)) {
          setMenuItems(menuData);
        } else if (typeof menuData === 'object' && menuData !== null) {
          // Flatten grouped object into array
          const flattenedItems = Object.values(menuData).flat();
          setMenuItems(flattenedItems);
        } else {
          setMenuItems([]);
        }
      }
    } catch (error) {
      console.error("Error searching menu items:", error);
      toast.error("Failed to search menu items");
    }
  };

  const groupedMenuItems = (Array.isArray(menuItems) ? menuItems : []).reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1>Menu Management</h1>
        <button
          className="add-item-button"
          onClick={() => setIsAddModalOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Menu</span>
        </button>
      </div>

      <div className="search-section">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {MENU_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="price-input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="price-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchCategory("");
              setMinPrice("");
              setMaxPrice("");
              fetchMenuItems();
            }}
            className="reset-button"
          >
            Reset
          </button>
        </div>

      <div className="menu-content">
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category} className="menu-category">
            <h2>{category}</h2>
            <div className="menu-items">
              {items.map((item) => (
                <div key={item._id} className="menu-item">
                  <div className="item-image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-image"
                    />
                    {item.isVegetarian && (
                      <div className="veg-badge">
                        <FontAwesomeIcon icon={faLeaf} />
                      </div>
                    )}
                    {!item.isVegetarian && (
                      <div className="non-veg-badge">
                        <FontAwesomeIcon icon={faDrumstickBite} />
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <div className="item-actions">
                        <button
                          className="edit-button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <p>{item.description}</p>
                    <div className="item-meta">
                      <div className="item-price">
                        {item.discountPrice &&
                        item.discountPrice !== item.price ? (
                          <>
                            <span className="original-price">
                              {formatPrice(item.price)}
                            </span>
                            <span className="discount-price">
                              {formatPrice(item.discountPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="regular-price">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      {item.isVegetarian ? (
                        <span className="veg-indicator">
                          <FontAwesomeIcon icon={faLeaf} /> Veg
                        </span>
                      ) : (
                        <span className="non-veg-indicator">
                          <FontAwesomeIcon icon={faDrumstickBite} /> Non-Veg
                        </span>
                      )}
                    </div>
                    <button
                      className={`availability-toggle ${
                        item.isAvailable ? "available" : "unavailable"
                      }`}
                      onClick={() =>
                        handleToggleAvailability(item._id, item.isAvailable)
                      }
                    >
                      {item.isAvailable ? "In Stock" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedMenuItems).length === 0 && (
          <div className="empty-state">
            <p>No menu items found. Start by adding your first menu item!</p>
          </div>
        )}
      </div>

      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMenuItem}
      />

      <EditMenuItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditMenuItem}
        item={selectedItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Menu;
