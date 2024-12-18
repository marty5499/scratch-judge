# 使用官方的 Node.js 鏡像作為基礎鏡像
FROM node:16

# 安裝 Puppeteer 相依套件
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    && rm -rf /var/lib/apt/lists/*

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安裝項目依賴
RUN npm install

# 複製專案文件到工作目錄
COPY . .

# 暴露應用程序運行的端口
EXPOSE 3000

# 啟動應用程序
CMD ["npm", "run", "judge"]
