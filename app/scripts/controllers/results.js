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

  		console.log(resultsService.getResults());
  		$scope.searchField = "";
  		$scope.validationResults = resultsService.getResults();
  		$scope.specType = specService.getSpecType();
  		// Toggle active navbar component
	  	var selector = '.nav li';

		if(!$(selector+":nth-child(3)").hasClass('active')) {
			$(selector).removeClass('active');
			$(selector+":nth-child(3)").addClass('active');
		}

  		$scope.fieldStatusClass = function(value){
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
  		}

  		$scope.focusOnSearchField = function(){
  			$("#searchField").focus();
  		}
});
