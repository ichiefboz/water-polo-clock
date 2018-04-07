// EDIT THESE TO CHANGE DEFAULTS
var halfTimeoutLength = 30;
var timeoutLength = 60;
var periodLength = 420; // 7 minutes x 60 seconds = 420 sec
var shotLength = 30;
var game = 0;
var shot = 0;
var timeout = 0;
var timeoutMode = false;
var allowShortcuts = true;
var gameTick = null;
var shotTick = null;
var timeoutTick = null;

$(document).ready(function() {
  $("#stop").hide();
  $("#timeout-end").hide();
  $("#shot").hide();
  resetClocks();
  document.body.onkeyup = function(e){
    if(allowShortcuts) {
      e.preventDefault();
      if(e.keyCode == 32 && gameTick != null){
        resetShotClock();
      } else if(e.keyCode == 13) {
        if(gameTick == null && timeoutTick == null) {
          startClock();
        } else if (gameTick != null || timeoutTick != null) {
          stopClocks();
        }
      } else if (e.keyCode == 84) {
        if(timeoutMode) {
          endTimeout();
        } else {
          callTimeout();
        }
      } else if (e.keyCode == 72) {
        if(timeoutMode) {
          endTimeout();
        } else {
          callHalfTimeout();
        }
      }
    }
  }
  $('#updateClocksModal').on('show.bs.modal', function (e) {
    allowShortcuts = false;
    $("#inputPeriodLength").val(secondsToSplitTime(periodLength));
    $("#inputShotLength").val(secondsToSplitTime(shotLength));
    $("#inputTimeoutLength").val(secondsToSplitTime(timeoutLength));
    $("#inputPeriodValue").val(secondsToSplitTime(game));
    $("#inputShotValue").val(secondsToSplitTime(shot));
    $("#inputTimeoutValue").val(secondsToSplitTime(timeout));
  });
  
  $('#updateClocksModal').on('hidden.bs.modal', function (e) {
    allowShortcuts = true;
  });
  
  $("#clock-update-button").click(function() {
    $("#updateClocksModal").modal('hide');
    
    periodLength = splitTimeToSeconds($("#inputPeriodLength").val());
    shotLength = splitTimeToSeconds($("#inputShotLength").val());
    timeoutLength = splitTimeToSeconds($("#inputTimeoutLength").val());
    game = splitTimeToSeconds($("#inputPeriodValue").val());
    shot = splitTimeToSeconds($("#inputShotValue").val());
    timeout = splitTimeToSeconds($("#inputTimeoutValue").val());
    
    setShotClock();
    setGameClock();
  });
});

function splitTimeToSeconds(time) {
  if(time.indexOf(":") >= 0) {
    const components = time.split(":");
    return parseInt(components[0], 10) * 60 + parseInt(components[1], 10);
  } else {
    return parseInt(time);
  }
}

function secondsToSplitTime(time) {
  return Math.floor(time / 60) + ":" + zeroPad(time % 60);
}

function resetClocks() {
  game = periodLength;
  shot = shotLength;
  timeout = timeoutLength;
  setShotClock();
  setGameClock();
}

function startClock() {
  if(game == 0) {
    resetClocks();
  }
  if(shot == 0) {
    shot = shotLength;
  }
  if(timeout == 0) {
    timeout = timeoutLength;
  }
  if(timeoutMode) {
    $("#start").hide();
    $("#stop").show();
    $("#shot").hide();
    $("#timeout-end").show();
    $("#half-timeout-start").hide();
    $("#timeout-start").hide();
    $("#edit").hide();
    $("#reset").hide();
    
    startTimeoutClock();
  } else {
    $("#start").hide();
    $("#stop").show();
    $("#shot").show();
    $("#timeout-end").hide();
    $("#half-timeout-start").show();
    $("#timeout-start").show();
    $("#edit").hide();
    $("#reset").hide();
    
    startGameClock();
    startShotClock();
  }
}

function stopClocks() {
  if(timeoutMode) {
    $("#start").show();
    $("#stop").hide();
    $("#shot").hide();
    $("#timeout-end").show();
    $("#half-timeout-start").hide();
    $("#timeout-start").hide();
    $("#edit").hide();
    $("#reset").hide();
  } else {
    $("#start").show();
    $("#stop").hide();
    $("#shot").hide();
    $("#timeout-end").hide();
    $("#half-timeout-start").show();
    $("#timeout-start").show();
    $("#edit").show();
    $("#reset").show();
  }
  $("#start").text('Start '+ (timeoutMode ? 'Timeout' : 'Clock'));
  clearInterval(gameTick);
  gameTick = null;
  clearInterval(shotTick);
  shotTick = null;
  clearInterval(timeoutTick);
  timeoutTick = null;
}

function resetShotClock() {
  shot = shotLength;
  startShotClock();
}

function startGameClock() {
  clearInterval(gameTick);
  setGameClock();
  gameTick = setInterval(function() {
    game -= 1;
    setGameClock();
  }, 1000);
}

function startShotClock() {
  clearInterval(shotTick);
  setShotClock();
  shotTick = setInterval(function() {
    shot -= 1;
    setShotClock();
  }, 1000);
}

function startTimeoutClock() {
  clearInterval(timeoutTick);
  setTimeoutClock();
  setGameClock();
  timeoutTick = setInterval(function() {
    timeout -= 1;
    setTimeoutClock();
    setGameClock();
  }, 1000);
}

function setShotClock() {
  $("#shot-clock").removeClass("crit");
  $("#shot-clock").text(replaceDotsInZeroes(shot));
  $("#clock-head").text('SHOT');
  if(shot <= 10) {
    $("#shot-clock").addClass("crit");
  }
  if(shot <= 0) {
    stopClocks();
  }
}

function setTimeoutClock() {
  $("#shot-clock").removeClass("crit");
  $("#shot-clock").text(replaceDotsInZeroes(timeout));
  if(timeout <= 10) {
    $("#shot-clock").addClass("crit");
  }
  if(timeout <= 0) {
    timeoutMode = false;
    stopClocks();
  }
}

function setGameClock() {
  $("#game-clock").removeClass("crit");
  if(timeoutMode && timeout % 2 == 1) {
    $("#game-clock").text('* '+replaceDotsInZeroes(Math.floor(game / 60)+":"+zeroPad(game % 60))+' *');
  } else {
    $("#game-clock").text(replaceDotsInZeroes(Math.floor(game / 60)+":"+zeroPad(game % 60)));
  }
  if(game <= 30) {
    $("#game-clock").addClass("crit");
  }
  if(game <= 0) {
    stopClocks();
  }
}

function zeroPad(number) {
  return (number >= 10) ? number : "0"+number;
}

function replaceDotsInZeroes(input) {
  var str = input.toString();
  return str.replace(/0/g, "O");
}

function callTimeout() {
  stopClocks();
  $("#start").show();
  $("#stop").hide();
  $("#shot").hide();
  $("#timeout-end").show();
  $("#half-timeout-start").hide();
  $("#timeout-start").hide();
  $("#edit").hide();
  $("#reset").hide();
  $("#clock-head").text('TIMEOUT');
  $("#start").text('Start Timeout');
  timeout = timeoutLength;
  setTimeoutClock();
  timeoutMode = true;
}

function callHalfTimeout() {
  stopClocks();
  $("#start").show();
  $("#stop").hide();
  $("#shot").hide();
  $("#timeout-end").show();
  $("#half-timeout-start").hide();
  $("#timeout-start").hide();
  $("#edit").hide();
  $("#reset").hide();
  $("#clock-head").text('TIMEOUT');
  $("#start").text('Start Timeout');
  timeout = halfTimeoutLength;
  setTimeoutClock();
  timeoutMode = true;
}

function endTimeout() {
  stopClocks();
  $("#start").text('Start Clock');
  $("#start").show();
  $("#stop").hide();
  $("#shot").hide();
  $("#timeout-end").hide();
  $("#half-timeout-start").show();
  $("#timeout-start").show();
  $("#edit").show();
  $("#reset").show();
  setShotClock();
  timeoutMode = false;
  setGameClock();
}

