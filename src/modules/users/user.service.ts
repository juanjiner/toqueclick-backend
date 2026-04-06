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
import { UserRepository } from "./user.repository.js";

export class UserService {

    private repository = new UserRepository();

    // Auth
    login(dto: LoginDTO): Promise<LoginResult> {
        return this.repository.cognitoLogin(dto);
    }

    completeNewPassword(dto: CompleteNewPasswordDTO): Promise<AuthTokens> {
        return this.repository.cognitoCompleteNewPassword(dto);
    }

    refreshTokens(refreshToken: string): Promise<AuthTokens> {
        return this.repository.cognitoRefreshTokens(refreshToken);
    }

    changePassword(accessToken: string, dto: ChangePasswordDTO): Promise<void> {
        return this.repository.cognitoChangePassword(accessToken, dto);
    }

    forgotPassword(dto: ForgotPasswordDTO): Promise<void> {
        return this.repository.cognitoForgotPassword(dto);
    }

    confirmForgotPassword(dto: ConfirmForgotPasswordDTO): Promise<void> {
        return this.repository.cognitoConfirmForgotPassword(dto);
    }

    logout(accessToken: string): Promise<void> {
        return this.repository.cognitoLogout(accessToken);
    }

    // Usuarios
    getUsers(): Promise<UserDB[]> {
        return this.repository.findAll();
    }

    getMe(sub: string): Promise<UserDB | null> {
        return this.repository.findBySub(sub);
    }

    async createUser(dto: CreateUserDTO): Promise<UserDB> {
        const sub = await this.repository.cognitoCreateUser(dto);

        try {
            await this.repository.cognitoAddToGroup(dto.email, dto.rol);
            return await this.repository.create(sub, dto);

        } catch (error) {
            try {
                await this.repository.cognitoDeleteUser(dto.email);
            } catch (rollbackError) {
                // Si el rollback también falla, loguear para limpieza manual
                console.error(
                    `[ROLLBACK FAILED] Usuario ${dto.email} quedó huérfano en Cognito. Eliminarlo manualmente.`,
                    rollbackError
                );
            }

            throw error;
        }
    }

    async updateUser(id: string, dto: UpdateUserDTO): Promise<UserDB | null> {
        if (!dto.fullName && !dto.rol) {
            throw new Error("Debes enviar al menos un campo para actualizar");
        }

        const existing = await this.repository.findById(id);
        if (!existing) return null;

        if (dto.fullName) {
            await this.repository.cognitoUpdateName(existing.email, dto.fullName);
        }

        if (dto.rol && dto.rol !== existing.rol) {
            await this.repository.cognitoRemoveFromGroup(existing.email, existing.rol);
            await this.repository.cognitoAddToGroup(existing.email, dto.rol);
        }

        return this.repository.update(id, dto);
    }

    async deleteUser(id: string): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) throw new Error("Usuario no encontrado");

        await this.repository.cognitoDeleteUser(existing.email);
        await this.repository.delete(id);
    }
}