import { Badge, MultiTag, TopikBadge, StatutBadge } from "./Badge";

export default function GramTab({
  gramData,
  filteredGram,
  gramSearch,
  gramFilterCat,
  gramFilterStatut,
  setGramSearch,
  setGramFilterCat,
  setGramFilterStatut,
  loadGram,
  changeStatut,
  deleteEntry,
  isMobile,
  STATUTS,
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
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          ["Total", gramData.length],
          ["Maîtrisées", gramData.filter((r) => r.statut === "maîtrisé").length],
          ["TOPIK ≤4", gramData.filter((r) => r.topik_objectif <= 4).length],
          ["Progression", gramData.length ? `${Math.round((gramData.filter((r) => r.statut === "maîtrisé").length / gramData.length) * 100)}%` : "0%"],
        ].map(([label, val]) => (
          <div key={label} style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 10, padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={gramSearch}
          onChange={(e) => setGramSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{ flex: 1, minWidth: 140, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        />
        <select
          value={gramFilterCat}
          onChange={(e) => setGramFilterCat(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        >
          <option value="">Toutes catégories</option>
          {["connecteur", "terminaison", "nominalisant", "aspectuel", "modal", "conditionnel", "temporel", "causal", "concessif", "honorifique", "expressif", "formatif"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={gramFilterStatut}
          onChange={(e) => setGramFilterStatut(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        >
          <option value="">Tous statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button style={btnStyle()} onClick={loadGram}>↺ Actualiser</button>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #e0e0e0", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["Grammaire", "Catégorie", "Sous-cat.", "Définition FR", "Oral/Écrit", "Niveau", "TOPIK", "Statut", ""].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#888", borderBottom: "1px solid #e0e0e0", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGram.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>
                  Aucun résultat
                </td>
              </tr>
            ) : (
              filteredGram.map((r) => (
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
                      <button style={{ ...btnStyle(), padding: "4px 8px", fontSize: 11 }} onClick={() => changeStatut("grammaire", r.id, r.statut)} title="Changer statut">
                        ↻
                      </button>
                      <button style={{ ...btnStyle("danger"), padding: "4px 8px", fontSize: 11 }} onClick={() => deleteEntry("grammaire", r.id)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
