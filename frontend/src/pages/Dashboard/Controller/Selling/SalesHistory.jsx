import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Search, Filter, MoreVertical, 
  ChevronRight, ChevronDown, Calendar, 
  DollarSign, Package, User, Clock, CheckCircle, AlertCircle,
  TrendingUp, ArrowRight, X, Loader2, RotateCcw, Eye
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import shopApi from '../../../../api/shop.api';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('saleDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load sales history
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const salesData = await shopApi.getSalesHistory();
        setSales(salesData);
        setError('');
      } catch (err) {
        setError('Failed to load sales history. Please try again.');
        console.error('Error fetching sales:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const getStatusColor = (isReversed) => {
    if (isReversed) {
      return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
    }
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
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

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredSales = sales
    .filter(sale => {
      const matchesSearch = 
        (sale.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && !sale.isReversed) ||
                           (statusFilter === 'reversed' && sale.isReversed);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'productName') {
        aValue = (a.productName ?? '').toLowerCase();
        bValue = (b.productName ?? '').toLowerCase();
      } else if (sortBy === 'customerName') {
        aValue = (a.customerName ?? '').toLowerCase();
        bValue = (b.customerName ?? '').toLowerCase();
      } else if (sortBy === 'quantity') {
        aValue = Number(a.quantity || 0);
        bValue = Number(b.quantity || 0);
      } else if (sortBy === 'totalAmount') {
        aValue = Number(a.totalAmount || 0);
        bValue = Number(b.totalAmount || 0);
      } else {
        // Default sort by saleDate
        const aDate = a.saleDate ? new Date(a.saleDate).getTime() : Date.now();
        const bDate = b.saleDate ? new Date(b.saleDate).getTime() : Date.now();
        aValue = aDate;
        bValue = bDate;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const totalRevenue = sales
    .filter(sale => !sale.isReversed)
    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  const totalReversed = sales
    .filter(sale => sale.isReversed)
    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Sales History</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage all product sales transactions
            </p>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">{sales.length} total transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Active Revenue: {formatCurrency(totalRevenue)}</span>
              </div>
              {totalReversed > 0 && (
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">Reversed: {formatCurrency(totalReversed)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Transactions', 
            value: sales.length, 
            color: 'bg-blue-500', 
            icon: Receipt,
            change: '+12%',
            changeColor: 'text-green-500'
          },
          { 
            label: 'Active Revenue', 
            value: formatCurrency(totalRevenue), 
            color: 'bg-emerald-500', 
            icon: DollarSign,
            change: '+8%',
            changeColor: 'text-green-500'
          },
          { 
            label: 'Active Sales', 
            value: sales.filter(s => !s.isReversed).length, 
            color: 'bg-purple-500', 
            icon: CheckCircle,
            change: '+5%',
            changeColor: 'text-green-500'
          },
          { 
            label: 'Reversed Sales', 
            value: sales.filter(s => s.isReversed).length, 
            color: 'bg-red-500', 
            icon: RotateCcw,
            change: '-2%',
            changeColor: 'text-red-500'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/30 border border-gray-700' : 'bg-white/50 border border-gray-200'} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.changeColor}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}/20`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className={`p-6 rounded-2xl border backdrop-blur-sm ${theme === 'dark'
        ? 'bg-gray-800/30 border-gray-700'
        : 'bg-white/50 border-gray-200'
        }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="search"
                placeholder="Search by product or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active Sales</option>
              <option value="reversed">Reversed Sales</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="saleDate">Date</option>
              <option value="productName">Product Name</option>
              <option value="customerName">Customer Name</option>
              <option value="quantity">Quantity</option>
              <option value="totalAmount">Amount</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white hover:bg-gray-700/70'
                : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-gray-100/80'
                }`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className={`rounded-2xl border overflow-hidden backdrop-blur-sm ${theme === 'dark'
        ? 'bg-gray-800/30 border-gray-700'
        : 'bg-white/50 border-gray-200'
        }`}>
        {error && (
          <div className={`p-4 m-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {filteredSales.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Receipt className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No sales found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search or filters' : 'No sales recorded yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>  
                  <th className="text-left p-6 font-medium">Transaction</th>
                  <th className="text-left p-6 font-medium">Product</th>
                  <th className="text-left p-6 font-medium">Customer</th>
                  <th className="text-left p-6 font-medium">Quantity</th>
                  <th className="text-left p-6 font-medium">Amount</th>
                  <th className="text-left p-6 font-medium">Status</th>
                  <th className="text-left p-6 font-medium">Date</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const statusColors = getStatusColor(sale.isReversed);
                  return (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'}`}
                      transition-colors
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${statusColors.bg} ${statusColors.border} border`}>
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">#{sale.id}</div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Sale ID
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          <div className="font-medium">{sale.productName}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {sale.productCategory}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          {sale.customerName ? (
                            <>
                              <div className="font-medium">{sale.customerName}</div>
                              {sale.customerEmail && (
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {sale.customerEmail}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className={`italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              No customer info
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-medium">{sale.quantity}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          @ {formatCurrency(sale.unitPrice)}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-blue-500">{formatCurrency(sale.totalAmount)}</div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {sale.isReversed ? 'Reversed' : 'Active'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(sale.saleDate)}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/dashboard/controller/selling/history/${sale.id}`)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                              : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                              }`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredSales.length > 0 && (
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredSales.length} of {sales.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                  : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                  }`}
                disabled
              >
                ← Previous
              </button>
              <span className="px-3 py-2">1</span>
              <button
                className={`px-3 py-2 rounded-lg transition-colors ${theme === 'dark'
                  ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                  : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                  }`}
                disabled
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;