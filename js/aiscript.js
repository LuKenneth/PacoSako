//AI author BV this class is same as script
//edited to only be for AI player interaction
var game = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
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

//this version does not allow for move in draw, checkmate, or if the move 
//from the black player


  var onDragStart = function (source, piece, position, orientation) {
    if(game.game_over() === false && piece.search(/u/) !== -1) {
        return true;
      }
    if (game.game_over() === true || game.in_draw() === true ||
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

   
   /*//need to transform captured into union to fool the code...
   var moveString = newMove[random];
  var fixed = moveString.replace("x","u");
  var parts = fixed.split('u');
  var part1 = parts[0];
  var part2 = parts[1];

  //going to replicate the onDrop function but for AI
  //will pick the string apart, only issue is finding the source
  var move = game.move({
    from: part1,
    to: part2,
    promotion: 'q'
  });*/
  
  game.move(newMove[random]);
  // statusEl.html(newMove[random] + ' '+ fixed + ' '+ part1 + ' ' + part2);
   board.position(game.fen());
   
}
  updateStatus();
};

if (game.turn() ==='w')
{
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
//make a random legal move for black player
  if (game.turn() ==='b'){
  window.setInterval(makeRandomMove,250);
  }


}
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
