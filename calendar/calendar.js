(function (angular) {
	'use strict';

	var PRISTINE_CLASS = 'ng-pristine',
    	DIRTY_CLASS = 'ng-dirty';
		
	var calendar = angular.module('calendar', []);

	calendar.constant('calendarConfig', {
		template: function (attrs) {
			return [
				'<date-picker ',
				'value="' + attrs.ngModel + '" ',
				'class="menu" months-count="' + attrs.monthsCount + '"></date-picker>'
			].join('');
		},
		dateFormat: 'd.M.yyyy',
		dismiss: true,
		position: 'relative'
	})

	calendar.directive('dateTime', ['$compile', '$document', '$filter', 'calendarConfig', '$parse', function ($compile, $document, $filter, calendarConfig, $parse) {
		var body = $document.find('body');

		return {
			require: 'ngModel',
			scope: true,
			link: function (scope, element, attrs, ngModel) {
				var format = attrs.dateFormat || calendarConfig.dateFormat,
					parentForm = element.inheritedData('$formController'),
					dismiss = attrs.dismiss ? $parse(attrs.dismiss)(scope) : calendarConfig.dismiss,
					picker = null,
					position = attrs.position || calendarConfig.position;

				ngModel.$formatters.push(function (value) {
					return $filter('date')(value, format);
				});

				ngModel.$parsers.push(function () {
					return ngModel.$modelValue;
				});

				var template = calendarConfig.template(attrs);

				function clear () {
					if (picker) {
						picker.remove();
						picker = null;
					}
				};

				function showPicker () {
					if (picker) {
						return;
					}

					picker = $compile(template)(scope);
					scope.$digest();

					scope.$on('setDate', function (event) {
						event.stopPropagation();

						if (ngModel.$pristine) {
							ngModel.$dirty = true;
							ngModel.$pristine = false;
							element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
							
							if (parentForm) {
								parentForm.$setDirty();
							}
							ngModel.$render();
						}

						if (dismiss) {
							clear();
						}
					});

					scope.$on('$destroy', clear);

					// napozicovani dropdownu
					var rect = element[0].getBoundingClientRect(),
						height = element[0].offsetHeight;

					picker.css({
						top: window.scrollY + rect.top + height + 'px',
						left: window.scrollX + rect.left + 'px',
						display: 'block',
						position: 'absolute'
					});
					body.append(picker);

					picker.bind('mousedown', function (evt) {
						evt.preventDefault();
					});
				}

				element.bind('focus', showPicker);
				element.bind('blur', clear);
			}
		};
	}])

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
					toInput = element[0].querySelector('input[name="to"]'),
					picker = null;

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