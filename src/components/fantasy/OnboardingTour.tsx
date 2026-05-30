import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_STEPS = [
  {
    title: 'Welcome to IKL Fantasy!',
    desc: "Build your dream IKL team and compete with friends. Let's show you around.",
    icon: '\u{1F3C6}',
  },
  {
    title: 'Choose Your Mode',
    desc: 'Draft Mode: Pick 5 players with a budget. Team Mode: Back your favorite IKL team. Or play both!',
    icon: '\u{1F3AE}',
  },
  {
    title: 'Build Your Squad',
    desc: 'In Draft mode, select players across all 5 roles (Clash, JGL, MID, Farm, Roam). Stay within your 100 credit budget.',
    icon: '\u{2694}\u{FE0F}',
  },
  {
    title: 'Make Predictions',
    desc: 'Predict match winners, exact scores, MVPs, and objectives like First Blood and Tyrant for bonus points.',
    icon: '\u{1F52E}',
  },
  {
    title: 'Climb the Leaderboard',
    desc: 'Your points update after each matchday. Create or join private leagues to compete with friends!',
    icon: '\u{1F4CA}',
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step >= TOUR_STEPS.length - 1) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const current = TOUR_STEPS[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0d1017] border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="text-xl font-bold text-white mb-3">{current.title}</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">{current.desc}</p>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-amber-500' : i < step ? 'bg-amber-500/40' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              {step === TOUR_STEPS.length - 1 ? "Let's go!" : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
