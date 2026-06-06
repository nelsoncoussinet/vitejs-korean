export default function VocabularyFilters({
  vocabSearch,
  setVocabSearch,
  vocabFilterUsage,
  setVocabFilterUsage,
  vocabFilterTopik,
  setVocabFilterTopik,
  vocabFilterStatut,
  setVocabFilterStatut,
  allUsages,
  STATUTS,
  loadVocab,
  isMobile,
  btnStyle,
}) {
  return (
    <div
      className="vocab-filters"
      style={{
        display: "flex",
        gap: 8,
        marginBottom: "1rem",
        flexWrap: isMobile ? "nowrap" : "wrap",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <input
        value={vocabSearch}
        onChange={(e) => setVocabSearch(e.target.value)}
        placeholder="Rechercher..."
        style={{
          flex: 1,
          minWidth: 140,
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid #e0e0e0",
          fontSize: 13,
        }}
      />

      <select
        value={vocabFilterUsage}
        onChange={(e) => setVocabFilterUsage(e.target.value)}
        style={{
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid #e0e0e0",
          fontSize: 13,
        }}
      >
        <option value="">Tous usages</option>
        {allUsages.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={vocabFilterTopik}
        onChange={(e) => setVocabFilterTopik(e.target.value)}
        style={{
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid #e0e0e0",
          fontSize: 13,
        }}
      >
        <option value="">Tous niveaux</option>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <option key={n} value={n}>
            TOPIK {n}
          </option>
        ))}
      </select>

      <select
        value={vocabFilterStatut}
        onChange={(e) => setVocabFilterStatut(e.target.value)}
        style={{
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid #e0e0e0",
          fontSize: 13,
        }}
      >
        <option value="">Tous statuts</option>
        {STATUTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button style={btnStyle()} onClick={loadVocab}>
        ↺ Actualiser
      </button>
    </div>
  );
}