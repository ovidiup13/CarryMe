angular.module('starter.controllers', [])

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

.controller('ActivityCtrl', function($scope,  $ionicActionSheet, Activity) {
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
      name: "Ben",
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
      completedJourneys: Activity.all(),
      inProgress:  Activity.inProgress()
    };

    $scope.getJourneys = function(){
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
