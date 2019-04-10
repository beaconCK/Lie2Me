// JavaScript Document
var weights = [44.2817618, 0.66054466, 0.75328089];//weights calculated by parse_plus_perceptron.py at ... epochs and ... learn rate
var bias = -1379.39;//testing input

function activation(n) {
        return n < 0 ? 0: 1;
    }

function getPerceptronGuess(input) {
		var total = bias;
        weights.forEach((w, index) => {total += input[index] * w});   
        console.log("current guess : " + total);
        return this.activation(total);
}
   
//************* PREPARATION OF PUCK MOVEMENT DATA FOR FEEDING INTO PERCEPTRON 
function getThisTraceData(myTrace){
	var totalDistance = 0;
	var thisLie = myTrace.l;
	var oldX = myTrace.data[0].x;
	var oldY = myTrace.data[0].y;
	var pauseTime = myTrace.data[1].t;
	//var currentX = 0;
	//var currentY = 0;
	
	for(var i =1; i < myTrace.data.length; i++){
		var currentX = myTrace.data[i].x;
		var currentY = myTrace.data[i].y;
		var distanceThisFrame = Math.sqrt(Math.pow((currentX - oldX), 2) + Math.pow((currentY - oldY), 2));
		oldX = currentX;
		oldY = currentY;
		totalDistance += distanceThisFrame;
	}
	var averageSpeed = totalDistance / myTrace.data[myTrace.data.length -1].t;
    
	console.log("Total Distance: " + totalDistance + " PauseTime: " + pauseTime + " Speed: " + averageSpeed);
    var thisTraceArray = [totalDistance, pauseTime, averageSpeed];
    var currentGuess = getPerceptronGuess(thisTraceArray);//get the perceptron to work out if the current user's current answer is a truth or a lie
    
    
    if (parseInt(currentGuess) == 1) {
        alert("I detect porky pies!");
    }
    if (parseInt(currentGuess) == 0) {
        alert("That's a fairly plausible answer...")
    }
}