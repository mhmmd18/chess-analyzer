// Popup controller for Chess Post-Game Analyzer

document.addEventListener('DOMContentLoaded', () => {
  // Unicode Chess Pieces
  const PIECES = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
  };

  const PIECE_NAMES_ID = {
    'p': 'Bidak (Pion)',
    'n': 'Kuda',
    'b': 'Gajah (Bishop)',
    'r': 'Benteng (Rook)',
    'q': 'Menteri (Queen)',
    'k': 'Raja (King)'
  };

  const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
  };

  // Positional Piece-Square Tables (White's perspective, ranks 8 to 1)
  const PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  const BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  const ROOK_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ];

  const QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  const KING_TABLE = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ];

  const PST_MAP = {
    'p': PAWN_TABLE,
    'n': KNIGHT_TABLE,
    'b': BISHOP_TABLE,
    'r': ROOK_TABLE,
    'q': QUEEN_TABLE,
    'k': KING_TABLE
  };

  let chess = new Chess();
  let analyzer = new StockfishAnalyzer();
  let historyMoves = [];
  let currentMoveIndex = -1; // -1 = initial position
  let isFlipped = false;

  // Auto-play state
  let isPlaying = false;
  let playInterval = null;

  // DOM Elements - Tabs
  const tabBtnPlay = document.getElementById('tab-btn-play');
  const tabBtnAnalyzer = document.getElementById('tab-btn-analyzer');
  const tabBtnImport = document.getElementById('tab-btn-import');
  const tabBtnEditor = document.getElementById('tab-btn-editor');
  const tabBtnCommand = document.getElementById('tab-btn-command');
  const tabContentPlay = document.getElementById('tab-content-play');
  const tabContentAnalyzer = document.getElementById('tab-content-analyzer');
  const tabContentImport = document.getElementById('tab-content-import');
  const tabContentEditor = document.getElementById('tab-content-editor');
  const tabContentCommand = document.getElementById('tab-content-command');

  // DOM Elements - Sidebar Drawer
  const btnOpenSidebar = document.getElementById('btn-open-sidebar');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-drawer-overlay');
  const sidebarItemPlay = document.getElementById('sidebar-item-play');
  const sidebarItemAnalyzer = document.getElementById('sidebar-item-analyzer');
  const sidebarItemImport = document.getElementById('sidebar-item-import');
  const sidebarItemEditor = document.getElementById('sidebar-item-editor');
  const headerUserTag = document.getElementById('header-user-tag');
  const btnChangeUsernameHeader = document.getElementById('btn-change-username-header');

  // DOM Elements - Play Mode
  const playChessboardEl = document.getElementById('play-chessboard');
  const playEvalBarEl = document.getElementById('play-eval-bar');
  // DOM Elements - Play Mode Profile Bars (Persis Gambar 1 & 2)
  const avatarTop = document.getElementById('avatar-top');
  const avatarBottom = document.getElementById('avatar-bottom');
  const nameTop = document.getElementById('name-top');
  const nameBottom = document.getElementById('name-bottom');
  const ratingTop = document.getElementById('rating-top');
  const ratingBottom = document.getElementById('rating-bottom');
  const flagTop = document.getElementById('flag-top');
  const flagBottom = document.getElementById('flag-bottom');
  const badgeTop = document.getElementById('badge-top');
  const capturedTop = document.getElementById('captured-top');
  const capturedBottom = document.getElementById('captured-bottom');

  // DOM Elements - Review Profile Bars
  const reviewAvatarTop = document.getElementById('review-avatar-top');
  const reviewAvatarBottom = document.getElementById('review-avatar-bottom');
  const reviewCapturedTop = document.getElementById('review-captured-top');
  const reviewCapturedBottom = document.getElementById('review-captured-bottom');

  const clockWhiteEl = document.getElementById('clock-white');
  const clockBlackEl = document.getElementById('clock-black');
  const timeControlSection = document.getElementById('time-control-section');
  const selectedTimeLabel = document.getElementById('selected-time-label');
  const botDelaySliderBox = document.getElementById('bot-delay-slider-box');
  const playGameStatus = document.getElementById('play-game-status');
  const playTimerDisplay = document.getElementById('play-timer-display');
  const playModeSelect = document.getElementById('play-mode-select');
  const botDifficultySelect = document.getElementById('bot-difficulty-select');
  const playDelayRange = document.getElementById('play-delay-range');
  const delayLabel = document.getElementById('delay-label');
  const playMoveListEl = document.getElementById('play-move-list');
  const playGameOverBanner = document.getElementById('play-game-over-banner');
  const btnReviewNow = document.getElementById('btn-review-now');
  const btnPlayStart = document.getElementById('btn-play-start');
  const btnPlayReset = document.getElementById('btn-play-reset');
  const playSettingsPanel = document.getElementById('play-settings-panel');

  const chessboardEl = document.getElementById('chessboard');
  const evalBarEl = document.getElementById('eval-bar');
  const moveListEl = document.getElementById('move-list');
  const playerWhiteEl = document.getElementById('player-white');
  const playerBlackEl = document.getElementById('player-black');

  // DOM Elements - Coach Review Card (Gambar 2)
  const coachBadge = document.getElementById('coach-badge');
  const coachEvalScore = document.getElementById('coach-eval-score');
  const coachMessage = document.getElementById('coach-message');
  const coachSuggest = document.getElementById('coach-suggest');
  const btnCoachNext = document.getElementById('btn-coach-next');

  // DOM Elements - Modal Kesimpulan Ulasan (Gambar 1)
  const modalReviewSummary = document.getElementById('modal-review-summary');
  const btnCloseSummary = document.getElementById('btn-close-summary');
  const btnStartStepReview = document.getElementById('btn-start-step-review');
  const evalGraphCanvas = document.getElementById('eval-graph-canvas');

  const sumWhiteName = document.getElementById('sum-white-name');
  const sumBlackName = document.getElementById('sum-black-name');
  const sumWhiteAcc = document.getElementById('sum-white-acc');
  const sumBlackAcc = document.getElementById('sum-black-acc');
  const sumWhiteRating = document.getElementById('sum-white-rating');
  const sumBlackRating = document.getElementById('sum-black-rating');

  const cntWhiteBrilliant = document.getElementById('cnt-white-brilliant');
  const cntBlackBrilliant = document.getElementById('cnt-black-brilliant');
  const cntWhiteGreat = document.getElementById('cnt-white-great');
  const cntBlackGreat = document.getElementById('cnt-black-great');
  const cntWhiteBest = document.getElementById('cnt-white-best');
  const cntBlackBest = document.getElementById('cnt-black-best');
  const cntWhiteMistake = document.getElementById('cnt-white-mistake');
  const cntBlackMistake = document.getElementById('cnt-black-mistake');
  const cntWhiteMissed = document.getElementById('cnt-white-missed');
  const cntBlackMissed = document.getElementById('cnt-black-missed');
  const cntWhiteBlunder = document.getElementById('cnt-white-blunder');
  const cntBlackBlunder = document.getElementById('cnt-black-blunder');

  // DOM Elements - Modal Game Over (Gambar Chess.com: You Won! / You Lost!)
  const modalGameOver = document.getElementById('modal-game-over');
  const btnCloseGameOver = document.getElementById('btn-close-game-over');
  const goIcon = document.getElementById('go-icon');
  const goTitle = document.getElementById('go-title');
  const goSubtitle = document.getElementById('go-subtitle');
  const goRatingVal = document.getElementById('go-rating-val');
  const goRatingDiff = document.getElementById('go-rating-diff');
  const goCoachText = document.getElementById('go-coach-text');
  const btnGoGameReview = document.getElementById('btn-go-game-review');
  const btnGoNewGame = document.getElementById('btn-go-new-game');
  const btnGoRematch = document.getElementById('btn-go-rematch');

  const pgnInputEl = document.getElementById('pgn-input');
  const chessUsernameEl = document.getElementById('chess-username');
  const btnLoadPgn = document.getElementById('btn-load-pgn');
  const btnFetchGame = document.getElementById('btn-fetch-game');
  const btnBrowseFile = document.getElementById('btn-browse-file');
  const pgnFileInput = document.getElementById('pgn-file-input');

  const btnFirst = document.getElementById('btn-first');
  const btnPrev = document.getElementById('btn-prev');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnNext = document.getElementById('btn-next');
  const btnLast = document.getElementById('btn-last');
  const btnFlip = document.getElementById('btn-flip');

  // --- TABS SWITCHING ---
  function switchTab(target) {
    stopAutoPlay();
    stopPlayGameTimer();
    stopCommandStockfish();

    if (tabBtnPlay) tabBtnPlay.classList.toggle('active', target === 'play');
    if (tabBtnAnalyzer) tabBtnAnalyzer.classList.toggle('active', target === 'analyzer');
    if (tabBtnImport) tabBtnImport.classList.toggle('active', target === 'import');
    if (tabBtnEditor) tabBtnEditor.classList.toggle('active', target === 'editor');
    if (tabBtnCommand) tabBtnCommand.classList.toggle('active', target === 'command');

    if (tabContentPlay) tabContentPlay.classList.toggle('active', target === 'play');
    if (tabContentAnalyzer) tabContentAnalyzer.classList.toggle('active', target === 'analyzer');
    if (tabContentImport) tabContentImport.classList.toggle('active', target === 'import');
    if (tabContentEditor) tabContentEditor.classList.toggle('active', target === 'editor');
    if (tabContentCommand) tabContentCommand.classList.toggle('active', target === 'command');

    if (target === 'editor') {
      renderEditorBoard();
    } else if (target === 'command') {
      renderCommandBoard();
      updateCommandEvaluation();
    }
  }

  if (tabBtnPlay) tabBtnPlay.addEventListener('click', () => switchTab('play'));
  if (tabBtnAnalyzer) tabBtnAnalyzer.addEventListener('click', () => switchTab('analyzer'));
  if (tabBtnImport) tabBtnImport.addEventListener('click', () => switchTab('import'));
  if (tabBtnEditor) tabBtnEditor.addEventListener('click', () => switchTab('editor'));
  if (tabBtnCommand) tabBtnCommand.addEventListener('click', () => switchTab('command'));

  // Sidebar listeners
  if (btnOpenSidebar) {
    btnOpenSidebar.addEventListener('click', () => {
      checkMamadVipAccess();
      if (sidebarOverlay) sidebarOverlay.style.display = 'flex';
    });
  }
  if (btnCloseSidebar) {
    btnCloseSidebar.addEventListener('click', () => {
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', (e) => {
      if (e.target === sidebarOverlay) sidebarOverlay.style.display = 'none';
    });
  }

  if (sidebarItemPlay) {
    sidebarItemPlay.addEventListener('click', () => {
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
      switchTab('play');
    });
  }
  if (sidebarItemAnalyzer) {
    sidebarItemAnalyzer.addEventListener('click', () => {
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
      switchTab('analyzer');
    });
  }
  if (sidebarItemImport) {
    sidebarItemImport.addEventListener('click', () => {
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
      switchTab('import');
    });
  }
  if (sidebarItemEditor) {
    sidebarItemEditor.addEventListener('click', () => {
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
      switchTab('editor');
    });
  }
  if (btnChangeUsernameHeader) {
    btnChangeUsernameHeader.addEventListener('click', () => {
      if (modalWelcomeUsername) modalWelcomeUsername.style.display = 'flex';
    });
  }

  // --- HIGH-ACCURACY POSITIONAL EVALUATOR ---
  function quickEvaluatePosition(gameInstance) {
    if (gameInstance.in_checkmate()) {
      return gameInstance.turn() === 'w' ? -9999 : 9999;
    }
    if (gameInstance.in_draw()) {
      return 0;
    }

    let score = 0;
    const board = gameInstance.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const type = piece.type;
          let val = PIECE_VALUES[type] || 0;
          
          // Positional Table bonus
          const pst = PST_MAP[type];
          let posVal = 0;
          if (pst) {
            // White uses table directly, Black flips ranks
            posVal = (piece.color === 'w') ? pst[r][c] : pst[7 - r][c];
          }

          const totalPieceVal = val + posVal;
          if (piece.color === 'w') {
            score += totalPieceVal;
          } else {
            score -= totalPieceVal;
          }
        }
      }
    }

    // Mobilitas & Skak
    if (gameInstance.in_check()) {
      score += (gameInstance.turn() === 'w' ? -50 : 50);
    }

    return score / 100; // Kembalikan dalam skala Pawn/poin catur (contoh: +1.5, -0.8)
  }

  // --- MINIMAX DENGAN ALPHA-BETA PRUNING ---
  function minimaxAlphaBeta(gameInstance, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || gameInstance.game_over()) {
      return quickEvaluatePosition(gameInstance);
    }

    // Urutkan langkah (tangkapan dan skak lebih dulu) untuk efisiensi pruning
    let moves = gameInstance.moves({ verbose: true });
    moves.sort((a, b) => {
      let scoreA = a.captured ? (PIECE_VALUES[a.captured] || 0) : 0;
      let scoreB = b.captured ? (PIECE_VALUES[b.captured] || 0) : 0;
      return scoreB - scoreA;
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let m of moves) {
        gameInstance.move(m);
        let evaluation = minimaxAlphaBeta(gameInstance, depth - 1, alpha, beta, false);
        gameInstance.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let m of moves) {
        gameInstance.move(m);
        let evaluation = minimaxAlphaBeta(gameInstance, depth - 1, alpha, beta, true);
        gameInstance.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Pruning
      }
      return minEval;
    }
  }

  // Cari langkah terbaik (Grandmaster Minimax 3-ply)
  function smartFindBestMove(gameInstance, searchDepth = 3) {
    const moves = gameInstance.moves({ verbose: true });
    if (!moves || moves.length === 0) return null;

    // Sort moves: prioritaskan tangkapan dan skak
    moves.sort((a, b) => {
      let scoreA = a.captured ? (PIECE_VALUES[a.captured] || 0) : 0;
      let scoreB = b.captured ? (PIECE_VALUES[b.captured] || 0) : 0;
      return scoreB - scoreA;
    });

    const isWhiteTurn = gameInstance.turn() === 'w';
    let bestMove = moves[0];
    let bestScore = isWhiteTurn ? -Infinity : Infinity;

    for (let m of moves) {
      gameInstance.move(m);
      let score = minimaxAlphaBeta(gameInstance, searchDepth - 1, -Infinity, Infinity, !isWhiteTurn);
      gameInstance.undo();

      if (isWhiteTurn) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
    }

    return bestMove;
  }

  function quickFindBestMove(gameInstance) {
    return smartFindBestMove(gameInstance, 2);
  }

  // --- ANALISIS KESALAHAN & ALASAN (CHESS.COM COACH ENGINE) ---
  function analyzeMoveDetails(moveIndex) {
    if (moveIndex < 0 || moveIndex >= historyMoves.length) {
      return null;
    }

    const tempBefore = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      tempBefore.move(historyMoves[i]);
    }
    const fenBefore = tempBefore.fen();
    const playedMove = historyMoves[moveIndex];
    const playerColor = playedMove.color;

    const tempAfter = new Chess(fenBefore);
    tempAfter.move(playedMove);

    const scoreBeforeWhite = quickEvaluatePosition(tempBefore);
    const scoreAfterWhite = quickEvaluatePosition(tempAfter);

    const scoreBeforePlayer = playerColor === 'w' ? scoreBeforeWhite : -scoreBeforeWhite;
    const scoreAfterPlayer = playerColor === 'w' ? scoreAfterWhite : -scoreAfterWhite;

    const evalLoss = scoreBeforePlayer - scoreAfterPlayer;

    const bestAlternative = quickFindBestMove(tempBefore);
    const bestSan = bestAlternative ? bestAlternative.san : '';

    const pieceName = PIECE_NAMES_ID[playedMove.piece] || 'Bidak';
    const playedSan = playedMove.san;

    // Cek apakah lawan sekarang punya langkah balasan memakan perwira gratis
    const opponentMoves = tempAfter.moves({ verbose: true });
    let freeCaptureMove = null;
    for (let om of opponentMoves) {
      if (om.captured && PIECE_VALUES[om.captured] >= 200) {
        freeCaptureMove = om;
        break;
      }
    }

    // Deteksi Kategori Chess.com 6-Level
    let quality = 'BEST';
    let badgeText = '★ Terbaik';
    let badgeSymbol = '★';
    let typeClass = 'best';
    let coachMsg = '';

    // Cek Pengorbanan Brilian (Brilliant Move)
    const isSacrifice = playedMove.captured === undefined && 
                        ['q', 'r', 'b', 'n'].includes(playedMove.piece) && 
                        freeCaptureMove && 
                        freeCaptureMove.to === playedMove.to &&
                        scoreAfterPlayer >= 0;

    if (isSacrifice) {
      quality = 'BRILLIANT';
      badgeText = '!! Brilian';
      badgeSymbol = '!!';
      typeClass = 'brilliant';
      coachMsg = `Langkah brilian! Anda sengaja mengorbankan ${pieceName} untuk membongkar pertahanan lawan demi serangan yang menentukan!`;
    } else if (evalLoss >= 2.5) {
      quality = 'BLUNDER';
      badgeText = '?? Blunder';
      badgeSymbol = '??';
      typeClass = 'blunder';
      if (freeCaptureMove && freeCaptureMove.to === playedMove.to) {
        coachMsg = `Blunder fatal! Anda melangkahkan ${pieceName} ke petak ${playedMove.to} tanpa perlindungan, sehingga dapat dimakan gratis oleh lawan (${freeCaptureMove.san}).`;
      } else if (freeCaptureMove) {
        const hangingName = PIECE_NAMES_ID[freeCaptureMove.captured] || 'perwira';
        coachMsg = `Pertahanan Anda terbuka lebar! Lawan sekarang dapat memakan ${hangingName} Anda secara cuma-cuma di petak ${freeCaptureMove.to}.`;
      } else if (tempAfter.in_check()) {
        coachMsg = `Langkah ini menempatkan Raja Anda dalam posisi berbahaya dan langsung terkena serangan skak!`;
      } else {
        coachMsg = `Langkah ini membuat posisi Anda anjlok drastis (-${evalLoss.toFixed(1)} poin). Keunggulan berpindah ke tangan lawan.`;
      }
    } else if (evalLoss >= 1.5 && bestAlternative && bestAlternative.captured) {
      quality = 'MISSED';
      badgeText = '✕ Terlewat';
      badgeSymbol = '✕';
      typeClass = 'missed';
      coachMsg = `Peluang emas terlewatkan! Anda melewatkan kesempatan emas untuk memakan perwira lawan dengan ${bestSan}.`;
    } else if (evalLoss >= 1.0) {
      quality = 'MISTAKE';
      badgeText = '? Kesalahan';
      badgeSymbol = '?';
      typeClass = 'mistake';
      coachMsg = `Langkah ini kurang akurat dan menurunkan keunggulan Anda sebesar -${evalLoss.toFixed(1)} poin.`;
    } else if (evalLoss <= 0.05 && scoreAfterPlayer >= 1.5) {
      quality = 'GREAT';
      badgeText = '! Bagus';
      badgeSymbol = '!';
      typeClass = 'great';
      coachMsg = `Langkah hebat! Anda mempertahankan inisiatif serangan dan menekan posisi lawan.`;
    } else {
      quality = 'BEST';
      badgeText = '★ Terbaik';
      badgeSymbol = '★';
      typeClass = 'best';
      if (playedMove.captured) {
        const capName = PIECE_NAMES_ID[playedMove.captured] || 'bidak';
        coachMsg = `Langkah terbaik! Memakan ${capName} lawan dengan kalkulasi yang sangat matang.`;
      } else if (tempAfter.in_check()) {
        coachMsg = `Langkah tepat! Memberikan ancaman skak langsung yang memaksa respon dari lawan.`;
      } else {
        coachMsg = `Langkah terbaik sesuai kalkulasi engine! Mengembangkan perwira secara optimal dan mengontrol petak strategis.`;
      }
    }

    return {
      quality,
      badgeText,
      badgeSymbol,
      typeClass,
      coachMsg,
      evalLoss,
      bestSan: bestSan || playedSan,
      scoreWhite: scoreAfterWhite,
      playerColor,
      fromSquare: playedMove.from,
      toSquare: playedMove.to,
      bestFrom: bestAlternative ? bestAlternative.from : null,
      bestTo: bestAlternative ? bestAlternative.to : null
    };
  }

  // --- HELPER PIECE RENDERING (Official Chess.com Neo Pieces) ---
  function createPieceElement(piece) {
    const span = document.createElement('span');
    span.className = 'piece';
    const char = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
    
    if (window.CHESSCOM_PIECES && window.CHESSCOM_PIECES[char]) {
      const img = document.createElement('img');
      img.src = window.CHESSCOM_PIECES[char];
      img.alt = char;
      img.draggable = false;
      span.appendChild(img);
    } else if (window.SVG_PIECES && window.SVG_PIECES[char]) {
      span.innerHTML = window.SVG_PIECES[char];
    } else {
      span.textContent = PIECES[char] || '';
    }
    return span;
  }

  // Helper temukan petak Raja
  function findKingSquare(gameInstance, color) {
    const b = gameInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = b[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          return String.fromCharCode(97 + c) + (8 - r);
        }
      }
    }
    return null;
  }

  // Helper Hitung & Tampilkan Bidak yang Dimakan (Captured Pieces & Material Advantage)
  const STARTING_PIECES_COUNT = { 'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1 };
  const MATERIAL_VALUES = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };

  function updateCapturedPiecesDisplay(gameInstance, topContainer, bottomContainer, isBottomWhite = true) {
    if (!topContainer || !bottomContainer) return;

    topContainer.innerHTML = '';
    bottomContainer.innerHTML = '';

    const currentWhite = { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 };
    const currentBlack = { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 };

    let totalWhiteScore = 0;
    let totalBlackScore = 0;

    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          const t = piece.type;
          const val = MATERIAL_VALUES[t] || 0;
          if (piece.color === 'w') {
            currentWhite[t] = (currentWhite[t] || 0) + 1;
            totalWhiteScore += val;
          } else {
            currentBlack[t] = (currentBlack[t] || 0) + 1;
            totalBlackScore += val;
          }
        }
      }
    }

    // Bidak yang dimakan Putih (bidak hitam yang hilang)
    const whiteCaptured = [];
    // Bidak yang dimakan Hitam (bidak putih yang hilang)
    const blackCaptured = [];

    const order = ['q', 'r', 'b', 'n', 'p'];
    order.forEach(type => {
      const missingBlack = (STARTING_PIECES_COUNT[type] || 0) - (currentBlack[type] || 0);
      for (let i = 0; i < missingBlack; i++) {
        whiteCaptured.push({ type, color: 'b' });
      }

      const missingWhite = (STARTING_PIECES_COUNT[type] || 0) - (currentWhite[type] || 0);
      for (let i = 0; i < missingWhite; i++) {
        blackCaptured.push({ type, color: 'w' });
      }
    });

    const bottomCapturedPieces = isBottomWhite ? whiteCaptured : blackCaptured;
    const topCapturedPieces = isBottomWhite ? blackCaptured : whiteCaptured;

    const bottomAdvantage = isBottomWhite ? (totalWhiteScore - totalBlackScore) : (totalBlackScore - totalWhiteScore);
    const topAdvantage = -bottomAdvantage;

    const baseDir = window.PIECES_DIR || 'assets/pieces/';

    // Render ke top container
    topCapturedPieces.forEach(item => {
      const img = document.createElement('img');
      img.className = 'captured-piece-mini';
      const code = item.color + item.type;
      img.src = `${baseDir}${code}.png`;
      img.alt = code;
      topContainer.appendChild(img);
    });
    if (topAdvantage > 0) {
      const advSpan = document.createElement('span');
      advSpan.className = 'captured-advantage-score';
      advSpan.textContent = `+${topAdvantage}`;
      topContainer.appendChild(advSpan);
    }

    // Render ke bottom container
    bottomCapturedPieces.forEach(item => {
      const img = document.createElement('img');
      img.className = 'captured-piece-mini';
      const code = item.color + item.type;
      img.src = `${baseDir}${code}.png`;
      img.alt = code;
      bottomContainer.appendChild(img);
    });
    if (bottomAdvantage > 0) {
      const advSpan = document.createElement('span');
      advSpan.className = 'captured-advantage-score';
      advSpan.textContent = `+${bottomAdvantage}`;
      bottomContainer.appendChild(advSpan);
    }
  }

  // --- BOARD RENDERING (Papan Analisis dengan Badge Petak Gambar 2) ---
  function renderBoard(highlightMove = null, bestMoveUci = null, moveBadge = null) {
    chessboardEl.innerHTML = '';
    const board = chess.board();

    const ranks = isFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const files = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    // Petak Raja yang terkena Skak
    const checkedKingSquare = chess.in_check() ? findKingSquare(chess, chess.turn()) : null;

    let bestFrom = null;
    let bestTo = null;
    if (bestMoveUci && bestMoveUci.length >= 4) {
      bestFrom = bestMoveUci.substring(0, 2);
      bestTo = bestMoveUci.substring(2, 4);
    }

    ranks.forEach((r, rIdx) => {
      files.forEach((f, fIdx) => {
        const fileChar = String.fromCharCode(97 + f);
        const rankNum = r + 1;
        const squareName = fileChar + rankNum;
        const squareEl = document.createElement('div');
        const isLight = (r + f) % 2 !== 0;
        squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
        squareEl.dataset.square = squareName;

        // Efek Petak Raja Merah saat posisi terkena Skak!
        if (checkedKingSquare === squareName) {
          squareEl.classList.add('check-square');
        }

        // Label Koordinat Angka (1-8) di petak paling kiri
        if (fIdx === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-rank';
          rankLabel.textContent = rankNum;
          squareEl.appendChild(rankLabel);
        }

        // Label Koordinat Huruf (a-h) di petak paling bawah
        if (rIdx === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-file';
          fileLabel.textContent = fileChar;
          squareEl.appendChild(fileLabel);
        }

        if (highlightMove) {
          if (highlightMove.from === squareName) squareEl.classList.add('highlight-from');
          if (highlightMove.to === squareName) squareEl.classList.add('highlight-to');
        }

        if (bestFrom === squareName || bestTo === squareName) {
          squareEl.classList.add('best-move-hint');
        }

        const piece = board[7 - r][f];
        if (piece) {
          squareEl.appendChild(createPieceElement(piece));
        }

        // Badge Notasi Mini di Sudut Petak (Persis Gambar 2)
        if (highlightMove && highlightMove.to === squareName && moveBadge) {
          const badgeEl = document.createElement('div');
          badgeEl.className = `square-badge badge-${moveBadge.typeClass}`;
          badgeEl.textContent = moveBadge.badgeSymbol;
          squareEl.appendChild(badgeEl);
        }

        chessboardEl.appendChild(squareEl);
      });
    });

    // Update captured pieces untuk Tab Analisis
    updateCapturedPiecesDisplay(chess, reviewCapturedTop, reviewCapturedBottom, !isFlipped);

    // Update posisi profil dan avatar di Tab Analisis sesuai apakah papan dibalik (Flipped)
    updateReviewProfilesPosition();

    // Gambar Arah Panah Langkah (Move Arrows)
    renderMoveArrows(chessboardEl, isFlipped, highlightMove, moveBadge, bestFrom, bestTo);
  }

  // Helper Tukar Profil Atas & Bawah saat Papan di-Revert (Flip)
  let reviewWhitePlayerName = 'Putih';
  let reviewBlackPlayerName = 'Hitam';

  function updateReviewProfilesPosition() {
    const baseDir = window.PIECES_DIR || 'assets/pieces/';

    // Jika isFlipped = false (Normal: Putih di bawah, Hitam di atas)
    // Jika isFlipped = true  (Revert/Dibalik: Hitam di bawah, Putih di atas)
    if (!isFlipped) {
      if (playerBlackEl) playerBlackEl.textContent = `Hitam: ${reviewBlackPlayerName}`;
      if (playerWhiteEl) playerWhiteEl.textContent = `Putih: ${reviewWhitePlayerName}`;
      if (reviewAvatarTop) reviewAvatarTop.src = `${baseDir}bp.png`;
      if (reviewAvatarBottom) reviewAvatarBottom.src = `${baseDir}wp.png`;
    } else {
      if (playerBlackEl) playerBlackEl.textContent = `Putih: ${reviewWhitePlayerName}`;
      if (playerWhiteEl) playerWhiteEl.textContent = `Hitam: ${reviewBlackPlayerName}`;
      if (reviewAvatarTop) reviewAvatarTop.src = `${baseDir}wp.png`;
      if (reviewAvatarBottom) reviewAvatarBottom.src = `${baseDir}bp.png`;
    }
  }

  // Helper Gambar Panah Langkah (SVG Canvas di atas Papan Catur)
  function renderMoveArrows(boardContainer, flipped, playedMove, analysisData, bestFrom, bestTo) {
    if (!boardContainer) return;
    const existingSvg = boardContainer.querySelector('.board-arrows-svg');
    if (existingSvg) existingSvg.remove();

    if (!playedMove && !analysisData && !bestFrom) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'board-arrows-svg');
    svg.setAttribute('viewBox', '0 0 800 800');

    // Definisikan Marker Kepala Panah (Arrowhead markers yang proporsional dan pas)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Warna Panah:
    // Hijau (#81b64c) jika Benar (BEST / GREAT / BRILLIANT)
    // Merah (#e53935) jika Salah (BLUNDER / MISTAKE / MISSED)
    const arrowColors = {
      green: '#81b64c',
      red: '#e53935',
      lightGreen: '#58a700'
    };

    ['green', 'red', 'lightGreen'].forEach(key => {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', `arrowhead-${key}`);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '6');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '5');
      marker.setAttribute('markerHeight', '5');
      marker.setAttribute('orient', 'auto-start-reverse');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M 0 1.5 L 9 5 L 0 8.5 z');
      path.setAttribute('fill', arrowColors[key]);
      marker.appendChild(path);
      defs.appendChild(marker);
    });

    svg.appendChild(defs);

    function squareToCoords(sq) {
      if (!sq || sq.length < 2) return null;
      const fileChar = sq[0];
      const rankNum = parseInt(sq[1], 10);
      let col = fileChar.charCodeAt(0) - 97; // a=0 ... h=7
      let row = rankNum - 1; // 1=0 ... 8=7

      let xIdx = flipped ? (7 - col) : col;
      let yIdx = flipped ? row : (7 - row);

      // Skala viewBox 800x800 -> 1 petak = 100x100, titik tengah = +50
      return {
        x: xIdx * 100 + 50,
        y: yIdx * 100 + 50
      };
    }

    function drawArrow(fromSq, toSq, colorKey, isDashed = false) {
      const p1 = squareToCoords(fromSq);
      const p2 = squareToCoords(toSq);
      if (!p1 || !p2) return;

      const colFrom = fromSq.charCodeAt(0) - 97;
      const rowFrom = parseInt(fromSq[1], 10) - 1;
      const colTo = toSq.charCodeAt(0) - 97;
      const rowTo = parseInt(toSq[1], 10) - 1;

      const deltaCol = Math.abs(colTo - colFrom);
      const deltaRow = Math.abs(rowTo - rowFrom);

      // Cek apakah ini langkah Kuda (Knight Move: 1x2 atau 2x1 petak)
      const isKnightMove = (deltaCol === 1 && deltaRow === 2) || (deltaCol === 2 && deltaRow === 1);

      if (isKnightMove) {
        // Gambar panah bentuk L khas Chess.com:
        // Titik belok tikungan sudut siku (corner)
        let cornerSq;
        if (deltaRow === 2) {
          // Melangkah 2 langkah vertikal dulu, lalu belok 1 horizontal
          cornerSq = fromSq[0] + toSq[1];
        } else {
          // Melangkah 2 langkah horizontal dulu, lalu belok 1 vertikal
          cornerSq = toSq[0] + fromSq[1];
        }

        const pCorner = squareToCoords(cornerSq);
        if (pCorner) {
          const dxEnd = p2.x - pCorner.x;
          const dyEnd = p2.y - pCorner.y;
          const distEnd = Math.hypot(dxEnd, dyEnd);
          const trimEnd = 26;
          const endX = p2.x - (dxEnd / distEnd) * trimEnd;
          const endY = p2.y - (dyEnd / distEnd) * trimEnd;

          const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
          polyline.setAttribute('points', `${p1.x},${p1.y} ${pCorner.x},${pCorner.y} ${endX},${endY}`);
          polyline.setAttribute('fill', 'none');
          polyline.setAttribute('stroke', arrowColors[colorKey] || colorKey);
          polyline.setAttribute('stroke-width', '10');
          polyline.setAttribute('stroke-linecap', 'round');
          polyline.setAttribute('stroke-linejoin', 'round');
          polyline.setAttribute('marker-end', `url(#arrowhead-${colorKey})`);
          polyline.setAttribute('opacity', '0.85');
          if (isDashed) {
            polyline.setAttribute('stroke-dasharray', '8 6');
          }
          svg.appendChild(polyline);
          return;
        }
      }

      // Langkah lurus atau diagonal biasa (Gajah, Benteng, Ratu, Raja, Pion)
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const trimEnd = 26;
      const endX = p2.x - (dx / dist) * trimEnd;
      const endY = p2.y - (dy / dist) * trimEnd;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('stroke', arrowColors[colorKey] || colorKey);
      line.setAttribute('stroke-width', '10'); // Ketebalan pas proporsional
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('marker-end', `url(#arrowhead-${colorKey})`);
      line.setAttribute('opacity', '0.85');
      if (isDashed) {
        line.setAttribute('stroke-dasharray', '8 6');
      }

      svg.appendChild(line);
    }

    // 1. Panah Rekomendasi Langkah Terbaik (Jika ada rekomendasi langsung)
    if (bestFrom && bestTo) {
      drawArrow(bestFrom, bestTo, 'green');
    }

    // 2. Panah Langkah yang Dimainkan:
    if (playedMove && playedMove.from && playedMove.to) {
      const isBad = analysisData && ['BLUNDER', 'MISTAKE', 'MISSED'].includes(analysisData.quality);
      const moveColor = isBad ? 'red' : 'green';
      drawArrow(playedMove.from, playedMove.to, moveColor);
    }

    // 3. Jika Langkah yang Dimainkan Salah, gambarkan juga panah petunjuk Langkah Terbaik yang Seharusnya (Hijau Putus-putus)
    if (analysisData && ['BLUNDER', 'MISTAKE', 'MISSED'].includes(analysisData.quality)) {
      if (analysisData.bestFrom && analysisData.bestTo) {
        drawArrow(analysisData.bestFrom, analysisData.bestTo, 'lightGreen', true);
      }
    }

    boardContainer.appendChild(svg);
  }

  function updateEvalBar(whiteScore) {
    let winProb = 50 + 50 * (2 / (1 + Math.exp(-0.004 * (whiteScore * 100))) - 1);
    winProb = Math.max(5, Math.min(95, winProb));
    evalBarEl.style.height = `${winProb}%`;
  }

  // --- MOVE NAVIGATION ---
  function goToMove(index) {
    if (index < -1 || index >= historyMoves.length) {
      if (isPlaying && index >= historyMoves.length) {
        stopAutoPlay();
      }
      return;
    }

    currentMoveIndex = index;
    chess.reset();

    for (let i = 0; i <= currentMoveIndex; i++) {
      chess.move(historyMoves[i]);
    }

    const lastMove = currentMoveIndex >= 0 ? historyMoves[currentMoveIndex] : null;
    updateMoveListActive();

    // 1. TAMPILKAN ANALISIS INSTAN DENGAN CHESS COACH (Gambar 2)
    if (currentMoveIndex >= 0) {
      const analysis = analyzeMoveDetails(currentMoveIndex);
      if (analysis) {
        // Update Coach Review UI
        coachBadge.className = `coach-move-badge badge-${analysis.typeClass}`;
        coachBadge.textContent = analysis.badgeText;

        const sign = analysis.scoreWhite > 0 ? '+' : '';
        coachEvalScore.textContent = `${sign}${analysis.scoreWhite.toFixed(2)}`;
        coachMessage.textContent = analysis.coachMsg;

        if (analysis.bestSan && (analysis.quality === 'BLUNDER' || analysis.quality === 'MISTAKE' || analysis.quality === 'MISSED')) {
          coachSuggest.innerHTML = `💡 Rekomendasi Langkah: <strong>${analysis.bestSan}</strong>`;
          coachSuggest.style.display = 'block';
        } else {
          coachSuggest.style.display = 'none';
        }

        updateEvalBar(analysis.scoreWhite);
        renderBoard(lastMove, null, analysis);
      } else {
        renderBoard(lastMove);
      }
    } else {
      // Posisi Awal
      coachBadge.className = 'coach-move-badge badge-best';
      coachBadge.textContent = '🏁 Awal Game';
      coachEvalScore.textContent = '0.00';
      coachMessage.textContent = 'Permainan dimulai. Tekan "Selanjutnya ➡️" untuk meninjau ulasan langkah demi langkah dari pelatih.';
      coachSuggest.style.display = 'none';
      updateEvalBar(0);
      renderBoard(null);
    }

    // 2. STOCKFISH ENGINE BACKGROUND REFINEMENT (Jika worker aktif)
    try {
      analyzer.evaluatePosition(chess.fen(), 12, (evalData) => {
        if (evalData && evalData.score !== null && evalData.score !== undefined) {
          let turn = chess.turn();
          let whiteScore = turn === 'w' ? evalData.score : -evalData.score;
          const sign = whiteScore > 0 ? '+' : '';
          evalScoreEl.textContent = `${sign}${whiteScore.toFixed(1)}`;
          updateEvalBar(whiteScore);
        }
        if (evalData && evalData.bestMove) {
          renderBoard(lastMove, evalData.bestMove);
        }
      });
    } catch (e) {
      // Ignore worker fallback
    }
  }

  function updateMoveListActive() {
    const allMoveItems = moveListEl.querySelectorAll('.move-item');
    allMoveItems.forEach((el, idx) => {
      if (idx === currentMoveIndex) {
        el.classList.add('active');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('active');
      }
    });
  }

  function buildMoveList() {
    moveListEl.innerHTML = '';
    for (let i = 0; i < historyMoves.length; i += 2) {
      const moveNum = document.createElement('div');
      moveNum.className = 'move-num';
      moveNum.textContent = `${Math.floor(i / 2) + 1}.`;

      const whiteMove = document.createElement('div');
      whiteMove.className = 'move-item';
      whiteMove.textContent = historyMoves[i].san;
      const whiteIdx = i;
      whiteMove.addEventListener('click', () => {
        stopAutoPlay();
        goToMove(whiteIdx);
      });

      moveListEl.appendChild(moveNum);
      moveListEl.appendChild(whiteMove);

      if (i + 1 < historyMoves.length) {
        const blackMove = document.createElement('div');
        blackMove.className = 'move-item';
        blackMove.textContent = historyMoves[i + 1].san;
        const blackIdx = i + 1;
        blackMove.addEventListener('click', () => {
          stopAutoPlay();
          goToMove(blackIdx);
        });
        moveListEl.appendChild(blackMove);
      } else {
        const empty = document.createElement('div');
        moveListEl.appendChild(empty);
      }
    }
  }

  // --- AUTO PLAY & STOP ---
  function startAutoPlay() {
    if (historyMoves.length === 0) return;
    if (currentMoveIndex >= historyMoves.length - 1) {
      currentMoveIndex = -1;
    }
    isPlaying = true;
    btnPlayPause.textContent = '⏸️ Stop';
    btnPlayPause.style.background = '#d9534f';

    playInterval = setInterval(() => {
      if (currentMoveIndex < historyMoves.length - 1) {
        goToMove(currentMoveIndex + 1);
      } else {
        stopAutoPlay();
      }
    }, 1500);
  }

  function stopAutoPlay() {
    isPlaying = false;
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    btnPlayPause.textContent = '▶️ Play';
    btnPlayPause.style.background = '';
  }

  btnPlayPause.addEventListener('click', () => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  // --- GAME REVIEW SUMMARY (Persis Gambar 1) ---
  function showGameReviewSummary(whitePlayerName = 'Anda', blackPlayerName = 'Lawan') {
    if (!historyMoves || historyMoves.length === 0) return;

    // Reset counters
    const stats = {
      w: { brilliant: 0, great: 0, best: 0, mistake: 0, missed: 0, blunder: 0, totalLoss: 0, count: 0 },
      b: { brilliant: 0, great: 0, best: 0, mistake: 0, missed: 0, blunder: 0, totalLoss: 0, count: 0 }
    };

    const graphPoints = []; // Untuk eval graph canvas

    // Analisis seluruh langkah permainan
    for (let i = 0; i < historyMoves.length; i++) {
      const detail = analyzeMoveDetails(i);
      if (detail) {
        const side = detail.playerColor; // 'w' or 'b'
        stats[side].count++;
        stats[side].totalLoss += Math.max(0, detail.evalLoss);

        if (detail.quality === 'BRILLIANT') stats[side].brilliant++;
        else if (detail.quality === 'GREAT') stats[side].great++;
        else if (detail.quality === 'BEST') stats[side].best++;
        else if (detail.quality === 'MISTAKE') stats[side].mistake++;
        else if (detail.quality === 'MISSED') stats[side].missed++;
        else if (detail.quality === 'BLUNDER') stats[side].blunder++;

        graphPoints.push({
          score: detail.scoreWhite,
          quality: detail.quality
        });
      }
    }

    // Hitung Akurasi (%) formula Chess.com
    function calcAccuracy(s) {
      if (s.count === 0) return 75.0;
      const avgLoss = s.totalLoss / s.count;
      // Formula penurunan eksponensial akurasi
      let acc = 100 * Math.exp(-0.45 * avgLoss);
      acc = Math.max(38, Math.min(98.5, acc));
      return acc.toFixed(1).replace('.', ',');
    }

    // Hitung Rating Permainan
    function calcGameRating(accStr) {
      const acc = parseFloat(accStr.replace(',', '.'));
      let rating = Math.round(350 + (acc - 40) * 22);
      return Math.max(400, Math.min(2200, rating));
    }

    const whiteAcc = calcAccuracy(stats.w);
    const blackAcc = calcAccuracy(stats.b);

    // Update UI Teks & Angka
    sumWhiteName.textContent = whitePlayerName;
    sumBlackName.textContent = blackPlayerName;
    sumWhiteAcc.textContent = whiteAcc;
    sumBlackAcc.textContent = blackAcc;

    sumWhiteRating.textContent = calcGameRating(whiteAcc);
    sumBlackRating.textContent = calcGameRating(blackAcc);

    cntWhiteBrilliant.textContent = stats.w.brilliant;
    cntBlackBrilliant.textContent = stats.b.brilliant;
    cntWhiteGreat.textContent = stats.w.great;
    cntBlackGreat.textContent = stats.b.great;
    cntWhiteBest.textContent = stats.w.best;
    cntBlackBest.textContent = stats.b.best;
    cntWhiteMistake.textContent = stats.w.mistake;
    cntBlackMistake.textContent = stats.b.mistake;
    cntWhiteMissed.textContent = stats.w.missed;
    cntBlackMissed.textContent = stats.b.missed;
    cntWhiteBlunder.textContent = stats.w.blunder;
    cntBlackBlunder.textContent = stats.b.blunder;

    // Gambar Canvas Grafik Evaluasi (Gaya Chess.com)
    drawEvalGraph(graphPoints);

    // Tampilkan Modal
    modalReviewSummary.style.display = 'flex';
  }

  function drawEvalGraph(points) {
    if (!evalGraphCanvas) return;
    const ctx = evalGraphCanvas.getContext('2d');
    const w = evalGraphCanvas.width;
    const h = evalGraphCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background tengah (garis nol)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (!points || points.length === 0) return;

    const stepX = w / Math.max(1, points.length - 1);

    // Draw line
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((pt, idx) => {
      const x = idx * stepX;
      // Clamp score between -5 and +5
      const clamped = Math.max(-5, Math.min(5, pt.score));
      // Normalize to y: +5 is top (4px), -5 is bottom (h - 4px)
      const y = (h / 2) - (clamped / 5) * (h / 2 - 4);

      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw colored dots for notable moves
    points.forEach((pt, idx) => {
      if (pt.quality === 'BEST' || pt.quality === 'GREAT') return; // Lewati yang biasa agar tidak penuh

      const x = idx * stepX;
      const clamped = Math.max(-5, Math.min(5, pt.score));
      const y = (h / 2) - (clamped / 5) * (h / 2 - 4);

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);

      if (pt.quality === 'BRILLIANT') ctx.fillStyle = '#1baca6';
      else if (pt.quality === 'BLUNDER') ctx.fillStyle = '#ca3431';
      else if (pt.quality === 'MISSED') ctx.fillStyle = '#db4b4b';
      else if (pt.quality === 'MISTAKE') ctx.fillStyle = '#e58f2a';
      else ctx.fillStyle = '#81b64c';

      ctx.fill();
    });
  }

  // Event Listener Modal Kesimpulan
  if (btnCloseSummary) {
    btnCloseSummary.addEventListener('click', () => {
      modalReviewSummary.style.display = 'none';
    });
  }

  if (btnStartStepReview) {
    btnStartStepReview.addEventListener('click', () => {
      modalReviewSummary.style.display = 'none';
      switchTab('analyzer');
      goToMove(0); // Mulai ulasan dari langkah pertama
    });
  }

  // Tombol Coach Selanjutnya (Gambar 2)
  if (btnCoachNext) {
    btnCoachNext.addEventListener('click', () => {
      if (currentMoveIndex < historyMoves.length - 1) {
        goToMove(currentMoveIndex + 1);
      } else {
        alert('Anda sudah berada di akhir ulasan permainan!');
      }
    });
  }

  // --- LOAD GAME / PGN ---
  function loadPgn(pgnText) {
    stopAutoPlay();
    const tempChess = new Chess();
    const success = tempChess.load_pgn(pgnText);

    if (!success) {
      alert('Format PGN tidak valid!');
      return;
    }

    const header = tempChess.header();
    const whiteName = header.White || 'Pemain Putih';
    const blackName = header.Black || 'Pemain Hitam';

    reviewWhitePlayerName = whiteName;
    reviewBlackPlayerName = blackName;
    updateReviewProfilesPosition();

    historyMoves = tempChess.history({ verbose: true });
    buildMoveList();
    goToMove(-1);

    // Tampilkan Kesimpulan Ulasan Otomatis (Gambar 1)
    setTimeout(() => {
      showGameReviewSummary(whiteName, blackName);
    }, 200);
  }

  btnLoadPgn.addEventListener('click', () => {
    const text = pgnInputEl.value.trim();
    if (text) {
      loadPgn(text);
    } else {
      alert('Silakan tempel teks PGN terlebih dahulu.');
    }
  });

  btnBrowseFile.addEventListener('click', () => {
    pgnFileInput.click();
  });

  pgnFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      pgnInputEl.value = content;
      loadPgn(content);
    };
    reader.readAsText(file);
  });

  // Fetch last game from Chess.com Public API (via Vercel Serverless Proxy or Direct Fallback)
  btnFetchGame.addEventListener('click', async () => {
    const username = chessUsernameEl.value.trim().toLowerCase();
    if (!username) {
      alert('Masukkan username Chess.com!');
      return;
    }

    btnFetchGame.textContent = 'Memuat...';
    btnFetchGame.disabled = true;

    try {
      let pgn = null;

      // Coba lewat Serverless API Vercel terlebih dahulu (Bypass Cloudflare & Header User-Agent untuk HP)
      try {
        const proxyRes = await fetch(`/api/last-game?username=${encodeURIComponent(username)}`);
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (proxyData && proxyData.pgn) {
            pgn = proxyData.pgn;
          }
        } else if (proxyRes.status === 404) {
          const errData = await proxyRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Pengguna atau game tidak ditemukan');
        }
      } catch (proxyErr) {
        // Jika offline lokal atau bukan di Vercel, fallback ke direct call
        console.warn('Proxy API Vercel tidak tersedia, mencoba koneksi langsung:', proxyErr);
      }

      // Fallback jika belum dapat PGN (misal running di localhost tanpa serverless vercel dev)
      if (!pgn) {
        const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
        if (!archivesRes.ok) throw new Error('Pengguna tidak ditemukan atau diblokir oleh Cloudflare Chess.com');
        
        const archivesData = await archivesRes.json();
        if (!archivesData.archives || archivesData.archives.length === 0) {
          throw new Error('Belum ada riwayat permainan');
        }

        const lastArchiveUrl = archivesData.archives[archivesData.archives.length - 1];
        const gamesRes = await fetch(lastArchiveUrl);
        const gamesData = await gamesRes.json();

        if (!gamesData.games || gamesData.games.length === 0) {
          throw new Error('Tidak ada game di arsip terbaru');
        }

        const lastGame = gamesData.games[gamesData.games.length - 1];
        if (!lastGame.pgn) {
          throw new Error('PGN tidak ditemukan untuk game ini');
        }
        pgn = lastGame.pgn;
      }

      pgnInputEl.value = pgn;
      loadPgn(pgn);
      
      // Simpan ke localStorage (Web) & chrome.storage (Extension)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lastUsername', username);
      }
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ lastUsername: username });
      }
    } catch (err) {
      alert(`Gagal mengambil game: ${err.message}`);
    } finally {
      btnFetchGame.textContent = 'Muat Game Terakhir';
      btnFetchGame.disabled = false;
    }
  });

  // Restore cached username (Web / Extension)
  if (typeof localStorage !== 'undefined' && localStorage.getItem('lastUsername')) {
    const saved = localStorage.getItem('lastUsername');
    if (saved) {
      chessUsernameEl.value = saved;
    }
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['lastUsername'], (res) => {
      if (res && res.lastUsername) {
        chessUsernameEl.value = res.lastUsername;
        updateProfileBars();
      }
    });
  }

  // Controls Event Listeners
  btnFirst.addEventListener('click', () => {
    stopAutoPlay();
    goToMove(-1);
  });
  btnPrev.addEventListener('click', () => {
    stopAutoPlay();
    goToMove(currentMoveIndex - 1);
  });
  btnNext.addEventListener('click', () => {
    stopAutoPlay();
    goToMove(currentMoveIndex + 1);
  });
  btnLast.addEventListener('click', () => {
    stopAutoPlay();
    goToMove(historyMoves.length - 1);
  });
  btnFlip.addEventListener('click', () => {
    isFlipped = !isFlipped;
    const lastMove = currentMoveIndex >= 0 ? historyMoves[currentMoveIndex] : null;
    renderBoard(lastMove);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      stopAutoPlay();
      goToMove(currentMoveIndex - 1);
    } else if (e.key === 'ArrowRight') {
      stopAutoPlay();
      goToMove(currentMoveIndex + 1);
    } else if (e.key === ' ') {
      e.preventDefault();
      if (isPlaying) stopAutoPlay();
      else startAutoPlay();
    }
  });

  // Initial demo board
  renderBoard();

  // ==========================================
  // --- MODE MAIN / AUTO-PLAY ENGINE LOGIC ---
  // ==========================================
  let playChess = new Chess();
  let isGameRunning = false;
  let gameDelaySeconds = 20;
  let countdownTimer = null;
  let currentCountdown = 0;
  let selectedSquare = null;
  let playMoveHistory = [];

  // Digital Chess Clock State
  let gameTotalSeconds = 600; // 10 min default
  let gameIncrementSeconds = 0;
  let whiteTimeRemaining = 600;
  let blackTimeRemaining = 600;
  let activeClockTimer = null;

  // Format detik ke MM:SS
  function formatClock(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateClockDisplays() {
    if (clockWhiteEl) {
      clockWhiteEl.textContent = formatClock(whiteTimeRemaining);
      clockWhiteEl.classList.toggle('low-time', whiteTimeRemaining <= 30 && whiteTimeRemaining > 0);
    }
    if (clockBlackEl) {
      clockBlackEl.textContent = formatClock(blackTimeRemaining);
      clockBlackEl.classList.toggle('low-time', blackTimeRemaining <= 30 && blackTimeRemaining > 0);
    }

    const turn = playChess.turn();
    if (isGameRunning) {
      if (clockWhiteEl) clockWhiteEl.classList.toggle('active', turn === 'w');
      if (clockBlackEl) clockBlackEl.classList.toggle('active', turn === 'b');
    } else {
      if (clockWhiteEl) clockWhiteEl.classList.remove('active');
      if (clockBlackEl) clockBlackEl.classList.remove('active');
    }
  }

  function startChessClock() {
    stopChessClock();
    activeClockTimer = setInterval(() => {
      if (!isGameRunning) return;
      const turn = playChess.turn();

      if (turn === 'w') {
        whiteTimeRemaining = Math.max(0, whiteTimeRemaining - 1);
        if (whiteTimeRemaining === 0) {
          handleTimeOut('w');
        }
      } else {
        blackTimeRemaining = Math.max(0, blackTimeRemaining - 1);
        if (blackTimeRemaining === 0) {
          handleTimeOut('b');
        }
      }
      updateClockDisplays();
    }, 1000);
  }

  function stopChessClock() {
    if (activeClockTimer) {
      clearInterval(activeClockTimer);
      activeClockTimer = null;
    }
  }

  function handleTimeOut(colorFlagged) {
    stopChessClock();
    stopPlayGameTimer();
    isGameRunning = false;

    const loser = colorFlagged === 'w' ? 'Putih' : 'Hitam';
    const winner = colorFlagged === 'w' ? 'Hitam' : 'Putih';

    playGameStatus.textContent = `⏱️ Waktu ${loser} Habis! ${winner} Menang! 🎉`;
    btnPlayStart.textContent = '▶️ Main Lagi';
    btnPlayStart.style.background = '#81b64c';
    playTimerDisplay.textContent = 'Waktu Habis';
    if (playGameOverBanner) playGameOverBanner.style.display = 'block';

    const mode = playModeSelect.value;
    const isPlayerWhite = mode === 'player_vs_bot_white';
    const isPlayerBlack = mode === 'player_vs_bot_black';
    const isPlayerFlagged = (isPlayerWhite && colorFlagged === 'w') || (isPlayerBlack && colorFlagged === 'b');

    setTimeout(() => {
      showGameOverModal({
        isWin: !isPlayerFlagged,
        isDraw: false,
        reason: 'On Time'
      });
    }, 400);
  }

  // Time Control Buttons Handler (Bullet, Blitz, Rapid)
  const tcButtons = document.querySelectorAll('.tc-btn');
  tcButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tcButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const timeSec = parseInt(btn.dataset.time, 10);
      const incSec = parseInt(btn.dataset.inc, 10);
      const label = btn.dataset.label;

      gameTotalSeconds = timeSec;
      gameIncrementSeconds = incSec;
      selectedTimeLabel.textContent = `${label} (${label.includes('10') || label.includes('15') ? 'Rapid' : label.includes('3') || label.includes('5') ? 'Blitz' : 'Bullet'})`;

      resetPlayGame();
    });
  });

  // Update slider label
  playDelayRange.addEventListener('input', (e) => {
    gameDelaySeconds = parseInt(e.target.value, 10);
    delayLabel.textContent = `${gameDelaySeconds} detik`;
    if (!isGameRunning && playModeSelect.value === 'bot_vs_bot') {
      playTimerDisplay.textContent = `Jeda: ${gameDelaySeconds}s`;
    }
  });

  // Render Play Board (Mode Bermain)
  function renderPlayBoard() {
    playChessboardEl.innerHTML = '';
    const board = playChess.board();
    const mode = playModeSelect.value;
    const isPlayerBlack = mode === 'player_vs_bot_black';

    const ranks = isPlayerBlack ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const files = isPlayerBlack ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    const lastMove = playMoveHistory.length > 0 ? playMoveHistory[playMoveHistory.length - 1] : null;

    // Petak Raja yang terkena Skak / Skakmat
    const checkedKingSquare = playChess.in_check() ? findKingSquare(playChess, playChess.turn()) : null;

    // Get legal moves for selected piece
    let legalMoves = [];
    if (selectedSquare) {
      legalMoves = playChess.moves({ square: selectedSquare, verbose: true });
    }

    ranks.forEach((r, rIdx) => {
      files.forEach((f, fIdx) => {
        const fileChar = String.fromCharCode(97 + f);
        const rankNum = r + 1;
        const squareName = fileChar + rankNum;
        const squareEl = document.createElement('div');
        const isLight = (r + f) % 2 !== 0;
        squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
        squareEl.dataset.square = squareName;

        // Efek Petak Raja Merah saat Skak!
        if (checkedKingSquare === squareName) {
          squareEl.classList.add('check-square');
        }

        // Label Koordinat Angka (1-8) di petak paling kiri
        if (fIdx === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-rank';
          rankLabel.textContent = rankNum;
          squareEl.appendChild(rankLabel);
        }

        // Label Koordinat Huruf (a-h) di petak paling bawah
        if (rIdx === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-file';
          fileLabel.textContent = fileChar;
          squareEl.appendChild(fileLabel);
        }

        // Highlight last move
        if (lastMove) {
          if (lastMove.from === squareName) squareEl.classList.add('highlight-from');
          if (lastMove.to === squareName) squareEl.classList.add('highlight-to');
        }

        // Selected square highlight
        if (selectedSquare === squareName) {
          squareEl.classList.add('selected-square');
        }

        // Cek apakah petak ini adalah tujuan langkah sah
        const matchedMove = legalMoves.find(m => m.to === squareName);
        if (matchedMove) {
          if (matchedMove.captured) {
            squareEl.classList.add('possible-capture'); // Cincin lingkaran target makan
          } else {
            squareEl.classList.add('possible-move'); // Titik bulat pas di tengah
          }
        }

        // Piece
        const piece = board[7 - r][f];
        if (piece) {
          squareEl.appendChild(createPieceElement(piece));
        }

        // Square Click Event (Player input)
        squareEl.addEventListener('click', () => onSquareClick(squareName));

        playChessboardEl.appendChild(squareEl);
      });
    });

    // Update Eval Bar on play board
    const whiteScore = quickEvaluatePosition(playChess);
    let winProb = 50 + 50 * (2 / (1 + Math.exp(-0.004 * (whiteScore * 100))) - 1);
    winProb = Math.max(5, Math.min(95, winProb));
    playEvalBarEl.style.height = `${winProb}%`;

    // Update Captured Pieces (Anggota yang dimakan)
    updateCapturedPiecesDisplay(playChess, capturedTop, capturedBottom, !isPlayerBlack);
  }

  function updatePlayStatus() {
    if (playChess.in_checkmate()) {
      const winner = playChess.turn() === 'w' ? 'Hitam' : 'Putih';
      playGameStatus.textContent = `Skakmat! ${winner} Menang 🎉`;
      stopChessClock();
      stopPlayGameTimer();
      isGameRunning = false;
      if (btnPlayStart) {
        btnPlayStart.style.display = 'block';
        btnPlayStart.textContent = '▶️ Main Lagi';
        btnPlayStart.style.background = '#81b64c';
      }
      playTimerDisplay.textContent = 'Game Selesai';
      if (playGameOverBanner) playGameOverBanner.style.display = 'block';

      // Tentukan apakah pemain menang atau kalah
      const mode = playModeSelect.value;
      const isPlayerWinner = (mode === 'player_vs_bot_white' && winner === 'Putih') ||
                             (mode === 'player_vs_bot_black' && winner === 'Hitam');

      setTimeout(() => {
        showGameOverModal({
          isWin: isPlayerWinner,
          isDraw: false,
          reason: 'By Checkmate'
        });
      }, 500);
      return;
    }

    if (playChess.in_draw()) {
      playGameStatus.textContent = `Permainan Remis (Draw) 🤝`;
      stopChessClock();
      stopPlayGameTimer();
      isGameRunning = false;
      if (btnPlayStart) {
        btnPlayStart.style.display = 'block';
        btnPlayStart.textContent = '▶️ Main Lagi';
        btnPlayStart.style.background = '#81b64c';
      }
      playTimerDisplay.textContent = 'Game Selesai';
      if (playGameOverBanner) playGameOverBanner.style.display = 'block';

      setTimeout(() => {
        showGameOverModal({
          isWin: false,
          isDraw: true,
          reason: 'By Stalemate / Repetition'
        });
      }, 500);
      return;
    }

    if (playGameOverBanner) playGameOverBanner.style.display = 'none';
    const currentTurn = playChess.turn() === 'w' ? 'Putih' : 'Hitam';
    const isCheck = playChess.in_check() ? ' (Skak!)' : '';
    playGameStatus.textContent = `Giliran: ${currentTurn}${isCheck}`;
  }

  // --- MODAL GAME OVER (Persis Gambar: You Won! / You Lost!) ---
  function showGameOverModal({ isWin, isDraw, reason = 'By Checkmate' }) {
    if (!modalGameOver) return;

    if (isDraw) {
      goIcon.textContent = '🤝';
      goTitle.textContent = 'Draw!';
      goSubtitle.textContent = reason;
      goRatingDiff.textContent = '+1';
      goRatingDiff.className = 'rating-diff plus';
      goCoachText.textContent = "Permainan remis yang ketat! Mari kita ulas langkah-langkah pentingnya di Game Review...";
    } else if (isWin) {
      goIcon.textContent = '🏆';
      goTitle.textContent = 'You Won!';
      goSubtitle.textContent = reason;
      goRatingDiff.textContent = '+17';
      goRatingDiff.className = 'rating-diff plus';
      goCoachText.textContent = "Luar biasa! Hang tight, I'm almost done reviewing...";
    } else {
      goIcon.textContent = '❌';
      goTitle.textContent = 'You Lost!';
      goSubtitle.textContent = reason;
      goRatingDiff.textContent = '-15';
      goRatingDiff.className = 'rating-diff minus';
      goCoachText.textContent = "Jangan berkecil hati! Pelajari kesalahan dan blunder Anda di Game Review.";
    }

    modalGameOver.style.display = 'flex';
  }

  if (btnCloseGameOver) {
    btnCloseGameOver.addEventListener('click', () => {
      modalGameOver.style.display = 'none';
    });
  }

  if (btnGoGameReview) {
    btnGoGameReview.addEventListener('click', () => {
      modalGameOver.style.display = 'none';
      if (btnReviewNow) btnReviewNow.click();
    });
  }

  if (btnGoNewGame) {
    btnGoNewGame.addEventListener('click', () => {
      modalGameOver.style.display = 'none';
      resetPlayGame();
    });
  }

  if (btnGoRematch) {
    btnGoRematch.addEventListener('click', () => {
      modalGameOver.style.display = 'none';
      resetPlayGame();
      startPlayGame();
    });
  }

  // Tombol Review Game langsung ke Tab Analisis
  if (btnReviewNow) {
    btnReviewNow.addEventListener('click', () => {
      stopPlayGameTimer();
      isGameRunning = false;
      
      // Ambil riwayat PGN dari permainan yang baru selesai
      const currentPgn = playChess.pgn();
      if (!currentPgn || playMoveHistory.length === 0) {
        alert('Belum ada riwayat langkah untuk di-review.');
        return;
      }

      // Masukkan nama pemain ke PGN header
      const mode = playModeSelect.value;
      const lvlKey = parseInt(botDifficultySelect ? botDifficultySelect.value : "8", 10);
      const lvlName = BOT_LEVEL_CONFIG[lvlKey] ? BOT_LEVEL_CONFIG[lvlKey].name : 'Bot';

      let whiteName = 'Anda';
      let blackName = lvlName;
      if (mode === 'bot_vs_bot') {
        whiteName = `${lvlName} (Putih)`;
        blackName = `${lvlName} (Hitam)`;
      } else if (mode === 'player_vs_bot_black') {
        whiteName = lvlName;
        blackName = 'Anda';
      }

      const pgnWithHeader = `[Event "Bermain vs Bot"]\n[White "${whiteName}"]\n[Black "${blackName}"]\n\n${currentPgn}`;

      // Muat langsung ke papan analisis
      pgnInputEl.value = pgnWithHeader;
      loadPgn(pgnWithHeader);
    });
  }

  function updatePlayMoveList() {
    playMoveListEl.innerHTML = '';
    for (let i = 0; i < playMoveHistory.length; i += 2) {
      const moveNum = document.createElement('div');
      moveNum.className = 'move-num';
      moveNum.textContent = `${Math.floor(i / 2) + 1}.`;

      const whiteMove = document.createElement('div');
      whiteMove.className = 'move-item';
      whiteMove.textContent = playMoveHistory[i].san;

      playMoveListEl.appendChild(moveNum);
      playMoveListEl.appendChild(whiteMove);

      if (i + 1 < playMoveHistory.length) {
        const blackMove = document.createElement('div');
        blackMove.className = 'move-item';
        blackMove.textContent = playMoveHistory[i + 1].san;
        playMoveListEl.appendChild(blackMove);
      } else {
        const empty = document.createElement('div');
        playMoveListEl.appendChild(empty);
      }
    }
    playMoveListEl.scrollTop = playMoveListEl.scrollHeight;
  }

  // Handle Player Click on Board
  function onSquareClick(squareName) {
    if (!isGameRunning) return;
    const mode = playModeSelect.value;
    const turn = playChess.turn();

    // Pastikan ini giliran pemain manusia
    if (mode === 'bot_vs_bot') return;
    if (mode === 'player_vs_bot_white' && turn !== 'w') return;
    if (mode === 'player_vs_bot_black' && turn !== 'b') return;

    const piece = playChess.get(squareName);

    // Jika sudah ada petak yang dipilih sebelumnya
    if (selectedSquare) {
      const move = playChess.move({
        from: selectedSquare,
        to: squareName,
        promotion: 'q'
      });

      if (move) {
        // Langkah sah oleh pemain!
        playMoveHistory.push(move);
        selectedSquare = null;

        // Tambahkan bonus increment waktu catur
        if (turn === 'w') {
          whiteTimeRemaining += gameIncrementSeconds;
        } else {
          blackTimeRemaining += gameIncrementSeconds;
        }
        updateClockDisplays();

        renderPlayBoard();
        updatePlayMoveList();
        updatePlayStatus();

        // Lanjut ke giliran bot
        scheduleBotMove();
        return;
      }
    }

    // Pilih bidak jika milik warna yang sesuai giliran
    if (piece && piece.color === turn) {
      selectedSquare = squareName;
    } else {
      selectedSquare = null;
    }

    updatePlaySelectionUI();
  }

  // Update highlight seleksi & dot langkah petak Play Board tanpa menghancurkan elemen DOM (zero flicker)
  function updatePlaySelectionUI() {
    if (!playChessboardEl) return;
    const squares = playChessboardEl.querySelectorAll('.square');
    
    let legalMoves = [];
    if (selectedSquare) {
      legalMoves = playChess.moves({ square: selectedSquare, verbose: true });
    }

    squares.forEach(sqEl => {
      const sqName = sqEl.dataset.square;

      if (selectedSquare === sqName) {
        sqEl.classList.add('selected-square');
      } else {
        sqEl.classList.remove('selected-square');
      }

      sqEl.classList.remove('possible-move', 'possible-capture');
      const matchedMove = legalMoves.find(m => m.to === sqName);
      if (matchedMove) {
        if (matchedMove.captured) {
          sqEl.classList.add('possible-capture');
        } else {
          sqEl.classList.add('possible-move');
        }
      }
    });
  }

  // 8 Level Konfigurasi Bot Catur
  const BOT_LEVEL_CONFIG = {
    1: { skill: 0, depth: 1, blunderChance: 0.60, searchDepth: 1, name: 'Level 1: Pemula Banget' },
    2: { skill: 3, depth: 2, blunderChance: 0.35, searchDepth: 1, name: 'Level 2: Mudah' },
    3: { skill: 6, depth: 4, blunderChance: 0.15, searchDepth: 2, name: 'Level 3: Menengah Rendah' },
    4: { skill: 9, depth: 6, blunderChance: 0.05, searchDepth: 2, name: 'Level 4: Menengah' },
    5: { skill: 12, depth: 8, blunderChance: 0.00, searchDepth: 2, name: 'Level 5: Mahir' },
    6: { skill: 15, depth: 11, blunderChance: 0.00, searchDepth: 3, name: 'Level 6: Ahli' },
    7: { skill: 18, depth: 14, blunderChance: 0.00, searchDepth: 3, name: 'Level 7: Master' },
    8: { skill: 20, depth: 18, blunderChance: 0.00, searchDepth: 3, name: 'Level 8: Grandmaster' }
  };

  // Bot Auto Move Scheduling dengan Jeda Waktu & Level Intelligence
  let pendingStockfishMove = null;

  async function scheduleBotMove() {
    if (!isGameRunning) return;
    if (playChess.game_over()) {
      updatePlayStatus();
      return;
    }

    stopPlayGameTimer();

    const mode = playModeSelect.value;
    const isVsBot = mode !== 'bot_vs_bot';

    // Jika Anda vs Bot: Bot berpikir cepat (1-2s untuk bullet/blitz, 2-3s untuk rapid)
    // Jika Bot vs Bot: gunakan jeda slider (default 20 detik)
    let botThinkSeconds = gameDelaySeconds;
    if (isVsBot) {
      botThinkSeconds = gameTotalSeconds <= 120 ? 1 : (gameTotalSeconds <= 300 ? 2 : 3);
    }

    currentCountdown = botThinkSeconds;
    playTimerDisplay.textContent = `Bot berpikir: ${currentCountdown}s`;

    // Ambil konfigurasi level yang dipilih
    pendingStockfishMove = null;
    const targetFen = playChess.fen();
    const lvlKey = parseInt(botDifficultySelect ? botDifficultySelect.value : "8", 10);
    const cfg = BOT_LEVEL_CONFIG[lvlKey] || BOT_LEVEL_CONFIG[8];

    // Mulai kalkulasi engine sesuai skill level dan depth
    analyzer.getBestMove(targetFen, cfg.depth, cfg.skill).then((bestUci) => {
      if (bestUci) {
        pendingStockfishMove = bestUci;
      }
    }).catch(() => {});

    countdownTimer = setInterval(() => {
      currentCountdown--;
      if (currentCountdown > 0) {
        playTimerDisplay.textContent = `Bot berpikir: ${currentCountdown}s`;
      } else {
        stopPlayGameTimer();
        executeBotMove();
      }
    }, 1000);
  }

  function executeBotMove() {
    if (!isGameRunning || playChess.game_over()) return;

    const botTurnColor = playChess.turn();
    const lvlKey = parseInt(botDifficultySelect ? botDifficultySelect.value : "8", 10);
    const cfg = BOT_LEVEL_CONFIG[lvlKey] || BOT_LEVEL_CONFIG[8];
    let moveObj = null;

    // A. Tingkat Pemula / Mudah: Cek kemungkinan langkah acak (simulasi pemain baru)
    if (cfg.blunderChance > 0 && Math.random() < cfg.blunderChance) {
      const allMoves = playChess.moves({ verbose: true });
      if (allMoves && allMoves.length > 0) {
        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        moveObj = playChess.move(randomMove);
      }
    }

    // B. Coba gunakan langkah terbaik dari Stockfish asli
    if (!moveObj && pendingStockfishMove && pendingStockfishMove.length >= 4) {
      const from = pendingStockfishMove.substring(0, 2);
      const to = pendingStockfishMove.substring(2, 4);
      const promotion = pendingStockfishMove.length > 4 ? pendingStockfishMove[4] : 'q';
      try {
        moveObj = playChess.move({ from, to, promotion });
      } catch (e) {
        moveObj = null;
      }
    }

    // C. Jika belum ada, gunakan Minimax Alpha-Beta sesuai search depth level
    if (!moveObj) {
      const smartMove = smartFindBestMove(playChess, cfg.searchDepth);
      if (smartMove) {
        moveObj = playChess.move(smartMove);
      }
    }

    if (moveObj) {
      playMoveHistory.push(moveObj);

      // Tambahkan bonus increment waktu catur untuk bot
      if (botTurnColor === 'w') {
        whiteTimeRemaining += gameIncrementSeconds;
      } else {
        blackTimeRemaining += gameIncrementSeconds;
      }
      updateClockDisplays();

      renderPlayBoard();
      updatePlayMoveList();
      updatePlayStatus();

      const mode = playModeSelect.value;
      if (mode === 'bot_vs_bot') {
        scheduleBotMove();
      } else {
        playTimerDisplay.textContent = 'Giliran Anda!';
      }
    }
  }

  function stopPlayGameTimer() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  // Helper Update Bar Profil Pemain (Atas & Bawah Papan)
  function updateProfileBars() {
    const mode = playModeSelect ? playModeSelect.value : 'player_vs_bot_white';
    const lvlKey = parseInt(botDifficultySelect ? botDifficultySelect.value : "8", 10);
    const cfg = BOT_LEVEL_CONFIG[lvlKey] || BOT_LEVEL_CONFIG[8];

    // Rating bot perkiraan sesuai level
    const botRatings = { 1: 400, 2: 800, 3: 1200, 4: 1500, 5: 1800, 6: 2100, 7: 2500, 8: 3200 };
    const botRating = botRatings[lvlKey] || 3200;

    let myUsername = activeUserNickname || 'Anda';
    if (chessUsernameEl && chessUsernameEl.value.trim()) {
      myUsername = chessUsernameEl.value.trim();
    }

    const baseDir = window.PIECES_DIR || 'assets/pieces/';

    if (mode === 'bot_vs_bot') {
      if (nameTop) nameTop.textContent = 'Stockfish 1';
      if (ratingTop) ratingTop.textContent = `(${botRating})`;
      if (badgeTop) badgeTop.textContent = 'BOT';
      if (avatarTop) avatarTop.src = `${baseDir}bp.png`;

      if (nameBottom) nameBottom.textContent = 'Stockfish 2';
      if (ratingBottom) ratingBottom.textContent = `(${botRating})`;
      if (avatarBottom) avatarBottom.src = `${baseDir}wp.png`;
    } else if (mode === 'player_vs_bot_white') {
      // Anda Putih (di bawah), Bot Hitam (di atas)
      if (nameTop) nameTop.textContent = cfg.name.split(':')[1]?.trim() || 'Stockfish Bot';
      if (ratingTop) ratingTop.textContent = `(${botRating})`;
      if (badgeTop) badgeTop.textContent = botRating >= 2500 ? 'GM' : 'BOT';
      if (avatarTop) avatarTop.src = `${baseDir}bp.png`;

      if (nameBottom) nameBottom.textContent = myUsername;
      if (ratingBottom) ratingBottom.textContent = '(638)';
      if (avatarBottom) avatarBottom.src = `${baseDir}wp.png`;
    } else {
      // Anda Hitam (di bawah), Bot Putih (di atas)
      if (nameTop) nameTop.textContent = cfg.name.split(':')[1]?.trim() || 'Stockfish Bot';
      if (ratingTop) ratingTop.textContent = `(${botRating})`;
      if (badgeTop) badgeTop.textContent = botRating >= 2500 ? 'GM' : 'BOT';
      if (avatarTop) avatarTop.src = `${baseDir}wp.png`;

      if (nameBottom) nameBottom.textContent = myUsername;
      if (ratingBottom) ratingBottom.textContent = '(638)';
      if (avatarBottom) avatarBottom.src = `${baseDir}bp.png`;
    }
  }

  // Mode selection change
  playModeSelect.addEventListener('change', () => {
    const mode = playModeSelect.value;
    if (mode === 'bot_vs_bot') {
      if (timeControlSection) timeControlSection.style.display = 'none';
      if (botDelaySliderBox) botDelaySliderBox.style.display = 'block';
    } else {
      if (timeControlSection) timeControlSection.style.display = 'block';
      if (botDelaySliderBox) botDelaySliderBox.style.display = 'none';
    }
    updateProfileBars();
    resetPlayGame();
  });

  if (botDifficultySelect) {
    botDifficultySelect.addEventListener('change', () => {
      updateProfileBars();
    });
  }

  function startPlayGame() {
    isGameRunning = true;
    // Sembunyikan panel pengaturan & sembunyikan tombol Mulai (hanya sisakan tombol Reset)
    if (playSettingsPanel) {
      playSettingsPanel.style.display = 'none';
    }
    if (btnPlayStart) {
      btnPlayStart.style.display = 'none';
    }
    updatePlayStatus();

    const mode = playModeSelect.value;
    const turn = playChess.turn();

    // Mulai jam catur jika mode Anda vs Bot
    if (mode !== 'bot_vs_bot') {
      startChessClock();
    }
    updateClockDisplays();

    if (mode === 'bot_vs_bot') {
      scheduleBotMove();
    } else if (mode === 'player_vs_bot_black' && turn === 'w') {
      scheduleBotMove();
    } else {
      playTimerDisplay.textContent = 'Giliran Anda!';
    }
  }

  function resetPlayGame() {
    isGameRunning = false;
    stopChessClock();
    stopPlayGameTimer();
    playChess.reset();
    playMoveHistory = [];
    selectedSquare = null;

    // Bersihkan panah SVG di papan bermain
    const existingPlaySvg = playChessboardEl.querySelector('.board-arrows-svg');
    if (existingPlaySvg) existingPlaySvg.remove();

    // Tampilkan kembali panel pengaturan dan tombol Mulai
    if (playSettingsPanel) {
      playSettingsPanel.style.display = 'flex';
    }
    if (btnPlayStart) {
      btnPlayStart.style.display = 'block';
      btnPlayStart.textContent = '▶️ Mulai Permainan';
      btnPlayStart.style.background = '#81b64c';
    }

    // Reset jam catur ke waktu awal yang dipilih
    whiteTimeRemaining = gameTotalSeconds;
    blackTimeRemaining = gameTotalSeconds;
    updateClockDisplays();
    
    if (playModeSelect.value === 'bot_vs_bot') {
      playTimerDisplay.textContent = `Jeda: ${gameDelaySeconds}s`;
    } else {
      playTimerDisplay.textContent = selectedTimeLabel ? selectedTimeLabel.textContent : 'Siap Bermain';
    }

    updatePlayStatus();
    updatePlayMoveList();
    renderPlayBoard();
  }

  btnPlayStart.addEventListener('click', () => {
    if (!isGameRunning) {
      startPlayGame();
    }
  });

  btnPlayReset.addEventListener('click', () => {
    resetPlayGame();
  });

  let activeUserNickname = '';

  // DOM Elements - Welcome Username Modal
  const modalWelcomeUsername = document.getElementById('modal-welcome-username');
  const welcomeUsernameInput = document.getElementById('welcome-username-input');
  const btnSaveUsername = document.getElementById('btn-save-username');

  function checkAndPromptUsername() {
    // Cek apakah user sudah punya nama tersimpan di localStorage / chrome.storage
    let savedName = '';
    if (typeof localStorage !== 'undefined') {
      savedName = localStorage.getItem('chessPlayerNickname');
    }

    if (savedName && savedName.trim()) {
      activeUserNickname = savedName.trim();
      updateProfileBars();
    } else {
      // Tampilkan popup input nama
      if (modalWelcomeUsername) {
        modalWelcomeUsername.style.display = 'flex';
        if (welcomeUsernameInput) {
          setTimeout(() => welcomeUsernameInput.focus(), 100);
        }
      }
    }
  }

  if (btnSaveUsername) {
    btnSaveUsername.addEventListener('click', saveAndApplyUsername);
  }
  if (welcomeUsernameInput) {
    welcomeUsernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveAndApplyUsername();
      }
    });
  }

  function saveAndApplyUsername() {
    const inputVal = welcomeUsernameInput ? welcomeUsernameInput.value.trim() : '';
    const finalName = inputVal || 'Anda';
    activeUserNickname = finalName;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('chessPlayerNickname', finalName);
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ chessPlayerNickname: finalName });
    }

    if (chessUsernameEl && !chessUsernameEl.value) {
      chessUsernameEl.value = finalName;
    }

    if (modalWelcomeUsername) {
      modalWelcomeUsername.style.display = 'none';
    }

    updateProfileBars();
    checkMamadVipAccess();
  }

  function checkMamadVipAccess() {
    const name = (activeUserNickname || '').trim().toLowerCase();
    const isMamad = name === 'mamad';
    if (tabBtnEditor) {
      tabBtnEditor.style.display = isMamad ? 'inline-block' : 'none';
    }
    if (sidebarItemEditor) {
      sidebarItemEditor.style.display = isMamad ? 'flex' : 'none';
    }
    if (headerUserTag) {
      headerUserTag.textContent = `User: ${activeUserNickname || 'Tamu'}`;
      if (isMamad) {
        headerUserTag.innerHTML = `⭐ <b>mamad</b> <span style="font-size:9px; background:#81b64c; color:#111; padding:1px 4px; border-radius:3px; margin-left:2px;">VIP</span>`;
      }
    }
  }

  // ==========================================================
  // --- MODULE EDITOR PAPAN / PINDAI (GAMBAR 2 CHESSIS) ---
  // ==========================================================
  const editorChessboardEl = document.getElementById('editor-chessboard');
  const btnEditorReset = document.getElementById('btn-editor-reset');
  const btnEditorTrashAll = document.getElementById('btn-editor-trash-all');
  const btnPaletteDelete = document.getElementById('btn-palette-delete');
  const btnPaletteReverse = document.getElementById('btn-palette-reverse');
  const editorFenInput = document.getElementById('editor-fen-input');
  const btnCopyFen = document.getElementById('btn-copy-fen');
  const btnPasteFen = document.getElementById('btn-paste-fen');
  const btnEditorCancel = document.getElementById('btn-editor-cancel');
  const btnEditorFinish = document.getElementById('btn-editor-finish');
  const paletteSlots = document.querySelectorAll('.palette-piece-slot');
  const turnRadioWhite = document.getElementById('editor-turn-white');
  const turnRadioBlack = document.getElementById('editor-turn-black');
  const chkWK = document.getElementById('castling-wk');
  const chkWQ = document.getElementById('castling-wq');
  const chkBK = document.getElementById('castling-bk');
  const chkBQ = document.getElementById('castling-bq');

  // Matrix internal posisi editor: array 8x8 (baris 0 = rank 8, baris 7 = rank 1)
  // Tiap elemen: null atau { type: 'p'|'n'|'b'|'r'|'q'|'k', color: 'w'|'b' }
  let editorBoardState = createStandardBoardArray();
  let editorSelectedPiece = null; // null atau { type: 'p', color: 'w' }
  let isDeleteMode = false; // Jika aktif, klik petak di papan akan menghapus bidak
  let isEditorFlipped = false;

  function createStandardBoardArray() {
    const c = new Chess();
    return c.board();
  }

  function renderEditorBoard() {
    if (!editorChessboardEl) return;
    editorChessboardEl.innerHTML = '';

    const ranks = isEditorFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const files = isEditorFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    ranks.forEach((r, rIdx) => {
      files.forEach((f, fIdx) => {
        const fileChar = String.fromCharCode(97 + f);
        const rankNum = r + 1;
        const sqName = fileChar + rankNum;

        const sqEl = document.createElement('div');
        const isLight = (r + f) % 2 !== 0;
        sqEl.className = `square ${isLight ? 'light' : 'dark'}`;
        sqEl.dataset.square = sqName;

        // Koordinat
        if (fIdx === 0) {
          const rLbl = document.createElement('span');
          rLbl.className = 'coord-rank';
          rLbl.textContent = rankNum;
          sqEl.appendChild(rLbl);
        }
        if (rIdx === 7) {
          const fLbl = document.createElement('span');
          fLbl.className = 'coord-file';
          fLbl.textContent = fileChar;
          sqEl.appendChild(fLbl);
        }

        // Bidak di petak
        const piece = editorBoardState[7 - r][f];
        if (piece) {
          sqEl.appendChild(createPieceElement(piece));
        }

        // Event Klik Petak Editor
        sqEl.addEventListener('click', () => onEditorSquareClick(r, f));

        editorChessboardEl.appendChild(sqEl);
      });
    });

    updateEditorFen();
  }

  function onEditorSquareClick(rankIdx, fileIdx) {
    const currentPiece = editorBoardState[7 - rankIdx][fileIdx];

    if (isDeleteMode) {
      // Hapus satuan bidak jika diklik
      if (currentPiece) {
        editorBoardState[7 - rankIdx][fileIdx] = null;
        renderEditorBoard();
      }
      return;
    }

    if (editorSelectedPiece) {
      // Taruh bidak terpilih dari palet ke petak ini
      editorBoardState[7 - rankIdx][fileIdx] = {
        type: editorSelectedPiece.type,
        color: editorSelectedPiece.color
      };
      renderEditorBoard();
    } else {
      // Jika tidak ada alat terpilih, klik bidak untuk memindahkannya / menghapusnya
      if (currentPiece) {
        editorSelectedPiece = { type: currentPiece.type, color: currentPiece.color };
        editorBoardState[7 - rankIdx][fileIdx] = null;
        renderEditorBoard();
        highlightActivePaletteSlot();
      }
    }
  }

  // Pilih bidak dari palet
  paletteSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      const code = slot.dataset.piece; // 'K', 'q', dll.
      if (!code) return;

      // Matikan mode hapus
      isDeleteMode = false;
      if (btnPaletteDelete) btnPaletteDelete.classList.remove('active');

      const isWhite = code === code.toUpperCase();
      editorSelectedPiece = {
        type: code.toLowerCase(),
        color: isWhite ? 'w' : 'b'
      };

      highlightActivePaletteSlot();
    });
  });

  function highlightActivePaletteSlot() {
    paletteSlots.forEach(s => {
      const c = s.dataset.piece;
      if (editorSelectedPiece && !isDeleteMode) {
        const expected = editorSelectedPiece.color === 'w' 
          ? editorSelectedPiece.type.toUpperCase() 
          : editorSelectedPiece.type.toLowerCase();
        s.classList.toggle('selected', c === expected);
      } else {
        s.classList.remove('selected');
      }
    });
  }

  // Tombol Sampah Palet Bawah: Aktifkan mode hapus satuan
  if (btnPaletteDelete) {
    btnPaletteDelete.addEventListener('click', () => {
      isDeleteMode = !isDeleteMode;
      btnPaletteDelete.classList.toggle('active', isDeleteMode);
      if (isDeleteMode) {
        editorSelectedPiece = null;
        highlightActivePaletteSlot();
      }
    });
  }

  // Tombol Reverse Palet: Balik sudut pandang papan (POV Putih di atas, Hitam di bawah)
  if (btnPaletteReverse) {
    btnPaletteReverse.addEventListener('click', () => {
      // Toggle orientasi tampilan papan (POV Hitam di bawah / Putih di bawah)
      isEditorFlipped = !isEditorFlipped;

      // Tukar juga radio giliran jalan jika diinginkan pengguna
      if (turnRadioWhite && turnRadioBlack) {
        if (isEditorFlipped) {
          turnRadioBlack.checked = true;
        } else {
          turnRadioWhite.checked = true;
        }
      }

      renderEditorBoard();
    });
  }

  // Tombol RESET di atas: Tata kembali ke formasi standar
  if (btnEditorReset) {
    btnEditorReset.addEventListener('click', () => {
      editorBoardState = createStandardBoardArray();
      isEditorFlipped = false;
      if (turnRadioWhite) turnRadioWhite.checked = true;
      if (chkWK) chkWK.checked = true;
      if (chkWQ) chkWQ.checked = true;
      if (chkBK) chkBK.checked = true;
      if (chkBQ) chkBQ.checked = true;
      renderEditorBoard();
    });
  }

  // Tombol HAPUS di atas: Kosongkan semua pasukan di papan
  if (btnEditorTrashAll) {
    btnEditorTrashAll.addEventListener('click', () => {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          editorBoardState[r][c] = null;
        }
      }
      renderEditorBoard();
    });
  }

  // Hitung FEN dari posisi editor saat ini
  function buildEditorFen() {
    let rows = [];
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      let rowStr = '';
      for (let c = 0; c < 8; c++) {
        const p = editorBoardState[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) {
            rowStr += empty;
            empty = 0;
          }
          rowStr += p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
        }
      }
      if (empty > 0) rowStr += empty;
      rows.push(rowStr);
    }
    const piecePart = rows.join('/');
    const turn = turnRadioWhite && turnRadioWhite.checked ? 'w' : 'b';

    let castling = '';
    if (chkWK && chkWK.checked) castling += 'K';
    if (chkWQ && chkWQ.checked) castling += 'Q';
    if (chkBK && chkBK.checked) castling += 'k';
    if (chkBQ && chkBQ.checked) castling += 'q';
    if (!castling) castling = '-';

    return `${piecePart} ${turn} ${castling} - 0 1`;
  }

  function updateEditorFen() {
    if (editorFenInput) {
      editorFenInput.value = buildEditorFen();
    }
  }

  // Listener radio & checkbox castling
  [turnRadioWhite, turnRadioBlack, chkWK, chkWQ, chkBK, chkBQ].forEach(el => {
    if (el) el.addEventListener('change', updateEditorFen);
  });

  // Salin & Tempel FEN
  if (btnCopyFen) {
    btnCopyFen.addEventListener('click', () => {
      const fen = buildEditorFen();
      navigator.clipboard?.writeText(fen).then(() => {
        alert('FEN berhasil disalin ke clipboard:\n' + fen);
      }).catch(() => {
        alert(fen);
      });
    });
  }

  if (btnPasteFen) {
    btnPasteFen.addEventListener('click', () => {
      const input = prompt('Tempel FEN catur di sini:');
      if (input && input.trim()) {
        loadFenToEditor(input.trim());
      }
    });
  }

  function loadFenToEditor(fen) {
    const temp = new Chess();
    const valid = temp.load(fen);
    if (!valid) {
      alert('Format FEN tidak valid!');
      return;
    }
    editorBoardState = temp.board();
    const parts = fen.split(' ');
    if (parts.length > 1) {
      if (turnRadioWhite) turnRadioWhite.checked = parts[1] === 'w';
      if (turnRadioBlack) turnRadioBlack.checked = parts[1] === 'b';
    }
    if (parts.length > 2) {
      const c = parts[2];
      if (chkWK) chkWK.checked = c.includes('K');
      if (chkWQ) chkWQ.checked = c.includes('Q');
      if (chkBK) chkBK.checked = c.includes('k');
      if (chkBQ) chkBQ.checked = c.includes('q');
    }
    renderEditorBoard();
  }

  // Batal Editor: kembali ke tab Play
  if (btnEditorCancel) {
    btnEditorCancel.addEventListener('click', () => switchTab('play'));
  }

  // Helper Tampilkan Toast Notifikasi
  function showToastMessage(msg, isError = true) {
    const toast = document.getElementById('custom-toast');
    if (toast) {
      toast.textContent = msg;
      toast.style.background = isError ? '#c0392b' : '#27ae60';
      toast.style.display = 'block';
      toast.style.opacity = '1';
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 200);
      }, 3500);
    } else {
      alert(msg);
    }
  }

  // Validasi posisi Editor Catur (Aturan Baku FIDE):
  // 1. Tepat 1 Raja Putih & 1 Raja Hitam
  // 2. Maksimal 8 Pion per sisi
  // 3. Pion tidak boleh berada di baris 1 atau baris 8
  // 4. Maksimal 16 total perwira/pasukan per sisi
  // 5. Raja pihak yang tidak sedang giliran tidak boleh sedang terkena skak
  function validateEditorBoard() {
    let whiteKing = 0, blackKing = 0;
    let whitePawns = 0, blackPawns = 0;
    let totalWhite = 0, totalBlack = 0;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = editorBoardState[r][f];
        if (!p) continue;

        if (p.color === 'w') {
          totalWhite++;
          if (p.type === 'k') whiteKing++;
          if (p.type === 'p') {
            whitePawns++;
            if (r === 0 || r === 7) {
              return { valid: false, error: '⚠️ Pion Putih tidak boleh berada di baris 1 atau 8!' };
            }
          }
        } else {
          totalBlack++;
          if (p.type === 'k') blackKing++;
          if (p.type === 'p') {
            blackPawns++;
            if (r === 0 || r === 7) {
              return { valid: false, error: '⚠️ Pion Hitam tidak boleh berada di baris 1 atau 8!' };
            }
          }
        }
      }
    }

    if (whiteKing === 0) return { valid: false, error: '⚠️ Posisi tidak valid: Raja Putih belum diletakkan di papan!' };
    if (blackKing === 0) return { valid: false, error: '⚠️ Posisi tidak valid: Raja Hitam belum diletakkan di papan!' };
    if (whiteKing > 1) return { valid: false, error: `⚠️ Raja Putih melebihi aturan (ada ${whiteKing}, seharusnya tepat 1)!` };
    if (blackKing > 1) return { valid: false, error: `⚠️ Raja Hitam melebihi aturan (ada ${blackKing}, seharusnya tepat 1)!` };

    if (whitePawns > 8) return { valid: false, error: `⚠️ Jumlah Pion Putih melebihi batas (ada ${whitePawns}, maksimal 8)!` };
    if (blackPawns > 8) return { valid: false, error: `⚠️ Jumlah Pion Hitam melebihi batas (ada ${blackPawns}, maksimal 8)!` };

    if (totalWhite > 16) return { valid: false, error: `⚠️ Total pasukan Putih melebihi aturan (ada ${totalWhite}, maksimal 16)!` };
    if (totalBlack > 16) return { valid: false, error: `⚠️ Total pasukan Hitam melebihi aturan (ada ${totalBlack}, maksimal 16)!` };

    const fen = buildEditorFen();
    const testChess = new Chess();
    if (!testChess.load(fen)) {
      return { valid: false, error: '⚠️ Posisi catur tidak valid menurut aturan catur standar FIDE!' };
    }

    // Pastikan raja pihak lawan yang tidak giliran jalan tidak dalam posisi diserang/skak
    const currentTurn = testChess.turn();
    const opponentTurn = currentTurn === 'w' ? 'b' : 'w';
    const opponentName = currentTurn === 'w' ? 'Hitam' : 'Putih';
    const tokens = fen.split(' ');
    tokens[1] = opponentTurn;
    const oppChess = new Chess();
    if (oppChess.load(tokens.join(' ')) && oppChess.in_check()) {
      return { valid: false, error: `⚠️ Posisi tidak sah: Raja ${opponentName} sedang terkena skak padahal giliran pihak lain!` };
    }

    return { valid: true, fen };
  }

  // SELESAI Editor -> Buka Halaman COMMAND (Gambar 3)
  if (btnEditorFinish) {
    btnEditorFinish.addEventListener('click', () => {
      const validation = validateEditorBoard();
      if (!validation.valid) {
        showToastMessage(validation.error, true);
        return;
      }
      const fen = validation.fen;
      // Simpan posisi awal untuk Command Board & teruskan POV flip
      commandInitialFen = fen;
      initCommandGame(fen, isEditorFlipped);
      switchTab('command');
    });
  }

  // ==========================================================
  // --- MODULE COMMAND BOARD (GAMBAR 3 CHESSIS) ---
  // ==========================================================
  const commandChessboardEl = document.getElementById('command-chessboard');
  const commandEvalBarEl = document.getElementById('command-eval-bar');
  const commandEcoTitle = document.getElementById('command-eco-title');
  const commandHistoryStrip = document.getElementById('command-history-strip');
  const commandEvalNum = document.getElementById('command-eval-num');
  const commandEvalDepth = document.getElementById('command-eval-depth');
  const commandSuggestMoves = document.getElementById('command-suggest-moves');
  const btnCommandAutoStockfish = document.getElementById('btn-command-auto-stockfish');
  const btnCommandStepBoth = document.getElementById('btn-command-step-both');
  const btnCommandRestart = document.getElementById('btn-command-restart');
  const btnCommandBackEditor = document.getElementById('btn-command-back-editor');
  const btnCommandFlip = document.getElementById('btn-command-flip');
  const btnCommandUndo = document.getElementById('btn-command-undo');
  const btnCommandRedo = document.getElementById('btn-command-redo');
  const btnCommandBackHome = document.getElementById('btn-command-back-home');

  let commandInitialFen = '';
  let commandChess = new Chess();
  let commandHistory = []; // Array of moves
  let commandUndoStack = [];
  let commandSelectedSquare = null;
  let isCommandFlipped = false;
  let isCommandAutoPlay = false;
  let commandAutoTimer = null;
  let commandBestMove = null; // { from, to, san }

  function initCommandGame(fen, startFlipped = false) {
    commandChess = new Chess(fen);
    commandHistory = [];
    commandUndoStack = [];
    commandSelectedSquare = null;
    isCommandFlipped = startFlipped; // Sesuaikan dengan orientasi editor (jika di-reverse, Hitam di bawah)
    stopCommandStockfish(); // Pastikan tidak jalan otomatis sendiri saat pertama dibuka
    renderCommandBoard();
    updateCommandEvaluation();
  }

  function renderCommandBoard() {
    if (!commandChessboardEl) return;
    commandChessboardEl.innerHTML = '';

    const board = commandChess.board();
    const ranks = isCommandFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const files = isCommandFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    const lastMove = commandHistory.length > 0 ? commandHistory[commandHistory.length - 1] : null;
    const checkedKingSquare = commandChess.in_check() ? findKingSquare(commandChess, commandChess.turn()) : null;

    let legalMoves = [];
    if (commandSelectedSquare) {
      legalMoves = commandChess.moves({ square: commandSelectedSquare, verbose: true });
    }

    ranks.forEach((r, rIdx) => {
      files.forEach((f, fIdx) => {
        const fileChar = String.fromCharCode(97 + f);
        const rankNum = r + 1;
        const sqName = fileChar + rankNum;

        const sqEl = document.createElement('div');
        const isLight = (r + f) % 2 !== 0;
        sqEl.className = `square ${isLight ? 'light' : 'dark'}`;
        sqEl.dataset.square = sqName;

        if (checkedKingSquare === sqName) {
          sqEl.classList.add('check-square');
        }

        if (fIdx === 0) {
          const rLbl = document.createElement('span');
          rLbl.className = 'coord-rank';
          rLbl.textContent = rankNum;
          sqEl.appendChild(rLbl);
        }
        if (rIdx === 7) {
          const fLbl = document.createElement('span');
          fLbl.className = 'coord-file';
          fLbl.textContent = fileChar;
          sqEl.appendChild(fLbl);
        }

        if (lastMove) {
          if (lastMove.from === sqName) sqEl.classList.add('highlight-from');
          if (lastMove.to === sqName) sqEl.classList.add('highlight-to');
        }

        if (commandSelectedSquare === sqName) {
          sqEl.classList.add('selected-square');
        }

        const matchedMove = legalMoves.find(m => m.to === sqName);
        if (matchedMove) {
          if (matchedMove.captured) {
            sqEl.classList.add('possible-capture');
          } else {
            sqEl.classList.add('possible-move');
          }
        }

        const piece = board[7 - r][f];
        if (piece) {
          sqEl.appendChild(createPieceElement(piece));
        }

        // Klik petak Command Board (Pemain bisa gerakkan PUTIH maupun HITAM)
        sqEl.addEventListener('click', () => onCommandSquareClick(sqName));

        commandChessboardEl.appendChild(sqEl);
      });
    });

    // Render Panah Rekomendasi Langkah Terbaik (Stockfish Move Arrows Hijau)
    updateCommandArrows();

    // Update Eval Bar
    const whiteScore = quickEvaluatePosition(commandChess);
    let winProb = 50 + 50 * (2 / (1 + Math.exp(-0.004 * (whiteScore * 100))) - 1);
    winProb = Math.max(5, Math.min(95, winProb));
    if (commandEvalBarEl) commandEvalBarEl.style.height = `${winProb}%`;

    // Update History Strip (contoh: 1. d4 b5 2. e4)
    updateCommandHistoryUI();
  }

  // Render/Update layer panah rekomendasi saja tanpa merusak/merender ulang petak papan
  function updateCommandArrows() {
    if (!commandChessboardEl) return;
    if (commandBestMove && commandBestMove.from && commandBestMove.to) {
      renderMoveArrows(commandChessboardEl, isCommandFlipped, null, null, commandBestMove.from, commandBestMove.to);
    } else {
      const existingSvg = commandChessboardEl.querySelector('.board-arrows-svg');
      if (existingSvg) existingSvg.remove();
    }
  }

  function onCommandSquareClick(squareName) {
    if (commandChess.game_over()) return;

    const turn = commandChess.turn();
    const piece = commandChess.get(squareName);

    // Jika sudah ada petak yang dipilih, coba eksekusi langkah
    if (commandSelectedSquare) {
      if (commandSelectedSquare === squareName) {
        commandSelectedSquare = null;
        updateCommandSelectionUI();
        return;
      }

      // Cek apakah pemain ganti memilih bidak lain milik warna yang sama
      if (piece && piece.color === turn) {
        commandSelectedSquare = squareName;
        updateCommandSelectionUI();
        return;
      }

      const moveObj = commandChess.move({
        from: commandSelectedSquare,
        to: squareName,
        promotion: 'q'
      });

      if (moveObj) {
        commandHistory.push(moveObj);
        commandUndoStack = [];
        commandSelectedSquare = null;
        renderCommandBoard();
        updateCommandEvaluation();
        return;
      }
    }

    // Pilih bidak jika milik warna yang sedang giliran jalan
    if (piece && piece.color === turn) {
      commandSelectedSquare = squareName;
    } else {
      commandSelectedSquare = null;
    }

    updateCommandSelectionUI();
  }

  // Update highlight seleksi & dot langkah tanpa rebuild elemen papan / bidak (zero flicker)
  function updateCommandSelectionUI() {
    if (!commandChessboardEl) return;
    const squares = commandChessboardEl.querySelectorAll('.square');
    
    let legalMoves = [];
    if (commandSelectedSquare) {
      legalMoves = commandChess.moves({ square: commandSelectedSquare, verbose: true });
    }

    squares.forEach(sqEl => {
      const sqName = sqEl.dataset.square;
      
      // Update selected square class
      if (commandSelectedSquare === sqName) {
        sqEl.classList.add('selected-square');
      } else {
        sqEl.classList.remove('selected-square');
      }

      // Update possible move / capture dots
      sqEl.classList.remove('possible-move', 'possible-capture');
      const matchedMove = legalMoves.find(m => m.to === sqName);
      if (matchedMove) {
        if (matchedMove.captured) {
          sqEl.classList.add('possible-capture');
        } else {
          sqEl.classList.add('possible-move');
        }
      }
    });
  }

  function updateCommandHistoryUI() {
    if (!commandHistoryStrip) return;
    commandHistoryStrip.innerHTML = '';

    if (commandHistory.length === 0) {
      commandHistoryStrip.innerHTML = '<span style="color:#777; font-size:11px;">Belum ada langkah yang dimainkan</span>';
      return;
    }

    for (let i = 0; i < commandHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteM = commandHistory[i];
      const blackM = commandHistory[i + 1];

      const item = document.createElement('span');
      item.style.display = 'inline-flex';
      item.style.gap = '4px';
      item.style.marginRight = '8px';
      item.innerHTML = `<span style="color:#888;">${moveNum}.</span><span style="color:#fff; background:#383531; padding:1px 4px; border-radius:3px;">${whiteM.san}</span>` + 
        (blackM ? `<span style="color:#ddd; background:#282623; padding:1px 4px; border-radius:3px;">${blackM.san}</span>` : '');
      commandHistoryStrip.appendChild(item);
    }
    // Auto scroll ke akhir riwayat
    commandHistoryStrip.scrollLeft = commandHistoryStrip.scrollWidth;
  }

  // Update Evaluasi & Rekomendasi Langkah Stockfish untuk Sisi yang Sedang Giliran
  function updateCommandEvaluation() {
    if (commandChess.game_over()) {
      if (commandChess.in_checkmate()) {
        const winner = commandChess.turn() === 'w' ? 'Hitam' : 'Putih';
        if (commandSuggestMoves) commandSuggestMoves.textContent = `Skakmat! ${winner} Menang 🎉`;
      } else {
        if (commandSuggestMoves) commandSuggestMoves.textContent = 'Permainan Berakhir (Draw/Remis)';
      }
      return;
    }

    const currentFen = commandChess.fen();
    const currentTurn = commandChess.turn();

    // 1. Cepat hitung dengan Local Minimax Evaluator
    const localScore = quickEvaluatePosition(commandChess);
    const sign = localScore > 0 ? '+' : '';
    if (commandEvalNum) commandEvalNum.textContent = `${sign}${localScore.toFixed(2)}`;
    if (commandEvalDepth) commandEvalDepth.textContent = `(kedalaman: 18)`;

    const localBest = smartFindBestMove(commandChess, 3);
    if (localBest) {
      commandBestMove = {
        from: localBest.from,
        to: localBest.to,
        san: localBest.san
      };
      const turnLabel = currentTurn === 'w' ? '⚪ Putih' : '⚫ Hitam';
      if (commandSuggestMoves) {
        commandSuggestMoves.innerHTML = `<strong>${turnLabel}:</strong> Langkah Terbaik 👉 <span style="color:#81b64c; font-weight:800; font-size:14px;">${localBest.san}</span> (${localBest.from} ➔ ${localBest.to})`;
      }
      updateCommandArrows();
    }

    // 2. Haluskan dengan Stockfish Worker Asli di Background jika tersedia
    try {
      analyzer.evaluatePosition(currentFen, 16, (evalData) => {
        if (!evalData) return;
        if (evalData.score !== null && evalData.score !== undefined) {
          const s = evalData.score;
          const sSign = s > 0 ? '+' : '';
          if (commandEvalNum) commandEvalNum.textContent = `${sSign}${s.toFixed(2)}`;
          if (commandEvalDepth) commandEvalDepth.textContent = `(kedalaman: ${evalData.depth || 18})`;
        }
        if (evalData.bestMove && evalData.bestMove.length >= 4) {
          const from = evalData.bestMove.substring(0, 2);
          const to = evalData.bestMove.substring(2, 4);
          const prom = evalData.bestMove.length > 4 ? evalData.bestMove[4] : 'q';
          const temp = new Chess(currentFen);
          const mObj = temp.move({ from, to, promotion: prom });
          if (mObj) {
            commandBestMove = { from, to, san: mObj.san };
            const turnLabel = currentTurn === 'w' ? '⚪ Putih' : '⚫ Hitam';
            if (commandSuggestMoves) {
              commandSuggestMoves.innerHTML = `<strong>${turnLabel}:</strong> Rekomendasi Stockfish 👉 <span style="color:#81b64c; font-weight:800; font-size:14px;">${mObj.san}</span> (${from} ➔ ${to})`;
            }
            updateCommandArrows();
          }
        }
      });
    } catch (e) {
      // Abaikan jika worker fallback
    }
  }

  // Menjalankan 1 langkah otomatis Stockfish untuk giliran saat ini
  function executeOneCommandStockfishMove() {
    if (commandChess.game_over()) {
      stopCommandStockfish();
      return;
    }

    let moveObj = null;
    if (commandBestMove && commandBestMove.from && commandBestMove.to) {
      moveObj = commandChess.move({
        from: commandBestMove.from,
        to: commandBestMove.to,
        promotion: 'q'
      });
    }

    if (!moveObj) {
      const bestFallback = smartFindBestMove(commandChess, 3);
      if (bestFallback) {
        moveObj = commandChess.move(bestFallback);
      }
    }

    if (moveObj) {
      commandHistory.push(moveObj);
      commandUndoStack = [];
      renderCommandBoard();
      updateCommandEvaluation();
    }
  }

  // Play/Pause Stockfish Auto Run
  if (btnCommandAutoStockfish) {
    btnCommandAutoStockfish.addEventListener('click', () => {
      isCommandAutoPlay = !isCommandAutoPlay;
      if (isCommandAutoPlay) {
        btnCommandAutoStockfish.classList.add('active');
        btnCommandAutoStockfish.textContent = '⏸️';
        executeOneCommandStockfishMove();
        commandAutoTimer = setInterval(() => {
          if (!isCommandAutoPlay || commandChess.game_over()) {
            stopCommandStockfish();
            return;
          }
          executeOneCommandStockfishMove();
        }, 1200);
      } else {
        stopCommandStockfish();
      }
    });
  }

  function stopCommandStockfish() {
    isCommandAutoPlay = false;
    if (commandAutoTimer) {
      clearInterval(commandAutoTimer);
      commandAutoTimer = null;
    }
    if (btnCommandAutoStockfish) {
      btnCommandAutoStockfish.classList.remove('active');
      btnCommandAutoStockfish.textContent = '▶️';
    }
  }

  // Tombol 1 Langkah Bot Manual
  if (btnCommandStepBoth) {
    btnCommandStepBoth.addEventListener('click', () => {
      executeOneCommandStockfishMove();
    });
  }

  // Tombol Restart Posisi
  if (btnCommandRestart) {
    btnCommandRestart.addEventListener('click', () => {
      stopCommandStockfish();
      if (commandInitialFen) {
        initCommandGame(commandInitialFen);
      }
    });
  }

  // Tombol Kembali ke Editor
  if (btnCommandBackEditor) {
    btnCommandBackEditor.addEventListener('click', () => {
      stopCommandStockfish();
      switchTab('editor');
    });
  }

  // Tombol Balik Sudut Pandang Papan
  if (btnCommandFlip) {
    btnCommandFlip.addEventListener('click', () => {
      isCommandFlipped = !isCommandFlipped;
      renderCommandBoard();
    });
  }

  // Tombol Undo
  if (btnCommandUndo) {
    btnCommandUndo.addEventListener('click', () => {
      stopCommandStockfish();
      const undone = commandChess.undo();
      if (undone) {
        commandUndoStack.push(undone);
        commandHistory.pop();
        renderCommandBoard();
        updateCommandEvaluation();
      }
    });
  }

  // Tombol Redo
  if (btnCommandRedo) {
    btnCommandRedo.addEventListener('click', () => {
      stopCommandStockfish();
      if (commandUndoStack.length > 0) {
        const nextM = commandUndoStack.pop();
        const applied = commandChess.move(nextM);
        if (applied) {
          commandHistory.push(applied);
          renderCommandBoard();
          updateCommandEvaluation();
        }
      }
    });
  }

  // Tombol Kembali ke Menu Utama
  if (btnCommandBackHome) {
    btnCommandBackHome.addEventListener('click', () => {
      stopCommandStockfish();
      switchTab('play');
    });
  }

  // Initial render of play board & access checks
  updateProfileBars();
  renderPlayBoard();
  updatePlayStatus();
  updateClockDisplays();
  checkAndPromptUsername();
  checkMamadVipAccess();
});

