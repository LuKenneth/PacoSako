//AI author BV this class is same as script
//edited to only be for AI player interaction
var game = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
board,
statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn');
fen_list = [];
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
    if(game.get_is_replacing() && !game.get_replaced_bad_move()) { 
      return false; 
    }
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
  if (game.turn()==='b' && game.game_over() === false)
{
  var newMove = game.moves();
  var again = true;
  //var findEnemyKing = true;
  //this makes sure the ai does not choose a path to kill their own king
  while (again)
  {
  
   var random = [Math.floor(Math.random() * newMove.length)];

   
   //need to transform captured into union to fool the code...
   var moveString = newMove[random];
   var checkKing = moveString.slice(0,2);
    if (checkKing != 'Kx')
    {
      again = false;
    }
  }

  //var fixed = moveString.replace("x","u");
  //this will check to see if the ai has a direct shot at the enemy king
  /*var whiteKing;
  while (findEnemyKing)
  {
    for (var index = 0; index < newMove.length; index++)
    {
        findWhiteKing = newMove[index];
        var capture = findWhiteKing.slice(0,2);
        if (capture === 'Kx')
        {
          index++;
        }
        
        else
        {
          capture = findWhiteKing.slice(1,2);
          if (capture === 'x')
          {
              
            var move = game.move(moveString.slice(1,3), moveString.slice(3,5), 'q');
            if (!game.in_checkmate())
            {
              var move = game.move(moveString.slice(3,5),moveString.slice(1,3), 'q');
            }
            else{
              Status = 'Game over, white is in Paco Sako'; 
            }
          }

        }
    }
    findEnemyKing = false;
  }
*/

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
  //var move = game.move({
   // from: part1,
   // to: part2,
   // promotion: 'q'
  //});
  onDrop(part1,part2); //somehow this solves the issue if the player's chaining not working.
  //for debugging
   //statusEl.html(newMove[random] + ' '+ moveString + ' '+ part1 + ' ' + part2);
   board.position(game.fen());
   
}

 // updateStatus();
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


//make a random legal move for black player
updateStatus();
//modified LKP 12/12/17
//returning move because I need to get the move object from onDrop
//for the en passant to take place in StopDraggingPiece of chessboardjs
return move;
}
}
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
if (game.turn() === 'b') {
  moveColor = 'Black';
    
}

// checkmate?
if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in Paco Sako.';
}

// draw?
else if (game.in_draw() === true) {
  status = 'Game over, drawn position';
}

// game still on
else {
  status = moveColor + ' to move';}
 
  //disable check 11/21/17 BV
  // check
  
//}


statusEl.html(status);
fenEl.html(game.fen());
pgnEl.html(game.pgn());
fen_list.push(game.fen());


if (game.turn() ==='b'){
  if (game.in_checkmate() === true)
  {
    Status = 'Game over,' + moveColor + ' is in Paco Sako.'
  }
  else{
  window.setInterval(makeRandomMove,400);
  }
}

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

