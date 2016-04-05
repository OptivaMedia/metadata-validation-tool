'use strict';

/**
 * @ngdoc service
 * @name xmlvsApiValidationApp.service: apiResponseService
 * @description
 * # apiResponseService
 * Service of the xmlvsApiValidationApp. Gives any controller of the app
 * the apiResponse object and apiResponse files array, and all operations
 * over them, that have been uploaded by the user.
 */
angular.module('xmlvsApiValidationApp')
  .service('apiResponseService', function() {
	// Private apiResponse object structure
	var apiResponseObj = {};
	// Private api files structure
	var apiFilesArray = [];
	
	// Public object to offer
	var apiResponseService = {};
	// Api Response Api object operations

	// Provides the specification object as a Javascript object. 
	apiResponseService.getApiResponse = function() {
	  return apiResponseObj;
	};
	apiResponseService.setApiResponse = function(newApiResponse) {
	  apiResponseObj = newApiResponse;
	};
	apiResponseService.unsetApiResponse = function() {
	  apiResponseObj = {};
	};
	// API RESPONSE FILES OPERATIONS

	// Provides the API response as an array. 
	apiResponseService.getApiFilesArray = function() {
		return apiFilesArray;
	};
	// Set API response array
	apiResponseService.setApiFilesArray = function(newApiFilesArray) {
		apiFilesArray = [];
		apiFilesArray = newApiFilesArray;
	};
	//Add a API resonse file to the files array
	apiResponseService.addApiFile = function(apiFile) {
		apiFilesArray.push(apiFile);
	};
	// Unset apiResponse files array
	apiResponseService.unsetApiFilesArray = function(){
		apiFilesArray = [];
	};

	return apiResponseService;
});