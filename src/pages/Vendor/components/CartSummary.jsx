import React from 'react';

const CartSummary = ({ items, manufacturerName, onPlaceOrder }) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="manufacturer-summary">
      <div className="mfg-summary-details">
        <div className="mfg-summary-stat">
          <span className="stat-label">Items from {manufacturerName}:</span>
          <span className="stat-value">{totalItems}</span>
        </div>
        <div className="mfg-summary-stat">
          <span className="stat-label">Subtotal:</span>
          <span className="stat-value price">₹{totalPrice.toLocaleString()}</span>
        </div>
      </div>
      <button className="btn-place-order" onClick={onPlaceOrder} disabled={items.length === 0}>
        <span className="material-symbols-outlined">check_circle</span>
        Place Order for {manufacturerName}
      </button>
    </div>
  );
};

export default CartSummary;
