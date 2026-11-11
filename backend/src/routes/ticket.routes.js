import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { ROLES } from "../utils/constants.js";
import { idParamSchema, listTicketsSchema, ticketSchema } from "../utils/schemas.js";

const router = Router();

router.get("/", validate({ query: listTicketsSchema }), ticketController.list);
router.get("/:id", validate({ params: idParamSchema }), ticketController.getById);
router.post(
    "/",
    authorize(ROLES.REQUESTER),
    validate({ body: ticketSchema }),
    ticketController.create
);
router.put(
    "/:id",
    authorize(ROLES.REQUESTER),
    validate({ params: idParamSchema, body: ticketSchema }),
    ticketController.update
);
router.delete(
    "/:id",
    authorize(ROLES.REQUESTER),
    validate({ params: idParamSchema }),
    ticketController.remove
);

export default router;
