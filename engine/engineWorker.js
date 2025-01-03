importScripts('./stockfish-nnue-16-single.js');

let engine = Stockfish();
engine.onmessage = function(line) {
  postMessage(line);
};
onmessage = function(e) {
  engine.postMessage(e.data);
};
