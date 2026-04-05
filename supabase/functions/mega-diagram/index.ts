import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Create a PHOTOREALISTIC, HIGH-QUALITY, PROFESSIONAL 3D educational diagram with CLEAR LABELS.

CRITICAL REQUIREMENTS:
1. PHOTOREALISTIC 3D rendering with depth, lighting, shadows, and realistic textures
2. THICK SOLID lines ONLY — absolutely NO dotted lines, NO dashed lines, NO thin lines
3. LARGE BOLD LABELS on every key element — each label must be clearly readable
4. Use ARROWS pointing from labels to their elements
5. HIGH CONTRAST vibrant colors on a clean dark or gradient background
6. Include a TITLE at the top in large bold text
7. Include a LEGEND or key if there are multiple elements
8. For GRAPHS: thick solid colored curves, large numbered axes, grid lines, clear legends
9. For SCIENCE: realistic 3D rendering with labeled arrows, annotations, and bold text
10. For MATH: coordinate axes with large tick marks, thick curves, shaded regions with labels
11. For PROCESSES: flowchart-style with labeled boxes connected by thick arrows
12. Make it look like a premium textbook illustration or scientific journal figure
13. Every diagram element should have a clear text label
14. Use professional color coding (blue, green, orange, purple) for different elements

Topic: ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Diagram generation temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    
    let imageUrl: string | null = null;
    let text = "";

    // Check images array (primary format)
    if (message?.images?.[0]?.image_url?.url) {
      imageUrl = message.images[0].image_url.url;
    }
    
    // Check content array for multimodal
    if (!imageUrl && Array.isArray(message?.content)) {
      for (const part of message.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          imageUrl = part.image_url.url;
        } else if (part.type === "text") {
          text = part.text || "";
        }
      }
    }
    
    // Check inline_data format
    if (!imageUrl && Array.isArray(message?.content)) {
      for (const part of message.content) {
        if (part.inline_data?.data) {
          const mime = part.inline_data.mime_type || "image/png";
          imageUrl = `data:${mime};base64,${part.inline_data.data}`;
        }
      }
    }

    if (!text && typeof message?.content === "string") {
      text = message.content;
    }

    if (!imageUrl) {
      console.error("No image found in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No diagram was generated. Please try a different prompt." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagram error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
