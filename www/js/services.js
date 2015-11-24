angular.module('starter.services', [])

  .factory("Activity", function () {
    var journeys = [{
      id: 0,
      mean: "walking",
      date: '20-10-2015',
      distance: "10 km",
      calories: 200,
      points: 40
    }, {
      id: 1,
      mean: "transit",
      date: "25-10-2015",
      distance: "5 km",
      calories: 100,
      points: 30
    }, {
      id: 2,
      mean: "driving",
      date: "27-10-2015",
      distance: "15 km",
      calories: 50,
      points: 20
    }, {
      id: 3,
      mean: "walking",
      date: "30-10-2015",
      distance: "10 km",
      calories: 200,
      points: 40
    }];

    var inProgressJourneys = [{
      id: 0,
      mean: "walking",
      date: "30.10.2015",
      distance: "10 km",
      calories: 200,
      points: 40
    }, {
      id: 1,
      mean: "bicyling",
      date: "31.10.2015",
      distance: "5 km",
      calories: 100,
      points: 30
    }];

    return {
      all: function () {
        return journeys;
      },
      markComplete: function (journey) {
        journeys.push(journey);
        inProgressJourneys.splice(inProgressJourneys.indexOf(journey), 1);
      },
      markIncomplete: function (journey) {
        inProgressJourneys.push(journey);
        journeys.splice(journeys.indexOf(journey), 1);
      },
      inProgress: function () {
        return inProgressJourneys;
      }
    }
  })

  //just a constant, we can inject it as a dependency in any service
  .constant("WEATHER", {
    api_key: "92257cccf01d7cb89574a206d3d5d773",
    url: "http://api.openweathermap.org/data/2.5/",
    icon_url: "http://openweathermap.org/img/w/"
  })

  //constant holding api key for google
  .constant("GOOGLE", {
    api_key: "AIzaSyCZPUj37TM6ZJGsphAOLWu2MzGBtTrZsCM"
  })

  //get routes service
  /*
   * route = [ {transportMode: ..., time: 0.5 //half an hour
   *
   * transportMode = { walking, public transport, cycling, car }
   * * */
  .factory("Directions", function ($q, Icons) {

    var directions = {
      service: new google.maps.DirectionsService()
    };

    //travel modes
    var travelModes = [google.maps.TravelMode.WALKING,
      google.maps.TravelMode.BICYCLING,
      google.maps.TravelMode.TRANSIT,
      google.maps.TravelMode.DRIVING
    ];

    directions.getDirections = function (origin, destination) {

      var defered = $q.defer();
      var promises = [];

      travelModes.forEach(function (travelMode) {
        //get directions for each travel mode
        var p = getGenericDirections(origin.formatted_address,
          destination.formatted_address, travelMode);

        //push promises to array
        promises.push(p);
      });

      //when all promises have been resolved, return data
      $q.all(promises).then(function (data) {
        defered.resolve(data);
      });

      return defered.promise;
    };

    /**
     * Function that returns walking directions
     */
    var getGenericDirections = function (origin, dest, travelMode) {
      var res = {};
      var defered = $q.defer();

      //create the request object
      var request = {
        origin: origin,
        destination: dest,
        travelMode: travelMode
      };

      //send request
      directions.service.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

          var transportMode = result.request.travelMode.toLowerCase();

          //result object
          var r = result.routes[0].legs[0];
          var timeValue = convertTimeDecimal(r.duration.value);

          //result object sent to controller
          res = {
            mode: {
              text: transportMode,
              icon: Icons.getTransportIcon(transportMode)
            },
            distance: {
              text: r.distance.text,
              value: r.distance.value
            },
            duration: {
              text: r.duration.text,
              value: timeValue
            },
            score: {
              points: getPoints(transportMode, timeValue),
              calories: getCalories(transportMode, timeValue),
              footprint: getCarbonFootprint(travelMode.toLowerCase(), r.distance.value)
            }
          };

          //return our result
          defered.resolve(res);
        }
        else {
          //reject out result
          defered.reject("An error occurred with Google Request. Please try again later.");
        }
      });

      //return a promise
      return defered.promise;
    };

    /**
     * Function that converts time (seconds) in hours (decimal format)
     * @param time
     * @returns {number}
     */
    var convertTimeDecimal = function (time) {
      return Math.round(time / 60.0) / 60;
    };


    //function that computes calories
    var getCalories = function (travelMode, time) {
      var currentUser = Parse.User.current();
      var weight = currentUser.attributes.weight;

      var metMap = {
        walking: 3.8,
        transit: 1.0,
        bicycling: 8.0,
        driving: 2.0
      };

      return Math.round(metMap[travelMode] * weight * time);
    };

    //function that computes points
    var getPoints = function (travelMode, time) {
      var pointsMap = {
        "walking": 50,
        "transit": 25,
        "bicycling": 50,
        "driving": 20
      };

      return Math.round(pointsMap[travelMode] * time);
    };


    // returns kgCO2e
    var getCarbonFootprint = function (travelMode, distance) {
      var carbonMap = {
        "walking": 0,
        "bicycling": 0,
        "transit": 0.13552, //assumes bus used
        "driving": 0.24234
      };

      console.log(travelMode);
      console.log(carbonMap[travelMode]);
      console.log(distance);
      return Math.round(carbonMap[travelMode] * distance);
    };
    return directions;
  })



  //the weather service
  .factory('Weather', function (WEATHER, $http, $q, Icons) {
    var weather = {
      data: null,
      forecast: null
    };

    //get current weather
    weather.getCurrentWeather = function () {

      var defer = $q.defer();

      $http({
        method: 'GET',
        url: WEATHER.url + "weather?q=Glasgow&units=metric&APPID=" + WEATHER.api_key
      }).success(function (response) {

        weather.data = response;

        //create response object
        var result = {};

        result.temperature = Math.round(response.main.temp);
        result.weatherDescription = response.weather[0].description;
        result.city = response.name;
        result.icon_url = Icons.getWeatherIcon(response.weather[0].id).toLowerCase();

        defer.resolve(result);

      });

      return defer.promise;
    };

    //get five day forecast
    weather.getForecast = function () {

      var defer = $q.defer();

      $http({
        method: 'GET',
        url: WEATHER.url + "forecast?q=Glasgow&units=metric&APPID=" + WEATHER.api_key
      }).success(function (response) {
        weather.forecast = [];


        for (var i = 0; i < 6; i++) {
          var obj = {
            temperature: Math.round(response.list[i].main.temp),
            description: response.list[i].weather[0].main,
            icon: Icons.getWeatherIcon(response.list[i].weather[0].id)
          };

          //new date starting from 1st Jan 1970
          var date = new Date(0);
          date.setSeconds(response.list[i].dt);
          obj.time = checkTime(date.getHours()) + ":" + checkTime(date.getMinutes());

          weather.forecast.push(obj);
        }

        defer.resolve(weather.forecast);

      });

      return defer.promise;
    };

    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    //sync current weather
    weather.sync = function () {
      return weather.getCurrentWeather();
    };

    //get 5 day forecast, every 3 hours
    weather.syncForecast = function () {
      return weather.getForecast();
    };

    return weather;
  })

  .factory("Icons", function ($q, $http) {
    var icons = {
      weatherIcons: null
    };

    function loadJSON(file) {
      return $http.get(file).then(function (data) {
        icons.weatherIcons = data.data;
        isLoaded = true;
      });
    }

    loadJSON('data/icons.json');

    icons.getWeatherIcon = function (code) {
      return getIcon(code);
    };


    var getIcon = function (code) {


      var prefix = "wi wi-";
      var icon = icons.weatherIcons[code].icon;

      // If we are not in the ranges mentioned above, add a day/night prefix.
      if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
        icon = 'day-' + icon;
      }

      return prefix + icon;
    };

    icons.getTransportIcon = function (transport) {
      if (transport === "walking") {
        return 'ion-android-walk';
      }
      if (transport === "bicycling") {
        return 'ion-android-bicycle';
      }
      if (transport === "transit") {
        return 'ion-android-bus';
      }
      if (transport === "driving") {
        return 'ion-android-car';
      }
    };

    return icons;
  })

  .factory("Cards", function () {
    var cards = {};

    cards.examples = [
      {
        title: "Why should you walk?",
        template: "It's free, enjoyable and can help you to lead an active and healthy lifestyle.. Check out more",
        link: "http://www.nidirect.gov.uk/index/information-and-services/travel-transport-and-roads/travelwiseni/travelwise-walking.htm"
      },
      {
        title: "Why would you cycle?",
        template: "It's great exercise, inexpensive, no emissions, little noise, reduced congestion...",
        link: "http://www.nidirect.gov.uk/index/information-and-services/travel-transport-and-roads/travelwiseni/travelwise-cycling.htm"
      },
      {
        title: "Why share a car?",
        template: "Roads will be less crowded and you could share the travel expense.",
        link: "http://www.nidirect.gov.uk/index/information-and-services/travel-transport-and-roads/travelwiseni/travelwise-car-sharing.htm"
      },
      {
        title: "Why take public transport?",
        template: "You can relax or work while someone else drives. No worries about parking and you can have a drink after work.",
        link: "http://www.nidirect.gov.uk/index/information-and-services/travel-transport-and-roads/travelwiseni/travelwise-public-transport.htm"
      }
    ];

    cards.getRandomCard = function () {
      var article = Math.floor((Math.random() * cards.examples.length));
      return cards.examples[article];
    };

    return cards;
  })

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

  })

  .factory('Friends', function () {
    // Some fake testing data
    var friends = [{
      id: 0,
      name: 'Ben Sparrow',
      points: 1000,
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      points: 3400,
      face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      points: 1800,
      face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
      id: 3,
      name: 'Perry Governor',
      points: 4680,
      face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }];


    return {
      all: function () {
        friends.sort(function (a, b) {
          return (a.points > b.points) ? -1 : ((b.points > a.points) ? 1 : 0);
        });
        return friends;
      },
      get: function (friendId) {
        for (var i = 0; i < friends.length; i++) {
          if (friends[i].id === parseInt(friendId)) {
            return friends[i];
          }
        }
        return null;
      }
    }
  })

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  })

  .factory("MapService", function () {

    var mapData = {}

  })

;
