const isBeta = true;
const gameLink = "https://github.com/Alycse/PepegaCatch";
const gameIssuesLink = "https://github.com/Alycse/PepegaCatch/issues/new/choose";
const gameTitle = "Pepega Catch!";

const pepegasPerRow = 5;
const defaultInputBoxArmyName = "My Pepega Army";

const allowedPepegaHealingTime = 2;

const tutorialModalDelay = 200;
var displayedIqCount = 0;

var shownTutorialPhase;
var shownRandomTutorialPhase;

var hasUniquePepegaIqpsMultiplier = false;
var hasRankIqpsMultiplier = false;

var browser = chrome;
var browserRuntime = browser.runtime;
var browserTabs = browser.tabs;
var browserStorage = browser.storage.local;

var recentBattleBreakdown;

updateGameTitle();

function updateGameTitle(){
	var manifestData = browserRuntime.getManifest();
	var newGameTitle = gameTitle + " v" + manifestData.version;
	if(isBeta){
		newGameTitle += " BETA";
	}
	document.getElementById("gameTitle").innerHTML = newGameTitle;
}

browserRuntime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "player-iq-count-updated"){
			setDisplayedPlayerIqCount(request.playerIqCount);
			setDisplayedRank(request.rank, request.branch, request.nextRank, request.ranksLength, request.isBeforeLastRank);
			setDisplayedPepegaSlotCostAvailability(request.playerIqCount, request.pepegaSlotCost);
			sendResponse();
		}else if(request.message == "player-pepegas-updated"){
			setDisplayedPlayerPepegas(request.playerPepegas, request.uniquePepegaIqpsMultiplier);
			setDisplayedEncounterRate(request.baseEncounterRate, request.configEncounterMode);
			setDisplayedPepegaSlots(request.playerPepegas.length, request.playerPepegaSlots);
			setDisplayedIqps(request.totalIqps, request.multipliedTotalIqps);
			setDisplayedPower(request.rankBasePower, request.totalPepegaPower);
			sendResponse();
		}else if(request.message == "settings-updated"){
			setDisplayedSettings(request.settings);
			sendResponse();
		}else if(request.message == "player-army-name-updated"){
			setDisplayedArmyName(request.playerArmyName, request.isDefaultArmyName);
			sendResponse();
		}else if(request.message == "notifications-display-updated"){
			setDisplayedNotifications(request.notificationsDisplayHeader, request.notificationsDisplayMessage);
			sendResponse();
		}else if(request.message == "player-pepega-slots-updated"){
			setDisplayedPepegaSlots(request.playerPepegaCount, request.playerPepegaSlots, request.pepegaSlotCost);
			setDisplayedPepegaSlotCostAvailability(request.playerIqCount, request.pepegaSlotCost);
			sendResponse();
		}else if(request.message == "config-encounter-mode-updated"){
			setDisplayedEncounterMode(request.configEncounterMode);
			setDisplayedEncounterRate(request.baseEncounterRate, request.configEncounterMode);
			sendResponse();
		}else if(request.message == "config-filtered-sites-updated"){
			setDisplayedFilteredSites(request.configFilteredSites);
			sendResponse();
		}else if(request.message == "tutorial-phase-updated"){
			setDisplayedTutorialPhase(request.tutorialPhase);
			sendResponse();
		}else if(request.message == "show-random-tutorial"){
			setDisplayedRandomTutorialPhase(request.randomTutorialPhase);
			sendResponse();
		}
	}
);

browserRuntime.sendMessage({"message": "update-all-popup-displays"});

function setDisplayedNotifications(notificationsDisplayHeader, notificationsDisplayMessage){
	if(notificationsDisplayHeader != ""){
		document.getElementById("notificationsDisplayHeader").innerHTML = notificationsDisplayHeader;
		document.getElementById("notificationsDisplayMessage").innerHTML = notificationsDisplayMessage;
	}
}

function setDisplayedTutorialPhase(tutorialPhase){
	var tutorialDisplayContent = "";
	var tutorialDisplayDescription = "";
	document.getElementById("tutorialDisplay").style.display = "none";

	if(tutorialPhase == "ask"){

		setTimeout(function() {
			showModal("tutorialAskModal");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "catchPrompt"){

		setTimeout(function() {
			showTutorialModal("Let's catch your first Pepega!", 
			"<p>Go to any website, find the Wild Pepega hiding within the page, then click it!</p>" + 
			"<p>You and your Pepega Army will then battle the Wild Pepega (Don't worry, this is all done automatically!)</p>" +
			"<p>But since you don't have any Pepegas yet, you're gonna have to defeat it yourself!</p>" +
			"<p>Try catching one now! You may hover over the Wild Pepega to see its name and power.</p>");
		}, tutorialModalDelay);
		
	} else if(tutorialPhase == "catch"){

		tutorialDisplayContent = "Catch your first Pepega!";
		tutorialDisplayDescription = "Go to any website, find the Wild Pepega hiding within the page, then click it!\n" + 
		"You and your Pepega Army will then battle the Wild Pepega (Don't worry, this is all done automatically!)\n" + 
		"But since you don't have any Pepegas yet, you're gonna have to defeat it yourself!\n"+
		"Try catching one now! You may hover over the Wild Pepega to see its name and power.";

	} else if(tutorialPhase == "catchDone"){

		setTimeout(function() {
			showTutorialModal("Great! You caught your first Pepega!", 
			"<p>This Pepega will increase the amount of IQ you get per second, " +
			"and it will also fight for you when you're catching more Wild Pepegas!</p>" +
			"<p>Your Total Estimated Power is your rank's base power combined with your Pepegas' power, which you can find on your home screen.</p>" +
			"<p>Generally, you need this to be higher than the power of the Wild Pepega that you're trying to catch.</p>");
		}, tutorialModalDelay);

	} else if (tutorialPhase == "repelInfo"){
		setTimeout(function() {
			showTutorialModal("Repelling Wild Pepegas", 
			"<p>If you don't want to fight a Wild Pepega because it's too strong but you want it off the website, you may hold down the Shift key on your keyboard before clicking it in order to \"Repel\" it!</p>" + 
			"<p>This will get rid of the Wild Pepega without you having to battle it.</p>");
		}, tutorialModalDelay);
	} else if(tutorialPhase == "levelUpPrompt"){

		setTimeout(function() {
			showTutorialModal("Now, let's try levelling up your Pepega!", 
			"<p>To level up a Pepega, you need to combine it with two other Pepegas of the same type and level!</p>" + 
			"<p>So three Level 1 Pepegas will combine into a Level 2 Pepega, and three Level 2 Pepegas will combine into a Level 3 Pepega!</p>" + 
			"<p>The highest level a Pepega can get is Level 3! Go ahead and try levelling up your Pepega now!</p>");
		}, tutorialModalDelay);

	}else if(tutorialPhase == "levelUp"){

		tutorialDisplayContent = "Level up your Pepega!";
		tutorialDisplayDescription = "Catch THREE of the same type of Pepega to level it up.";

	} else if(tutorialPhase == "levelUpDone"){

		setTimeout(function() {
			showTutorialModal("Amazing job! Your Pepega has leveled up!", "Now it's less stupid than before!");
		}, tutorialModalDelay);

	} /*else if(tutorialPhase == "breakdownInfo"){

		setTimeout(function() {
			showTutorialModal("How did the battle go against that Wild Pepega?", 
			"<p>You may view the \"Battle Breakdown\" against the Wild Pepega you recently caught by clicking \"Show Breakdown of battle against Wild Pepega\"</p>" + 
			"<p>You can use this to find out how you were able to catch the Wild Pepega, or how you lost to it.</p>" +
			"<p>If any of your Pepegas died during the battle, take a look at the breakdown to find out what killed it!</p>");
		}, tutorialModalDelay);

	} */else if(tutorialPhase == "hoverInfo"){

		setTimeout(function() {
			showTutorialModal("Hovering over stuff with your cursor lets you view their information!", 
			"<p>You may hover over a Pepega with your cursor in your Pepega Army to view its information.</p>" + 
			"<p>You may also release/sell a Pepega by hovering over it then clicking the Release button on its top left.</p>" +
			"<p>Remember, If you don't know what something is, just hover over it!</p>");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "exploreInfo"){

		setTimeout(function() {
			showTutorialModal("A Pepega's Natural Habitat", 
			"<p>Pepegas have a natural habitat that is based on their type, and those habitats are the websites that you visit!</p>" +
			"<p>This means that: you will find more Pepegas of a particular type that is related to the website that you're on!</p>" +
			"<p>For example, you will find more Weebgas on anime websites, and more Kappagas on Twitch!</p>"  +
			"<p>Tip: If you find the Pepegas in a particular website too powerful, you may Filter that site for now and try strengthening your army first in other websites with less powerful Pepegas.</p>");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "buySlotPrompt"){

		setTimeout(function() {
			showTutorialModal("Buy more slots for your Pepega Army.", 
			"<p>Notice how you only have a limited amount of space for Pepegas in your army.</p>" + 
			"<p>You can buy an extra slot by clicking 'Buy a slot' below the Pepega Count. Try it now!</p>" +
			"<p>You might not have enough IQ yet, so just wait and let your Pepegas do their work! You should also catch more Pepegas to gain IQ faster!</p>");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "buySlot"){

		tutorialDisplayContent = "Buy a slot";
		tutorialDisplayDescription = "You can buy an extra slot by clicking 'Buy a slot' below the Pepega Count.\nIf you don't have enough IQ yet to buy one, just wait and let your Pepegas do their work!\nYou should also catch more Pepegas to gain IQ faster!";

	} else if(tutorialPhase == "buySlotDone"){

		setTimeout(function() {
			showTutorialModal("Excellent work!", "Now you have more space for more Pepegas!");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "fusionPrompt"){

		setTimeout(function() {
			showTutorialModal("For your last task, I want you to make a Fusion Pepega.", 
			"<p>Fusing specific Pepegas can create new, different types of Pepegas that are stronger and way smarter.</p>" +
			"<p>However, only Level 3 Pepegas can be used for fusions.</p>" + 
			"<p>Fusions are also done automatically. Once you have all of the required Pepegas for a particular Pepega Fusion, they will automatically fuse.</p>");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "fusionInfo"){

		setTimeout(function() {
			showTutorialModal("You can make any Pepega Fusions to complete this task, but it's recommended to make an Okayga OR a Red Fastga!", 
			"<p>To make an Okayga, you need to fuse THREE Pepegas. That means THREE Level 3 Pepegas, or NINE Level 1 Pepegas in total!</p>" +
			"<p>To make a Red Fastga, you need to fuse ONE Pastorga, and TWO Fastgas. That means a Level 3 Pastorga, and two Level 3 Fastgas!</p>" +
			"<p>Click 'View Fusion Recipes' in the home screen to learn more fusions. Good luck! This might take you a while to complete.</p>");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "fusion"){

		tutorialDisplayContent = "Make a Fusion Pepega";
		tutorialDisplayDescription = "You can make any Pepega Fusions to complete this task, but it's recommended to make an Okayga OR a Red Fastga!\n" + 
			"To make an Okayga, you need to fuse THREE Pepegas. That means THREE Level 3 Pepegas, or NINE Level 1 Pepegas in total!\n" +
			"To make a Red Fastga, you need to fuse ONE Pastorga, and TWO Fastgas. That means a Level 3 Pastorga, and two Level 3 Fastgas!\n"+
			"Click 'View Fusion Recipes' in the home screen to learn more fusions. Good luck! This might take you a while to complete.";

	} else if(tutorialPhase == "fusionDone"){

		setTimeout(function() {
			showTutorialModal("Wonderful! You finally made your first Pepega Fusion!", "Note that Fusions aren't always this simple. Some fusions require multiple different types of Pepegas!");
		}, tutorialModalDelay);

	} else if(tutorialPhase == "complete"){

		setTimeout(function() {
			showTutorialModal("You've completed the tutorial!", 
				"<p>If you need more information about the game, you may <a href=\""+gameLink+"\">visit the game's page</a>!</p>" + 
				"<p>Thank you!</p>");
		}, tutorialModalDelay);

	} 

	if(tutorialDisplayContent != ""){
		document.getElementById("tutorialDisplay").style.display = "block";
		document.getElementById("tutorialDisplayContent").innerHTML = tutorialDisplayContent;
		document.getElementById("tutorialDisplay").title = tutorialDisplayDescription;
	}

	shownTutorialPhase = tutorialPhase;
}

browserStorage.get(["recentBattleBreakdown"], function(result) {
	if(result.recentBattleBreakdown != null){
		recentBattleBreakdown = result.recentBattleBreakdown;
		document.getElementById("battleBreakdownAlertShowWildPepegaName").innerHTML = "Wild " + recentBattleBreakdown.wildPepega.name;
	}
    if(result.recentBattleBreakdown != null && result.recentBattleBreakdown.new){
		showBattleBreakdownAlert();
	}else{
		hideBattleBreakdownAlert();
	}
});
function showBattleBreakdownAlert(){
	document.getElementById("battleBreakdownAlert").style.display = "block";
	document.getElementById("battleBreakdownAlertHide").style.display = "block";
	document.getElementById("battleBreakdownSmallAlert").style.display = "none";
}
function hideBattleBreakdownAlert(){
	document.getElementById("battleBreakdownAlert").style.display = "none";
	document.getElementById("battleBreakdownAlertHide").style.display = "none";
	if(recentBattleBreakdown != null){
		document.getElementById("battleBreakdownSmallAlert").style.display = "block";
		recentBattleBreakdown.new = false;
        browserStorage.set({"recentBattleBreakdown": recentBattleBreakdown});
	}else{
		document.getElementById("battleBreakdownSmallAlert").style.display = "none";
	}
}

function closeTutorialModal(){
	var tutorialPhase = "end";
	if(shownTutorialPhase == "catchPrompt"){
		tutorialPhase = "catch";
	}else if(shownTutorialPhase == "catchDone"){
		tutorialPhase = "repelInfo";
	}else if(shownTutorialPhase == "repelInfo"){
		tutorialPhase = "levelUpPrompt";
	}else if(shownTutorialPhase == "levelUpPrompt"){
		tutorialPhase = "levelUp";
	}else if(shownTutorialPhase == "levelUpDone"){
		tutorialPhase = "hoverInfo";
	}else if(shownTutorialPhase == "hoverInfo"){
		tutorialPhase = "exploreInfo";
	}else if(shownTutorialPhase == "exploreInfo"){
		tutorialPhase = "buySlotPrompt";
	}else if(shownTutorialPhase == "buySlotPrompt"){
		tutorialPhase = "buySlot";
	}else if(shownTutorialPhase == "buySlotDone"){
		tutorialPhase = "fusionPrompt";
	}else if(shownTutorialPhase == "fusionPrompt"){
		tutorialPhase = "fusionInfo";
	}else if(shownTutorialPhase == "fusionInfo"){
		tutorialPhase = "fusion";
	}else if(shownTutorialPhase == "fusionDone"){
		tutorialPhase = "complete";
	}else if(shownTutorialPhase == "complete"){
		tutorialPhase = "end";
	}
	browserRuntime.sendMessage({"message": "update-tutorial-phase", "tutorialPhase": tutorialPhase});
	hideTutorialModal();
}

function setDisplayedRandomTutorialPhase(randomTutorialPhase){
	if(randomTutorialPhase.includes("uniquePepega")){

		showRandomTutorialModal("uniquePepega", "You've acquired a new type of Pepega!", 
		"<p>For every unique type of Pepega you have in your army, your IQ/s multiplier increases!</p>");

	}else if(randomTutorialPhase.includes("rankUp")){

		showRandomTutorialModal("rankUp", "You've ranked up!", 
		"<p>By ranking up, your IQ/s multiplier and your Base Power increases!</p>" +
		"<p>This will help you gain IQ much faster, and also allow you to catch even more powerful Wild Pepegas!</p>");

	}else if(randomTutorialPhase.includes("deadPepega")){

		showRandomTutorialModal("deadPepega", "Oh no! One of your Pepegas died while fighting the Wild Pepega!", 
		"<p>When a Pepega dies, it won't produce any IQ and it won't fight for you.</p>"+
		"<p>To bring it back to life, you can either wait for it to be ressurected (you can see how long this will take by hovering over the dead Pepega with your cursor)...</p>" +
		"<p>OR you can click the Heal button on its top right to instantly ressurect it! Healing, however, costs IQ, and you can view how much it costs by hovering over the Heal button. You also can't heal Pepegas that are close to being fully healed!</p>");
	
	}
	shownRandomTutorialPhase = randomTutorialPhase;
}

function closeRandomTutorialModal(){
	shownRandomTutorialPhase = shownRandomTutorialPhase.replace("_" + document.getElementById("randomTutorialModal").randomTutorialPhase + "_", "");

	browserRuntime.sendMessage({"message": "replace-random-tutorial-phase", "randomTutorialPhase": shownRandomTutorialPhase});
	hideRandomTutorialModal();
}

function showTutorialModal(tutorialTitle, tutorialDescription){
	showModal("tutorialModal");
	document.getElementById("tutorialModalTitle").innerHTML = tutorialTitle;
	document.getElementById("tutorialModalDescription").innerHTML = tutorialDescription;
}
function hideTutorialModal(){
	hideModal("tutorialModal");
	shownTutorialPhase = "";
}

function showRandomTutorialModal(randomTutorialPhase, tutorialTitle, tutorialDescription){
	showModal("randomTutorialModal");
	document.getElementById("randomTutorialModalTitle").innerHTML = tutorialTitle;
	document.getElementById("randomTutorialModalDescription").innerHTML = tutorialDescription;
	document.getElementById("randomTutorialModal").randomTutorialPhase = randomTutorialPhase;
}
function hideRandomTutorialModal(){
	hideModal("randomTutorialModal");
	randomTutorialPhase = "";
}

function setDisplayedPepegaSlots(playerPepegaCount, playerPepegaSlots, pepegaSlotCost){
	document.getElementById("pepegaArmyCountContent").innerHTML = playerPepegaCount + "/" + playerPepegaSlots;
	if(playerPepegaCount == playerPepegaSlots){
		document.getElementById("pepegaArmyCountFull").style.display = "inline";
	}else{
		document.getElementById("pepegaArmyCountFull").style.display = "none";
	}
	if(pepegaSlotCost){
		document.getElementById("buyPepegaSlotCost").innerHTML = formatWithCommas(pepegaSlotCost) + " IQ";
	}
}

var mouseEnterBuyPepegaSlotColor;
var mouseLeaveBuyPepegaSlotColor;
var mouseEnteredBuyPepegaSlot;
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

function setDisplayedFilteredSites(settingsFilteredSites){
	if(settingsFilteredSites != null){
		var settingsFilteredSitesText = settingsFilteredSites.join('\n');
		document.getElementById("siteFiltersModalTextArea").value = settingsFilteredSitesText;

		chrome.tabs.query({'active': true, currentWindow: true},
			function(tabs){
				var siteHostname = new URL(tabs[0].url).hostname;
				if(settingsFilteredSitesText.includes(siteHostname)){
					document.getElementById("quickFilterTitle").innerHTML = "Unfilter Current Site";
				}else{
					document.getElementById("quickFilterTitle").innerHTML = "Filter Current Site";
				}
			}
		);
	}
}

var showBattleBreakdownInitialized = false;
function setDisplayedSettings(settings){
	if(settings.enableSounds != null){
		document.getElementById('enableSoundsCheckmark').checked = settings.enableSounds;
	}
	if(settings.enablePepegaCatchReleaseNotifications != null){
		document.getElementById('enablePepegaCatchReleaseNotificationsCheckmark').checked = settings.enablePepegaCatchReleaseNotifications;
	}
	if(settings.enableRankUpNotifications != null){
		document.getElementById('enableRankUpNotificationsCheckmark').checked = settings.enableRankUpNotifications;
	}
	if(settings.enablePepegaHealNotifications != null){
		document.getElementById('enablePepegaHealNotificationsCheckmark').checked = settings.enablePepegaHealNotifications;
	}
	if(settings.recordOrigin != null){
		document.getElementById('recordOriginCheckmark').checked = settings.recordOrigin;
	}
	if(settings.showBattleBreakdown != null){
		document.getElementById('showBattleBreakdownCheckmark').checked = settings.showBattleBreakdown;
		if(!showBattleBreakdownInitialized && settings.showBattleBreakdown){
			browserStorage.get(["recentBattleBreakdown"], function(result) {
				if(result.recentBattleBreakdown != null && result.recentBattleBreakdown.new){
					showBattleBreakdown();
				}
			});
		}
		showBattleBreakdownInitialized = true;
	}
}

function setDisplayedRank(rank, branch, nextRank, ranksLength){
	var rankTitle = rank.title[0];
	if(rank.title[branch.id]){
		rankTitle = rank.title[branch.id];
	}
	if(rankTitle.length < 21){
		document.getElementById("rankTitle").style.fontSize = "22px";
		document.getElementById("rankContent").style.fontSize = "24px";
	}else{
		document.getElementById("rankTitle").style.fontSize = "18px";
		document.getElementById("rankContent").style.fontSize = "20px";
	}

	var rankDescription = rank.description[0];
	if(rank.description[branch.id]){
		rankDescription = rank.description[branch.id];
	}

	document.getElementById("rankContent").innerHTML = rankTitle;
	document.getElementById("rankContent").title = "Rank " + (ranksLength - rank.id) + " / " + ranksLength + "\n" + rankDescription;
	if(rank.iqpsMultiplier != 1){
		document.getElementById("rankIqpsMultiplier").innerHTML = " x " + rank.iqpsMultiplier.toFixed(2) + "";
		hasRankIqpsMultiplier = true;
	}else{
		document.getElementById("rankIqpsMultiplier").innerHTML = "";
		hasRankIqpsMultiplier = false;
	}

	checkForIqpsMultiplier();

	if(nextRank){
		document.getElementById("nextRank").style.display = "inline";
		document.getElementById("nextRankTitle").innerHTML =  "Prerequisite for ranking up:"
		document.getElementById("nextRankContent").innerHTML =  nextRank.requirementDescription;
	}else{
		document.getElementById("nextRank").style.display = "none";
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
  
function setDisplayedEncounterRate(baseEncounterRate, settingsEncounterMode){
	document.getElementById("encounterRateContent").innerHTML = ((baseEncounterRate) * (settingsEncounterMode.multiplier / 100)) + "%";
	if(settingsEncounterMode.multiplier != 100){
		document.getElementById("encounterRateMultiplier").style.display = "inline";
		document.getElementById("totalEncounterRate").innerHTML = (baseEncounterRate);
		document.getElementById("encounterModeMultiplier").innerHTML = " x " + (settingsEncounterMode.multiplier / 100).toFixed(1);
	}else{
		document.getElementById("encounterRateMultiplier").style.display = "none";
	}
}

function setDisplayedPlayerIqCount(playerIqCount){
	displayedIqCount = playerIqCount;
	document.getElementById("iqCountContent").innerHTML = Math.round(playerIqCount).commarize();
}

function setDisplayedEncounterMode(settingsEncounterMode){
	document.getElementById("encounterModeContent").innerHTML = settingsEncounterMode.name;
}

function setDisplayedIqps(totalIqps, multipliedTotalIqps){
	document.getElementById("totalIqps").innerHTML = formatWithCommas(totalIqps);
	document.getElementById("iqpsContent").innerHTML = formatWithCommas(multipliedTotalIqps);
}

function setDisplayedPower(rankBasePower, totalPepegaPower){
	document.getElementById("powerContent").innerHTML = formatWithCommas((rankBasePower + totalPepegaPower).toFixed(2));
	if(totalPepegaPower > 0){
		document.getElementById("additionalPower").style.display = "inline";
		document.getElementById("rankBasePower").innerHTML = formatWithCommas(Math.round(rankBasePower*100)/100); 
		document.getElementById("totalPepegaPower").innerHTML = " + " + formatWithCommas(Math.round(totalPepegaPower*100)/100);
	}else{
		document.getElementById("additionalPower").style.display = "none";
	}
}

var pepegaElements = [];
var pepegaIndexToCheck = 0;
var interval = setInterval(function() {
	checkPepegas();
}, 300);

function checkPepegas(){
	for(var i = 0; i < pepegaElements.length; i++){
		var currentTime = new Date().getTime();
		var pepegaElement = pepegaElements[i];

		var healButtonElement = pepegaElement.getElementsByClassName("healButton")[0];

		var pepegaAlive = pepegaElement.alive;
		var pepegaTimeOfRecovery = pepegaElement.timeBeforeRecovery;
		var pepegaImageTitle = pepegaElement.pepegaImageTitle;
		var healCostMultiplier = pepegaElement.healCostMultiplier;

		var pepegaImageElement = pepegaElement.getElementsByClassName("pepegaImage")[0];

		var secondsLeft = 0;
		if(!pepegaAlive){
			secondsLeft = Math.round((((pepegaTimeOfRecovery - currentTime)) / 1000));
		}
		if(!pepegaAlive && secondsLeft > allowedPepegaHealingTime){
			var healCost = healCostMultiplier * Math.ceil((secondsLeft / 10));
			if(healCost != pepegaElement.healCost){
				pepegaElement.healCost = healCost;

				if(secondsLeft > 10){
					pepegaImageTitle += "\n\nEstimated time of recovery: " + ((secondsLeft/10)*10) + "+ seconds";
				}else{
					pepegaImageTitle += "\n\nEstimated time of recovery: a few seconds";
				}

				pepegaImageElement.title = pepegaImageTitle;

				healButtonElement.title = "Heal this Pepega. You will lose " + healCost + " IQ";

				if(displayedIqCount >= healCost){
					healButtonElement.style.webkitFilter = "grayscale(0%)";
					healButtonElement.style.filter = "grayscale(0%)";
				}else{
					healButtonElement.style.webkitFilter = "grayscale(100%)";
					healButtonElement.style.filter = "grayscale(100%)";
				}
			}
			if(healButtonElement.style.display != "inline"){
				healButtonElement.style.display = "inline";
			}
		}else if (healButtonElement.style.display != "none"){
			healButtonElement.style.display = "none";
		}
	}
}


var pepegaTemplateElement = document.getElementById("pepegaTemplate");
pepegaTemplateElement.parentNode.removeChild(pepegaTemplateElement);
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

			var pepegaElement = pepegaTemplateElement.cloneNode(true);
			var pepegaImageElement = pepegaElement.getElementsByClassName("pepegaImage")[0];

			currentPepegaArmyRowElement.appendChild(pepegaElement);

			var caughtMessage = "Caught on";
			if(playerPepegas[index].fusioned){
				caughtMessage = "Fusion summoned on";
			}
			pepegaImageElement.src = playerPepegas[index].pepegaType.imageUrl;
			var pepegaDescription = "";
			if(playerPepegas[index].pepegaType.description){
				pepegaDescription = "\nDetails:\n\"" + playerPepegas[index].pepegaType.description + "\"\n";
			}
			var pepegaImageTitle = "Type: " + playerPepegas[index].pepegaType.name + "\n" + pepegaDescription + "\n" + caughtMessage + " " + playerPepegas[index].origin;
			if(playerPepegas[index].date){
				pepegaImageTitle += " at " + playerPepegas[index].date;
			}

			pepegaElement.timeBeforeRecovery = playerPepegas[index].timeBeforeRecovery;
			pepegaElement.alive = playerPepegas[index].alive;
			pepegaElement.pepegaImageTitle = pepegaImageTitle;
			pepegaElement.healCostMultiplier = playerPepegas[index].pepegaType.healCostMultiplier;

			pepegaImageElement.title = pepegaImageTitle;

			pepegaElement.getElementsByClassName("pepegaIqContent")[0].innerHTML = formatWithCommas(playerPepegas[index].pepegaType.iqps * playerPepegas[index].level);

			pepegaElement.getElementsByClassName("pepegaPowerContent")[0].innerHTML = formatWithCommas(Math.round((playerPepegas[index].power * playerPepegas[index].level) * 100)/100);

			if(playerPepegas[index].level <= 2){
				pepegaElement.getElementsByClassName("pepegaStar3")[0].style.display = "none";
				if(playerPepegas[index].level <= 1){
					pepegaElement.getElementsByClassName("pepegaStar2")[0].style.display = "none";
				}
			}

			if(playerPepegas[index].alive){
				pepegaImageElement.style.webkitFilter = "grayscale(0%)"
				pepegaImageElement.style.filter = "grayscale(0%)";
			}else{
				pepegaImageElement.style.webkitFilter = "grayscale(100%)"
				pepegaImageElement.style.filter = "grayscale(100%)";
			}

			pepegaElement.healCost = 0;
			pepegaElement.getElementsByClassName("healButton")[0].healPepegaId = playerPepegas[index].id;
			pepegaElement.getElementsByClassName("healButton")[0].index = index;
			pepegaElement.getElementsByClassName("healButton")[0].addEventListener("click", function(){
				healPlayerPepega(this.healPepegaId, this.index);
			});
			pepegaElement.getElementsByClassName("releaseButton")[0].releasePepegaId = playerPepegas[index].id;
			pepegaElement.getElementsByClassName("releaseButton")[0].releasePepegaName = playerPepegas[index].pepegaType.name;
			pepegaElement.getElementsByClassName("releaseButton")[0].releaseiqReleasePrice = (playerPepegas[index].pepegaType.iqReleasePriceMultiplier * playerPepegas[index].pepegaType.iqps * playerPepegas[index].level);
			pepegaElement.getElementsByClassName("releaseButton")[0].title = "Release this Pepega. You will get " + formatWithCommas((playerPepegas[index].pepegaType.iqReleasePriceMultiplier * playerPepegas[index].pepegaType.iqps * playerPepegas[index].level)) + " IQ";
			pepegaElement.getElementsByClassName("releaseButton")[0].addEventListener("click", function(){
				showReleaseConfirmationModal(this.releasePepegaId, this.releasePepegaName, this.releaseiqReleasePrice);
			});
			pepegaElement.getElementsByClassName("pepegaDisplay")[0].addEventListener("mouseover", function(){
				this.parentNode.getElementsByClassName("releaseButton")[0].style.visibility = "visible";
				this.parentNode.getElementsByClassName("healButton")[0].style.visibility = "visible";
			});
			pepegaElement.getElementsByClassName("pepegaDisplay")[0].addEventListener("mouseout", function(){
				this.parentNode.getElementsByClassName("releaseButton")[0].style.visibility = "hidden";
				this.parentNode.getElementsByClassName("healButton")[0].style.visibility = "hidden";
			});
		}

		pepegaElements = document.getElementsByClassName("pepega");

		pepegaArmyContentElement.appendChild(currentPepegaArmyRowElement);
	}else{
		document.getElementById("noPepegasMessage").style.display = "block";
	}

	if(uniquePepegaIqpsMultiplier != 1){
		document.getElementById("uniquePepegaIqpsMultiplier").innerHTML = " x " + uniquePepegaIqpsMultiplier.toFixed(2) + "";
		hasUniquePepegaIqpsMultiplier = true;
	}else{
		document.getElementById("uniquePepegaIqpsMultiplier").innerHTML = "";
		hasUniquePepegaIqpsMultiplier = false;
	}
	checkForIqpsMultiplier();

	checkPepegas();
}

function checkForIqpsMultiplier(){
	if(hasRankIqpsMultiplier || hasUniquePepegaIqpsMultiplier){
		document.getElementById("iqpsMultiplier").style.display = "inline";
	}else{
		document.getElementById("iqpsMultiplier").style.display = "none";
	}
}

function healPlayerPepega(playerPepegaId, pepegaElementIndex){
	var healCost = pepegaElements[pepegaElementIndex].healCost;
	browserRuntime.sendMessage({"message": "heal-player-pepega", "playerPepegaId": playerPepegaId, "healCost": healCost});
}

var selectedPlayerPepegaId = null;

function showReleaseConfirmationModal(playerPepegaId, playerPepegaName, playerPepegaIqReleasePrice){
	showModal("releaseConfirmationModal");

	document.getElementById("releaseConfirmationModalPepegaName").innerHTML = playerPepegaName;
	document.getElementById("releaseConfirmationModalPepegaIqReleasePrice").innerHTML = playerPepegaIqReleasePrice;
	selectedPlayerPepegaId = playerPepegaId;
}
function hideReleaseConfirmationModal(){
	hideModal("releaseConfirmationModal");

	selectedPlayerPepegaId = null;
}

function showSiteFiltersModal(){
	showModal("siteFiltersModal");
}
function showSettingsModal(){
	showModal("settingsModal");
}
function hideSiteFiltersModal(){
	hideModal("siteFiltersModal");
}
function hideSettingsModal(){
	hideModal("settingsModal");
}

function showRenameArmyModal(){
	showModal("renameArmyModal");
}
function hideRenameArmyModal(){
	hideModal("renameArmyModal");
}

function clearPepegaArmyContent(){
	document.getElementById("pepegaArmyContent").innerHTML = "";
}

function showModal(modalId){
	modalYPosition = window.scrollY;
	document.getElementById(modalId).style.display = "block";
	document.getElementById(modalId).style.top = modalYPosition + "px";
}
function hideModal(modalId){
	modalYPosition = null
	document.getElementById(modalId).style.display = "none";
}
var modalYPosition = null;
window.onscroll = function () { 
	if(modalYPosition != null){
		window.scrollTo(0, modalYPosition); 
	}
};

function releasePlayerPepega(){
	browserRuntime.sendMessage({"message": "release-player-pepega", "playerPepegaId": selectedPlayerPepegaId}, function() {
		hideReleaseConfirmationModal();
	});
}

function updateSettings(){
	var settings = {};
	settings.enableSounds = document.getElementById('enableSoundsCheckmark').checked;
	settings.enablePepegaCatchReleaseNotifications = document.getElementById('enablePepegaCatchReleaseNotificationsCheckmark').checked;
	settings.enableRankUpNotifications = document.getElementById('enableRankUpNotificationsCheckmark').checked;
	settings.enablePepegaHealNotifications = document.getElementById('enablePepegaHealNotificationsCheckmark').checked;
	settings.recordOrigin = document.getElementById('recordOriginCheckmark').checked;
	settings.showBattleBreakdown = document.getElementById('showBattleBreakdownCheckmark').checked;

	browserRuntime.sendMessage({"message": "update-settings", "settings": settings}, function() {
		hideSettingsModal();
	});
}

function quickFilterSite(){
	chrome.tabs.query({'active': true, currentWindow: true},
		function(tabs){
			var site = new URL(tabs[0].url);
			var siteFilterLines = document.getElementById("siteFiltersModalTextArea").value.split("\n");
			var included = false;
			for(var i = 0; i < siteFilterLines.length; i++){
				if(siteFilterLines[i] != "" && site.href.includes(siteFilterLines[i])){
					siteFilterLines[i] = "";
					included = true;
					break;
				}
			}
			if(!included){
				siteFilterLines.push(site.hostname);
			}
			document.getElementById("siteFiltersModalTextArea").value = "";
			for(var i = 0; i < siteFilterLines.length; i++){
				if(siteFilterLines[i] != ""){
					document.getElementById("siteFiltersModalTextArea").value += siteFilterLines[i] + "\n";
				}
			}
			updateFilteredSites();
		}
	);
}

function updateArmyName(){
	browserRuntime.sendMessage({"message": "update-player-army-name", "playerArmyName": document.getElementById("renameArmyInputBox").value}, function() {
		hideRenameArmyModal();
	});
}

function updateEncounterMode(){
	browserRuntime.sendMessage({"message": "update-config-encounter-mode"});
}

function updateFilteredSites(){
	browserRuntime.sendMessage({"message": "update-config-filtered-sites", "filteredSitesText": document.getElementById("siteFiltersModalTextArea").value});
}

function buyPepegaSlot(){
	browserRuntime.sendMessage({"message": "buy-pepega-slot"});
}

function openGameLink(){
	browserTabs.create({ url: gameLink });
}
function openGameIssuesLink(){
	browserTabs.create({ url: gameIssuesLink });
}

function answerTutorialAskModal(isTutorialAnswerYes){
	browserRuntime.sendMessage({"message": "answer-tutorial-ask", "tutorialAnswer": isTutorialAnswerYes});
	hideModal("tutorialAskModal");
}

function resetTutorial(){
	hideSettingsModal();
	browserRuntime.sendMessage({"message": "reset-tutorial"});
}

function showBattleBreakdown(){
	window.location.href=browserRuntime.getURL("src/popup/battleBreakdown/battleBreakdown.html");
}
function showFusionRecipes(){
	window.location.href=browserRuntime.getURL("src/popup/fusionRecipes/fusionRecipes.html");
}

document.getElementById("releaseConfirmationModalNo").addEventListener("click", hideReleaseConfirmationModal);
document.getElementById("releaseConfirmationModalYes").addEventListener("click", releasePlayerPepega);
document.getElementById("pepegaArmyTitle").addEventListener("click", showRenameArmyModal);
document.getElementById("renameArmyModalClose").addEventListener("click", updateArmyName);
document.getElementById("buyPepegaSlot").addEventListener("click", buyPepegaSlot);
document.getElementById("buyPepegaSlot").addEventListener("mouseenter", mouseEntertDisplayedPepegaSlots);
document.getElementById("buyPepegaSlot").addEventListener("mouseleave", mouseLeavetDisplayedPepegaSlots);
document.getElementById("settingsTitle").addEventListener("click", showSettingsModal);
document.getElementById("settingsModalClose").addEventListener("click", updateSettings);
document.getElementById("siteFilters").addEventListener("click", showSiteFiltersModal);
document.getElementById("siteFiltersModalClose").addEventListener("click", hideSiteFiltersModal);
document.getElementById("gameTitle").addEventListener("click", openGameLink);
document.getElementById("gameFeedback").addEventListener("click", openGameIssuesLink);
document.getElementById("encounterModeTitle").addEventListener("click", updateEncounterMode);
document.getElementById("encounterRateTitle").addEventListener("click", updateEncounterMode);
document.getElementById("quickFilterTitle").addEventListener("click", quickFilterSite);
document.getElementById("tutorialAskModalNo").addEventListener("click", function() { answerTutorialAskModal(false); } );
document.getElementById("tutorialAskModalYes").addEventListener("click", function() { answerTutorialAskModal(true); } );
document.getElementById("tutorialModalClose").addEventListener("click", function() { closeTutorialModal(); } );
document.getElementById("randomTutorialModalClose").addEventListener("click", function() { closeRandomTutorialModal(); } );
document.getElementById("resetTutorial").addEventListener("click", resetTutorial);
document.getElementById("battleBreakdownAlertShow").addEventListener("click", showBattleBreakdown);
document.getElementById("battleBreakdownAlertHide").addEventListener("click", hideBattleBreakdownAlert);
document.getElementById("battleBreakdownSmallAlert").addEventListener("click", showBattleBreakdown);
document.getElementById("fusionRecipesTitle").addEventListener("click", showFusionRecipes);