angular.module('starter.services', [])

  .factory("PointsCaloriesCalculator", function () {
    /*
     EXAMPLE USE
     var route = [];
     route[0]= {transportMode : "walking", time : 1};
     route[1]= {transportMode : "cycling", time : 1};
     console.log(PointsCaloriesCalculator.getCalories.apply(null, route));
     */
    var _getCalories = function () {
      var calories = 0;
      var currentUser = Parse.User.current();
      var weight = currentUser.attributes.weight;
      var metMap = {
        "walking": 3.8,
        "public transport": 1.0,
        "cycling": 8.0,
        "car": 2.0
      };

      for (var i = 0; i < arguments.length; i++) {
        calories += metMap[arguments[i].transportMode] * weight * arguments[i].time;
      }
      return calories;
    };

    var _getPoints = function () {
      var points = 0;
      var pointsMap = {
        "walking": 50,
        "public transport": 25,
        "cycling": 50,
        "car": 20
      };

      for (var i = 0; i < arguments.length; i++) {
        points += pointsMap[arguments[i].transportMode] * arguments[i].time;
      }
      return points;

    };

    return {
      getPoints: _getPoints,
      getCalories: _getCalories
    }
  })

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
      mean: "public transport",
      date: "25-10-2015",
      distance: "5 km",
      calories: 100,
      points: 30
    }, {
      id: 2,
      mean: "car",
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
      mean: "public transport",
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
  .factory("Directions", function ($q) {

    var directions = {
      service: new google.maps.DirectionsService()
    };

    //travel modes
    var travelModes = [google.maps.TravelMode.WALKING,
      google.maps.TravelMode.TRANSIT,
      google.maps.TravelMode.DRIVING,
      google.maps.TravelMode.BICYCLING
    ];

    //transit modes
    var transitModes = [google.maps.TransitMode.BUS,
      google.maps.TransitMode.SUBWAY,
      google.maps.TransitMode.TRAM,
      google.maps.TransitMode.RAIL];

    directions.getDirections = function (origin, destination) {

      var defered = $q.defer();

      var promise1 = getGenericDirections(origin.formatted_address,
        destination.formatted_address,
        google.maps.TravelMode.WALKING);

      var promise2 = getGenericDirections(origin.formatted_address,
        destination.formatted_address,
        google.maps.TravelMode.BICYCLING);

      var promise3 = getGenericDirections(origin.formatted_address,
        destination.formatted_address,
        google.maps.TravelMode.DRIVING);

      var promise4 = getGenericDirections(origin.formatted_address,
        destination.formatted_address,
        google.maps.TravelMode.TRANSIT);

      $q.all([promise1, promise2, promise3, promise4]).then(function (data) {
        defered.resolve([data[0], data[1], data[2], data[3]]);
      });

      return defered.promise;
    };

    /**
     * Function that returns walking directions
     */
    var getGenericDirections = function (origin, dest, travelMode) {
      var result = {};
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

          console.log(result);

          //TODO: add points and other stuff
          result = {
            mode: result.request.travelMode.toLowerCase(),
            distance: {
              text: result.routes[0].legs[0].distance.text,
              value: result.routes[0].legs[0].distance.value
            },
            duration: {
              text: result.routes[0].legs[0].duration.text,
              value: convertTimeDecimal(result.routes[0].legs[0].duration.value)
            }
          };

          //return our result
          defered.resolve(result);
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
     * Function that returns public transport directions.
     * */
    var getBusDirections = function (origin, dest) {
      var result = {};
      var defered = $q.defer();

      var request = {
        origin: origin,
        destination: dest.formatted_address,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [google.maps.TransitMode.BUS]
        }
      };

      directions.service.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

          //get data from object

          //TODO: add points and other stuff
          result = {
            mode: 'walking',
            distance: {
              text: result.routes[0].legs[0].distance.text,
              value: result.routes[0].legs[0].distance.value
            },
            duration: {
              text: result.routes[0].legs[0].duration.text,
              value: convertTimeDecimal(result.routes[0].legs[0].duration.value)
            }
          };

          defered.resolve(result);
        }
        else {
          defered.reject("An error occurred with Google Request. Please try again later.");
        }
      });
    };

    /**
     * Function that converts time (seconds) in hours (decimal format)
     * @param time
     * @returns {number}
     */
    var convertTimeDecimal = function (time) {
      return Math.round(time / 60.0) / 60;
    };

    return directions;

  })

  //the weather service
  .factory('Weather', function (WEATHER, $http) {
    var weather = {
      data: null,
      forecast: null
    };

    //get current weather
    weather.getCurrentWeather = function () {
      return $http({
        method: 'GET',
        url: WEATHER.url + "weather?q=Glasgow&units=metric&APPID=" + WEATHER.api_key
      }).success(function (response) {
        weather.data = response;
      });
    };

    //get five day forecast
    weather.getForecast = function () {
      return $http({
        method: 'GET',
        url: WEATHER.url + "forecast?q=Glasgow&units=metric&APPID=" + WEATHER.api_key
      }).success(function (response) {
        weather.forecast = [];
        for (var i = 0; i < 3; i++) {
          var obj = {
            temperature: Math.round(response.list[i].main.temp),
            description: response.list[i].weather[0].main,
            icon: response.list[i].weather[0].id
          };

          //new date starting from 1st Jan 1970
          var date = new Date(0);
          date.setSeconds(response.list[i].dt);
          obj.time = date.toLocaleTimeString();

          weather.forecast.push(obj);
        }
      });
    };

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
    }, {
      id: 4,
      name: 'Mike Harrington',
      points: 10340,
      face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
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
  });
