# Mournbit 📉📈

> **Advanced Crypto Trading Terminal & Real-time Market Analytics Bot**

Mournbit is a comprehensive crypto analytics suite that bridges the gap between professional web-based charting and accessible community tools. It consists of a high-performance Next.js web terminal for deep analysis and a Python-powered Discord bot for instant market updates and signals.

## ✨ Features

### 🖥️ Web Terminal
- **Real-time Charting**: Powered by TradingView's Lightweight Charts for smooth, responsive price tracking.
- **Modern UI/UX**: Built with a "Bento Grid" layout using Glassmorphism design principles, TailwindCSS, and Framer Motion for premium aesthetics.
- **Deep Analytics**: View detailed symbol information, market mapping, and portfolio integration.
- **Non-Custodial**: Connect wallets securely to view assets without giving up custody (Planned/In-Progress).

### 🤖 Discord Bot
- **Interactive Dashboard**: Use the `/market` command to launch a fully interactive GUI within Discord.
- **Live Market Data**: Fetches real-time data from **Bybit V5 API (Linear Perps)**.
- **Top Movers**: Instantly view Top Gainers and Losers across multiple timeframes (1D, 4H, etc.).
- **Funding Rates**: Track the highest positive and negative funding rates to spot short/squeeze opportunities.

## 🛠️ Tech Stack

### Frontend (Web App)
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS, CSS Modules
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Charting**: Lightweight Charts
- **Auth**: NextAuth.js

### Backend (Bot)
- **Language**: Python 3.9+
- **Library**: Discord.py (Commands Extension)
- **Networking**: Aiohttp (Async Requests)
- **Environment**: Dotenv

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- A Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mournbit.git
   cd mournbit
   ```

2. **Frontend Setup**
   Install the dependencies for the Next.js app:
   ```bash
   npm install
   ```

3. **Bot Setup**
   Navigate to the bot directory and install Python dependencies:
   ```bash
   cd bot
   pip install -r requirements.txt
   # OR individually:
   pip install discord.py aiohttp python-dotenv
   ```

### Configuration

Create a `.env` file in the root directory (or `.env.local` for Next.js) and populate it. You also need a `.env` inside the `bot/` folder for the Python bot.

**Bot `.env` (`bot/.env`):**
```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=your_guild_id_here
```

**App `.env`:**
```env
# Add any necessary API keys for the web app here if applicable
```

## ⚡ Usage

### Running the Web App
Start the Next.js development server: 
```bash
npm run dev
```
Visit `http://localhost:3000` to view the application.

### Running the Bot
Open a new terminal, navigate to the `bot` folder, and run:
```bash
python bot.py
```
*Note: Ensure you have invited the bot to your server with the correct scopes and permissions.*

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


