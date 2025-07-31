# UDF Service - REST API

Bu proje, UDF-Toolkit'i REST API olarak sunan Express.js tabanlı bir servistir. DOCX, PDF ve UDF dosyaları arasında dönüştürme işlemleri yapabilir.

## 🚀 Özellikler

- **Dosya Dönüştürme**: DOCX ↔ UDF, PDF → UDF, UDF → PDF
- **REST API**: Temiz ve modern API endpoints
- **TypeScript**: Tip güvenliği ve geliştirici deneyimi
- **File Upload**: Multer ile güvenli dosya yükleme
- **Error Handling**: Kapsamlı hata yönetimi
- **Health Checks**: Servis durumu kontrolü

## 📋 Gereksinimler

- Node.js 18+
- Python 3.7+
- UDF-Toolkit Python paketleri

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**

```bash
npm install
```

2. **UDF-Toolkit Python bağımlılıklarını yükleyin:**

```bash
cd ../UDF-Toolkit
pip install -r requirements.txt
```

3. **Geliştirme modunda çalıştırın:**

```bash
npm run dev
```

4. **Production build:**

```bash
npm run build
npm start
```

## ⚙️ Konfigürasyon

Environment variables ile konfigürasyon yapabilirsiniz:

```bash
PORT=3000                           # Server port
NODE_ENV=development               # Environment
UPLOAD_DIR=./uploads              # Upload directory
MAX_FILE_SIZE=50                  # Max file size in MB
PYTHON_PATH=python3              # Python executable path
UDF_TOOLKIT_PATH=../UDF-Toolkit  # UDF-Toolkit path
```

## 📚 API Dokümantasyonu

### Base URL

```
http://localhost:3000/api/udf
```

### Endpoints

#### 1. Desteklenen Formatları Getir

```http
GET /api/udf/formats
```

**Response:**

```json
{
	"success": true,
	"data": {
		"input": ["docx", "pdf", "udf"],
		"output": ["udf", "docx", "pdf"]
	}
}
```

#### 2. Dosya Dönüştür

```http
POST /api/udf/convert
Content-Type: multipart/form-data
```

**Parameters:**

- `file` (required): Dönüştürülecek dosya
- `outputFormat` (required): Hedef format (udf, docx, pdf)
- `preserveFormatting` (optional): Formatı koru (true/false)

**Response:**

```json
{
	"success": true,
	"message": "File converted successfully from docx to udf",
	"data": {
		"originalFile": "document.docx",
		"outputFile": "document.udf",
		"downloadUrl": "/api/udf/download/document.udf"
	}
}
```

#### 3. Dönüştürülen Dosyayı İndir

```http
GET /api/udf/download/:filename
```

#### 4. Servis Durumu

```http
GET /api/udf/health
```

**Response:**

```json
{
	"success": true,
	"status": "healthy",
	"python": "available",
	"toolkit": "ready"
}
```

#### 5. Genel Sağlık Kontrolü

```http
GET /health
```

## 🔄 Desteklenen Dönüştürme İşlemleri

| Input Format | Output Format | Açıklama                                |
| ------------ | ------------- | --------------------------------------- |
| DOCX         | UDF           | Word belgesini UDF formatına dönüştürür |
| PDF          | UDF           | PDF dosyasını UDF formatına dönüştürür  |
| UDF          | DOCX          | UDF dosyasını Word formatına dönüştürür |
| UDF          | PDF           | UDF dosyasını PDF formatına dönüştürür  |

## 📝 Kullanım Örnekleri

### cURL ile Dosya Dönüştürme

```bash
curl -X POST http://localhost:3000/api/udf/convert \
  -F "file=@document.docx" \
  -F "outputFormat=udf"
```

### JavaScript ile Kullanım

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("outputFormat", "udf");

fetch("http://localhost:3000/api/udf/convert", {
	method: "POST",
	body: formData,
})
	.then((response) => response.json())
	.then((data) => {
		if (data.success) {
			console.log("Dönüştürme başarılı:", data.data.downloadUrl);
		}
	});
```

## 🐛 Hata Kodları

| HTTP Status | Açıklama                                       |
| ----------- | ---------------------------------------------- |
| 400         | Geçersiz istek (dosya yok, format hatası, vb.) |
| 404         | Dosya bulunamadı                               |
| 413         | Dosya boyutu çok büyük                         |
| 500         | Sunucu hatası                                  |
| 503         | Python/UDF-Toolkit kullanılamıyor              |

## 📁 Proje Yapısı

```
app/
├── src/
│   ├── config/          # Konfigürasyon
│   ├── routes/          # API routes
│   ├── services/        # İş mantığı
│   ├── types/           # TypeScript tipleri
│   └── index.ts         # Ana uygulama
├── uploads/             # Yüklenen dosyalar
├── dist/                # Build çıktısı
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🔧 Geliştirme

### Scripts

- `npm run dev`: Geliştirme modunda çalıştır (nodemon)
- `npm run build`: TypeScript'i derle
- `npm start`: Production modunda çalıştır

### Logs

Uygulama Morgan ile HTTP isteklerini loglar. Geliştirme modunda detaylı loglar görürsünüz.

## 🚨 Güvenlik

- Helmet.js ile güvenlik başlıkları
- CORS koruması
- Dosya boyutu sınırlaması
- Dosya tipi kontrolü
- Güvenli dosya isimlendirme

## 📄 Lisans

MIT License
