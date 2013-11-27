(function (angular) {
	'use strict';

	angular.module('directives.dateFormat', [])
		.directive('dateFormat', ['$filter', function ($filter) {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function (scope, el, attrs, ngModel) {
					var format = attrs.dateFormat;

					if (!format) {
						throw new Error('You must provide format description.');
					}

					ngModel.$formatters.push(function (value) {
						return $filter('date')(value, format);
					});

					ngModel.$parsers.push(function () {
						return ngModel.$modelValue;
					});
				}
			};
		}]);
})(angular);