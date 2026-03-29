import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { CognitoJwtPayload } from "../modules/users/user.model.js";
import { AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.client.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

// URL pública donde Cognito publica sus claves de firma
const JWKS_URI = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

// Cliente que descarga y cachea las claves automáticamente
const client = jwksClient({
    jwksUri: JWKS_URI,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 60 * 1000, // 10 horas
});

// Función que jwks-rsa necesita para obtener la clave correcta por kid
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
    if (!header.kid) {
        return callback(new Error("Token sin kid en el header"));
    }

    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

// MIDDLEWARE PRINCIPAL
export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado" });
        return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
        token,
        getKey,
        {
            algorithms: ["RS256"],
            issuer: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`,
        },
        (err, decoded) => {
            if (err) {
                res.status(401).json({ error: "Token inválido o expirado" });
                return;
            }

            const payload = decoded as CognitoJwtPayload;

            // Verificar que sea un accessToken (no idToken)
            if (payload.token_use !== "access") {
                res.status(401).json({ error: "Tipo de token incorrecto, usa el accessToken" });
                return;
            }

            // Verificar que el token sea para tu app
            if (payload.client_id !== CLIENT_ID) {
                res.status(401).json({ error: "Token no pertenece a esta aplicación" });
                return;
            }

            // Adjuntar el payload al request para usarlo en los controladores
            req.user = payload;
            next();
        }
    );
}

// MIDDLEWARE DE ROL
export function requireRole(...roles: string[]) {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        // Primero intentar leer del token
        const groupsFromToken: string[] = req.user?.["cognito:groups"] ?? [];

        let groups = groupsFromToken;

        // Si el token no trae grupos, consultar a Cognito
        if (groups.length === 0) {
            const response = await cognitoClient.send(
                new AdminListGroupsForUserCommand({
                    UserPoolId: USER_POOL_ID,
                    Username: req.user!.username,
                })
            );
            groups = response.Groups?.map((g) => g.GroupName ?? "") ?? [];
        }

        const ROL_GROUP_MAP: Record<string, string> = {
            Superadmin: "admins",
            Editor: "editors",
        };

        const hasAccess = roles.some((rol) => groups.includes(ROL_GROUP_MAP[rol]));

        if (!hasAccess) {
            throw new AppError(`Acceso denegado. Se requiere rol: ${roles.join(" o ")}`, 403);
        }

        next();
    });
}