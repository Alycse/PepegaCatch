const isBeta = true;
const gameLink = "https://github.com/Alycse";
const gameTitle = "Pepega Catch!";

const pepegasPerRow = 5;
const defaultInputBoxArmyName = "My Pepega Army";

var mouseEnterBuyPepegaSlotColor;
var mouseLeaveBuyPepegaSlotColor;
var mouseEnteredBuyPepegaSlot;

var pepegaElementTemplate = document.getElementById("pepegaElementTemplate");
pepegaElementTemplate.parentNode.removeChild(pepegaElementTemplate);

updateGameTitle();

function updateGameTitle(){
	var manifestData = chrome.runtime.getManifest();
	var newGameTitle = gameTitle + " v" + manifestData.version;
	if(isBeta){
		newGameTitle += " BETA";
	}
	document.getElementById("gameTitle").innerHTML = newGameTitle;
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "player-iq-count-updated"){
			setDisplayedPlayerIqCount(request.playerIqCount);
			setDisplayedRank(request.rank, request.branch, request.nextRank, request.ranksLength);
			setDisplayedPepegaSlotCostAvailability(request.playerIqCount, request.pepegaSlotCost);
			sendResponse();
		}else if(request.message == "player-pepegas-updated"){
			setDisplayedPlayerPepegas(request.playerPepegas, request.uniquePepegaIqpsMultiplier);
			setDisplayedPepegaSlots(request.playerPepegas.length, request.playerPepegaSlots);
			setDisplayedIqps(request.totalIqps, request.multiplierTotalIqps);
			sendResponse();
		}else if(request.message == "player-encounter-rate-updated"){
			setDisplayedEncounterRate(request.playerEncounterRate);
			sendResponse();
		}else if(request.message == "settings-updated"){
			setDisplayedSettings(request.settingsFilteredSites, request.settingsEnableSounds, 
				request.settingsEnablePepegaCatchReleaseNotifications, request.settingsEnableRankUpNotifications, request.settingsRecordOrigin);
			sendResponse();
		}else if(request.message == "player-army-name-updated"){
			setDisplayedArmyName(request.playerArmyName, request.isDefaultArmyName);
			sendResponse();
		}else if(request.message == "player-pepega-slots-updated"){
			setDisplayedPepegaSlots(request.playerPepegaCount, request.playerPepegaSlots, request.pepegaSlotCost);
			setDisplayedPepegaSlotCostAvailability(request.playerIqCount, request.pepegaSlotCost);
			sendResponse();
		}
	}
);

chrome.runtime.sendMessage({"message": "update-all-popup-displays"}, function(response) {
});

function setDisplayedPepegaSlots(playerPepegaCount, playerPepegaSlots, pepegaSlotCost){
	document.getElementById("pepegaArmyCountContent").innerHTML = playerPepegaCount + "/" + playerPepegaSlots;
	if(pepegaSlotCost){
		document.getElementById("buyPepegaSlotCost").innerHTML = formatWithCommas(pepegaSlotCost) + " IQ";
	}
}

function mouseEntertDisplayedPepegaSlots(){
	document.getElementById("buyPepegaSlot").style.color = mouseEnterBuyPepegaSlotColor;
	mouseEnteredBuyPepegaSlot = true;
}

function mouseLeavetDisplayedPepegaSlots(){
	document.getElementById("buyPepegaSlot").style.color = mouseLeaveBuyPepegaSlotColor;
	mouseEnteredBuyPepegaSlot = false;
}

function setDisplayedPepegaSlotCostAvailability(playerIqCount, pepegaSlotCost){
	if(playerIqCount >= pepegaSlotCost){
		mouseEnterBuyPepegaSlotColor = "rgb(245, 230, 35)";
		mouseLeaveBuyPepegaSlotColor = "rgb(225, 190, 5)";
		document.getElementById("buyPepegaSlot").style.cursor = "pointer";
	}else {
		mouseEnterBuyPepegaSlotColor = "rgb(180, 35, 35)";
		mouseLeaveBuyPepegaSlotColor = "rgb(155, 55, 55)";
		document.getElementById("buyPepegaSlot").style.cursor = "default";
	}
	if(mouseEnteredBuyPepegaSlot){
		document.getElementById("buyPepegaSlot").style.color = mouseEnterBuyPepegaSlotColor;
	}else{
		document.getElementById("buyPepegaSlot").style.color = mouseLeaveBuyPepegaSlotColor;
	}
}

function formatWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setDisplayedArmyName(playerArmyName, isDefaultArmyName = false){
	document.getElementById("pepegaArmyTitle").innerHTML = playerArmyName;
	if(playerArmyName.length < 30){
		document.getElementById("pepegaArmyTitle").style.fontSize = "28px";
	}else{
		document.getElementById("pepegaArmyTitle").style.fontSize = "24px";
	}
	if(!isDefaultArmyName){
		document.getElementById("renameArmyInputBox").value = playerArmyName;
	}else{
		document.getElementById("renameArmyInputBox").value = defaultInputBoxArmyName;
	}
}

function setDisplayedSettings(settingsFilteredSites, settingsEnableSounds, settingsEnablePepegaCatchReleaseNotifications, settingsEnableRankUpNotifications, settingsRecordSites){
	if(settingsFilteredSites){
		var settingsFilteredSitesText = settingsFilteredSites.join('\n');
		document.getElementById("siteFiltersModalTextArea").value = settingsFilteredSitesText;
	}
	if(settingsEnableSounds){
		document.getElementById('enableSoundsCheckmark').checked = settingsEnableSounds;
	}
	if(settingsEnablePepegaCatchReleaseNotifications){
		document.getElementById('enablePepegaCatchReleaseNotificationsCheckmark').checked = settingsEnablePepegaCatchReleaseNotifications;
	}
	if(settingsEnableRankUpNotifications){
		document.getElementById('enableRankUpNotificationsCheckmark').checked = settingsEnableRankUpNotifications;
	}
	if(settingsRecordSites){
		document.getElementById('recordOriginCheckmark').checked = settingsRecordSites;
	}
}

function setDisplayedRank(rank, branch, nextRank, ranksLength){
	var rankTitle = rank.title[0];
	if(rank.title[branch.id]){
		rankTitle = rank.title[branch.id];
	}

	var rankDescription = rank.description[0];
	if(rank.description[branch.id]){
		rankDescription = rank.description[branch.id];
	}

	document.getElementById("rankContent").innerHTML = rankTitle;
	document.getElementById("rankContent").title = "Rank " + (ranksLength - rank.id) + "\n" + rankDescription;
	if(rank.iqpsMultiplier != 1){
		document.getElementById("rankIqpsMultiplier").innerHTML = " x " + rank.iqpsMultiplier.toFixed(2) + "";
	}else{
		document.getElementById("rankIqpsMultiplier").innerHTML = "";
	}
	if(nextRank){
		document.getElementById("nextRankContent").innerHTML =  formatWithCommas(nextRank.iqRequirement);
	}else{
		var nextRankElement = document.getElementById("nextRank");
		if(nextRankElement){
			nextRankElement.parentNode.removeChild(nextRankElement);
		}
	}
}

function commarize() {
	if (this >= 1000000) {
	  	var units = ["Million", "Billion", "Trillion", "Quadrillion"];
	  	let unit = Math.floor(((this).toFixed(0).length - 1) / 3) * 3;
	  	var num = (this / ('1e'+unit)).toFixed(2);
	  	var unitname = units[Math.floor(unit / 3) - 2];
	  	return num + " " + unitname;
	}
	return this.toLocaleString();
}
Number.prototype.commarize = commarize
String.prototype.commarize = commarize
  
function setDisplayedEncounterRate(playerEncounterRate){
	document.getElementById("encounterRateContent").innerHTML = playerEncounterRate.name;
}

function setDisplayedPlayerIqCount(playerIqCount){
	document.getElementById("iqCountContent").innerHTML = Math.round(playerIqCount).commarize();
}

function setDisplayedIqps(totalIqps, multipliedTotalIqps){
	document.getElementById("totalIqps").innerHTML = formatWithCommas(totalIqps);
	document.getElementById("iqpsContent").innerHTML = formatWithCommas(multipliedTotalIqps);
}

function setDisplayedPlayerPepegas(playerPepegas, uniquePepegaIqpsMultiplier){
	clearPepegaArmyContent();

	if(playerPepegas.length > 0){
		document.getElementById("noPepegasMessage").style.display = "none";

		var index, length;
		var currentPepegaArmyRowElement = null;
		var pepegaArmyContentElement = document.getElementById("pepegaArmyContent");
		
		for (index = 0, length = playerPepegas.length; index < length; ++index) {
			if(index % pepegasPerRow == 0){
				if(currentPepegaArmyRowElement != null){
					pepegaArmyContentElement.appendChild(currentPepegaArmyRowElement);
				}
				currentPepegaArmyRowElement = document.createElement("div"); 
				currentPepegaArmyRowElement.className = "pepegaArmyRow";
			}

			var pepegaElement = pepegaElementTemplate.cloneNode(true);

			currentPepegaArmyRowElement.appendChild(pepegaElement);

			var caughtMessage = "Caught on";
			if(playerPepegas[index].fusioned){
				caughtMessage = "Fusion summoned on";
			}
			pepegaElement.getElementsByClassName("pepegaImage")[0].src = playerPepegas[index].pepegaType.imageUrl;
			var pepegaDescription = "";
			if(playerPepegas[index].pepegaType.description){
				pepegaDescription = "\nDetails:\n\"" + playerPepegas[index].pepegaType.description + "\"\n";
			}
			var pepegaImageTitle = "Type: " + playerPepegas[index].pepegaType.name + "\n" + pepegaDescription + "\n" + caughtMessage + " " + playerPepegas[index].origin;
			if(playerPepegas[index].date){
				pepegaImageTitle += " at " + playerPepegas[index].date;
			}
			pepegaElement.getElementsByClassName("pepegaImage")[0].title = pepegaImageTitle;
			pepegaElement.getElementsByClassName("pepegaIqCount")[0].innerHTML = formatWithCommas(playerPepegas[index].pepegaType.iqps * playerPepegas[index].level);
			pepegaElement.getElementsByClassName("pepegaOrigin")[0].innerHTML = playerPepegas[index].origin;

			if(playerPepegas[index].level <= 2){
				pepegaElement.getElementsByClassName("pepegaStar3")[0].style.display = "none";
				if(playerPepegas[index].level <= 1){
					pepegaElement.getElementsByClassName("pepegaStar2")[0].style.display = "none";
				}
			}

			pepegaElement.getElementsByClassName("releaseButton")[0].releasePepegaId = playerPepegas[index].id;
			pepegaElement.getElementsByClassName("releaseButton")[0].releasePepegaName = playerPepegas[index].pepegaType.name;
			pepegaElement.getElementsByClassName("releaseButton")[0].releaseiqReleasePrice = (playerPepegas[index].pepegaType.iqReleasePrice * playerPepegas[index].level);
			pepegaElement.getElementsByClassName("releaseButton")[0].title = "Release this Pepega for " + formatWithCommas((playerPepegas[index].pepegaType.iqReleasePrice * playerPepegas[index].level)) + " IQ";
			pepegaElement.getElementsByClassName("releaseButton")[0].addEventListener("click", function(){
				showReleaseConfirmationModal(this.releasePepegaId, this.releasePepegaName, this.releaseiqReleasePrice);
			});
			pepegaElement.getElementsByClassName("releaseButton")[0].parentNode.addEventListener("mouseover", function(){
				this.parentNode.getElementsByClassName("releaseButton")[0].style.visibility = "visible";
			});
			pepegaElement.getElementsByClassName("releaseButton")[0].parentNode.addEventListener("mouseout", function(){
				this.parentNode.getElementsByClassName("releaseButton")[0].style.visibility = "hidden";
			});
		}

		pepegaArmyContentElement.appendChild(currentPepegaArmyRowElement);
	}else{
		document.getElementById("noPepegasMessage").style.display = "block";
	}

	console.log("unique pepega iqps:"+ uniquePepegaIqpsMultiplier);
	if(uniquePepegaIqpsMultiplier != 1){
		document.getElementById("uniquePepegaIqpsMultiplier").innerHTML = " x " + uniquePepegaIqpsMultiplier.toFixed(2) + "";
	}else{
		document.getElementById("uniquePepegaIqpsMultiplier").innerHTML = "";
	}
}

var selectedPlayerPepegaId = null;

function showReleaseConfirmationModal(playerPepegaId, playerPepegaName, playerPepegaIqReleasePrice){
	document.getElementById("releaseConfirmationModal").style.display = "block";
	document.getElementById("releaseConfirmationModalPepegaName").innerHTML = playerPepegaName;
	document.getElementById("releaseConfirmationModalPepegaIqReleasePrice").innerHTML = playerPepegaIqReleasePrice;
	selectedPlayerPepegaId = playerPepegaId;
}
function hideReleaseConfirmationModal(){
	document.getElementById("releaseConfirmationModal").style.display = "none";
	selectedPlayerPepegaId = null;
}

function showSiteFiltersModal(){
	document.getElementById("siteFiltersModal").style.display = "block";
}
function showSettingsModal(){
	document.getElementById("settingsModal").style.display = "block";
}
function hideSiteFiltersModal(){
	document.getElementById("siteFiltersModal").style.display = "none";
}
function hideSettingsModal(){
	document.getElementById("settingsModal").style.display = "none";
}

function showRenameArmyModal(){
	document.getElementById("renameArmyModal").style.display = "block";
}
function hideRenameArmyModal(){
	document.getElementById("renameArmyModal").style.display = "none";
}

function clearPepegaArmyContent(){
	document.getElementById("pepegaArmyContent").innerHTML = "";
}

function releasePlayerPepega(){
	chrome.runtime.sendMessage({"message": "release-player-pepega", "playerPepegaId": selectedPlayerPepegaId}, function(response) {
		hideReleaseConfirmationModal();
	});
}

function updateSettings(){
	chrome.runtime.sendMessage({"message": "update-settings", "filteredSitesText": document.getElementById("siteFiltersModalTextArea").value, "enableSounds": document.getElementById('enableSoundsCheckmark').checked, 
	"enablePepegaCatchReleaseNotifications": document.getElementById('enablePepegaCatchReleaseNotificationsCheckmark').checked, 
	"enableRankUpNotifications": document.getElementById('enableRankUpNotificationsCheckmark').checked, 
	"recordOrigin": document.getElementById('recordOriginCheckmark').checked}, function(response) {
		hideSettingsModal();
	});
}

function updateArmyName(){
	chrome.runtime.sendMessage({"message": "update-player-army-name", "playerArmyName": document.getElementById("renameArmyInputBox").value}, function(response) {
		hideRenameArmyModal();
	});
}

function updateEncounterRate(){
	chrome.runtime.sendMessage({"message": "update-player-encounter-rate"}, function(response) {
	});
}

function buyPepegaSlot(){
	chrome.runtime.sendMessage({"message": "buy-pepega-slot"}, function(response) {
	});
}

function openGameLink(){
	chrome.tabs.create({ url: gameLink });
}

document.getElementById("releaseConfirmationModalNo").addEventListener("click", hideReleaseConfirmationModal);
document.getElementById("releaseConfirmationModalYes").addEventListener("click", releasePlayerPepega);
document.getElementById("encounterRateModifier").addEventListener("click", updateEncounterRate);
document.getElementById("pepegaArmyTitle").addEventListener("click", showRenameArmyModal);
document.getElementById("renameArmyModalClose").addEventListener("click", updateArmyName);
document.getElementById("buyPepegaSlot").addEventListener("click", buyPepegaSlot);
document.getElementById("buyPepegaSlot").addEventListener("mouseenter", mouseEntertDisplayedPepegaSlots);
document.getElementById("buyPepegaSlot").addEventListener("mouseleave", mouseLeavetDisplayedPepegaSlots);
document.getElementById("settings").addEventListener("click", showSettingsModal);
document.getElementById("settingsModalClose").addEventListener("click", updateSettings);
document.getElementById("siteFilters").addEventListener("click", showSiteFiltersModal);
document.getElementById("siteFiltersModalClose").addEventListener("click", hideSiteFiltersModal);
document.getElementById("gameTitle").addEventListener("click", openGameLink);