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
const baseEncounterRate = 70;
const minimumCatchCountForMorePepegas = 4;
const multiplierBeforePepegaRecovers = 30000;

var browser = chrome;
var browserRuntime = browser.runtime;
var browserStorage = browser.storage.local;
var browserExtension = browser.extension;

var pepegaCatchSound = new Audio(browserRuntime.getURL("sounds/pepega-catch.wav"));
pepegaCatchSound.volume = 0.25;
var pepegaReleaseSound = new Audio(browserRuntime.getURL("sounds/pepega-release.wav"));
pepegaReleaseSound.volume = 0.25;
var pepegaFullArmySound = new Audio(browserRuntime.getURL("sounds/pepega-full-army.wav"));
pepegaFullArmySound.volume = 0.1;
var pepegaLevelSound = new Audio(browserRuntime.getURL("sounds/pepega-level.wav"));
pepegaLevelSound.volume = 0.25;
var pepegaFusionSound = new Audio(browserRuntime.getURL("sounds/pepega-fusion.wav"));
pepegaFusionSound.volume = 0.25;
var pepegaHealSound = new Audio(browserRuntime.getURL("sounds/pepega-heal.wav"));
pepegaHealSound.volume = 0.2;
var pepegaLostSound = new Audio(browserRuntime.getURL("sounds/pepega-lost.wav"));
pepegaLostSound.volume = 0.2;

var popup = {
	get isOpened (){
		return browserExtension.getViews({ type: "popup" }).length > 0;
	}
}

browser.tabs.onActivated.addListener(function() {
	updateIconFromSelectedTab();
});

function updateIconFromSelectedTab(){
    browser.tabs.getSelected(function(tab) {
        var location = new URL(tab.url);
		updateIcon(location);
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
    new Rank(0, ["a"], ["Pepega Trainer"], ["Gotta take em all!"], function iqRankRequirement(){ return isPlayerIqHigher(0); }, "0 IQ",1.0, 10),
    new Rank(1, ["a"], ["Pepega Shepherd"], [""], function iqRankRequirement(){ return isPlayerIqHigher(4000); }, "4,000 IQ", 1.1, 12),
    new Rank(2, ["a"], ["Pepega Whisperer"], [""], function iqRankRequirement(){ return isPlayerIqHigher(35000); }, "35,000 IQ", 1.2, 14),
    new Rank(3, ["a"], ["Pepega Researcher"], [""], function iqRankRequirement(){ return isPlayerIqHigher(125000); }, "125,000 IQ", 1.3, 16),
    new Rank(4, ["a"], ["Pepega Scientist"], [""], function iqRankRequirement(){ return isPlayerIqHigher(500000); }, "500,000 IQ", 1.4, 18),
    new Rank(5, ["a"], ["Pepega Guru"], [""], function iqRankRequirement(){ return isPlayerIqHigher(2000000); }, "2,000,000 IQ", 1.5, 20),
    new Rank(6, ["a"], ["Professor Pepega"], [""], function iqRankRequirement(){ return isPlayerIqHigher(6500000); }, "6,500,000 IQ", 1.6, 25),
    new Rank(7, ["a"], ["Pepega Leader"], [""], function iqRankRequirement(){ return isPlayerIqHigher(14000000); }, "14,000,000 IQ", 1.7, 30),
    new Rank(8, ["a"], ["Pepega Commander"], [""], function iqRankRequirement(){ return isPlayerIqHigher(30000000); }, "30,000,000IQ", 1.8, 35),
    new Rank(9, [""], ["Captain Pepega"], ["You're the captain now!"], function iqRankRequirement(){ return isPlayerIqHigher(50000000); }, "50,000,000 IQ", 1.9, 40),
    new Rank(10, ["a"], ["Pepega General"], [""], function iqRankRequirement(){ return isPlayerIqHigher(100000000); }, "100,000,000 IQ", 2.0, 45),
    new Rank(11, ["a"], ["Pepega Champion"], [""], function iqRankRequirement(){ return isPlayerIqHigher(165000000); }, "165,000,000 IQ", 2.2, 50),
    new Rank(12, ["a", "a", "a"], ["Pepega Legend", "Pepega Master", "Pepega Titan"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(300000000); }, "300,000,000 IQ", 2.4, 60),
    new Rank(13, ["a", "the", "a"], ["Pepega Legend II", "Pepega King", "Pepega Machine"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(650000000); }, "650,000,000 IQ", 2.6, 70),
    new Rank(14, ["a", "the", "the"], ["Pepega Legend III", "President of the Pepega States", "Emperor of Pepegan"], 
    ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(1250000000); }, "1,250,000,000 IQ", 2.8, 80),
    new Rank(15, ["the", "the", "the"], ["True Pepega", "PepeGOD", "Gaijinga"], 
    ["Your IQ is less than 100... you are the truest of all Pepegas!", "Pepegas across the globe bow down to your presence.", "You are the ultimate weeb. AYAYA Clap"], 
    function iqRankRequirement(){  return finalRankRequirement(); }, "Every. Single. Pepega.", 3.0, 100),
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
    new PepegaType(0, [], "Pepega", "The original Pepega we all know and love.", 
        1, 1,
        1, 10, ["Shout", "Push", "Scream"],
        browserRuntime.getURL("images/pepegas/0_Pepega.png")),

    new PepegaType(1, [], "Okayga", "These Pepegas are only capable of staring and looking deep into someone's eyes, but they do it very skillfully.", 
        10, 60, 
        10, 10, ["Smile", "Slap", "Dazzle"],
        browserRuntime.getURL("images/pepegas/1_Okayga.png")),

    new PepegaType(2, [], "Pepege", "This Pepega is incapable of reading, writing, or doing anything that involves the use of more than one brain cell, but at least it's smart enough to be aware of this.", 
        100, 120, 
        100, 10, ["Bite", "Confusion", "Charge"],
        browserRuntime.getURL("images/pepegas/2_Pepege.png")),

    new PepegaType(3, [], "Firega", "This Pepega leaves behind gasoline cans, gasoline-soaked rags, and lighters on websites it roams on.", 
        10, 60, 
        20, 10, ["Sun With Face Clap", "Starfire", "Overheat"],
        browserRuntime.getURL("images/pepegas/3_Firega.png")),

    new PepegaType(4, [], "Grassga", "Grassgas devote their lives into protecting and preserving nature. They are against the consumption of plants, animals, and water. In other words, they only eat Pepegas.", 
        15, 60, 
        15, 10, ["Snus", "Fame Leech", "Sap"],
        browserRuntime.getURL("images/pepegas/4_Grassga.png")),

    new PepegaType(5, [], "Icega", "Icegas are known to have a passion for documenting their daily life activities. They are also notorious for faking events in their lives in order to boost their own self-worth.", 
        20, 60, 
        10, 10, ["Hail", "Stage", "Freeze"],
        browserRuntime.getURL("images/pepegas/5_Icega.png")),

    new PepegaType(6, [], "Pepega Knight", "Pepega Knights will defend their idol with their lives. When their idol is involved in a controversy, these Pepega Knights will protect them no matter what, as if they are their idol's friends. In reality, these idols couldn't care less about them. These Pepegas are also a master of mental gymnastics.", 
        380, 300, 
        495, 10, ["Donate", "Permaban", "Defend"],
        browserRuntime.getURL("images/pepegas/6_Pepega-Knight.png")),

    new PepegaType(7, [], "Pepega Hunter", "Pepega Hunters are deadly snipers who can find anyone easily no matter where one is. They enjoy listening to loud, deafening music and remixes, and it is their duty to make their victims hear it as well.", 
        438, 300, 
        438, 10, ["Snipe", "Remix", "Stream Save"],
        browserRuntime.getURL("images/pepegas/7_Pepega-Hunter.png")),

    new PepegaType(8, [], "Pepega Wizard", "This Pepega is very fond of Time Travel and a bit of risque dancing. It has a habit of screaming its own name.", 
        495, 300, 
        380, 10, ["Old Age", "Thrust", "Time Compression"],
        browserRuntime.getURL("images/pepegas/8_Pepega-Wizard.png")),

    new PepegaType(9, [], "Baby Pepega", "Aww, it's so cute! So stupidly cute! :3", 
        10, 30, 
        10, 10, ["Cry", "Time Out", "Complain"],
        browserRuntime.getURL("images/pepegas/9_Baby-Pepega.png")),

    new PepegaType(10, [], "Silver Pepega", "", 
        4000, 600, 
        2000, 10, ["Laser Beam", "Electricity Bomb", "JC Denton"],
        browserRuntime.getURL("images/pepegas/10_Silver-Pepega.png")),

    new PepegaType(11, [], "Golden Pepega", "", 
        25500, 3600, 
        8000, 10, ["Illuminate", "Divine Judgement", "Cheat"],
        browserRuntime.getURL("images/pepegas/11_Golden-Pepega.png")),

    new PepegaType(12, [], "Joyga", "These Pepegas are very young and have an awfully low standard for entertainment. They are easily attracted to Pepegas who are loud and obnoxious.", 
        10, 15, 
        6, 10, ["React", "Poggers", "Yeet"],
        browserRuntime.getURL("images/pepegas/12_Joyga.png")),

    new PepegaType(13, [], "Kkoga", "KKogas are well-known for their obsession with guns and unhealthy food. It is living the Pepega dream.", 
        40, 30, 
        22, 10, ["Shoot", "Guitar Time", "Pray"],
        browserRuntime.getURL("images/pepegas/13_Kkoga.png")),

    new PepegaType(14, [], "Bitga", "This Pepega has as much IQ as the number of pixels it has.", 
        90, 30, 
        50, 10, ["Backseat", "Throw Controller", "Release Mobile Game"],
        browserRuntime.getURL("images/pepegas/14_Bitga.png")),

    new PepegaType(15, [], "Broga", "These Pepegas love the use of platforms that connect to the other side, and if anyone is standing in their way, Brogas are capable of taking them down confidently with ease", 
        685, 300, 
        350, 10, ["Cross", "Review", "Call Swedish"],
        browserRuntime.getURL("images/pepegas/15_Broga.png")),

    new PepegaType(16, [], "Orange Pepega", "Orange Pepegas are carpenters who specializes in walls. They are capable of building multiple kinds of walls, no matter how high, and it is their obligation to make sure no one is able to go through those walls.", 
        2870, 600, 
        1300, 10, ["Construct Wall", "Weebs Out", "Electrocute"],
        browserRuntime.getURL("images/pepegas/16_Orange-Pepega.png")),

    new PepegaType(17, [], "Fastga", "Contrary to popular belief, these Pepegas love listening to violent rap music.", 
        7, 15, 
        13, 10, ["Sprint", "Meow", "Redesign"],
        browserRuntime.getURL("images/pepegas/17_Fastga.png")),

    new PepegaType(18, [], "Pastorga", "This pepega tells you that by simply catching it, it has won.", 
        15, 15, 
        25, 10, ["Shout", "Push", "Scream"],
        browserRuntime.getURL("images/pepegas/18_Pastorga.png")),

    new PepegaType(19, [], "Red Fastga", "This Pepega keeps asking you if you know the destination.", 
        85, 30, 
        165, 10, ["Click", "Show the Way", "Raid"],
        browserRuntime.getURL("images/pepegas/19_Red-Fastga.png")),

    new PepegaType(20, [], "Supa Pepega", "This Pepega is on a mission to defeat and destroy the Pepega Mafia.", 
        475, 300, 
        1100, 10, ["Supa Kicker", "Supa Striker", "Slow-mo"],
        browserRuntime.getURL("images/pepegas/20_Supa-Pepega.png")),

    new PepegaType(21, [], "Pepega U", "This Pepega dedicates its life to avenging its Pepega brother that was assassinated by who it thinks are the Pepega Mafia. It is a master of Martial Arts and Wingless Flying. They call it... Pepega U!", 
        2550, 1800, 
        7100, 10, ["Ugandan Kiss", "Tiger Claw", "Dragon Claw"],
        browserRuntime.getURL("images/pepegas/21_Pepega-U.png")),

    new PepegaType(22, [], "Peppahga", "In spite of its appearance, it is not a rat, but is in fact just another Pepega.", 
        260, 300, 
        130, 10, ["Bark", "Squeak", "Run"],
        browserRuntime.getURL("images/pepegas/22_Peppahga.png")),

    new PepegaType(23, [], "200 IQ Pepega", "This Pepega loves telling other Pepegas about their favorite cartoon show in a very condescending manner. It then proceeds to tell them that they are not smart enough to understand the show anyway.", 
        400, 300, 
        200, 10, ["Freak Out", "Superiority Complex", "Snob"],
        browserRuntime.getURL("images/pepegas/23_200-IQ-Pepega.png")),

    new PepegaType(24, [], "400 IQ Pepega", "No one knows why, but these Pepegas keep yelling the word \"Pickle\" and a guy named \"Richard\".", 
        2800, 300, 
        1180, 10, ["Yell", "Outsmart", "Destroy"],
        browserRuntime.getURL("images/pepegas/24_400-IQ-Pepega.png")),

    new PepegaType(25, [], "Amazga", "One of the smartest Pepegas known to Pepegakind. Legend has it that this Pepega has already beaten this game.", 
        21500, 600,
        6950, 10, ["Ragnaros", "Blindfold", "1st Place"],
        browserRuntime.getURL("images/pepegas/25_Amazga.png")),

    new PepegaType(26, [], "Scamazga", "SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE THERE'S NOTHING YOU CAN DO HAHAHAHAHAHAHAHAHAHAHAHAHAHA", 
        135000, -10, 
        -68000, 10, ["Curse", "Possess", "Backstab"],
        browserRuntime.getURL("images/pepegas/26_Scamazga.png")),

    new PepegaType(27, [], "Pridega", "", 
        15, 15, 
        25, 10, ["Attack"],
        browserRuntime.getURL("images/pepegas/27_Pridega.png")),

    new PepegaType(28, [], "Stronga", "These Pepegas love going to the gym and wrestling with their fellow Strongas.", 
        400, 30, 
        650, 10, ["Lift", "Wrestle", "Taunt"],
        browserRuntime.getURL("images/pepegas/28_Stronga.png")),

    new PepegaType(29, [], "Jamga", "Jamgas are masters of music, more specifically, groaning music.", 
        750, 60, 
        750, 10, ["Hyperjam", "Hop", "AHHHHH"],
        browserRuntime.getURL("images/pepegas/29_Jamga.png")),

    new PepegaType(30, [], "Rigardo", "An expert in what is known as romantic dancing, Rigardo can dance to almost every type of music.", 
        1250, 600, 
        2600, 10, ["Ram", "Hump", "Lunge"],
        browserRuntime.getURL("images/pepegas/30_Rigardo.png")),

    new PepegaType(31, [], "Billiga", "Billiga is highly respected for its service in the Pepega Armed Forces. It is a tough, but loving Pepega, and it only wants what's best for you. After its retirement, it has become a prominent figure in the wresling community.", 
        1400, 600, 
        2400, 10, ["Headscissor", "Armlock", "Kiss"],
        browserRuntime.getURL("images/pepegas/31_Billiga.png")),

    new PepegaType(32, [], "Vanga", "Vangas are infamous for owning their very own dungeon where they party with their friends. They are also commonly referred to as Leathergas, due to the outfit that they wear.", 
        1550, 600, 
        2200, 10, ["300 Bucks", "Mermaid Splash", "Leatherwhip"],
        browserRuntime.getURL("images/pepegas/32_Vanga.png")),

    new PepegaType(33, [], "Gachiga", "Gachigas are considered to be the strongest and simultaneously the most beautiful Pepegas known to Pepegakind. It greatly excels in performance art, music, and bodybuilding.", 
        16070, 600, 
        27500, 10, ["Manly Rave", "Thunder Remix", "Strength"],
        browserRuntime.getURL("images/pepegas/33_Gachiga.png")),

    new PepegaType(34, [], "Hypergachiga", "A Pepega Abomination. What have you done?", 
        -103200, 600, 
        172000, 10, ["Annihilate", "Obliterate", "DEATH"],
        browserRuntime.getURL("images/pepegas/34_Hypergachiga.png")),

    new PepegaType(35, [], "Weebga", "These Pepegas are obsessed with children's cartoons to the point where they will dress up as their favorite character, and in some cases, even fall in love with a character, not realizing that these are mere drawings with no actual feeling or thought.", 
        10, 30, 
        5, 10, ["AYAYA", "Cute Dance", "Cute Costume"],
        browserRuntime.getURL("images/pepegas/35_Weebga.png")),

    new PepegaType(36, [], "Mald Pepega", "This Pepega somehow manages to not only be mald, but also bald at the same time.", 
        16, 30, 
        8, 10, ["Infect with Maldness", "BOO", "Quit"],
        browserRuntime.getURL("images/pepegas/36_Mald-Pepega.png")),

    new PepegaType(37, [], "Aimga", "Having inpepegan reflexes, these Pepegas are very good at FPS games and everything that requires true skill.", 
        10, 30,  
        10, 10, ["AWP", "AK-47", "M4A4"],
        browserRuntime.getURL("images/pepegas/37_Aimga.png")),

    new PepegaType(38, [], "Pokketga", "", 
        10, 30,  
        5, 10, ["Trigger"],
        browserRuntime.getURL("images/pepegas/38_Pokketga.png")),

    new PepegaType(39, [], "Kappaga", "An incredibly popular and beloved Pepega... Kapp.", 
        15, 30, 
        30, 10, ["Jebait", "Account Suspension", "A killing blow... Kapp"],
        browserRuntime.getURL("images/pepegas/39_Kappaga.png")),

    new PepegaType(40, [], "Ninjaga", "This Pepega keeps telling you to click the Subscribe button, but also making sure you don't smash it.", 
        150, 300, 
        290, 10, ["Ligma", "Sugma", "Subscribe to Pepega Prime (without smashing)"],
        browserRuntime.getURL("images/pepegas/40_Ninjaga.png")),

    new PepegaType(41, [], "Xqga", "A streamer with a fanbase.", 
        155, 300, 
        285, 10, ["React", "Play", "Slam Desk"],
        browserRuntime.getURL("images/pepegas/41_Xqga.png")),

    new PepegaType(42, [], "Shroudga", "Shroudgas are the paragon of skill. They have near-perfect dexterity and they can kill you in less than a microsecond from a mile away. Despite their greatness, however, they have lost to a certain Mald Pepega before.", 
        160, 300, 
        280, 10, ["Slay", "Execute", "Assassinate"],
        browserRuntime.getURL("images/pepegas/42_Shroudga.png")),

    new PepegaType(43, [], "Tylerga", "Tylergas are recognized for their intense, boisterous screaming and desk slamming. It has weirdly big and disproportionate biceps, and its head looks like a marshmallow. They were tormented in the past by the nefarious Pepegas known as Tannergas.", 
        165, 300, 
        275, 10, ["SCREAM", "SLAM KEYBOARD", "OUTBREAK"],
        browserRuntime.getURL("images/pepegas/43_Tylerga.png")),

    new PepegaType(44, [], "GreekGaX", "This Pepega has a habit of sticking to other Pepegas in hopes of stealing their IQ. It enjoys eating excessive amounts of food even though it has swore, many times in the past, to do the complete opposite.", 
        170, 300, 
        270, 10, ["Devour", "Explode", "Send to Vacation City"],
        browserRuntime.getURL("images/pepegas/44_GreekGaX.png")),

    new PepegaType(45, [], "Triga", "Trigas are very popular for their immense skill in the game called Maldio. They are considered to be the best at this genre, and they don't mald very easily unlike some other Pepegas.", 
        175, 300, 
        265, 10, ["World Record", "Speedrun", "7"],
        browserRuntime.getURL("images/pepegas/45_Triga.png")),

    new PepegaType(46, [], "Forsenga", "A professional children's card player that gets mad and bald when it loses. Although, nowadays, it just plays cartoon drag-and-drop games that require no skill whatsoever. Perhaps, this way, it can just blame its bad luck when it loses, instead of its lack of skill.", 
        180, 300, 
        260, 10, ["Steal Posture", "Bottom Snus", "Google"],
        browserRuntime.getURL("images/pepegas/46_Forsenga.png")),

    new PepegaType(47, [], "Doctor Pepega", "The three time, back to back to back, consecutive years, 1982-1976 blockbuster Pepega. For some reason, you can see through its body.", 
        185, 300, 
        255, 10, ["Two-Time", "Invisibility", "Punk Kids"],
        browserRuntime.getURL("images/pepegas/47_Doctor-Pepega.png")),

    new PepegaType(48, [], "Repliga", "", 
        -2500, 10, 
        1000, 10, ["t0rm3nt"],
        browserRuntime.getURL("images/pepegas/48_Repliga.png")),

    new PepegaType(49, [], "Luciga", "", 
        -40000, 5, 
        30000, 10, ["Torment"],
        browserRuntime.getURL("images/pepegas/49_Luciga.png")),

    new PepegaType(50, [], "Final Luciga", "", 
        -100000, -10, 
        200000, 10, ["Massacre"],
        browserRuntime.getURL("images/pepegas/50_Final-Luciga.png")),
]

const categories = [
    new Category(0, false, [],
        [
            new Option(pepegaTypes[1], 3),
            new Option(pepegaTypes[2], 0),
            new Option(pepegaTypes[3], 5),
            new Option(pepegaTypes[4], 5),
            new Option(pepegaTypes[5], 5),
            new Option(pepegaTypes[6], 0.2),
            new Option(pepegaTypes[7], 0.2),
            new Option(pepegaTypes[8], 0.2),
            new Option(pepegaTypes[9], 0),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 5),
            new Option(pepegaTypes[13], 3),
            new Option(pepegaTypes[14], 1),
            new Option(pepegaTypes[15], 0),
            new Option(pepegaTypes[16], 0),
            new Option(pepegaTypes[17], 5),
            new Option(pepegaTypes[18], 3),
            new Option(pepegaTypes[19], 0),
            new Option(pepegaTypes[20], 0),
            new Option(pepegaTypes[21], 0),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[23], 1),
            new Option(pepegaTypes[24], 0),
            new Option(pepegaTypes[25], 0),
            new Option(pepegaTypes[26], 0),
            new Option(pepegaTypes[27], 3),
            new Option(pepegaTypes[28], 0.25),
            new Option(pepegaTypes[29], 0.15),
            new Option(pepegaTypes[30], 0),
            new Option(pepegaTypes[31], 0),
            new Option(pepegaTypes[32], 0),
            new Option(pepegaTypes[33], 0),
            new Option(pepegaTypes[34], 0),
            new Option(pepegaTypes[35], 3),
            new Option(pepegaTypes[36], 3),
            new Option(pepegaTypes[37], 3),
            new Option(pepegaTypes[38], 3),
            new Option(pepegaTypes[39], 0),
            new Option(pepegaTypes[40], 0),
            new Option(pepegaTypes[41], 0),
            new Option(pepegaTypes[42], 0),
            new Option(pepegaTypes[43], 0),
            new Option(pepegaTypes[44], 0),
            new Option(pepegaTypes[45], 0),
            new Option(pepegaTypes[46], 0),
            new Option(pepegaTypes[47], 0),
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
            new Option(pepegaTypes[1], 3),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[8], 0.25),
            new Option(pepegaTypes[9], 5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 12.5),
            new Option(pepegaTypes[13], 3),
            new Option(pepegaTypes[14], 1),
            new Option(pepegaTypes[27], 5),
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
            new Option(pepegaTypes[1], 3),
            new Option(pepegaTypes[3], 6),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[6], 0.25),
            new Option(pepegaTypes[9], 5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[17], 12.6),
            new Option(pepegaTypes[18], 5),
            new Option(pepegaTypes[19], 1),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[36], 6),
            new Option(pepegaTypes[38], 6)
        ]
    ),
    new Category(3, false,
        [
            new Site("reddit")
        ],
        [
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[7], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[13], 4),
            new Option(pepegaTypes[14], 1),
            new Option(pepegaTypes[17], 3),
            new Option(pepegaTypes[18], 4),
            new Option(pepegaTypes[19], 1),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[27], 7.5),
            new Option(pepegaTypes[35], 3),
            new Option(pepegaTypes[36], 3),
            new Option(pepegaTypes[37], 3),
            new Option(pepegaTypes[38], 5),
            new Option(pepegaTypes[48], 0.05),
            new Option(pepegaTypes[49], 0.005),
            new Option(pepegaTypes[50], 0.0005)
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
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[7], 0.25),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[17], 3),
            new Option(pepegaTypes[19], 5),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[23], 0.5),
            new Option(pepegaTypes[35], 20)
        ]
    ),
    new Category(5, false,
        [
            new Site("twitch"),
            new Site("mixer"),
        ],
        [
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[8], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[17], 3),
            new Option(pepegaTypes[22], 1),
            new Option(pepegaTypes[27], 3),
            new Option(pepegaTypes[35], 5),
            new Option(pepegaTypes[36], 5),
            new Option(pepegaTypes[37], 5),
            new Option(pepegaTypes[38], 5),
            new Option(pepegaTypes[39], 15),
            new Option(pepegaTypes[40], 1),
            new Option(pepegaTypes[41], 1),
            new Option(pepegaTypes[42], 1),
            new Option(pepegaTypes[43], 1),
            new Option(pepegaTypes[44], 1),
            new Option(pepegaTypes[45], 1),
            new Option(pepegaTypes[46], 1),
            new Option(pepegaTypes[47], 1)
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
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 6),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[7], 0.25),
            new Option(pepegaTypes[9], 2.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[14], 15),
            new Option(pepegaTypes[17], 1),
            new Option(pepegaTypes[19], 2.5),
            new Option(pepegaTypes[22], 2.5),
            new Option(pepegaTypes[23], 2.5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[36], 1),
            new Option(pepegaTypes[37], 2.5),
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
    new Category(7, true,
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
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 1.5),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[8], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[13], 5),
            new Option(pepegaTypes[14], 7.5),
            new Option(pepegaTypes[22], 3),
            new Option(pepegaTypes[23], 10),
            new Option(pepegaTypes[24], 1),
            new Option(pepegaTypes[36], 2.5),
            new Option(pepegaTypes[46], 2.5)
        ]
    ),
    new Category(8, true,
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
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[8], 0.25),
            new Option(pepegaTypes[9], 1.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[12], 3),
            new Option(pepegaTypes[13], 4),
            new Option(pepegaTypes[14], 6),
            new Option(pepegaTypes[22], 2),
            new Option(pepegaTypes[23], 8),
            new Option(pepegaTypes[24], 6),
            new Option(pepegaTypes[36], 2)
        ]
    ),
    new Category(9, true,
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
            new Option(pepegaTypes[3], 6),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[6], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[17], 5),
            new Option(pepegaTypes[18], 5),
            new Option(pepegaTypes[19], 5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[28], 5),
            new Option(pepegaTypes[29], 2.5),
            new Option(pepegaTypes[35], 1),
            new Option(pepegaTypes[38], 2.5),
            new Option(pepegaTypes[44], 1),
            new Option(pepegaTypes[46], 1)
        ]
    ),
    new Category(10, true,
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
            new Option(pepegaTypes[5], 2),
            new Option(pepegaTypes[6], 0.25),
            new Option(pepegaTypes[9], 2.5),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[17], 1),
            new Option(pepegaTypes[18], 2),
            new Option(pepegaTypes[19], 3.5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[28], 10),
            new Option(pepegaTypes[29], 3.5),
            new Option(pepegaTypes[30], 1),
            new Option(pepegaTypes[31], 1),
            new Option(pepegaTypes[32], 1),
            new Option(pepegaTypes[35], 2.5),
            new Option(pepegaTypes[38], 2.5),
            new Option(pepegaTypes[47], 2.5)
        ]
    ),
    new Category(11, true,
        [
            new Site("hentai"),
            new Site("fakku"),
            new Site("4channel"),
            new Site("doujin")
        ],
        [
            new Option(pepegaTypes[2], 3),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[8], 0.25),
            new Option(pepegaTypes[9], 3),
            new Option(pepegaTypes[10], 0.1),
            new Option(pepegaTypes[11], 0.01),
            new Option(pepegaTypes[14], 2.5),
            new Option(pepegaTypes[17], 1),
            new Option(pepegaTypes[18], 2),
            new Option(pepegaTypes[19], 3.5),
            new Option(pepegaTypes[27], 5),
            new Option(pepegaTypes[28], 3.5),
            new Option(pepegaTypes[29], 10),
            new Option(pepegaTypes[30], 1),
            new Option(pepegaTypes[31], 1),
            new Option(pepegaTypes[32], 1),
            new Option(pepegaTypes[35], 10),
            new Option(pepegaTypes[45], 2.5)
        ]
    ),
    new Category(12, true,
        [
            new Site("4chan"),
            new Site("8chan"),
            new Site("2chan")
        ],
        [
            new Option(pepegaTypes[2], 3),
            new Option(pepegaTypes[3], 2),
            new Option(pepegaTypes[4], 2),
            new Option(pepegaTypes[5], 6),
            new Option(pepegaTypes[8], 0.25),
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
            new Option(pepegaTypes[30], 2),
            new Option(pepegaTypes[31], 2),
            new Option(pepegaTypes[32], 2),
            new Option(pepegaTypes[35], 10),
            new Option(pepegaTypes[45], 2.5)
        ]
    ),
    new Category(13, true,
        [
            new Site("kaotic"),
            new Site("gorejunkies"),
            new Site("livegore")
        ],
        [
            new Option(pepegaTypes[48], 94),
            new Option(pepegaTypes[49], 5),
            new Option(pepegaTypes[50], 1)
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
var totalPepegaPower = 0;
var rank = ranks[0];
var branch = branches[0];
var pepegaSlotCost = 0;
var uniquePepegaIqpsMultiplier = 1;
var uniquePepegaCount = 0;

var player = {
    iqCount: 0,
    pepegas: [],
    armyName: defaultArmyName,
    pepegaSlots: startingPlayerPepegaSlots,
    catchCount: 0,
    successfulCatchCount: 0
}

var settings = {
    filteredSites: [],
    enableSounds: true,
    enablePepegaCatchReleaseNotifications: true,
    enableRankUpNotifications: true,
    enableTutorialNotifications: true,
    enablePepegaHealNotifications: true,
    recordOrigin: true,
    encounterMode: encounterModes[0],
}

var tutorial = {
    phase: "ask",
    randomPhase: "",
    enableUniquePepegaRandomTutorial: true,
    enableRankUpRandomTutorial: true,
    enableDeadPepegaRandomTutorial: true
}

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

browserStorage.get(["playerIqCount"], function(result) {
    if(parseInt(result.playerIqCount)){
        player.iqCount = result.playerIqCount;
    }
});

browserStorage.get(["playerPepegaSlots"], function(result) {
    if(result.playerPepegaSlots != null){
        player.pepegaSlots = result.playerPepegaSlots;
    }
    analyzePepegaSlotCost();
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

browserStorage.get(["playerCatchCount"], function(result) {
    if(result.playerCatchCount != null){
        player.catchCount = result.playerCatchCount;
    }
});

browserStorage.get(["playerSuccessfulCatchCount"], function(result) {
    if(result.playerSuccessfulCatchCount != null){
        player.successfulCatchCount = result.playerSuccessfulCatchCount;
    }
});

browserStorage.get(["playerArmyName"], function(result) {
    if(result.playerArmyName != null){
        player.armyName = result.playerArmyName;
    }
});

browserStorage.get(["settingsEncounterMode"], function(result) {
    if(result.settingsEncounterMode != null){
        settings.encounterMode = result.settingsEncounterMode;
        updateIconFromSelectedTab();
    }
});

browserStorage.get(["settingsFilteredSites"], function(result) {
    if(result.settingsFilteredSites != null){
        settings.filteredSites = result.settingsFilteredSites;
    }
});

browserStorage.get(["settingsEnableSounds", 
"settingsEnablePepegaCatchReleaseNotifications", "settingsEnableRankUpNotifications", "settingsEnablePepegaHealNotifications", 
"settingsRecordOrigin", "settingsEncounterMode"], function(result) {
    if(result.settingsEnableSounds != null){
        settings.enableSounds = result.settingsEnableSounds;
    }

    if(result.settingsEnablePepegaCatchReleaseNotifications != null){
        settings.enablePepegaCatchReleaseNotifications = result.settingsEnablePepegaCatchReleaseNotifications;
    }

    if(result.settingsEnableRankUpNotifications != null){
        settings.enableRankUpNotifications = result.settingsEnableRankUpNotifications;
    }

    if(result.settingsEnablePepegaHealNotifications != null){
        settings.enablePepegaHealNotifications = result.settingsEnablePepegaHealNotifications;
    }

    if(result.settingsRecordOrigin != null){
        settings.recordOrigin = result.settingsRecordOrigin;
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

function updatePlayerPepegaSlots(newPepegaSlots, save = true){
    player.pepegaSlots = newPepegaSlots;

    analyzePepegaSlotCost();

    updatePlayerPepegaSlotsPopupDisplay();

    if(save){
        browserStorage.set({playerPepegaSlots: player.pepegaSlots});
    }
}

function analyzePepegaSlotCost(){
    if(player.pepegaSlots > 4){
        pepegaSlotCost = Math.round(Math.pow(player.pepegaSlots, 6));
    }else{
        pepegaSlotCost = 50 + (player.pepegaSlots * 50);
    }
}

function analyzeUniquePepegas(){
    var uniquePepegas = [...new Set(player.pepegas.map(pepega => pepega.pepegaType.id))];
    uniquePepegaCount = uniquePepegas.length;

    uniquePepegaIqpsMultiplier = 1 + ((uniquePepegaCount-1) * iqpsMultiplierForEachUniquePepega);

    /*
    if(uniquePepegaIqpsMultiplier != 1 && tutorial.phase != "disabled" && tutorial.enableUniquePepegaRandomTutorial){
        updateRandomTutorialPhase("uniquePepega");
    }
    */
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

function rollPepegaPower(basePower){
    var roll = (Math.random() * (1.3 - 0.7)) + 0.7;
    return Math.round((basePower * roll) * 100) / 100;
}

function rollWildPepega(category){
    var wildPepegaType = pepegaTypes[0];
    var wildPepegaLevel = 1;
    var specialEventOccured = false;

    if(!category.isSpecial){
        if(player.catchCount < minimumCatchCountForMorePepegas){
            if(player.catchCount == 1){
                var roll = Math.floor(Math.random() * (3));
                if(roll == 0){
                    wildPepegaType = pepegaTypes[3];
                }else if(roll == 1){
                    wildPepegaType = pepegaTypes[4];
                }else{
                    wildPepegaType = pepegaTypes[5];
                }
                specialEventOccured = true;
            }
        } else if(player.catchCount == 5){
            wildPepegaType = pepegaTypes[24];
            specialEventOccured = true;
        } else if(player.catchCount < 19 && player.catchCount % 3 == 0){
            wildPepegaType = pepegaTypes[0];
            specialEventOccured = true;
        }
    }

    if(!specialEventOccured){
        var roll = (Math.random() * (100.0));
        var rollCeiling = 0;
        var index, length;
        console.log("Wild Pepega Roll: " + roll); 
        for (index = 0, length = category.options.length; index < length; ++index) {
            var probability = category.options[index].probability;
            if(probability > 0){
                rollCeiling += probability;
                if(roll <= rollCeiling){
                    wildPepegaType = pepegaTypes[category.options[index].pepegaType.id];
                    if(wildPepegaType.basePower < (totalPepegaPower / 4)){
                        wildPepegaLevel = 2;
                    }
                    break;
                }
            }
        }
    }

    console.log("Special Event? " + specialEventOccured + " and level is " + wildPepegaLevel);

    return new Pepega(wildPepegaType, "", "", false, rollPepegaPower(wildPepegaType.basePower), wildPepegaLevel, true, null);
}

function rollEncounter(){
    var roll = (Math.random() * (100 - 0.1)) + 0.1;
    console.log("Encounter Roll: " + roll + " must be less than " +(baseEncounterRate) * (settings.encounterMode.multiplier/100));
    return roll <= ((baseEncounterRate) * (settings.encounterMode.multiplier/100));
}

function rollTimeBeforeNextWildPepegaSpawn(){
    var roll = Math.floor(Math.random() * (maxTimeBeforeNextWildPepegaSpawn - minTimeBeforeNextWildPepegaSpawn) ) + minTimeBeforeNextWildPepegaSpawn;
    return roll;
}

const minTimeBeforeNextWildPepegaSpawn = 0;
const maxTimeBeforeNextWildPepegaSpawn = 0;
const beginnerTimeBeforeNextWildPepegaSpawn = 0;
var lastWildPepegaSpawnTime = 0;
var timeBeforeNextWildPepegaSpawn = rollTimeBeforeNextWildPepegaSpawn();
browserStorage.get(["lastWildPepegaSpawnTime", "timeBeforeNextWildPepegaSpawn"], function(result) {
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
        if(player.catchCount >= 3){
            timeBeforeNextWildPepegaSpawn = rollTimeBeforeNextWildPepegaSpawn();
        }else{
            timeBeforeNextWildPepegaSpawn = beginnerTimeBeforeNextWildPepegaSpawn;
        }
        browserStorage.set({lastWildPepegaSpawnTime: lastWildPepegaSpawnTime, timeBeforeNextWildPepegaSpawn: timeBeforeNextWildPepegaSpawn}, function() {
            console.log("Spawn Time was saved. New time before the next Wild Pepega spawns is " + (timeBeforeNextWildPepegaSpawn/1000.0) + " seconds.");
        });
        return rollWildPepega(category);
    }else{
        return null;
    }
}

function isSiteFiltered(location){
    if(location.hostname){
        for (var i = 0; i < settings.filteredSites.length; ++i) {
            if(settings.filteredSites[i] && settings.filteredSites[i] != "" && 
                (location.hostname.includes(settings.filteredSites[i]) || settings.filteredSites[i].includes(location.hostname))){
                browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIconDisabled128.png")});
                return true;
            }
        }
    }
	return false;
}

function updateIcon(location){
    var siteFiltered = isSiteFiltered(location);
    if(siteFiltered || settings.encounterMode.multiplier == 0){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIconDisabled128.png")});
    }else if(settings.encounterMode.multiplier == 100){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIcon128.png")});
    }else{
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIconLess128.png")});
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

    var iqReleasePrice = (playerPepega.pepegaType.iqReleasePriceMultiplier * playerPepega.pepegaType.iqCount * playerPepega.level);

    updatePlayerIqCount(iqReleasePrice);

    notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", playerPepega.pepegaType.name + " released!", playerPepega.pepegaType.name + " was released back into " + 
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

            setPepegaAlive(playerPepega.alive);

            updatePlayerPepegasPopupDisplay();
        }
    }
}

function getArticle(word){
    var article = "a";
    if(isStringAVowel(word)){
        article = "an";
    }
    return article;
}

function setPepegaAlive(pepega, alive){
    if(!pepega.alive && alive){
        totalIqps += pepega.pepegaType.iqps * pepega.level;
        totalPepegaPower += pepega.power * pepega.level;
        pepega.alive = alive;
    }else if (pepega.alive && !alive){
        totalIqps -= pepega.pepegaType.iqps * pepega.level;
        totalPepegaPower -= pepega.power * pepega.level;
        pepega.alive = alive;
    }
}

var shuffle = function (array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};

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
    results.battleBreakdown.wildPepega.name = wildPepegaName;
    results.battleBreakdown.wildPepega.totalPower = wildPepegaTotalPower;
    results.battleBreakdown.player.rankTitle = rank.title;

    var indexArray = [];
    for(var i = 0; i < player.pepegas.length; i++){
        indexArray.push(i);
    }
    indexArray = shuffle(indexArray);

    for(var i = 0; i < indexArray.length; i++){
        var playerPepega = player.pepegas[indexArray[i]];

        if(!playerPepega.alive){
            continue;
        }

        var playerPepegaPower = playerPepega.power * playerPepega.level;
        var playerPepegaRolledPower = Math.round((playerPepegaPower*((Math.random() * (1.3 - 0.7)) + 0.7)) * 100)/100;
        var playerPepegaName = playerPepega.pepegaType.name;
        var playerPepegaAttack;
        if(playerPepega.level < 3){
            playerPepegaAttack = playerPepega.pepegaType.attacks[Math.min( i%2, playerPepega.pepegaType.attacks.length - 1 )];
        }else{
            playerPepegaAttack = playerPepega.pepegaType.attacks[Math.min( i%3, playerPepega.pepegaType.attacks.length - 1 )];
        }

        results.battleBreakdown.rounds[i] = {};
        results.battleBreakdown.rounds[i].playerPepega = {};
        results.battleBreakdown.rounds[i].wildPepega = {};

        results.battleBreakdown.rounds[i].playerPepega.name = playerPepegaName;
        results.battleBreakdown.rounds[i].playerPepega.attack = playerPepegaAttack;
        results.battleBreakdown.rounds[i].playerPepega.power = playerPepegaRolledPower;

        if(playerPepegaRolledPower < wildPepegaRemainingPower){
            wildPepegaRemainingPower = Math.round((wildPepegaRemainingPower - playerPepegaRolledPower) * 100) / 100;

            var wildPepegaAttack = wildPepega.pepegaType.attacks[Math.min( i%2, wildPepega.pepegaType.attacks.length - 1 )];

            results.battleBreakdown.rounds[i].roundPlayerWon = false;
            results.battleBreakdown.rounds[i].wildPepega.remainingPower = wildPepegaRemainingPower;
            results.battleBreakdown.rounds[i].wildPepega.attack = wildPepegaAttack;

            setPepegaAlive(playerPepega, false);
            results.casualties++;
            playerPepega.timeBeforeRecovery = new Date().getTime() + 
            (playerPepega.power * playerPepega.level * multiplierBeforePepegaRecovers);
        
            if(tutorial.phase != "disabled" && tutorial.enableDeadPepegaRandomTutorial){
                updateRandomTutorialPhase("deadPepega");
            }
        }else{
            results.battleBreakdown.rounds[i].roundPlayerWon = true;
            results.battleBreakdown.playerWon = true;
            browserStorage.set({playerPepegas: player.pepegas});
            results.won = true;
            break;
        }
    }

    var rolledRankPower = Math.round((rank.basePower*((Math.random() * (1.3 - 0.7)) + 0.7)) * 100) / 100;
    results.battleBreakdown.player.rolledRankPower = rolledRankPower;
    wildPepegaRemainingPower = Math.round((wildPepegaRemainingPower - rolledRankPower) * 100) / 100;
    if(wildPepegaRemainingPower <= 0){
        results.won = true;
    }

    results.battleBreakdown.wildPepega.remainingPower = wildPepegaRemainingPower;
    
    browserStorage.set({playerPepegas: player.pepegas});
    return results;
}

const AddingPlayerPepegaResultEnum = {"successSingle":1, "successLeveledUp":2, "successFusioned":2, "noPepegaSlots":3}
const CombiningPlayerPepegaResultEnum = {"combined":1, "noCombination":2, "noPepegaSlots":3}

function catchWildPepega(wildPepegaTypeId, wildPepegaPower, wildPepegaLevel, location){
    var wildPepega = new Pepega(pepegaTypes[wildPepegaTypeId], "", "", false, wildPepegaPower, wildPepegaLevel, true, null);

    var fightResults = fightWildPepega(wildPepega);

    browserStorage.set({"recentBattleBreakdown": fightResults.battleBreakdown});

    player.catchCount++;
    browserStorage.set({playerCatchCount: player.catchCount});

    if(!fightResults.won){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "VI LOST!", "Your Pepegas lost to " + wildPepega.pepegaType.name + "!\n" +
        "You may instantly heal them by spending IQ, or you can just wait!", wildPepega.pepegaType.imageUrl);
        updatePlayerPepegasPopupDisplay();
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

    if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successSingle){
        var notificationMessage = "You caught " + getArticle(pepegaAdd[1].pepegaType.name[0]) + " " + pepegaAdd[1].pepegaType.name + "!";
        if(fightResults.casualties == 1){
            notificationMessage += "\nOne of your Pepegas died in the process. :(";
        }else if(fightResults.casualties > 1){
            notificationMessage += "\n" + fightResults.casualties + " Pepegas died in the process. :(";
        }

        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " caught!", 
        notificationMessage, pepegaAdd[1].pepegaType.imageUrl);

        player.successfulCatchCount++;
        browserStorage.set({playerSuccessfulCatchCount: player.successfulCatchCount});

        if(tutorial.phase == "catch"){
            updateTutorialPhase("catchDone");
        }

        playSound(pepegaCatchSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successLeveledUp){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " is now level " + pepegaAdd[1].level + "!",
            "Your " + pepegaAdd[1].pepegaType.name + " leveled up!\nIt is now level " + pepegaAdd[1].level + "!\nPog!",
            pepegaAdd[1].pepegaType.imageUrl);

        player.successfulCatchCount++;
        browserStorage.set({playerSuccessfulCatchCount: player.successfulCatchCount});

        if(tutorial.phase == "levelUp"){
            updateTutorialPhase("levelUpDone");
        }

        playSound(pepegaLevelSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successFusioned){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You fusion summoned " + getArticle() + " " + pepegaAdd[1].pepegaType.name + "!",
            wildPepega.pepegaType.name + " fusioned with other Pepegas into " + article + " " + pepegaAdd[1].pepegaType.name + "!\nPogChamp!",
            pepegaAdd[1].pepegaType.imageUrl);

        player.successfulCatchCount++;
        browserStorage.set({playerSuccessfulCatchCount: player.successfulCatchCount});

        if(tutorial.phase == "fusion"){
            updateTutorialPhase("fusionDone");
        }

        playSound(pepegaFusionSound);
    } else{
        var iqReleasePrice = pepegaAdd[1].pepegaType.iqReleasePriceMultiplier * pepegaAdd[1].pepegaType.iqCount * pepegaAdd[1].level;
        updatePlayerIqCount(iqReleasePrice);
        var notificationMessage = pepegaAdd[1].pepegaType.name + " was released, earning you " + iqReleasePrice + " IQ.";

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
            tempPlayerPepega.power = player.pepegas[i].power;
            tempPlayerPepegas.push(tempPlayerPepega);
        }
    }
    
    var tempPlayerPepega = new Object();
    tempPlayerPepega.id = addedPepega.id;
    tempPlayerPepega.typeId = addedPepega.pepegaType.id;
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
        
        var pepegaAdd = addPlayerPepega(fusionedPepega, true);

        return [CombiningPlayerPepegaResultEnum.combined, pepegaAdd[1]];
    }else{
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }
}

function updateSettings(enableSounds, enablePepegaCatchReleaseNotifications, enableRankUpNotifications, enablePepegaHealNotifications, recordOrigin){
    if(enableSounds){
        settings.enableSounds = enableSounds;
    }
    if(enablePepegaCatchReleaseNotifications){
        settings.enablePepegaCatchReleaseNotifications = enablePepegaCatchReleaseNotifications;
    }
    if(enableRankUpNotifications){
        settings.enableRankUpNotifications = enableRankUpNotifications;
    }
    if(enablePepegaHealNotifications){
        settings.enablePepegaHealNotifications = enablePepegaHealNotifications;
    }
    if(recordOrigin){
        settings.recordOrigin = recordOrigin;
    }

    updateSettingsPopupDisplay();

    browserStorage.set({
        settingsEnableSounds: settings.enableSounds, 
        settingsEnablePepegaCatchReleaseNotifications: settings.enablePepegaCatchReleaseNotifications, 
        settingsEnableRankUpNotifications: settings.enableRankUpNotifications, 
        settingsEnablePepegaHealNotifications: settings.enablePepegaHealNotifications,
        settingsRecordOrigin: settings.recordOrigin
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

function updateSettingsFilteredSites(filteredSitesText){
    settings.filteredSites = filteredSitesText.split('\n');

    updateSettingsFilteredSitesPopupDisplay();
    updateIconFromSelectedTab();

    browserStorage.set({settingsFilteredSites: settings.filteredSites});
}

function updateSettingsEncounterMode(){
    var newEncounterMode = encounterModes[0];
    if(settings.encounterMode.id < encounterModes.length-1){
        newEncounterMode = encounterModes[settings.encounterMode.id + 1];
    }
    settings.encounterMode = newEncounterMode;

    updateSettingsEncounterModePopupDisplay();
    updateIconFromSelectedTab();

    browserStorage.set({settingsEncounterMode: settings.encounterMode});
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
    var newPlayerIqCount = player.iqCount + iq;

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
                rankDescription, browserRuntime.getURL("images/rank-up.png"));

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

        if(tutorial.phase == "buySlot"){
            updateTutorialPhase("buySlotDone");
        }
    }
}

function updateAllPopupDisplays(){
    updatePlayerIqCountPopupDisplay();
    updatePlayerPepegasPopupDisplay();
    updateSettingsPopupDisplay();
    updatePlayerArmyNamePopupDisplay();
    updatePlayerPepegaSlotsPopupDisplay();
    updateSettingsEncounterModePopupDisplay();
    updateSettingsFilteredSitesPopupDisplay();
    updateTutorialPhasePopupDisplay();
    updateRandomTutorialPopupDisplay();
}
function updatePlayerPepegaSlotsPopupDisplay(){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": "player-pepega-slots-updated", "playerPepegaCount": player.pepegas.length, "playerPepegaSlots": player.pepegaSlots, "pepegaSlotCost": pepegaSlotCost, "playerIqCount": player.iqCount});
    }
}
function updatePlayerIqCountPopupDisplay(){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": "player-iq-count-updated", "playerIqCount": player.iqCount, "rank": rank, "branch": branch, "nextRank": ranks[rank.id+1], "pepegaSlotCost": pepegaSlotCost, "ranksLength": ranks.length});
    }
}
function updatePlayerPepegasPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "player-pepegas-updated", "playerPepegas": player.pepegas, "totalIqps": totalIqps, "totalPepegaPower": totalPepegaPower, "rankBasePower": rank.basePower,
        "multipliedTotalIqps": Math.round((totalIqps * rank.iqpsMultiplier) * uniquePepegaIqpsMultiplier), "playerPepegaSlots": player.pepegaSlots, "uniquePepegaIqpsMultiplier": uniquePepegaIqpsMultiplier, "baseEncounterRate": baseEncounterRate, "settingsEncounterMode": settings.encounterMode});
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
function updateSettingsEncounterModePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "settings-encounter-mode-updated", "settingsEncounterMode": settings.encounterMode, "baseEncounterRate": baseEncounterRate});
    }
}
function updateSettingsFilteredSitesPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "settings-filtered-sites-updated", "settingsFilteredSites": settings.filteredSites});
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

browserRuntime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "get-wild-pepega"){
            sendResponse({ isSiteFiltered: isSiteFiltered(request.location), wildPepega: getWildPepega(request.location) });
		}else if(request.message == "catch-wild-pepega"){
            catchWildPepega(request.wildPepegaTypeId, request.wildPepegaPower, request.wildPepegaLevel, request.location);
            sendResponse();
		}else if(request.message == "update-all-popup-displays"){
            updateAllPopupDisplays();
            sendResponse();
		}else if(request.message == "release-player-pepega"){
            releasePlayerPepega(request.playerPepegaId);
            sendResponse();
		}else if(request.message == "update-settings"){
			updateSettings(request.enableSounds, 
                request.enablePepegaCatchReleaseNotifications, request.enableRankUpNotifications, request.enablePepegaHealNotifications, request.recordOrigin);
            sendResponse();
		}else if(request.message == "update-settings-encounter-mode"){
            updateSettingsEncounterMode();
            sendResponse();
		}else if(request.message == "update-settings-filtered-sites"){
            updateSettingsFilteredSites(request.filteredSitesText);
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
        }
	}
);