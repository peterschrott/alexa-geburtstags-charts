'use strict';


const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.75332c25-f0ce-4bdd-b0c3-bc9b19067f40';
const SKILL_NAME = 'Chart Schlaumeier';


const charts = require('./charts');
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "July", "August", "September", "Oktober", "November", "Dezember"
];


//Adding greater variety to startSession
const WELCOME = [
  "Hey! du kannst mich nach den Nummer eins Hit an einem bestimmten Datum fragen.",
  "Hi! ich kenne die deutschen Nummer eins Hits pro Woche.",
  "Hallo! Frag mich einfach nach einem Datum.",
  "Hi! Wie kann ich dir helfen?",
];


//Adding greater variety to endSession
const GOODBYE = [
    "Ok! Tschüss!",
    "Alles klar. Wir hören uns.",
    "Natürlich! Bis dann!",
    "Hat mich gefreut!",
    "Ok, wir sprechen später!",
];


const YES = [
  "Gut, stell mir eine andre Frage.",
  "Schön, zu welchen Datum willst du den Nummer Eins Hit wissen?",
  "OK. Leg los!",
  "OK. Stell deine Frage.",
  "Gut. Wie kann ich dir helfen?",
  "Wann hast du Geburtstag?",
]


var getWeekNumber = function(d) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return the week number
    return weekNo;
}


const handlers = {
    'LaunchRequest': function () {
      var wIndex = Math.floor(Math.random() * WELCOME.length);
      var randomWelcome = WELCOME[wIndex];
      this.attributes['speechOutput'] = randomWelcome;
      // If the user either does not reply to the welcome message or says something that is not
      // understood, they will be prompted again with this text.
      this.attributes['repromptSpeech'] = 'Wenn du nicht weist was du sagen sollst, sag einfach "Hilfe".';
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'ChartIntent': function () {
      var dateSlot = this.event.request.intent.slots.Date;
      var date;
      if (dateSlot && dateSlot.value) {
          date = new Date(dateSlot.value);
          var yearAndWeek = date.getFullYear() + '_' + getWeekNumber(date)
          var chart = charts[yearAndWeek];
          if (chart === undefined) {
            yearAndWeek = date.getFullYear() + '_' + getWeekNumber(date)-1
            chart = charts[yearAndWeek];
          }
          if (chart !== undefined) {
              var dateSpeech = date.getDate() + '. ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
              var chartSpeech = chart.title + ' von ' + chart.artist;
              this.attributes['speechOutput'] = 'Der Nummer eins Hit am ' + dateSpeech + ' war ' + chartSpeech + '. ' + '<break time="300ms"/> ' + ' Willst du noch einen andren wissen?';
              this.attributes['repromptSpeech'] = 'Wenn du du die letzte Antwort noch mal hören willst, sag bitte "Wiederholen". Willst du noch einen andren wissen?';
              this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
          } else {
              console.log('Could not find chart');
              var dateSpeech = date.getDate() + '. ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
              var speechOutput = 'Leider weis ich den Nummer eins Hit vom ' + dateSpeech + ' nicht. ';
              var repromptSpeech = 'Kann ich dir bei einem anderen Datum weiterhelfen?';

              speechOutput += repromptSpeech;

              this.attributes['speechOutput'] = speechOutput;
              this.attributes['repromptSpeech'] = repromptSpeech;

              this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
          }
      } else  {
          console.log('Could not access date slot value');
          var speechOutput = 'Entschuldige, ich konnte dich leider nicht verstehen. ';
          var repromptSpeech = 'Kann ich dir bei einem anderen Datum weiterhelfen?';

          speechOutput += repromptSpeech;

          this.attributes['speechOutput'] = speechOutput;
          this.attributes['repromptSpeech'] = repromptSpeech;

          this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
      }
    },
    "AMAZON.YesIntent": function (intent, session, response) {
        var yesIndex = Math.floor(Math.random() * YES.length);
        var speechOutput = YES[yesIndex];
        var repromptSpeech = 'Wie kann ich dir weiterhelfen?';

        this.attributes['speechOutput'] = speechOutput;
        this.attributes['repromptSpeech'] = repromptSpeech;

        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = 'Frage mich zum Beispiel: "was war Nummer eins Hit am 10. Januar 2000 in den deutschen Single-Charts?". OK, wie kann ich dir helfen?';
        this.attributes['repromptSpeech'] = 'Frage mich "Mein Geburtstag ist am 10. Januar 2000." OK, wie kann ich dir helfen?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    "AMAZON.NoIntent": function (intent, session, response) {
        this.emit(':tell', randomGoodbye());
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', randomGoodbye());
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', randomGoodbye());
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', randomGoodbye());
    },
    'Unhandled': function() {
        console.error("unexpected event received: " + JSON.stringify(this.event));
        this.emit(':tell', 'Entschuldige, ich konnte dich nicht verstehen.');
     }
};


var randomGoodbye = function() {
  var goodbyeIndex = Math.floor(Math.random() * GOODBYE.length);
  return GOODBYE[goodbyeIndex];
};


exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
