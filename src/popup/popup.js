const EventMessageEnum = {
    "UpdateAllPopupDisplays":3, 
    "ReleasePlayerPepega":4,
    "UpdateSettings":5,
    "UpdateConfigEncounterMode":6,
    "UpdateConfigFilteredSites":7,
    "UpdatePlayerArmyName":8,
    "BuyPepegaSlot":9,
    "AnswerTutorialAsk":10,
    "UpdateTutorialPhase":11,
    "ReplaceRandomTutorialPhase":13,
    "ResetTutorial":14,
    "HealPlayerPepega":15,
    "UpdateSavedScrollPosition":18,
    "GetSavedScrollPosition":19,
    "ChangeIqCountUnitization":20,
    "NotificationsDisplayUpdated":21,
    "PlayerPepegaSlotsUpdated":22,
    "IdleUpdated":23,
    "PlayerIqCountUpdated":24,
    "PlayerPepegasUpdated":25,
    "SettingsUpdated":26,
    "PlayerArmyNameUpdated":27,
    "ConfigEncounterModeUpdated":28,
    "ConfigIsIqCountUnitizedUpdated":29,
    "ConfigFilteredSitesUpdated":30,
    "TutorialPhaseUpdated":31,
    "ShowRandomTutorial":32,
    "LoadData":33,
    "LoadDataErrorUpdated":34,
    "SaveData":35
}

const TutorialPhaseEnum = {
	"Ask":0,
	"CatchPrompt":1,
	"Catch":2,
	"CatchDone":3,
	"RepelInfo":4,
	"LevelUpPrompt":5,
	"LevelUp":6,
	"LevelUpDone":7,
	"BreakdownInfo":8,
	"HoverInfo":9,
	"ExploreInfo":10,
	"BuySlotPrompt":11,
	"BuySlot":12,
	"BuySlotDone":13,
	"IdleInfo":14,
	"FusionPrompt":15,
	"FusionInfo":16,
	"Fusion":17,
	"FusionDone":18,
	"Complete":19,
	"End":20
}

const RandomTutorialPhaseEnum = {
	"UniquePepega":0,
	"RankUp":1,
	"DeadPepega":2,
}

const isBeta = true;
const gameLink = "https://github.com/Alycse/PepegaCatch";
const gameIssuesLink = "https://github.com/Alycse/PepegaCatch/issues/new/choose";
const gameTitle = "Pepega Catch!";

const pepegasPerRow = 100;
const defaultInputBoxArmyName = "My Pepega Army";

const allowedPepegaHealingTime = 2;

const deadPepegaMinimumCountForHealAll = 10;

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
		switch(request.message){
			case EventMessageEnum.PlayerIqCountUpdated:
				setDisplayedPlayerIqCount(request.playerIqCount);
				setDisplayedRank(request.rank, request.branch, request.nextRank, request.ranksLength, request.isBeforeLastRank);
				setDisplayedPepegaSlotCostAvailability(request.playerIqCount, request.pepegaSlotCost);
				sendResponse();
				break;
			case EventMessageEnum.PlayerPepegasUpdated:
				setDisplayedPlayerPepegas(request.playerPepegas, request.uniquePepegaIqpsMultiplier);
				setDisplayedEncounterRate(request.baseEncounterRate, request.configEncounterMode);
				setDisplayedPepegaSlots(request.playerPepegas.length, request.playerPepegaSlots);
				setDisplayedIqps(request.totalIqps, request.multipliedTotalIqps);
				setDisplayedPower(request.rankBasePower, request.totalPepegaPower);
				sendResponse();
				break;
			case EventMessageEnum.SettingsUpdated:
				setDisplayedSettings(request.settings);
				sendResponse();
				break;
			case EventMessageEnum.PlayerArmyNameUpdated:
				setDisplayedArmyName(request.playerArmyName, request.isDefaultArmyName);
				sendResponse();
				break;
			case EventMessageEnum.NotificationsDisplayUpdated:
				setDisplayedNotifications(request.notificationsDisplayHeader, request.notificationsDisplayMessage);
				sendResponse();
				break;
			case EventMessageEnum.PlayerPepegaSlotsUpdated:
				setDisplayedPepegaSlots(request.playerPepegaCount, request.playerPepegaSlots, request.pepegaSlotCost);
				setDisplayedPepegaSlotCostAvailability(request.playerIqCount, request.pepegaSlotCost);
				sendResponse();
				break;
			case EventMessageEnum.ConfigEncounterModeUpdated:
				setDisplayedEncounterMode(request.configEncounterMode);
				setDisplayedEncounterRate(request.baseEncounterRate, request.configEncounterMode);
				sendResponse();
				break;
			case EventMessageEnum.ConfigFilteredSitesUpdated:
				setDisplayedFilteredSites(request.configFilteredSites);
				sendResponse();
				break;
			case EventMessageEnum.TutorialPhaseUpdated:
				setDisplayedTutorialPhase(request.tutorialPhase);
				sendResponse();
				break;
			case EventMessageEnum.ShowRandomTutorial:
				setDisplayedRandomTutorialPhase(request.randomTutorialPhase);
				sendResponse();
				break;
			case EventMessageEnum.ConfigIsIqCountUnitizedUpdated:
				setDisplayedIsIqCountUnitized(request.configIsIqCountUnitized, request.playerIqCount);
				sendResponse();
				break;
			case EventMessageEnum.IdleUpdated:
				setDisplayedIdle(request.isPlayerIdle, request.idleIqMultiplier);
				sendResponse();
				break;
			case EventMessageEnum.LoadDataErrorUpdated:
				setDisplayedLoadDataError(request.errorMessage);
				sendResponse();
				break;
			default:
				sendResponse();
		}
	}
);

function setDisplayedLoadDataError(errorMessage){
	document.getElementById("loadModalError").innerHTML = errorMessage;
}

function setDisplayedIdle(isPlayerIdle, idleIqMultiplier){
	if(isPlayerIdle){
		document.getElementById("idleIqMultiplier").innerHTML = " x " + idleIqMultiplier.toFixed(2) + "";
	}else{
		document.getElementById("idleIqMultiplier").innerHTML = "";
	}
}

browserRuntime.sendMessage({"message": EventMessageEnum.UpdateAllPopupDisplays});
browserRuntime.sendMessage({"message": EventMessageEnum.GetSavedScrollPosition}, function(result) {
	window.scrollTo(0, result.y);
});

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

	switch (tutorialPhase){
		case TutorialPhaseEnum.Ask:
			setTimeout(function() {
				showModal("tutorialAskModal");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.CatchPrompt:
			setTimeout(function() {
				showTutorialModal("Let's catch your first Pepega!", 
				"<p>Go to any website, find the Wild Pepega hiding within the page, then click it!</p>" + 
				"<p>You and your Pepega Army will then battle the Wild Pepega (Don't worry, this is all done automatically!)</p>" +
				"<p>But since you don't have any Pepegas yet, you're gonna have to defeat it by yourself!</p>" +
				"<p>Try catching one now! You may hover over the Wild Pepega to see its name and power.</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.Catch:
			tutorialDisplayContent = "Catch your first Pepega!";
			tutorialDisplayDescription = "Go to any website, find the Wild Pepega hiding within the page, then click it!\n" + 
			"You and your Pepega Army will then battle the Wild Pepega (Don't worry, this is all done automatically!)\n" + 
			"But since you don't have any Pepegas yet, you're gonna have to defeat it yourself!\n"+
			"Try catching one now! You may hover over the Wild Pepega to see its name and power.";
			break;
		case TutorialPhaseEnum.CatchDone:
			setTimeout(function() {
				showTutorialModal("Great! You caught your first Pepega!", 
				"<p>This Pepega will increase the amount of IQ you get per second, " +
				"and it will also fight for you when you're catching more Wild Pepegas!</p>" +
				"<p>Your Total Power is your rank's base power combined with your Pepegas' power, which you can find on your home screen.</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.RepelInfo:
			setTimeout(function() {
				showTutorialModal("Repelling Wild Pepegas", 
				"<p>If you don't want to fight a Wild Pepega because it's too strong but you want it off the website, you may hold down the Shift key on your keyboard before clicking it in order to \"Repel\" it!</p>" + 
				"<p>This will get rid of the Wild Pepega without you having to battle it.</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.LevelUpPrompt:
			setTimeout(function() {
				showTutorialModal("Now, let's try levelling up your Pepega!", 
				"<p>To level up a Pepega, you need to combine it with two other Pepegas of the same type and level!</p>" + 
				"<p>So three Level 1 Pepegas will combine into a Level 2 Pepega, and three Level 2 Pepegas will combine into a Level 3 Pepega!</p>" + 
				"<p>The highest level a Pepega can get is Level 3! Go ahead and try levelling up your Pepega now!</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.LevelUp:
			tutorialDisplayContent = "Level up your Pepega!";
			tutorialDisplayDescription = "Catch THREE of the same type of Pepega to level it up.";
			break;
		case TutorialPhaseEnum.LevelUpDone:
			setTimeout(function() {
				showTutorialModal("Amazing job! Your Pepega has leveled up!", "Now it's less stupid than before!");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.HoverInfo:
			setTimeout(function() {
				showTutorialModal("Hovering over stuff with your cursor lets you view their information!", 
				"<p>You may hover over a Pepega with your cursor in your Pepega Army to view its information.</p>" + 
				"<p>You may also release/sell a Pepega by hovering over it then clicking the Release button on its top left.</p>" +
				"<p>Remember, If you don't know what something is, just hover over it!</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.ExploreInfo:
			setTimeout(function() {
				showTutorialModal("A Pepega's Natural Habitat", 
				"<p>Pepegas have a natural habitat that is based on their type, and those habitats are the websites that you visit!</p>" +
				"<p>This means that: you will find more Pepegas of a particular type that is related to the website that you're on!</p>" +
				"<p>For example, you will find more Weebgas on anime websites, and more Kappagas on Twitch!</p>"  +
				"<p>Tip: If you find the Pepegas in a particular website too powerful, you may Filter that site for now and try strengthening your army first in other websites with less powerful Pepegas.</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.BuySlotPrompt:
			setTimeout(function() {
				showTutorialModal("Buy more slots for your Pepega Army.", 
				"<p>Notice how you only have a limited amount of space for Pepegas in your army.</p>" + 
				"<p>You can buy an extra slot by clicking 'Buy a slot' below the Pepega Count. Try it now!</p>" +
				"<p>You might not have enough IQ yet, so just wait and let your Pepegas do their work! You should also catch more Pepegas to gain IQ faster!</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.BuySlot:
			tutorialDisplayContent = "Buy a slot";
			tutorialDisplayDescription = "You can buy an extra slot by clicking 'Buy a slot' below the Pepega Count.\nIf you don't have enough IQ yet to buy one, just wait and let your Pepegas do their work!\nYou should also catch more Pepegas to gain IQ faster!";
			break;
		case TutorialPhaseEnum.BuySlotDone:
			setTimeout(function() {
				showTutorialModal("Excellent work!", "Now you have more space for more Pepegas!");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.IdleInfo:
			setTimeout(function() {
				showTutorialModal("\"AFK\"", 
				"<p>When your machine is idle for more than 30 minutes, your Pepegas only generate half as much IQ!</p>" + 
				"<p>Pepegas can be pretty lazy when their trainer is away.</p>" +
				"<p>(This does NOT mean you need to open the browser extension popup every 30 minutes! Your cursor just needs to be moving inside the browser.)</p>")
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.FusionPrompt:
			setTimeout(function() {
				showTutorialModal("For your last task, I want you to make a Fusion Pepega.", 
				"<p>Fusing Pepegas can create new, different types of Pepegas that are stronger and way smarter.</p>" +
				"<p>However, only Level 3 Pepegas can be used for fusions.</p>" + 
				"<p>Fusions are also done automatically. Once you have all of the required Pepegas for a particular Pepega Fusion, they will automatically fuse.</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.FusionInfo:
			setTimeout(function() {
				showTutorialModal("You can make any Pepega Fusions to complete this task, but it's recommended to make an Okayga OR a Red Fastga!", 
				"<p>To make an Okayga, you need to fuse THREE Pepegas. That means THREE Level 3 Pepegas, or 27 Level 1 Pepegas in total!</p>" +
				"<p>To make a Red Fastga, you need to fuse ONE Pastorga, and TWO Fastgas. That means a Level 3 Pastorga, and two Level 3 Fastgas!</p>" +
				"<p>Click 'View Fusion Recipes' in the home screen to learn more fusions. Good luck! This might take you a while to complete.</p>");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.Fusion:
			tutorialDisplayContent = "Make a Fusion Pepega";
			tutorialDisplayDescription = "You can make any Pepega Fusions to complete this task, but it's recommended to make an Okayga OR a Red Fastga!\n" + 
				"To make an Okayga, you need to fuse THREE Pepegas. That means THREE Level 3 Pepegas, or 27 Level 1 Pepegas in total!\n" +
				"To make a Red Fastga, you need to fuse ONE Pastorga, and TWO Fastgas. That means a Level 3 Pastorga, and two Level 3 Fastgas!\n"+
				"Click 'View Fusion Recipes' in the home screen to learn more fusions. Good luck! This might take you a while to complete.";
			break;
		case TutorialPhaseEnum.FusionDone:
			setTimeout(function() {
				showTutorialModal("Wonderful! You made your first Pepega Fusion!", "Note that Fusions aren't always this simple. Some fusions require multiple different types of Pepegas!");
			}, tutorialModalDelay);
			break;
		case TutorialPhaseEnum.Complete:
			setTimeout(function() {
				showTutorialModal("You've completed the tutorial!", 
					"<p>If you need more information about the game, you may <span id=\"gameLink\">visit the game's page</span>!</p>" + 
					"<p>Thank you!</p>");
				document.getElementById("gameLink").addEventListener("click", openGameLink);
			}, tutorialModalDelay);
			break;
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
	var tutorialPhase = TutorialPhaseEnum.End;

	switch (shownTutorialPhase){
		case TutorialPhaseEnum.CatchPrompt:
			tutorialPhase = TutorialPhaseEnum.Catch;
			break;
		case TutorialPhaseEnum.CatchDone:
			tutorialPhase = TutorialPhaseEnum.RepelInfo;
			break;
		case TutorialPhaseEnum.RepelInfo:
			tutorialPhase = TutorialPhaseEnum.LevelUpPrompt;
			break;
		case TutorialPhaseEnum.LevelUpPrompt:
			tutorialPhase = TutorialPhaseEnum.LevelUp;
			break;
		case TutorialPhaseEnum.LevelUpDone:
			tutorialPhase = TutorialPhaseEnum.HoverInfo;
			break;
		case TutorialPhaseEnum.HoverInfo:
			tutorialPhase = TutorialPhaseEnum.ExploreInfo;
			break;
		case TutorialPhaseEnum.ExploreInfo:
			tutorialPhase = TutorialPhaseEnum.BuySlotPrompt;
			break;
		case TutorialPhaseEnum.BuySlotPrompt:
			tutorialPhase = TutorialPhaseEnum.BuySlot;
			break;
		case TutorialPhaseEnum.BuySlotDone:
			tutorialPhase = TutorialPhaseEnum.IdleInfo;
			break;
		case TutorialPhaseEnum.IdleInfo:
			tutorialPhase = TutorialPhaseEnum.FusionPrompt;
			break;
		case TutorialPhaseEnum.FusionPrompt:
			tutorialPhase = TutorialPhaseEnum.FusionInfo;
			break;
		case TutorialPhaseEnum.FusionInfo:
			tutorialPhase = TutorialPhaseEnum.Fusion;
			break;
		case TutorialPhaseEnum.FusionDone:
			tutorialPhase = TutorialPhaseEnum.Complete;
			break;
		case TutorialPhaseEnum.Complete:
			tutorialPhase = TutorialPhaseEnum.End;
			break;
	}

	browserRuntime.sendMessage({"message": EventMessageEnum.UpdateTutorialPhase, "tutorialPhase": tutorialPhase});
	hideTutorialModal();
}

function setDisplayedRandomTutorialPhase(randomTutorialPhase){
	switch (randomTutorialPhase){
		case RandomTutorialPhaseEnum.UniquePepega:
			showRandomTutorialModal(RandomTutorialPhaseEnum.UniquePepega, "You've acquired a new type of Pepega!", 
			"<p>For every unique type of Pepega you have in your army, your IQ/s multiplier increases!</p>");
			break;
		case RandomTutorialPhaseEnum.RankUp:
			showRandomTutorialModal(RandomTutorialPhaseEnum.RankUp, "You've ranked up!", 
			"<p>By ranking up, your IQ/s multiplier and your Base Power increases!</p>" +
			"<p>This will help you gain IQ much faster, and also allow you to catch even more powerful Wild Pepegas!</p>");
			break;
		case RandomTutorialPhaseEnum.DeadPepega:
			showRandomTutorialModal(RandomTutorialPhaseEnum.DeadPepega, "Oh no! One of your Pepegas died while fighting the Wild Pepega!", 
			"<p>When a Pepega dies, it won't produce any IQ and it won't fight for you.</p>"+
			"<p>To bring it back to life, you can either wait for it to be ressurected (you can see how long this will take by hovering over the dead Pepega with your cursor)...</p>" +
			"<p>OR you can click the Heal button on its top right to instantly ressurect it! Healing, however, costs IQ, and you can view how much it costs by hovering over the Heal button.</p>" + 
			"<p>Remember, you can hover your cursor over the Wild Pepega on the website to find out if it's too strong for your army!</p>");
			break;
	}

	shownRandomTutorialPhase = randomTutorialPhase;
}

function closeRandomTutorialModal(){
	shownRandomTutorialPhase = -1;

	browserRuntime.sendMessage({"message": EventMessageEnum.ReplaceRandomTutorialPhase, "randomTutorialPhase": shownRandomTutorialPhase});
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
function mouseEnterDisplayedPepegaSlots(){
	document.getElementById("buyPepegaSlot").style.color = mouseEnterBuyPepegaSlotColor;
	mouseEnteredBuyPepegaSlot = true;
}
function mouseLeaveDisplayedPepegaSlots(){
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
		var settingsFilteredSitesText = "";
		for(var i in settingsFilteredSites){
			if(i != ""){
				settingsFilteredSitesText += i + "\n";
			}
		}

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

function unitize() {
	if (this >= 1000000) {
	  	var units = ["Million", "Billion", "Trillion", "Quadrillion"];
	  	let unit = Math.floor(((this).toFixed(0).length - 1) / 3) * 3;
	  	var num = (this / ('1e'+unit)).toFixed(2);
	  	var unitname = units[Math.floor(unit / 3) - 2];
	  	return num + " " + unitname;
	}
	return this.toLocaleString();
}
Number.prototype.unitize = unitize;
String.prototype.unitize = unitize;

var isIqCountUnitized = true;

function setDisplayedPlayerIqCount(playerIqCount){
	displayedIqCount = playerIqCount;
	if(isIqCountUnitized){
		document.getElementById("iqCountContent").innerHTML = Math.round(playerIqCount).unitize();
	}else{
		document.getElementById("iqCountContent").innerHTML = Math.round(playerIqCount).toLocaleString();
	}
}

function changeIqCountUnitization(){
	browserRuntime.sendMessage({"message": EventMessageEnum.ChangeIqCountUnitization});
}

function setDisplayedIsIqCountUnitized(unitize, playerIqCount){
	isIqCountUnitized = unitize;
	setDisplayedPlayerIqCount(playerIqCount)
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
	var deadPepegaCount = 0;
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
			deadPepegaCount++;
		}
		if(secondsLeft > allowedPepegaHealingTime){
			var healCost = healCostMultiplier * Math.ceil((secondsLeft / 10));
			if(healCost != pepegaElement.healCost){
				pepegaElement.healCost = healCost;

				if(secondsLeft > 10){
					pepegaImageTitle += "\n\nEstimated time of recovery: " + ((secondsLeft/10)*10) + "+ seconds";
				}else{
					pepegaImageTitle += "\n\nEstimated time of recovery: a few seconds";
				}

				pepegaImageElement.title = pepegaImageTitle;

				healButtonElement.title = "Heal this Pepega. This will cost you " + healCost + " IQ.";

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
	if(deadPepegaCount < deadPepegaMinimumCountForHealAll){
		hideHealAllPepegasButton();
	}else{
		showHealAllPepegasButton();
	}
}

function showHealAllPepegasButton(){
	document.getElementById("healAllPepegas").style.display = "inline";
	document.getElementById("pepegaArmyOptionSeperator").style.display = "inline";
}
function hideHealAllPepegasButton(){
	document.getElementById("healAllPepegas").style.display = "none";
	document.getElementById("pepegaArmyOptionSeperator").style.display = "none";
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
			pepegaElement.id = playerPepegas[index].id;
			pepegaElement.index = index;
			pepegaElement.getElementsByClassName("healButton")[0].healPepegaId = playerPepegas[index].id;
			pepegaElement.getElementsByClassName("healButton")[0].index = index;
			pepegaElement.getElementsByClassName("healButton")[0].addEventListener("click", function(){
				healPlayerPepega(this.healPepegaId, this.index, true, true, true, false);
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

function healPlayerPepega(playerPepegaId, pepegaElementIndex, willNotify, willPlaySound, willUpdatePopupDisplay, healAll){
	var healCost = pepegaElements[pepegaElementIndex].healCost;
	browserRuntime.sendMessage({
		"message": EventMessageEnum.HealPlayerPepega, "playerPepegaId": playerPepegaId, "healCost": healCost,
			"willNotify": willNotify, "willPlaySound": willPlaySound, "willUpdatePopupDisplay": willUpdatePopupDisplay, "healAll" : healAll});
}

function healAllPlayerPepegas(){
	for(var i = 0; i < pepegaElements.length; i++){
		healPlayerPepega(pepegaElements[i].id, i, false, false, false, true);
	}
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

function releasePlayerPepega(){
	browserRuntime.sendMessage({"message": EventMessageEnum.ReleasePlayerPepega, "playerPepegaId": selectedPlayerPepegaId}, function() {
		hideReleaseConfirmationModal();
	});
}

function showLoadModal(){
	showModal("loadModal");
}
function hideLoadModal(){
	setDisplayedLoadDataError("");
	hideModal("loadModal");
}

function showSiteFiltersModal(){
	showModal("siteFiltersModal");
}
function showSettingsModal(){
	showModal("settingsModal");
}
function hideSiteFiltersModal(){
	updateFilteredSites();
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
	browserRuntime.sendMessage({"message": EventMessageEnum.UpdateSavedScrollPosition, "y": window.scrollY});
};

function updateSettings(){
	var settings = {};
	settings.enableSounds = document.getElementById('enableSoundsCheckmark').checked;
	settings.enablePepegaCatchReleaseNotifications = document.getElementById('enablePepegaCatchReleaseNotificationsCheckmark').checked;
	settings.enableRankUpNotifications = document.getElementById('enableRankUpNotificationsCheckmark').checked;
	settings.enablePepegaHealNotifications = document.getElementById('enablePepegaHealNotificationsCheckmark').checked;
	settings.recordOrigin = document.getElementById('recordOriginCheckmark').checked;
	settings.showBattleBreakdown = document.getElementById('showBattleBreakdownCheckmark').checked;

	browserRuntime.sendMessage({"message": EventMessageEnum.UpdateSettings, "settings": settings}, function() {
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
	browserRuntime.sendMessage({"message": EventMessageEnum.UpdatePlayerArmyName, "playerArmyName": document.getElementById("renameArmyInputBox").value}, function() {
		hideRenameArmyModal();
	});
}

function updateEncounterMode(){
	browserRuntime.sendMessage({"message": EventMessageEnum.UpdateConfigEncounterMode});
}

function updateFilteredSites(){
	browserRuntime.sendMessage({"message": EventMessageEnum.UpdateConfigFilteredSites, "filteredSitesText": document.getElementById("siteFiltersModalTextArea").value});
}

function buyPepegaSlot(){
	browserRuntime.sendMessage({"message": EventMessageEnum.BuyPepegaSlot});
}

function openGameLink(){
	browserTabs.create({ url: gameLink });
}
function openGameIssuesLink(){
	browserTabs.create({ url: gameIssuesLink });
}

function answerTutorialAskModal(isTutorialAnswerYes){
	browserRuntime.sendMessage({"message": EventMessageEnum.AnswerTutorialAsk, "tutorialAnswer": isTutorialAnswerYes});
	hideModal("tutorialAskModal");
}

function resetTutorial(){
	hideSettingsModal();
	browserRuntime.sendMessage({"message": EventMessageEnum.ResetTutorial});
}

function showBattleBreakdown(){
	window.location.href=browserRuntime.getURL("src/popup/battleBreakdown/battleBreakdown.html");
}
function showFusionRecipes(){
	window.location.href=browserRuntime.getURL("src/popup/fusionRecipes/fusionRecipes.html");
}

function loadData(){
	browserRuntime.sendMessage({"message": EventMessageEnum.LoadData, "loadData": document.getElementById("loadDataInputBox").value});
}

function saveData(){
	browserRuntime.sendMessage({"message": EventMessageEnum.SaveData});
}

document.getElementById("releaseConfirmationModalNo").addEventListener("click", hideReleaseConfirmationModal);
document.getElementById("releaseConfirmationModalYes").addEventListener("click", releasePlayerPepega);
document.getElementById("pepegaArmyTitle").addEventListener("click", showRenameArmyModal);
document.getElementById("renameArmyModalClose").addEventListener("click", updateArmyName);

document.getElementById("buyPepegaSlot").addEventListener("click", buyPepegaSlot);
document.getElementById("buyPepegaSlot").addEventListener("mouseenter", mouseEnterDisplayedPepegaSlots);
document.getElementById("buyPepegaSlot").addEventListener("mouseleave", mouseLeaveDisplayedPepegaSlots);

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
document.getElementById("iqCountContent").addEventListener("click", changeIqCountUnitization);

document.getElementById("showLoadModal").addEventListener("click", showLoadModal);
document.getElementById("hideLoadModal").addEventListener("click", hideLoadModal);
document.getElementById("loadData").addEventListener("click", loadData);

document.getElementById("save").addEventListener("click", saveData);

document.getElementById("healAllPepegas").addEventListener("click", healAllPlayerPepegas);