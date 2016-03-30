'use strict';

/**
 * @ngdoc overview
 * @name xmlvsApiValidationApp
 * @description
 * # xmlvsApiValidationApp
 *
 * Main module of the application.
 */
angular
  .module('xmlvsApiValidationApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.sortable',
    'LocalStorageModule',
    'ngFileUpload'
  ])
  // .config(['localStorageServiceProvider', function(localStorageServiceProvider){
  //   localStorageServiceProvider.setPrefix('ls');
  // }])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/spec.html',
        controller: 'SpecCtrl',
        controllerAs: 'main'
      })
      .when('/ingest', {
        templateUrl: 'views/ingest.html',
        controller: 'IngestCtrl',
        controllerAs: 'ingest'
      })
      .when('/apiresponse', {
        templateUrl: 'views/apiresponse.html',
        controller: 'ApiResponseCtrl',
        controllerAs: 'apiresponse'
      })
      .when('/results', {
        templateUrl: 'views/results.html',
        controller: 'ResultsCtrl',
        controllerAs: 'results',
        css: 'styles/results.css'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
