import { useState, useRef } from "react";
import { callGemini, SKILL_PROMPT, supabase } from "../lib/api";

export default function AnalyseTab({
  vocabData,
  gramData,
  loadVocab,
  loadGram,
  showMsg
}) {
  const fileRef = useRef();
  const chatEndRef = useRef();

  const [photo, setPhoto] = useState(null);
  const [photoB64, setPhotoB64] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [importing, setImporting] = useState(false);
  const btnStyle = (variant = "default") => ({
    padding: "7px 14px",
    fontSize: 13,
    borderRadius: 8,
    cursor: "pointer",
    border: variant === "primary" ? "none" : "1px solid #e0e0e0",
    background: variant === "primary" ? "#1a1a1a" : variant === "danger" ? "#fff5f5" : "#fff",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#c0392b" : "#1a1a1a",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  });
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(URL.createObjectURL(file));
    const b64 = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = (h * maxSize) / w;
            w = maxSize;
          } else {
            w = (w * maxSize) / h;
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8).split(",")[1]);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    setPhotoB64(b64);
    setChatHistory([]);
    setPendingData(null);
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
      parts.push({ text: `${text}\n\nVocab existant: ${vocabData.map((v) => v.mot).join(", ") || "aucun"}\nGram existante: ${gramData.map((g) => g.grammaire).join(", ") || "aucune"}` });

      const history = updatedHistory.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const data = await callGemini({
        system_instruction: { parts: [{ text: SKILL_PROMPT }] },
        contents: [...history, { role: "user", parts }],
      });

      const full = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur : pas de réponse";
      const jsonMatch = full.match(/```json\n([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          setPendingData(JSON.parse(jsonMatch[1]));
        } catch (_) {
          // ignore invalid JSON
        }
      }
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
    let vocabAdded = 0;
    let gramAdded = 0;
    let skipped = 0;

    try {
      if (pendingData.vocabulaire?.length) {
        const existingMots = new Set(vocabData.map((v) => v.mot));
        const toInsert = pendingData.vocabulaire
          .filter((v) => !existingMots.has(v.mot))
          .map((v) => ({ ...v, topik_objectif: v.topik_objectif ? parseInt(v.topik_objectif) : null }));
        skipped += pendingData.vocabulaire.length - toInsert.length;
        if (toInsert.length) {
          await supabase("/vocabulaire", "POST", toInsert);
          vocabAdded = toInsert.length;
        }
      }

      if (pendingData.grammaire?.length) {
        const existingG = new Set(gramData.map((g) => g.grammaire));
        const toInsert = pendingData.grammaire.filter((g) => !existingG.has(g.grammaire));
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

  return (
    <div>
      <div
        onClick={() => fileRef.current.click()}
        style={{
          border: "2px dashed #e0e0e0",
          borderRadius: 12,
          padding: "2rem",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "1rem",
          background: photo ? "#fafafa" : "#fff",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#aaa")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
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
          <button style={btnStyle()} onClick={() => {
            setPhoto(null);
            setPhotoB64(null);
            setChatHistory([]);
            setPendingData(null);
            if (fileRef.current) fileRef.current.value = "";
          }}>
            🗑 Effacer
          </button>
        </div>
      )}

      {chatHistory.length > 0 && (
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden", marginBottom: "1rem" }}>
          <div style={{ maxHeight: 500, overflowY: "auto", padding: "1rem" }}>
            {chatHistory.map((m, i) => (
              <div key={i} style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{m.role === "user" ? "Vous" : "Claude"}</div>
                <div
                  style={{
                    maxWidth: "90%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontSize: 13,
                    lineHeight: 1.6,
                    background: m.role === "user" ? "#1a1a1a" : "#f5f5f5",
                    color: m.role === "user" ? "#fff" : "#1a1a1a",
                    whiteSpace: "pre-wrap",
                    fontFamily: m.role === "assistant" ? "'IBM Plex Mono', monospace" : "inherit",
                    fontSize: m.role === "assistant" ? 12 : 13,
                  }}
                >
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

          <div style={{ borderTop: "1px solid #e0e0e0", padding: "0.75rem", display: "flex", gap: 8 }}>
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Réponds à Claude ou donne des précisions..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, outline: "none" }}
            />
            <button style={btnStyle("primary")} onClick={sendMessage} disabled={analyzing}>
              Envoyer
            </button>
          </div>
        </div>
      )}

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
  );
}
