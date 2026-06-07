import { Badge, MultiTag, TopikBadge } from "./../Badge";
import VocabularyDetailsPanel from "./VocabularyRow/VocabularyDetailsPanel";
import VocabularyTranslationCell from "./VocabularyRow/VocabularyTranslationCell";

export default function VocabularyRow({
    r,
    expandedRow,
    editingField,
    editValue,
    saving,
    saveField,
    setEditingField,
    setEditValue,
    changeStatut,
    deleteEntry,
    pointerDownY,
    setExpandedRow,
    isMobile,
    btnStyle,
    tdStyle,
}) {
    // Vocabulary row
    const statutColors = {
        inconnu: "rgba(200,200,200,0.3)",
        "à apprendre": "rgba(255,165,0,0.2)",
        reconnu: "rgba(100,149,237,0.2)",
        utilisable: "rgba(147,112,219,0.2)",
        maîtrisé: "rgba(60,179,113,0.2)",
    };
    const isExpanded = expandedRow === r.id;
    return (
        <>
            {/* Main row */}
            <tr
                style={{ background: statutColors[r.statut] || "transparent", cursor: "pointer" }}
                onPointerDown={(e) => {
                    pointerDownY.current = e.clientY;
                }}
                onPointerUp={(e) => {
                    if (Math.abs(e.clientY - pointerDownY.current) < 5) setExpandedRow(isExpanded ? null : r.id);
                }}
            >
                {/* Row actions */}
                <td style={{ ...tdStyle, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>{r.mot}</td>
                {!isMobile && <td style={tdStyle}><Badge value={r.type} small={isMobile} /></td>}

                <VocabularyTranslationCell
                    lang="fr"
                    value={r.fr}
                    rowId={r.id}
                    tdStyle={tdStyle}
                    editingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    setEditingField={setEditingField}
                    saveField={saveField}
                    saving={saving}
                    btnStyle={btnStyle}
                />
                <VocabularyTranslationCell
                    lang="en"
                    value={r.en}
                    rowId={r.id}
                    tdStyle={tdStyle}
                    editingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    setEditingField={setEditingField}
                    saveField={saveField}
                    saving={saving}
                    btnStyle={btnStyle}
                />
                {!isMobile && <td style={tdStyle}><TopikBadge v={r.topik_objectif} small={isMobile} /></td>}
                {!isMobile && <td style={tdStyle}><MultiTag val={r.usage} small={isMobile} /></td>}
                {!isMobile && <td style={tdStyle}><MultiTag val={r.theme} small={isMobile} /></td>}
                <td style={{...tdStyle, width: 35, minWidth: 35}}>
                    <div style={{display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2, justifyContent: "center"}}>
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
                            style={{ ...btnStyle(), padding: isMobile ? "2px 5px" : "3px 8px", fontSize: 10 }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                changeStatut("vocabulaire", r.id, r.statut);
                            }}
                        >
                            ↻
                        </button>
                        <button
                            style={{ ...btnStyle("danger"), padding: isMobile ? "2px 5px" : "3px 8px", fontSize: 10 }}
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
            {/* Expanded details panel */}
            {isExpanded && (
                <VocabularyDetailsPanel
                    r={r}
                    isMobile={isMobile}
                    editingField={editingField}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    setEditingField={setEditingField}
                    saveField={saveField}
                    saving={saving}
                    btnStyle={btnStyle}
                />
            )}
        </>
    );
};