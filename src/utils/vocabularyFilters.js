export function getAllUsages(vocabData) {
  return [...new Set(
    vocabData.flatMap((r) =>
      r.usage
        ? r.usage.split("|").map((t) => t.trim())
        : []
    )
  )].sort();
}

export const filterVocabulary = (
  vocabData,
  vocabSearch = "",
  vocabFilterUsage = "",
  vocabFilterTopik = "",
  vocabFilterStatut = ""
) => {
  if (!Array.isArray(vocabData)) return [];

  return vocabData.filter((r) => {
    if (
      vocabSearch &&
      !r.mot?.toLowerCase().includes(vocabSearch.toLowerCase()) &&
      !r.fr?.toLowerCase().includes(vocabSearch.toLowerCase())
    ) {
      return false;
    }

    if (
      vocabFilterUsage &&
      !r.usage?.split("|").map((t) => t.trim()).includes(vocabFilterUsage)
    ) {
      return false;
    }

    if (vocabFilterTopik && String(r.topik_objectif) !== vocabFilterTopik) {
      return false;
    }

    if (vocabFilterStatut && r.statut !== vocabFilterStatut) {
      return false;
    }

    return true;
  });
};
