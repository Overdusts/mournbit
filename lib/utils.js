// Format price with appropriate decimal places
export function formatPrice(price) {
  const num = parseFloat(price);
  if (num >= 1000) {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (num >= 1) {
    return '$' + num.toFixed(2);
  } else if (num >= 0.01) {
    return '$' + num.toFixed(4);
  } else if (num >= 0.0001) {
    return '$' + num.toFixed(6);
  } else {
    return '$' + num.toFixed(8);
  }
}

// Format percentage with sign
export function formatPercent(value) {
  const num = parseFloat(value);
  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(2) + '%';
}

// Format volume in abbreviated form (1.2M, 456K)
export function formatVolume(volume) {
  const num = parseFloat(volume);
  if (num >= 1e9) {
    return '$' + (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return '$' + (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return '$' + (num / 1e3).toFixed(2) + 'K';
  }
  return '$' + num.toFixed(2);
}

// Format funding rate
export function formatFunding(rate) {
  const num = parseFloat(rate);
  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(4) + '%';
}

// Get time ago string
export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return mins + (mins === 1 ? ' min ago' : ' mins ago');
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return hours + (hours === 1 ? ' hour ago' : ' hours ago');
  }
  const days = Math.floor(seconds / 86400);
  return days + (days === 1 ? ' day ago' : ' days ago');
}

// Remove USDT suffix from symbol
export function cleanSymbol(symbol) {
  return symbol.replace('USDT', '').replace('PERP', '');
}

// Interval mapping for Bybit API
export const INTERVAL_MAP = {
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1d': 'D'
};

// Get color class based on value
export function getColorClass(value) {
  const num = parseFloat(value);
  return num >= 0 ? 'text-gain' : 'text-loss';
}

// Shorten wallet address
export function shortenAddress(address) {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}
