# Wireless Sensing Paper Digest

无线感知（Wireless Sensing）领域每日论文速递。

子领域：
- ❤ 生理感知 (Physiological Sensing)
- ◎ 定位 (Localization)
- ▦ 成像 (Imaging)
- ⚿ 安全 (Security)

> 本仓库只保存渲染好的静态网页 (`docs/`)。论文原始数据保存在作者本地，不上传。

## 在线访问

GitHub Pages：`https://<your-github-user>.github.io/Seneing_News/`

## 本地架构（仅作者机器上的文件，不在仓库内）

```
Seneing_News/
├── docs/                ← 渲染产物，唯一被 git 跟踪的子目录
├── data/                ← 原始论文 JSON（gitignore）
│   ├── papers/<id>.json
│   └── schema.md
├── scripts/             ← 构建/部署脚本（gitignore）
│   ├── config.py        ← 站点名、子领域、base_url 等
│   ├── build.py         ← 把 data/ → docs/
│   ├── add_paper.py     ← 交互式新增论文
│   ├── deploy.py        ← build + commit + push
│   └── templates/
│       ├── *.html       ← Jinja2 模板
│       ├── style.css
│       └── app.js
├── .gitignore           ← 只允许 docs/、README.md、.gitignore
└── README.md
```

## 日常工作流

```bash
# 1) 新增一篇论文（也可手动在 data/papers/ 放 JSON）
python scripts/add_paper.py
# 或者从 arXiv 预填
python scripts/add_paper.py --from-arxiv 2401.12345

# 2) 本地预览
python scripts/build.py --serve
# 打开 http://127.0.0.1:8765/Seneing_News/

# 3) 发布到 GitHub Pages
python scripts/deploy.py "add 3 papers (2026-05-17)"
```

## 首次配置

1. 改 `scripts/config.py` 里：
   - `SITE["base_url"]` —— 改成 `/你的仓库名`（如果用户站点设为 `""`）
   - `SITE["author"]`、`SITE["github"]`
2. 在 GitHub 仓库 **Settings → Pages → Source** 选 **Deploy from a branch**，
   分支 `main`，目录 `/docs`。
3. 推送一次：

```bash
git remote add origin git@github.com:<you>/Seneing_News.git
python scripts/deploy.py "initial commit"
```

## 论文数据格式

详见 [data/schema.md](data/schema.md)。最小示例：

```json
{
  "title": "...",
  "category": "physiological",   // physiological | localization | imaging | security
  "date": "2026-05-17",
  "tags": ["WiFi", "CSI"],
  "tldr": "一句话概括",
  "summary": "**问题：** ...\n\n**方法：** ..."
}
```

`summary` 支持极简 markdown：`**加粗**`、`*斜体*`、`` `代码` ``、空行分段、`\n` 换行。

## 隐私设计

- `data/`、`scripts/` 都在 `.gitignore` 里，原始 JSON 永远不会被推到 GitHub。
- 每篇 JSON 里的 `notes` 字段（私人备注）也被构建器主动剔除，不会出现在 HTML。
- GitHub 上别人能看到的只有渲染好的 `docs/`（即网页本身）。

## 致敬

界面与组织方式参考了
[nanless/audio-paper-digest-blog](https://github.com/nanless/audio-paper-digest-blog)。
但本项目用纯 Python + Jinja2 实现，不依赖 Hugo。
