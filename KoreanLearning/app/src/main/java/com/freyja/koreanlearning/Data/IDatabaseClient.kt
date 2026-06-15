package com.freyja.koreanlearning.Data

interface IDatabaseClient {
    suspend fun getAllWords(): List<Word>
}
