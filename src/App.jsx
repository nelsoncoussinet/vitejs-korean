import { useState, useRef, useEffect } from "react";
import AnalyseTab from "./components/AnalyseTab";
import VocabTab from "./components/VocabTab";
import GramTab from "./components/GramTab";
import { STATUTS } from "./lib/api";
import {
  loadVocabularyFromDb,
  loadGrammarFromDb,
  updateVocabularyFieldToDb,
  updateStatutToDb,
  deleteEntryToDb
} from "./services/databaseService";

export default function App() {
  const [tab, setTab] = useState("analyse");
  const [vocabData, setVocabData] = useState([]);
  const [gramData, setGramData] = useState([]);
  const [msg, setMsg] = useState(null);
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabFilterUsage, setVocabFilterUsage] = useState("");
  const [vocabFilterTopik, setVocabFilterTopik] = useState("");
  const [vocabFilterStatut, setVocabFilterStatut] = useState("");
  const [gramSearch, setGramSearch] = useState("");
  const [gramFilterCat, setGramFilterCat] = useState("");
  const [gramFilterStatut, setGramFilterStatut] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const pointerDownY = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadVocab = async () => {
    try {
      const data = await loadVocabularyFromDb();
      setVocabData(data);
    } catch (e) {
      showMsg("Erreur chargement vocabulaire: " + e.message, "error");
    }
  };

  const loadGram = async () => {
    try {
      const data = await loadGrammarFromDb();
      setGramData(data);
    } catch (e) {
      showMsg("Erreur chargement grammaire: " + e.message, "error");
    }
  };

  const changeStatut = async (table, id, current) => {
    const next = STATUTS[(STATUTS.indexOf(current) + 1) % STATUTS.length];
    try {
      await updateStatutToDb(table, id, next);
      table === "vocabulaire" ? await loadVocab() : await loadGram();
    } catch (e) {
      showMsg("Erreur: " + e.message, "error");
    }
  };

  const deleteEntry = async (table, id) => {
    if (!confirm(`Supprimer ${id} ?`)) return;
    try {
      await deleteEntryToDb(table, id);
      showMsg(`${id} supprimé`);
      table === "vocabulaire" ? await loadVocab() : await loadGram();
    } catch (e) {
      showMsg("Erreur: " + e.message, "error");
    }
  };

  const saveField = async (id, field, value, dontClear = false) => {
    setSaving(true);
    try {
      await updateVocabularyFieldToDb(id, field, value);
      setVocabData((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
      if (!dontClear) setEditingField(null);
    } catch (e) {
      showMsg("Erreur: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const allUsages = [...new Set(vocabData.flatMap((r) => (r.usage ? r.usage.split("|").map((t) => t.trim()) : [])))].sort();

  const filteredVocab = vocabData.filter((r) => {
    if (vocabSearch && !r.mot?.toLowerCase().includes(vocabSearch.toLowerCase()) && !r.fr?.toLowerCase().includes(vocabSearch.toLowerCase())) return false;
    if (vocabFilterUsage && !r.usage?.split("|").map((t) => t.trim()).includes(vocabFilterUsage)) return false;
    if (vocabFilterTopik && String(r.topik_objectif) !== vocabFilterTopik) return false;
    if (vocabFilterStatut && r.statut !== vocabFilterStatut) return false;
    return true;
  });

  const filteredGram = gramData.filter((r) => {
    if (gramSearch && !r.grammaire?.toLowerCase().includes(gramSearch.toLowerCase()) && !r.definition_fr?.toLowerCase().includes(gramSearch.toLowerCase())) return false;
    if (gramFilterCat && !r.categorie?.includes(gramFilterCat)) return false;
    if (gramFilterStatut && r.statut !== gramFilterStatut) return false;
    return true;
  });

  return (
    <div className="app-shell">
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div className="app-header">
        <div>
          <h1>Korean Learning DB</h1>
          <p>살아있는 한국어 · Objectif TOPIK 4</p>
        </div>
        <div className="header-stats">
          <span className="stats-pill">{vocabData.length} mots</span>
          <span className="stats-pill">{gramData.length} grammaires</span>
        </div>
      </div>

      {msg && (
        <div className={`status-msg ${msg.type === "error" ? "error" : "success"}`}>
          {msg.text}
        </div>
      )}

      <div className="tabs">
        {[['analyse', 'Analyser'], ['vocab', 'Vocabulaire'], ['gram', 'Grammaire']].map(([key, label]) => (
          <button
            key={key}
            className={`tab-button ${tab === key ? 'active' : ''}`}
            onClick={() => {
              setTab(key);
              if (key === "vocab") loadVocab();
              if (key === "gram") loadGram();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "analyse" && (
        <AnalyseTab
          vocabData={vocabData}
          gramData={gramData}
          loadVocab={loadVocab}
          loadGram={loadGram}
          showMsg={showMsg}
        />
      )}

      {tab === "vocab" && (
        <VocabTab
          vocabData={vocabData}
          filteredVocab={filteredVocab}
          expandedRow={expandedRow}
          editingField={editingField}
          editValue={editValue}
          saving={saving}
          loadVocab={loadVocab}
          changeStatut={changeStatut}
          deleteEntry={deleteEntry}
          saveField={saveField}
          setExpandedRow={setExpandedRow}
          setEditingField={setEditingField}
          setEditValue={setEditValue}
          pointerDownY={pointerDownY}
          isMobile={isMobile}
          allUsages={allUsages}
          vocabSearch={vocabSearch}
          setVocabSearch={setVocabSearch}
          vocabFilterUsage={vocabFilterUsage}
          setVocabFilterUsage={setVocabFilterUsage}
          vocabFilterTopik={vocabFilterTopik}
          setVocabFilterTopik={setVocabFilterTopik}
          vocabFilterStatut={vocabFilterStatut}
          setVocabFilterStatut={setVocabFilterStatut}
          STATUTS={STATUTS}
        />
      )}

      {tab === "gram" && (
        <GramTab
          gramData={gramData}
          filteredGram={filteredGram}
          gramSearch={gramSearch}
          gramFilterCat={gramFilterCat}
          gramFilterStatut={gramFilterStatut}
          setGramSearch={setGramSearch}
          setGramFilterCat={setGramFilterCat}
          setGramFilterStatut={setGramFilterStatut}
          loadGram={loadGram}
          changeStatut={changeStatut}
          deleteEntry={deleteEntry}
          isMobile={isMobile}
          STATUTS={STATUTS}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: "2rem" }}>
        {__APP_VERSION__ || "dev"}
      </div>
    </div>
  );
}
