import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();

  //Initialize from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('vendorCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  //Sync with localStorage
  useEffect(() => {
    localStorage.setItem('vendorCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, newQuantity) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        // Enforce limits: min 1, max available stock (default to 100 if not specified)
        const maxStock = item.stock || 100;
        const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
        return { ...item, quantity: validQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handlePlaceOrder = (manufacturerName) => {
    const itemsToOrder = cartItems.filter(item => item.manufacturerName === manufacturerName);
    if (itemsToOrder.length === 0) return;

    // Simulate placing order
    console.log(`Placing order for ${manufacturerName}:`, itemsToOrder);
    alert(`Order placed successfully for ${manufacturerName}!`);

    // Remove ordered items from cart
    setCartItems(prev => prev.filter(item => item.manufacturerName !== manufacturerName));
  };

  // Group items by manufacturer
  const groupedCart = useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      const mfgName = item.manufacturerName || 'Unknown Manufacturer';
      if (!groups[mfgName]) {
        groups[mfgName] = [];
      }
      groups[mfgName].push(item);
    });
    return groups;
  }, [cartItems]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const overallTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header-wrapper">
          <div className="cart-title-container">
            <h2 className="cart-title">
              <span className="material-symbols-outlined title-icon">shopping_cart</span>
              Your Cart
            </h2>
          </div>
        </div>
        <div className="cart-empty">
          <span className="material-symbols-outlined">production_quantity_limits</span>
          <p>Your cart is empty. Start adding products from the catalog!</p>
          <button className="btn-browse-catalog" onClick={() => navigate('/vendor/product-catalog')}>
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header-wrapper">
        <div className="cart-title-container">
          <h2 className="cart-title">
            <span className="material-symbols-outlined title-icon">shopping_cart</span>
            Your Cart
          </h2>
          <p className="cart-subtitle">Review your items and place purchase orders by manufacturer.</p>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-groups-container">
          {Object.entries(groupedCart).map(([manufacturerName, items]) => (
            <div key={manufacturerName} className="manufacturer-group">
              <div className="manufacturer-header">
                <h3>
                  <span className="material-symbols-outlined">factory</span>
                  {manufacturerName}
                </h3>
              </div>
              <div className="cart-items-list">
                {items.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <CartSummary
                items={items}
                manufacturerName={manufacturerName}
                onPlaceOrder={() => handlePlaceOrder(manufacturerName)}
              />
            </div>
          ))}
        </div>

        <div className="cart-overall-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Price</span>
              <span>₹{overallTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
