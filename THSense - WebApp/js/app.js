var app = angular.module('THSense', ['ui.bootstrap']);

app.controller('BodyController', function($scope){

	/**ng init for rendering templateView**/
	$scope.showTemplate = function() {
		$scope.templateView = {};
		
		$scope.templateView.template = "js/views/login.html";

		function handleClientLoad() {
	        gapi.client.setApiKey(apiKey);
	        window.setTimeout(checkAuth,1);
	    }
	    
	    function checkAuth() {
	        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, googleLogin);
	    }

	};

	$scope.verify = function() {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        console.log(username)

        if(username=="vivek" && password=="root"){
            $scope.templateView.template = "js/views/home.html";
        }
    };

    var clientId = '462797484846-kg7tmapqnmf5b6je0lsbhvu65k5t1rqk.apps.googleusercontent.com';
    
    // Asynchronously load Google+ SDK
	(function() {
		var po = document.createElement('script');
		po.type = 'text/javascript';
		po.async = true;
		po.src = 'https://apis.google.com/js/client:plusone.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(po, s);
	})();


    $scope.googleLogin = function() {
        gapi.auth.authorize({
			client_id: clientId,
			scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read',
			immediate: false
		}, function() {
			gapi.client.load('plus', 'v1', function() {
				var request = gapi.client.plus.people.get({
					userId: 'me'
				});
				request.execute(function(resp) {
		            console.log(resp.displayName);
		            $scope.templateView.template = "js/views/home.html";
		            $scope.$apply();
		        });
			});          
        });
    }
});


app.controller('HomeController', function($scope,$uibModal,$rootScope){

	var hc = this;

	hc.devices = [];

	/**ng init**/
	$scope.connectToMosq = function() {

		hc.devices.push({"teamId":"4","tempVal":"","humVal":""});
		hc.devices.push({"teamId":"1","tempVal":"","humVal":""});

		var mosq = new Mosquitto();

		var url = "ws://" + "52.33.59.166" + ":" + "9001" + "/mqtt";
        mosq.connect(url);
        
        mosq.onconnect = function(rc){
            console.log("Connection Successful")
            mosq.subscribe("TemperatureRT", 0);
            mosq.subscribe("HumidityRT", 0);
        };

        mosq.onmessage = function(topic, payload, qos){
            console.log(topic)

            var json_data = JSON.parse(payload);

            if(topic=="TemperatureRT"){            	
                console.log(json_data.teamId);            	
                console.log(json_data.tval);

                for(var i=0;i<hc.devices.length;i++){
                	if(hc.devices[i].teamId==json_data.teamId){
                		hc.devices[i].tempVal = json_data.tval;
                		$scope.$apply();
                		console.log(hc.devices);
                	}

                }

            }

            if(topic=="HumidityRT"){
                console.log(json_data.teamId);            	
                console.log(json_data.hval);

                for(var i=0;i<hc.devices.length;i++){
                	if(hc.devices[i].teamId==json_data.teamId){
                		hc.devices[i].humVal = json_data.hval;
                		$scope.$apply();
                		console.log(hc.devices);
                	}

                }
            }
         
        };

	};

	hc.addDevice = function(){

		var modalInstance = $uibModal.open({
		    templateUrl: 'js/views/addDeviceModal.html',
		    controller: 'AddDeviceCtrl',
		    size: "sm",
		    resolve: {
		      }
	    });

	    modalInstance.result.then(function (selectedItem) {
	    	hc.devices.push({"teamId":selectedItem,"tempVal":"","humVal":""});
	    }, function () {
	    });

	}

	hc.manageDevice = function(device){
		$rootScope.device = device;
		$scope.templateView.template = "js/views/device.html";
	};

	$scope.logout = function(){
		window.location.href = "../index.html"
	};

});

app.controller('AddDeviceCtrl', function($scope,$uibModalInstance){

	$scope.ok = function () {
	    $uibModalInstance.close($scope.deviceId);	    
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss();
	};

});

app.controller('DeviceController', function($scope, $rootScope, $http) {

	var dc = this;

	/**ng init**/
	$scope.connectToMosq = function() {

		dc.device = $rootScope.device;

		$("#predictedData").hide();

		dc.deviceStatus="ON";
		$("#toggleProx").prop('checked', true);

		dc.mosq = new Mosquitto();

		var url = "ws://" + "52.33.59.166" + ":" + "9001" + "/mqtt";
        dc.mosq.connect(url);
        
        dc.mosq.onconnect = function(rc){
            console.log("Connection Successful")
            dc.mosq.subscribe("TemperatureRT", 0);
            dc.mosq.subscribe("HumidityRT", 0);
        };

        dc.mosq.onmessage = function(topic, payload, qos){
            console.log(topic)

            var json_data = JSON.parse(payload);

            if(topic=="TemperatureRT"){            	
                console.log(json_data.teamId);            	
                console.log(json_data.tval);

            	if(dc.device.teamId==json_data.teamId){
            		dc.device.tempVal = json_data.tval;
            		$scope.$apply();
                }

            }

            if(topic=="HumidityRT"){
                console.log(json_data.teamId);            	
                console.log(json_data.hval);

                if(dc.device.teamId==json_data.teamId){
            		dc.device.humVal = json_data.hval;
            		$scope.$apply();
                }

            }            
        };


        // Get predicted values from Spark
        $http({
		  method: 'GET',
		  url: 'http://50.18.94.136:9999/gettemp'
		}).then(function successCallback(response) {
			console.log(response.data);
			dc.predictedValues = response.data;

			$("#loading").hide();

			$("#predictedData").show();

		  }, function errorCallback(response) {

		  });

	};


	dc.back2Home = function(){
		$scope.templateView.template = "js/views/home.html";
	};

	if(dc.deviceStatus=="OFF") {
        $("#deviceData").hide();
    }
    if (dc.deviceStatus=="ON") {                
        $("#deviceData").show();
    }


	// toogle device
    $("#toggleProx").change(function() {
        if ($(this).is(':checked')){
            $(this).prop('checked', true);
            dc.deviceStatus = "ON"
            $("#deviceData").show();
            enableDevice();
        }    
        else {
            $(this).prop('checked', false);
            dc.deviceStatus = "OFF"
            $("#deviceData").hide();
            disableDevice();
        }                     
    });


    dc.setTemperature = function(){
    	var topic="SET_TEMPERATURE";
        var qos=0;
        console.log("Inside SET_TEMPERATURE")
        var temp = document.getElementById("temp").value;
        console.log(temp);
        publish(topic,qos,temp);
        document.getElementById("temp").value = "";
    };

    function enableDevice()  {
        var topic="HVAC_STATUS";
        var qos=0;
        var payload="ON"
        publish(topic,qos,payload);
    }

    function disableDevice()  {
        var topic="HVAC_STATUS";
        var qos=0;
        var payload="OFF"
        publish(topic,qos,payload);
    }

    function publish(topic,qos,payload)  {
        console.log("Inside Pubish")
        dc.mosq.publish(topic, payload, qos);
    }

});
