import { useState, useCallback } from "react";
import { readSSEStream } from "@/lib/stream-utils";
import { useHistory } from "@/hooks/use-history";

const CODE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-code`;

export function useCodeAssistant() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addEntry } = useHistory();

  const generate = useCallback(async (prompt: string, language: string, action: string) => {
    setContent("");
    setIsLoading(true);
    setError(null);
    addEntry(prompt, "Code");
    let accumulated = "";

    await readSSEStream({
      url: CODE_URL,
      body: { prompt, language, action },
      onDelta: (chunk) => {
        accumulated += chunk;
        setContent(accumulated);
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        setError(err);
      },
    });
  }, [addEntry]);

  const clear = useCallback(() => {
    setContent("");
    setError(null);
  }, []);

  return { content, isLoading, error, generate, clear };
}
