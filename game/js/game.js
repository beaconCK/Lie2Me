
var STATE_FIRST_START = 0;
var STATE_IDLE = 1;
var STATE_PRE_GAME = 2;
var STATE_TOUCHSCREEN_TEST = 3;
var STATE_PLAYING = 4;
var STATE_REVEALING_QUESTION = 5;
var STATE_POST_GAME = 6;

var BUILD_VERSION = 1;

var INTERACTION_TIME_OUT_PERIOD = 25000; // ms
var lastInteractionTime = 0;

var GAME = {state:-1};
var now = Date.now();

// stuff for sending to database
var myData = {}; // contains: .buildversion, .myQuestions, .leftIsTrue (=0/1), .demographics
var data = []; // array of objects, each with x,y,t  (=x,y,time of mouse positions)
var myQuestions = []; // array of objects (in order I answered them), each with q,a,l,data   (=question-text, answer(1 or 0), lie(1 or 0), data as above)
//

function setGameState(state) {
	lastInteractionTime = now;

	if (GAME.state!=state) {
		$('#jQKeyboardContainer').remove();

		var prevState = GAME.state;
		GAME.state = state;
		divTheQuestion.style.display = "none";

		if (state==STATE_FIRST_START)
			showScreen(0);
		else if (state==STATE_IDLE)
			showScreen(1);
		else if (state==STATE_PRE_GAME)
			showScreen(2);
		else if (state==STATE_TOUCHSCREEN_TEST) {
			showScreen(5);
			//divTheQuestion.style.display = "";
			//registerDragTargets(document.getElementById("dragTargetTestLeft"), document.getElementById("dragTargetTestRight"));
			//resetPuckPos(); // in gui.js
			// this screen now shows a video demo
		}
		else if (state==STATE_PLAYING) {
			showScreen(6);
			if (prevState==STATE_TOUCHSCREEN_TEST) {
				registerDragTargets(document.getElementById("dragTargetRealLeft"), document.getElementById("dragTargetRealRight"));
				oTheQuestion.innerHTML = "";
			}
			//resetPuckPos(); // in gui.js
			divTheQuestion.style.display = "";

		}
		else if (state==STATE_REVEALING_QUESTION) {
			showScreen(6);
			divTheQuestion.style.display = "";
		}
		else if (state==STATE_POST_GAME) {
			showScreen(7);
		}

		divPuckStartArea.style.display = divTheQuestion.style.display;
	}
}

function gameLoop() { // called every 20ms
	now = Date.now();

	if (currentScreen==5) {
		if (instructionsvideo.currentTime>36) {
			setGameState(STATE_PLAYING);
			resetPuckPos();
			startQuestions();
		}
		return;
	}

	if (GAME.state>STATE_IDLE && lastInteractionTime+INTERACTION_TIME_OUT_PERIOD<now) {
		if (!bMsgBoxDisplayed) {
			lastInteractionTime = now;
			confirm("Exit?","Lie2Me",onClickedExit,nullFunction,"Yes","No");
		}
		else {
			hideAlertBox();
			onClickedExit();
		}

		return;
	}

	/*
	if (GAME.state==STATE_PLAYING || GAME.state==STATE_TOUCHSCREEN_TEST) { 
		// apply puck momentum?

		if (now>puckpos.lastPlayerMoveTime+60) {
			if (puckpos.x>puckhalfsize.x && puckpos.x<screenSize.puckMaxX && puckpos.y>puckhalfsize.y && puckpos.y<screenSize.puckMaxY) {

				var sz = data.length;
				var velx, vely;

				if (sz==0) {
					velx = 0;
					vely = -5;
				}
				else {
					var start = sz-5;
					if (start<0)
						start = 0;
					velx = puckpos.x - data[start].x;
					vely = puckpos.y - data[start].y;
					if (velx==0 && vely==0) {
						vely = -5;
					}
				}

				var vel = Math.sqrt(velx*velx + vely*vely);
				velx *= 5/vel;
				vely *= 5/vel;

				puckpos.x += velx;
				if (puckpos.x<puckhalfsize.x)
					puckpos.x = puckhalfsize.x;
				else if (puckpos.x>screenSize.puckMaxX)
					puckpos.x = screenSize.puckMaxX;
				puckpos.y += vely;
				if (puckpos.y<puckhalfsize.y)
					puckpos.y = puckhalfsize.y;
				else if (puckpos.y>screenSize.puckMaxY)
					puckpos.y = screenSize.puckMaxY;			
				redrawPuck();
			}
		}
	}
	*/
}

function nullFunction() {
}

function doAjaxRequest(cmd,payload,callbackFn) {
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        	callbackFn(xmlhttp.responseText);
        }
        else if (xmlhttp.readyState==4 && xmlhttp.status==0) {
            // network error
            alert("Network Error! Please check your internet connection.");
        }
    };
	xmlhttp.open("POST", "lie2meAjax.php", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(cmd+"&payload="+payload); 
}