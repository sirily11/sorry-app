"use client";

import { SorryForm } from "@/components/sorry-form";
import { useTranslation } from "react-i18next";

export const maxDuration = 30;

export default function Home() {
  const { t } = useTranslation("common");

  return (
    <div className="">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center">
          <div className="md:relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              {t("app_title")}
            </h1>
            <p className="text-gray-600 text-lg">{t("app_subtitle")}</p>
          </div>
        </div>
        {/* Main Form */}
        <SorryForm />
        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>{t("footer")}</p>
        </div>
      </div>
    </div>
  );
}
