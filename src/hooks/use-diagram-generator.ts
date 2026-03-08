import { useState, useCallback } from "react";

const DIAGRAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-diagram`;

export function useDiagramGenerator() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setText("");

    try {
      const resp = await fetch(DIAGRAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(data.error || `Error: ${resp.status}`);
        setIsLoading(false);
        return;
      }

      const data = await resp.json();
      setImageUrl(data.imageUrl);
      setText(data.text || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setImageUrl(null);
    setText("");
    setError(null);
  }, []);

  return { imageUrl, text, isLoading, error, generate, clear };
}
