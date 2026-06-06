import { parseDefinitions } from "../../../lib/helpers";

export default function MobileTranslationPanel({
    lang,
    label,
    value,
    rowId,
    editingField,
    editValue,
    setEditValue,
    setEditingField,
    saveField,
    saving,
    btnStyle,
}) {
    return (
        <div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
            {editingField?.id === rowId && editingField?.field === `${lang}-panel` ? (
                <div style={{ display: "flex", gap: 6 }}>
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13, resize: "vertical" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <button style={btnStyle("primary")} disabled={saving} onClick={() => saveField(rowId, lang, editValue)}>
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
                        setEditingField({ id: rowId, field: `${lang}-panel` });
                        setEditValue(value || "");
                    }}
                    style={{ cursor: "text", padding: "6px 8px", borderRadius: 6, border: "1px dashed #ddd", minHeight: 40, background: "#fff" }}
                >
                    {parseDefinitions(value).length > 1
                        ? parseDefinitions(value).map((d, i) => (
                            <div key={i}>
                                <span style={{ color: "#aaa", marginRight: 4 }}>
                                    ({i + 1})
                                </span>
                                {d}
                            </div>
                        ))
                        : <span>{value || <span style={{ color: "#bbb" }}>—</span>}</span>}
                </div>
            )}
        </div>
    );
}