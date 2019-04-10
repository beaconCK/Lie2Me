
var questions = [];
var questionsLeft;
var revealedQuestion = "";
var postSurveyData = {};

// 'actions' questions
questions.push({q:"Have you ever eaten pizza?", used:false});
questions.push({q:"Have you ever built a robot?", used:false});
questions.push({q:"Have you ever built a fire?", used:false});
questions.push({q:"Have you ever slept in a hammock?", used:false});
questions.push({q:"Have you ever gone fishing?", used:false});
questions.push({q:"Have you ever eaten octopus?", used:false});
questions.push({q:"Have you ever made sushi?", used:false});
questions.push({q:"Have you ever slept in Berlin?", used:false});
questions.push({q:"Have you ever made a joke?", used:false});
questions.push({q:"Have you ever sat on a camel?", used:false});
questions.push({q:"Have you ever baked cupcakes?", used:false});
questions.push({q:"Have you ever bought a house?", used:false});
questions.push({q:"Have you ever played dominoes?", used:false});
questions.push({q:"Have you ever collected antiques?", used:false});
questions.push({q:"Have you ever climbed a mountain?", used:false});
questions.push({q:"Have you ever bought a surfboard?", used:false});

// 'observations' questions
questions.push({q:"Have you ever met Messi?", used:false});
questions.push({q:"Have you ever seen an ostrich?", used:false});
questions.push({q:"Have you ever seen rugby?", used:false});
questions.push({q:"Have you ever been to the Olympics?", used:false});
questions.push({q:"Have you ever been backpacking?", used:false});
questions.push({q:"Have you ever been to a park?", used:false});
questions.push({q:"Have you ever met a professor?", used:false});
questions.push({q:"Have you ever seen a movie?", used:false});
questions.push({q:"Have you ever been to a restaurant?", used:false});
questions.push({q:"Have you ever been to a hospital?", used:false});
questions.push({q:"Have you ever been to Donegal?", used:false});
questions.push({q:"Have you ever been bowling?", used:false});
questions.push({q:"Have you ever seen the Mona_Lisa?", used:false});
questions.push({q:"Have you ever been to Asia?", used:false});
questions.push({q:"Have you ever seen the ocean?", used:false});
questions.push({q:"Have you ever seen Stonehenge?", used:false});

function startQuestions() {
  questionsLeft = questions.length;
  var liesGroup1 = 0, liesGroup2 = 0;
  var truthsGroup1 = 0, truthsGroup2 = 0;
  var questionsPerGroup = questions.length/2;
  var wantLiesPerGroup = questionsPerGroup/2;

  if (Math.random()<0.5) {
  	myData.leftIsTrue = 1;
  	document.getElementById("dragTargetRealLeft").innerHTML = "Yes";
  	document.getElementById("dragTargetRealRight").innerHTML = "No";
  }
  else {
  	myData.leftIsTrue = 0;
  	document.getElementById("dragTargetRealLeft").innerHTML = "No";
  	document.getElementById("dragTargetRealRight").innerHTML = "Yes";  	
  }
  document.getElementById("dragTargetAvgLeft").innerHTML = document.getElementById("dragTargetRealLeft").innerHTML;
  document.getElementById("dragTargetAvgRight").innerHTML = document.getElementById("dragTargetRealRight").innerHTML;

  for (var i=0; i<questions.length; i++) {
  	questions[i].used = false;
  	if (i<questionsPerGroup) {
  		// group 1 question
  		if (truthsGroup1<wantLiesPerGroup && (liesGroup1==wantLiesPerGroup || Math.random()<0.5)) {
  			questions[i].wantLie = 0;
  			truthsGroup1++;
  		}
  		else {
  			questions[i].wantLie = 1;
  			liesGroup1++;
  		}
  	}
  	else {
  		// group 2 question
  		if (truthsGroup2<wantLiesPerGroup && (liesGroup2==wantLiesPerGroup || Math.random()<0.5)) {
  			questions[i].wantLie = 0;
  			truthsGroup2++;
  		}
  		else {
  			questions[i].wantLie = 1;
  			liesGroup2++;
  		}
  	}
  }
  //alert("Lies in group 1: "+liesGroup1+", group 2: "+liesGroup2);
  myQuestions = [];
  myData.myQuestions = myQuestions;
  nextQuestion();
}

function nextQuestion() {
	lastInteractionTime = now;
	resetPuckPos();
	var searching = true;
	var idx;
	while (searching) {
		idx = Math.floor(Math.random()*questions.length);
		searching = questions[idx].used;
	}

	divQsLeft.innerHTML = questionsLeft + " Left";
	questionsLeft--;
	questions[idx].used = true;
	if (typeof questions[idx].words==="undefined") {
		questions[idx].words = questions[idx].q.split(" ");
		for (var i=0;i<questions[idx].words.length; i++)
			questions[idx].words[i] = questions[idx].words[i].replace("_"," ");
	}

	myQuestions.push({q:questions[idx].q, l:questions[idx].wantLie});
	setGameState(STATE_REVEALING_QUESTION);
	if (questions[idx].wantLie==1)
		revealedQuestion = "<font color='#a02433'>Lie:<br>";
	else
		revealedQuestion = "<font color='#25404c'>Truth:<br>";
	setTimeout(revealWord, 500, idx, 0);
}

function revealWord(questionIdx, wordNum) {
	if (GAME.state!=STATE_REVEALING_QUESTION)
		return;

	var isLastWord = (wordNum+1>=questions[questionIdx].words.length);

	if (puckpos.inStartingArea && isLastWord) {
		setTimeout(revealWord, 250, questionIdx, wordNum);
		return;
	}

	lastInteractionTime = now;
	if (wordNum>0)
		revealedQuestion += " ";
	revealedQuestion += questions[questionIdx].words[wordNum];
	oTheQuestion.innerHTML = revealedQuestion;

	if (wordNum+1<questions[questionIdx].words.length) {
		setTimeout(revealWord, 250, questionIdx, wordNum+1);
	}
	else {
		setGameState(STATE_PLAYING);
		//puckpos.lastPlayerMoveTime = now-60; // so it starts drifting upwards
	}
}

function recordQuestionResult(bLeftTargetHit) { 
	// record data
	var idx = myQuestions.length-1;
	var ans;
	if (myData.leftIsTrue==1) {
		if (bLeftTargetHit)
			myQuestions[idx].a = 1;
		else
			myQuestions[idx].a = 0;
	}
	else {
		if (bLeftTargetHit)
			myQuestions[idx].a = 0;
		else
			myQuestions[idx].a = 1;		
	}

	myQuestions[idx].data = data; // mouse trace
	//console.log("Lie?: " + myQuestions[idx].l + ", frame x position: " + myQuestions[idx].data[3].x + ", frame position y: " + myQuestions[idx].data[3].y + ", frame time: " + myQuestions[idx].data[3].t);
	getThisTraceData(myQuestions[idx]);

	if (questionsLeft>0) {
		nextQuestion();
	}
	else {
		setGameState(STATE_POST_GAME);
		// send main data to server
		doAjaxRequest("cmd=maindata",JSON.stringify(myData),function(responseTxt) {
			myData.PK = parseInt(responseTxt); // server responds with PK of new record
		});
		showPostGameSurvey();
	}
}

function showPostGameSurvey() {
	lastInteractionTime = now + 8000; // give this screen extra time before timing out
	postSurveyData = {trueAnswers:[]};
	var html = "<table style='font-size:0.8em;'>";
	for (var i=0; i<myQuestions.length; i++) {
		if (i%2==0)
			html += "<tr>";

		html += "<td>\""+myQuestions[i].q+"\" &nbsp; &nbsp; &nbsp;"
			+" Yes <img class='imgAlign' id='q"+i+"t' onclick='postSurveyClick("+i+",true);' ontouchstart='postSurveyClick("+i+",true);' src='check-off.jpg'> &nbsp;"
			+ " No <img class='imgAlign' id='q"+i+"f' onclick='postSurveyClick("+i+",false);' ontouchstart='postSurveyClick("+i+",false);' src='check-off.jpg'></td>";
		postSurveyData.trueAnswers.push(-1); // not answered


		if (i%2==1)
			html += "</tr>";
	}
	if (myQuestions.length%2==1) 
		html += "<td></td>";
	html += "</tr>";
	html += "</table>";

	document.getElementById("divPostGameSurveyContent").innerHTML = html;
}

function postSurveyClick(questionNum, bTrue) {
	lastInteractionTime = now + 8000; // give this screen extra time before timing out
	if (bTrue) {
		document.getElementById("q"+questionNum+"t").src = "check-on.jpg";
		document.getElementById("q"+questionNum+"f").src = "check-off.jpg";
		postSurveyData.trueAnswers[questionNum] = 1; // true
	}
	else {
		document.getElementById("q"+questionNum+"t").src = "check-off.jpg";
		document.getElementById("q"+questionNum+"f").src = "check-on.jpg";	
		postSurveyData.trueAnswers[questionNum] = 0; // false	
	}
}

function displayAverageMovements() {
	lastInteractionTime = now + 10000; // give this screen extra time before timing out
	theCanvasCtx.fillStyle="#000000";
	theCanvasCtx.fillRect(0,0,screenSize.x,screenSize.y);
	theCanvasCtx.setLineDash([5,2]);
	theCanvasCtx.lineWidth=3;
	var q, d;

	
	// yes+truth, i.e.  q.a==1  q.l==0
	// answer=yes+lie
	// answer=no+truth
	// answer=no+lie

	
	for (var i=0;i<myQuestions.length;i++) {
		q = myQuestions[i];
		if (q.l==0)
			theCanvasCtx.strokeStyle = '#00ff00';
		else
			theCanvasCtx.strokeStyle = '#ff0000';

		d = q.data;
		
		theCanvasCtx.beginPath();
		for (var j=0; j<d.length; j++) {
			if (j==0)
				theCanvasCtx.moveTo(d[j].x, d[j].y);
			else /*if (j+1==d.length)*/
				theCanvasCtx.lineTo(d[j].x, d[j].y);
			//else
			//	theCanvasCtx.bezierCurveTo(d[j-1].x,d[j-1].y, d[j].x,d[j].y, d[j+1].x,d[j+1].y);
		}
		theCanvasCtx.stroke();

	}
	
	

}

