// 사용법: node scripts/build-pages.mjs  → src/pages/index.html, src/pages/roadmap/*.html 생성
// 책 정보는 scripts/roadmap-data.mjs 에서 고칩니다.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { courses, TOTAL } from './roadmap-data.mjs';

const OUT = process.argv[2] || 'src/pages';
const SITE = 'https://www.송정헌목사.한국';
const PLAY_ALL = 'https://play.google.com/store/search?q=' + encodeURIComponent('송정헌') + '&c=books';
const play = (title) => 'https://play.google.com/store/search?q=' + encodeURIComponent('송정헌 ' + title) + '&c=books';
const VOL80 = '페이스빌더 양육 시스템 소개';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
:root{--navy:#2c4568;--navy-d:#213654;--cream:#f6f2ea;--paper:#fffdf8;--gold:#c9a96e;--ink:#2a2a2a;--mute:#6b6760;--line:#e4dccb}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--cream);color:var(--ink);font-family:'Noto Sans KR',system-ui,sans-serif;font-size:17px;line-height:1.8;word-break:keep-all}
h1,h2,h3,h4{font-family:'Noto Serif KR',serif;line-height:1.35;margin:0}
a{color:inherit}
.wrap{max-width:1040px;margin:0 auto;padding:0 22px}
.eyebrow{font-size:13px;letter-spacing:.22em;color:var(--gold);font-weight:500}
header.top{background:var(--navy);color:#fff}
header.top nav{display:flex;justify-content:space-between;align-items:center;padding:16px 0;font-size:15px}
header.top nav a{text-decoration:none;opacity:.85;margin-left:18px}
header.top nav a:hover{opacity:1}
header.top .brand{font-weight:700;opacity:1;margin:0;letter-spacing:.02em}
.hero{padding-top:70px;padding-bottom:80px}
.hero .who{font-size:15px;color:#d9cfb9;margin-bottom:18px}
.hero h1{font-size:clamp(32px,6vw,54px);font-weight:700;margin:6px 0 18px}
.hero p.sub{font-size:19px;color:#e7e2d6;max-width:640px;margin:0 0 30px}
.btn{display:inline-block;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px;margin:0 8px 10px 0}
.btn.gold{background:var(--gold);color:#1e2a3c}
.btn.line{border:1.5px solid rgba(255,255,255,.6);color:#fff}
.btn.navy{background:var(--navy);color:#fff}
section.blk{padding:72px 0;border-bottom:1px solid var(--line)}
section.blk.alt{background:var(--paper)}
.blk h2{font-size:clamp(26px,4vw,34px);color:var(--navy);margin:8px 0 18px}
.lead{font-size:18px;color:#3b3a37;max-width:760px}
.grid{display:grid;gap:18px}
.g3{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.g2{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.card{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:24px}
.alt .card{background:var(--cream)}
.card h3{font-size:20px;color:var(--navy);margin-bottom:8px}
.card .k{font-size:13px;color:var(--gold);font-weight:700;letter-spacing:.08em}
.card p{margin:6px 0 0;color:#46443f;font-size:16px}
.face{border-top:4px solid var(--navy)}
.face.f2{border-top-color:var(--gold)}.face.f3{border-top-color:#7a2e35}
.areas{display:flex;flex-wrap:wrap;gap:10px;margin:26px 0 30px}
.area{flex:1 1 220px;border-left:4px solid var(--gold);padding:6px 0 6px 14px}
.area b{display:block;font-family:'Noto Serif KR',serif;color:var(--navy);font-size:19px}
.area span{font-size:15px;color:var(--mute)}
.course{display:flex;gap:18px;align-items:flex-start;text-decoration:none;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;transition:transform .15s,box-shadow .15s}
.course:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(44,69,104,.12)}
.num{flex:0 0 52px;height:52px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif KR',serif;font-size:24px;font-weight:700}
.course h3{font-size:22px}
.course h3 small{font-size:14px;color:var(--mute);font-family:'Noto Sans KR';font-weight:400;margin-left:6px}
.course p{margin:6px 0 8px;font-size:15.5px;color:#4a4843}
.course .go{font-size:14px;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.chip{font-size:13px;border:1px solid var(--line);border-radius:6px;padding:2px 9px;background:#fff;color:#444}
.where{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:26px}
.where a{display:block;text-decoration:none;background:var(--navy);color:#fff;border-radius:12px;padding:18px 20px}
.where a b{display:block;font-size:17px}
.where a span{font-size:14.5px;color:#d9cfb9}
table{width:100%;border-collapse:collapse;background:var(--paper);border-radius:12px;overflow:hidden;font-size:15.5px}
th,td{padding:12px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{background:var(--navy);color:#fff;font-weight:600}
td.c{text-align:center}
.tbl{overflow-x:auto;margin-top:22px}
.small{font-size:14.5px;color:var(--mute)}
.book80{display:grid;grid-template-columns:minmax(0,1fr);gap:22px;background:var(--navy);color:#fff;border-radius:18px;padding:34px}
.book80 h3{font-size:28px;color:#fff}
.book80 ol{margin:10px 0 0;padding-left:22px}
.book80 li{margin:6px 0}
.book80 .small{color:#d9cfb9}
.tl{list-style:none;margin:0;padding:0}
.tl li{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px dashed var(--line);font-size:16px}
.tl li span.y{color:var(--mute);white-space:nowrap;font-size:14.5px}
.creed p{margin:4px 0 0;font-size:16px;color:#46443f}
.creed h4{font-size:18px;color:var(--navy);margin-top:18px}
.ser a{display:block;text-decoration:none;padding:14px 0;border-bottom:1px solid var(--line)}
.ser a small{color:var(--gold);font-weight:600;font-size:13.5px}
.ser a b{display:block;font-family:'Noto Serif KR',serif;font-size:18px;color:var(--navy)}
footer{background:var(--navy-d);color:#cfc7b5;padding:36px 0;font-size:14.5px}
footer a{color:#fff}
/* 과정 페이지 */
.chead{color:#fff;padding:54px 0 60px}
.chead h1{font-size:clamp(30px,5vw,44px);margin:10px 0 14px}
.chead p{max-width:780px;color:#efe9dc;margin:0}
.crumb{font-size:14px;opacity:.85;text-decoration:none}
.part{margin-top:46px}
.part>h2{font-size:24px;color:var(--navy);border-bottom:2px solid var(--gold);padding-bottom:8px;margin-bottom:14px}
.part .intro{background:var(--paper);border-left:4px solid var(--gold);padding:14px 18px;border-radius:0 10px 10px 0;font-size:16px;color:#46443f}
.series{margin-top:30px}
.series h3{font-size:21px}
.series .meta{font-size:14px;color:var(--mute);margin:2px 0 12px}
.books{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.book{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:18px;display:flex;flex-direction:column}
.book .v{font-size:12.5px;font-weight:700;letter-spacing:.08em}
.book h4{font-size:18px;margin:4px 0 6px;color:var(--ink)}
.book p{font-size:14.5px;color:#55524b;margin:0 0 12px;flex:1}
.book a{font-size:13.5px;font-weight:600;text-decoration:none}
.note{margin-top:34px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 20px;font-size:15.5px}
.pager{display:flex;justify-content:space-between;gap:12px;margin:48px 0 10px;flex-wrap:wrap}
.pager a{text-decoration:none;font-weight:600;color:var(--navy)}
@media (max-width:640px){body{font-size:16px}header.top nav .links{display:none}section.blk{padding:54px 0}.hero{padding-top:46px;padding-bottom:56px}.hero h1 br{display:none}.hero h1{font-size:30px}.book80{padding:24px}}
`;

function head({ title, desc, path }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:site_name" content="송정헌 목사 · 페이스빌더 출판사">
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>`;
}

const nav = (home) => `
<header class="top"><div class="wrap"><nav>
  <a class="brand" href="${home}">송정헌 목사</a>
  <span class="links"><a href="${home}#why">왜 양육인가</a><a href="${home}#roadmap">로드맵</a><a href="${home}#pastors">목회자께</a><a href="${home}#about">소개</a><a href="${home}#support">후원</a><a href="${home}#contact">연락</a></span>
</nav></div>`;

const footer = `
<footer><div class="wrap">
  <div><b style="color:#fff">페이스빌더 출판사</b> (Faith Builder Press) · 대표 송정헌 목사</div>
  <div>후원 계좌 우리은행 1005-904-907581 (예금주: 페이스빌더) · 문의 <a href="mailto:faithbuilder.kr@gmail.com">faithbuilder.kr@gmail.com</a></div>
  <div> 모든 교재는 <a href="${PLAY_ALL}" target="_blank" rel="noopener">구글 플레이 북스</a>, 교보문고, YES24에서 전자책으로 만나실 수 있습니다.</div>
</div></footer>
</body></html>`;

// ---------------- 첫 페이지 ----------------
function index() {
  const home = './';
  const courseCards = courses.map((c) => {
    const chips = c.parts.flatMap((p) => p.series).map((s) => `<span class="chip">${esc(s.name.replace(/^[①-⑦]\s*/, ''))}</span>`).join('');
    return `<a class="course" href="roadmap/${c.id}/">
      <div class="num" style="background:${c.color}">${c.no}</div>
      <div><h3 style="color:${c.color}">${c.name}${c.sub ? ` <small>(${c.sub})</small>` : ''}<small>${c.count}권</small></h3>
      <p>${esc(c.lead.split('.')[0])}.</p>
      <div class="chips">${chips}</div>
      <div class="go" style="color:${c.color};margin-top:10px">과정 자세히 보기 →</div></div></a>`;
  }).join('\n');

  return head({
    title: '페이스빌더 양육 로드맵 | 송정헌 목사',
    desc: `한 사람을 그리스도의 증인으로 세우는 양육의 길 — 네 과정 · ${TOTAL.series}개 시리즈 · ${TOTAL.books}권. 페이스빌더 출판사 송정헌 목사.`,
    path: '/',
  }) + nav(home) + `
  <div class="wrap hero">
    <div class="who">송정헌 목사 · 페이스빌더 출판사</div>
    <div class="eyebrow">FAITH BUILDER DISCIPLESHIP ROADMAP</div>
    <h1>한 사람을 그리스도의 증인으로 <br>세우는 양육의 길</h1>
    <p class="sub">페이스빌더 양육 로드맵은 교재 목록이 아니라 길입니다. 네 과정 · ${TOTAL.series}개 시리즈 · ${TOTAL.books}권의 교재가 새가족에서 지도자까지 한 걸음씩 이어집니다.</p>
    <a class="btn gold" href="#roadmap">로드맵 보기</a>
    <a class="btn line" href="#vol80">『${VOL80}』 무료로 읽기</a>
  </div>
</header>

<section class="blk" id="why"><div class="wrap">
  <div class="eyebrow">WHY DISCIPLESHIP</div>
  <h2>교회는 왜 양육해야 하는가</h2>
  <p class="lead">양육이 왜 필요한지는 교회가 무엇인지에서 출발합니다. 교회가 세상에서 부름받은 하나님의 백성이기만 하다면, 교회의 가장 중요한 일은 예배와 교제일 것입니다. 그러나 예수님은 "아버지께서 나를 보내신 것 같이 나도 너희를 보내노라"고 말씀하셨습니다. 다시 말해, 교회는 세상으로 보냄받은 그리스도의 증인이기도 합니다. 그리고 증인이 되려면 먼저 그리스도의 제자로 훈련받아야 합니다. 그래서 교회에는 세 얼굴이 있습니다.</p>
  <div class="grid g3" style="margin-top:28px">
    <div class="card face"><div class="k">교회의 특권</div><h3>세상에서 부름받은<br>하나님의 백성</h3><p>하나님은 우리를 세상에서 불러내어 그분의 백성으로 삼으셨습니다.</p></div>
    <div class="card face f2"><div class="k">교회의 사명</div><h3>세상으로 보냄받은<br>그리스도의 증인</h3><p>증인은 입으로 전하는 사람일 뿐 아니라, 삶으로 그리스도를 보여 주는 사람입니다.</p></div>
    <div class="card face f3"><div class="k">교회의 일</div><h3>하나님의 백성을 그리스도의<br>제자로 훈련하는 공동체</h3><p>부름받은 백성이 보냄받은 증인이 되도록, 교회는 성도를 제자로 양육합니다.</p></div>
  </div>
  <p class="lead" style="margin-top:28px">그러므로 양육은 교회가 골라서 하는 프로그램이 아니라 교회의 본질입니다. 여기서 '양육'은 지식을 가르치는 데서 그치지 않고 삶의 변화를 지향하는 훈련까지 포함하는 말입니다.</p>
</div></section>

<section class="blk alt" id="roadmap"><div class="wrap">
  <div class="eyebrow">THE ROADMAP</div>
  <h2>페이스빌더 양육 로드맵 한눈에 보기</h2>
  <p class="lead">예수님은 제자들에게 "내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라"(마 28:20)고 명하셨습니다. 이 '분부한 모든 것'에는 적어도 세 영역이 있습니다. 그리고 그 세 영역을 네 과정으로 나누어 차례로 걷게 한 것이 페이스빌더 양육 로드맵입니다.</p>
  <div class="areas">
    <div class="area"><b>그리스도와의 만남</b><span>새가족 과정</span></div>
    <div class="area"><b>그리스도 안에서의 성장</b><span>기초 과정 · 중급 과정</span></div>
    <div class="area"><b>재생산 — 제자를 삼는 사람</b><span>고급 과정 (지도자 훈련)</span></div>
  </div>
  <div class="grid g2">${courseCards}</div>
  <p class="small" style="margin-top:18px">새가족 → 기초, 중급 → 고급은 단계입니다. 그러나 기초와 중급은 단계라기보다 깊이의 차이입니다. 기초 과정이 성장의 전체 그림을 먼저 보여 주고, 중급 과정이 그것을 더 깊고 구체적으로 공부하게 합니다.</p>

  <h3 style="font-size:22px;color:var(--navy);margin-top:44px">나는 지금 어디에 서 있나요?</h3>
  <div class="where">
    <a href="roadmap/newcomer/"><b>처음 교회에 왔어요</b><span>새가족 과정 · 『복음 앞에 서다』부터</span></a>
    <a href="roadmap/newcomer/"><b>다른 교회에서 옮겨 왔어요</b><span>새가족 과정 · 『복음 위에 서다』</span></a>
    <a href="roadmap/basic/"><b>새가족 과정을 마쳤어요</b><span>기초 과정 · 기초양육 시리즈부터</span></a>
    <a href="roadmap/intermediate/"><b>기초 과정을 마쳤어요</b><span>중급 과정 · 성경 시리즈부터</span></a>
    <a href="roadmap/advanced/"><b>리더로 섬기고 싶어요</b><span>고급 과정 · 로마서 8장 시리즈부터</span></a>
  </div>
</div></section>

<section class="blk" id="pastors"><div class="wrap">
  <div class="eyebrow">FOR PASTORS</div>
  <h2>로드맵을 교회에 어떻게 적용할 것인가</h2>
  <p class="lead">훈련은 프로그램이 아니라 삶 전체에서 일어나며, 우리를 훈련하시는 분은 성령님이십니다. 그래서 설교가 중요합니다. 그러나 설교만으로는 한 사람 한 사람의 삶을 다루기 어렵습니다. 이 한계를 넘으려면 소수가 함께 모여 양육받아야 합니다. 다시 말해, 교회는 삶에서 훈련이 일어나도록 최소한의 양육 시스템을 갖추어야 합니다. 그리고 그 시스템은 세 종류의 평신도 지도자가 움직입니다.</p>
  <div class="grid g3" style="margin-top:26px">
    <div class="card"><div class="k">사역리더</div><h3>부장</h3><p>부서와 사역을 이끄는 리더입니다. 직분(장로·집사·권사)과 구분하여 '부장장로', '부장집사'처럼 역할과 직분을 함께 부릅니다.</p></div>
    <div class="card"><div class="k">양육리더</div><h3>양육자</h3><p>일대일 또는 소수로 성도를 양육하는 평신도 양육자입니다. 고급 과정과 함께 별도의 양육자 훈련을 받습니다.</p></div>
    <div class="card"><div class="k">소그룹리더</div><h3>소그룹 인도자</h3><p>설교 나눔 소그룹과 양육 소그룹을 인도합니다. 소그룹 경험 기간과 견습 인도자 기간을 거쳐 세워집니다.</p></div>
  </div>
  <div class="tbl"><table>
    <tr><th>고급 과정 시리즈</th><th class="c">부장</th><th class="c">양육자</th><th class="c">소그룹 인도자</th></tr>
    <tr><td>로마서 8장 성령의 사람 시리즈</td><td class="c">●</td><td class="c">●</td><td class="c">●</td></tr>
    <tr><td>교회론 시리즈</td><td class="c">●</td><td class="c">●</td><td class="c">●</td></tr>
    <tr><td>귀납적 성경공부 시리즈</td><td class="c">—</td><td class="c">●</td><td class="c">●</td></tr>
    <tr><td>소그룹 시리즈</td><td class="c">—</td><td class="c">●</td><td class="c">●</td></tr>
    <tr><td>그 밖의 훈련</td><td class="c">—</td><td class="c">양육자 훈련</td><td class="c">소그룹 경험·견습</td></tr>
  </table></div>
  <p class="small" style="margin-top:14px">교회 규모와 상관없이 한 사람이 둘 이상의 역할을 맡을 수 있습니다. 이 적용 방안은 목회와 신학에서 내린 잠정적 결론으로, 동료·후배 목사님들께 드리는 제안입니다.</p>

  <div class="grid g2" style="margin-top:40px">
    <div class="card"><div class="k">WHY READING-TYPE</div><h3>왜 읽기형 교재인가</h3><p>문답식 교재는 양육자의 역량에 지나치게 의존하고, 일방적인 강의가 되기 쉬우며, 남는 것이 메모뿐이라 복습하기 어렵습니다. 페이스빌더 교재는 동반자가 먼저 읽고 묵상해 온 뒤, 양육자가 나눔 질문으로 인도하는 읽기형 교재입니다. 그래서 수평적인 대화가 살아나고, 웬만한 평신도 양육자도 인도할 수 있으며, 언제든 다시 펴서 복습할 수 있습니다.</p></div>
    <div class="card"><div class="k">ONE BOOK A WEEK</div><h3>한 주에 한 권</h3><p>페이스빌더 교재는 한 주에 한 권을 읽고 모여서 토론하도록 설계했습니다. 그래서 내용이 많은 주제도 단행본이 아니라 여러 권의 소책자로 나누었습니다.</p></div>
  </div>
</div></section>

<section class="blk alt" id="vol80"><div class="wrap">
  <div class="book80">
    <div>
      <div class="eyebrow">이 로드맵과 함께 읽는 책 · VOL.080</div>
      <h3 style="margin-top:10px">${VOL80}</h3>
      <p class="small" style="margin-top:4px">The Faith Builder Discipleship System</p>
      <p style="margin-top:14px">로드맵은 어느 과정에 어떤 책이 있는지를 보여 주는 지도입니다. 그러나 교회가 성도를 세우려면 지도와 함께 그 길을 걸어야 하는 이유도 알아야 합니다. 이 책은 바로 그 이유를 설명하기 위해 썼습니다.</p>
      <ol>
        <li><b>교회는 왜 양육해야 하는가?</b> — 교회론에서 그 이유를 찾습니다.</li>
        <li><b>무엇을, 어떤 순서로 양육할 것인가?</b> — 네 과정이 왜 그 자리에 있는지 설명합니다.</li>
        <li><b>로드맵을 교회에 어떻게 적용할 것인가?</b> — 최소한의 양육 시스템과 세 종류의 평신도 지도자를 제안합니다.</li>
      </ol>
      <p class="small" style="margin-top:12px">담임목사와 교역자, 성도를 세우는 일을 맡은 평신도 지도자를 위해 썼습니다. 구글 플레이 북스에서 무료로 읽으실 수 있습니다.</p>
      <a class="btn gold" style="margin-top:16px" href="${play(VOL80)}" target="_blank" rel="noopener">구글 플레이 북스에서 보기</a>
    </div>
  </div>
</div></section>

<section class="blk" id="about"><div class="wrap">
  <div class="eyebrow">ABOUT</div>
  <h2>송정헌 목사</h2>
  <p class="lead">대한예수교장로회(합동) 교단 소속 목사이자, 문서 선교 기관인 페이스빌더 출판사(Faith Builder Press) 대표입니다. 성도들이 미리 읽고 깊이 묵상한 뒤 함께 토론할 수 있도록, 풍부하고 정밀하게 구성된 '완성형 읽기 자료 교재'를 집필하는 일을 남은 인생의 사명으로 삼고 있습니다. 지금까지 ${TOTAL.books}권의 교재를 구글 플레이 북스, 교보문고, YES24에서 전자책으로 펴냈습니다.</p>
  <div class="grid g2" style="margin-top:26px">
    <div class="card creed">
      <h4 style="margin-top:0">교리적으로</h4><p>개혁주의가 성경의 진리를 가장 잘 표현하는 교리라고 믿습니다. 그에 따라 웨스트민스터 신앙고백과 대·소요리문답을 교리적 표준문서로 존중합니다.</p>
      <h4>목회적으로</h4><p>교회는 세상에서 부름받은 하나님의 백성이자 세상으로 보냄받은 그리스도의 증인이라고 믿습니다. 그에 따라 하나님의 백성을 그리스도의 제자로 훈련하여 세상 속의 증인으로 세우는 양육을 목회의 중심에 둡니다.</p>
      <h4>설교자로서</h4><p>성경이 성도를 교훈하고 책망하며 바르게 교정함으로 하나님이 원하시는 의의 기준에 따라 살도록 만든다고 믿습니다. 그에 따라 성경 안에 담긴 하나님의 뜻을 순전하게 풀어 전하는 설교를 하고 있습니다.</p>
    </div>
    <div class="card">
      <h3>경력</h3>
      <ul class="tl">
        <li>현 페이스빌더 출판사 대표 · 청목원(목회자 재교육 기관) 강사 <span class="y">현재</span></li>
        <li>전주북문교회 담임목사 <span class="y">2016–2024</span></li>
        <li>밴쿠버 그레이스한인교회 선임부목사 (영성·양육) <span class="y">2010–2016</span></li>
        <li>태안사랑의교회 개척 <span class="y">2005–2010</span></li>
        <li>국제제자훈련원 컨설팅 담당 목사 · CAL 세미나 강사 <span class="y">2002–2005</span></li>
        <li>사랑의교회 사랑부 담당 목사 <span class="y">1999–2001</span></li>
      </ul>
      <h3 style="margin-top:22px">학력</h3>
      <ul class="tl">
        <li>총신대학교 신학대학원 (M.Div.) <span class="y">1996</span></li>
        <li>서울대학교 대학원 사회복지학과 수료 <span class="y">1993</span></li>
        <li>서울대학교 사회복지학과 졸업 <span class="y">1991</span></li>
      </ul>
      <p class="small" style="margin-top:12px"><a href="https://b2bministry.org" target="_blank" rel="noopener">청목원 홈페이지 →</a></p>
    </div>
  </div>
  <div class="card" style="margin-top:18px">
    <div class="k">FAITH BUILDER PRESS</div><h3>페이스빌더 출판사의 세 가지 비전</h3>
    <div class="grid g3" style="margin-top:10px">
      <div><b>Faith Builder</b><p>성도 개인이 스스로 말씀을 묵상하고 연구하여 흔들리지 않는 믿음의 집을 세우도록 돕습니다.</p></div>
      <div><b>Pace Builder</b><p>교역자와 평신도 리더가 체계적으로 성도를 양육하도록 검증된 '완성형 교재'로 동역합니다.</p></div>
      <div><b>Kingdom Builder</b><p>교재를 세계 각국의 언어로 번역해 선교지의 현지인 리더 양육을 돕습니다.</p></div>
    </div>
  </div>
</div></section>

<section class="blk alt" id="sermons"><div class="wrap">
  <div class="eyebrow">SERMONS</div>
  <h2>설교</h2>
  <div class="ser">
    <a href="https://www.youtube.com/watch?v=NX4t3tH9iuo" target="_blank" rel="noopener"><small>마태복음 16:16-19</small><b>마태복음에서 팔복을 해석하다</b></a>
    <a href="https://www.youtube.com/watch?v=fviRtssOEtY" target="_blank" rel="noopener"><small>레위기 11:45</small><b>레위기에서 거룩을 배우다</b></a>
    <a href="https://www.youtube.com/watch?v=9CMIhR2zsW8" target="_blank" rel="noopener"><small>창세기 22:2 · 에베소서 6:4 · 마태복음 7:11</small><b>부모가 되어가는 중입니다</b></a>
  </div>
  <a class="btn navy" style="margin-top:22px" href="https://youtube.com/@pastor.song-f3h" target="_blank" rel="noopener">유튜브에서 설교 더 보기</a>
</div></section>

<section class="blk" id="support"><div class="wrap">
  <div class="eyebrow">SUPPORT</div>
  <h2>문서 선교에 함께해 주세요</h2>
  <p class="lead">바른 신학에 기초한 신앙 서적이 널리 보급되도록, 문서 선교 사역에 함께해 주실 분들의 후원을 받습니다. 후원금은 집필·연구와 전자책 제작, 그리고 <b>선교지 언어 번역과 무상 보급</b>, 앞으로의 종이책 발간에 투명하게 사용됩니다.</p>
  <div class="card" style="margin-top:24px;border:2px solid var(--gold)">
    <div class="k">후원 계좌</div>
    <h3 style="font-size:24px;margin-top:6px">우리은행 1005-904-907581</h3>
    <p style="font-size:17px">예금주: 페이스빌더</p>
    <p style="margin-top:12px">입금하실 때 메모란에 <b>성함+후원</b> 또는 <b>성함+출판</b>을 적어 주십시오. (예: 홍길동후원)</p>
    <button class="btn navy" style="border:0;cursor:pointer;margin-top:16px;font-family:inherit" onclick="var b=this;navigator.clipboard&&navigator.clipboard.writeText('우리은행 1005-904-907581 페이스빌더').then(function(){b.textContent='계좌번호가 복사되었습니다'},function(){})">계좌번호 복사하기</button>
  </div>
  <p class="lead" style="margin-top:22px"><b>관심과 기도, 그리고 일독과 전파를 부탁드립니다. 감사합니다.</b></p>
</div></section>

<section class="blk alt" id="contact"><div class="wrap">
  <div class="eyebrow">CONTACT</div>
  <h2>교재 구입과 문의</h2>
  <div class="grid g2">
    <div class="card"><h3>교재 찾는 법</h3><p>페이스빌더 교재는 지금 전자책으로 출간되어 있습니다.</p>
      <ol style="margin:10px 0 0;padding-left:22px;font-size:16px"><li>Play 스토어 또는 구글 플레이 북스를 엽니다.</li><li>검색창에 <b>송정헌</b>을 입력합니다.</li><li>도서 탭에서 모든 책을 확인합니다.</li></ol>
      <p class="small" style="margin-top:10px">교보문고·YES24에서도 만나실 수 있습니다.</p>
      <a class="btn navy" style="margin-top:14px" href="${PLAY_ALL}" target="_blank" rel="noopener">구글 플레이 북스에서 전체 보기</a></div>
    <div class="card"><h3>교회 교재 사용 · 문의</h3><p>교회에서 교재로 사용하시거나 후원과 출판에 관해 문의하시려면 이메일로 연락해 주십시오.</p>
      <p style="margin-top:12px;font-size:18px"><a href="mailto:faithbuilder.kr@gmail.com"><b>faithbuilder.kr@gmail.com</b></a></p>
      <p style="margin-top:4px;font-size:16px"><a href="mailto:sjhdavid@naver.com">sjhdavid@naver.com</a></p></div>
  </div>
</div></section>
` + footer;
}

// ---------------- 과정 페이지 ----------------
function coursePage(c, i) {
  const home = '../../';
  const parts = c.parts.map((p) => {
    const series = p.series.map((s) => `
      <div class="series"><h3 style="color:${c.color}">${esc(s.name)}</h3>
      <div class="meta">${s.tag ? esc(s.tag) + ' · ' : ''}${s.range} · ${s.books.length}권</div>
      <div class="books">${s.books.map(([v, t, d]) => `
        <div class="book"><div class="v" style="color:${c.color}">VOL.${v}</div><h4>『${esc(t)}』</h4><p>${esc(d)}</p>
        <a href="${play(t)}" target="_blank" rel="noopener" style="color:${c.color}">구글 플레이 북스 →</a></div>`).join('')}
      </div></div>`).join('');
    return `<div class="part">${p.name ? `<h2>${esc(p.name)}</h2>` : ''}${p.intro ? `<div class="intro">${esc(p.intro)}</div>` : ''}${series}</div>`;
  }).join('');
  const prev = courses[i - 1], next = courses[i + 1];
  return head({
    title: `${c.no}. ${c.name} | 페이스빌더 양육 로드맵`,
    desc: `${c.name}${c.sub ? `(${c.sub})` : ''} ${c.count}권 — ${c.lead.split('.')[0]}.`,
    path: `/roadmap/${c.id}/`,
  }) + nav(home) + `
  <div class="chead" style="background:${c.color}"><div class="wrap">
    <a class="crumb" href="${home}#roadmap">← 로드맵 전체 보기</a>
    <div class="eyebrow" style="color:#f0dfb8;margin-top:18px">STAGE ${c.no} · ${esc(c.area)}</div>
    <h1>${c.name}${c.sub ? ` <span style="font-size:.6em">(${c.sub})</span>` : ''}</h1>
    <p>${esc(c.lead)}</p>
    <p style="margin-top:10px;opacity:.85">${c.parts.flatMap((p) => p.series).length}개 시리즈 · ${c.count}권</p>
  </div></div>
</header>
<main class="wrap">
  ${parts}
  ${c.note ? `<div class="note">${esc(c.note)}</div>` : ''}
  <div class="pager">
    ${prev ? `<a href="../${prev.id}/">← ${prev.no}. ${prev.name}</a>` : '<span></span>'}
    ${next ? `<a href="../${next.id}/">${next.no}. ${next.name} →</a>` : `<a href="${home}#vol80">『${VOL80}』 →</a>`}
  </div>
</main>
<div style="height:40px"></div>
` + footer;
}

function write(rel, html) {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  if (preview) html = html.replace(/href="(roadmap\/\w+\/|\.\.\/\w+\/|\.\.\/\.\.\/|\.\/)(#[\w-]+)?"/g, (m, a, h) => `href="${a === './' ? '' : a}index.html${h || ''}"`);
  writeFileSync(f, html);
  console.log('wrote', f);
}
const preview = process.argv[3] === 'preview';
write('index.html', index());
courses.forEach((c, i) => write(preview ? `roadmap/${c.id}/index.html` : `roadmap/${c.id}.html`, coursePage(c, i)));
