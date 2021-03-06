const EventMessageEnum = {
    "GetWildPepega":1, 
    "CatchWildPepega":2, 
    "RepelWildPepega":17
}

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
	browserRuntime.sendMessage({"message": EventMessageEnum.GetWildPepega, "locationHref": window.location.href}, function(result) {
		var divs = document.getElementsByTagName("div");
		if(!result.isSiteFiltered && result.wildPepega != null && divs.length >= wildPepegaSpawnMinimumDiv){
			var divElement = document.getElementsByTagName("body")[0];
			if(divElement == null){
				return;
			}
			insertWildPepegaImage(divElement, result.wildPepega.pepegaType.name, result.wildPepega.pepegaType.imageUrl, result.wildPepega.pepegaType.id, result.wildPepega.power, result.wildPepega.level, result.wildPepega.pepegaType.iqps * result.wildPepega.level, result.totalEstimatedPower);
			insertWildPepegaJs();
			insertWildPepegaCss();
		}
	});
}

function insertWildPepegaImage(divElement, wildPepegaTypeName, wildPepegaImageUrl, wildPepegaTypeId, wildPepegaPower, wildPepegaLevel, wildPepegaIqps, totalEstimatedPower){
	var wildPepegaImage = document.createElement("img");
	wildPepegaImage.id = "wildPepega";
	wildPepegaImage.title = "Type: " + wildPepegaTypeName + "\nLevel: " + wildPepegaLevel + "\nIQ: " + wildPepegaIqps + "\nPower: " + wildPepegaPower + "\n\nYour Army's Estimated Power: " + totalEstimatedPower + "\n\nLeft Click: Battle & Catch\nShift+Left Click: Repel";
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
    if (event.data.message) {
		if(event.data.message == EventMessageEnum.CatchWildPepega){
			try{
				browserRuntime.sendMessage({"message": EventMessageEnum.CatchWildPepega, "wildPepegaTypeId": 
					event.data.wildPepegaTypeId, "wildPepegaPower": event.data.wildPepegaPower, 
					"wildPepegaLevel": event.data.wildPepegaLevel, "locationHref": window.location.href});
			}catch(e){}
		}else if(event.data.message == EventMessageEnum.RepelWildPepega){
			try{
				browserRuntime.sendMessage({"message": EventMessageEnum.RepelWildPepega});
			}catch(e){}
		}
    }
}, false);

