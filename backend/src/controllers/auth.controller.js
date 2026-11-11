import * as authService from "../services/auth.service.js";

export async function register(req, res) {
    const user = await authService.register(req.validated.body);
    res.status(201).json(user);
}

export async function login(req, res) {
    const result = await authService.login(req.validated.body);
    res.status(200).json(result);
}

export function logout(req, res) {
    authService.logout(req.session);
    res.status(200).json({ message: "Sessão encerrada com sucesso" });
}

export function me(req, res) {
    res.status(200).json(req.user);
}
