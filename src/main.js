const maxPlayerIqCount = 9999999999999999;
const maxPepegaSlots = 100;
const updateIqCountMillisecondInterval = 1000;
const defaultPepegaOrigin = "the internet";
const defaultArmyName = "Click here to change your Pepega Army's name";
const multiplesBeforeLevelUp = 3;
const maxPepegaLevel = 3;
const startingPlayerPepegaSlots = 3;
const maxArmyNameLength = 64;
const iqpsMultiplierForEachUniquePepega = 0.2;
const baseEncounterRate = 50;

var pepegaCatchSound = new Audio(chrome.runtime.getURL("sounds/pepega-catch.ogg"));
var pepegaReleaseSound = new Audio(chrome.runtime.getURL("sounds/pepega-release.ogg"));
var pepegaFullArmySound = new Audio(chrome.runtime.getURL("sounds/pepega-full-army.ogg"));
var pepegaLevelSound = new Audio(chrome.runtime.getURL("sounds/pepega-level.ogg"));
var pepegaFusionSound = new Audio(chrome.runtime.getURL("sounds/pepega-fusion.ogg"));

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
		}else if(request.message == "release-player-pepega"){
			releasePlayerPepega(request.playerPepegaId);
			sendResponse();
		}else if(request.message == "update-settings"){
			updateSettings(request.filteredSitesText, request.enableSounds, 
				request.enablePepegaCatchReleaseNotifications, request.enableRankUpNotifications, request.recordOrigin);
			sendResponse();
		}else if(request.message == "update-player-encounter-mode"){
			updatePlayerEncounterMode();
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

var popup = {
	get isOpened (){
		return chrome.extension.getViews({ type: "popup" }).length > 0;
	}
}

class PepegaType {
    constructor(id, fusionIds, name, description, iqps, iqReleasePrice, additionalEncounterRate, imageUrl) {
        this.id = id;
        this.fusionIds = fusionIds;
        this.name = name;
        this.description = description;
        this.iqReleasePrice = iqReleasePrice;
        this.iqps = iqps;
        this.additionalEncounterRate = additionalEncounterRate;
        this.imageUrl = imageUrl;
    }
}

class Pepega {
    constructor(pepegaType, origin, date, fusioned, level) {
        this.id = new Date().getTime();
        this.pepegaType = pepegaType;
        this.origin = origin;
        this.date = date;
        this.fusioned = fusioned;
        this.level = level;
    }
}

class Option {
    constructor(pepegaType, probability) {
        this.pepegaType = pepegaType;
        this.probability = probability;
    }
}

class Site {
    constructor(hostname) {
        this.hostname = hostname;
    }
}

class Category {
    constructor(id, sites, options) {
        this.id = id;
        this.sites = sites;
        this.options = options;
    }
}

class Rank {
    constructor(id, titleArticle, title, description, iqRequirement, iqpsMultiplier) {
        this.id = id;
        this.titleArticle = titleArticle;
        this.title = title;
        this.description = description;
        this.iqRequirement = iqRequirement;
        this.iqpsMultiplier = iqpsMultiplier;
    }
}

class Branch {
    constructor(id, name, functionRequirement) {
        this.id = id;
        this.name = name;
        this.functionRequirement = functionRequirement;
    }
}

const ranks = [
    new Rank(0, ["a"], ["Pepega Trainer"], ["Gotta take em all!"], 0, 1.0),
    new Rank(1, ["a"], ["Pepega Shepherd"], [""], 3000, 1.1),
    new Rank(2, ["a"], ["Pepega Whisperer"], [""], 35000, 1.2),
    new Rank(3, ["a"], ["Pepega Researcher"], [""], 125000, 1.3),
    new Rank(4, ["a"], ["Pepega Scientist"], ["="], 500000, 1.4),
    new Rank(5, ["a"], ["Pepega Guru"], [""], 2000000, 1.5),
    new Rank(6, ["a"], ["Professor Pepega"], [""], 6500000, 1.6),
    new Rank(7, ["a"], ["Pepega Leader"], [""], 14000000, 1.7),
    new Rank(8, ["a"], ["Pepega Commander"], [""], 30000000, 1.8),
    new Rank(9, [""], ["Captain Pepega"], ["You're the captain now!"], 50000000, 1.9),
    new Rank(10, ["a"], ["Pepega General"], [""], 100000000, 2.0),
    new Rank(11, ["a"], ["Pepega Champion"], [""], 165000000, 2.2),
    new Rank(12, ["a", "a", "a"], ["Pepega Legend", "Pepega Master", "Pepega Titan"], ["", "", ""], 300000000, 2.4),
    new Rank(13, ["a", "the", "a"], ["Pepega Legend II", "Pepega King", "Pepega Machine"], ["", "", ""], 650000000, 2.6),
    new Rank(14, ["a", "the", "the"], ["Pepega Legend III", "President of the Pepega States", "Emperor of Pepegan"], ["", "", ""], 1250000000, 2.8),
    new Rank(15, ["the", "the", "the"], ["Innkeeper", "PepeGOD", "Gaijinga"], ["Everyone’s welcome at your inn!", "Pepegas across the globe bow down to your presence.", "You are the ultimate weeb. AYAYA Clap"], 2500000000, 3.0),
]
ranks.sort(function(a, b){return a.iqRequirement - b.iqRequirement});

const branches = [
    new Branch(0, "Default", function defaultBranch(){return true;}),
    new Branch(1, "Nammer", namBranchFunctionRequirement),
    new Branch(2, "Weeb", weebBranchFunctionRequirement)
]

function namBranchFunctionRequirement(){
    return false;
}
function weebBranchFunctionRequirement(){
    return false;
}

const pepegaTypes = [
    new PepegaType(0, [], "Pepega", "The original Pepega we all know and love.", 
        0.5, 1, 0,
        chrome.runtime.getURL("images/pepegas/0_Pepega.png")),

    new PepegaType(1, [0, 0, 0], "Okayga", "These Pepegas are only capable of staring and looking deep into someone's eyes, but they do it very skillfully.", 
        5, 50, 0,
        chrome.runtime.getURL("images/pepegas/1_Okayga.png")),

    new PepegaType(2, [1, 1, 1], "Pepege", "This Pepega is incapable of reading, writing, or doing anything that involves the use of more than one brain cell, but at least it's smart enough to be aware of this.", 
        50, 3000, 0,
        chrome.runtime.getURL("images/pepegas/2_Pepege.png")),

    new PepegaType(3, [], "Firega", "This Pepega leaves behind gasoline cans, gasoline-soaked rags, and lighters on websites it roams on.", 
        6, 120, 0,
        chrome.runtime.getURL("images/pepegas/3_Firega.png")),

    new PepegaType(4, [], "Grassga", "Grassgas devote their lives into protecting and preserving nature. They are against the consumption of plants, animals, and water. They only eat Pepegas.", 
        5, 120, 0.1,
        chrome.runtime.getURL("images/pepegas/4_Grassga.png")),

    new PepegaType(5, [], "Icega", "Icegas are known to have a passion for documenting their daily life activities. They are also notorious for faking events in their lives in order to boost their own self-worth.", 
        7, 120, -0.1,
        chrome.runtime.getURL("images/pepegas/5_Icega.png")),

    new PepegaType(6, [2, 2, 3], "Pepega Knight", "Pepega Knights will always defend their favorite live broadcaster or PepeTuber with their lives. When their idol is sad or something bad happened to them, Pepega Knights will be there to save the day and console their idol as if they are their idol's friends. These Pepegas are also a master of mental gymnastics.",
        330, 100500, 0,
        chrome.runtime.getURL("images/pepegas/6_Pepega-Knight.png")),

    new PepegaType(7, [2, 2, 4], "Pepega Hunter", "Pepega Hunters are deadly snipers who can find anyone easily no matter where one is. They enjoy listening to loud, deafening music and remixes, and it is their duty to make their victims hear it as well.", 
        320, 100500, 2.5,
        chrome.runtime.getURL("images/pepegas/7_Pepega-Hunter.png")),

    new PepegaType(8, [2, 2, 5], "Pepega Wizard", "This Pepega is very fond of Time Travel and a bit of risque dancing. It has a habit of screaming its own name.", 
        340, 100500, -2.5,
        chrome.runtime.getURL("images/pepegas/8_Pepega-Wizard.png")),


    new PepegaType(9, [], "Joyga", "These Pepegas are very young and have an awfully low standard for entertainment. They are easily attracted to Pepegas who are loud and obnoxious.", 
        4, 80, 0.1,
        chrome.runtime.getURL("images/pepegas/9_Joyga.png")),

    new PepegaType(10, [], "Bitga", "This Pepega has as much IQ as the number of pixels it has.", 
        6, 120, 0,
        chrome.runtime.getURL("images/pepegas/10_Bitga.png")),

    new PepegaType(11, [], "KKoga", "KKogas are well-known for their obsession with guns and unhealthy food. It is living the Pepega dream.", 
        5, 100, 0,
        chrome.runtime.getURL("images/pepegas/11_KKoga.png")),

    new PepegaType(12, [9, 10, 11], "Broga", "These Pepegas love the use of platforms that connect to the other side, and if anyone is standing in their way, Brogas are capable of taking them down confidently with ease.", 
        57, 6840, 1,
        chrome.runtime.getURL("images/pepegas/12_Broga.png")),

    new PepegaType(13, [12, 12, 12, 3], "Orange Pepega", "Orange Pepegas are carpenters who specializes in walls. They are capable of building multiple kinds of walls, no matter how high, and it is their obligation to make sure no one is able to go through those walls.", 
        560, 168000, 3,
        chrome.runtime.getURL("images/pepegas/13_Orange-Pepega.png")),


    new PepegaType(14, [], "Fastga", "Contrary to popular belief, these Pepegas love listening to violent rap music.", 
        5, 100, -0.1,
        chrome.runtime.getURL("images/pepegas/14_Fastga.png")),

    new PepegaType(15, [14, 14, 14], "Red Fastga", "This Pepega keeps asking you if you know the destination.", 
        55, 6600, -0.5,
        chrome.runtime.getURL("images/pepegas/15_Red-Fastga.png")),

    new PepegaType(16, [], "Pastorga", "This pepega tells you that by simply catching it, it has won.",
        15, 900, -0.25,
        chrome.runtime.getURL("images/pepegas/16_Pastorga.png")),

    new PepegaType(17, [15, 16], "Supa Pepega", "This Pepega is on a mission to defeat and destroy the Pepega Mafia.", 
        225, 67500, -1,
        chrome.runtime.getURL("images/pepegas/17_Supa-Pepega.png")),

    new PepegaType(18, [17, 17, 17], "Pepega U", "This Pepega dedicates its life to avenging its Pepega brother that was assassinated by who it thinks are the Pepega Mafia. It is a master of Martial Arts and flying without wings. They call it... Pepega U!", 
        2040, 1224000, -3,
        chrome.runtime.getURL("images/pepegas/18_Pepega-U.png")),


    new PepegaType(19, [], "Baby Pepega", "Aww, it's so cute! So stupidly cute! :3", 
        20, 1200, 0.1,
        chrome.runtime.getURL("images/pepegas/19_Baby-Pepega.png")),

    new PepegaType(20, [4, 19], "Peppahga", "In spite of its appearance, it is not a rat, but is in fact just another Pepega.", 
        85, 27000, 1,
        chrome.runtime.getURL("images/pepegas/20_Peppahga.png")),

        ///

    new PepegaType(21, [], "Kappaga", "An incredibly popular and beloved Pepega... Kapp.", 
        10, 200, 0,
        chrome.runtime.getURL("images/pepegas/21_Kappaga.png")),

    new PepegaType(22, [], "Weebga", "These Pepegas are obsessed with children's cartoons to the point where they will dress up as their favorite character, and in some cases, even fall in love with a character, not realizing that these are mere drawings with no actual feeling or thought.", 
        7, 140, 0,
        chrome.runtime.getURL("images/pepegas/22_Weebga.png")),

    new PepegaType(23, [], "Pokketga", "", 
        4, 80, 0.1,
        chrome.runtime.getURL("images/pepegas/23_Pokketga.png")),

    new PepegaType(24, [], "Mald Pepega", "This Pepega somehow manages to not only be mald, but also bald at the same time.", 
        8, 160, 0,
        chrome.runtime.getURL("images/pepegas/24_Mald-Pepega.png")),

    new PepegaType(25, [21, 9, 4], "Ninjaga", "This Pepega keeps telling you to click the Subscribe button, but also making sure you don't smash it.", 
        70, 22500, 2.5,
        chrome.runtime.getURL("images/pepegas/25_Ninjaga.png")),

    new PepegaType(26, [21, 11, 4], "GreekGaX", "This Pepega has a habit of sticking to other Pepegas in hopes of stealing their IQ. It enjoys eating excessive amounts of food even though it has swore, many times in the past, to do the complete opposite.", 
        70, 22500, 2.5,
        chrome.runtime.getURL("images/pepegas/26_GreekGaX.png")),

    new PepegaType(27, [21, 10, 3], "Tylerga", "Tylergas are recognized for their intense, boisterous screaming and desk slamming. It has weirdly big and disproportionate biceps, and its head looks like a marshmallow. They were tormented in the past by the nefarious Pepegas known as Tannergas.", 
        80, 24000, 1.5,
        chrome.runtime.getURL("images/pepegas/27_Tylerga.png")),

    new PepegaType(28, [21, 23, 23, 3], "Doctor Pepega", "The three time, back to back to back, consecutive years, 1982-1976 blockbuster Pepega. For some reason, you can see through its body.", 
        80, 24000, 1.5,
        chrome.runtime.getURL("images/pepegas/30_Doctor-Pepega.png")),

    new PepegaType(29, [21, 24, 5], "Forsenga", "A professional children's card player that gets mad and bald when it loses. Although, nowadays, it just plays cartoon drag-and-drop games that require no skill whatsoever. Perhaps, this way, it can just blame its bad luck when it loses, instead of its lack of skill.", 
        90, 25500, 0.5,
        chrome.runtime.getURL("images/pepegas/29_Forsenga.png")),

    new PepegaType(30, [21, 22, 5], "Triga", "Trigas are very popular for their immense skill in the game called Maldio. They are considered to be the best at this genre, and they don't mald very easily unlike some other Pepegas.", 
        90, 25500, 0.5,
        chrome.runtime.getURL("images/pepegas/28_Triga.png")),


    new PepegaType(31, [], "Pridega", "", 
        5, 50, 0,
        chrome.runtime.getURL("images/pepegas/31_Pridega.png")),

    new PepegaType(32, [], "200 IQ Pepega", "This Pepega loves telling other Pepegas about their favorite cartoon show in a very condescending manner. It then proceeds to tell them that they are not smart enough to understand the show anyway.", 
        12, 120, 0,
        chrome.runtime.getURL("images/pepegas/32_200-IQ-Pepega.png")),

    new PepegaType(33, [32, 32, 5], "400 IQ Pepega", "No one knows why, but these Pepegas keep yelling the word \"Pickle\" and a guy named \"Richard\".", 
        100, 30000, -0.25,
        chrome.runtime.getURL("images/pepegas/33_400-IQ-Pepega.png")),

    new PepegaType(34, [33, 33, 33, 31], "Amazga", "One of the smartest Pepegas known to Pepegakind. Legend has it that this Pepega has already beaten this game.", 
        1000, 600000, -0.5,
        chrome.runtime.getURL("images/pepegas/34_Amazga.png")),

    new PepegaType(35, [34, 34], "Scamaz", "SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE THERE'S NOTHING YOU CAN DO HAHAHAHAHAHAHAHAHAHAHAHAHAHA", 
        -666, -100000, -5,
        chrome.runtime.getURL("images/pepegas/35_Scamaz.png")),


    new PepegaType(36, [], "Handsomega", "A very attractive and charming Pepega. They love going to the gym and wrestling with their fellow Handsomegas.", 
        6, 720, 0.1,
        chrome.runtime.getURL("images/pepegas/36_Handsomega.png")),

    new PepegaType(37, [31, 36, 3], "Billiga", "Billiga is highly respected for its service in the Pepega Armed Forces. It is a tough, but loving Pepega, and it only wants what's best for you. After its retirement, it has become a prominent figure in the wresling community.", 
        55, 9900, 1,
        chrome.runtime.getURL("images/pepegas/37_Billiga.png")),

    new PepegaType(38, [31, 36, 5], "Vanga", "Vangas are infamous for owning a dungeon where they party with their friends. They are also commonly referred to as Leathergas, due to the outfit that they wear.", 
        60, 9900, 0.5,
        chrome.runtime.getURL("images/pepegas/38_Vanga.png")),

    new PepegaType(39, [31, 36, 4], "Rigardo", "An expert in what is known as romantic dancing, Rigardo can dance to almost every type of music.", 
        50, 9900, 1.5,
        chrome.runtime.getURL("images/pepegas/39_Rigardo.png")),

    new PepegaType(40, [37, 38, 39], "Gachiga", "Gachigas are considered to be the strongest and simultaneously the most beautiful Pepegas known to Pepegakind. It greatly excels in performance art, music, and bodybuilding.", 
        520, 156000, 5,
        chrome.runtime.getURL("images/pepegas/40_Gachiga.png")),

    new PepegaType(41, [40, 40, 40], "Hypergachiga", "A Pepega Abomination. What have you done?", 
        4750, 2850000, -10,
        chrome.runtime.getURL("images/pepegas/41_Hypergachiga.png")),


    new PepegaType(42, [], "Silver Pepega", "", 
        3500, 2400000, 0,
        chrome.runtime.getURL("images/pepegas/42_Silver-Pepega.png")),

    new PepegaType(43, [], "Golden Pepega", "", 
        12000, 14400000, 0,
        chrome.runtime.getURL("images/pepegas/43_Golden-Pepega.png")),


    new PepegaType(44, [], "Luc1ga", "", 
        -75, -25000, -2.5,
        chrome.runtime.getURL("images/pepegas/44_Luc1ga.png")),

    new PepegaType(45, [], "Luciga", "", 
        133, -3160000, -5,
        chrome.runtime.getURL("images/pepegas/45_Luciga.png")),
]

/* Category Full Template
    [
        new Option(pepegaTypes[0], 38.75),
        new Option(pepegaTypes[1], 3),
        new Option(pepegaTypes[2], 1),
        new Option(pepegaTypes[3], 7.5),
        new Option(pepegaTypes[4], 7.5),
        new Option(pepegaTypes[5], 7.5),
        new Option(pepegaTypes[6], 0.1),
        new Option(pepegaTypes[7], 0.1),
        new Option(pepegaTypes[8], 0.1),
        new Option(pepegaTypes[9], 2.5),
        new Option(pepegaTypes[10], 2.5),
        new Option(pepegaTypes[11], 2.5),
        new Option(pepegaTypes[12], 0.5),
        new Option(pepegaTypes[13], 0),
        new Option(pepegaTypes[14], 2.5),
        new Option(pepegaTypes[15], 0.5),
        new Option(pepegaTypes[16], 2.5),
        new Option(pepegaTypes[17], 0),
        new Option(pepegaTypes[18], 0),
        new Option(pepegaTypes[19], 1.1989),
        new Option(pepegaTypes[20], 0),
        new Option(pepegaTypes[21], 1.5),
        new Option(pepegaTypes[22], 2.5),
        new Option(pepegaTypes[23], 2.5),
        new Option(pepegaTypes[24], 2.5),
        new Option(pepegaTypes[25], 0.5),
        new Option(pepegaTypes[26], 0.5),
        new Option(pepegaTypes[27], 0.5),
        new Option(pepegaTypes[28], 0.5),
        new Option(pepegaTypes[29], 0.5),
        new Option(pepegaTypes[30], 0.5),
        new Option(pepegaTypes[31], 2.5),
        new Option(pepegaTypes[32], 2.5),
        new Option(pepegaTypes[33], 0),
        new Option(pepegaTypes[34], 0),
        new Option(pepegaTypes[35], 0),
        new Option(pepegaTypes[36], 2.0),
        new Option(pepegaTypes[37], 0.25),
        new Option(pepegaTypes[38], 0.25),
        new Option(pepegaTypes[39], 0.25),
        new Option(pepegaTypes[40], 0),
        new Option(pepegaTypes[41], 0),
        new Option(pepegaTypes[42], 0.001),
        new Option(pepegaTypes[43], 0.0001),
        new Option(pepegaTypes[44], 0),
        new Option(pepegaTypes[45], 0)
    ]
*/

const categories = [
    new Category(0, [],
        [
            new Option(pepegaTypes[0], 42.25),
            new Option(pepegaTypes[1], 2.5),
            new Option(pepegaTypes[2], 1),
            new Option(pepegaTypes[3], 7.5),
            new Option(pepegaTypes[4], 7.5),
            new Option(pepegaTypes[5], 7.5),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[9], 2.5),
            new Option(pepegaTypes[10], 2.5),
            new Option(pepegaTypes[11], 2.5),
            new Option(pepegaTypes[12], 0.5),
            new Option(pepegaTypes[14], 2.5),
            new Option(pepegaTypes[15], 0.5),
            new Option(pepegaTypes[16], 2.5),
            new Option(pepegaTypes[19], 1.9269),
            new Option(pepegaTypes[21], 1.5),
            new Option(pepegaTypes[22], 2.5),
            new Option(pepegaTypes[23], 2.5),
            new Option(pepegaTypes[24], 2.5),
            new Option(pepegaTypes[31], 2.5),
            new Option(pepegaTypes[32], 2.5),
            new Option(pepegaTypes[36], 2),
            new Option(pepegaTypes[42], 0.001),
            new Option(pepegaTypes[43], 0.0001),
            new Option(pepegaTypes[44], 0.02),
            new Option(pepegaTypes[45], 0.002)
        ]
    ),
    new Category(1,
        [
            new Site("youtube"),
            new Site("reddit"),
            new Site("twitter"),
            new Site("instagram"),
            new Site("facebook")
        ],
        [
            new Option(pepegaTypes[0], 27.9),
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 5),
            new Option(pepegaTypes[4], 5),
            new Option(pepegaTypes[5], 5),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[9], 7),
            new Option(pepegaTypes[10], 6),
            new Option(pepegaTypes[11], 7),
            new Option(pepegaTypes[12], 1),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[15], 0.5),
            new Option(pepegaTypes[19], 1.1989),
            new Option(pepegaTypes[22], 5),
            new Option(pepegaTypes[23], 7),
            new Option(pepegaTypes[25], 0.2),
            new Option(pepegaTypes[26], 0.2),
            new Option(pepegaTypes[27], 0.2),
            new Option(pepegaTypes[31], 7),
            new Option(pepegaTypes[32], 5),
            new Option(pepegaTypes[36], 2.5),
            new Option(pepegaTypes[42], 0.001),
            new Option(pepegaTypes[43], 0.0001)
        ]
    ),
    new Category(2,
        [
            new Site("twitch")
        ],
        [
            new Option(pepegaTypes[0], 25.55),
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 3),
            new Option(pepegaTypes[4], 7),
            new Option(pepegaTypes[5], 3),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[9], 6),
            new Option(pepegaTypes[10], 6),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[15], 0.5),
            new Option(pepegaTypes[16], 2.5),
            new Option(pepegaTypes[19], 1.1989),
            new Option(pepegaTypes[21], 8.5),
            new Option(pepegaTypes[22], 7.5),
            new Option(pepegaTypes[23], 7.5),
            new Option(pepegaTypes[24], 5),
            new Option(pepegaTypes[25], 0.2),
            new Option(pepegaTypes[26], 0.2),
            new Option(pepegaTypes[27], 0.2),
            new Option(pepegaTypes[28], 0.2),
            new Option(pepegaTypes[29], 0.2),
            new Option(pepegaTypes[30], 0.2),
            new Option(pepegaTypes[31], 0),
            new Option(pepegaTypes[32], 5),
            new Option(pepegaTypes[36], 2.5),
            new Option(pepegaTypes[37], 0.25),
            new Option(pepegaTypes[38], 0.25),
            new Option(pepegaTypes[39], 0.25),
            new Option(pepegaTypes[42], 0.001),
            new Option(pepegaTypes[43], 0.0001)
        ]
    ),
    new Category(3,
        [
            new Site("wikipedia"),
            new Site("wikihow"),
            new Site("quora"),
            new Site("google"),
        ],
        [
            new Option(pepegaTypes[0], 32.2),
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 3),
            new Option(pepegaTypes[4], 3),
            new Option(pepegaTypes[5], 7),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[10], 10),
            new Option(pepegaTypes[11], 7.5),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[16], 2.5),
            new Option(pepegaTypes[19], 2.1989),
            new Option(pepegaTypes[21], 5),
            new Option(pepegaTypes[22], 5),
            new Option(pepegaTypes[24], 2.5),
            new Option(pepegaTypes[29], 0.2),
            new Option(pepegaTypes[31], 2.5),
            new Option(pepegaTypes[32], 7.5),
            new Option(pepegaTypes[33], 0.1),
            new Option(pepegaTypes[36], 2.5),
            new Option(pepegaTypes[42], 0.001),
            new Option(pepegaTypes[43], 0.0001)
        ]
    ),
    new Category(4,
        [
            new Site("xvideos"),
            new Site("porn"),
            new Site("xhamster"),
            new Site("xnxx"),
            new Site("youjizz"),
            new Site("motherless"),
            new Site("sex"),
            new Site("fuck"),
            new Site("livejasmin")
        ],
        [
            new Option(pepegaTypes[0], 34.2),
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 7),
            new Option(pepegaTypes[4], 3),
            new Option(pepegaTypes[5], 3),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 3),
            new Option(pepegaTypes[11], 3),
            new Option(pepegaTypes[14], 2.5),
            new Option(pepegaTypes[19], 1.1989),
            new Option(pepegaTypes[22], 7.5),
            new Option(pepegaTypes[23], 7.5),
            new Option(pepegaTypes[30], 0.2),
            new Option(pepegaTypes[31], 7.5),
            new Option(pepegaTypes[32], 6),
            new Option(pepegaTypes[33], 0.1),
            new Option(pepegaTypes[36], 7.5),
            new Option(pepegaTypes[37], 0.5),
            new Option(pepegaTypes[38], 0.5),
            new Option(pepegaTypes[39], 0.5),
            new Option(pepegaTypes[42], 0.001),
            new Option(pepegaTypes[43], 0.0001)
        ]
    ),
    new Category(5,
        [
            new Site("hentai"),
            new Site("fakku"),
            new Site("osu")
        ],
        [
            new Option(pepegaTypes[0], 32.3),
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 3),
            new Option(pepegaTypes[4], 3),
            new Option(pepegaTypes[5], 7),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[9], 5),
            new Option(pepegaTypes[10], 7.5),
            new Option(pepegaTypes[12], 1),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[15], 1),
            new Option(pepegaTypes[19], 7.5989),
            new Option(pepegaTypes[20], 0.1),
            new Option(pepegaTypes[22], 20),
            new Option(pepegaTypes[28], 0.2),
            new Option(pepegaTypes[31], 2.5),
            new Option(pepegaTypes[32], 2.5),
            new Option(pepegaTypes[42], 0.001),
            new Option(pepegaTypes[43], 0.0001),
        ]
    ),
    new Category(6,
        [
            new Site("kaotic"),
            new Site("gorejunkies"),
            new Site("livegore")
        ],
        [
            new Option(pepegaTypes[44], 99.9),
            new Option(pepegaTypes[45], 0.1),
        ]
    )
];

class EncounterMode {
    constructor(id, name, multiplier) {
        this.id = id;
        this.name = name;
        this.multiplier = multiplier;
    }
}

const encounterModes = [
    new EncounterMode(0, "Maximum Encounters (100%)", 100),
    new EncounterMode(1, "Less Encounters (50%)", 50),
    new EncounterMode(2, "Encounters Disabled (0%)", 0)
]

//Begin Initializating Player Stats

var totalIqps = 0;
var rank = ranks[0];
var branch = branches[0];
var pepegaSlotCost = 0;
var uniquePepegaIqpsMultiplier = 1;
var additionalPepegaEncounterRate = 0;

var player = {
    iqCount: 0,
    pepegas: [],
    armyName: defaultArmyName,
    pepegaSlots: startingPlayerPepegaSlots,
    encounterMode: encounterModes[0]
}

var settings = {
    firstCatch: true,
    filteredSites: [],
    enableSounds: true,
    enablePepegaCatchReleaseNotifications: true,
    enableRankUpNotifications: true,
    recordOrigin: true,
}

chrome.storage.local.get(["playerIqCount"], function(result) {
    if(parseInt(result.playerIqCount)){
        player.iqCount = result.playerIqCount;
    }
    analyzeRank(false);
});

chrome.storage.local.get(["playerPepegaSlots"], function(result) {
    if(result.playerPepegaSlots != null){
        player.pepegaSlots = result.playerPepegaSlots;
    }
    analyzePepegaSlotCost();
});

chrome.storage.local.get(["playerPepegas"], function(result) {
    if(result.playerPepegas != null){
        var index, length;
        for (index = 0, length = result.playerPepegas.length; index < length; ++index) {
            var playerPepega = new Pepega(pepegaTypes[result.playerPepegas[index].pepegaType.id]);
            
            //properties that need to carry over
            playerPepega.id = result.playerPepegas[index].id;
            playerPepega.origin = result.playerPepegas[index].origin;
            playerPepega.date = result.playerPepegas[index].date;
            playerPepega.fusioned = result.playerPepegas[index].fusioned;
            playerPepega.level = result.playerPepegas[index].level;
            
            addPlayerPepega(playerPepega, false, false);
        }
        analyzeUniquePepegaIqpsMultiplier();
        analyzeAdditionalPepegaEncounterRate();
        //analyzeBranch();
    }
});

chrome.storage.local.get(["playerArmyName"], function(result) {
    if(result.playerArmyName != null){
        player.armyName = result.playerArmyName;
    }
});

chrome.storage.local.get(["playerEncounterMode"], function(result) {
    if(result.playerEncounterMode != null){
        player.encounterMode = result.playerEncounterMode;
        updateIconFromEncounterMode();
    }
});

chrome.storage.local.get(["settingsFirstCatch", "settingsFilteredSites", "settingsEnableSounds", 
"settingsEnablePepegaCatchReleaseNotifications", "settingsEnableRankUpNotifications", "settingsRecordOrigin", "settingsEncounterMode"], function(result) {
    if(result.settingsFirstCatch != null){
        settings.firstCatch = result.settingsFirstCatch;
    }

    if(result.settingsFilteredSites != null){
        settings.filteredSites = result.settingsFilteredSites;
    }

    if(result.settingsEnableSounds != null){
        settings.enableSounds = result.settingsEnableSounds;
    }

    if(result.settingsEnablePepegaCatchReleaseNotifications != null){
        settings.enablePepegaCatchReleaseNotifications = result.settingsEnablePepegaCatchReleaseNotifications;
    }

    if(result.settingsEnableRankUpNotifications != null){
        settings.enableRankUpNotifications = result.settingsEnableRankUpNotifications;
    }
    
    if(result.settingsRecordOrigin != null){
        settings.recordOrigin = result.settingsRecordOrigin;
    }

    if(result.settingsEncounterMode != null){
        settings.encounterMode = result.settingsEncounterMode;
    }
});

//End Initializating Player Stats

function playSound(sound){
    if(settings.enableSounds){
        sound.play();
    }
}

function getPlayerPepega(id){
    var index, length;
    for (index = 0, length = player.pepegas.length; index < length; ++index) {
        if(player.pepegas[index].id == id){
            return player.pepegas[index];
        }
    }
}

function removePlayerPepega(id, save = true){
    var index, length;
    for (index = 0, length = player.pepegas.length; index < length; ++index) {
        if(player.pepegas[index].id == id){
            
            totalIqps -= player.pepegas[index].pepegaType.iqps * player.pepegas[index].level;

            player.pepegas.splice(index, 1);
            break;
        }
    }

    analyzeUniquePepegaIqpsMultiplier();
    analyzeAdditionalPepegaEncounterRate();
    //analyzeBranch();
    updatePlayerPepegasPopupDisplay();

    if(save){
        chrome.storage.local.set({playerPepegas: player.pepegas}, function() {
        });
    }
}

function updatePlayerPepegaSlots(newPepegaSlots, save = true){
    player.pepegaSlots = newPepegaSlots;

    analyzePepegaSlotCost();

    updatePlayerPepegaSlotsPopupDisplay();

    if(save){
        chrome.storage.local.set({playerPepegaSlots: player.pepegaSlots}, function() {
        });
    }
}

function analyzePepegaSlotCost(){
    pepegaSlotCost = Math.round(Math.pow(player.pepegaSlots + 1, 5) * 2);
}

function analyzeUniquePepegaIqpsMultiplier(){
    var uniquePepegas = [...new Set(player.pepegas.map(pepega => pepega.pepegaType.id))];
    uniquePepegaIqpsMultiplier = 1 + ((uniquePepegas.length-1) * iqpsMultiplierForEachUniquePepega);
    
}
function analyzeAdditionalPepegaEncounterRate(){
    var calculatedAdditionalPepegaEncounterRate = 0;
    for(var i = 0; i < player.pepegas.length; i++){
        calculatedAdditionalPepegaEncounterRate += (player.pepegas[i].pepegaType.additionalEncounterRate * player.pepegas[i].level);
    }
    additionalPepegaEncounterRate = Math.max(Math.min(calculatedAdditionalPepegaEncounterRate, 100), 0);
}

function getCategory(hostname){
    var index, length;
    for (index = 1, length = categories.length; index < length; ++index) {
        var index2, length2;
        for (index2 = 0, length2 = categories[index].sites.length; index2 < length2; ++index2) {
            if(hostname.includes(categories[index].sites[index2].hostname)){
                console.log("Site Category ID: " + categories[index].id + ", because '" + hostname + "' includes '" + categories[index].sites[index2].hostname + "'");
                return categories[index];
            }
        }
    }
    console.log("Default Site Category was used");
    return null;
}

function rollWildPepega(category){
    if(settings.firstCatch){
        return new Pepega(pepegaTypes[0], "", "", false, 1, pepegaTypes[0].iqps);
    }

    var roll = (Math.random() * (100.0));
    var rollCeiling = 0;
    var index, length;
    for (index = 0, length = category.options.length; index < length; ++index) {
        var probability = category.options[index].probability;
        if(probability > 0){
            rollCeiling += probability;
            if(roll <= rollCeiling){
                var pepegaType = pepegaTypes[category.options[index].pepegaType.id];
                var wildPepega = new Pepega(pepegaType, "", "", false, 1, pepegaType.iqps);
                return wildPepega;
            }
        }
    }
}

function rollEncounter(){
    var roll = (Math.random() * (100 - 0.1)) + 0.1;
    console.log("Encounter Roll: " + roll + " must be less than " +((baseEncounterRate + additionalPepegaEncounterRate) * (player.encounterMode.multiplier/100)));
    return roll <= ((baseEncounterRate + additionalPepegaEncounterRate) * (player.encounterMode.multiplier/100));
}

function rollTimeBeforeNextWildPepegaSpawn(){
    var roll = Math.floor(Math.random() * (maxTimeBeforeNextWildPepegaSpawn - minTimeBeforeNextWildPepegaSpawn) ) + minTimeBeforeNextWildPepegaSpawn;
    return roll;
}

const minTimeBeforeNextWildPepegaSpawn = 5000;
const maxTimeBeforeNextWildPepegaSpawn = 20000;
var lastWildPepegaSpawnTime = 0;
var timeBeforeNextWildPepegaSpawn = rollTimeBeforeNextWildPepegaSpawn();
chrome.storage.local.get(["lastWildPepegaSpawnTime", "timeBeforeNextWildPepegaSpawn"], function(result) {
    if(result.lastWildPepegaSpawnTime != null){
        lastWildPepegaSpawnTime = result.lastWildPepegaSpawnTime;
        timeBeforeNextWildPepegaSpawn = result.timeBeforeNextWildPepegaSpawn;
    }
});

function getWildPepega(location){
    var currentTime = new Date().getTime();
    console.log(((lastWildPepegaSpawnTime - (currentTime - timeBeforeNextWildPepegaSpawn))/1000.0) + " seconds before the next Wild Pepega spawns.");
    if(currentTime - timeBeforeNextWildPepegaSpawn >= lastWildPepegaSpawnTime && rollEncounter()){
        console.log("Wild Pepega has spawned in " + location.hostname + "!");
        var category = getCategory(location.hostname);
        if(category == null){
            category = categories[0];
        }

        lastWildPepegaSpawnTime = currentTime;
        timeBeforeNextWildPepegaSpawn = rollTimeBeforeNextWildPepegaSpawn();
        chrome.storage.local.set({lastWildPepegaSpawnTime: lastWildPepegaSpawnTime, timeBeforeNextWildPepegaSpawn: timeBeforeNextWildPepegaSpawn}, function() {
            console.log("Spawn Time was saved. New time before the next Wild Pepega spawns is " + (timeBeforeNextWildPepegaSpawn/1000.0) + " seconds.");
        });
        return rollWildPepega(category);
    }else{
        return null;
    }
}

function isSiteFiltered(location){
	var index, length;
    for (index = 0, length = settings.filteredSites.length; index < length; ++index) {
        if(settings.filteredSites[index] && settings.filteredSites[index] != "" && 
            (location.hostname.includes(settings.filteredSites[index]) || settings.filteredSites[index].includes(location.hostname))){
            chrome.browserAction.setIcon({path: chrome.runtime.getURL("icons/pepegaIconDisabled128.png")});
            return true;
		}
    }
    updateIconFromEncounterMode();
	return false;
}

function updateIconFromEncounterMode(){
    if(player.encounterMode.multiplier == 100){
        chrome.browserAction.setIcon({path: chrome.runtime.getURL("icons/pepegaIcon128.png")});
    }else if(player.encounterMode.multiplier == 0){
        chrome.browserAction.setIcon({path: chrome.runtime.getURL("icons/pepegaIconDisabled128.png")});
    }else{
        chrome.browserAction.setIcon({path: chrome.runtime.getURL("icons/pepegaIconLess128.png")});
    }
}

function isStringAVowel(s) {
    return (/^[aeiou]$/i).test(s);
}

const NotificationPurposeEnum = {"pepegaCatchRelease":1, "rankUp":2}

function notify(purpose, type, title, message, iconUrl){
    if((purpose == NotificationPurposeEnum.pepegaCatchRelease && settings.enablePepegaCatchReleaseNotifications) ||
        (purpose == NotificationPurposeEnum.rankUp && settings.enableRankUpNotifications)){
        var options = {
            type: type,
            title: title,
            message: message,
            iconUrl: iconUrl,
        };
        chrome.notifications.create(options, function() {});
    }
}

function isPepegaSlotsAvailable(playerPepegaCount){
    if(playerPepegaCount <= player.pepegaSlots){
        return true;
    }else{
        return false;
    }
}

function releasePlayerPepega(id){
    var playerPepega = getPlayerPepega(id);

    updatePlayerIqCount(playerPepega.pepegaType.iqReleasePrice * playerPepega.level);

    notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", playerPepega.pepegaType.name + " released!", playerPepega.pepegaType.name + " was released back into " + 
    playerPepega.origin + "! You got " + (playerPepega.pepegaType.iqReleasePrice * playerPepega.level)  + " IQ.", playerPepega.pepegaType.imageUrl);

    playSound(pepegaReleaseSound);

    removePlayerPepega(id);
}

function getArticle(word){
    var article = "a";
    if(isStringAVowel(word)){
        article = "an";
    }
    return article;
}

const AddingPlayerPepegaResultEnum = {"successSingle":1, "successLeveledUp":2, "successFusioned":2, "noPepegaSlots":3}
const CombiningPlayerPepegaResultEnum = {"combined":1, "noCombination":2, "noPepegaSlots":3}

function catchWildPepega(wildPepegaTypeId, location){
    var wildPepega = new Pepega(pepegaTypes[wildPepegaTypeId], "", "", false, 1);

    wildPepega.date = new Date().toLocaleString();
    if(settings.recordOrigin){
        wildPepega.origin = location.hostname;
    }else{
        wildPepega.origin = defaultPepegaOrigin;
    }
    wildPepega.fusioned = false;

    var pepegaAdd = addPlayerPepega(wildPepega);

    if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successSingle){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " caught!", "You caught " + getArticle(pepegaAdd[1].pepegaType.name[0]) + " " + pepegaAdd[1].pepegaType.name + "!", pepegaAdd[1].pepegaType.imageUrl);  
        console.log("Is first catch?: " + settings.firstCatch);
        if(settings.firstCatch){
            settings.firstCatch = false;
            chrome.storage.local.set({settingsFirstCatch: settings.firstCatch}, function() {
            });
        }

        playSound(pepegaCatchSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successLeveledUp){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " is now level " + pepegaAdd[1].level + "!",
            "Your " + pepegaAdd[1].pepegaType.name + " leveled up!\nIt is now level " + pepegaAdd[1].level + "!\nPog!",
            pepegaAdd[1].pepegaType.imageUrl);

        playSound(pepegaLevelSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successFusioned){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You fusion summoned " + getArticle() + " " + pepegaAdd[1].pepegaType.name + "!",
            wildPepega.pepegaType.name + " fusioned with other Pepegas into " + article + " " + pepegaAdd[1].pepegaType.name + "!\nPogChamp!",
            pepegaAdd[1].pepegaType.imageUrl);

        playSound(pepegaFusionSound);
    } else{
        updatePlayerIqCount(pepegaAdd[1].pepegaType.iqReleasePrice);

        var notificationMessage = pepegaAdd[1].pepegaType.name + " was released, earning you " + pepegaAdd[1].pepegaType.iqReleasePrice + " IQ.";
        if(player.pepegaSlots < maxPepegaSlots){
            notificationMessage += "\nYou can buy more slots by spending your IQ!";
        }
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You don't have enough room for more Pepegas!", notificationMessage, pepegaAdd[1].pepegaType.imageUrl);

        playSound(pepegaFullArmySound);
    }
}

function addPlayerPepega(pepega, save = true, displayForPopup = true){
    var pepegaLevelingUp = checkPepegaLevelingUp(pepega);
    var pepegaFusioning = checkPepegaFusioning(pepega);

    if(pepegaLevelingUp[0] == CombiningPlayerPepegaResultEnum.combined){
        return [AddingPlayerPepegaResultEnum.successLeveledUp, pepegaLevelingUp[1]];
    } else if(pepegaFusioning[0] == CombiningPlayerPepegaResultEnum.combined){
        return [AddingPlayerPepegaResultEnum.successFusioned, pepegaFusioning[1]];
    } else if((pepegaLevelingUp[0] == CombiningPlayerPepegaResultEnum.noCombination || pepegaFusioning[0] == CombiningPlayerPepegaResultEnum.noCombination) && isPepegaSlotsAvailable(player.pepegas.length + 1)){

        player.pepegas.push(pepega);
        totalIqps += pepega.pepegaType.iqps * pepega.level;

        if(displayForPopup){
            analyzeUniquePepegaIqpsMultiplier();
            analyzeAdditionalPepegaEncounterRate();
            //analyzeBranch();
            updatePlayerPepegasPopupDisplay();
        }

        if(save){
            chrome.storage.local.set({playerPepegas: player.pepegas}, function() {
            });
        }

        return [AddingPlayerPepegaResultEnum.successSingle, pepega];
    } else {
        return [AddingPlayerPepegaResultEnum.noPepegaSlots, pepega];
    }
}

function checkPepegaLevelingUp(addedPepega){
    if(addedPepega.level >= maxPepegaLevel){
        return false;
    }

    levelingPlayerPepegaIds = [];
    var isLevelingUp = false;
    var tempPlayerPepegas = [];
    for(var i = 0; i < player.pepegas.length; i++){
        if(player.pepegas[i].level == addedPepega.level){
            var tempPlayerPepega = new Object();
            tempPlayerPepega.id = player.pepegas[i].id;
            tempPlayerPepega.typeId = player.pepegas[i].pepegaType.id;
            tempPlayerPepegas.push(tempPlayerPepega);
        }
    }
    var tempPlayerPepega = new Object();
    tempPlayerPepega.id = addedPepega.id;
    tempPlayerPepega.typeId = addedPepega.pepegaType.id;
    tempPlayerPepegas.push(tempPlayerPepega);
    for(var i = 0; i < tempPlayerPepegas.length; i++){
        if(addedPepega.pepegaType.id == tempPlayerPepegas[i].typeId){
            levelingPlayerPepegaIds.push(tempPlayerPepegas[i].id);
            if(levelingPlayerPepegaIds.length == multiplesBeforeLevelUp){
                isLevelingUp = true;
                break;
            }
        }
    }
    if(isLevelingUp){
        if(!isPepegaSlotsAvailable(player.pepegas.length - multiplesBeforeLevelUp + 1)){
            return [CombiningPlayerPepegaResultEnum.noPepegaSlots, addedPepega];
        }
        
        for(var i = 0; i < levelingPlayerPepegaIds.length; i++){
            removePlayerPepega(levelingPlayerPepegaIds[i], false);
        }

        var newPepegaLevel = addedPepega.level + 1;
        var leveledUpPepega = new Pepega(pepegaTypes[addedPepega.pepegaType.id], addedPepega.origin, addedPepega.date, false, newPepegaLevel);
        
        var pepegaAdd = addPlayerPepega(leveledUpPepega, true);

        return [CombiningPlayerPepegaResultEnum.combined, pepegaAdd[1]];
    }else{
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }
}

function checkPepegaFusioning(addedPepega = null){
    var fusioningPlayerPepegaIds;
    var isAddedPepegaInvolvedInFusion;
    var fusionedPepegaType;
    var isFusioning = false;
    for(var i = 0; i < pepegaTypes.length; i++){
        if(pepegaTypes[i].fusionIds.length == 0){
            continue;
        }

        isAddedPepegaInvolvedInFusion = false;
        fusioningPlayerPepegaIds = [];
        var tempPlayerPepegas = [];
        for(var j = 0; j < player.pepegas.length; j++){
            if(player.pepegas[j].level == maxPepegaLevel){
                var tempPlayerPepega = new Object();
                tempPlayerPepega.isTaken = false;
                tempPlayerPepega.id = player.pepegas[j].id;
                tempPlayerPepega.typeId = player.pepegas[j].pepegaType.id;
                tempPlayerPepegas.push(tempPlayerPepega);
            }
        }
        if(addedPepega != null){
            var tempPlayerPepega = new Object();
            tempPlayerPepega.isTaken = false;
            tempPlayerPepega.id = addedPepega.id;
            tempPlayerPepega.typeId = addedPepega.pepegaType.id;
            tempPlayerPepegas.push(tempPlayerPepega);
        }
        for(var j = 0; j < pepegaTypes[i].fusionIds.length; j++){
            for(var k = 0; k < tempPlayerPepegas.length; k++){
                if(!tempPlayerPepegas[k].isTaken && tempPlayerPepegas[k].typeId == pepegaTypes[i].fusionIds[j]){
                    if(addedPepega != null && !isAddedPepegaInvolvedInFusion && addedPepega.id == tempPlayerPepegas[k].id){
                        isAddedPepegaInvolvedInFusion = true;
                    }
                    tempPlayerPepegas[k].isTaken = true;
                    fusioningPlayerPepegaIds.push(tempPlayerPepegas[k].id);
                    break;
                }
            }
        }
        if(fusioningPlayerPepegaIds.length == pepegaTypes[i].fusionIds.length){
            fusionedPepegaType = pepegaTypes[i];
            isFusioning = true;
            break;
        }
    }

    if(isFusioning){
        if(!isPepegaSlotsAvailable(player.pepegas.length - fusioningPlayerPepegaIds.length + 1, true)){
            return [CombiningPlayerPepegaResultEnum.noPepegaSlots, addedPepega];
        }

        for(var i = 0; i < fusioningPlayerPepegaIds.length; i++){
            removePlayerPepega(fusioningPlayerPepegaIds[i], false);
        }
        
        var fusionedPepega = new Pepega(fusionedPepegaType, addedPepega.origin, addedPepega.date, true, 1, fusionedPepegaType.iqps);
        
        var pepegaAdd = addPlayerPepega(fusionedPepega, true);

        return [CombiningPlayerPepegaResultEnum.combined, pepegaAdd[1]];
    }else{
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }
}

function updateSettings(filteredSitesText, enableSounds, enablePepegaCatchReleaseNotifications, enableRankUpNotifications, recordOrigin){
    settings.filteredSites = filteredSitesText.split('\n');
    settings.enableSounds = enableSounds;
    settings.enablePepegaCatchReleaseNotifications = enablePepegaCatchReleaseNotifications;
    settings.enableRankUpNotifications = enableRankUpNotifications;
    settings.recordOrigin = recordOrigin;

    updateSettingsPopupDisplay();

    chrome.storage.local.set({settingsFilteredSites: settings.filteredSites, settingsEnableSounds: settings.enableSounds, 
        settingsEnablePepegaCatchReleaseNotifications: settings.enablePepegaCatchReleaseNotifications, 
        settingsEnableRankUpNotifications: settings.enableRankUpNotifications, settingsRecordOrigin: settings.recordOrigin}, function() {
    });
}

function stripHtmlTags(value) {
	if ((value===null) || (value==='')){
		return false;
	} else{
		value = value.toString();
		return value.replace(/<[^>]*>/g, '');
	}
}

function updatePlayerEncounterMode(){
    var newEncounterMode = encounterModes[0];
    if(player.encounterMode.id < encounterModes.length-1){
        newEncounterMode = encounterModes[player.encounterMode.id + 1];
    }
    player.encounterMode = newEncounterMode;

    updatePlayerEncounterModePopupDisplay();
    updateIconFromEncounterMode();

    chrome.storage.local.set({playerEncounterMode: player.encounterMode}, function() {
    });
}

function updatePlayerArmyName(playerArmyName){
    if(playerArmyName == "" || !playerArmyName.replace(/\s/g, '').length || !playerArmyName){
        player.armyName = defaultArmyName;
    }else{
        player.armyName = stripHtmlTags(playerArmyName).substring(0,maxArmyNameLength);
    }

    updatePlayerArmyNamePopupDisplay();

    chrome.storage.local.set({playerArmyName: player.armyName}, function() {
    });
}

var previousUpdateIqCountTime = new Date().getTime();

var readyStateCheckInterval = setInterval(function() {
    var currentUpdateIqCountTime = new Date().getTime();
    if(currentUpdateIqCountTime - previousUpdateIqCountTime >= updateIqCountMillisecondInterval){
        updatePlayerIqCount(Math.round(totalIqps * rank.iqpsMultiplier));
        previousUpdateIqCountTime = currentUpdateIqCountTime;
    }
}, 100);

function updatePlayerIqCount(iq){
    var newPlayerIqCount = player.iqCount + iq;

    if(newPlayerIqCount > maxPlayerIqCount){
        newPlayerIqCount = maxPlayerIqCount;
    }else if(newPlayerIqCount < 0){
        newPlayerIqCount = 0;
    }

    player.iqCount = newPlayerIqCount;
    
    analyzeRank();

    updatePlayerIqCountPopupDisplay();
    
    chrome.storage.local.set({playerIqCount: player.iqCount}, function() {
    });
}

function analyzeRank(isNotifyIfRankUp = true){
    var index, length;
    for (index = ranks.length - 1, length = 0; index >= length; --index) {
        if(player.iqCount >= ranks[index].iqRequirement){
            if(index > rank.id && isNotifyIfRankUp){
                analyzeBranch();
                var rankTitleArticle = ranks[index].titleArticle[branch.id];
                var rankTitle = ranks[index].title[branch.id];
                var rankDescription = ranks[index].description[branch.id];
                if(rankTitleArticle == null){
                    rankTitleArticle =  ranks[index].titleArticle[0];
                }
                if(rankTitle == null){
                    rankTitle =  ranks[index].title[0];
                }
                if(rankDescription == null){
                    rankDescription =  ranks[index].description[0];
                }
                notify(NotificationPurposeEnum.rankUp, "basic", "You are now " + rankTitleArticle + " " + rankTitle + "!",
                rankDescription, chrome.runtime.getURL("images/rank-up.png"));
            }

            rank = ranks[index];

            break;
        }
    }
}

function analyzeBranch(){
    var index, length;
    for (index = branches.length - 1, length = 0; index >= length; --index) {
        if(branches[index].functionRequirement()){
            branch = branches[index];
            break;
        }
    }
}

function buyPepegaSlot(){
    if(player.iqCount >= pepegaSlotCost && player.pepegaSlots < maxPepegaSlots){
        updatePlayerIqCount(-pepegaSlotCost);
        updatePlayerPepegaSlots(player.pepegaSlots + 1);
    }
}

function updateAllPopupDisplays(){
    updatePlayerIqCountPopupDisplay();
    updatePlayerPepegasPopupDisplay();
    updateSettingsPopupDisplay();
    updatePlayerArmyNamePopupDisplay();
    updatePlayerPepegaSlotsPopupDisplay();
    updatePlayerEncounterModePopupDisplay();
}
function updatePlayerPepegaSlotsPopupDisplay(){
    if(popup.isOpened){
		chrome.runtime.sendMessage({"message": "player-pepega-slots-updated", "playerPepegaCount": player.pepegas.length, "playerPepegaSlots": player.pepegaSlots, "pepegaSlotCost": pepegaSlotCost, "playerIqCount": player.iqCount}, function() {
		});
    }
}
function updatePlayerIqCountPopupDisplay(){
    if(popup.isOpened){
		chrome.runtime.sendMessage({"message": "player-iq-count-updated", "playerIqCount": player.iqCount, "rank": rank, "branch": branch, "nextRank": ranks[rank.id+1], "pepegaSlotCost": pepegaSlotCost, "ranksLength": ranks.length}, function() {
		});
    }
}
function updatePlayerPepegasPopupDisplay(){
    if(popup.isOpened){
        chrome.runtime.sendMessage({"message": "player-pepegas-updated", "playerPepegas": player.pepegas, "totalIqps": totalIqps, "multiplierTotalIqps": Math.round((totalIqps * rank.iqpsMultiplier) * uniquePepegaIqpsMultiplier), "playerPepegaSlots": player.pepegaSlots, "uniquePepegaIqpsMultiplier": uniquePepegaIqpsMultiplier, "baseEncounterRate": baseEncounterRate, "additionalPepegaEncounterRate": additionalPepegaEncounterRate, "playerEncounterMode": player.encounterMode}, function() {
        });
    }
}
function updateSettingsPopupDisplay(){
    if(popup.isOpened){
        chrome.runtime.sendMessage({"message": "settings-updated", "settings": settings}, function() {
        });
    }
}
function updatePlayerArmyNamePopupDisplay(){
    if(popup.isOpened){
        chrome.runtime.sendMessage({"message": "player-army-name-updated", "playerArmyName": player.armyName, "isDefaultArmyName": (player.armyName == defaultArmyName)}, function() {
        });
    }
}
function updatePlayerEncounterModePopupDisplay(){
    if(popup.isOpened){
        chrome.runtime.sendMessage({"message": "player-encounter-mode-updated", "playerEncounterMode": player.encounterMode, "baseEncounterRate": baseEncounterRate, "additionalPepegaEncounterRate": additionalPepegaEncounterRate}, function() {
        });
    }
}