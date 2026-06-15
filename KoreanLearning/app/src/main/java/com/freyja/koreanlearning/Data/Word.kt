package com.freyja.koreanlearning.Data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Word(
    //@SerialName("progression")
    //var progression: Int,
    @SerialName("mot")
    var original: String,
    @SerialName("fr")
    var translation: String,
    @SerialName("definition_kr")
    var example: String
)
