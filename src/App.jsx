import { useState, useRef, useCallback } from "react";

const SUPA_URL = "https://bfsieishsrhshjmijwtx.supabase.co/rest/v1";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc2llaXNoc3Joc2hqbWlqd3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjU1MjYsImV4cCI6MjA5NTU0MTUyNn0.XPSzYvtaVPwdE9t5kotyh3HKNs2PSgamBNZhntUT2TE";

const SUPA_HEADERS = {
  "Content-Type": "application/json",
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  Prefer: "return=representation",
};

const isMobile = window.innerWidth < 768;
const SKILL_PROMPT = `Tu es un assistant spécialisé dans l'apprentissage du coréen. Tu analyses des photos de manuel scolaire (살아있는 한국어 niveaux 1-6) et structures les données.

ÉTAPE 1 — Identifier le type de contenu parmi : texte | vocabulaire | texte+vocabulaire | grammaire | expressions (쓰기/읽기). Si ambiguïté, demande confirmation. Si image floue, demande une nouvelle photo.

ÉTAPE 2 — Vérifie que tu as : niveau du livre (1-6) et numéro de chapitre. Si absent, demande.

ÉTAPE 3 — Traitement :

TYPE texte/texte+vocabulaire :
1. Réécriture coréenne propre entière
2. Traduction anglaise complète entière
3. Traduction française complète entière
4. Si vocabulaire présent : tableau avec colonnes mot|type|definition_kr|fr|en|niveau_reel|topik_objectif|usage|theme|chapitre|exemple|statut
   - utilise OBLIGATOIREMENT le texte comme contexte pour enrichir les traductions et définitions des mots de vocabulaire
   - fr et en : si plusieurs définitions, format (1) déf1 (2) déf2 (3) déf3
   - topik_objectif: ≤4→4, >4→5ou6, quotidien→7
   - usage: quotidien|travail|topik (séparateur |)
   - theme: mots-clés séparés par |
   - statut défaut: inconnu

TYPE vocabulaire seul : cherche si un texte a été fourni dans la conversation pour contextualiser.

TYPE grammaire : pour chaque grammaire :
- Si elle existe déjà en DB : présente les 2 versions et demande validation
- Si définition absente sur photo : demande OBLIGATOIREMENT à l'utilisateur de la fournir avant de continuer. Ne génère JAMAIS de vocabulaire associé à une grammaire.
- Ne propose JAMAIS de mots de vocabulaire dans une analyse de type grammaire.
- Format fiche :
  ### [GRAMMAIRE]
  Catégorie | Sous-catégorie | Oral/Écrit | Niveau réel | TOPIK objectif | Usage
  Définition KR / Définition FR (1-2 phrases)
  Points importants (liste)
  Grammaires similaires (nom coréen)
  Exemples (2 max, format: coréen → français)

TYPE expressions (쓰기/읽기) : détaille chaque expression, traduction FR+EN, nuance, exemple, registre (oral/écrit/formel/informel).

ÉTAPE 4 — Retourne OBLIGATOIREMENT à la fin un bloc JSON structuré ainsi :
\`\`\`json
{
  "type": "texte|vocabulaire|grammaire|expressions",
  "meta": { "niveau": 1, "chapitre": "1.1" },
  "texte": { "ko": "...", "fr": "...", "en": "..." },
  "vocabulaire": [...],
  "grammaire": [...],
  "expressions": [...]
}
\`\`\`
Chaque entrée vocabulaire : {mot,type,definition_kr,fr,en,niveau_reel,topik_objectif,usage,theme,chapitre,exemple,statut}
Chaque entrée grammaire : {grammaire,categorie,sous_categorie,definition_kr,definition_fr,oral_ecrit,niveau_reel,topik_objectif,usage,grammaires_similaires,points_importants,exemples,chapitre,statut}`;

async function supabase(path, method = "GET", body = null) {
  const opts = { method, headers: SUPA_HEADERS };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(SUPA_URL + path, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  if (method === "DELETE") return [];
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

function Badge({ value, color = "gray", small = false }) {
  const colors = {
    gray: "background:#f1efe8;color:#5f5e5a",
    blue: "background:#e6f1fb;color:#0c447c",
    green: "background:#eaf3de;color:#3b6d11",
    amber: "background:#faeeda;color:#854f0b",
    purple: "background:#eeedfe;color:#3c3489",
    coral: "background:#faece7;color:#993c1d",
  };
  if (!value) return null;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, margin: "1px", ...Object.fromEntries(colors[color].split(";").map(s => s.split(":"))) }}>
      {value}
    </span>
  );
  padding: small ? "1px 4px" : "2px 8px"
}

function MultiTag({ val }) {
  if (!val) return <span style={{ color: "#999" }}>—</span>;
  return <>{val.split("|").map((v, i) => <Badge key={i} value={v.trim()} small={isMobile} />)}</>;
}

function TopikBadge({ v }) {
  if (!v) return null;
  const color = v <= 2 ? "green" : v <= 4 ? "blue" : v <= 6 ? "amber" : "purple";
  return <Badge value={`T${v}`} color={color} small={isMobile} />;
}

function StatutBadge({ s }) {
  const colors = { inconnu: "gray", "à apprendre": "amber", reconnu: "blue", utilisable: "purple", maîtrisé: "green" };
  return <Badge value={s || "—"} color={colors[s] || "gray"} small={isMobile} />;
}

async function callGemini(payload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    if (res.status === 503 && i < retries - 1) {
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // 1s, 2s, 3s
      continue;
    }
    throw new Error(`Erreur ${res.status}`);
  }
}

const STATUTS = ["inconnu", "à apprendre", "reconnu", "utilisable", "maîtrisé"];

export default function App() {
  const [tab, setTab] = useState("analyse");
  const [vocabData, setVocabData] = useState([]);
  const [gramData, setGramData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoB64, setPhotoB64] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabFilterUsage, setVocabFilterUsage] = useState("");
  const [vocabFilterTopik, setVocabFilterTopik] = useState("");
  const [vocabFilterStatut, setVocabFilterStatut] = useState("");
  const [gramSearch, setGramSearch] = useState("");
  const [gramFilterCat, setGramFilterCat] = useState("");
  const [gramFilterStatut, setGramFilterStatut] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingField, setEditingField] = useState(null); // { id, field }
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const pointerDownY = useRef(0);
  const fileRef = useRef();
  const chatEndRef = useRef();

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadVocab = async () => {
    try {
      const data = await supabase("/vocabulaire?order=id.asc&limit=1000");
      setVocabData(data);
    } catch (e) { showMsg("Erreur chargement vocabulaire: " + e.message, "error"); }
  };

  const loadGram = async () => {
    try {
      const data = await supabase("/grammaire?order=id.asc&limit=1000");
      setGramData(data);
    } catch (e) { showMsg("Erreur chargement grammaire: " + e.message, "error"); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPhoto(URL.createObjectURL(file));

    const b64 = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1024;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = h * maxSize / w; w = maxSize; }
          else { w = w * maxSize / h; h = maxSize; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        res(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });

    setPhotoB64(b64); setChatHistory([]); setPendingData(null);
  };

  const sendMessage = async (overrideText) => {
    const text = overrideText || userInput.trim();
    if (!text && !photoB64) return;

    const newMsg = { role: "user", content: text || "Analyse cette photo." };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);
    setUserInput("");
    setAnalyzing(true);

    try {
      const parts = [];
      if (photoB64) parts.push({ inlineData: { mimeType: "image/jpeg", data: photoB64 } });
      parts.push({ text: `${text}\n\nVocab existant: ${vocabData.map(v => v.mot).join(", ") || "aucun"}\nGram existante: ${gramData.map(g => g.grammaire).join(", ") || "aucune"}` });

      const history = updatedHistory.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const data = await callGemini({
        system_instruction: { parts: [{ text: SKILL_PROMPT }] },
        contents: [...history, { role: "user", parts }]
      });

      const full = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur : pas de réponse";
      const jsonMatch = full.match(/```json\n([\s\S]*?)```/);
      if (jsonMatch) { try { setPendingData(JSON.parse(jsonMatch[1])); } catch (_) { } }
      const displayText = full.replace(/```json[\s\S]*?```/g, "").trim();
      setChatHistory([...updatedHistory, { role: "assistant", content: displayText }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      showMsg("Erreur API: " + e.message, "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const importToSupabase = async () => {
    if (!pendingData) return;
    setImporting(true);
    let vocabAdded = 0, gramAdded = 0, skipped = 0;

    try {
      // Vocabulaire
      if (pendingData.vocabulaire?.length) {
        const existingMots = new Set(vocabData.map(v => v.mot));
        const toInsert = pendingData.vocabulaire
          .filter(v => !existingMots.has(v.mot))
          .map(v => ({ ...v, topik_objectif: v.topik_objectif ? parseInt(v.topik_objectif) : null }));
        skipped += pendingData.vocabulaire.length - toInsert.length;
        if (toInsert.length) {
          await supabase("/vocabulaire", "POST", toInsert);
          vocabAdded = toInsert.length;
        }
      }

      // Grammaire
      if (pendingData.grammaire?.length) {
        const existingG = new Set(gramData.map(g => g.grammaire));
        const toInsert = pendingData.grammaire.filter(g => !existingG.has(g.grammaire));
        skipped += pendingData.grammaire.length - toInsert.length;
        if (toInsert.length) {
          await supabase("/grammaire", "POST", toInsert);
          gramAdded = toInsert.length;
        }
      }

      await loadVocab();
      await loadGram();
      setPendingData(null);
      showMsg(`Importé : ${vocabAdded} mots, ${gramAdded} grammaires${skipped ? ` (${skipped} doublons ignorés)` : ""}`);
    } catch (e) {
      showMsg("Erreur import: " + e.message, "error");
    } finally {
      setImporting(false);
    }
  };

  const changeStatut = async (table, id, current) => {
    const next = STATUTS[(STATUTS.indexOf(current) + 1) % STATUTS.length];
    try {
      await supabase(`/${table}?id=eq.${id}`, "PATCH", { statut: next, updated_at: new Date().toISOString() });
      table === "vocabulaire" ? await loadVocab() : await loadGram();
    } catch (e) { showMsg("Erreur: " + e.message, "error"); }
  };

  const deleteEntry = async (table, id) => {
    if (!confirm(`Supprimer ${id} ?`)) return;
    try {
      await supabase(`/${table}?id=eq.${id}`, "DELETE");
      showMsg(`${id} supprimé`);
      table === "vocabulaire" ? await loadVocab() : await loadGram();
    } catch (e) { showMsg("Erreur: " + e.message, "error"); }
  };
  
  const parseDefinitions = (str) => {
    if (!str) return [];
    const parts = str.split(/\(\d+\)/).map(s => s.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [str];
  };

  const saveField = async (id, field, value) => {
    setSaving(true);
    try {
      await supabase(`/vocabulaire?id=eq.${id}`, "PATCH", { [field]: value, updated_at: new Date().toISOString() });
      setVocabData(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
      setEditingField(null);
    } catch (e) { showMsg("Erreur: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const allUsages = [...new Set(vocabData.flatMap(r => r.usage ? r.usage.split("|").map(t => t.trim()) : []))].sort();

  const filteredVocab = vocabData.filter(r => {
    if (vocabSearch && !r.mot?.toLowerCase().includes(vocabSearch.toLowerCase()) && !r.fr?.toLowerCase().includes(vocabSearch.toLowerCase())) return false;
    if (vocabFilterUsage && !r.usage?.split("|").map(t => t.trim()).includes(vocabFilterUsage)) return false;
    if (vocabFilterTopik && String(r.topik_objectif) !== vocabFilterTopik) return false;
    if (vocabFilterStatut && r.statut !== vocabFilterStatut) return false;
    return true;
  });

  const filteredGram = gramData.filter(r => {
    if (gramSearch && !r.grammaire?.toLowerCase().includes(gramSearch.toLowerCase()) && !r.definition_fr?.toLowerCase().includes(gramSearch.toLowerCase())) return false;
    if (gramFilterCat && !r.categorie?.includes(gramFilterCat)) return false;
    if (gramFilterStatut && r.statut !== gramFilterStatut) return false;
    return true;
  });

  const tabStyle = (t) => ({
    padding: "8px 16px", fontSize: 13, cursor: "pointer", border: "none",
    background: "none", borderBottom: tab === t ? "2px solid #1a1a1a" : "2px solid transparent",
    fontWeight: tab === t ? 600 : 400, color: tab === t ? "#1a1a1a" : "#888",
    marginBottom: -1,
  });

  const btnStyle = (variant = "default") => ({
    padding: "7px 14px", fontSize: 13, borderRadius: 8, cursor: "pointer",
    border: variant === "primary" ? "none" : "1px solid #e0e0e0",
    background: variant === "primary" ? "#1a1a1a" : variant === "danger" ? "#fff5f5" : "#fff",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#c0392b" : "#1a1a1a",
    display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
  });

  const td = { padding: isMobile ? "6px 4px" : "10px 12px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" };

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", maxWidth: 1100, margin: "0 auto", padding: "1rem", overflowX: "hidden", maxWidth: "100vw" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>🇰🇷 Korean Learning DB</h1>
          <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>살아있는 한국어 · Objectif TOPIK 4</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 12, background: "#f0f0f0", padding: "4px 10px", borderRadius: 99 }}>📚 {vocabData.length} mots</span>
          <span style={{ fontSize: 12, background: "#f0f0f0", padding: "4px 10px", borderRadius: 99 }}>📝 {gramData.length} grammaires</span>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: "1rem", background: msg.type === "error" ? "#fff5f5" : "#f0faf0", color: msg.type === "error" ? "#c0392b" : "#2d6a2d", border: `1px solid ${msg.type === "error" ? "#fcc" : "#c0e0c0"}` }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e0e0e0", marginBottom: "1.5rem" }}>
        {[["analyse", "🔍 Analyser"], ["vocab", "📚 Vocabulaire"], ["gram", "📝 Grammaire"]].map(([key, label]) => (
          <button key={key} style={tabStyle(key)} onClick={() => { setTab(key); if (key === "vocab") loadVocab(); if (key === "gram") loadGram(); }}>
            {label}
          </button>
        ))}
      </div>

      {/* TAB ANALYSE */}
      {tab === "analyse" && (
        <div>
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current.click()}
            style={{ border: "2px dashed #e0e0e0", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer", marginBottom: "1rem", background: photo ? "#fafafa" : "#fff", transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#aaa"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0e0"}
          >
            {photo ? (
              <img src={photo} alt="uploaded" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, color: "#666" }}>Clique pour uploader une photo du manuel</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>JPG, PNG — texte, vocabulaire, grammaire, 쓰기/읽기</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />

          {photo && (
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
              <button style={btnStyle("primary")} onClick={() => sendMessage("Analyse cette photo de mon manuel coréen.")}>
                ✨ Analyser la photo
              </button>
              <button style={btnStyle()} onClick={() => { setPhoto(null); setPhotoB64(null); setChatHistory([]); setPendingData(null); fileRef.current.value = ""; }}>
                🗑 Effacer
              </button>
            </div>
          )}

          {/* Chat */}
          {chatHistory.length > 0 && (
            <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden", marginBottom: "1rem" }}>
              <div style={{ maxHeight: 500, overflowY: "auto", padding: "1rem" }}>
                {chatHistory.map((m, i) => (
                  <div key={i} style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{m.role === "user" ? "Vous" : "Claude"}</div>
                    <div style={{
                      maxWidth: "90%", padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                      background: m.role === "user" ? "#1a1a1a" : "#f5f5f5",
                      color: m.role === "user" ? "#fff" : "#1a1a1a",
                      whiteSpace: "pre-wrap", fontFamily: m.role === "assistant" ? "'IBM Plex Mono', monospace" : "inherit", fontSize: m.role === "assistant" ? 12 : 13,
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {analyzing && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 13 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#888", animation: "pulse 1s infinite" }} />
                    Claude analyse...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ borderTop: "1px solid #e0e0e0", padding: "0.75rem", display: "flex", gap: 8 }}>
                <input
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Réponds à Claude ou donne des précisions..."
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, outline: "none" }}
                />
                <button style={btnStyle("primary")} onClick={() => sendMessage()} disabled={analyzing}>
                  Envoyer
                </button>
              </div>
            </div>
          )}

          {/* Import button */}
          {pendingData && (
            <div style={{ background: "#f0faf0", border: "1px solid #c0e0c0", borderRadius: 12, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13 }}>
                <strong>Données prêtes à importer</strong>
                <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                  {pendingData.vocabulaire?.length || 0} mots · {pendingData.grammaire?.length || 0} grammaires
                </div>
              </div>
              <button style={btnStyle("primary")} onClick={importToSupabase} disabled={importing}>
                {importing ? "Import..." : "⬆️ Importer en DB"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB VOCABULAIRE */}
      {tab === "vocab" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
            {[
              ["Total", vocabData.length],
              ["Maîtrisés", vocabData.filter(r => r.statut === "maîtrisé").length],
              ["TOPIK ≤4", vocabData.filter(r => r.topik_objectif <= 4).length],
              ["Progression", vocabData.length ? Math.round(vocabData.filter(r => r.statut === "maîtrisé").length / vocabData.length * 100) + "%" : "0%"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 10, padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: isMobile ? "nowrap" : "wrap", flexDirection: isMobile ? "column" : "row" }}>
            <input value={vocabSearch} onChange={e => setVocabSearch(e.target.value)} placeholder="Rechercher..." style={{ flex: 1, minWidth: 140, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }} />
            <select value={vocabFilterUsage} onChange={e => setVocabFilterUsage(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}>
              <option value="">Tous usages</option>
              {allUsages.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={vocabFilterTopik} onChange={e => setVocabFilterTopik(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}>
              <option value="">Tous niveaux</option>
              {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>TOPIK {n}</option>)}
            </select>
            <select value={vocabFilterStatut} onChange={e => setVocabFilterStatut(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}>
              <option value="">Tous statuts</option>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button style={btnStyle()} onClick={loadVocab}>↺ Actualiser</button>
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, overflowX: "hidden", overflowY: "auto", border: "1px solid #e0e0e0", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {(isMobile ? ["Mot", "FR", "EN", ""] : ["Mot", "Type", "FR", "EN", "Niveau", "Usage", "Thème", ""]).map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#888", borderBottom: "1px solid #e0e0e0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!filteredVocab.length ? <tr><td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#bbb" }}>Aucun résultat</td></tr>
                  : filteredVocab.map(r => {
                    const statutColors = {
                      inconnu: "rgba(200,200,200,0.3)",
                      "à apprendre": "rgba(255,165,0,0.2)",
                      reconnu: "rgba(100,149,237,0.2)",
                      utilisable: "rgba(147,112,219,0.2)",
                      maîtrisé: "rgba(60,179,113,0.2)"
                    };
                    const isExpanded = expandedRow === r.id;
                    const colSpan = isMobile ? 4 : 8;
                    return (
                      <>
                        <tr
                          key={r.id}
                          style={{ background: statutColors[r.statut] || "transparent", cursor: "pointer" }}
                          onPointerDown={e => { pointerDownY.current = e.clientY; }}
                          onPointerUp={e => {
                            if (Math.abs(e.clientY - pointerDownY.current) < 5)
                              setExpandedRow(isExpanded ? null : r.id);
                          }}
                        >
                          <td style={{ ...td, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>{r.mot}</td>
                          {!isMobile && <td style={td}><Badge value={r.type} small={isMobile} /></td>}
                          <td style={td}>{r.fr || "—"}</td>
                          <td style={{ ...td, color: "#999" }}>{r.en || "—"}</td>
                          {!isMobile && <td style={td}><TopikBadge v={r.topik_objectif} /></td>}
                          {!isMobile && <td style={td}><MultiTag val={r.usage} /></td>}
                          {!isMobile && <td style={td}><MultiTag val={r.theme} /></td>}
                          <td style={td}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button style={{ ...btnStyle(), padding: isMobile ? "2px 5px" : "3px 8px", fontSize: 11 }}
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); changeStatut("vocabulaire", r.id, r.statut); }}>↻</button>
                              <button style={{ ...btnStyle("danger"), padding: isMobile ? "2px 5px" : "3px 8px", fontSize: 13 }}
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); deleteEntry("vocabulaire", r.id); }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${r.id}-panel`} style={{ background: "#fafafa" }}>
                            <td colSpan={colSpan} style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>
                              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, fontSize: 13 }}>
                                {/* FR éditable */}
                                <div>
                                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Traduction FR</div>
                                  {editingField?.id === r.id && editingField?.field === "fr" ? (
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <textarea value={editValue} onChange={e => setEditValue(e.target.value)}
                                        rows={3} style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13, resize: "vertical" }} />
                                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <button style={btnStyle("primary")} disabled={saving}
                                          onClick={() => saveField(r.id, "fr", editValue)}>✓</button>
                                        <button style={btnStyle()} onClick={() => setEditingField(null)}>✕</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div onClick={() => { setEditingField({ id: r.id, field: "fr" }); setEditValue(r.fr || ""); }}
                                      style={{ cursor: "text", padding: "6px 8px", borderRadius: 6, border: "1px dashed #ddd", minHeight: 40, background: "#fff" }}>
                                      {parseDefinitions(r.fr).length > 1
                                        ? parseDefinitions(r.fr).map((d, i) => <div key={i}><span style={{ color: "#aaa", marginRight: 4 }}>({i+1})</span>{d}</div>)
                                        : <span>{r.fr || <span style={{ color: "#bbb" }}>—</span>}</span>}
                                    </div>
                                  )}
                                </div>
                                {/* EN éditable */}
                                <div>
                                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Traduction EN</div>
                                  {editingField?.id === r.id && editingField?.field === "en" ? (
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <textarea value={editValue} onChange={e => setEditValue(e.target.value)}
                                        rows={3} style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13, resize: "vertical" }} />
                                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <button style={btnStyle("primary")} disabled={saving}
                                          onClick={() => saveField(r.id, "en", editValue)}>✓</button>
                                        <button style={btnStyle()} onClick={() => setEditingField(null)}>✕</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div onClick={() => { setEditingField({ id: r.id, field: "en" }); setEditValue(r.en || ""); }}
                                      style={{ cursor: "text", padding: "6px 8px", borderRadius: 6, border: "1px dashed #ddd", minHeight: 40, background: "#fff" }}>
                                      {parseDefinitions(r.en).length > 1
                                        ? parseDefinitions(r.en).map((d, i) => <div key={i}><span style={{ color: "#aaa", marginRight: 4 }}>({i+1})</span>{d}</div>)
                                        : <span>{r.en || <span style={{ color: "#bbb" }}>—</span>}</span>}
                                    </div>
                                  )}
                                </div>
                                {/* Infos lecture seule */}
                                {r.definition_kr && <div><span style={{ fontSize: 11, color: "#888" }}>Déf. KR : </span>{r.definition_kr}</div>}
                                {r.exemple && <div><span style={{ fontSize: 11, color: "#888" }}>Exemple : </span>{r.exemple}</div>}
                                {r.theme && <div><span style={{ fontSize: 11, color: "#888" }}>Thème : </span><MultiTag val={r.theme} /></div>}
                                {r.usage && <div><span style={{ fontSize: 11, color: "#888" }}>Usage : </span><MultiTag val={r.usage} /></div>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB GRAMMAIRE */}
      {tab === "gram" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
            {[
              ["Total", gramData.length],
              ["Maîtrisées", gramData.filter(r => r.statut === "maîtrisé").length],
              ["TOPIK ≤4", gramData.filter(r => r.topik_objectif <= 4).length],
              ["Progression", gramData.length ? Math.round(gramData.filter(r => r.statut === "maîtrisé").length / gramData.length * 100) + "%" : "0%"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 10, padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
            <input value={gramSearch} onChange={e => setGramSearch(e.target.value)} placeholder="Rechercher..." style={{ flex: 1, minWidth: 140, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }} />
            <select value={gramFilterCat} onChange={e => setGramFilterCat(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}>
              <option value="">Toutes catégories</option>
              {["connecteur", "terminaison", "nominalisant", "aspectuel", "modal", "conditionnel", "temporel", "causal", "concessif", "honorifique", "expressif", "formatif"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={gramFilterStatut} onChange={e => setGramFilterStatut(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}>
              <option value="">Tous statuts</option>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button style={btnStyle()} onClick={loadGram}>↺ Actualiser</button>
          </div>
          <div style={{ overflowX: "auto", border: "1px solid #e0e0e0", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Grammaire", "Catégorie", "Sous-cat.", "Définition FR", "Oral/Écrit", "Niveau", "TOPIK", "Statut", ""].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#888", borderBottom: "1px solid #e0e0e0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGram.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>Aucun résultat</td></tr>
                ) : filteredGram.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>{r.grammaire}</td>
                    <td style={{ padding: "10px 12px" }}><MultiTag val={r.categorie} small={isMobile} /></td>
                    <td style={{ padding: "10px 12px" }}><MultiTag val={r.sous_categorie} small={isMobile} /></td>
                    <td style={{ padding: "10px 12px", width: isMobile ? "45%" : "35%", fontSize: 12, color: "#555", wordBreak: "break-word" }}>{r.definition_fr || "—"}</td>
                    <td style={{ padding: "10px 12px" }}><MultiTag val={r.oral_ecrit} small={isMobile} /></td>
                    <td style={{ padding: "10px 12px" }}><Badge value={r.niveau_reel} small={isMobile} /></td>
                    <td style={{ padding: "10px 12px" }}><TopikBadge v={r.topik_objectif} small={isMobile} /></td>
                    <td style={{ padding: "10px 12px" }}><StatutBadge s={r.statut} small={isMobile} /></td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ ...btnStyle(), padding: "4px 8px", fontSize: 11 }} onClick={() => changeStatut("grammaire", r.id, r.statut)} title="Changer statut">↻</button>
                        <button style={{ ...btnStyle("danger"), padding: "4px 8px", fontSize: 11 }} onClick={() => deleteEntry("grammaire", r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: "2rem" }}>
        {__APP_VERSION__ || "dev"}
      </div>
    </div>
  );
}
