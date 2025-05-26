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

// Akses kamera
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  webcamElement.srcObject = stream;
  isStreaming = true;
  requestAnimationFrame(loop);
}

// Loop deteksi
async function loop() {
  if (!isStreaming) return;

  // Gambar frame dari video ke canvas
  ctx.drawImage(webcamElement, 0, 0, 640, 480);

  // Deteksi objek
  const predictions = await model.detect(canvasElement);

  // Filter hanya tas
  const bagPredictions = predictions.filter(p => 
    p.class === "backpack" || 
    p.class === "handbag" || 
    p.class === "suitcase"
  );

  drawBoundingBoxes(bagPredictions);

  requestAnimationFrame(loop);
}

// Gambar kotak jika ada tas
function drawBoundingBoxes(predictions) {
  ctx.clearRect(0, 0, 640, 480);
  ctx.drawImage(webcamElement, 0, 0, 640, 480);

  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#FF0000";
    ctx.font = "16px Arial";
    ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);
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
  }
});

loadModel();