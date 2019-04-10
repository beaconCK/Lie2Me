
var gameTitle = "Lie2Me";
var bMsgBoxDisplayed = false;

function alert(msg,title,okCallback) { // title is optional, callback is optional
	// overriding the default alert() function
	if (typeof title==="undefined")
		title = gameTitle;

	document.getElementById("alertHeading").innerHTML = title;
	document.getElementById("alertMsg").innerHTML = msg;
	document.getElementById("btnAlertCancel").style.display = "none";
	document.getElementById("divAlert").style.display = "";
	confirm.okCallback = okCallback;
	bMsgBoxDisplayed = true;
}

function confirm(msg,title,okCallback,cancelCallback,txtOkButton,txtCancelButton) {
    // title is optional, callbacks are optional, txtOkButton,txtCancelButton are both optional
	// overriding the default confirm() function
	if (typeof title==="undefined")
		title = gameTitle;
    if (typeof txtOkButton==="undefined")
        txtOkButton = "OK";
    if (typeof txtCancelButton==="undefined")
        txtCancelButton = "Cancel";
    
    document.getElementById("btnAlertOk").innerHTML = txtOkButton;
    document.getElementById("btnAlertCancel").innerHTML = txtCancelButton;
	document.getElementById("alertHeading").innerHTML = title;
	document.getElementById("alertMsg").innerHTML = msg;
	document.getElementById("btnAlertCancel").style.display = "";
	document.getElementById("divAlert").style.display = "";
	confirm.okCallback = okCallback;
	confirm.cancelCallback = cancelCallback;
	bMsgBoxDisplayed = true;
}

function onClickedAlertOk() {
	document.getElementById("divAlert").style.display = "none";
	bMsgBoxDisplayed = false;
	if (typeof confirm.okCallback!="undefined")
		confirm.okCallback();
}

function onClickedAlertCancel() {
	document.getElementById("divAlert").style.display = "none";
	bMsgBoxDisplayed = false;
	if (typeof confirm.cancelCallback!="undefined")
		confirm.cancelCallback();
}

function hideAlertBox() {
	document.getElementById("divAlert").style.display = "none";
	bMsgBoxDisplayed = false;	
}