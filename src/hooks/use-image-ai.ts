import { useState, useCallback } from "react";
import { readSSEStream } from "@/lib/stream-utils";

const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-image`;

export function useImageAI() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, action: string = "generate") => {
    setContent("");
    setIsLoading(true);
    setError(null);
    let accumulated = "";

    await readSSEStream({
      url: IMAGE_URL,
      body: { prompt, action },
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
  }, []);

  const clear = useCallback(() => {
    setContent("");
    setError(null);
  }, []);

  return { content, isLoading, error, generate, clear };
}
