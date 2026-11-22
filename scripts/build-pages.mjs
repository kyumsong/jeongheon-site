// 사용법: node scripts/build-pages.mjs
//   → src/pages/index.html, src/pages/vol080.html, src/pages/roadmap/*.html 생성
// 책 정보와 목차는 scripts/roadmap-data.mjs 에서 고칩니다.
// 홈페이지의 뼈대는 VOL.080 『페이스빌더 양육 시스템 소개』의 세 질문(왜·무엇을·어떻게)을 따릅니다.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { courses, TOTAL, toc } from './roadmap-data.mjs';

const OUT = process.argv[2] || 'src/pages';
const PREVIEW = process.argv[3] === 'preview';
const SITE = 'https://www.송정헌목사.한국';
const PLAY_ALL = 'https://play.google.com/store/search?q=' + encodeURIComponent('송정헌') + '&c=books';
const play = (title) => 'https://play.google.com/store/search?q=' + encodeURIComponent('송정헌 ' + title) + '&c=books';
const VOL80 = '페이스빌더 양육 시스템 소개';
const VOL80_SUB = '왜, 무엇을, 어떻게 양육해야 하는가';
const PLAY80 = play(VOL80); // 책 주소가 정해지면 이 줄을 구글 플레이 북스 책 주소로 바꾸세요.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const vol = (v) => courses.flatMap((c) => c.parts.flatMap((p) => p.series.flatMap((s) => s.books.map((b) => ({ c, s, v: b[0], t: b[1] }))))).find((b) => b.v === v);

const CSS = `
:root{--navy:#2c4568;--navy-d:#1c2c47;--cream:#f6f2ea;--paper:#fffdf8;--gold:#c9a96e;--gold-l:#f0dfb8;--red:#c0392b;--ink:#2a2a2a;--mute:#6b6760;--line:#e4dccb;
--enc:#1f6b57;--grw:#4e4479;--rep:#9a4a2b}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--cream);color:var(--ink);font-family:'Noto Sans KR',system-ui,sans-serif;font-size:17px;line-height:1.8;word-break:keep-all}
h1,h2,h3,h4{font-family:'Noto Serif KR',serif;line-height:1.35;margin:0}
a{color:inherit}
.wrap{max-width:1080px;margin:0 auto;padding:0 22px}
.eyebrow{font-size:13px;letter-spacing:.2em;color:var(--gold);font-weight:600}
.nw{white-space:nowrap}
/* 머리글 */
header.top{background:var(--navy-d);color:#fff;position:sticky;top:0;z-index:20;box-shadow:0 1px 0 rgba(255,255,255,.06)}
header.top nav{display:flex;justify-content:space-between;align-items:center;height:58px;font-size:15px}
header.top nav a{text-decoration:none;opacity:.85;margin-left:18px}
header.top nav a:hover{opacity:1}
header.top nav a.q{font-family:'Noto Serif KR',serif;font-weight:700;color:var(--gold-l);opacity:1}
header.top .brand{font-weight:700;opacity:1;margin:0;letter-spacing:.02em}
/* 첫 화면 */
.hero{background:linear-gradient(180deg,var(--navy) 0%,#243a5a 100%);color:#fff}
.hero .in{display:grid;grid-template-columns:minmax(200px,330px) 1fr;gap:56px;align-items:center;padding:64px 0 70px}
.cover{position:relative}
.cover img{width:100%;height:auto;display:block;border:1px solid rgba(201,169,110,.6);box-shadow:0 24px 50px rgba(0,0,0,.35)}
.badge{position:absolute;top:-18px;left:-18px;width:82px;height:82px;border-radius:50%;background:var(--red);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;box-shadow:0 6px 16px rgba(0,0,0,.3);transform:rotate(-10deg)}
.badge b{font-size:22px;line-height:1}.badge small{font-size:11px;letter-spacing:.15em;margin-top:3px}
.hero .who{font-size:14.5px;color:#d9cfb9;margin-bottom:14px}
.hero h1{font-size:clamp(34px,5.4vw,56px);font-weight:700;margin:10px 0 10px}
.hero .sub{font-family:'Noto Serif KR',serif;font-size:clamp(19px,2.4vw,24px);color:var(--gold-l);margin:0 0 20px}
.hero p.lead{color:#e7e2d6;max-width:600px;margin:0 0 26px;font-size:17.5px}
.btn{display:inline-block;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px;margin:0 8px 10px 0;border:0;cursor:pointer;font-family:inherit}
.btn.red{background:var(--red);color:#fff}.btn.gold{background:var(--gold);color:#1e2a3c}
.btn.line{border:1.5px solid rgba(255,255,255,.6);color:#fff}
.btn.navy{background:var(--navy);color:#fff}
.btn.ghost{border:1.5px solid var(--navy);color:var(--navy);background:transparent}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:34px}
.three a{display:block;text-decoration:none;border-radius:12px;padding:14px 16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16)}
.three a b{display:block;font-family:'Noto Serif KR',serif;font-size:18px}
.three a span{font-size:14px;color:#d9cfb9}
.three a.e b{color:#9fe0c9}.three a.g b{color:#cfc6ff}.three a.r b{color:#ffc3ab}
/* 세 문 */
.doors{background:var(--paper);border-bottom:1px solid var(--line)}
.doors .in{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:28px 0}
.door{display:flex;gap:14px;align-items:flex-start;text-decoration:none;padding:16px;border-radius:12px;border:1px solid var(--line);background:#fff;transition:transform .15s,box-shadow .15s}
.door:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(44,69,104,.12)}
.door .ic{flex:0 0 44px;height:44px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif KR',serif;font-weight:700}
.door b{display:block;color:var(--navy);font-size:16.5px}
.door span{font-size:14.5px;color:var(--mute);line-height:1.6;display:block;margin-top:2px}
/* 부(部) 머리 */
.parthead{background:var(--navy);color:#fff;padding:54px 0 46px}
.parthead .q{font-family:'Noto Serif KR',serif;font-size:clamp(52px,9vw,92px);font-weight:700;line-height:1;color:var(--gold-l)}
.parthead h2{font-size:clamp(26px,4vw,36px);margin:14px 0 6px}
.parthead p{color:#e2dccd;max-width:760px;margin:6px 0 0}
.parthead .ch{display:inline-block;margin-top:14px;font-size:13.5px;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:3px 12px;color:#e7e2d6}
section.blk{padding:64px 0;border-bottom:1px solid var(--line)}
section.blk.alt{background:var(--paper)}
.blk h3.t{font-size:clamp(23px,3.4vw,30px);color:var(--navy);margin:6px 0 14px}
.lead{font-size:18px;color:#3b3a37;max-width:780px}
.grid{display:grid;gap:18px}
.g3{grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr))}
.g2{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.card{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:24px}
.alt .card{background:var(--cream)}
.card h4{font-size:20px;color:var(--navy);margin-bottom:8px}
.card .k{font-size:13px;color:var(--gold);font-weight:700;letter-spacing:.06em}
.card p{margin:6px 0 0;color:#46443f;font-size:16px}
.face{border-top:4px solid var(--navy)}.face.f2{border-top-color:var(--gold)}.face.f3{border-top-color:#7a2e35}
.bridge{margin:30px 0 0;padding:18px 22px;border-left:4px solid var(--gold);background:#fff;border-radius:0 12px 12px 0;font-size:17px;color:#3b3a37;max-width:860px}
.steps{list-style:none;margin:24px 0 0;padding:0;counter-reset:s;display:grid;gap:10px;max-width:820px}
.steps li{counter-increment:s;position:relative;padding:12px 16px 12px 54px;background:var(--paper);border:1px solid var(--line);border-radius:10px;font-size:16.5px}
.alt .steps li{background:var(--cream)}
.steps li::before{content:counter(s);position:absolute;left:14px;top:12px;width:28px;height:28px;border-radius:50%;background:var(--navy);color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
/* 세 영역 */
.areas{display:grid;grid-template-columns:1fr 2fr 1fr;gap:12px;margin:26px 0 6px}
.area{border-radius:12px;padding:16px 18px;color:#fff}
.area b{display:block;font-family:'Noto Serif KR',serif;font-size:19px}
.area span{font-size:14.5px;opacity:.9}
.area.e{background:var(--enc)}.area.g{background:var(--grw)}.area.r{background:var(--rep)}
.area small{display:block;font-size:13px;opacity:.85;margin-top:4px}
/* 성장 청사진 */
.bp-wrap{display:grid;grid-template-columns:1fr 340px;gap:24px;margin-top:28px;align-items:start}
.bp{display:grid;grid-template-columns:150px 1fr 150px;grid-template-rows:repeat(7,auto);gap:10px 12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px}
.bp button{font-family:inherit;text-align:center;cursor:pointer;border-radius:12px;padding:10px 12px;border:2px solid;transition:transform .12s,box-shadow .12s;line-height:1.45}
.bp button:hover,.bp button.on{transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.12)}
.bp button.on{outline:3px solid var(--gold);outline-offset:2px}
.bp b{display:block;font-family:'Noto Serif KR',serif;font-size:17px}
.bp span{display:block;font-size:13px}
.n-g{grid-column:1/4;grid-row:1;background:#f1efe8;border-color:#888780;color:#2c2c2a}
.n-p{background:#eeedfe;border-color:#534ab7;color:#3c3489}
.n-c{background:#faece7;border-color:#993c1d;color:#712b13}
.n-t{background:#e1f5ee;border-color:#0f6e56;color:#0c4a3a;display:flex;flex-direction:column;justify-content:center}
.b-faith{grid-column:2;grid-row:2}.b-union{grid-column:2;grid-row:3}.b-walk{grid-column:2;grid-row:4}.b-image{grid-column:2;grid-row:5}
.b-mis{grid-column:2;grid-row:6;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.b-end{grid-column:1/4;grid-row:7}
.b-xn{grid-column:1;grid-row:2/4}.b-dis{grid-column:1;grid-row:4/6}.b-wit{grid-column:1;grid-row:6}
.b-new{grid-column:3;grid-row:3}
.bp .bp-note{grid-column:1/4;grid-row:8;font-size:12.5px;color:var(--mute);text-align:center}
.bp-panel{position:sticky;top:80px;background:var(--navy);color:#fff;border-radius:16px;padding:24px;min-height:260px}
.bp-panel .k{font-size:12.5px;letter-spacing:.14em;color:var(--gold)}
.bp-panel h4{font-size:24px;margin:6px 0 10px;color:#fff}
.bp-panel p{margin:0 0 10px;color:#e7e2d6;font-size:15.5px}
.bp-panel .v{font-size:14px;color:var(--gold-l)}
.bp-panel a{color:var(--gold-l);font-weight:600;font-size:14.5px}
/* 로드맵 */
.course{display:flex;gap:18px;align-items:flex-start;text-decoration:none;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;transition:transform .15s,box-shadow .15s}
.course:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(44,69,104,.12)}
.num{flex:0 0 52px;height:52px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif KR',serif;font-size:24px;font-weight:700}
.course h4{font-size:22px}
.course h4 small{white-space:nowrap;font-size:14px;color:var(--mute);font-family:'Noto Sans KR';font-weight:400;margin-left:6px}
.course p{margin:6px 0 8px;font-size:15.5px;color:#4a4843}
.course .go{font-size:14px;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.chip{font-size:13px;border:1px solid var(--line);border-radius:6px;padding:2px 9px;background:#fff;color:#444}
.where{display:grid;gap:12px;grid-template-columns:repeat(5,1fr);margin-top:18px}
.where a{display:block;text-decoration:none;background:var(--navy);color:#fff;border-radius:12px;padding:16px 18px}
.where a b{display:block;font-size:16.5px}.where a span{font-size:14px;color:#d9cfb9}
/* 지도자 과정 */
.flow{display:grid;gap:14px;margin-top:22px}
.flow .row{display:grid;grid-template-columns:170px 1fr;gap:14px;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.alt .flow .row{background:var(--cream)}
.flow .who b{display:block;font-family:'Noto Serif KR',serif;color:var(--navy);font-size:18px}
.flow .who span{font-size:13.5px;color:var(--mute)}
.flow ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.flow li{font-size:14px;padding:5px 11px;border-radius:8px;background:#fff;border:1px solid var(--line)}
.flow li.x{background:#fbf3e2;border-color:#e8d3a6}
.flow li+li::before{content:'→';margin:0 6px 0 -2px;color:var(--gold);font-weight:700}
.principles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px;margin-top:22px}
.principles div{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px}
.principles b{display:block;font-family:'Noto Serif KR',serif;color:var(--navy);font-size:17px}
.principles span{font-size:14.5px;color:#55524b}
/* 결론 */
.close{background:var(--navy-d);color:#fff;padding:70px 0;text-align:center}
.close h3{font-size:clamp(24px,4vw,34px);color:#fff;margin:10px 0 14px}
.close p{max-width:720px;margin:0 auto 10px;color:#e2dccd}
.loop{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:24px 0 30px}
.loop span{border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:6px 14px;font-size:15px}
.loop i{font-style:normal;color:var(--gold)}
/* 소개·후원·연락 */
.tl{list-style:none;margin:0;padding:0}
.tl li{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px dashed var(--line);font-size:16px}
.tl li span.y{color:var(--mute);white-space:nowrap;font-size:14.5px}
.creed p{margin:4px 0 0;font-size:16px;color:#46443f}
.creed h4{font-size:18px;color:var(--navy);margin-top:18px}
.ser a{display:block;text-decoration:none;padding:14px 0;border-bottom:1px solid var(--line)}
.ser a small{color:var(--gold);font-weight:600;font-size:13.5px}
.ser a b{display:block;font-family:'Noto Serif KR',serif;font-size:18px;color:var(--navy)}
.small{font-size:14.5px;color:var(--mute)}
footer{background:var(--navy-d);color:#cfc7b5;padding:36px 0;font-size:14.5px}
footer a{color:#fff}
/* 과정 페이지 */
.chead{color:#fff;padding:50px 0 56px}
.chead h1{font-size:clamp(30px,5vw,44px);margin:10px 0 14px}
.chead p{max-width:780px;color:#efe9dc;margin:0}
.crumb{font-size:14px;opacity:.85;text-decoration:none}
.part{margin-top:46px}
.part>h2{font-size:24px;color:var(--navy);border-bottom:2px solid var(--gold);padding-bottom:8px;margin-bottom:14px}
.part .intro{background:var(--paper);border-left:4px solid var(--gold);padding:14px 18px;border-radius:0 10px 10px 0;font-size:16px;color:#46443f}
.series{margin-top:30px}
.series h3{font-size:21px}
.series .meta{font-size:14px;color:var(--mute);margin:2px 0 12px}
.books{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));align-items:start}
.book{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:18px}
.book .v{font-size:12.5px;font-weight:700;letter-spacing:.08em}
.book h4{font-size:18px;margin:4px 0 6px;color:var(--ink)}
.book p{font-size:14.5px;color:#55524b;margin:0 0 10px}
.book details{border-top:1px dashed var(--line);padding-top:8px;margin-top:4px}
.book summary{cursor:pointer;font-size:13.5px;font-weight:600;color:var(--navy);list-style:none}
.book summary::-webkit-details-marker{display:none}
.book summary::before{content:'＋ ';}
.book details[open] summary::before{content:'－ ';}
.book ol{list-style:none;margin:8px 0 4px;padding:0;font-size:13.8px;color:#46443f;line-height:1.6}
.book ol li{padding:3px 0;border-bottom:1px dotted #ece5d6}
.book .buy{display:inline-block;margin-top:10px;font-size:13.5px;font-weight:600;text-decoration:none}
.note{margin-top:34px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 20px;font-size:15.5px}
.pager{display:flex;justify-content:space-between;gap:12px;margin:48px 0 10px;flex-wrap:wrap}
.pager a{text-decoration:none;font-weight:600;color:var(--navy)}
/* 책 소개 페이지 */
.toc{columns:2;column-gap:36px;margin-top:18px}
.toc .pt{break-inside:avoid;margin-bottom:18px}
.toc .pt>b{display:block;font-family:'Noto Serif KR',serif;color:var(--navy);font-size:17.5px;border-bottom:2px solid var(--gold);padding-bottom:4px;margin-bottom:6px}
.toc details{padding:6px 0;border-bottom:1px dotted var(--line)}
.toc summary{cursor:pointer;font-size:15.5px;list-style:none}
.toc summary::-webkit-details-marker{display:none}
.toc summary i{font-style:normal;color:var(--gold);font-weight:700;margin-right:6px}
.toc ul{margin:6px 0 4px;padding-left:22px;font-size:14px;color:#55524b;line-height:1.65}


/* 목록(허브)·경로 */
.crumbbar{background:#fff;border-bottom:1px solid var(--line);font-size:14px;color:var(--mute)}
.crumbbar .wrap{padding-top:10px;padding-bottom:10px}
.crumbbar a{color:var(--navy);text-decoration:none}.crumbbar i{font-style:normal;margin:0 6px;color:var(--gold)}
.crumbbar span{color:var(--ink);font-weight:600}
.hub{display:grid;gap:14px;max-width:820px}
.hubcard{display:grid;grid-template-columns:96px 1fr 28px;align-items:center;gap:16px;text-decoration:none;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:22px 24px;transition:transform .15s,box-shadow .15s}
.hubcard:hover{transform:translateX(4px);box-shadow:0 8px 22px rgba(44,69,104,.12)}
.hubcard .n{font-size:14px;font-weight:700;color:var(--gold);letter-spacing:.04em}
.hubcard b{display:block;font-family:'Noto Serif KR',serif;font-size:22px;color:var(--navy)}
.hubcard .tx>span{display:block;font-size:15.5px;color:#55524b;margin-top:2px}
.hubcard i{font-style:normal;color:var(--gold);font-size:22px}
@media (max-width:640px){.hubcard{grid-template-columns:1fr 20px;padding:18px}.hubcard .n{grid-column:1/3}}
/* 인트로 */
.intro{min-height:100vh;background:radial-gradient(1200px 600px at 70% 20%,#34507a 0%,var(--navy) 45%,var(--navy-d) 100%);color:#fff;display:flex;align-items:center;padding:40px 0}
.intro .who{font-size:14.5px;color:#d9cfb9;letter-spacing:.04em;margin-bottom:28px}
.intro .in{display:grid;grid-template-columns:minmax(180px,280px) 1fr;gap:60px;align-items:center}
.intro h1{font-size:clamp(34px,5.2vw,56px);margin:10px 0 8px}
.intro .sub{font-family:'Noto Serif KR',serif;font-size:clamp(19px,2.4vw,25px);color:var(--gold-l);margin:0 0 30px}
.qs{display:grid;gap:12px;max-width:560px}
.qs a{display:grid;grid-template-columns:96px 1fr 24px;align-items:center;gap:14px;text-decoration:none;padding:16px 20px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);transition:background .15s,transform .15s}
.qs a:hover{background:rgba(255,255,255,.14);transform:translateX(4px)}
.qs b{font-family:'Noto Serif KR',serif;font-size:28px;color:var(--gold-l)}
.qs span{font-size:16.5px;color:#eee8da}
.qs i{font-style:normal;color:var(--gold);font-size:20px}
.mini{margin-top:26px;display:flex;flex-wrap:wrap;gap:8px 20px;font-size:14.5px}
.mini a{color:#d9cfb9;text-decoration:none;border-bottom:1px solid rgba(217,207,185,.4)}
.mini a:first-child{color:#fff;font-weight:600;border-bottom-color:var(--red)}
@media (max-width:860px){.intro .badge{width:58px;height:58px;top:-10px;left:-10px}.intro .badge b{font-size:16px}.intro .badge small{font-size:9px}.intro{align-items:flex-start}.intro .in{grid-template-columns:1fr;gap:26px}.intro .cover{max-width:150px;order:0;margin:0}.qs a{grid-template-columns:72px 1fr 18px;padding:14px 16px}.qs b{font-size:22px}.qs span{font-size:15px}}
@media (max-width:860px){
 .hero .in{grid-template-columns:1fr;gap:30px;padding:40px 0 50px}
 .cover{max-width:170px;margin:6px auto 0;order:2}
 .hero .in>div:last-child{order:1}
 .three,.doors .in{grid-template-columns:1fr}
 .areas{grid-template-columns:1fr}
 .bp-wrap{grid-template-columns:1fr}
 .bp-panel{position:static}
 .bp{grid-template-columns:1fr 1fr;padding:14px}
 .n-g,.b-end,.bp .bp-note{grid-column:1/3}
 .b-faith{grid-column:1/3;grid-row:2}.b-union{grid-column:1/3;grid-row:3}.b-new{grid-column:1/3;grid-row:4}.b-xn{grid-column:1/3;grid-row:5}
 .b-walk{grid-column:1/3;grid-row:6}.b-image{grid-column:1/3;grid-row:7}.b-dis{grid-column:1/3;grid-row:8}
 .b-mis{grid-column:1/3;grid-row:9}.b-wit{grid-column:1/3;grid-row:10}
 .b-end{grid-row:11}.bp .bp-note{grid-row:12}
 .bp .n-t{border-style:dashed}
 .flow .row{grid-template-columns:1fr}
 .where{grid-template-columns:1fr 1fr}
 .toc{columns:1}
}
@media (max-width:640px){body{font-size:16px}header.top nav .links a:not(.q){display:none}header.top nav a{margin-left:12px}section.blk{padding:50px 0}.hero h1 br{display:none}}
`;

function head({ title, desc, path, image = '/og-vol080.jpg' }) {
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
<meta property="og:image" content="${SITE}${image}">
<meta property="og:site_name" content="송정헌 목사 · 페이스빌더 출판사">
<meta name="twitter:card" content="summary_large_image">
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
  <span class="links"><a class="q" href="${home}why/">왜</a><a class="q" href="${home}what/">무엇을</a><a class="q" href="${home}how/">어떻게</a><a href="${home}vol080/">새 책</a><a href="${home}about/">소개</a><a href="${home}about/support/">후원</a></span>
</nav></div></header>`;

const footer = `
<footer><div class="wrap">
  <div><b style="color:#fff">페이스빌더 출판사</b> (Faith Builder Press) · 대표 송정헌 목사</div>
  <div>후원 계좌 우리은행 1005-904-907581 (예금주: 페이스빌더) · 문의 <a href="mailto:faithbuilder.kr@gmail.com">faithbuilder.kr@gmail.com</a></div>
  <div>모든 교재는 <a href="${PLAY_ALL}" target="_blank" rel="noopener">구글 플레이 북스</a>, 교보문고, YES24에서 전자책으로 만나실 수 있습니다.</div>
</div></footer>`;

const bookLink = (v, rel) => { const b = vol(v); return `<a href="${rel}roadmap/${b.c.id}/#v${v}">VOL.${v} 『${esc(b.t)}』</a>`; };

// ---------- 성장 청사진 ----------
function blueprint(rel) {
  const N = {
    grace: ['바탕', '은혜', '모든 것의 바탕은 은혜입니다. 우리가 먼저 하나님을 찾은 것이 아닙니다. 하나님이 먼저 우리를 부르시고, 끝까지 이끄십니다. 그래서 청사진의 맨 위에 은혜를 두었습니다. 아래의 모든 단계는 은혜 위에 세워집니다.', '', ''],
    faith: ['통로', '믿음', '그 은혜를 받아들이는 통로가 믿음입니다. 믿음은 구원의 원인이 아니라 통로입니다. 그리고 믿음은 그리스도를 내 안에 영접하는 것이면서, 내가 그리스도 안으로 들어가는 것입니다. 이것을 상호내주라고 합니다. 다시 말해 믿음으로 일어나는 일의 본질은 성령으로 그리스도와 연합하는 것입니다.', '엡 2:8', ['027']],
    union: ['첫째', '그리스도와의 연합', '포도나무에 가지가 붙어 있듯이, 우리는 그리스도 안에 있고 그리스도는 우리 안에 계십니다. 그리스도의 죽음과 부활이 나의 죽음과 부활이 되므로 의롭다 하심을 받습니다(칭의). 그런데 칭의는 끝이 아니라 성화의 시작입니다. 또 연합한 사람은 그리스도의 주권 아래로 옮겨집니다. 이것을 소속으로서의 로드십이라고 부를 수 있습니다.', '요 15:5 · 골 1:13', ['027']],
    walk: ['둘째', '그리스도와의 동행', '성령께서 내 안에 계시는 것이 곧 연합이므로, 연합한 그 순간부터 동행이 시작됩니다. 동행은 그리스도께서 성령으로 날마다 나를 다스리시고, 내가 그분을 삶의 주인으로 인정하는 삶입니다. 이것을 다스림을 받는 삶으로서의 로드십이라고 부를 수 있고, 이 주권 인정이 성화의 뿌리입니다. 그래서 경건의 시간과 교제와 전도로 하나님과 지체들과 이웃과 친밀한 관계를 맺게 됩니다.', '', ['028']],
    image: ['셋째', '그리스도의 형상', '주인으로 모신 분의 다스림을 받는 사람은 그분을 닮아 갑니다. 하나님을 알아 가고, 시험을 이기고, 순종하고, 섬기는 삶입니다. 이것이 성화의 열매입니다. 그런데 신분은 연합으로 이미 주어졌고, 열매는 그 신분 위에서 평생 자라 갑니다. 다시 말해 연합은 신분의 문제이고, 형상은 수준의 문제입니다.', '고후 3:18', ['029']],
    real: ['사명 ①', '하나님 나라의 실현', '내가 속한 교회와 가정과 일터와 학교와 사회에 하나님의 뜻이 이루어지는 것입니다. 그렇게 해서 하나님 나라가 어떤 나라인지를 세상에 보여 줍니다. 실현은 주로 삶으로 이루어집니다. 그리고 실현된 삶이 확장의 문을 엽니다.', '마 6:10 · 마 5:16', ''],
    expand: ['사명 ②', '하나님 나라의 확장', '아직 하나님 나라 밖에 있는 이웃을 하나님 나라로 초대해, 그가 새로운 하나님의 백성이 되는 것입니다. 실현이 내가 속한 자리를 향한다면, 확장은 아직 하나님 나라 밖에 있는 사람을 향합니다. 그리고 확장은 삶과 복음의 말로 이루어집니다.', '마 28:19', ''],
    end: ['목적지', '하나님 나라의 완성을 향하여', '이 모든 여정은 한 목적지를 향해 갑니다. 우리가 그리스도의 장성한 분량이 충만한 데까지 이르는 날, 곧 하나님 나라가 완성되는 날입니다. 그날까지 우리는 완성된 사람이 아니라 지어져 가는 사람입니다. 그리고 사명의 현장에서 한계와 죄성을 다시 마주할 때마다, 우리는 그리스도의 다스림 앞으로 다시 돌아갑니다.', '엡 4:13', ''],
    xn: ['정체성', '그리스도인', '그리스도와 연합한 사람이 그리스도인입니다. 이름 그대로 그리스도께 속한 사람입니다. 다시 말해 그리스도인은 세상에서 부름받아 그리스도께 속한 하나님의 백성입니다. 교회의 첫째 얼굴, 곧 부름받은 하나님의 백성의 한 사람입니다.', '벧전 2:9', ''],
    dis: ['정체성', '그리스도의 제자', '그리스도와 동행하며 그분을 닮아 가는 사람이 그리스도의 제자입니다. 제자는 스승을 따르며 배우고, 마침내 스승을 닮아 가는 사람입니다. 그리스도인이라는 신분은 단번에 주어지지만, 제자와 증인은 평생 자라 갑니다.', '마 28:20', ''],
    wit: ['정체성', '그리스도의 증인', '사명을 감당하는 사람이 그리스도의 증인입니다. 증인은 삶으로 하나님 나라를 보여 주고, 삶과 말로 이웃을 하나님 나라로 초대하는 사람입니다. 그리고 증인이 되려면 먼저 제자로 자라야 합니다. 그리스도를 닮아 가지 않는 사람은 그리스도를 보여 줄 수도, 전할 수도 없기 때문입니다.', '행 1:8', ''],
    nw: ['연합으로 받는 신분', '새로운 신분', '하나님의 아들과 연합했으므로 하나님의 자녀가 되고, 성령께서 내 안에 계시므로 성령의 전이 되며, 그리스도의 몸에 붙었으므로 그리스도의 지체가 됩니다. 이 세 신분은 모두 연합의 서로 다른 얼굴입니다. 그리고 신분은 단번에 주어지고, 우리의 형편에 따라 흔들리지 않습니다.', '갈 4:6 · 고전 6:19 · 고전 12:27', ''],
  };
  const data = {};
  for (const [k, [kk, t, d, ref, books]] of Object.entries(N)) {
    data[k] = { k: kk, t, d, ref, books: books ? books.map((v) => bookLink(v, rel)).join(' · ') : '' };
  }
  const btn = (k, cls, sub) => `<button type="button" class="${cls}" data-k="${k}"><b>${N[k][1]}</b>${sub ? `<span>${sub}</span>` : ''}</button>`;
  return `
  <div class="bp-wrap">
    <div class="bp" role="group" aria-label="페이스빌더 성장 청사진">
      ${btn('grace', 'n-g', '하나님이 먼저 부르시고, 끝까지 이끄십니다')}
      ${btn('faith', 'n-p b-faith', '성령으로 그리스도와 연합함 · 상호내주')}
      ${btn('union', 'n-p b-union', '칭의 · 성화의 시작 · 소속으로서의 로드십')}
      ${btn('walk', 'n-p b-walk', '성화의 뿌리 · 다스림을 받는 삶으로서의 로드십')}
      ${btn('image', 'n-p b-image', '성화의 열매 · 그리스도처럼 살아감')}
      <div class="b-mis">${btn('real', 'n-c', '삶으로, 내가 속한 자리에서')}${btn('expand', 'n-c', '삶과 복음의 말로, 이웃에게')}</div>
      ${btn('end', 'n-g b-end', '그리스도의 장성한 분량이 충만한 데까지')}
      ${btn('xn', 'n-t b-xn', '그리스도께 속한 사람')}
      ${btn('dis', 'n-t b-dis', '따르며 배우고 닮아 가는 사람')}
      ${btn('wit', 'n-t b-wit', '보냄받은 사람')}
      ${btn('nw', 'n-t b-new', '하나님의 자녀 · 성령의 전 · 그리스도의 지체')}
      <div class="bp-note">왼쪽: 그 단계에서 빚어지는 정체성 · 오른쪽: 연합으로 받는 신분 · 칸을 누르면 설명이 나옵니다</div>
    </div>
    <aside class="bp-panel" aria-live="polite">
      <div class="k" id="bpk">8장 · 페이스빌더 성장 청사진</div>
      <h4 id="bpt">양육으로 지어져 가는 사람</h4>
      <p id="bpd">양육 로드맵이 교회가 성도를 어떤 길로 이끄는지를 보여 주는 지도라면, 성장 청사진은 그 길을 걷는 성도 안에서 무엇이 일어나는지, 그리고 성도를 통해서 무엇이 일어나는지를 보여 주는 설계도입니다. 그림의 칸을 하나씩 눌러 보십시오.</p>
      <div class="v" id="bpv"></div>
      <div id="bpb" style="margin-top:10px"></div>
    </aside>
  </div>
  <script>(function(){var D=${JSON.stringify(data)};var bs=document.querySelectorAll('.bp button');
  function show(k,el){var d=D[k];if(!d)return;bs.forEach(function(b){b.classList.toggle('on',b===el)});
  document.getElementById('bpk').textContent=d.k;document.getElementById('bpt').textContent=d.t;document.getElementById('bpd').textContent=d.d;
  document.getElementById('bpv').textContent=d.ref?'성경 · '+d.ref:'';document.getElementById('bpb').innerHTML=d.books?'교재 · '+d.books:'';
  if(window.innerWidth<860){document.querySelector('.bp-panel').scrollIntoView({behavior:'smooth',block:'nearest'})}}
  bs.forEach(function(b){b.addEventListener('click',function(){show(b.getAttribute('data-k'),b)})});})();</script>`;
}

// ---------- 첫 페이지 ----------

const partPage = (H, title, desc, path, body) => head({ title, desc, path }) + nav(H) + '\n' + body + footer + '\n</body></html>';
const nextBtn = (href, q, t) => `<a href="${href}" style="display:block;text-decoration:none;background:var(--navy);color:#fff;border-radius:14px;padding:18px 22px;min-width:260px"><span style="font-size:13px;color:var(--gold);letter-spacing:.12em">다음</span><b style="display:block;font-family:'Noto Serif KR',serif;font-size:22px;color:var(--gold-l)">${q}</b><span style="font-size:15px">${t} →</span></a>`;
const prevBtn = (href, q, t) => `<a href="${href}" style="display:block;text-decoration:none;border:1.5px solid var(--navy);color:var(--navy);border-radius:14px;padding:18px 22px;min-width:220px"><span style="font-size:13px;color:var(--mute);letter-spacing:.12em">이전</span><b style="display:block;font-family:'Noto Serif KR',serif;font-size:22px">${q}</b><span style="font-size:15px">← ${t}</span></a>`;


// ---------- 왜·무엇을·어떻게·소개: 목록(허브) 페이지와 각 장 페이지 ----------
const crumb = (H, items) => `<div class="crumbbar"><div class="wrap"><a href="${H}">처음</a>${items.map(([t, h]) => h ? ` <i>›</i> <a href="${h}">${t}</a>` : ` <i>›</i> <span>${t}</span>`).join('')}</div></div>`;
const PARTS = [];

PARTS.push({ id: 'why', q: '왜', qt: '교회는 왜 양육해야 하는가', head: (H) => `<div class="parthead" id="why"><div class="wrap">
  <div class="q">왜</div>
  <h2>교회는 왜 양육해야 하는가</h2>
  <p>양육은 교회가 해도 되고 안 해도 되는 프로그램이 아니라, 교회가 교회이기 위해 반드시 해야 하는 일입니다. 이 책은 그 근거를 두 자리에서 찾습니다. 교회를 향한 하나님의 마음과 성도 한 사람을 향한 하나님의 마음입니다.</p>
  <span class="ch">제1부 · 1–6장</span>
</div></div>`, leaves: [
  { slug: 'church', ch: '1–4장', t: '교회의 세 얼굴', one: '부름받은 백성, 보냄받은 증인, 제자로 훈련하는 공동체', html: (H) => `<section class="blk"><div class="wrap">
  <div class="eyebrow">1–4장 · 교회를 향한 하나님의 마음</div>
  <h3 class="t">교회의 세 얼굴</h3>
  <p class="lead">양육이 왜 필요한지는 교회 프로그램에서가 아니라 교회론에서 찾아야 합니다. 교회가 무엇인지에 따라 교회가 무엇을 해야 하는지가 정해지기 때문입니다. 그리고 교회에는 세 가지 얼굴이 있습니다.</p>
  <div class="grid g3" style="margin-top:24px">
    <div class="card face"><div class="k">교회의 특권 · 1장</div><h4>세상에서 부름받은<br>하나님의 백성</h4><p>교회는 부르심에서 시작됩니다. 하나님은 우리를 세상에서 불러내어 그분의 백성으로 삼으셨습니다.</p></div>
    <div class="card face f2"><div class="k">교회의 사명 · 2–3장</div><h4>세상으로 보냄받은<br>그리스도의 증인</h4><p>그런데 하나님은 부르신 백성을 다시 세상으로 보내셨습니다. 증인은 입으로 전하고 삶으로 그리스도를 보여 주는 사람입니다.</p></div>
    <div class="card face f3"><div class="k">교회의 일 · 4장</div><h4>하나님의 백성을 그리스도의<br>제자로 훈련하는 공동체</h4><p>증인이 되려면 제자로 훈련받고 성령의 다스림을 받아야 합니다. 그래서 교회는 성도를 제자로 훈련합니다.</p></div>
  </div>
  <div class="bridge">다시 말해, 부름받은 백성이 보냄받은 증인이 되려면 그 사이를 잇는 훈련이 반드시 있어야 합니다. 교회론을 바르게 이해하면 양육은 교회의 선택 사항이 아니라 교회의 본질이 됩니다.</div>
</div></section>` },
  { slug: 'believer', ch: '5장', t: '성도를 향한 하나님의 마음', one: '태어난 것에 머물지 않고 자라는 것', html: (H) => `<section class="blk alt"><div class="wrap">
  <div class="eyebrow">5장 · 성도를 향한 하나님의 마음</div>
  <h3 class="t">태어난 것에 머물지 않고 자라는 것</h3>
  <p class="lead">그런데 양육의 근거는 교회론에만 있지 않습니다. 하나님은 교회 전체를 향해서뿐 아니라, 그 교회를 이루는 성도 한 사람 한 사람을 향해서도 마음을 품고 계십니다. 갓난아기가 젖을 먹고 자라야 하듯이, 믿음으로 거듭난 것은 신앙의 끝이 아니라 시작입니다(벧전 2:2).</p>
  <ol class="steps">
    <li>성도는 <b>말씀을 먹고 성령의 인도를 받으며</b> 자랍니다.</li>
    <li>그렇게 자라는 성도는 <b>그리스도와 동행하고 그리스도를 닮아 갑니다.</b></li>
    <li>그리스도를 닮아 가는 성도가 <b>세상 속에서 그리스도의 제자요 증인</b>이 됩니다.</li>
  </ol>
  <div class="bridge">그러나 오늘날 한국 교회에는 태어나기만 하고 자라지 않은 그리스도인이 많습니다. 성도가 자라지 않으면 교회는 세상에서 그리스도를 보여 주지 못합니다. 다시 말해, 성도 한 사람이 자라기를 원하시는 하나님의 마음과 교회를 세상으로 보내시려는 하나님의 마음은 결국 하나의 마음입니다.</div>
</div></section>` },
  { slug: 'training', ch: '6장', t: '어떻게 훈련할 것인가', one: '설교의 한계를 넘어 소수의 모임과 읽기형 교재로', html: (H) => `<section class="blk"><div class="wrap">
  <div class="eyebrow">6장 · 어떻게 훈련할 것인가</div>
  <h3 class="t">설교에서 소그룹으로, 소그룹에서 삶으로</h3>
  <p class="lead">훈련은 프로그램이 아니라 삶 전체에서 일어나며, 우리를 훈련하시는 분은 성령님이십니다. 그래서 설교가 중요합니다. 그러나 설교만으로는 한 사람 한 사람의 삶을 다루기 어렵습니다. 이 한계를 넘으려면 다음이 필요합니다.</p>
  <div class="grid g3" style="margin-top:22px">
    <div class="card"><div class="k">소수의 모임</div><h4>함께 모여 양육받기</h4><p>소수가 함께 모여 말씀을 나누어야 그 말씀이 각 사람의 삶에 뿌리내립니다.</p></div>
    <div class="card"><div class="k">읽기형 교재</div><h4>읽고 나누는 교재</h4><p>동반자가 먼저 읽고 공부해 오면, 양육자는 나눔 질문으로 대화를 이끕니다. 웬만한 평신도 양육자도 인도할 수 있습니다.</p></div>
    <div class="card"><div class="k">교회의 일정</div><h4>양육을 위한 시간</h4><p>공예배 중심의 일정에는 양육할 시간이 없습니다. 양육이 본질이라면 교회의 일정이 그에 맞게 바뀌어야 합니다.</p></div>
  </div>
  <div class="bridge">그래서 교회는 삶에서 훈련이 일어나도록 <b>최소한의 양육 시스템</b>을 갖추어야 합니다. 그렇다면 무엇을, 어떤 순서로 양육해야 할까요?</div>
</div></section>` },
]});
PARTS.push({ id: 'what', q: '무엇을', qt: '무엇을, 어떤 순서로 양육할 것인가', head: (H) => `<div class="parthead" id="what"><div class="wrap">
  <div class="q">무엇을</div>
  <h2>무엇을, 어떤 순서로 양육할 것인가</h2>
  <p>예수님은 “내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라”(마 28:20)고 하셨습니다. 그 ‘모든 것’ 안에는 적어도 세 영역이 있습니다. 그리고 그 세 영역이 성장 청사진과 양육 로드맵이 됩니다.</p>
  <span class="ch">제2부 · 7–14장</span>
</div></div>`, leaves: [
  { slug: 'nurture', ch: '7장', t: '양육이란 무엇인가', one: '분부하신 모든 것의 세 영역: 만남·성장·재생산', html: (H) => `<section class="blk"><div class="wrap">
  <div class="eyebrow">7장 · 양육이란 무엇인가</div>
  <h3 class="t">분부하신 모든 것의 세 영역</h3>
  <p class="lead">예수님께서 제자들에게 하신 것이 양육입니다. 그리고 그 내용은 예수님께서 분부하신 모든 것입니다. 제자가 되는 데서 그치지 않고 제자를 삼는 것까지가 그 안에 들어 있습니다.</p>
  <div class="areas">
    <div class="area e"><b>그리스도와의 만남</b><span>Encounter</span><small>새가족 과정</small></div>
    <div class="area g"><b>그리스도 안에서의 성장</b><span>Growth</span><small>기초 과정 · 중급 과정</small></div>
    <div class="area r"><b>제자를 삼는 재생산</b><span>Reproduction</span><small>고급 과정</small></div>
  </div>
</div></section>` },
  { slug: 'blueprint', ch: '8장', t: '성장 청사진', one: '양육으로 지어져 가는 사람 — 누르면 설명이 열리는 그림', html: (H) => `<section class="blk alt" id="blueprint"><div class="wrap">
  <div class="eyebrow">8장 · 페이스빌더 성장 청사진</div>
  <h3 class="t">양육으로 지어져 가는 사람</h3>
  <p class="lead">양육의 목표는 그리스도와의 연합, 그리스도와의 동행, 그리스도의 형상이라는 세 단어로 정리됩니다. 그렇다면 그렇게 자라 가는 사람은 어떤 사람이 되며, 무엇을 위해 살아갈까요? 그 답을 교회론과 겹쳐 한 장의 그림으로 그린 것이 성장 청사진입니다.</p>
  ${blueprint(H)}
  <div class="bridge">다시 말해, 성장 청사진은 교회의 세 얼굴이 성도 한 사람 안에서 이루어져 가는 모습입니다. 그리스도인은 부름받은 하나님의 백성의 한 사람이고, 제자와 증인은 교회가 훈련하고 보내는 그 사람의 모습입니다. 그렇다면 교회는 이 사람을 어떤 길로 세워 갈까요? 그 길이 양육 로드맵입니다.</div>
</div></section>` },
  { slug: 'roadmap', ch: '9–14장', t: '양육 로드맵', one: '네 과정 · 21개 시리즈 · 79권, 과정마다 책별 목차', html: (H) => {
  const courseCards = courses.map((c) => {
    const chips = c.parts.flatMap((p) => p.series).map((s) => `<span class="chip">${esc(s.name.replace(/^[①-⑦]\s*/, ''))}</span>`).join('');
    return `<a class="course" href="${H}roadmap/${c.id}/">
      <div class="num" style="background:${c.color}">${c.no}</div>
      <div><h4 style="color:${c.color}">${c.name}${c.sub ? ` <small>(${c.sub})</small>` : ''}<small>${c.count}권</small></h4>
      <p>${esc(c.lead.split('.')[0])}.</p>
      <div class="chips">${chips}</div>
      <div class="go" style="color:${c.color};margin-top:10px">과정과 목차 보기 →</div></div></a>`;
  }).join('\n');
  return `<section class="blk" id="roadmap"><div class="wrap">
  <div class="eyebrow">9–14장 · 페이스빌더 양육 로드맵</div>
  <h3 class="t">세 영역, 네 과정 · ${TOTAL.series}개 시리즈 · ${TOTAL.books}권</h3>
  <p class="lead">만남·성장·재생산의 세 영역이 로드맵의 네 과정이 됩니다. 둘째 영역인 그리스도 안에서의 성장을 기초 과정과 중급 과정으로 나누었기 때문입니다. 기초 과정은 성장의 전체 그림을 먼저 보여 주고, 중급 과정은 그 그림을 더 깊고 구체적으로 공부하게 합니다.</p>
  <div class="grid g2" style="margin-top:24px">${courseCards}</div>
  <p class="small" style="margin-top:16px">로드맵을 따라갈수록 무게 중심이 지식에서 삶으로, 나에게서 다른 사람에게로 옮겨 갑니다. 과정마다 책 카드의 〔목차 보기〕를 누르면 각 권의 장 제목을 보실 수 있습니다.</p>

  <h4 id="where" style="font-size:21px;color:var(--navy);margin-top:40px;scroll-margin-top:80px">나는 지금 어디에 서 있나요?</h4>
  <div class="where">
    <a href="${H}roadmap/newcomer/"><b>처음 교회에 왔어요</b><span>새가족 과정 · 『복음 앞에 서다』부터</span></a>
    <a href="${H}roadmap/newcomer/"><b>다른 교회에서 옮겨 왔어요</b><span>새가족 과정 · 『복음 위에 서다』</span></a>
    <a href="${H}roadmap/basic/"><b>새가족 과정을 마쳤어요</b><span>기초 과정 · 기초양육 시리즈부터</span></a>
    <a href="${H}roadmap/intermediate/"><b>기초 과정을 마쳤어요</b><span>중급 과정 · 성경 시리즈부터</span></a>
    <a href="${H}roadmap/advanced/"><b>리더로 섬기고 싶어요</b><span>고급 과정 · 로마서 8장 시리즈부터</span></a>
  </div>
</div></section>`; } },
]});
PARTS.push({ id: 'how', q: '어떻게', qt: '로드맵을 교회에 어떻게 적용할 것인가', head: (H) => `<div class="parthead" id="how"><div class="wrap">
  <div class="q">어떻게</div>
  <h2>로드맵을 교회에 어떻게 적용할 것인가</h2>
  <p>제3부는 양육 시스템을 교회의 운영 시스템과 어떻게 접목할지를 오랫동안 고민하며 내린 잠정적인 결론입니다. 유일한 정답이라고 고집하려는 것이 아니라, 같은 길을 걷는 동료 목회자들과 후배 목회자들에게 드리는 하나의 제안입니다.</p>
  <span class="ch">제3부 · 15–18장</span>
</div></div>`, leaves: [
  { slug: 'system', ch: '15장', t: '최소한의 양육 시스템', one: '먼저 비우고, 설교 나눔 소그룹 위에 양육 소그룹을', html: (H) => `<section class="blk"><div class="wrap">
  <div class="eyebrow">15장 · 최소한의 양육 시스템</div>
  <h3 class="t">먼저 비워야 채울 수 있습니다</h3>
  <p class="lead">많은 교회가 기존의 예배와 모임과 행사를 그대로 둔 채 양육 과정을 하나 더 얹으려 합니다. 그러나 무엇인가를 줄여야 새로운 것을 할 공간이 생깁니다. 그 위에서, 모든 교회가 모든 것을 갖출 필요는 없지만 반드시 갖추어야 할 최소한이 있습니다.</p>
  <div class="grid g2" style="margin-top:22px">
    <div class="card"><div class="k">가장 기본이 되는 소그룹</div><h4>설교 나눔 소그룹</h4><p>담임목사의 주일 설교를 나눔지로 만들어 함께 나눕니다. 첫째 목표는 돌봄이지만, 인도자가 초점을 지키면 이 자리에서도 양육이 일어납니다. 그 위에 양육 소그룹을 세웁니다.</p></div>
    <div class="card"><div class="k">모든 성도가 거칠 과정</div><h4>새가족 과정과 기초 과정</h4><p>새가족 과정이 없으면 새로 온 사람이 손님으로 머물고, 기초 과정이 없으면 성도는 성장의 전체 그림을 한 번도 보지 못한 채 신앙생활을 하게 됩니다.</p></div>
    <div class="card"><div class="k">평생 깊어지는 과정</div><h4>중급 과정</h4><p>중급 과정은 단계라기보다 깊이입니다. 한 번 마치고 끝내는 과정이 아니라 평생에 걸쳐 꾸준히 나아가는 과정입니다.</p></div>
    <div class="card"><div class="k">지도자로 세울 사람의 과정</div><h4>고급 과정</h4><p>교회는 지도자로 세울 사람을 찾아 맡을 역할에 맞게 고급 과정을 밟게 합니다. 그래야 양육이 목회자 한 사람에게 매이지 않고 교회 전체로 퍼져 갑니다.</p></div>
  </div>
  <div class="bridge">그런데 아무리 좋은 시스템도 저절로 움직이지 않습니다. 다시 말해, 양육 시스템을 세운다는 것은 결국 그 시스템을 맡을 평신도 지도자를 세운다는 뜻입니다.</div>
</div></section>` },
  { slug: 'leaders', ch: '16–17장', t: '평신도 지도자', one: '사역리더·양육리더·소그룹리더와 그들이 밟을 과정', html: (H) => `<section class="blk alt" id="leaders"><div class="wrap">
  <div class="eyebrow">16–17장 · 평신도 지도자</div>
  <h3 class="t">세 종류의 평신도 지도자</h3>
  <div class="grid g3" style="margin-top:18px">
    <div class="card"><div class="k">MINISTRY LEADER</div><h4>사역리더 <span class="small">(부장)</span></h4><p>찬양팀이나 교육부서처럼 교회의 한 부서나 사역을 맡아 사람들을 이끌어 함께 섬기게 합니다.</p></div>
    <div class="card"><div class="k">NURTURE LEADER</div><h4>양육리더 <span class="small">(양육자)</span></h4><p>새가족 과정과 기초 과정의 교재로 동반자와 함께 공부하며 그를 세웁니다. 일대일 또는 두세 사람과 함께합니다.</p></div>
    <div class="card"><div class="k">SMALL GROUP LEADER</div><h4>소그룹리더 <span class="small">(소그룹 인도자)</span></h4><p>소그룹을 맡아 말씀을 함께 나누고 서로 돌보게 합니다. 설교 나눔 소그룹이 기본 자리입니다.</p></div>
  </div>
  <div class="flow">
    <div class="row"><div class="who"><b>사역리더</b><span>부장</span></div><ol><li>새가족·기초 과정</li><li>로마서 8장 시리즈 · 교회론 시리즈</li><li class="x">사역 현장</li></ol></div>
    <div class="row"><div class="who"><b>양육리더</b><span>양육자</span></div><ol><li>새가족·기초 과정</li><li>로마서 8장 시리즈 · 교회론 시리즈</li><li>귀납적 성경공부 · 소그룹 시리즈</li><li class="x">양육리더 훈련</li></ol></div>
    <div class="row"><div class="who"><b>소그룹리더</b><span>소그룹 인도자</span></div><ol><li>새가족·기초 과정</li><li>로마서 8장 시리즈 · 교회론 시리즈</li><li>귀납적 성경공부 · 소그룹 시리즈</li><li class="x">소그룹 경험 · 견습 리더</li></ol></div>
  </div>
  <p class="small" style="margin-top:12px">과정의 길이와 순서는 교회의 형편에 따라 달리할 수 있습니다. 과정 이수는 지도자가 되기 위한 필요조건이지 충분조건이 아닙니다. 지도자는 과정 이수가 아니라 성숙도로 세웁니다.</p>
  <div class="grid g2" style="margin-top:26px">
    <div class="card"><div class="k">17장 · 사역리더와 직분</div><h4>‘부장장로’ ‘부장집사’</h4><p>사역리더와 직분은 기준이 다릅니다. 그래서 부서를 이끄는 사역리더는 직분과 상관없이 ‘부장’이라 부르고, 직분이 있으면 역할을 앞에, 직분을 뒤에 붙여 부릅니다.</p></div>
    <div class="card"><div class="k">17장 · 장로를 세울 때</div><h4>가르치고, 돌보고, 다스리는 사람</h4><p>장로의 세 가지 일은 양육리더·소그룹리더·사역리더의 역할과 맞닿아 있습니다. 그래서 장로로 세울 사람은 세 역할을 모두 경험하게 하기를 제안합니다. 다만 그 경험이 직분으로 올라가는 사다리가 되어서는 안 됩니다.</p></div>
  </div>
</div></section>` },
  { slug: 'principles', ch: '18장', t: '양육 모임을 이끄는 원리', one: '한 주에 한 권, 전체에서 부분으로, 초점을 지키는 기술', html: (H) => `<section class="blk"><div class="wrap">
  <div class="eyebrow">18장 · 양육 모임을 이끄는 원리</div>
  <h3 class="t">교재는 도구입니다</h3>
  <p class="lead">교재의 설명은 이미 교재가 담고 있고, 동반자는 그 설명을 읽고 옵니다. 그러므로 양육 모임을 이끄는 사람은 교재를 다시 강의하지 않고, 나눔 질문으로 대화를 이끕니다.</p>
  <div class="principles">
    <div><b>한 주에 한 권</b><span>세 권 시리즈는 세 주, 다섯 권 시리즈는 다섯 주에 함께 마칩니다.</span></div>
    <div><b>예습의 최소한</b><span>교재를 미리 읽고, 교재가 묻는 질문에 빠짐없이 답해 옵니다.</span></div>
    <div><b>전체에서 부분으로</b><span>책 전체의 흐름을 먼저 보여 주고 각 과로 들어갑니다.</span></div>
    <div><b>초점을 지키는 기술</b><span>머릿속에 그 과의 논리 지도를 그려 두고 나눔의 초점을 지킵니다.</span></div>
    <div><b>가르칠 때 가장 잘 배웁니다</b><span>동반자가 배운 내용을 직접 설명해 보게 합니다.</span></div>
    <div><b>조급하지 않은 양육</b><span>사람은 평생에 걸쳐 누적적으로 변화됩니다.</span></div>
  </div>
</div></section>` },
  { slug: 'conclusion', ch: '결론', t: '양육받은 사람이 양육하는 사람이 될 때', one: '로드맵은 한 바퀴를 돕니다', html: (H) => `<section class="close"><div class="wrap">
  <div class="eyebrow">결론</div>
  <h3>양육받은 사람이 양육하는 사람이 될 때</h3>
  <p>페이스빌더 양육 로드맵은 한 방향으로 끝나는 길이 아니라 한 바퀴를 도는 길입니다.</p>
  <div class="loop"><span>부름받은 백성</span><i>→</i><span>그리스도의 제자</span><i>→</i><span>보냄받은 증인</span><i>→</i><span>새로운 한 사람</span><i>↺</i></div>
  <p>그리고 이 일은 거창한 시스템이 아니라 언제나 한 사람에게서 시작됩니다.</p>
  <a class="btn red" style="margin-top:18px" href="${PLAY80}" target="_blank" rel="noopener">『${VOL80}』 무료로 읽기</a>
  <a class="btn line" href="${H}vol080/">책 소개와 목차</a>
</div></section>` },
]});
PARTS.push({ id: 'about', q: '소개', qt: '송정헌 목사 · 페이스빌더 출판사', head: (H) => ``, leaves: [
  { slug: 'author', ch: '저자', t: '송정헌 목사', one: '신앙 고백, 경력과 학력, 출판사의 세 가지 비전', html: (H) => `<section class="blk" id="about"><div class="wrap">
  <div class="eyebrow">ABOUT</div>
  <h3 class="t">송정헌 목사</h3>
  <p class="lead">대한예수교장로회(합동) 교단 소속 목사이자, 문서 선교 기관인 페이스빌더 출판사(Faith Builder Press) 대표입니다. 성도들이 미리 읽고 깊이 묵상한 뒤 함께 토론할 수 있도록, 풍부하고 정밀하게 구성된 ‘완성형 읽기 자료 교재’를 집필하는 일을 남은 인생의 사명으로 삼고 있습니다. 지금까지 ${TOTAL.books}권의 교재와 그 교재들을 안내하는 『${VOL80}』를 구글 플레이 북스, 교보문고, YES24에서 전자책으로 펴냈습니다.</p>
  <div class="grid g2" style="margin-top:26px">
    <div class="card creed">
      <h4 style="margin-top:0">교리적으로</h4><p>개혁주의가 성경의 진리를 가장 잘 표현하는 교리라고 믿습니다. 그에 따라 웨스트민스터 신앙고백과 대·소요리문답을 교리적 표준문서로 존중합니다.</p>
      <h4>목회적으로</h4><p>교회는 세상에서 부름받은 하나님의 백성이자 세상으로 보냄받은 그리스도의 증인이라고 믿습니다. 그에 따라 하나님의 백성을 그리스도의 제자로 훈련하여 세상 속의 증인으로 세우는 양육을 목회의 중심에 둡니다.</p>
      <h4>설교자로서</h4><p>성경이 성도를 교훈하고 책망하며 바르게 교정함으로 하나님이 원하시는 의의 기준에 따라 살도록 만든다고 믿습니다. 그에 따라 성경 안에 담긴 하나님의 뜻을 순전하게 풀어 전하는 설교를 하고 있습니다.</p>
    </div>
    <div class="card">
      <h4>경력</h4>
      <ul class="tl">
        <li>현 페이스빌더 출판사 대표 · 청목원(목회자 재교육 기관) 강사 <span class="y">현재</span></li>
        <li>전주북문교회 담임목사 <span class="y">2016–2024</span></li>
        <li>밴쿠버 그레이스한인교회 선임부목사 (영성·양육) <span class="y">2010–2016</span></li>
        <li>태안사랑의교회 개척 <span class="y">2005–2010</span></li>
        <li>국제제자훈련원 컨설팅 담당 목사 · CAL 세미나 강사 <span class="y">2002–2005</span></li>
        <li>사랑의교회 사랑부 담당 목사 <span class="y">1999–2001</span></li>
      </ul>
      <h4 style="margin-top:22px">학력</h4>
      <ul class="tl">
        <li>총신대학교 신학대학원 (M.Div.) <span class="y">1996</span></li>
        <li>서울대학교 대학원 사회복지학과 수료 <span class="y">1993</span></li>
        <li>서울대학교 사회복지학과 졸업 <span class="y">1991</span></li>
      </ul>
      <p class="small" style="margin-top:12px"><a href="https://b2bministry.org" target="_blank" rel="noopener">청목원 홈페이지 →</a></p>
    </div>
  </div>
  <div class="card" style="margin-top:18px">
    <div class="k">FAITH BUILDER PRESS</div><h4>페이스빌더 출판사의 세 가지 비전</h4>
    <div class="grid g3" style="margin-top:10px">
      <div><b>Faith Builder</b><p>성도 개인이 스스로 말씀을 묵상하고 연구하여 흔들리지 않는 믿음의 집을 세우도록 돕습니다.</p></div>
      <div><b>Pace Builder</b><p>교역자와 평신도 리더가 체계적으로 성도를 양육하도록 검증된 ‘완성형 교재’로 동역합니다.</p></div>
      <div><b>Kingdom Builder</b><p>교재를 세계 각국의 언어로 번역해 선교지의 현지인 리더 양육을 돕습니다.</p></div>
    </div>
  </div>
</div></section>` },
  { slug: 'sermons', ch: '설교', t: '설교', one: '유튜브에서 듣는 설교', html: (H) => `<section class="blk alt" id="sermons"><div class="wrap">
  <div class="eyebrow">SERMONS</div>
  <h3 class="t">설교</h3>
  <div class="ser">
    <a href="https://www.youtube.com/watch?v=NX4t3tH9iuo" target="_blank" rel="noopener"><small>마태복음 16:16-19</small><b>마태복음에서 팔복을 해석하다</b></a>
    <a href="https://www.youtube.com/watch?v=fviRtssOEtY" target="_blank" rel="noopener"><small>레위기 11:45</small><b>레위기에서 거룩을 배우다</b></a>
    <a href="https://www.youtube.com/watch?v=9CMIhR2zsW8" target="_blank" rel="noopener"><small>창세기 22:2 · 에베소서 6:4 · 마태복음 7:11</small><b>부모가 되어가는 중입니다</b></a>
  </div>
  <a class="btn navy" style="margin-top:22px" href="https://youtube.com/@pastor.song-f3h" target="_blank" rel="noopener">유튜브에서 설교 더 보기</a>
</div></section>` },
  { slug: 'support', ch: '후원', t: '문서 선교에 함께해 주세요', one: '후원 계좌와 후원 방법', html: (H) => `<section class="blk" id="support"><div class="wrap">
  <div class="eyebrow">SUPPORT</div>
  <h3 class="t">문서 선교에 함께해 주세요</h3>
  <p class="lead">바른 신학에 기초한 신앙 서적이 널리 보급되도록, 문서 선교 사역에 함께해 주실 분들의 후원을 받습니다. 후원금은 집필·연구와 전자책 제작, 그리고 <b>선교지 언어 번역과 무상 보급</b>, 앞으로의 종이책 발간에 투명하게 사용됩니다.</p>
  <div class="card" style="margin-top:24px;border:2px solid var(--gold)">
    <div class="k">후원 계좌</div>
    <h4 style="font-size:24px;margin-top:6px">우리은행 1005-904-907581</h4>
    <p style="font-size:17px">예금주: 페이스빌더</p>
    <p style="margin-top:12px">입금하실 때 메모란에 <b>성함+후원</b> 또는 <b>성함+출판</b>을 적어 주십시오. (예: 홍길동후원)</p>
    <button class="btn navy" style="margin-top:16px" onclick="var b=this;navigator.clipboard&&navigator.clipboard.writeText('우리은행 1005-904-907581 페이스빌더').then(function(){b.textContent='계좌번호가 복사되었습니다'},function(){})">계좌번호 복사하기</button>
  </div>
  <p class="lead" style="margin-top:22px"><b>관심과 기도, 그리고 일독과 전파를 부탁드립니다. 감사합니다.</b></p>
</div></section>` },
  { slug: 'contact', ch: '연락', t: '교재 구입과 문의', one: '교재 찾는 법, 교회 교재 사용 문의', html: (H) => `<section class="blk alt" id="contact"><div class="wrap">
  <div class="eyebrow">CONTACT</div>
  <h3 class="t">교재 구입과 문의</h3>
  <div class="grid g2">
    <div class="card"><h4>교재 찾는 법</h4><p>페이스빌더 교재는 지금 전자책으로 출간되어 있습니다.</p>
      <ol style="margin:10px 0 0;padding-left:22px;font-size:16px"><li>Play 스토어 또는 구글 플레이 북스를 엽니다.</li><li>검색창에 <b>송정헌</b>을 입력합니다.</li><li>도서 탭에서 모든 책을 확인합니다.</li></ol>
      <p class="small" style="margin-top:10px">교보문고·YES24에서도 만나실 수 있습니다.</p>
      <a class="btn navy" style="margin-top:14px" href="${PLAY_ALL}" target="_blank" rel="noopener">구글 플레이 북스에서 전체 보기</a></div>
    <div class="card"><h4>교회 교재 사용 · 문의</h4><p>교회에서 교재로 사용하시거나 후원과 출판에 관해 문의하시려면 이메일로 연락해 주십시오.</p>
      <p style="margin-top:12px;font-size:18px"><a href="mailto:faithbuilder.kr@gmail.com"><b>faithbuilder.kr@gmail.com</b></a></p>
      <p style="margin-top:4px;font-size:16px"><a href="mailto:sjhdavid@naver.com">sjhdavid@naver.com</a></p></div>
  </div>
</div></section>` },
]});

const ORDER = PARTS.flatMap((p) => p.leaves.map((l) => ({ p, l })));

function hubPage(p, pi) {
  const H = '../';
  const headHtml = p.head(H) || `<div class="parthead"><div class="wrap"><div class="q" style="font-size:clamp(40px,7vw,64px)">${p.q}</div><h2>${p.qt}</h2></div></div>`;
  const cards = p.leaves.map((l, i) => `<a class="hubcard" href="${H}${p.id}/${l.slug}/"><span class="n">${l.ch}</span><span class="tx"><b>${l.t}</b><span>${l.one}</span></span><i>→</i></a>`).join('');
  const prevP = PARTS[pi - 1], nextP = PARTS[pi + 1];
  return head({ title: `${p.q} — ${p.qt} | ${VOL80}`, desc: `${p.qt}. 『${VOL80}』`, path: `/${p.id}/` }) + nav(H) + crumb(H, [[p.q]]) + headHtml + `
<section class="blk"><div class="wrap"><div class="hub">${cards}</div>
<div class="pager">${prevP ? `<a href="${H}${prevP.id}/">← ${prevP.q}</a>` : `<a href="${H}">← 처음으로</a>`}${nextP ? `<a href="${H}${nextP.id}/">${nextP.q} →</a>` : `<a href="${H}">처음으로 →</a>`}</div>
</div></section>` + footer + '\n</body></html>';
}

function leafPage(k) {
  const H = '../../';
  const { p, l } = ORDER[k];
  const prev = ORDER[k - 1], next = ORDER[k + 1];
  const sameP = (o) => o && o.p === p;
  const prevHtml = sameP(prev) ? prevBtn(`${H}${p.id}/${prev.l.slug}/`, prev.l.t, prev.l.ch) : prevBtn(`${H}${p.id}/`, p.q, '목록으로');
  const nextHtml = sameP(next) ? nextBtn(`${H}${p.id}/${next.l.slug}/`, next.l.t, next.l.ch) : (next ? nextBtn(`${H}${next.p.id}/`, next.p.q, next.p.qt) : nextBtn(H, '처음으로', '첫 화면'));
  return head({ title: `${l.t} | ${p.q} — ${VOL80}`, desc: `${l.t} — ${l.one}. 『${VOL80}』 ${l.ch}.`, path: `/${p.id}/${l.slug}/` }) + nav(H) + crumb(H, [[p.q, `${H}${p.id}/`], [l.t]]) + l.html(H) + `
<section class="blk"><div class="wrap"><div class="pager" style="margin:0">${prevHtml}${nextHtml}</div></div></section>` + footer + '\n</body></html>';
}

// ---------- 첫 화면(인트로) ----------
function index() {
  const H = './';
  return head({
    title: `${VOL80} | 송정헌 목사 · 페이스빌더 출판사`,
    desc: `새 책 『${VOL80}』 — ${VOL80_SUB}. 페이스빌더 교재 ${TOTAL.books}권의 양육 로드맵과 성장 청사진. 구글 플레이 북스에서 무료로 읽으실 수 있습니다.`,
    path: '/',
  }) + `
<main class="intro">
  <div class="wrap">
    <div class="who">송정헌 목사 · 페이스빌더 출판사</div>
    <div class="in">
      <div class="cover"><img src="/vol080-cover.jpg" alt="『${VOL80}』 표지" width="640" height="907"><div class="badge"><b>무료</b><small>FREE</small></div></div>
      <div>
        <div class="eyebrow">VOL.080 · 새 책</div>
        <h1>페이스빌더 <br>양육 시스템 소개</h1>
        <p class="sub">${VOL80_SUB}</p>
        <div class="qs">
          <a href="why/"><b>왜</b><span>교회는 왜 양육해야 하는가</span><i>→</i></a>
          <a href="what/"><b>무엇을</b><span>무엇을, 어떤 순서로 양육할 것인가</span><i>→</i></a>
          <a href="how/"><b>어떻게</b><span>로드맵을 교회에 어떻게 적용할 것인가</span><i>→</i></a>
        </div>
        <div class="mini"><a href="${PLAY80}" target="_blank" rel="noopener">구글 플레이 북스에서 무료로 읽기</a><a href="vol080/">책 소개와 목차</a><a href="about/">저자 소개 · 후원</a></div>
      </div>
    </div>
  </div>
</main>
</body></html>`;
}


// ---------- 책 소개 페이지 ----------
const TOC80 = [
  ['', [['서론', '양육은 프로그램인가, 교회의 본질인가', ['이 책에서 쓰는 두 용어: 양육과 훈련', '양육을 바라보는 두 가지 시선', '질문은 교회론에서 출발해야 합니다', '교회론이 양육을 요구합니다']]]],
  ['제1부 교회는 왜 양육해야 하는가', [
    ['1', '세상에서 부름받은 하나님의 백성', ['교회는 부르심에서 시작됩니다', '신분이 먼저입니다', '부름받은 백성은 공동체로 부름받았습니다', '부름받은 백성은 예배하고 교제합니다', '무엇을 위해 부르셨습니까?']],
    ['2', '세상으로 보냄받은 그리스도의 증인', ['특권과 사명', '아버지께서 나를 보내신 것 같이', '내 증인이 되리라', '증인은 누구인가', '모든 성도는 증인입니다', '무엇이 사람을 증인 되게 하는가']],
    ['3', '증인이 되려면: 제자 훈련과 성령의 다스림', ['증인이 되기 위해 필요한 두 가지', '제자로 훈련받아야 합니다', '증언은 보고 들은 것을 말하는 것입니다', '제자 삼음과 증인 됨은 같은 사명입니다', '분부하신 모든 것을 지키기까지', '제자 됨은 조건이고, 증인 됨은 열매입니다', '성령의 다스림을 받아야 합니다', '두 가지는 함께 갑니다', '부름과 보냄 사이의 간격']],
    ['4', '하나님의 백성을 그리스도의 제자로 훈련하는 공동체', ['교회의 셋째 얼굴', '교회론이 넓어지면 교회의 일이 달라집니다', '성도를 온전하게 하여', '각 사람을 그리스도 안에서 완전한 자로', '제자가 제자를 세웁니다', '양육하지 않는 교회']],
    ['5', '성도를 향한 하나님의 마음', ['또 하나의 자리', '태어난 것에 머물지 않고 자라는 것', '태어나기만 하고 자라지 않은 그리스도인', '말씀을 먹고 성령의 인도를 받으며', '그리스도와 동행하고 그리스도를 닮아 가며', '그래서 세상 속에서 제자와 증인이 됩니다']],
    ['6', '어떻게 훈련할 것인가', ['훈련은 삶 전체에서 일어납니다', '우리를 훈련하시는 분은 성령님이십니다', '그래서 설교가 중요합니다', '그러나 설교에는 한계가 있습니다', '소수가 함께 모여 양육받아야 합니다', '읽고 나누는 교재로 양육해야 합니다', '양육을 위한 시간을 내야 합니다', '교회는 최소한의 양육 시스템을 갖추어야 합니다']],
  ]],
  ['제2부 무엇을, 어떤 순서로 양육할 것인가', [
    ['7', '양육이란 무엇인가', ['양육을 다시 정의해야 합니다', '예수님께서 제자들에게 하신 것이 양육입니다', '양육의 내용: 분부하신 모든 것', '분부하신 모든 것의 세 영역', '양육의 목표: 그리스도의 장성한 분량까지', '사람은 평생에 걸쳐 변화됩니다', '그래서 양육에는 단계가 필요합니다']],
    ['8', '페이스빌더 성장 청사진: 양육으로 지어져 가는 사람', ['양육의 목표를 한 장의 그림으로', '바탕은 은혜, 통로는 믿음', '연합: 그리스도인과 새로운 신분', '동행: 성화의 뿌리', '형상: 성화의 열매, 그리고 그리스도의 제자', '증인과 사명: 하나님 나라의 실현과 확장', '세 정체성과 교회의 세 얼굴', '다시 동행으로, 그리고 완성', '청사진에서 로드맵으로']],
    ['9', '페이스빌더 양육 로드맵 한눈에 보기', ['네 과정', '세 영역, 네 과정', '로드맵은 교회론을 따라갑니다', '기초와 중급은 단계라기보다 깊이입니다', '지식에서 삶으로, 나에게서 다른 사람에게로']],
    ['10', '새가족 과정: 그리스도를 만나 공동체에 서다', ['왜 새가족 과정에서 출발하는가', '대상이 다른 두 권의 교재', '새가족 과정을 진행할 때']],
    ['11', '기초 과정 1부: 성장의 전체 그림', ['연합에서 출발합니다', '동행은 세 관계로 드러납니다', '동행하는 사람은 그리스도의 형상을 닮아 갑니다', '양육의 목표, 성장 청사진과 같은 그림', '기초 과정 1부를 진행할 때']],
    ['12', '기초 과정 2부: 신앙의 유산', ['교회가 세대를 이어 물려준 유산', '무엇을 믿고, 어떻게 자라고, 어떻게 살고, 어떻게 기도하는가', '간과되어 온 네 주제']],
    ['13', '중급 과정: 성장의 깊이', ['기초에서 본 그림 속으로 깊이 들어갑니다', '1부 교리: 성경 전체의 흐름과 교리의 체계', '2부 핵심 본문: 산상수훈', '3부 내면: 골리앗도, 사울도 내 안에 있다', '머리에서 말씀으로, 말씀에서 마음으로', '앞으로 채워 갈 과정']],
    ['14', '고급 과정: 다른 사람을 세우는 사람', ['재생산으로 초점이 바뀝니다', '공통 기초: 로마서 8장 성령의 사람 시리즈', '공통 기초: 교회론 시리즈', '말씀 사역의 기술: 귀납적 성경공부 시리즈', '말씀 사역의 기술: 소그룹 시리즈', '모든 지도자가 같은 과정을 밟지는 않습니다']],
  ]],
  ['제3부 로드맵을 교회에 어떻게 적용할 것인가', [
    ['15', '최소한의 양육 시스템', ['하나의 제안으로', '먼저 비워야 채울 수 있습니다', '모든 교회가 모든 것을 갖출 필요는 없습니다', '가장 기본이 되는 소그룹: 설교 나눔 소그룹', '모든 성도가 거칠 과정: 새가족과 기초', '평생 깊어지는 과정: 중급', '지도자로 세울 사람의 과정: 고급', '규모와 형편에 따라', '시스템을 움직이는 사람']],
    ['16', '세 종류의 평신도 지도자', ['평신도 지도자는 세 종류입니다', '이름에 담긴 뜻', '모든 지도자의 공통 기초', '양육리더와 소그룹리더의 과정', '현장 훈련: 양육리더 훈련', '현장 훈련: 소그룹 경험과 견습', '한눈에 보는 지도자 과정', '과정 이수는 필요조건입니다']],
    ['17', '평신도 지도자와 직분자', ['사역리더와 직분은 다릅니다', '부장장로, 부장집사', '장로의 세 가지 일', '세 역할을 경험한 사람을 장로로', '경험은 사다리가 아닙니다']],
    ['18', '양육 모임을 이끄는 원리', ['교재는 도구입니다', '읽고 나누는 교재', '한 주에 한 권', '예습의 최소한', '전체에서 부분으로', '초점을 지키는 기술', '가르칠 때 가장 잘 배웁니다', '조급하지 않은 양육']],
  ]],
  ['', [['결론', '양육받은 사람이 양육하는 사람이 될 때', ['로드맵은 한 바퀴를 돕니다', '처음 한 사람에게서']], ['부록', '책별 목차 (79권 교재 전체)', []]]],
];

function vol80Page() {
  const home = '../';
  const toc = TOC80.map(([pt, chs]) => `<div class="pt">${pt ? `<b>${esc(pt)}</b>` : ''}${chs.map(([n, t, subs]) =>
    subs.length ? `<details><summary><i>${n}</i>${esc(t)}</summary><ul>${subs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></details>`
      : `<details><summary><i>${n}</i><a href="${home}what/roadmap/" style="text-decoration:none">${esc(t)}</a></summary></details>`).join('')}</div>`).join('');
  return head({
    title: `『${VOL80}』 — ${VOL80_SUB} | 페이스빌더 출판사`,
    desc: `VOL.080 『${VOL80}』 — ${VOL80_SUB}. 송정헌 지음. 구글 플레이 북스에서 무료로 읽으실 수 있습니다. 부록에 79권 교재의 책별 목차 수록.`,
    path: '/vol080/',
  }) + nav(home) + `
<section class="hero"><div class="wrap"><div class="in">
  <div class="cover"><img src="/vol080-cover.jpg" alt="『${VOL80}』 표지" width="640" height="907"><div class="badge"><b>무료</b><small>FREE</small></div></div>
  <div>
    <div class="eyebrow">VOL.080 · 새 책 소개</div>
    <h1>페이스빌더 <br>양육 시스템 소개</h1>
    <p class="sub">${VOL80_SUB}</p>
    <p class="lead">송정헌 지음 · 페이스빌더 출판사<br>부록 · 79권 교재의 책별 목차 수록</p>
    <a class="btn red" href="${PLAY80}" target="_blank" rel="noopener">구글 플레이 북스에서 무료로 읽기</a>
    <a class="btn line" href="${home}why/">홈페이지에서 먼저 둘러보기</a>
  </div>
</div></div></section>

<section class="blk"><div class="wrap">
  <div class="eyebrow">이 책은 이런 책입니다</div>
  <h3 class="t">지도와 함께, 그 길을 걸어야 하는 이유를</h3>
  <p class="lead">페이스빌더 출판사는 새가족 과정에서 고급 과정까지 이르는 교재를 ${TOTAL.books}권 펴냈습니다. 그리고 각 책의 끝에 어느 과정에 어떤 책이 있는지를 보여 주는 ‘페이스빌더 양육 로드맵’을 실었습니다. 그러나 로드맵은 지도일 뿐, 왜 이 길로 가야 하는지까지 설명해 주지는 못합니다. 교회가 성도를 세우려면 지도와 함께 그 길을 걸어야 하는 이유도 알아야 합니다. 『${VOL80}』는 바로 그 이유를 설명하기 위해 쓴 안내서입니다.</p>
  <div class="areas">
    <div class="area e"><b>그리스도와의 만남</b><small>새가족 과정</small></div>
    <div class="area g"><b>그리스도 안에서의 성장</b><small>기초 과정 · 중급 과정</small></div>
    <div class="area r"><b>제자를 삼는 재생산</b><small>고급 과정</small></div>
  </div>
  <p class="lead" style="margin-top:20px">양육은 사람을 바꾸는 기술이 아닙니다. 성령께서 한 사람을 그리스도의 형상으로 빚어 가시는 길에 교회가 말씀과 삶으로 함께하는 일입니다.</p>
</div></section>

<section class="blk alt"><div class="wrap">
  <div class="eyebrow">이 책의 구성</div>
  <h3 class="t">왜, 무엇을, 어떻게</h3>
  <div class="grid g3" style="margin-top:14px">
    <a class="card" style="text-decoration:none" href="${home}why/"><div class="k">제1부 · 1–6장</div><h4>교회는 왜 양육해야 하는가</h4><p>세상에서 부름받은 하나님의 백성이자 세상으로 보냄받은 그리스도의 증인이라는 교회론, 그리고 성도 한 사람을 향한 하나님의 마음에서 그 이유를 찾습니다.</p></a>
    <a class="card" style="text-decoration:none" href="${home}what/"><div class="k">제2부 · 7–14장</div><h4>무엇을, 어떤 순서로 양육할 것인가</h4><p>양육이 무엇인지 다시 정의하고, 성장 청사진을 그린 뒤, 만남·성장·재생산의 세 영역을 따라 짠 네 과정을 차례로 설명합니다.</p></a>
    <a class="card" style="text-decoration:none" href="${home}how/"><div class="k">제3부 · 15–18장</div><h4>로드맵을 교회에 어떻게 적용할 것인가</h4><p>최소한의 양육 시스템과, 그것을 움직이는 사역리더·양육리더·소그룹리더를 세우는 길을 동료 목회자들에게 제안합니다.</p></a>
  </div>
  <h4 style="font-size:22px;color:var(--navy);margin-top:40px">목차 <span class="small">— 장 제목을 누르면 절 제목이 펼쳐집니다</span></h4>
  <div class="toc">${toc}</div>
</div></section>

<section class="blk"><div class="wrap">
  <div class="eyebrow">이 책을 권합니다</div>
  <h3 class="t">누구를 위한 책인가</h3>
  <div class="grid g3" style="margin-top:14px">
    <div class="card"><h4>담임목사와 교역자</h4><p>교회론에서 출발해 양육이 왜 교회의 본질인지 정리하고, 교회 규모와 형편에 맞는 최소한의 양육 시스템을 세우는 데 도움을 받으실 수 있습니다.</p></div>
    <div class="card"><h4>평신도 지도자</h4><p>사역리더(부장), 양육리더(양육자), 소그룹리더(소그룹 인도자)가 각각 어떤 과정을 밟으며 준비되는지, 그리고 양육 모임을 어떻게 이끌지 안내합니다.</p></div>
    <div class="card"><h4>페이스빌더 교재로 공부하는 성도</h4><p>내가 지금 어디에 서 있고, 다음에 무엇을 공부하면 되는지 알게 되어 공부의 목적이 분명해집니다. 부록에 79권 각 책의 목차를 모두 실었습니다.</p></div>
  </div>
  <div style="margin-top:30px;text-align:center">
    <a class="btn red" href="${PLAY80}" target="_blank" rel="noopener">구글 플레이 북스에서 무료로 읽기</a>
    <a class="btn ghost" href="${home}what/roadmap/">79권 로드맵 보기</a>
  </div>
</div></section>
` + footer + '\n</body></html>';
}

// ---------- 과정 페이지 ----------
function coursePage(c, i) {
  const home = '../../';
  const parts = c.parts.map((p) => {
    const series = p.series.map((s) => `
      <div class="series"><h3 style="color:${c.color}">${esc(s.name)}</h3>
      <div class="meta">${s.tag ? esc(s.tag) + ' · ' : ''}${s.range} · ${s.books.length}권</div>
      <div class="books">${s.books.map(([v, t, d]) => `
        <div class="book" id="v${v}"><div class="v" style="color:${c.color}">VOL.${v}</div><h4>『${esc(t)}』</h4><p>${esc(d)}</p>
        ${toc[v] && toc[v].length ? `<details><summary>목차 보기</summary><ol>${toc[v].map((x) => `<li>${esc(x)}</li>`).join('')}</ol></details>` : ''}
        <a class="buy" href="${play(t)}" target="_blank" rel="noopener" style="color:${c.color}">구글 플레이 북스 →</a></div>`).join('')}
      </div></div>`).join('');
    return `<div class="part">${p.name ? `<h2>${esc(p.name)}</h2>` : ''}${p.intro ? `<div class="intro">${esc(p.intro)}</div>` : ''}${series}</div>`;
  }).join('');
  const prev = courses[i - 1], next = courses[i + 1];
  return head({
    title: `${c.no}. ${c.name} | 페이스빌더 양육 로드맵`,
    desc: `${c.name}${c.sub ? `(${c.sub})` : ''} ${c.count}권 — ${c.lead.split('.')[0]}. 책마다 목차를 보실 수 있습니다.`,
    path: `/roadmap/${c.id}/`,
  }) + nav(home) + crumb(home, [['무엇을', `${home}what/`], ['양육 로드맵', `${home}what/roadmap/`], [c.name]]) + `
  <div class="chead" style="background:${c.color}"><div class="wrap">
    <a class="crumb" href="${home}what/roadmap/">← 로드맵 전체 보기</a>
    <div class="eyebrow" style="color:#f0dfb8;margin-top:18px">STAGE ${c.no} · ${esc(c.area)}</div>
    <h1>${c.name}${c.sub ? ` <span style="font-size:.6em">(${c.sub})</span>` : ''}</h1>
    <p>${esc(c.lead)}</p>
    <p style="margin-top:10px;opacity:.85">${c.parts.flatMap((p) => p.series).length}개 시리즈 · ${c.count}권 · 책마다 〔목차 보기〕를 누르면 장 제목이 펼쳐집니다</p>
  </div></div>
<main class="wrap">
  ${parts}
  ${c.note ? `<div class="note">${esc(c.note)}</div>` : ''}
  <div class="note" style="background:var(--navy);color:#fff;border:0">이 과정이 로드맵 전체에서 어떤 자리에 있는지는 『${VOL80}』 ${({ newcomer: '10장', basic: '11–12장', intermediate: '13장', advanced: '14장' })[c.id]}에서 자세히 설명합니다. <a href="${home}vol080/" style="color:var(--gold-l)">책 소개 보기 →</a></div>
  <div class="pager">
    ${prev ? `<a href="../${prev.id}/">← ${prev.no}. ${prev.name}</a>` : `<a href="${home}what/blueprint/">← 성장 청사진</a>`}
    ${next ? `<a href="../${next.id}/">${next.no}. ${next.name} →</a>` : `<a href="${home}how/">어떻게 적용할 것인가 →</a>`}
  </div>
</main>
<div style="height:40px"></div>
` + footer + '\n</body></html>';
}

function write(rel, html) {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  if (PREVIEW) {
    html = html.replace(/href="((?:\.\.\/|\.\/)*(?:[\w-]+\/)*)(#[\w-]+)?"/g, (m, a, h) => /^(?:\.\.\/|\.\/)*(?:[\w-]+\/)*$/.test(a) && (a.endsWith('/') || a === '') && !(a === '' && h) ? `href="${a.replace(/^\.\/$/, '')}index.html${h || ''}"` : m);
    const depth = rel.split('/').length - 1;
    html = html.replace(/src="\/vol080-cover\.jpg"/g, `src="${'../'.repeat(depth)}vol080-cover.jpg"`);
  }
  writeFileSync(f, html);
  console.log('wrote', f);
}
write('index.html', index());
PARTS.forEach((p, i) => write(PREVIEW ? `${p.id}/index.html` : `${p.id}.html`, hubPage(p, i)));
ORDER.forEach(({ p, l }, k) => write(PREVIEW ? `${p.id}/${l.slug}/index.html` : `${p.id}/${l.slug}.html`, leafPage(k)));
write(PREVIEW ? 'vol080/index.html' : 'vol080.html', vol80Page());
courses.forEach((c, i) => write(PREVIEW ? `roadmap/${c.id}/index.html` : `roadmap/${c.id}.html`, coursePage(c, i)));
