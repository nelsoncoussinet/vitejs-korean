import {MultiTag} from "./../../Badge";

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
    );
}