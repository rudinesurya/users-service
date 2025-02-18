import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>
    ) { }

    public async searchUser(params: FilterQuery<IUser>): Promise<IUser[]> {
        return this.userModel.find(params).exec();
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
        userParams: {},
    ): Promise<IUser> {
        return this.userModel.findOneAndUpdate({ _id: id }, userParams, { new: true }).exec();
    }

    public async createUser(user: IUser): Promise<IUser> {
        const userModel = new this.userModel(user);
        return await userModel.save();
    }
}