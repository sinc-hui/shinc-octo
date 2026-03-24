# 个人 CRM 系统 - 端到端加密版

一个基于 React + Supabase 构建的个人人脉关系管理系统，所有敏感数据采用端到端加密存储，确保最高级别的数据安全。

## ✨ 核心特性

### 🔐 安全性
- **端到端加密**：所有敏感数据（姓名、手机号、邮箱、沟通记录、任务内容）在客户端加密后才发送到服务器
- **PBKDF2 密钥派生**：用户主密码经过 100,000 次迭代派生加密密钥
- **AES-256 加密**：采用工业标准加密算法
- **RLS 数据隔离**：Supabase 行级安全策略，确保用户只能访问自己的数据
- **服务器不可见**：即使数据库泄露，攻击者也只能看到加密密文

### 📋 功能模块
- **用户认证**：邮箱注册/登录，支持密码重置
- **联系人管理**：增删改查、标签分组、来源记录
- **沟通记录**：电话/会面/微信/邮件/工作往来 5 种类型，时间线展示
- **跟进任务**：优先级设置、截止日期、完成状态追踪
- **搜索筛选**：快速定位联系人和记录

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| UI 样式 | Tailwind CSS 4 |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| 加密 | Crypto.js (AES + PBKDF2) |

## 📁 项目结构

```
personal-crm-app/
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Supabase 客户端 + TypeScript 类型定义
│   │   ├── crypto.ts        # 端到端加密工具
│   │   └── contacts.ts      # 联系人 API（含加解密逻辑）
│   ├── contexts/
│   │   └── AuthContext.tsx # 用户认证上下文
│   ├── pages/
│   │   ├── Login.tsx        # 登录/注册页面
│   │   ├── Dashboard.tsx    # 联系人列表
│   │   └── ContactDetail.tsx # 联系人详情
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 应用入口
│   └── index.css            # Tailwind 样式
├── public/                   # 静态资源
├── .env                     # 环境变量
├── supabase-init.sql        # 数据库数据库初始化脚本
├── tailwind.config.js       # Tailwind 配置
└── vite.config.ts           # Vite 配置
```

## 🚀 快速开始

### 前置要求
- Node.js >= 20
- npm >= 9
- Supabase 账号（[免费注册](https://supabase.com)）

### 第一步：克隆项目

```bash
cd personal-crm-app
npm install
```

### 第二步：配置环境变量

创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

获取方式：
1. 进入 Supabase Dashboard → **Settings** → **API**
2. 复制 **Project URL** 和 **anon public** key

### 第三步：初始化数据库

1. 打开 Supabase Dashboard
2. 进入 **SQL Editor** → **New Query**
3. 复制 `supabase-init.sql` 的全部内容
4. 点击 **RUN** 执行

数据库表结构：
- `profiles` - 用户扩展信息
- `contacts` - 联系人（含加密字段）
- `records` - 沟通记录
- `tasks` - 跟进任务

### 第四步：启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 📖 使用指南

### 注册账号

1. 填写邮箱和登录密码
2. **设置主密码**（用于加密/解密数据）
   - ⚠️ **主密码无法找回**，请务必牢记！
   - 丢失主密码将导致所有数据无法解密

### 添加联系人

点击右上角「+ 添加联系人」，填写信息后保存。

### 管理联系人和记录

1. 在列表页点击联系人卡片进入详情
2. 添加沟通记录、设置跟进任务
3. 所有数据自动加密存储

## 🔐 加密原理

### 端到端加密流程

```
用户输入数据
    ↓
AES 加密（使用主密码派生的密钥）
    ↓
发送加密密文到服务器
    ↓
服务器存储密文（无法解密）
```

### 密钥派生

```typescript
// PBKDF2 - 100,000 次迭代
const key = CryptoJS.PBKDF2(
  masterPassword,
  salt,
  { keySize: 256/32, iterations: 100000 }
)
```

### 数据加密

```typescript
const encrypted = CryptoJS.AES.encrypt(
  plainText,
  key,
  { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
)
```

## 🏗️ 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到任意静态托管平台。

## 🌐 部署指南

### 部署到 Vercel

```bash
npm install -g vercel
vercel
```

### 部署到 Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 环境变量配置

部署时需要添加以下环境变量：

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## ⚠️ 安全注意事项

1. **主密码安全**：
   - 不要将主密码存储在浏览器密码管理器中
   - 建议使用密码管理器（如 1Password、Bitwarden）
   - 主密码与登录密码不同

2. **数据备份**：
   - 定期导出联系人数据（未来功能）
   - 妥善保存主密码

3. **环境变量**：
   - 不要在代码中硬编码密钥
   - 生产环境使用不同的 Supabase 项目

## 🔧 常见问题

### Q: 忘记主密码怎么办？
A: 主密码无法找回，也无法重置。如果丢失，所有加密数据将永久无法访问。建议将主密码保存在安全的离线存储中。

### Q: 服务器能看到我的数据吗？
A: 不能。所有敏感数据在客户端加密后发送，服务器只存储密文，无法解密。

### Q: 可以更换主密码吗？
A: 可以。需要先解密所有数据，然后用新主密码重新加密（建议添加数据迁移功能）。

### Q: 数据库泄露会怎样？
A: 攻击者只能获取加密密文，如果没有主密码，无法解密任何数据。

## 📝 开发计划

- [ ] 数据导出/导入功能
- [ ] 主密码变更（数据重新加密）
- [ ] 微信登录集成
- [ ] 移动端适配优化
- [ ] 数据统计仪表盘
- [ ] 批量导入联系人（Excel/CSV）

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Supabase 项目配置**：
- URL: `https://kvxbzlsfexatvuteecxl.supabase.co`
- 数据库脚本: `supabase-init.sql`
