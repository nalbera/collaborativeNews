import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { News } from './news.entity';
import { Votes } from './votes.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ length: 50, unique: true })
  email: string;

  @Column({ length: 50, default: null, nullable: true })
  firstName: string;

  @Column({ length: 50, default: null, nullable: true })
  lastName: string;

  @Column({ length: 250, default: null, nullable: true })
  biographi: string;

  @Column({ length: 50, default: null, nullable: true })
  avatar: string;

  @Column({ default: false })
  active: boolean;

  @Column({ length: 10, default: null })
  registrationCode: string;

  @Column({ length: 10, default: null })
  recoverPassCode: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => News, (news) => news.author)
  news: News[];

  @OneToMany(() => Votes, (votes) => votes.user)
  votes: Votes[];
}
