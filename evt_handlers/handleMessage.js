logger = require("../logger");
channels = require("../data/channels.json");
inspectMsg = require("../tools/inspectMessage");
udata = require("../storage/user_data");

module.exports = function(bot){ return function(user, userID, channelID, message, evt) {
	if (messageIsBad(user, userID, channelID, message, evt)) {
		logger.warn(user + " is talking about capes: " + message);
		bot.deleteMessage({channelID: channelID, messageID: evt.d.id});
		if (!udata.getUser(userID).hasTriggered) {
			bot.sendMessage({to: channelID, message: "Hey there <@" + userID + ">, just a heads-up: Talking about capes isn't allowed here."});
			udata.setUserProperty(userID, "hasTriggered", true);
		}
	} else {
		handleCommands(bot, user, userID, channelID, message, evt);
	}

	// might as well make this useful for something else.
	if (message.indexOf("team5892.github.io") !== -1) {
		bot.sendMessage({to: channelID, message: "That's the wrong URL. Our team website is hosted at http://frc5892.github.io."});
	}
}};

function messageIsBad(user, userID, channelID, message, evt) {
	//if (channelID === channels.spirit) return false; // capes are decidedly a spirit thing... but the verdict has already been reached.
	if (userID === "364954406657196032") { return false; } // bot needs ability to tell people off
	return inspectMsg(message);
}

/// copied from docs; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      return this.substr(position || 0, searchString.length) === searchString;
  };
}

function handleCommands(bot, user, userID, channelID, message, evt) {
	if (message.startsWith("5892!")) {
		logger.info(user + " issued a command: " + message);
		if (message.startsWith("debug", 5)) { cmdDebug(bot, user, userID, channelID, message, evt); }
	}
}

function cmdDebug(bot, user, userID, channelID, message, evt) { // dang am I tired of typing that
	var oldValue = udata.getUser(userID).debug;
	logger.debug(oldValue);
	var msgarr = message.split(" ");
	if (msgarr.length === 1) {
		bot.sendMessage({to: channelID, message: "<@" + userID + ">, your debug value is " + oldValue + "."});
	} else {
		var newValue = msgarr.slice(1).join(" ");
		udata.setUserProperty(userID, "debug", newValue);
		bot.sendMessage({to: channelID, message: "<@" + userID + ">, your new debug value is " + newValue + "."});
		if (oldValue === null) { bot.sendMessage({to: channelID, message: "Not sure what you want with a debug value, but you have one now, so that's something."}) };
		if (oldValue === newValue) { bot.sendMessage({to: channelID, message: "I mean, that was also your old debug value, but whatever."}) };
	}
}
