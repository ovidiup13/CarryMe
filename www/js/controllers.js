angular.module('starter.controllers', ['ksSwiper'])
  .controller('LoginCtrl', function ($scope, $state, $ionicPopup, $ionicLoading) {
    $scope.data = {};

    var showLoading = function () {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 50,
        showDelay: 0
      });
    };

    var hideLoading = function () {
      $ionicLoading.hide();
    };

    $scope.signupEmail = function () {

      showLoading();

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
          hideLoading();

          // Hooray! Let them use the app now.
          var alertPopup = $ionicPopup.alert({
            title: 'Success!',
            template: 'You are signed up. Now, let\'s sign in!'
          });

          $state.go('login');
        },
        error: function (user, error) {
          hideLoading();
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
      showLoading();

      Parse.User.logIn($scope.data.username, $scope.data.password, {
        success: function (user) {
          // Do stuff after successful login.
          console.log(user);

          hideLoading();

          /*var alertPopup = $ionicPopup.alert({
            title: 'Success!',
            template: 'You are logged in.'
           });*/

          $state.go('tab.dash');

        },
        error: function (user, error) {
          hideLoading();

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

    $scope.weather = {};
    $scope.forecast = [];

    $scope.backgroundImage = "https://c1.staticflickr.com/9/8653/16481454470_2c2c7dbaf0.jpg";


    $scope.setImage = function(){
      if($scope.weather.icon_url.indexOf("sun") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "http://bucurestifm.ro/wp-content/uploads/sites/2/2015/04/5400420353_71ce5e6af8_z.jpg";
      }
      if($scope.weather.icon_url.indexOf("rain") > -1 || $scope.weather.icon_url.indexOf("sprinkle") > -1 || $scope.weather.icon_url.indexOf("shower") > -1 ){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "http://newsfirst.lk/english/wp-content/uploads/2014/10/weather_flood-626x380.jpg";
      }
      if($scope.weather.icon_url.indexOf("cloud") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "https://i.ytimg.com/vi/BZyDf1b5uPE/maxresdefault.jpg";
      }
      if($scope.weather.icon_url.indexOf("hail") > -1||$scope.weather.icon_url.indexOf("sleet") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "http://images.scribblelive.com/2014/10/7/7bd36e32-fd7e-4f2b-9c9c-353e8aed01e0.jpg";
      }
      if($scope.weather.icon_url.indexOf("haze") > -1||$scope.weather.icon_url.indexOf("fog") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "http://static.tumblr.com/cf1335af491e6b930efc87b771db93c6/oqsrjcf/4Tonsl0x9/tumblr_static_aqtqunneso8ossccgs0owk044.jpg";
      }
      if($scope.weather.icon_url.indexOf("wind") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "https://c2.staticflickr.com/4/3735/11220254873_d0683c0e2e_b.jpg";
      }
      if($scope.weather.icon_url.indexOf("snow") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = " https://edshunnybunny.files.wordpress.com/2010/02/snow-pics-015.jpg";
      }
      if($scope.weather.icon_url.indexOf("lightning") > -1){
        //$scope.backgroundImage = "http://static3.crated.com/NdTlmEL7NDNjph4Qo5I7xVyHGSM=/fit-in/960x960/filters:quality(90)/crated/thumbs/art/2014/07/24/2ed04261c301107da99535c5adb9517a/960.jpg";
        $scope.backgroundImage = "http://www.lightningsafety.noaa.gov/photos/Lightning%202a.jpg";
      }


    }

    $scope.syncWeather = function () {
      Weather.sync().then(function (data) {

        $scope.weather = data;
        $scope.setImage();
        console.log("WEATHER" + $scope.weather.icon_url);
        //refresh complete
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    //sync current weather
    Weather.sync().then(function (data) {

      $scope.weather = data;
      $scope.setImage();
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
      Weather.syncForecast().then(function (data) {
        $scope.forecast = data;
      });
    };
  })

  /**
   * Dashboard ROUTES Controller
   */

  .controller("RoutesCtrl", function ($scope, Directions, $ionicLoading, $ionicPopup, $ionicScrollDelegate) {
    $scope.routesOn = false;

    var showLoading = function () {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 50,
        showDelay: 0
      });
    };

    var hideLoading = function () {
      $ionicLoading.hide();
    };

    $scope.starting_point = null;
    $scope.destination = null;
    $scope.routes = [];

    //query routes from service
    $scope.getRoutes = function () {
      showLoading();
      Directions.getDirections($scope.starting_point, $scope.destination)
        //if routes are successful
        .then(function (result) {
          //display routes
          $scope.displayRoutes(result);

          console.log(JSON.stringify(result));

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
    };

    //display routes
    $scope.displayRoutes = function (routes) {

      $scope.routes = routes;

      $scope.routesOn = true;
      hideLoading();
      $ionicScrollDelegate.scrollBottom(true);
    }

  })

  .controller("CardCtrl", function ($scope, Cards) {

    $scope.card = Cards.getRandomCard();

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

  .controller('ActivityCtrl', function ($scope, $filter, Activity) {
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

    $scope.markComplete = function (journey) {
      Activity.markComplete(journey);
    };

    $scope.markIncomplete = function (journey) {
      Activity.markIncomplete(journey);
    };

  })
  .controller('SettingsCtrl', function($scope, $state) {
    $scope.logout = function(){
      Parse.User.logOut();
      $state.go('login');
    }
  })
;
