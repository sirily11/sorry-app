'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useTranslation } from 'react-i18next';
import {
  generateApology,
  getRateLimitMax,
  getRemainingGenerations,
} from '@/app/actions';

export function SorryForm() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [fingerprint, setFingerprint] = useState<string>('');
  const [scenario, setScenario] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [maxLimit, setMaxLimit] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize fingerprint and fetch remaining generations
    const init = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const visitorId = result.visitorId;
      setFingerprint(visitorId);

      // Get max limit
      const { max } = await getRateLimitMax();
      setMaxLimit(max);

      // Get actual remaining generations for this fingerprint
      const { remaining } = await getRemainingGenerations(visitorId);
      setRemaining(remaining);
    };

    init();
  }, []);

  const handleGenerate = async () => {
    if (!scenario.trim() || !fingerprint) return;

    setIsGenerating(true);
    setError('');

    try {
      // Get custom prompt from localStorage
      const customPrompt = localStorage.getItem('customPrompt') || '';

      const result = await generateApology(fingerprint, scenario, customPrompt);

      if (result.error) {
        setError(result.error);
        if (result.remaining !== undefined) {
          setRemaining(result.remaining);
        }
        setIsGenerating(false);
        return;
      }

      if (result.remaining !== undefined) {
        setRemaining(result.remaining);
      }

      // Redirect to session page with the cid
      if (result.cid) {
        router.push(`/session/${result.cid}`);
      }
    } catch (err) {
      setError('Failed to generate apology. Please try again.');
      console.error('Error in handleGenerate:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Remaining Generations Counter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {remaining === null || maxLimit === null ? (
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-gray-300 border-t-pink-500 rounded-full"
            />
            <p className="text-sm text-gray-600">{t('loading')}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {t('form.remaining_today')}{' '}
            <motion.span
              key={remaining}
              initial={{ scale: 1.5, color: '#10b981' }}
              animate={{
                scale: 1,
                color: remaining <= 1 ? '#ef4444' : '#000000',
              }}
              className="font-bold text-lg"
            >
              {remaining}
            </motion.span>
            /{maxLimit}
          </p>
        )}
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="scenario"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('form.label')}
          </label>
          <textarea
            id="scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder={t('form.placeholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={
            isGenerating ||
            !scenario.trim() ||
            remaining === null ||
            remaining === 0
          }
          className="w-full px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? t('form.button_generating') : t('form.button_generate')}
        </button>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
