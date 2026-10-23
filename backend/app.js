import express from "express";
import cors from "cors";

const app = express();

// Konfigurasi CORS berdasarkan environment variable CORS_ORIGIN
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parser untuk JSON
app.use(express.json());

// Endpoint health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Middleware penanganan 404 jika route tidak ditemukan
export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Rute tidak ditemukan" });
}

// Global error handler
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Terjadi kesalahan pada server";
  res.status(status).json({ error: message });
}

export default app;
