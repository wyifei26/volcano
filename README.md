# 火山劫连载站

Astro 静态站，用于发布《火山劫》的最新正文、人物关系、地图和世界观设定。

## 本地开发

```bash
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:4321
```

## 更新正文

把写作软件导出的新文件放在项目根目录，命名保持：

```text
火山劫-YYYYMMDD.txt
```

然后运行：

```bash
npm run import
npm run build
```

导入脚本会自动选择日期最新的 `火山劫-YYYYMMDD.txt`，按卷、楔子、章节标题拆分，生成：

```text
src/data/generated/chapters.json
```

网页构建时会读取这个文件生成目录页和每一章的静态阅读页。

## 内容维护

- 人物、阵营、地点数据在 `src/data/site.ts`。
- 页面文件在 `src/pages/`。
- 全局视觉样式在 `src/styles/global.css`。
- 原稿导入逻辑在 `scripts/import-novel.mjs`。

## GitHub Pages

仓库推送到 GitHub 后，在仓库设置里启用 Pages，并选择 GitHub Actions 作为发布来源。

`.github/workflows/deploy.yml` 会在 `main` 分支推送时自动：

1. 安装依赖。
2. 导入最新原稿。
3. 构建静态站。
4. 发布 `dist/` 到 GitHub Pages。
