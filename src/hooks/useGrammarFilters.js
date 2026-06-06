import { useState } from "react";
import { filterGrammar } from "../utils/grammarFilters";

export default function useGrammarFilters(gramData) {
  const [gramSearch, setGramSearch] = useState("");
  const [gramFilterCat, setGramFilterCat] = useState("");
  const [gramFilterStatut, setGramFilterStatut] = useState("");

  const filteredGram = filterGrammar(
    gramData,
    gramSearch,
    gramFilterCat,
    gramFilterStatut
  );

  return {
    filteredGram,

    gramSearch,
    setGramSearch,

    gramFilterCat,
    setGramFilterCat,

    gramFilterStatut,
    setGramFilterStatut,
  };
}