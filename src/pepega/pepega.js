document.getElementById("wildPepega").addEventListener("click",  function(event){
	var wildPepegaImage = event.target || event.srcElement;

	var wildPepegaInfo = wildPepegaImage.name.split(" ");

	window.postMessage({ "message": "catch-wild-pepega", "wildPepegaTypeId":  wildPepegaInfo[0], "wildPepegaPower": wildPepegaInfo[1], "wildPepegaLevel": wildPepegaInfo[2] }, "*");

	wildPepegaImage.parentNode.removeChild(wildPepegaImage);
});