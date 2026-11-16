# jeongheon-site

The personal website of Pastor Song Jeong-heon (송정헌 목사). It covers his background and ministry experience, his sermons and writing, and a way to get in touch.

## Built With

- [Astro](https://astro.build)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [GSAP](https://gsap.com) for animations
- [Three.js](https://threejs.org) for 3D elements

## Running Locally

Requires Node.js v20 or higher.

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:4321`.

To build for production:

```bash
npm run build
```

The finished site is output to the `dist` folder.

## Credits

The design is based on the [Apple-Style Portfolio](https://github.com/larry-xue/apple-style-portfolio) template by Yujian Xue, used under the MIT License.

## 양육 로드맵 페이지 고치기

첫 페이지와 과정별 페이지(`src/pages/index.html`, `src/pages/roadmap/*.html`)는 직접 고치지 않고 생성합니다.

1. 책 정보는 `scripts/roadmap-data.mjs`, 문장과 디자인은 `scripts/build-pages.mjs`에서 고칩니다.
2. `npm run pages`를 실행하면 페이지가 다시 만들어집니다.

이전 첫 페이지는 `backup/index.old.astro`에 보관해 두었습니다.
