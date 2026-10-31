# 阿里云国内访问部署

CampusFlow 可以作为一个 Node 服务运行：它同时提供构建后的前端和 `/api/health`、`/api/plan`、`/api/sources`。本目录配合仓库根目录的 `Dockerfile`，适合部署到阿里云函数计算 FC 3.0 或云服务器 ECS。

## 选择方式

- **函数计算 FC 3.0**：适合先上线演示，不需要维护操作系统。创建 Web 函数或 HTTP 触发器，运行时选择 Node.js 20，构建方式选择 Docker，监听端口填 `8080`。
- **云服务器 ECS**：适合需要稳定固定地址、长期演示或绑定域名。安装 Docker 后运行本仓库镜像即可。

大陆节点和自有域名的正式网站通常需要完成 ICP 备案；没有备案域名时，可先用阿里云提供的公网访问地址验证接口，再办理域名和备案。备案、域名和公网安全组规则由账号持有人在阿里云控制台完成。

## ECS 部署

在 ECS 上安装 Docker，然后执行：

```bash
git clone https://github.com/kane959/chuanzhi-ai-web-2026.git
cd chuanzhi-ai-web-2026
docker build -t campusflow:latest .
docker run -d --name campusflow \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SYNC_ALLOWED_HOSTS=example.edu.cn,www.example.edu.cn \
  -e CORS_ALLOWED_ORIGINS=https://kane959.github.io \
  campusflow:latest
```

在 ECS 安全组放行 TCP `8080`，先验证：

```text
http://ECS公网IP:8080/api/health
```

生产环境建议用 Nginx/Caddy 终结 HTTPS，再把 `CORS_ALLOWED_ORIGINS` 改成实际前端地址。不要把模型 API Key 写进镜像或 Git；如需真实模型，在 ECS 环境变量中设置 `MODEL_PROVIDER`、`MODEL_BASE_URL`、`MODEL_NAME`、`MODEL_API_KEY`。

## FC 3.0 部署

### 直接上传 ZIP（无需 Docker）

先以同源接口模式构建前端，避免云端网页仍请求 Vercel：

```powershell
$env:VITE_API_BASE_URL='/'
pnpm build
```

ZIP 根目录仅放 `server/` 和 `prototype/dist/`，不要包含 `.env`、模型密钥或开发依赖。服务端使用 Node 内置模块，无需上传 `node_modules`。

在杭州地域创建 Web 函数，使用以下配置：

| 配置 | 值 |
| --- | --- |
| 运行环境 | 自定义运行时 → Node.js → Node.js 22 / Debian 11 |
| 启动命令 | `node server/index.mjs` |
| 监听端口 | `8080` |
| 最小实例数 | `0`（减少闲置资源费用，首次访问会冷启动） |
| CPU / 内存 / 磁盘 | `0.35 vCPU` / `0.5 GB` / `512 MB` |
| 单实例并发 | `20` |
| 超时 | `60` 秒 |

环境变量示例（白名单可按实际演示资料调整）：

```json
{
  "PORT": "8080",
  "HOST": "0.0.0.0",
  "TZ": "Asia/Shanghai",
  "MODEL_PROVIDER": "demo",
  "CORS_ALLOWED_ORIGINS": "https://kane959.github.io",
  "SYNC_ALLOWED_HOSTS": "moe.gov.cn,sysu.edu.cn,scut.edu.cn"
}
```

`PORT` 必须与监听端口一致。`MODEL_PROVIDER=demo` 不会调用付费模型；这不免除 FC 计算和流量费用。最小实例数为 0 也不是费用上限，公开服务应另外限制最大实例数并设置费用提醒。

部署后先检查 `/api/health`、`/api/sources` 和首页。默认域名是否允许 HTML 在浏览器内展示需要实测；阿里云的 HTTP 触发器可能对默认域名添加附件下载响应头，参见[官方说明](https://help.aliyun.com/zh/functioncompute/return-results-forcibly-downloaded-when-i-access-an-http-function-through-a-browser)。如果出现强制下载，需要绑定合规的自定义域名；中国大陆节点的自定义域名通常需要备案。API 返回成功不能替代网页打开验证。

### 容器方式

也可以在函数计算控制台创建容器函数：

1. 选择与用户接近的国内地域，创建 Web 函数，运行时选择 Docker 镜像。
2. 从 GitHub 构建镜像，或在本地构建后推送到阿里云容器镜像服务 ACR。
3. HTTP 触发器设置为允许匿名访问，容器端口 `8080`。
4. 添加环境变量 `SYNC_ALLOWED_HOSTS` 和 `CORS_ALLOWED_ORIGINS=https://kane959.github.io`。
5. 访问 FC 提供的公网地址验证 `/api/health`，再把这个地址填入 GitHub 仓库变量 `VITE_API_BASE_URL`，重新运行 Pages 工作流。

匿名 HTTP 触发器只适合公开演示；接口仍有请求体、超时和官网域名白名单限制。拿到 FC 地址后必须从中国大陆网络实际测试，不要只依据控制台的部署状态判断“无需 VPN”。

## 验证清单

```text
GET  /api/health
GET  /api/sources
POST /api/plan  {"goal":"宿舍漏水，报修需要准备什么？","availability":"afternoon","evidence":[]}
```

前端在 GitHub Pages，后端在阿里云时，后端必须允许 Pages 的精确 Origin；服务端已经支持 `CORS_ALLOWED_ORIGINS`、`PUBLIC_WEB_ORIGIN` 和 `OPTIONS` 预检。不要使用 `*` 放开带有用户数据的接口。
