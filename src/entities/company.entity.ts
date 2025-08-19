import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cnpj: string;

  @Column({ type: 'uuid' })
  user_manager_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => User, (user) => user.managed_companies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_manager_id' })
  user_manager: User;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.company)
  restaurants: Restaurant[];
}

// Importação circular resolvida
import { Restaurant } from './restaurant.entity';
