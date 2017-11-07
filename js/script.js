var game = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
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

//modified
if(game.game_over() === false && piece.search(/u/) !== -1) {
  return true;
}
if (game.game_over() === true ||
    (game.turn() === 'w' && piece.search(/^b/) !== -1 ) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1 )) {
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
if (move === null) {
  return 'snapback';
}

updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  //if this is commented out, those 3 ^ dont work, but unions do
  //board.position(game.fen());
};

var updateStatus = function() {
var status = '';

var moveColor = 'White';
//TAG: MODIFY
//need to modify for when you chain unions
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
//modified LKP: 10/31/2017 loading the fen string puts the unions in the board[]
//game.load(game.fen());
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

