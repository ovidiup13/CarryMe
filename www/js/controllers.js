angular.module('starter.controllers', ['ksSwiper'])
  .controller('LoginCtrl', function ($scope, $state, $ionicPopup) {
    $scope.data = {};

    $scope.signupEmail = function () {
      var currentUser = Parse.User.current();
      if (currentUser) {
        // do stuff with the user
        Parse.User.logOut();
      }
      //Create a new user on Parse
      var user = new Parse.User();
      user.set("username", $scope.data.username);
      user.set("password", $scope.data.password);
      user.set("email", $scope.data.email);

      // other fields can be set just like with Parse.Object
      //user.set("weight", $scope.data.weight);
      console.log($scope.data.weight);
      user.set("weight", $scope.data.weight);
      user.signUp(null, {
        success: function (user) {
          // Hooray! Let them use the app now.
          var alertPopup = $ionicPopup.alert({
            title: 'Success!',
            template: 'You are signed up.'
          });
          $state.go('login');
        },
        error: function (user, error) {
          // Show the error message somewhere and let the user try again.
          var alertPopup = $ionicPopup.alert({
            title: 'Error!',
            template: "Error: " + error.code + " " + error.message
          });

          //alert("Error: " + error.code + " " + error.message);
        }
      });

    };

    $scope.loginEmail = function () {
      Parse.User.logIn($scope.data.username, $scope.data.password, {
        success: function (user) {
          // Do stuff after successful login.
          console.log(user);

          var alertPopup = $ionicPopup.alert({
            title: 'Success!',
            template: 'You are logged in.'
          });

          $state.go('tab.dash');

        },
        error: function (user, error) {
          // The login failed. Check error to see why.
          var alertPopup = $ionicPopup.alert({
            title: 'Error!',
            template: "Invalid username or password!"
          });
        }
      });
    };

  })

  /**
   * Swiper directive for loading data.
   */
  .directive('isLoaded', function () {
    return {
      scope: false, //don't need a new scope
      restrict: 'A', //Attribute type
      link: function (scope, elements, arguments) {

        if (scope.$last) {
          scope.$emit('content-changed');
          console.log('page Is Ready!');
        }
      }
    }
  })

  /**
   * Swiper directive in case data changes.
   */
  .directive('swiper', function () {
    return {
      link: function (scope, element, attr) {
        //Option 1 - on ng-repeat change notification
        scope.$on('content-changed', function () {
          console.log("changed");
          new Swiper(element, {
            direction: 'horizontal',
            slidesPerView: 3,
            spaceBetween: 5
          });
        })
      }
    }
  })

  /**
   * Dashboard WEATHER Controller
   */
  .controller('DashCtrl', function ($scope, Weather, WEATHER, $interval) {

    //swiper
    var swiper = new Swiper('.swiper-container', {
      direction: 'horizontal',
      slidesPerView: 3,
      spaceBetween: 10
    });

    $scope.forecast = [];

    $scope.syncWeather = function () {
      Weather.sync().then(function () {
        $scope.temperature = Math.round(Weather.data.main.temp);
        $scope.weatherDescription = Weather.data.weather[0].description;
        $scope.city = Weather.data.name;
        $scope.icon_url = WEATHER.icon_url + Weather.data.weather[0].icon + ".png";

        //refresh complete
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    //sync current weather
    Weather.sync().then(function () {
      $scope.temperature = Math.round(Weather.data.main.temp);
      $scope.weatherDescription = Weather.data.weather[0].description;
      $scope.city = Weather.data.name;
      $scope.icon_url = WEATHER.icon_url + Weather.data.weather[0].icon + ".png";

      //sync if forecast is null
      if (Weather.forecast === null) {
        syncForecast();
        //then sync forecast every 1.5 hours
        $interval(function () {
          syncForecast();
        }, 5.4e+6);
      }
    });

    //function to get forecast data from service
    var syncForecast = function () {
      Weather.syncForecast().then(function () {
        $scope.forecast = Weather.forecast.slice();
      });
    };
  })

  /**
   * Dashboard ROUTES Controller
   */

  .controller("RoutesCtrl", function ($scope, Directions) {
    $scope.routesOn = false;

    $scope.starting_point = null;
    $scope.destination = null;
    $scope.routes = [];

    //query routes from service
    $scope.getRoutes = function () {
      Directions.getDirections($scope.starting_point, $scope.destination)
        //if routes are successful
        .then(function (result) {
          //display routes
          $scope.displayRoutes(result);
          console.log(result);

          //if an error occurred
        }, function (err) {

          //display an alert
          var alertPopup = $ionicPopup.alert({
            title: "Error",
            template: err
          });
          alertPopup.then(function (res) {
            console.log(err);
          });
        });

      //TODO: swap it with a service
      $scope.getIcon = function (transport) {
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
    };

    //display routes
    $scope.displayRoutes = function (routes) {
      $scope.routes = routes;
      //console.log($scope.routes);
      $scope.routesOn = true;
    }

  })

  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })
  .controller('FriendsCtrl', function ($scope, Friends) {
    $scope.friends = Friends.all();
  })

  .controller('FriendCtrl', function ($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
  })

  .controller('ActivityCtrl', function ($scope, $filter, Activity, PointsCaloriesCalculator) {
    var currentUser = Parse.User.current();

    $scope.settings = {
      showCompleted: true
    };

    $scope.getToggleText = function () {
      switch ($scope.settings.showCompleted) {
        case(true):
          return "Completed Journeys";
          break;
        case(false):
          return "Journeys in progress";
          break;
      }
    };

    $scope.user = {
      name: currentUser.attributes.username,
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
      completedJourneys: Activity.all(),
      inProgress: Activity.inProgress()
    };

    $scope.labels = [];
    $scope.series = ['Points', 'Calories'];
    $scope.data = [
      [], []
    ];

    for (var i = 0; i < $scope.user.completedJourneys.length; i++) {
      // for(var journey in $scope.user.completedJourneys){
      //console.log($scope.user.completedJourneys[i]);
      var journey = $scope.user.completedJourneys[i];

      $scope.labels.push(journey.date);
      $scope.data[0].push(journey.points);
      $scope.data[1].push(journey.calories);
    }

    /*
     $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
     $scope.series = ['Points', 'Calories'];
     $scope.data = [
     [65, 59, 80, 81, 56, 55, 40], [28, 48, 40, 19, 86, 27, 90]
     ];*/
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };

    $scope.getJourneys = function () {
      //console.log($scope.user.completedJourneys[0]);

      if ($scope.settings.showCompleted === true) {
        return $scope.user.completedJourneys;
      } else {
        return $scope.user.inProgress;
      }
    };

    //TODO: add it in a service, need it for dashboard as well
    $scope.getIcon = function (transport) {
      if (transport === "walking") {
        return 'ion-android-walk';
      }
      if (transport === "cycling") {
        return 'ion-android-bicycle';
      }
      if (transport === "public transport") {
        return 'ion-android-bus';
      }
      if (transport === "car") {
        return 'ion-android-car';
      }
    };

    $scope.markComplete = function (journey) {
      Activity.markComplete(journey);
    };

    $scope.markIncomplete = function (journey) {
      Activity.markIncomplete(journey);
    };

  });
