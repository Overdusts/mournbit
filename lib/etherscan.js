import axios from 'axios';

// Tracked wallets with metadata - these are known active trading wallets
export const TRACKED_WALLETS = [
  {
    address: '0x9c5083dd4838e120dbeac44c052179692aa5dac5',
    label: 'Smart Trader #1',
    winRate: 73,
    style: 'Memecoin specialist',
    chain: 'eth'
  },
  {
    address: '0x3ddfa8ec3052539b6c9549f12cea2c295cff5296',
    label: 'DeFi Whale',
    winRate: 68,
    style: 'DeFi accumulator',
    chain: 'eth'
  },
  {
    address: '0x5a52e96bacdabb82fd05763e25335261b270efcb',
    label: 'MEV Bot Tracker',
    winRate: 81,
    style: 'High frequency',
    chain: 'eth'
  },
  {
    address: '0x1db3439a222c519ab44bb1144fc28167b4fa6ee6',
    label: 'Token Sniper',
    winRate: 65,
    style: 'New token entries',
    chain: 'eth'
  },
  {
    address: '0x8249cd1275a519ce879e4b6fd3411c1de2a2f1c1',
    label: 'Swing Trader',
    winRate: 70,
    style: 'Mid-term holds',
    chain: 'eth'
  }
];

// Known token addresses for common tokens
const TOKEN_INFO = {
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT', decimals: 6 },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', decimals: 6 },
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': { symbol: 'PEPE', decimals: 18 },
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': { symbol: 'SHIB', decimals: 18 },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { symbol: 'WBTC', decimals: 8 },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH', decimals: 18 },
  '0x514910771af9ca656af840dff83e8264ecf986ca': { symbol: 'LINK', decimals: 18 },
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': { symbol: 'UNI', decimals: 18 },
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': { symbol: 'AAVE', decimals: 18 },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI', decimals: 18 }
};

// Fetch recent transactions for a wallet
export async function getWalletTransactions(address, chain = 'eth') {
  const apiKey = process.env.ETHERSCAN_API_KEY;

  // If no API key, return empty to trigger mock data
  if (!apiKey || apiKey === 'your_etherscan_api_key_here') {
    console.log('No Etherscan API key configured, using mock data');
    return [];
  }

  const baseUrl = chain === 'eth'
    ? 'https://api.etherscan.io/api'
    : 'https://api.bscscan.com/api';

  try {
    // Get token transfers
    const response = await axios.get(baseUrl, {
      params: {
        module: 'account',
        action: 'tokentx',
        address,
        page: 1,
        offset: 20,
        sort: 'desc',
        apikey: apiKey
      },
      timeout: 10000
    });

    if (response.data.status !== '1') {
      console.error('Etherscan API error:', response.data.message);
      return [];
    }

    return response.data.result || [];
  } catch (error) {
    console.error('Error fetching wallet transactions:', error.message);
    return [];
  }
}

// Parse transaction to determine action
export function parseTransaction(tx, walletAddress) {
  const isBuy = tx.to.toLowerCase() === walletAddress.toLowerCase();
  const tokenSymbol = TOKEN_INFO[tx.contractAddress?.toLowerCase()]?.symbol || tx.tokenSymbol || 'TOKEN';
  const decimals = TOKEN_INFO[tx.contractAddress?.toLowerCase()]?.decimals || parseInt(tx.tokenDecimal) || 18;

  const value = parseFloat(tx.value) / Math.pow(10, decimals);
  const timestamp = parseInt(tx.timeStamp) * 1000;

  return {
    action: isBuy ? 'Bought' : 'Sold',
    token: tokenSymbol,
    amount: value,
    timestamp,
    hash: tx.hash,
    from: tx.from,
    to: tx.to
  };
}

// Get wallet activity with context
export async function getWalletActivity(wallet) {
  const transactions = await getWalletTransactions(wallet.address, wallet.chain);

  if (!transactions || transactions.length === 0) {
    return {
      ...wallet,
      transactions: [],
      recentAction: null,
      pattern: 'No recent activity'
    };
  }

  const parsedTxs = transactions
    .map(tx => parseTransaction(tx, wallet.address))
    .slice(0, 5);

  // Analyze pattern
  const buyCount = parsedTxs.filter(tx => tx.action === 'Bought').length;
  const sellCount = parsedTxs.filter(tx => tx.action === 'Sold').length;

  let pattern = 'Mixed activity';
  if (buyCount > sellCount * 2) pattern = 'Accumulating';
  else if (sellCount > buyCount * 2) pattern = 'Taking profit';
  else if (buyCount === 0 && sellCount > 0) pattern = 'Exiting positions';
  else if (sellCount === 0 && buyCount > 0) pattern = 'Building positions';

  return {
    ...wallet,
    transactions: parsedTxs,
    recentAction: parsedTxs[0] || null,
    pattern
  };
}

// Get all tracked wallets activity
export async function getAllWalletsActivity() {
  const results = await Promise.all(
    TRACKED_WALLETS.map(wallet => getWalletActivity(wallet))
  );

  return results.filter(r => r.recentAction !== null);
}

// Generate realistic mock data for demo purposes
export function generateMockWalletData() {
  const tokens = ['WETH', 'USDC', 'LINK', 'UNI', 'AAVE', 'PEPE', 'WBTC'];
  const actions = ['Bought', 'Sold'];
  const patterns = ['Accumulating', 'Taking profit', 'Mixed activity', 'Building positions'];

  return TRACKED_WALLETS.map((wallet, index) => {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    // Generate realistic amounts based on token type
    let amount;
    if (token === 'WBTC') {
      amount = Math.random() * 2 + 0.1; // 0.1 - 2.1 WBTC
    } else if (token === 'WETH') {
      amount = Math.random() * 50 + 1; // 1 - 51 WETH
    } else if (token === 'USDC' || token === 'USDT') {
      amount = Math.random() * 50000 + 1000; // 1K - 51K USDC
    } else if (token === 'PEPE') {
      amount = Math.random() * 1000000000 + 10000000; // 10M - 1B PEPE
    } else {
      amount = Math.random() * 1000 + 10; // 10 - 1010 tokens
    }

    return {
      ...wallet,
      transactions: [],
      recentAction: {
        action,
        token,
        amount,
        timestamp: Date.now() - Math.random() * 7200000 // Last 2 hours
      },
      pattern: patterns[Math.floor(Math.random() * patterns.length)]
    };
  });
}

// Format transaction value
export function formatTxValue(value, token) {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B ${token}`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M ${token}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K ${token}`;
  } else if (value >= 1) {
    return `${value.toFixed(2)} ${token}`;
  } else {
    return `${value.toFixed(6)} ${token}`;
  }
}
