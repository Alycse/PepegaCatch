const maxPlayerIqCount = 9999999999999999;
const maxPepegaSlots = 100;
const updateIqCountMillisecondInterval = 1000;
const defaultPepegaOrigin = "the internet";
const defaultArmyName = "Click here to change your Pepega Army's name";
const multiplesBeforeLevelUp = 3;
const maxPepegaLevel = 3;
const startingPlayerPepegaSlots = 4;
const maxArmyNameLength = 64;
const iqpsMultiplierForEachUniquePepega = 0.2;
const baseEncounterRate = 80;
const minimumCatchCountForMorePepegas = 5;
const multiplierBeforePepegaRecovers = 2000;
const idleIqMultiplier = 0.5;
const idleTime = 1800;

var browser = chrome;
var browserRuntime = browser.runtime;
var browserStorage = browser.storage.local;
var browserExtension = browser.extension;

var pepegaCatchSound = new Audio(browserRuntime.getURL("sounds/pepega-catch.ogg"));
pepegaCatchSound.volume = 0.25;
var pepegaReleaseSound = new Audio(browserRuntime.getURL("sounds/pepega-release.ogg"));
pepegaReleaseSound.volume = 0.25;
var pepegaFullArmySound = new Audio(browserRuntime.getURL("sounds/pepega-full-army.ogg"));
pepegaFullArmySound.volume = 0.1;
var pepegaLevelSound = new Audio(browserRuntime.getURL("sounds/pepega-level.ogg"));
pepegaLevelSound.volume = 0.25;
var pepegaFusionSound = new Audio(browserRuntime.getURL("sounds/pepega-fusion.ogg"));
pepegaFusionSound.volume = 0.25;
var pepegaHealSound = new Audio(browserRuntime.getURL("sounds/pepega-heal.ogg"));
pepegaHealSound.volume = 0.2;
var pepegaLostSound = new Audio(browserRuntime.getURL("sounds/pepega-lost.ogg"));
pepegaLostSound.volume = 0.2;
var pepegaRepelSound = new Audio(browserRuntime.getURL("sounds/pepega-repel.ogg"));
pepegaRepelSound.volume = 0.2;
var pepegaBuySlotSound = new Audio(browserRuntime.getURL("sounds/pepega-buy-slot.ogg"));
pepegaBuySlotSound.volume = 0.2;

var popup = {
	get isOpened (){
		return browserExtension.getViews({ type: "popup" }).length > 0;
	}
}

browser.tabs.onActivated.addListener(function() {
	updateIconFromSelectedTab();
});

function updateIconFromSelectedTab(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        updateIcon(activeTab.url);
    });
}

class PepegaType {
    constructor(id, fusionIds, name, description, iqps, iqReleasePriceMultiplier, basePower, healCostMultiplier, attacks, imageUrl) {
        this.id = id;
        this.fusionIds = fusionIds;
        this.name = name;
        this.description = description;
        this.iqReleasePriceMultiplier = iqReleasePriceMultiplier;
        this.iqps = iqps;
        this.basePower = basePower;
        this.healCostMultiplier = healCostMultiplier;
        this.attacks = attacks;
        this.imageUrl = imageUrl;
    }
}

class Pepega {
    constructor(pepegaType, origin, date, fusioned, power, level, alive, timeBeforeRecovery) {
        this.id = new Date().getTime();
        this.pepegaType = pepegaType;
        this.origin = origin;
        this.date = date;
        this.fusioned = fusioned;
        this.power = power;
        this.level = level;
        this.alive = alive;
        this.timeBeforeRecovery = timeBeforeRecovery;
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
    constructor(id, isSpecial, sites, options) {
        this.id = id;
        this.isSpecial = isSpecial;
        this.sites = sites;
        this.options = options;
    }
}

class Rank {
    constructor(id, titleArticle, title, description, functionRequirement, requirementDescription, iqpsMultiplier, basePower) {
        this.id = id;
        this.titleArticle = titleArticle;
        this.title = title;
        this.description = description;
        this.functionRequirement = functionRequirement;
        this.requirementDescription = requirementDescription;
        this.iqpsMultiplier = iqpsMultiplier;
        this.basePower = basePower;
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
    new Rank(0, ["a"], ["Pepega Trainer"], ["Gotta take em all!"], function iqRankRequirement(){ return isPlayerIqHigher(0); }, "0 IQ",1.0, 30),
    new Rank(1, ["a"], ["Pepega Shepherd"], [""], function iqRankRequirement(){ return isPlayerIqHigher(1000); }, "1,000 IQ", 1.1, 40),
    new Rank(2, ["a"], ["Pepega Whisperer"], [""], function iqRankRequirement(){ return isPlayerIqHigher(20000); }, "7,500 IQ", 1.2, 50),
    new Rank(3, ["a"], ["Pepega Researcher"], [""], function iqRankRequirement(){ return isPlayerIqHigher(150000); }, "20,000 IQ", 1.3, 60),
    new Rank(4, ["a"], ["Pepega Scientist"], [""], function iqRankRequirement(){ return isPlayerIqHigher(750000); }, "100,000 IQ", 1.4, 70),
    new Rank(5, ["a"], ["Pepega Guru"], [""], function iqRankRequirement(){ return isPlayerIqHigher(2000000); }, "500,000 IQ", 1.5, 80),
    new Rank(6, ["a"], ["Professor Pepega"], [""], function iqRankRequirement(){ return isPlayerIqHigher(5000000); }, "1,000,000 IQ", 1.7, 90),
    new Rank(7, ["a"], ["Pepega Leader"], [""], function iqRankRequirement(){ return isPlayerIqHigher(10000000); }, "5,000,000 IQ", 1.9, 100),
    new Rank(8, ["a"], ["Pepega Commander"], [""], function iqRankRequirement(){ return isPlayerIqHigher(20000000); }, "10,000,000 IQ", 2.1, 125),
    new Rank(9, [""], ["Captain Pepega"], ["You're the captain now!"], function iqRankRequirement(){ return isPlayerIqHigher(40000000); }, "35,000,000 IQ", 2.3, 150),
    new Rank(10, ["a"], ["Pepega General"], [""], function iqRankRequirement(){ return isPlayerIqHigher(75000000); }, "75,000,000 IQ", 2.5, 200),
    new Rank(11, ["a"], ["Pepega Champion"], [""], function iqRankRequirement(){ return isPlayerIqHigher(150000000); }, "150,000,000 IQ", 3.0, 250),
    new Rank(12, ["a", "a", "a"], ["Pepega Legend", "Pepega Master", "Pepega Titan"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(300000000); }, "300,000,000 IQ", 3.5, 300),
    new Rank(13, ["a", "the", "a"], ["Pepega Legend Silver", "Pepega King", "Pepega Machine"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(500000000); }, "500,000,000 IQ", 4.0, 400),
    new Rank(14, ["a", "the", "the"], ["Pepega Legend Gold", "President of the Pepega States", "Emperor of Pepegan"], 
    ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(1000000000); }, "1,000,000,000 IQ", 5.0, 500),
    new Rank(15, ["the", "the", "the"], ["True Pepega", "PepeGOD", "Gaijinga"], 
    ["Your IQ is less than 100... you are the truest of all Pepegas!", "Pepegas across the globe bow down to your presence.", "You are the ultimate weeb. AYAYA Clap"], 
    function iqRankRequirement(){  return finalRankRequirement(); }, "Every. Single. Pepega.", 10.0, 1000),
]

const branches = [
    new Branch(0, "Default", function defaultBranch(){return true;}),
    new Branch(1, "Nammer", namBranchRequirement),
    new Branch(2, "Weeb", weebBranchRequirement)
]

function isPlayerIqHigher(iqCountToTest){
    if(player.iqCount >= iqCountToTest){
        return true;
    }
    return false;
}
function finalRankRequirement(){
    if(pepegaTypes.length == uniquePepegaCount){
        return true;
    }
    return false;
}

function namBranchRequirement(){
    for(var i = 0; i < player.pepegas; i++){
        if(player.pepegas[i].pepegaType.id == 27 || player.pepegas[i].pepegaType.id == 28 || player.pepegas[i].pepegaType.id == 30 || 
            player.pepegas[i].pepegaType.id == 31 || player.pepegas[i].pepegaType.id == 32 || player.pepegas[i].pepegaType.id == 33 || 
            player.pepegas[i].pepegaType.id == 34){
            return true;
        }
    }
    return false;
}
function weebBranchRequirement(){
    var level3WeebgaCount = 0;
    for(var i = 0; i < player.pepegas; i++){
        if(player.pepegas[i].pepegaType.id == 35 && player.pepegas[i].level == 3){
            level3WeebgaCount++;
            if(level3WeebgaCount == 2){
                return true;
            }
        }
    }
    return false;
}

const pepegaTypes = [
    new PepegaType(0, [], "Pepega", "The original Pepega we all know and love.\nIts head is shaped like a garlic.", 
        0.5, 1,
        15, 15, ["Shout", "Push", "Scream"],
        browserRuntime.getURL("images/pepegas/0_Pepega.png")),

    new PepegaType(1, [0, 0, 0], "Okayga", "These Pepegas are only capable of staring and looking deep into someone else's eyes,\nbut somehow they do it very skillfully.", 
        5, 60, 
        80, 50, ["Smile", "Slap", "Dazzle"],
        browserRuntime.getURL("images/pepegas/1_Okayga.png")),

    new PepegaType(2, [1, 1, 1], "Pepege", "This Pepega is incapable of reading, writing, or doing anything\nthat involves the use of more than one brain cell, but at least\nit's smart enough to be aware of this.", 
        50, 120, 
        675, 60, ["Bite", "Confusion", "Charge"],
        browserRuntime.getURL("images/pepegas/2_Pepege.png")),

    new PepegaType(3, [], "Firega", "This Pepega leaves behind gasoline cans, gasoline-soaked rags,\nand lighters on websites it roams on.", 
        4, 60, 
        65, 50, ["Sun with face Clap", "Starfire", "Overheat"],
        browserRuntime.getURL("images/pepegas/3_Firega.png")),

    new PepegaType(4, [], "Grassga", "Grassgas devote their lives into protecting and preserving nature.\nThey are against the consumption of plants, animals, and water.\nThey only eat Pepegas.", 
        6, 60, 
        50, 50, ["Snus", "Fame Leech", "Sap"],
        browserRuntime.getURL("images/pepegas/4_Grassga.png")),

    new PepegaType(5, [], "Icega", "This Pepega has a beautiful voice and it loves singing and dancing in the snow.\nIt is also obsessed with Spidergas, for some reason.", 
        8, 60, 
        35, 50, ["Hail", "Stage", "Freeze"],
        browserRuntime.getURL("images/pepegas/5_Icega.png")),

    new PepegaType(6, [2, 3, 3], "Pepega Knight", "Pepega Knights are the protectors of the weak.\nThey will defend anyone who is under scrutiny by the public,\nas long as it is attractive of course.", 
        138, 300, 
        2975, 60, ["Donate", "Permaban", "Defend"],
        browserRuntime.getURL("images/pepegas/6_Pepega-Knight.png")),

    new PepegaType(7, [2, 4, 4], "Pepega Hunter", "Pepega Hunters can't actually shoot arrows with their bows,\ninstead they just bash their bows against their enemies.", 
        162, 300, 
        2610, 60, ["Snipe", "Remix", "Save Stream"],
        browserRuntime.getURL("images/pepegas/7_Pepega-Hunter.png")),

    new PepegaType(8, [2, 5, 5], "Pepega Wizard", "This Pepega is very fond of Time Travel and risque dancing.\nIt has a habit of screaming its own name.", 
        187, 300, 
        2235, 60, ["Old Age", "Thrust", "Time Compression"],
        browserRuntime.getURL("images/pepegas/8_Pepega-Wizard.png")),

    new PepegaType(9, [], "Baby Pepega", "Aww, it's so cute! :3", 
        4, 30, 
        80, 40, ["Cry", "Time Out", "Complain"],
        browserRuntime.getURL("images/pepegas/9_Baby-Pepega.png")),

    new PepegaType(10, [], "Silver Pepega", "", 
        1650, 600, 
        8055, 60, ["Laser Beam", "Electricity Bomb", "JC Denton"],
        browserRuntime.getURL("images/pepegas/10_Silver-Pepega.png")),

    new PepegaType(11, [], "Golden Pepega", "", 
        9000, 3600, 
        20890, 60, ["Illuminate", "Divine Judgement", "Holy War"],
        browserRuntime.getURL("images/pepegas/11_Golden-Pepega.png")),

    new PepegaType(12, [], "Joyga", "These Pepegas are very young.\nThey are easily attracted to Pepegas who are loud and obnoxious.", 
        4, 15, 
        50, 40, ["React", "Poggers", "Yeet"],
        browserRuntime.getURL("images/pepegas/12_Joyga.png")),

    new PepegaType(13, [], "Kkoga", "Kkogas are well-known for their obsession with weapons and unhealthy food.\nIt is living the Pepega dream.", 
        17, 30, 
        165, 40, ["Shoot", "Guitar Time", "Pray"],
        browserRuntime.getURL("images/pepegas/13_Kkoga.png")),

    new PepegaType(14, [], "Bitga", "This Pepega has as much IQ as the number of pixels it has.", 
        36, 30, 
        355, 50, ["Backseat", "Throw Controller", "Release Mobile Game"],
        browserRuntime.getURL("images/pepegas/14_Bitga.png")),

    new PepegaType(15, [12, 12, 14, 14], "Broga", "These Pepegas love the use of platforms that connect to the other side,\nand if anyone is standing in their way, Brogas can take them down with ease.", 
        247, 300, 
        2125, 50, ["Cross", "Review", "Call Swedish"],
        browserRuntime.getURL("images/pepegas/15_Broga.png")),

    new PepegaType(16, [13, 13, 13, 15], "Orange Pepega", "Orange Pepegas are carpenters who specialize in building walls.\nIt is their duty to make sure no one gets through them.", 
        964, 600, 
        7065, 50, ["Construct Wall", "Weebs Out", "Electrocute"],
        browserRuntime.getURL("images/pepegas/16_Orange-Pepega.png")),

    new PepegaType(17, [], "Fastga", "Contrary to popular belief, these Pepegas love listening to violent rap music.", 
        3, 15, 
        105, 40, ["Sprint", "Meow", "Redesign"],
        browserRuntime.getURL("images/pepegas/17_Fastga.png")),

    new PepegaType(18, [], "Pastorga", "This pepega tells you that by simply catching it, it has won.", 
        7, 15, 
        190, 40, ["Sing", "Preach", "Evangelize"],
        browserRuntime.getURL("images/pepegas/18_Pastorga.png")),

    new PepegaType(19, [17, 17, 18], "Red Fastga", "This Pepega keeps asking you if you know the destination.", 
        34, 30, 
        1065, 50, ["Click", "Show the Way", "Raid"],
        browserRuntime.getURL("images/pepegas/19_Red-Fastga.png")),

    new PepegaType(20, [19, 19], "Supa Pepega", "This Pepega is on a mission to defeat and destroy the Pepega Mafia.", 
        175, 300, 
        6065, 50, ["Supa Kicker", "Rapid Gunfire", "Slow-mo"],
        browserRuntime.getURL("images/pepegas/20_Supa-Pepega.png")),

    new PepegaType(21, [20, 20], "Pepega U", "This Pepega dedicates its life into avenging its Pepega brother\nthat was assassinated by who it thinks are the Pepega Mafia.\nIt is a master of Martial Arts and Wingless Flying.\nThey call it... Pepega U!", 
        861, 1800, 
        33410, 60, ["Ugandan Kiss", "Ugandan Kick", "Ugandan Strike"],
        browserRuntime.getURL("images/pepegas/21_Pepega-U.png")),

    new PepegaType(22, [], "Peppahga", "In spite of its appearance, it is not a rat,\nbut is in fact just another Pepega.", 
        98, 300, 
        860, 50, ["Bark", "Squeak", "Run"],
        browserRuntime.getURL("images/pepegas/22_Peppahga.png")),

    new PepegaType(23, [], "200 IQ Pepega", "This Pepega loves telling other Pepegas about their favorite cartoon show in a very condescending manner.\nIt then proceeds to tell them that they are not smart enough to understand the show anyway.", 
        148, 300, 
        1275, 50, ["Freak Out", "Superiority Complex", "Snob"],
        browserRuntime.getURL("images/pepegas/23_200-IQ-Pepega.png")),

    new PepegaType(24, [23, 23], "400 IQ Pepega", "No one knows why, but these Pepegas keep yelling the word \"Pickle\"\nand a guy named \"Richard\".", 
        941, 300, 
        6465, 60, ["Yell", "Outsmart", "Checkmate"],
        browserRuntime.getURL("images/pepegas/24_400-IQ-Pepega.png")),

    new PepegaType(25, [24, 24], "Amazga", "One of the smartest Pepegas known to Pepegakind.\nLegend has it that this Pepega has already beaten this game.", 
        6528, 600,
        32765, 70, ["Ragnaros", "Blindfold", "Scam"],
        browserRuntime.getURL("images/pepegas/25_Amazga.png")),

    new PepegaType(26, [25, 25], "Scamazga", "SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE\nSCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE\nTHERE'S NOTHING YOU CAN DO\nHAHAHAHAHAHAHAHAHAHAHAHAHAHA", 
        37393, -10, 
        -15000, 55, ["Curse", "Possess", "Backstab"],
        browserRuntime.getURL("images/pepegas/26_Scamazga.png")),

    new PepegaType(27, [], "Pridega", "", 
        7, 15, 
        190, 40, ["Attack"],
        browserRuntime.getURL("images/pepegas/27_Pridega.png")),

    new PepegaType(28, [], "Stronga", "These Pepegas love going to the gym\nand wrestling with their fellow Strongas.", 
        148, 30, 
        3745, 50, ["Lift", "Wrestle", "Taunt"],
        browserRuntime.getURL("images/pepegas/28_Stronga.png")),

    new PepegaType(29, [], "Jamga", "Jamgas are masters of music,\nmore specifically, groaning music.", 
        269, 60, 
        4270, 50, ["Hyperjam", "Hop", "AHHHHH"],
        browserRuntime.getURL("images/pepegas/29_Jamga.png")),

    new PepegaType(30, [27, 28, 3, 3], "Rigardo", "An expert in what is known as romantic dancing,\nRigardo can dance to almost every type of music.", 
        438, 600, 
        13325, 50, ["Ram", "Hump", "Lunge"],
        browserRuntime.getURL("images/pepegas/30_Rigardo.png")),

    new PepegaType(31, [27, 28, 4, 4], "Billiga", "Billiga is highly respected for its service in the Pepega Armed Forces.\nIt is a tough, but loving Pepega, and it only wants what's best for you.\nAfter its retirement, it has become a prominent figure in the Pepega wresling community.", 
        487, 600, 
        12385, 50, ["Headscissor", "Armlock", "Kiss"],
        browserRuntime.getURL("images/pepegas/31_Billiga.png")),

    new PepegaType(32, [27, 28, 5, 5], "Vanga", "Vangas are infamous for owning their very own dungeon\nwhere they party with their friends. They are also commonly referred to as Leathergas,\ndue to the outfit that they wear.", 
        537, 600, 
        11435, 50, ["Tie Up", "Leatherwhip", "Mermaid Splash"],
        browserRuntime.getURL("images/pepegas/32_Vanga.png")),

    new PepegaType(33, [30, 31, 32, 29, 29], "Gachiga", "Gachigas are considered to be the strongest and simultaneously the most beautiful Pepegas known to Pepegakind.\nIt greatly excels in performance art, music, and bodybuilding.", 
        4951, 600, 
        115340, 60, ["Manly Rave", "Thunder Remix", "AAAAAAAHHHHHHHH!"],
        browserRuntime.getURL("images/pepegas/33_Gachiga.png")),

    new PepegaType(34, [33, 33], "Hypergachiga", "A Pepega Abomination. What have you done?", 
        -2000, 600, 
        617315, 70, ["Annihilate", "Obliterate", "DEATH"],
        browserRuntime.getURL("images/pepegas/34_Hypergachiga.png")),

    new PepegaType(35, [], "Weebga", "These Pepegas are obsessed with children's cartoons to the point where\nthey will dress up as their favorite character, and in some cases,\neven fall in love with the character.", 
        4, 30, 
        40, 40, ["NyanPls", "MikuStare", "Gasp!"],
        browserRuntime.getURL("images/pepegas/35_Weebga.png")),

    new PepegaType(36, [], "Maldga", "This Pepega somehow manages to not only be mald,\nbut also bald at the same time.", 
        7, 30, 
        65, 50, ["Infect with Maldness", "BOO", "Quit"],
        browserRuntime.getURL("images/pepegas/36_Maldga.png")),

    new PepegaType(37, [], "Aimga", "Having inpepegan reflexes, these Pepegas are very good\nat shooter games and everything that requires true skill.", 
        4, 30,  
        80, 50, ["AWP", "AK-47", "M4A4"],
        browserRuntime.getURL("images/pepegas/37_Aimga.png")),

    new PepegaType(38, [], "Pokketga", "", 
        4, 30,  
        40, 50, ["Attack"],
        browserRuntime.getURL("images/pepegas/38_Pokketga.png")),

    new PepegaType(39, [], "Kappaga", "An incredibly popular and beloved Pepega... Kappa.", 
        7, 30, 
        225, 50, ["Jebait", "Account Suspension", "Banhammer"],
        browserRuntime.getURL("images/pepegas/39_Kappaga.png")),

    new PepegaType(40, [39, 39, 17], "Ninjaga", "This Pepega keeps telling you to click the Subscribe button,\nbut also making sure you don't smash it.", 
        47, 300, 
        1790, 50, ["Ligma", "Subscribe to Pepega Prime (without smashing)", "Stream on Miksga"],
        browserRuntime.getURL("images/pepegas/40_Ninjaga.png")),

    new PepegaType(41, [39, 39, 12], "Xqga", "A streamer with a fanbase.", 
        51, 300, 
        1730, 50, ["React", "Slam Desk", "Freak Out"],
        browserRuntime.getURL("images/pepegas/41_Xqga.png")),

    new PepegaType(42, [39, 39, 37], "Shroudga", "Shroudgas are the paragon of skill.\nThey are natural born hunters and they can easily kill you from a mile away.\nDespite their greatness, however, they have lost to a certain Mald Pepega in the past.", 
        55, 300, 
        1675, 50, ["Slay", "Dominate", "Execute"],
        browserRuntime.getURL("images/pepegas/42_Shroudga.png")),

    new PepegaType(43, [39, 39, 27], "Tylerga", "Tylergas are recognized for their intense, boisterous screaming and desk slamming.\nThey were tormented in the past by the nefarious Pepegas known as Tannergas.", 
        58, 300, 
        1620, 50, ["SCREAM", "SLAM KEYBOARD", "OUTBREAK"],
        browserRuntime.getURL("images/pepegas/43_Tylerga.png")),

    new PepegaType(44, [39, 39, 9], "GreekGaX", "This Pepega has a habit of sticking to other Pepegas\nin hopes of stealing their IQ. It enjoys eating excessive amounts of food\neven though it has swore, many times in the past, to do the complete opposite.", 
        62, 300, 
        1560, 50, ["Devour", "Explode", "Send to Vacation City"],
        browserRuntime.getURL("images/pepegas/44_GreekGaX.png")),

    new PepegaType(45, [39, 39, 35], "Triga", "Trigas are very popular for their immense skill in the game called Maldio and Mald Island.\nThey are considered to be the best at this genre, and they don't mald very easily unlike some other Pepegas.", 
        66, 300, 
        1505, 50, ["Try Hard", "Speedrun", "7"],
        browserRuntime.getURL("images/pepegas/45_Triga.png")),

    new PepegaType(47, [39, 39, 38, 38], "Doctor Pepega", "The three time, back to back to back, consecutive years, 1982-1976 blockbuster Pepega.\nFor some reason, you can see through its body.", 
        69, 300, 
        1445, 50, ["Two-Time", "Invisibility", "Become Champion"],
        browserRuntime.getURL("images/pepegas/47_Doctor-Pepega.png")),

    new PepegaType(46, [39, 39, 36], "Forsenga", "A professional children's card player that gets mad and bald when it loses.\nAlthough, nowadays, it just plays cartoon drag-and-drop games that require no skill whatsoever.\nPerhaps, this way, it can just blame its bad luck when it loses, instead of its lack of skill.", 
        73, 300, 
        1390, 50, ["Steal Posture", "Bottom Snus", "Google"],
        browserRuntime.getURL("images/pepegas/46_Forsenga.png")),

    new PepegaType(48, [], "REPLIGA", "", 
        -1000, 10, 
        8500, 60, ["t0rm3nt"],
        browserRuntime.getURL("images/pepegas/48_REPLIGA.png")),

    new PepegaType(49, [], "ZOZOGA", "", 
        2400, 5, 
        80000, 70, ["Torment"],
        browserRuntime.getURL("images/pepegas/49_ZOZOGA.png")),

    new PepegaType(50, [], "FINAL ZOZOGA", "", 
        24000, -10, 
        215000, 80, ["Hijack", "Shut Down", "Possess"],
        browserRuntime.getURL("images/pepegas/50_FINAL-ZOZOGA.png")),
]

const categories = [
    new Category(0, false, [],
        [
            new Option(pepegaTypes[3], 5),
            new Option(pepegaTypes[4], 5),
            new Option(pepegaTypes[5], 5),
            new Option(pepegaTypes[6], 0.2),
            new Option(pepegaTypes[7], 0.2),
            new Option(pepegaTypes[8], 0.2),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 8),
            new Option(pepegaTypes[13], 5),
            new Option(pepegaTypes[14], 3),
            new Option(pepegaTypes[17], 8),
            new Option(pepegaTypes[18], 5),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[23], 1),
            new Option(pepegaTypes[27], 6),
            new Option(pepegaTypes[28], 0.25),
            new Option(pepegaTypes[29], 0.15),
            new Option(pepegaTypes[35], 3),
            new Option(pepegaTypes[36], 3),
            new Option(pepegaTypes[37], 3),
            new Option(pepegaTypes[38], 3),
            new Option(pepegaTypes[48], 0.05),
            new Option(pepegaTypes[49], 0.005),
            new Option(pepegaTypes[50], 0.0005)
        ]
    ),
    new Category(1, false,
        [
            new Site("youtube"),
            new Site("twitter"),
        ],
        [
            new Option(pepegaTypes[3], 3),
            new Option(pepegaTypes[4], 3),
            new Option(pepegaTypes[5], 8),
            new Option(pepegaTypes[8], 0.25),
            new Option(pepegaTypes[9], 5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 15),
            new Option(pepegaTypes[13], 7.5),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[15], 3),
            new Option(pepegaTypes[27], 7.5),
            new Option(pepegaTypes[35], 6),
            new Option(pepegaTypes[37], 6)
        ]
    ),
    new Category(2, false,
        [
            new Site("instagram"),
            new Site("facebook"),
            new Site("tumblr")
        ],
        [
            new Option(pepegaTypes[3], 8),
            new Option(pepegaTypes[4], 3),
            new Option(pepegaTypes[5], 3),
            new Option(pepegaTypes[6], 0.25),
            new Option(pepegaTypes[9], 5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[17], 15),
            new Option(pepegaTypes[18], 7.5),
            new Option(pepegaTypes[19], 3),
            new Option(pepegaTypes[27], 7.5),
            new Option(pepegaTypes[36], 6),
            new Option(pepegaTypes[38], 6)
        ]
    ),
    new Category(3, false,
        [
            new Site("reddit")
        ],
        [
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[7], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 5),
            new Option(pepegaTypes[13], 6),
            new Option(pepegaTypes[14], 3),
            new Option(pepegaTypes[15], 3),
            new Option(pepegaTypes[17], 6),
            new Option(pepegaTypes[18], 7),
            new Option(pepegaTypes[19], 3),
            new Option(pepegaTypes[22], 3),
            new Option(pepegaTypes[23], 5),
            new Option(pepegaTypes[27], 7.5),
            new Option(pepegaTypes[28], 5),
            new Option(pepegaTypes[29], 4),
            new Option(pepegaTypes[35], 3),
            new Option(pepegaTypes[36], 3),
            new Option(pepegaTypes[37], 3),
            new Option(pepegaTypes[38], 6)
        ]
    ),
    new Category(4, false,
        [
            new Site("osu"),
            new Site("anime"),
            new Site("crunchyroll"),
            new Site("funimation"),
            new Site("manga"),
            new Site("deviantart")
        ],
        [
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[7], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 10),
            new Option(pepegaTypes[14], 6),
            new Option(pepegaTypes[17], 10),
            new Option(pepegaTypes[18], 3),
            new Option(pepegaTypes[19], 1),
            new Option(pepegaTypes[22], 2),
            new Option(pepegaTypes[23], 1),
            new Option(pepegaTypes[35], 20)
        ]
    ),
    new Category(5, false,
        [
            new Site("twitch"),
            new Site("mixer"),
        ],
        [
            new Option(pepegaTypes[9], 2),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[17], 6),
            new Option(pepegaTypes[18], 6),
            new Option(pepegaTypes[19], 3),
            new Option(pepegaTypes[22], 3),
            new Option(pepegaTypes[23], 3.5),
            new Option(pepegaTypes[24], 2.5),
            new Option(pepegaTypes[27], 6),
            new Option(pepegaTypes[28], 5),
            new Option(pepegaTypes[29], 5),
            new Option(pepegaTypes[35], 4),
            new Option(pepegaTypes[36], 9),
            new Option(pepegaTypes[37], 9),
            new Option(pepegaTypes[38], 9),
            new Option(pepegaTypes[39], 16),
            new Option(pepegaTypes[40], 0.5),
            new Option(pepegaTypes[41], 0.5),
            new Option(pepegaTypes[42], 0.5),
            new Option(pepegaTypes[43], 0.5),
            new Option(pepegaTypes[44], 0.5),
            new Option(pepegaTypes[45], 0.5),
            new Option(pepegaTypes[46], 0.5),
            new Option(pepegaTypes[47], 0.5)
        ]
    ),
    new Category(6, false,
        [
            new Site("ign"),
            new Site("kotaku"),
            new Site("gamefaqs"),
            new Site("gamespot"),
            new Site("n4g"),
            new Site("escapist"),
            new Site("pcgamer"),
            new Site("destructoid"),
            new Site("giantbomb"),
            new Site("gameinformer"),
            new Site("gamesradar"),
            new Site("nintendo")
        ],
        [
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[6], 0.5),
            new Option(pepegaTypes[7], 2),
            new Option(pepegaTypes[8], 0.5),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[14], 15),
            new Option(pepegaTypes[17], 5),
            new Option(pepegaTypes[18], 2.5),
            new Option(pepegaTypes[19], 5),
            new Option(pepegaTypes[20], 1),
            new Option(pepegaTypes[22], 1.5),
            new Option(pepegaTypes[23], 5),
            new Option(pepegaTypes[24], 5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[29], 5),
            new Option(pepegaTypes[35], 4),
            new Option(pepegaTypes[36], 7),
            new Option(pepegaTypes[37], 10),
            new Option(pepegaTypes[38], 3),
            new Option(pepegaTypes[40], 0.5),
            new Option(pepegaTypes[41], 0.5),
            new Option(pepegaTypes[42], 0.5),
            new Option(pepegaTypes[43], 0.5),
            new Option(pepegaTypes[44], 0.5),
            new Option(pepegaTypes[45], 0.5),
            new Option(pepegaTypes[46], 0.5),
            new Option(pepegaTypes[47], 0.5)
        ]
    ),
    new Category(7, false,
        [
            new Site("soundcloud"),
            new Site("music"),
            new Site("sound"),
            new Site("pandora"),
            new Site("spotify"),
            new Site("myspace"),
            new Site("last.fm"),
            new Site("iheart"),
            new Site("tunein"),
        ],
        [
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[7], 1),
            new Option(pepegaTypes[9], 2.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 5),
            new Option(pepegaTypes[13], 5),
            new Option(pepegaTypes[14], 7),
            new Option(pepegaTypes[15], 2.5),
            new Option(pepegaTypes[22], 6),
            new Option(pepegaTypes[23], 6),
            new Option(pepegaTypes[24], 0.5),
            new Option(pepegaTypes[27], 6),
            new Option(pepegaTypes[28], 4),
            new Option(pepegaTypes[29], 20),
            new Option(pepegaTypes[38], 4),
            new Option(pepegaTypes[45], 0.5),
            new Option(pepegaTypes[47], 0.5)
        ]
    ),
    new Category(8, false,
        [
            new Site("google"),
            new Site("bing"),
            new Site("yahoo"),
            new Site("ask"),
            new Site("baidu"),
            new Site("wolframalpha"),
            new Site("duckduckgo")
        ],
        [
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 4),
            new Option(pepegaTypes[4], 4),
            new Option(pepegaTypes[5], 8),
            new Option(pepegaTypes[8], 1.5),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 5),
            new Option(pepegaTypes[13], 5),
            new Option(pepegaTypes[14], 7.5),
            new Option(pepegaTypes[22], 7.5),
            new Option(pepegaTypes[23], 17.5),
            new Option(pepegaTypes[24], 5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[29], 2.5),
            new Option(pepegaTypes[36], 2.5),
            new Option(pepegaTypes[46], 0.5)
        ]
    ),
    new Category(9, false,
        [
            new Site("wikipedia"),
            new Site("wikihow"),
            new Site("stackexchange"),
            new Site("quora"),
            new Site("metafilter")
        ],
        [ 
            new Option(pepegaTypes[2], 3),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 8),
            new Option(pepegaTypes[8], 2),
            new Option(pepegaTypes[9], 1.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 1.5),
            new Option(pepegaTypes[13], 2.5),
            new Option(pepegaTypes[14], 7.5),
            new Option(pepegaTypes[15], 3),
            new Option(pepegaTypes[22], 7.5),
            new Option(pepegaTypes[23], 12.5),
            new Option(pepegaTypes[24], 15),
            new Option(pepegaTypes[29], 3.5)
        ]
    ),
    new Category(10, false,
        [
            new Site("amazon"),
            new Site("ebay"),
            new Site("craigslist"),
            new Site("walmart"),
            new Site("etsy"),
            new Site("homedepot"),
            new Site("target"),
            new Site("wish")
        ],
        [
            new Option(pepegaTypes[2], 3),
            new Option(pepegaTypes[3], 7),
            new Option(pepegaTypes[4], 7),
            new Option(pepegaTypes[5], 1),
            new Option(pepegaTypes[6], 5),
            new Option(pepegaTypes[7], 5),
            new Option(pepegaTypes[9], 2.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[17], 2.5),
            new Option(pepegaTypes[18], 3),
            new Option(pepegaTypes[19], 5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[28], 7.5),
            new Option(pepegaTypes[29], 5),
            new Option(pepegaTypes[35], 1),
            new Option(pepegaTypes[38], 2.5),
            new Option(pepegaTypes[44], 0.5),
            new Option(pepegaTypes[46], 0.5)
        ]
    ),
    new Category(11, false,
        [
            new Site("xvideos"),
            new Site("porn"),
            new Site("xhamster"),
            new Site("xnxx"),
            new Site("youjizz"),
            new Site("motherless"),
            new Site("livejasmin"),
            new Site("efukt"),
            new Site("sex"),
            new Site("fuck"),
            new Site("erotic"),
        ],
        [
            new Option(pepegaTypes[2], 3),
            new Option(pepegaTypes[3], 6),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[6], 1),
            new Option(pepegaTypes[8], 1),
            new Option(pepegaTypes[9], 2.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[13], 4),
            new Option(pepegaTypes[14], 2),
            new Option(pepegaTypes[17], 4),
            new Option(pepegaTypes[18], 6),
            new Option(pepegaTypes[19], 2),
            new Option(pepegaTypes[27], 7.5),
            new Option(pepegaTypes[28], 15),
            new Option(pepegaTypes[29], 3),
            new Option(pepegaTypes[30], 0.5),
            new Option(pepegaTypes[31], 0.5),
            new Option(pepegaTypes[32], 0.5),
            new Option(pepegaTypes[35], 3),
            new Option(pepegaTypes[38], 5),
            new Option(pepegaTypes[47], 0.5)
        ]
    ),
    new Category(12, false,
        [
            new Site("hentai"),
            new Site("fakku"),
            new Site("4channel"),
            new Site("doujin")
        ],
        [
            new Option(pepegaTypes[2], 2),
            new Option(pepegaTypes[3], 4),
            new Option(pepegaTypes[4], 1),
            new Option(pepegaTypes[5], 4),
            new Option(pepegaTypes[6], 1),
            new Option(pepegaTypes[8], 1),
            new Option(pepegaTypes[9], 5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[17], 1),
            new Option(pepegaTypes[18], 2),
            new Option(pepegaTypes[19], 3.5),
            new Option(pepegaTypes[20], 1),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[28], 12.5),
            new Option(pepegaTypes[29], 7.5),
            new Option(pepegaTypes[30], 1),
            new Option(pepegaTypes[31], 1),
            new Option(pepegaTypes[32], 1),
            new Option(pepegaTypes[35], 15),
            new Option(pepegaTypes[45], 0.5)
        ]
    ),
    new Category(13, false,
        [
            new Site("4chan"),
            new Site("8chan"),
            new Site("2chan")
        ],
        [
            new Option(pepegaTypes[2], 3),
            new Option(pepegaTypes[3], 6),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[6], 1),
            new Option(pepegaTypes[8], 1),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[14], 2.5),
            new Option(pepegaTypes[15], 5),
            new Option(pepegaTypes[16], 1),
            new Option(pepegaTypes[19], 2.5),
            new Option(pepegaTypes[20], 5),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[23], 2.5),
            new Option(pepegaTypes[24], 5),
            new Option(pepegaTypes[27], 1),
            new Option(pepegaTypes[28], 6.5),
            new Option(pepegaTypes[29], 7.5),
            new Option(pepegaTypes[30], 0.25),
            new Option(pepegaTypes[31], 0.25),
            new Option(pepegaTypes[32], 0.25),
            new Option(pepegaTypes[35], 10),
            new Option(pepegaTypes[45], 0.5)
        ]
    ),
    new Category(14, true,
        [
            new Site("kaotic"),
            new Site("gorejunkies"),
            new Site("livegore")
        ],
        [
            new Option(pepegaTypes[48], 92.5),
            new Option(pepegaTypes[49], 5),
            new Option(pepegaTypes[50], 2.5)
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
    new EncounterMode(1, "Less Encounters (40%)", 40),
    new EncounterMode(2, "Encounters Disabled (0%)", 0)
]

//Begin Initializating Player Stats

var totalIqps = 0;
var totalPepegaPower = 0;
var rank = ranks[0];
var branch = branches[0];
var pepegaSlotCost = 0;
var uniquePepegaIqpsMultiplier = 1;
var uniquePepegaCount = 0;
var isPlayerIdle = false;

var player = {
    iqCount: 0,
    pepegas: [],
    armyName: defaultArmyName,
    pepegaSlots: startingPlayerPepegaSlots,
    catchCount: 0,
    successfulCatchCount: 0,
    encounterCount: 0,
    pepegaTypeStatuses: []
}

var settings = {
    enableSounds: true,
    enablePepegaCatchReleaseNotifications: true,
    enableRankUpNotifications: true,
    enableTutorialNotifications: true,
    enablePepegaHealNotifications: true,
    recordOrigin: true,
    showBattleBreakdown: true
}

var config = {
    filteredSites: [],
    encounterMode: encounterModes[0],
    isIqCountUnitized: true
}

var tutorial = {
    phase: "ask",
    randomPhase: "",
    enableUniquePepegaRandomTutorial: true,
    enableRankUpRandomTutorial: true,
    enableDeadPepegaRandomTutorial: true
}

var notificationsDisplay = {
    header: "",
    message: ""
}

var savedScrollPosition = 0;

browserStorage.get(["notificationsDisplayHeader", "notificationsDisplayMessage"], function(result) {
    if(result.notificationsDisplayHeader != null){
        notificationsDisplay.header = result.notificationsDisplayHeader;
    }

    if(result.notificationsDisplayMessage != null){
        notificationsDisplay.message = result.notificationsDisplayMessage;
    }
});

browserStorage.get(["tutorialPhase", "randomTutorialPhase", "enableUniquePepegaRandomTutorial", "enableRankUpRandomTutorial", "enableDeadPepegaRandomTutorial"], function(result) {
    if(result.tutorialPhase != null){
        tutorial.phase = result.tutorialPhase;
    }

    if(result.randomTutorialPhase != null){
        tutorial.randomPhase = result.randomTutorialPhase;
    }

    if(result.enableUniquePepegaRandomTutorial != null){
        tutorial.enableUniquePepegaRandomTutorial = result.enableUniquePepegaRandomTutorial;
    }

    if(result.enableRankUpRandomTutorial != null){
        tutorial.enableRankUpRandomTutorial = result.enableRankUpRandomTutorial;
    }

    if(result.enableDeadPepegaRandomTutorial != null){
        tutorial.enableDeadPepegaRandomTutorial = result.enableDeadPepegaRandomTutorial;
    }
});

function resetTutorial(){
    browserStorage.set({"tutorialPhase": null});
    browserStorage.set({"randomTutorialPhase": null});
    browserStorage.set({"enableUniquePepegaRandomTutorial": null});
    browserStorage.set({"enableRankUpRandomTutorial": null});
    browserStorage.set({"enableDeadPepegaRandomTutorial": null});
    tutorial.phase = "ask";
    tutorial.randomPhase = "";
    tutorial.enableRankUpRandomTutorial = true;
    tutorial.enableUniquePepegaRandomTutorial = true;
    tutorial.enableDeadPepegaRandomTutorial = true;
    updateTutorialPhasePopupDisplay()
    updateRandomTutorialPopupDisplay();
}

browserStorage.get(["playerIqCount", "playerPepegaSlots", "playerCatchCount", "playerSuccessfulCatchCount", "playerEncounterCount", "playerArmyName", "playerPepegaTypeStatuses"], function(result) {
    if(parseInt(result.playerIqCount)){
        player.iqCount = result.playerIqCount;
    }

    if(result.playerPepegaSlots != null){
        player.pepegaSlots = result.playerPepegaSlots;
    }
    analyzePepegaSlotCost();

    if(result.playerCatchCount != null){
        player.catchCount = result.playerCatchCount;
    }

    if(result.playerSuccessfulCatchCount != null){
        player.successfulCatchCount = result.playerSuccessfulCatchCount;
    }

    if(result.playerEncounterCount != null){
        player.encounterCount = result.playerEncounterCount;
    }

    if(result.playerArmyName != null){
        player.armyName = result.playerArmyName;
    }

    if(result.playerPepegaTypeStatuses != null){
        player.pepegaTypeStatuses = result.playerPepegaTypeStatuses;
    }
});

browserStorage.get(["playerPepegas"], function(result) {
    if(result.playerPepegas != null){
        var index, length;
        for (index = 0, length = result.playerPepegas.length; index < length; ++index) {
            var playerPepega = new Pepega(pepegaTypes[result.playerPepegas[index].pepegaType.id]);
            
            //properties that need to carry over
            playerPepega.id = result.playerPepegas[index].id;
            playerPepega.origin = result.playerPepegas[index].origin;
            playerPepega.date = result.playerPepegas[index].date;
            playerPepega.fusioned = result.playerPepegas[index].fusioned;
            playerPepega.power = result.playerPepegas[index].power;
            playerPepega.level = result.playerPepegas[index].level;
            playerPepega.alive = result.playerPepegas[index].alive;
            playerPepega.timeBeforeRecovery = result.playerPepegas[index].timeBeforeRecovery;
            
            addPlayerPepega(playerPepega, false, false);
        }
        analyzeBranch();
        analyzeUniquePepegas();
        analyzeRank(false);
    }
});

browserStorage.get(["configEncounterMode"], function(result) {
    if(result.configEncounterMode != null){
        config.encounterMode = result.configEncounterMode;
        updateIconFromSelectedTab();
    }
});

browserStorage.get(["configIsIqCountUnitized"], function(result) {
    if(result.configIsIqCountUnitized != null){
        config.isIqCountUnitized = result.configIsIqCountUnitized;
    }
});

browserStorage.get(["configFilteredSites"], function(result) {
    if(result.configFilteredSites != null){
        config.filteredSites = result.configFilteredSites;
    }
});

browserStorage.get(["settings"], function(result) {
    if(result.settings != null){
        settings = result.settings;
    }
});

//End Initializating Player Stats

function answerTutorialAsk(tutorialAnswer){
    if(tutorialAnswer){
        updateTutorialPhase("catchPrompt");
    }else{
        updateTutorialPhase("disabled");
        updateRandomTutorialPhase("disabled");
    }
    updateTutorialPhasePopupDisplay();
}

function updateTutorialPhase(tutorialPhase){
    tutorial.phase = tutorialPhase;
    browserStorage.set({"tutorialPhase": tutorial.phase});

    updateTutorialPhasePopupDisplay();
}
function updateRandomTutorialPhase(randomTutorialPhase){
    tutorial.randomPhase += "_" + randomTutorialPhase + "_";

    browserStorage.set({"randomTutorialPhase": tutorial.randomPhase});

    if(tutorial.randomPhase.includes("uniquePepega")){
        tutorial.enableUniquePepegaRandomTutorial = false;
        browserStorage.set({"enableUniquePepegaRandomTutorial": tutorial.enableUniquePepegaRandomTutorial});
    } else if(tutorial.randomPhase.includes("rankUp")){
        tutorial.enableRankUpRandomTutorial = false;
        browserStorage.set({"enableRankUpRandomTutorial": tutorial.enableRankUpRandomTutorial});
    } else if(tutorial.randomPhase.includes("deadPepega")){
        tutorial.enableDeadPepegaRandomTutorial = false;
        browserStorage.set({"enableDeadPepegaRandomTutorial": tutorial.enableDeadPepegaRandomTutorial});
    }

    updateRandomTutorialPopupDisplay();
}
function replaceRandomTutorialPhase(randomTutorialPhase){
    tutorial.randomPhase = randomTutorialPhase;

    browserStorage.set({"randomTutorialPhase": tutorial.randomPhase});

    updateRandomTutorialPopupDisplay();
}

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
            
            if(player.pepegas[index].alive){
                totalIqps -= player.pepegas[index].pepegaType.iqps * player.pepegas[index].level;
                totalPepegaPower -= player.pepegas[index].power * player.pepegas[index].level;
            }

            player.pepegas.splice(index, 1);
            break;
        }
    }

    analyzeUniquePepegas();
    analyzeBranch();
    updatePlayerPepegasPopupDisplay();

    if(save){
        browserStorage.set({playerPepegas: player.pepegas});
    }
}

chrome.idle.setDetectionInterval(idleTime);
chrome.idle.onStateChanged.addListener(
    function (state) {
        if (state === "idle"){
            isPlayerIdle = true;
        }else{
            isPlayerIdle = false;
        }
        updateIdlePopupDisplay();
    }
);

function updatePlayerPepegaSlots(newPepegaSlots, save = true){
    player.pepegaSlots = newPepegaSlots;

    analyzePepegaSlotCost();

    updatePlayerPepegaSlotsPopupDisplay();

    if(save){
        browserStorage.set({playerPepegaSlots: player.pepegaSlots});
    }
}

function analyzePepegaSlotCost(){
    var costBase = player.pepegaSlots;
    if(player.pepegaSlots <= 4){
        pepegaSlotCost = 125;
    } else if(player.pepegaSlots <= 8){
        pepegaSlotCost = Math.round(Math.pow(costBase, 7) * 0.05);
    } else if(player.pepegaSlots <= 24){
        pepegaSlotCost = Math.round(Math.pow(costBase, 7) * 0.07);
    } else {
        pepegaSlotCost = Math.round(Math.pow(24 + ((costBase-24) * 0.4), 7) * 0.07);
    }
}

function analyzeUniquePepegas(){
    var uniquePepegas = [...new Set(player.pepegas.map(pepega => pepega.pepegaType.id))];
    uniquePepegaCount = uniquePepegas.length;

    uniquePepegaIqpsMultiplier = 1 + ((uniquePepegaCount-1) * iqpsMultiplierForEachUniquePepega);

    if(uniquePepegaCount > 1 && tutorial.phase != "disabled" && tutorial.enableUniquePepegaRandomTutorial){
        updateRandomTutorialPhase("uniquePepega");
    }
}

function getCategory(hostname){
    var index, length;
    for (index = 1, length = categories.length; index < length; ++index) {
        var index2, length2;
        for (index2 = 0, length2 = categories[index].sites.length; index2 < length2; ++index2) {
            if(hostname.includes(categories[index].sites[index2].hostname)){
                return categories[index];
            }
        }
    }
    return null;
}

function rollPepegaPower(basePower){
    var roll = 0;
    if(player.catchCount == 5){
        roll = (Math.random() * (0.85 - 0.75)) + 0.75;
    } else {
        roll = (Math.random() * (1.2 - 0.8)) + 0.8;
    }
    return Math.round((basePower * roll) * 100) / 100;
}

/*
const categories = [
    new Category(0, false, [],
        [
            new Option(pepegaTypes[3], 5),
            new Option(pepegaTypes[4], 5),
            new Option(pepegaTypes[5], 5),
            new Option(pepegaTypes[6], 0.2),
            new Option(pepegaTypes[7], 0.2),
            new Option(pepegaTypes[8], 0.2),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 8),
            new Option(pepegaTypes[13], 5),
            new Option(pepegaTypes[14], 3),
            new Option(pepegaTypes[17], 8),
            new Option(pepegaTypes[18], 5),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[23], 1),
            new Option(pepegaTypes[27], 6),
            new Option(pepegaTypes[28], 0.25),
            new Option(pepegaTypes[29], 0.15),
            new Option(pepegaTypes[35], 3),
            new Option(pepegaTypes[36], 3),
            new Option(pepegaTypes[37], 3),
            new Option(pepegaTypes[38], 3),
            new Option(pepegaTypes[48], 0.05),
            new Option(pepegaTypes[49], 0.005),
            new Option(pepegaTypes[50], 0.0005)
        ]
    ),
    */

function rollWildPepega(category){
    var wildPepegaType = pepegaTypes[0];
    var wildPepegaLevel = 1;
    var specialEventOccured = false;

    if(!category.isSpecial){
        if(player.catchCount == 1){
            wildPepegaType = pepegaTypes[3];
            specialEventOccured = true;
         } else if(player.catchCount == 5){
            var roll = Math.floor(Math.random() * (3));
            if(roll == 0){
                wildPepegaType = pepegaTypes[3];
            }else if(roll == 1){
                wildPepegaType = pepegaTypes[4];
            }else{
                wildPepegaType = pepegaTypes[5];
            }
            specialEventOccured = true;
        } else if(player.successfulCatchCount < minimumCatchCountForMorePepegas){
            specialEventOccured = true;
        } else if(player.catchCount == 6){
            var roll = Math.floor(Math.random() * (8));
            if(roll == 0){
                wildPepegaType = pepegaTypes[40];
            }else if(roll == 1){
                wildPepegaType = pepegaTypes[41];
            }else if(roll == 2){
                wildPepegaType = pepegaTypes[42];
            }else if(roll == 3){
                wildPepegaType = pepegaTypes[43];
            }else if(roll == 4){
                wildPepegaType = pepegaTypes[44];
            }else if(roll == 5){
                wildPepegaType = pepegaTypes[45];
            }else if(roll == 6){
                wildPepegaType = pepegaTypes[46];
            }else {
                wildPepegaType = pepegaTypes[47];
            }
            specialEventOccured = true;
        } else if(player.catchCount < 20 && player.encounterCount % 2 == 0){
            wildPepegaType = pepegaTypes[0];
            specialEventOccured = true;
        }
    }

    if(!specialEventOccured){
        var scaledCategory = getScaledCategory(category.options);
        var roll = (Math.random() * (scaledCategory.maxRoll));
        var rollCeiling = 0;
        var index, length;
        for (index = 0, length = scaledCategory.options.length; index < length; ++index) {
            var probability = scaledCategory.options[index].probability;
            if(probability > 0){
                rollCeiling += probability;
                if(roll <= rollCeiling){
                    wildPepegaType = pepegaTypes[scaledCategory.options[index].pepegaType.id];
                    break;
                }
            }
        }
    }

    var roll = Math.floor(Math.random() * (99));
    if(player.catchCount >= 20 && roll > 25 && (wildPepegaType.basePower < (totalPepegaPower / 4) || (roll > 80 && player.catchCount >= 40))){
        wildPepegaLevel = 2;
    }

    return new Pepega(wildPepegaType, "", "", false, rollPepegaPower(wildPepegaType.basePower), wildPepegaLevel, true, null);
}

/*
    new Category(0, false, [],
        [
            new Option(pepegaTypes[3], 5),
            new Option(pepegaTypes[4], 5),
            new Option(pepegaTypes[5], 5),
            new Option(pepegaTypes[6], 0.2),
            new Option(pepegaTypes[7], 0.2),
            new Option(pepegaTypes[8], 0.2),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            */
function getScaledCategory(categoryOptions){
    var isStrongerPepegasAllowed = Math.round(Math.random() * (1));
    var scaledCategory = {};
    scaledCategory.maxRoll = 100.0;

    if(isStrongerPepegasAllowed == 0){
        scaledCategory.options = categoryOptions;
    }else{
        scaledCategory.options = [];
        var scaledCategoryOptionsLength = 0;
        for(var i = 0; i < categoryOptions.length; i++){
            if(totalPepegaPower >= categoryOptions[i].pepegaType.basePower){
                scaledCategory.options[scaledCategoryOptionsLength++] = categoryOptions[i];
            }else{
                scaledCategory.maxRoll -= categoryOptions[i].probability;
            }
        }
    }
    return scaledCategory;
}

function rollEncounter(){
    var roll = (Math.random() * (100 - 0.1)) + 0.1;
    return roll <= ((baseEncounterRate) * (config.encounterMode.multiplier/100));
}

const minimumBeginnerCatchCount = 10;
const regularTimeBeforeNextWildPepegaSpawn = 1000;
const beginnerTimeBeforeNextWildPepegaSpawn = 100;
var lastWildPepegaSpawnTime = 0;
var timeBeforeNextWildPepegaSpawn = 0;
browserStorage.get(["lastWildPepegaSpawnTime", "timeBeforeNextWildPepegaSpawn"], function(result) {
    if(result.lastWildPepegaSpawnTime != null){
        lastWildPepegaSpawnTime = result.lastWildPepegaSpawnTime;
        timeBeforeNextWildPepegaSpawn = result.timeBeforeNextWildPepegaSpawn;
    }
});

function getWildPepega(locationHref){
    var location = new URL(locationHref);

    var currentTime = new Date().getTime();
    if(currentTime - timeBeforeNextWildPepegaSpawn >= lastWildPepegaSpawnTime && (rollEncounter() || player.catchCount <= minimumBeginnerCatchCount)){
        var category = getCategory(location.hostname);
        if(category == null){
            category = categories[0];
        }

        lastWildPepegaSpawnTime = currentTime;
        if(player.catchCount >= minimumBeginnerCatchCount){
            timeBeforeNextWildPepegaSpawn = regularTimeBeforeNextWildPepegaSpawn;
        }else{
            timeBeforeNextWildPepegaSpawn = beginnerTimeBeforeNextWildPepegaSpawn;
        }
        browserStorage.set({lastWildPepegaSpawnTime: lastWildPepegaSpawnTime, timeBeforeNextWildPepegaSpawn: timeBeforeNextWildPepegaSpawn}, function() {
            player.encounterCount++;
            if(player.encounterCount > 999999999){
                player.encounterCount = 900000000;
            }
            browserStorage.set({playerEncounterCount: player.encounterCount});
        });

        return rollWildPepega(category);
    }else{
        return null;
    }
}

function isSiteFiltered(locationHref){
    if(locationHref){
        for (var i = 0; i < config.filteredSites.length; ++i) {
            if(config.filteredSites[i] && config.filteredSites[i] != "" && 
                (locationHref.includes(config.filteredSites[i]))){
                browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepega-disabled-icon-128.png")});
                return true;
            }
        }
    }
	return false;
}

function updateIcon(locationHref){
    var siteFiltered = isSiteFiltered(locationHref);
    if(siteFiltered || config.encounterMode.multiplier == 0){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepega-disabled-icon-128.png")});
    }else if(config.encounterMode.multiplier == 100){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepega-icon-128.png")});
    }else{
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepega-less-icon-128.png")});
    }
}

function isStringAVowel(s) {
    return (/^[aeiou]$/i).test(s);
}

const NotificationPurposeEnum = {"pepegaCatchRelease":1, "rankUp":2, "tutorial":3, "pepegaHeal":4}

function notify(purpose, type, title, message, iconUrl){
    if((purpose == NotificationPurposeEnum.pepegaCatchRelease && settings.enablePepegaCatchReleaseNotifications) ||
        (purpose == NotificationPurposeEnum.rankUp && settings.enableRankUpNotifications)  ||
        (purpose == NotificationPurposeEnum.tutorial && settings.enableTutorialNotifications) ||
        (purpose == NotificationPurposeEnum.pepegaHeal && settings.enablePepegaHealNotifications)){
        var options = {
            type: type,
            title: title,
            message: message,
            iconUrl: iconUrl,
        };
        browser.notifications.create(options, function() {});
    }
    notificationsDisplay.header = title;
    notificationsDisplay.message = message;
    browserStorage.set({"notificationsDisplayHeader": title, "notificationsDisplayMessage": message});

    updateNotificationsPopupDisplay();
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

    var iqReleasePrice = (playerPepega.pepegaType.iqReleasePriceMultiplier * playerPepega.pepegaType.iqps * playerPepega.level);

    updatePlayerIqCount(iqReleasePrice);

    notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "Level " + playerPepega.level + " " + playerPepega.pepegaType.name + " was released!", "Level " + playerPepega.level + " " + playerPepega.pepegaType.name + " was released back into " + 
    playerPepega.origin + "! You got " + (iqReleasePrice)  + " IQ.", playerPepega.pepegaType.imageUrl);

    playSound(pepegaReleaseSound);

    removePlayerPepega(id);
}

function healPlayerPepega(id, healCost){
    if(player.iqCount >= healCost){
        var playerPepega = getPlayerPepega(id);

        if(!playerPepega.alive){
            updatePlayerIqCount(-healCost);
    
            notify(NotificationPurposeEnum.pepegaHeal, "basic", playerPepega.pepegaType.name + " was healed!", "You lost " + healCost  + " IQ.", playerPepega.pepegaType.imageUrl);

            playSound(pepegaHealSound);

            setPepegaAlive(playerPepega, true);

            updatePlayerPepegasPopupDisplay();
        }
    }
}

function getArticle(word){
    var article = "a";
    if(isStringAVowel(word[0])){
        article = "an";
    }
    return article;
}

function setPepegaAlive(pepega, alive, save = true){
    if(!pepega.alive && alive){
        totalIqps += pepega.pepegaType.iqps * pepega.level;
        totalPepegaPower += pepega.power * pepega.level;
        pepega.alive = alive;
    }else if (pepega.alive && !alive){
        totalIqps -= pepega.pepegaType.iqps * pepega.level;
        totalPepegaPower -= pepega.power * pepega.level;
        pepega.alive = alive;
    }

    if(save){
        browserStorage.set({playerPepegas: player.pepegas});
    }
}

var shuffle = function (array) {
	var currentIndex = array.length;
	var temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
};

function acquirePepegaType(pepegaTypeId){
    player.pepegaTypeStatuses[pepegaTypeId] = {};
    player.pepegaTypeStatuses[pepegaTypeId].acquired = true;
    browserStorage.set({"playerPepegaTypeStatuses": player.pepegaTypeStatuses});
}

function fightWildPepega(wildPepega){
    var wildPepegaTotalPower = wildPepega.power * wildPepega.level;
    var wildPepegaRemainingPower = wildPepegaTotalPower;
    var results = new Object();
    results.won = false;
    results.casualties = 0;
    results.battleBreakdown = {};
    results.battleBreakdown.player = {};
    results.battleBreakdown.wildPepega = {};
    results.battleBreakdown.rounds = [];
    var wildPepegaName = wildPepega.pepegaType.name;

    var playerArmyName = player.armyName;
    if(playerArmyName == defaultArmyName){
        playerArmyName = "Unnamed Army :)";
    }

    results.battleBreakdown.player.armyName = playerArmyName;
    results.battleBreakdown.player.rankTitle = rank.title;

    results.battleBreakdown.wildPepega.name = wildPepegaName;
    results.battleBreakdown.wildPepega.totalPower = wildPepegaTotalPower;
    results.battleBreakdown.wildPepega.level = wildPepega.level;
    results.battleBreakdown.wildPepega.imageUrl = wildPepega.pepegaType.imageUrl;

    var indexArray = [];
    for(var i = 0; i < player.pepegas.length; i++){
        if(player.pepegas[i].alive){
            indexArray.push(i);
        }
    }
    indexArray = shuffle(indexArray);

    for(var i = 0, j = 0; i < indexArray.length; i++){
        var playerPepega = player.pepegas[indexArray[i]];

        var playerPepegaPower = playerPepega.power * playerPepega.level;
        var playerPepegaRolledPower = Math.round((playerPepegaPower*((Math.random() * (0.7 - 0.55)) + 0.55)) * 100)/100;
        var playerPepegaName = playerPepega.pepegaType.name;
        var playerPepegaAttack;
        playerPepegaAttack = playerPepega.pepegaType.attacks[Math.min( j%3, playerPepega.pepegaType.attacks.length - 1 )];

        results.battleBreakdown.rounds[j] = {};
        results.battleBreakdown.rounds[j].playerPepega = {};
        results.battleBreakdown.rounds[j].wildPepega = {};

        results.battleBreakdown.rounds[j].playerPepega.name = playerPepegaName;
        results.battleBreakdown.rounds[j].playerPepega.attack = playerPepegaAttack;
        results.battleBreakdown.rounds[j].playerPepega.power = playerPepegaRolledPower;
        results.battleBreakdown.rounds[j].playerPepega.level = playerPepega.level;
        results.battleBreakdown.rounds[j].playerPepega.imageUrl = playerPepega.pepegaType.imageUrl;
        wildPepegaRemainingPower = Math.round((wildPepegaRemainingPower - playerPepegaRolledPower) * 100) / 100;

        if(wildPepegaRemainingPower > 0){

            var wildPepegaAttack = wildPepega.pepegaType.attacks[Math.min( j%3, wildPepega.pepegaType.attacks.length - 1 )];
            var wildPepegaRolledPower = Math.round((wildPepegaTotalPower*((Math.random() * (0.9 - 0.7)) + 0.7)) * 100)/100;
            if(wildPepegaRolledPower < playerPepegaPower){
                wildPepegaRolledPower += Math.round(((playerPepegaPower - wildPepegaRolledPower)*((Math.random() * (1.1 - 1.05)) + 1.05)) * 100)/100;
            }
            
            results.battleBreakdown.rounds[j].roundPlayerWon = false;
            results.battleBreakdown.rounds[j].wildPepega.remainingPower = wildPepegaRemainingPower;
            results.battleBreakdown.rounds[j].wildPepega.attack = wildPepegaAttack;
            results.battleBreakdown.rounds[j].wildPepega.power = wildPepegaRolledPower;

            setPepegaAlive(playerPepega, false, false);
            results.casualties++;
            playerPepega.timeBeforeRecovery = new Date().getTime() + 
            (playerPepega.power * playerPepega.level * multiplierBeforePepegaRecovers);
        
            if(tutorial.phase != "disabled" && tutorial.enableDeadPepegaRandomTutorial){
                updateRandomTutorialPhase("deadPepega");
            }
        }else{
            results.battleBreakdown.rounds[j].roundPlayerWon = true;
            results.battleBreakdown.playerWon = true;
            browserStorage.set({playerPepegas: player.pepegas});
            results.won = true;
            break;
        }

        j++;
    }

    var rolledRankPower = Math.round((rank.basePower*((Math.random() * (1.2 - 1.05)) + 1.05)) * 100) / 100;
    results.battleBreakdown.player.rolledRankPower = rolledRankPower;
    wildPepegaRemainingPower = Math.round((wildPepegaRemainingPower - rolledRankPower) * 100) / 100;
    if(wildPepegaRemainingPower <= 0){
        results.won = true;
    }
    
    results.battleBreakdown.wildPepega.remainingPower = wildPepegaRemainingPower;

    results.battleBreakdown.new = true;
    
    browserStorage.set({playerPepegas: player.pepegas});
    return results;
}

const AddingPlayerPepegaResultEnum = {"successSingle":1, "successLeveledUp":2, "successFusioned":3, "noPepegaSlots":4}
const CombiningPlayerPepegaResultEnum = {"combined":1, "noCombination":2, "noPepegaSlots":3}

function catchWildPepega(wildPepegaTypeId, wildPepegaPower, wildPepegaLevel, locationHref){
    var location = new URL(locationHref);

    var wildPepega = new Pepega(pepegaTypes[wildPepegaTypeId], "", "", false, wildPepegaPower, wildPepegaLevel, true, null);

    var fightResults = fightWildPepega(wildPepega);
    updatePlayerPepegasPopupDisplay();
    browserStorage.set({playerPepegas: player.pepegas});
    browserStorage.set({"recentBattleBreakdown": fightResults.battleBreakdown});

    player.catchCount++;
    if(player.catchCount > 999999999){
        player.catchCount = 900000000;
    }
    browserStorage.set({playerCatchCount: player.catchCount});

    if(!fightResults.won){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "VI LOST!", "Your Pepegas lost to a Wild " + wildPepega.pepegaType.name + "!\n" +
        "You may instantly heal them by spending IQ, or you can just wait for them to be ressurected!", wildPepega.pepegaType.imageUrl);
        playSound(pepegaLostSound);
        return;
    }

    wildPepega.date = new Date().toLocaleString();
    if(settings.recordOrigin){
        wildPepega.origin = location.hostname;
    }else{
        wildPepega.origin = defaultPepegaOrigin;
    }
    wildPepega.fusioned = false;

    var pepegaAdd = addPlayerPepega(wildPepega);

    player.successfulCatchCount++;
    if(player.successfulCatchCount > 999999999){
        player.successfulCatchCount = 900000000;
    }
    browserStorage.set({playerSuccessfulCatchCount: player.successfulCatchCount});
    
    if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successSingle){
        var notificationMessage = "You caught a Level " + pepegaAdd[1].level + " " + pepegaAdd[1].pepegaType.name + "!";
        if(fightResults.casualties == 1){
            notificationMessage += "\nOne of your Pepegas died during the battle. :(";
        }else if(fightResults.casualties > 1){
            notificationMessage += "\n" + fightResults.casualties + " Pepegas died during the battle. :(";
        }

        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " caught!", 
        notificationMessage, pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == "catch"){
            updateTutorialPhase("catchDone");
        }

        playSound(pepegaCatchSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successFusioned){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You fusion summoned " + getArticle(pepegaAdd[1].pepegaType.name) + " " + pepegaAdd[1].pepegaType.name + "!",
            wildPepega.pepegaType.name + " fusioned with other Pepegas into " + getArticle(pepegaAdd[1].pepegaType.name) + " " + pepegaAdd[1].pepegaType.name + "!\nPogChamp!",
            pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == "fusion"){
            updateTutorialPhase("fusionDone");
        }

        playSound(pepegaFusionSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successLeveledUp){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " is now level " + pepegaAdd[1].level + "!",
            "Your " + pepegaAdd[1].pepegaType.name + " leveled up!\nIt is now level " + pepegaAdd[1].level + "!\nPog!",
            pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == "levelUp"){
            updateTutorialPhase("levelUpDone");
        }

        playSound(pepegaLevelSound);
    } else{
        var iqReleasePrice = pepegaAdd[1].pepegaType.iqReleasePriceMultiplier * pepegaAdd[1].pepegaType.iqps * pepegaAdd[1].level;
        updatePlayerIqCount(iqReleasePrice);
        var notificationMessage = "Level " + pepegaAdd[1].level + " " + pepegaAdd[1].pepegaType.name + " was released, earning you " + iqReleasePrice + " IQ.";

        if(player.pepegaSlots < maxPepegaSlots){
            notificationMessage += "\nYou can buy more slots by spending your IQ!";
        }

        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You don't have enough room for more Pepegas!", notificationMessage, pepegaAdd[1].pepegaType.imageUrl);

        playSound(pepegaFullArmySound);
    }
}

var adds = 0;

function addPlayerPepega(pepega, save = true, displayForPopup = true, addEvents = {}){
    acquirePepegaType(pepega.pepegaType.id);

    var pepegaLevelingUp = checkPepegaLevelingUp(pepega, addEvents);
    var pepegaFusioning = checkPepegaFusioning(pepega, addEvents);

    if(pepegaFusioning[0] == CombiningPlayerPepegaResultEnum.combined || pepegaLevelingUp[0] == CombiningPlayerPepegaResultEnum.combined){

        if(addEvents.fused){
            return [AddingPlayerPepegaResultEnum.successFusioned, pepegaFusioning[1]];
        }else{
            return [AddingPlayerPepegaResultEnum.successLeveledUp, pepegaLevelingUp[1]];
        }

    } else if(isPepegaSlotsAvailable(player.pepegas.length + 1)){

        player.pepegas.push(pepega);

        if(pepega.alive){
            totalIqps += pepega.pepegaType.iqps * pepega.level;
            totalPepegaPower += pepega.power * pepega.level;
        }

        if(displayForPopup){
            analyzeUniquePepegas();
            analyzeBranch();
            updatePlayerPepegasPopupDisplay();
        }

        if(save){
            browserStorage.set({playerPepegas: player.pepegas});
        }

        return [AddingPlayerPepegaResultEnum.successSingle, pepega];

    } else {

        return [AddingPlayerPepegaResultEnum.noPepegaSlots, pepega];

    }
}

function checkPepegaLevelingUp(addedPepega, addEvents = {}){
    if(addedPepega.level >= maxPepegaLevel){
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }

    levelingPlayerPepegaIds = [];
    var isLevelingUp = false;
    var tempPlayerPepegas = [];
    for(var i = 0; i < player.pepegas.length; i++){
        if(player.pepegas[i].level == addedPepega.level){
            var tempPlayerPepega = new Object();
            tempPlayerPepega.id = player.pepegas[i].id;
            tempPlayerPepega.typeId = player.pepegas[i].pepegaType.id;
            tempPlayerPepega.level = player.pepegas[i].level;
            tempPlayerPepega.power = player.pepegas[i].power;
            tempPlayerPepegas.push(tempPlayerPepega);
        }
    }
    
    var tempPlayerPepega = new Object();
    tempPlayerPepega.id = addedPepega.id;
    tempPlayerPepega.typeId = addedPepega.pepegaType.id;
    tempPlayerPepega.level = addedPepega.level;
    tempPlayerPepega.power = addedPepega.power;
    tempPlayerPepegas.push(tempPlayerPepega);

    var levelingPlayerPepegaTotalPower = 0;
    for(var i = 0; i < tempPlayerPepegas.length; i++){
        if(addedPepega.pepegaType.id == tempPlayerPepegas[i].typeId){
            levelingPlayerPepegaIds.push(tempPlayerPepegas[i].id);
            
            levelingPlayerPepegaTotalPower += parseFloat(tempPlayerPepegas[i].power);
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

        var newPepegaLevel = parseInt(addedPepega.level) + 1;
        var leveledUpPepega = new Pepega(pepegaTypes[addedPepega.pepegaType.id], addedPepega.origin, addedPepega.date, false, 
            levelingPlayerPepegaTotalPower / multiplesBeforeLevelUp, newPepegaLevel, true, null);

        addEvents.levelled = true;
        
        var pepegaAdd = addPlayerPepega(leveledUpPepega, true, true, addEvents);

        return [CombiningPlayerPepegaResultEnum.combined, pepegaAdd[1]];
    }else{
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }
}

function checkPepegaFusioning(addedPepega = null, addEvents = {}){
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

                tempPlayerPepega.pepegaType = player.pepegas[j].pepegaType;
                tempPlayerPepega.level = player.pepegas[j].level;

                tempPlayerPepega.power = player.pepegas[j].power;
                tempPlayerPepegas.push(tempPlayerPepega);
            }
        }
        if(addedPepega != null){
            if(addedPepega.level == maxPepegaLevel){
                var tempPlayerPepega = new Object();
                tempPlayerPepega.isTaken = false;
                tempPlayerPepega.id = addedPepega.id;
                tempPlayerPepega.typeId = addedPepega.pepegaType.id;
                
                tempPlayerPepega.pepegaType = addedPepega.pepegaType;
                tempPlayerPepega.level = addedPepega.level;

                tempPlayerPepega.power = parseFloat(addedPepega.power);
                tempPlayerPepegas.push(tempPlayerPepega);
            }
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
        
        var fusionedPepega = new Pepega(fusionedPepegaType, addedPepega.origin, addedPepega.date, false, 
            rollPepegaPower(fusionedPepegaType.basePower), 1, true, null);
        
        addEvents.fused = true;

        var pepegaAdd = addPlayerPepega(fusionedPepega, true, true, addEvents);

        return [CombiningPlayerPepegaResultEnum.combined, pepegaAdd[1]];
    }else{
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }
}

function updateSettings(updatedSettings){
    settings = updatedSettings;

    updateSettingsPopupDisplay();

    browserStorage.set({
        "settings": settings
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

function updateConfigFilteredSites(filteredSitesText){
    config.filteredSites = filteredSitesText.split('\n');

    updateConfigFilteredSitesPopupDisplay();
    updateIconFromSelectedTab();

    browserStorage.set({configFilteredSites: config.filteredSites});
}

function updateConfigIsIqCountUnitized(){
    config.isIqCountUnitized = !config.isIqCountUnitized;

    updateConfigIsIqCountUnitizedPopupDisplay();

    browserStorage.set({configIsIqCountUnitized: config.isIqCountUnitized});
}

function updateConfigEncounterMode(){
    var newEncounterMode = encounterModes[0];
    if(config.encounterMode.id < encounterModes.length-1){
        newEncounterMode = encounterModes[config.encounterMode.id + 1];
    }
    config.encounterMode = newEncounterMode;

    updateConfigEncounterModePopupDisplay();
    updateIconFromSelectedTab();

    browserStorage.set({configEncounterMode: config.encounterMode});
}

function updatePlayerArmyName(playerArmyName){
    if(playerArmyName == "" || !playerArmyName.replace(/\s/g, '').length || !playerArmyName){
        player.armyName = defaultArmyName;
    }else{
        player.armyName = stripHtmlTags(playerArmyName).substring(0,maxArmyNameLength);
    }

    updatePlayerArmyNamePopupDisplay();

    browserStorage.set({playerArmyName: player.armyName});
}

var pepegaIndexToCheck = 0;nterval = setInterval(function() {
    if(player.pepegas.length > 0){
        var currentTime = new Date().getTime();
        if(player.pepegas[pepegaIndexToCheck + 1]){
            pepegaIndexToCheck++;
        }else{
            pepegaIndexToCheck = 0;
        }
        if(!player.pepegas[pepegaIndexToCheck].alive && 
            currentTime >= player.pepegas[pepegaIndexToCheck].timeBeforeRecovery){
                setPepegaAlive(player.pepegas[pepegaIndexToCheck], true);
                browserStorage.set({playerPepegas: player.pepegas});
            updatePlayerPepegasPopupDisplay();
        }
    }
}, 500);

var previousUpdateIqCountTime = new Date().getTime();
var interval = setInterval(function() {
    var currentTime = new Date().getTime();
    if(currentTime - previousUpdateIqCountTime >= updateIqCountMillisecondInterval){
        updatePlayerIqCount(Math.round(totalIqps * rank.iqpsMultiplier * uniquePepegaIqpsMultiplier));
        previousUpdateIqCountTime = currentTime;
    }
}, 100);

function updatePlayerIqCount(iq){
    var additionalIq = iq;
    if(isPlayerIdle){
        additionalIq *= idleIqMultiplier;
    }
    var newPlayerIqCount = player.iqCount + additionalIq;

    if(newPlayerIqCount > maxPlayerIqCount){
        newPlayerIqCount = maxPlayerIqCount;
    }else if(newPlayerIqCount < 0){
        newPlayerIqCount = 0;
    }

    player.iqCount = newPlayerIqCount;
    
    analyzeRank();

    updatePlayerIqCountPopupDisplay();
    
    browserStorage.set({playerIqCount: player.iqCount});
}

function analyzeRank(isNotifyIfRankUp = true){

    for (var i = ranks.length - 1; i >= 0; i--) {
        if(ranks[i].functionRequirement()){
            if(i > rank.id && isNotifyIfRankUp){
                analyzeBranch();

                var rankTitleArticle = ranks[i].titleArticle[branch.id];
                var rankTitle = ranks[i].title[branch.id];
                var rankDescription = ranks[i].description[branch.id];
                if(rankTitleArticle == null){
                    rankTitleArticle =  ranks[i].titleArticle[0];
                }
                if(rankTitle == null){
                    rankTitle =  ranks[i].title[0];
                }
                if(rankDescription == null){
                    rankDescription =  ranks[i].description[0];
                }
                notify(NotificationPurposeEnum.rankUp, "basic", "You are now " + rankTitleArticle + " " + rankTitle + "!",
                "You've ranked up!\n" + rankDescription, browserRuntime.getURL("images/rank-up.png"));

                if(tutorial.phase != "disabled" && tutorial.enableRankUpRandomTutorial){
                    updateRandomTutorialPhase("rankUp");
                }
            }

            rank = ranks[i];

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

        playSound(pepegaBuySlotSound);

        if(tutorial.phase == "buySlot"){
            updateTutorialPhase("buySlotDone");
        }
    }
}

function updateSavedScrollPosition(y){
    savedScrollPosition = y;
}

function updateAllPopupDisplays(){
    updatePlayerIqCountPopupDisplay();
    updatePlayerPepegasPopupDisplay();
    updateSettingsPopupDisplay();
    updatePlayerArmyNamePopupDisplay();
    updatePlayerPepegaSlotsPopupDisplay();
    updateConfigEncounterModePopupDisplay();
    updateConfigFilteredSitesPopupDisplay();
    updateTutorialPhasePopupDisplay();
    updateRandomTutorialPopupDisplay();
    updateNotificationsPopupDisplay();
    updateConfigIsIqCountUnitizedPopupDisplay();
    updateIdlePopupDisplay();
}
function updateNotificationsPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "notifications-display-updated", 
        "notificationsDisplayHeader": notificationsDisplay.header, "notificationsDisplayMessage": notificationsDisplay.message});
    }
}
function updatePlayerPepegaSlotsPopupDisplay(){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": "player-pepega-slots-updated", "playerPepegaCount": player.pepegas.length, "playerPepegaSlots": player.pepegaSlots, "pepegaSlotCost": pepegaSlotCost, "playerIqCount": player.iqCount});
    }
}
function updateIdlePopupDisplay(){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": "idle-updated", "isPlayerIdle": isPlayerIdle, "idleIqMultiplier" : idleIqMultiplier});
    }
}
function updatePlayerIqCountPopupDisplay(){
    if(popup.isOpened){
        var tempBranch = {}
        tempBranch.id = branch.id;
        tempBranch.name = branch.name;
        var tempRank = {}
        tempRank.id = rank.id;
        tempRank.titleArticle = rank.titleArticle;
        tempRank.title = rank.title;
        tempRank.description = rank.description;
        tempRank.requirementDescription = rank.requirementDescription;
        tempRank.iqpsMultiplier = rank.iqpsMultiplier;
        tempRank.basePower = rank.basePower;
        var tempNextRank = {}
        tempNextRank.id = ranks[rank.id+1].id;
        tempNextRank.titleArticle = ranks[rank.id+1].titleArticle;
        tempNextRank.title = ranks[rank.id+1].title;
        tempNextRank.description = ranks[rank.id+1].description;
        tempNextRank.requirementDescription = ranks[rank.id+1].requirementDescription;
        tempNextRank.iqpsMultiplier = ranks[rank.id+1].iqpsMultiplier;
        tempNextRank.basePower = ranks[rank.id+1].basePower;
		browserRuntime.sendMessage({"message": "player-iq-count-updated", "playerIqCount": player.iqCount, "rank": tempRank, "branch": tempBranch, "nextRank": tempNextRank, "pepegaSlotCost": pepegaSlotCost, "ranksLength": ranks.length});
    }
}
function updatePlayerPepegasPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "player-pepegas-updated", "playerPepegas": player.pepegas, "totalIqps": totalIqps, "totalPepegaPower": totalPepegaPower, "rankBasePower": rank.basePower,
        "multipliedTotalIqps": Math.round(totalIqps * rank.iqpsMultiplier * uniquePepegaIqpsMultiplier * (isPlayerIdle ? idleIqMultiplier : 1.0)), "playerPepegaSlots": player.pepegaSlots, "uniquePepegaIqpsMultiplier": uniquePepegaIqpsMultiplier, "baseEncounterRate": baseEncounterRate, "configEncounterMode": config.encounterMode});
    }
}
function updateSettingsPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "settings-updated", "settings": settings});
    }
}
function updatePlayerArmyNamePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "player-army-name-updated", "playerArmyName": player.armyName, "isDefaultArmyName": (player.armyName == defaultArmyName)});
    }
}
function updateConfigEncounterModePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "config-encounter-mode-updated", "configEncounterMode": config.encounterMode, "baseEncounterRate": baseEncounterRate});
    }
}
function updateConfigIsIqCountUnitizedPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "config-is-iq-count-unitized-updated", "configIsIqCountUnitized": config.isIqCountUnitized, "playerIqCount" : player.iqCount});
    }
}
function updateConfigFilteredSitesPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "config-filtered-sites-updated", "configFilteredSites": config.filteredSites});
    }
}
function updateTutorialPhasePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "tutorial-phase-updated", "tutorialPhase": tutorial.phase});
    }
}
function updateRandomTutorialPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "show-random-tutorial", "randomTutorialPhase": tutorial.randomPhase});
    }
}

function repelWildPepega(){
    player.catchCount++;
    browserStorage.set({playerCatchCount: player.catchCount});
    
    playSound(pepegaRepelSound);
}

function formatWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

browserRuntime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "get-wild-pepega"){
            sendResponse({ "isSiteFiltered": isSiteFiltered(request.locationHref), "wildPepega": getWildPepega(request.locationHref), "totalEstimatedPower": formatWithCommas((rank.basePower + totalPepegaPower).toFixed(2)) });
		}else if(request.message == "catch-wild-pepega"){
            catchWildPepega(request.wildPepegaTypeId, request.wildPepegaPower, request.wildPepegaLevel, request.locationHref);
            sendResponse();
		}else if(request.message == "update-all-popup-displays"){
            updateAllPopupDisplays();
            sendResponse();
		}else if(request.message == "release-player-pepega"){
            releasePlayerPepega(request.playerPepegaId);
            sendResponse();
		}else if(request.message == "update-settings"){
			updateSettings(request.settings);
            sendResponse();
		}else if(request.message == "update-config-encounter-mode"){
            updateConfigEncounterMode();
            sendResponse();
		}else if(request.message == "update-config-filtered-sites"){
            updateConfigFilteredSites(request.filteredSitesText);
            sendResponse();
		}else if(request.message == "update-player-army-name"){
            updatePlayerArmyName(request.playerArmyName);
            sendResponse();
		}else if(request.message == "buy-pepega-slot"){
            buyPepegaSlot();
            sendResponse();
		}else if(request.message == "answer-tutorial-ask"){
            answerTutorialAsk(request.tutorialAnswer);
            sendResponse();
        }else if(request.message == "update-tutorial-phase"){
            updateTutorialPhase(request.tutorialPhase);
            sendResponse();
        }else if(request.message == "update-random-tutorial-phase"){
            updateRandomTutorialPhase(request.randomTutorialPhase);
            sendResponse();
        }else if(request.message == "replace-random-tutorial-phase"){
            replaceRandomTutorialPhase(request.randomTutorialPhase);
            sendResponse();
        }else if(request.message == "reset-tutorial"){
            resetTutorial();
            sendResponse();
        }else if(request.message == "heal-player-pepega"){
            healPlayerPepega(request.playerPepegaId, request.healCost);
            sendResponse();
        }else if(request.message == "get-pepega-types"){
            sendResponse({ "pepegaTypes": pepegaTypes, "playerPepegaTypeStatuses": player.pepegaTypeStatuses });
        }else if(request.message == "repel-wild-pepega"){
            repelWildPepega();
            sendResponse();
        }else if(request.message == "update-saved-scroll-position"){
            updateSavedScrollPosition(request.y);
            sendResponse();
        }else if(request.message == "get-saved-scroll-position"){
            sendResponse({ "y": savedScrollPosition });
        }else if(request.message== "change-iq-count-unitization"){
            updateConfigIsIqCountUnitized();
            sendResponse();
        }
	}
);