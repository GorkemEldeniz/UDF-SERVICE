import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index";
import { udfRoutes } from "./routes/udf-routes";

const app = express();
const PORT = config.port || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/udf", udfRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
	(
		err: Error,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error(err.stack);
		res.status(500).json({
			error: "Internal Server Error",
			message: err.message,
		});
	}
);

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
	console.log(`🚀 UDF Service running on port ${PORT}`);
	console.log(`📚 API Documentation: http://localhost:${PORT}/api/udf`);
});
