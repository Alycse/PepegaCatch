////Game constants////
const maxPlayerIqCount = 9999999999999999;
const maxPepegaSlots = 100;
const updateIqCountMillisecondInterval = 1000;
const defaultPepegaOrigin = "the internet";
const defaultArmyName = "Click here to change your Pepega Army's name";
const multiplesBeforeLevelUp = 3;
const maxPepegaLevel = 3;
const startingPlayerPepegaSlots = 5;
const maxArmyNameLength = 64;
const iqpsMultiplierForEachUniquePepega = 0.2;
const baseEncounterRate = 60;
const minimumRankForRiseUp = 12;
//Used by a special event that determines whether the player can encounter more powerful Pepegas
const minimumCatchCountForMorePepegas = 5;
const multiplierBeforePepegaRecovers = 2100;
//The percentage of how much IQ a player gets when the player is "idle"
const idleIqMultiplier = 0.5;
//How long, in seconds, does it take for the player to be considered "idle"
const idleTime = 1800;
//Determine's whether the player is considered a "beginner" or not based on the player's catch count.
const beginnerCatchCount = 10;
//The regular time before another Pepega can spawn on a website
const minRegularTimeBeforeNextWildPepegaSpawn = 3000;
const maxRegularTimeBeforeNextWildPepegaSpawn = 6000;
//If the player is a beginner, this is the time before another Pepega can spawn on a website
const beginnerTimeBeforeNextWildPepegaSpawn = 1500;
////////

var browser = chrome;
var browserRuntime = browser.runtime;
var browserStorage = browser.storage.local;
var browserExtension = browser.extension;

////Sounds////
var haruyokoiSound = new Audio(browserRuntime.getURL("sounds/hanban-yumimatsutoya-haruyokoi.ogg"));
haruyokoiSound.volume = 0.3;
//Original: https://www.youtube.com/watch?v=R-gYO7UvtvM

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
////////

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

//

var popup = {
    //Checks if the player has the extension popup opened
	get isOpened (){
		return browserExtension.getViews({ type: "popup" }).length > 0;
	}
}

//Changes the extension icon based on the user's currently active tab
browser.tabs.onActivated.addListener(function() {
	updateIconFromSelectedTab();
});
function updateIconFromSelectedTab(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        if(activeTab){
            updateIcon(activeTab.url);
        }
    });
}

class PepegaType {
    constructor(id, fusionIds, name, description, iqps, iqReleasePriceMultiplier, basePower, healCostMultiplier, attacks, imageUrl) {
        //A unique identifier for this Pepega Type
        this.id = id;
        //Ids of other Pepega types that need to be fused in order to get this Pepega type
        this.fusionIds = fusionIds;
        //The name of this Pepega type
        this.name = name;
        //The description of this Pepega type. Shown when the player hovers over the Pepega
        this.description = description;
        //The multiplier for how much IQ the player will get when a Pepega of this type is released
        //This is multiplied by the Pepega Type's IQ/s and the Pepega's level
        this.iqReleasePriceMultiplier = iqReleasePriceMultiplier;
        //States how much IQ per second Pepegas of this type generate for the player
        this.iqps = iqps;
        //The base power of this Pepeega type. This is multiplied in order to get the Pepega's actual power
        this.basePower = basePower;
        //How much IQ the player has to spend in order to heal this Pepega
        this.healCostMultiplier = healCostMultiplier;
        //The nbames of the attacks that can be used by this Pepega. This is just flavor. It doesn't affect gameplay in any way
        this.attacks = attacks;
        //The path to this Pepega's image
        this.imageUrl = imageUrl;
    }
}

class Pepega {
    constructor(pepegaType, origin, date, fusioned, power, level, alive, timeBeforeRecovery) {
        //A unique identifier for this Pepega
        this.id = new Date().getTime();
        //The type of this Pepega
        this.pepegaType = pepegaType;
        //Where this Pepega was caught. Shown when the player hovers over the Pepega
        this.origin = origin;
        //When this Pepega was caught. Shown when the player hovers over the Pepega
        this.date = date;
        //States whether this Pepega was fused or if it was caught in the wild
        this.fusioned = fusioned;
        //The power of this Pepega
        this.power = power;
        //The level of this Pepega
        this.level = level;
        //States whether this Pepega is currently alive or not
        this.alive = alive;
        //States when this Pepega will be ressurected
        this.timeBeforeRecovery = timeBeforeRecovery;
    }

    //Sets a Pepega's "alive" state
    setAlive(alive, save = true) {
        if(!this.alive && alive){
            totalIqps += this.pepegaType.iqps * this.level;
            totalPepegaPower += this.power * this.level;
            this.alive = alive;
        }else if (this.alive && !alive){
            totalIqps -= this.pepegaType.iqps * this.level;
            totalPepegaPower -= this.power * this.level;
            this.alive = alive;
        }

        if(save){
            browserStorage.set({playerPepegas: player.pepegas});
        }
    }
}

//A Pepega Type option and its probability of spawning. Used by categories
class Option {
    constructor(pepegaType, probability) {
        this.pepegaType = pepegaType;
        this.probability = probability;
    }
}

//A website
class Site {
    constructor(hostname) {
        //Hostname of the website
        this.hostname = hostname;
    }
}

//Site categories are used when rolling for a Pepega Type
//to determine which set of Pepegas can be found or rolled in the sites in that category
class Category {
    constructor(id, isSpecial, sites, options) {
        //Unique identifier for the category
        this.id = id;
        //If the site category is special, then scripted events and scripted pepega spawning are ignored
        this.isSpecial = isSpecial;
        //The sites in this category
        this.sites = sites;
        //The possible Pepega Types that can be found in the sites in this category, as well as their probability of spawning
        this.options = options;
    }
}

//The player's rank
class Rank {
    constructor(id, titleArticle, title, description, functionRequirement, requirementDescription, iqpsMultiplier, basePower) {
        //Unique identifier for the rank
        this.id = id;
        //The article used (a, the, or none) for the rank title. e.g. "The " + "Pepega King"
        this.titleArticle = titleArticle;
        //The title of the rank. Displayed in the home screen
        this.title = title;
        //Description of the rank. Shows up when the user hovers over the rank title
        this.description = description;
        //The function that returns true if the requirement has been met by the player, or false if otherwise
        this.functionRequirement = functionRequirement;
        //Description of the requirement to get this rank. Shows up in the home screen
        this.requirementDescription = requirementDescription;
        //How much the 'rank IQ per second multiplier' is once the user reaches this rank
        this.iqpsMultiplier = iqpsMultiplier;
        //The power of the player with this rank during battle. Shown in the home screen
        this.basePower = basePower;
    }
}

//Some ranks have different "branches", and the player will get a different rank title and description
//depending on which branch the player has satisfied.
class Branch {
    constructor(id, name, functionRequirement) {
        //Unique identifier for the branch
        this.id = id;
        //Name of the branch. Can't be seen by the player
        this.name = name;
        //The function that returns true if the player has satisfied the branch requirement, and returns false if otherwise
        this.functionRequirement = functionRequirement;
    }
}

//Player ranks
const ranks = [
    new Rank(0, ["a"], ["Pepega Trainer"], ["Gotta take em all!"], function iqRankRequirement(){ return isPlayerIqHigher(0); }, "0 IQ",1.0, 30),
    
    new Rank(1, ["a"], ["Pepega Shepherd"], [""], function iqRankRequirement(){ return isPlayerIqHigher(1000); }, "1,000 IQ", 1.1, 40),
    
    new Rank(2, ["a"], ["Pepega Whisperer"], [""], function iqRankRequirement(){ return isPlayerIqHigher(7500); }, "7,500 IQ", 1.2, 50),
    
    new Rank(3, ["a"], ["Pepega Researcher"], [""], function iqRankRequirement(){ return isPlayerIqHigher(20000); }, "20,000 IQ", 1.3, 60),
    
    new Rank(4, ["a"], ["Pepega Scientist"], [""], function iqRankRequirement(){ return isPlayerIqHigher(100000); }, "100,000 IQ", 1.4, 70),
    
    new Rank(5, ["a"], ["Pepega Guru"], [""], function iqRankRequirement(){ return isPlayerIqHigher(500000); }, "500,000 IQ", 1.5, 80),
    
    new Rank(6, ["a"], ["Professor Pepega"], [""], function iqRankRequirement(){ return isPlayerIqHigher(1000000); }, "1,000,000 IQ", 1.7, 90),
    
    new Rank(7, ["a"], ["Pepega Leader"], [""], function iqRankRequirement(){ return isPlayerIqHigher(5000000); }, "5,000,000 IQ", 1.9, 100),
    
    new Rank(8, ["a"], ["Pepega Commander"], [""], function iqRankRequirement(){ return isPlayerIqHigher(10000000); }, "10,000,000 IQ", 2.1, 125),
    
    new Rank(9, [""], ["Captain Pepega"], ["You're the captain now!"], function iqRankRequirement(){ return isPlayerIqHigher(35000000); }, "35,000,000 IQ", 2.3, 150),
    
    new Rank(10, ["a"], ["Pepega General"], [""], function iqRankRequirement(){ return isPlayerIqHigher(75000000); }, "75,000,000 IQ", 2.5, 200),
    
    new Rank(11, ["a"], ["Pepega Champion"], [""], function iqRankRequirement(){ return isPlayerIqHigher(150000000); }, "150,000,000 IQ", 3.0, 250),
    
    new Rank(12, ["a", "a", "a"], ["Pepega Legend Bronze", "Pepega Master", "Pepega Titan"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(300000000); }, "300,000,000 IQ", 3.5, 300),
    
    new Rank(13, ["a", "the", "a"], ["Pepega Legend Silver", "Pepega King", "Pepega Machine"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(500000000); }, "500,000,000 IQ", 4.0, 400),
    
    new Rank(14, ["a", "the", "a"], ["Pepega Legend Gold", "Pepega Zuperra", "Pepega Machinto"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(1000000000); }, "1,000,000,000 IQ", 4.5, 500),
    
    new Rank(15, ["a", "the", "a"], ["Pepega Legend Diamond", "Pepega Shahon", "Pepega Metinto"], ["", "", ""], function iqRankRequirement(){ return isPlayerIqHigher(2500000000); }, "2,500,000,000 IQ", 5.0, 750),
    
    new Rank(16, ["a", "the", "the"], ["Mythical Pepega", "President of the Pepega States", "Emperor of Pepegan"], 
    ["", "", ""], 
    function iqRankRequirement(){
        return isPlayerIqHigher(5000000000); 
    }, 
    "5,000,000,000 IQ", 7.5, 1000),
    
    new Rank(17, ["the", "the", "the"], ["True Pepega", "PepeGOD", "Gaijinga"], 
    ["Your IQ is less than 100... you are the truest of all Pepegas!", "Pepegas across the globe bow down to your presence.", "You are the ultimate weeb. AYAYA Clap"], 
    function finalRankRequirement(){
        if(pepegaTypes.length == uniquePepegaCount){
            return true;
        }
        return false;
    }, 
    "Every. Single. Pepega.", 10.0, 2000),
]

function isPlayerIqHigher(iqCountToTest){
    if(player.iqCount >= iqCountToTest){
        return true;
    }
    return false;
}

//Branches
const branches = [
    new Branch(0, "Default", function defaultBranch(){return true;}),
    new Branch(1, "Nammer", namBranchRequirement),
    new Branch(2, "Weeb", weebBranchRequirement)
]

//Branch requirements
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

//Pepega types
const pepegaTypes = [
    new PepegaType(0, [], "Pepega", "The original Pepega we all know and love.\nIts head is shaped like a garlic.", 
        0.5, 1, 15, 15, ["Shout", "Push", "Scream"],
        browserRuntime.getURL("images/pepegas/0_Pepega.png")),

    new PepegaType(1, [0, 0, 0], "Okayga", "These Pepegas are only capable of staring and looking deep into someone else's eyes,\nbut somehow they do it very skillfully.", 
        5, 60, 85, 100, ["Smile", "Slap", "Dazzle"],
        browserRuntime.getURL("images/pepegas/1_Okayga.png")),

    new PepegaType(2, [1, 1, 1], "Pepege", "This Pepega is incapable of reading, writing, or doing anything\nthat involves the use of more than one brain cell, but at least\nit's smart enough to be aware of this.", 
        50, 120, 755, 120, ["Bite", "Confusion", "Charge"],
        browserRuntime.getURL("images/pepegas/2_Pepege.png")),

    new PepegaType(3, [], "Firega", "This Pepega leaves behind gasoline cans, gasoline-soaked rags,\nand lighters on websites it roams on.", 
        4, 60, 70, 100, ["Sun with face Clap", "Starfire", "Overheat"],
        browserRuntime.getURL("images/pepegas/3_Firega.png")),

    new PepegaType(4, [], "Grassga", "Grassgas devote their lives into protecting and preserving nature.\nThey are against the consumption of plants, animals, and water.\nThey only eat Pepegas.", 
        6, 60, 50, 100, ["Snus", "Fame Leech", "Sap"],
        browserRuntime.getURL("images/pepegas/4_Grassga.png")),

    new PepegaType(5, [], "Icega", "This Pepega has a beautiful voice and it loves singing and dancing in the snow.\nIt is also obsessed with Spidergas, for some reason.", 
        8, 60, 35, 100, ["Hail", "Stage", "Freeze"],
        browserRuntime.getURL("images/pepegas/5_Icega.png")),

    new PepegaType(6, [2, 3, 3], "Pepega Knight", "Pepega Knights are the protectors of the weak.\nThey will defend anyone who is under scrutiny by the public,\nas long as it is attractive of course.", 
        130, 300, 3475, 120, ["Donate", "Permaban", "Defend"],
        browserRuntime.getURL("images/pepegas/6_Pepega-Knight.png")),

    new PepegaType(7, [2, 4, 4], "Pepega Hunter", "Pepega Hunters can't actually shoot arrows with their bows,\ninstead they just bash their bows against their enemies.", 
        152, 300, 3040, 120, ["Snipe", "Remix", "Save Stream"],
        browserRuntime.getURL("images/pepegas/7_Pepega-Hunter.png")),

    new PepegaType(8, [2, 5, 5], "Pepega Wizard", "This Pepega is very fond of Time Travel and risque dancing.\nIt has a habit of screaming its own name.", 
        175, 300, 2595, 120, ["Old Age", "Thrust", "Time Compression"],
        browserRuntime.getURL("images/pepegas/8_Pepega-Wizard.png")),

    new PepegaType(9, [], "Baby Pepega", "Aww, it's so cute! :3", 
        4, 30, 85, 80, ["Cry", "Time Out", "Complain"],
        browserRuntime.getURL("images/pepegas/9_Baby-Pepega.png")),

    new PepegaType(10, [], "Silver Pepega", "", 
        1500, 600, 9670, 120, ["Laser Beam", "Electricity Bomb", "JC Denton"],
        browserRuntime.getURL("images/pepegas/10_Silver-Pepega.png")),

    new PepegaType(11, [], "Golden Pepega", "", 
        8081, 3600, 25745, 120, ["Illuminate", "Divine Judgement", "Holy War"],
        browserRuntime.getURL("images/pepegas/11_Golden-Pepega.png")),

    new PepegaType(12, [], "Joyga", "These Pepegas are very young.\nThey are easily attracted to Pepegas who are loud and obnoxious.", 
        4, 15, 50, 80, ["React", "Poggers", "Yeet"],
        browserRuntime.getURL("images/pepegas/12_Joyga.png")),

    new PepegaType(13, [], "Kkoga", "Kkogas are well-known for their obsession with weapons and unhealthy food.\nIt is living the Pepega dream.", 
        16, 30, 180, 80, ["Shoot", "Guitar Time", "Pray"],
        browserRuntime.getURL("images/pepegas/13_Kkoga.png")),

    new PepegaType(14, [], "Bitga", "This Pepega has as much IQ as the number of pixels it has.", 
        34, 30, 395, 100, ["Backseat", "Throw Controller", "Release Mobile Game"],
        browserRuntime.getURL("images/pepegas/14_Bitga.png")),

    new PepegaType(15, [12, 12, 14, 14], "Broga", "These Pepegas love the use of platforms that connect to the other side,\nand if anyone is standing in their way, Brogas can take them down with ease.", 
        231, 300, 2460, 100, ["Cross", "Review", "Call Swedish"],
        browserRuntime.getURL("images/pepegas/15_Broga.png")),

    new PepegaType(16, [13, 13, 13, 15], "Orange Pepega", "Orange Pepegas are carpenters who specialize in building walls.\nIt is their duty to make sure no one gets through them.", 
        890, 600, 8455, 100, ["Construct Wall", "Weebs Out", "Electrocute"],
        browserRuntime.getURL("images/pepegas/16_Orange-Pepega.png")),

    new PepegaType(17, [], "Fastga", "Contrary to popular belief, these Pepegas love listening to violent rap music.", 
        3, 15, 110, 80, ["Sprint", "Meow", "Redesign"],
        browserRuntime.getURL("images/pepegas/17_Fastga.png")),

    new PepegaType(18, [], "Pastorga", "This pepega tells you that by simply catching it, it has won.", 
        6, 15, 205, 80, ["Sing", "Preach", "Evangelize"],
        browserRuntime.getURL("images/pepegas/18_Pastorga.png")),

    new PepegaType(19, [17, 17, 18], "Red Fastga", "This Pepega keeps asking you if you know the destination.", 
        33, 30, 1215, 100, ["Click", "Show the Way", "Raid"],
        browserRuntime.getURL("images/pepegas/19_Red-Fastga.png")),

    new PepegaType(20, [19, 19], "Supa Pepega", "This Pepega is on a mission to defeat and destroy the Pepega Mafia.", 
        164, 300, 7225, 100, ["Supa Kicker", "Rapid Gunfire", "Slow-mo"],
        browserRuntime.getURL("images/pepegas/20_Supa-Pepega.png")),

    new PepegaType(21, [20, 20], "Pepega U", "This Pepega dedicates its life into avenging its Pepega brother\nthat was assassinated by who it thinks are the Pepega Mafia.\nIt is a master of Martial Arts and Wingless Flying.\nThey call it... Pepega U!", 
        796, 1800, 41700, 120, ["Ugandan Kiss", "Ugandan Kick", "Ugandan Strike"],
        browserRuntime.getURL("images/pepegas/21_Pepega-U.png")),

    new PepegaType(22, [], "Peppahga", "In spite of its appearance, it is not a rat,\nbut is in fact just another Pepega.", 
        93, 300, 970, 100, ["Bark", "Squeak", "Run"],
        browserRuntime.getURL("images/pepegas/22_Peppahga.png")),

    new PepegaType(23, [], "200 IQ Pepega", "This Pepega loves telling other Pepegas about their favorite cartoon show in a very condescending manner.\nIt then proceeds to tell them that they are not smart enough to understand the show anyway.", 
        140, 300, 1455, 100, ["Freak Out", "Superiority Complex", "Snob"],
        browserRuntime.getURL("images/pepegas/23_200-IQ-Pepega.png")),

    new PepegaType(24, [23, 23], "400 IQ Pepega", "No one knows why, but these Pepegas keep yelling the word \"Pickle\"\nand a guy named \"Richard\".", 
        870, 300, 7715, 120, ["Yell", "Outsmart", "Checkmate"],
        browserRuntime.getURL("images/pepegas/24_400-IQ-Pepega.png")),

    new PepegaType(25, [24, 24], "Amazga", "One of the smartest Pepegas known to Pepegakind.\nLegend has it that this Pepega has already beaten this game.", 
        5908, 600, 40875, 140, ["Ragnaros", "Blindfold", "Scam"],
        browserRuntime.getURL("images/pepegas/25_Amazga.png")),

    new PepegaType(26, [25, 25], "Scamazga", "SCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE\nSCAMAZ IS HERE SCAMAZ IS HERE SCAMAZ IS HERE\nTHERE'S NOTHING YOU CAN DO\nHAHAHAHAHAHAHAHAHAHAHAHAHAHA", 
        33226, -10, -20000, 110, ["Curse", "Possess", "Backstab"],
        browserRuntime.getURL("images/pepegas/26_Scamazga.png")),

    new PepegaType(27, [], "Pridega", "", 
        6, 15, 205, 80, ["Attack"],
        browserRuntime.getURL("images/pepegas/27_Pridega.png")),

    new PepegaType(28, [], "Stronga", "These Pepegas love going to the gym\nand wrestling with their fellow Strongas.", 
        140, 30, 4405, 100, ["Lift", "Wrestle", "Taunt"],
        browserRuntime.getURL("images/pepegas/28_Stronga.png")),

    new PepegaType(29, [], "Jamga", "Jamgas are masters of music,\nmore specifically, groaning music.", 
        252, 60, 5040, 100, ["Hyperjam", "Hop", "AHHHHH"],
        browserRuntime.getURL("images/pepegas/29_Jamga.png")),

    new PepegaType(30, [27, 28, 3, 3], "Rigardo", "An expert in what is known as romantic dancing,\nRigardo can dance to almost every type of music.", 
        407, 600, 16220, 100, ["Ram", "Hump", "Lunge"],
        browserRuntime.getURL("images/pepegas/30_Rigardo.png")),

    new PepegaType(31, [27, 28, 4, 4], "Billiga", "Billiga is highly respected for its service in the Pepega Armed Forces.\nIt is a tough, but loving Pepega, and it only wants what's best for you.\nAfter its retirement, it has become a prominent figure in the Pepega wresling community.", 
        453, 600, 15045, 100, ["Headscissor", "Armlock", "Kiss"],
        browserRuntime.getURL("images/pepegas/31_Billiga.png")),

    new PepegaType(32, [27, 28, 5, 5], "Vanga", "Vangas are infamous for owning their very own dungeon\nwhere they party with their friends. They are also commonly referred to as Leathergas,\ndue to the outfit that they wear.", 
        499, 600, 13860, 100, ["Tie Up", "Leatherwhip", "Mermaid Splash"],
        browserRuntime.getURL("images/pepegas/32_Vanga.png")),

    new PepegaType(33, [30, 31, 32, 29, 29], "Gachiga", "Gachigas are considered to be the strongest and simultaneously the most beautiful Pepegas known to Pepegakind.\nIt greatly excels in performance art, music, and bodybuilding.", 
        4494, 600, 148925, 120, ["Manly Rave", "Thunder Remix", "AAAAAAAHHHHHHHH!"],
        browserRuntime.getURL("images/pepegas/33_Gachiga.png")),

    new PepegaType(34, [33, 33], "Hypergachiga", "A Pepega Abomination. What have you done?", 
        -2000, 600, 834440, 140, ["Annihilate", "Obliterate", "DEATH"],
        browserRuntime.getURL("images/pepegas/34_Hypergachiga.png")),

    new PepegaType(35, [], "Weebga", "These Pepegas are obsessed with children's cartoons to the point where\nthey will dress up as their favorite character, and in some cases,\neven fall in love with the character.", 
        4, 30, 45, 80, ["NyanPls", "MikuStare", "Gasp!"],
        browserRuntime.getURL("images/pepegas/35_Weebga.png")),

    new PepegaType(36, [], "Maldga", "This Pepega somehow manages to not only be mald,\nbut also bald at the same time.", 
        7, 30, 70, 100, ["Infect with Maldness", "BOO", "Quit"],
        browserRuntime.getURL("images/pepegas/36_Maldga.png")),

    new PepegaType(37, [], "Aimga", "Having inpepegan reflexes, these Pepegas are very good\nat shooter games and everything that requires true skill.", 
        4, 30, 85, 100, ["AWP", "AK-47", "M4A4"],
        browserRuntime.getURL("images/pepegas/37_Aimga.png")),

    new PepegaType(38, [], "Pokketga", "", 
        4, 30, 45, 100, ["Attack"],
        browserRuntime.getURL("images/pepegas/38_Pokketga.png")),

    new PepegaType(39, [], "Kappaga", "An incredibly popular and beloved Pepega... Kappa.", 
        6, 30, 245, 100, ["Jebait", "Account Suspension", "Banhammer"],
        browserRuntime.getURL("images/pepegas/39_Kappaga.png")),

    new PepegaType(40, [39, 39, 17], "Ninjaga", "This Pepega keeps telling you to click the Subscribe button,\nbut also making sure you don't smash it.", 
        45, 300, 2060, 100, ["Ligma", "Subscribe to Pepega Prime (without smashing)", "Stream on Miksga"],
        browserRuntime.getURL("images/pepegas/40_Ninjaga.png")),

    new PepegaType(41, [39, 39, 12], "Xqga", "A streamer with a fanbase.", 
        49, 300, 1995, 100, ["React", "Slam Desk", "Freak Out"],
        browserRuntime.getURL("images/pepegas/41_Xqga.png")),

    new PepegaType(42, [39, 39, 37], "Shroudga", "Shroudgas are the paragon of skill.\nThey are natural born hunters and they can easily kill you from a mile away.\nDespite their greatness, however, they have lost to a certain Mald Pepega in the past.", 
        52, 300, 1930, 100, ["Slay", "Dominate", "Execute"],
        browserRuntime.getURL("images/pepegas/42_Shroudga.png")),

    new PepegaType(43, [39, 39, 27], "Tylerga", "Tylergas are recognized for their intense, boisterous screaming and desk slamming.\nThey were tormented in the past by the nefarious Pepegas known as Tannergas.", 
        56, 300, 1860, 100, ["SCREAM", "SLAM KEYBOARD", "OUTBREAK"],
        browserRuntime.getURL("images/pepegas/43_Tylerga.png")),

    new PepegaType(44, [39, 39, 9], "GreekGaX", "This Pepega has a habit of sticking to other Pepegas\nin hopes of stealing their IQ. It enjoys eating excessive amounts of food\neven though it has swore, many times in the past, to do the complete opposite.", 
        59, 300, 1795, 100, ["Devour", "Explode", "Send to Vacation City"],
        browserRuntime.getURL("images/pepegas/44_GreekGaX.png")),

    new PepegaType(45, [39, 39, 35], "Triga", "Trigas are very popular for their immense skill in the game called Maldio and Mald Island.\nThey are considered to be the best at this genre, and they don't mald very easily unlike some other Pepegas.", 
        62, 300, 1725, 100, ["Try Hard", "Speedrun", "7"],
        browserRuntime.getURL("images/pepegas/45_Triga.png")),

    new PepegaType(46, [39, 39, 36], "Forsenga", "A professional children's card player that gets mad and bald when it loses.\nAlthough, nowadays, it just plays cartoon drag-and-drop games that require no skill whatsoever.\nPerhaps, this way, it can just blame its bad luck when it loses, instead of its lack of skill.", 
        69, 300, 1590, 100, ["Steal Posture", "Bottom Snus", "Google"],
        browserRuntime.getURL("images/pepegas/46_Forsenga.png")),

    new PepegaType(47, [39, 39, 38, 38], "Doctor Pepega", "The three time, back to back to back, consecutive years, 1982-1976 blockbuster Pepega.\nFor some reason, you can see through its body.", 
        66, 300, 1660, 100, ["Two-Time", "Invisibility", "Become Champion"],
        browserRuntime.getURL("images/pepegas/47_Doctor-Pepega.png")),

    new PepegaType(48, [], "REPLIGA", "", 
        -1000, 10, 10275, 120, ["t0rm3nt"],
        browserRuntime.getURL("images/pepegas/48_REPLIGA.png")),

    new PepegaType(49, [], "ZOZOGA", "", 
        2200, 5, 90000, 150, ["Torment"],
        browserRuntime.getURL("images/pepegas/49_ZOZOGA.png")),

    new PepegaType(50, [], "FINAL ZOZOGA", "", 
        22000, -10, 285000, 160, ["Hijack", "Shut Down", "Possess"],
        browserRuntime.getURL("images/pepegas/50_FINAL-ZOZOGA.png")),

    new PepegaType(51, [], "Gamerga", "Gamergas don't occupy a slot in your army, and they don't die when you rise up.", 
        50, 0, 250, 0, ["Just Rise Up", "Ground Beef", "Revolution!"],
        browserRuntime.getURL("images/pepegas/51_Gamerga.png")),
]

//Site categories
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

//Encounter modes that can be set by the player. This adjusts the constant Pepega spawn rate
class EncounterMode {
    constructor(id, name, multiplier) {
        //Unique identifier for the encounter mode
        this.id = id;
        //Name of the encounter mode. Displayed on the home screen
        this.name = name;
        //Multiplier for the constant Pepega spawn rate that determines the probability of a Pepega spawning
        this.multiplier = multiplier;
    }
}

//Encounter modes
const encounterModes = [
    new EncounterMode(0, "Maximum Encounters (100%)", 100),
    new EncounterMode(1, "Less Encounters (40%)", 40),
    new EncounterMode(2, "Encounters Disabled (0%)", 0)
]

//Dependent player statistics
var totalIqps = 0;
var totalPepegaPower = 0;
var branch = branches[0];
var pepegaSlotCost = 0;
var healAllPepegaCost = 0;
var uniquePepegaIqpsMultiplier = 1;
var uniquePepegaCount = 0;
var isPlayerIdle = false;

//Independent player statistics
var player = {
    iqCount: 0,
    pepegas: [],
    armyName: defaultArmyName,
    pepegaSlots: startingPlayerPepegaSlots,
    catchCount: 0,
    successfulCatchCount: 0,
    encounterCount: 0,
    pepegaTypeStatuses: [],
    rank: ranks[0],
    riseCount: 0
}

//User settings
var settings = {
    enableSounds: true,
    enablePepegaCatchReleaseNotifications: true,
    enableRankUpNotifications: true,
    enableTutorialNotifications: true,
    enablePepegaHealNotifications: true,
    recordOrigin: true,
    showBattleBreakdown: true
}

//User configurations
var config = {
    filteredSites: {},
    encounterMode: encounterModes[0],
    isIqCountUnitized: true
}

var tutorial = {
    //States what phase of the tutorial the player is currently in. Each tutorial phase has a one word string identifier
    //The "ask" phase is the prompt that asks the player whether they want to do the tutorial or not
    phase: TutorialPhaseEnum.Ask,
    //States what random phase of the tutorial the player is currently in. Random phases are triggered by specific actions of the player
    //e.g. The "Unique Pepega" tutorial only shows up once the player catches a unique pepega for the first time
    randomPhase: -1,
    //Determines whether the Unique Pepega tutorial will be shown again if triggered by the player
    enableUniquePepegaRandomTutorial: true,
    //Determines whether the Rank Up tutorial will be shown again if triggered by the player
    enableRankUpRandomTutorial: true,
    //Determines whether the Dead Pepega Pepega tutorial will be shown again if triggered by the player
    enableDeadPepegaRandomTutorial: true
}

//Notifications that are given to the browser
var notificationsDisplay = {
    header: "",
    message: ""
}

function resetTutorial(){
    browserStorage.set({"tutorialPhase": null});
    browserStorage.set({"randomTutorialPhase": null});
    browserStorage.set({"enableUniquePepegaRandomTutorial": null});
    browserStorage.set({"enableRankUpRandomTutorial": null});
    browserStorage.set({"enableDeadPepegaRandomTutorial": null});
    tutorial.phase = TutorialPhaseEnum.Ask;
    tutorial.randomPhase = -1;
    tutorial.enableRankUpRandomTutorial = true;
    tutorial.enableUniquePepegaRandomTutorial = true;
    tutorial.enableDeadPepegaRandomTutorial = true;
    updateTutorialPhasePopupDisplay()
    updateRandomTutorialPopupDisplay();
}

var savedScrollPosition = 0;

//Loads saved information from the browser's storage
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

function loadData(data) {
    try{
        var result = JSON.parse(data);

        for(var i in result.playerPepegas){
            result.playerPepegas[i].pepegaType = pepegaTypes[result.playerPepegas[i].pepegaTypeId];
            result.playerPepegas[i].pepegaTypeId = undefined;
        }

        browserStorage.set(result);
        chrome.runtime.reload();
    }catch{
        updateLoadDataErrorPopupDisplay("Error loading data!")
    }
}

function saveData() {
    browserStorage.get(["playerPepegas", "playerIqCount", "playerPepegaSlots", "playerCatchCount", "playerSuccessfulCatchCount", 
    "playerEncounterCount", "playerArmyName", "playerPepegaTypeStatuses"], function(result) {
        for(var i in result.playerPepegas){
            result.playerPepegas[i].pepegaTypeId = result.playerPepegas[i].pepegaType.id;
            result.playerPepegas[i].pepegaType = undefined;
        }

        var text = JSON.stringify(result).replace(/\\n/g, '\\\\n')
        var blob = new Blob([text], { type: "plain/text" });
        var a = document.createElement('a');
        
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var codedTime = today.getHours() + "" + today.getMinutes() + "" + today.getSeconds() + "" + today.getMilliseconds();
        a.download = "PepegaCatch_SaveData_ " + date + "_" + codedTime + ".txt";

        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = ["plain/text", a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
    });
}

browserStorage.get(["playerPepegas", "playerIqCount", "playerPepegaSlots", "playerCatchCount", "playerSuccessfulCatchCount", 
"playerEncounterCount", "playerArmyName", "playerPepegaTypeStatuses", "playerRank", "playerRiseCount"], function(result) {
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

    if(result.playerRank != null){
        player.rank = result.playerRank;
    }

    if(result.playerRiseCount != null){
        player.riseCount = result.playerRiseCount;
    }

    if(result.playerPepegas != null){
        var index, length;
        for (index = 0, length = result.playerPepegas.length; index < length; ++index) {
            if(result.playerPepegas[index].pepegaType != undefined){
                var playerPepega = new Pepega(pepegaTypes[result.playerPepegas[index].pepegaType.id]);
            }else{
                var playerPepega = new Pepega(pepegaTypes[result.playerPepegas[index].pepegaTypeId]);
            }
            
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

//Answers the "ask" phase of the tutorial, which asks whether the player wants to do the tutorial or not
function answerTutorialAsk(tutorialAnswer){
    //If the player chooses yes, start the next phase of the tutorial
    if(tutorialAnswer){
        updateTutorialPhase(TutorialPhaseEnum.CatchPrompt);
    }else{
        updateTutorialPhase(TutorialPhaseEnum.End);
        updateRandomTutorialPhase(TutorialPhaseEnum.End);
    }
    updateTutorialPhasePopupDisplay();
}

function updateTutorialPhase(tutorialPhase){
    tutorial.phase = tutorialPhase;
    browserStorage.set({"tutorialPhase": tutorial.phase});

    updateTutorialPhasePopupDisplay();
}
function updateRandomTutorialPhase(randomTutorialPhase){
    tutorial.randomPhase = randomTutorialPhase;

    browserStorage.set({"randomTutorialPhase": tutorial.randomPhase});

    switch (tutorial.randomPhase){
        case RandomTutorialPhaseEnum.UniquePepega:
            tutorial.enableUniquePepegaRandomTutorial = false;
            browserStorage.set({"enableUniquePepegaRandomTutorial": tutorial.enableUniquePepegaRandomTutorial});
            break;
        case RandomTutorialPhaseEnum.RankUp:
            tutorial.enableRankUpRandomTutorial = false;
            browserStorage.set({"enableRankUpRandomTutorial": tutorial.enableRankUpRandomTutorial});
            break;
        case RandomTutorialPhaseEnum.DeadPepega:
            tutorial.enableDeadPepegaRandomTutorial = false;
            browserStorage.set({"enableDeadPepegaRandomTutorial": tutorial.enableDeadPepegaRandomTutorial});
            break;
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

    updatePlayerPepegaSlotsPopupDisplay();

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
    if(player.pepegaSlots == 5){
        pepegaSlotCost = 125;
    } else if(player.pepegaSlots == 6){
        pepegaSlotCost = 3750;
    } else if(player.pepegaSlots == 7){
        pepegaSlotCost = 26480;
    } else if(player.pepegaSlots == 8){
        pepegaSlotCost = 92070;
    } else if(player.pepegaSlots == 9){
        pepegaSlotCost = 443560;
    } else if(player.pepegaSlots <= 16){
        pepegaSlotCost = Math.round(Math.pow(costBase, 7) * 0.12);
    } else if(player.pepegaSlots <= 30){
        pepegaSlotCost = Math.round(Math.pow(16 + ((costBase-16) * 0.5), 7) * 0.12);
    } else {
        pepegaSlotCost = Math.round(Math.pow(23 + ((costBase-30) * 0.3), 7) * 0.12);
    }
}

//Analyzes how many unique Pepegas a player has, and stores the number in the 'unique pepega count' player statistic
function analyzeUniquePepegas(){
    var uniquePepegas = [...new Set(player.pepegas.map(pepega => pepega.pepegaType.id))];
    uniquePepegaCount = uniquePepegas.length;

    uniquePepegaIqpsMultiplier = 1 + ((uniquePepegaCount-1) * iqpsMultiplierForEachUniquePepega);

    if(uniquePepegaCount > 1 && tutorial.enableUniquePepegaRandomTutorial){
        updateRandomTutorialPhase(RandomTutorialPhaseEnum.UniquePepega);
    }
}

//Gets what site category to use based on the website's host name that the player has visited
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

//Rolls for a wild pepega that will spawn on the website that the player has visited
function rollWildPepega(category){
    //By default, the Pepega that will spawn is a Level 1 ordinary Pepega
    var wildPepegaType = pepegaTypes[0];
    var wildPepegaLevel = 1;
    var specialEventOccured = false;

    //If the category isn't marked as special, then allow scripted events
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
        } else if(player.catchCount <= 40 && player.encounterCount % 3 == 0){
            wildPepegaType = pepegaTypes[0];
            specialEventOccured = true;
        }
    }

    //If none of the scripted events were triggered
    if(!specialEventOccured){
        //Then roll for a pepega based on the site category
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
    if(player.catchCount >= 30 && roll > 20 && (wildPepegaType.basePower < (totalPepegaPower / 4) || (roll > 85 && player.catchCount >= 45))){
        wildPepegaLevel = 2;
    }

    return new Pepega(wildPepegaType, "", "", false, rollPepegaPower(wildPepegaType.basePower), wildPepegaLevel, true, null);
}

//Rolls whether Pepegas that are stronger than the player's overall army power should be removed from the category options
function getScaledCategory(categoryOptions){
    var isStrongerPepegasAllowed = Math.round(Math.random() * (1));
    var scaledCategory = {};
    scaledCategory.maxRoll = 100.0;

    if(isStrongerPepegasAllowed == 0){
        //Return the default category options
        scaledCategory.options = categoryOptions;
    }else{
        scaledCategory.options = [];
        var scaledCategoryOptionsLength = 0;
        //Removes Pepegas that are stronger then the player's overall army power
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

var lastWildPepegaSpawnTime = 0;
var timeBeforeNextWildPepegaSpawn = 0;
browserStorage.get(["lastWildPepegaSpawnTime", "timeBeforeNextWildPepegaSpawn"], function(result) {
    if(result.lastWildPepegaSpawnTime != null){
        lastWildPepegaSpawnTime = result.lastWildPepegaSpawnTime;
        timeBeforeNextWildPepegaSpawn = result.timeBeforeNextWildPepegaSpawn;
    }
});

//Gets a wild pepega to be spawned on the website the user has visited
function getWildPepega(locationHref){
    var location = new URL(locationHref);

    var currentTime = new Date().getTime();
    if(currentTime - timeBeforeNextWildPepegaSpawn >= lastWildPepegaSpawnTime && 
        config.encounterMode.multiplier != 0 && ((rollEncounter() || player.catchCount <= beginnerCatchCount))){

        var category = getCategory(location.hostname);
        if(category == null){
            category = categories[0];
        }

        lastWildPepegaSpawnTime = currentTime;
        if(player.catchCount >= beginnerCatchCount){
            timeBeforeNextWildPepegaSpawn = (Math.random() * (maxRegularTimeBeforeNextWildPepegaSpawn - minRegularTimeBeforeNextWildPepegaSpawn)) + minRegularTimeBeforeNextWildPepegaSpawn;;
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

//Checks if the site has been filtered by the player
function isSiteFiltered(location){
    try{
        var site = new URL(location).hostname;
    }catch{
        var site = location;
    }
    if(location && site in config.filteredSites){
        browser.browserAction.setIcon({path: browserRuntime.getURL("icons/pepega-disabled-icon-128.png")});
        return true;
    }
	return false;
}

//Updates the extension icon shown in the browser's toolbar based on the player's currently set encounter mode
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

//Checks whether there are Pepega slots available
function isPepegaSlotsAvailable(playerPepegaCount){
    if(countPlayerPepegasExcept(51) <= player.pepegaSlots){
        return true;
    }else{
        return false;
    }
}

//Release a pepega from the player's pepega army
function releasePlayerPepega(id){
    var playerPepega = getPlayerPepega(id);

    var iqReleasePrice = (playerPepega.pepegaType.iqReleasePriceMultiplier * playerPepega.pepegaType.iqps * playerPepega.level);

    updatePlayerIqCount(iqReleasePrice);

    notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "Level " + playerPepega.level + " " + playerPepega.pepegaType.name + " was released!", "Level " + playerPepega.level + " " + playerPepega.pepegaType.name + " was released back into " + 
    playerPepega.origin + "! You got " + (iqReleasePrice)  + " IQ.", playerPepega.pepegaType.imageUrl);

    playSound(pepegaReleaseSound);

    removePlayerPepega(id);
}

//Heal a pepega from the player's pepega army
function healPlayerPepega(id, healCost, willNotify = true, willPlaySound = true, willUpdatePopupDisplay = true){
    if(player.iqCount >= healCost){
        var playerPepega = getPlayerPepega(id);

        if(!playerPepega.alive){
            updatePlayerIqCount(-healCost);
    
            if(willNotify){
                notify(NotificationPurposeEnum.pepegaHeal, "basic", playerPepega.pepegaType.name + " was healed!", 
                    "You lost " + healCost  + " IQ.", playerPepega.pepegaType.imageUrl);
            }
            if(willPlaySound){
                playSound(pepegaHealSound);
            }

            playerPepega.setAlive(true);

            if(willUpdatePopupDisplay){
                updatePlayerPepegasPopupDisplay();
            }
            return true;
        }
        return false;
    }
}

function healAllPlayerPepegasFeedback(){
    playSound(pepegaHealSound);
    updatePlayerPepegasPopupDisplay();
}

function getArticle(word){
    var article = "a";
    if(isStringAVowel(word[0])){
        article = "an";
    }
    return article;
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

//Saves the information that this type of Pepega has been acquired/caught by the player at least once
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
    results.battleBreakdown.player.rankTitle = player.rank.title;

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
        var playerPepegaRolledPower = Math.round((playerPepegaPower*((Math.random() * (1.15 - 0.85)) + 0.85)) * 100)/100;
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
            var wildPepegaRolledPower = Math.round((wildPepegaTotalPower*((Math.random() * (1.15 - 0.85)) + 0.85)) * 100)/100;
            if(wildPepegaRolledPower < playerPepegaPower){
                wildPepegaRolledPower += Math.round(((playerPepegaPower - wildPepegaRolledPower)*((Math.random() * (1.2 - 1.075)) + 1.075)) * 100)/100;
            }
            
            results.battleBreakdown.rounds[j].roundPlayerWon = false;
            results.battleBreakdown.rounds[j].wildPepega.remainingPower = wildPepegaRemainingPower;
            results.battleBreakdown.rounds[j].wildPepega.attack = wildPepegaAttack;
            results.battleBreakdown.rounds[j].wildPepega.power = wildPepegaRolledPower;

            playerPepega.setAlive(false, false);
            results.casualties++;
            playerPepega.timeBeforeRecovery = new Date().getTime() + 
            (playerPepega.power * playerPepega.level * multiplierBeforePepegaRecovers);
        
            if(tutorial.enableDeadPepegaRandomTutorial){
                updateRandomTutorialPhase(RandomTutorialPhaseEnum.DeadPepega);
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

    var rolledRankPower = Math.round((player.rank.basePower*((Math.random() * (1.2 - 1.05)) + 1.05)) * 100) / 100;
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

        if(tutorial.phase == TutorialPhaseEnum.Catch){
            updateTutorialPhase(TutorialPhaseEnum.CatchDone);
        }

        playSound(pepegaCatchSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successFusioned){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "You fusion summoned " + getArticle(pepegaAdd[1].pepegaType.name) + " " + pepegaAdd[1].pepegaType.name + "!",
            wildPepega.pepegaType.name + " fusioned with other Pepegas into " + getArticle(pepegaAdd[1].pepegaType.name) + " " + pepegaAdd[1].pepegaType.name + "!\nPogChamp!",
            pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == TutorialPhaseEnum.Fusion){
            updateTutorialPhase(TutorialPhaseEnum.FusionDone);
        }

        playSound(pepegaFusionSound);
    } else if(pepegaAdd[0] == AddingPlayerPepegaResultEnum.successLeveledUp){
        notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", pepegaAdd[1].pepegaType.name + " is now level " + pepegaAdd[1].level + "!",
            "Your " + pepegaAdd[1].pepegaType.name + " leveled up!\nIt is now level " + pepegaAdd[1].level + "!\nPog!",
            pepegaAdd[1].pepegaType.imageUrl);

        if(tutorial.phase == TutorialPhaseEnum.LevelUp){
            updateTutorialPhase(TutorialPhaseEnum.LevelUpDone);
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

//Add the pepega to the player's pepega army
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

        updatePlayerPepegaSlotsPopupDisplay();

        if(save){
            browserStorage.set({playerPepegas: player.pepegas});
        }

        return [AddingPlayerPepegaResultEnum.successSingle, pepega];

    } else {

        return [AddingPlayerPepegaResultEnum.noPepegaSlots, pepega];

    }
}

//Checks whether the recently added Pepega is leveling up
function checkPepegaLevelingUp(addedPepega, addEvents = {}){
    if(addedPepega.pepegaType.id == 51){
        return [CombiningPlayerPepegaResultEnum.noCombination, addedPepega];
    }

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

//Checks whether the recently added Pepega is fusing with other Pepegas
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

function stripHtmlTags(value) {
	if ((value===null) || (value==='')){
		return false;
	} else{
		value = value.toString();
		return value.replace(/<[^>]*>/g, '');
	}
}

function updateSettings(updatedSettings){
    settings = updatedSettings;

    updateSettingsPopupDisplay();

    browserStorage.set({
        "settings": settings
    });
}

function updateConfigFilteredSites(filteredSitesText){
    var filteredSitesTemp = filteredSitesText.split('\n');

    config.filteredSites = {};

    for(var i = 0; i < filteredSitesTemp.length; i++){
        config.filteredSites[filteredSitesTemp[i]] = true;
    }

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

var pepegaAliveCheckInterval = function () {
    var pepegaIndexToCheck = 0;
    setInterval(function() {
        if(player.pepegas.length > 0){
            var currentTime = new Date().getTime();
            if(player.pepegas[pepegaIndexToCheck + 1]){
                pepegaIndexToCheck++;
            }else{
                pepegaIndexToCheck = 0;
            }
            if(!player.pepegas[pepegaIndexToCheck].alive && 
                currentTime >= player.pepegas[pepegaIndexToCheck].timeBeforeRecovery){
                    player.pepegas[pepegaIndexToCheck].setAlive(true);
                    browserStorage.set({playerPepegas: player.pepegas});
                updatePlayerPepegasPopupDisplay();
            }
        }
    }, 500);
}

var updateIqCountInterval = function () {
    var previousUpdateIqCountTime = new Date().getTime();
    setInterval(function() {
        var currentTime = new Date().getTime();
        if(currentTime - previousUpdateIqCountTime >= updateIqCountMillisecondInterval){
            updatePlayerIqCount(Math.round(totalIqps * player.rank.iqpsMultiplier * uniquePepegaIqpsMultiplier));
            previousUpdateIqCountTime = currentTime;
        }
    }, 100);
}

pepegaAliveCheckInterval();
updateIqCountInterval();

function updatePlayerIqCount(iq, canRankDown = false, isNotifyIfRankUp = true){
    var additionalIq = iq;
    if(isPlayerIdle){
        additionalIq *= idleIqMultiplier;
    }
    var newPlayerIqCount = player.iqCount + additionalIq + 100000000000;

    if(newPlayerIqCount > maxPlayerIqCount){
        newPlayerIqCount = maxPlayerIqCount;
    }else if(newPlayerIqCount < 0){
        newPlayerIqCount = 0;
    }

    player.iqCount = newPlayerIqCount;
    
    analyzeRank(canRankDown, isNotifyIfRankUp);

    updatePlayerIqCountPopupDisplay();
    
    browserStorage.set({playerIqCount: player.iqCount});
}

//Analyzes what rank the player should be based on the player's current statistics, and sets the player's rank accordingly
function analyzeRank(canRankDown = false, isNotifyIfRankUp = true){
    for (var i = ranks.length - 1; i >= 0; i--) {
        if((i > player.rank.id || canRankDown) && ranks[i].functionRequirement()){
            if(isNotifyIfRankUp){
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

                if(tutorial.enableRankUpRandomTutorial){
                    updateRandomTutorialPhase(RandomTutorialPhaseEnum.RankUp);
                }
            }

            player.rank = ranks[i];
            
            browserStorage.set({playerRank: player.rank});

            break;
        }
    }
}

//Analyzes what branch the player has currently satisfied, and sets the player's branch accordingly
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

        if(tutorial.phase == TutorialPhaseEnum.BuySlot){
            updateTutorialPhase(TutorialPhaseEnum.BuySlotDone);
        }
    }
}

function removeAllPepegasExcept(typeIdException){
    var removedAll = false;
    while(!removedAll){
        removedAll = true;
        var index, length;
        for (index = 0, length = player.pepegas.length; index < length; ++index) {
            if(player.pepegas[index].pepegaType.id != typeIdException){
                
                if(player.pepegas[index].alive){
                    totalIqps -= player.pepegas[index].pepegaType.iqps * player.pepegas[index].level;
                    totalPepegaPower -= player.pepegas[index].power * player.pepegas[index].level;
                }
    
                player.pepegas.splice(index, 1);

                removedAll = false;
                break;
            }
        }
    }
    
    analyzeUniquePepegas();
    analyzeBranch();
    updatePlayerPepegasPopupDisplay();

    browserStorage.set({playerPepegas: player.pepegas});
}

function riseUp(){
    if(player.rank.id < minimumRankForRiseUp){
        return;
    }

    browserStorage.set({playerRiseCount: ++player.riseCount});
    
    removeAllPepegasExcept(51);

    var gamergaPower = (Math.pow(1.65, player.riseCount + (player.rank.id * 1.9)) + (1500000 * player.riseCount)) / 30000;
    
    var gamerga = new Pepega(pepegaTypes[51], "Pepegá Revolución", 
        new Date().toLocaleString(), false, gamergaPower, 3, true, null);

    addPlayerPepega(gamerga);

    updatePlayerIqCount(-player.iqCount, true, false);

    playSound(haruyokoiSound);

    notify(NotificationPurposeEnum.pepegaCatchRelease, "basic", "Candlelight", "The time has come. Your Pepegas perform a ritual using your browser; summoning the ultimate, greatest form of Pepega!", pepegaTypes[51].imageUrl);
}

function countPlayerPepegasExcept(typeIdException){
    var count = 0;
    var index, length;
    for (index = 0, length = player.pepegas.length; index < length; ++index) {
        if(player.pepegas[index].pepegaType.id != typeIdException){
            count++;
        }
    }
    return count;
}

function updateSavedScrollPosition(y){
    savedScrollPosition = y;
}

//Updates all displays in the extenion popup
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
        browserRuntime.sendMessage({"message": EventMessageEnum.NotificationsDisplayUpdated, 
        "notificationsDisplayHeader": notificationsDisplay.header, "notificationsDisplayMessage": notificationsDisplay.message});
    }
}
function updatePlayerPepegaSlotsPopupDisplay(){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": EventMessageEnum.PlayerPepegaSlotsUpdated, "playerPepegaCount": countPlayerPepegasExcept(51), "playerPepegaSlots": player.pepegaSlots, "pepegaSlotCost": pepegaSlotCost, "playerIqCount": player.iqCount});
    }
}
function updateIdlePopupDisplay(){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": EventMessageEnum.IdleUpdated, "isPlayerIdle": isPlayerIdle, "idleIqMultiplier" : idleIqMultiplier});
    }
}
function updateLoadDataErrorPopupDisplay(errorMessage){
    if(popup.isOpened){
		browserRuntime.sendMessage({"message": EventMessageEnum.LoadDataErrorUpdated, "errorMessage": errorMessage});
    }
}
function updatePlayerIqCountPopupDisplay(){
    if(popup.isOpened){

        var tempBranch = {
            id: branch.id,
            name: branch.name
        }
        var tempRank = {
            id: player.rank.id,
            titleArticle: player.rank.titleArticle,
            title: player.rank.title,
            description: player.rank.description,
            requirementDescription: player.rank.requirementDescription,
            iqpsMultiplier: player.rank.iqpsMultiplier,
            basePower: player.rank.basePower
        }
        
        var tempNextRank = {
            id: ranks[player.rank.id+1].id,
            titleArticle: ranks[player.rank.id+1].titleArticle,
            title: ranks[player.rank.id+1].title,
            description: ranks[player.rank.id+1].description,
            requirementDescription: ranks[player.rank.id+1].requirementDescription,
            iqpsMultiplier: ranks[player.rank.id+1].iqpsMultiplier,
            basePower: ranks[player.rank.id+1].basePower
        }

		browserRuntime.sendMessage({"message": EventMessageEnum.PlayerIqCountUpdated, "playerIqCount": player.iqCount, "rank": tempRank, "branch": tempBranch, "nextRank": tempNextRank, "pepegaSlotCost": pepegaSlotCost, "ranksLength": ranks.length});
    }
}
function updatePlayerPepegasPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.PlayerPepegasUpdated, "playerPepegas": player.pepegas, "totalIqps": totalIqps, "totalPepegaPower": totalPepegaPower, "rankBasePower": player.rank.basePower,
        "multipliedTotalIqps": Math.round(totalIqps * player.rank.iqpsMultiplier * uniquePepegaIqpsMultiplier * (isPlayerIdle ? idleIqMultiplier : 1.0)), "playerPepegaSlots": player.pepegaSlots, "uniquePepegaIqpsMultiplier": uniquePepegaIqpsMultiplier, "baseEncounterRate": baseEncounterRate, "configEncounterMode": config.encounterMode});
    }
}
function updateSettingsPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.SettingsUpdated, "settings": settings});
    }
}
function updatePlayerArmyNamePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.PlayerArmyNameUpdated, "playerArmyName": player.armyName, "isDefaultArmyName": (player.armyName == defaultArmyName)});
    }
}
function updateConfigEncounterModePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.ConfigEncounterModeUpdated, "configEncounterMode": config.encounterMode, "baseEncounterRate": baseEncounterRate});
    }
}
function updateConfigIsIqCountUnitizedPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.ConfigIsIqCountUnitizedUpdated, "configIsIqCountUnitized": config.isIqCountUnitized, "playerIqCount" : player.iqCount});
    }
}
function updateConfigFilteredSitesPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.ConfigFilteredSitesUpdated, "configFilteredSites": config.filteredSites});
    }
}
function updateTutorialPhasePopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.TutorialPhaseUpdated, "tutorialPhase": tutorial.phase});
    }
}
function updateRandomTutorialPopupDisplay(){
    if(popup.isOpened){
        browserRuntime.sendMessage({"message": EventMessageEnum.ShowRandomTutorial, "randomTutorialPhase": tutorial.randomPhase});
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

const EventMessageEnum = {
    "GetWildPepega":1, 
    "CatchWildPepega":2, 
    "UpdateAllPopupDisplays":3, 
    "ReleasePlayerPepega":4,
    "UpdateSettings":5,
    "UpdateConfigEncounterMode":6,
    "UpdateConfigFilteredSites":7,
    "UpdatePlayerArmyName":8,
    "BuyPepegaSlot":9,
    "AnswerTutorialAsk":10,
    "UpdateTutorialPhase":11,
    "UpdateRandomTutorialPhase":12,
    "ReplaceRandomTutorialPhase":13,
    "ResetTutorial":14,
    "HealPlayerPepega":15,
    "GetPepegaTypes":16,
    "RepelWildPepega":17,
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
    "SaveData":35,
    "RiseUp":36
}

browserRuntime.onMessage.addListener(
	function(request, sender, sendResponse) {
        switch(request.message) {
            case EventMessageEnum.GetWildPepega:
                sendResponse({ "isSiteFiltered": isSiteFiltered(request.locationHref), "wildPepega": getWildPepega(request.locationHref), "totalEstimatedPower": formatWithCommas((player.rank.basePower + totalPepegaPower).toFixed(2)) });
                break;
            case EventMessageEnum.CatchWildPepega:
                catchWildPepega(request.wildPepegaTypeId, request.wildPepegaPower, request.wildPepegaLevel, request.locationHref);
                sendResponse();
                break;
            case EventMessageEnum.UpdateAllPopupDisplays:
                updateAllPopupDisplays();
                sendResponse();
                break;
            case EventMessageEnum.ReleasePlayerPepega:
                releasePlayerPepega(request.playerPepegaId);
                sendResponse();
                break;
            case EventMessageEnum.UpdateSettings:
                updateSettings(request.settings);
                sendResponse();
                break;
            case EventMessageEnum.UpdateConfigEncounterMode:
                updateConfigEncounterMode();
                sendResponse();
                break;
            case EventMessageEnum.UpdateConfigFilteredSites:
                updateConfigFilteredSites(request.filteredSitesText);
                sendResponse();
                break;
            case EventMessageEnum.UpdatePlayerArmyName:
                updatePlayerArmyName(request.playerArmyName);
                sendResponse();
                break;
            case EventMessageEnum.BuyPepegaSlot:
                buyPepegaSlot();
                sendResponse();
                break;
            case EventMessageEnum.AnswerTutorialAsk:
                answerTutorialAsk(request.tutorialAnswer);
                sendResponse();
                break;
            case EventMessageEnum.UpdateTutorialPhase:
                updateTutorialPhase(request.tutorialPhase);
                sendResponse();
                break;
            case EventMessageEnum.UpdateRandomTutorialPhase:
                updateRandomTutorialPhase(request.randomTutorialPhase);
                sendResponse();
                break;
            case EventMessageEnum.ReplaceRandomTutorialPhase:
                replaceRandomTutorialPhase(request.randomTutorialPhase);
                sendResponse();
                break;
            case EventMessageEnum.ResetTutorial:
                resetTutorial();
                sendResponse();
                break;
            case EventMessageEnum.HealPlayerPepega:
                healPlayerPepega(request.playerPepegaId, request.healCost, request.willNotify, request.willPlaySound, request.willUpdatePopupDisplay);
                if(request.healAll){
                    healAllPlayerPepegasFeedback();
                }
                sendResponse();
                break;
            case EventMessageEnum.GetPepegaTypes:
                sendResponse({ "pepegaTypes": pepegaTypes, "playerPepegaTypeStatuses": player.pepegaTypeStatuses });
                break;
            case EventMessageEnum.RepelWildPepega:
                repelWildPepega();
                sendResponse();
                break;
            case EventMessageEnum.UpdateSavedScrollPosition:
                updateSavedScrollPosition(request.y);
                sendResponse();
                break;
            case EventMessageEnum.GetSavedScrollPosition:
                sendResponse({ "y": savedScrollPosition });
                break;
            case EventMessageEnum.ChangeIqCountUnitization:
                updateConfigIsIqCountUnitized();
                sendResponse();
                break;
            case EventMessageEnum.LoadData:
                loadData(request.loadData);
                sendResponse();
                break;
            case EventMessageEnum.SaveData:
                saveData();
                sendResponse();
                break;
            case EventMessageEnum.RiseUp:
                riseUp();
                sendResponse();
                break;
            default:
                sendResponse();
        }
	}
);