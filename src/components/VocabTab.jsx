import { parseDefinitions } from "../lib/helpers";
import { Badge, MultiTag, TopikBadge } from "./Badge";
import VocabularyFilters from "./vocab/VocabularyFilters";
import VocabularyRow from "./vocab/VocabularyRow";
import { useEffect, useRef, useState } from "react";

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
  const tableRef = useRef(null);
  const [tableScale, setTableScale] = useState(1);

  /* Add zoom / unzoom effect */
  useEffect(() => {
    const updateScale = () => {
      if (!isMobile || !tableRef.current) {
        setTableScale(1);
        return;
      }

      const tableWidth = tableRef.current.scrollWidth;
      const viewportWidth = window.innerWidth - 32; // marge sécurité

      const scale = Math.min(1, viewportWidth / tableWidth);

      setTableScale(scale);
    };

    updateScale();

    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, [isMobile, filteredVocab]);

  return (
    <div className="vocab-tab">
      {/* ============ VOCAB_STATS ======================== */}
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

      {/* ============ VOCAB_FILTERS ============ */}
      <VocabularyFilters
        vocabSearch={vocabSearch}
        setVocabSearch={setVocabSearch}
        vocabFilterUsage={vocabFilterUsage}
        setVocabFilterUsage={setVocabFilterUsage}
        vocabFilterTopik={vocabFilterTopik}
        setVocabFilterTopik={setVocabFilterTopik}
        vocabFilterStatut={vocabFilterStatut}
        setVocabFilterStatut={setVocabFilterStatut}
        allUsages={allUsages}
        STATUTS={STATUTS}
        loadVocab={loadVocab}
        isMobile={isMobile}
        btnStyle={btnStyle}
        pointerDownY={pointerDownY}
        changeStatut={changeStatut}
        deleteEntry={deleteEntry}
        saveField={saveField}
        tdStyle={tdStyle}
        Badge={Badge}
        TopikBadge={TopikBadge}
        MultiTag={MultiTag}
      />
      {/* ============ VOCAB_TABLE ============ */}
      <div className="vocab-table-container" style={{ overflow: "hidden", border: "1px solid #e0e0e0", borderRadius: 10 }}>
        <div style={{ transform: `scale(${tableScale})`, transformOrigin: "top left", width: `${100 / tableScale}%`, }}>
          <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
            {/* set size for columns */}
            <colgroup>
              <col />
              <col />
              <col />
              <col style={{ width: "35px" }} />
            </colgroup>
            {/* Table header */}
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {(isMobile ? ["Mot", "FR", "EN", ""] : ["Mot", "Type", "FR", "EN", "Niveau", "Usage", "Thème", ""]).map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#888", borderBottom: "1px solid #e0e0e0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {!filteredVocab.length ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#bbb" }}>
                    Aucun résultat
                  </td>
                </tr>
              ) : (
                filteredVocab.map((r) => (
                  <VocabularyRow
                    key={r.id}
                    r={r}
                    expandedRow={expandedRow}
                    editingField={editingField}
                    editValue={editValue}
                    saving={saving}
                    saveField={saveField}
                    setEditingField={setEditingField}
                    setEditValue={setEditValue}
                    changeStatut={changeStatut}
                    deleteEntry={deleteEntry}
                    pointerDownY={pointerDownY}
                    setExpandedRow={setExpandedRow}
                    isMobile={isMobile}
                    btnStyle={btnStyle}
                    tdStyle={tdStyle}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
