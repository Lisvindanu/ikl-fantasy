import React from 'react';

export const STAGES = ['regular', 'quarterfinal', 'semifinal', 'ub-semi', 'ub-final', 'lb-semi', 'lb-final', 'grand-final', 'final'];
export const STAGE_LABEL: Record<string, string> = {
  regular: 'Regular Season',
  quarterfinal: 'Quarterfinal',
  semifinal: 'Semifinal',
  'ub-semi': 'UB Semi',
  'ub-final': 'UB Final',
  'lb-semi': 'LB Semi',
  'lb-final': 'LB Final',
  'grand-final': 'Grand Final',
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-500 flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-amber-500/50" />
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, style, ...rest } = props;
  return (
    <input
      {...rest}
      className={`admin-input px-3.5 py-2.5 rounded-xl text-white text-sm font-medium outline-none transition-all duration-200 ${className || ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.3)',
        ...style,
      }}
    />
  );
}

export function Select({ children, className, style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`admin-input px-3.5 py-2.5 rounded-xl text-white text-sm font-medium outline-none transition-all duration-200 appearance-none cursor-pointer ${className || ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.3)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '36px',
        ...style,
      }}>
      {children}
    </select>
  );
}

/** Glass-morphic panel wrapper used across admin sections */
export function AdminPanel({ children, className, glow }: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${className || ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(13,16,23,0.95) 0%, rgba(7,9,15,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: glow
          ? `0 0 40px -10px ${glow}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 8px 32px rgba(0,0,0,0.4)',
      }}>
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)' }} />
      {children}
    </div>
  );
}
