/**
 * nfl_game_stats.js
 *
 * Creates JSON object of NFL's week games given in XML format.
 *
 * @author Eric Metcalf
 * @requires DayHours.js
 */

/**
 * Parses XML and returns week game stats.
 */
function getWeekGameStats(xmlWeekGameStats) {
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(xmlWeekGameStats, "text/xml");
  return new WeekGameStats(xmlDoc);
}

/**
 * Class containing week game stats for given XML.
 */
function WeekGameStats(xmlDoc) {
  var weekData = xmlDoc.getElementsByTagName("gms")[0];
  this.week = weekData.getAttribute("w");
  this.year = weekData.getAttribute("y");
  this.gameStats = getGameStats(xmlDoc);
}

/**
 * Returns game stats for fiven XML.
 */
function getGameStats(xmlDoc) {
  var gameStats = [];
  var games = xmlDoc.getElementsByTagName("g");
  for (i = 0; i < games.length; i++) {
    gameStats.push(new GameStats(
      games[i].getAttribute("d"),
      games[i].getAttribute("t"),
      games[i].getAttribute("q"),
      games[i].getAttribute("k"),
      games[i].getAttribute("v"),
      games[i].getAttribute("vnn"),
      games[i].getAttribute("vs"),
      games[i].getAttribute("h"),
      games[i].getAttribute("hnn"),
      games[i].getAttribute("hs"),
      games[i].getAttribute("p"),
      games[i].getAttribute("rz"),
      games[i].getAttribute("ga"),
      games[i].getAttribute("gt"),
      games[i].getAttribute("eid")
    ));
  }
  return gameStats;
}

/**
 * Class containing stats for an NFL game.
 */
function GameStats(gameDay, gameTime, abbrGameStatus, timeInQuarter, awayTeam, awayTeamMascot, awayTeamScore, homeTeam, homeTeamMascot, homeTeamScore, teamWithPossession, isInRedZone, gameAlert, gameType, id) {
  this.gameDay = gameDay;
  this.gameTime = getOffsetGameTime(gameTime);
  this.gameStatus = getGameStatus(abbrGameStatus);
  this.timeInQuarter = timeInQuarter;
  this.awayTeam = new Team(awayTeam, capitalize(awayTeamMascot));
  this.awayTeamScore = awayTeamScore;
  this.homeTeam = new Team(homeTeam, capitalize(homeTeamMascot));
  this.homeTeamScore = homeTeamScore;
  this.teamWithPossession = teamWithPossession;
  this.isInRedZone = isInRedZone;
  this.gameAlert = gameAlert;
  this.gameType = gameType;
  this.id = id;
}

/**
 * Returns local time given eastern time in HH:MM format.
 *
 * @return {string} Local time in HH:MM format
 */
function getOffsetGameTime(gameTime) {
  var splitGameTime = gameTime.split(":");
  
  // TODO move the code that gets timezoneOffsetFromEastern so it's not calculated multiple times.
  var localTime = new Date();
  var localTimeaoneOffset = -(localTime.getTimezoneOffset() / 60);
  
  var easternTimezoneOffset = -5; // Time zone given to us from JSON.
  var timezoneOffsetFromEastern = localTimeaoneOffset + -(easternTimezoneOffset);
  
  var dayHours = new DayHours(parseInt(splitGameTime[0]));
  if (timezoneOffsetFromEastern < 0) {
    dayHours.subtractHours(Math.abs(timezoneOffsetFromEastern));
  } else {
    dayHours.addHours(timezoneOffsetFromEastern);
  }
  return (dayHours.currentHour + ":" + splitGameTime[1]);
}

/**
 * Returns game status in human readable text.
 */
function getGameStatus(abbrGameStatus) {
  var gameStatus;
  switch(abbrGameStatus) {
    case "P":
      gameStatus = "Pregame";
      break;
    case "H":
      gameStatus = "Halftime";
      break;
    case "5":
      gameStatus = "Overtime";
      break;
    case "F":
      gameStatus = "Final";
      break;
    case "FO":
      gameStatus = "Final Overtime";
      break;
    default:
      gameStatus = abbrGameStatus;
  }
  return gameStatus;
}

/**
 * Returns string with first letter capitalized.
 */
function capitalize(str) {
  if (str != null) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Class containing attributes of an NFL team.
 */
function Team(abbrCityName, mascotName) {
  this.abbrCityname = abbrCityName;
  this.mascotName = mascotName;
}

Team.prototype.toString = function teamToString() {
  return this.abbrCityname;
}
