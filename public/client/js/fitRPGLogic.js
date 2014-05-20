var fitApp = angular.module('fitApp', []);

fitApp.controller('profileArea', ['$scope', '$http', function($scope, $http) {
	$http.get('/profile')
		.success(function(data) {
			console.log('here');
			$scope.prof = data;
			console.log("profile",data);
		});
}]);

fitApp.controller('allStats', ['$scope', '$http', function($scope, $http) {
	$http.get('/allStats')
		.success(function(data) {
			$scope.stats = data;
		});
}]);

fitApp.controller('allFriends', ['$scope', '$http', function($scope, $http) {
	$http.get('/friends')
		.success(function(data) {
			$scope.friends = data;
		});
}]);



// fitApp.controller('allData', ['$scope', '$http', function($scope, $http) {
// 	$http.get('/allData')
// 		.success(function(data) {
// 			console.log("alldata",data);
// 		});
// }]);

// fitApp.controller('friends', ['$scope', '$http', function($scope, $http) {
// 	$http.get('/friends')
// 		.success(function(data) {
// 			console.log("friends",data);
// 		});
// }]);

