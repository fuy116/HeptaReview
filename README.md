# HeptaReview 📚

一個強大的知識卡片管理和複習應用，旨在幫助用戶更有效地學習和記憶知識。提供直觀的介面來創建、管理和複習學習卡片。

## ✨ 功能特色

- 📝 **智能卡片管理** - 創建和編輯學習卡片
- 📚 **主題分類** - 按科目組織卡片
- 🌙 **深色模式** - 支援深色/淺色主題切換
- 🔄 **即時同步** - 資料即時同步和儲存
- 📱 **響應式設計** - 完美適配各種裝置
- 🚀 **Docker 部署** - 一鍵啟動完整應用

## 🛠️ 技術棧

### 前端
- **React 18** + **TypeScript** - 現代化前端框架
- **Vite** - 快速建構工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Query** - 強大的狀態管理
- **Wouter** - 輕量級路由

### 後端
- **Express** + **TypeScript** - Node.js 後端框架
- **Drizzle ORM** - 類型安全的 ORM
- **PostgreSQL 14** - 可靠的關聯式資料庫

### 部署
- **Docker** + **Docker Compose** - 容器化部署
- **Nginx** - 反向代理和靜態資源服務

## 🚀 快速開始

### 使用 Docker (推薦)

1. **克隆專案**
   ```bash
   git clone https://github.com/fuy116/HeptaReview.git
   cd HeptaReview
   ```

2. **一鍵啟動**
   ```bash
   docker-compose up -d --build
   ```

3. **初始化資料庫**
   ```bash
   docker-compose exec app npm run db:push
   ```

4. **訪問應用**
   - 前端應用：http://localhost:3001
   - 資料庫：localhost:5433

### 本地開發

如果您偏好本地開發環境：

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設置環境變數**
   ```bash
   cp .env.example .env
   # 編輯 .env 文件設置資料庫連接
   ```

3. **啟動資料庫**
   ```bash
   docker-compose up -d db
   ```

4. **啟動開發服務器**
   ```bash
   npm run dev
   ```

## 📋 系統需求

- **Node.js** >= 18
- **Docker** 和 **Docker Compose**
- **PostgreSQL** >= 14 (如果不使用 Docker)

## 🐳 Docker 命令

| 命令 | 說明 |
|------|------|
| `docker-compose up -d --build` | 建構並啟動所有服務 |
| `docker-compose ps` | 查看服務狀態 |
| `docker-compose logs -f app` | 查看應用日誌 |
| `docker-compose exec app npm run db:push` | 初始化資料庫 |
| `docker-compose down` | 停止所有服務 |
| `docker-compose down -v` | 停止服務並清理資料 |

## 📁 專案結構

```
HeptaReview/
├── client/                 # 前端代碼
│   ├── src/
│   └── index.html
├── server/                 # 後端代碼
│   ├── index.ts
│   ├── db.ts
│   └── routes.ts
├── shared/                 # 共享類型和模式
├── dist/                   # 建構輸出
├── docker-compose.yml      # Docker 組合配置
├── Dockerfile.app          # 應用 Docker 文件
└── package.json
```

## 🔧 配置說明

### 環境變數

創建 `.env` 文件並設置以下變數：

```env
# 資料庫配置
DATABASE_URL=postgres://heptareview:heptareview@db:5432/heptareview

# 服務器配置
PORT=5001
NODE_ENV=production

# Session 密鑰
SESSION_SECRET=your-secure-session-secret
```

### 資料庫

應用使用 PostgreSQL 作為主要資料庫，支援：
- 用戶管理
- 卡片和主題管理
- 學習進度追蹤

## 📈 開發指南

### 新增功能

1. 前端組件放在 `client/src/components/`
2. 後端路由放在 `server/routes.ts`
3. 資料庫模式定義在 `shared/schema.ts`

### 資料庫遷移

```bash
# 推送資料庫變更
npm run db:push

# 生成遷移文件（如需要）
npx drizzle-kit generate:pg
```

## 🤝 貢獻指南

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 🐛 故障排除

### 常見問題

1. **容器無法啟動**
   - 檢查端口 3001 和 5433 是否被占用
   - 確保 Docker 正在運行

2. **資料庫連接失敗**
   - 確認 `DATABASE_URL` 設置正確
   - 檢查資料庫容器是否正在運行

3. **建構失敗**
   - 清理 node_modules：`rm -rf node_modules && npm install`
   - 重新建構映像：`docker-compose build --no-cache`

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

感謝所有為這個專案做出貢獻的開發者和使用者！

---

**⭐ 如果這個專案對您有幫助，請給我們一個星星！** 