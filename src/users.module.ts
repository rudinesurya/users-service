import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { MongoConfigService } from './services/config/mongo-config.service';
import { ConfigService } from './services/config/config.service';
import { UserSchema } from './schemas/user.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
            useClass: MongoConfigService,
        }),
        MongooseModule.forFeature([
            {
                name: 'User',
                schema: UserSchema,
                collection: 'users',
            },
        ]),
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        ConfigService,
    ],
})
export class UsersModule { }