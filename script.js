var game = new Chess(),
board,
statusEl = $('#status'),
fenEl = $('#fen'),
//pgnEl = $('#pgn'),
//modified LKP 11/30/2017
//to hold a list of all the fens per update
fen_list = [];
var serverFen = game.fen();
var mouseX;
var mouseY;
var global_e;
var socket = io();
var white_player = "White";
var black_player = "Black";
//modified LKP 12/6/2017
var amPlayerOne = true;

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
      (amPlayerOne && piece.search(/^b/) !== -1 ) ||
      (!amPlayerOne && piece.search(/^w/) !== -1 )) {
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

//modified LKP 12/7/17
if(move.captured == null || move.captured == undefined) {
    sendChessToServer();
}
else {
    if(move.captured.indexOf('u') == -1) {
        sendChessToServer();
    }
}

updateStatus();

// if(move.captured != null && move.captured != undefined) {
//   if(move.captured.indexOf('u') != -1) {
//     var move_piece = get_replaced_piece(move.captured);
//     window.ChessBoard.beginDraggingPiece(source, move_piece, mouseX, mouseY);
//   }
// }
//modified LKP 12/12/17
//returning move because I need to get the move object from onDrop
//for the en passant to take place in StopDraggingPiece of chessboardjs
return move;
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

/*
modified LKP 12/6/2017
gets the name of the player
*/
function getUsername(color) {

    return (color == "White") ? white_player : black_player;
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
  status = 'Game over, ' + getUsername(moveColor) + ' is in checkmate.';
}

// draw?
else if (game.in_draw() === true) {
  status = 'Game over, drawn position';
}

// game still on
else {
  status = getUsername(moveColor) + ' to move';

  //modified LKP: 11/15/17
  //disable check
  // check?
  // if (game.in_check() === true) {
  //   status += ', ' + moveColor + ' is in check';
  // }
  
}

statusEl.html(status);
fenEl.html(game.fen());
serverFen = game.fen();
//modified LKP: 10/31/2017 loading the fen string puts the board variable on the board
// game.load(game.fen());
//console.log("BEFORE" +game.pgn());
//pgnEl.html(game.pgn());
//console.log("AFTER:" + pgnEl.html);
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

//-------------------------------------------------------------------
// START OF THE CLIENT CODE
// MODIFY: NK,BMW 12/3/2017
//-------------------------------------------------------------------

 //declaring variables for chess game and dashboard
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
	//modified BMW, NDK 12/9/2017
	var $users = $('.users');
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $joinGame = $('.joinGame');
    var $leaveGame = $('.leaveGame');
	var $board = $('.board');
    // Prompt for setting a username
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
	var statusEl = $('#status');
	var fenEl = $('#fen');
	//var pgnEl = $('#pgn');
    var socket = io();

    function addParticipantsMessage(data) {
        var message = '';
        if (data.numUsers === 1) {
            message += "No other players are connected to the server";
        } else {
			// Works but removed to reduce chat clutter
            //message += "there are " + data.numUsers + " players in the Lobby";
        }
        log(message);
    }

    // Sets the client's username
    function setUsername() {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your username
            socket.emit('add user', username);

        }
    }
	
    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    }
	
	//--------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------
	
	//Modify: BMW,NK,LKP 12/6/2017
	function sendChessToServer() {

        socket.emit('newChessUpdate', game.fen());
	}

	//--------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------
	
    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

	// Server passes down connected users to update the
	// user list on each clients screen
	//modified BMW, NDK 12/9/2017
	function updateUserList(data) {
		
		var userString;
		if ($users.length !== 0) {
			$users.empty();
		}
		
		for (index = 0; index<data.userList.length ; index++)
		{
			$users.append(data.userList[index]);
			$users.append("<br>");
		}	
	}
	
	
    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }
	
	

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // Keyboard events

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on('input', function () {
        updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
        $inputMessage.focus();
    });
	
	
    $joinGame.click(function () {
        joinGame();

        //Dead code below just keeping around for reference
        //This code calls a timer function which waits 2000 milliseconds or 2 seconds before re-routing to game.html
       // setTimeout(function(){
        //    window.location.href = "game.html";
       // }, 2000);        
    })

	
    $leaveGame.click(function () {
        leaveGame();

    })

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        connected = true;
        // Display the welcome message
        var message = "Welcome to the Game Server ";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
		updateUserList(data);
    });
	
    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        addChatMessage(data);
    });
		
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
		//log(data.userList[0] + ": from the USERLIST");
        addParticipantsMessage(data);
        //modified LKP 12/6/2017
        black_player = data.username;
		//modified BMW, NDK 12/9/2017
		updateUserList(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
		//modified BMW, NDK 12/9/2017
		updateUserList(data);

    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });


    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });


	//--------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------
	
	
	//Modify: BMW,NK,LKP 12/6/2017
	socket.on('updateClientChessInfo', function(data) {
	
        board.position(data.fen);
        game.load(data.fen);
        updateStatus();
		
	});

	//--------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------
	
    socket.on('gameCreated', function (data) {
        console.log("Game Created! ID is: " + data.gameId)
        log(data.username + ' created Game: ' + data.gameId);

        //modified LKP 12/6/2017
        white_player = data.username;
        amPlayerOne = true;
        updateStatus();

        //alert("Game Created! ID is: "+ JSON.stringify(data));
    });

    socket.on('disconnect', function () {
        log('you have been disconnected');
    });

    socket.on('reconnect', function () {
        log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', function () {
        log('attempt to reconnect has failed');
    });


    //Join into an Existing Game
    function joinGame() {
        socket.emit('joinGame');
    };

    socket.on('joinSuccess', function (data) {
        log('Joined the following game: ' + data.gameId);

        //modified LKP 12/6/2017
        black_player = data.username;
        amPlayerOne = false;
    });


    //Response from Server on existing User found in a game
    socket.on('alreadyJoined', function (data) {
        log('You are already in an Existing Game: ' + data.gameId);
    });


    function leaveGame() {
        socket.emit('leaveGame');
    };

    socket.on('leftGame', function (data) {
        log('Leaving Game ' + data.gameId);
    });

    socket.on('notInGame', function () {
        log('You are not currently in a Game.');
    });

    socket.on('gameDestroyed', function (data) {
        log(data.gameOwner + ' destroyed game: ' + data.gameId);

    });


