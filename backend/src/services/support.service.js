import { withTransaction } from "../config/db.js";
import * as historyRepository from "../repositories/history.repository.js";
import * as ticketRepository from "../repositories/ticket.repository.js";
import AppError from "../utils/AppError.js";
import { STATUS } from "../utils/constants.js";
import { truncateToMinute } from "../utils/dateTime.js";
import { toHistory, toTicket } from "../utils/mappers.js";
import mergeSort from "../utils/mergeSort.js";

function compareByOpeningDate(a, b) {
    const difference = new Date(a.data_abertura).getTime() - new Date(b.data_abertura).getTime();
    return difference !== 0 ? difference : a.id_chamado - b.id_chamado;
}

function validateAttendedAt(attendedAt, openedAt) {
    const attended = truncateToMinute(attendedAt);

    if (attended < truncateToMinute(openedAt)) {
        throw new AppError(
            "A data e hora do atendimento não pode ser anterior à abertura do chamado",
            400
        );
    }

    if (attended > truncateToMinute(new Date())) {
        throw new AppError(
            "A data e hora do atendimento não pode ser posterior ao momento atual",
            400
        );
    }
}

function ensureNotClosed(row) {
    if (row.status === STATUS.CLOSED) {
        throw new AppError("Este chamado já foi finalizado e não pode ser alterado", 409);
    }
}

function ensureAssignedTechnician(technician, row) {
    if (!row.id_tecnico) {
        throw new AppError(
            "É necessário assumir o chamado antes de registrar o atendimento",
            409
        );
    }
    if (row.id_tecnico !== technician.id) {
        throw new AppError(
            "Somente o técnico responsável pode atualizar este atendimento",
            403
        );
    }
}

async function findForUpdate(id, connection) {
    await ticketRepository.lockById(id, connection);
    const row = await ticketRepository.findById(id, connection);
    if (!row) {
        throw new AppError("Chamado não encontrado", 404);
    }
    return row;
}

async function buildDetails(id, technician, connection) {
    const row = await ticketRepository.findById(id, connection);
    if (!row) {
        throw new AppError("Chamado não encontrado", 404);
    }

    const history = await historyRepository.findByTicket(id, connection);
    const isAssigned = row.id_tecnico === technician.id;
    const isInProgress = row.status === STATUS.IN_PROGRESS;

    return {
        ...toTicket(row),
        history: history.map(toHistory),
        permissions: {
            take: row.status === STATUS.OPEN && !row.id_tecnico,
            addNote: isAssigned && isInProgress,
            close: isAssigned && isInProgress,
        },
    };
}

export async function list() {
    const rows = await ticketRepository.findAll({ sorted: false });
    return mergeSort(rows, compareByOpeningDate).map(toTicket);
}

export async function getById(technician, id) {
    return buildDetails(id, technician);
}

export async function take(technician, id, { attendedAt, note }) {
    return withTransaction(async (connection) => {
        const row = await findForUpdate(id, connection);
        ensureNotClosed(row);

        if (row.id_tecnico || row.status !== STATUS.OPEN) {
            throw new AppError("Este chamado já possui um técnico responsável", 409);
        }

        const date = attendedAt ?? new Date();
        validateAttendedAt(date, row.data_abertura);

        const affectedRows = await ticketRepository.take(id, technician.id, connection);
        if (affectedRows === 0) {
            throw new AppError("Este chamado já possui um técnico responsável", 409);
        }

        await historyRepository.create(
            {
                ticketId: id,
                technicianId: technician.id,
                attendedAt: date,
                note: note || "Chamado assumido pelo técnico.",
                resultingStatus: STATUS.IN_PROGRESS,
            },
            connection
        );

        return buildDetails(id, technician, connection);
    });
}

export async function addNote(technician, id, { attendedAt, note }) {
    return withTransaction(async (connection) => {
        const row = await findForUpdate(id, connection);
        ensureNotClosed(row);
        ensureAssignedTechnician(technician, row);

        const date = attendedAt ?? new Date();
        validateAttendedAt(date, row.data_abertura);

        await historyRepository.create(
            {
                ticketId: id,
                technicianId: technician.id,
                attendedAt: date,
                note,
                resultingStatus: row.status,
            },
            connection
        );

        return buildDetails(id, technician, connection);
    });
}

export async function close(technician, id, { attendedAt, solution }) {
    return withTransaction(async (connection) => {
        const row = await findForUpdate(id, connection);
        ensureNotClosed(row);
        ensureAssignedTechnician(technician, row);

        if (!solution || !solution.trim()) {
            throw new AppError(
                "Informe a descrição da solução para finalizar o chamado",
                400
            );
        }

        const date = attendedAt ?? new Date();
        validateAttendedAt(date, row.data_abertura);

        await ticketRepository.close(id, solution, connection);
        await historyRepository.create(
            {
                ticketId: id,
                technicianId: technician.id,
                attendedAt: date,
                note: solution,
                resultingStatus: STATUS.CLOSED,
            },
            connection
        );

        return buildDetails(id, technician, connection);
    });
}
