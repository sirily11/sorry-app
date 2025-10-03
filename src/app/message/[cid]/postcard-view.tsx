'use client';

import { motion } from 'framer-motion';

interface PostcardViewProps {
  content: string;
  createdAt: Date;
}

export function PostcardView({ content, createdAt }: PostcardViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        {/* Postcard Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-3" />

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                A Heartfelt Apology
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
            </motion.div>

            {/* Message Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="prose prose-lg max-w-none"
            >
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-center md:text-left">
                {content}
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="mt-8 flex justify-center space-x-2"
            >
              <span className="text-4xl">💝</span>
              <span className="text-4xl">💐</span>
              <span className="text-4xl">💕</span>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              {new Date(createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </motion.div>
          </div>

          {/* Decorative Footer */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-3" />
        </div>

        {/* Subtle Shadow Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          className="mt-4 text-center text-sm text-gray-600"
        >
          Created with ❤️
        </motion.div>
      </motion.div>
    </div>
  );
}
