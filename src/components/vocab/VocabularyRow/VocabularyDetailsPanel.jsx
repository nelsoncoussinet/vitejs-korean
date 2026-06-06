import { MultiTag } from "./../../Badge";
import MobileTranslationPanel from "./MobileTranslationPanel";

export default function VocabularyDetailsPanel({
    r,
    isMobile,
    editingField,
    editValue,
    setEditValue,
    setEditingField,
    saveField,
    saving,
    btnStyle,
}) {
    const colSpan = isMobile ? 4 : 8;
    return (
        <tr style={{ background: "#fafafa" }}>
            <td colSpan={colSpan} style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>
                {/* Details grid */}
                <div className="vocab-details-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, fontSize: 13 }}>
                    {isMobile && (
                        <>
                            <MobileTranslationPanel
                                lang="fr"
                                label="Traduction FR"
                                value={r.fr}
                                rowId={r.id}
                                editingField={editingField}
                                editValue={editValue}
                                setEditValue={setEditValue}
                                setEditingField={setEditingField}
                                saveField={saveField}
                                saving={saving}
                                btnStyle={btnStyle}
                            />
                            <MobileTranslationPanel
                                lang="en"
                                label="Translation EN"
                                value={r.en}
                                rowId={r.id}
                                editingField={editingField}
                                editValue={editValue}
                                setEditValue={setEditValue}
                                setEditingField={setEditingField}
                                saveField={saveField}
                                saving={saving}
                                btnStyle={btnStyle}
                            />
                        </>
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
    );
}