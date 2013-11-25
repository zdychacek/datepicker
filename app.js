var app = angular.module('app', ['calendar']);

app.controller('AppCtrl', function ($scope) {
	$scope.from = new Date(2013, 9, 12);
	$scope.to = new Date(2013, 10, 18);

	$scope.minSelection = new Date(2013, 09, 3);
	$scope.maxSelection = new Date(2013, 11, 20);

	$scope.date = new Date();

	$scope.onShowHide = function (isVisible, from, to) {
		console.log('onShowHide', arguments);
	};
});