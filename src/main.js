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

var pepegaCatchSound = new Audio(browserRuntime.getURL("sounds/pepega-catch.ogg"));
pepegaCatchSound.volume = 0.25;
var pepegaReleaseSound = new Audio(browserRuntime.getURL("sounds/pepega-release.ogg"));
pepegaReleaseSound.volume = 0.25;
var pepegaFullArmySound = new Audio(browserRuntime.getURL("sounds/pepega-full-army.wav"));
pepegaFullArmySound.volume = 0.1;
var pepegaLevelSound = new Audio(browserRuntime.getURL("sounds/pepega-level.ogg"));
pepegaLevelSound.volume = 0.25;
var pepegaFusionSound = new Audio(browserRuntime.getURL("sounds/pepega-fusion.wav"));
pepegaFusionSound.volume = 0.25;
var pepegaHealSound = new Audio(browserRuntime.getURL("sounds/pepega-heal.ogg"));
pepegaHealSound.volume = 0.2;
var pepegaLostSound = new Audio(browserRuntime.getURL("sounds/pepega-lost.ogg"));
pepegaLostSound.volume = 0.2;

var popup = {
	get isOpened (){
		return browserExtension.getViews({ type: "popup" }).length > 0;
	}
}

class PepegaType {
    constructor(id, fusionIds, name, description, iqps, iqReleasePrice, basePower, healCostMultiplier, attacks, imageUrl) {
        this.id = id;
        this.fusionIds = fusionIds;
        this.name = name;
        this.description = description;
        this.iqReleasePrice = iqReleasePrice;
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
    constructor(id, titleArticle, title, description, iqRequirement, iqpsMultiplier, basePower) {
        this.id = id;
        this.titleArticle = titleArticle;
        this.title = title;
        this.description = description;
        this.iqRequirement = iqRequirement;
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
    new Rank(0, ["a"], ["Pepega Trainer"], ["Gotta take em all!"], 0, 1.0, 15),
    new Rank(1, ["a"], ["Pepega Shepherd"], [""], 4000, 1.1, 20),
    new Rank(2, ["a"], ["Pepega Whisperer"], [""], 35000, 1.2, 25),
    new Rank(3, ["a"], ["Pepega Researcher"], [""], 125000, 1.3, 30),
    new Rank(4, ["a"], ["Pepega Scientist"], ["="], 500000, 1.4, 35),
    new Rank(5, ["a"], ["Pepega Guru"], [""], 2000000, 1.5, 40),
    new Rank(6, ["a"], ["Professor Pepega"], [""], 6500000, 1.6, 45),
    new Rank(7, ["a"], ["Pepega Leader"], [""], 14000000, 1.7, 50),
    new Rank(8, ["a"], ["Pepega Commander"], [""], 30000000, 1.8, 60),
    new Rank(9, [""], ["Captain Pepega"], ["You're the captain now!"], 50000000, 1.9, 70),
    new Rank(10, ["a"], ["Pepega General"], [""], 100000000, 2.0, 80),
    new Rank(11, ["a"], ["Pepega Champion"], [""], 165000000, 2.2, 90),
    new Rank(12, ["a", "a", "a"], ["Pepega Legend", "Pepega Master", "Pepega Titan"], ["", "", ""], 300000000, 2.4, 100),
    new Rank(13, ["a", "the", "a"], ["Pepega Legend II", "Pepega King", "Pepega Machine"], ["", "", ""], 650000000, 2.6, 125),
    new Rank(14, ["a", "the", "the"], ["Pepega Legend III", "President of the Pepega States", "Emperor of Pepegan"], 
    ["", "", ""], 1250000000, 2.8, 150),
    new Rank(15, ["the", "the", "the"], ["Innkeeper", "PepeGOD", "Gaijinga"], 
    ["Everyone’s welcome at your inn!", "Pepegas across the globe bow down to your presence.", "You are the ultimate weeb. AYAYA Clap"], 
    2500000000, 3.0, 200),
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
        0.5, 1, 1, 10, ["Shout", "Push", "Scream"],
        browserRuntime.getURL("images/pepegas/0_Pepega.png")),

    new PepegaType(1, [0, 0, 0], "Okayga", "These Pepegas are only capable of staring and looking deep into someone's eyes, but they do it very skillfully.", 
        5, 50, 10, 10, ["Smile", "Slap", "Dazzle"],
        browserRuntime.getURL("images/pepegas/1_Okayga.png")),

    new PepegaType(2, [1, 1, 1], "Pepege", "This Pepega is incapable of reading, writing, or doing anything that involves the use of more than one brain cell, but at least it's smart enough to be aware of this.", 
        50, 3000, 100, 10, ["Bite", "Confusion", "Charge"],
        browserRuntime.getURL("images/pepegas/2_Pepege.png")),

    new PepegaType(3, [], "Firega", "This Pepega leaves behind gasoline cans, gasoline-soaked rags, and lighters on websites it roams on.", 
        6, 120, 16, 10, ["Sun With Face Clap", "Starfire", "Overheat"],
        browserRuntime.getURL("images/pepegas/3_Firega.png")),

    new PepegaType(4, [], "Grassga", "Grassgas devote their lives into protecting and preserving nature. They are against the consumption of plants, animals, and water. In other words, they only eat Pepegas.", 
        5, 120, 17, 10, ["Snus", "Fame Leech", "Sap"],
        browserRuntime.getURL("images/pepegas/4_Grassga.png")),

    new PepegaType(5, [], "Icega", "Icegas are known to have a passion for documenting their daily life activities. They are also notorious for faking events in their lives in order to boost their own self-worth.", 
        7, 120, 12, 10, ["Hail", "Stage", "Freeze"],
        browserRuntime.getURL("images/pepegas/5_Icega.png")),

    new PepegaType(6, [2, 2, 3], "Pepega Knight", "Pepega Knights will defend their idol with their lives. When their idol is involved in a controversy, these Pepega Knights will protect them no matter what, as if they are their idol's friends. In reality, these idols couldn't care less about them. These Pepegas are also a master of mental gymnastics.",
        330, 100500, 750, 10, ["Donate", "Permaban", "Defend"],
        browserRuntime.getURL("images/pepegas/6_Pepega-Knight.png")),

    new PepegaType(7, [2, 2, 4], "Pepega Hunter", "Pepega Hunters are deadly snipers who can find anyone easily no matter where one is. They enjoy listening to loud, deafening music and remixes, and it is their duty to make their victims hear it as well.", 
        320, 100500, 800, 10, ["Snipe", "Remix", "Stream Save"],
        browserRuntime.getURL("images/pepegas/7_Pepega-Hunter.png")),

    new PepegaType(8, [2, 2, 5], "Pepega Wizard", "This Pepega is very fond of Time Travel and a bit of risque dancing. It has a habit of screaming its own name.", 
        340, 100500, 700, 10, ["Old Age", "Thrust", "Time Compression"],
        browserRuntime.getURL("images/pepegas/8_Pepega-Wizard.png")),


    new PepegaType(9, [], "Joyga", "These Pepegas are very young and have an awfully low standard for entertainment. They are easily attracted to Pepegas who are loud and obnoxious.", 
        4, 80, 14, 10, ["React", "Poggers", "Yeet"],
        browserRuntime.getURL("images/pepegas/9_Joyga.png")),

    new PepegaType(10, [], "Bitga", "This Pepega has as much IQ as the number of pixels it has.", 
        6, 120, 13, 10, ["Backseat", "Pixelate", "Violence"],
        browserRuntime.getURL("images/pepegas/10_Bitga.png")),

    new PepegaType(11, [], "KKoga", "KKogas are well-known for their obsession with guns and unhealthy food. It is living the Pepega dream.", 
        5, 100, 15, 10, ["Shoot", "Guitar Time", "Pray"],
        browserRuntime.getURL("images/pepegas/11_KKoga.png")),

    new PepegaType(12, [9, 10, 11], "Broga", "These Pepegas love the use of platforms that connect to the other side, and if anyone is standing in their way, Brogas are capable of taking them down confidently with ease.", 
        57, 6840, 75, 10, ["Cross", "Review", "Swedish"],
        browserRuntime.getURL("images/pepegas/12_Broga.png")),

    new PepegaType(13, [12, 12, 12, 3], "Orange Pepega", "Orange Pepegas are carpenters who specializes in walls. They are capable of building multiple kinds of walls, no matter how high, and it is their obligation to make sure no one is able to go through those walls.", 
        560, 168000, 850, 12, ["Construct Wall", "Weebs Out", "Electrocute"],
        browserRuntime.getURL("images/pepegas/13_Orange-Pepega.png")),


    new PepegaType(14, [], "Fastga", "Contrary to popular belief, these Pepegas love listening to violent rap music.", 
        5, 100, 20, 7, ["Sprint", "Meow", "Redesign"],
        browserRuntime.getURL("images/pepegas/14_Fastga.png")),

    new PepegaType(15, [14, 14, 14], "Red Fastga", "This Pepega keeps asking you if you know the destination.", 
        55, 6600, 75, 8, ["Click", "Show the Way", "Raid"],
        browserRuntime.getURL("images/pepegas/15_Red-Fastga.png")),

    new PepegaType(16, [], "Pastorga", "This pepega tells you that by simply catching it, it has won.",
        15, 900, 40, 9, ["Show", "Click 5 Times", "VI VON"],
        browserRuntime.getURL("images/pepegas/16_Pastorga.png")),

    new PepegaType(17, [15, 16], "Supa Pepega", "This Pepega is on a mission to defeat and destroy the Pepega Mafia.", 
        225, 67500, 500, 8, ["Supa Kicker", "Supa Striker", "MOVIE"],
        browserRuntime.getURL("images/pepegas/17_Supa-Pepega.png")),

    new PepegaType(18, [17, 17, 17], "Pepega U", "This Pepega dedicates its life to avenging its Pepega brother that was assassinated by who it thinks are the Pepega Mafia. It is a master of Martial Arts and flying without wings. They call it... Pepega U!", 
        2040, 1224000, 5000, 9, ["Ugandan Kiss", "Avenge", "WARRIOR"],
        browserRuntime.getURL("images/pepegas/18_Pepega-U.png")),


    new PepegaType(19, [], "Baby Pepega", "Aww, it's so cute! So stupidly cute! :3", 
        20, 1200, 5, 5, ["Cry", "Time Out", "Complain"],
        browserRuntime.getURL("images/pepegas/19_Baby-Pepega.png")),

    new PepegaType(20, [4, 19], "Peppahga", "In spite of its appearance, it is not a rat, but is in fact just another Pepega.", 
        85, 27000, 100, 5, ["Bark", "Squeak", "Run"],
        browserRuntime.getURL("images/pepegas/20_Peppahga.png")),

        ///

    new PepegaType(21, [], "Kappaga", "An incredibly popular and beloved Pepega... Kapp.", 
        10, 200, 15, 10, ["Sarcasm", "Irony", "Golden"],
        browserRuntime.getURL("images/pepegas/21_Kappaga.png")),

    new PepegaType(22, [], "Weebga", "These Pepegas are obsessed with children's cartoons to the point where they will dress up as their favorite character, and in some cases, even fall in love with a character, not realizing that these are mere drawings with no actual feeling or thought.", 
        7, 140, 20, 10, ["AYAYA", "Cute Dance", "Cute Costume"],
        browserRuntime.getURL("images/pepegas/22_Weebga.png")),

    new PepegaType(23, [], "Pokketga", "", 
        4, 80, 13, 10, ["Trigger", "Whine", "Rage"],
        browserRuntime.getURL("images/pepegas/23_Pokketga.png")),

    new PepegaType(24, [], "Mald Pepega", "This Pepega somehow manages to not only be mald, but also bald at the same time.", 
        8, 160, 30, 10, ["Quit", "Boo", "Infect with Maldness"],
        browserRuntime.getURL("images/pepegas/24_Mald-Pepega.png")),

    new PepegaType(25, [21, 9, 4], "Ninjaga", "This Pepega keeps telling you to click the Subscribe button, but also making sure you don't smash it.", 
        70, 22500, 250, 10, ["Smash", "Subscribe", "Free 1 Month Trial"],
        browserRuntime.getURL("images/pepegas/25_Ninjaga.png")),

    new PepegaType(26, [21, 11, 4], "GreekGaX", "This Pepega has a habit of sticking to other Pepegas in hopes of stealing their IQ. It enjoys eating excessive amounts of food even though it has swore, many times in the past, to do the complete opposite.", 
        70, 22500, 310, 10, ["Send to Vacation City", "Explode", "Eat"],
        browserRuntime.getURL("images/pepegas/26_GreekGaX.png")),

    new PepegaType(27, [21, 10, 3], "Tylerga", "Tylergas are recognized for their intense, boisterous screaming and desk slamming. It has weirdly big and disproportionate biceps, and its head looks like a marshmallow. They were tormented in the past by the nefarious Pepegas known as Tannergas.", 
        80, 24000, 275, 10, ["SCREAM", "SLAM KEYBOARD", "OUTBREAK"],
        browserRuntime.getURL("images/pepegas/27_Tylerga.png")),

    new PepegaType(28, [21, 23, 23, 3], "Doctor Pepega", "The three time, back to back to back, consecutive years, 1982-1976 blockbuster Pepega. For some reason, you can see through its body.", 
        80, 24000, 360, 10, ["Two-Time", "Invisibility", "Punk Kids"],
        browserRuntime.getURL("images/pepegas/30_Doctor-Pepega.png")),

    new PepegaType(29, [21, 24, 5], "Forsenga", "A professional children's card player that gets mad and bald when it loses. Although, nowadays, it just plays cartoon drag-and-drop games that require no skill whatsoever. Perhaps, this way, it can just blame its bad luck when it loses, instead of its lack of skill.", 
        90, 25500, 335, 10, ["Steal Posture", "Bottom Snus", "Google"],
        browserRuntime.getURL("images/pepegas/29_Forsenga.png")),

    new PepegaType(30, [21, 22, 5], "Triga", "Trigas are very popular for their immense skill in the game called Maldio. They are considered to be the best at this genre, and they don't mald very easily unlike some other Pepegas.", 
        90, 25500, 290, 10, ["World Record", "Speedrun", "7"],
        browserRuntime.getURL("images/pepegas/28_Triga.png")),


    new PepegaType(31, [], "Pridega", "", 
        5, 50, 9, 10, ["Attack"],
        browserRuntime.getURL("images/pepegas/31_Pridega.png")),

    new PepegaType(32, [], "200 IQ Pepega", "This Pepega loves telling other Pepegas about their favorite cartoon show in a very condescending manner. It then proceeds to tell them that they are not smart enough to understand the show anyway.", 
        12, 120, 30, 9, ["Freak Out", "Superiority Complex", "Snob"],
        browserRuntime.getURL("images/pepegas/32_200-IQ-Pepega.png")),

    new PepegaType(33, [32, 32, 5], "400 IQ Pepega", "No one knows why, but these Pepegas keep yelling the word \"Pickle\" and a guy named \"Richard\".", 
        100, 30000, 70, 10, ["Yell", "Outsmart", "Destroy"],
        browserRuntime.getURL("images/pepegas/33_400-IQ-Pepega.png")),

    new PepegaType(34, [33, 33, 33, 31], "Amazga", "One of the smartest Pepegas known to Pepegakind. Legend has it that this Pepega has already beaten this game.", 
        1000, 600000, 750, 10, ["Ragnaros", "Blindfold", "1st Place"],
        browserRuntime.getURL("images/pepegas/34_Amazga.png")),

    new PepegaType(35, [34, 34], "Scamaz", "SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE THERE'S NOTHING YOU CAN DO HAHAHAHAHAHAHAHAHAHAHAHAHAHA", 
        -666, -100000, 5000, 100, ["Curse", "Possess", "Backstab"],
        browserRuntime.getURL("images/pepegas/35_Scamaz.png")),


    new PepegaType(36, [], "Handsomega", "A very attractive and charming Pepega. They love going to the gym and wrestling with their fellow Handsomegas.", 
        6, 720, 10, 10, ["Charm", "Lift", "Work Out"],
        browserRuntime.getURL("images/pepegas/36_Handsomega.png")),

    new PepegaType(37, [31, 36, 3], "Billiga", "Billiga is highly respected for its service in the Pepega Armed Forces. It is a tough, but loving Pepega, and it only wants what's best for you. After its retirement, it has become a prominent figure in the wresling community.", 
        55, 9900, 300, 10, ["Wrestle", "8 Inches", "Kiss"],
        browserRuntime.getURL("images/pepegas/37_Billiga.png")),

    new PepegaType(38, [31, 36, 5], "Vanga", "Vangas are infamous for owning a dungeon where they party with their friends. They are also commonly referred to as Leathergas, due to the outfit that they wear.", 
        60, 9900, 275, 10, ["300 Bucks", "Mermaid Splash", "Leatherwhip"],
        browserRuntime.getURL("images/pepegas/38_Vanga.png")),

    new PepegaType(39, [31, 36, 4], "Rigardo", "An expert in what is known as romantic dancing, Rigardo can dance to almost every type of music.", 
        50, 9900, 325, 10, ["Ram", "Hump", "Lunge"],
        browserRuntime.getURL("images/pepegas/39_Rigardo.png")),

    new PepegaType(40, [37, 38, 39], "Gachiga", "Gachigas are considered to be the strongest and simultaneously the most beautiful Pepegas known to Pepegakind. It greatly excels in performance art, music, and bodybuilding.", 
        520, 156000, 3000, 12, ["Manly Rave", "Thunder Remix", "Strength"],
        browserRuntime.getURL("images/pepegas/40_Gachiga.png")),

    new PepegaType(41, [40, 40, 40], "Hypergachiga", "A Pepega Abomination. What have you done?", 
        4750, 2850000, 30000, 15, ["Annihilate", "Obliterate", "DEATH"],
        browserRuntime.getURL("images/pepegas/41_Hypergachiga.png")),


    new PepegaType(42, [], "Silver Pepega", "", 
        3500, 2400000, 5000, 15, ["Shout", "Push", "Scream"],
        browserRuntime.getURL("images/pepegas/42_Silver-Pepega.png")),

    new PepegaType(43, [], "Golden Pepega", "", 
        12000, 14400000, 40000, 20, ["Shout", "Push", "Cheat"],
        browserRuntime.getURL("images/pepegas/43_Golden-Pepega.png")),


    new PepegaType(44, [], "Repliga", "", 
        -75, -25000, -100, 10, ["Torment"],
        browserRuntime.getURL("images/pepegas/44_Repliga.png")),

    new PepegaType(45, [], "Luciga", "", 
        133, -3160000, 300, 15, ["Torment"],
        browserRuntime.getURL("images/pepegas/45_Luciga.png")),
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
    new Category(0, false, [],
        [
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
            new Option(pepegaTypes[42], 0.1),
            new Option(pepegaTypes[43], 0.01),
            new Option(pepegaTypes[44], 0.02),
            new Option(pepegaTypes[45], 0.002)
        ]
    ),
    new Category(1, false,
        [
            new Site("youtube"),
            new Site("reddit"),
            new Site("twitter"),
            new Site("instagram"),
            new Site("facebook")
        ],
        [
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
            new Option(pepegaTypes[42], 0.1),
            new Option(pepegaTypes[43], 0.01)
        ]
    ),
    new Category(2, false,
        [
            new Site("twitch")
        ],
        [
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 3),
            new Option(pepegaTypes[4], 7),
            new Option(pepegaTypes[5], 3),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[9], 6),
            new Option(pepegaTypes[10], 5),
            new Option(pepegaTypes[14], 5),
            new Option(pepegaTypes[15], 0.5),
            new Option(pepegaTypes[16], 2.5),
            new Option(pepegaTypes[19], 1.1989),
            new Option(pepegaTypes[21], 8),
            new Option(pepegaTypes[22], 7.5),
            new Option(pepegaTypes[23], 7.5),
            new Option(pepegaTypes[24], 5),
            new Option(pepegaTypes[25], 0.2),
            new Option(pepegaTypes[26], 0.2),
            new Option(pepegaTypes[27], 0.2),
            new Option(pepegaTypes[28], 0.2),
            new Option(pepegaTypes[29], 0.2),
            new Option(pepegaTypes[30], 0.2),
            new Option(pepegaTypes[32], 5),
            new Option(pepegaTypes[36], 2.55),
            new Option(pepegaTypes[37], 0.25),
            new Option(pepegaTypes[38], 0.25),
            new Option(pepegaTypes[39], 0.25),
            new Option(pepegaTypes[42], 0.1),
            new Option(pepegaTypes[43], 0.01)
        ]
    ),
    new Category(3, false,
        [
            new Site("wikipedia"),
            new Site("wikihow"),
            new Site("quora"),
            new Site("google")
        ],
        [
            new Option(pepegaTypes[1], 1.5),
            new Option(pepegaTypes[2], 0.5),
            new Option(pepegaTypes[3], 3),
            new Option(pepegaTypes[4], 3),
            new Option(pepegaTypes[5], 7),
            new Option(pepegaTypes[6], 0.1),
            new Option(pepegaTypes[7], 0.1),
            new Option(pepegaTypes[8], 0.1),
            new Option(pepegaTypes[10], 8.5),
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
            new Option(pepegaTypes[42], 0.1),
            new Option(pepegaTypes[43], 0.01)
        ]
    ),
    new Category(4, false,
        [
            new Site("xvideos"),
            new Site("porn"),
            new Site("xhamster"),
            new Site("xnxx"),
            new Site("youjizz"),
            new Site("motherless"),
            new Site("sex"),
            new Site("fuck"),
            new Site("livejasmin"),
            new Site("4chan")
        ],
        [
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
            new Option(pepegaTypes[42], 0.1),
            new Option(pepegaTypes[43], 0.01)
        ]
    ),
    new Category(5, false,
        [
            new Site("hentai"),
            new Site("fakku"),
            new Site("osu"),
            new Site("anime"),
            new Site("crunchyroll"),
            new Site("funimation"),
            new Site("manga"),
            new Site("4channel")
        ],
        [
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
            new Option(pepegaTypes[42], 0.1),
            new Option(pepegaTypes[43], 0.01),
        ]
    ),
    new Category(6, true,
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
var totalPepegaPower = 0;

var player = {
    iqCount: 0,
    pepegas: [],
    armyName: defaultArmyName,
    pepegaSlots: startingPlayerPepegaSlots,
    catchCount: 0
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

    console.log(result.enableRankUpRandomTutorial + " is rank up reuslt");
    if(result.enableRankUpRandomTutorial != null){
        tutorial.enableRankUpRandomTutorial = result.enableRankUpRandomTutorial;
    }

    if(result.enableDeadPepegaRandomTutorial != null){
        tutorial.enableDeadPepegaRandomTutorial = result.enableDeadPepegaRandomTutorial;
    }
});

function resetTutorial(){
    browserStorage.set({"tutorialPhase": null}, function() {
    });
    browserStorage.set({"randomTutorialPhase": null}, function() {
    });
    browserStorage.set({"enableUniquePepegaRandomTutorial": null}, function() {
    });
    browserStorage.set({"enableRankUpRandomTutorial": null}, function() {
    });
    browserStorage.set({"enableDeadPepegaRandomTutorial": null}, function() {
    });
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
    analyzeRank(false);
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
        analyzeUniquePepegaIqpsMultiplier();
        //analyzeBranch();
    }
});

browserStorage.get(["playerCatchCount"], function(result) {
    if(result.playerCatchCount != null){
        player.catchCount = result.playerCatchCount;
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
        updateIconFromEncounterMode();
    }
});

browserStorage.get(["settingsFilteredSites", "settingsEnableSounds", 
"settingsEnablePepegaCatchReleaseNotifications", "settingsEnableRankUpNotifications", "settingsEnablePepegaHealNotifications", 
"settingsRecordOrigin", "settingsEncounterMode"], function(result) {
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

    if(result.settingsEnablePepegaHealNotifications != null){
        settings.enablePepegaHealNotifications = result.settingsEnablePepegaHealNotifications;
    }

    if(result.settingsRecordOrigin != null){
        settings.recordOrigin = result.settingsRecordOrigin;
    }

    if(result.settingsEncounterMode != null){
        settings.encounterMode = result.settingsEncounterMode;
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
    browserStorage.set({"tutorialPhase": tutorial.phase}, function() {
    });

    updateTutorialPhasePopupDisplay();
}
function updateRandomTutorialPhase(randomTutorialPhase){
    tutorial.randomPhase += "_" + randomTutorialPhase + "_";

    browserStorage.set({"randomTutorialPhase": tutorial.randomPhase}, function() {
    });

    console.log("random tutorial phase: " + tutorial.randomPhase);

    if(tutorial.randomPhase.includes("uniquePepega")){
        tutorial.enableUniquePepegaRandomTutorial = false;
        browserStorage.set({"enableUniquePepegaRandomTutorial": tutorial.enableUniquePepegaRandomTutorial}, function() {
        });
    } else if(tutorial.randomPhase.includes("rankUp")){
        tutorial.enableRankUpRandomTutorial = false;
        console.log("saving rank up");
        browserStorage.set({"enableRankUpRandomTutorial": tutorial.enableRankUpRandomTutorial}, function() {
        });
    } else if(tutorial.randomPhase.includes("deadPepega")){
        tutorial.enableDeadPepegaRandomTutorial = false;
        browserStorage.set({"enableDeadPepegaRandomTutorial": tutorial.enableDeadPepegaRandomTutorial}, function() {
        });
    }

    updateRandomTutorialPopupDisplay();
}
function replaceRandomTutorialPhase(randomTutorialPhase){
    tutorial.randomPhase = randomTutorialPhase;

    browserStorage.set({"randomTutorialPhase": tutorial.randomPhase}, function() {
    });

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

    analyzeUniquePepegaIqpsMultiplier();
    //analyzeBranch();
    updatePlayerPepegasPopupDisplay();

    if(save){
        browserStorage.set({playerPepegas: player.pepegas}, function() {
        });
    }
}

function updatePlayerPepegaSlots(newPepegaSlots, save = true){
    player.pepegaSlots = newPepegaSlots;

    analyzePepegaSlotCost();

    updatePlayerPepegaSlotsPopupDisplay();

    if(save){
        browserStorage.set({playerPepegaSlots: player.pepegaSlots}, function() {
        });
    }
}

function analyzePepegaSlotCost(){
    if(player.pepegaSlots > 4){
        pepegaSlotCost = Math.round(Math.pow(player.pepegaSlots, 6));
    }else{
        pepegaSlotCost = 50 + (player.pepegaSlots * 50);
    }
}

function analyzeUniquePepegaIqpsMultiplier(){
    var uniquePepegas = [...new Set(player.pepegas.map(pepega => pepega.pepegaType.id))];
    uniquePepegaIqpsMultiplier = 1 + ((uniquePepegas.length-1) * iqpsMultiplierForEachUniquePepega);

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
    console.log("Catch count: " + player.catchCount + " < " + minimumCatchCountForMorePepegas);
    if(!category.isSpecial){
        if(player.catchCount < minimumCatchCountForMorePepegas){
            var pepegaType = pepegaTypes[0];
            if(player.catchCount == 1){
                var roll = Math.floor(Math.random() * (3));
                if(roll == 0){
                    pepegaType = pepegaTypes[3];
                    
                }else if(roll == 1){
                    pepegaType = pepegaTypes[4];
                }else{
                    pepegaType = pepegaTypes[5];
                }
            }
            return new Pepega(pepegaType, "", "", false, rollPepegaPower(pepegaType.basePower), 1, true, null);
        } else if(player.catchCount == 5){
            return new Pepega(pepegaTypes[24], "", "", false, rollPepegaPower(pepegaTypes[24].basePower), 1, true, null);
        } else if(player.catchCount < 19 && player.catchCount % 3 == 0){
            return new Pepega(pepegaTypes[0], "", "", false, rollPepegaPower(pepegaTypes[0].basePower), 1, true, null);
        }
    }

    var roll = (Math.random() * (100.0));
    var rollCeiling = 0;
    var index, length;
    console.log("Wild Pepega Roll: " + roll); 
    for (index = 0, length = category.options.length; index < length; ++index) {
        var probability = category.options[index].probability;
        if(probability > 0){
            rollCeiling += probability;
            if(roll <= rollCeiling){
                var pepegaType = pepegaTypes[category.options[index].pepegaType.id];
                var wildPepega = new Pepega(pepegaType, "", "", false, rollPepegaPower(pepegaType.basePower), 1, true, null);
                return wildPepega;
            }
        }
    }

    return new Pepega(pepegaTypes[0], "", "", false, rollPepegaPower(pepegaTypes[0].basePower), 1, true, null);
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
	var index, length;
    for (index = 0, length = settings.filteredSites.length; index < length; ++index) {
        if(settings.filteredSites[index] && settings.filteredSites[index] != "" && 
            (location.hostname.includes(settings.filteredSites[index]) || settings.filteredSites[index].includes(location.hostname))){
            browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIconDisabled128.png")});
            return true;
		}
    }
    updateIconFromEncounterMode();
	return false;
}

function updateIconFromEncounterMode(){
    if(settings.encounterMode.multiplier == 100){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIcon128.png")});
    }else if(settings.encounterMode.multiplier == 0){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepegaIconDisabled128.png")});
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

    updatePlayerIqCount(playerPepega.pepegaType.iqReleasePrice * playerPepega.level);

    notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", playerPepega.pepegaType.name + " released!", playerPepega.pepegaType.name + " was released back into " + 
    playerPepega.origin + "! You got " + (playerPepega.pepegaType.iqReleasePrice * playerPepega.level)  + " IQ.", playerPepega.pepegaType.imageUrl);

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

function fightWildPepega(wildPepega){
    var wildPepegaRemainingPower = wildPepega.power * wildPepega.level;
    var results = new Object();
    results.won = false;
    results.casualties = 0;

    wildPepegaRemainingPower -= rank.basePower;
    if(wildPepegaRemainingPower <= 0){
        results.won = true;
        return results;
    }

    for(var i = 0; i < player.pepegas.length; i++){
        var playerPepega = player.pepegas[i];
        var playerPepegaPower = playerPepega.power * playerPepega.level;
        var playerPepegaRolledPower = (playerPepegaPower*((Math.random() * (1.3 - 0.7)) + 0.7));

        console.log(playerPepega.pepegaType.name + " is fighting " + wildPepega.pepegaType.name);
        console.log(playerPepega.pepegaType.name + " has " + playerPepegaPower + " power, with the roll power as " + playerPepegaRolledPower + ", while " + wildPepega.pepegaType.name + " has " + wildPepegaRemainingPower + " remaining power.");
        
        if(playerPepegaRolledPower < wildPepegaRemainingPower){
            wildPepegaRemainingPower -= playerPepegaPower;
            setPepegaAlive(playerPepega, false);
            results.casualties++;
            playerPepega.timeBeforeRecovery = new Date().getTime() + (playerPepega.power * playerPepega.level * multiplierBeforePepegaRecovers);
        
            if(tutorial.phase != "disabled" && tutorial.enableDeadPepegaRandomTutorial){
                updateRandomTutorialPhase("deadPepega");
            }
        }else{
            browserStorage.set({playerPepegas: player.pepegas}, function() {
            });
            results.won = true;
        }
    }
    browserStorage.set({playerPepegas: player.pepegas}, function() {
    });
    return results;
}

const AddingPlayerPepegaResultEnum = {"successSingle":1, "successLeveledUp":2, "successFusioned":2, "noPepegaSlots":3}
const CombiningPlayerPepegaResultEnum = {"combined":1, "noCombination":2, "noPepegaSlots":3}

function catchWildPepega(wildPepegaTypeId, wildPepegaPower, location){
    var wildPepega = new Pepega(pepegaTypes[wildPepegaTypeId], "", "", false, wildPepegaPower, 1, true, null);

    var fightResults = fightWildPepega(wildPepega);

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

        player.catchCount++;
        browserStorage.set({playerCatchCount: player.catchCount}, function() {
        });

        if(tutorial.phase == "catch"){
            updateTutorialPhase("catchDone");
        }

        playSound(pepegaCatchSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successLeveledUp){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " is now level " + pepegaAdd[1].level + "!",
            "Your " + pepegaAdd[1].pepegaType.name + " leveled up!\nIt is now level " + pepegaAdd[1].level + "!\nPog!",
            pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == "levelUp"){
            updateTutorialPhase("levelUpDone");
        }

        playSound(pepegaLevelSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successFusioned){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You fusion summoned " + getArticle() + " " + pepegaAdd[1].pepegaType.name + "!",
            wildPepega.pepegaType.name + " fusioned with other Pepegas into " + article + " " + pepegaAdd[1].pepegaType.name + "!\nPogChamp!",
            pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == "fusion"){
            updateTutorialPhase("fusionDone");
        }

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
        player.pepegas.sort(function(a, b){return a.power - b.power});
        if(pepega.alive){
            totalIqps += pepega.pepegaType.iqps * pepega.level;
            totalPepegaPower += pepega.power * pepega.level;
        }

        if(displayForPopup){
            analyzeUniquePepegaIqpsMultiplier();
            //analyzeBranch();
            updatePlayerPepegasPopupDisplay();
        }

        if(save){
            browserStorage.set({playerPepegas: player.pepegas}, function() {
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
            console.log("is power: " + player.pepegas[i].power + " with id: " + player.pepegas[i].id);
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

        console.log("power of leveling up: " + levelingPlayerPepegaTotalPower + " / " + multiplesBeforeLevelUp);

        var newPepegaLevel = addedPepega.level + 1;
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
                tempPlayerPepega.power = player.pepegas[j].power;
                tempPlayerPepegas.push(tempPlayerPepega);
            }
        }
        if(addedPepega != null){
            var tempPlayerPepega = new Object();
            tempPlayerPepega.isTaken = false;
            tempPlayerPepega.id = addedPepega.id;
            tempPlayerPepega.typeId = addedPepega.pepegaType.id;
            tempPlayerPepega.power = parseFloat(addedPepega.power);
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
        
        var fusionedPepega = new Pepega(fusionedPepegaType, addedPepega.origin, addedPepega.date, false, 
            rollPepegaPower(fusionedPepegaType.basePower), 1, true, null);
        
        var pepegaAdd = addPlayerPepega(fusionedPepega, true);

        return [CombiningPlayerPepegaResultEnum.combined, pepegaAdd[1]];
    }else{
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }
}

function updateSettings(filteredSitesText, enableSounds, enablePepegaCatchReleaseNotifications, enableRankUpNotifications, enablePepegaHealNotifications, recordOrigin){
    settings.filteredSites = filteredSitesText.split('\n');
    settings.enableSounds = enableSounds;
    settings.enablePepegaCatchReleaseNotifications = enablePepegaCatchReleaseNotifications;
    settings.enableRankUpNotifications = enableRankUpNotifications;
    settings.enablePepegaHealNotifications = enablePepegaHealNotifications;
    settings.recordOrigin = recordOrigin;

    console.log("origin: " + settings.recordOrigin);

    updateSettingsPopupDisplay();

    browserStorage.set({
        settingsFilteredSites: settings.filteredSites, 
        settingsEnableSounds: settings.enableSounds, 
        settingsEnablePepegaCatchReleaseNotifications: settings.enablePepegaCatchReleaseNotifications, 
        settingsEnableRankUpNotifications: settings.enableRankUpNotifications, 
        settingsEnablePepegaHealNotifications: settings.enablePepegaHealNotifications,
        settingsRecordOrigin: settings.recordOrigin
    }, function() {
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

function updateSettingsEncounterMode(){
    var newEncounterMode = encounterModes[0];
    if(settings.encounterMode.id < encounterModes.length-1){
        newEncounterMode = encounterModes[settings.encounterMode.id + 1];
    }
    settings.encounterMode = newEncounterMode;

    updateSettingsEncounterModePopupDisplay();
    updateIconFromEncounterMode();

    browserStorage.set({settingsEncounterMode: settings.encounterMode}, function() {
    });
}

function updatePlayerArmyName(playerArmyName){
    if(playerArmyName == "" || !playerArmyName.replace(/\s/g, '').length || !playerArmyName){
        player.armyName = defaultArmyName;
    }else{
        player.armyName = stripHtmlTags(playerArmyName).substring(0,maxArmyNameLength);
    }

    updatePlayerArmyNamePopupDisplay();

    browserStorage.set({playerArmyName: player.armyName}, function() {
    });
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
                browserStorage.set({playerPepegas: player.pepegas}, function() {
                });
            updatePlayerPepegasPopupDisplay();
        }
    }
}, 500);

var previousUpdateIqCountTime = new Date().getTime();
var interval = setInterval(function() {
    var currentTime = new Date().getTime();
    if(currentTime - previousUpdateIqCountTime >= updateIqCountMillisecondInterval){
        console.log("iq increase: " + totalIqps * rank.iqpsMultiplier + " because total iqps is: " + totalIqps + " and mult is : " + rank.iqpsMultiplier);
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
    
    browserStorage.set({playerIqCount: player.iqCount}, function() {
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
                rankDescription, browserRuntime.getURL("images/rank-up.png"));

                if(tutorial.phase != "disabled" && tutorial.enableRankUpRandomTutorial){
                    updateRandomTutorialPhase("rankUp");
                }
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
        console.log("rank multiplier: " + Math.round((totalIqps * rank.iqpsMultiplier) * uniquePepegaIqpsMultiplier));
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
function updateTutorialPhasePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": "tutorial-phase-updated", "tutorialPhase": tutorial.phase});
    }
}
function updateRandomTutorialPopupDisplay(){
    if(popup.isOpened){
        console.log("random phase?: " + tutorial.randomPhase);
        browserRuntime.sendMessage({"message": "show-random-tutorial", "randomTutorialPhase": tutorial.randomPhase});
    }
}

browserRuntime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "get-wild-pepega"){
            sendResponse({ isSiteFiltered: isSiteFiltered(request.location), wildPepega: getWildPepega(request.location) });
		}else if(request.message == "catch-wild-pepega"){
			catchWildPepega(request.wildPepegaTypeId, request.wildPepegaPower, request.location);
		}else if(request.message == "update-all-popup-displays"){
			updateAllPopupDisplays();
		}else if(request.message == "release-player-pepega"){
			releasePlayerPepega(request.playerPepegaId);
		}else if(request.message == "update-settings"){
			updateSettings(request.filteredSitesText, request.enableSounds, 
				request.enablePepegaCatchReleaseNotifications, request.enableRankUpNotifications, request.enablePepegaHealNotifications, request.recordOrigin);
		}else if(request.message == "update-settings-encounter-mode"){
			updateSettingsEncounterMode();
		}else if(request.message == "update-player-army-name"){
			updatePlayerArmyName(request.playerArmyName);
		}else if(request.message == "buy-pepega-slot"){
			buyPepegaSlot();
		}else if(request.message == "answer-tutorial-ask"){
            answerTutorialAsk(request.tutorialAnswer);
        }else if(request.message == "update-tutorial-phase"){
            updateTutorialPhase(request.tutorialPhase);
        }else if(request.message == "update-random-tutorial-phase"){
            updateRandomTutorialPhase(request.randomTutorialPhase);
        }else if(request.message == "replace-random-tutorial-phase"){
            replaceRandomTutorialPhase(request.randomTutorialPhase);
        }else if(request.message == "reset-tutorial"){
            resetTutorial();
        }else if(request.message == "heal-player-pepega"){
            healPlayerPepega(request.playerPepegaId, request.healCost);
        }
	}
);

browser.tabs.onActivated.addListener(function(tab) {
	browser.tabs.getSelected(function(tab) {
		var location = new Object();
		location.hostname = tab.url;
		isSiteFiltered(location);
	});
});