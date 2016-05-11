'use strict';

/**
 * @ngdoc service
 * @name xmlvsApiValidationApp.service:ingestService
 * @description
 * # ingestService
 * Service of the xmlvsApiValidationApp. Gives any controller of the app access to the
 * the ingest object, the ingest files array and all operations over it, 
 * provided it has already been uploaded by the user.
 */
 
angular.module('xmlvsApiValidationApp')
  .service('ingestService', function() {
	
	// Private ingest object structure
	var ingestObj = {};
	// Private ingest files structure
	var ingestFilesArray = [];
	// Public object to offer
	var ingest = {};

	// Provides the ingest object as a Javascript object. 
	ingest.getIngestObj = function() {
		var resultObj = {};
		if( ingest.getIngestObjType() === "VOD" ) {
			resultObj = ingestObj.ADI;
		}
		else if( ingest.getIngestObjType() === "EPG" ) {
			resultObj = ingestObj.TV;
		}else{
			resultObj = ingestObj;
		}
		return resultObj;
	};
	ingest.setIngestObj = function(newIngestObj) {
	  ingestObj = newIngestObj;
	};
	ingest.unsetIngestObj = function() {
	  ingestObj = {};
	};
	ingest.getIngestObjType = function(){
		var type;
		if( ingestObj.ADI ) {
			type = "VOD";
		}
		else if( ingestObj.TV ) {
			type = "EPG";
		}
		return type;
	};

	ingest.getVodAssetType = function () {
		var assetType = "Unknown";
		if ( ingestObj.assetType ) {
			assetType = ingestObj.assetType;
		}
		return assetType;
	};

	ingest.setVodAssetType = function ( assetType ) {
		ingestObj.assetType = assetType;
	};

	// INGEST FILE OPERATIONS

	// Provides the ingest object as a Javascript array. 
	ingest.getIngestFilesArray = function() {
		return ingestFilesArray;
	};
	// Set ingest files array
	ingest.setIngestFilesArray = function(newingestFilesArray) {
		ingestFilesArray = [];
		ingestFilesArray = newingestFilesArray;
	};
	ingest.addIngestFile = function(ingestFile) {
		ingestFilesArray.push(ingestFile);
	};
	ingest.unsetIngestFilesArray = function() {
		ingestFilesArray = [];
	};
	ingest.getFileName = function() {
		var fileName = "";
		if ( ingestFilesArray.length === 1 ) {
			fileName = ingestFilesArray[0].name;
		}
		return fileName;
	};
	ingest.isFileTypeOk = function () {
		var response = false;
		if ( ingest.hasOwnProperty('fileTypeOk') ) {
			response = ingest.fileTypeOk;
		}
		return response;
	}
	ingest.setFileTypeOk = function (value) {
		ingest.fileTypeOk = value;
	}
	return ingest;
});