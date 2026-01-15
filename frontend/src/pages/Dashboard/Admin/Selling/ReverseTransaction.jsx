import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RotateCcw, Receipt, Package, DollarSign, User, Mail, Phone, 
  Calendar, AlertTriangle, CheckCircle, XCircle, ArrowLeft,
  Clock, TrendingDown
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import shopApi from '../../../../api/shop.api';

const ReverseTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reversing, setReversing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { theme } = useTheme();
  const { user } = useAuth();

  // Load sale details
  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        // Since we don't have a specific endpoint for single sale, we'll get all and filter
        const sales = await shopApi.getSalesHistory();
        const saleData = sales.find(s => s.id === parseInt(id));
        
        if (!saleData) {
          setError('Sale not found');
          return;
        }
        
        setSale(saleData);
        setError('');
      } catch (err) {
        setError('Failed to load sale details. Please try again.');
        console.error('Error fetching sale:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSale();
    }
  }, [id]);

  const handleReverseSale = async () => {
    if (!sale || sale.isReversed) {
      setError('Cannot reverse this sale');
      return;
    }

    try {
      setReversing(true);
      setError('');
      
      const result = await shopApi.reverseSale({ saleId: sale.id });
      
      setSuccess(`Sale successfully reversed! ${sale.quantity} unit(s) of ${sale.productName} returned to inventory.`);
      
      // Update the sale in state to show it's reversed
      setSale(prev => ({
        ...prev,
        isReversed: true
      }));

      // Refresh the page after a delay to show updated status
      setTimeout(() => {
        navigate('/admin/selling/history');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reverse sale. Please try again.');
      console.error('Error reversing sale:', err);
    } finally {
      setReversing(false);
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
      month: 'long', 
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
            Loading sale details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !sale) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`text-center p-8 rounded-2xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-50 border border-red-200'}`}>
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Sale</h3>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/selling/history')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Back to Sales History
          </button>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/selling/history')}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Reverse Transaction</h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {sale ? `Sale #${sale.id}` : 'Loading...'}
              </p>
            </div>
          </div>
          {sale?.isReversed && (
            <div className="px-4 py-2 rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
              Already Reversed
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          theme === 'dark' ? 'bg-red-900/20 border border-red-700/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          theme === 'dark' ? 'bg-emerald-900/20 border border-emerald-700/50 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
        }`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {sale && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sale Details */}
          <div className={`lg:col-span-2 rounded-2xl border p-6 backdrop-blur-sm ${
            theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white/50 border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Transaction Details
            </h2>

            <div className="space-y-6">
              {/* Product Information */}
              <div>
                <h3 className="font-medium text-lg mb-3">Product Information</h3>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                      <Package className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{sale.productName}</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {sale.productCategory}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          Quantity: {sale.quantity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          Unit Price: {formatCurrency(sale.unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="font-medium text-lg mb-3">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</p>
                        <p className="text-xl font-bold text-emerald-500">{formatCurrency(sale.totalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-500/10'}`}>
                        <Calendar className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sale Date</p>
                        <p className="font-medium">{formatDate(sale.saleDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-medium text-lg mb-3">Customer Information</h3>
                {sale.customerName ? (
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className="font-medium">{sale.customerName}</span>
                      </div>
                      {sale.customerEmail && (
                        <div className="flex items-center gap-3">
                          <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span>{sale.customerEmail}</span>
                        </div>
                      )}
                      {sale.customerPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span>{sale.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`p-8 text-center rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'}`}>
                    <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No customer information provided
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <h3 className="font-medium text-lg mb-3">Transaction Status</h3>
                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  sale.isReversed 
                    ? (theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50') 
                    : (theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50')
                }`}>
                  <div className="flex items-center gap-3">
                    {sale.isReversed ? (
                      <>
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-red-500">Reversed</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            This transaction has been cancelled
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-500">Active</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Ready for reversal
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sale.isReversed 
                      ? (theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-600')
                      : (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600')
                  }`}>
                    {sale.isReversed ? 'REVERSED' : 'ACTIVE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reverse Action Panel */}
          <div className={`rounded-2xl border p-6 backdrop-blur-sm ${
            theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white/50 border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Reverse Transaction
            </h2>

            {!sale.isReversed ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'} border border-amber-500/20`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-500">Important Notice</h3>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                        Reversing this transaction will:
                      </p>
                      <ul className={`text-sm mt-2 space-y-1 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                        <li>• Return {sale.quantity} unit(s) to inventory</li>
                        <li>• Reduce total revenue by {formatCurrency(sale.totalAmount)}</li>
                        <li>• Mark this transaction as reversed</li>
                        <li>• Notify administrators of the reversal</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                  <h3 className="font-medium mb-3">Impact Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Inventory Adjustment:</span>
                      <span className="font-medium text-green-500">+{sale.quantity} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Revenue Impact:</span>
                      <span className="font-medium text-red-500">-{formatCurrency(sale.totalAmount)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status Change:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-600'
                        }`}>
                          Active → Reversed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReverseSale}
                  disabled={reversing}
                  className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    reversing
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                  } text-white`}
                >
                  {reversing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Reversal...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      Confirm Reversal
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/admin/selling/history')}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`p-4 rounded-full inline-block mb-4 ${
                  theme === 'dark' ? 'bg-red-500/20' : 'bg-red-50'
                }`}>
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">Transaction Already Reversed</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  This transaction has already been reversed and cannot be processed again.
                </p>
                <button
                  onClick={() => navigate('/admin/selling/history')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Back to Sales History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReverseTransaction;