var app = angular.module('app', ['calendar']);

app.controller('AppCtrl', function ($scope) {
	$scope.from = new Date();
	$scope.to = new Date();

	$scope.date = new Date();
});