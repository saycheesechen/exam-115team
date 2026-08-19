# 115 年題庫練習

Vue 3、Vite、TypeScript、Vue Router、Pinia、Tailwind CSS 製作的純前端題庫網站。

## 開發

```bash
pnpm install
python3 scripts/convert_docs.py
pnpm dev
```

## 題庫轉換

`scripts/convert_docs.py` 會讀取 `115doc/` 內的 `.doc` 與 `.docx`，輸出：

- `public/data/index.json`：科目與題數索引
- `public/data/subject-*.json`：依科目按需載入的題庫
- `conversion-report.json`：各檔案題數及解析錯誤

原始 Word 文件不會被修改。舊 `.doc` 透過 macOS `textutil` 在暫存目錄轉為 `.docx` 後解析。

## GitHub Pages

專案使用 hash router 與相對 base path，可部署在 GitHub Pages 的子目錄：

```bash
pnpm build
```

將 `dist/` 內容發布至 GitHub Pages 即可。
