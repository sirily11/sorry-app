'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (open) {
      // Load custom prompt from localStorage when dialog opens
      const savedPrompt = localStorage.getItem('customPrompt');
      if (savedPrompt) {
        setCustomPrompt(savedPrompt);
      }
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('customPrompt', customPrompt);
    onOpenChange(false);
  };

  const handleClear = () => {
    setCustomPrompt('');
    localStorage.removeItem('customPrompt');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="customPrompt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Custom Instructions
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add specific instructions that will be used when generating your apologies.
            </p>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Keep it short and casual, mention flowers, be very sincere..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={6}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Clear
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
