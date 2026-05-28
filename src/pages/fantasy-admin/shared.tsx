import React from 'react';

export const STAGES = ['regular', 'quarterfinal', 'semifinal', 'final'];
export const STAGE_LABEL: Record<string, string> = {
  regular: 'Regular Season',
  quarterfinal: 'Quarterfinal',
  semifinal: 'Semifinal',
  final: 'Grand Final',
};

export interface StatRow {
  playerId: number;
  kills: number;
  deaths: number;
  assists: number;
  isMvp: boolean;
  hasPentaKill: boolean;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="px-3 py-2 rounded-lg text-white text-sm outline-none"
      style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)', ...props.style }}
    />
  );
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="px-3 py-2 rounded-lg text-white text-sm outline-none"
      style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }}>
      {children}
    </select>
  );
}
