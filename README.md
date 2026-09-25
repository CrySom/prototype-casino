# prototype-casino

Static HTML/CSS layout of the mobile home page from Figma
(`crypto-casino`, node `3049:261603`, frame "320").

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

Open `index.html` in a browser (mobile viewport, 320–480 px).
