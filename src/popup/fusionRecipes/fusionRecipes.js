var browser = chrome;
var browserRuntime = browser.runtime;
var browserStorage = browser.storage.local;

var fusionRecipesContentElement = document.getElementById("fusionRecipesContent");

function returnToHomeScreen(){
	window.location.href=browserRuntime.getURL("src/popup/popup.html");
}

function getArticle(word){
    var article = "a";
    if(isStringAVowel(word[0])){
        article = "an";
    }
    return article;
}

function isStringAVowel(s) {
    return (/^[AEIOUaeiou]$/i).test(s);
}

browserRuntime.sendMessage({"message": EventMessageEnum.GetPepegaTypes}, function(result) {
    for(var i = 0, j = 0; i < result.pepegaTypes.length; i++){
        if(result.pepegaTypes[i].fusionIds.length > 0){
            var fusionPepegaType = result.pepegaTypes[i];

            var fusionPepegaContainerElement = document.createElement("div");
            if(j%2==0){
                fusionPepegaContainerElement.className = "fusionPepegaContainer fusionPepegaContainerA";
            }else{
                fusionPepegaContainerElement.className = "fusionPepegaContainer fusionPepegaContainerB";
            }
            ++j;
            fusionRecipesContentElement.appendChild(fusionPepegaContainerElement);

            var fusionPepegaContainerContentElement = document.createElement("div");
            fusionPepegaContainerContentElement.className = "fusionPepegaContainerContent";
            fusionPepegaContainerElement.appendChild(fusionPepegaContainerContentElement);

            var fusionPepegaElement = document.createElement("span");
            fusionPepegaElement.className = "fusionPepega";
            fusionPepegaContainerContentElement.appendChild(fusionPepegaElement);

            var pepegasContainerElement = document.createElement("div");
            pepegasContainerElement.className = "pepegasContainer";
            fusionPepegaContainerContentElement.appendChild(pepegasContainerElement);

            if(result.playerPepegaTypeStatuses[fusionPepegaType.id] != null && result.playerPepegaTypeStatuses[fusionPepegaType.id].acquired){
                fusionPepegaElement.innerHTML = fusionPepegaType.name + " Recipe";
                fusionPepegaElement.title = "To make " + getArticle(fusionPepegaType.name) + " " + fusionPepegaType.name + ", you need the following Pepegas:";
            }else{
                fusionPepegaElement.innerHTML = "????";
            }

            var pepegasEqualElement = document.createElement("span"); 
            pepegasEqualElement.innerHTML = "=";
            pepegasEqualElement.className="pepegasEqual unselectable";
            pepegasContainerElement.appendChild(pepegasEqualElement);

            for(var k = 0; k < fusionPepegaType.fusionIds.length; k++){
                var pepegaImageElement = document.createElement("img"); 
                var pepegaType = result.pepegaTypes[fusionPepegaType.fusionIds[k]];

                if(result.playerPepegaTypeStatuses[fusionPepegaType.fusionIds[k]] != null && result.playerPepegaTypeStatuses[fusionPepegaType.fusionIds[k]].acquired){
                    pepegaImageElement.src = pepegaType.imageUrl;
                    pepegaImageElement.title = "Type: " + pepegaType.name;
                }else{
                    pepegaImageElement.src = browserRuntime.getURL("images/unknown-pepega.png");
                }

                pepegaImageElement.className = "pepegaImage";
                pepegasContainerElement.appendChild(pepegaImageElement);
            }
        }
    }
});

document.getElementsByClassName("returnToHome")[0].addEventListener("click", returnToHomeScreen);
document.getElementsByClassName("returnToHome")[1].addEventListener("click", returnToHomeScreen);