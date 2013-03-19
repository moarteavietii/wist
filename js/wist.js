playersCount = 3; // the number of players
currentPlayer = {}; // the current player
currentRound = 0; // the current game round
maxRounds = 12; // number of rounds calculated depending on players count
firstPlayerId = 1; // first player index
lastPlayerId = 3; // the last payer id
firstPlayer = {}; // the first player instance
playerWidth = '33%'; // the total width in interface alocated to a player
zeroPoints = 1; // the bonus that is added when the players bet is correct
prize = 10; // the bonus on for matches
currentCardsRound = 1; // the number of cards for the current round

$(document).ready(function() {
	resetGame();

	$('#playersCount').change(function() {addPlayers($(this).val())});
	$('.bet').change(function() {restrictLastPlayer()});
	$('#begin').click(function() {startGame()});
	$('.fp').click(function() {setFirstPlayer($(this))});
	$('#nextRound').click(function() {playNextRound()});
	$('#scoreComputer').click(function(){computeScore()});
	$('#stopBets').click(function() {
		$('.bet').attr('disabled', 'disabled')
		$('#stopBets').attr('disabled', 'disabled')
	});
	$('#zeroPoints').change(function() {zeroPoints = parseInt($(this).val());});
	$('#prizePoints').change(function() {prize = parseInt($(this).val());});

	$('.header').touchwipe({
		wipeUp: function() {showSettings();},
		min_move_x: 20,
		min_move_y: 20
	});
	$('.footer').touchwipe({
		wipeDown: function() {hideSettings();},
		min_move_x: 20,
		min_move_y: 20
	});
	$('.header, .footer').touchwipe({
		wipeLeft: function() {hideHistory()},
 		wipeRight: function() {showHistory()},
		min_move_x: 20,
		min_move_y: 20
	});
});

//resets the game to an initial state
function resetGame() {
	playersCount = 3;
	currentPlayer = {};
	currentRound = 0;
	maxRounds = 12;
	firstPlayerId = 1;
	firstPlayer = {};
	lastPlayerId = 3;
	playerWidth = '33%';
	currentCardsRound = 1;

	//TODO: initiate the css for hidden divs

	$('#playersCount').trigger('change');
}

function showSettings() {
	hideHistory();
	settings = $('#settings');
	if (settings.hasClass('hidden')) {
		settings.removeClass('hidden');
		settings.animate({top: '0%'});
		settings.children('.header').fadeIn();
	}
}

function hideSettings() {
	settings = $('#settings');
	if (!settings.hasClass('hidden')) {
		settings.animate({top: '-100%'}, 500, function() {
			settings.addClass('hidden');
		});
	}
}

function showHistory() {
	hideSettings();
	history = $('#history');
	if (history.hasClass('hidden')) {
		history.removeClass('hidden');
		history.animate({left: '0%'});
		history.children('.header').animate({top: '1px'});
		history.children('.header').animate({top: '0px'});
	}
}

function hideHistory() {
	history = $('#history');
	if (!history.hasClass('hidden')) {
		history.animate({left: '-100%'}, 500, function() {
			history.addClass('hidden');
		});
		history.children('.header').animate({top: '1px'});
		history.children('.header').animate({top: '0px'});
	}
}

//create the players inputs for the players naming phase
function addPlayers(count) {
	playersCount = count;
	$('#playersInputs').html('');
	for(i = 1; i <= count; i++) {
		playerName = $('#blankPlayerInput').clone(true);
		playerName.removeAttr('id');
		playerName.children('label').html('Player ' + i + ': ').attr('for', 'player_' + i);
		playerName.children('input').attr('name', 'player_' + i).attr('value', 'P' + i);
		playerName.children('input').attr('name', 'player_' + i).attr('indexval', i);
		$('#playersInputs').append(playerName);
	}
}

//clone the blank player container and create the given number of players
function initBoard() {
	playerWidth = Math.floor(100 / playersCount) + '%';
	$('#playersInputs').children().each(function(pl, el) {
		//add player
		playerDiv = $('#blankPlayerDiv').clone(true);
		playerDiv.attr('id', 'playerdiv_' + (pl + 1));
		name = $(el).children('input.pname').val();
		player = 'players.player' + (pl + 1);
		currentPlayer = eval(player);
		currentPlayer.id = pl + 1;
		currentPlayer.name = name;
		currentPlayer.score = 0;
		currentPlayer.bet = 0;
		currentPlayer.result = 0;
		currentPlayer.consRight = 0;
		currentPlayer.consWrong = 0;

		if(currentPlayer.id == firstPlayerId) {
			firstPlayer = currentPlayer;
			computeLastPlayer();
			playerDiv.addClass('cPlayer');
		}

		playerDiv.html(currentPlayer.name);
		$('#players').append(playerDiv);

	});
	maxRounds = 12 + playersCount * 3; // 1x (2 -> 7) + 1x (7 -> 2) + 2x 1 + 1x 8
	$('.player').css({'width': playerWidth});
}

function setFirstPlayer(fp) {
	$('.fp').removeAttr('disabled');
	fp.attr('disabled', 'disabled');
	firstPlayerId = fp.prev('input').attr('indexval');
}

function startGame() {
	hideSettings();
	initBoard();
	$('#choosePlayers').fadeOut(200, function() {
		$('#playGame').fadeIn();
	});

	playNextRound();

/*	playNormalRounds();
	playRounds8();
	playNormalRounds(true);
	playRounnds1();
*/
}

function playNextRound() {
	currentRound++;
	eightMin = 6 + parseInt(playersCount);
	eightMax = 6 + 2 * playersCount;
	oneMin = 12 + 2 * playersCount;
	oneMax = 12 + 3 * playersCount;
	
	if (currentRound <= playersCount) {
		//playing a round of 1
		playRound(1);
		return;
	}

	if (currentRound > eightMin && currentRound <= eightMax) {
		//playing a round of 8
		playRound(8);
		return;
	}

	if (currentRound > oneMin && currentRound <= oneMax) {
		//playing a round of 1
		playRound(1);
		return;
	}

	//playing a normal round
	if(currentRound <= eightMin) {
		playRound(currentRound - parseInt(playersCount) + 1);
	} else {
		playRound(2 * playersCount + 14 - currentRound);
	}
}

function playRound(round) {
	currentCardsRound = round;
	$('#stopBets').removeAttr('disabled');

	if(currentRound > 12 + 3 * playersCount) {
		$('#roundNumber').html('Game over');

		$('#scoreComputer').attr('disabled', 'disabled');
		$('#nextRound').attr('disabled', 'disabled');
		return;
	}

	$('#roundNumber').html('Round ' + currentRound + ' (' + round + ')');
	$('#nextRound').attr('disabled', 'disabled');
	$.blockUI();
	$('#bets').html('');
	$('#answers').html('');
	
	if(currentRound > 1) {
		$('.cPlayer').removeClass('cPlayer');
		firstPlayerId++;	
		if(firstPlayerId > playersCount) {
			firstPlayerId = 1;
		}
	}

	$('#playersInputs').children().each( function(pl, el) {
		select = '';
		betsSelect = "<div class='select'><select class='points bet' id='bet_" + (pl + 1) + "'>";
		resultSelect = "<div class='select'><select class='points result' id='res_" + (pl + 1) + "'>";
		for(j = 0; j <= round; j++) {
			select += '<option value="' + j + '">' + j + '</option>';
		}
		select += '</select></div>';

		$('#bets').append(betsSelect + select);
		$('#answers').append(resultSelect + select);

		if(currentRound > 1) {
			player = 'players.player' + (pl + 1);
			currentPlayer = eval(player);

			if(currentPlayer.id == firstPlayerId) {
				firstPlayer = currentPlayer;
				computeLastPlayer();
				$('#playerdiv_' + firstPlayerId).addClass('cPlayer');
			}
		}
	});
	$('.select').css({'width': playerWidth});
	$('.bet').change(function() {restrictLastPlayer()});
	$.unblockUI();
	$('#scoreComputer').removeAttr('disabled');
}

function computeScore() {
	$('#scoreComputer').attr('disabled', 'disabled');
	$('.points').attr('disabled', 'disabled');

	$('#playersInputs').children().each( function(pl, el) {
		player = 'players.player' + (pl + 1);
		currentPlayer = eval(player);

		updatePlayerScore(currentPlayer, pl + 1);
	});

	updateHistory();
	$('#nextRound').removeAttr('disabled');
}

function updatePlayerScore(player, index) {
	player.bet = $('#bet_' + index).val();
	player.result = $('#res_' + index).val();

	if (player.bet == player.result) {
		player.score += (parseInt(player.bet) + zeroPoints);

		player.consRight++;
		player.consWrong = 0;

		if(player.consRight == playersCount) {
			player.score += prize;
			player.consRight = 0;
		}
	} else {
		if(player.bet > player.result) {
			player.score -= (player.bet - player.result);
		} else {
			player.score -= (player.result - player.bet);
		}


		player.consWrong++;
		player.consRight = 0;

		if(player.consWrong == playersCount) {
			player.score -= prize;
			player.consWrong = 0;
		}
	}

	displayPlayerScore();
}

function displayPlayerScore() {
	$('#totals').html('');
	$('#playersInputs').children().each( function(pl, el) {
		player = 'players.player' + (pl + 1);
		currentPlayer = eval(player);

		totals = '<div class="total">';

		totals += currentPlayer.score;

		if(currentPlayer.consRight > 0) {
			totals += '<sub class="consRight">(' + currentPlayer.consRight + ')</sub>';
		}
		if(currentPlayer.consWrong > 0) {
			totals += '<sub class="consWrong">(' + currentPlayer.consWrong + ')</sub>';
		}

		totals += '</div>';

		$('#totals').append(totals);
	});
	$('.total').css({'width': playerWidth});
}

function updateHistory() {
	history = '<div class="history">';
	history += '<div class="subheader"> Round ' + currentRound + '</div>';
	$('#playersInputs').children().each( function(pl, el) {
		player = 'players.player' + (pl + 1);
		currentPlayer = eval(player);

		history += '<div class="select">b: ' + currentPlayer.bet + '</div>';
		history += '<div class="select">a: ' + currentPlayer.result + '</div>';
	});
	history += '<hr/>';
	history += $('#totals').html() + '<hr/></div>';
	$('#history .midContent').append(history);
	$('.select').css({'width' : playerWidth});
}

function restrictLastPlayer () {
	$('.bet option').removeAttr('disabled');

	betsum = 0;
	$('.bet').each(function (index, value) {
		if(index + 1 != lastPlayerId) {
			betsum += parseInt($(value).val());
		} else {
			lastBet = $(value).val();
		}
	});

	if(betsum > currentCardsRound) {
		return;
	}

	restrictedBet = currentCardsRound - betsum;

	$('#bet_' + lastPlayerId + ' option[value="' + restrictedBet + '"]').attr('disabled', 'disabled');

	if(lastBet == restrictedBet) {
		if(restrictedBet == 0) {
			$('#bet_' + lastPlayerId).val(1);
			return;
		}
		if(restrictedBet == currentCardsRound) {
			$('#bet_' + lastPlayerId).val(currentCardsRound - 1);
			return;
		}
		if(restrictedBet != 0 && restrictedBet != currentCardsRound) {
			$('#bet_' + lastPlayerId).val(restrictedBet - 1);
			return;
		}
	}


	restrictedBet = -1;
}

function computeLastPlayer () {
	lastPlayerId = firstPlayerId - 1;

	if(lastPlayerId < 1) {
		lastPlayerId += parseInt(playersCount);
	}
}