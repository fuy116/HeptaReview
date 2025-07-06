# 使用 Node.js 20 Alpine 基礎映像
FROM node:20-alpine

# 設置工作目錄
WORKDIR /app

# 安裝必要的系統依賴 (只保留最基本的)
RUN apk add --no-cache python3 make g++

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製所有源代碼
COPY . .

# 設置環境變數
ENV NODE_ENV=production

# 構建前端
RUN npm run build

# 暴露端口
EXPOSE 5001

# 啟動命令
CMD ["npm", "start"] 