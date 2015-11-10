angular.module('starter.controllers', [])
  .controller('LoginCtrl', function($scope, $state, $ionicPopup) {

    $scope.data = {};

    $scope.signupEmail = function(){
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
      user.set("weight" , $scope.data.weight);
      user.signUp(null, {
        success: function(user) {
          // Hooray! Let them use the app now.
          var alertPopup = $ionicPopup.alert({
            title: 'Success!',
            template: 'You are signed up.'
          });
          $state.go('login');
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          var alertPopup = $ionicPopup.alert({
            title: 'Error!',
            template: "Error: " + error.code + " " + error.message
          });

          //alert("Error: " + error.code + " " + error.message);
        }
      });

    };

    $scope.loginEmail = function(){
      Parse.User.logIn($scope.data.username, $scope.data.password, {
        success: function(user) {
          // Do stuff after successful login.
          console.log(user);

          var alertPopup = $ionicPopup.alert({
            title: 'Success!',
            template: 'You are logged in.'
          });

          $state.go('tab.dash');

        },
        error: function(user, error) {
          // The login failed. Check error to see why.
          var alertPopup = $ionicPopup.alert({
            title: 'Error!',
            template: "Invalid username or password!"
          });

        }
      });
    };

  })
.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})
  .controller('FriendsCtrl', function($scope, Friends) {
    $scope.friends = Friends.all();
  })

  .controller('FriendCtrl', function($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
  })

.controller('ActivityCtrl', function($scope, $filter, Activity,PointsCaloriesCalculator) {
    var currentUser = Parse.User.current();

    $scope.settings = {
    showCompleted: true
  };

    $scope.getToggleText = function(){
      switch ($scope.settings.showCompleted){
        case(true):
          return  "Completed Journeys"
          break;
        case(false):
          return "Journeys in progress"
          break;
      }
    }


    $scope.user = {
      name: currentUser.attributes.username,
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
      completedJourneys: Activity.all(),
      inProgress:  Activity.inProgress()
    };

    $scope.labels = [];
    $scope.series = ['Points', 'Calories'];
    $scope.data = [
      [], []
    ];

    for(var i=0; i<$scope.user.completedJourneys.length; i++){
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

    $scope.getJourneys = function(){
      //console.log($scope.user.completedJourneys[0]);

      if($scope.settings.showCompleted === true){
        return $scope.user.completedJourneys;
      }else{
        return $scope.user.inProgress;
      }
    }

    $scope.getIcon = function(transport){
      if(transport === "walking"){
        return 'ion-android-walk';
      };
      if(transport === "cycling"){
        return 'ion-android-bicycle';
      };
      if(transport === "public transport"){
        return 'ion-android-bus';
      };
      if(transport === "car"){
        return 'ion-android-car';
      };
    };


    $scope.markComplete = function(journey) {
      Activity.markComplete(journey);
    };

    $scope.markIncomplete = function(journey) {
      Activity.markIncomplete(journey);
    };

});
