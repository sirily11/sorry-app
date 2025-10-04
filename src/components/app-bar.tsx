"use client";

import { Settings } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { SettingsDialog } from "./settings-dialog";

export function AppBar() {
  const { t } = useTranslation("common");
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="flex justify-end md:absolute md:right-0 md:top-0 py-4">
      <div className="flex gap-2 md:mr-10 mr-4">
        <LanguageSwitcher />
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full hover:bg-pink-100 transition-colors group"
          aria-label={t("settings")}
        >
          <Settings className="w-6 h-6 text-gray-600 group-hover:text-pink-600" />
        </button>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
