'use client';

const TIMEFRAMES = [
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
];

export default function TimeframeSelector({ selected, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[#0a0e14] border border-[#252d38]">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onChange(tf.value)}
          className={`relative px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
            selected === tf.value
              ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-black shadow-lg shadow-[#00d4aa]/25'
              : 'text-[#6e7681] hover:text-white hover:bg-[#1a222c]'
          }`}
        >
          {tf.label}
          {selected === tf.value && (
            <span className="absolute inset-0 rounded-lg bg-[#00d4aa]/20 blur-sm -z-10"></span>
          )}
        </button>
      ))}
    </div>
  );
}
