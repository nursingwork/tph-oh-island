#!/usr/bin/env node
/*
 * 產生 services.html（純文字版服務說明頁）、sitemap.xml、llms.txt
 * 資料來源是 island-data.js，改完資料後執行：node build-text-page.js
 * 這一頁給搜尋引擎、AI 搜尋（Google AI Overviews、ChatGPT、Perplexity 等）與不便操作 3D 地圖的使用者閱讀。
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = __dirname;
// 網站正式網址（專案網站放在子路徑下）；若網址改變，這裡與 index.html 開頭的網址都要改
const SITE = 'https://nursingwork.github.io/tph-oh-island';
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'island-data.js'), 'utf8'), sandbox);
const D = sandbox.window.ISLAND_DATA;
if (!D) throw new Error('island-data.js 沒有匯出 ISLAND_DATA');

const today = new Date().toISOString().slice(0, 10);
const updated = D.version || today;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const core = D.modules.filter(m => m.type === 'core' && m.id !== 0);
const center = D.modules.find(m => m.id === 0);
const regions = D.modules.filter(m => m.type === 'region');
const C = D.contact;

// ---- 常見問題（也用於 FAQPage 結構化資料）----
const FAQ = [
  ['哪些事業單位需要辦理勞工健康服務？', '依《職業安全衛生法》第22條，勞工人數 50 人以上的事業單位，應僱用或特約醫護人員辦理勞工健康保護事項。勞工 300 人以上，或從事特別危害健康作業 50 人以上者，依《勞工健康保護規則》第3條（附表二、附表三）辦理；勞工 50～299 人者依第4條（附表四）辦理。'],
  ['臺北醫院職業醫學科的企業臨場健康服務包含哪些內容？', '職業醫學科專科醫師到廠訪視作業環境、辨識危害並提出改善建議；健康檢查結果分析、異常者分級追蹤與健康指導；四大預防計畫的指導（評估執行情形、檢視紀錄並提供醫學建議）；選工、配工與復工評估。四大計畫等文件由事業單位撰寫，本科協助指導，不代為撰寫；健康講座可依事業單位需求另行安排。'],
  ['如何申請臺北醫院的特約臨場健康服務？', '以線上表單、LINE 或電話洽詢；本科依勞工人數與作業性質規劃臨場頻率並提供報價；簽訂合約後，本院提供醫護人員的執業資格證明；事業單位再至勞動部「全國勞工健康服務資訊管理系統」登錄備查。'],
  ['勞工人數怎麼計算？派遣或承攬人員要算進去嗎？', '以事業單位的勞工總人數計算。依《勞工健康保護規則》第10條，派遣、承攬等在工作場所受指揮或監督從事勞動的人員，應比照勞工辦理健康服務事項；實際如何計入，歡迎洽詢本科確認。'],
  ['懷疑自己的疾病與工作有關，可以怎麼做？', '可預約衛生福利部臺北醫院職業醫學科門診。醫師會依工作內容、暴露時序與流行病學證據，評估疾病或傷害與工作的因果關係；符合條件者開立職業病診斷書，供申請勞保職業災害給付使用。'],
  ['勞動能力減損鑑定一定要等法院委託嗎？', '不一定。除了法院民事訴訟的囑託鑑定，也可以在訴訟前以自費門診的方式諮詢，由職業醫學專科醫師評估車禍或職業災害造成的勞動能力減損比例，作為和解或訴訟的參考。'],
  ['職業災害勞工如何回到工作崗位？', '臺北醫院為職業災害勞工職能復健專業機構，提供功能性能力評估（FCE）、工作強化訓練與職務再設計，由職能治療師與職業醫學科醫師共同追蹤復工進度，並在復工前評估身體狀況與工作負荷，提出復工與配工建議。'],
  ['臺北醫院職業醫學科的臨場服務範圍是哪裡？', `目前企業特約臨場健康服務的範圍為${C.serviceArea}。門診地點在${C.address}。`]
];

const serviceList = core.map(m => `
      <article id="service-${m.id}" class="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6">
        <h3 class="text-lg font-extrabold text-white">${esc(m.name)}</h3>
        <p class="text-xs text-slate-400 mt-0.5">${esc(m.officialName)}</p>
        <p class="mt-3 text-sm text-slate-200 leading-relaxed">${esc(m.desc)}</p>
        <ul class="mt-3 list-disc pl-5 space-y-1 text-sm text-slate-300">${m.keypoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
        <dl class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl bg-slate-800/70 p-3"><dt class="text-xs font-bold text-medblue-300">企業可以怎麼用</dt><dd class="text-slate-300 mt-1">${esc(m.employerBenefit)}</dd></div>
          <div class="rounded-xl bg-slate-800/70 p-3"><dt class="text-xs font-bold text-brand-300">勞工可以怎麼用</dt><dd class="text-slate-300 mt-1">${esc(m.workerBenefit)}</dd></div>
        </dl>
        ${(m.sources || []).length ? `<p class="mt-3 text-xs text-slate-400">資料來源：${m.sources.map(s => `<a class="underline text-brand-300" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('、')}</p>` : ''}
      </article>`).join('');

const routes = Object.values(D.scenarios).map(sc => `
      <li class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 class="font-bold text-white">${esc(sc.name)}<span class="ml-2 text-xs font-normal text-slate-400">對象：${esc(sc.audience)}</span></h3>
        <ol class="mt-2 list-decimal pl-5 space-y-1 text-sm text-slate-300">${sc.stops.map(st => { const m = D.modules.find(x => x.id === st.id); return `<li><strong class="text-slate-100">${esc(m.name)}</strong>：${esc(st.text)}</li>`; }).join('')}</ol>
      </li>`).join('');

const faqHtml = FAQ.map(([q, a]) => `
      <details class="group rounded-2xl border border-white/10 bg-slate-900/60 p-5" open>
        <summary class="cursor-pointer font-bold text-white">${esc(q)}</summary>
        <p class="mt-2 text-sm text-slate-300 leading-relaxed">${esc(a)}</p>
      </details>`).join('');

const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', '@id': `${SITE}/services.html#page`, url: `${SITE}/services.html`, name: '衛生福利部臺北醫院 職業醫學科｜服務說明（文字版）', inLanguage: 'zh-TW', dateModified: updated,
      isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#clinic` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '職醫守護島', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: '服務說明（文字版）', item: `${SITE}/services.html` } ] },
    { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ]
};

const html = `<!DOCTYPE html>
<html lang="zh-TW" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>服務說明（文字版）｜衛生福利部臺北醫院 職業醫學科</title>
  <meta name="description" content="衛生福利部臺北醫院職業醫學科的服務說明：職業病與傷害診治門診、企業特約臨場健康服務、工作環境危害評估、員工工作適應性評估、職能復健與重返職場、四大預防計畫指導、健檢分析，以及勞動能力減損鑑定。含法規門檻、申請流程與常見問題。">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${SITE}/services.html">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:title" content="服務說明（文字版）｜衛生福利部臺北醫院 職業醫學科">
  <meta property="og:description" content="職業病門診、企業臨場健康服務、職能復健與勞動能力減損鑑定：法規門檻、申請流程與常見問題。">
  <meta property="og:url" content="${SITE}/services.html">
  <meta property="og:image" content="${SITE}/assets/og-cover.jpg">
  <link rel="icon" type="image/png" sizes="64x64" href="assets/favicon.png">
  <link rel="stylesheet" href="tailwind.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>body{background:#060913} html{scroll-behavior:smooth} @media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}</style>
</head>
<body class="text-slate-100 font-sans">
  <a href="#content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg">跳到主要內容</a>
  <header class="border-b border-white/10 bg-slate-900/70">
    <div class="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
      <a href="index.html" class="flex items-center gap-3">
        <img src="assets/logo-mark.png" alt="" width="36" height="36" class="w-9 h-9 rounded-lg bg-white p-1">
        <span><span class="block text-sm font-extrabold text-white">職醫守護島</span><span class="block text-[11px] text-slate-400">衛生福利部臺北醫院 職業醫學科</span></span>
      </a>
      <nav aria-label="主要" class="flex flex-wrap gap-2 text-xs">
        <a href="index.html" class="px-3 py-1.5 rounded-xl bg-brand-500/15 text-brand-300 border border-brand-500/30 hover:bg-brand-500/25">3D 地圖版</a>
        <a href="#enterprise" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700">企業臨場服務</a>
        <a href="#faq" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700">常見問題</a>
        <a href="#contact" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700">聯絡方式</a>
      </nav>
    </div>
  </header>

  <main id="content" class="max-w-4xl mx-auto px-4 py-8 space-y-12">
    <section>
      <p class="text-xs font-bold tracking-wider text-brand-300">服務說明（文字版）</p>
      <h1 class="mt-1 text-2xl md:text-3xl font-extrabold text-white leading-snug">衛生福利部臺北醫院 職業醫學科</h1>
      <p class="mt-4 text-sm md:text-base text-slate-200 leading-relaxed">${esc(center.desc)}</p>
      <ul class="mt-3 list-disc pl-5 space-y-1 text-sm text-slate-300">${center.keypoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
      <div class="mt-5 flex flex-wrap gap-2 text-sm">
        <a href="${esc(C.formUrl)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-medblue-600 to-brand-500 text-white font-bold">填寫臨場服務諮詢表單</a>
        <a href="${esc(C.lineUrl)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-[#06c755] text-[#06301a] font-bold">加入官方 LINE</a>
        <a href="${esc(C.bookingUrl)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 font-bold">職業醫學科門診掛號</a>
        <a href="tel:${esc(C.tel)}" class="px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 font-bold">電話 ${esc(C.phoneText)}</a>
      </div>
    </section>

    <section id="services" aria-labelledby="h-services">
      <h2 id="h-services" class="text-xl font-extrabold text-white">服務項目</h2>
      <p class="mt-1 text-sm text-slate-400">共七項：六項核心服務與勞動能力減損鑑定。</p>
      <div class="mt-4 space-y-4">${serviceList}</div>
    </section>

    <section id="enterprise" aria-labelledby="h-ent">
      <h2 id="h-ent" class="text-xl font-extrabold text-white">企業臨場健康服務</h2>
      <h3 class="mt-4 font-bold text-brand-300">哪些事業單位需要辦理</h3>
      <p class="mt-1 text-sm text-slate-300 leading-relaxed">依《職業安全衛生法》第22條，勞工人數 50 人以上的事業單位，應僱用或特約醫護人員辦理勞工健康保護事項。實際的人力配置與臨場頻率依《勞工健康保護規則》區分：勞工 300 人以上，或從事特別危害健康作業 50 人以上者，依第3條（附表二、附表三）；勞工 50～299 人者，依第4條（附表四）。<a href="index.html#calc" class="underline text-brand-300">可在 3D 地圖版使用臨場頻率試算</a>。</p>
      <h3 class="mt-4 font-bold text-brand-300">服務內容</h3>
      <ul class="mt-1 list-disc pl-5 space-y-1 text-sm text-slate-300">
        <li>職業醫學科專科醫師到廠，訪視作業環境、辨識危害並提出改善建議</li>
        <li>健康檢查結果分析、異常者分級追蹤與健康指導</li>
        <li>四大預防計畫的指導：評估執行情形、檢視紀錄並提供醫學建議（人因性危害、異常工作負荷、執行職務遭受不法侵害、母性健康保護）</li>
        <li>選工、配工與復工評估</li>
      </ul>
      <p class="mt-2 text-sm text-slate-400">本科提供醫護人員實際到場的臨場服務。四大計畫等文件由事業單位撰寫，本科協助指導，不代為撰寫。健康講座可依事業單位需求另行安排。</p>
      <h3 class="mt-4 font-bold text-brand-300">申請流程</h3>
      <ol class="mt-1 list-decimal pl-5 space-y-1 text-sm text-slate-300">
        <li>以線上表單、LINE 或電話洽詢</li>
        <li>依勞工人數與作業性質，規劃臨場頻率並提供報價</li>
        <li>簽訂合約</li>
        <li>本院提供醫護人員的執業資格證明</li>
        <li>事業單位至勞動部「全國勞工健康服務資訊管理系統」登錄備查</li>
      </ol>
      <h3 class="mt-4 font-bold text-brand-300">服務之間的銜接</h3>
      <ul class="mt-2 space-y-3">${routes}</ul>
    </section>

    <section id="doctors" aria-labelledby="h-doc">
      <h2 id="h-doc" class="text-xl font-extrabold text-white">醫師</h2>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 class="font-bold text-white">蔡旻翰 醫師<span class="ml-2 text-xs font-normal text-slate-400">科主任</span></h3>
          <ul class="mt-2 text-sm text-slate-300 space-y-1">
            <li>學歷：國立臺灣大學醫學系、臺灣大學環境與職業健康科學研究所碩士</li>
            <li>專科：職業醫學科、家庭醫學科、骨質疏鬆、安寧緩和醫學</li>
            <li>經歷：衛生福利部臺北醫院職業醫學科主任；臺大醫院環境及職業醫學部、家庭醫學部醫師</li>
            <li>服務：職業病與職業傷害診治、企業臨場健康服務、健康檢查異常追蹤與健康指導、四大預防計畫的執行指導</li>
          </ul>
        </article>
        <article class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 class="font-bold text-white">林義哲 醫師<span class="ml-2 text-xs font-normal text-slate-400">主治醫師、勞動能力減損鑑定醫師</span></h3>
          <ul class="mt-2 text-sm text-slate-300 space-y-1">
            <li>專科：職業醫學科專科醫師</li>
            <li>經歷：輔仁大學附設醫院職業醫學科主任、台積電專任廠醫、臺大醫院主治醫師</li>
            <li>服務：職業傷病診治與因果認定、勞動能力減損鑑定（法院囑託、訴訟前自費門診諮詢）、休養期判定、復工評估與適性配工建議、企業臨場服務與職場不法侵害預防的指導</li>
            <li>網站：<a class="underline text-brand-300" href="https://ohsmart.blog/" target="_blank" rel="noopener noreferrer">職興市場（ohsmart.blog）</a>，職業醫學與臨場服務相關文章</li>
          </ul>
        </article>
      </div>
    </section>

    <section id="faq" aria-labelledby="h-faq">
      <h2 id="h-faq" class="text-xl font-extrabold text-white">常見問題</h2>
      <div class="mt-4 space-y-3">${faqHtml}</div>
    </section>

    <section id="areas" aria-labelledby="h-area">
      <h2 id="h-area" class="text-xl font-extrabold text-white">服務地區</h2>
      <p class="mt-1 text-sm text-slate-400">企業特約臨場健康服務範圍：${esc(C.serviceArea)}。</p>
      <ul class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">${regions.map(r => `<li class="rounded-xl bg-slate-900/60 border border-white/10 p-3"><strong class="text-white">${esc(r.name)}</strong><span class="block text-xs text-slate-400 mt-0.5">${esc(r.transit)}</span></li>`).join('')}</ul>
    </section>

    <section id="contact" aria-labelledby="h-contact">
      <h2 id="h-contact" class="text-xl font-extrabold text-white">聯絡方式</h2>
      <address class="not-italic mt-3 text-sm text-slate-300 space-y-1">
        <div>衛生福利部臺北醫院 職業醫學科</div>
        <div>地址：${esc(C.address)}</div>
        <div>電話：<a class="underline text-brand-300" href="tel:${esc(C.tel)}">${esc(C.phoneText)}</a></div>
        <div>電子郵件：<a class="underline text-brand-300" href="mailto:${esc(C.email)}">${esc(C.email)}</a></div>
        <div>諮詢表單：<a class="underline text-brand-300" href="${esc(C.formUrl)}" target="_blank" rel="noopener noreferrer">${esc(C.formUrl)}</a></div>
        <div>官方 LINE：<a class="underline text-brand-300" href="${esc(C.lineUrl)}" target="_blank" rel="noopener noreferrer">${esc(C.lineUrl)}</a></div>
        <div>門診掛號：<a class="underline text-brand-300" href="${esc(C.bookingUrl)}" target="_blank" rel="noopener noreferrer">職業醫學科線上掛號</a></div>
        <div>院方網頁：<a class="underline text-brand-300" href="https://www.tph.mohw.gov.tw/?aid=60&amp;pid=225" target="_blank" rel="noopener noreferrer">臺北醫院 職業醫學科</a></div>
      </address>
    </section>

    <section id="sources" aria-labelledby="h-src" class="text-xs text-slate-400 border-t border-white/10 pt-6">
      <h2 id="h-src" class="font-bold text-slate-300">法規依據與資料日期</h2>
      <ul class="mt-2 list-disc pl-5 space-y-1">
        <li>《職業安全衛生法》第22條、第45條</li>
        <li>《勞工健康保護規則》（民國115年6月26日修正，自115年7月1日施行；部分條文另定施行日）第3、4、10、11、12、13、22條及附表二、三、四、七</li>
        <li>本頁內容更新日期：${updated}。法規以全國法規資料庫公告為準，實際適用請洽主管機關或本科。</li>
      </ul>
    </section>
  </main>
  <footer class="max-w-4xl mx-auto px-4 py-8 text-xs text-slate-400">
    衛生福利部臺北醫院 職業醫學科 ｜ <a href="index.html" class="underline">回到 3D 地圖版</a>
  </footer>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'services.html'), html);

// ---- sitemap.xml ----
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${updated}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE}/services.html</loc><lastmod>${updated}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
</urlset>
`);

// ---- llms.txt（給 AI 搜尋與語言模型讀的網站摘要）----
const llms = `# 衛生福利部臺北醫院 職業醫學科（職醫守護島）

> 衛生福利部臺北醫院職業醫學科的服務導覽。職業醫學著重於預防與治療職業疾病和職業傷害；本科於民國90年12月4日成立，提供職業病門診、企業特約臨場健康服務、職能復健與勞動能力減損鑑定。服務對象包括企業（雇主、人資與職安主管）與勞工。臨場服務範圍：${C.serviceArea}。

## 服務項目
${core.map(m => `- ${m.name}（${m.officialName}）：${m.desc}`).join('\n')}

## 企業臨場健康服務
- 法規門檻：依《職業安全衛生法》第22條，勞工 50 人以上應僱用或特約醫護人員；300 人以上或特別危害健康作業 50 人以上依《勞工健康保護規則》第3條，50～299 人依第4條。
- 申請流程：洽詢 → 規劃頻率與報價 → 簽約 → 院方提供執業資格證明 → 事業單位至勞動部「全國勞工健康服務資訊管理系統」登錄備查。
- 本科提供醫護人員實際到場的臨場服務；四大預防計畫文件由事業單位撰寫，本科協助指導。

## 醫師
- 蔡旻翰 醫師（科主任）：職業醫學科、家庭醫學科等專科醫師。
- 林義哲 醫師（主治醫師、勞動能力減損鑑定醫師）：職業醫學科專科醫師，經營職興市場（https://ohsmart.blog/）。

## 聯絡
- 地址：${C.address}
- 電話：${C.phoneText}
- Email：${C.email}
- 諮詢表單：${C.formUrl}
- 官方 LINE：${C.lineUrl}
- 門診掛號：${C.bookingUrl}

## 頁面
- 3D 地圖版：${SITE}/
- 文字版服務說明與常見問題：${SITE}/services.html

資料更新日期：${updated}
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);
console.log('已產生 services.html、sitemap.xml、llms.txt（資料日期 ' + updated + '）');
