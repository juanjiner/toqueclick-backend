import { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { successResponse } from "../../utils/apiResponse.js";
import { UserService } from "./user.service.js";

export class UserController {

    private service = new UserService();

    // Auth
    login = async (req: Request, res: Response) => {
        console.log("controlador: ", req.body);
        const result = await this.service.login(req.body);
        res.json(successResponse(result));
    };

    completeNewPassword = async (req: Request, res: Response) => {
        const tokens = await this.service.completeNewPassword(req.body);
        res.json(successResponse(tokens));
    };

    refreshTokens = async (req: Request, res: Response) => {
        const tokens = await this.service.refreshTokens(req.body.refreshToken);
        res.json(successResponse(tokens));
    };

    changePassword = async (req: Request, res: Response) => {
        const accessToken = req.headers.authorization!.split(" ")[1];
        await this.service.changePassword(accessToken, req.body);
        res.json(successResponse({ message: "Contraseña actualizada correctamente" }));
    };

    forgotPassword = async (req: Request, res: Response) => {
        await this.service.forgotPassword(req.body);
        res.json(successResponse({
            message: "Si el email existe, recibirás un código para restablecer tu contraseña",
        }));
    };

    confirmForgotPassword = async (req: Request, res: Response) => {
        await this.service.confirmForgotPassword(req.body);
        res.json(successResponse({ message: "Contraseña restablecida correctamente" }));
    };

    logout = async (req: Request, res: Response) => {
        const accessToken = req.headers.authorization!.split(" ")[1];
        await this.service.logout(accessToken);
        res.json(successResponse({ message: "Sesión cerrada correctamente" }));
    };

    // Usuarios
    getAll = async (req: Request, res: Response) => {
        const users = await this.service.getUsers();
        res.json(successResponse(users));
    };

    getMe = async (req: Request, res: Response) => {
        const user = await this.service.getMe(req.user!.sub);
        if (!user) throw new AppError("Usuario no encontrado", 404);
        res.json(successResponse(user));
    };

    create = async (req: Request, res: Response) => {
        const user = await this.service.createUser(req.body);
        res.status(201).json(successResponse(user));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const user = await this.service.updateUser(id, req.body);
        if (!user) throw new AppError("Usuario no encontrado", 404);
        res.json(successResponse(user));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);

        const me = await this.service.getMe(req.user!.sub);
        if (me?.id === id) throw new AppError("No puedes eliminarte a ti mismo", 400);

        await this.service.deleteUser(id);
        res.status(204).send();
    };
}