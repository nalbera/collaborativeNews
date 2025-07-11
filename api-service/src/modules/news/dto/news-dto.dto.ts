import { IUser } from 'src/modules/user/user.interface';

export class NewsDto {
  title: string;
  image: string;
  sumary: string;
  text: string;
  author?: IUser;
  category: string;
}
