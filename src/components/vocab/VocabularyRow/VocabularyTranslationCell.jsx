import { MultiTag } from "./../../Badge";

export default function VocabularyTranslationCell({
    lang,
    value,
    rowId,
    tdStyle,
    editingField,
    editValue,
    setEditValue,
    setEditingField,
    saveField,
    saving,
    btnStyle,
}) {
    return (
        <td
            style={{ ...tdStyle, cursor: "default" }}
        >
            {editingField?.id === rowId && (editingField?.field === lang || editingField?.field === "both") ? (
                <div
                    style={{ display: "flex", gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <textarea
                        value={editingField?.field === "both" ? (editValue?.[lang] || value || "") : editValue}
                        onChange={(e) => {
                            if (editingField?.field === "both") {
                                setEditValue({ ...editValue, [lang]: e.target.value });
                            } else {
                                setEditValue(e.target.value);
                            }
                        }}
                        rows={2}
                        style={{ flex: 1, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12, resize: "vertical" }}
                        autoFocus={editingField?.field === lang}
                    />
                    {editingField?.field === lang && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <button style={{ ...btnStyle("primary"), padding: "2px 6px", fontSize: 11 }} disabled={saving} onClick={() => saveField(rowId, lang, editValue)}>
                                ✓
                            </button>
                            <button style={{ ...btnStyle(), padding: "2px 6px", fontSize: 11 }} onClick={() => setEditingField(null)}>
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <span>{value || "—"}</span>
            )}
        </td>
    );
}