package com.freyja.koreanlearning

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.freyja.koreanlearning.Data.IDatabaseClient
import com.freyja.koreanlearning.Data.SupabaseDatabaseClient
import com.freyja.koreanlearning.Screens.CameraScreen
import com.freyja.koreanlearning.Screens.GrammarScreen
import com.freyja.koreanlearning.Screens.IScreen
import com.freyja.koreanlearning.Screens.LibraryScreen
import com.freyja.koreanlearning.Screens.MainScreenView
import com.freyja.koreanlearning.ui.theme.KoreanLearningTheme

class Screen(val route: String, val label: String, val icon: ImageVector, val screen: IScreen)

class MainActivity : ComponentActivity()
{
    val database: IDatabaseClient = SupabaseDatabaseClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()
        setContent {
            KoreanLearningTheme {
                val navController = rememberNavController()
                val homeScreen = Screen("home", "Home", Icons.Default.Home, MainScreenView(database))
                val items = listOf(
                    homeScreen,
                    Screen("grammar", "Grammar", Icons.Default.Edit, GrammarScreen(this)),
                    Screen("camera", "Camera", Icons.Outlined.AccountCircle, CameraScreen(database)),
                    Screen("library", "Library", Icons.Default.Menu, LibraryScreen()),
                )
                Scaffold(
                    bottomBar = {
                        NavigationBar {
                            val navBackStackEntry by navController.currentBackStackEntryAsState()
                            val currentDestination = navBackStackEntry?.destination
                            items.forEach { screen ->
                                NavigationBarItem(
                                    icon = { Icon(screen.icon, contentDescription = null) },
                                    label = { Text(screen.label) },
                                    selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                                    onClick = {
                                        navController.navigate(screen.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = homeScreen.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        for (screen in items)
                        {
                            composable(screen.route) {
                                screen.screen.Show()
                            }
                        }
                    }
                }
            }
        }
    }
}