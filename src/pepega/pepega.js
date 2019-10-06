const EventMessageEnum = {
    "CatchWildPepega":2, 
    "RepelWildPepega":17
}

document.getElementById("wildPepega").addEventListener("click",  function(event){
	var wildPepegaImage = event.target || event.srcElement;

	if(!event.shiftKey){
		var wildPepegaInfo = wildPepegaImage.name.split(" ");

		window.postMessage({ "message": EventMessageEnum.CatchWildPepega, "wildPepegaTypeId":  wildPepegaInfo[0], "wildPepegaPower": wildPepegaInfo[1], "wildPepegaLevel": wildPepegaInfo[2] }, "*");	
	}else{
		window.postMessage({ "message": EventMessageEnum.RepelWildPepega }, "*");	
	}
	
	wildPepegaImage.parentNode.removeChild(wildPepegaImage);
});