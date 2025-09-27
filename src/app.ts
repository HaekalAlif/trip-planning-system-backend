import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import userRoutes from "./modules/user";
import errorHandler from "./middlewares/error_handler";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/user", userRoutes);

// Error handler
app.use(errorHandler);

export default app;
