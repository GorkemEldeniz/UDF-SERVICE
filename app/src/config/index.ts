export const config = {
	port: process.env.PORT || 5000,
	nodeEnv: process.env.NODE_ENV || "development",
	uploadDir: process.env.UPLOAD_DIR || "./uploads",
	maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "50") * 1024 * 1024, // 50MB default
	allowedFileTypes: [".pdf", ".docx", ".udf"],
	pythonPath: process.env.PYTHON_PATH || "python3",
	udfToolkitPath: process.env.UDF_TOOLKIT_PATH || "../UDF-Toolkit",
};
