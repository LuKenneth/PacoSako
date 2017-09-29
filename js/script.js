var game = new Chess(),
board,
statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn');
// "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 1"
// setup my socket client
// var socket = io();
// msgButton.onclick = function(e) {
//     // someone clicked send a message
//     socket.emit('message', 'hello world!');
// }
//NEW CODE ABOVE


// do not pick up pieces if the game is over
// only pick up pieces for the side to move
// var onDragStart = function(source, piece, position, orientation) {
// if (game.game_over() === true ||
//     (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
//     (game.turn() === 'b' && piece.search(/^w/) !== -1)) 
//    {
//   return false;
// }
// }; 
//this version does not allow for move in draw, checkmate, or if the move 
//from the black player

var onDragStart = function (source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true ||
      piece.search(/^b/) !== -1) {
      return false;
  }
}; 

//to pick the position of the move.

var makeRandomMove = function()
{
if (game.turn()==='b')
{
  var newMove = game.moves();
  
   var random = [Math.floor(Math.random() * newMove.length)];
   game.move(newMove[random]);
    
   board.position(game.fen);
   game.turn()='w';
}
  updateStatus();
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

//make a random legal move for black player
window.setInterval(makeRandomMove,);

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

updateStatus();

