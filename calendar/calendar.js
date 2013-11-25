(function (angular) {
	'use strict';
	
	var calendar = angular.module('calendar', []);

	calendar.directive('dateFormat', ['$filter', function ($filter) {
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
	}])

	calendar.controller('CalendarCtrl', function () {
		var currentRangeSelection;

		this.setCurrentRangeSelection = function (selection) {
			currentRangeSelection = selection;
		};

		this.getCurrentRangeSelection = function () {
			return currentRangeSelection;
		};				
	})

	calendar.directive('dateRangeSelector', ['$timeout', '$document', function ($timeout, $document) {
		return {
			restrict: 'EA',
			templateUrl: 'calendar/daterangeselector.html',
			controller: 'CalendarCtrl',
			scope: {
				onShowHide: '&',
				from: '=',
				to: '='
			},
			link: function (scope, element, attrs, ctrl) {
				var fromInput = element[0].querySelector('input[name="from"]'),
					toInput = element[0].querySelector('input[name="to"]');

				scope.isCalendarVisible = null;

				scope.$watch('isCalendarVisible', function (isVisible) {
					if (isVisible !== null && scope.onShowHide) {
						scope.onShowHide()(isVisible, scope.from, scope.to);
					}
				});

				scope.setRangeSelection = function (rangeToSelect) {
					ctrl.setCurrentRangeSelection(rangeToSelect);
					scope.currentRangeSelection = ctrl.getCurrentRangeSelection();
					scope.isCalendarVisible = true;
				};

				scope.$watch(function () {
					return ctrl.getCurrentRangeSelection();
				}, function (val) {
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

				$document.on('click', function () {
					scope.$apply('isCalendarVisible = false');
				});

				// stopnu bublani udalosti
				element.on('click', function (e) {
					e.stopPropagation();
				});
			}
		};
	}])

	calendar.directive('datePicker', [function () {
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
			require: '^?dateRangeSelector',
			replace: true,
			scope: {
				from: '=',
				to: '=',
				value: '=',
				selection: '=',
				monthsCount: '=',
				rangeSelection: '='
			},
			templateUrl: 'calendar/datepicker.html',
			link: function (scope, element, attrs, ctrl) {
				var rangeMode = (scope.from && scope.to)? true : false,
					disableFutureSelection = (typeof attrs.disableFutureSelection !== 'undefined')? true : false;

				scope.currentViewDate = scope.from || scope.model || new Date();
				scope.count = scope.monthsCount || 1;

				if (rangeMode) {
					scope.modelFrom = new Date(scope.from || new Date());
					scope.modelTo = new Date(scope.to || new Date());
					scope.currentRangeSelection = scope.rangeSelection || null;

					if (ctrl) {
						ctrl.setCurrentRangeSelection(scope.currentRangeSelection);
					}
				}
				else {
					scope.model = new Date(scope.value || new Date());					
				}

				if (ctrl) {
					scope.$watch(function () {
						return ctrl.getCurrentRangeSelection();
					}, function (currentlySelected, prevSelected) {
						scope.currentRangeSelection = currentlySelected;
						element
							.removeClass('range-' + prevSelected)
							.addClass('range-' + currentlySelected);
					});
				}

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

				scope.$watch('currentViewDate', computeViewDates);

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

				scope.selectDay = function (day) {
					if (rangeMode) {
						if (scope.currentRangeSelection == 'to') {
							scope.modelTo = new Date(day);

							if (day < scope.modelFrom) {
								scope.modelFrom = new Date(day);
							}

							scope.currentRangeSelection = 'from';
							scope.to && (scope.to = scope.modelTo);
						}
						else {
							scope.modelFrom = new Date(day);

							if (day > scope.modelTo) {
								scope.modelTo = new Date(day);
							}

							scope.from && (scope.from = scope.modelFrom);
							scope.currentRangeSelection = 'to';
						}

						if (ctrl) {
							ctrl.setCurrentRangeSelection(scope.currentRangeSelection);
						}

						scope.rangeSelection && (scope.rangeSelection = scope.currentRangeSelection);
					}
					else {
						scope.model = new Date(day)
						scope.value && (scope.value = scope.model);
					}
				};

				scope.isDayWithinMonth = function (day, month) {
					return day.getMonth() == month.getMonth();
				};

				scope.isDaySelected = function (day) {
					if (rangeMode) {
						return normalizeDate(scope.modelFrom) <= day && normalizeDate(scope.modelTo) >= day;
					}
					else {
						return normalizeDate(scope.model).getTime() == day.getTime();
					}
				};

				scope.isDayDisabled = function (day) {
					return disableFutureSelection && isDayInFuture(day);
				};
			}
		};
	}]);

})(angular);