var TicTacToe = function(selector) {
  this.$board = $(selector);
  this.moves = [];
  this.wins = { x: [], o: [] }
  this.gameOver = false;
  this.init();
}

TicTacToe.prototype.init = function() {
  this.drawBoard();
  this.addEventHandlers();
}

TicTacToe.prototype.drawBoard = function() {
  var html = this.boardTemplate();
  this.$board.html(html);
}

TicTacToe.prototype.addEventHandlers = function() {
  var that = this;
  $('[data-small-cell]').click(function(event) {
    var $smallCell = $(event.currentTarget);
    that.applyMove($smallCell);
  });
}

TicTacToe.prototype.emptyBoard = function(board) {
  // [[0, 1, 2, 3 ...], [0, 1, 2, 3]]
  var board = [];
  for (var i = 0; i < 9; i++) {
    board[i] = [];
    for (var j = 0; j < 9; j++) {
      board[i].push(null);
    }
  }
  return board;
}

TicTacToe.prototype.boardTemplate = function(bigCellNum) {
  var html = '';

  if (bigCellNum >= 0) {
    html += '<table data-big-cell=' + bigCellNum + '>';
  } else {
    html += '<table data-board>';
  }

  var smallCellNum = 0;
  for (var row = 0; row < 3; row++) {
    html += '<tr>';
    for (var col = 0; col < 3; col++) {
      if (bigCellNum >= 0) {
        html += '<td class="clickable" data-small-cell=' + smallCellNum + '>';
        html += '&nbsp;'
      } else {
        html += '<td>';
        html += this.boardTemplate(smallCellNum);
      }
      smallCellNum++;
      html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';

  return html;
}

TicTacToe.prototype.isEven = function(num) {
  return (num % 2 == 0);
}

TicTacToe.prototype.currentPlayerMark = function() {
  return this.isEven(this.moves.length) ? 'x' : 'o';
}

TicTacToe.prototype.lastPlayerMark = function() {
  return this.isEven(this.moves.length) ? 'o' : 'x';
}

TicTacToe.prototype.isTaken = function($smallCell) {
  return !!$smallCell.data('mark');
}

TicTacToe.prototype.winsContain = function(cellNum) {
  return (this.wins.x.indexOf(cellNum) > -1 ||
      this.wins.o.indexOf(cellNum) > -1)
}

TicTacToe.prototype.shakeCell = function($cell) {
  $cell.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd \
              oanimationend animationend', function() {
    $(this).removeClass('animated shake');
  });
  $cell.addClass('animated shake');
}

TicTacToe.prototype.applyBigCellWin = function($cell, player) {
  $cell.attr('data-mark', player);

  $cell.addClass('won');
  $cell.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd \
              oanimationend animationend', function() {
    $(this).removeClass('animated pulse');
  });
  $cell.addClass('animated pulse');
}

TicTacToe.prototype.isValidMove = function($smallCell) {
  if (this.gameOver) {
    return false;
  }

  // if this is the first move, it's valid
  if (this.moves.length === 0) {
    return true;
  }

  // if cell is taken, it's invalid
  if (this.isTaken($smallCell)) {
    this.shakeCell($smallCell);
    return false;
  }

  var lastMoveCoords = this.moves[this.moves.length - 1];
  var lastBigCell = lastMoveCoords[0];
  var lastSmallCell = lastMoveCoords[1];

  var currentMoveCoords = this.coordsFromSmallCell($smallCell);
  var currentBigCell = currentMoveCoords[0];
  var currentSmallCell = currentMoveCoords[1];
  var $currentBigCell = $('[data-big-cell="' + currentBigCell + '"]');

  var nextBigCell = lastSmallCell;

  // return false if clicking on bigCell that is already won
  if (this.winsContain(currentBigCell)) {
    this.shakeCell($currentBigCell);
    return false;
  }

  // if the next valid bigCell is already won return true
  if (this.winsContain(nextBigCell)) {
    return true;
  }

  // otherwise, enforce that the currentBigCell is the right nextBigCell
  if (nextBigCell === currentBigCell)
    return true;
  else {
    this.shakeCell($currentBigCell);
    return false;
  }
}

TicTacToe.prototype.applyMove = function($smallCell) {
  var coords = this.coordsFromSmallCell($smallCell);
  var mark = this.currentPlayerMark();

  if (this.isValidMove($smallCell)) {
    this.moves.push(coords);

    this.$board.find('td').removeClass('last');
    $smallCell.addClass('selected last');
    $smallCell.attr('data-mark', mark);
    $smallCell.html(mark);

    this.isSmallWinner(coords[0]);
  }
}

TicTacToe.prototype.applyGameOver = function() {
  this.gameOver = true;
  var $board = this.$board.find('table[data-board]');
  this.applyBigCellWin($board);
}

TicTacToe.prototype.coordsFromSmallCell = function($smallCell) {
  var smallCellNum = $smallCell.data('small-cell');
  var $bigCell = $smallCell.closest('[data-big-cell]');
  var bigCellNum = $bigCell.data('big-cell');

  return [bigCellNum, smallCellNum];
}


TicTacToe.prototype.currentBoard = function() {
  var board = this.emptyBoard();

  for (var i = 0; i < this.moves.length; i++) {
    var move = this.moves[i];
    var outer = move[0];
    var inner = move[1];
    var mark = this.isEven(i) ? 'x' : 'o';
    board[outer][inner] = mark;
  }
  return board;
}


TicTacToe.prototype.cellType = function($cell) {
  var cellType;

  if (!(typeof $cell.data('board') ===  'undefined')) {
    cellType = 'board';
  } else if (!(typeof $cell.data('big-cell') ===  'undefined')) {
    cellType = 'big-cell';
  }

  return cellType;
}

TicTacToe.prototype.hasDiagonalWin = function($cell, player) {
  var cellSize;
  if (this.cellType($cell) === 'board') {
    cellSize = 'big';
  } else {
    cellSize = 'small'
  };

  // backward diagonal slash
  var backSelector = 'td[data-' + cellSize + '-cell="0"][data-mark="' + player + '"],\
                      td[data-' + cellSize + '-cell="4"][data-mark="' + player + '"],\
                      td[data-' + cellSize + '-cell="8"][data-mark="' + player + '"]'

  var $cells = $cell.find(backSelector);

  if ($cells.length === 3) {
    return true;
  }

  // forward diagonal slash
  var fwdSelector = 'td[data-' + cellSize + '-cell="2"][data-mark="' + player + '"],\
                     td[data-' + cellSize + '-cell="4"][data-mark="' + player + '"],\
                     td[data-' + cellSize + '-cell="6"][data-mark="' + player + '"]'

  var $cells = $cell.find(fwdSelector);

  if ($cells.length === 3) {
    return true;
  }

  return false;
}

TicTacToe.prototype.hasStraightWin = function($cell, player) {
  // check rows and cols for winner
  for (var j = 0; j < 3; j++) {
    // row check
    var rowSelector = 'tr:nth-child(' + (j + 1) + ') td';
    if (this.cellType($cell) === 'board') {
      rowSelector += ' table';
    }
    rowSelector += '[data-mark="' + player + '"]';
    var $rows = $cell.find(rowSelector);

    if ($rows.length === 3) {
      return true;
    }

    // col check
    var colSelector = 'td:nth-child(' + (j + 1) + ')';
    if (this.cellType($cell) === 'board') {
      colSelector += ' table';
    }
    colSelector += '[data-mark="' + player + '"]';
    var $cols = $cell.find(colSelector);

    if ($cols.length === 3) {
      return true;
    }
  }

  return false;
}

TicTacToe.prototype.hasWin = function($cell, player) {
  var win = false;

  if (this.hasDiagonalWin($cell, player)) {
    console.log('diagonal win for player', player);
    win = true;
  }

  if (this.hasStraightWin($cell, player)) {
    console.log('straight win for player', player);
    win = true;
  };

  return win;
}

TicTacToe.prototype.isSmallWinner = function(bigCellNum, players) {
  var $bigCell = $('[data-big-cell="' + bigCellNum + '"]');

  // by default, simply check if last player won
  // but support passing multiple players for thorough check
  var players = players || [this.lastPlayerMark()];

  // iterate through players
  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    var win = this.hasWin($bigCell, player);

    if (win) {
      this.applyBigCellWin($bigCell, player);
      this.wins[player].push(bigCellNum);

      // check for grandWinner
      var grandWin = this.hasWin($('table[data-board]'), player);
      if (grandWin) {
        console.log('grand win for player', player);
        this.applyGameOver();
      }
    }
  }
}

// var doSetTimeout = function($cell, mark, timeout) {
//   setTimeout(function() {
//     applyMove($cell, mark);
//   }, timeout);
// }
//
// var applyMoves = function(moves) {
//   for (var i = 0; i < moves.length; i++) {
//     var outer = moves[i][0];
//     var inner = moves[i][1];
//     var mark = isEven(i) ? 'x' : 'o';
//     var $cell = $('table[data-level="outer"] td[data-cell="' +
//       outer + '"] table[data-level="inner"] td[data-cell="' + inner + '"]');
//
//     var timeout = 500 + (i * 100);
//     doSetTimeout($cell, mark, timeout);
//   }
// }

// var sampleMoves = [
//   [4, 4],
//   [4, 2],
//   [2, 0],
//   [0, 5],
//   [5, 4],
//   [4, 1],
//   [1, 1],
//   [1, 6],
//   [6, 4],
//   [4, 0],
//   [0, 6],
//   [0, 3],
//   [0, 0],
//   [2, 1],
//   [2, 4],
//   [2, 7]
// ];
//
// applyMoves(sampleMoves);
