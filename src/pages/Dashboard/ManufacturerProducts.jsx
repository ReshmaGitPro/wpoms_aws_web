import React, {  useState, useEffect } from 'react';
import {  z } from "zod";
import { productService } from '../../services/productService';
// import './ManufacturerProducts.css';
import { toast } from 'sonner';
import ProductDetailsModal from './ProductDetails';

const productSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Minimum 3 characters required"),

  category: z.string()
    .trim()
    .min(1, "Category is required"),

  price: z.string()
    .min(1, "Price is required")
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.]/g, ""));
      return !isNaN(num) && num > 0;
    }, "Invalid price"),

  quantity: z.string()
    .min(1, "Quantity is required")
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    }, "Invalid quantity"),

  warranty: z.string().min(1, "Warranty is required"),

  description: z.string()
  .trim()
  .min(5, "Description is required")
  .max(500, "Max 500 characters"),
});

const ManufacturerProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    id: "" , 
    name: '',
    category: '',
    price: '',
    quantity: '',
    warranty: '',
    description: '',
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAllProducts();
      let allProducts = data.map((p)=>{
        return {
          name: p.productName,
          category : p.category, 
          price : String(p.price), 
          quantity : String(p.quantity ?? '0'),
          warranty : p.warrantyType,
          description : p.description,
          id: p.productId 
        }
      })
      setProducts(allProducts || []);
    } catch (err) {
      toast.error(err.message||'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEditModal = (product) => {
    setEditProduct({ ...product });
    setErrors({});
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditProduct(null);
    setErrors({});
    toast.info('Edit cancelled');
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditProduct((current) => ({ ...current, [name]: value }));
  };

  const handleUpdateClick = () => {
    const result = productSchema.safeParse(editProduct);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setShowConfirm(true);
    setPendingUpdate(editProduct);
  };

  const confirmUpdate = async () => {
    try {
      await productService.updateProduct(pendingUpdate.id, pendingUpdate);
      setProducts(products.map((p) => p.id === pendingUpdate.id ? pendingUpdate : p));
      
      setShowConfirm(false);
      setEditModalOpen(false);
      setEditProduct(null);
      setPendingUpdate(null);
      toast.success('Product updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  const cancelUpdate = () => {
    setShowConfirm(false);
    setPendingUpdate(null);
  };

  const openAddModal = () => {
    setErrors({});
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setNewProduct({ name: '', category: '', price: '', quantity: '', warranty: '', description: '' });
    setErrors({});
  };

  const handleAddChange = (event) => {
    const { name, value } = event.target;
    setNewProduct((current) => ({ ...current, [name]: value }));
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    

    const result = productSchema.safeParse(newProduct);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      await productService.addProduct(newProduct);
      fetchProducts(); 
      setErrors({});
      closeAddModal();
      toast.success('Product added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
    }
  };

  return (
    <div className="product-page">
      <div className="product-page-header">
        <div>
          <h2>Product Catalog</h2>
          {/* <p>Products added by this manufacturer.</p> */}
        </div>
        <button className="btn-add-product" onClick={openAddModal}>
          <span className="material-symbols-outlined">add</span>
          Add New Product
        </button>
      </div>

      <div className="product-table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Warranty Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  Loading products...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product) => (
                <tr 
                  key={product.id}
                  onClick={() => { setSelectedProduct(product); setDetailsModalOpen(true); }}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td className="product-id">{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.warranty}</td>
                  <td className="description-cell">{product.description}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => e.stopPropagation()}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-row">
                  No products have been added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && editProduct && (
        <div className="product-modal-overlay" role="dialog" aria-modal="true" onClick={closeEditModal}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <div className="product-modal-header">
              <div>
                <p className="modal-subtitle">Update Product</p>
                <h2>Edit Product Details</h2>
              </div>
              <button className="modal-close-button" type="button" onClick={closeEditModal} aria-label="Close modal">
                ×
              </button>
            </div>
            <form className="product-form" onSubmit={(e) => { e.preventDefault(); handleUpdateClick(); }}>
              <div className="product-grid">
                <label className="product-field">
                  <span>Product Name</span>
                 <input type="text" name="name" value={editProduct.name} onChange={handleEditChange} />
                  {errors.name && <span className="field-error">{errors.name[0]}</span>}
                </label>
                <label className="product-field">
                  <span>Category</span>
                 <input type="text" name="category" value={editProduct.category} onChange={handleEditChange} />
                  {errors.category && <span className="field-error">{errors.category[0]}</span>}
                </label>
              </div>
              <div className="product-grid-three">
                <label className="product-field">
                  <span>Price</span>
                <input type="text" name="price" value={editProduct.price} onChange={handleEditChange} />
                  {errors.price && <span className="field-error">{errors.price[0]}</span>}
                </label>
                <label className="product-field">
                  <span>Quantity</span>
                <input type="number" name="quantity" value={editProduct.quantity} onChange={handleEditChange} min="0" />
                  {errors.quantity && <span className="field-error">{errors.quantity[0]}</span>}
                </label>
                <label className="product-field">
                  <span>Warranty Type</span>
                <input type="text" name="warranty" value={editProduct.warranty} onChange={handleEditChange} />
                  {errors.warranty && <span className="field-error">{errors.warranty[0]}</span>}
                </label>
              </div>
              <label className="product-field product-field-full">
                <span>Product Description</span>
                <textarea name="description" value={editProduct.description} onChange={handleEditChange} rows={5} />
                {errors.description && <span className="field-error">{errors.description[0]}</span>}
              </label>
              <div className="modal-actions">
                <button className="modal-button modal-button-secondary" type="button" onClick={closeEditModal}>Cancel</button>
                <button className="modal-button modal-button-primary" type="submit">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="confirm-overlay" onClick={cancelUpdate}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure?</h3>
            <p>Do you want to update this product?</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel-btn" onClick={cancelUpdate}>No</button>
              <button className="confirm-btn confirm-btn-primary" onClick={confirmUpdate}>Yes, Update</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="product-modal-overlay" role="dialog" aria-modal="true" onClick={closeAddModal}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <div className="product-modal-header">
              <div>
                <p className="modal-subtitle"></p>
                <h2>Add Products</h2>
              </div>
              <button className="modal-close-button" type="button" onClick={closeAddModal} aria-label="Close modal">
                ×
              </button>
            </div>
            <form className="product-form" onSubmit={handleAddSubmit}>
              <div className="product-grid">
                <label className="product-field">
                  <span>Product Name</span>
                  <input type="text" name="name" value={newProduct.name} onChange={handleAddChange}  />
                  {errors.name && <span className="field-error">{errors.name[0]}</span>}
                </label>
                <label className="product-field">
                  <span>Category</span>
                  <input type="text" name="category" value={newProduct.category} onChange={handleAddChange}  />
                  {errors.category && <span className="field-error">{errors.category[0]}</span>}
                </label>
              </div>
              <div className="product-grid-three">
                <label className="product-field">
                  <span>Price</span>
                  <input type="text" name="price" value={newProduct.price} onChange={handleAddChange}  />
                  {errors.price && <span className="field-error">{errors.price[0]}</span>}
                </label>
                <label className="product-field">
                  <span>Quantity</span>
                  <input type="number" name="quantity" value={newProduct.quantity} onChange={handleAddChange} min="0" />
                  {errors.quantity && <span className="field-error">{errors.quantity[0]}</span>}
                </label>
                <label className="product-field">
                  <span>Warranty Type</span>
                  <input type="text" name="warranty" value={newProduct.warranty} onChange={handleAddChange}    />
                  {errors.warranty && <span className="field-error">{errors.warranty[0]}</span>}
                </label>
              </div>
              <label className="product-field product-field-full">
                <span>Product Description</span>
                <textarea name="description" value={newProduct.description} onChange={handleAddChange} rows={5} />
                {errors.description && <span className="field-error">{errors.description[0]}</span>}
              </label>
              <div className="modal-actions">
                <button className="modal-button modal-button-secondary" type="button" onClick={closeAddModal}>Cancel</button>
                <button className="modal-button modal-button-primary" type="submit">Add to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => { setDetailsModalOpen(false); setSelectedProduct(null); }}
          onEdit={(product) => { openEditModal(product); }}
        />
      )}

    </div>
  );
};

export default ManufacturerProducts;