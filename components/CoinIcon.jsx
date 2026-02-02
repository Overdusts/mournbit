'use client';
import { useState, useEffect } from 'react';

// Comprehensive symbol to CoinGecko ID mapping
const COINGECKO_MAP = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'sol': 'solana',
    'bnb': 'binancecoin',
    'xrp': 'ripple',
    'ada': 'cardano',
    'avax': 'avalanche-2',
    'doge': 'dogecoin',
    'dot': 'polkadot',
    'matic': 'matic-network',
    'pol': 'matic-network',
    'shib': 'shiba-inu',
    'trx': 'tron',
    'ltc': 'litecoin',
    'link': 'chainlink',
    'atom': 'cosmos',
    'uni': 'uniswap',
    'etc': 'ethereum-classic',
    'xlm': 'stellar',
    'near': 'near',
    'apt': 'aptos',
    'arb': 'arbitrum',
    'op': 'optimism',
    'sui': 'sui',
    'sei': 'sei-network',
    'inj': 'injective-protocol',
    'ftm': 'fantom',
    'sand': 'the-sandbox',
    'mana': 'decentraland',
    'axs': 'axie-infinity',
    'aave': 'aave',
    'crv': 'curve-dao-token',
    'mkr': 'maker',
    'snx': 'synthetix-network-token',
    'comp': 'compound-governance-token',
    'ldo': 'lido-dao',
    'rpl': 'rocket-pool',
    'grt': 'the-graph',
    'fil': 'filecoin',
    'vet': 'vechain',
    'algo': 'algorand',
    'hbar': 'hedera-hashgraph',
    'icp': 'internet-computer',
    'flow': 'flow',
    'egld': 'elrond-erd-2',
    'theta': 'theta-token',
    'kava': 'kava',
    'rune': 'thorchain',
    'zec': 'zcash',
    'xmr': 'monero',
    'eos': 'eos',
    'xtz': 'tezos',
    'neo': 'neo',
    'cake': 'pancakeswap-token',
    'sushi': 'sushi',
    '1inch': '1inch',
    'ape': 'apecoin',
    'blur': 'blur',
    'pepe': 'pepe',
    'floki': 'floki',
    'bonk': 'bonk',
    'wif': 'dogwifcoin',
    'meme': 'memecoin',
    'ordi': 'ordinals',
    'sats': 'sats-ordinals',
    'rats': 'rats-ordinals',
    'rndr': 'render-token',
    'fet': 'fetch-ai',
    'agix': 'singularitynet',
    'ocean': 'ocean-protocol',
    'ar': 'arweave',
    'stx': 'blockstack',
    'imx': 'immutable-x',
    'gmx': 'gmx',
    'dydx': 'dydx',
    'lrc': 'loopring',
    'ens': 'ethereum-name-service',
    'ksm': 'kusama',
    'rose': 'oasis-network',
    'zil': 'zilliqa',
    'qtum': 'qtum',
    'waves': 'waves',
    'ont': 'ontology',
    'one': 'harmony',
    'ankr': 'ankr',
    'chz': 'chiliz',
    'gala': 'gala',
    'enj': 'enjincoin',
    'bat': 'basic-attention-token',
    'celo': 'celo',
    'cfx': 'conflux-token',
    'jasmy': 'jasmy',
    'mask': 'mask-network',
    'skl': 'skale',
    'storj': 'storj',
    'audio': 'audius',
    'bal': 'balancer',
    'band': 'band-protocol',
    'bnt': 'bancor',
    'celr': 'celer-network',
    'ctsi': 'cartesi',
    'cvx': 'convex-finance',
    'mina': 'mina-protocol',
    'wld': 'worldcoin-wld',
    'jto': 'jito-governance-token',
    'pyth': 'pyth-network',
    'tia': 'celestia',
    'neiro': 'neiro-on-eth',
    'neiroeth': 'neiro-on-eth',
    'popcat': 'popcat',
    'wld': 'worldcoin-wld',
    'strk': 'starknet',
    'zk': 'zksync',
    'not': 'notcoin',
    'ton': 'the-open-network',
    'dogs': 'dogs-2',
    'turbo': 'turbo',
    'brett': 'brett',
    'bome': 'book-of-meme',
    'ena': 'ethena',
    'pendle': 'pendle',
    'jup': 'jupiter-exchange-solana',
    'w': 'wormhole',
    'pixel': 'pixels',
    'aevo': 'aevo-exchange',
    'ethfi': 'ether-fi',
    'io': 'io-net',
    'bb': 'bouncebit',
    'omni': 'omni-network',
    'rez': 'renzo',
    'lista': 'lista-dao',
    'zro': 'layerzero',
    'kas': 'kaspa',
    'ondo': 'ondo-finance',
    'mew': 'cat-in-a-dogs-world',
    'mother': 'mother-iggy',
    'ponke': 'ponke',
    'kmno': 'kamino',
    'wen': 'wen-4',
    'prcl': 'parcl',
    'tnsr': 'tensor',
    'myro': 'myro',
};

export default function CoinIcon({ symbol, className = "w-8 h-8", fallbackClass = "bg-white/5 text-muted" }) {
    const [imgSrc, setImgSrc] = useState(null);
    const [fallbackIndex, setFallbackIndex] = useState(0);
    const [useText, setUseText] = useState(false);

    // Clean symbol
    const cleanSymbol = (s) => {
        if (!s) return '';
        let clean = s.toLowerCase();
        if (clean.startsWith('1000')) clean = clean.substring(4);
        clean = clean.replace(/usdt$/, '').replace(/perp$/, '').replace(/usd$/, '');
        return clean;
    };

    const getImageSources = (sym) => {
        const geckoId = COINGECKO_MAP[sym] || sym;

        return [
            // CoinGecko (most reliable)
            `https://assets.coingecko.com/coins/images/1/small/${geckoId}.png`,
            // CoinCap
            `https://assets.coincap.io/assets/icons/${sym}@2x.png`,
            // CryptoLogos API
            `https://cryptologos.cc/logos/${geckoId}-${sym}-logo.png`,
            // CoinIcons (GitHub)
            `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${sym}.png`,
            // Binance
            `https://cdn.jsdelivr.net/gh/nicajonh/crypto-icons/images/${sym}.png`,
        ];
    };

    useEffect(() => {
        const sym = cleanSymbol(symbol);
        if (!sym) {
            setUseText(true);
            return;
        }

        setFallbackIndex(0);
        setUseText(false);

        const sources = getImageSources(sym);
        setImgSrc(sources[0]);
    }, [symbol]);

    const handleError = () => {
        const sym = cleanSymbol(symbol);
        const sources = getImageSources(sym);
        const nextIndex = fallbackIndex + 1;

        if (nextIndex < sources.length) {
            setFallbackIndex(nextIndex);
            setImgSrc(sources[nextIndex]);
        } else {
            setUseText(true);
        }
    };

    if (useText || !imgSrc) {
        const sym = cleanSymbol(symbol);
        return (
            <div className={`${className} flex items-center justify-center rounded-full font-bold text-[9px] uppercase tracking-wide border border-white/10 ${fallbackClass}`}>
                {sym?.slice(0, 3) || '?'}
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={symbol}
            className={`${className} rounded-full object-cover bg-black/50`}
            onError={handleError}
            loading="lazy"
        />
    );
}
