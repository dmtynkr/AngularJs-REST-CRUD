var app = angular.module('angularjs-starter', [ 'ngMockE2E' ]);

var debug;
// Mock the backend
app.run(function($httpBackend) {
  var users = [
    { id: 123, name: 'David'},
    { id: 456, name: 'JohnDoe' }
  ];
  
  function newId() {
    return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  }

  $httpBackend.whenGET('/users').respond( users );
  $httpBackend.whenGET(/\/users\/\d+/).respond( function ( method, url, data, headers ) {
    var id = url.split('/')[2];
    var found_user;
    angular.forEach( users, function(user) {
      if ( user.id == parseInt(id) ) found_user = user;
    });
    
    return [200, found_user, {}];
  });
  
  $httpBackend.whenPOST('/users').respond( function ( method, url, data, headers ) {
    var new_user = angular.extend( { id: newId() }, angular.fromJson(data) );
    users.push( new_user );
    return new_user;
  });
  
  $httpBackend.whenDELETE(/\/users\/\d+/).respond( function ( method, url, data, headers ) {
    var id = url.split('/')[2];
    var found_user;
    angular.forEach( users, function(user) {
      if ( user.id == parseInt(id) ) found_user = user;
    });
    var idx = users.indexOf(found_user);
    console.log(idx);
    users.splice(idx,1);
    return [204]; // No Content
  });  
  
});

app.factory( 'restapi', function( $http ) {
  var uri = '/users';
  
  return {
    query: function () {
      return $http.get(uri);
    },
    get: function( id ) {
      return $http.get(uri + '/' + id);
    },
    create: function ( data ) {
      return $http.post( uri, data );
    },
    remove: function( id ) {
      return $http.delete( uri + "/" + id);
    }
    // ... save, etc.
  };
});

app.controller('MainCtrl', function( $scope, restapi ) {
  
  function getUsers() {
    restapi.query().success(function (data) {
      $scope.users = data;
    });
  }
  
  $scope.getUser = function ( id ) {
    restapi.get( id ).success(function (data) {
      $scope.current_user = data;
    });
  };
  
  $scope.create = function () {
    var name = $scope.name;
    $scope.name = "";
    restapi.create( { name: name } ).success(function(data) {
      $scope.current_user = data;
      getUsers();
    });
  };
  
  $scope.removeUser = function ( id ) {
    restapi.remove( id ).success(function(data) {
      $scope.current_user = undefined;
      getUsers();
    });
  };
  
  getUsers();
});