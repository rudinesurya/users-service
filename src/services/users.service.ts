import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { IUserUpdate } from 'src/interfaces/user-update.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>
    ) { }

    public async searchUser(query: FilterQuery<IUser>): Promise<IUser[]> {
        return this.userModel.find(query).exec();
    }

    public async searchUserById(id: string): Promise<IUser | null> {
        return this.userModel.findById(id).exec();
    }

    public async searchUserByEmail(email: string): Promise<IUser | null> {
        return this.userModel.findOne({ email }).exec();
    }

    public async searchUserByHandle(handle: string): Promise<IUser | null> {
        return this.userModel.findOne({ handle }).exec();
    }

    public async updateUserById(
        id: string,
        updateData: Partial<IUserUpdate>,
    ): Promise<IUser> {
        return this.userModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).exec();
    }

    public async createUser(user: IUser): Promise<IUser> {
        const userModel = new this.userModel(user);
        return await userModel.save();
    }
}