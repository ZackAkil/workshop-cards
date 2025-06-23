# Workshop Cards

[👉 View the live site](https://zackakil.github.io/workshop-cards/)

A modern, interactive card deck app for workshop facilitation, built with React and Vite. Cards are grouped by type (Base, Skilled, Advanced, Shiny), each with unique effects and vibrant, flat vector illustrations. The app is designed for clarity, engagement, and fun!

![App Screenshot](./app%20screenshot.png)

## Features

- **Card Decks:** Cards are grouped by rarity (Base, Skilled, Advanced, Shiny) with clear section dividers.
- **Special Cards:** "Shiny" cards stand out with a gold border and star icon.
- **Responsive UI:** Works beautifully on desktop and mobile.
- **Flat Design:** Clean, modern, and vibrant color palette with geometric illustrations.
- **Modal View:** Click a card to see it enlarged in a modal with a blurred background.
- **GitHub Pages Ready:** Easily deploy your deck as a static site.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Customization

- **Add/Edit Cards:** Edit `src/sampleData.js` to add or modify cards. Images should be placed in `public/cardImages/` and referenced as `/workshop-cards/cardImages/your-image.jpeg`.
- **Styling:** All styles are in `src/App.css` and use a flat, vibrant palette.
