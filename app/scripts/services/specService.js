'use strict';

/**
 * @ngdoc service
 * @name xmlvsApiValidationApp.service:specService
 * @description
 * # specService
 * Service of the xmlvsApiValidationApp. Gives any controller of the app access to the
 * the specification object, the specification files array and all operations over it, 
 * provided it has already been uploaded by the user.
 */
 
angular.module('xmlvsApiValidationApp')
  .service('specService', function() {
	// Private spec object structure
	var specObj = {};
	// Private spec files structure
	var specFilesArray = [];

	// Public object to offer
	var spec = {};
	// Provides the specification object as a Javascript object. 
	spec.getSpec = function() {
		var resultSpec = {};
		if( specObj.VODspec ) {
			resultSpec = specObj.VODspec;
		}
		else if( specObj.EPGspec ) {
			resultSpec = specObj.EPGspec;
		}else{
			resultSpec = specObj;
		}
		return resultSpec;
	};
	spec.setSpec = function(newSpec) {
	  specObj = newSpec;
	};
	spec.unsetSpec = function() {
	  specObj = {};
	};
	spec.getSpecType = function(){
		var type;
		if( specObj.VODspec ) {
			type = "VOD";
		}
		else if( specObj.EPGspec ) {
			type = "EPG";
		}
		return type;
	}

	// SPEC FILE OPERATIONS

	// Provides the specification object as a Javascript array. 
	spec.getSpecFilesArray = function() {
		return specFilesArray;
	};
	// Set specification files array
	spec.setSpecFilesArray = function(newSpecFilesArray) {
		specFilesArray = [];
		specFilesArray = newSpecFilesArray;
	};
	spec.addSpecFile = function(specFile) {
		specFilesArray.push(specFile);
	};

	return spec;
});