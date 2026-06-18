package com.freyja.koreanlearning.Screens

import android.Manifest
import android.annotation.SuppressLint
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.core.content.ContextCompat
import androidx.compose.ui.window.Popup
import com.freyja.koreanlearning.Data.IDatabaseClient
import com.freyja.koreanlearning.Data.Word
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions
import kotlinx.coroutines.coroutineScope
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.coroutines.coroutineContext

class CameraScreen : IScreen {
    val database: IDatabaseClient

    constructor(database: IDatabaseClient) {
        this.database = database
    }

    private var detectedTexts by mutableStateOf<List<String>?>(null)
    private var words : List<Word>? = null

    @Composable
    override fun Show() {
        val context = LocalContext.current
        val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) {
                Toast.makeText(context, "Permission Granted", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, "Permission Denied", Toast.LENGTH_SHORT).show()
            }
        }
        val lifecycleOwner = LocalLifecycleOwner.current
        val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }

        val imageCapture = remember { ImageCapture.Builder().build() }
        val previewView = remember { PreviewView(context) }
        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

        LaunchedEffect(Unit) {
            words = database.getAllWords()
            launcher.launch(Manifest.permission.CAMERA)

            val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build().also {
                    it.surfaceProvider = previewView.surfaceProvider
                }

                try {
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        imageCapture
                    )
                } catch (exc: Exception) {
                    Log.e("CameraScreen", "Use case binding failed", exc)
                }
            }, ContextCompat.getMainExecutor(context))
        }

        val currentTexts = detectedTexts
        if (currentTexts == null) {
            Box(modifier = Modifier.fillMaxSize()) {
                AndroidView(
                    factory = { previewView },
                    modifier = Modifier.fillMaxSize()
                )

                Button(
                    onClick = {
                        imageCapture.takePicture(
                            cameraExecutor,
                            object : ImageCapture.OnImageCapturedCallback() {
                                override fun onCaptureSuccess(image: androidx.camera.core.ImageProxy) {
                                    onPictureTaken(image, context)
                                }
                            }
                        )
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 32.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                }
            }
        } else {
            ResultScreen(texts = currentTexts) {
                detectedTexts = null
            }
        }
    }

    @SuppressLint("UnsafeOptInUsageError")
    fun onPictureTaken(image: androidx.camera.core.ImageProxy, context: android.content.Context) {
        val mediaImage = image.image
        if (mediaImage != null) {
            val inputImage = InputImage.fromMediaImage(mediaImage, image.imageInfo.rotationDegrees)
            val options = KoreanTextRecognizerOptions.Builder().build()
            val recognizer = TextRecognition.getClient(options)

            recognizer.process(inputImage)
                .addOnSuccessListener { visionText ->
                    val results = mutableListOf<String>()
                    for (block in visionText.textBlocks) {
                        results.add(block.text)
                    }

                    if (results.isEmpty()) {
                        Toast.makeText(context, "No text found", Toast.LENGTH_SHORT).show()
                    } else {
                        detectedTexts = results
                    }
                }
                .addOnFailureListener { e ->
                    Toast.makeText(context, "Text recognition failed : ${e.message}", Toast.LENGTH_SHORT).show()
                    Log.e("CameraScreen", "Text recognition failed", e)
                }
                .addOnCompleteListener {
                    image.close()
                }
        } else {
            image.close()
        }
    }

    @Composable
    private fun ResultScreen(texts: List<String>, onBack: () -> Unit) {
        var selectedWord by remember { mutableStateOf<String?>(null) }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Default.ArrowBack, contentDescription = "Back")
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(top = 16.dp)
            ) {
                if (texts.isEmpty()) {
                    Text("No text detected")
                } else {
                    texts.forEach { text ->
                        val word = words?.find { it.original == text }

                        if (word != null) {
                            TextButton(onClick = { selectedWord = text }) {
                                Text(
                                    text = text,
                                    color = Color.Black, // Text color
                                    modifier = Modifier.drawBehind {
                                        val strokeWidthPx = 2.dp.toPx()
                                        val verticalOffset = size.height - 1.dp.toPx()
                                        drawLine(
                                            color = Color.Red, // Underline color
                                            strokeWidth = strokeWidthPx,
                                            start = Offset(0f, verticalOffset),
                                            end = Offset(size.width, verticalOffset)
                                        )
                                    }
                                )
                            }
                        }
                        else {
                            Text(text = text)
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }

        selectedWord?.let { word ->
            WordDescriptionPopup(word = word, onDismiss = { selectedWord = null })
        }
    }

    @Composable
    private fun WordDescriptionPopup(word: String, onDismiss: () -> Unit) {
        Popup(
            alignment = Alignment.Center,
            onDismissRequest = onDismiss
        ) {
            Surface(
                modifier = Modifier
                    .wrapContentSize()
                    .padding(24.dp),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
                tonalElevation = 8.dp,
                shadowElevation = 8.dp
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "Word: $word", style = androidx.compose.material3.MaterialTheme.typography.headlineSmall)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "This is a placeholder description for the detected text.")
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onDismiss) {
                        Text("Close")
                    }
                }
            }
        }
    }
}