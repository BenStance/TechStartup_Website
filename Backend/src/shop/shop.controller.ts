import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SellProductDto } from './dto/sell-product.dto';
import { ReverseSaleDto } from './dto/reverse-sale.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    // Only admins and controllers can create products
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can create products');
    }
    return await this.shopService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sales')
  async getSalesHistory(@Request() req) {
    // Only admins and controllers can view sales history
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can access sales history');
    }
    return await this.shopService.getSalesHistory();
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue')
  async getTotalRevenue(@Request() req) {
    // Only admins and controllers can view revenue
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can access revenue data');
    }
    return await this.shopService.getTotalRevenue();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    // Admins and controllers can get all products
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      return await this.shopService.findAll();
    }
    throw new Error('Unauthorized to access products');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Admins and controllers can get a specific product
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      return await this.shopService.findOne(+id);
    }
    throw new Error('Unauthorized to access product');
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    // Only admins and controllers can update products
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can update products');
    }
    return await this.shopService.update(+id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Only admins and controllers can delete products
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can delete products');
    }
    return await this.shopService.remove(+id);
  }

  // Additional endpoints for adjusting stock and price
  @UseGuards(JwtAuthGuard)
  @Put(':id/stock')
  async adjustStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return await this.shopService.adjustStock(+id, quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/price')
  async adjustPrice(@Param('id') id: string, @Body('price') price: number) {
    return await this.shopService.adjustPrice(+id, price);
  }

  // Selling endpoints
  @UseGuards(JwtAuthGuard)
  @Post('sell')
  async sellProduct(@Body() sellProductDto: SellProductDto, @Request() req) {
    // Only admins and controllers can sell products
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can sell products');
    }
    const { productId, quantity, customerName, customerEmail, customerPhone } = sellProductDto;
    return await this.shopService.sellProduct(
      productId, 
      quantity, 
      { name: customerName, email: customerEmail, phone: customerPhone }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('reverse-sale')
  async reverseSale(@Body() reverseSaleDto: ReverseSaleDto, @Request() req) {
    // Only admins and controllers can reverse sales
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can reverse sales');
    }
    return await this.shopService.reverseSale(reverseSaleDto.saleId);
  }
}