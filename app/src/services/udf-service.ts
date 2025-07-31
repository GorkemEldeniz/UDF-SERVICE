import { spawn } from "child_process";
import path from "path";
import { config } from "../config";
import { ConversionOptions, ConversionResponse } from "../types";

export class UDFService {
	private toolkitPath: string;

	constructor() {
		this.toolkitPath = path.resolve(config.udfToolkitPath);
	}

	async convertFile(
		inputFilePath: string,
		outputFormat: string,
		options: ConversionOptions
	): Promise<ConversionResponse> {
		try {
			const outputPath = this.generateOutputPath(inputFilePath, outputFormat);

			let scriptName: string;
			let args: string[];

			const inputFileRelativePath = path.relative(
				this.toolkitPath,
				inputFilePath
			);

			switch (options.inputFormat) {
				case "docx":
					if (outputFormat === "udf") {
						scriptName = "docx_to_udf.py";
						args = [inputFileRelativePath];
					} else {
						throw new Error("DOCX can only be converted to UDF");
					}
					break;

				case "udf":
					if (outputFormat === "docx") {
						scriptName = "udf_to_docx.py";
						args = [inputFileRelativePath];
					} else if (outputFormat === "pdf") {
						scriptName = "udf_to_pdf.py";
						args = [inputFileRelativePath];
					} else {
						throw new Error("UDF can be converted to DOCX or PDF");
					}
					break;

				default:
					throw new Error(`Unsupported input format: ${options.inputFormat}`);
			}

			console.log("scriptName", scriptName);
			console.log("args", args);

			const result = await this.runPythonScript(scriptName, args);

			if (result.success) {
				return {
					success: true,
					message: `File converted successfully from ${options.inputFormat} to ${outputFormat}`,
					outputFile: outputPath,
					downloadUrl: `/api/udf/download/${path.basename(outputPath)}`,
				};
			} else {
				return {
					success: false,
					message: "Conversion failed",
					error: result.error,
				};
			}
		} catch (error) {
			return {
				success: false,
				message: "Conversion failed",
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private async runPythonScript(
		scriptName: string,
		args: string[]
	): Promise<{ success: boolean; error?: string }> {
		return new Promise((resolve) => {
			const scriptPath = path.join(this.toolkitPath, scriptName);
			const pythonProcess = spawn(config.pythonPath, [scriptPath, ...args], {
				cwd: this.toolkitPath,
				stdio: ["pipe", "pipe", "pipe"],
			});

			let stdout = "";
			let stderr = "";

			pythonProcess.stdout.on("data", (data) => {
				stdout += data.toString();
			});

			pythonProcess.stderr.on("data", (data) => {
				stderr += data.toString();
			});

			pythonProcess.on("close", (code) => {
				if (code === 0) {
					resolve({ success: true });
				} else {
					resolve({
						success: false,
						error: stderr || stdout || `Process exited with code ${code}`,
					});
				}
			});

			pythonProcess.on("error", (error) => {
				resolve({
					success: false,
					error: `Failed to start Python process: ${error.message}`,
				});
			});
		});
	}

	private generateOutputPath(inputPath: string, outputFormat: string): string {
		const dir = path.dirname(inputPath);
		const baseName = path.basename(inputPath, path.extname(inputPath));
		return path.join(dir, `${baseName}.${outputFormat}`);
	}

	async getSupportedFormats(): Promise<{ input: string[]; output: string[] }> {
		return {
			input: ["docx", "pdf", "udf"],
			output: ["udf", "docx", "pdf"],
		};
	}
}
