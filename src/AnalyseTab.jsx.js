const [photo, setPhoto] = useState(null);
const [photoB64, setPhotoB64] = useState(null);
const [chatHistory, setChatHistory] = useState([]);
const [userInput, setUserInput] = useState("");
const [analyzing, setAnalyzing] = useState(false);
const [pendingData, setPendingData] = useState(null);
const [importing, setImporting] = useState(false);

const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(URL.createObjectURL(file));
    const b64 = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxSize = 1024;
            let w = img.width;
            let h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) {
                    h = (h * maxSize) / w;
                    w = maxSize;
                } else {
                    w = (w * maxSize) / h;
                    h = maxSize;
                }
            }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.8).split(",")[1]);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });

    setPhotoB64(b64);
    setChatHistory([]);
    setPendingData(null);
};

const sendMessage = async (overrideText) => {
    const text = overrideText || userInput.trim();
    if (!text && !photoB64) return;

    const newMsg = { role: "user", content: text || "Analyse cette photo." };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);
    setUserInput("");
    setAnalyzing(true);

    try {
        const parts = [];
        if (photoB64) parts.push({ inlineData: { mimeType: "image/jpeg", data: photoB64 } });
        parts.push({ text: `${text}\n\nVocab existant: ${vocabData.map((v) => v.mot).join(", ") || "aucun"}\nGram existante: ${gramData.map((g) => g.grammaire).join(", ") || "aucune"}` });

        const history = updatedHistory.slice(0, -1).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        const data = await callGemini({
            system_instruction: { parts: [{ text: SKILL_PROMPT }] },
            contents: [...history, { role: "user", parts }],
        });

        const full = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur : pas de réponse";
        const jsonMatch = full.match(/```json\n([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                setPendingData(JSON.parse(jsonMatch[1]));
            } catch (_) {
                // ignore invalid JSON
            }
        }
        const displayText = full.replace(/```json[\s\S]*?```/g, "").trim();
        setChatHistory([...updatedHistory, { role: "assistant", content: displayText }]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
        showMsg("Erreur API: " + e.message, "error");
    } finally {
        setAnalyzing(false);
    }
};

const importToSupabase = async () => {
    if (!pendingData) return;
    setImporting(true);
    let vocabAdded = 0;
    let gramAdded = 0;
    let skipped = 0;

    try {
        if (pendingData.vocabulaire?.length) {
            const existingMots = new Set(vocabData.map((v) => v.mot));
            const toInsert = pendingData.vocabulaire
                .filter((v) => !existingMots.has(v.mot))
                .map((v) => ({ ...v, topik_objectif: v.topik_objectif ? parseInt(v.topik_objectif) : null }));
            skipped += pendingData.vocabulaire.length - toInsert.length;
            if (toInsert.length) {
                await supabase("/vocabulaire", "POST", toInsert);
                vocabAdded = toInsert.length;
            }
        }

        if (pendingData.grammaire?.length) {
            const existingG = new Set(gramData.map((g) => g.grammaire));
            const toInsert = pendingData.grammaire.filter((g) => !existingG.has(g.grammaire));
            skipped += pendingData.grammaire.length - toInsert.length;
            if (toInsert.length) {
                await supabase("/grammaire", "POST", toInsert);
                gramAdded = toInsert.length;
            }
        }

        await loadVocab();
        await loadGram();
        setPendingData(null);
        showMsg(`Importé : ${vocabAdded} mots, ${gramAdded} grammaires${skipped ? ` (${skipped} doublons ignorés)` : ""}`);
    } catch (e) {
        showMsg("Erreur import: " + e.message, "error");
    } finally {
        setImporting(false);
    }
};