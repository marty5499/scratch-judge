import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 取得當前模組檔案的路徑
const __filename = fileURLToPath(import.meta.url);
// 取得當前模組檔案所在的目錄路徑
const __dirname = path.dirname(__filename);

const app = express();

// 設置靜態文件夾，將 public 目錄設置為靜態文件夾
app.use(express.static(path.join(__dirname, 'public')));

// 確認並創建 uploads 目錄（如果不存在）
const testcaseDir = path.join(__dirname, 'public/testcase');
if (!fs.existsSync(testcaseDir)) {
  fs.mkdirSync(testcaseDir);
}

// 配置 Multer 用於文件上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 設置文件上傳目的地目錄為 testcase
    cb(null, testcaseDir);
  },
  filename: (req, file, cb) => {
    // 解碼上傳的文件名，防止中文文件名亂碼
    const decodedFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    // 使用解碼後的文件名保存文件
    cb(null, decodedFileName);
  }
});

const upload = multer({ storage: storage });

// 設置主頁路由，當用戶訪問根路徑時，返回 public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 設置文件上傳路由，處理用戶上傳的文件
app.post('/upload', upload.single('file'), (req, res) => {
  // 回應上傳成功訊息
  res.send('File uploaded successfully');
});

// 啟動伺服器，監聽指定的埠
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
