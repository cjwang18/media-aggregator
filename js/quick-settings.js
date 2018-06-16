var locationShortName = "";
var g_Theme = "light";

$(document).ready(function() {
	$("#quick-settings").hide();
	$("#options ul li").hide();

	$("#qs-link").bind("click", function() {
		$("#quick-settings").toggle();
	});

	$("#settings ul li").bind("click", function() {
		i = $(this).index();
		$("#options ul").children("li").hide();
		$("#options ul").children("li").eq(i).show();
	});

	$("#getNewLoc").bind("click", function() {
		var newLoc = $("#inputLocation").val();
		changeLocation(newLoc);
	});

	$("#loadNews").bind("click", function() {
		changeNewsTopics();
	});

	$("#defaultNewsTopics").bind("click", function() {
		if ($.cookie("newsTopics")) {
			$.removeCookie("newsTopics");
		}
	});

	$("#changeNumTiles").bind("click", function() {
		changeNumberOfTiles();
	});

	$("#defaultNumTiles").bind("click", function() {
		$("#customizeNumTiles input[type='text']").each(function() {
			$(this).val("1");
		});
		if ($.cookie("numTiles")) {
			$.removeCookie("numTiles");
		}
	});

	$("#showAllCookies").bind("click", function() {
		console.log($.cookie());
	});

	$("#removeAllCookies").bind("click", function() {
		if ($.cookie("favTiles")) {
			$.removeCookie("favTiles");
		}
	});
});

function changeLogos(curTheme, newTheme) {
	$(".logo").each(function() {
		var curSrc = $(this).attr("src");
		var newSrc = curSrc.replace("_" + curTheme, "_" + newTheme);
		$(this).attr("src", newSrc);
	})
}

function changeTheme(theme) {
	//alert("changing theme to: " + theme);
	switch(theme) {
		case 'dark':
			// change the CSS
			$("link").attr("href", "css/dark.css");
			// change the logo icons
			changeLogos(g_Theme, "dark");
			// set the global theme variable
			g_Theme = "dark";
			break;
		case 'light':
			// change the CSS
			$("link").attr("href", "css/light.css");
			// change the logo icons
			changeLogos(g_Theme, "light");
			// set the global theme variable
			g_Theme = "light";
			break;
	}
	// set the theme cookie
	if ($.cookie("theme")) {
		$.removeCookie("theme");
	}
	$.cookie("theme", {'theme' : g_Theme}, { expires: 365 });
}

// gcType == 0 : reverse geocoding (address lookup from latlon)
// gcType == 1 : geocoding
function setLocationField(gcType, addrData) {
	if (gcType == 0) {
		locationShortName = addrData.results[4].address_components[0].long_name;
	} else {
		if (addrData.results[0].address_components.length > 5) {
			locationShortName = addrData.results[0].address_components[3].long_name;
		} else {
			locationShortName = addrData.results[0].address_components[1].long_name;
		}
	}
	var addr = addrData.results[0].formatted_address;
	$("#inputLocation").val(addr);
}

function llToAddr(latlon, callback) {
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlon;
	$.getJSON(url, function(data) {
		callback(data);
	});
}

function addrToLL(addr, callback) {
	var temp = addr.replace(/ /g,"+");
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + temp;

	$.getJSON(url, function(data) {
		//console.log(data);
		setLocationField(1, data);
		//$("#inputLocation").val(data.results[0].formatted_address);
		var ll = data.results[0].geometry.location.lat + "," + data.results[0].geometry.location.lng;
		latlon = ll;
		callback();
	});
}

function changeLocation(addr) {

	var tileTypes = new Hashtable();
	tileTypes.put("weather", 1);
	tileTypes.put("yelp", $("input[name='yelp']").val());

	addrToLL(addr, function() {
		getAggregatorTiles(tileTypes, function(tiles) {
			var tempAggTiles = tiles;
			var aggTiles = randomGetFromDataArray(tempAggTiles, tempAggTiles.length);
			//alert("tempAggTiles: " + tempAggTiles.length + ", aggTiles: " + aggTiles.length);
			setAggregatorTiles(aggTiles);
		});
	});
}

function changeNewsTopics() {
	if ($("input[name='topic']:checked").length > 0) {

		// Save news topics preferences to cookie
		var itr = 1;
		var topics = '{ ';
		$("input[name='topic']").each(function() {
			topics += '"' + $(this).attr('id') + '" : "' + $(this).is(':checked') + '"';
			if (itr != $("input[name='topic']").length) {
				topics += ' , ';
			}
			itr++;
		});
		topics += ' }';
		var jsonTopics = $.parseJSON(topics);
		$.cookie("newsTopics", jsonTopics, { expires: 365 });

		var tileTypes = new Hashtable();
		tileTypes.put("news", $("input[name='news']").val());

		getAggregatorTiles(tileTypes, function(tiles) {
			var tempAggTiles = tiles;
			var aggTiles = randomGetFromDataArray(tempAggTiles, tempAggTiles.length);
			//alert("tempAggTiles: " + tempAggTiles.length + ", aggTiles: " + aggTiles.length);
			setAggregatorTiles(aggTiles);
		});
	} else {
		alert("Please choose desired news topics.");
	}
}

function changeNumberOfTiles() {

	var itr = 1;
	var tileTypes = new Hashtable();
	var types = '{ ';

	$("#customizeNumTiles input[type='text']").each(function() {
		var num = $(this).val();
		var type = $(this).attr("name");

		types += '"' + type + '" : "' + num +'"';
		if (itr != $("#customizeNumTiles input[type='text']").length) {
			types += ' , ';
		}
		itr++;

		if (num > 1) {
			tileTypes.put(type, num - 1);
		}
	});

	types += ' }';
	var jsonNumTiles = $.parseJSON(types);
	$.cookie("numTiles", jsonNumTiles, { expires: 365 });

	if (tileTypes.size() > 0) {
		getAggregatorTiles(tileTypes, function(tiles) {
			var tempAggTiles = tiles;
			var aggTiles = randomGetFromDataArray(tempAggTiles, tempAggTiles.length);
			//alert("tempAggTiles: " + tempAggTiles.length + ", aggTiles: " + aggTiles.length);
			setAggregatorTiles(aggTiles);
		});
	}
}

function initializeFromCookies() {
	if ($.cookie()) {

		if ($.cookie('theme')) {
			changeTheme($.cookie('theme').theme);
		}

		if ($.cookie('newsTopics')) {
			var c = $.cookie('newsTopics');
			for (var topic in c) {
				if (c.hasOwnProperty(topic)) {
					//alert(topic + " -> " + c[topic]);
					if (c[topic] == 'true') {
						$('#' + topic).prop('checked', true);
					} else {
						$('#' + topic).prop('checked', false);
					}
				}
			}
		}

		if ($.cookie('numTiles')) {
			var c = $.cookie('numTiles');
			for (var type in c) {
				if (c.hasOwnProperty(type)) {
					$("input[type='text'][name='" + type + "']").val(c[type]);
				}
			}
		}

	}
}
