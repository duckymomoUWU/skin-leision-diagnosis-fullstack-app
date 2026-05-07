import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @ManyToOne(() => Order, (order) => order.order_details)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 4 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: number;
}
