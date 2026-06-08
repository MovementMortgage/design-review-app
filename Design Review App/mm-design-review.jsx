import { useState, useRef, useCallback, useEffect } from "react";

// Load Montserrat from Google Fonts (approved Movement brand alternative to Gotham)
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap";
document.head.appendChild(fontLink);

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

const VERDICT_CFG = {
  "Approved": { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "ti-circle-check" },
  "Needs Revision": { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "ti-alert-circle" },
  "Major Revision Required": { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "ti-circle-x" },
};

const RATING_COLOR = {
  "Strong": "#16a34a",
  "Acceptable": "#d97706",
  "Needs Improvement": "#dc2626",
};

const ADMIN_PIN = "2008";

const FAILURE_MODES = [
  "Too harsh / nitpicky",
  "Too lenient / missed issues",
  "Wrong verdict",
  "Missed a brand violation",
  "Feedback wasn't specific enough",
  "Wrong for this asset type",
];

async function resizeImage(dataUrl, maxDim) {
  var dim = maxDim || 1800;
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var scale = Math.min(1, dim / Math.max(img.width, img.height));
      var w = Math.round(img.width * scale);
      var h = Math.round(img.height * scale);
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}

function getB64(dataUrl) { return dataUrl.split(",")[1]; }
function getMime(dataUrl) {
  var m = dataUrl.match(/data:([^;]+);/);
  return m ? m[1] : "image/jpeg";
}

function readFileAsDataUrl(file) {
  return new Promise(function(res, rej) {
    var r = new FileReader();
    r.onload = function(e) { res(e.target.result); };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function DesignReviewTool() {
  var [tab, setTab] = useState("review");
  var [design, setDesign] = useState(null);
  var [channel, setChannel] = useState("social");
  var [brandType, setBrandType] = useState("movement");
  var [loNotes, setLoNotes] = useState("");
  var [loImages, setLoImages] = useState([]);
  var [extraNotes, setExtraNotes] = useState("");
  var [loading, setLoading] = useState(false);
  var [result, setResult] = useState(null);
  var [error, setError] = useState("");
  var [copied, setCopied] = useState(false);
  var [expanded, setExpanded] = useState(null);
  var [hovering, setHovering] = useState(false);
  var [history, setHistory] = useState([]);
  var [pinUnlocked, setPinUnlocked] = useState(false);
  var [pinInput, setPinInput] = useState("");
  var [pinError, setPinError] = useState(false);
  var [flagging, setFlagging] = useState(null);
  var [flagIssues, setFlagIssues] = useState([]);
  var [flagNote, setFlagNote] = useState("");

  var designRef = useRef();
  var loImgRef = useRef();

  useEffect(function() {
    (async function() {
      try {
        var s = await window.storage.get("mm-review-history");
        if (s) setHistory(JSON.parse(s.value));
      } catch(e) {}
    })();
  }, []);

  async function saveHistory(next) {
    setHistory(next);
    try { await window.storage.set("mm-review-history", JSON.stringify(next)); } catch(e) {}
  }

  var loadDesign = useCallback(async function(file) {
    if (!file) return;
    var isImage = file.type.startsWith("image/");
    var isPDF = file.type === "application/pdf";
    if (!isImage && !isPDF) return;
    var raw = await readFileAsDataUrl(file);
    if (isImage) {
      var resized = await resizeImage(raw, 1800);
      setDesign({ type: "image", data: resized, name: file.name });
    } else {
      setDesign({ type: "pdf", data: raw, name: file.name });
    }
    setResult(null);
    setError("");
    setExpanded(null);
  }, []);

  var handlePaste = useCallback(async function(e) {
    var items = e.clipboardData ? e.clipboardData.items : [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/") || items[i].type === "application/pdf") {
        await loadDesign(items[i].getAsFile());
        break;
      }
    }
  }, [loadDesign]);

  useEffect(function() {
    window.addEventListener("paste", handlePaste);
    return function() { window.removeEventListener("paste", handlePaste); };
  }, [handlePaste]);

  async function handleLoImages(e) {
    var files = Array.from(e.target.files).slice(0, 3 - loImages.length);
    var imgs = [];
    for (var i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image/")) {
        var raw = await readFileAsDataUrl(files[i]);
        imgs.push(await resizeImage(raw, 1000));
      }
    }
    setLoImages(function(p) { return p.concat(imgs).slice(0, 3); });
    e.target.value = "";
  }

  async function submit() {
    if (!design) { setError("Please upload a design to review."); return; }
    setLoading(true); setError(""); setResult(null);

    var channelLabel = (CHANNELS.find(function(c) { return c.value === channel; }) || {}).label || channel;
    var content = [];
    if (design.type === "pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: getB64(design.data) } });
    } else {
      content.push({ type: "image", source: { type: "base64", media_type: getMime(design.data), data: getB64(design.data) } });
    }
    loImages.forEach(function(img) {
      content.push({ type: "image", source: { type: "base64", media_type: getMime(img), data: getB64(img) } });
    });

    var prompt = "Review this " + channelLabel + " design.";
    if (brandType === "lo") {
      prompt += " This uses a Loan Officer's personal brand — evaluate against good design principles and the LO's brand rather than strictly Movement brand standards. Still check for required compliance elements (EHO, NMLS logos) where applicable.";
      if (loNotes) prompt += " LO brand guidance: " + loNotes;
      if (loImages.length) prompt += " " + loImages.length + " LO brand reference image(s) also provided above.";
    } else {
      prompt += " This is a Movement Mortgage branded design — evaluate strictly against Movement brand standards.";
    }
    if (extraNotes) prompt += " Additional context: " + extraNotes;
    prompt += " Respond only with the JSON review object.";
    content.push({ type: "text", text: prompt });

    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: content }],
        }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error((data.error && data.error.message) || ("API error " + res.status));
      var text = (data.content || []).map(function(b) { return b.text || ""; }).join("").replace(/```json|```/g, "").trim();
      if (!text) throw new Error("Empty response");
      var parsed = JSON.parse(text);
      setResult(parsed);

      var entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        channel: channelLabel,
        brandType: brandType,
        verdict: parsed.verdict,
        summary: parsed.summary,
        dimensions: parsed.dimensions,
        whatWorks: parsed.whatWorks,
        priorityFixes: parsed.priorityFixes,
        strategicNotes: parsed.strategicNotes,
        thumb: design.type === "image" ? design.data : null,
        fileName: design.name || null,
        fileType: design.type,
        rating: null,
        flagIssues: [],
        flagNote: "",
      };
      await saveHistory([entry].concat(history).slice(0, 50));
    } catch(e) {
      setError("Review failed: " + (e.message || "Unknown error — please try again."));
    } finally {
      setLoading(false);
    }
  }

  function copyFeedback() {
    if (!result) return;
    var ch = (CHANNELS.find(function(c) { return c.value === channel; }) || {}).label || channel;
    var t = "DESIGN REVIEW — " + ch.toUpperCase() + "\nVerdict: " + result.verdict + "\n\nSUMMARY\n" + result.summary + "\n\n";
    if (result.whatWorks && result.whatWorks.length) t += "WHAT WORKS\n" + result.whatWorks.map(function(w) { return "* " + w; }).join("\n") + "\n\n";
    if (result.priorityFixes && result.priorityFixes.length) t += "PRIORITY FIXES\n" + result.priorityFixes.map(function(f) { return "* " + f; }).join("\n") + "\n\n";
    t += "DIMENSION BREAKDOWN\n";
    (result.dimensions || []).forEach(function(d) { t += "\n" + d.name + " — " + d.rating + "\n" + d.feedback + "\n"; });
    if (result.strategicNotes) t += "\nSTRATEGIC NOTES\n" + result.strategicNotes;
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  async function rateEntry(id, rating) {
    if (rating === "down") {
      setFlagging(id);
      setFlagIssues([]);
      setFlagNote("");
    } else {
      var next = history.map(function(e) {
        return e.id === id ? Object.assign({}, e, { rating: "up", flagIssues: [], flagNote: "" }) : e;
      });
      await saveHistory(next);
    }
  }

  async function submitFlag() {
    var next = history.map(function(e) {
      return e.id === flagging ? Object.assign({}, e, { rating: "down", flagIssues: flagIssues, flagNote: flagNote }) : e;
    });
    await saveHistory(next);
    setFlagging(null);
    setFlagIssues([]);
    setFlagNote("");
  }

  function toggleIssue(issue) {
    setFlagIssues(function(p) {
      return p.includes(issue) ? p.filter(function(i) { return i !== issue; }) : p.concat([issue]);
    });
  }

  function checkPin() {
    if (pinInput === ADMIN_PIN) {
      setPinUnlocked(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
      setPinInput("");
      setTimeout(function() { setPinError(false); }, 2000);
    }
  }

  async function undoRating(id) {
    var next = history.map(function(e) {
      return e.id === id ? Object.assign({}, e, { rating: null, flagIssues: [], flagNote: "" }) : e;
    });
    await saveHistory(next);
  }

  var vcfg = result ? VERDICT_CFG[result.verdict] : null;

  return (
    <div style={{ fontFamily: "Montserrat, var(--font-sans)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { font-family: Montserrat, var(--font-sans), sans-serif !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .dim-row:hover { background: var(--color-background-secondary) !important; }
        .tab-btn { cursor: pointer; border: none; background: transparent; padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: var(--border-radius-md); transition: all 0.15s; }
        .tab-btn:hover { background: var(--color-background-secondary); }
        .brand-opt { cursor: pointer; border-radius: var(--border-radius-md); padding: 10px 12px; text-align: left; transition: all 0.15s; }
        .thumb-btn { background: transparent; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 5px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 12px; transition: all 0.15s; font-family: var(--font-sans); }
        .thumb-btn:hover { background: var(--color-background-secondary); }
        .chip { cursor: pointer; border-radius: 100px; padding: 5px 12px; font-size: 12px; border: 0.5px solid var(--color-border-secondary); background: transparent; color: var(--color-text-secondary); transition: all 0.15s; font-family: var(--font-sans); }
        .chip:hover { background: var(--color-background-secondary); }
        .chip.on { background: var(--color-background-danger); border-color: var(--color-border-danger); color: var(--color-text-danger); }
        .undo-btn { background: transparent; border: none; color: var(--color-text-tertiary); font-size: 11px; cursor: pointer; font-family: var(--font-sans); margin-left: 6px; }
        .undo-btn:hover { text-decoration: underline; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48.56 48.56" style={{ width: "32px", height: "32px", flexShrink: 0 }} aria-label="Movement Mortgage"><path fill="#c8202f" d="M24.28,48.56A24.28,24.28,0,1,1,48.56,24.28,24.3,24.3,0,0,1,24.28,48.56Zm0-45.92A21.64,21.64,0,1,0,45.92,24.28,21.67,21.67,0,0,0,24.28,2.64Z"/><polygon fill="#c8202f" points="39.36 32.74 39.36 15.82 35.35 15.82 31.31 22.32 33.23 25.39 35.67 21.7 35.67 32.74 39.36 32.74"/><polygon fill="#c8202f" points="9.2 15.82 9.2 32.74 12.85 32.74 12.85 21.77 15.28 25.46 17.25 22.32 13.21 15.82 9.2 15.82"/><polygon fill="#c8202f" points="26.11 30.95 26.11 21.79 30.81 28.92 30.91 28.92 32.81 26.02 30.91 22.97 30.14 21.75 29.82 21.25 29.83 21.24 26.46 15.82 26.11 15.82 22.45 15.82 22.1 15.82 18.67 21.34 18.61 21.44 17.66 22.98 17.65 22.97 15.7 26.1 17.56 28.92 17.66 28.92 22.42 21.7 22.42 30.95 26.11 30.95"/></svg>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>Design Review</span>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>Movement Mortgage</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button className="tab-btn" onClick={function() { setTab("review"); }} style={{ color: tab === "review" ? "#ED0707" : "var(--color-text-secondary)" }}>Review</button>
          <button className="tab-btn" onClick={function() { setTab("history"); setPinUnlocked(false); }} style={{ color: tab === "history" ? "#ED0707" : "var(--color-text-secondary)" }}>
            History{history.length > 0 ? " (" + history.length + ")" : ""}
          </button>
        </div>
      </div>

      {tab === "review" ? (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", flex: 1, overflow: "hidden", minHeight: 0 }}>

          {/* Input panel */}
          <div style={{ borderRight: "0.5px solid var(--color-border-tertiary)", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>

            <div>
              <FL>Design to review</FL>
              <div
                onClick={function() { if (!design) designRef.current && designRef.current.click(); }}
                onDrop={async function(e) { e.preventDefault(); await loadDesign(e.dataTransfer.files[0]); }}
                onDragOver={function(e) { e.preventDefault(); }}
                onDragEnter={function() { setHovering(true); }}
                onDragLeave={function() { setHovering(false); }}
                style={{ border: design ? "0.5px solid var(--color-border-tertiary)" : ("1.5px dashed " + (hovering ? "var(--color-border-primary)" : "var(--color-border-secondary)")), borderRadius: "var(--border-radius-lg)", cursor: design ? "default" : "pointer", overflow: "hidden", position: "relative", background: design ? "transparent" : "var(--color-background-secondary)", minHeight: design ? "auto" : "100px", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.15s" }}
              >
                {design ? (
                  <>
                    {design.type === "image" ? (
                      <img src={design.data} alt="Design to review" style={{ width: "100%", display: "block", borderRadius: "var(--border-radius-lg)" }} />
                    ) : (
                      <div style={{ padding: "20px", textAlign: "center", width: "100%" }}>
                        <i className="ti ti-file-type-pdf" style={{ fontSize: "36px", color: "#dc2626", display: "block", marginBottom: "8px" }} aria-hidden="true" />
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>{design.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>PDF ready for review</div>
                      </div>
                    )}
                    <button onClick={function(e) { e.stopPropagation(); setDesign(null); setResult(null); }} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Remove file">
                      <i className="ti ti-x" style={{ fontSize: "12px" }} />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-tertiary)" }}>
                    <i className="ti ti-upload" style={{ fontSize: "24px", display: "block", marginBottom: "6px" }} aria-hidden="true" />
                    <div style={{ fontSize: "13px" }}>Drop image or PDF, click to browse, or paste</div>
                    <div style={{ fontSize: "11px", marginTop: "4px", color: "var(--color-text-tertiary)" }}>Supports single images and multi-page PDFs</div>
                  </div>
                )}
              </div>
              <input ref={designRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={function(e) { loadDesign(e.target.files[0]); }} />
            </div>

            <div>
              <FL>Channel / medium</FL>
              <select value={channel} onChange={function(e) { setChannel(e.target.value); }} style={{ width: "100%", fontSize: "13px" }}>
                {CHANNELS.map(function(c) { return <option key={c.value} value={c.value}>{c.label}</option>; })}
              </select>
            </div>

            <div>
              <FL>Brand type</FL>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[{ v: "movement", label: "Movement Mortgage", sub: "Standard MM brand" }, { v: "lo", label: "LO Brand", sub: "Loan officer has own brand" }].map(function(opt) {
                  return (
                    <button key={opt.v} className="brand-opt" onClick={function() { setBrandType(opt.v); }} style={{ border: "0.5px solid " + (brandType === opt.v ? "#ED0707" : "var(--color-border-tertiary)"), background: brandType === opt.v ? "rgba(237,7,7,0.05)" : "var(--color-background-primary)" }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: brandType === opt.v ? "#ED0707" : "var(--color-text-primary)" }}>{opt.label}</div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{opt.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {brandType === "lo" && (
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "14px", border: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <FL>LO brand guidance</FL>
                  <textarea value={loNotes} onChange={function(e) { setLoNotes(e.target.value); }} placeholder="e.g. Brand colors are coral and navy. Clean, modern feel. Tagline: Make It Home." style={{ width: "100%", height: "72px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div>
                  <FL>LO brand reference images (optional, max 3)</FL>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {loImages.map(function(img, i) {
                      return (
                        <div key={i} style={{ position: "relative" }}>
                          <img src={img} alt="" style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }} />
                          <button onClick={function() { setLoImages(function(p) { return p.filter(function(_, j) { return j !== i; }); }); }} style={{ position: "absolute", top: "-4px", right: "-4px", background: "#dc2626", border: "none", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Remove">
                            <i className="ti ti-x" style={{ fontSize: "10px" }} />
                          </button>
                        </div>
                      );
                    })}
                    {loImages.length < 3 && (
                      <button onClick={function() { loImgRef.current && loImgRef.current.click(); }} style={{ width: "64px", height: "64px", border: "1px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }} aria-label="Add reference image">
                        <i className="ti ti-plus" style={{ fontSize: "18px" }} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <input ref={loImgRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleLoImages} />
                </div>
              </div>
            )}

            <div>
              <FL>Additional context (optional)</FL>
              <textarea value={extraNotes} onChange={function(e) { setExtraNotes(e.target.value); }} placeholder="e.g. Recruiting event for Realtors in Texas, or LO requested this specific layout" style={{ width: "100%", height: "64px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {error && (
              <div style={{ background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", fontSize: "13px", color: "var(--color-text-danger)" }}>{error}</div>
            )}

            <button onClick={submit} disabled={loading || !design} style={{ background: (loading || !design) ? "var(--color-background-secondary)" : "#ED0707", color: (loading || !design) ? "var(--color-text-tertiary)" : "#fff", border: "none", borderRadius: "var(--border-radius-md)", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: (loading || !design) ? "not-allowed" : "pointer", width: "100%", transition: "all 0.2s" }}>
              {loading ? "Analyzing design..." : "Review design"}
            </button>
          </div>

          {/* Results panel */}
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

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: vcfg.bg, border: "0.5px solid " + vcfg.border, borderRadius: "var(--border-radius-md)", padding: "8px 14px" }}>
                    <i className={"ti " + vcfg.icon} style={{ fontSize: "16px", color: vcfg.color }} aria-hidden="true" />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: vcfg.color }}>{result.verdict}</span>
                  </div>
                  <button onClick={copyFeedback} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: copied ? "var(--color-text-success)" : "var(--color-text-secondary)", background: "transparent", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "7px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                    <i className={"ti " + (copied ? "ti-check" : "ti-copy")} style={{ fontSize: "14px" }} aria-hidden="true" />
                    {copied ? "Copied" : "Copy feedback"}
                  </button>
                </div>

                <Crd>
                  <SL>Summary</SL>
                  <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
                </Crd>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Crd accent="success">
                    <SL icon="ti-check" color="var(--color-text-success)">What works</SL>
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {(result.whatWorks || []).map(function(w, i) { return <li key={i} style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "4px" }}>{w}</li>; })}
                    </ul>
                  </Crd>
                  <Crd accent="danger">
                    <SL icon="ti-alert-triangle" color="var(--color-text-danger)">Priority fixes</SL>
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {(result.priorityFixes || []).map(function(f, i) { return <li key={i} style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "4px" }}>{f}</li>; })}
                    </ul>
                  </Crd>
                </div>

                <div>
                  <SL>Dimension breakdown</SL>
                  <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
                    {(result.dimensions || []).map(function(d, i) {
                      return (
                        <div key={i}>
                          {i > 0 && <div style={{ height: "0.5px", background: "var(--color-border-tertiary)" }} />}
                          <div className="dim-row" onClick={function() { setExpanded(expanded === i ? null : i); }} style={{ padding: "12px 16px", cursor: "pointer", background: "var(--color-background-primary)", transition: "background 0.1s" }} role="button" aria-expanded={expanded === i}>
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
                            {expanded === i && <div style={{ marginTop: "10px", paddingLeft: "17px", fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{d.feedback}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {result.strategicNotes && (
                  <Crd>
                    <SL icon="ti-bulb" color="#ED0707">Strategic notes</SL>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{result.strategicNotes}</p>
                  </Crd>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History tab */
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!pinUnlocked ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px" }}>
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "32px", maxWidth: "320px", width: "100%", textAlign: "center" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#ED0707", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className="ti ti-lock" style={{ fontSize: "20px", color: "#fff" }} aria-hidden="true" />
                </div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "6px" }}>Admin access required</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)", marginBottom: "20px" }}>Enter your PIN to view and audit review history.</div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={function(e) { setPinInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter") checkPin(); }}
                  placeholder="Enter PIN"
                  maxLength={6}
                  style={{ width: "100%", textAlign: "center", fontSize: "20px", letterSpacing: "6px", marginBottom: "12px", boxSizing: "border-box", animation: pinError ? "shake 0.3s ease" : "none", borderColor: pinError ? "var(--color-border-danger)" : undefined }}
                />
                {pinError && <div style={{ fontSize: "12px", color: "var(--color-text-danger)", marginBottom: "10px" }}>Incorrect PIN — try again.</div>}
                <button onClick={checkPin} style={{ width: "100%", background: "#ED0707", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", padding: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                  Unlock history
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)" }}>Review history</div>
                <button onClick={function() { setPinUnlocked(false); }} style={{ background: "transparent", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "5px 12px", fontSize: "12px", color: "var(--color-text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontFamily: "Montserrat, var(--font-sans)" }}>
                  <i className="ti ti-lock" style={{ fontSize: "13px" }} aria-hidden="true" /> Lock
                </button>
              </div>

              {history.length === 0 ? (
                <div style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>No reviews yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "800px" }}>
                  {history.map(function(entry) {
                    var cfg = VERDICT_CFG[entry.verdict] || {};
                    var isFlagging = flagging === entry.id;
                    var borderCol = entry.rating === "down" ? "var(--color-border-danger)" : entry.rating === "up" ? "var(--color-border-success)" : "var(--color-border-tertiary)";
                    return (
                      <div key={entry.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid " + borderCol, borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>

                        <div style={{ padding: "14px 16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                          {entry.thumb ? (
                            <img src={entry.thumb} alt="" style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "var(--border-radius-md)", flexShrink: 0, border: "0.5px solid var(--color-border-tertiary)" }} />
                          ) : (
                            <div style={{ width: "52px", height: "52px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "var(--color-background-secondary)" }}>
                              <i className="ti ti-file-type-pdf" style={{ fontSize: "22px", color: "#dc2626" }} aria-hidden="true" />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", fontWeight: 500, color: cfg.color }}>{entry.verdict}</span>
                              <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>·</span>
                              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{entry.channel}</span>
                              <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>·</span>
                              <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                                {new Date(entry.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} {new Date(entry.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", margin: "0 0 10px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {entry.summary}
                            </p>

                            {entry.rating === null && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Rate this review:</span>
                                <button className="thumb-btn" onClick={function() { rateEntry(entry.id, "up"); }} style={{ color: "var(--color-text-success)" }}>
                                  <i className="ti ti-thumb-up" style={{ fontSize: "13px" }} aria-hidden="true" /> Accurate
                                </button>
                                <button className="thumb-btn" onClick={function() { rateEntry(entry.id, "down"); }} style={{ color: "var(--color-text-danger)" }}>
                                  <i className="ti ti-thumb-down" style={{ fontSize: "13px" }} aria-hidden="true" /> Flag issue
                                </button>
                              </div>
                            )}

                            {entry.rating === "up" && (
                              <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "var(--color-text-success)" }}>
                                <i className="ti ti-thumb-up" style={{ fontSize: "13px", marginRight: "5px" }} aria-hidden="true" /> Marked accurate
                                <button className="undo-btn" onClick={function() { undoRating(entry.id); }}>undo</button>
                              </div>
                            )}

                            {entry.rating === "down" && (
                              <div style={{ fontSize: "12px", color: "var(--color-text-danger)" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                                  <i className="ti ti-flag" style={{ fontSize: "13px", marginTop: "1px", flexShrink: 0 }} aria-hidden="true" />
                                  <span>
                                    Flagged{entry.flagIssues && entry.flagIssues.length > 0 ? ": " + entry.flagIssues.join(", ") : ""}
                                    {entry.flagNote ? <span style={{ color: "var(--color-text-tertiary)" }}> — "{entry.flagNote}"</span> : null}
                                  </span>
                                  <button className="undo-btn" onClick={function() { undoRating(entry.id); }}>undo</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {isFlagging && (
                          <div style={{ borderTop: "0.5px solid var(--color-border-danger)", background: "var(--color-background-danger)", padding: "16px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-danger)", marginBottom: "10px" }}>What was off? Select all that apply.</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                              {FAILURE_MODES.map(function(mode) {
                                return (
                                  <button key={mode} className={"chip" + (flagIssues.includes(mode) ? " on" : "")} onClick={function() { toggleIssue(mode); }}>{mode}</button>
                                );
                              })}
                            </div>
                            <textarea value={flagNote} onChange={function(e) { setFlagNote(e.target.value); }} placeholder="Optional: add a note for context..." style={{ width: "100%", height: "56px", fontSize: "13px", resize: "none", boxSizing: "border-box", marginBottom: "10px" }} />
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={submitFlag} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", padding: "7px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "Montserrat, var(--font-sans)" }}>Submit flag</button>
                              <button onClick={function() { setFlagging(null); }} style={{ background: "transparent", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "7px 16px", fontSize: "13px", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "Montserrat, var(--font-sans)" }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FL({ children }) {
  return <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-tertiary)", marginBottom: "6px", letterSpacing: "0.4px" }}>{children}</div>;
}

function SL({ children, icon, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 500, color: color || "var(--color-text-tertiary)", marginBottom: "8px", letterSpacing: "0.4px" }}>
      {icon && <i className={"ti " + icon} style={{ fontSize: "13px" }} aria-hidden="true" />}
      {children}
    </div>
  );
}

function Crd({ children, accent }) {
  var borderColor = accent === "success" ? "var(--color-border-success)" : accent === "danger" ? "var(--color-border-danger)" : "var(--color-border-tertiary)";
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid " + borderColor, borderRadius: "var(--border-radius-lg)", padding: "14px 16px" }}>
      {children}
    </div>
  );
}
