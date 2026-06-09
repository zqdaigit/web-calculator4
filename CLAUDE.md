# 项目协作与分支规范 (CLAUDE.md)

## 1. 构建与测试规范
- **Build**: `npm run build`
- **Test**: `npm test`

## 2. 研发协作与目录隔离规范

为了提高团队协作效率，我们将研发工作区划分为不同的角色专属目录：

### 角色目录与职责
- **项目管理 (PM)**: 根目录。负责 `TODO.md` 看板管理，维护 `main` 与 `review/[ArtifactKey]` 分支。
- **需求分析 (BA/PO)**: `requirements/` 目录。负责 PRD 与需求澄清。使用 Multica 执行分支。
- **交互设计 (UX/UI)**: `designs/` 目录。负责设计原型与规范。使用 Multica 执行分支。
- **静态原型 (FE Prototype)**: `designs/prototypes/` 目录。负责 HTML 静态原型实现。使用 Multica 执行分支。
- **同步校验 (Sync)**: `sync/` 目录。负责一致性审计报告。使用 Multica 执行分支。
- **开发测试 (Dev/QA)**: 业务代码目录。分支开发 (`feature/`, `bugfix/`)，通过 PR 合并。

### 资产命名与隔离
- **ArtifactKey**: 业务资产唯一键 (如 `web-calculator`)，同一业务需复用此键。
- **SyncKey**: `[IssueID]-[change-slug]`，仅用于 `sync/` 目录下的过程同步文件。
- 正式资产 PRD/UX 文档只维护当前有效状态，过程审计信息归口到 Git 提交记录和 `sync/` 目录。
