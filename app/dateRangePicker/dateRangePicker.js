(function (angular) {
	'use strict';

	angular.module('directives.dateRangePicker', [])
		.directive('dateRangePicker', ['$timeout', '$document', function ($timeout, $document) {
			return {
				restrict: 'EA',
				templateUrl: '/dateRangePicker/dateRangePicker.html',
				scope: {
					from: '=',
					to: '='
				},
				link: function (scope, element, attrs) {
					var fromInput = element[0].querySelector('input[name="from"]'),
						toInput = element[0].querySelector('input[name="to"]'),
						picker = null;

					scope.isCalendarVisible = null;

					scope.setRangeSelection = function (rangeToSelect) {
						scope.$broadcast('setRangeSelection', rangeToSelect);
						scope.currentRangeSelection = rangeToSelect;
						scope.isCalendarVisible = true;
					};

					scope.$on('rangeSelectionChanged', function (e, val) {
						if (val == 'from') {
							$timeout(function () {
								fromInput.focus();
							});
						}
						else if (val == 'to') {
							$timeout(function () {
								toInput.focus();
							});
						}
					});

					scope.$watch('isCalendarVisible', function (isVisible) {
						isVisible && scope.$broadcast('centerView');
					});

					$document.on('click', function () {
						scope.$apply('isCalendarVisible = false');
					});
					
					element.on('click', function (e) {
						e.stopPropagation();
					});
				}
			};
		}]);
})(angular);