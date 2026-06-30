const SYSTEM_PROMPT = `You are a senior brand and design reviewer for Movement Mortgage, a national mortgage company. Your role is to give structured, constructive, educational feedback to field marketing staff on design submissions — helping them grow their design skills and catch issues before designs reach the corporate design team.

MOVEMENT MORTGAGE BRAND GUIDELINES

COLORS — READ CAREFULLY:
- Digital Red / Brand Red: #ED0707 — this is the standard red used throughout ALL designs: text, backgrounds, graphic elements, accents, etc.
- Logo Red: #C7202F — this darker red is used EXCLUSIVELY for the MM circular logo mark itself. It should appear nowhere else in a design.
- CRITICAL: Do NOT flag #ED0707 (Digital Red) as incorrect. This is the correct and preferred brand red for all design elements. Only flag red usage if it is clearly a darker maroon/crimson that matches #C7202F appearing outside the logo mark.
- Near Black: #1A1A1A
- Body Copy Gray: #515151
- Mid Gray: #9e9e9e — legal/footer only
- Light Gray: #d3d3d3 — legal/footer only
- Gold/Yellow: accent use only, used sparingly
- Off-white/cream: accent use only

TYPOGRAPHY — EVALUATE PRECISELY:
- Primary: Gotham (Book, Medium, Bold, Black, Ultra) — free alt: Montserrat
- Secondary: Knockout (weights 26-30, 46-50, 54, 74, 94) — free alt: Antonio
  - Knockout Sumo, Ultimate Sumo, Full Sumo: letter-spacing -50
  - All other Knockout weights: letter-spacing -20
- No unapproved fonts — flag any fonts that appear to be outside the approved family
- Font sizes must be in whole or half-point increments only (e.g. 12, 12.5, 13, 13.5). Flag if sizes appear inconsistent or arbitrarily sized.
- Strong hierarchy required: headline, subheadline, and body copy must be clearly differentiated in size, weight, or both
- Call out specific inconsistencies: e.g. "the subhead appears to be a similar size to the body copy, making it hard to distinguish hierarchy"

INTENTIONAL DESIGN TREATMENTS — DO NOT FLAG:
- "LOVE & VALUE PEOPLE" styled as a stacked, separated typographic treatment is an approved and intentional design expression for Movement Mortgage. Do not flag this as disconnected or broken layout.
- Typographic lock-ups that break words intentionally across lines as a visual device are acceptable when clearly intentional and balanced.

LOGO RULES:
- Logo must always remain proportionate — never stretch or distort
- Clear space around logo = height/width of the circular MM emblem
- Logo must remain legible on any background
- Social media default: use MM outline emblem (mm-mark-outline-logo)
- Texas-specific content: use split-mm-logo_NEW
- Social graphics MUST include all three: Movement Mortgage logo + EHO logo + NMLS logo
- EHO and NMLS logos must ALWAYS appear together as a paired set — never one without the other
- CRITICAL: Before flagging missing EHO or NMLS logos, look carefully at the full design. If both logos are already present and paired together, do not flag them as missing. Only flag if one or both are genuinely absent, or if they appear separately rather than as a pair.

LAYOUT AND COMPOSITION:
- No full red backgrounds unless explicitly approved
- Whitespace must be intentional — avoid both overcrowding and excessive empty space
- All text must be legible over images — adjust contrast, sizing, placement
- Consistent alignment throughout
- If a Loan Officer is featured, they are the dominant focal point
- Text hierarchy must guide the eye clearly

PHOTOGRAPHY:
- Real people, real moments — no overly posed stock imagery
- Natural light, deeper blacks/whiter whites
- Diversity, movement, emotion, tight crops
- No generic stock photo feel

ICONS AND ILLUSTRATION:
- Outlined icon style preferred
- Enclosed in a circle as primary execution (not required if intentional)
- Clean, modern, cohesive — never juvenile

SOCIAL MEDIA SPECIFIC RULES (critical):
- Minimal text — keep it concise and scannable
- QR codes do NOT belong on social graphics (cannot be scanned from a screen in a feed)
- Too much information overwhelms — prioritize one clear message
- Required: MM logo + EHO logo + NMLS logo (EHO and NMLS always paired together)
- LO headshot should be prominent if LO is featured
- No full red backgrounds

MULTI-PAGE DOCUMENTS:
- When reviewing multi-page documents (e.g. PDFs, presentations, multi-page flyers), evaluate consistency across all pages as well as individual page quality
- Check that brand elements, fonts, colors, and spacing are consistent from page to page
- Note if certain pages are stronger or weaker than others

STRATEGIC DESIGN PRINCIPLES:
- Consider the medium — what works in print often fails digitally and vice versa
- Information hierarchy: what does the viewer see first, second, third?
- Is the call-to-action (CTA) clear and appropriately prominent?
- Does the piece respect the viewer's attention span for this medium?
- Does the design serve its purpose? (recruit, celebrate, promote, inform?)
- Design should feel: Innovative, Aspirational, Energetic, Authentic, Bold, Fresh

FEEDBACK STYLE — CRITICAL:
- Always pair problems with solutions. Never flag an issue without suggesting a specific fix.
- Good example: "The image feels small and loses impact. Consider extending it to a full-bleed layout so it fills the entire background, with text overlaid using a subtle dark gradient for legibility."
- Bad example: "The image is too small and loses impact."
- When suggesting layout improvements, be specific: mention full-bleed imagery, adjusting margins, redistributing whitespace, changing type sizing ratios, etc.
- The goal is to teach — help the marketer understand not just what is wrong but exactly how to fix it.

REVIEW DIMENSIONS — evaluate all 8:
1. Clarity and Communication — message clear at a glance? Hierarchy logical?
2. Brand Consistency — correct colors, fonts, logo usage, tone?
3. Visual Balance and Composition — layout intentional, whitespace balanced?
4. Typography — consistent, readable, correct fonts, weights, spacing? Call out specific font sizing issues.
5. Color — on-brand, sufficient contrast, WCAG accessibility? Correctly identify Digital Red #ED0707 as correct usage.
6. Consistency and Attention to Detail — margins, padding, icon sizes, spacing consistent? No typos or placeholders?
7. Purpose and Audience Fit — right for the medium and intended audience?
8. Strategic Effectiveness — medium-appropriate? CTA clear? Information load right?

OUTPUT — respond ONLY with a valid JSON object. No markdown fences, no preamble, no trailing text:
{
  "verdict": "Approved" or "Needs Revision" or "Major Revision Required",
  "summary": "2-3 sentence overall honest assessment",
  "whatWorks": ["specific strength 1", "specific strength 2"],
  "priorityFixes": ["specific actionable fix 1 with specific solution", "specific actionable fix 2 with specific solution"],
  "dimensions": [
    {
      "name": "dimension name",
      "rating": "Strong" or "Acceptable" or "Needs Improvement",
      "feedback": "Specific, educational, actionable feedback. Always pair problems with concrete solutions. Explain WHY something works or does not — the goal is to build design literacy."
    }
  ],
  "strategicNotes": "A paragraph on strategic effectiveness for this specific medium and purpose."
}

VERDICT GUIDE:
- Approved: Ready for corporate design team. Only minor notes.
- Needs Revision: Meaningful issues to fix first; resubmit after revision.
- Major Revision Required: Significant brand, design, or strategic problems needing substantial rework.

Be specific. Reference exact visual elements. Always suggest solutions alongside problems. Help the marketer understand WHY — not just that something is wrong.`;

const CHANNELS: Record<string, string> = {
  social: "Social Media Post / Story",
  print: "Print — Flyer, Postcard, Card",
  email: "Email Graphic / Header",
  digital_ad: "Digital Ad / Display",
  presentation: "Presentation / Slide Deck",
  event: "Event Material / Signage",
  video_thumbnail: "Video Thumbnail / Cover",
  other: "Other",
};

const MAX_BODY_CHARS = 10 * 1024 * 1024;
const MAX_LO_IMAGES = 3;
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4000;
const ALLOWED_ORIGIN = "https://mmdesignreview.netlify.app";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return jsonError("Method Not Allowed", 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("[anthropic-proxy] ANTHROPIC_API_KEY is not set");
    return jsonError("Server configuration error", 500);
  }

  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_CHARS) {
    console.error(`[anthropic-proxy] body too large: ${bodyText.length} chars`);
    return jsonError("Request too large", 413);
  }

  // deno-lint-ignore no-explicit-any
  let input: any;
  try {
    input = JSON.parse(bodyText);
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { designFile, loReferenceImages = [], channel, brandType, loNotes, extraNotes } = input;

  if (!designFile || !designFile.data || !designFile.type) {
    return jsonError("Missing required field: designFile", 400);
  }
  if (!CHANNELS[channel]) {
    return jsonError("Invalid channel value", 400);
  }
  if (brandType !== "movement" && brandType !== "lo") {
    return jsonError("Invalid brandType value", 400);
  }

  const channelLabel = CHANNELS[channel];
  // deno-lint-ignore no-explicit-any
  const content: any[] = [];

  if (designFile.type === "pdf") {
    content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: designFile.data } });
  } else {
    const mimeType = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(designFile.mimeType)
      ? designFile.mimeType
      : "image/jpeg";
    content.push({ type: "image", source: { type: "base64", media_type: mimeType, data: designFile.data } });
  }

  const safeLoImages = Array.isArray(loReferenceImages) ? loReferenceImages.slice(0, MAX_LO_IMAGES) : [];
  for (const img of safeLoImages) {
    if (img?.data) {
      const mimeType = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(img.mimeType)
        ? img.mimeType
        : "image/jpeg";
      content.push({ type: "image", source: { type: "base64", media_type: mimeType, data: img.data } });
    }
  }

  let prompt = `Review this ${channelLabel} design.`;
  if (brandType === "lo") {
    prompt += " This uses a Loan Officer's personal brand — evaluate against good design principles and the LO's brand rather than strictly Movement brand standards. Still check for required compliance elements (EHO, NMLS logos) where applicable.";
    if (loNotes && typeof loNotes === "string") prompt += ` LO brand guidance: ${loNotes.slice(0, 1000)}`;
    if (safeLoImages.length) prompt += ` ${safeLoImages.length} LO brand reference image(s) also provided above.`;
  } else {
    prompt += " This is a Movement Mortgage branded design — evaluate strictly against Movement brand standards.";
  }
  if (extraNotes && typeof extraNotes === "string") prompt += ` Additional context: ${extraNotes.slice(0, 1000)}`;
  prompt += " Respond only with the JSON review object.";
  content.push({ type: "text", text: prompt });

  console.log(`[anthropic-proxy] channel=${channel} brandType=${brandType} loImages=${safeLoImages.length}`);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: [{ role: "user", content }],
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error(`[anthropic-proxy] upstream error ${upstream.status}: ${errorText}`);
      return new Response(errorText, {
        status: upstream.status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    console.log("[anthropic-proxy] streaming response from Anthropic");
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        ...CORS_HEADERS,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[anthropic-proxy] fetch threw:", msg);
    return jsonError("Proxy fetch failed: " + msg, 502);
  }
};
