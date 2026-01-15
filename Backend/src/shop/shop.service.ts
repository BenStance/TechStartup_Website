import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/constants/notification-types.constant';

@Injectable()
export class ShopService {
  constructor(
    private databaseService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const result = await this.databaseService.executeQuery(
        `INSERT INTO products (name, description, price, category, stock_quantity, image_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          createProductDto.name,
          createProductDto.description,
          createProductDto.price,
          createProductDto.category,
          createProductDto.stockQuantity,
          createProductDto.imageUrl || null
        ]
      );

      // Get the created product
      const createdProduct = await this.databaseService.executeQuery(
        'SELECT * FROM products WHERE id = ?',
        [result.lastInsertRowid]
      );

      // Send notification to all admins about new product creation
      await this.sendAdminNotification(
        'New Product Added',
        `A new product "${createProductDto.name}" has been added to the shop with ${createProductDto.stockQuantity} units in stock.`
      );

      return createdProduct[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const products = await this.databaseService.executeQuery(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.databaseService.executeQuery(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return product[0] || null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      
      if (updateProductDto.name !== undefined) {
        fields.push('name = ?');
        values.push(updateProductDto.name);
      }
      
      if (updateProductDto.description !== undefined) {
        fields.push('description = ?');
        values.push(updateProductDto.description);
      }
      
      if (updateProductDto.price !== undefined) {
        fields.push('price = ?');
        values.push(updateProductDto.price);
      }
      
      if (updateProductDto.category !== undefined) {
        fields.push('category = ?');
        values.push(updateProductDto.category);
      }
      
      if (updateProductDto.stockQuantity !== undefined) {
        fields.push('stock_quantity = ?');
        values.push(updateProductDto.stockQuantity);
      }
      
      if (updateProductDto.imageUrl !== undefined) {
        fields.push('image_url = ?');
        values.push(updateProductDto.imageUrl);
      }
      
      // Always update the updated_at timestamp
      fields.push("updated_at = datetime('now')");
      
      if (fields.length === 1) {
        // Only timestamp would be updated
        return existingProduct;
      }

      values.push(id); // For the WHERE clause

      const updateQuery = `
        UPDATE products 
        SET ${fields.join(', ')}
        WHERE id = ?
      `;

      await this.databaseService.executeQuery(updateQuery, values);

      // Get the updated product
      const updatedProduct = await this.findOne(id);
      
      // Send notification if stock quantity was updated
      if (updateProductDto.stockQuantity !== undefined) {
        await this.sendAdminNotification(
          'Product Stock Updated',
          `Stock quantity for product "${existingProduct.name}" has been updated to ${updateProductDto.stockQuantity} units.`
        );
      }
      
      return updatedProduct;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);
      if (!existingProduct) {
        return { message: 'Product not found', deleted: false };
      }

      // Delete the product
      const result = await this.databaseService.executeQuery(
        'DELETE FROM products WHERE id = ?',
        [id]
      );

      if (result.changes > 0) {
        // Send notification to all admins about product deletion
        await this.sendAdminNotification(
          'Product Removed',
          `Product "${existingProduct.name}" has been removed from the shop.`
        );
        
        return { message: 'Product deleted successfully', deleted: true };
      }

      return { message: 'Product not found', deleted: false };
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  // Additional methods for adjusting stock quantity and price
  async adjustStock(id: number, quantity: number) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Update stock quantity
      const result = await this.databaseService.executeQuery(
        `UPDATE products 
         SET stock_quantity = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [quantity, id]
      );

      // Get the updated product
      const updatedProduct = await this.findOne(id);
      
      // Send notification to all admins about stock adjustment
      await this.sendAdminNotification(
        'Product Stock Adjusted',
        `Stock quantity for product "${existingProduct.name}" has been adjusted to ${quantity} units.`
      );
      
      // Send low stock alert if quantity is low
      if (quantity < 10) {
        await this.sendAdminNotification(
          'Low Stock Alert',
          `Product "${existingProduct.name}" is running low on stock (${quantity} units remaining). Please consider restocking.`
        );
      }
      
      return updatedProduct;
    } catch (error) {
      console.error(`Error adjusting stock for product ${id}:`, error);
      throw error;
    }
  }

  async adjustPrice(id: number, price: number) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Update price
      const result = await this.databaseService.executeQuery(
        `UPDATE products 
         SET price = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [price, id]
      );

      // Get the updated product
      const updatedProduct = await this.findOne(id);
      
      // Send notification to all admins about price adjustment
      await this.sendAdminNotification(
        'Product Price Adjusted',
        `Price for product "${existingProduct.name}" has been adjusted to $${price.toFixed(2)}.`
      );
      
      return updatedProduct;
    } catch (error) {
      console.error(`Error adjusting price for product ${id}:`, error);
      throw error;
    }
  }
  
  // Helper method to send notifications to all admins
  private async sendAdminNotification(title: string, message: string) {
    try {
      // Get all admins
      const admins = await this.databaseService.executeQuery(
        "SELECT id FROM users WHERE role = 'admin'"
      );
      
      // Send notification to each admin
      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.id,
          title,
          message,
          type: NotificationType.SHOP_UPDATE,
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  async sellProduct(productId: number, quantity: number, customerInfo?: { name?: string; email?: string; phone?: string }) {
    try {
      // Check if product exists and get current details
      const product = await this.databaseService.executeQuery(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );
      
      if (!product || product.length === 0) {
        throw new Error('Product not found');
      }
      
      const productDetails = product[0];
      
      // Check if there's enough stock
      if (productDetails.stock_quantity < quantity) {
        throw new Error(`Insufficient stock. Only ${productDetails.stock_quantity} units available.`);
      }
      
      // Calculate total amount
      const totalAmount = productDetails.price * quantity;
      
      // Begin transaction - update product and insert sale
      await this.databaseService.executeQuery(
        'BEGIN TRANSACTION'
      );
      
      // Update product stock and sold quantity
      await this.databaseService.executeQuery(
        `UPDATE products 
         SET stock_quantity = stock_quantity - ?, 
             sold_quantity = sold_quantity + ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [quantity, quantity, productId]
      );
      
      // Insert sale record
      const saleResult = await this.databaseService.executeQuery(
        `INSERT INTO sales (product_id, quantity, unit_price, total_amount, customer_name, customer_email, customer_phone, sale_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
        [
          productId,
          quantity,
          productDetails.price,
          totalAmount,
          customerInfo?.name || null,
          customerInfo?.email || null,
          customerInfo?.phone || null
        ]
      );
      
      // Commit transaction
      await this.databaseService.executeQuery('COMMIT');
      
      // Get the created sale record
      const createdSale = await this.databaseService.executeQuery(
        'SELECT * FROM sales WHERE id = ?',
        [saleResult.lastInsertRowid]
      );
      
      // Send notification to all admins about the sale
      await this.sendAdminNotification(
        'Product Sold',
        `Product "${productDetails.name}" has been sold. Quantity: ${quantity}, Amount: $${totalAmount.toFixed(2)}. Customer: ${customerInfo?.name || 'Unknown'}`
      );
      
      return {
        sale: createdSale[0],
        updatedProduct: {
          ...productDetails,
          stock_quantity: productDetails.stock_quantity - quantity,
          sold_quantity: productDetails.sold_quantity + quantity
        }
      };
    } catch (error) {
      // Rollback transaction on error
      await this.databaseService.executeQuery('ROLLBACK');
      console.error('Error selling product:', error);
      throw error;
    }
  }

  async getSalesHistory() {
    try {
      console.log('About to execute sales query...');
      
      // Get sales with product information using LEFT JOIN
      // Filter out records where product_id is NULL to prevent errors
      const sales = await this.databaseService.executeQuery(
        `SELECT s.*, 
                CASE 
                  WHEN p.name IS NOT NULL THEN p.name 
                  ELSE 'Product Deleted' 
                END as product_name,
                CASE 
                  WHEN p.category IS NOT NULL THEN p.category 
                  ELSE 'N/A' 
                END as product_category
         FROM sales s
         LEFT JOIN products p ON s.product_id = p.id
         ORDER BY s.sale_date DESC`
      );
      
      console.log('Sales query executed, found', sales.length, 'records');
      
      // Ensure is_reversed field is properly converted to boolean
      const result = sales.map(sale => ({
        ...sale,
        is_reversed: Boolean(sale.is_reversed)
      }));
      
      console.log('Mapped sales data:', result.length > 0 ? result[0] : 'No records');
      return result;
    } catch (error) {
      console.error('Error fetching sales history:', error);
      throw error;
    }
  }

  async reverseSale(saleId: number) {
    try {
      // Get the sale details
      const sales = await this.databaseService.executeQuery(
        'SELECT * FROM sales WHERE id = ?',
        [saleId]
      );
      
      if (!sales || sales.length === 0) {
        throw new Error('Sale not found');
      }
      
      const sale = sales[0];
      
      // Get the product details
      const productResult = await this.databaseService.executeQuery(
        'SELECT * FROM products WHERE id = ?',
        [sale.product_id]
      );
      
      if (!productResult || productResult.length === 0) {
        throw new Error('Product associated with sale not found');
      }
      
      const product = productResult[0];
      
      // Begin transaction
      await this.databaseService.executeQuery('BEGIN TRANSACTION');

      // Update product stock and sold quantity
      await this.databaseService.executeQuery(
        `UPDATE products 
         SET stock_quantity = stock_quantity + ?, 
             sold_quantity = CASE 
               WHEN sold_quantity >= ? THEN sold_quantity - ? 
               ELSE 0 
             END,
             updated_at = datetime('now')
         WHERE id = ?`,
        [sale.quantity, sale.quantity, sale.quantity, sale.product_id]
      );
      
      // Mark the sale as reversed by updating it
      await this.databaseService.executeQuery(
        `UPDATE sales 
         SET is_reversed = 1, updated_at = datetime('now')
         WHERE id = ?`,
        [saleId]
      );
      
      // Commit transaction
      await this.databaseService.executeQuery('COMMIT');
      
      // Send notification to all admins about the reversed sale
      await this.sendAdminNotification(
        'Sale Reversed',
        `Sale for product "${product.name}" has been reversed. Quantity: ${sale.quantity}, Amount: $${sale.total_amount.toFixed(2)}. Sale ID: ${saleId}. Revenue reduced by $${sale.total_amount.toFixed(2)}.`
      );
      
      return {
        message: 'Sale reversed successfully',
        saleId,
        reversedQuantity: sale.quantity,
        reversedAmount: sale.total_amount,
        updatedProduct: {
          ...product,
          stock_quantity: product.stock_quantity + sale.quantity,
          sold_quantity: Math.max(0, product.sold_quantity - sale.quantity)
        }
      };
    } catch (error) {
      // Rollback transaction on error
      await this.databaseService.executeQuery('ROLLBACK');
      console.error('Error reversing sale:', error);
      throw error;
    }
  }

  async getTotalRevenue() {
    try {
      const result = await this.databaseService.executeQuery(
        'SELECT SUM(total_amount) as total_revenue FROM sales WHERE created_at IS NOT NULL AND is_reversed = 0'
      );
      
      return parseFloat(result[0].total_revenue || 0);
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      throw error;
    }
  }
}