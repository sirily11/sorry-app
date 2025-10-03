'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { readStreamableValue } from '@ai-sdk/rsc';
import { Share2 } from 'lucide-react';
import {
  generateApology,
  getRateLimitMax,
  getRemainingGenerations,
} from '@/app/actions';
import { ShareDialog } from './share-dialog';

export function SorryForm() {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [scenario, setScenario] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [maxLimit, setMaxLimit] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [messageCid, setMessageCid] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);

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
    setGeneratedMessage('');
    setMessageCid('');

    try {
      const result = await generateApology(fingerprint, scenario);

      if (result.error) {
        setError(result.error);
        setRemaining(result.remaining);
        setIsGenerating(false);
        return;
      }

      setRemaining(result.remaining);

      // Set the cid immediately (it's available right away)
      if (result.cid) {
        setMessageCid(result.cid);
      }

      // Stream the response word by word
      let fullText = '';
      for await (const delta of readStreamableValue(result.output)) {
        if (delta) {
          fullText += delta;
          setGeneratedMessage(fullText);
        }
      }
    } catch (err) {
      setError('Failed to generate apology. Please try again.');
      console.error('Error in handleGenerate:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generatedMessage || !fingerprint || !messageCid) return;

    setShowShareDialog(true);
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
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Generations remaining today:{' '}
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
            What went wrong?
          </label>
          <textarea
            id="scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Describe the situation... (e.g., I forgot our anniversary, I was late to dinner, etc.)"
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
          {isGenerating ? 'Generating...' : 'Generate Apology'}
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

      {/* Generated Message */}
      <AnimatePresence>
        {generatedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.div className="relative p-6 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg shadow-lg">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Your Apology
                </h3>
                {!isGenerating && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="group relative p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                    aria-label="Share this message"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Share this message
                    </span>
                  </motion.button>
                )}
              </div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {generatedMessage}
                {isGenerating && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-1"
                  >
                    ▋
                  </motion.span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      {messageCid && (
        <ShareDialog
          cid={messageCid}
          fingerprint={fingerprint}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
        />
      )}
    </div>
  );
}
