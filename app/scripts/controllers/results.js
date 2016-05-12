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
  	apiResponseService,
  	ingestService,
  	resultsService) {

  	$( document ).ready(function() {
	  	// Call the env initialization routine
  		init();
	});

  	// PRIVATE FUNCTIONS AND METHODS.

	function init () {
		console.log("validationResults");
		console.log($scope.validationResults);

		$scope.specObj = specService.getSpec();
		// Control flag to show or hide upload section.
		$scope.isSpecLoaded = $.isEmptyObject(specService.getSpec()) ? false : true;
		$scope.apiResponseObj = apiResponseService.getApiResponse();
		$scope.ingestObj = ingestService.getIngestObj();
		$scope.searchField = "";
		$scope.allowResults = false;

		if ( !$.isEmptyObject($scope.specObj) && ( !$.isEmptyObject($scope.apiResponseObj) || !$.isEmptyObject($scope.ingestObj)) ) {
			$scope.allowResults = true;
		}

		if ( $scope.allowResults ) {
			$scope.validationResults = resultsService.getResults();
			$scope.specType = specService.getSpecType();
			$scope.resultType = resultsService.getResultType();
			$scope.vodAssetType = "";
			



			if ( $scope.resultType === "INGEST" ){
				if ( $scope.specType === "VOD" ) {

					$scope.vodAssetType = ingestService.getVodAssetType();
				} else if ($scope.specType === "EPG") {
					console.log("INGEST & EPG");
				}
			} else if ( $scope.resultType === "API" ) {

			}
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
				fieldClass = "label-success";
				break;
			case "NOK": //Field NOT present in Ingest or API file, but required.
				fieldClass = "label-danger";
				break;
			case "M&NR": //Missing & Not Required: Field NOT present in Ingest or API file, and NOT required.
				fieldClass = "label-warning";
				break;
			case "AFNS": //Api Field Not Specified in Spec: The info of the correspondant field in Kaltura's API is not in Spec.
				fieldClass = "label-warning";
				break;
			case "NIS": //Not In Spec: Field found in Kaltura's API but does not has a correspondant in Spec.
				fieldClass = "label-danger";
				break;
			default:
				fieldClass = "label-secondary";
		}
		return fieldClass;
	};

	$scope.focusOnSearchField = function () {
		$("#searchField").focus();
	};

	$scope.isResultsArrayEmpty = function ( resultsArray ) {
		return resultsArray.length === 0;
	};
});
