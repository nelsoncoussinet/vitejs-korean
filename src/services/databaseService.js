import { supabase } from "../lib/api";

export async function updateVocabularyFieldToDb(
  id,
  field,
  value
) {
  return supabase(
    `/vocabulaire?id=eq.${id}`,
    "PATCH",
    {
      [field]: value,
      updated_at: new Date().toISOString()
    }
  );
}

export async function updateStatutToDb(
  table,
  id,
  statut
) {
  return supabase(
    `/${table}?id=eq.${id}`,
    "PATCH",
    {
      statut,
      updated_at: new Date().toISOString()
    }
  );
}

export async function loadGrammarFromDb() {
  return supabase(
    "/grammaire?order=id.asc&limit=1000"
  );
}

export async function loadVocabularyFromDb() {
  return supabase(
    "/vocabulaire?order=id.asc&limit=1000"
  );
}

export async function deleteEntryToDb(
  table,
  id
) {
  return supabase(
    `/${table}?id=eq.${id}`,
    "DELETE"
  );
}