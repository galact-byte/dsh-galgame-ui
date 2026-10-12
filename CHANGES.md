# 修改记录 — dsh-galgame-ui

## 未发布 — 许可与商业授权边界

- 原创且有权授权的部分采用 `LicenseRef-Galact-Internal-Use-1.0`：允许合法个人及公司内部自用、免费分发；对外售卖、集成收费产品或提供直接收费的软件服务须书面授权。
- 补充 `LICENSE` 与 `NOTICE`，同步 README、包与皮肤元数据；此前 MIT 声明不被视为不存在，旧版已有效授予的权利不撤回。
- npm 分发和独立皮肤目录附带许可与通知；DSH、React 等上游许可保留，背景图来源未逐项验证，不主张重新授权。尚未发布、未触发远端流水线。

## 2026-08-21 — 迁移动态插件与静态皮肤

### 背景与目标
- 将本地 `dsh-galgame-ui` 动态插件和 `galgame-sakura` 静态皮肤整理到独立仓库，支持第二台电脑迁移。

### 影响与兼容性
- 插件仍使用 `@local/dsh-galgame-ui` 包名，当前通过 `link:` 或 GitHub 源安装，不改变现有 loader ID `galgame-ui`。
- 静态皮肤独立放在 `skin/galgame-sakura`，需要复制到用户 DSH 皮肤目录。

### 文件与实现
| 操作 | 路径 | 说明 |
|---|---|---|
| 新增 | `package.json` | DSH bundle/client 包声明 |
| 新增 | `lib/index.js` | client-only bundle 的 host 入口 |
| 新增 | `lib/client.js` | 动态 Galgame UI |
| 新增 | `skin/galgame-sakura/` | 皮肤清单、样式、背景和实验 hooks |
| 新增 | `scripts/install-skin.ps1` | Windows 皮肤安装脚本 |
| 新增 | `README.md` | 跨电脑安装和 GitHub 安装说明 |

### 验证
- `node --check lib/index.js`：通过。
- `node --check lib/client.js`：通过。
- 源 profile 同时保留 `@loserfox/dsh-gal` 和 `@local/dsh-galgame-ui`，DSH Web 启动返回 `HTTP 200`。

### 已知限制与后续
- npm 发布前需要把 `@local/dsh-galgame-ui` 改成正式包名并移除 `private: true`。
