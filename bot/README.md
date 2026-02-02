# Discord Bot Setup
This folder contains the Mournbit Discord Bot.

## Setup
1. Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Copy the **Token**.
3. Create a `.env` file in the root `f:\TOOLS\mournbit` (or add to existing) with:
   ```
   DISCORD_TOKEN=your_token_here
   ```

## Running the Bot
From the root directory:
```bash
node bot/index.js
```

## Features
- `!p [symbol]` (e.g., `!p BTC`): Shows price, 24h change, and a sparkline chart.
- `!funding`: Shows funding rate heatmap.
- **Buttons**: Every price card has a 'Refresh' and 'Trade' button.
