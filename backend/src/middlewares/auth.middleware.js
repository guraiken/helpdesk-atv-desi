import jwt from "jsonwebtoken";
import env from "../config/env.js";
import * as userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import { toUser } from "../utils/mappers.js";
import { isTokenRevoked } from "../utils/tokenBlacklist.js";

export async function authenticate(req, res, next) {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        throw new AppError("Acesso não autorizado. Faça login para continuar.", 401);
    }

    let payload;
    try {
        payload = jwt.verify(token, env.jwt.secret);
    } catch {
        throw new AppError("Sessão inválida ou expirada. Faça login novamente.", 401);
    }

    if (isTokenRevoked(payload.jti)) {
        throw new AppError("Sessão encerrada. Faça login novamente.", 401);
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
        throw new AppError("Sessão inválida ou expirada. Faça login novamente.", 401);
    }

    req.user = toUser(user);
    req.session = { jti: payload.jti, exp: payload.exp };
    next();
}

export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError(
                `Acesso permitido somente a usuários com perfil ${roles.join(" ou ")}`,
                403
            );
        }
        next();
    };
}
