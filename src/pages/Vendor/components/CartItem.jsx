import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { id, name, category, price, quantity, imageUrl } = item;
  const subtotal = price * quantity;
  const maxStock = item.stock || 100;

  return (
    <div className="cart-item">
      <div className="item-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="image-placeholder">
            <span className="material-symbols-outlined">image</span>
          </div>
        )}
      </div>

      <div className="item-details">
        <h4 className="item-name">{name}</h4>
        <span className="item-category">{category}</span>
        <div className="item-price">₹{price.toLocaleString()}</div>
      </div>

      <div className="item-controls">
        <div className="quantity-control">
          <button
            className="qty-btn"
            onClick={() => onUpdateQuantity(id, quantity - 1)}
            disabled={quantity <= 1}
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <input
            type="number"
            className="qty-input"
            value={quantity}
            onChange={(e) => onUpdateQuantity(id, parseInt(e.target.value) || 1)}
            min="1"
            max={maxStock}
          />
          <button
            className="qty-btn"
            onClick={() => onUpdateQuantity(id, quantity + 1)}
            disabled={quantity >= maxStock}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      <div className="item-subtotal">
        <span className="subtotal-label">Subtotal</span>
        <span className="subtotal-amount">₹{subtotal.toLocaleString()}</span>
      </div>

      <button className="btn-remove" onClick={() => onRemove(id)} title="Remove item">
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
};

export default CartItem;
