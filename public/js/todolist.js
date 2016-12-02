"use strict";

var serverHost = window.location.protocol + "//" + window.location.host;
var socketOptions = {};
if (window.location.pathname !== "/") {
		socketOptions = { path: window.location.pathname + '/socket.io'};
}
var socket = io.connect(serverHost, socketOptions);

var ulElt = document.getElementById("taches");
var errorElt = document.getElementById("error");

function afficherErreur(message) {
	errorElt.textContent = message;
	errorElt.style.visibility = "visible";
	setTimeout(function() {
		errorElt.style.visibility = "hidden";
	}, 2000);
}

socket.on("taches", function(taches) {
	ulElt.innerHTML = "";
	taches.forEach(function(tache) {
		var liElt = document.createElement("li");
		var spanElt = document.createElement("span");
		spanElt.textContent = "✘";
		spanElt.addEventListener("click", function() {
			socket.emit("supprimerTache", tache);
		});
		liElt.appendChild(spanElt);
		liElt.appendChild(document.createTextNode(tache));
		ulElt.appendChild(liElt);
	});
});

socket.on("erreur", function(message) {
	afficherErreur(message);
});

var formElt = document.getElementById("ajouterTache");

formElt.addEventListener("submit", function(e) {
	e.preventDefault();

	var elements = e.target.elements;
	var nouvelleTache = elements.newtodo.value.trim();

	if (nouvelleTache.length <= 0) {
		afficherErreur("Merci d'indiquer une tâche");
	} else {
		socket.emit("ajouterTache", nouvelleTache);
		e.target.reset();
	}
});
