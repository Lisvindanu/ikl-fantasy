import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, CheckCircle, ChevronDown, ChevronUp,
  LogIn, Link2, Ban, Trophy, Users, Shield,
  Sparkles, Monitor, Clock, LayoutGrid,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Section {
  readonly id: string;
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly questions: readonly Question[];
}

type Question =
  | { type: 'radio'; id: string; label: string; options: readonly Option[] }
  | { type: 'checkbox-table'; id: string; label: string; items: readonly CheckItem[] }
  | { type: 'text'; id: string; label: string; placeholder: string }
  | { type: 'confirm'; id: string; label: string };

interface Option {
  readonly value: string;
  readonly label: string;
  readonly desc?: string;
}

interface CheckItem {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PHONE_NUMBER = '6285156515602'; // your WA number

const SECTIONS: readonly Section[] = [
  {
    id: 'login',
    icon: <LogIn className="w-5 h-5" />,
    title: 'Login Peserta',
    description:
      'Di deck, peserta langsung submit tanpa login. Tapi di poin 4 disebutin data bisa diedit selama window buka — kalau gak ada login, peserta gak bisa balik buat edit.',
    questions: [
      {
        type: 'radio',
        id: 'login_method',
        label: 'Pilih metode akses peserta:',
        options: [
          {
            value: 'login',
            label: 'Login ringan (email + password)',
            desc: 'Peserta register sekali, bisa login balik buat edit tim. 1 akun = 1 tim. Sudah ready di sistem.',
          },
          {
            value: 'magic_link',
            label: 'Magic link via email',
            desc: 'Setelah submit, peserta dapet link unik ke email. Klik link itu buat edit.',
          },
          {
            value: 'no_login',
            label: 'Tanpa login, tanpa edit',
            desc: 'Submit sekali langsung final. Paling simpel, tapi peserta gak bisa ganti lineup.',
          },
        ],
      },
    ],
  },
  {
    id: 'scoring',
    icon: <Trophy className="w-5 h-5" />,
    title: 'Scoring / Ranking',
    description:
      'Di deck belum disebut gimana cara nentuin pemenang. Ini yang paling kita butuhin buat mulai develop.',
    questions: [
      {
        type: 'radio',
        id: 'scoring_method',
        label: 'Cara ranking peserta di leaderboard:',
        options: [
          {
            value: 'performance',
            label: 'Berdasarkan performa player',
            desc: 'Kills, assists, MVP, menang/kalah — tiap aksi punya poin.',
          },
          {
            value: 'win_only',
            label: 'Berdasarkan menang/kalah tim',
            desc: 'Player yang tim-nya menang di match = dapet poin.',
          },
          {
            value: 'custom',
            label: 'Formula custom IKL',
            desc: 'IKL punya rumus sendiri (jelaskan di bawah).',
          },
        ],
      },
      {
        type: 'text',
        id: 'scoring_detail',
        label: 'Detail formula scoring (opsional):',
        placeholder: 'Misal: MVP = 5 poin, Win = 3, Kill = 1, Assist = 0.5 ...',
      },
      {
        type: 'radio',
        id: 'scoring_input',
        label: 'Yang input data performa player tiap minggu:',
        options: [
          { value: 'ikl_team', label: 'Tim IKL yang input' },
          { value: 'admin_panel', label: 'Lewat admin panel yang kita sediain' },
        ],
      },
      {
        type: 'text',
        id: 'reward_info',
        label: 'Ada hadiah buat top leaderboard? Kalau ada, apa aja?',
        placeholder: 'Misal: juara 1 dapet skin, juara 2 merchandise, dll ...',
      },
    ],
  },
  {
    id: 'budget',
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Budget & Harga Player',
    description: 'Budget 25 poin, harga 1-9. Ini udah jelas. Tinggal konfirmasi detail.',
    questions: [
      {
        type: 'radio',
        id: 'price_setter',
        label: 'Harga per player (1-9) yang set siapa?',
        options: [
          { value: 'send_data', label: 'Tim IKL kirim data harganya' },
          { value: 'admin_panel', label: 'Set sendiri via admin panel' },
        ],
      },
      {
        type: 'radio',
        id: 'budget_fixed',
        label: 'Budget 25 poin:',
        options: [
          { value: 'fixed', label: 'Fix, gak berubah' },
          { value: 'adjustable', label: 'Bisa di-adjust per season' },
        ],
      },
      {
        type: 'radio',
        id: 'player_roster',
        label: 'Data roster player — kita udah punya 50+ player IKL. Untuk season baru:',
        options: [
          { value: 'same', label: 'Roster sama, gak ada perubahan' },
          { value: 'updated_spreadsheet', label: 'Ada perubahan — akan dikirim via spreadsheet' },
          { value: 'updated_admin', label: 'Ada perubahan — mau input sendiri di admin panel' },
        ],
      },
    ],
  },
  {
    id: 'features',
    icon: <Shield className="w-5 h-5" />,
    title: 'Fitur Tambahan',
    description:
      'Di sistem kita udah ada beberapa fitur lebih dari deck. Centang yang mau dipake.',
    questions: [
      {
        type: 'checkbox-table',
        id: 'extra_features',
        label: 'Pilih fitur yang mau diaktifin:',
        items: [
          {
            id: 'captain',
            label: 'Captain & Vice-Captain',
            desc: 'Captain dapet 2x poin, vice-captain 1.5x — bikin strategi lebih seru',
          },
          {
            id: 'bench',
            label: 'Bench player (cadangan)',
            desc: '2 pemain cadangan, otomatis gantiin kalau starter gak main',
          },
          {
            id: 'team_limit',
            label: 'Limit 2 player per tim',
            desc: 'Biar gak ada yang stack semua player dari 1 tim',
          },
        ],
      },
    ],
  },
  {
    id: 'role_order',
    icon: <Users className="w-5 h-5" />,
    title: 'Urutan Role',
    description:
      'Di deck urutannya: Clash - Jungler - Mid - Roamer - Farmlane.',
    questions: [
      {
        type: 'confirm',
        id: 'role_order_confirm',
        label: 'Ikutin urutan deck (Clash - Jungler - Mid - Roamer - Farmlane)?',
      },
    ],
  },
  {
    id: 'content',
    icon: <LayoutGrid className="w-5 h-5" />,
    title: 'Konten & Halaman Info',
    description:
      'Di flow peserta, halaman pertama ada info SBBT dan Reward. Setelah submit ada thank you + social media.',
    questions: [
      {
        type: 'text',
        id: 'reward_content',
        label: 'Reward yang ditampilin di halaman info itu apa?',
        placeholder: 'Misal: prize pool, merchandise, bragging rights ...',
      },
      {
        type: 'text',
        id: 'social_links',
        label: 'Social media yang ditampilin di thank you page:',
        placeholder: 'Misal: IG @iklofficial, Twitter @ikl_hok ...',
      },
      {
        type: 'radio',
        id: 'qr_code',
        label: 'Perlu QR code buat akses web SBBT?',
        options: [
          { value: 'yes', label: 'Ya, sediain QR code' },
          { value: 'no', label: 'Gak perlu, link aja cukup' },
        ],
      },
    ],
  },
  {
    id: 'bracket',
    icon: <Link2 className="w-5 h-5" />,
    title: 'Bracket Prediction (Pick\'em)',
    description:
      'Peserta prediksi tim IKL mana yang menang di playoff. Double elimination (UB / LB / Grand Final).',
    questions: [
      {
        type: 'text',
        id: 'bracket_teams',
        label: 'Berapa tim yang masuk bracket?',
        placeholder: 'Misal: 8 tim, 10 tim, ikutin jumlah tim playoff ...',
      },
      {
        type: 'radio',
        id: 'bracket_matchup',
        label: 'Matchup awal bracket:',
        options: [
          { value: 'manual', label: 'Tim IKL set manual di admin' },
          { value: 'auto', label: 'Auto generate dari seeding' },
        ],
      },
      {
        type: 'radio',
        id: 'bracket_format',
        label: 'Format match:',
        options: [
          { value: 'bo7_all', label: 'BO7 semua match' },
          { value: 'mixed', label: 'Beda per round (misal round awal BO5, final BO7)' },
        ],
      },
      {
        type: 'radio',
        id: 'bracket_submission',
        label: 'Peserta isi prediksi kapan?',
        options: [
          {
            value: 'all_at_once',
            label: 'Sekali di awal — isi semua bracket sekaligus',
          },
          {
            value: 'per_round',
            label: 'Per round — tiap round baru isi prediksi baru',
          },
        ],
      },
      {
        type: 'radio',
        id: 'bracket_bonus',
        label: 'Bonus poin buat prediksi round akhir?',
        options: [
          { value: 'yes', label: 'Ya, round akhir worth lebih' },
          { value: 'no', label: 'Gak, semua round sama' },
        ],
      },
      {
        type: 'text',
        id: 'bracket_period',
        label: 'Periode submit Pick\'em kapan? (di deck masih TBD)',
        placeholder: 'Misal: barengan window SBBT, atau sebelum playoff dimulai ...',
      },
    ],
  },
  {
    id: 'backend',
    icon: <Monitor className="w-5 h-5" />,
    title: 'Backend / Admin',
    description:
      'Di deck pakai Google Sheets. Kita bisa bikin admin panel web yang lebih praktis — semua fitur Sheets tersedia, tapi real-time dan langsung nyambung ke web.',
    questions: [
      {
        type: 'radio',
        id: 'backend_method',
        label: 'Prefer yang mana?',
        options: [
          {
            value: 'admin_panel',
            label: 'Admin panel web',
            desc: 'Edit harga, lihat peserta, upload foto — semua dari browser. Export Excel/CSV tetap bisa.',
          },
          {
            value: 'sheets',
            label: 'Google Sheets',
            desc: 'Manage data via spreadsheet. Kita integrasiin via Google Sheets API.',
          },
          {
            value: 'both',
            label: 'Dua-duanya',
            desc: 'Admin panel + sync ke Google Sheets.',
          },
        ],
      },
      {
        type: 'radio',
        id: 'participant_data',
        label: 'Data peserta (email, HP, IG, player yang dipilih) — mau diakses gimana?',
        options: [
          {
            value: 'admin_panel',
            label: 'Lihat & filter langsung di admin panel',
            desc: 'Real-time, bisa search, filter, dan download Excel/CSV kapan aja.',
          },
          {
            value: 'auto_sheets',
            label: 'Otomatis masuk ke Google Sheets',
            desc: 'Tiap peserta submit, data langsung muncul di spreadsheet.',
          },
          {
            value: 'both',
            label: 'Dua-duanya — admin panel + sync ke Sheets',
          },
        ],
      },
    ],
  },
  {
    id: 'submission',
    icon: <Clock className="w-5 h-5" />,
    title: 'Submission Detail',
    description: 'Window submit: Selasa 11:00 – Jumat 15:00 WIB.',
    questions: [
      {
        type: 'radio',
        id: 'edit_during_window',
        label: 'Peserta boleh ganti lineup berkali-kali selama window buka?',
        options: [
          { value: 'yes', label: 'Ya, yang ke-lock cuma yang terakhir' },
          { value: 'no', label: 'Tidak, sekali submit langsung final' },
        ],
      },
      {
        type: 'radio',
        id: 'validation_method',
        label: 'Validasi 1 orang 1 entri:',
        options: [
          { value: 'email', label: 'Based on email aja cukup' },
          { value: 'otp', label: 'Pakai OTP ke HP biar lebih aman' },
        ],
      },
    ],
  },
  {
    id: 'timeline',
    icon: <Ban className="w-5 h-5" />,
    title: 'Timeline & Prioritas',
    description: 'Season mulai week 2 Agustus (~5 minggu dari sekarang).',
    questions: [
      {
        type: 'radio',
        id: 'launch_priority',
        label: 'Mau launch apa dulu?',
        options: [
          { value: 'sbbt_first', label: 'SBBT (fantasy) dulu, bracket menyusul' },
          { value: 'both', label: 'Dua-duanya bareng' },
        ],
      },
      {
        type: 'radio',
        id: 'domain',
        label: 'Domain:',
        options: [
          { value: 'existing', label: 'Pakai domain yang ada' },
          { value: 'new', label: 'Domain baru khusus SBBT' },
        ],
      },
      {
        type: 'text',
        id: 'admin_access',
        label: 'Siapa aja yang perlu akses admin?',
        placeholder: 'Nama / role ...',
      },
      {
        type: 'text',
        id: 'branding_assets',
        label: 'Ada asset branding yang perlu dipasang? (logo, sponsor, dsb)',
        placeholder: 'Kalau ada, bisa kirim file-nya nanti ...',
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSummary(answers: Record<string, string | boolean>): string {
  const lines: string[] = ['*SBBT — Jawaban Konfirmasi*', ''];

  for (const section of SECTIONS) {
    const sectionAnswers: string[] = [];

    for (const q of section.questions) {
      const val = answers[q.id];
      if (q.type === 'radio' && typeof val === 'string' && val) {
        const opt = q.options.find((o) => o.value === val);
        sectionAnswers.push(`• ${q.label}\n  → ${opt?.label || val}`);
      } else if (q.type === 'text' && typeof val === 'string' && val.trim()) {
        sectionAnswers.push(`• ${q.label}\n  → ${val.trim()}`);
      } else if (q.type === 'confirm') {
        sectionAnswers.push(
          `• ${q.label}\n  → ${val ? 'Ya' : 'Tidak'}`,
        );
      } else if (q.type === 'checkbox-table') {
        const checked = q.items
          .filter((item) => answers[`${q.id}_${item.id}`])
          .map((item) => item.label);
        if (checked.length > 0) {
          sectionAnswers.push(`• ${q.label}\n  → ${checked.join(', ')}`);
        } else {
          sectionAnswers.push(`• ${q.label}\n  → (tidak ada yang dipilih)`);
        }
      }
    }

    if (sectionAnswers.length > 0) {
      lines.push(`*${section.title}*`);
      lines.push(...sectionAnswers);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Components ───────────────────────────────────────────────────────────────

function RadioGroup({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { type: 'radio' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">{question.label}</p>
      <div className="space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              value === opt.value
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-amber-500"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-white">{opt.label}</span>
              {opt.desc && (
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxTable({
  question,
  values,
  onChange,
}: {
  question: Extract<Question, { type: 'checkbox-table' }>;
  values: Record<string, boolean>;
  onChange: (itemId: string, checked: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">{question.label}</p>
      <div className="space-y-2">
        {question.items.map((item) => {
          const key = `${question.id}_${item.id}`;
          return (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                values[key]
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={!!values[key]}
                onChange={(e) => onChange(key, e.target.checked)}
                className="mt-0.5 accent-amber-500 rounded"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{item.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TextInput({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { type: 'text' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{question.label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
      />
    </div>
  );
}

function ConfirmToggle({
  question,
  value,
  onChange,
}: {
  question: Extract<Question, { type: 'confirm' }>;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
      <span className="text-sm font-medium text-gray-300">{question.label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-amber-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({
  section,
  answers,
  onAnswer,
  isOpen,
  onToggle,
  index,
}: {
  section: Section;
  answers: Record<string, string | boolean>;
  onAnswer: (key: string, value: string | boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  // Count answered questions
  const totalQ = section.questions.length;
  const answeredQ = section.questions.filter((q) => {
    if (q.type === 'checkbox-table') return true; // always "answered"
    const v = answers[q.id];
    if (typeof v === 'boolean') return true;
    return typeof v === 'string' && v.trim() !== '';
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-white/10 bg-[#1a1a2e]/80 backdrop-blur-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{section.title}</h3>
          <p className="text-xs text-gray-500 truncate">{section.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {answeredQ === totalQ && totalQ > 0 && (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          {answeredQ > 0 && answeredQ < totalQ && (
            <span className="text-xs text-amber-400">
              {answeredQ}/{totalQ}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                {section.description}
              </p>
              {section.questions.map((q) => {
                if (q.type === 'radio') {
                  return (
                    <RadioGroup
                      key={q.id}
                      question={q}
                      value={(answers[q.id] as string) || ''}
                      onChange={(v) => onAnswer(q.id, v)}
                    />
                  );
                }
                if (q.type === 'checkbox-table') {
                  return (
                    <CheckboxTable
                      key={q.id}
                      question={q}
                      values={answers as Record<string, boolean>}
                      onChange={(key, checked) => onAnswer(key, checked)}
                    />
                  );
                }
                if (q.type === 'text') {
                  return (
                    <TextInput
                      key={q.id}
                      question={q}
                      value={(answers[q.id] as string) || ''}
                      onChange={(v) => onAnswer(q.id, v)}
                    />
                  );
                }
                if (q.type === 'confirm') {
                  return (
                    <ConfirmToggle
                      key={q.id}
                      question={q}
                      value={!!answers[q.id]}
                      onChange={(v) => onAnswer(q.id, v)}
                    />
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function SBBTFeedbackPage() {
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    login: true,
  });
  const [sent, setSent] = useState(false);

  function handleAnswer(key: string, value: string | boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSendWhatsApp() {
    const summary = buildSummary(answers);
    const encoded = encodeURIComponent(summary);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encoded}`, '_blank');
    setSent(true);
  }

  function handleCopy() {
    const summary = buildSummary(answers);
    navigator.clipboard.writeText(summary);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  // Count total answered
  const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = SECTIONS.reduce((sum, s) => {
    return (
      sum +
      s.questions.filter((q) => {
        if (q.type === 'checkbox-table') return true;
        const v = answers[q.id];
        if (typeof v === 'boolean') return true;
        return typeof v === 'string' && v.trim() !== '';
      }).length
    );
  }, 0);

  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          KONFIRMASI REQUIREMENT
        </motion.div>
        <h1 className="text-2xl font-black text-white mb-2">
          SBBT — Semua Bisa Bikin Tim
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Deck-nya udah kita pelajarin. Tinggal jawab beberapa pertanyaan ini biar
          development bisa langsung jalan tanpa bolak-balik revisi.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            answers={answers}
            onAnswer={handleAnswer}
            isOpen={!!openSections[section.id]}
            onToggle={() => toggleSection(section.id)}
            index={i}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d1a]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            {sent ? 'Copied!' : 'Copy Jawaban'}
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-colors"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          >
            <Send className="w-4 h-4" />
            Kirim via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
