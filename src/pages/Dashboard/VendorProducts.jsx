import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import './VendorProducts.css';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [warrantyFilter, setWarrantyFilter] = useState('All Types');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');



  const fetchProducts = async () => {
    // Debugging logs as requested
    console.log("Debugging Info:");
    console.log("Token exists:", !!localStorage.getItem("jwtToken"));
    console.log("Current role:", localStorage.getItem("role"));

    try {
      setIsLoading(true);
      const data = await productService.getAllVendorProducts();
      console.log("API response status: Success (200)");
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      console.log("API response status: Error", err.response?.status);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
        (p.manufacturerName && p.manufacturerName.toLowerCase().includes(lowerSearch))
      );
    }

    // Category
    if (categoryFilter !== 'All Categories') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Warranty
    if (warrantyFilter !== 'All Types') {
      result = result.filter(p => p.warranty === warrantyFilter);
    }


    if (minPrice) {
      result = result.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Sort
    if (sortBy === 'Newest First') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [products, searchTerm, categoryFilter, warrantyFilter, minPrice, maxPrice, sortBy]);



  const handleReset = () => {
    setSearchTerm('');
    setCategoryFilter('All Categories');
    setWarrantyFilter('All Types');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('Newest First');
  };


  const categories = useMemo(() => {
    return ['All Categories', ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const warranties = useMemo(() => {
    return ['All Types', ...new Set(products.map(p => p.warranty).filter(Boolean))];
  }, [products]);

  return (
    <div className="catalog-page">
      <div className="catalog-header-wrapper">
        <h2 className="catalog-title">Product Catalog</h2>

        <div className="catalog-filters-section">
          <div className="search-bar">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Search product or manufacturer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>

          <div className="filters-row">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
              }}
              className="filter-select"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              value={warrantyFilter}
              onChange={(e) => {
                setWarrantyFilter(e.target.value);
              }}
              className="filter-select"
            >
              {warranties.map(war => <option key={war} value={war}>{war}</option>)}
            </select>

            <div className="price-range">
              <input
                type="number"
                placeholder="₹ Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                }}
              />
              <span>–</span>
              <input
                type="number"
                placeholder="₹ Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                }}
              />
            </div>

            <button className="btn-reset" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      <div className="catalog-results-header">
        <span className="results-count">
          Showing {filteredProducts.length} products
        </span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="Newest First">Newest First</option>
          <option value="Price: Low to High">Price: Low to High</option>
          <option value="Price: High to Low">Price: High to Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="catalog-loading">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="product-card-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/vendor/product-catalog/${product.id}`)}
              >
                <div className="product-card-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                </div>
                <div className="product-card-content">
                  <h3 className="product-name">{product.name || 'Unnamed Product'}</h3>
                  <p className="manufacturer-name">{product.manufacturerName || 'Unknown Manufacturer'}</p>

                  <div className="product-tags">
                    {product.category && <span className="tag category-tag">{product.category}</span>}
                    {product.warranty && <span className="tag warranty-tag">{product.warranty}</span>}
                  </div>

                  <div className="product-card-footer">
                    <span className="product-price">₹{product.price?.toLocaleString()}</span>
                    <button
                      className="btn-add-cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        const savedCart = JSON.parse(localStorage.getItem('vendorCart') || '[]');
                        const existingItem = savedCart.find(item => item.id === product.id);
                        if (existingItem) {
                          existingItem.quantity += 1;
                        } else {
                          savedCart.push({ ...product, quantity: 1 });
                        }
                        localStorage.setItem('vendorCart', JSON.stringify(savedCart));
                        alert(`${product.name} added to cart!`);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </>
      ) : (
        <div className="catalog-empty">
          <span className="material-symbols-outlined">inventory_2</span>
          <p>No products found matching your criteria.</p>
          <button className="btn-reset-large" onClick={handleReset}>Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;