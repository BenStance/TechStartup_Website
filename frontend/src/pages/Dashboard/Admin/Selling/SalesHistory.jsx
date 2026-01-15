import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Receipt, Package, DollarSign, User, Calendar, Search, 
  Filter, Download, Eye, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import shopApi from '../../../../api/shop.api';

const SalesHistory = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { theme } = useTheme();
  const { user } = useAuth();

  // Load sales history
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const salesData = await shopApi.getSalesHistory();
        setSales(salesData);
        setFilteredSales(salesData);
      } catch (err) {
        console.error('Error fetching sales history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Filter sales based on search term and status
  useEffect(() => {
    let filtered = sales;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sale => 
        filterStatus === 'active' ? !sale.isReversed : sale.isReversed
      );
    }

    setFilteredSales(filtered);
  }, [sales, searchTerm, filterStatus]);

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

  const getStatusBadge = (isReversed) => {
    if (isReversed) {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          theme === 'dark' 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-red-500/10 text-red-600 border border-red-500/20'
        }`}>
          Reversed
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        theme === 'dark' 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
      }`}>
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading sales history...
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales History</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage all sales transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {filteredSales.length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800/30 border border-gray-700' : 'bg-white/50 border border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by product, customer, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-600 text-white' 
                  : 'bg-white/50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="text-xl font-semibold mb-2">No Sales Found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || filterStatus !== 'all' 
                ? 'No sales match your current filters.' 
                : 'No sales transactions recorded yet.'}
            </p>
            <button
              onClick={() => navigate('/admin/selling')}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Start Selling
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Product</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Customer</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, index) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-t ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50/50'}`}
                  >
                    <td className="px-6 py-4 font-mono text-sm">#SALE-{sale.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                          <Package className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">{sale.productName}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {sale.productCategory}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sale.customerName ? (
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span>{sale.customerName}</span>
                        </div>
                      ) : (
                        <span className={`italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Walk-in customer</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{sale.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}`} />
                        <span className="font-bold text-emerald-500">{formatCurrency(sale.totalAmount)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        {formatDate(sale.saleDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(sale.isReversed)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/selling/history/${sale.id}`)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                            : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;