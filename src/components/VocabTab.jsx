import { parseDefinitions } from "../lib/helpers";
import { Badge, MultiTag, TopikBadge } from "./Badge";

export default function VocabTab({
  vocabData,
  filteredVocab,
  expandedRow,
  editingField,
  editValue,
  saving,
  loadVocab,
  changeStatut,
  deleteEntry,
  saveField,
  setExpandedRow,
  setEditingField,
  setEditValue,
  pointerDownY,
  isMobile,
  allUsages,
  vocabSearch,
  setVocabSearch,
  vocabFilterUsage,
  setVocabFilterUsage,
  vocabFilterTopik,
  setVocabFilterTopik,
  vocabFilterStatut,
  setVocabFilterStatut,
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

  const tdStyle = { padding: isMobile ? "6px 4px" : "10px 12px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          ["Total", vocabData.length],
          ["Maîtrisés", vocabData.filter((r) => r.statut === "maîtrisé").length],
          ["TOPIK ≤4", vocabData.filter((r) => r.topik_objectif <= 4).length],
          ["Progression", vocabData.length ? `${Math.round((vocabData.filter((r) => r.statut === "maîtrisé").length / vocabData.length) * 100)}%` : "0%"],
        ].map(([label, val]) => (
          <div key={label} style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 10, padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: isMobile ? "nowrap" : "wrap", flexDirection: isMobile ? "column" : "row" }}>
        <input
          value={vocabSearch}
          onChange={(e) => setVocabSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{ flex: 1, minWidth: 140, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        />
        <select
          value={vocabFilterUsage}
          onChange={(e) => setVocabFilterUsage(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        >
          <option value="">Tous usages</option>
          {allUsages.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={vocabFilterTopik}
          onChange={(e) => setVocabFilterTopik(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        >
          <option value="">Tous niveaux</option>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>TOPIK {n}</option>
          ))}
        </select>
        <select
          value={vocabFilterStatut}
          onChange={(e) => setVocabFilterStatut(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
        >
          <option value="">Tous statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button style={btnStyle()} onClick={loadVocab}>↺ Actualiser</button>
      </div>

      <div style={{ fontSize: isMobile ? 12 : 14, overflowX: "hidden", overflowY: "auto", border: "1px solid #e0e0e0", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {(isMobile ? ["Mot", "FR", "EN", ""] : ["Mot", "Type", "FR", "EN", "Niveau", "Usage", "Thème", ""]).map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#888", borderBottom: "1px solid #e0e0e0", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filteredVocab.length ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#bbb" }}>
                  Aucun résultat
                </td>
              </tr>
            ) : (
              filteredVocab.map((r) => {
                const statutColors = {
                  inconnu: "rgba(200,200,200,0.3)",
                  "à apprendre": "rgba(255,165,0,0.2)",
                  reconnu: "rgba(100,149,237,0.2)",
                  utilisable: "rgba(147,112,219,0.2)",
                  maîtrisé: "rgba(60,179,113,0.2)",
                };
                const isExpanded = expandedRow === r.id;
                const colSpan = isMobile ? 4 : 8;
                return (
                  <>
                    <tr
                      key={r.id}
                      style={{ background: statutColors[r.statut] || "transparent", cursor: "pointer" }}
                      onPointerDown={(e) => {
                        pointerDownY.current = e.clientY;
                      }}
                      onPointerUp={(e) => {
                        if (Math.abs(e.clientY - pointerDownY.current) < 5) setExpandedRow(isExpanded ? null : r.id);
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>{r.mot}</td>
                      {!isMobile && <td style={tdStyle}><Badge value={r.type} small={isMobile} /></td>}
                      <td
                        style={{ ...tdStyle, cursor: "default" }}
                      >
                        {editingField?.id === r.id && (editingField?.field === "fr" || editingField?.field === "both") ? (
                          <div
                            style={{ display: "flex", gap: 6 }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <textarea
                              value={editingField?.field === "both" ? (editValue?.fr || r.fr || "") : editValue}
                              onChange={(e) => {
                                if (editingField?.field === "both") {
                                  setEditValue({ ...editValue, fr: e.target.value });
                                } else {
                                  setEditValue(e.target.value);
                                }
                              }}
                              rows={2}
                              style={{ flex: 1, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12, resize: "vertical" }}
                              autoFocus={editingField?.field === "fr"}
                            />
                            {editingField?.field === "fr" && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <button style={{ ...btnStyle("primary"), padding: "2px 6px", fontSize: 11 }} disabled={saving} onClick={() => saveField(r.id, "fr", editValue)}>
                                  ✓
                                </button>
                                <button style={{ ...btnStyle(), padding: "2px 6px", fontSize: 11 }} onClick={() => setEditingField(null)}>
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span>{r.fr || "—"}</span>
                        )}
                      </td>
                      <td
                        style={{ ...tdStyle, color: "#999", cursor: "default" }}
                      >
                        {editingField?.id === r.id && (editingField?.field === "en" || editingField?.field === "both") ? (
                          <div
                            style={{ display: "flex", gap: 6 }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <textarea
                              value={editingField?.field === "both" ? (editValue?.en || r.en || "") : editValue}
                              onChange={(e) => {
                                if (editingField?.field === "both") {
                                  setEditValue({ ...editValue, en: e.target.value });
                                } else {
                                  setEditValue(e.target.value);
                                }
                              }}
                              rows={2}
                              style={{ flex: 1, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12, resize: "vertical" }}
                              autoFocus={editingField?.field === "en"}
                            />
                            {editingField?.field === "en" && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <button style={{ ...btnStyle("primary"), padding: "2px 6px", fontSize: 11 }} disabled={saving} onClick={() => saveField(r.id, "en", editValue)}>
                                  ✓
                                </button>
                                <button style={{ ...btnStyle(), padding: "2px 6px", fontSize: 11 }} onClick={() => setEditingField(null)}>
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span>{r.en || "—"}</span>
                        )}
                      </td>
                      {!isMobile && <td style={tdStyle}><TopikBadge v={r.topik_objectif} small={isMobile} /></td>}
                      {!isMobile && <td style={tdStyle}><MultiTag val={r.usage} small={isMobile} /></td>}
                      {!isMobile && <td style={tdStyle}><MultiTag val={r.theme} small={isMobile} /></td>}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {!isMobile && (
                            <>
                              {editingField?.id === r.id && editingField?.field === "both" ? (
                                <>
                                  <button
                                    style={{ ...btnStyle("primary"), padding: "3px 8px", fontSize: 11 }}
                                    disabled={saving}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await saveField(r.id, "fr", editValue?.fr || r.fr, true);
                                      await saveField(r.id, "en", editValue?.en || r.en, false);
                                    }}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    style={{ ...btnStyle(), padding: "3px 8px", fontSize: 11 }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingField(null);
                                      setEditValue({});
                                    }}
                                  >
                                    ✕
                                  </button>
                                </>
                              ) : (
                                <button
                                  style={{ ...btnStyle(), padding: "3px 8px", fontSize: 11 }}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingField({ id: r.id, field: "both" });
                                    setEditValue({ fr: r.fr || "", en: r.en || "" });
                                  }}
                                  title="Éditer traductions"
                                >
                                  ✎
                                </button>
                              )}
                            </>
                          )}
                          <button
                            style={{ ...btnStyle(), padding: isMobile ? "2px 5px" : "3px 8px", fontSize: 11 }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              changeStatut("vocabulaire", r.id, r.statut);
                            }}
                          >
                            ↻
                          </button>
                          <button
                            style={{ ...btnStyle("danger"), padding: isMobile ? "2px 5px" : "3px 8px", fontSize: 13 }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntry("vocabulaire", r.id);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${r.id}-panel`} style={{ background: "#fafafa" }}>
                        <td colSpan={colSpan} style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, fontSize: 13 }}>
                            {isMobile && (
                              <div>
                                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Traduction FR</div>
                                {editingField?.id === r.id && editingField?.field === "fr-panel" ? (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <textarea
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      rows={3}
                                      style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13, resize: "vertical" }}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      <button style={btnStyle("primary")} disabled={saving} onClick={() => saveField(r.id, "fr", editValue)}>
                                        ✓
                                      </button>
                                      <button style={btnStyle()} onClick={() => setEditingField(null)}>
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingField({ id: r.id, field: "fr-panel" });
                                      setEditValue(r.fr || "");
                                    }}
                                    style={{ cursor: "text", padding: "6px 8px", borderRadius: 6, border: "1px dashed #ddd", minHeight: 40, background: "#fff" }}
                                  >
                                    {parseDefinitions(r.fr).length > 1
                                      ? parseDefinitions(r.fr).map((d, i) => (
                                          <div key={i}>
                                            <span style={{ color: "#aaa", marginRight: 4 }}>
                                              ({i + 1})
                                            </span>
                                            {d}
                                          </div>
                                        ))
                                      : <span>{r.fr || <span style={{ color: "#bbb" }}>—</span>}</span>}
                                  </div>
                                )}
                              </div>
                            )}
                            {isMobile && (
                              <div>
                                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Traduction EN</div>
                                {editingField?.id === r.id && editingField?.field === "en-panel" ? (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <textarea
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      rows={3}
                                      style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13, resize: "vertical" }}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      <button style={btnStyle("primary")} disabled={saving} onClick={() => saveField(r.id, "en", editValue)}>
                                        ✓
                                      </button>
                                      <button style={btnStyle()} onClick={() => setEditingField(null)}>
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingField({ id: r.id, field: "en-panel" });
                                      setEditValue(r.en || "");
                                    }}
                                    style={{ cursor: "text", padding: "6px 8px", borderRadius: 6, border: "1px dashed #ddd", minHeight: 40, background: "#fff" }}
                                  >
                                    {parseDefinitions(r.en).length > 1
                                      ? parseDefinitions(r.en).map((d, i) => (
                                          <div key={i}>
                                            <span style={{ color: "#aaa", marginRight: 4 }}>
                                              ({i + 1})
                                            </span>
                                            {d}
                                          </div>
                                        ))
                                      : <span>{r.en || <span style={{ color: "#bbb" }}>—</span>}</span>}
                                  </div>
                                )}
                              </div>
                            )}
                            {r.definition_kr && (
                              <div>
                                <span style={{ fontSize: 11, color: "#888" }}>Déf. KR : </span>
                                {r.definition_kr}
                              </div>
                            )}
                            {r.exemple && (
                              <div>
                                <span style={{ fontSize: 11, color: "#888" }}>Exemple : </span>
                                {r.exemple}
                              </div>
                            )}
                            {r.theme && (
                              <div>
                                <span style={{ fontSize: 11, color: "#888" }}>Thème : </span>
                                <MultiTag val={r.theme} small={isMobile} />
                              </div>
                            )}
                            {r.usage && (
                              <div>
                                <span style={{ fontSize: 11, color: "#888" }}>Usage : </span>
                                <MultiTag val={r.usage} small={isMobile} />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
