const wildPepegaSpawnMinimumDiv = 40;

var browser = chrome;
var browserRuntime = browser.runtime;

var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		getWildPepega();
	}
}, 10);

function rollPagePosition() {
	var pagePosition = new Object();
	pagePosition.x = Math.floor(Math.random() * (document.documentElement.scrollWidth));
	pagePosition.y = Math.floor(Math.random() * (document.documentElement.scrollHeight));
	return pagePosition;
}

function getWildPepega() {
	browserRuntime.sendMessage({"message": "get-wild-pepega", "locationHref": window.location.href}, function(result) {
		var divs = document.getElementsByTagName("div");
		if(!result.isSiteFiltered && result.wildPepega != null && divs.length >= wildPepegaSpawnMinimumDiv){
			var divElement = document.getElementsByTagName("body")[0];
			if(divElement == null){
				return;
			}
			console.log("Inserting pepega: " + result.wildPepega.pepegaType.name);
			insertWildPepegaImage(divElement, result.wildPepega.pepegaType.imageUrl, result.wildPepega.pepegaType.id, result.wildPepega.power, result.wildPepega.level);
			insertWildPepegaJs();
			insertWildPepegaCss();
		}
	});
}

function insertWildPepegaImage(divElement, wildPepegaImageUrl, wildPepegaTypeId, wildPepegaPower, wildPepegaLevel){
	var wildPepegaImage = document.createElement("img");
	wildPepegaImage.id = "wildPepega";
	wildPepegaImage.name = wildPepegaTypeId + " " + wildPepegaPower + " " + wildPepegaLevel;
	wildPepegaImage.src = wildPepegaImageUrl;
	var pagePosition = rollPagePosition();
	wildPepegaImage.style.top = pagePosition.y + "px";
	wildPepegaImage.style.right = pagePosition.x + "px";
	divElement.appendChild(wildPepegaImage);
}

function insertWildPepegaCss(){
	var link = document.createElement('link');
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = browserRuntime.getURL("src/pepega/pepega.css");
	(document.head || document.documentElement).appendChild(link);
}

function insertWildPepegaJs(){
	var script = document.createElement('script');
	script.src = browserRuntime.getURL("src/pepega/pepega.js");
	(document.head || document.documentElement).appendChild(script);
}

window.addEventListener("message", function(event) {
    if (event.source != window){
        return;
    }
    if (event.data.message && event.data.message == "catch-wild-pepega") {
		try{
			browserRuntime.sendMessage({"message": "catch-wild-pepega", "wildPepegaTypeId": event.data.wildPepegaTypeId, "wildPepegaPower": event.data.wildPepegaPower, "wildPepegaLevel": event.data.wildPepegaLevel, "locationHref": window.location.href});
		}catch(e){}
    }
}, false);