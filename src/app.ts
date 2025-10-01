import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const frontend = (process.env.FRONTEND_URL || "http://localhost:3000").trim();

const allowedOrigins = [
  frontend,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    console.log("CORS origin:", origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (
      process.env.NODE_ENV !== "production" &&
      origin.startsWith("http://localhost")
    ) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed by server"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

import authRoutes from "./modules/auth";
import errorHandler from "./middlewares/error_handler";

// Routes
app.use("/auth", authRoutes);

// Error handler
app.use(errorHandler);

export default app;
