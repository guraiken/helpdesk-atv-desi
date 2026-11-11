import * as supportService from "../services/support.service.js";

export async function list(req, res) {
    const tickets = await supportService.list();
    res.status(200).json(tickets);
}

export async function getById(req, res) {
    const ticket = await supportService.getById(req.user, req.validated.params.id);
    res.status(200).json(ticket);
}

export async function take(req, res) {
    const ticket = await supportService.take(
        req.user,
        req.validated.params.id,
        req.validated.body
    );
    res.status(200).json(ticket);
}

export async function addNote(req, res) {
    const ticket = await supportService.addNote(
        req.user,
        req.validated.params.id,
        req.validated.body
    );
    res.status(201).json(ticket);
}

export async function close(req, res) {
    const ticket = await supportService.close(
        req.user,
        req.validated.params.id,
        req.validated.body
    );
    res.status(200).json(ticket);
}
