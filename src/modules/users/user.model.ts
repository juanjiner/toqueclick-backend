export interface CreateUserDTO {
    fullName: string;
    email: string;
    rol: "Superadmin" | "Editor";
    temporaryPassword: string;
}

export interface UpdateUserDTO {
    fullName?: string;
    rol?: "Superadmin" | "Editor";
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface CompleteNewPasswordDTO {
    email: string;
    newPassword: string;
    session: string;
}

export interface AuthTokens {
    accessToken: string;
    idToken: string;
    refreshToken: string;
}

export type LoginResult =
    | { requiresNewPassword: true; session: string; email: string }
    | { requiresNewPassword: false; tokens: AuthTokens };

export interface UserDB {
    id: string;
    cognitoSub: string;
    fullName: string;
    email: string;
    rol: string;
}

export interface CognitoJwtPayload {
    sub: string;
    email: string;
    username: string;
    "cognito:groups": string[];
    token_use: "access" | "id";
    client_id: string;
    exp: number;
    iat: number;
    iss: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: CognitoJwtPayload;
        }
    }
}

export interface ChangePasswordDTO {
    previousPassword: string;
    proposedPassword: string;
}

export interface ForgotPasswordDTO {
    email: string;
}

export interface ConfirmForgotPasswordDTO {
    email: string;
    confirmationCode: string;
    newPassword: string;
}