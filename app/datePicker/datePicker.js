(function (angular) {
	'use strict';

	angular.module('directives.datePicker', [])
		.directive('datePicker', [function () {
			// helpers
			var getData = function (date) {
				date = new Date(date || new Date());
				
				date.setDate(1);
				normalizeDate(date, true);

				var firstDayOfMonth = new Date(date);

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

				return {
					firstDayOfMonth: firstDayOfMonth,
					weeks: weeks
				};
			};

			var normalizeDate = function (date, dontCreateNewDate) {
				var d = dontCreateNewDate ? date : new Date(date) ;

				['Hours', 'Minutes', 'Seconds', 'Milliseconds'].forEach(function (name) {
					d['set' + name](0);
				});

				return d;
			};

			var isDayInFuture = function (day) {
				return day > new Date();
			};

			// direktiva
			return {
				restrict: 'EA',
				replace: true,
				scope: {
					from: '=',
					to: '=',
					value: '=',
					selection: '=',
					monthsCount: '=',
					rangeSelection: '='
				},
				templateUrl: '/datePicker/datePicker.html',
				link: function (scope, element, attrs, ctrl) {
					var disableFutureSelection = (typeof attrs.disableFutureSelection !== 'undefined')? true : false,
						isRangeSelectionMode = (scope.from && scope.to)? true : false;

					// pokud je vybrano obdobi spadajiciho do stejneho mesice, tak kalendar vycentruji
					var centerView = function () {
						if (scope.modelFrom.getMonth() == scope.modelTo.getMonth()) {
							var startMonthDate = new Date(scope.modelFrom);
							
							startMonthDate.setMonth(startMonthDate.getMonth() - Math.floor(scope.count / 2));
							scope.currentViewDate = startMonthDate;
						}
						else {
							scope.currentViewDate = scope.modelFrom;
						}
					};

					var computeViewDates = function (date) {
						var monthsData = [];

						for (var i = 0; i < scope.count; i++) {
							var currDate = new Date(date),
								monthNum = currDate.getMonth() + i;

							currDate.setMonth(monthNum);
							monthsData.push(getData(currDate));
						}

						scope.monthsData = monthsData;
					};

					scope.count = scope.monthsCount || 1;
					scope.$watch('currentViewDate', computeViewDates);
					scope.$watch('currentRangeSelection', function (current, prev) {
						element.removeClass('range-' + prev).addClass('range-' + current);
					});

					scope.$on('setRangeSelection', function (e, selection) {
						scope.currentRangeSelection = selection;
					});	

					if (isRangeSelectionMode) {
						scope.modelFrom = new Date(scope.from || new Date());
						scope.modelTo = new Date(scope.to || new Date());
						scope.currentRangeSelection = scope.rangeSelection || null;

						scope.$on('centerView', centerView);
					}
					else {
						scope.model = new Date(scope.value || new Date());					
						scope.currentViewDate = scope.model ;
					}

					scope.prev = function (e) {
						e.preventDefault();
						var prevDate = new Date(scope.currentViewDate);

						prevDate.setMonth(prevDate.getMonth() - 1);
						scope.currentViewDate = prevDate;
					};

					scope.next = function (e) {
						e.preventDefault();
						var nextDate = new Date(scope.currentViewDate);
						nextDate.setMonth(nextDate.getMonth() + 1);
						
						scope.currentViewDate = nextDate;
					};

					scope.selectDay = function (day, e) {
						e.preventDefault();

						scope.$emit('setDate', day);

						if (isRangeSelectionMode) {
							if (scope.currentRangeSelection == 'to') {
								scope.modelTo = new Date(day);

								if (day < scope.modelFrom) {
									scope.modelFrom = new Date(day);
								}

								scope.currentRangeSelection = 'from';
							}
							else {
								scope.modelFrom = new Date(day);

								if (day > scope.modelTo) {
									scope.modelTo = new Date(day);
								}

								scope.currentRangeSelection = 'to';
							}

							scope.$emit('rangeSelectionChanged', scope.currentRangeSelection);

							scope.from && (scope.from = scope.modelFrom);
							scope.to && (scope.to = scope.modelTo);
							scope.rangeSelection && (scope.rangeSelection = scope.currentRangeSelection);
						}
						else {
							scope.model = new Date(day);
							scope.value && (scope.value = scope.model);
						}
					};

					scope.isDayWithinMonth = function (day, month) {
						return day.getMonth() == month.getMonth();
					};

					scope.isDaySelected = function (day) {
						if (isRangeSelectionMode) {
							return normalizeDate(scope.modelFrom) <= day && normalizeDate(scope.modelTo) >= day;
						}
						else {
							return normalizeDate(scope.model).getTime() == day.getTime();
						}
					};

					scope.isDayDisabled = (function () {
						if (!disableFutureSelection) {
							return angular.noop;
						}
						else {
							return function (day) {
								return isDayInFuture(day);
							};
						}
					})();
				}
			};
		}]);
})(angular);