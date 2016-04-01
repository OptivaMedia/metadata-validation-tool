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
  	ingestService) {
    
  	// Call the env initialization routine
  	init();
  	

	function init() {
		console.log("ENTRA-init()");
		// Getting the uploadedFiles array
		$scope.files = ingestService.getIngestFilesArray();
		console.log("$scope.files - AFTER");
		console.log($scope.files);
		$scope.ingestFileUploaded = $.isEmptyObject(ingestService.getIngestObj()) ? false : true;
	    // Error alerts enabled in initial state
	    $scope.enableErrorAlerts = true;

		// Toggle active navbar component
	  	var selector = '.nav li';

		if(!$("#ingest-section").hasClass('active')) {
			$(selector).removeClass('active');
			$("#ingest-section").addClass('active');
		}
	}

	// Watching uploads from the user
	$scope.$watch('files', function () {
		console.log("$scope.$watch -> $scope.files");
		// Enable alerts with every new file upload attempt
    	$scope.enableErrorAlerts = true;
		// Avoiding entering in the upload function when there's already a spec uploaded.
			console.log("ingestService.getIngestObj() = ");
			console.log(ingestService.getIngestObj());
        if($.isEmptyObject(ingestService.getIngestObj())) {
        	$scope.upload($scope.files);
        }
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file]; 
        }
    });

    $scope.removeErrorAlerts = function() {
    	$scope.enableErrorAlerts = false;
	}

    // Delete file item from the file list.
	$scope.deleteFile = function(fileName) {
		console.log("ENTRA-deleteFile()");
		$scope.files = $.grep($scope.files, function(fileObject) {
			return fileObject.name != fileName;
		});
		// When the user deletes all files, unset specObj in specService
		if($scope.files.length == 0){
			ingestService.unsetIngestObj();
			$scope.ingestFileUploaded = false;
			//Disable API section and unset apiResponse data structures.
			// disableApiResponseSection();
		}
		// Re-setting specService Spec array to be the result of the deletion
		ingestService.setIngestFilesArray($scope.files);
	}

    $scope.upload = function (files) {
		console.log("ENTRA-upload()");
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
				var file = files[i];

				//Getting the content of the object File.
				var read = new FileReader();

				read.readAsBinaryString(file);

				read.onloadend = function() {
					// Enable next section and show continue button
					// enableApiNavSection();
					// FOR XML FILE
					var xmlDoc = $.parseXML(read.result);
					// Assuming xmlDoc is the XML DOM Document
					// var xmlObject = JSON.stringify(xmlToJson(xmlDoc));
					var xmlObject = xmlToJson(xmlDoc);
					if(xmlObject){
						console.log("Specification Object: ");
						console.log(xmlObject);
						// Changing flag to show 'continue' button
						$scope.ingestFileUploaded = true;
						// Making the spec available trough the specService
						ingestService.setIngestObj(xmlObject);
						// Updating filesSpecArray in specService
						ingestService.addIngestFile(file);
					}
				}
            }
        }
    };

    	// TODO: FINISHED GETTING KEYS FROM INGEST FILE. CLEAN FUNCTION 
    	// AND CONTINUE VALIDATION vs SPEC
    	// DO COMMIT FIRST THING IN THE MORNING!!!!!
    $scope.validateIngestFile = function(){
		console.log("ENTRA-validateIngestFile()");
    	var ingestAssets,
    		assetAMS,
    		assetAMSfieldsArrays = [],
    		assetAppData,
    		fieldsSingleArray = [],
    		assetAppDataFieldsArrays = [];

		if ( ingestService.getIngestObj() ) {    	
			ingestAssets = ingestService.getIngestObj().Asset.Asset;
			console.log("ingestAssets");
			console.log(ingestAssets);
			if ( ingestAssets ) {
				$.each( ingestAssets, function ( index, asset ) {
					assetAMS = asset.Metadata.AMS["@attributes"];
					if ( assetAMS ) {
						assetAMSfieldsArrays.push(Object.keys(assetAMS));
					}
					assetAppData = asset.Metadata["App_Data"];
					if ( assetAppData ) {
						if ( assetAppData.constructor === Array ) {
							$.each( assetAppData, function ( index, appData ) {
								if ( appData["@attributes"].Name ) {
									fieldsSingleArray.push(appData["@attributes"].Name);
								}
							} );
						} else if ( assetAppData.constructor !== Array && typeof assetAppData == 'object' ) {
							fieldsSingleArray.push(assetAppData["@attributes"].Name);
						}
						assetAppDataFieldsArrays.push(fieldsSingleArray);
					}
					fieldsSingleArray = [];
				} );
				console.log("assetAppDataFieldsArrays");
				console.log(assetAppDataFieldsArrays);
			}
	    }
    }

    $scope.goToResultsSection = function() {
		console.log("ENTRA-goToResultsSection()");
    	$location.url('/results');
    }

	function enableApiNavSection() {
		console.log("ENTRA-enableApiNavSection()");
		//Enable API section
		$("#api-section").removeClass("disabled");
		$("#api-section").removeProp("disabled");
	}
/*
	function disableApiResponseSection() {
		// Unset apiResponse data structures
		apiResponseService.unsetApiResponse();
		apiResponseService.unsetApiFilesArray();
		// Disable API section
		$("#api-section").addClass('disabled');
	}
*/
	// Changes XML to JSON
	function xmlToJson(xml) {
		
		console.log("ENTRA-xmlToJson()");
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};
});