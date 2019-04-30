var localizedSources = [];
var lastTime = 1;
var highlightState = false;
var highlightIndex = 0;
var assignmentId = '{{ value }}';

$( document ).ready(function() {
  var video = $("#video-box")[0];

  $( "#finishBtn" ).click(function() {
    $("#localizedSourcesForm").val(JSON.stringify(localizedSources));
    $("#assignmentIdForm").val($("#assignmentId").text());
    $( "#submit_form" ).submit();
  });

  // Set up keycodes for scrubbing left/right
  $('html').keydown(function(e){
     if (e.keyCode == LEFT_ARROW_KEY) {
       e.preventDefault();
       if (highlightState) { return; }
       var nearestKeyframe = Math.floor((video.currentTime + 0.01)/PAUSE_THRESHOLD)*PAUSE_THRESHOLD;
       video.currentTime = nearestKeyframe;
       updateDots(nearestKeyframe);
     } else if (e.keyCode == RIGHT_ARROW_KEY) {
       e.preventDefault();
       if (highlightState) { return; }
       var nearestKeyframe = Math.ceil((video.currentTime+ 0.01)/PAUSE_THRESHOLD)*PAUSE_THRESHOLD;
       video.currentTime = nearestKeyframe;
       updateDots(nearestKeyframe);
     } else if (e.keyCode == DOWN_ARROW_KEY && highlightState) {
       incrementHighlightState();
     };
  });

  // Set time update to pause on keyframes
  var onTimeUpdate = function() {
    var time = video.currentTime;
    updateDots(time);
    if (video.paused) { return; }
    var roundUpLast = Math.ceil(lastTime);
    var roundDownNow = Math.floor(time);
    if ((roundUpLast == roundDownNow) && (roundUpLast % PAUSE_THRESHOLD== 0)) {
      video.pause();
      video.currentTime = roundUpLast;
      beginHighlightState();
    }
    lastTime = time;
  }
  $("#video-box").bind('timeupdate', onTimeUpdate);

  // Remove redundancy if one exists (object localized twice on same timestep)
  var addSourceHistoryNoRedundancy = function(sourceIndex, datapoint) {
    var source = localizedSources[sourceIndex];
    var redundantIndex = null;
    $.each(source.history, function(index, element) {
      if (element.time == datapoint.time) {
        redundantIndex = index;
      }
    });
    if (redundantIndex != null) {
      source.history[redundantIndex] = datapoint;
      editSidebarWithoutAddition(sourceIndex, redundantIndex);
    } else {
      source.history.push(datapoint);
      editSidebarWithAddition(sourceIndex);
    }
    return redundantIndex;
  };

  // Add new dot to sidebar
  var appendSidebar = function() {
    var sourceIndex = localizedSources.length - 1;
    var source = localizedSources[sourceIndex];
    $("#sidebar").append(
      '<br> <div id=' + 'source' + sourceIndex + ' class="sourceBox"> <strong> Source ' + localizedSources.length + ': </strong>' +
      '<input name="objectName" placeholder="Optional object name" class="sourceObjectName"><br>'+
      '<input type="checkbox" name="outOfFrame" class="sourceOption"> Object not making sound  ' +
      '<input type="checkbox" name="deleted" class="sourceOption">Delete source' +
      '<br>' + '<span id="history0"> Relative position to video box at time ' + parseFloat(source.history[0].time).toFixed(NUM_DECIMAL) + ': ' +
      '(' + parseFloat(source.history[0].x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(source.history[0].y).toFixed(NUM_DECIMAL) + ') </span> </div>'
    );
    $('.sourceObjectName').on("input", function(e) {
      var sourceIndexString = $(this).parent().attr('id').toString();
      var sourceIndex = parseInt(sourceIndexString[sourceIndexString.length-1]);
      var source = localizedSources[sourceIndex];
      source.name = $(this).val();
    });
    $('.sourceOption').unbind('change');
    $('.sourceOption').change(function(e) {
      var checkboxType = $(this).attr('name');
      var sourceIndexString = $(this).parent().attr('id').toString();
      var sourceIndex = parseInt(sourceIndexString[sourceIndexString.length-1]);
      var source = localizedSources[sourceIndex];
      var dotId = "dot" + sourceIndex;
      if(checkboxType=="deleted") {
        if (source.deleted) {
          source.deleted = false;
          $(this).parent().css("text-decoration", "");
          $(this).parent().css("color", "black");
          $("#" + dotId).show();
        } else {
          source.deleted = true;
          $(this).parent().css("text-decoration", "line-through");
          $(this).parent().css("color", "gray");
          $("#" + dotId).hide();
        }
      } else if (checkboxType=="outOfFrame") {
        source.outOfFrame = !source.outOfFrame;
        if (source.outOfFrame || source.deleted) {
          $("#" + dotId).hide();
        } else {
          $("#" + dotId).show();
        }
      }
    });
  };

  // Update the object history of a dot
  var editSidebarWithAddition = function(sourceIndex) {
    var source = localizedSources[sourceIndex];
    var historyIndex = source.history.length - 1;
    var lastHistory = source.history[historyIndex];
    $("#source" + sourceIndex).append(
      '<br> <span id=history' + historyIndex + '> Relative position to video box at time ' + parseFloat(lastHistory.time).toFixed(2) + ': ' +
      '(' + parseFloat(lastHistory.x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(lastHistory.y).toFixed(NUM_DECIMAL) + ') </span>'
    );
  };

  // Edit the sidebar (i.e. change time) even if current frame has not changed
  var editSidebarWithoutAddition = function(sourceIndex, historyIndex) {
    var source = localizedSources[sourceIndex];
    var history = source.history[historyIndex];
    var newHtmlString = '<span id=history' + historyIndex + '> Relative position to video box at time ' + parseFloat(history.time).toFixed(2) + ': ' +
    '(' + parseFloat(history.x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(history.y).toFixed(NUM_DECIMAL) + ') </span>'
    $("#source" + sourceIndex + " > #history" + historyIndex).html(newHtmlString);
  };

  // Return datapoint object from relevant information
  var getDatapoint = function(relativeX, relativeY, time, dotInfo) {
    var localized_point = {
      "time" : time,
      "x" : relativeX,
      "y" : relativeY,
      "theta" : 2 * Math.PI * relativeX,
      "phi" : Math.PI * relativeY
    };
    return localized_point;
  }

  // Basic dot functionality
  $("#video-box").click(function(e) {
    e.preventDefault();
    video.pause();
    var offset = $(this).offset();
    var width = $(this).width();
    var height = $(this).height();
    var relativeX = (e.pageX - offset.left - 12)/width;
    var relativeY = (e.pageY - offset.top - 12)/height;
    var dot_count = localizedSources.length;

    var dot = '<div class="dot" style="top: ' + relativeY * 100 + '%; left: ' + relativeX * 100 + '%;" id=dot' + dot_count + '>' + (dot_count + 1) + '</div>';
    $(dot).hide().appendTo($(this).parent()).fadeIn(350);
    var output = "CSS Position: Left: " + relativeX + "%; Top: " + relativeY + '%;';
    var localized_point = getDatapoint(relativeX, relativeY, $(this)[0].currentTime);
    var object_history = {
      "history" : [ localized_point ],
      "deleted" : false,
      "outOfFrame" : false,
      "name" : null,
      "index" : dot_count
    };
    localizedSources.push(object_history);
    appendSidebar();
    $( ".dot" ).draggable({
      containment: ".outfit",
      stop: function( event, ui ) {
        var offset = $("#video-box").offset();
        var width = $("#video-box").width();
        var height = $("#video-box").height();
        var relativeX = (event.pageX - offset.left - 12)/width;
        var relativeY = (event.pageY - offset.top - 12)/height;
        $(this).css("left", relativeX * 100 + "%");
        $(this).css("top", relativeY * 100 + "%")
        var sourceIndexString = $(this).attr('id');
        var sourceIndex = parseInt(sourceIndexString[sourceIndexString.length-1]);
        var localized_point2 = getDatapoint(relativeX, relativeY, video.currentTime);
        addSourceHistoryNoRedundancy(sourceIndex, localized_point2);
      }
    });

    $("#dot" + dot_count).css("background-color", randomColor());
  });

  var updateDots = function(currentTime) {
    $.each(localizedSources, function(sourceIndex, source) {
      $.each(source.history, function(historyIndex, history) {
        if (history.time == currentTime) {
          var dot = $("#dot" + sourceIndex);
          dot.css("left", history.x * 100 + "%");
          dot.css("top", history.y * 100 + "%");
        }
      });
    });
  };

  var beginHighlightState = function() {
    highlightState = true;
    if (localizedSources.length != 0) {
      $("#highlightStatus").text(HIGHLIGHT_MODE_TEXT);
      var dot = $("#dot" + highlightIndex);
      var sourceBox = $("#source" + highlightIndex);
      dot.css("box-shadow", CSS_GLOW);
      var dotColor = dot.css("background-color");
      sourceBox.css("text-shadow", CSS_TEXT_GLOW + dotColor);
    };
  }

  // Update glowing dots and enter/exit highlightState
  var incrementHighlightState = function() {
    var dot = $("#dot" + highlightIndex);
    var sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", "");
    sourceBox.css("text-shadow", "");

    highlightIndex += 1;
    if (highlightIndex == localizedSources.length) {
      highlightIndex = 0;
      highlightState = false;
      $("#highlightStatus").text("");
      return;
    }

    dot = $("#dot" + highlightIndex);
    sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", CSS_GLOW);
    var dotColor = dot.css("background-color");
    sourceBox.css("text-shadow", CSS_TEXT_GLOW + dotColor);
  };
});


