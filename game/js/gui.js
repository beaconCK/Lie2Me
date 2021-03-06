var divPuck, oTheQuestion, divTheQuestion, divQsLeft, divPuckStartArea, txtParticipantId;
var instructionsvideo;
var theCanvas, theCanvasCtx;
var puckhalfsize = {x: 50, y: 50};
var puckradiussquared = puckhalfsize.x * puckhalfsize.x;
var puckpos = {x: 300, y: 300, inStartingArea: true};
var mousepos = {x: 300, y:300, downOnPuck:false};
var isFullscreen = false;
var screenSize = {x:0, y:0, puckMaxX:0, puckMaxY:0};
var currentScreen = -1, currentScreenShownTime = 0;

var divDragTargetLeft, divDragTargetRight;
var dragTargetLeftBoundingRect=0, dragTargetRightBoundingRect=0;
var isWebVersion, isScienceGalleryVersion;

function getQueryStringVariable(variable) {
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
   }
}

function handleMouseMove(x,y) {
  if (lastInteractionTime<now)
    lastInteractionTime = now;

  if (GAME.state==STATE_PLAYING || GAME.state==STATE_TOUCHSCREEN_TEST || GAME.state==STATE_REVEALING_QUESTION) {
    mousepos.x = x;
    mousepos.y = y;
    if (mousepos.downOnPuck) {
      puckpos.x = x;
      puckpos.y = y;
      puckpos.lastPlayerMoveTime = now;
      redrawPuck(); 
    }
  }      
}

function handleMouseDown(x,y) {
  isFullscreen = (window.innerHeight == screen.height);
  if (!isFullscreen)
    goFullScreen();

  if (lastInteractionTime<now)
    lastInteractionTime = now;

  if (GAME.state==STATE_PLAYING || GAME.state==STATE_TOUCHSCREEN_TEST || GAME.state==STATE_REVEALING_QUESTION) {
    mousepos.x = x;
    mousepos.y = y;
    var dx = x-puckpos.x;
    var dy = y-puckpos.y;
    var distsquared = dx*dx + dy*dy;
    mousepos.downOnPuck = (distsquared<=puckradiussquared);
    if (mousepos.downOnPuck) {
      puckpos.x = x;
      puckpos.y = y;
      puckpos.lastPlayerMoveTime = now;
      redrawPuck(); 
    }
  }
  else if (GAME.state==STATE_FIRST_START) {
    setGameState(STATE_IDLE);
  }
  else if (GAME.state==STATE_IDLE && currentScreenShownTime+500<now) {
    setGameState(STATE_PRE_GAME);
  }
}

function setup() {
      divPuck = document.getElementById("thePuck");
      oTheQuestion = document.getElementById("theQuestion");
      divTheQuestion = document.getElementById("divTheQuestion");
      divQsLeft = document.getElementById("divQsLeft");
      theCanvas = document.getElementById("theCanvas");
      theCanvasCtx = theCanvas.getContext('2d');
      divPuckStartArea = document.getElementById("PuckStartArea");
      txtParticipantId = document.getElementById("txtParticipantId");
      instructionsvideo = document.getElementById("instructionsvideo");

      isWebVersion = (getQueryStringVariable("version")=="web");
      isScienceGalleryVersion = !isWebVersion;

      if (isWebVersion)
        document.getElementById("sciencegallerydemographics").style.display = "none";
      if (isScienceGalleryVersion)
        document.getElementById("webdemographics").style.display = "none";

      txtParticipantId.ontouchstart = txtParticipantId.onmousedown = function(e) {
        txtParticipantId.focus();
      };

  $('#screen3').on('click', 'input', function() {
    if ($(this).attr('id')!="txtParticipantId")
      $('#jQKeyboardContainer').remove();
  });

  setInterval(gameLoop, 20);

  document.onmousedown = function(e) {
    e.preventDefault();
    handleMouseDown(e.clientX, e.clientY);
  };

  document.ontouchstart = function(e) {
    e.preventDefault();
    handleMouseDown(e.touches[0].clientX, e.touches[0].clientY);
  };

  document.onmousemove = function(e) {
    handleMouseMove(e.clientX, e.clientY);
  };

  document.ontouchmove = function(e) {
    handleMouseMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  document.onmouseup = function(e) {
    lastInteractionTime = now;
    mousepos.downOnPuck = false;
  };

  document.ontouchend = function(e) {
    lastInteractionTime = now;
    mousepos.downOnPuck = false;
  };

  setGameState(STATE_FIRST_START);
}

function showScreen(i) {
  if (i==2 && isScienceGalleryVersion) {
    // (skip screen 2 if Science Gallery version)
    onClickedInfoSheetContinue();
    return;
  }

  lastInteractionTime = now;
  for (var s=0; s<=9; s++) {
    if (s==i) {
      var elem = document.getElementById("screen"+s);
      elem.style.display = "";
      if (s>=2 && s!=5 && s!=6 && s!=8) {
        elem.style.left = "50px";
        elem.style.top = "50px";
        elem.style.width = (screenSize.x-100)+"px";
        elem.style.height = (screenSize.y-100)+"px";
      }
    }
    else
      document.getElementById("screen"+s).style.display = "none";
  }
  currentScreen = i;
  currentScreenShownTime = now;
  if (i==5 || i==6 || i==8)
    document.getElementById("pageborder").style.display = "none";
  else {
    document.getElementById("pageborder").style.display = "";
    var oImg = document.getElementById("imgSmallLogo");
    if (oImg!=null) {
      if (i<2)
        oImg.style.display = "none";
      else
        oImg.style.display = "";
    }
  }

  if (i==5) {
    instructionsvideo.currentTime = 0;
    instructionsvideo.play();
  }
  
  if (i==6) {
    divPuck.style.display = "";
    //if (i==5)
      //resetPuckPos();
  }
  else
    divPuck.style.display = "none";

  if (i==8)
    theCanvas.style.display = "";
  else
    theCanvas.style.display = "none";

  if (i==2)
      lastInteractionTime = now + 60000; // give this screen extra time before timing out
}

function redrawPuck() {
    now = Date.now();
    divPuck.style.left = (puckpos.x-puckhalfsize.x)+"px";
    divPuck.style.top = (puckpos.y-puckhalfsize.y)+"px";  
    data.push({x:puckpos.x, y:puckpos.y, t:now-startTime});
    var wasInStartingArea = puckpos.inStartingArea;
    puckpos.inStartingArea = (puckpos.y>=screenSize.y-150);

    if (!checkPuckInDragTargets() && wasInStartingArea!=puckpos.inStartingArea) {
        if (puckpos.inStartingArea && GAME.state==STATE_TOUCHSCREEN_TEST)
          oTheQuestion.innerHTML = "";
        else if (GAME.state==STATE_TOUCHSCREEN_TEST)
          oTheQuestion.innerHTML = "Touchscreen Test<br>Please move the red button into a target.";
        else
          oTheQuestion.innerHTML = revealedQuestion;
    }
}

function resetPuckPos() {
  data = [];
  startTime = now;
  puckpos.x = screenSize.x/2 - puckhalfsize.x;
  puckpos.y = screenSize.y - puckhalfsize.y - 20;
  puckpos.inStartingArea = true;
  mousepos.downOnPuck = false;
  redrawPuck();
  oTheQuestion.innerHTML = "";
  //puckpos.lastPlayerMoveTime = now + 3000; // 3 secs before automove 
}

function goFullScreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }

    setTimeout(checkIfFullscreen, 500);
}

function checkIfFullscreen() { 
  isFullscreen = (window.innerHeight == screen.height);
  if (isFullscreen) {
    screenSize.x = window.innerWidth;
    screenSize.y = window.innerHeight;
    screenSize.puckMaxX = screenSize.x-puckhalfsize.x;
    screenSize.puckMaxY = screenSize.y-puckhalfsize.y;
    theCanvas.width = screenSize.x;
    theCanvas.height = screenSize.y;
    redrawPageBorder();
  }
}

function onClickedExit() { // (from any screen)
  if (currentScreenShownTime+2000>=now) // so a single touch can't click the previous screen's continue button as well as this one
    return;

  if (currentScreen==9) {
    // send user-my-data decision Y/N to server
    var usemydata = $("input[name=rIncludeData]:checked").val();
    doAjaxRequest("cmd=usemydata&PK="+myData.PK,usemydata,function(responseTxt) {
    });
  }
  setGameState(STATE_IDLE);
}

function onClickedInfoSheetContinue() { // (screen 2)
  showScreen(3);
  txtParticipantId.value = "";
  $("input[name=rAge][value='36-45']").prop("checked",true);
  $("input[name=rGender][value='X']").prop("checked",true);
  $("input[name=rHandedness][value='R']").prop("checked",true);
  $("input[name=rPlayedBefore][value='N']").prop("checked",true);
  $("input[name=rShareData][value='Y']").prop("checked",true);
}

function onClickedDemographicsContinue() { // (screen 3)
  if (currentScreenShownTime+2000>=now) // so a single touch can't click the previous screen's continue button as well as this one
    return;

  myData = {};
  myData.buildversion = BUILD_VERSION;
  myData.screenSizeX = screenSize.x;
  myData.screenSizeY = screenSize.y;
  myData.demographics = {};
  if (isScienceGalleryVersion)
    myData.demographics.pid = txtParticipantId.value;
  if (isWebVersion) {
    myData.demographics.age = $("input[name=rAge]:checked").val();
    myData.demographics.gender = $("input[name=rGender]:checked").val();
    myData.demographics.handedness = $("input[name=rHandedness]:checked").val();
    myData.demographics.playedBefore = $("input[name=rPlayedBefore]:checked").val();
    myData.demographics.shareData = $("input[name=rShareData]:checked").val();
  }

  //showScreen(4); // skip the GSR sensor test for now!
  onClickedGSRContinue();
}

function onClickedGSRContinue() {
    setGameState(STATE_TOUCHSCREEN_TEST);
}

function onClickedPostGameSurveyContinue() { // (screen 7)
  if (currentScreenShownTime+2000>=now) // so a single touch can't click the previous screen's continue button as well as this one
    return;

  // send post-game survey data to server
  doAjaxRequest("cmd=postgamesurvey&PK="+myData.PK,JSON.stringify(postSurveyData),function(responseTxt) {
  });

  showScreen(8);
  displayAverageMovements(); // in questions.js
}

function onClickedAverageMovementsContinue() { // (screen 8)
  if (currentScreenShownTime+2000>=now) // so a single touch can't click the previous screen's continue button as well as this one
    return;
  showScreen(9);
  $("input[name=rIncludeData][value='Y']").prop("checked",true);
}

function registerDragTargets(divLeft, divRight) {
  divDragTargetLeft = divLeft;
  divDragTargetRight = divRight;

  dragTargetLeftBoundingRect = divLeft.getBoundingClientRect();
  dragTargetLeftBoundingRect.rightEdge = dragTargetLeftBoundingRect.x + dragTargetLeftBoundingRect.width;
  dragTargetLeftBoundingRect.bottomEdge = dragTargetLeftBoundingRect.y + dragTargetLeftBoundingRect.height;
  if (typeof divRight!="undefined") {
    dragTargetRightBoundingRect = divRight.getBoundingClientRect();
    dragTargetRightBoundingRect.bottomEdge = dragTargetRightBoundingRect.y + dragTargetRightBoundingRect.height;
  }
  else
    dragTargetRightBoundingRect = 0;
}

function checkPuckInDragTargets() {
  if (typeof divDragTargetLeft!="undefined" 
    && puckpos.x<=dragTargetLeftBoundingRect.rightEdge 
    && puckpos.y<=dragTargetLeftBoundingRect.bottomEdge) {

      // Left target hit
      if (GAME.state==STATE_PLAYING) {
        recordQuestionResult(true);

      }
      else if (GAME.state==STATE_TOUCHSCREEN_TEST) {
        //showFullscreenMessage("Ok. The questions will now commence..",4000,startQuestions); // startQuestions() is in questions.js
        //setGameState(STATE_REVEALING_QUESTION);
        startQuestions();
      }

      return true;

  }
  else if (typeof divDragTargetRight!="undefined" 
    && puckpos.x>=dragTargetRightBoundingRect.x 
    && puckpos.y<=dragTargetRightBoundingRect.bottomEdge) {

      // Right target hit
      if (GAME.state==STATE_PLAYING) {
        recordQuestionResult(false);

      }
      else if (GAME.state==STATE_TOUCHSCREEN_TEST) {
        //showFullscreenMessage("Ok. The questions will now commence..",4000,startQuestions); // startQuestions() is in questions.js
        //setGameState(STATE_REVEALING_QUESTION);
        startQuestions();
      }

      return true;

  }

  return false;
}

function showFullscreenMessage(msg,time,callback) {
  showScreen(-1); // hide all
  var div = document.getElementById("timedFullscreenMessage");
  div.innerHTML = "<h2>Lie2Me<br>"+msg+"</h2>";
  div.style.display = "";

  setTimeout(function() {
    div.style.display = "none";
    callback();

  }, time);
}

// soft-keyboard
$(function(){
    var keyboard = {
        'layout': [
            // alphanumeric keyboard type
            // text displayed on keyboard button, keyboard value, keycode, column span, new row
            [
                [
                    ['`', '`', 192, 0, true], ['1', '1', 49, 0, false], ['2', '2', 50, 0, false], ['3', '3', 51, 0, false], ['4', '4', 52, 0, false], ['5', '5', 53, 0, false], ['6', '6', 54, 0, false], 
                    ['7', '7', 55, 0, false], ['8', '8', 56, 0, false], ['9', '9', 57, 0, false], ['0', '0', 48, 0, false], ['-', '-', 189, 0, false], ['=', '=', 187, 0, false],
                    ['q', 'q', 81, 0, true], ['w', 'w', 87, 0, false], ['e', 'e', 69, 0, false], ['r', 'r', 82, 0, false], ['t', 't', 84, 0, false], ['y', 'y', 89, 0, false], ['u', 'u', 85, 0, false], 
                    ['i', 'i', 73, 0, false], ['o', 'o', 79, 0, false], ['p', 'p', 80, 0, false], ['[', '[', 219, 0, false], [']', ']', 221, 0, false], ['&#92;', '\\', 220, 0, false],
                    ['a', 'a', 65, 0, true], ['s', 's', 83, 0, false], ['d', 'd', 68, 0, false], ['f', 'f', 70, 0, false], ['g', 'g', 71, 0, false], ['h', 'h', 72, 0, false], ['j', 'j', 74, 0, false], 
                    ['k', 'k', 75, 0, false], ['l', 'l', 76, 0, false], [';', ';', 186, 0, false], ['&#39;', '\'', 222, 0, false], ['Enter', '13', 13, 3, false],
                    ['Shift', '16', 16, 2, true], ['z', 'z', 90, 0, false], ['x', 'x', 88, 0, false], ['c', 'c', 67, 0, false], ['v', 'v', 86, 0, false], ['b', 'b', 66, 0, false], ['n', 'n', 78, 0, false], 
                    ['m', 'm', 77, 0, false], [',', ',', 188, 0, false], ['.', '.', 190, 0, false], ['/', '/', 191, 0, false], ['Shift', '16', 16, 2, false],
                    ['Bksp', '8', 8, 3, true], ['Space', '32', 32, 12, false], ['Clear', '46', 46, 3, false], ['Cancel', '27', 27, 3, false]
                ]
            ]
        ]
    }
    $('input.jQKeyboard').initKeypad({'keyboardLayout': keyboard});
});

function redrawPageBorder() {
  var html = "";
  html += "<img src='border-1.png' style='width:50px; height:50px; position:absolute; left:0px; top:0px;'>"; 
  html += "<img src='border-2.png' style='width:"+(screenSize.x-100)+"px; height:50px; position:absolute; left:50px; top:0px;'>";
  html += "<img src='border-3.png' style='width:50px; height:50px; position:absolute; left:"+(screenSize.x-50)+"px; top:0px;'>";

  html += "<img src='border-4.png' style='width:50px; height:"+(screenSize.y-100)+"px; position:absolute; left:0px; top:50px;'>";
  html += "<img src='border-5.png' style='width:50px; height:"+(screenSize.y-100)+"px; position:absolute; left:"+(screenSize.x-50)+"px; top:50px;'>";

  html += "<img src='border-6.png' style='width:50px; height:50px; position:absolute; left:0px; top:"+(screenSize.y-50)+"px;'>";
  html += "<img src='border-7.png' style='width:"+(screenSize.x-100)+"px; height:50px; position:absolute; left:50px; top:"+(screenSize.y-50)+"px;'>";
  html += "<img src='border-8.png' style='width:50px; height:50px; position:absolute; left:"+(screenSize.x-50)+"px; top:"+(screenSize.y-50)+"px;'>";

  html += "<img id='imgSmallLogo' src='lie2me-logo-small.jpg' style='position:absolute; left:"+(screenSize.x-240)+"px; top:5px;'>";

  document.getElementById("pageborder").innerHTML = html;

  var oImg = document.getElementById("imgSmallLogo");
  if (oImg!=null) {
    if (currentScreen<2)
      oImg.style.display = "none";
    else
      oImg.style.display = "";
  }
}