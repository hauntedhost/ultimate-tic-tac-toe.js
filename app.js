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

TicTacToe.prototype.applyMove = function($smallCell) {
  var coords = this.coordsFromSmallCell($smallCell);
  var mark = this.currentPlayerMark();

  if (this.isValidMove($smallCell)) {
    this.moves.push(coords);

    this.$board.find('td').removeClass('last');
    $smallCell.addClass('selected last');
    $smallCell.attr('data-mark', mark);
    $smallCell.html(mark);

    this.hasSmallWin(coords[0]);
  }
}

TicTacToe.prototype.applyWin = function($cell, player) {
  $cell.attr('data-mark', player);

  $cell.addClass('won');
  $cell.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd \
              oanimationend animationend', function() {
    $(this).removeClass('animated pulse');
  });
  $cell.addClass('animated pulse');
}

TicTacToe.prototype.applyGameOver = function() {
  this.gameOver = true;
  var $board = this.$board.find('table[data-board]');
  this.applyWin($board);
}

TicTacToe.prototype.shakeCell = function($cell) {
  $cell.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd \
              oanimationend animationend', function() {
    $(this).removeClass('animated shake');
  });
  $cell.addClass('animated shake');
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

TicTacToe.prototype.winsContain = function(cellNum) {
  return (this.wins.x.indexOf(cellNum) > -1 ||
      this.wins.o.indexOf(cellNum) > -1)
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

TicTacToe.prototype.coordsFromSmallCell = function($smallCell) {
  var smallCellNum = $smallCell.data('small-cell');
  var $bigCell = $smallCell.closest('[data-big-cell]');
  var bigCellNum = $bigCell.data('big-cell');

  return [bigCellNum, smallCellNum];
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

TicTacToe.prototype.isTaken = function($smallCell) {
  return !!$smallCell.data('mark');
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

TicTacToe.prototype.hasSmallWin = function(bigCellNum, players) {
  var $bigCell = $('[data-big-cell="' + bigCellNum + '"]');

  // by default, simply check if last player won
  // but support passing multiple players for complete check
  var players = players || [this.lastPlayerMark()];

  // iterate through players
  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    var win = this.hasWin($bigCell, player);

    if (win) {
      this.applyWin($bigCell, player);
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
