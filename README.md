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

- `index.html` – start screen: Prototype and UI Design Concepts
- `home.html` – prototype home page; `casino.html`, `sport.html`, `prediction.html` – game halls
- `concepts.html` – UI Design Concepts: previews of the home page concepts (file "crypto-casino", NEW `2950:223386`; mobile only), a fifth slot is reserved; `concept-1…4.html` – one concept in full length with previous / next. The concepts are shown as exported renders and keep their colours (the black-and-white filter of the prototype is off there).
- `css/halls.css` – styles of the game halls
- `css/styles.css` – styles (design tokens as CSS variables on `:root`)
- `js/main.js` – carousel pagination, tabs, coefficient selection
- `assets/img/` – images and icons exported from Figma

## Password screen

Every page first shows a password screen (`js/gate.js`, `css/gate.css`); after
the right password the browser remembers it (`localStorage` key
`proto-access`, remove it to see the screen again). Only a hash of the password
is in the code. This is a front-end gate for casual visitors, not real
protection – for that use Vercel Password Protection or a server-side check.

## Performance (iPhone)

- Raster images are WebP, sized to about 2× of their largest size on screen
  (the Figma exports were up to 1555–1908 px for 40–270 px slots), 9.4 MB → 2.9 MB.
- Prototype pictures are stored already in greyscale, so the black-and-white
  filter is applied only to SVG icons; the UI Design Concepts keep their colours.
- Pictures load lazily (`loading="lazy"`, `decoding="async"`).
- No `backdrop-filter` blur inside the game tiles and tile labels (it made
  scrolling slow on iOS with 100+ tiles per page).

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

Log in / Sign up pop-up (Figma file "Entrance - Sign Up - Log In": log in
`14:29988`, `94:85822`, `14:30508`, `94:90151`; sign up `87:45267`,
`76:80830`, `86:44644`). "Sign in" in the header opens Log in, "Sign up" opens
Create account, the tabs switch between them. On mobile the card sits 20px
from the top, from 1024px it is centred over a rgba(18,18,18,.85) overlay.
It is a prototype: a click or tap on a field fills it with demo data,
"I have a promocode" reveals the promo field, the eye shows the password.
"Log In" enables once email and password are filled, "Registration" also
needs the date of birth and the 18+ checkbox. The input icons come from the
empty frames, because Figma exports the filled frames with the wrong
(instance-swapped) icons.

Logged-in page (same Figma file: mobile `630:31363`, tablet `630:31750`,
desktop `630:31482`, story `630:32054`). A successful "Log In" or
"Registration" adds `html.is-auth` (kept in `localStorage`, key `auth`); the
avatar menu in the header has "Log out". Logged in, the page is the same home
page with:

- header: balance (USDT), wallet, notifications and profile instead of
  Sign up / Sign in;
- stories row and player card (VIP progress) instead of the promo banners;
  a story opens full screen on mobile and as a 402×874 card on desktop,
  plays 5 slides of 5 s, taps on the left / right half go back / forward;
- "Continue" and "Originals" rows before Slots, table names on the Casino
  live tiles;
- "Favorite Events" and "My Bets" at the top of the desktop menu;
- the legal footer (policies, licence text, 18+, GambleAware, licence seal
  placeholder) instead of the payment methods footer; no VIP banner on
  mobile.

`player-avatar.svg` combines the avatar circle and the masked silhouette
from the player card (Figma exports them as separate layers with a mask).

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

Open `index.html` (start screen) or `home.html` in a browser (mobile viewport, 320–480 px).

Game halls (Figma file "Entrance - Sign Up - Log In": Casino `823:268537`,
Sport `823:268844`, Prediction `823:269180`). The thematic cards of the home
page, the Casino / Sport / Prediction tabs of the menu and the bottom tab bar
link to them; the logo leads back home. All pages are generated from the same
parts (menu, header, footer, pop-ups).

- **Casino** – category tabs, game grids of whole rows (5 columns, 6 from
  ~1240px of content) with "Load more", tile labels (New / Exclusive /
  Freespins), category chips, Casino Live, bonuses & tournaments with a
  running countdown. From 1920 the content is a centred 1280px column.
- **Prediction** – bet menu, markets in 1/2/3 columns filtered by the
  category tabs, betslip with stake / Max / potential winnings (on mobile the
  stake form opens under the tapped outcome), welcome bonus widget.
- **Sport** – bet menu, sport tabs, left column (time filter, tournaments,
  countries, sports), tips, live leagues, express betslip (picks multiply the
  odds, quick amounts, one pick per event; on mobile it is a bottom sheet
  opened from the floating "Betslip" button), Live TV, side banners; mobile
  blocks: top events, popular live, hot bets, jackpot, popular sport, trends,
  express of the day with its own stake form.

Differences from Figma: texts are in English and currencies are $; the desktop
category chips of Casino use the mobile tile layout (the desktop Figma tiles
are 40px high and clip their content); the bonus counters keep the 20% opacity
of Figma and light up on hover; team crests in the sport cards are the two club
logos used on the home page.

Wallet (Figma file "Wallet", `334:418761`), available on every page when
logged in:

- **Balance dropdown** – the arrow next to the header balance opens a list of
  currencies with search ("No currencies found" state); picking a currency
  shows it in the header. Buttons: Wallet, Balance Settings, Deposit.
- **Hidden balance** – the eye in the header replaces all amounts (header,
  dropdown, Wallet) with `******`.
- **Wallet** – total real balance in the chosen fiat, list of currencies.
- **Balance Settings** – "Hide Zero Balances" and "Display Crypto in Fiat"
  (fiat list with search and recently used currencies). With a fiat selected
  the header and the dropdown show the amounts in that fiat.
- State (currency, hidden balance, settings) is kept in `localStorage`.

Differences from Figma: the demo currencies differ (Figma repeats USDC), the
fiat descriptions are English; Buy Crypto / Swap tabs, Deposit and Withdraw are
placeholders; on mobile Balance Settings and the fiat list are bottom sheets.

Game page (`game.html`, file "crypto-casino", Real and demo mode `3369:293780`):
a tap on any game tile first opens the game card (Game Page `389:253407`: tile,
name, Demo / Play, "Game currency" with its list); Demo opens the game in demo
mode, Play in money mode (guests are asked to log in).

- **Header** – current crypto currency (opens the balance dropdown), Wallet,
  favourite star and close (back to the previous page); guests see Sign in /
  Sign up instead.
- **Demo mode** – "You are playing in demo mode now" and "Play real mode" under
  the game (for guests it opens Log in). `?demo=1` opens a demo for a logged-in
  player too.
- **Money mode** – the bottom tab bar under the game (Menu opens the menu).
- The game is a screenshot: full width on mobile, fitted to the screen from
  768px.

Differences from Figma: the texts inside the game screenshot are part of the
game image and stay as they are; there is no desktop layout in the file.

Profile (`profile.html`, built from the provided mockup with the Style Guide
Molecules "Profile components"): the avatar in the header opens it;
the Menu tab of the bottom bar is active on it.

- **Personal data** – player card with the level avatar, VIP progress and
  stats; balance card (total in the display fiat, eye to hide amounts, currency
  chip opening the fiat list, real balance / bonuses / free bet with info
  tooltips, Withdraw, Deposit, View wallet); My activity, Security and
  Safety & Privacy cells; Log out (goes to the home page as a guest).
- **Gaming profile** – level + progress block ("Level + progress in profile"),
  favourite games, recent bets.
- Guests see a prompt to log in. Two columns from 1280px (cards on the left,
  sticky), player and balance side by side from 768px.

Differences from the mockup: the level avatar from the style guide replaces the
empty circle; outline icons for the cells are drawn for the prototype
(`pf-*.svg`); the Gaming profile content is not in the mockup.

Menu (Style Guide Molecules "Menu" `38158:16243`): the menu has a version per
section – Casino (saved games, Casino Games, Live Casino Games), Sport (sports
and leagues) and Prediction (prediction categories) – plus the common
promotions / chat blocks. Each page opens its own section (home and profile:
Casino); the Casino / Sport / Prediction tabs switch the menu in place. On
desktop it is the sidebar; below 1024px the Menu tab of the bottom bar opens it
as a screen between the header and the tab bar (tap Menu again or Esc to close).

Differences from Figma: the items of the collapsed "Live Casino Games" group
are made up; menu items lead to the matching hall page.

Desktop menu behaviour (Style Guide Molecules "Desktop menu" `1138:146031`):
a "<<" / ">>" handle on the edge of the menu (on hover) collapses and expands
it; in the collapsed menu "⋮" opens the list of sections (Casino / Sport /
Prediction), an item shows its name on hover, counters become badges on the
icons and the Casino Games list stays visible; the EN button opens the language
list in two columns (also in the mobile menu, the choice is remembered).

Differences from Figma: languages are marked with a code instead of a flag and
the list has no repeats; the right drawer of the file has no content yet and is
not used.
