# 職醫守護島｜維護說明

衛生福利部臺北醫院 職業醫學科的 3D 互動服務地圖。

## 檔案

| 檔案 | 用途 | 誰會改 |
| --- | --- | --- |
| `island-data.js` | 所有內容文字：服務模組、醫師、服務地區、協作流線、故事巡航、臨場試算規則、首次引導 | 科內同仁 |
| `index.html` | 頁面結構、3D 場景與互動程式；彈出視窗（團隊陣容、職興市場、發展沿革）的文字也在這裡 | 負責網站的人 |
| `tailwind.css` | 預先編譯好的樣式，不要手動修改 | 自動產生 |
| `tailwind.config.js`、`tailwind.input.css` | 重新產生 `tailwind.css` 用的設定 | 負責網站的人 |
| `services.html`、`llms.txt`、`sitemap.xml` | 文字版服務說明、給 AI 搜尋的網站摘要、網站地圖。**由 `build-text-page.js` 自動產生，不要手動改**；改完 island-data.js 後執行 `node build-text-page.js` 重新產生 | 自動產生 |
| `robots.txt` | 允許搜尋引擎與 AI 爬蟲讀取的範本。注意：網站在子路徑 `/tph-oh-island/` 下，這個檔案不會生效，要生效需另建 `nursingwork.github.io` repository 放在根目錄 | 負責網站的人 |
| `assets/` | 院徽（`logo-mark.png`、`logo-lockup.png`）、網站圖示（`favicon.png`、`apple-touch-icon.png`）、社群分享預覽圖（`og-cover.jpg`） | 負責網站的人 |

所有檔案放在同一個資料夾，`assets` 資料夾也要一起上傳。網站實際運作需要 `index.html`、`island-data.js`、`tailwind.css` 與 `assets/` 資料夾。

## 改內容

1. 用任何文字編輯器打開 `island-data.js`（建議 VS Code，記事本也可以，存檔時選 UTF-8）。
2. 只改引號裡的文字。檔案開頭有完整的注意事項。
3. 存檔後，直接用瀏覽器打開 `index.html` 預覽。
4. 資料有問題時，畫面下方會跳出提示，例如「流線 flow1：path 裡的島 99 不存在」。完整清單在瀏覽器開發者工具的 Console。
5. 如果整個 3D 島沒出現、只看到「內容資料沒有載入」，通常是少了逗號或引號沒關好，請檢查最後改過的那幾行。

### 常見修改範例

**幫服務加上法源連結與核對日期**（在該模組裡加這兩行）：

```js
sources: [
  { label: '勞工健康保護規則', url: 'https://law.moj.gov.tw/...' }
],
verifiedAt: '2026-11-03',
```

**修改臨場頻率試算**：`calcRules` 逐列對應《勞工健康保護規則》附表二、三、四、七（民國115年6月26日修正）。法規修正時照附表改 `freq`（附表原文）與 `perYear`（換算成每年次數，只用來比較頻率高低）；`min`、`max` 是人數範圍（含頭尾），每組最後一級固定寫 `Infinity`。施行日（`art5EffectiveDate`、`art13p3EffectiveDate`）過了之後，試算畫面的「尚未施行」提醒會自動消失。核對完成後把 `verifiedAt` 填上日期，標題下方會顯示「本科核對」。`recommend5099` 是勞工 50～99 人且無特別危害作業時的本科建議頻率（法規未規定此級距），畫面會以琥珀色標示「建議」，與法定要求區隔。

**修改圖示**：島嶼、路徑、搬運文件的圖示都用 Lucide 圖示名稱（例如 `'stethoscope'`）。目前內建的名稱：hospital, radar, scale, stethoscope, accessibility, clipboard-list, chart-column, ruler, factory, cog, wrench, building-2, microscope, landmark, user-round, repeat, file-text, file-check, clipboard-check, activity, hard-hat, globe, rocket, square, menu, scroll-text, calculator, map, locate-fixed, pause, play, circle-help, phone, mail, message-circle, clipboard-pen, calendar-plus, sun, moon, sunrise, sunset, x, arrow-up-right, map-pin, mouse, zoom-in, compass, info, heart-pulse, circle, check, lightbulb, clock, music, volume-x, waves, search, arrow-down。要用其他 Lucide 圖示，請把該圖示的 SVG 內容加進 `index.html` 開頭的 `iconSprite`（照既有格式，id 為 `i-圖示名稱`）。寫錯名稱時畫面會顯示空心圓，本機預覽會提醒。

**修改或新增服務路徑**：改 `scenarios`。`route` 是小人走過的島（前後必須相鄰，經過中央醫院時寫 0），`stops` 是停留站與說明，`carries` 是每兩站之間搬的東西，寫成 `{ icon: '圖示名稱', text: '文字' }`。新增一條路徑，頁面上會自動多一顆按鈕；路徑不相鄰時，資料檢查會提醒。

**修改職醫小叮嚀**：改 `tips`，每則是 `{ doctor: 'tsai' 或 'lin', text: '一句話' }`。網頁載入 20 秒後第一次出現在醫師頭上，之後每 2 分鐘輪播一則，鏡頭拉近醫師時才看得到。內容屬衛教訊息，請由醫師審閱。

**修改諮詢管道**：改 `contact` 裡的 `formUrl`（諮詢表單）、`lineUrl`（官方 LINE）、`tel`（撥號用，逗號後是分機）與 `phoneText`（畫面顯示的電話）。網站上所有「填寫諮詢表單／加入官方 LINE／撥打電話」按鈕都會一起更新。

**修改首次造訪引導**：改 `introSteps`，每一步是 `['標題', '內文']`。

### 需要寫程式的修改

- 新增一座服務島：除了資料，還要在 `index.html` 的 `buildBuildingForModule` 加上建築造型。

- 在 `index.html` 用了以前沒用過的 Tailwind class：要重新產生 `tailwind.css`（見下方）。

## 部署到 GitHub Pages

1. 把資料夾裡的所有檔案上傳到 repository 根目錄。
2. 到 repository 的 Settings → Pages，Source 選 Deploy from a branch，分支選 `main`、資料夾選 `/ (root)`。
3. 幾分鐘後網址會出現在同一頁。

更新內容時，只要重新上傳改過的檔案即可。瀏覽器可能會快取舊版，可以按 Ctrl+Shift+R（Mac 為 ⌘+Shift+R）強制重新整理確認。

## 分享預覽圖

`assets/og-cover.jpg` 是分享到 LINE、Facebook 時出現的大圖（1200×630）。要換圖時覆蓋同名檔案即可；`index.html` 開頭的 `og:image` 已指向 https://nursingwork.github.io/tph-oh-island/assets/og-cover.jpg，網址若改變請一併修改。

## 重新產生文字版頁面（改內容後）

需要 Node.js。在這個資料夾執行：

```bash
node build-text-page.js
```

會依 island-data.js 重新產生 `services.html`、`llms.txt`、`sitemap.xml`。常見問題（FAQ）的內容寫在 `build-text-page.js` 的 `FAQ` 陣列，要增修也在那裡改。

## 重新產生 tailwind.css

需要先安裝 [Node.js](https://nodejs.org/)，然後在這個資料夾執行：

```bash
npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
```

## 上線前待辦

- [ ] 由醫師逐列核對 `calcRules`（已依民國115年6月26日修正之附表二、三、四、七轉錄），確認後填入 `verifiedAt`。
- [ ] 各服務補上法源連結（`sources`）與核對日期（`verifiedAt`）。
- [ ] 選用：填入 GA4 評估 ID，取消 `index.html` 開頭那段註解，就能統計哪些服務最常被點。
- [ ] 核對服務地區的方位與距離（例如院址本身就在新莊，「新莊區：西南方 1.2 km」需要確認）。
