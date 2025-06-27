import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './users.entity';
import { News } from './news.entity';

@Entity({
  name: 'votes',
})
export class Votes {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'integer' })
  positiveVotes: number;

  @Column({ type: 'integer' })
  negativeVotes: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.votes)
  user: User;

  @ManyToOne(() => News, (news) => news.votes)
  news: News;
}
