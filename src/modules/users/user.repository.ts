import {
    AdminCreateUserCommand,
    AdminAddUserToGroupCommand,
    AdminDeleteUserCommand,
    AdminRemoveUserFromGroupCommand,
    AdminUpdateUserAttributesCommand,
    ChangePasswordCommand,
    ConfirmForgotPasswordCommand,
    ForgotPasswordCommand,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
    GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../config/cognito.client.js";
import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import {
    AuthTokens,
    ChangePasswordDTO,
    CompleteNewPasswordDTO,
    ConfirmForgotPasswordDTO,
    CreateUserDTO,
    ForgotPasswordDTO,
    LoginDTO,
    LoginResult,
    UpdateUserDTO,
    UserDB,
} from "./user.model.js";

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

const ROL_GROUP_MAP: Record<string, string> = {
    Superadmin: "admins",
    Editor: "editors",
};

export class UserRepository {

    async findAll(): Promise<UserDB[]> {
        const result = await getPool().query(
            `SELECT id, cognito_sub, full_name, email, rol
             FROM toque.users
             ORDER BY created_at DESC`
        );
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<UserDB | null> {
        const result = await getPool().query(
            `SELECT id, cognito_sub, full_name, email, rol
             FROM toque.users WHERE id = $1`,
            [id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async findBySub(sub: string): Promise<UserDB | null> {
        const result = await getPool().query(
            `SELECT id, cognito_sub, full_name, email, rol
             FROM toque.users WHERE cognito_sub = $1`,
            [sub]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async create(sub: string, dto: CreateUserDTO): Promise<UserDB> {
        const result = await getPool().query(
            `INSERT INTO toque.users (cognito_sub, full_name, email, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [sub, dto.fullName, dto.email, dto.rol]
        );
        return toCamelCase(result.rows[0]);
    }

    async update(id: string, dto: UpdateUserDTO): Promise<UserDB | null> {
        const result = await getPool().query(
            `UPDATE toque.users
             SET
                full_name  = COALESCE($1, full_name),
                rol        = COALESCE($2, rol),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [dto.fullName ?? null, dto.rol ?? null, id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await getPool().query("DELETE FROM toque.users WHERE id = $1", [id]);
    }

    async cognitoCreateUser(dto: CreateUserDTO): Promise<string> {
        const response = await cognitoClient.send(
            new AdminCreateUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: dto.email,
                TemporaryPassword: dto.temporaryPassword,
                MessageAction: "SUPPRESS",
                UserAttributes: [
                    { Name: "email", Value: dto.email },
                    { Name: "email_verified", Value: "true" },
                    { Name: "name", Value: dto.fullName },
                ],
            })
        );

        const sub = response.User?.Attributes?.find(
            (attr) => attr.Name === "sub"
        )?.Value;

        if (!sub) throw new Error("No se pudo obtener el sub de Cognito");

        return sub;
    }

    async cognitoAddToGroup(email: string, rol: string): Promise<void> {
        const groupName = ROL_GROUP_MAP[rol];
        if (!groupName) throw new Error(`Rol inválido: ${rol}`);

        await cognitoClient.send(
            new AdminAddUserToGroupCommand({
                UserPoolId: USER_POOL_ID,
                Username: email,
                GroupName: groupName,
            })
        );
    }

    async cognitoRemoveFromGroup(email: string, rol: string): Promise<void> {
        const groupName = ROL_GROUP_MAP[rol];
        if (!groupName) throw new Error(`Rol inválido: ${rol}`);

        await cognitoClient.send(
            new AdminRemoveUserFromGroupCommand({
                UserPoolId: USER_POOL_ID,
                Username: email,
                GroupName: groupName,
            })
        );
    }

    async cognitoUpdateName(email: string, fullName: string): Promise<void> {
        await cognitoClient.send(
            new AdminUpdateUserAttributesCommand({
                UserPoolId: USER_POOL_ID,
                Username: email,
                UserAttributes: [{ Name: "name", Value: fullName }],
            })
        );
    }

    async cognitoDeleteUser(email: string): Promise<void> {
        await cognitoClient.send(
            new AdminDeleteUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: email,
            })
        );
    }

    async cognitoLogin(dto: LoginDTO): Promise<LoginResult> {
        console.log("CLIENT_ID:", CLIENT_ID);
        console.log("repositorio: ", dto);
        try {

            const response = await cognitoClient.send(
                new InitiateAuthCommand({
                    AuthFlow: "USER_PASSWORD_AUTH",
                    ClientId: CLIENT_ID,
                    AuthParameters: {
                        USERNAME: dto.email,
                        PASSWORD: dto.password,
                    },
                })
            );

            console.log("Response: ", response);

            if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
                return {
                    requiresNewPassword: true,
                    session: response.Session!,
                    email: dto.email,
                };
            }

            const result = response.AuthenticationResult;
            if (!result?.AccessToken || !result?.IdToken || !result?.RefreshToken) {
                throw new Error("Respuesta de autenticación incompleta");
            }
            console.log("resultado: ", result);
            return {
                requiresNewPassword: false,
                tokens: {
                    accessToken: result.AccessToken,
                    idToken: result.IdToken,
                    refreshToken: result.RefreshToken,
                },
            };

        } catch (error) {
            console.error("ERROR REAL:", error);
            throw error;
        }




    }

    async cognitoCompleteNewPassword(dto: CompleteNewPasswordDTO): Promise<AuthTokens> {
        const response = await cognitoClient.send(
            new RespondToAuthChallengeCommand({
                ClientId: CLIENT_ID,
                ChallengeName: "NEW_PASSWORD_REQUIRED",
                Session: dto.session,
                ChallengeResponses: {
                    USERNAME: dto.email,
                    NEW_PASSWORD: dto.newPassword,
                },
            })
        );

        const result = response.AuthenticationResult;
        if (!result?.AccessToken || !result?.IdToken || !result?.RefreshToken) {
            throw new Error("No se pudo completar el cambio de contraseña");
        }

        return {
            accessToken: result.AccessToken,
            idToken: result.IdToken,
            refreshToken: result.RefreshToken,
        };
    }

    async cognitoRefreshTokens(refreshToken: string): Promise<AuthTokens> {
        const response = await cognitoClient.send(
            new InitiateAuthCommand({
                AuthFlow: "REFRESH_TOKEN_AUTH",
                ClientId: CLIENT_ID,
                AuthParameters: { REFRESH_TOKEN: refreshToken },
            })
        );

        const result = response.AuthenticationResult;
        if (!result?.AccessToken || !result?.IdToken) {
            throw new Error("No se pudo renovar la sesión");
        }

        return {
            accessToken: result.AccessToken,
            idToken: result.IdToken,
            refreshToken,
        };
    }

    async cognitoChangePassword(accessToken: string, dto: ChangePasswordDTO): Promise<void> {
        await cognitoClient.send(
            new ChangePasswordCommand({
                AccessToken: accessToken,
                PreviousPassword: dto.previousPassword,
                ProposedPassword: dto.proposedPassword,
            })
        );
    }

    async cognitoForgotPassword(dto: ForgotPasswordDTO): Promise<void> {
        await cognitoClient.send(
            new ForgotPasswordCommand({
                ClientId: CLIENT_ID,
                Username: dto.email,
            })
        );
    }

    async cognitoConfirmForgotPassword(dto: ConfirmForgotPasswordDTO): Promise<void> {
        await cognitoClient.send(
            new ConfirmForgotPasswordCommand({
                ClientId: CLIENT_ID,
                Username: dto.email,
                ConfirmationCode: dto.confirmationCode,
                Password: dto.newPassword,
            })
        );
    }

    async cognitoLogout(accessToken: string): Promise<void> {
        const command = new GlobalSignOutCommand({ AccessToken: accessToken });
        await cognitoClient.send(command);
    }
}
