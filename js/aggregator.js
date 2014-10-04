/* ********** MEDIA SOURCES ********** */

/*
500px
*/
function five00pxAPI(callback) {
	// _500px.init({
	// 	sdk_key: 'd9421d5247170acb2614275e24364082c32e88db'
	// });

	_500px.api('/photos', {feature: 'popular', page: 1, image_size: 3}, function (response) {
		if (response.success) {
			var photos = response.data.photos;
			//console.log(photos);
			callback(photos);
		} else {
			console.log('500pxAPI(): Unable to complete request: ' + response.status + ' - ' + response.error_message);
			callback(null);
		}
	});
}

function get500pxTiles(num_tiles, callback) {
	five00pxAPI(function (apiData) {
		if (apiData) {
			var tempTiles = new Array();
			for (i=0 ; i<apiData.length ; i++) {
				logo = "images/logos/500px";
				if (g_Theme == "light") {
					logo += "_light.png";
				} else {
					logo += "_dark.png";
				}
				img = apiData[i].image_url;
				name = apiData[i].name;
				url = "http://500px.com/photo/" + apiData[i].id;
				tempTiles[i] = new tile(logo, img, name, url);
			}
			var tiles = randomGetFromDataArray(tempTiles, num_tiles);
			// alert("get500pxTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});
}

/*
hypem
*/
function hypemAPI(callback) {
	var hypemAPI = "http://hypem.com/playlist/popular/3day/json/1/data.js";
	//var hypemAPI = "http://hypem.com/playlist/pop/3day/json/1/data.js"; // TESTING FAILURE
	$.getJSON(hypemAPI, function (row) {
		var songs = [];
		$.each(row, function (key, val) {
			if (!isNaN(key)) {
				songs.push(val);
			}
		});
		callback(songs);
	})
	.fail(function() {
		console.log("hypemAPI(): $.getJSON() failed");
		callback(null);
	});
}

function getHypemTiles(num_tiles, callback) {
	hypemAPI(function(apiData) {
		if (apiData) {
			var tempTiles = new Array();
			for (i=0 ; i<apiData.length ; i++) {
				logo = "images/logos/hypem";
				if (g_Theme == "light") {
					logo += "_light.png";
				} else {
					logo += "_dark.png";
				}
				img = apiData[i].thumb_url_large;
				title = apiData[i].artist + " - " + apiData[i].title;
				url = "http://hypem.com/track/" + apiData[i].mediaid;
				tempTiles[i] = new tile(logo, img, title, url);
			}
			var tiles = randomGetFromDataArray(tempTiles, num_tiles);
			//alert("getHypemTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});
}

/*
news
*/
function chooseTopic(topic, url, callback) {
	switch(topic) {
		case 'world':
			url += "&topic=w";
			break;
		case 'us':
			url += "&topic=n";
			break;
		case 'business':
			url += "&topic=b";
			break;
		case 'technology':
			url += "&topic=tc";
			break;
		case 'entertainment':
			url += "&topic=e";
			break;
		case 'sports':
			url += "&topic=s";
			break;
		case 'health':
			url += "&topic=m";
			break;
		default:
			url += "";
			break;
	}
	query = encodeURIComponent(url);
	feedAPI = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&q=" + query + "&callback=?";
	callback(feedAPI);
}

function newsAPI(feedAPI, callback) {
	var temp = new Array();
	$.getJSON(feedAPI, function (data) {
		var feed = data.responseData.feed;
		var entries = feed.entries || [];
		callback(entries);
	})
	.fail(function() {
		console.log("newsAPI(): $.getJSON() failed");
		callback(null);
	});
}

function getNewsTiles(num_tiles, callback) {
	var tiles = new Array();
	var topicIterator = 0;
	var numTopics = $("input[name='topic']:checked").length;

	if (numTopics > 0) {
		$("input[name='topic']:checked").each(function() {

			var tempTiles = new Array();
			url = "http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&output=rss";
			topic = $(this).attr("value");
			//alert(topic);
			chooseTopic(topic, url, function (feedAPI) {
				newsAPI(feedAPI, function (apiData) {
					if (apiData) {
						for (i=0 ; i<apiData.length ; i++) {
							temp = apiData[i].content;
							if (temp.indexOf('img src="') == -1) {
								img_big = "images/no_image_available.png";
							} else {
								srcIndex = temp.indexOf('img src="') + 9;
								srcEndIndex = temp.indexOf('"', srcIndex);
								img = "http:" + temp.substring(srcIndex, srcEndIndex);
								img_big = img.replace("6.jpg", "11.jpg");
							}
							title = apiData[i].title;
							trim_title = title.substring(0, title.indexOf("-", parseInt(title.length * 2 /3)) - 1);
							url = apiData[i].link;
							logo = "images/logos/news";
							if (g_Theme == "light") {
								logo += "_light.png";
							} else {
								logo += "_dark.png";
							}
							tempTiles[i] = new tile(logo, img_big, trim_title, url);
						}
						temp = randomGetFromDataArray(tempTiles, num_tiles);
						for (i=0 ; i<temp.length ; i++) {
							tiles.push(temp[i]);
						}

						topicIterator++;
						if (topicIterator == numTopics) {
							//alert("getNewsTiles | tiles.length = " + tiles.length);
							callback(tiles);
						}
					} else {
						callback(null);
					}
				});
			});
		});
	} else {
		var tempTiles = new Array();
		url = "http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&output=rss";
		topic = $(this).attr("value");
		chooseTopic(topic, url, function (feedAPI) {
			newsAPI(feedAPI, function (apiData) {
				if (apiData) {
					for (i=0 ; i<apiData.length ; i++) {
						temp = apiData[i].content;
						if (temp.indexOf('img src="') == -1) {
							img_big = "images/no_image_available.png";
						} else {
							srcIndex = temp.indexOf('img src="') + 9;
							srcEndIndex = temp.indexOf('"', srcIndex);
							img = "http:" + temp.substring(srcIndex, srcEndIndex);
							img_big = img.replace("6.jpg", "11.jpg");
						}
						title = apiData[i].title;
						trim_title = title.substring(0, title.indexOf("-", parseInt(title.length * 2 /3)) - 1);
						url = apiData[i].link;
						logo = "images/logos/news";
						if (g_Theme == "light") {
							logo += "_light.png";
						} else {
							logo += "_dark.png";
						}
						tempTiles[i] = new tile(logo, img_big, trim_title, url);
					}
					temp = randomGetFromDataArray(tempTiles, num_tiles);
					for (i=0 ; i<temp.length ; i++) {
						tiles.push(temp[i]);
					}
					callback(tiles);
				} else {
					callback(null);
				}
			});
		});
	}
}

/*
vimeo
*/
function vimeoAPI(callback) {
	var vimeoAPI = "http://vimeo.com/api/v2/channel/staffpicks/videos.json?callback=?";
	$.getJSON(vimeoAPI, {format: "json"}, function (videos) {
		callback(videos);
	})
	.fail(function() {
		console.log("vimeoAPI(): $.getJSON() failed");
		callback(null);
	});
}

function getVimeoTiles(num_tiles, callback) {
	vimeoAPI(function (apiData) {
		if (apiData) {
			var tempTiles = new Array();
			for (i=0 ; i<apiData.length ; i++) {
				logo = "images/logos/vimeo";
				if (g_Theme == "light") {
					logo += "_light.png";
				} else {
					logo += "_dark.png";
				}
				img = apiData[i].thumbnail_large;
				title = apiData[i].title;
				url = apiData[i].url;
				tempTiles[i] = new tile(logo, img, title, url);
			}
			var tiles = randomGetFromDataArray(tempTiles, num_tiles);
			//alert("getVimeoTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});
}

/*
weather
*/
var wCodes = new Hashtable();
wCodes.put(395, "dunno");
wCodes.put(392, "dunno");
wCodes.put(389, "tstorm3");
wCodes.put(386, "tstorm2");
wCodes.put(377, "hail");
wCodes.put(374, "hail");
wCodes.put(371, "snow4")
wCodes.put(368, "snow3")
wCodes.put(365, "sleet")
wCodes.put(362, "sleet");
wCodes.put(359, "shower3")
wCodes.put(356, "shower2")
wCodes.put(353, "shower1");
wCodes.put(350, "sleet");
wCodes.put(338, "snow5");
wCodes.put(335, "snow5");
wCodes.put(332, "snow4");
wCodes.put(329, "snow3");
wCodes.put(326, "snow2");
wCodes.put(323, "snow1");
wCodes.put(320, "sleet");
wCodes.put(317, "sleet");
wCodes.put(314, "shower3");
wCodes.put(311, "light_rain");
wCodes.put(308, "shower3");
wCodes.put(305, "shower3");
wCodes.put(302, "shower2");
wCodes.put(299, "shower2");
wCodes.put(296, "light_rain");
wCodes.put(293, "light_rain");
wCodes.put(284, "shower1");
wCodes.put(281, "shower1");
wCodes.put(266, "shower1");
wCodes.put(263, "shower1");
wCodes.put(260, "fog");
wCodes.put(248, "fog");
wCodes.put(230, "snow5");
wCodes.put(227, "snow5");
wCodes.put(200, "tstorm1");
wCodes.put(185, "shower1");
wCodes.put(182, "sleet");
wCodes.put(179, "snow1");
wCodes.put(176, "shower1");
wCodes.put(143, "mist");
wCodes.put(122, "overcast");
wCodes.put(119, "cloudy5");
wCodes.put(116, "cloudy2");
wCodes.put(113, "clear");

function weatherAPI(location, callback) {
	var requestURL = "http://api.worldweatheronline.com/free/v1/weather.ashx?"
	requestURL += "key=rjshwkprfangr3zp95hdupcb";
	requestURL += "&q=" + location;
	requestURL += "&num_of_days=1&format=json";

	$.ajax({
		'url': requestURL,
		'cache': true,
		'dataType': 'jsonp',
		//'jsonpCallback': 'cb',
		'success': function(data, textStats, XMLHttpRequest) {
			// console.log(data);
			callback(data);
		}
	})
	.fail(function() {
		console.log("weatherAPI(): $.ajax() failed");
		callback(null);
	});
}

function getWeatherTiles(num_tiles, callback) {

	weatherAPI(latlon, function(apiData) {
		if (apiData) {
			var tiles = new Array();

			var currCond = apiData.data.current_condition[0];

			var wCode = currCond.weatherCode;
			var img = "images/weather/" + wCodes.get(parseFloat(wCode));
			if (!isDaytime(latlon)) {
				img += "_night";
			}
			img += ".png";

			var wCond = currCond.temp_F + "&deg;<br>";
			wCond += currCond.weatherDesc[0].value;
			wCond += "<br>" + locationShortName;

			var logo = "images/logos/weather";
			if (g_Theme == "light") {
				logo += "_light.png";
			} else {
				logo += "_dark.png";
			}

			var newTile = new tile(logo, img, wCond, "");
			tiles.push(newTile);
			// alert("getWeatherTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});
}

/*
wiki
*/
function wikiAPI(callback) {
	var query = "http%3A%2F%2Fen.wikipedia.org%2Fw%2Fapi.php%3Faction%3Dfeaturedfeed%26format%3Djson%26feedformat%3Drss%26feed%3Dpotd";
	var num = "-1";
	var feedAPI = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=" + num + "&q=" + query + "&callback=?";

	$.getJSON(feedAPI, function (data) {
		var feed = data.responseData.feed;
		var entries = feed.entries || [];
		callback(entries);
	})
	.fail(function () {
		console.log("wikiAPI(): $.getJSON() failed");
		callback(null);
	});
}

// This function will always return the most recent tile
// regardless of the num_tiles parameter.
function getWikiTiles(num_tiles, callback) {
	wikiAPI(function (apiData) {
		if (apiData) {
			var tiles = new Array();

			i = apiData.length - 1;
			temp = apiData[i].content;
			altIndex = temp.indexOf('img alt="') + 9;
			altEndIndex = temp.indexOf('"', altIndex);
			title = temp.substring(altIndex, altEndIndex);
			srcIndex = temp.indexOf('src="', altEndIndex) + 5;
			srcEndIndex = temp.indexOf('"', srcIndex);
			img = "http://" + temp.substring(srcIndex, srcEndIndex);
			desc = apiData[i].contentSnippet;
			url = apiData[i].link;
			logo = "images/logos/wiki";
			if (g_Theme == "light") {
				logo += "_light.png";
			} else {
				logo += "_dark.png";
			}

			newTile = new tile(logo, img, title, url);
			tiles.push(newTile);
			//alert("getWikiTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});

}

/*
yelp
*/
function yelpAPI(location, callback) {
	var auth = {
		consumerKey: "NBy5MBhqZ7tw2pjQBfLyhg",
		consumerSecret: "a68mjvA6evwo8vYVLoI82-fa3mg",
		accessToken: "otqR_UdiH0KOX8wIE-Lg_kILvD5crrZC",
		accessTokenSecret: "b5440U68M68Fxo0nb4WK76xBFIk",
		serviceProvider: {
			signatureMethod: "HMAC-SHA1"
		}
	};

	var terms = 'food';
	var near = location;

	var accessor = {
		consumerSecret: auth.consumerSecret,
		tokenSecret: auth.accessTokenSecret
	};

	parameters = [];
	parameters.push(['term', terms]);
	parameters.push(['ll', near]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

	var message = {
		'action': 'http://api.yelp.com/v2/search',
		'method': 'GET',
		'parameters': parameters
	};

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);

	var parameterMap = OAuth.getParameterMap(message.parameters);
	parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
	//console.log(parameterMap);

	$.ajax({
		'url': message.action,
		'data': parameterMap,
		'cache': true,
		'dataType': 'jsonp',
		//'jsonpCallback': 'cb',
		'success': function(yelpdata, textStats, XMLHttpRequest) {
			// console.log(yelpdata);
			callback(yelpdata);
		}
	})
	.fail(function() {
		console.log("yelpAPI(): $.ajax() failed");
		callback(null);
	});
}

function getYelpTiles(num_tiles, callback) {
	yelpAPI(latlon, function(yelpApiData) {
		if (yelpApiData) {
			var tempTiles = new Array();
			var tiles = new Array();

			for (i=0 ; i<yelpApiData.businesses.length ; i++) {
				var business = yelpApiData.businesses[i];
				var logo = "images/logos/yelp";
				if (g_Theme == "light") {
					logo += "_light.png";
				} else {
					logo += "_dark.png";
				}
				var name = business.name;
				var img = "";
				var img_big = "";
				if (!business.image_url) {
					img_big = "images/no_image_available.png";
				} else {
					img = business.image_url;
					img_big = img.replace("ms.jpg", "ls.jpg");
				}
				var link = business.url;
				tempTiles[i] = new tile(logo, img_big, name, link);
			}
			var temp = randomGetFromDataArray(tempTiles, num_tiles);
			for (i=0 ; i<temp.length ; i++) {
				tiles.push(temp[i]);
			}
			//alert("getYelpTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});
}

/*
youtube
*/
function youtubeAPI(callback) {
	var youtubeAPI = "https://gdata.youtube.com/feeds/api/standardfeeds/most_popular?time=this_week&alt=json";

	$.getJSON(youtubeAPI, function (returndata) {
		callback(returndata);
	})
	.fail(function () {
		console.log("youtubeAPI(): $.getJSON() failed");
		callback(null);
	});
}

function getYoutubeTiles(num_tiles, callback) {
	youtubeAPI(function (returndata) {
		if (returndata) {
			var tempTiles = new Array();
			var feed = returndata.feed;
			var entries = feed.entry || [];
			for (i=0 ; i<entries.length ; i++) {
				var logo = "images/logos/youtube";
				if (g_Theme == "light") {
					logo += "_light.png";
				} else {
					logo += "_dark.png";
				}
				var img = "";
				var title = "";
				var url = "";
				img = entries[i].media$group.media$thumbnail[0].url;
				title = entries[i].title.$t;
				url = entries[i].link[0].href;
				tempTiles.push(new tile(logo, img, title, url));
			}
			var tiles = randomGetFromDataArray(tempTiles, num_tiles);
			//alert("getYoutubeTiles | tiles.length = " + tiles.length);
			callback(tiles);
		} else {
			callback(null);
		}
	});
}

/* ********** HELPER FUNCTIONS ********** */

/*
This is a JS object that represents each tile
*/
function tile(logo, photo, title, link) {
	this.logo = logo;
	this.photo = photo;
	this.title = title;
	this.link = link;
}

var latlon = "";

function getLocation(callback) {
	var useGeolocation = true;
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			var latlon = lat + "," + lon;
			llToAddr(latlon, function(addrData) {
				setLocationField(0, addrData);
			});
			callback(latlon);
		});
	}
}

function getAggregatorTilesHelper(tileType, callback) {

	if (tileType[0] == "500px") {
		//console.log("calling 500px API");
		get500pxTiles(tileType[1], function(tiles) {
			//console.log("returning from 500pxAPI call");
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "hypem") {
		//console.log("calling hypem API");
		getHypemTiles(tileType[1], function(tiles) {
			//console.log("returning from hypemAPI call");
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "news") {
		//console.log("calling news API");
		getNewsTiles(tileType[1], function(tiles) {
			//console.log("returning from newsAPI call");
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "vimeo") {
		getVimeoTiles(tileType[1], function(tiles) {
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "weather") {
		getWeatherTiles(tileType[1], function(tiles) {
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "wiki") {
		getWikiTiles(tileType[1], function(tiles) {
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "yelp") {
		getYelpTiles(tileType[1], function(tiles) {
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

	if (tileType[0] == "youtube") {
		getYoutubeTiles(tileType[1], function(tiles) {
			if (tiles) {
				callback(tiles);
			} else {
				callback(null);
			}
		});
	}

}

function getAggregatorTiles(tileTypes, callback) {

	var aggTiles = new Array();
	var itr = 0;

	//console.log("tileTypes.size = " + tileTypes.size());

	for (i=0 ; i<tileTypes.size() ; i++) {
		//console.log("for loop i = " + i);
		getAggregatorTilesHelper(tileTypes.entries()[i], function (tiles) {

			itr++;
			if (tiles) {
				for (j=0 ; j<tiles.length ; j++) {
					aggTiles.push(tiles[j]);
				}
			}
			//console.log("itr = " + itr);
			if (itr == tileTypes.size()) {
				//console.log("getAggregatorTiles(), aggTiles.length: " + aggTiles.length);
				callback(aggTiles);
				setTimeout("centerImages();", 500);
			}
		});
	}
}

/*
This function initializes the aggregator with the defaults.
*/
function initializeAggregator() {

	var tileTypes = new Hashtable();
	tileTypes.put("500px", $("input[name='500px']").val());
	tileTypes.put("hypem", $("input[name='hypem']").val());
	tileTypes.put("news", $("input[name='news']").val());
	tileTypes.put("vimeo", $("input[name='vimeo']").val());
	tileTypes.put("weather", 1);
	tileTypes.put("wiki", 1);
	tileTypes.put("yelp", $("input[name='yelp']").val());
	tileTypes.put("youtube", $("input[name='youtube']").val());

	getLocation(function (ll) {
		latlon = ll;

		getAggregatorTiles(tileTypes, function (tiles) {
			var tempAggTiles = tiles;
			var aggTiles = randomGetFromDataArray(tempAggTiles, tempAggTiles.length);
			console.log("initializeAggregator(): final number of tiles = " + aggTiles.length);
			setAggregatorTiles(aggTiles);
			//setTimeout("centerImages();", 500);
		});
	});
}

function setAggregatorTiles(tiles) {

	var aggHTML = "";
	var numExistingTiles = $(".item").length;
	//alert("numExistingTiles = " + numExistingTiles);

	// Remove last instance of </ul> before appending new tiles
	if ( (numExistingTiles > 0) && (numExistingTiles % 4 != 0) ) {
		var temp = $("#content").html();
		$("#content").html("");
		aggHTML = temp.substring(0, temp.length - 5);
	}

	for (i=0 ; i<tiles.length ; i++) {
		var tileImg = "<span><img src='" + tiles[i].photo + "'></span>";
		var tileLogo = "<img src='" + tiles[i].logo + "' class='logo'>";
		var tileTitle = "<h3>" + tiles[i].title + "</h3>";
		var tileLink = "<a href='" + tiles[i].link + "' target='_blank'>";

		if ((i + numExistingTiles) % 4 == 0) {
			// alert("divisible by 4, current i = " + i);
			if (i == 0) {
				aggHTML += "<ul class='row-container'>";
			} else {
				aggHTML += "</ul><ul class='row-container'>";
			}
		}

		if (tiles[i].logo.indexOf("weather") != -1) {
			if (isDaytime(latlon)) {
				// day
				aggHTML += "<li>" + tileLink + "<div class='item dayWeatherTile4'>";
			} else {
				// night
				aggHTML += "<li>" + tileLink + "<div class='item nightWeatherTile4'>";
				//aggHTML += "<span><img src='images/weather/clear.png'></span>";
			}
		} else if (tiles[i].photo.indexOf("no_image_available") != -1) {
			aggHTML += "<li draggable='true' ondragstart='drag(event, this);'>" + tileLink + "<div class='item' style='background-color: #eee; border: 1px dashed #ccc;'>";
		} else {
			aggHTML += "<li draggable='true' ondragstart='drag(event, this);'>" + tileLink + "<div class='item'>";
		}

		aggHTML += tileImg;
		aggHTML += "<div class='description'>";
		aggHTML += "<br><br><br>" + tileLogo + tileTitle;
		aggHTML += "</div>"
		aggHTML += "</div></a></li>"

		if (i == tiles.length - 1) {
			aggHTML += "</ul>";
		}
	}
	// $("#content").html("");
	$("#content").append(aggHTML);
	if ($("#content").hasClass("loading")) {
		$("#content").removeClass("loading");
	}
}

function centerImages() {
	$(".item span img").each(function() {
		var maxWidth = 200;
		var maxHeight = 270; // Max height for the image
		var ratio = 0; // Used for aspect ratio
		var width = $(this).width(); // Current image width
		var height = $(this).height(); // Current image height

		if (width/height > 1) { // landscape photo
			// Scale the height to fit
			if(height != maxHeight) {
				ratio = maxHeight / height; // get ratio for scaling image
				$(this).css("height", maxHeight); // Set new height
				$(this).css("width", width * ratio); // Scale width based on ratio
				var mTop = ($(this).height() - 200) / 2 * -1;
				$(this).css("margin-top", mTop + "px"); // center image vertically
				width = width * ratio; // Reset width to match scaled image
			}
		} else { // portrait (or square) photo
			// Scale the width to fit
			if(width != maxWidth){
				ratio = maxWidth / width; // get ratio for scaling image
				$(this).css("width", maxWidth); // Set new width
				$(this).css("height", height * ratio); // Scale height based on ratio
				var mTop = ($(this).height() - 200) / 2 * -1;
				$(this).css("margin-top", mTop + "px"); // center image vertically
				height = height * ratio; // Reset height to match scaled image
				width = width * ratio; // Reset width to match scaled image
			}
		}
	});
}

/*
This function will return an array of size num that contains
num number of items from the original array.
*/
function randomGetFromDataArray(array, num) {
	oArrSize = array.length; // original array size
	var nArr = new Array(); // new array to be returned

	// always get random for first index
	nArr[0] = Math.floor(Math.random() * oArrSize);
	for (i=1 ; i<num ; i++) {
		repeat = false; // bool to check if there are any repeats
		nArr[i] = Math.floor(Math.random() * oArrSize);
		for (j=0 ; j<(nArr.length-1) ; j++) {
			if (nArr[i] == nArr[j]) {
				repeat = true;
			}
		}

		while(repeat) {
			repeat = false;
			nArr[i] = Math.floor(Math.random() * oArrSize);
			for (j=0 ; j<(nArr.length-1) ; j++) {
				if (nArr[i] == nArr[j]) {
					repeat = true;
				}
			}
		}
	}

	for (i=0 ; i<nArr.length ; i++) {
		oArrIndex = nArr[i];
		nArr[i] = array[oArrIndex];
	}

	return nArr;
}
