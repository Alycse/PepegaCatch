chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "get-wild-pepega"){
			sendResponse({ isSiteFiltered: isSiteFiltered(request.location), wildPepega: getWildPepega(request.location) });
		}else if(request.message == "catch-wild-pepega"){
			catchWildPepega(request.wildPepegaTypeId, request.location);
			sendResponse();
		}else if(request.message == "update-all-popup-displays"){
			updateAllPopupDisplays();
			sendResponse();
		}else if(request.message == "update-player-encounter-rate"){
			updatePlayerEncounterRate();
			sendResponse();
		}else if(request.message == "release-player-pepega"){
			releasePlayerPepega(request.playerPepegaId);
			sendResponse();
		}else if(request.message == "update-settings"){
			updateSettings(request.filteredSitesText, request.enableSounds, 
				request.enablePepegaCatchReleaseNotifications, request.enableRankUpNotifications, request.recordOrigin);
			sendResponse();
		}else if(request.message == "update-player-army-name"){
			updatePlayerArmyName(request.playerArmyName);
			sendResponse();
		}else if(request.message == "buy-pepega-slot"){
			buyPepegaSlot();
			sendResponse();
		}
	}
);

chrome.tabs.onActivated.addListener(function(tab) {
	chrome.tabs.getSelected(function(tab) {
		var location = new Object();
		location.hostname = tab.url;
		isSiteFiltered(location);
	});
});