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
  	ingestService,
  	resultsService) {

  	// Call the env initialization routine
  	init();

  	// INTERNAL FUNCTIONS AND METHODS.

	function init () {
		
		$scope.searchField = "";
		$scope.validationResults = resultsService.getResults();
		console.log("validationResults");
		console.log($scope.validationResults);
		$scope.specType = specService.getSpecType();
		$scope.resultType = resultsService.getResultType();
		$scope.vodAssetType = "";

		if ( $scope.specType === "VOD" &&  $scope.resultType === "INGEST" ) {

			$scope.vodAssetType = ingestService.getVodAssetType();

		}
		
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
			case "OK": //Field present in Ingest or API file.
				fieldClass = "btn-success";
				break;
			case "NOK": //Field NOT present in Ingest or API file, but required.
				fieldClass = "btn-danger";
				break;
			case "M&NR": //Missing & Not Required: Field NOT present in Ingest or API file, and NOT required.
				fieldClass = "btn-warning";
				break;
			case "AFNS": //Api Field Not in Spec: The info of the correspondant field in Kaltura's API is not in Spec.
				fieldClass = "btn-warning";
				break;
			case "NIS": //Not In Spec: Field found in Kaltura's API but does not has a correspondant in Spec.
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

	$scope.isResultsArrayEmpty = function ( resultsArray ) {
		return resultsArray.length == 0;
	}
});
