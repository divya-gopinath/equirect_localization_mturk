var localizedSources = [];
var lastTime = 1;

$( document ).ready(function() {
  var onTimeUpdate = function() {
    var time = $("#video-box")[0].currentTime;
    var roundUpLast = Math.ceil(lastTime);
    var roundDownNow = Math.floor(time);
    if ((roundUpLast == roundDownNow) && (roundUpLast % PAUSE_THRESHOLD== 0)) {
      $("#video-box")[0].pause();
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
      console.log(checkboxType);
      console.log(source);
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

  var editSidebarWithoutAddition = function(sourceIndex, historyIndex) {
    var source = localizedSources[sourceIndex];
    var history = source.history[historyIndex];
    var newHtmlString = '<span id=history' + historyIndex + '> Relative position to video box at time ' + parseFloat(history.time).toFixed(2) + ': ' +
    '(' + parseFloat(history.x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(history.y).toFixed(NUM_DECIMAL) + ') </span>'
    $("#source" + sourceIndex + " > #history" + historyIndex).html(newHtmlString);
  };


  var getDatapoint = function(relativeX, relativeY, time) {
    var localized_point = {
      "time" : time,
      "x" : relativeX,
      "y" : relativeY,
      "theta" : 2 * Math.PI * relativeX,
      "phi" : Math.PI * relativeY
    };
    return localized_point;
  }

  $("#video-box").click(function(e) {
    e.preventDefault();
    $("#video-box")[0].pause();
    var offset = $(this).offset();
    var width = $(this).width();
    var height = $(this).height();
    var relativeX = (e.pageX - offset.left)/width;
    var relativeY = (e.pageY - offset.top)/height;
    var dot_count = localizedSources.length;

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

    var top_offset = $(this).offset().top - $(window).scrollTop();
    var left_offset = $(this).offset().left - $(window).scrollLeft();

    var top_px = Math.round( (e.clientY - top_offset - 12) );
    var left_px = Math.round( (e.clientX - left_offset - 12) );

    var top_perc = top_px / $(this).height() * 100;
    var left_perc = left_px / $(this).width() * 100;
    var dot = '<div class="dot" style="top: ' + top_perc + '%; left: ' + left_perc + '%;" id=dot' + dot_count + '>' + (dot_count + 1) + '</div>';
    $(dot).hide().appendTo($(this).parent()).fadeIn(350);
    $( ".dot" ).draggable({
      containment: ".outfit",
      stop: function( event, ui ) {
        var new_left_perc = parseInt($(this).css("left")) / ($(".outfit").width() / 100) + "%";
        var new_top_perc = parseInt($(this).css("top")) / ($(".outfit").height() / 100) + "%";
        var output = 'Top: ' + parseInt(new_top_perc) + '%, Left: ' + parseInt(new_left_perc) + '%';
        $(this).css("left", parseInt($(this).css("left")) / ($(".outfit").width() / 100) + "%");
        $(this).css("top", parseInt($(this).css("top")) / ($(".outfit").height() / 100) + "%");
        var offset = $("#video-box").offset();
        var width = $("#video-box").width();
        var height = $("#video-box").height();
        var relativeX = (event.pageX - offset.left)/width;
        var relativeY = (event.pageY - offset.top)/height;
        var sourceIndexString = $(this).attr('id');
        var sourceIndex = parseInt(sourceIndexString[sourceIndexString.length-1]);
        var localized_point2 = getDatapoint(relativeX, relativeY, $("#video-box")[0].currentTime);
        addSourceHistoryNoRedundancy(sourceIndex, localized_point2);
        $('.output').html('CSS Position: ' + output);
      }
    });

    $("#dot" + dot_count).css("background-color", randomColor());

    // console.log("Left: " + left_perc + "%; Top: " + top_perc + '%;');
    $('.output').html("CSS Position: Left: " + parseInt(left_perc) + "%; Top: " + parseInt(top_perc) + '%;');
  });
});


