import { useEffect, useState } from 'react';
import { FiClock, FiLayers } from 'react-icons/fi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function TimezoneCard({ friend1, friend2 }) {
  const [time1, setTime1] = useState('');
  const [time2, setTime2] = useState('');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [timeDiffText, setTimeDiffText] = useState('');

  const tz1 = friend1?.timezone;
  const tz2 = friend2?.timezone;

  useEffect(() => {
    if (!tz1 || !tz2) return;

    const updateClocks = () => {
      const now = dayjs();
      
      try {
        const local1 = now.tz(tz1);
        const local2 = now.tz(tz2);

        setTime1(local1.format('hh:mm:ss A'));
        setDate1(local1.format('dddd, MMM DD, YYYY'));

        setTime2(local2.format('hh:mm:ss A'));
        setDate2(local2.format('dddd, MMM DD, YYYY'));

        const offset1 = local1.utcOffset();
        const offset2 = local2.utcOffset();

        const diffMinutes = offset2 - offset1;
        const diffHours = diffMinutes / 60;

        if (diffHours === 0) {
          setTimeDiffText('Both friends are in the exact same timezone!');
        } else {
          const absDiff = Math.abs(diffHours);
          const formattedDiff = Number.isInteger(absDiff) ? absDiff : absDiff.toFixed(1);
          const relation = diffHours > 0 ? 'ahead of' : 'behind';
          setTimeDiffText(`Friend 2 is ${formattedDiff} hours ${relation} Friend 1.`);
        }
      } catch (err) {
        console.error('Timezone calculation failed:', err);
      }
    };

    updateClocks();
    const timer = setInterval(updateClocks, 1000);

    return () => clearInterval(timer);
  }, [tz1, tz2]);

  if (!friend1 || !friend2) return null;

  const formatOffset = (tz) => {
    try {
      const offsetMinutes = dayjs().tz(tz).utcOffset();
      const hours = Math.floor(Math.abs(offsetMinutes) / 60);
      const minutes = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? '+' : '-';
      return `UTC ${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const getSolarStatus = (tz) => {
    try {
      const local = dayjs().tz(tz);
      const hour = local.hour();
      const minute = local.minute();
      const timeVal = hour + minute / 60;
      
      const angle = 90 * Math.sin((timeVal - 6) * Math.PI / 12);
      
      if (angle > 40) {
        return { text: '☀️ Apex Day', angle: angle.toFixed(1), color: 'text-amber-400 bg-amber-500/5 border-amber-500/10' };
      } else if (angle > 10) {
        return { text: '☀️ Daylight', angle: angle.toFixed(1), color: 'text-yellow-400/80 bg-yellow-500/5 border-yellow-500/10' };
      } else if (angle >= 0) {
        return { text: '🌅 Golden Hour', angle: angle.toFixed(1), color: 'text-orange-400 bg-orange-500/5 border-orange-500/10' };
      } else if (angle > -12) {
        return { text: '🌌 Twilight', angle: angle.toFixed(1), color: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10' };
      } else {
        return { text: '🌙 Deep Night', angle: angle.toFixed(1), color: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/10' };
      }
    } catch {
      return { text: '☀️ Daylight', angle: '45.0', color: 'text-yellow-400/80 bg-yellow-500/5 border-yellow-500/10' };
    }
  };

  const solar1 = getSolarStatus(tz1);
  const solar2 = getSolarStatus(tz2);

  return (
    <div className="glass-panel p-6 h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-6 text-zinc-100 flex items-center gap-2">
          <FiClock className="w-5 h-5 text-orange-500" />
          Chronological Coordinates & Timezones
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-orange-500/[0.03] border border-orange-500/10 p-4 rounded-xl relative overflow-hidden">
            <span className="absolute top-1.5 right-2 text-[9px] font-mono text-orange-400/40 uppercase tracking-widest">LOCAL 1</span>
            <div className="text-xs font-bold text-orange-400 mb-1 truncate">{friend1.city || 'Friend 1'}</div>
            <div className="text-sm font-semibold text-zinc-400 truncate font-mono text-[11px] mb-2">{tz1}</div>
            <div className="text-2xl font-black font-mono text-white tracking-wider glow-orange my-1">
              {time1 || '00:00:00 AM'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{date1}</div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div className="text-xs font-semibold font-mono text-orange-400/60 bg-orange-500/5 px-2.5 py-1 rounded w-fit">
                {formatOffset(tz1)}
              </div>
              <div className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${solar1.color}`}>
                {solar1.text} ({solar1.angle >= 0 ? '+' : ''}{solar1.angle}°)
              </div>
            </div>
          </div>

          <div className="bg-amber-500/[0.03] border border-amber-500/10 p-4 rounded-xl relative overflow-hidden">
            <span className="absolute top-1.5 right-2 text-[9px] font-mono text-amber-400/40 uppercase tracking-widest">LOCAL 2</span>
            <div className="text-xs font-bold text-amber-400 mb-1 truncate">{friend2.city || 'Friend 2'}</div>
            <div className="text-sm font-semibold text-zinc-400 truncate font-mono text-[11px] mb-2">{tz2}</div>
            <div className="text-2xl font-black font-mono text-white tracking-wider glow-gold my-1">
              {time2 || '00:00:00 AM'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{date2}</div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div className="text-xs font-semibold font-mono text-amber-400/60 bg-amber-500/5 px-2.5 py-1 rounded w-fit">
                {formatOffset(tz2)}
              </div>
              <div className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${solar2.color}`}>
                {solar2.text} ({solar2.angle >= 0 ? '+' : ''}{solar2.angle}°)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-500/[0.04] border border-orange-500/10 p-3.5 rounded-xl flex items-center gap-2.5">
        <FiLayers className="w-5 h-5 text-orange-400 shrink-0" />
        <div className="text-xs font-medium text-zinc-300">
          <span className="text-orange-400 font-semibold block mb-0.5">Chronology Offset:</span>
          {timeDiffText || 'Calculating clock differentials...'}
        </div>
      </div>
    </div>
  );
}
