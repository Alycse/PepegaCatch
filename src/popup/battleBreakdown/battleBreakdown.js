var browser = chrome;
var browserRuntime = browser.runtime;
var browserStorage = browser.storage.local;

browserStorage.get(["recentBattleBreakdown"], function(result) {
    var battleBreakdown = result.recentBattleBreakdown;
    if(battleBreakdown){
        battleBreakdown.new = false;
        browserStorage.set({"recentBattleBreakdown": battleBreakdown});

        var battleBreakdownTitleText = "";
        var battleBreakdownText = "";

        var player = battleBreakdown.player;
        var wildPepega = battleBreakdown.wildPepega;
        var rounds = battleBreakdown.rounds;

        battleBreakdownTitleText += "<p>" + player.armyName + " <span id=\"versus\">VS.</span> Wild " + wildPepega.name + "</p>";
        battleBreakdownTitleText += "<p><span id=\"wildPepegaTitlePower\">Wild " + wildPepega.name + "'s Power: </span>" + wildPepega.totalPower + "</p>";

        for(var i = 0; i < rounds.length; i++){
            var round = rounds[i];

            battleBreakdownText += 
                "<p><b><span class=\"ally\">" + round.playerPepega.name + "</span></b> used <span class=\"attack\">" + 
                round.playerPepega.attack + "</span>!, dealing <b>" + round.playerPepega.power + " damage</b> to <b><span class=\"enemy\">Wild " + 
                wildPepega.name + "</span></b>!</p>";

            if(!round.roundPlayerWon){
                battleBreakdownText += "<p><b><span class=\"enemy\">Wild " + wildPepega.name + "</span></span></b> has <b>" + 
                round.wildPepega.remainingPower + " remaining power</b>.</p>";

                battleBreakdownText += "<p><b><span class=\"enemy\">Wild " + wildPepega.name + "</span></b> used <span class=\"attack\">" + round.wildPepega.attack + 
                    "</span>!, dealing <b>" + round.wildPepega.power + " damage</b> to <b><span class=\"ally\">" + round.playerPepega.name + "</span></b>!</p>";

                battleBreakdownText += "<p><b><span class=\"ally\">" + round.playerPepega.name + "</span></b> fainted!</p>";
            }
        }
        
        if(rounds.length == 0 || !rounds[rounds.length - 1].roundPlayerWon){
            battleBreakdownText += "<p><b><span class=\"ally\">" + player.rankTitle + "</span></b> attacked <b><span class=\"enemy\">Wild " + wildPepega.name + 
                "</span></b>, dealing <b>" + player.rolledRankPower + " damage</b>!</p>";
        }

        if(wildPepega.remainingPower <= 0){
            battleBreakdownText += "<p><b><span class=\"enemy\">Wild " + wildPepega.name + "</span></b> fainted!</p>";
            battleBreakdownText += "<p><b><span class=\"ally\">" + player.rankTitle + "</span></b> successfully caught <b><span class=\"enemy\">Wild " +
                wildPepega.name + "</span></b>!</p>";
        }else{
            battleBreakdownText += "<p><b><span class=\"enemy\">Wild " + wildPepega.name + "</span></b> has <b>" + wildPepega.remainingPower + " remaining power</b>.</p>";
            battleBreakdownText += "<p><span id=\"lost\">You were unable to defeat "+wildPepega.name+"</span></p>";
            if(rounds.length > 0){
                battleBreakdownText += "<p><span id=\"lost\">All your Pepegas have fainted.</span></p>";
            }
            battleBreakdownText += "<p><span id=\"lost\">VI LOST!</span></p>";
        }

        document.getElementById("battleBreakdownTitle").innerHTML = battleBreakdownTitleText;
        document.getElementById("battleBreakdown").innerHTML = battleBreakdownText;
    }else{
        document.getElementById("battleBreakdownTitle").innerHTML = "You haven't fought any Wild Pepegas yet!";
        document.getElementById("battleBreakdown").innerHTML = "...";
    }
});

function returnToHomeScreen(){
	window.location.href=browserRuntime.getURL("src/popup/popup.html");
}

document.getElementById("returnToHome").addEventListener("click", returnToHomeScreen);