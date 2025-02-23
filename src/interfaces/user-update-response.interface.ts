import { IUser } from './user.interface';

export interface IUserUpdateResponse {
    status: number;
    system_message: string;
    user: IUser | null;
    errors: { [key: string]: any } | null;
}