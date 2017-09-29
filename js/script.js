var game = new Chess("rnbq1bnr/Punppkp1p1/8/4p1p1/P5P1/2N5/1PPPPPBP/R1BQK1NR b KQ - 3 4"),
board,
statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn');

// setup my socket client
// var socket = io();
// msgButton.onclick = function(e) {
//     // someone clicked send a message
//     socket.emit('message', 'hello world!');
// }
//NEW CODE ABOVE


// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
if (game.game_over() === true ||
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
  return false;
}
};

var onDrop = function(source, target) {
// see if the move is legal
var move = game.move({
  from: source,
  to: target,
  promotion: 'q' // NOTE: always promote to a queen for example simplicity
});

// illegal move
if (move === null) return 'snapback';

updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
board.position(game.fen());
};

var updateStatus = function() {
var status = '';

var moveColor = 'White';
if (game.turn() === 'b') {
  moveColor = 'Black';
}

// checkmate?
if (game.in_checkmate() === true) {
  status = 'Game over, ' + moveColor + ' is in checkmate.';
}

// draw?
else if (game.in_draw() === true) {
  status = 'Game over, drawn position';
}

// game still on
else {
  status = moveColor + ' to move';

  // check?
  if (game.in_check() === true) {
    status += ', ' + moveColor + ' is in check';
  }
}

statusEl.html(status);
fenEl.html(game.fen());
pgnEl.html(game.pgn());
};

var cfg = {
draggable: true,
position: 'start',
onDragStart: onDragStart,
onDrop: onDrop,
onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);
board.position(game.fen());
updateStatus();

