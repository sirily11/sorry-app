"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import { getMessageForSession } from "@/app/actions";
import { ShareDialog } from "@/components/share-dialog";

interface SessionViewProps {
  cid: string;
  fingerprint: string;
  baseUrl: string;
}

export function SessionView({ cid, fingerprint, baseUrl }: SessionViewProps) {
  const router = useRouter();
  const [scenario, setScenario] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const loadMessage = async () => {
      setIsLoading(true);
      try {
        const result = await getMessageForSession(cid, fingerprint);

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }

        setScenario(result.scenario || "");
        setGeneratedMessage(result.content || "");
        setIsPublic(result.isPublic || false);
        setIsLoading(false);

        // If content is empty, start streaming
        if (!result.content) {
          setIsGenerating(true);
          await startStreaming();
        }
      } catch (err) {
        setError("Failed to load message");
        console.error("Error loading message:", err);
        setIsLoading(false);
      }
    };

    const startStreaming = async () => {
      try {
        // Initiate the generation via POST
        const postResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cid }),
        });

        if (!postResponse.ok) {
          throw new Error("Failed to start generation");
        }

        const reader = postResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "delta" && data.content) {
                  fullText += data.content;
                  setGeneratedMessage(fullText);
                } else if (data.type === "done") {
                  setIsGenerating(false);
                } else if (data.type === "error") {
                  setError(data.error || "Generation failed");
                  setIsGenerating(false);
                } else if (data.type === "content") {
                  // Complete content (already generated)
                  setGeneratedMessage(data.content);
                  setIsGenerating(false);
                }
              } catch (e) {
                // Skip invalid JSON
                console.error("Failed to parse SSE data:", e);
              }
            }
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
        setError("Failed to generate apology");
        setIsGenerating(false);
      }
    };

    loadMessage();
  }, [cid, fingerprint]);

  const handleGenerateNew = () => {
    router.push("/");
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-gray-300 border-t-pink-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleGenerateNew}
            className="px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Sorry App
          </h1>
          <p className="text-gray-600 text-lg">
            Let AI help you craft the perfect apology
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Original Scenario Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              What went wrong:
            </h3>
            <p className="text-gray-800 whitespace-pre-wrap">{scenario}</p>
          </motion.div>

          {/* Generated Message or Generation Progress */}
          <AnimatePresence>
            {isGenerating && !generatedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-gray-300 border-t-pink-500 rounded-full flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Crafting your apology...
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI is writing a heartfelt message for you
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
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

          {/* Generate New Button */}
          {!isGenerating && generatedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={handleGenerateNew}
                className="px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
              >
                Generate New Apology
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Powered by AI · Made with ❤️</p>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        cid={cid}
        fingerprint={fingerprint}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        baseUrl={baseUrl}
        initialIsPublic={isPublic}
        onPublicChange={setIsPublic}
      />
    </div>
  );
}
