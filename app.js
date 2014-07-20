var boardTable = function(level) {
  var level = level || 'outer';
  var html = '<table data-level=' + level + '>';
  var cellNum = 0;
  for (var row = 0; row < 3; row++) {
    html += '<tr>';
    for (var col = 0; col < 3; col++) {
      html += '<td data-cell=' + cellNum + '>';
      if (level !== 'inner') {
        html += boardTable('inner');
      } else {
        html += '&nbsp;'
      }
      cellNum++;
      html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

var drawBoard = function() {
  var $board = $('[data-board]');
  var html = boardTable();
  $board.html(html);
}

var isEven = function(num) {
  return (num % 2 == 0);
}

// var applyMove = function($cell, mark) {
//   $cell.html(mark);
// }

var doSetTimeout = function($cell, mark, timeout) {
  setTimeout(function() {
    $cell.addClass('selected');
    //css('border-width', 2);
    //$cell.css('padding', 3);
    $cell.html(mark);
  }, timeout);
}

var applyMoves = function(moves) {
  for (var i = 0; i < moves.length; i++) {
    var outer = moves[i][0];
    var inner = moves[i][1];
    var mark = isEven(i) ? 'x' : 'o';
    var $cell = $('table[data-level="outer"] td[data-cell="' +
      outer + '"] table[data-level="inner"] td[data-cell="' + inner + '"]');

    var timeout = 500 + (i * 100);
    doSetTimeout($cell, mark, timeout);
  }
}

drawBoard();

var sampleMoves = [
  [4, 4],
  [4, 2],
  [2, 0],
  [0, 5],
  [5, 4],
  [4, 1],
  [1, 1],
  [1, 6],
  [6, 4],
  [4, 0],
  [0, 6],
  [0, 3],
  [0, 0],
  [2, 1],
  [2, 4],
  [2, 7]
];

applyMoves(sampleMoves);
