document.getElementById("wildPepega").addEventListener("click", catchWildPepega);

function catchWildPepega() {
	var wildPepega = document.getElementById("wildPepega");
	wildPepega.parentNode.removeChild(wildPepega);

	console.log("\nName: " + wildPepega.name + "\n");

	window.postMessage({ "message": "catch-wild-pepega", "wildPepegaTypeId": wildPepega.name }, "*");
}