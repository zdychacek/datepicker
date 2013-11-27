(function (angular) {
	'use strict';

	var PRISTINE_CLASS = 'ng-pristine',
		DIRTY_CLASS = 'ng-dirty';

	angular.module('directives.dateInput', [])
		.constant('dateInputConfig', {
			template: function (attrs) {
				return '<date-picker value="' + attrs.ngModel + '" class="menu" months-count="' + attrs.monthsCount + '"></date-picker>';
			},
			dateFormat: 'd.M.yyyy',
			dismiss: true,
			position: 'relative'
		})
		.directive('dateInput', [
			'$compile',
			'$window',
			'$filter',
			'dateInputConfig',
			'$parse',
		function ($compile, $window, $filter, dateInputConfig, $parse) {
			var body = $window.document.body;

			return {
				require: 'ngModel',
				scope: true,
				link: function (scope, element, attrs, ngModel) {
					var format = attrs.dateFormat || dateInputConfig.dateFormat,
						position = attrs.position || dateInputConfig.position,
						parentForm = element.inheritedData('$formController'),
						dismiss = attrs.dismiss ? $parse(attrs.dismiss)(scope) : dateInputConfig.dismiss,
						picker = null;

					ngModel.$formatters.push(function (value) {
						return $filter('date')(value, format);
					});

					ngModel.$parsers.push(function () {
						return ngModel.$modelValue;
					});

					var template = dateInputConfig.template(attrs);

					function hidePicker () {
						if (picker) {
							picker.remove();
							picker = null;
						}
					}

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

							dismiss && hidePicker();
						});

						scope.$on('$destroy', hidePicker);

						// napozicovani dropdownu
						if (position == 'absolute') {
							var rect = element[0].getBoundingClientRect(),
								height = element[0].offsetHeight;

							picker.css({
								top: $window.scrollY + rect.top + height + 'px',
								left: $window.scrollX + rect.left + 'px',
								display: 'block',
								position: 'absolute'
							});
							body.append(picker);
						}
						else {
							element[0].parentNode.insertBefore(picker[0], element[0].nextSibling);
						}

						picker.bind('mousedown', function (evt) {
							evt.preventDefault();
						});
					}

					element.bind('focus', showPicker);
					element.bind('blur', hidePicker);
				}
			};
		}]);
})(angular);