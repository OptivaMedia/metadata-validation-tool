'use strict';

/**
 * @ngdoc function
 * @name xmlvsApiValidationApp.controller:IngestCtrl
 * @description
 * # IngestCtrl
 * Controller of the xmlvsApiValidationApp
 */
angular.module('xmlvsApiValidationApp')
  .controller('IngestCtrl', function (
  	$scope,  
  	Upload, 
  	$timeout, 
  	$location, 
  	specService,
  	apiResponseService,
  	ingestService,
  	resultsService) {
    
  	var xmlToJsonDepthCount = 0;

  	$( document ).ready(function() {
	  	// Call the env initialization routine
  		init();
	});
  	
  	// PRIVATE FUNCTIONS AND METHODS.

	function init () {
		console.log("ENTRA-init()");
		// Getting the uploadedFiles array
		$scope.files = ingestService.getIngestFilesArray();
		// Control flag to show or hide upload section.
		$scope.isSpecLoaded = $.isEmptyObject(specService.getSpec()) ? false : true;
		$scope.ingestFileUploaded = $.isEmptyObject(ingestService.getIngestObj()) ? false : true;
	    // Error alerts enabled in initial state
	    $scope.enableErrorAlerts = true;
    	$scope.notEPG = false;
    	$scope.notVOD = false;
    	$scope.uploadError = false;

    	$scope.fileTypeOk = ingestService.isFileTypeOk();

		// Toggle active navbar component
	  	var selector = '.nav li';

		if(!$("#ingest-section").hasClass('active')) {
			$(selector).removeClass('active');
			$("#ingest-section").addClass('active');
		}
	}

	function getEPGIngestFields () { 
		console.log("ENTER-getEPGIngestFields()");
		var epgAllEventsFieldsArray = [],
			epgEventFieldsObj 		= [],
			txtIndex				= -1,
			attributesIndex			= -1,
			noIdCounter 			= 0, 		//Counter for no id, no title events.
			epgIngestObj 			= (ingestService.getIngestObj()).programme,
			eventTitle,
			eventId;

		console.log("epgIngestObj");
		console.log(epgIngestObj);

		if ( epgIngestObj ) {
			$.each( epgIngestObj, function ( index, fieldsObj ) {
				// Obtain all keys from fields object
				epgEventFieldsObj.fieldsArray = Object.keys(fieldsObj);

				// remove undesired items from EPG single event fields obj
				txtIndex 		= epgEventFieldsObj.fieldsArray.indexOf("#text");
				attributesIndex = epgEventFieldsObj.fieldsArray.indexOf("@attributes");
				if ( txtIndex > -1 ) {
					epgEventFieldsObj.fieldsArray.splice(txtIndex, 1);
				}
				if ( attributesIndex > -1 ) {
					epgEventFieldsObj.fieldsArray.splice(attributesIndex, 1);
				}

				// get keys from '@attributes' object
				if ( fieldsObj["@attributes"] ) {
					$.merge(epgEventFieldsObj.fieldsArray, Object.keys(fieldsObj["@attributes"]));
				}
				// Getting title of event, to use it as obj keys.
				if ( fieldsObj.title ) {
					eventTitle = fieldsObj.title["#text"];	
				} 
				if ( fieldsObj.program_id ) {
					eventId = fieldsObj.program_id["#text"];
				}
				
				// Set event name, mixing event title and program id, depending on the fields we find
				if ( eventTitle ) {
					
					epgEventFieldsObj.name = eventId ?  eventTitle + "|" + eventId : eventTitle + "|NoId#" + noIdCounter++;

				} else {
					epgEventFieldsObj.name = eventId ? eventId : "|NoId#" + noIdCounter++;
				}
				// Add single event fields obj to all events obj.
				epgAllEventsFieldsArray.push(epgEventFieldsObj);
				epgEventFieldsObj = {}; //Resetting result obj.
				eventTitle = null;
				eventId = null;
				txtIndex = -1;
				attributesIndex = -1;
			} );
			console.log("epgAllEventsFieldsArray");
			console.log(epgAllEventsFieldsArray);
		}
		return epgAllEventsFieldsArray;
	}

	// Function that processes de XML ingest file and gets its present fields.
    function getVODIngestFields () {
		console.log("ENTRA-getVODIngestFields()");
    	var ingestAssets = [],
    		assetClass = "", // Placeholder for the asset class in turn
    		assetAMS,
    		assetAMSfieldsObj = {},
    		assetAppData,
    		fieldsSingleArray = [],
    		assetAppDataFieldsObj = {},
    		ingestFieldsArraysObj = {}; // Result object to return.

		if ( ingestService.getIngestObj() ) {    	
			
			// First level: Put Asset Package into array structure
			ingestAssets.push([ingestService.getIngestObj()]);
			// Middle level: Put Asset Title into array structure
			ingestAssets.push([ingestService.getIngestObj().Asset]);
			/*Deepest level: Assets (movie, still-images )
			into array structure*/
			ingestAssets.push(ingestService.getIngestObj().Asset.Asset);

			// Extract fieds of each asset section.
			$.each ( ingestAssets,  function ( index, assetElement) {
				if ( assetElement ) {
					$.each( assetElement, function ( index, asset ) {
						assetAMS = asset.Metadata.AMS["@attributes"];
						assetClass = assetAMS.Asset_Class;
						if ( assetAMS ) {
							// Storing AMS fields of each asset sections
							assetAMSfieldsObj[assetClass] = Object.keys(assetAMS);
						}
						// reset AMS placeholder
						assetAMS = null;
						assetAppData = asset.Metadata.App_Data;
						if ( assetAppData ) {
							if ( assetAppData.constructor === Array ) {
								$.each( assetAppData, function ( index, appData ) {
									if ( appData["@attributes"].Name ) {
										// Storing appData fields of each asset sections
										fieldsSingleArray.push(appData["@attributes"].Name);
									}
								} );
							} else if ( assetAppData.constructor !== Array && typeof assetAppData === 'object' ) {
								// Storing appData fields of each asset sections
								fieldsSingleArray.push(assetAppData["@attributes"].Name);
							}
							// Storing appData fieldArrays
							assetAppDataFieldsObj[assetClass] = fieldsSingleArray;
						}
						assetAppData = null;
						fieldsSingleArray = [];
					} );
					// Setting return obj with fields arrays.
					ingestFieldsArraysObj.assetAMSfieldsObj = assetAMSfieldsObj;
					ingestFieldsArraysObj.assetAppDataFieldsObj = assetAppDataFieldsObj;
				}
			} );
	    }
	    return ingestFieldsArraysObj;
    }

	// Changes XML to JSON
	var xmlToJson = function (xml) {
		
		console.log("ENTRA-xmlToJson()");

		// Increase depth level of the function
		xmlToJsonDepthCount++;

		// Create the return object
		var obj = {};

		if (xml.nodeType === 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType === 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) === "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) === "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}

		// Decrease depth level of the function
		xmlToJsonDepthCount--;
		// Callback to process obj, when recursive function is done.
		if ( xmlToJsonDepthCount === 0 ) {			
			processIngestJson(obj);
		}

		return obj;
	};

	function goToResultsSection () {
    	$location.url('/results');
    }

    function enableResultsNavSection () {
    	console.log("FUNCTION: enableResultsNavSection");
		//Enable API section
		$("#results-section").removeClass("disabled");
		$("#results-section").removeProp("disabled");
	}

	function enableApiNavSection () {
		console.log("ENTRA-enableApiNavSection()");
		//Enable API section
		$("#api-section").removeClass("disabled");
		$("#api-section").removeProp("disabled");
	}

	function disableApiNavSection () {
		// Unset apiResponse data structures
		apiResponseService.unsetApiResponse();
		apiResponseService.unsetApiFilesArray();
		// Disable API section
		$("#api-section").addClass('disabled');
	}

	function disableResultsSection () {
		// Unset results data structures
		resultsService.unsetResults();
		// Disable API section
		$("#results-section").addClass('disabled');
	}
	
	function extractVodAssetType () {
		var type = "",
			ingestObj = ingestService.getIngestObj(), 
			App_Data = ingestObj.Asset.Metadata.App_Data;
		if ( App_Data ) {
			if ( App_Data.constructor === Array && App_Data.length > 0) {
				$.each( App_Data, function ( index, appDataObj ) {
					if( appDataObj["@attributes"].Name && appDataObj["@attributes"].Name === "Media_type" ) {
						type = appDataObj["@attributes"].Value;
					}
				} );
			} else if ( typeof App_Data === "object" && !$.isEmptyObject(App_Data) ) {
				if( App_Data["@attributes"].Name && App_Data["@attributes"].Name === "Media_type" ) {
					type = App_Data["@attributes"].Value;
				} 
			}
		}

		return type;
	}

	function checkIngestFields ( field, assetType, fieldProperties, fieldsArray ) {
		
		var status = "Unknown",
			required;

		if ( fieldProperties["@attributes"] ) {

			required = fieldProperties["@attributes"].required ? fieldProperties["@attributes"].required : "";
			// Checking if field is mandatory, for regular assets or episodes.
			if ( required === "Y" ) {
				
				// Checking presence of AMS field in Ingest file.
				status = $.inArray(field, fieldsArray) >= 0 ? "OK" : "NOK";

			} else if ( required === "N" ) {
				
				status = $.inArray(field, fieldsArray) >= 0 ? "OK" : "M&NR";

			} else if ( required === "E" ) {
				
				if ( assetType === "Episode" ) { // Asset is episode.
	    			status = $.inArray(field, fieldsArray) >= 0 ? "OK" : "NOK";
	    		} else  {
	    			status = $.inArray(field, fieldsArray) >= 0 ? "OK" : "M&NR";
	    		}
			}
		}
		return status;
	}

	// PUBLIC FUNCTIONS AND METHODS AVAILABLE THROUGH $SCOPE

	$scope.goToResultsSection = function () {
		console.log("ENTRA-goToResultsSection()");
    	$location.url('/results');
    };

	// Watching uploads from the user
    $scope.$watch('file', function () {
    	console.log("$scope.$watch -> $scope.files");
		// Enable alerts with every new file upload attempt
    	$scope.enableErrorAlerts = true;
        if ($scope.file != null) {
            $scope.files = [$scope.file]; 
        }
        // Avoiding entering in the upload function when there's already a spec uploaded.
        if ($.isEmptyObject(ingestService.getIngestObj())) {
        	$scope.upload($scope.files);
        }
    });

    $scope.removeErrorAlerts = function () {
    	$scope.enableErrorAlerts = false;
    	if ( $scope.notEPG === true ) {
    		$scope.notEPG = false;
    	} else if ( $scope.notVOD === true ) {
    		$scope.notVOD = false;
    	} else if ( $scope.uploadError === true ) {
    		$scope.uploadError = false;
    	}
	};

    // Delete file item from the file list.
	$scope.deleteFile = function (fileName) {
		console.log("ENTRA-deleteFile()");
		$scope.files = $.grep($scope.files, function (fileObject) {
			return fileObject.name !== fileName;
		});
		// When the user deletes all files, unset specObj in specService
		if ($scope.files.length === 0) {
			ingestService.unsetIngestObj();
			// Hide validation button
			$scope.ingestFileUploaded = false;
			// Resetting fileType flag, locally and in ingestService.
			$scope.fileTypeOk = false;
			ingestService.setFileTypeOk(false);
			// hideHtmlElement("#ingest-button-container");
			//Enable API section, since now is possible to validate either an ingest
			// or an apiResponse.
			enableApiNavSection();
			// Disable results, in case we are moving trough windows.
			disableResultsSection();
		}
		// Re-setting specService Spec array to be the result of the deletion
		ingestService.setIngestFilesArray($scope.files);
	};

    $scope.upload = function (files) {
		console.log("ENTRA-upload()");
		var xmlDoc,
			xmlObject;

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
				var file = files[i];

				//Getting the content of the object File.
				var read = new FileReader();

				read.readAsBinaryString(file);

				read.onloadend = function () {
					try {
						// Updating filesSpecArray in specService
						ingestService.addIngestFile(file);
						// Parsing XML file
						xmlDoc = $.parseXML(read.result);
						// Convert parsed XML to JSON
						$scope.xmlParsed2Json = xmlToJson(xmlDoc);
					}
					catch (err) { // Error in parsing xml
					    console.log("err.message =");
					    console.log(err.message);
					    $scope.uploadError = true;
					    $scope.$apply();
					    $scope.deleteFile(file.name);
					}
				};
            }
        }
    };

    var processIngestJson = function (xmlObject){
		console.log("ENTRA processIngestJson");
    	
    	var fileName = ingestService.getFileName();

		if ( xmlObject ) {
			
			// Making the spec available trough the specService
			ingestService.setIngestObj(xmlObject);

			// Handle wrong format file uploads.
			if ( specService.getSpecType() === "EPG" ) {
				console.log("Spec is EPG");
				if ( ingestService.getIngestObjType() !== "EPG" ) {
					console.log("notEPG");
					$scope.notEPG = true;
					$scope.$apply();
				} else { // No errors.
					// Update file type locally and in service.
    				$scope.fileTypeOk = true;
					ingestService.setFileTypeOk(true);
					$scope.$apply();
				}
			} else if ( specService.getSpecType() === "VOD" ) {
				console.log("Spec is VOD");
				console.log("ingestService.getIngestObjType()");
				console.log(ingestService.getIngestObjType());
				if ( ingestService.getIngestObjType() !== "VOD" ) {
					console.log("notVOD");
					$scope.notVOD = true;
					$scope.$apply();
				} else {
					// No errors.
    				$scope.fileTypeOk = true;
					ingestService.setFileTypeOk(true);
    				console.log("VodAssetType");
					console.log(extractVodAssetType());
					ingestService.setVodAssetType(extractVodAssetType());
				}
			}

			if ( $scope.fileTypeOk ) {
				// Show 'validate' button.
				$scope.ingestFileUploaded = true;
			} else {
				// Remove file to allow uploads again.
	    		if ( fileName !== "" ) {
	    			$scope.deleteFile(fileName);
	    		}
			}

			// Update $scope variables.
			$scope.$apply();

			// Disable API section, since an ingest file has been
	    	// uploaded to validate.
			disableApiNavSection();
		}
    };

    $scope.validateIngestFile = function () {
    	
		/*
    	 * attributesObj: Object that will store the attributes of the Spec field, in turn.
		 * fieldAttr: Spec field to check vs api response
		 * resultObj: Object to populate with the results of the validation check.
		 * specObject: XML specification object.
		 * filtered2LvlKeys: Result of searching a field in the 2nd level keys array.
    	 */
	    var specObject = specService.getSpec(),
	    	specType = specService.getSpecType(),
	    	resultObj = {}; //Placeholder for any result object.
		
	    console.log("specObject = ");
	    console.log(specObject);

	   	console.log("specType");
	   	console.log(specType);

	   	if ( specType === "VOD" ) { // VOD validation
			console.log("VOD VALIDATION:");

	    	var	ingestFieldsArraysObj = getVODIngestFields(); // Get arrays of fields from XML Ingest file.
	    	console.log("assetAMSfieldsObj");
			console.log(ingestFieldsArraysObj.assetAMSfieldsObj);
			console.log("assetAppDataFieldsObj");
			console.log(ingestFieldsArraysObj.assetAppDataFieldsObj);	   	

			// Placeholders for the fields array of every asset class.
		    var amsFieldsObj = ingestFieldsArraysObj.assetAMSfieldsObj,
		    	appDataFieldsObj = ingestFieldsArraysObj.assetAppDataFieldsObj,
		    	fieldsValidationResultsObj = {},
				vodAssetType = ingestService.getVodAssetType();


		    console.log("vodAssetType");
		    console.log(vodAssetType);

		    // Validation of all Asset classes fields vs Spec.
		    if ( specObject ) {
		    	$.each( specObject, function ( specAssetClass, specFieldsObj ) {
		    		if ( specAssetClass !== "#text" ) {
			    		// Going over every field defined in spec.
			    		$.each( specFieldsObj, function ( field, fieldProperties ) {
							if ( field !== "#text" ) {
								// Special validation of AMS properties in all Asset classes.
					    		if ( specAssetClass === "AMS" ) {
							    	$.each( amsFieldsObj, function ( fileAssetClass, fieldsArray ) {
							    		
							    		resultObj.field = field;
						    			
								    	// Check fields vs Spec to determine result status
						    			resultObj.status = checkIngestFields (field, vodAssetType, fieldProperties, fieldsArray);

							    		// Setting the resultObj type (AMS of AppData)
							    		resultObj.type = "AMS";
							    		// Creating, or updating the result array
							    		if ( fieldsValidationResultsObj[fileAssetClass] && fieldsValidationResultsObj[fileAssetClass].constructor === Array ) {
							    			fieldsValidationResultsObj[fileAssetClass].push(resultObj);
							    		} else {
							    			fieldsValidationResultsObj[fileAssetClass] = [resultObj];
							    		}
							    		resultObj = {};
							    	} );
							    }
							    else if ( specAssetClass === "still-image" ) {
							    	
							    	if ( appDataFieldsObj.poster ) {
								    	resultObj.field = field;

								    	// Check fields vs Spec to determine result status
								    	resultObj.status = checkIngestFields (field, vodAssetType, fieldProperties, appDataFieldsObj.poster);

					    				// Setting the resultObj type (AMS of AppData)
								    	resultObj.type = "App_Data";
								    	if ( fieldsValidationResultsObj.poster.constructor === Array ) {
					    					fieldsValidationResultsObj.poster.push(resultObj);
								    	} else {
					    					fieldsValidationResultsObj.poster = [resultObj];
							    		}
								    	resultObj = {};
				    				} else {
				    					if ( !fieldsValidationResultsObj.hasOwnProperty('poster') ) {
				    						fieldsValidationResultsObj.poster = [];
				    					}
				    				}
				    				if ( appDataFieldsObj["box cover"] ) {
								    	resultObj.field = field;
								    	
								    	// Check fields vs Spec to determine result status
								    	resultObj.status = checkIngestFields (field, vodAssetType, fieldProperties, appDataFieldsObj["box cover"]);
					    				
					    				// Setting the resultObj type (AMS of AppData)
								    	resultObj.type = "App_Data";
					    				if ( fieldsValidationResultsObj["box cover"].constructor === Array ) {
					    					fieldsValidationResultsObj["box cover"].push(resultObj);
								    	} else {
					    					fieldsValidationResultsObj["box cover"] = [resultObj];
							    		}
								    	resultObj = {};
				    				} else {
				    					if ( !fieldsValidationResultsObj.hasOwnProperty('box cover') ) {
				    						fieldsValidationResultsObj["box cover"] = [];
				    					}
				    				}

				    				if ( appDataFieldsObj["background image"] ) {
								    	resultObj.field = field;
								    	
								    	// Check fields vs Spec to determine result status
								    	resultObj.status = checkIngestFields (field, vodAssetType, fieldProperties, appDataFieldsObj["background image"]);
					    				
					    				// Setting the resultObj type (AMS of AppData)
								    	resultObj.type = "App_Data";
					    				if ( fieldsValidationResultsObj["background image"].constructor === Array ) {
					    					fieldsValidationResultsObj["background image"].push(resultObj);
								    	} else {
					    					fieldsValidationResultsObj["background image"] = [resultObj];
							    		}
								    	resultObj = {};
				    				} else {
				    					if ( !fieldsValidationResultsObj.hasOwnProperty('background image') ) {
				    						fieldsValidationResultsObj["background image"] = [];
				    					}
				    				}
							    }
							    else { //For all asset classes that are not AMS, nor 'still-image'.
					    			/*
					    			If ingest file has the asset class that's gonna
					    			be validated
					    			*/
					    			if ( appDataFieldsObj[specAssetClass] ) {
							    		
						    			resultObj.field = field;
								    	
								    	// Check fields vs Spec to determine result status
								    	resultObj.status = checkIngestFields (field, vodAssetType, fieldProperties, appDataFieldsObj[specAssetClass]);
						    			
						    			// Setting the resultObj type (AMS of AppData)
							    		resultObj.type = "App_Data";
						    			// Creating, or updating the result array
							    		if ( fieldsValidationResultsObj[specAssetClass] && fieldsValidationResultsObj[specAssetClass].constructor === Array ) {
							    			fieldsValidationResultsObj[specAssetClass].push(resultObj);
							    		} else {
							    			fieldsValidationResultsObj[specAssetClass] = [resultObj];
							    		}
						    			resultObj = {};

					    			} else { // If is the first time checking the asset class exist in Ingest file
					    				
					    				if ( !fieldsValidationResultsObj.hasOwnProperty(specAssetClass) ) {
					    					fieldsValidationResultsObj[specAssetClass] = [];
					    				}
					    			}
							    }
							}
					    } );
		    		}
		    	} );
			    console.log("fieldsValidationResultsObj");
			    console.log(fieldsValidationResultsObj);
			   
			    // Set the Result, in the resultService
				resultsService.setResults(fieldsValidationResultsObj);
				// Set the result type (INGEST or API)
				resultsService.setResultType("INGEST");
				// Enable Results section
				enableResultsNavSection();
		    	// Go to results sections
		    	goToResultsSection();
			}
		} // end of VOD validation.
		else if ( specType === "EPG" ) { //EPG validation
			console.log("EPG VALIDATION:");

	    	var	ingestFieldsObjectsArray 	= getEPGIngestFields(), // Get arrays of fields from XML Ingest file.
	    		epgEventType 				= "Unknown",
	    		epgValidationResultsObj 	= {},
	    		parsedName					= "";
			
			// Validation of all Asset classes fields vs Spec.
		    if ( specObject ) {

		    	// Going over every field in Spec, checking it vs all events in the EPG Ingest file, to determine its status.
		    	$.each( specObject, function ( epgSpecField, epgSpecFieldAttrObj ) {

		    		if ( epgSpecField !== "#text" && epgSpecField !== "#comment") {

		    			// Going over the array of fields objects of the ingest file to validate them vs a particular one spec field at the time. 
	    				$.each( ingestFieldsObjectsArray, function ( index, epgIngestFieldsObj ) {
	    					
	    					// Repopulating resultObj with validation info of the event in turn.
	    					resultObj.field = epgSpecField;
	    					// Getting the event type in turn
	    					/*
	    					console.log("@@@@epgIngestFieldsObj@@@@");
	    					console.log(epgIngestFieldsObj);

	    					console.log('epgIngestFieldsObj.hasOwnProperty(series-id)');
	    					console.log(epgIngestFieldsObj.hasOwnProperty("series-id"));
	    					*/

	    					epgEventType = epgIngestFieldsObj.fieldsArray.indexOf("series-id") >= 0 ? "Episode" : "Event" ;
	    					// Perform the check. Call to the method that validates presence of required fields. Taking into consideration episodes.
	    					resultObj.status = checkIngestFields ( epgSpecField, epgEventType, epgSpecFieldAttrObj, epgIngestFieldsObj.fieldsArray );
	    					
	    					// Parse event names to avoid having weird characters in results.
	    					parsedName = decodeURIComponent(escape(epgIngestFieldsObj.name));
	    					// Creating, or updating the result array
				    		if ( epgValidationResultsObj[parsedName + "|" + epgEventType] && epgValidationResultsObj[parsedName + "|" + epgEventType].constructor === Array ) {
				    			epgValidationResultsObj[parsedName + "|" + epgEventType].push(resultObj);
				    		} else {
				    			epgValidationResultsObj[parsedName + "|" + epgEventType] = [resultObj];
				    		}
	    					resultObj = {};
	    				} );
					}
				} );
			}
			// Set the Result, in the resultService
			resultsService.setResults(epgValidationResultsObj);
			// Set the result type (INGEST or API)
			resultsService.setResultType("INGEST");
			// Enable Results section
			enableResultsNavSection();
	    	// Go to results sections
	    	goToResultsSection();

		} //end of EPG validation

    }; // end of validateIngestFile function
});