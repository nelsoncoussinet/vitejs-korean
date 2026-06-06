import { useState } from "react";
import {
  filterVocabulary,
  getAllUsages
} from "../utils/vocabularyFilters";

export default function useVocabularyFilters(vocabData) {
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabFilterUsage, setVocabFilterUsage] = useState("");
  const [vocabFilterTopik, setVocabFilterTopik] = useState("");
  const [vocabFilterStatut, setVocabFilterStatut] = useState("");

  const allUsages = getAllUsages(vocabData);

  const filteredVocab = filterVocabulary(
    vocabData,
    vocabSearch,
    vocabFilterUsage,
    vocabFilterTopik,
    vocabFilterStatut
  );

  return {
    filteredVocab,
    allUsages,

    vocabSearch,
    setVocabSearch,

    vocabFilterUsage,
    setVocabFilterUsage,

    vocabFilterTopik,
    setVocabFilterTopik,

    vocabFilterStatut,
    setVocabFilterStatut,
  };
}x