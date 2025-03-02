import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';

import { UsersService } from './services/users.service';
import { IUser } from './interfaces/user.interface';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';
import { IUserSearchResponse } from './interfaces/user-search-response.interface';
import { IUserUpdateResponse } from './interfaces/user-update-response.interface';
import { IUserUpdate } from './interfaces/user-update.interface';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @MessagePattern('user_search_by_credentials')
    public async searchUserByCredentials(params: { email: string; password: string; }): Promise<IUserSearchResponse> {
        let result: IUserSearchResponse;

        if (params && params.email && params.password) {
            const user = await this.usersService.searchUserByEmail(params.email);

            if (user) {
                if (await user.compareEncryptedPassword(params.password)) {
                    result = {
                        status: HttpStatus.OK,
                        system_message: 'user_search_by_credentials_success',
                        user: user,
                        errors: null,
                    };
                } else {
                    result = {
                        status: HttpStatus.NOT_FOUND,
                        system_message: 'user_search_by_credentials_not_match',
                        user: null,
                        errors: null,
                    };
                }
            } else {
                result = {
                    status: HttpStatus.NOT_FOUND,
                    system_message: 'user_search_by_credentials_not_found',
                    user: null,
                    errors: null,
                };
            }
        } else {
            result = {
                status: HttpStatus.NOT_FOUND,
                system_message: 'user_search_by_credentials_not_found',
                user: null,
                errors: null,
            };
        }

        return result;
    }

    @MessagePattern('user_get_by_id')
    public async getUserById({ id }): Promise<IUserSearchResponse> {
        let result: IUserSearchResponse;

        if (id) {
            const user = await this.usersService.searchUserById(id);
            if (user) {
                result = {
                    status: HttpStatus.OK,
                    system_message: 'user_get_by_id_success',
                    user,
                    errors: null,
                };
            } else {
                result = {
                    status: HttpStatus.NOT_FOUND,
                    system_message: 'user_get_by_id_not_found',
                    user: null,
                    errors: null,
                };
            }
        } else {
            result = {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_get_by_id_bad_request',
                user: null,
                errors: null,
            };
        }

        return result;
    }

    @MessagePattern('user_get_by_handle')
    public async getUserByHandle({ handle }): Promise<IUserSearchResponse> {
        let result: IUserSearchResponse;

        if (handle) {
            const user = await this.usersService.searchUserByHandle(handle);
            if (user) {
                result = {
                    status: HttpStatus.OK,
                    system_message: 'user_get_by_handle_success',
                    user,
                    errors: null,
                };
            } else {
                result = {
                    status: HttpStatus.NOT_FOUND,
                    system_message: 'user_get_by_handle_not_found',
                    user: null,
                    errors: null,
                };
            }
        } else {
            result = {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_get_by_handle_bad_request',
                user: null,
                errors: null,
            };
        }

        return result;
    }

    @MessagePattern('user_create')
    public async createUser(params: { createData: IUser }): Promise<IUserCreateResponse> {
        let result: IUserCreateResponse;

        if (params && params.createData && params.createData.email) {
            const usersWithEmail = await this.usersService.searchUser({
                email: params.createData.email,
            });

            if (usersWithEmail && usersWithEmail.length > 0) {
                result = {
                    status: HttpStatus.CONFLICT,
                    system_message: 'user_create_conflict',
                    user: null,
                    errors: {
                        email: {
                            system_message: 'Email already exists',
                            path: 'email',
                        },
                    },
                };
            } else {
                try {
                    const createdUser = await this.usersService.createUser(params.createData);
                    delete createdUser.password;
                    result = {
                        status: HttpStatus.CREATED,
                        system_message: 'user_create_success',
                        user: createdUser,
                        errors: null,
                    };
                } catch (e) {
                    result = {
                        status: HttpStatus.PRECONDITION_FAILED,
                        system_message: 'user_create_precondition_failed',
                        user: null,
                        errors: e.errors,
                    };
                }
            }
        } else {
            result = {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_create_bad_request',
                user: null,
                errors: null,
            };
        }

        return result;
    }

    @MessagePattern('user_update')
    public async updateUser(params: { id: string; updateData: IUserUpdate }): Promise<IUserUpdateResponse> {
        let result: IUserUpdateResponse;

        if (params && params.id && params.updateData) {
            // First, check if the user exists
            const user = await this.usersService.searchUserById(params.id);
            if (!user) {
                result = {
                    status: HttpStatus.NOT_FOUND,
                    system_message: 'user_update_not_found',
                    user: null,
                    errors: null,
                };
            } else {
                try {
                    const updatedUser = await this.usersService.updateUserById(params.id, params.updateData);

                    result = {
                        status: HttpStatus.OK,
                        system_message: 'user_update_success',
                        user: updatedUser,
                        errors: null,
                    };
                } catch (e) {
                    result = {
                        status: HttpStatus.PRECONDITION_FAILED,
                        system_message: 'user_update_precondition_failed',
                        user: null,
                        errors: e.errors,
                    };
                }
            }
        } else {
            result = {
                status: HttpStatus.BAD_REQUEST,
                system_message: 'user_update_bad_request',
                user: null,
                errors: null,
            };
        }

        return result;
    }
}