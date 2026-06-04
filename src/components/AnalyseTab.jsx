export default function AnalyseTab({
  photo,
  chatHistory,
  analyzing,
  pendingData,
  importing,
  userInput,
  fileRef,
  chatEndRef,
  onPhotoUpload,
  onAnalyzePhoto,
  onClearPhoto,
  onSendMessage,
  onImportToSupabase,
  setUserInput,
}) {
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

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoUpload} />

      {photo && (
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          <button style={btnStyle("primary")} onClick={onAnalyzePhoto}>
            ✨ Analyser la photo
          </button>
          <button style={btnStyle()} onClick={onClearPhoto}>
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
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSendMessage()}
              placeholder="Réponds à Claude ou donne des précisions..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, outline: "none" }}
            />
            <button style={btnStyle("primary")} onClick={onSendMessage} disabled={analyzing}>
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
          <button style={btnStyle("primary")} onClick={onImportToSupabase} disabled={importing}>
            {importing ? "Import..." : "⬆️ Importer en DB"}
          </button>
        </div>
      )}
    </div>
  );
}
