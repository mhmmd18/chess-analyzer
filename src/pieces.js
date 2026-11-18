// Official Chess.com Neo Piece Set (Compatible for Web & Extension)
const PIECES_DIR = (typeof window !== 'undefined' && window.location.pathname.includes('/src/')) 
  ? '../assets/pieces/' 
  : 'assets/pieces/';

const CHESSCOM_PIECES = {
  // White Pieces
  'P': PIECES_DIR + 'wp.png',
  'N': PIECES_DIR + 'wn.png',
  'B': PIECES_DIR + 'wb.png',
  'R': PIECES_DIR + 'wr.png',
  'Q': PIECES_DIR + 'wq.png',
  'K': PIECES_DIR + 'wk.png',

  // Black Pieces
  'p': PIECES_DIR + 'bp.png',
  'n': PIECES_DIR + 'bn.png',
  'b': PIECES_DIR + 'bb.png',
  'r': PIECES_DIR + 'br.png',
  'q': PIECES_DIR + 'bq.png',
  'k': PIECES_DIR + 'bk.png'
};

window.CHESSCOM_PIECES = CHESSCOM_PIECES;
window.PIECES_DIR = PIECES_DIR;
