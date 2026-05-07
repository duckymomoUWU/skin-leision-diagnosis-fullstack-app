import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from '../order_detail/entities/order_detail.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async create(patientId: number, createOrderDto: any): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderDetailsToSave = [];

      // Iterate through items to validate stock and calculate total
      for (const item of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product_id, is_deleted: 0 },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.product_id} not found`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${product.title}`);
        }

        // Deduct stock and increment sold_count
        product.stock_quantity -= item.quantity;
        product.sold_count += item.quantity;
        await queryRunner.manager.save(Product, product);

        // Calculate subtotal
        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        // Prepare order detail
        const orderDetail = queryRunner.manager.create(OrderDetail, {
          product_id: product.id,
          quantity: item.quantity,
          unit_price: product.price,
          subtotal: subtotal,
        });
        orderDetailsToSave.push(orderDetail);
      }

      // Create Order
      const order = queryRunner.manager.create(Order, {
        patient_id: patientId,
        shipping_addr: createOrderDto.shipping_addr,
        payment_method: createOrderDto.payment_method,
        notes: createOrderDto.notes,
        total_amount: totalAmount,
        status: 'PENDING',
        payment_status: 'PENDING',
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Attach order_id to details and save
      for (const detail of orderDetailsToSave) {
        detail.order_id = savedOrder.id;
        await queryRunner.manager.save(OrderDetail, detail);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { is_deleted: 0 },
      relations: ['patient', 'order_details', 'order_details.product'],
      order: { order_date: 'DESC' },
    });
  }

  async findMy(patientId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { patient_id: patientId, is_deleted: 0 },
      relations: ['order_details', 'order_details.product'],
      order: { order_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, is_deleted: 0 },
      relations: ['patient', 'order_details', 'order_details.product'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    await this.orderRepository.update(id, { status });
    return this.findOne(id);
  }
}
