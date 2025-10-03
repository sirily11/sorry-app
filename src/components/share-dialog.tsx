"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { togglePublish } from "@/app/actions";
import { getBaseUrl } from "@/lib/utils.server";

interface ShareDialogProps {
  cid: string;
  fingerprint: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl: string;
  initialIsPublic: boolean;
  onPublicChange: (isPublic: boolean) => void;
}

export function ShareDialog({
  cid,
  fingerprint,
  open,
  onOpenChange,
  baseUrl,
  initialIsPublic,
  onPublicChange,
}: ShareDialogProps) {
  const { t } = useTranslation('common');
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Update local state when initialIsPublic prop changes
  useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

  const shareUrl = `${baseUrl}/message/${cid}`;

  const handleTogglePublish = async () => {
    setIsToggling(true);
    try {
      const result = await togglePublish(cid, fingerprint);
      if (result.error) {
        alert(result.error);
      } else if (result.isPublic !== undefined) {
        setIsPublic(result.isPublic);
        onPublicChange(result.isPublic);
      }
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-900">
            {t('share_dialog.title')}
          </h2>

          <div className="space-y-4">
            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('share_dialog.make_public')}</p>
                <p className="text-sm text-gray-600">
                  {isPublic
                    ? t('share_dialog.public_description')
                    : t('share_dialog.private_description')}
                </p>
              </div>
              <button
                onClick={handleTogglePublish}
                disabled={isToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? "bg-pink-500" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <motion.span
                  layout
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ x: isPublic ? 20 : 4 }}
                />
              </button>
            </div>

            {/* Share URL */}
            {isPublic && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-700">
                  {t('share_dialog.share_link')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    {copied ? t('share_dialog.copied') : t('share_dialog.copy')}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              {t('share_dialog.close')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
