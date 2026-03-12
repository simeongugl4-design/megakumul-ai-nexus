import { useState, useCallback } from "react";
import { readSSEStream } from "@/lib/stream-utils";
import { useHistory } from "@/hooks/use-history";

const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-image`;

export function useImageAI() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addEntry } = useHistory();

  const generate = useCallback(async (prompt: string, action: string = "generate") => {
    setContent("");
    setImageUrl(null);
    setIsLoading(true);
    setError(null);
    addEntry(prompt, "Image");

    if (action === "analyze") {
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
    } else {
      try {
        const resp = await fetch(IMAGE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, action }),
        });

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({ error: "Request failed" }));
          setError(data.error || `Error: ${resp.status}`);
          setIsLoading(false);
          return;
        }

        const data = await resp.json();
        setImageUrl(data.imageUrl);
        setContent(data.text || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Connection failed");
      } finally {
        setIsLoading(false);
      }
    }
  }, [addEntry]);

  const clear = useCallback(() => {
    setContent("");
    setImageUrl(null);
    setError(null);
  }, []);

  return { content, imageUrl, isLoading, error, generate, clear };
}
