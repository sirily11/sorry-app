"use client";

import { useState, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  EditorState,
} from "lexical";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { updateMessageContent } from "@/app/actions";

interface EditableMessageContentProps {
  cid: string;
  fingerprint: string;
  initialContent: string;
  isOwner: boolean;
}

function SetInitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(content));
      root.append(paragraph);
    });
  }, [editor, content]);

  return null;
}

function ReadOnlyPlugin({ isReadOnly }: { isReadOnly: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!isReadOnly);
  }, [editor, isReadOnly]);

  return null;
}

export function EditableMessageContent({
  cid,
  fingerprint,
  initialContent,
  isOwner,
}: EditableMessageContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState("");

  const initialConfig = {
    namespace: "EditableMessage",
    theme: {
      paragraph: "mb-2",
    },
    onError: (error: Error) => {
      console.error(error);
    },
  };

  const handleClick = () => {
    if (isOwner && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = async () => {
    if (!isEditing) return;

    setIsEditing(false);
    setIsSaving(true);
    setError("");

    try {
      const result = await updateMessageContent(cid, fingerprint, content);
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to save changes");
      console.error("Error saving message:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      setContent(textContent);
    });
  };

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <div
            onClick={handleClick}
            onBlur={handleBlur}
            className={`relative ${
              isOwner
                ? "cursor-pointer hover:border-2 hover:border-pink-400 hover:border-dashed rounded-md transition-all"
                : ""
            } ${isEditing ? "border-2 border-pink-500 rounded-md" : ""}`}
          >
            <PlainTextPlugin
              contentEditable={
                <ContentEditable className="text-gray-700 whitespace-pre-wrap leading-relaxed outline-none p-2" />
              }
              placeholder={
                <div className="absolute top-2 left-2 text-gray-400 pointer-events-none">
                  Enter your message...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <OnChangePlugin onChange={handleEditorChange} />
            <SetInitialContentPlugin content={initialContent} />
            <ReadOnlyPlugin isReadOnly={!isEditing} />
          </div>

          {/* Overlay - full width and height */}
          {isOwner && !isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 pointer-events-none w-full h-full"
            />
          )}
        </div>
      </LexicalComposer>

      {/* Saving indicator */}
      {isSaving && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-2 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md"
        >
          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
          <span className="text-sm text-gray-600">Saving...</span>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
