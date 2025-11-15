const zones = ['UTC', 'Asia/Amman', 'Asia/Dubai'];
const now = new Date();
console.log('System local time:', now.toString());
console.log('ISO UTC:', now.toISOString());

for (const z of zones) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: z,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const parts = fmt.formatToParts(now);
  const get = (t) => parts.find(p => p.type === t)?.value || '';
  const y = get('year'), m = get('month'), d = get('day');
  const hh = get('hour'), mm = get('minute'), ss = get('second');
  console.log(`${z}: ${y}-${m}-${d} ${hh}:${mm}:${ss}`);
}

// Show offset difference between Amman and Dubai
const fmtAmman = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Amman', hour: '2-digit', hour12: false });
const fmtDubai = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', hour12: false });
console.log('Amman hour:', fmtAmman.format(now));
console.log('Dubai hour:', fmtDubai.format(now));
console.log('If Dubai - Amman =', Number(fmtDubai.format(now)) - Number(fmtAmman.format(now)), 'hours');
