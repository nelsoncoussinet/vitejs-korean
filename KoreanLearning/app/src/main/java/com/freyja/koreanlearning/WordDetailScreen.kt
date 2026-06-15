package com.freyja.koreanlearning

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.freyja.koreanlearning.Data.Word

@Composable
fun WordDetailScreen(word: Word, modifier: Modifier = Modifier.Companion, onBack: () -> Unit) {
    BackHandler(onBack = onBack)

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Button(onClick = onBack) {
            Text("Back")
        }
        Spacer(modifier = Modifier.height(24.dp))
        Text(text = word.original, style = MaterialTheme.typography.headlineLarge)
        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))

        Text(text = "Translation", style = MaterialTheme.typography.labelLarge)
        Text(text = word.translation, style = MaterialTheme.typography.bodyLarge)
    }
}