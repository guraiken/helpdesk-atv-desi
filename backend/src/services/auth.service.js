import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import * as userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import { toUser } from "../utils/mappers.js";
import { revokeToken } from "../utils/tokenBlacklist.js";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";

export async function login({ email, password }) {
    const row = await userRepository.findByEmail(email);
    if (!row) {
        throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    const passwordMatches = await bcrypt.compare(password, row.senha_hash);
    if (!passwordMatches) {
        throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    const user = toUser(row);
    const token = jwt.sign({ role: user.role }, env.jwt.secret, {
        subject: String(user.id),
        jwtid: randomUUID(),
        expiresIn: env.jwt.expiresIn,
    });

    return { token, user };
}

export function logout(session) {
    revokeToken(session.jti, session.exp);
}
