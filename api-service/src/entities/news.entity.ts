import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './users.entity';
import { Categories } from './categories.entity';
import { Votes } from './votes.entity';

@Entity({
  name: 'news',
})
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ length: 50 })
  title: string;

  @Column({ length: 50 })
  image: string;

  @Column({ length: 150 })
  sumary: string;

  @Column({ length: 500 })
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.news)
  author: User;

  @ManyToOne(() => Categories, (category) => category.news)
  category: Categories;

  @OneToMany(() => Votes, (votes) => votes.news)
  votes: Votes[];
}
