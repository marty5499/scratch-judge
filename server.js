import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 設置靜態文件夾
app.use(express.static(path.join(__dirname, '.')));

// 创建 uploads 目录（如果不存在）
const testcaseDir = path.join(__dirname, 'testcase');
if (!fs.existsSync(testcaseDir)) {
  fs.mkdirSync(testcaseDir);
}

// 配置 Multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, testcaseDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 主頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 文件上传路由
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});

// 啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
