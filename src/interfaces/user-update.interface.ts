export interface IUserUpdate {
    // Profile
    name?: string;
    handle?: string;
    bio?: string;
    avatar_uri?: string;

    // Settings
    theme?: string;
}