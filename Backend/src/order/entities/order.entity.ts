import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderDetail } from '../../order_detail/entities/order_detail.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patient_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 15, default: 'PENDING' })
  status: string;

  @Column({ type: 'varchar', length: 300 })
  shipping_addr: string;

  @Column({ type: 'varchar', length: 30 })
  payment_method: string;

  @Column({ type: 'varchar', length: 15, default: 'PENDING' })
  payment_status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ type: 'number', default: 0 })
  is_deleted: number;

  @CreateDateColumn()
  order_date: Date;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, { cascade: true })
  order_details: OrderDetail[];
}