import { useState, useRef, useCallback, useEffect } from "react";

const SYSTEM_PROMPT = `You are a senior brand and design reviewer for Movement Mortgage, a national mortgage company. Your role is to give structured, constructive, educational feedback to field marketing staff on design submissions — helping them grow their design skills and catch issues before designs reach the corporate design team.

MOVEMENT MORTGAGE BRAND GUIDELINES

COLORS:
- Brand Red (for all designs): #ED0707 — use for all red elements EXCEPT the MM logo mark itself
- Logo Red: #C7202F — used ONLY for the circular MM logo mark
- Near Black: #1A1A1A
- Body Copy Gray: #515151
- Mid Gray: #9e9e9e — legal/footer only
- Light Gray: #d3d3d3 — legal/footer only
- Gold/Yellow: accent use only, used sparingly
- Off-white/cream: accent use only
- Recommendation: for all design red (not logo), prefer #ED0707 as it feels more modern and elevated than darker reds

TYPOGRAPHY:
- Primary: Gotham (Book, Medium, Bold, Black, Ultra) — free alt: Montserrat
- Secondary: Knockout (weights 26–30, 46–50, 54, 74, 94) — free alt: Antonio
  - Knockout Sumo, Ultimate Sumo, Full Sumo: letter-spacing -50
  - All other Knockout weights: letter-spacing -20
- No unapproved fonts
- Font sizes in whole or half-point increments only
- Strong hierarchy required: headline → subheadline → body copy clearly differentiated

LOGO RULES:
- Logo must always remain proportionate — never stretch or distort
- Clear space around logo = height/width of the circular MM emblem
- Logo must remain legible on any background
- Social media default: use MM outline emblem (mm-mark-outline-logo)
- Texas-specific content: use split-mm-logo_NEW
- Social graphics MUST include all three: Movement Mortgage logo + EHO logo + NMLS logo
- EHO and NMLS logos must always appear together as a pair

LAYOUT & COMPOSITION:
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

ICONS & ILLUSTRATION:
- Outlined icon style preferred
- Enclosed in a circle as primary execution (not required if intentional)
- Clean, modern, cohesive — never juvenile

SOCIAL MEDIA SPECIFIC RULES (critical):
- Minimal text — keep it concise and scannable
- QR codes do NOT belong on social graphics (cannot be scanned from a screen in a feed)
- Too much information overwhelms — prioritize one clear message
- Required: MM logo + EHO logo + NMLS logo (EHO and NMLS always paired)
- LO headshot should be prominent if LO is featured
- No full red backgrounds

STRATEGIC DESIGN PRINCIPLES:
- Consider the medium — what works in print often fails digitally and vice versa
- Information hierarchy: what does the viewer see first, second, third?
- Is the call-to-action (CTA) clear and appropriately prominent?
- Does the piece respect the viewer's attention span for this medium?
- Does the design serve its purpose? (recruit, celebrate, promote, inform?)
- Design should feel: Innovative, Aspirational, Energetic, Authentic, Bold, Fresh

REVIEW DIMENSIONS — evaluate all 8:
1. Clarity & Communication — message clear at a glance? Hierarchy logical?
2. Brand Consistency — correct colors, fonts, logo usage, tone?
3. Visual Balance & Composition — layout intentional, whitespace balanced?
4. Typography — consistent, readable, correct fonts, weights, spacing?
5. Color — on-brand, sufficient contrast, WCAG accessibility?
6. Consistency & Attention to Detail — margins, spacing, no typos or placeholders?
7. Purpose & Audience Fit — right for the medium and intended audience?
8. Strategic Effectiveness — medium-appropriate? CTA clear? Information load right?

OUTPUT — respond ONLY with a valid JSON object. No markdown fences, no preamble, no trailing text:
{
  "verdict": "Approved" | "Needs Revision" | "Major Revision Required",
  "summary": "2–3 sentence overall honest assessment",
  "whatWorks": ["specific strength 1", "specific strength 2"],
  "priorityFixes": ["specific actionable fix 1", "specific actionable fix 2"],
  "dimensions": [
    {
      "name": "dimension name",
      "rating": "Strong" | "Acceptable" | "Needs Improvement",
      "feedback": "Specific, educational, actionable feedback. Explain WHY something works or doesn't — the goal is to build design literacy."
    }
  ],
  "strategicNotes": "A paragraph on strategic effectiveness for this specific medium and purpose."
}

VERDICT GUIDE:
- "Approved": Ready for corporate design team. Only minor notes.
- "Needs Revision": Meaningful issues to fix first; resubmit after revision.
- "Major Revision Required": Significant brand, design, or strategic problems needing substantial rework.

Be specific. Reference exact visual elements. Help the marketer understand WHY — not just that something is wrong.`;

const CHANNELS = [
  { value: "social", label: "Social Media Post / Story" },
  { value: "print", label: "Print — Flyer, Postcard, Card" },
  { value: "email", label: "Email Graphic / Header" },
  { value: "digital_ad", label: "Digital Ad / Display" },
  { value: "presentation", label: "Presentation / Slide Deck" },
  { value: "event", label: "Event Material / Signage" },
  { value: "video_thumbnail", label: "Video Thumbnail / Cover" },
  { value: "other", label: "Other" },
];

const VERDICT = {
  "Approved": { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "ti-circle-check" },
  "Needs Revision": { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "ti-alert-circle" },
  "Major Revision Required": { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "ti-circle-x" },
};

const RATING_COLOR = {
  "Strong": "#16a34a",
  "Acceptable": "#d97706",
  "Needs Improvement": "#dc2626",
};

async function resizeImage(dataUrl, maxDim = 1800) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}

function b64(dataUrl) { return dataUrl.split(",")[1]; }
function mime(dataUrl) { return (dataUrl.match(/data:([^;]+);/) || [])[1] || "image/jpeg"; }

async function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const STORAGE_KEY = "mm-review-history";

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export default function DesignReviewTool() {
  const [tab, setTab] = useState("review");
  const [design, setDesign] = useState(null);
  const [channel, setChannel] = useState("social");
  const [brandType, setBrandType] = useState("movement");
  const [loNotes, setLoNotes] = useState("");
  const [loImages, setLoImages] = useState([]);
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState(() => loadHistory());
  const [hovering, setHovering] = useState(false);

  const designRef = useRef();
  const loImgRef = useRef();

  const loadDesign = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const raw = await readFile(file);
    const resized = await resizeImage(raw);
    setDesign(resized);
    setResult(null);
    setError("");
    setExpanded(null);
  }, []);

  const handlePaste = useCallback(async (e) => {
    for (const item of (e.clipboardData?.items || [])) {
      if (item.type.startsWith("image/")) {
        await loadDesign(item.getAsFile());
        break;
      }
    }
  }, [loadDesign]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleLoImages = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - loImages.length);
    const imgs = [];
    for (const f of files) {
      if (f.type.startsWith("image/")) {
        const raw = await readFile(f);
        imgs.push(await resizeImage(raw, 1000));
      }
    }
    setLoImages(p => [...p, ...imgs].slice(0, 3));
    e.target.value = "";
  };

  const submit = async () => {
    if (!design) { setError("Please upload a design to review."); return; }
    setLoading(true); setError(""); setResult(null);

    const channelLabel = CHANNELS.find(c => c.value === channel)?.label || channel;
    const content = [
      { type: "image", source: { type: "base64", media_type: mime(design), data: b64(design) } },
      ...loImages.map(img => ({ type: "image", source: { type: "base64", media_type: mime(img), data: b64(img) } })),
    ];

    let prompt = `Review this ${channelLabel} design.`;
    if (brandType === "lo") {
      prompt += ` This uses a Loan Officer's personal brand — evaluate against good design principles and the LO's brand rather than strictly Movement brand standards. Still check for required compliance elements (EHO, NMLS logos) where applicable.`;
      if (loNotes) prompt += ` LO brand guidance: ${loNotes}`;
      if (loImages.length) prompt += ` ${loImages.length} LO brand reference image(s) also provided above.`;
    } else {
      prompt += ` This is a Movement Mortgage branded design — evaluate strictly against Movement brand standards.`;
    }
    if (extraNotes) prompt += ` Additional context: ${extraNotes}`;
    prompt += ` Respond only with the JSON review object.`;
    content.push({ type: "text", text: prompt });

    try {
      const res = await fetch("/.netlify/functions/anthropic-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content }],
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setResult(parsed);

      const entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        channel: channelLabel,
        brandType,
        verdict: parsed.verdict,
        summary: parsed.summary,
        dimensions: parsed.dimensions,
        whatWorks: parsed.whatWorks,
        priorityFixes: parsed.priorityFixes,
        strategicNotes: parsed.strategicNotes,
        thumb: design,
      };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next);
      saveHistory(next);
    } catch {
      setError("Review failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyFeedback = () => {
    if (!result) return;
    const ch = CHANNELS.find(c => c.value === channel)?.label || channel;
    let t = `DESIGN REVIEW — ${ch.toUpperCase()}\nVerdict: ${result.verdict}\n\nSUMMARY\n${result.summary}\n\n`;
    if (result.whatWorks?.length) t += `WHAT WORKS\n${result.whatWorks.map(w => `• ${w}`).join("\n")}\n\n`;
    if (result.priorityFixes?.length) t += `PRIORITY FIXES\n${result.priorityFixes.map(f => `• ${f}`).join("\n")}\n\n`;
    t += `DIMENSION BREAKDOWN\n`;
    result.dimensions?.forEach(d => { t += `\n${d.name} — ${d.rating}\n${d.feedback}\n`; });
    if (result.strategicNotes) t += `\nSTRATEGIC NOTES\n${result.strategicNotes}`;
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vcfg = result ? VERDICT[result.verdict] : null;

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .dim-row:hover { background: var(--color-background-secondary) !important; }
        .tab-btn { cursor: pointer; border: none; background: transparent; padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: var(--border-radius-md); transition: background 0.15s, color 0.15s; }
        .tab-btn:hover { background: var(--color-background-secondary); }
        .upload-zone:hover { border-color: var(--color-border-primary) !important; }
        .brand-btn { cursor: pointer; border-radius: var(--border-radius-md); padding: 10px 12px; text-align: left; transition: all 0.15s; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#ED0707", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "-0.5px" }}>MM</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>Design Review</span>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>Movement Mortgage</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button className="tab-btn" onClick={() => setTab("review")} style={{ color: tab === "review" ? "#ED0707" : "var(--color-text-secondary)", fontWeight: tab === "review" ? 500 : 400 }}>Review</button>
          <button className="tab-btn" onClick={() => setTab("history")} style={{ color: tab === "history" ? "#ED0707" : "var(--color-text-secondary)", fontWeight: tab === "history" ? 500 : 400 }}>History {history.length > 0 && `(${history.length})`}</button>
        </div>
      </div>

      {tab === "review" ? (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", flex: 1, overflow: "hidden", minHeight: 0 }}>

          {/* Left panel */}
          <div style={{ borderRight: "0.5px solid var(--color-border-tertiary)", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Upload */}
            <div>
              <FieldLabel>Design to review</FieldLabel>
              <div
                className="upload-zone"
                onClick={() => !design && designRef.current?.click()}
                onDrop={async e => { e.preventDefault(); await loadDesign(e.dataTransfer.files[0]); }}
                onDragOver={e => e.preventDefault()}
                onDragEnter={() => setHovering(true)}
                onDragLeave={() => setHovering(false)}
                style={{
                  border: design ? "0.5px solid var(--color-border-tertiary)" : `1.5px dashed ${hovering ? "var(--color-border-primary)" : "var(--color-border-secondary)"}`,
                  borderRadius: "var(--border-radius-lg)",
                  cursor: design ? "default" : "pointer",
                  overflow: "hidden",
                  position: "relative",
                  background: design ? "transparent" : "var(--color-background-secondary)",
                  minHeight: design ? "auto" : "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.15s",
                }}
              >
                {design ? (
                  <>
                    <img src={design} alt="Design" style={{ width: "100%", display: "block", borderRadius: "var(--border-radius-lg)" }} />
                    <button
                      onClick={e => { e.stopPropagation(); setDesign(null); setResult(null); }}
                      style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <i className="ti ti-x" style={{ fontSize: "12px" }} aria-label="Remove" />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-tertiary)" }}>
                    <i className="ti ti-upload" style={{ fontSize: "24px", display: "block", marginBottom: "6px" }} aria-hidden="true" />
                    <div style={{ fontSize: "13px" }}>Drop image, click to browse, or paste</div>
                  </div>
                )}
              </div>
              <input ref={designRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => loadDesign(e.target.files[0])} />
            </div>

            {/* Channel */}
            <div>
              <FieldLabel>Channel / medium</FieldLabel>
              <select value={channel} onChange={e => setChannel(e.target.value)} style={{ width: "100%", fontSize: "13px" }}>
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Brand type */}
            <div>
              <FieldLabel>Brand type</FieldLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { v: "movement", label: "Movement Mortgage", sub: "Standard MM brand" },
                  { v: "lo", label: "LO Brand", sub: "Loan officer has own brand" },
                ].map(opt => (
                  <button key={opt.v} className="brand-btn" onClick={() => setBrandType(opt.v)} style={{ border: `0.5px solid ${brandType === opt.v ? "#ED0707" : "var(--color-border-tertiary)"}`, background: brandType === opt.v ? "rgba(237,7,7,0.05)" : "var(--color-background-primary)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: brandType === opt.v ? "#ED0707" : "var(--color-text-primary)" }}>{opt.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* LO brand details */}
            {brandType === "lo" && (
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "14px", border: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <FieldLabel>LO brand guidance</FieldLabel>
                  <textarea
                    value={loNotes}
                    onChange={e => setLoNotes(e.target.value)}
                    placeholder="e.g. 'Brand colors are coral #FF6B6B and navy #1B2A4A. Clean, modern feel. Tagline: Make It Home.'"
                    style={{ width: "100%", height: "72px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <FieldLabel>LO brand reference images (optional, max 3)</FieldLabel>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {loImages.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={img} alt="" style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }} />
                        <button onClick={() => setLoImages(p => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: "-4px", right: "-4px", background: "#dc2626", border: "none", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ti ti-x" style={{ fontSize: "10px" }} aria-label="Remove" />
                        </button>
                      </div>
                    ))}
                    {loImages.length < 3 && (
                      <button onClick={() => loImgRef.current?.click()} style={{ width: "64px", height: "64px", border: "1px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                        <i className="ti ti-plus" style={{ fontSize: "18px" }} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <input ref={loImgRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleLoImages} />
                </div>
              </div>
            )}

            {/* Extra notes */}
            <div>
              <FieldLabel>Additional context (optional)</FieldLabel>
              <textarea
                value={extraNotes}
                onChange={e => setExtraNotes(e.target.value)}
                placeholder="e.g. 'Recruiting event for Realtors in Texas' or 'LO requested this specific layout'"
                style={{ width: "100%", height: "64px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", fontSize: "13px", color: "var(--color-text-danger)" }}>
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || !design}
              style={{ background: loading || !design ? "var(--color-background-secondary)" : "#ED0707", color: loading || !design ? "var(--color-text-tertiary)" : "#fff", border: "none", borderRadius: "var(--border-radius-md)", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: loading || !design ? "not-allowed" : "pointer", width: "100%", transition: "all 0.2s", letterSpacing: "0.3px" }}
            >
              {loading ? "Analyzing design..." : "Review design"}
            </button>
          </div>

          {/* Right panel */}
          <div style={{ padding: "24px", overflowY: "auto" }}>
            {!result && !loading && (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px", color: "var(--color-text-tertiary)" }}>
                <i className="ti ti-layout-grid" style={{ fontSize: "32px" }} aria-hidden="true" />
                <div style={{ fontSize: "14px" }}>Upload a design to begin</div>
              </div>
            )}

            {loading && (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "var(--color-text-tertiary)" }}>
                <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTop: "2px solid #ED0707", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} role="status" aria-label="Analyzing" />
                <div style={{ fontSize: "13px" }}>Analyzing design...</div>
              </div>
            )}

            {result && vcfg && (
              <div style={{ maxWidth: "660px", display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Verdict row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: vcfg.bg, border: `0.5px solid ${vcfg.border}`, borderRadius: "var(--border-radius-md)", padding: "8px 14px" }}>
                    <i className={`ti ${vcfg.icon}`} style={{ fontSize: "16px", color: vcfg.color }} aria-hidden="true" />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: vcfg.color }}>{result.verdict}</span>
                  </div>
                  <button onClick={copyFeedback} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: copied ? "var(--color-text-success)" : "var(--color-text-secondary)", background: "transparent", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "7px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                    <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} style={{ fontSize: "14px" }} aria-hidden="true" />
                    {copied ? "Copied" : "Copy feedback"}
                  </button>
                </div>

                {/* Summary */}
                <Card>
                  <SectionLabel>Summary</SectionLabel>
                  <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
                </Card>

                {/* What works + fixes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Card accent="success">
                    <SectionLabel icon="ti-check" color="var(--color-text-success)">What works</SectionLabel>
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {result.whatWorks?.map((w, i) => <li key={i} style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "4px" }}>{w}</li>)}
                    </ul>
                  </Card>
                  <Card accent="danger">
                    <SectionLabel icon="ti-alert-triangle" color="var(--color-text-danger)">Priority fixes</SectionLabel>
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {result.priorityFixes?.map((f, i) => <li key={i} style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "4px" }}>{f}</li>)}
                    </ul>
                  </Card>
                </div>

                {/* Dimension breakdown */}
                <div>
                  <SectionLabel>Dimension breakdown</SectionLabel>
                  <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
                    {result.dimensions?.map((d, i) => (
                      <div key={i}>
                        {i > 0 && <div style={{ height: "0.5px", background: "var(--color-border-tertiary)" }} />}
                        <div
                          className="dim-row"
                          onClick={() => setExpanded(expanded === i ? null : i)}
                          style={{ padding: "12px 16px", cursor: "pointer", background: "var(--color-background-primary)", transition: "background 0.1s" }}
                          role="button"
                          aria-expanded={expanded === i}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: RATING_COLOR[d.rating] || "#888", flexShrink: 0 }} />
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{d.name}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 500, color: RATING_COLOR[d.rating], letterSpacing: "0.3px" }}>{d.rating}</span>
                              <i className="ti ti-chevron-down" style={{ fontSize: "14px", color: "var(--color-text-tertiary)", transform: expanded === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} aria-hidden="true" />
                            </div>
                          </div>
                          {expanded === i && (
                            <div style={{ marginTop: "10px", paddingLeft: "17px", fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                              {d.feedback}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic notes */}
                {result.strategicNotes && (
                  <Card>
                    <SectionLabel icon="ti-bulb" color="#ED0707">Strategic notes</SectionLabel>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{result.strategicNotes}</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History tab */
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "20px", color: "var(--color-text-primary)" }}>Review history</h2>
          {history.length === 0 ? (
            <div style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>No reviews yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "760px" }}>
              {history.map(entry => {
                const cfg = VERDICT[entry.verdict] || {};
                return (
                  <div key={entry.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    {entry.thumb && <img src={entry.thumb} alt="" style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "var(--border-radius-md)", flexShrink: 0, border: "0.5px solid var(--color-border-tertiary)" }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: cfg.color }}>{entry.verdict}</span>
                        <span style={{ fontSize: "11px", color: "var(--color-border-secondary)" }}>·</span>
                        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{entry.channel}</span>
                        <span style={{ fontSize: "11px", color: "var(--color-border-secondary)" }}>·</span>
                        <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                          {new Date(entry.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} {new Date(entry.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {entry.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-tertiary)", marginBottom: "6px", letterSpacing: "0.4px" }}>{children}</div>;
}

function SectionLabel({ children, icon, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 500, color: color || "var(--color-text-tertiary)", marginBottom: "8px", letterSpacing: "0.4px" }}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: "13px" }} aria-hidden="true" />}
      {children}
    </div>
  );
}

function Card({ children, accent }) {
  const borderColor = accent === "success" ? "var(--color-border-success)" : accent === "danger" ? "var(--color-border-danger)" : "var(--color-border-tertiary)";
  return (
    <div style={{ background: "var(--color-background-primary)", border: `0.5px solid ${borderColor}`, borderRadius: "var(--border-radius-lg)", padding: "14px 16px" }}>
      {children}
    </div>
  );
}
