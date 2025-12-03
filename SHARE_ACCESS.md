# 如何让朋友访问你的测试服务器

## 方式一：同一局域网访问（推荐用于本地测试）

### 步骤：

1. **确保服务器正在运行**
   ```bash
   # 后端（端口8000）
   cd backend
   .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
   
   # 前端（端口3000）
   cd frontend
   npm run dev
   ```

2. **找到你的局域网IP地址**
   - 打开命令提示符，运行：`ipconfig`
   - 找到 "IPv4 地址"，通常是 `192.168.x.x` 格式
   - 你的IP地址可能是：`192.168.2.10`

3. **配置前端环境变量**
   在 `frontend` 目录创建 `.env.local` 文件：
   ```env
   NEXT_PUBLIC_API_BACKEND_URL=http://192.168.2.10:8000
   ```

4. **重启前端服务器**
   ```bash
   cd frontend
   npm run dev
   ```

5. **告诉朋友访问地址**
   - 前端地址：`http://192.168.2.10:3000`
   - 确保你和朋友在同一局域网（Wi-Fi/路由器）

6. **配置Windows防火墙**
   - 打开 Windows Defender 防火墙
   - 允许端口 3000 和 8000 的入站连接
   - 或在防火墙弹出提示时点击"允许访问"

## 方式二：互联网访问（需要公网IP或内网穿透）

### 选项A：使用内网穿透工具（推荐）

1. **使用 ngrok（免费）**
   ```bash
   # 安装 ngrok: https://ngrok.com/
   # 启动后端隧道
   ngrok http 8000
   
   # 启动前端隧道（新终端）
   ngrok http 3000
   ```
   
   然后：
   - 在 `frontend/.env.local` 中设置：
     ```env
     NEXT_PUBLIC_API_BACKEND_URL=https://你的ngrok后端地址.ngrok.io
     ```
   - 告诉朋友访问：`https://你的ngrok前端地址.ngrok.io`

2. **使用其他内网穿透工具**
   - ZeroTier（虚拟局域网）
   - Tailscale
   - Cloudflare Tunnel

### 选项B：部署到云服务（推荐用于正式测试）

- **Railway**（推荐）：https://railway.app/
- **Vercel**（前端）：https://vercel.com/
- **Heroku**
- **DigitalOcean**

## 安全注意事项

⚠️ **重要提醒：**

1. **不要在生产环境使用 `CORS_ORIGINS: ["*"]`**
   - 这允许任何网站访问你的API
   - 正式部署时应该指定允许的域名

2. **API密钥安全**
   - 确保 `.env` 文件不会被提交到Git
   - 不要在前端代码中暴露敏感API密钥

3. **临时测试后关闭**
   - 测试完成后关闭服务器或限制访问
   - 不要长期开放端口给公网

## 故障排除

### 朋友无法访问？

1. **检查防火墙**
   ```powershell
   # 允许端口（以管理员身份运行PowerShell）
   New-NetFirewallRule -DisplayName "Allow Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Port 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```

2. **检查服务器是否监听正确地址**
   ```powershell
   netstat -ano | findstr :8000
   # 应该显示 0.0.0.0:8000 或 [::]:8000
   ```

3. **检查IP地址是否正确**
   ```powershell
   ipconfig
   # 使用局域网IP，不要使用 127.0.0.1 或 localhost
   ```

4. **检查路由器设置**
   - 某些路由器可能阻止局域网内设备间通信
   - 尝试关闭"AP隔离"或"客户端隔离"功能

### API连接失败？

1. **确保后端URL配置正确**
   - 检查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_BACKEND_URL`
   - 如果是局域网访问，使用 `http://你的IP:8000`
   - 如果是公网访问，使用完整URL（如 `https://xxx.ngrok.io`）

2. **检查CORS配置**
   - 后端已经配置为允许所有来源（`CORS_ORIGINS: ["*"]`）
   - 如果还有问题，检查后端日志

## 快速测试清单

- [ ] 后端服务器运行在 `0.0.0.0:8000`
- [ ] 前端服务器运行在 `0.0.0.0:3000`
- [ ] Windows防火墙允许端口3000和8000
- [ ] 知道你的局域网IP地址
- [ ] 创建了 `frontend/.env.local` 并配置了正确的后端URL
- [ ] 重启了前端服务器
- [ ] 朋友在同一局域网（如果使用方式一）

## 示例配置

**frontend/.env.local（局域网访问）：**
```env
NEXT_PUBLIC_API_BACKEND_URL=http://192.168.2.10:8000
```

**frontend/.env.local（ngrok访问）：**
```env
NEXT_PUBLIC_API_BACKEND_URL=https://abc123.ngrok.io
```

**frontend/.env.local（使用Next.js代理，同一服务器）：**
```env
# 留空或删除此文件，将使用相对路径 /api/v1
```

