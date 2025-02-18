export interface IUserUpdate {
    // Profile
    name?: string;
    handle?: string;
    bio?: string;
    avatarUri?: string;

    // Settings
    theme?: string;
}