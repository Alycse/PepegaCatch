document.getElementById("wildPepega").addEventListener("click", catchWildPepega);

function catchWildPepega() {
	var wildPepega = document.getElementById("wildPepega");
	wildPepega.parentNode.removeChild(wildPepega);

	var wildPepegaInfo = wildPepega.name.split(" ");
	
	window.postMessage({ "message": "catch-wild-pepega", "wildPepegaTypeId": wildPepegaInfo[0], "wildPepegaPower": wildPepegaInfo[1] }, "*");
}