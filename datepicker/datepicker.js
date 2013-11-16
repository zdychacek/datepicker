(function (angular) {
	'use strict';
	
	var datePicker = angular.module('datepicker', []);

	datePicker.directive('datePicker', function () {

		function getData (date) {
			date = new Date(date || new Date());
			date.setDate(1);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);

			if (date.getDay() === 0) {
				date.setDate(-5);
			}
			else {
				date.setDate(date.getDate() - (date.getDay() - 1));
			}
			
			if (date.getDate() === 1) {
				date.setDate(-6);
			}

			var weeks = [];

			while (weeks.length < 6) {
				var week = [];

				for (var i = 0; i < 7; i++) {
					week.push(new Date(date));
					date.setDate(date.getDate() + 1);
				}
				weeks.push(week);
			}

			return weeks;
		};

		return {
			restrict: 'EA',
			scope: {
				from: '=',
				to: '=',
				monthsCount: '='
			},
			templateUrl: 'datepicker/datepicker.html',
			link: function (scope, element, attrs) {
				scope.currentViewDate = scope.from || new Date();
				scope.count = scope.monthsCount || 1;

				scope.$watch('currentViewDate', function (date) {
					var monthsData = [];

					for (var i = 0; i < scope.count; i++) {
						var currDate = new Date(date);

						currDate.setMonth(currDate.getMonth() + i);
						monthsData.push(getData(currDate));
					}

					scope.monthsData = monthsData;
				});

				scope.prev = function () {
					var prevDate = new Date(scope.currentViewDate);

					prevDate.setMonth(prevDate.getMonth() - 1);
					scope.currentViewDate = prevDate;
				};

				scope.next = function () {
					var nextDate = new Date(scope.currentViewDate);
					nextDate.setMonth(nextDate.getMonth() + 1);
					
					scope.currentViewDate = nextDate;
				};
			}
		};
	});

})(angular);