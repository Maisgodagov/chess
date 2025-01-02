// engine/engineWorker.js

importScripts('./stockfish-nnue-16-single.js'); // Путь относительный к engineWorker.js

let engine = Stockfish();

// Логирование инициализации
console.log("Stockfish engine initialized");

// Обработка сообщений от Stockfish
engine.onmessage = function(line) {
  console.log("Stockfish:", line);
  postMessage(line);
};

// Обработка сообщений от main.js
onmessage = function(e) {
  console.log("Received from main:", e.data);
  engine.postMessage(e.data);
};
