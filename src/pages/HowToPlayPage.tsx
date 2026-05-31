import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Users, Shield, Trophy, Target, Zap, Crown, Star,
  Wallet, ChevronRight, Globe, TrendingUp, Swords,
  Award, ArrowRight, HelpCircle, Sparkles,
} from 'lucide-react';

// ── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
};

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <motion.section id={id} className="mb-16" {...fadeUp}>
      {children}
    </motion.section>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-black text-white mb-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
        {icon}
      </div>
      {children}
    </h2>
  );
}

// ── Scoring card ─────────────────────────────────────────────────────────────

function ScoreRow({ pts, label, color }: { pts: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="w-12 text-right font-black text-sm" style={{ color }}>{pts}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}

// ── Step card ────────────────────────────────────────────────────────────────

function StepCard({ step, title, desc, icon }: { step: number; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="absolute top-3 right-3 text-[48px] font-black leading-none select-none"
        style={{ color: 'rgba(245,158,11,0.06)' }}>
        {step}
      </div>
      <div className="relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
          {icon}
        </div>
        <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ title, desc, icon, color }: { title: string; desc: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        {icon}
      </div>
      <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

// ── FAQ item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-white text-sm font-bold mb-1">{q}</p>
      <p className="text-gray-500 text-xs leading-relaxed">{a}</p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function HowToPlayPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#07090f' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Hero */}
        <motion.div className="text-center mb-16" {...fadeUp}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">IKL Fantasy League</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Cara Bermain
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Prediksi performa pemain &amp; tim IKL, kumpulkan poin, dan bersaing di leaderboard bersama teman-temanmu.
          </p>
        </motion.div>

        {/* Quick start steps */}
        <Section id="quick-start">
          <SectionTitle icon={<Target className="w-5 h-5 text-amber-400" />}>
            Mulai dalam 3 Langkah
          </SectionTitle>
          <div className="grid sm:grid-cols-3 gap-3">
            <StepCard step={1} title="Buat Akun" desc="Login dengan Google atau daftar dengan email. Gratis!" icon={<Users className="w-5 h-5 text-amber-400" />} />
            <StepCard step={2} title="Pilih Mode" desc="Fantasy Draft untuk analisa pemain, atau Fantasy Team untuk fans tim." icon={<Zap className="w-5 h-5 text-amber-400" />} />
            <StepCard step={3} title="Kumpulkan Poin!" desc="Semakin bagus performa pemain/tim pilihanmu, semakin banyak poinmu." icon={<Trophy className="w-5 h-5 text-amber-400" />} />
          </div>
        </Section>

        {/* Mode 1: Fantasy Draft */}
        <Section id="fantasy-draft">
          <SectionTitle icon={<Users className="w-5 h-5 text-amber-400" />}>
            Mode 1: Fantasy Draft
          </SectionTitle>

          <div className="rounded-2xl p-6 mb-4"
            style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Draft <span className="text-white font-bold">5 pemain IKL</span> dari role berbeda dengan <span className="text-amber-400 font-bold">budget 100 kredit</span>.
              Poin kamu dihitung berdasarkan performa pemain di match sesungguhnya (KDA, MVP, dll).
            </p>

            {/* Rules grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {[
                { icon: <Wallet className="w-4 h-4" />, label: 'Budget', value: '100' },
                { icon: <Users className="w-4 h-4" />, label: 'Starter', value: '5 pemain' },
                { icon: <Star className="w-4 h-4" />, label: 'Bench', value: '2 pemain' },
                { icon: <Crown className="w-4 h-4" />, label: 'Captain', value: 'Poin x2' },
              ].map(r => (
                <div key={r.label} className="rounded-xl px-3 py-2.5 text-center"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <div className="flex justify-center mb-1 text-amber-400">{r.icon}</div>
                  <div className="text-white font-black text-sm">{r.value}</div>
                  <div className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">{r.label}</div>
                </div>
              ))}
            </div>

            {/* Role explanation */}
            <div className="rounded-xl p-4 mb-5"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">5 Role yang harus diisi</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { role: 'CLASH', desc: 'EXP Laner', color: '#EF4444' },
                  { role: 'JGL', desc: 'Jungler', color: '#22C55E' },
                  { role: 'MID', desc: 'Mid Laner', color: '#3B82F6' },
                  { role: 'FARM', desc: 'Gold Laner', color: '#F59E0B' },
                  { role: 'ROAM', desc: 'Roamer', color: '#A855F7' },
                ].map(r => (
                  <div key={r.role} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: `${r.color}10`, border: `1px solid ${r.color}20` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                    <span className="text-xs font-bold text-white">{r.role}</span>
                    <span className="text-[10px] text-gray-500">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-2 text-xs text-gray-400">
              <p className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Maksimal <span className="text-white font-bold">2 pemain</span> dari tim yang sama.</span>
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Pilih 1 <span className="text-amber-400 font-bold">Captain</span> untuk mendapat poin ganda (x2).</span>
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Pilih 1 <span className="text-purple-400 font-bold">Vice Captain</span> untuk bonus poin x1.5.</span>
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span><span className="text-white font-bold">2 bench player</span> sebagai cadangan. Bench player tidak menghasilkan poin kecuali dipromosikan ke starter.</span>
              </p>
            </div>
          </div>

          {/* Draft Scoring */}
          <div className="rounded-2xl p-5"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Scoring — Fantasy Draft
            </p>
            <ScoreRow pts="+1" label="Per Kill" color="#22C55E" />
            <ScoreRow pts="+1" label="Per Assist" color="#3B82F6" />
            <ScoreRow pts="-1" label="Per Death" color="#EF4444" />
            <ScoreRow pts="+3" label="Bonus MVP match" color="#F59E0B" />
            <ScoreRow pts="+10" label="Bonus Penta Kill" color="#A855F7" />
            <ScoreRow pts="+5" label="Bonus jika tim pemain menang seri" color="#22C55E" />
            <ScoreRow pts="x2" label="Captain mendapat poin ganda" color="#FBBF24" />
            <ScoreRow pts="x1.5" label="Vice Captain mendapat poin x1.5" color="#C084FC" />
          </div>
        </Section>

        {/* Mode 2: Fantasy Team */}
        <Section id="fantasy-team">
          <SectionTitle icon={<Shield className="w-5 h-5 text-purple-400" />}>
            Mode 2: Fantasy Team
          </SectionTitle>

          <div className="rounded-2xl p-6 mb-4"
            style={{ background: '#0d1017', border: '1px solid rgba(168,85,247,0.15)' }}>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Mode yang lebih simpel — pilih <span className="text-white font-bold">1 tim IKL</span> jagoanmu.
              Setiap kali mereka menang, kamu dapat poin. Cocok untuk pemula atau fans setia tim tertentu.
            </p>

            {/* Team scoring */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { pts: '+10', label: 'Series Win', color: '#22C55E', desc: 'Menang seri Bo3/Bo5' },
                { pts: '+2', label: 'Game Win', color: '#3B82F6', desc: 'Per game menang' },
                { pts: '+5', label: 'Clean Sweep', color: '#A855F7', desc: 'Menang tanpa kalah' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.pts}</div>
                  <div className="text-xs font-bold text-white mt-1">{s.label}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Loyalty */}
            <div className="rounded-xl p-4"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> Sistem Loyalty
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Tetap setia dengan tim yang sama di setiap season untuk mendapatkan bonus multiplier poin:
              </p>
              <div className="space-y-2">
                {[
                  { badge: 'Silver', seasons: '2 season', mult: 'x1.10', color: '#9CA3AF', border: '#6B7280' },
                  { badge: 'Gold', seasons: '3 season', mult: 'x1.25', color: '#F59E0B', border: '#D97706' },
                  { badge: 'Diamond', seasons: '5+ season', mult: 'x1.50', color: '#22D3EE', border: '#06B6D4' },
                ].map(l => (
                  <div key={l.badge} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${l.color}15`, color: l.color, border: `1px solid ${l.border}40` }}>
                        {l.badge}
                      </span>
                      <span className="text-xs text-gray-500">{l.seasons}</span>
                    </div>
                    <span className="text-xs font-black" style={{ color: l.color }}>{l.mult}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3">
                Ganti tim? -20% penalti poin season itu. Kecuali jika tim lama disbanded (grace period 14 hari).
              </p>
            </div>
          </div>
        </Section>

        {/* Predictions */}
        <Section id="predictions">
          <SectionTitle icon={<Target className="w-5 h-5 text-green-400" />}>
            Prediksi Match
          </SectionTitle>

          <div className="rounded-2xl p-6"
            style={{ background: '#0d1017', border: '1px solid rgba(34,197,94,0.15)' }}>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Selain draft dan team pick, kamu juga bisa dapat poin tambahan dengan memprediksi hasil match IKL.
              Prediksi tersedia untuk match yang belum dimulai.
            </p>

            <div className="space-y-1 mb-5">
              <ScoreRow pts="+3" label="Prediksi pemenang benar" color="#22C55E" />
              <ScoreRow pts="+5" label="Prediksi skor tepat (misal 2-1)" color="#3B82F6" />
              <ScoreRow pts="+4" label="Prediksi MVP seri benar" color="#F59E0B" />
            </div>

            <div className="rounded-xl p-3"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-400" /> Confidence Multiplier
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Yakin dengan prediksimu? Aktifkan <span className="text-amber-400 font-bold">x2 Confidence</span> — poin
                yang didapat berlipat ganda jika benar, tapi kamu kehilangan poin jika salah. Risiko tinggi, hadiah tinggi!
              </p>
            </div>
          </div>
        </Section>

        {/* Leagues */}
        <Section id="leagues">
          <SectionTitle icon={<Globe className="w-5 h-5 text-blue-400" />}>
            Liga Privat
          </SectionTitle>

          <div className="rounded-2xl p-6"
            style={{ background: '#0d1017', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Buat liga privat dan ajak teman-temanmu untuk bersaing! Setiap liga punya leaderboard dan chat sendiri.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <FeatureCard
                title="Buat Liga"
                desc="Buat liga baru, dapatkan kode undangan unik untuk dibagikan."
                icon={<Globe className="w-5 h-5 text-blue-400" />}
                color="#3B82F6"
              />
              <FeatureCard
                title="Undang Teman"
                desc="Bagikan invite code ke teman. Mereka join dan langsung masuk leaderboard liga."
                icon={<Users className="w-5 h-5 text-blue-400" />}
                color="#3B82F6"
              />
              <FeatureCard
                title="Liga Chat"
                desc="Chat dengan anggota liga, bahas strategi, dan trash talk!"
                icon={<Swords className="w-5 h-5 text-blue-400" />}
                color="#3B82F6"
              />
            </div>
          </div>
        </Section>

        {/* Other features */}
        <Section id="features">
          <SectionTitle icon={<Star className="w-5 h-5 text-amber-400" />}>
            Fitur Lainnya
          </SectionTitle>

          <div className="grid sm:grid-cols-2 gap-3">
            <FeatureCard
              title="Leaderboard Global"
              desc="Lihat peringkat semua pemain fantasy. Poin dari draft + team + prediksi digabung."
              icon={<Trophy className="w-5 h-5 text-amber-400" />}
              color="#F59E0B"
            />
            <FeatureCard
              title="Match Center"
              desc="Standings tim, head-to-head results, jadwal match per minggu, dan statistik KDA per game."
              icon={<Swords className="w-5 h-5 text-green-400" />}
              color="#22C55E"
            />
            <FeatureCard
              title="Player Comparison"
              desc="Bandingkan statistik dua pemain secara side-by-side: KDA, win rate, fantasy points."
              icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
              color="#3B82F6"
            />
            <FeatureCard
              title="Meta Analytics"
              desc="Lihat hero meta di IKL: pick rate, ban rate, win rate berdasarkan data match aktual."
              icon={<Zap className="w-5 h-5 text-purple-400" />}
              color="#A855F7"
            />
            <FeatureCard
              title="Login Streak"
              desc="Login setiap hari untuk mendapatkan bonus kredit. Streak makin panjang, bonus makin besar!"
              icon={<Award className="w-5 h-5 text-red-400" />}
              color="#EF4444"
            />
            <FeatureCard
              title="Player Profile"
              desc="Lihat profil detail setiap pemain: statistik, history match, tim, dan ownership rate."
              icon={<Users className="w-5 h-5 text-cyan-400" />}
              color="#06B6D4"
            />
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq">
          <SectionTitle icon={<HelpCircle className="w-5 h-5 text-amber-400" />}>
            FAQ
          </SectionTitle>

          <div className="space-y-2">
            <FAQItem
              q="Apakah gratis?"
              a="100% gratis. Tidak ada biaya apapun untuk bermain IKL Fantasy."
            />
            <FAQItem
              q="Bisa ikut Fantasy Draft dan Fantasy Team sekaligus?"
              a="Bisa! Pilih mode 'Ikut keduanya' saat pertama kali masuk. Poin dari kedua mode dijumlahkan di leaderboard."
            />
            <FAQItem
              q="Kapan picks dikunci?"
              a="Picks dikunci sebelum season dimulai. Tanggal lock ditampilkan di halaman utama. Setelah locked, kamu tidak bisa mengubah lineup."
            />
            <FAQItem
              q="Bagaimana poin dihitung?"
              a="Poin dihitung otomatis berdasarkan performa pemain/tim di match IKL yang sesungguhnya. Admin menginput statistik setelah setiap match selesai."
            />
            <FAQItem
              q="Bisa ganti pemain di lineup?"
              a="Bisa, selama picks belum di-lock. Setelah lock, lineup kamu final untuk season tersebut."
            />
            <FAQItem
              q="Apa itu Captain dan Vice Captain?"
              a="Captain mendapat poin x2 dan Vice Captain mendapat x1.5. Pilih pemain yang kamu yakin akan perform paling bagus!"
            />
            <FAQItem
              q="Apa bedanya CLASH, JGL, MID, FARM, ROAM?"
              a="Ini adalah 5 role di Honor of Kings: CLASH (EXP Lane), JGL (Jungle), MID (Mid Lane), FARM (Gold Lane), ROAM (Roamer/Support). Kamu harus draft 1 pemain untuk setiap role."
            />
          </div>
        </Section>

        {/* CTA */}
        <motion.div className="text-center py-8" {...fadeUp}>
          <div className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(168,85,247,0.06) 100%)',
              border: '1px solid rgba(245,158,11,0.15)',
            }}>
            <h2 className="text-2xl font-black text-white mb-2">Siap bermain?</h2>
            <p className="text-gray-400 text-sm mb-6">Buat akun dan mulai draft sekarang!</p>
            <Link
              to="/play"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}>
              Main Sekarang <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
