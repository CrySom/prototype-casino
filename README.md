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

- `index.html` – home page; `casino.html`, `sport.html`, `prediction.html` – game halls
- `css/halls.css` – styles of the game halls
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

Open `index.html` in a browser (mobile viewport, 320–480 px).

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

Play flow (Figma "Entrance - Sign Up - Log In", Game Page `389:253407`):

- **Game card** – a tap on any game tile opens the card: game tile, name and
  provider, Demo / Play buttons, favourite star and the "Game currency" field
  with its list (the choice is kept in `localStorage`). On mobile the card drops
  down under the header, on desktop it is a centred pop-up. For guests Play opens
  Log in.
- **Game page** (`game.html`) – the slot header: for guests the logo and
  Sign in / Sign up; when logged in close, the current crypto currency (opens
  the balance dropdown), Wallet and a favourite star. `?demo=1` adds a "Demo"
  label. The game is a screenshot shown in full width on mobile and fitted to
  the screen from 768px.

Differences from Figma: texts are in English, the game currency list uses
English names and currency symbols; the game card on desktop and the game page
from 768px have no Figma layout and follow the mobile one.
