// Balgyn: Express app setup (middleware + routes)

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const apartmentRoutes = require("./routes/apartmentRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reportRoutes = require("./routes/reportRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const { errorHandler } = require("./middleware/errorHandler");
const { env } = require("./config/env");

const app = express();

app.disable("x-powered-by");

import cors from "cors";
import helmet from "helmet";
import express from "express";


app.use(helmet());

const allowedOrigins = [
  "https://finfront-omega.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Разрешаем Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error("CORS blocked"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));


app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api", requestRoutes);
app.use("/api", contactRoutes);
app.use("/api", reportRoutes);
app.use("/api", categoryRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/__version", (req, res) => res.json({ ok: true, v: "cors-fixed-1" }));

// API only
app.use(errorHandler);

module.exports = { app };
