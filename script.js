let model;
let webcamElement = document.getElementById('webcam');
let canvasElement = document.getElementById('canvas');
let ctx = canvasElement.getContext("2d");
let isStreaming = false;

// Load model COCO-SSD
async function loadModel() {
  model = await cocoSsd.load();
  console.log("Model telah dimuat.");
}

// Deteksi apakah perangkat mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Akses kamera
async function startCamera() {
  if (!isMobileDevice()) {
    alert("Fungsi ini hanya tersedia di perangkat mobile.");
    return;
  }

  const facingMode = document.getElementById("cameraSelect").value;

  const constraints = {
    video: { facingMode: facingMode }
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    webcamElement.srcObject = stream;
    isStreaming = true;
    requestAnimationFrame(loop);

    // Aktifkan dropdown setelah kamera aktif
    document.getElementById("cameraSelect").disabled = false;
  } catch (err) {
    alert("Gagal mengakses kamera: " + err.message);
  }
}

// Loop deteksi
async function loop() {
  if (!isStreaming) return;

  ctx.drawImage(webcamElement, 0, 0, 640, 480);

  const predictions = await model.detect(canvasElement);

  const bagPredictions = predictions.filter(p => 
    p.class === "backpack" || 
    p.class === "handbag" || 
    p.class === "suitcase"
  );

  drawBoundingBoxes(bagPredictions);

  requestAnimationFrame(loop);
}

// Gambar kotak putih jika ada tas
function drawBoundingBoxes(predictions) {
  ctx.clearRect(0, 0, 640, 480);
  ctx.drawImage(webcamElement, 0, 0, 640, 480);

  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;

    // Kotak putih
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Latar belakang hitam untuk teks
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y > 15 ? y - 15 : 0, 100, 20);

    // Teks putih
    ctx.font = "14px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(prediction.class, x + 5, y > 15 ? y - 5 : 15);
  });
}

// Toggle tombol open/close kamera
document.getElementById("toggleCameraBtn").addEventListener("click", () => {
  if (!isStreaming) {
    startCamera();
    document.getElementById("toggleCameraBtn").innerText = "Tutup Kamera";
  } else {
    const stream = webcamElement.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    webcamElement.srcObject = null;
    isStreaming = false;
    ctx.clearRect(0, 0, 640, 480);
    document.getElementById("toggleCameraBtn").innerText = "Buka Kamera";
    document.getElementById("cameraSelect").disabled = true;
  }
});

loadModel();
