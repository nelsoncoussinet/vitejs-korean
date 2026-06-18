package com.freyja.koreanlearning.Screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.freyja.koreanlearning.Data.IDatabaseClient
import com.freyja.koreanlearning.Data.Mock.MockClient
import com.freyja.koreanlearning.Data.Word
import com.freyja.koreanlearning.WordDetailScreen

class MainScreenView(val database: IDatabaseClient) : IScreen
{
    @Composable
    override fun Show() {
        var selectedWord by remember { mutableStateOf<Word?>(null) }

        Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
            if (selectedWord == null) {
                DashboardScreen(
                    modifier = Modifier.padding(innerPadding),
                    onWordClick = { selectedWord = it }
                )
            } else {
                WordDetailScreen(
                    word = selectedWord!!,
                    modifier = Modifier.padding(innerPadding),
                    onBack = { selectedWord = null }
                )
            }
        }
    }

    @Composable
    fun DashboardScreen(
        modifier: Modifier = Modifier,
        onWordClick: (Word) -> Unit
    ) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Stats Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                StatItem(label = "To learn", count = 0)
                StatItem(label = "learning", count = 0)
                StatItem(label = "learned", count = 0)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Search and List Section in a separate function
            WordListSection(
                modifier = Modifier.weight(1f),
                onWordClick = onWordClick
            )
        }
    }

    @Composable
    fun WordListSection(
        modifier: Modifier = Modifier,
        onWordClick: (Word) -> Unit
    ) {
        var searchQuery by remember { mutableStateOf("") }
        val words = remember { mutableStateListOf<Word>() }

        LaunchedEffect(Unit) {
            try {
                val results = database.getAllWords()
                words.clear()
                words.addAll(results)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        val filteredWords = words.filter {
            it.original.contains(searchQuery, ignoreCase = true) ||
                    it.translation.contains(searchQuery, ignoreCase = true)
        }

        Column(modifier = modifier) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Search words") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search Icon") },
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // if filter return nothing show an add button to add the word
            if (filteredWords.isEmpty() && searchQuery.isNotEmpty()) {
                Button(
                    onClick = { /* TODO: Implement add word logic */ },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(Modifier.size(8.dp))
                    Text("Add \"$searchQuery\"")
                }
            }

            LazyColumn(modifier = Modifier.fillMaxWidth()) {
                items(filteredWords) { word ->
                    ListItem(
                        modifier = Modifier.clickable { onWordClick(word) },
                        headlineContent = { Text(word.original) },
                        supportingContent = { Text(word.translation) },
                        trailingContent = {
                            // Simple visual progression indicator
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Learning Progress",
                                tint = when {
                                    /*word.progression*/0 == 3 -> Color(0xFF4CAF50) // Green for 'learned'
                                    /*word.progression*/0 == 2 -> Color(0xFFFFEB3B) // Yellow for 'in good progress'
                                    /*word.progression*/0 == 1 -> Color(0xFFF44336) // Orange for 'in progress'
                                    else -> LocalContentColor.current.copy(alpha = 0.3f) // Dim for 'not started'
                                },
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    )
                    HorizontalDivider()
                }
            }
        }
    }

    @Composable
    fun StatItem(label: String, count: Int) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.secondary
            )
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Preview
@Composable
fun Preview()
{
    MainScreenView(MockClient()).Show()
}