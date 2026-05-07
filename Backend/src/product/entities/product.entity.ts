import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { SkinLesion } from '../../skin-leision/entities/skin-leision.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'clob', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 6, default: 0 })
  stock_quantity: number;

  @Column({ type: 'numeric', precision: 8, default: 0 })
  sold_count: number;

  @Column({ type: 'number', default: 1 })
  is_active: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'number', default: 0 })
  is_deleted: number;

  @ManyToMany(() => SkinLesion)
  @JoinTable({
    name: 'skin_lesion_products',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skin_lesion_id', referencedColumnName: 'id' }
  })
  skin_lesions: SkinLesion[];
}