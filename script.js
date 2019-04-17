var localizedSources = [];

$( document ).ready(function() {
  // Manage random colors of dots
  console.log(randomColor());

  // Add new dot to sidebar
  var appendSidebar = function() {
    var sourceIndex = localizedSources.length - 1;
    var source = localizedSources[sourceIndex];
    $("#sidebar").append(
      '<br> <div id=' + 'source' + sourceIndex + ' class="sourceBox"> <strong> Source ' + localizedSources.length + ': </strong>' +
      '<input type="checkbox" name="outOfFrame"> Object now out of frame  ' +
      '<input type="checkbox" name="deleted">Delete source' +
      '<br>' + '<span id="history0"> Relative position to video box at time ' + parseFloat(source.history[0].time).toFixed(NUM_DECIMAL) + ': ' +
      '(' + parseFloat(source.history[0].x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(source.history[0].y).toFixed(NUM_DECIMAL) + ') </span> </div>'
    );
    $(':checkbox').change(function() {
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
        } else {
          source.deleted = true;
          $(this).parent().css("text-decoration", "line-through");
          $(this).parent().css("color", "gray");
        }
      } else if (checkboxType=="outOfFrame") {
        source.outOfFrame = !source.outOfFrame;
      }
      $("#" + dotId).toggle();
    });
  };

  // Update the object history of a dot
  var editSidebar = function(sourceIndex) {
    var source = localizedSources[sourceIndex];
    var historyIndex = source.history.length - 1;
    var lastHistory = source.history[historyIndex];
    $("#source" + sourceIndex).append(
      '<br> <span id=history' + historyIndex + '> Relative position to video box at time ' + parseFloat(lastHistory.time).toFixed(2) + ': ' +
      '(' + parseFloat(lastHistory.x).toFixed(NUM_DECIMAL) + ', ' + parseFloat(lastHistory.y).toFixed(NUM_DECIMAL) + ') </span>'
    );
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
      "index" : dot_count
    };
    console.log("new dot, index " + dot_count);
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
        localizedSources[sourceIndex].history.push(localized_point2);
        editSidebar(sourceIndex);

        $('.output').html('CSS Position: ' + output);
      }
    });

    $("#dot" + dot_count).css("background-color", randomColor());

    // console.log("Left: " + left_perc + "%; Top: " + top_perc + '%;');
    $('.output').html("CSS Position: Left: " + parseInt(left_perc) + "%; Top: " + parseInt(top_perc) + '%;');
  });
});


