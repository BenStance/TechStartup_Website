import React, { useState, useEffect } from 'react';
import { shopApi } from '../../../api';
import Button from '../../../components/ui/Button';

// Add formatCurrency function since it's not properly imported
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS'
  }).format(amount || 0);
};

const ShopProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await shopApi.getAllProducts();
        setProducts(productsData);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shop Products</h1>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300">
            Add New Product
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  </div>
                  {product.stockQuantity <= 5 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stockQuantity}</p>
                </div>
                <div className="mt-6 flex justify-between">
                  <a 
                    href={`/shop/${product.id}`} 
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View Details
                  </a>
                  <div className="space-x-2">
                    <a 
                      href={`/shop/${product.id}/edit`} 
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Edit
                    </a>
                    <button className="text-red-600 hover:text-red-900 font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
            <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300">
              Add Your First Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProductsList;