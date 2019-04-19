const NUM_DECIMAL = 2;
const PAUSE_THRESHOLD = 4;
const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;

var randomColor = function() {
  var colorR = Math.floor((Math.random() * 200)) + 50;
  var colorG = Math.floor((Math.random() * 200)) + 50;
  var colorB = Math.floor((Math.random() * 200)) + 50;
  var colorString = 'rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0.8)';
  return colorString;
}