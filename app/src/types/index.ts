export interface ConversionRequest {
	file: Express.Multer.File;
	outputFormat: "udf" | "docx" | "pdf";
}

export interface ConversionResponse {
	success: boolean;
	message: string;
	outputFile?: string;
	downloadUrl?: string;
	error?: string;
}

export interface FileInfo {
	originalName: string;
	filename: string;
	mimetype: string;
	size: number;
	path: string;
}

export interface ConversionOptions {
	inputFormat: string;
	outputFormat: string;
	preserveFormatting?: boolean;
}
