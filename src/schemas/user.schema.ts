import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

function transformValue(doc, ret: { [key: string]: any }) {
    delete ret.password;
}

export interface IUserSchema extends mongoose.Document {
    email: string;
    password: string;
    comparePassword: (password: string) => Promise<boolean>;
    getEncryptedPassword: (password: string) => Promise<string>;

    // User Profile
    name?: string;
    handle?: string;
    bio?: string;
    avatar_uri?: string;

    // User Settings
    theme?: string;
}

export const UserSchema = new mongoose.Schema<IUserSchema>(
    {
        email: {
            type: String,
            required: [true, 'Email can not be empty'],
            match: [
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Email should be valid',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password can not be empty'],
            minlength: [6, 'Password should include at least 6 chars'],
        },
        name: {
            type: String,
        },
        handle: {
            type: String,
        },
        bio: {
            type: String,
        },
        avatar_uri: {
            type: String,
        },
        theme: {
            type: String,
        },
    },
    {
        toObject: {
            virtuals: false,
            versionKey: false,
            transform: transformValue,
        },
        toJSON: {
            virtuals: false,
            versionKey: false,
            transform: transformValue,
        },
    },
);

UserSchema.methods.getEncryptedPassword = (
    password: string,
): Promise<string> => {
    return bcrypt.hash(String(password), SALT_ROUNDS);
};

UserSchema.methods.compareEncryptedPassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await this.getEncryptedPassword(this.password);
    next();
});