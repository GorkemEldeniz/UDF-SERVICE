import { Router } from "express";
import { promises as fs } from "fs";
import multer from "multer";
import path from "path";
import { config } from "../config";
import { UDFService } from "../services/udf-service";

const router = Router();
const udfService = new UDFService();

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, config.uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const filename = file.originalname.split(".")[0];
		cb(null, filename + "-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: config.maxFileSize,
	},
	fileFilter: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		if (config.allowedFileTypes.includes(ext)) {
			cb(null, true);
		} else {
			cb(new Error(`Unsupported file type: ${ext}`));
		}
	},
});

// Ensure upload directory exists
async function ensureUploadDir() {
	try {
		await fs.access(config.uploadDir);
	} catch {
		await fs.mkdir(config.uploadDir, { recursive: true });
	}
}

// Initialize upload directory
ensureUploadDir();

// GET /api/udf/formats - Get supported formats
router.get("/formats", async (req, res) => {
	try {
		const formats = await udfService.getSupportedFormats();
		res.json({
			success: true,
			data: formats,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Failed to get formats",
		});
	}
});

// POST /api/udf/convert - Convert file
router.post("/convert", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				error: "No file uploaded",
			});
		}

		const { outputFormat } = req.body;

		if (!outputFormat) {
			return res.status(400).json({
				success: false,
				error: "Output format is required",
			});
		}

		const inputFormat = req.file.originalname.split(".")[1];

		// Convert file
		const result = await udfService.convertFile(req.file.path, outputFormat, {
			inputFormat,
			outputFormat,
			preserveFormatting: req.body.preserveFormatting === "true",
		});

		if (result.success) {
			res.json({
				success: true,
				message: result.message,
				data: {
					originalFile: req.file.originalname,
					outputFile: path.basename(result.outputFile!),
					downloadUrl: result.downloadUrl,
				},
			});
		} else {
			res.status(400).json({
				success: false,
				error: result.error,
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Conversion failed",
		});
	}
});

// GET /api/udf/download/:filename - Download converted file
router.get("/download/:filename", async (req, res) => {
	try {
		console.log("downloading file", req.params);
		const { filename } = req.params;
		const filePath = path.join(config.uploadDir, filename);

		// Check if file exists
		try {
			await fs.access(filePath);
		} catch {
			return res.status(404).json({
				success: false,
				error: "File not found",
			});
		}

		// Get file stats
		const stats = await fs.stat(filePath);

		// Set headers
		res.setHeader("Content-Type", "application/octet-stream");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		res.setHeader("Content-Length", stats.size);

		console.log("filePath", filePath);

		// Send file with root parameter
		res.sendFile(filename, { root: config.uploadDir });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Download failed",
		});
	}
});

// GET /api/udf/health - Health check for UDF service
router.get("/health", async (req, res) => {
	try {
		// Check if Python is available
		const { spawn } = require("child_process");
		const pythonProcess = spawn(config.pythonPath, ["--version"]);

		pythonProcess.on("close", (code: number) => {
			if (code === 0) {
				res.json({
					success: true,
					status: "healthy",
					python: "available",
					toolkit: "ready",
				});
			} else {
				res.status(503).json({
					success: false,
					status: "unhealthy",
					python: "unavailable",
					error: "Python not found",
				});
			}
		});

		pythonProcess.on("error", () => {
			res.status(503).json({
				success: false,
				status: "unhealthy",
				python: "unavailable",
				error: "Python not found",
			});
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			status: "error",
			error: error instanceof Error ? error.message : "Health check failed",
		});
	}
});

// Error handling middleware for multer
router.use((error: any, req: any, res: any, next: any) => {
	if (error instanceof multer.MulterError) {
		if (error.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({
				success: false,
				error: "File too large",
			});
		}
	}

	if (error.message.includes("Unsupported file type")) {
		return res.status(400).json({
			success: false,
			error: error.message,
		});
	}

	next(error);
});

export { router as udfRoutes };
