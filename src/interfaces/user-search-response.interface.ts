import { IUser } from './user.interface';

export interface IUserSearchResponse {
    status: number;
    system_message: string;
    user: IUser | null;
    errors: { [key: string]: any } | null;
}