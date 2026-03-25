# Vercel 部署指南

## 方式一：通过 Vercel 网页部署（推荐，最简单）

### 步骤 1：推送代码到 GitHub

1. 在 GitHub 上创建新仓库（例如：`personal-crm-app`）
2. 将本地代码推送：

```bash
cd "c:\Users\Administrator\WorkBuddy\20260323094330\personal-crm-app"
git remote add origin https://github.com/你的用户名/personal-crm-app.git
git branch -M main
git push -u origin main
```

### 步骤 2：在 Vercel 上部署

1. 登录 [Vercel](https://vercel.com)
2. 点击 **"Add New..."** → **"Project"**
3. 导入刚才的 GitHub 仓库
4. 配置环境变量：

| 环境变量 | 值 |
|---------|-----|
| `VITE_SUPABASE_URL` | `https://kvxbzlsfexatvuteecxl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | 你的 anon key（从 Supabase Dashboard → Settings → API 获取） |

5. 点击 **"Deploy"**
6. 等待 1-2 分钟，部署完成后会得到一个 `https://your-project.vercel.app` 的链接

---

## 方式二：使用 Vercel CLI 命令行部署

如果你已经安装了 Vercel CLI：

```bash
# 安装 CLI（未安装时）
npm install -g vercel

# 登录
vercel login

# 部署
cd "c:\Users\Administrator\WorkBuddy\20260323094330\personal-crm-app"
vercel
```

按照提示操作，输入环境变量即可。

---

## 重要提醒

### ⚠️ 首次部署后必须完成

1. **配置 Supabase 数据库**
   - 打开 `supabase-init.sql` 文件
   - 在 Supabase Dashboard → SQL Editor 中执行

2. **启用 Email 认证**
   - 进入 Supabase Dashboard → Authentication → Providers
   - 确认 Email 已启用

3. **测试应用**
   - 访问 Vercel 提供的链接
   - 注册账号并测试功能

---

## 环境变量获取方式

1. 进入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → **Settings** → **API**
3. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 自定义域名（可选）

1. 在 Vercel 项目设置中，点击 **Domains**
2. 添加你的域名（如 `crm.yourdomain.com`）
3. 按提示配置 DNS 记录

---

## 更新部署

每次代码推送到 GitHub main 分支后，Vercel 会自动重新部署。

---

## 常见问题

### Q: 部署后无法连接 Supabase？
A: 检查环境变量是否正确配置，确保 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正确添加。

### Q: 数据库连接失败？
A: 确认 Supabase 项目中已执行 `supabase-init.sql` 初始化脚本。

### Q: 生产环境报错？
A: 打开浏览器开发者工具（F12）查看 Console，根据错误信息排查。
