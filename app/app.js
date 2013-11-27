(function (angular) {
	var app = angular.module('app', [
		'directives.datePicker',
		'directives.dateRangePicker',
		'directives.dateFormat',
		'directives.dateInput'
	]);

	app.controller('AppCtrl', function ($scope) {
		$scope.from = new Date();
		$scope.to = new Date();

		$scope.date = new Date();
	});
})(angular);