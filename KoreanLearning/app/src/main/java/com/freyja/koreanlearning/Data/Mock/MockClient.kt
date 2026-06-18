package com.freyja.koreanlearning.Data.Mock

import com.freyja.koreanlearning.Data.Grammar
import com.freyja.koreanlearning.Data.IDatabaseClient
import com.freyja.koreanlearning.Data.Word

class MockClient : IDatabaseClient
{
    override suspend fun getAllWords(): List<Word> {
        var words = mutableListOf<Word>()

        for (i in 1..20)
        {
            words.add(Word("word $i", "translation $i", "example $i"))
        }
        return words
    }

    override suspend fun getAllGrammars(): List<Grammar> {
        return emptyList()
    }
}