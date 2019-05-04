const NUM_DECIMAL = 2;
const PAUSE_THRESHOLD = 4;
const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;
const UP_ARROW_KEY = 38;
const SPACE_KEY = 32;

const CSS_GLOW = "0px 0px 30px 20px #ffff";
const CSS_TEXT_GLOW = "2px 2px 5px ";

const HIGHLIGHT_MODE_TEXT = "You are in highlight mode. Update the point in question and press the down arrow key. You can scrub back to the previous keyframe with the left arrow key. You may add new sources at the end.";
const SUBMIT_ENDPOINT = "https://workersandbox.mturk.com/mturk/externalSubmit/";

var randomColor = function() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}