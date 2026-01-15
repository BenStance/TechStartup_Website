import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Package, DollarSign, User, Mail, Phone, 
  Plus, Minus, CheckCircle, AlertCircle, CreditCard,
  Tag, Calendar, TrendingUp
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import shopApi from '../../../../api/shop.api';

const SellProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const { theme } = useTheme();
  const { user } = useAuth();

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await shopApi.getAllProducts();
        // Filter out products with zero or negative stock
        const availableProducts = productsData.filter(p => p.stockQuantity > 0);
        setProducts(availableProducts);
        setError('');
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear success/error messages when user starts typing
    if (success) setSuccess('');
    if (error && field !== 'productId') setError('');
  };

  const handleProductChange = (productId) => {
    setFormData(prev => ({
      ...prev,
      productId,
      quantity: 1 // Reset quantity when product changes
    }));
    setError('');
    setSuccess('');
  };

  const incrementQuantity = () => {
    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    if (selectedProduct && formData.quantity < selectedProduct.stockQuantity) {
      setFormData(prev => ({
        ...prev,
        quantity: prev.quantity + 1
      }));
    }
  };

  const decrementQuantity = () => {
    if (formData.quantity > 1) {
      setFormData(prev => ({
        ...prev,
        quantity: prev.quantity - 1
      }));
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === parseInt(formData.productId));
  };

  const calculateTotal = () => {
    const product = getSelectedProduct();
    if (!product) return 0;
    return product.price * formData.quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId) {
      setError('Please select a product');
      return;
    }

    const product = getSelectedProduct();
    if (formData.quantity > product.stockQuantity) {
      setError(`Cannot sell more than ${product.stockQuantity} units available`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const saleData = {
        productId: parseInt(formData.productId),
        quantity: formData.quantity,
        customerName: formData.customerName || undefined,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined
      };

      const result = await shopApi.sellProduct(saleData);
      
      setSuccess(`Successfully sold ${formData.quantity} unit(s) of ${product.name} for ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(result.totalAmount)}!`);
      
      // Reset form except customer info (keep for convenience)
      setFormData(prev => ({
        ...prev,
        productId: '',
        quantity: 1
      }));

      // Refresh products to show updated stock
      const updatedProducts = await shopApi.getAllProducts();
      const availableProducts = updatedProducts.filter(p => p.stockQuantity > 0);
      setProducts(availableProducts);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale. Please try again.');
      console.error('Error selling product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 ${theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50'
          : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-gray-200/50'
          } backdrop-blur-sm`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sell Products</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Process product sales and manage inventory
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Form */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white/50 border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            New Sale
          </h2>

          {error && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
              theme === 'dark' ? 'bg-red-900/20 border border-red-700/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
              theme === 'dark' ? 'bg-emerald-900/20 border border-emerald-700/50 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            }`}>
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Product *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className={`w-full p-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800/70 border-gray-600 text-white'
                    : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.category} (Stock: {product.stockQuantity})
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No products available for sale. Please check inventory.
                </p>
              )}
            </div>

            {/* Quantity */}
            {formData.productId && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    disabled={formData.quantity <= 1}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={getSelectedProduct()?.stockQuantity || 1}
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    className={`w-20 text-center p-2 rounded-lg border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-gray-800/70 border-gray-600 text-white'
                        : 'bg-white/80 border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    disabled={formData.quantity >= (getSelectedProduct()?.stockQuantity || 1)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    of {getSelectedProduct()?.stockQuantity} available
                  </span>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer Email
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="customer@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer Phone
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="+255 XXX XXX XXX"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {formData.productId && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="font-medium">{getSelectedProduct()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Price:</span>
                    <span>{formatCurrency(getSelectedProduct()?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold text-lg text-blue-500">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.productId || products.length === 0}
              className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                submitting || !formData.productId || products.length === 0
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Sale...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Complete Sale
                </>
              )}
            </button>
          </form>
        </div>

        {/* Product Info Panel */}
        <div className={`rounded-2xl border p-6 backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white/50 border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Details
          </h2>

          {formData.productId ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{getSelectedProduct()?.name}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getSelectedProduct()?.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Category:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                    {getSelectedProduct()?.category}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Price:</span>
                  <span className="font-medium">{formatCurrency(getSelectedProduct()?.price || 0)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Available Stock:</span>
                  <span className={`font-medium ${getSelectedProduct()?.stockQuantity > 10 ? 'text-green-500' : getSelectedProduct()?.stockQuantity > 5 ? 'text-amber-500' : 'text-red-500'}`}>
                    {getSelectedProduct()?.stockQuantity} units
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Total Value:</span>
                    <span className="text-xl font-bold text-blue-500">
                      {formatCurrency((getSelectedProduct()?.price || 0) * (getSelectedProduct()?.stockQuantity || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a product to view details
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <h3 className="font-medium mb-4">Inventory Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Products:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Low Stock Items:</span>
                <span className="font-medium text-amber-500">
                  {products.filter(p => p.stockQuantity <= 5).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Inventory Value:</span>
                <span className="font-medium">
                  {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellProducts;