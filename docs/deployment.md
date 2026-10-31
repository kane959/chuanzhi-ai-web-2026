# 公网访问与官网同步

## 阿里云国内部署

要让中国大陆用户不依赖 `*.vercel.app`，推荐使用阿里云 FC 3.0 或 ECS。仓库根目录提供了可复现的 `Dockerfile`，详细步骤见 [`deploy/alibaba/README.md`](../deploy/alibaba/README.md)。部署后先访问 `/api/health`，再把后端地址写入 GitHub Actions 变量 `VITE_API_BASE_URL`，并设置 `CORS_ALLOWED_ORIGINS=https://kane959.github.io`。大陆节点绑定自有域名通常还需要 ICP 备案；在没有备案域名时，先用阿里云公网地址验证服务，再办理备案和 HTTPS。

## 临时评委链接

Vercel CLI 可以在未登录状态创建临时预览：

```bash
npx vercel deploy --temporary --yes
```

临时地址适合演示和发给同学体验，默认约 60 分钟后过期。CLI 输出的 `claimUrl` 可以把部署认领到自己的 Vercel 账号，获得长期管理地址。

## 长期部署

登录 Vercel 后，在仓库根目录运行：

```bash
npx vercel login
npx vercel --yes
```

仓库中的 `vercel.json` 已配置：

- `pnpm install --dir prototype --frozen-lockfile`
- `pnpm build`
- 静态产物目录 `prototype/dist`
- `/api/health` 和 `/api/sources` 两个 Node Functions
- `/api/plan` 结构化 Planner Function

GitHub Pages 是静态托管，不能执行这些 API。部署后，将后端域名设置为 GitHub 仓库变量 `VITE_API_BASE_URL`，并设置服务端环境变量 `CORS_ALLOWED_ORIGINS=https://kane959.github.io`（也可设置 `PUBLIC_WEB_ORIGIN`）。这样 Pages 前端会跨域访问 API，官网同步不再请求 Pages 自身的 404 路径。

## 启用官网单页同步

在 Vercel 项目的 Environment Variables 中设置：

```text
SYNC_ALLOWED_HOSTS=example.edu.cn,www.example.edu.cn
```

只写获得授权的官网域名，多个域名用逗号分隔。没有设置时，前端会显示“待配置”，接口拒绝同步；这是默认安全状态。同步接口每次只读取一个页面，限制 512 KB 和 8 秒，拒绝回环、内网和非标准端口，并把 URL、标题、摘要和文档 ID 返回给前端，不会自动提交到学校系统。

本地运行方式：

```powershell
$env:SYNC_ALLOWED_HOSTS="example.edu.cn"
pnpm serve
```

然后访问 `http://127.0.0.1:8787/`。`pnpm dev` 只启动 Vite 前端；要使用 `/api/sources`，同时运行 `pnpm server`，Vite 会把 `/api` 代理到 8787 端口。
