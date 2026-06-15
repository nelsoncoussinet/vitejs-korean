package com.freyja.koreanlearning.Data

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from

class SupabaseDatabaseClient : IDatabaseClient
{
    var _instance: SupabaseClient? = null;

    private fun getClient(): SupabaseClient
    {
        if (_instance == null) {
            _instance = createSupabaseClient(
                supabaseUrl = "https://bfsieishsrhshjmijwtx.supabase.co",
                supabaseKey = "sb_publishable_qpN6pKcAhLMaXbqtpd0R1Q_ah0wviOD"
            ) {
                install(Postgrest)
            }
        }
        return _instance!!
    }

    override suspend fun getAllWords(): List<Word>
    {
        return getClient()
            .from("vocabulaire")
            .select()
            .decodeList<Word>()
    }
}