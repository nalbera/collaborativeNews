export interface IUser {
  id?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  biography?: string;
  avatar?: string;
  active?: boolean;
  registrationCode?: string;
  recoverPassCode?: string;
}
