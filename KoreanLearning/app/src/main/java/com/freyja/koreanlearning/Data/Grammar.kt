package com.freyja.koreanlearning.Data

import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Grammar(
    @SerialName("id")
    val id: Long = 0,

    @SerialName("grammaire")
    val grammar: String,

    @SerialName("categorie")
    val category: String? = null,

    @SerialName("sous_categorie")
    val subCategory: String? = null,

    @SerialName("definition_kr")
    val definitionKr: String,

    @SerialName("definition_fr")
    val definitionFr: String,

    @SerialName("oral_ecrit")
    val oralWritten: String,

    @SerialName("niveau_reel")
    val actualLevel: String,

    @SerialName("topik_objectif")
    val topikTarget: Int? = null,

    @SerialName("usage")
    val usage: String? = null,

    @SerialName("grammaires_similaires")
    val similarGrammars: String? = null,

    @SerialName("points_importants")
    val keyPoints: String? = null,

    @SerialName("exemples")
    val examples: String? = null,

    @SerialName("chapitre")
    val chapter: String? = null,

    @SerialName("notes_perso")
    val personalNotes: String? = null,

    @SerialName("statut")
    val status: String = "inconnu",

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
)
