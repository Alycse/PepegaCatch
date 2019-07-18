const wildPepegaSpawnMinimumDiv = 40;

var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		insertWildPepega();
	}
}, 10);

function rollPagePosition() {
	var pagePosition = new Object();
	pagePosition.x = Math.floor(Math.random() * (document.documentElement.scrollWidth));
	pagePosition.y = Math.floor(Math.random() * (document.documentElement.scrollHeight));
	return pagePosition;
}

function insertWildPepega() {
	chrome.runtime.sendMessage({"message": "get-wild-pepega", "location": window.location}, function(response) {
		var divs = document.getElementsByTagName("div");
		console.log("Site has " + divs.length + " divs, minimum requirement is " + wildPepegaSpawnMinimumDiv + " divs");
		if(!response.isSiteFiltered && response.wildPepega != null && divs.length >= wildPepegaSpawnMinimumDiv){
			var divElement = document.getElementsByTagName("body")[0];
			if(divElement == null){
				return;
			}
			insertWildPepegaImage(divElement, response.wildPepega.pepegaType.imageUrl, response.wildPepega.pepegaType.id);
			insertWildPepegaJs();
			insertWildPepegaCss();
		}
	});
}

function insertWildPepegaImage(divElement, wildPepegaImageUrl, wildPepegaTypeId){
	var wildPepegaImage = document.createElement("img");
	wildPepegaImage.id = "wildPepega";
	wildPepegaImage.name = wildPepegaTypeId;
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
	link.href = chrome.runtime.getURL("src/pepega/pepega.css");
	(document.head || document.documentElement).appendChild(link);
}

function insertWildPepegaJs(){
	var script = document.createElement('script');
	script.src = chrome.runtime.getURL("src/pepega/pepega.js");
	(document.head || document.documentElement).appendChild(script);
}

window.addEventListener("message", function(event) {
    if (event.source != window){
        return;
    }
    if (event.data.message && event.data.message == "catch-wild-pepega") {
		chrome.runtime.sendMessage({"message": "catch-wild-pepega", "wildPepegaTypeId": event.data.wildPepegaTypeId, "location": window.location}, function(response) {
		});
    }
}, false);