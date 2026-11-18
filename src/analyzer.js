/**
 * Analyzer & Engine wrapper using Stockfish.js Web Worker
 */
class StockfishAnalyzer {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.currentFen = null;
    this.onEvaluationCallback = null;
    this.bestMoveResolver = null;
    this.init();
  }

  init() {
    try {
      const workerPath = (typeof window !== 'undefined' && window.location.pathname.includes('/src/'))
        ? '../lib/stockfish.js'
        : 'lib/stockfish.js';

      this.worker = new Worker(workerPath);
      this.worker.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.sendCommand('uci');
      this.sendCommand('setoption name Skill Level value 20'); // Maksimal Grandmaster
      this.sendCommand('setoption name Threads value 2');
      this.sendCommand('setoption name Hash value 32');
      this.sendCommand('isready');
    } catch (e) {
      console.warn("Stockfish worker initialization error:", e);
    }
  }

  sendCommand(cmd) {
    if (this.worker) {
      this.worker.postMessage(cmd);
    }
  }

  evaluatePosition(fen, depth = 14, callback) {
    this.currentFen = fen;
    this.onEvaluationCallback = callback;
    
    this.sendCommand('stop');
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth}`);
  }

  // Mendapatkan langkah terbaik asinkron dari Stockfish Engine sesuai tingkat level
  getBestMove(fen, depth = 16, skillLevel = 20) {
    return new Promise((resolve) => {
      this.bestMoveResolver = resolve;
      this.sendCommand('stop');
      this.sendCommand(`setoption name Skill Level value ${skillLevel}`);
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);

      // Timeout cadangan jika worker tidak merespons dalam 8 detik
      setTimeout(() => {
        if (this.bestMoveResolver === resolve) {
          this.bestMoveResolver = null;
          resolve(null);
        }
      }, 8000);
    });
  }

  handleMessage(line) {
    if (typeof line !== 'string') return;

    if (line === 'readyok') {
      this.isReady = true;
      return;
    }

    if (line.startsWith('info') && line.includes('score')) {
      const depthMatch = line.match(/depth\s+(\d+)/);
      const scoreCpMatch = line.match(/score\s+cp\s+(-?\d+)/);
      const scoreMateMatch = line.match(/score\s+mate\s+(-?\d+)/);
      const pvMatch = line.match(/pv\s+([a-h1-8]{4,5})/);

      let score = null;
      let isMate = false;
      let bestMove = pvMatch ? pvMatch[1] : null;

      if (scoreMateMatch) {
        isMate = true;
        score = parseInt(scoreMateMatch[1], 10);
      } else if (scoreCpMatch) {
        score = parseInt(scoreCpMatch[1], 10) / 100;
      }

      if (this.onEvaluationCallback && score !== null) {
        this.onEvaluationCallback({
          depth: depthMatch ? parseInt(depthMatch[1], 10) : 0,
          score: score,
          isMate: isMate,
          bestMove: bestMove
        });
      }
    }

    // Bestmove line
    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];

      // Jika ada callback Promise yang menunggu
      if (this.bestMoveResolver) {
        const resolve = this.bestMoveResolver;
        this.bestMoveResolver = null;
        resolve(bestMove);
      }

      if (this.onEvaluationCallback && bestMove) {
        this.onEvaluationCallback({
          isFinal: true,
          bestMove: bestMove
        });
      }
    }
  }
}

window.StockfishAnalyzer = StockfishAnalyzer;
