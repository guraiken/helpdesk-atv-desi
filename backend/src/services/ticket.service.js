import { withTransaction } from "../config/db.js";
import * as categoryRepository from "../repositories/category.repository.js";
import * as historyRepository from "../repositories/history.repository.js";
import * as ticketRepository from "../repositories/ticket.repository.js";
import AppError from "../utils/AppError.js";
import { ROLES, STATUS } from "../utils/constants.js";
import { toHistory, toTicket } from "../utils/mappers.js";

function isRequester(user) {
    return user.role === ROLES.REQUESTER;
}

function ensureAccess(user, row) {
    if (!row) {
        throw new AppError("Chamado não encontrado", 404);
    }
    if (isRequester(user) && row.id_solicitante !== user.id) {
        throw new AppError("Você não tem permissão para acessar este chamado", 403);
    }
}

function ensureOwner(user, row) {
    if (!row) {
        throw new AppError("Chamado não encontrado", 404);
    }
    if (row.id_solicitante !== user.id) {
        throw new AppError("Você só pode alterar os seus próprios chamados", 403);
    }
}

async function ensureCategoryExists(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
        throw new AppError("Categoria inválida", 400, [
            { field: "categoryId", message: "Categoria inválida" },
        ]);
    }
}

export async function list(user, search) {
    const rows = await ticketRepository.findAll({
        requesterId: isRequester(user) ? user.id : undefined,
        search,
    });
    return rows.map(toTicket);
}

export async function summary(user) {
    const rows = await ticketRepository.countByStatus(
        isRequester(user) ? user.id : undefined
    );
    const totals = { open: 0, inProgress: 0, closed: 0 };

    for (const row of rows) {
        const total = Number(row.total);
        if (row.status === STATUS.OPEN) {
            totals.open = total;
        } else if (row.status === STATUS.IN_PROGRESS) {
            totals.inProgress = total;
        } else if (row.status === STATUS.CLOSED) {
            totals.closed = total;
        }
    }

    return totals;
}

export async function getById(user, id) {
    const row = await ticketRepository.findById(id);
    ensureAccess(user, row);

    const history = await historyRepository.findByTicket(id);
    const isOwner = isRequester(user) && row.id_solicitante === user.id;
    const isOpen = row.status === STATUS.OPEN;

    return {
        ...toTicket(row),
        history: history.map(toHistory),
        permissions: {
            edit: isOwner && isOpen,
            remove: isOwner && isOpen && history.length === 0,
        },
    };
}

export async function create(user, data) {
    await ensureCategoryExists(data.categoryId);

    const id = await ticketRepository.create({
        ...data,
        requesterId: user.id,
        openedAt: new Date(),
    });

    return toTicket(await ticketRepository.findById(id));
}

export async function update(user, id, data) {
    await ensureCategoryExists(data.categoryId);

    return withTransaction(async (connection) => {
        await ticketRepository.lockById(id, connection);
        const row = await ticketRepository.findById(id, connection);
        ensureOwner(user, row);

        if (row.status !== STATUS.OPEN) {
            throw new AppError(
                "Somente chamados com status Aberto podem ser editados",
                409
            );
        }

        await ticketRepository.update(id, data, connection);
        return toTicket(await ticketRepository.findById(id, connection));
    });
}

export async function remove(user, id) {
    return withTransaction(async (connection) => {
        await ticketRepository.lockById(id, connection);
        const row = await ticketRepository.findById(id, connection);
        ensureOwner(user, row);

        if (row.status !== STATUS.OPEN) {
            throw new AppError(
                "Somente chamados com status Aberto podem ser excluídos",
                409
            );
        }

        const historyCount = await historyRepository.countByTicket(id, connection);
        if (historyCount > 0) {
            throw new AppError(
                "Chamados com registros de atendimento não podem ser excluídos",
                409
            );
        }

        await ticketRepository.remove(id, connection);
    });
}
