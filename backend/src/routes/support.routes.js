import { Router } from "express";
import * as supportController from "../controllers/support.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { ROLES } from "../utils/constants.js";
import {
    closeTicketSchema,
    idParamSchema,
    noteSchema,
    takeTicketSchema,
} from "../utils/schemas.js";

const router = Router();

router.use(authorize(ROLES.TECHNICIAN));

router.get("/", supportController.list);
router.get("/:id", validate({ params: idParamSchema }), supportController.getById);
router.patch(
    "/:id/take",
    validate({ params: idParamSchema, body: takeTicketSchema }),
    supportController.take
);
router.post(
    "/:id/notes",
    validate({ params: idParamSchema, body: noteSchema }),
    supportController.addNote
);
router.patch(
    "/:id/close",
    validate({ params: idParamSchema, body: closeTicketSchema }),
    supportController.close
);

export default router;
