var localizedSources = [];
var lastTime = 1;
var highlightState = false;
var highlightIndex = 0;

$( document ).ready(function() {
  var video = $("#video-box")[0];
  $("#rescrubBtn").hide();
  $("#rescrubBtn").click(function(e){
    var newTime = video.currentTime - PAUSE_THRESHOLD + 0.0001;
    video.currentTime = newTime;
    lastTime = newTime;
    video.play();
  });

  $( "#finishBtn" ).click(function() {
    $("#localizedSourcesForm").val(JSON.stringify(localizedSources));
    if (validation) {
      $.get( "/validate", { videoURL : videoURL, localizedSources : JSON.stringify(localizedSources)} )
      .done(function( data ) {
        alert( "Data Loaded: " + data );
      })
    };
    //$( "#submit_form" ).submit();
  });

  // Set up keycodes for scrubbing left/right
  $('html').keydown(function(e){
     if (e.keyCode == LEFT_ARROW_KEY && !highlightState) {
       var nearestKeyframe = Math.floor((video.currentTime + 0.01)/PAUSE_THRESHOLD)*PAUSE_THRESHOLD;
       video.currentTime = nearestKeyframe;
       updateDots(nearestKeyframe);
       if (highlightState) { video.play(); }
     } else if (e.keyCode == RIGHT_ARROW_KEY && !highlightState) {
       var nearestKeyframe = Math.ceil((video.currentTime+ 0.01)/PAUSE_THRESHOLD)*PAUSE_THRESHOLD;
       video.currentTime = nearestKeyframe;
       updateDots(nearestKeyframe);
     } else if (e.keyCode == DOWN_ARROW_KEY && highlightState) {
       e.preventDefault();
       incrementHighlightState();
     } else if (e.keyCode == UP_ARROW_KEY && highlightState) {
       e.preventDefault();
       decrementHighlightState();
     } else if (e.keyCode == SPACE_KEY && !highlightState && e.target.id != "video-box") {
       e.preventDefault();
       if (video.paused) { video.play(); }
       else { video.pause(); }
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
      '<input type="checkbox" name="outOfFrame" class="sourceOption" id=' + 'outOfFrame' + sourceIndex + '> Object not making sound  ' +
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
      var dot = $("#" + dotId);
      if(checkboxType=="deleted") {
        if (source.deleted) {
          source.deleted = false;
          $(this).parent().css("text-decoration", "");
          $(this).parent().css("color", "black");
          $(this).parent().appendTo("#sidebar");
          dot.show();
        } else {
          source.deleted = true;
          $(this).parent().css("text-decoration", "line-through");
          $(this).parent().css("color", "gray");
          $(this).parent().appendTo("#sidebarInactive");
          dot.hide();
        }
      } else if (checkboxType=="outOfFrame") {
        var updated = false;
        $.each(source.history, function(historyIndex, history) {
          if (history.time == video.currentTime) {
            history.outOfFrame = !history.outOfFrame;
            updated = true;
            if (history.outOfFrame) {
              dot.hide();
              $("#source" + sourceIndex).appendTo("#sidebarInactive");
            }
            else {
              dot.show();
              $("#source" + sourceIndex).appendTo("#sidebar");
            };
            editSidebarWithoutAddition(sourceIndex, historyIndex);
            console.log("updated localized data again");
          }
        });
        if (!updated) {
          addLastDatapointAgain(sourceIndex, video.currentTime, true);
          editSidebarWithAddition(sourceIndex);
          $("#" + dotId).hide();
          $("#source" + sourceIndex).appendTo("#sidebarInactive");
        }
      }
    });
  };

  // Update the object history of a dot
  var editSidebarWithAddition = function(sourceIndex) {
    var source = localizedSources[sourceIndex];
    var historyIndex = source.history.length - 1;
    var lastHistory = source.history[historyIndex];
    if (lastHistory.outOfFrame) {
        $("#source" + sourceIndex).append(
          '<br> <span id=history' + historyIndex + '> Source went out of frame at time ' + parseFloat(lastHistory.time).toFixed(2) + '</span>'
        );
    } else {
      $("#source" + sourceIndex).append(
        '<br> <span id=history' + historyIndex + '> Relative position to video box at time ' + parseFloat(lastHistory.time).toFixed(2) + ': ' +
        '(' + parseFloat(lastHistory.x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(lastHistory.y).toFixed(NUM_DECIMAL) + ') </span>'
      );
    }
  };

  // Edit the sidebar (i.e. change time) even if current frame has not changed
  var editSidebarWithoutAddition = function(sourceIndex, historyIndex) {
    var source = localizedSources[sourceIndex];
    var history = source.history[historyIndex];
    var newHtmlString;
    if (history.outOfFrame) {
      newHtmlString = '<span id=history' + historyIndex + '> Source went out of frame at time ' + parseFloat(history.time).toFixed(2) + '</span>';
    } else {
      newHtmlString = '<span id=history' + historyIndex + '> Relative position to video box at time ' + parseFloat(history.time).toFixed(2) + ': ' +
      '(' + parseFloat(history.x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(history.y).toFixed(NUM_DECIMAL) + ') </span>';
    };
    $("#source" + sourceIndex + " > #history" + historyIndex).html(newHtmlString);
  };

  var addLastDatapointAgain = function(sourceIndex, time, outOfFrame) {
    var dot = $("#dot" + sourceIndex);
    var relativeX100String = dot[0].style.left;
    var relativeY100String = dot[0].style.top;
    var relativeX100 = parseInt(relativeX100String.substring(0, relativeX100String.length -1));
    var relativeY100 = parseInt(relativeY100String.substring(0, relativeY100String.length -1));
    localizedSources[sourceIndex].history.push(getDatapoint(relativeX100/100, relativeY100/100, time, outOfFrame));
  };

  // Return datapoint object from relevant information
  var getDatapoint = function(relativeX, relativeY, time, outOfFrame) {
    var localized_point = {
      "time" : time,
      "x" : relativeX,
      "y" : relativeY,
      "theta" : 2 * Math.PI * relativeX,
      "phi" : Math.PI * relativeY,
      "outOfFrame" : outOfFrame,
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
    var localized_point = getDatapoint(relativeX, relativeY, $(this)[0].currentTime, false);
    var object_history = {
      "history" : [ localized_point ],
      "deleted" : false,
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
        var localized_point2 = getDatapoint(relativeX, relativeY, video.currentTime, false);
        addSourceHistoryNoRedundancy(sourceIndex, localized_point2);
      }
    });

    $("#dot" + dot_count).css("background-color", randomColor());
  });

  var updateDots = function(currentTime) {
    $.each(localizedSources, function(sourceIndex, source) {
      var found = false;
      var dot = $("#dot" + sourceIndex);
      if (source.history[0].time > currentTime) { dot.hide(); }
      $.each(source.history, function(historyIndex, history) {
        if (history.time == currentTime) {
          dot.css("left", history.x * 100 + "%");
          dot.css("top", history.y * 100 + "%");
          var outOfFrame = $("#outOfFrame" + sourceIndex)
          if (history.outOfFrame) {
            outOfFrame.prop("checked", true);
            dot.hide();
          } else {
            outOfFrame.prop("checked", false);
            dot.show();
          }
          found = true;
          return false;
        }
      });
    });
  };

  var beginHighlightState = function() {
    if (localizedSources.length == 0) { return; }
    highlightState = true;
    $("#video-box").removeAttr('controls');
    $("#rescrubBtn").show();
    $("#highlightStatus").text(HIGHLIGHT_MODE_TEXT);
    var dot = $("#dot" + highlightIndex);
    var sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", CSS_GLOW);
    var dotColor = dot.css("background-color");
    sourceBox.css("text-shadow", CSS_TEXT_GLOW + dotColor);
  }

  // Check if dot has moved during highlight state and added text if not
  var checkIfMovedHighlightState = function(sourceIndex, time) {
    var foundFlag = false;
    $.each(localizedSources[sourceIndex].history, function(historyIndex, history) {
      if (history.time == time) {
        foundFlag = true;
      }
    });
    // Otherwise, add datapoint
    if (foundFlag) { return; }
    addLastDatapointAgain(sourceIndex, time, false);
    editSidebarWithAddition(sourceIndex);
  };

  // Find next sourceIndex that isn't out of frame at given time
  var nextInFrameSourceIndex = function(originalSourceIndex)  {
    var nextIndex = originalSourceIndex;
    $.each(localizedSources, function(sourceIndex, source) {
      if (sourceIndex > originalSourceIndex && !$("#outOfFrame" + sourceIndex).prop("checked") && !source.deleted) {
        nextIndex = sourceIndex;
        return false;
      };
    });
    nextIndex = nextIndex == originalSourceIndex ? localizedSources.length : nextIndex;
    return nextIndex;
  }

  // Find previous sourceIndex that isn't out of frame at given time
  var previousInFrameSourceIndex = function(originalSourceIndex)  {
    var nextIndex = originalSourceIndex;
    $.each(localizedSources, function(sourceIndex, source) {
      if (sourceIndex < originalSourceIndex && !$("#outOfFrame" + sourceIndex).prop("checked") && !source.deleted) {
        nextIndex = sourceIndex;
      };
    });
    return nextIndex;
  }

  // Update glowing dots and enter/exit highlightState
  var incrementHighlightState = function() {
    var dot = $("#dot" + highlightIndex);
    var sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", "");
    sourceBox.css("text-shadow", "");
    checkIfMovedHighlightState(highlightIndex, video.currentTime);
    highlightIndex = nextInFrameSourceIndex(highlightIndex);
    if (highlightIndex == localizedSources.length) {
      highlightIndex = 0;
      highlightState = false;
      $("#highlightStatus").text("");
      $("#rescrubBtn").hide();
      $("#video-box").attr('controls', 'true');
      return;
    }

    dot = $("#dot" + highlightIndex);
    sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", CSS_GLOW);
    var dotColor = dot.css("background-color");
    sourceBox.css("text-shadow", CSS_TEXT_GLOW + dotColor);
  };

  var decrementHighlightState = function() {
    if (highlightIndex == 0) { return; }
    var dot = $("#dot" + highlightIndex);
    var sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", "");
    sourceBox.css("text-shadow", "");
    highlightIndex = previousInFrameSourceIndex(highlightIndex);
    dot = $("#dot" + highlightIndex);
    sourceBox = $("#source" + highlightIndex);
    dot.css("box-shadow", CSS_GLOW);
    var dotColor = dot.css("background-color");
    sourceBox.css("text-shadow", CSS_TEXT_GLOW + dotColor);
  };
});


