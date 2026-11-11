import express from "express";
import cors from "cors";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
