import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './services/users.service';
import { IUser } from './interfaces/user.interface';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';
import { IUserSearchResponse } from './interfaces/user-search-response.interface';
import { IUserUpdateResponse } from './interfaces/user-update-response.interface';
import { IUserUpdate } from './interfaces/user-update.interface';
import logger from '@rudinesurya/logger';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @MessagePattern('user_search_by_credentials')
    public async searchUserByCredentials(params: { email: string; password: string; }): Promise<IUserSearchResponse> {
        logger.info(`Received request to searchUserByCredentials`, { email: params?.email, password: '<secret>' });

        if (!params?.email || !params?.password) {
            logger.warn(`Missing email or password in request`);
            return {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_search_by_credentials_bad_request',
                user: null,
                errors: null,
            };
        }

        const user = await this.usersService.searchUserByEmail(params.email);
        if (!user) {
            logger.warn(`User not found for email: ${params?.email}`);
            return {
                status: HttpStatus.NOT_FOUND,
                system_message: 'user_search_by_credentials_not_found',
                user: null,
                errors: null,
            };
        }

        const isPasswordMatch = await user.compareEncryptedPassword(params.password);
        if (!isPasswordMatch) {
            logger.warn(`Password mismatch for email: ${params?.email}`);
            return {
                status: HttpStatus.NOT_FOUND,
                system_message: 'user_search_by_credentials_not_match',
                user: null,
                errors: null,
            };
        }

        logger.info(`User authentication successful`);
        return {
            status: HttpStatus.OK,
            system_message: 'user_search_by_credentials_success',
            user: user,
            errors: null,
        };
    }

    @MessagePattern('user_get_by_id')
    public async getUserById({ id }): Promise<IUserSearchResponse> {
        logger.info(`Received request to getUserById`, { id });

        if (!id) {
            logger.warn(`Missing user ID in request`);
            return {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_get_by_id_bad_request',
                user: null,
                errors: null,
            };
        }

        const user = await this.usersService.searchUserById(id);
        if (!user) {
            logger.warn(`User not found`, { id });
            return {
                status: HttpStatus.NOT_FOUND,
                system_message: 'user_get_by_id_not_found',
                user: null,
                errors: null,
            };
        }

        logger.info(`User found`, { id });
        return {
            status: HttpStatus.OK,
            system_message: 'user_get_by_id_success',
            user,
            errors: null,
        };
    }

    @MessagePattern('user_get_by_handle')
    public async getUserByHandle({ handle }): Promise<IUserSearchResponse> {
        logger.info(`Received getUserByHandle request`, { handle });

        if (!handle) {
            logger.warn(`Missing handle in request`);
            return {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_get_by_handle_bad_request',
                user: null,
                errors: null,
            };
        }

        const user = await this.usersService.searchUserByHandle(handle);
        if (!user) {
            logger.warn(`User not found for handle`, { handle });
            return {
                status: HttpStatus.NOT_FOUND,
                system_message: 'user_get_by_handle_not_found',
                user: null,
                errors: null,
            };
        }

        logger.info(`User found`, { handle });
        return {
            status: HttpStatus.OK,
            system_message: 'user_get_by_handle_success',
            user,
            errors: null,
        };
    }

    @MessagePattern('user_create')
    public async createUser(params: { createData: IUser }): Promise<IUserCreateResponse> {
        logger.info(`Received createUser request`, { email: params?.createData?.email });

        if (!params?.createData?.email) {
            logger.warn(`Missing email in createUser request`);
            return {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_create_bad_request',
                user: null,
                errors: null,
            };
        }

        const existingUsers = await this.usersService.searchUser({ email: params.createData.email });
        if (existingUsers.length > 0) {
            logger.warn(`Email already exists`, { email: params.createData.email });
            return {
                status: HttpStatus.CONFLICT,
                system_message: 'user_create_conflict',
                user: null,
                errors: { email: { system_message: 'Email already exists', path: 'email' } },
            };
        }

        try {
            const createdUser = await this.usersService.createUser(params.createData);
            delete createdUser.password;
            logger.info(`User created successfully`, { userId: createdUser.id });
            return {
                status: HttpStatus.CREATED,
                system_message: 'user_create_success',
                user: createdUser,
                errors: null,
            };
        } catch (error) {
            logger.error(`Error creating user`, { error: error.message, stack: error.stack });
            return {
                status: HttpStatus.PRECONDITION_FAILED,
                system_message: 'user_create_precondition_failed',
                user: null,
                errors: error.errors,
            };
        }
    }

    @MessagePattern('user_update')
    public async updateUser(params: { id: string; updateData: IUserUpdate }): Promise<IUserUpdateResponse> {
        logger.info(`Received updateUser request`, { id: params?.id });

        if (!params?.id || !params?.updateData) {
            logger.warn(`Missing user ID or update data`);
            return {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_update_bad_request',
                user: null,
                errors: null,
            };
        }

        const user = await this.usersService.searchUserById(params.id);
        if (!user) {
            logger.warn(`User not found for update`, { id: params.id });
            return {
                status: HttpStatus.NOT_FOUND,
                system_message: 'user_update_not_found',
                user: null,
                errors: null,
            };
        }

        try {
            const updatedUser = await this.usersService.updateUserById(params.id, params.updateData);
            logger.info(`User updated successfully`, { userId: updatedUser.id });
            return {
                status: HttpStatus.OK,
                system_message: 'user_update_success',
                user: updatedUser,
                errors: null,
            };
        } catch (error) {
            logger.error(`Error updating user`, { error: error.message, stack: error.stack });
            return {
                status: HttpStatus.PRECONDITION_FAILED,
                system_message: 'user_update_precondition_failed',
                user: null,
                errors: error.errors,
            };
        }
    }
}