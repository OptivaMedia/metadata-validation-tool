'use strict';

/**
 * @ngdoc function
 * @name xmlvsApiValidationApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the xmlvsApiValidationApp
 */
angular.module('xmlvsApiValidationApp')
  .controller('ApiResponseCtrl', function (
  	$scope, 
  	localStorageService, 
  	Upload, 
  	$timeout, 
  	resultsService, 
  	$location,
  	specService, 
  	apiResponseService) {
  	
  	// Call the env initialization routine
  	init();

	function init() {
    	console.log("FUNCTION: init()");
		// Get apiResponseObj & apiResponse files already uploaded. If any.
		$scope.apiFiles = apiResponseService.getApiFilesArray();
	    $scope.apiResponseLoaded = false;
	    
	    console.log("$scope.apiFiles");
		console.log($scope.apiFiles);

	    $scope.apiResponseObject = apiResponseService.getApiResponse();
	    $scope.apiFstLevelKeys = [];
	    $scope.apiSndLevelKeys = [];
	    $scope.validationResults = [];

		// Error alerts enabled in initial state
	    $scope.enableApiFileErrorAlerts = true;

	    // Toggle active navbar component
	  	var selector = '.nav li';

		if( !$("#api-section").hasClass('active') ) {
			$(selector).removeClass('active');
			$("#api-section").addClass('active');
		}
	}

    //Monitor changes in the file value, in the UI.
    $scope.$watch('fileApi', function () {
    	console.log("FUNCTION: $scope.$watch");
    	// Enable alerts with every new file upload attempt
    	$scope.enableApiFileErrorAlerts = true;

		if ( $scope.fileApi != null && $.isEmptyObject(apiResponseService.getApiResponse())
				 && (apiResponseService.getApiFilesArray).length == 0 ) {
			// Locally storing the file in the scope's files array
			$scope.apiFiles = $scope.fileApi;
            $scope.uploadAPI($scope.fileApi);
        }
    });

    $scope.removeApiErrorAlerts = function() {
    	console.log("FUNCTION: removeApiErrorAlerts");
    	$scope.enableApiFileErrorAlerts = false;
	}

    /**
	 * @ngdoc function
	 * @name uploadAPI
	 * @description
	 * Uploads the file and get its content.
	*/
    $scope.uploadAPI = function (files) {
    	console.log("FUNCTION: uploadAPI");
    	if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
				var file = files[i];
				//Getting the content of the object File.
				var read = new FileReader();

				read.readAsBinaryString(file);
				// Once the file has correctly been uploaded
				read.onloadend = function(){
    				console.log("FUNCTION: onloadend");
					var jsonObject =  $.parseJSON(read.result);
				    if( jsonObject ){

				    	/*Local Storing operations*/
				    	// Add Api Response object to local scope.
				    	$scope.apiResponseObject = jsonObject;
				    	// Enable file loaded flag.
						$scope.apiResponseLoaded = true;

						/*Persisting data operations.*/
				    	// Add Api Response file to Api Response Files Array service object.
				    	apiResponseService.setApiResponse($scope.apiResponseObject);
				    	// Add Api Response file to Api Response Files Array service object.
				    	apiResponseService.setApiFilesArray(files);
				    }
				}
            }
        }
    };

    // Delete file item from the file list.
	$scope.deleteFile = function(fileName) {
    	console.log("FUNCTION: deleteFile");
		$scope.apiFiles = $.grep($scope.apiFiles, function(fileObject) {
			return fileObject.name != fileName;
		});
		// When the user deletes all files, unset apiResponseObj in apiResponseService
		if($scope.apiFiles == 0) {
			// Clear apiResponse Obj
			apiResponseService.unsetApiResponse();
			$scope.apiResponseLoaded = false;
		}
		// Re-setting apiResponseService files array to be the result of the deletion
		apiResponseService.setApiFilesArray($scope.apiFiles);
	}

    /**
	 * @ngdoc function
	 * @name uploadAPI
	 * @description
	 * Validates the API fields vs the Spec object.
	*/
    $scope.validateApiResponse = function() {	
    	console.log("FUNCTION: deleteFile");
	    //Get the fields that are going to be validated.
	    getApiFields();

	    console.log("Keys 1st Level: ");
    	console.log($scope.apiFstLevelKeys);

    	console.log("Keys 2nd Level: ");
    	console.log($scope.apiSndLevelKeys);

    	/*
    	 * attributesObj: Object that will store the attributes of the Spec field, in turn.
		 * fieldAttr: Spec field to check vs api response
		 * resultObj: Object to populate with the results of the validation check.
		 * specObject: XML specification object.
		 * filtered2LvlKeys: Result of searching a field in the 2nd level keys array.
    	 */
	    var attributesObj = null,
	    	fieldAttr = "",
	    	resultObj = [],
	    	resultByField = {},
	    	specObject = specService.getSpec(),
	    	filtered2LvlKeys = null,
	    	missingFieldsInSpec;

	    /*
	     * Iterate over Spec Object, comparing vs Api response(field by field), 
	     * to check the response is well suited.
	    */
		$.each(specObject, function(key, element) {
			if( key != "#text" && typeof element === "object" && !($.isEmptyObject(element)) ){
				attributesObj = element["@attributes"];
				fieldAttr = attributesObj.fieldApi;
				if(attributesObj.required == "Y" || attributesObj.required == "N"){
					console.log("First level Processing...");
					//Check the API field is defined in Spec
					if(fieldAttr){ // When the pair SpecField -> APIfield is appropriately specified in the spec file.
						resultByField.field = fieldAttr;
						switch(attributesObj.type){
							case "Tag":
							case "Meta":
							case "Extra":
								filtered2LvlKeys = $.grep($scope.apiSndLevelKeys, function(fieldObj){ 
									return fieldObj.field == fieldAttr;
								});
								filtered2LvlKeys.length >= 1 ? resultByField.status = "OK" : resultByField.status = "NOK" ;
								break;
							default:
								$.inArray(fieldAttr,$scope.apiFstLevelKeys) >= 0 ? resultByField.status = "OK" : resultByField.status = "NOK" ;
						}
					}else{ // When the API field correspondant to a Spec field is not specified in the spec file.
						resultByField.field = key;
						resultByField.status = "AFNS"; //AFNS= API Field Not Specified.
					}
					// Adding result element with status, type, specField and APIfield properties.
					resultByField.specField = key;
					resultByField.type = attributesObj.type; 
					resultObj.push(resultByField);
					// Resetting values for 2nd level manipulation or next iteration
					resultByField = {};
					attributesObj = null;
					fieldAttr = "";
					filtered2LvlKeys = null;
					// Second level keys validation, when there is more than one API field for a single Spec field.
					if(element.altField){
						console.log("Second level Processing...");
						attributesObj = element.altField["@attributes"];
						fieldAttr = attributesObj.fieldApi;

						//Check the API field is defined in Spec
						if (fieldAttr){
							resultByField.field = fieldAttr;
							filtered2LvlKeys = $.grep($scope.apiSndLevelKeys, function(fieldObj){ 
								return fieldObj.field == fieldAttr;
							});
							filtered2LvlKeys.length >= 1 ? resultByField.status = "OK" : resultByField.status = "NOK" ;
						}else{ // When the API field correspondant to a Spec field is not specified in the spec file.
							resultByField.field = key; //AFNS= API Field Not Specified.
							resultByField.status = "AFNS"; //AFNS= API Field Not Specified.
						}
						// Adding result element with status, type, specField and APIfield properties.
						resultByField.specField = key;
						resultByField.type = attributesObj.type; 
						resultObj.push(resultByField);
						// Resetting values for next iteration
						resultByField = {};
						attributesObj = null;
						fieldAttr = "";
						filtered2LvlKeys = null;
					}
				}
			}
		});

		// Check fields in API, missing in Spec
		missingFieldsInSpec = checkForMissingFieldsInSpec();

		$.each(missingFieldsInSpec, function(index, element) {
			// resultByField.field = element
			resultObj.push({field: element, status: "NIS"});
		});

		resultsService.setResults(resultObj);
		// Enable Results section
		enableResultsNavSection();
    	// Go to results sections
    	goToResultsSection();

    };

    function goToResultsSection(){
    	$location.url('/results');
    }

    function checkForMissingFieldsInSpec() {
    	console.log("FUNCTION: checkForMissingFieldsInSpec");
    	var specObject = specService.getSpec(),
    		specKeys,
    		missingFieldsResult = [],
    		filteredSpecApiFields = [],
    		fieldSpecObj,
    		altFieldSpecObj,
    		api2ndLvlApiFields = [],
    		realApiResponseApiFields;

			// TODO FINISH GETTING API FIELD KEYS FROM SPECOBJECT.
			$.each(specObject, function(key, value) {
    			fieldSpecObj = specObject[key];
    			if( fieldSpecObj && !$.isEmptyObject(fieldSpecObj) ) {
	    			// Check it is a real specObj, with a fieldApi defined 
	    			if( key != "#text" && fieldSpecObj["@attributes"].fieldApi ) {
	    				filteredSpecApiFields.push(fieldSpecObj["@attributes"].fieldApi);
	    				altFieldSpecObj = fieldSpecObj.altField;
	    				// Check the specObj has an alternative field.
	    				if(altFieldSpecObj){	
	    					filteredSpecApiFields.push(altFieldSpecObj["@attributes"].fieldApi);
	    				}
	    			}
	    		}
			});
    	// Getting 2nd level api response fields.
    	$.each($scope.apiSndLevelKeys, function(index, fieldObj){
			api2ndLvlApiFields.push(fieldObj.field);
		});
		// Concat 2st and 2nd lvl api response fields.
    	realApiResponseApiFields = $scope.apiFstLevelKeys.concat(api2ndLvlApiFields);

    	// Check for Api response fields missing in Specification.
		$.each(realApiResponseApiFields, function(index, element) {
			if( $.inArray(element, filteredSpecApiFields) < 0 ) {
				missingFieldsResult.push(element);
			}
		});

		return missingFieldsResult;
    }

    function enableResultsNavSection(){
    	console.log("FUNCTION: enableResultsNavSection");
		//Enable API section
		$("#results-section").removeClass("disabled");
		$("#results-section").removeProp("disabled");
		// Changing flag to show 'continue' button
		$scope.specUploaded = true;
	}

    /**
	 * @ngdoc function
	 * @name getApiFields
	 * @description
	 * Gets the fields that are going to be validated againts Spec.
	*/
    function getApiFields(){
    	console.log("FUNCTION: getApiFields");

	    var metaArray,
	    	metasFieldValue,
	    	tagsFieldValue,
	    	typeSpec = specService.getSpecType();

	    if(typeSpec) {
	    	metasFieldValue = typeSpec == "VOD" ? "Metas" : "metas" ;
	    	tagsFieldValue = typeSpec == "VOD" ? "Tags" : "tags" ;
		    $.each($scope.apiResponseObject, function(key, element) {
			    switch(key){
			    	case metasFieldValue:
			    		metaArray = element;
			    		if(typeSpec == "VOD"){
					    	$.each(metaArray, function(index, metaObj) {
					    		$scope.apiSndLevelKeys.push({field:metaObj.Key, type:"meta"});
					    	});
				    	}else{
				    		$.each(metaArray, function(key, metaObj) {
					    		$scope.apiSndLevelKeys.push({field:key, type:"meta"});
					    	});
				    	}
			    		break;
			    	case tagsFieldValue:
			    		metaArray = element;
			    		if(typeSpec == "VOD"){
					    	$.each(metaArray, function(index, metaObj) {
					    		$scope.apiSndLevelKeys.push({field:metaObj.Key, type:"tag"});
					    	});
				    	}else{
				    		$.each(metaArray, function(key, metaObj) {
					    		$scope.apiSndLevelKeys.push({field:key, type:"tag"});
					    	});
				    	}
			    		break;
			    	case "extra_params":
			    		metaArray = element;
			    		$.each(metaArray, function(key, metaObj) {
				    		$scope.apiSndLevelKeys.push({field:key, type:"extra"});
				    	});
			    		break;
			    	default:
			    		$scope.apiFstLevelKeys.push(key);
			    }
				metaArray = [];
			});
		}
    }
});
