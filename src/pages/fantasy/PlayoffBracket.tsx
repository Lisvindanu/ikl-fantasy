import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords } from 'lucide-react';
import type { IKLMatch } from '../../api/fantasy';

// ── Bracket round definitions ───────────────────────────────────────────────

const PLAYOFF_STAGES = new Set(['quarterfinal', 'semifinal', 'final', 'grand_final', 'playoff']);

const ROUND_ORDER: Record<string, number> = {
  quarterfinal: 0,
  playoff: 0,
  semifinal: 1,
  final: 2,
  grand_final: 2,
};

const ROUND_LABEL: Record<number, string> = {
  0: 'Quarterfinals',
  1: 'Semifinals',
  2: 'Grand Final',
};

// ── Match node component ────────────────────────────────────────────────────

function BracketNode({ match, index }: { match: IKLMatch; index: number }) {
  const hasWinner = !!match.winner_team_id;
  const t1Win = match.winner_team_id === match.team1_id;
  const t2Win = match.winner_team_id === match.team2_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="w-56 flex-shrink-0 rounded-xl overflow-hidden"
      style={{
        background: '#0d1017',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Team 1 */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: t1Win ? `${match.team1_color}10` : 'transparent',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-1.5 h-5 rounded-full flex-shrink-0"
            style={{ background: match.team1_color }}
          />
          <span
            className={`text-sm font-black truncate ${
              t1Win ? 'text-white' : hasWinner ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {match.team1_short}
          </span>
          {t1Win && <Trophy className="w-3 h-3 flex-shrink-0 text-amber-400" />}
        </div>
        <span
          className="text-sm font-black tabular-nums"
          style={{
            color: t1Win ? match.team1_color : hasWinner ? '#374151' : '#9CA3AF',
          }}
        >
          {match.team1_score}
        </span>
      </div>

      {/* Team 2 */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{
          background: t2Win ? `${match.team2_color}10` : 'transparent',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-1.5 h-5 rounded-full flex-shrink-0"
            style={{ background: match.team2_color }}
          />
          <span
            className={`text-sm font-black truncate ${
              t2Win ? 'text-white' : hasWinner ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {match.team2_short}
          </span>
          {t2Win && <Trophy className="w-3 h-3 flex-shrink-0 text-amber-400" />}
        </div>
        <span
          className="text-sm font-black tabular-nums"
          style={{
            color: t2Win ? match.team2_color : hasWinner ? '#374151' : '#9CA3AF',
          }}
        >
          {match.team2_score}
        </span>
      </div>

      {/* Status bar */}
      {match.status !== 'completed' && (
        <div
          className="px-3 py-1 text-center border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              match.status === 'live'
                ? 'text-red-400'
                : match.status === 'upcoming'
                  ? 'text-blue-400'
                  : 'text-yellow-400'
            }`}
          >
            {match.status === 'live' && '\u25CF '}
            {match.status}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ── Connector line between rounds ───────────────────────────────────────────

function RoundConnector() {
  return (
    <div className="flex flex-col items-center justify-center w-10 flex-shrink-0">
      <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
    </div>
  );
}

// ── Main bracket component ──────────────────────────────────────────────────

interface Props {
  matches: IKLMatch[];
}

export function PlayoffBracket({ matches }: Props) {
  const playoffMatches = useMemo(
    () => matches.filter((m) => PLAYOFF_STAGES.has(m.stage)),
    [matches],
  );

  const rounds = useMemo(() => {
    const byRound: Record<number, IKLMatch[]> = {};
    for (const m of playoffMatches) {
      const round = ROUND_ORDER[m.stage] ?? 0;
      if (!byRound[round]) byRound[round] = [];
      byRound[round].push(m);
    }
    // Sort matches within each round by match date or id
    for (const key of Object.keys(byRound)) {
      byRound[Number(key)].sort((a, b) => a.id - b.id);
    }
    return Object.entries(byRound)
      .map(([round, rMatches]) => ({
        round: Number(round),
        label: ROUND_LABEL[Number(round)] || `Round ${Number(round) + 1}`,
        matches: rMatches,
      }))
      .sort((a, b) => a.round - b.round);
  }, [playoffMatches]);

  if (playoffMatches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="py-16 text-center rounded-2xl max-w-md mx-auto"
        style={{
          background: '#0d1017',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Swords className="w-12 h-12 text-gray-800 mx-auto mb-4" />
        <p className="text-gray-400 font-black text-lg mb-2">
          Playoffs Haven't Started Yet
        </p>
        <p className="text-gray-600 text-sm leading-relaxed px-6">
          The playoff bracket will appear here once quarterfinal, semifinal, or final
          matches are scheduled.
        </p>
      </motion.div>
    );
  }

  let nodeIndex = 0;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-0 min-w-max px-2">
        {rounds.map((round, ri) => (
          <div key={round.round} className="flex items-stretch">
            {/* Round column */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4 flex items-center gap-1.5">
                {round.round === 2 && <Trophy className="w-3 h-3 text-amber-400" />}
                {round.label}
              </div>
              <div
                className="flex flex-col justify-around flex-1 gap-4"
              >
                {round.matches.map((m) => {
                  const idx = nodeIndex++;
                  return <BracketNode key={m.id} match={m} index={idx} />;
                })}
              </div>
            </div>

            {/* Connector to next round */}
            {ri < rounds.length - 1 && <RoundConnector />}
          </div>
        ))}
      </div>
    </div>
  );
}
