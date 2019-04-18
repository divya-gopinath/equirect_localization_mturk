const NUM_DECIMAL = 2;
const PAUSE_THRESHOLD = 2;

var randomColor = function() {
  var colorR = Math.floor((Math.random() * 200)) + 50;
  var colorG = Math.floor((Math.random() * 200)) + 50;
  var colorB = Math.floor((Math.random() * 200)) + 50;
  var colorString = 'rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0.8)';
  return colorString;
}