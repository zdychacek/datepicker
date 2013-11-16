var app = angular.module('app', ['datepicker']);

app.controller('AppCtrl', function ($scope) {
	$scope.from = new Date();
	$scope.to = new Date(2013, 11, 24);
});