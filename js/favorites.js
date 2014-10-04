function allowDrop(e) {
	e.preventDefault();
}

function drag(e, obj) {

	var target = $(obj);
	var aTag = $(target.children('a')[0]);
	var itemDiv = $(aTag.children('.item')[0]);
	var spanEl = $(itemDiv.children('span')[0]);
	var descDiv = $(itemDiv.children('.description')[0]);
	
	var link = $(aTag).attr('href');
	// console.log(link);
	var photo = $(spanEl.children('img')[0]).attr('src');
	// console.log(photo);
	var logo = $(descDiv.children('img')[0]).attr('src');
	// console.log(logo);
	var title = $(descDiv.children('h3')[0]).html();
	// console.log(title);

	var favTile = '{ "photo" : "' + photo + '" , "logo" : "' + logo + '" , "title" : "' + title + '" , "link" : "' + link + '" }';
	//console.log(favTile);
	
	e.dataTransfer.setData("Text", favTile);
}

function drop_add(e) {

	e.preventDefault();
	var favTileString=e.dataTransfer.getData("Text");

	if ($.cookie("favTiles")) {
		var favTileJSON = $.parseJSON(favTileString);
		var cookieFavs = $.cookie("favTiles");
		cookieFavs.favs.push(favTileJSON);
		$.removeCookie("favTiles");
		$.cookie("favTiles", cookieFavs, { expires: 365 });
	} else {
		var favsString = '{ "favs" : [ ' + favTileString + ' ] }';
		var favsJSON = $.parseJSON(favsString);
		$.cookie("favTiles", favsJSON, { expires: 365 });
	}

	favAddedConfirmation();
}

function favAddedConfirmation() {
	$("#favAdded").slideDown(500);
	setTimeout('$("#favAdded").slideUp(1000);', 2000);
}

function drop_del(e) {

	e.preventDefault();
	var favTileString=e.dataTransfer.getData("Text");

	if ($.cookie("favTiles")) {
		var favTileJSON = $.parseJSON(favTileString);
		var cookieFavs = $.cookie("favTiles").favs;

		var i;
		for (i=0 ; i<cookieFavs.length ; i++) {
			if (cookieFavs[i].link == favTileJSON.link) {
				break;
			}
		}

		cookieFavs.splice(i, 1);
		var temp = JSON.stringify(cookieFavs);

		var newFavsString = '{ "favs" : ' + temp + ' }';
		var newFavsJSON = $.parseJSON(newFavsString);
		$.removeCookie("favTiles");
		$.cookie("favTiles", newFavsJSON, { expires: 365 });

		location.reload();
	}
}

function noFavs() {
	$("#subhead").hide();
	$("#subhead").html("You don't have any saved at this time.<br>Go back and add some.");
	$("#subhead").fadeIn(2000);
}

function showFavoriteTiles(favs) {
	
	//console.log(favs);

	var favTiles = new Array();

	for (i=0 ; i<favs.length ; i++) {
		var favTile = new tile(favs[i].logo, favs[i].photo, favs[i].title, favs[i].link);
		favTiles.push(favTile);
	}

	//console.log(favTiles);

	setAggregatorTiles(favTiles);

	setTimeout("centerImages();", 500);
}

$(document).ready(function() {
	$("#favAdded").hide();
});
