"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { SorryForm } from "@/components/sorry-form";
import { SettingsDialog } from "@/components/settings-dialog";

export const maxDuration = 30;

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button
            onClick={() => setShowSettings(true)}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-pink-100 transition-colors group"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 text-gray-600 group-hover:text-pink-600" />
          </button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            The Sorry App
          </h1>
          <p className="text-gray-600 text-lg">
            Let AI help you craft the perfect apology
          </p>
        </div>

        {/* Main Form */}
        <SorryForm />

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Powered by AI · Made with ❤️</p>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
