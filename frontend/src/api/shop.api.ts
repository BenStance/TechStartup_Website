import axiosClient from './axiosClient';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stockQuantity?: number;
  imageUrl?: string;
}

export interface AdjustStockRequest {
  quantity: number;
}

export interface AdjustPriceRequest {
  price: number;
}

export interface SellProductRequest {
  productId: number;
  quantity: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface ReverseSaleRequest {
  saleId: number;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  saleDate: string;
  isReversed: boolean;
  createdAt: string;
  updatedAt: string;
}

class ShopApi {
  // Create a new product
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await axiosClient.post('/shop', data);
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const response = await axiosClient.get('/shop');
    // Handle response wrapper from backend interceptor
    const products = response.data.data ?? response.data;
    
    // Map snake_case fields to camelCase
    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      stockQuantity: product.stock_quantity,
      imageUrl: product.image_url || product.imageUrl,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
  }

  // Get product by ID
  async getProductById(id: number): Promise<Product> {
    const response = await axiosClient.get(`/shop/${id}`);
    // Handle response wrapper from backend interceptor
    const product = response.data.data ?? response.data;
    
    // Map snake_case fields to camelCase
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      stockQuantity: product.stock_quantity,
      imageUrl: product.image_url || product.imageUrl,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  // Update product
  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await axiosClient.put(`/shop/${id}`, data);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    await axiosClient.delete(`/shop/${id}`);
  }

  // Adjust stock quantity
  async adjustStock(id: number, data: AdjustStockRequest): Promise<Product> {
    const response = await axiosClient.put(`/shop/${id}/stock`, data);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Adjust price
  async adjustPrice(id: number, data: AdjustPriceRequest): Promise<Product> {
    const response = await axiosClient.put(`/shop/${id}/price`, data);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Upload product image
  async uploadProductImage(productId: number, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post(`/uploads/product/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Sell a product
  async sellProduct(data: SellProductRequest): Promise<Sale> {
    const response = await axiosClient.post('/shop/sell', data);
    // Handle response wrapper from backend interceptor
    const sale = response.data.data ?? response.data;
    
    // Map snake_case fields to camelCase
    return {
      id: sale.id,
      productId: sale.product_id,
      productName: sale.product_name,
      productCategory: sale.product_category,
      quantity: sale.quantity,
      unitPrice: Number(sale.unit_price || sale.unitPrice),
      totalAmount: Number(sale.total_amount || sale.totalAmount),
      customerName: sale.customer_name || sale.customerName,
      customerEmail: sale.customer_email || sale.customerEmail,
      customerPhone: sale.customer_phone || sale.customerPhone,
      saleDate: sale.sale_date || sale.saleDate,
      isReversed: Boolean(sale.is_reversed || sale.isReversed),
      createdAt: sale.created_at || sale.createdAt,
      updatedAt: sale.updated_at || sale.updatedAt
    };
  }

  // Get sales history
  async getSalesHistory(): Promise<Sale[]> {
    const response = await axiosClient.get('/shop/sales');
    // Handle response wrapper from backend interceptor
    const sales = response.data.data ?? response.data;
    
    // Map snake_case fields to camelCase
    return sales.map((sale: any) => ({
      id: sale.id,
      productId: sale.product_id,
      productName: sale.product_name,
      productCategory: sale.product_category,
      quantity: sale.quantity,
      unitPrice: Number(sale.unit_price || sale.unitPrice),
      totalAmount: Number(sale.total_amount || sale.totalAmount),
      customerName: sale.customer_name || sale.customerName,
      customerEmail: sale.customer_email || sale.customerEmail,
      customerPhone: sale.customer_phone || sale.customerPhone,
      saleDate: sale.sale_date || sale.saleDate,
      isReversed: Boolean(sale.is_reversed || sale.isReversed),
      createdAt: sale.created_at || sale.createdAt,
      updatedAt: sale.updated_at || sale.updatedAt
    }));
  }

  // Reverse a sale
  async reverseSale(data: ReverseSaleRequest): Promise<any> {
    const response = await axiosClient.post('/shop/reverse-sale', data);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Get total revenue
  async getTotalRevenue(): Promise<number> {
    const response = await axiosClient.get('/shop/revenue');
    // Handle response wrapper from backend interceptor
    const revenueData = response.data.data ?? response.data;
    return typeof revenueData === 'number' ? revenueData : Number(revenueData.total_revenue || revenueData.totalRevenue || 0);
  }
}

export default new ShopApi();