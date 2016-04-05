'use strict';

/**
 * @ngdoc function
 * @name xmlvsApiValidationApp.controller:MainCtrl
 * @description
 * # ResultsCtrl
 * Controller of the xmlvsApiValidationApp
 */
angular.module('xmlvsApiValidationApp')
  .controller('ResultsCtrl', function (
  	$scope,
  	specService,
  	resultsService) {

  	// Call the env initialization routine
  	init();

  	// INTERNAL FUNCTIONS AND METHODS.

	function init () {
		console.log(resultsService.getResults());
			$scope.searchField = "";
			$scope.validationResults = resultsService.getResults();
			$scope.specType = specService.getSpecType();
			// Toggle active navbar component
	  	var selector = '.nav li';

		if(!$("#results-section").hasClass('active')) {
			$(selector).removeClass('active');
			$("#results-section").addClass('active');
		}
	}

	// FUNCTIONS AND METHODS AVAILABLE TO USE THROUGH $SCOPE

	$scope.fieldStatusClass = function (value) {
		var fieldClass= "";
		switch(value){
			case "OK":
				fieldClass = "btn-success";
				break;
			case "NOK":
				fieldClass = "btn-danger";
				break;
			case "AFNS":
				fieldClass = "btn-warning";
				break;
			case "NIS":
				fieldClass = "btn-danger";
				break;
			default:
				fieldClass = "btn-secondary";
		}
		return fieldClass;
	};

	$scope.focusOnSearchField = function () {
		$("#searchField").focus();
	};
});
