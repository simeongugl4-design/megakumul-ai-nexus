import { useState, useCallback } from "react";
import { readSSEStream } from "@/lib/stream-utils";
import { useHistory } from "@/hooks/use-history";

const DOC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-document`;

export function useDocumentAI() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addEntry } = useHistory();

  const query = useCallback(async (prompt: string, documentContent?: string) => {
    setContent("");
    setIsLoading(true);
    setError(null);
    addEntry(prompt, "Documents");
    let accumulated = "";

    await readSSEStream({
      url: DOC_URL,
      body: { prompt, documentContent },
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

  return { content, isLoading, error, query, clear };
}
