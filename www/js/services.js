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
    api_key: "api key here" //"92257cccf01d7cb89574a206d3d5d773"
  })

  //constant holding api key for google
  .constant("GOOGLE", {
      api_key: "api key here" //"AIzaSyCZPUj37TM6ZJGsphAOLWu2MzGBtTrZsCM"
  })

  //the weather service
  .factory('Weather', function ($q, WEATHER) {
    var weather = {};

    weather.getCurrentWeather = function () {
      var promise = $q.defer();

      var date = new Date();
      console.log(date);

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
