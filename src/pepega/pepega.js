document.getElementById("wildPepega").addEventListener("click",  function(event){
	var wildPepegaImage = event.target || event.srcElement;

	if(!event.shiftKey){
		var wildPepegaInfo = wildPepegaImage.name.split(" ");

		window.postMessage({ "message": "catch-wild-pepega", "wildPepegaTypeId":  wildPepegaInfo[0], "wildPepegaPower": wildPepegaInfo[1], "wildPepegaLevel": wildPepegaInfo[2] }, "*");	
	}else{
		window.postMessage({ "message": "repel-wild-pepega" }, "*");	
	}
	
	wildPepegaImage.parentNode.removeChild(wildPepegaImage);
});