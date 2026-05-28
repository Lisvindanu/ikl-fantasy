import { useState, useEffect } from 'react';
import { Award, Lock, Trophy, Target, Users, Zap, Star, Heart, Sparkles } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { Achievement } from '../../api/fantasy';

const ICON_MAP: Record<string, React.ReactNode> = {
  draft:   <Users    className="w-6 h-6" />,
  predict: <Target   className="w-6 h-6" />,
  league:  <Trophy   className="w-6 h-6" />,
  chip:    <Zap      className="w-6 h-6" />,
  rank:    <Star     className="w-6 h-6" />,
  loyalty: <Heart    className="w-6 h-6" />,
  special: <Sparkles className="w-6 h-6" />,
};

const ICON_COLOR: Record<string, string> = {
  draft:   '#3B82F6',
  predict: '#A855F7',
  league:  '#F59E0B',
  chip:    '#22C55E',
  rank:    '#EAB308',
  loyalty: '#EC4899',
  special: '#F97316',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface Props {
  isAuthenticated: boolean;
}

export function AchievementsPanel({ isAuthenticated }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fantasyApi.getAchievements()
      .then(data => setAchievements(Array.isArray(data) ? data : []))
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center rounded-2xl"
        style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Award className="w-12 h-12 text-gray-800 mx-auto mb-3" />
        <p className="text-gray-500 font-bold mb-1">Login to view achievements</p>
        <p className="text-gray-700 text-sm">Track your progress and unlock rewards</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: '#1a1d27' }} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: '#1a1d27' }} />
          ))}
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl px-5 py-5"
        style={{ background: 'linear-gradient(135deg, #F59E0B10 0%, #0d1017 60%)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg font-black text-white">Achievements</h2>
          </div>
          <span className="text-sm font-bold text-amber-400">{unlockedCount}/{totalCount} unlocked</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1a1d27' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map(a => {
          const color = ICON_COLOR[a.icon] || '#6B7280';
          const icon = ICON_MAP[a.icon] || <Award className="w-6 h-6" />;

          if (!a.unlocked) {
            return (
              <div key={a.type}
                className="relative rounded-xl px-4 py-4 flex flex-col items-center text-center"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative mb-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#374151' }}>
                    {icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Lock className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-600 mb-0.5">{a.label}</p>
                <p className="text-[10px] text-gray-700 leading-tight">{a.desc}</p>
              </div>
            );
          }

          return (
            <div key={a.type}
              className="relative rounded-xl px-4 py-4 flex flex-col items-center text-center overflow-hidden"
              style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${color}, transparent)` }} />
              <div className="relative mb-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: `${color}20`, color }}>
                  {icon}
                </div>
              </div>
              <p className="text-xs font-bold text-white mb-0.5">{a.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight mb-1">{a.desc}</p>
              {a.unlocked_at && (
                <span className="text-[9px] font-bold uppercase tracking-wider mt-auto" style={{ color }}>
                  {timeAgo(a.unlocked_at)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
