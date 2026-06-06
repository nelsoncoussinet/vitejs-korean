export const filterGrammar = (gramData, search, category, statut) => {
  return gramData.filter((r) => {
    if (search) {
      const lowerSearch = search.toLowerCase();
      if (
        !r.grammaire?.toLowerCase().includes(lowerSearch) &&
        !r.definition_fr?.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }
    }

    if (category && !r.categorie?.includes(category)) {
      return false;
    }

    if (statut && r.statut !== statut) {
      return false;
    }

    return true;
  });
};

