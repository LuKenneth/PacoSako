var game = new Chess(),
board,
statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn'),
//modified LKP 11/30/2017
//to hold a list of all the fens per update
fen_list = [];

var mouseX;
var mouseY;
var global_e;

//modified LKP: 11/9/17
// event handler function
function handler(e) {
  global_e = e
  e = e || window.event;

  var pageX = e.pageX;
  var pageY = e.pageY;

  // IE 8
  if (pageX === undefined) {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  mouseX = pageX;
  mouseY = pageY;
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('mousemove', handler);
else document.addEventListener('mousemove', handler);


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

  //modified LKP 11/15/17
  if(game.get_is_replacing() && !game.get_replaced_bad_move()) { 
    return false; 
  }
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
  if(game.get_is_replacing()) {
    game.set_replaced_bad_move(true);
    //window.Chessboard.stopDraggedPiece("hand", global_e);
    //window.ChessBoard.beginDraggingPiece(source, source.substring(2, source.length + 1), mouseX, mouseY);
    var newFen = findFirstMove();
    board.position(newFen);
    game.load(newFen);
    game.generate_fen();
  } 
    return 'snapback';
}

//TAG: MODIFY LKP 11/9/17
//I think this is where I will need to put the code
//to beginDraggingPiece to prepare for chaining unions

//nup
//wNubP
// var move_piece = move.color + move.piece.toUpperCase();

updateStatus();
// if(move.captured != null && move.captured != undefined) {
//   if(move.captured.indexOf('u') != -1) {
//     var move_piece = get_replaced_piece(move.captured);
//     window.ChessBoard.beginDraggingPiece(source, move_piece, mouseX, mouseY);
//   }
// }
  
};

/*
modified LKP: 11/30
finds the first move of the current player's turn
*/
function findFirstMove() {

  var firstMove;

  for(var i = fen_list.length; i >= 0; i--) {
    firstMove = fen_list[i];
    var tokens = fen_list[i-1].split(/\s+/);
    if(tokens[1]==swapMove(game.turn())) {
      break;
    }
  }
  
  return firstMove;

}

/*
modified LKP 11/30/17
returns black if given white and vice versa
*/
function swapMove(move) {

  return move == "w" ? "b" : "w";
}
// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  //if this is commented out, those 3 ^ dont work, but unions do
  board.position(game.fen());
  //modified LKP 11/9/17 ^that is no longer true. keep this ^ line
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

  //modified LKP: 11/15/17
  //disable check
  // check?
  // if (game.in_check() === true) {
  //   status += ', ' + moveColor + ' is in check';
  // }
}

statusEl.html(status);
fenEl.html(game.fen());
//modified LKP: 10/31/2017 loading the fen string puts the board variable on the board
// game.load(game.fen());
pgnEl.html(game.pgn());
fen_list.push(game.fen());
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

