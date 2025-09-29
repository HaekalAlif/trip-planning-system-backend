import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./modules/auth";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/error_handler";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);

// Error handler
app.use(errorHandler);

export default app;
