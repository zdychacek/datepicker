var app = angular.module('app', ['calendar']);

app.controller('AppCtrl', function ($scope) {
	$scope.from = new Date(2013, 9, 12);
	$scope.to = new Date(2013, 10, 18);

	$scope.date = new Date();
});