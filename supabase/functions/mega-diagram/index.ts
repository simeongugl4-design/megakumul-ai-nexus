import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, type } = await req.json();
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
            content: `Create a PHOTOREALISTIC, high-quality, professional 3D educational diagram for this topic. 

CRITICAL STYLE REQUIREMENTS:
- PHOTOREALISTIC 3D rendering style with depth, lighting, and shadows
- Use SOLID, THICK lines — absolutely NO dotted lines, NO dashed lines
- All numbers, labels, and text must be LARGE, BOLD, and clearly readable
- Use vibrant, high-contrast colors on a clean background
- Include proper labels with large, bold text
- Use professional textbook-quality illustration style
- Include 3D perspective, depth shading, and realistic textures
- For graphs: thick solid colored lines, large axis numbers, grid lines, clear legends
- For anatomical/scientific diagrams: realistic rendering with labeled arrows and bold text
- For mathematical plots: coordinate axes with large numbered tick marks, thick curve lines
- Make it look like a high-end textbook illustration or scientific publication figure

Topic: ${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
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

    if (message?.images?.[0]?.image_url?.url) {
      imageUrl = message.images[0].image_url.url;
    }
    
    if (!imageUrl && Array.isArray(message?.content)) {
      for (const part of message.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          imageUrl = part.image_url.url;
        } else if (part.type === "text") {
          text = part.text || "";
        }
      }
    }
    
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
