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

   
   //need to transform captured into union to fool the code...
   var moveString = newMove[random];
  //var fixed = moveString.replace("x","u");

  //this checks to see if there is a piece string attatched 
var checkStr = moveString.slice(0,1);
var checkStr2 = moveString.slice(1,2);
if (checkStr === 'N' || checkStr ==='Q' || checkStr === 'K' || checkStr === 'B' || checkStr ==='R')
{   //then check to see if the string contains a capture symbol
    
    if (checkStr2 === 'x')
    {
      var part1 = moveString.slice(2,4);
      var part2 = moveString.slice(4,6);
    }
    else if (checkStr2 === 'U')
    {
      var part1 = moveString.slice(3,5);
      var part2 = moveString.slice(5,7);
    }
    else
    {
      var part1 = moveString.slice(1,3);
      var part2 = moveString.slice(3,5);
    }
  
}
else if (checkStr2 === 'x')
{
  var part1 = moveString.slice(2,4);
  var part2 = moveString.slice(4,6);
}
else if (checkStr2 === 'U')
{
  var part1 = moveString.slice(3,5);
  var part2 = moveString.slice(5,7);
}
else {
   //this case if last, for pawn pieces as they have no leading letter
  var part1 = moveString.slice(0,2);
  var part2 = moveString.slice(2,4);

}
  //going to replicate the onDrop function but for AI
  //will pick the string apart, only issue is finding the source
  var move = game.move({
    from: part1,
    to: part2,
    promotion: 'q'
  });
  
  //for debugging
   //statusEl.html(newMove[random] + ' '+ moveString + ' '+ part1 + ' ' + part2);
   board.position(game.fen());
   
}
game.turn() == 'w';
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
if (game.in_checkmate() === true) {
  status = 'Game over, ' + moveColor + ' is in checkmate.';
}
//make a random legal move for black player
  


}
}
// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  //if this is commented out, those 3 ^ dont work, but unions do
    board.position(game.fen());
    //if (game.turn() ==='b' && game.in_checkmate != true){
     // window.setInterval(makeRandomMove,300);
     // }
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
  status = moveColor + ' to move';}
  if (game.turn() ==='b' && game.in_checkmate != true){
     window.setInterval(makeRandomMove,300);
     }
  //disable check 11/21/17 BV
  // check
  //if (game.in_check() === true) {
  //  status += ', ' + moveColor + ' is in check';
  //}
//}


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
