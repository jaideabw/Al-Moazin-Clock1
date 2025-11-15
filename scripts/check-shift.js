function computeShiftedDateForZone(now, zone) {
  const fmt = (tz) => new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(now);

  const get = (parts, t) => parts.find(p => p.type === t)?.value || '';

  const partsT = fmt(zone);
  const yT = Number(get(partsT, 'year'));
  const mT = Number(get(partsT, 'month'));
  const dT = Number(get(partsT, 'day'));
  const hhT = Number(get(partsT, 'hour'));
  const mmT = Number(get(partsT, 'minute'));
  const ssT = Number(get(partsT, 'second')) || 0;

  const partsU = fmt('UTC');
  const yU = Number(get(partsU, 'year'));
  const mU = Number(get(partsU, 'month'));
  const dU = Number(get(partsU, 'day'));
  const hhU = Number(get(partsU, 'hour'));
  const mmU = Number(get(partsU, 'minute'));
  const ssU = Number(get(partsU, 'second')) || 0;

  const targetAsIfUTC = Date.UTC(yT, (mT || 1)-1, dT||1, hhT||0, mmT||0, ssT||0);
  const utcAsParts = Date.UTC(yU, (mU || 1)-1, dU||1, hhU||0, mmU||0, ssU||0);
  const targetOffsetMs = targetAsIfUTC - utcAsParts;

  const systemOffsetMs = -now.getTimezoneOffset() * 60 * 1000;
  const shiftMs = targetOffsetMs - systemOffsetMs;
  const adjusted = new Date(now.getTime() + shiftMs);
  return { now: now.toString(), zone, adjusted: adjusted.toString(), adjustedISO: adjusted.toISOString() };
}

const now = new Date();
console.log(computeShiftedDateForZone(now, 'Asia/Amman'));
console.log(computeShiftedDateForZone(now, 'Asia/Dubai'));
console.log(computeShiftedDateForZone(now, 'UTC'));
