# prototype-casino

Static HTML/CSS layout of the home page from Figma (`crypto-casino`).

The page is fluid:

- **320–1023px** – mobile layout, frame "320" (`3049:261603`), bottom tab bar.
- **1024px+** – desktop layout, frames "1280" / "1920" (`1398:34085`,
  `1411:67717`) with the side menu collapsed (72px), and "1280 opened" /
  "1920 opened" (`1418:88148`, `1418:90887`) with it opened (210px).
  The menu is opened by default on screens wider than 1280px and collapsed
  up to 1280px. The ⋮ button (or the search field) opens it, the logo
  collapses it; once toggled, the choice is kept in `localStorage`. Between the frames rows of
  fixed-size tiles scroll horizontally and cards/banners stretch.

- `index.html` – markup
- `css/styles.css` – styles (design tokens as CSS variables on `:root`)
- `js/main.js` – carousel pagination, tabs, coefficient selection
- `assets/img/` – images and icons exported from Figma

## Assets

Images are downloaded from the Figma MCP asset server:

```sh
./scripts/fetch-figma-assets.sh
```

The list of files and their source URLs is in `scripts/figma-assets.txt`.
The URLs expire about 7 days after they were issued (2026-09-25); after that
they have to be re-exported from Figma.

`tab-chat.png` is not in the list: Figma exports that icon's vector with a
broken stroke, so it is cropped from a 4× PNG render of the bottom tab bar
(node `3049:261648`) with the background made transparent.

`sb-flag.png` (league flag in the opened menu) is cropped the same way from a
4× render of the desktop menu (node `1418:88150`): Figma exports it as 20
masked layers.

Registration pop-up (Figma file "Entrance - Sign Up - Log In", frames
`87:45267`, `76:80830`, `86:44644`) opens from the Sign up / Sign in buttons.
It is a prototype: a click or tap on a field fills it with demo data,
"I have a promocode" reveals the promo field, the eye shows the password, and
"Registration" is enabled once email, password, date of birth and the 18+
checkbox are done. The input icons come from the empty frame, because Figma
exports the filled frame with the wrong (instance-swapped) icons.

Team crests in the Sport cards (`team-manchester-united.svg`,
`team-newcastle-united.svg`) are not from Figma (the design has an empty
placeholder there): they are the club logos from Wikipedia, shown in
grayscale; they are trademarks of the clubs and only stand in for real data.

Known differences from Figma:

- the VIP banner image uses a WebGPU lens-distortion shader in Figma; here it
  is the plain image, as on mobile;
- the desktop banner uses progressive blur in Figma; the photo imitates it
  with two masked copies, the thin triangle lines are exported with a uniform
  38px blur and are therefore almost invisible.

Open `index.html` in a browser (mobile viewport, 320–480 px).
