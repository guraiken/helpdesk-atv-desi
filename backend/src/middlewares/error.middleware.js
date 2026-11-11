import AppError from "../utils/AppError.js";

export function notFound(req, res) {
    res.status(404).json({ message: "Rota não encontrada" });
}

export function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errors: error.errors,
        });
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Corpo da requisição inválido" });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
}
