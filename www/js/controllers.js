var g_playlists = [{
	title : 'Reggaehiphop',
	id : 1
}, {
	title : 'Chill',
	id : 2
}, {
	title : 'Dubstep',
	id : 3
}, {
	title : 'Indie',
	id : 4
}, {
	title : 'Rap',
	id : 5
}, {
	title : 'Cowbell',
	id : 6
}];


angular.module('starter.controllers', ['starter.services', 'ionic', 'ngCordova', 'ionic.service.core', 'ionic.service.push', 'tabSlideBox', 'pickadate', 'fcsa-number'])
.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicHistory, $cordovaToast, $ionicLoading, $cordovaDevice, $location
	, loginService, CertifyService, pushInfoService, uuidService, tradeDetailService, ERPiaAPI, $localstorage, $cordovaInAppBrowser, $ionicPlatform, alarmService, VersionCKService, $ionicPopup){
	   var browseroptions = {
	      location: 'yes',
	      clearcache: 'yes',
	      toolbar: 'yes'
	   };


	$rootScope.version={
   		Android_version : '0.1.6', //업데이트시 필수로 변경!!
   		IOS_version : '0.1.3'	//업데이트시 필수로 변경!!
   	};

   	/* 로딩화면 */
	$rootScope.loadingani=function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
	         $timeout(function(){
	         $ionicLoading.hide();
	      }, 500);
	}
	$scope.logindata2 = {};

	$rootScope.loginState = "R"; //R: READY, E: ERPIA LOGIN TRUE, S: SCM LOGIN TRUE
	$rootScope.deviceInfo = {};  // Device 정보를 담아두는 변수
	$scope.ion_login = "ion-power active";  // 로그인/로그아웃 시 변경되는 CSS
	// 각각의 변수를 담아두는 공간. 초기화를 쉽게 하기 위해 만들었음.
	$rootScope.loginData = {};
	$scope.userData = {};
	$scope.SMSData = {};

	$ionicPlatform.ready();

	// 로그인 모달창
	$ionicModal.fromTemplateUrl('erpia_login/login.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.loginModal = modal;
	});
	// 이용약관 모달창
	$ionicModal.fromTemplateUrl('side/agreement.html',{
		scope : $scope
	}).then(function(modal){
		$scope.agreeModal = modal;
		$scope.agreeModal.hardwareBackButtonClose = false;
	});
	// 인증 모달창
	$ionicModal.fromTemplateUrl('side/certification.html',{
		scope : $scope
	}).then(function(modal){
		$scope.certificationModal = modal;
		$scope.certificationModal.hardwareBackButtonClose = false;
	});
	// 거래명세표 조회시 뜨는 모달창
	$ionicModal.fromTemplateUrl('side/check_Sano.html',{
		scope : $scope
	}).then(function(modal){
		$scope.check_sano_Modal = modal;
	});


$scope.pushYNcheck=function(){
		window.plugins.PushbotsPlugin.initialize("56fb66a04a9efa4f9a8b4569",{"android":{"sender_id":"832821752106"}});	 //푸쉬봇 선언
		var cntList = 6;
		alarmService.select('select_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
				// cntList = data.list.length;
					for(var i=0; i<cntList; i++){
						switch(data.list[i].idx){
							case 1: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
								data.list[i].name = '공지사항';
								break;
							case 2: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
								data.list[i].name = '업데이트 현황';
								break;
							case 3: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
								data.list[i].name = '지식 나눔방';
								break;
							case 4: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
								data.list[i].name = '업체문의 Q&A(답변)';
								break;
							case 5: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
								data.list[i].name = '거래명세서 도착';
								break;
							case 6: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
								data.list[i].name = '기타 이벤트';
								break;
						}
					}
					if(data.list[0].alarm == 'F'){
						$scope.selectedAll = false;
						$scope.settingsList = [];
						window.plugins.PushbotsPlugin.untag("all");
						window.plugins.PushbotsPlugin.tag("no");

					}
					else{
						$scope.selectedAll = true;
						$scope.settingsList = data.list;
						window.plugins.PushbotsPlugin.untag("no");
						window.plugins.PushbotsPlugin.tag("all");
					}
				}else{
					var rsltList = '0^T^|1^T^|2^T^|3^T^|4^T^|5^T^|6^T^|';
					var results = rsltList.match(/\^T\^/g);
					alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList);
					$scope.fnAlarm('checkAll');
					window.plugins.PushbotsPlugin.tag("all");
				}
			});
	}

//초기화 함수
	$scope.init = function(loginType){
		window.plugins.PushbotsPlugin.initialize("56fb66a04a9efa4f9a8b4569",{"android":{"sender_id":"832821752106"}});
		if(loginType == 'logout') {
			window.plugins.PushbotsPlugin.untag("all");
			window.plugins.PushbotsPlugin.tag("no");
			$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
			$rootScope.loginState = "R";
			$scope.loginHTML = "로그인";
			$scope.ion_login = "ion-power active";
			$scope.icon_home = "";
			$rootScope.userType = "";
			$rootScope.autoLoginYN = "N";
			$localstorage.set("autoLoginYN", $rootScope.autoLoginYN);
		}else{
			$scope.icon_home = "ion-home";
		}
		$timeout(function(){
			$ionicLoading.hide();
			$rootScope.loginData = {};
			$scope.userData = {};
			$scope.dashBoard = {};

			$rootScope.goto_with_clearHistory('#/app/main');
			// $ionicHistory.clearCache();
			// $ionicHistory.clearHistory();
			// $ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
			$state.go('app.erpia_main');
		}, 1000);
	}
	// 로그인창 닫기 함수
	$scope.closeLogin = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$scope.loginModal.hide();
		if($rootScope.mobile_Certify_YN == 'Y'){	 // 모바일 아이디 인증이 되어있다면!!  각자 LOGIN TYPE에 맞는 메인으로 이동
			if($rootScope.loginState == "S"){
		        $state.go("app.erpia_scmhome");
			}else if($rootScope.loginState == "E"){
				//$state.go("app.erpia_main");
				// $scope.onSlideMove
		        $state.go("app.slidingtab");
			}else if($rootScope.loginState == 'N'){ 
				$state.go("app.erpia_main");
			}
			// else if($rootScope.userType == 'Guest'){
			// 	$location.href = '#/app/slidingtab';
			// }
		}
		else if($rootScope.loginState != "R") {	 // logintype이 "R"(Ready) 이 아니라면 인증동의 창이 띄워지도록한다. 

			$scope.agreeModal.show();
		}
		// var PushInsertCheck = "";
		// var PushInsertCheck2 = "";

		// $scope.pushUserCheck = function() {
		// 	pushInfoService.pushInfo($scope.loginData.Admin_Code, $scope.loginData.UserId, 'Mobile_Push_Token', 'SELECT_InsertCheck', $rootScope.UserKey, $rootScope.token, '', '', '', '')
		//     .then(function(pushInfo){
		//     	if(pushInfo.data.list.length != 0){
		//     		PushInsertCheck = pushInfo.data.list[0].token;
		//     	}
		//     	if(PushInsertCheck == $rootScope.token){
		//     		PushInsertCheck2 = "duplication";
		//     		console.log('pushinfo:: duplication');
		//     	}else{
		//     		PushInsertCheck2 = "NewToken";
		//     		console.log('pushinfo:: NewToken.. Insert&Update Start');
	 //    			if(PushInsertCheck2 == "NewToken"){
		// 				$scope.pushUserRegist();
		// 			};
		//     	}
		//     },function(){
		// 		alert('pushUserCheck fail')
		// 	});
		// };

		$scope.pushUserRegist = function() {
			pushInfoService.pushInfo($scope.loginData.Admin_Code, $scope.loginData.UserId, 'Mobile_Push_Token', 'SAVE', $rootScope.UserKey, $rootScope.token, $rootScope.loginState, 'A', '', '')
		    .then(function(pushInfo){
		    	console.log(pushInfo)
		    },function(){
				/*alert('pushUserRegist fail')*/
			});
		};
		// $scope.pushUserCheck();
	};


	   $scope.gohomepage = function() {
	      $cordovaInAppBrowser.open('http://www.erpia.net', '_blank', browseroptions)

	      .then(function(event) {
	         // success
	      })

	      .catch(function(event) {
	         // error
	      });
	   }
	//로그인 체크박스
	$scope.loginckbox={
		AdminCodeCK : false,
		UserIdCK : false,
		PwdCK : false
	};

	$rootScope.loginMenu = "selectUser";	//사용자 선택화면
	$scope.selectType = function(userType){
		if(userType == 'ERPia'){
				$rootScope.loginMenu = 'User'; 
				$rootScope.userType = 'ERPia'; 
				$scope.footer_menu = 'U'; 
				if($localstorage.get("EAdminCode") == '' || $localstorage.get("EAdminCode") == undefined){
					$scope.loginckbox.AdminCodeCK = false;
					console.log( $localstorage.get("EAdminCode") , "Eundefiend");
				}else{
					$scope.loginckbox.AdminCodeCK = true;
					$rootScope.loginData.Admin_Code = $scope.logindata2.EAdminCode;

					console.log( $localstorage.get("EAdminCode") , "E");
				}
				console.log($localstorage.get("EAdminCode"));
				if($localstorage.get("EUserId") == '' || $localstorage.get("EUserId") == undefined){
					$scope.loginckbox.UserIdCK = false;
					console.log( $localstorage.get("EUserId") , "EN");
				}else{
					$scope.loginckbox.UserIdCK = true;
					$rootScope.loginData.UserId = $scope.logindata2.EUserId;
					console.log( $localstorage.get("EUserId") , "E");
				}
				if($localstorage.get("EPwd") == '' ||  $localstorage.get("EPwd") == undefined){
					$scope.loginckbox.PwdCK = false;
					console.log( $localstorage.get("EPwd") , "EN");
				}else{
					$scope.loginckbox.PwdCK = true;
					$rootScope.loginData.Pwd = $scope.logindata2.EPwd;
					console.log( $localstorage.get("EPwd") , "E");
				}
				console.log("code:" ,$rootScope.loginData.Admin_Code, "id:", $rootScope.loginData.UserId, "pwd:", $rootScope.loginData.Pwd )
		}else if(userType =='SCM'){
				$rootScope.loginMenu = 'User'; 
				$rootScope.userType = 'SCM'; 
				$scope.footer_menu = 'U'; 
				if($localstorage.get("SAdminCode") == '' || $localstorage.get("SAdminCode") == undefined){
					$scope.loginckbox.AdminCodeCK = false;
				}else{
					$rootScope.loginData.Admin_Code = $scope.logindata2.SAdminCode;
					$scope.loginckbox.AdminCodeCK = true;
				}
				if($localstorage.get("SUserId") == '' || $localstorage.get("SUserId") == undefined){
					$scope.loginckbox.UserIdCK = false;
					
				}else{
					$rootScope.loginData.UserId = $scope.logindata2.SUserId;
					$scope.loginckbox.UserIdCK = true;
				}
				if($localstorage.get("SPwd") == '' ||  $localstorage.get("SPwd") == undefined){
					$scope.loginckbox.PwdCK = false;
				}else{
					$rootScope.loginData.Pwd = $scope.logindata2.SPwd;
					$scope.loginckbox.PwdCK = true;
				}
		}else if(userType == 'Normal'){ 
				$rootScope.loginMenu = 'User'; 
				$rootScope.userType = 'Normal'; 
				$scope.footer_menu = 'U'; 
				if($localstorage.get("NAdminCode") == '' || $scope.logindata2.NAdminCode == undefined){
					$scope.loginckbox.AdminCodeCK = false;

				}else{
					$rootScope.loginData.Admin_Code = $localstorage.get("NAdminCode");
					$scope.loginckbox.AdminCodeCK = true;
				}
				if($localstorage.get("NUserId") == '' || $localstorage.get("NUserId") == undefined){
					$scope.loginckbox.UserIdCK = false;
				}else{
					$rootScope.loginData.UserId = $scope.logindata2.NUserId;
					$scope.loginckbox.UserIdCK = true;
				}
				if($localstorage.get("NPwd") == '' || $localstorage.get("NPwd") == undefined){
					$scope.loginckbox.PwdCK = false;
				}else{
					$rootScope.loginData.Pwd = $scope.logindata2.NPwd;
					$scope.loginckbox.PwdCK = true;	
				}
		}else if(userType == 'Guest'){
				$rootScope.loginMenu = 'User'; $rootScope.userType = 'Guest'; $scope.footer_menu = 'G';
				$scope.loginModal.hide();
				$scope.doLogin();
		}else{
				$rootScope.loginMenu = 'selectUser';
		}
	}
	
	// Open the login modal
	$scope.login = function() {
		$scope.logindata2.EAdminCode = $localstorage.get("EAdminCode");
		$scope.logindata2.EUserId = 	$localstorage.get("EUserId");
		$scope.logindata2.EPwd = $localstorage.get("EPwd");
		$scope.logindata2.SAdminCode = $localstorage.get("SAdminCode");
		$scope.logindata2.SUserId = $localstorage.get("SUserId");
		$scope.logindata2.SPwd = $localstorage.get("SPwd");
		$scope.logindata2.NAdminCode = $localstorage.get("NAdminCode");
		$scope.logindata2.NUserId = $localstorage.get("NUserId");
		$scope.logindata2.NPwd = $localstorage.get("NPwd");
		$rootScope.loginMenu = 'selectUser';
		if($rootScope.loginState == 'R'){
			$scope.loginModal.show();
			$scope.init('login');
		}else{
			$scope.footer_menu = 'G';
			$scope.init('logout');
		};
	};

	// 업체코드, 아이디, 패스워드 저장하기..
	$scope.LoginAdminCodeCK=function(userType){
		if($scope.loginckbox.AdminCodeCK == true){
			console.log($scope.loginckbox.AdminCodeCK);
			switch(userType){
				case 'ERPia' : 
					$localstorage.set("EAdminCode", $rootScope.loginData.Admin_Code);
					console.log($localstorage.get("EAdminCode"));
				break;
				case 'SCM' : 
					$localstorage.set("SAdminCode", $rootScope.loginData.Admin_Code);
				break;
				case 'Normal' : 
					$localstorage.set("NAdminCode", $rootScope.loginData.Admin_Code);
				break;
			}
		}else{
			console.log("2",$scope.loginckbox.AdminCodeCK);
			switch(userType){
				case 'ERPia' : 
					$localstorage.set("EAdminCode", '');
					console.log($localstorage.get("EAdminCode"));
				break;
				case 'SCM' : 
					$localstorage.set("SAdminCode", '');
				break;
				case 'Normal' : 
					$localstorage.set("NAdminCode", '');
				break;
			}
		}
	};

	$scope.LoginUserIdCK=function(userType){
		if($scope.loginckbox.UserIdCK == true){
			switch(userType){
				case 'ERPia' :
					$localstorage.set("EUserId", $rootScope.loginData.UserId);
				break;
				case 'SCM' : 
					$localstorage.set("SUserId", $rootScope.loginData.UserId);
				break;
				case 'Normal' : 
					$localstorage.set("NUserId", $rootScope.loginData.UserId);
				break;
			}
		}else{
			switch(userType){
				case 'ERPia' : 
					$localstorage.set("EUserId", '');
				break;
				case 'SCM' : 
					$localstorage.set("SUserId", '');
				break;
				case 'Normal' : 
					$localstorage.set("NUserId", '');
				break;
			}
		}
	};

	$scope.LoginPwdCK=function(userType){
		if($scope.loginckbox.PwdCK == true){
			switch(userType){
				case 'ERPia' : 
					$localstorage.set("EPwd", $rootScope.loginData.Pwd);
				break;
				case 'SCM' : 
					$localstorage.set("SPwd", $rootScope.loginData.Pwd);
				break;
				case 'Normal' : 
					$localstorage.set("ESPwd", $rootScope.loginData.Pwd);
				break;
			}
		}else{
			switch(userType){
				case 'ERPia' : 
					$localstorage.set("EPwd", '');
				break;
				case 'SCM' : 
					$localstorage.set("SPwd", '');
				break;
				case 'Normal' : 
					$localstorage.set("ESPwd", '');
				break;
			}
		}
	};

	// 로그인 함수
	$scope.doLogin = function(admin_code, loginType, id, pwd, autologin_YN) {
		console.log("dologin")
		if (autologin_YN == 'Y') {
			switch(loginType){
				case 'E' : $rootScope.userType = 'ERPia'; $rootScope.loginMenu = 'User'; $scope.footer_menu = 'U'; break;
				case 'S' : $rootScope.userType = 'SCM'; $rootScope.loginMenu = 'User'; $scope.footer_menu = 'U'; break;
				case 'N' : $rootScope.userType = 'Normal'; $rootScope.loginMenu = 'User'; $scope.footer_menu = 'U'; break;
			}
			$rootScope.loginData.Admin_Code = admin_code;
			$rootScope.loginData.UserId = id;
			$rootScope.loginData.Pwd = pwd;
		}else{
			switch($rootScope.userType){
				case 'ERPia': userType ='E'; break;
				case 'SCM': userType = 'S'; break;
				case 'Normal': userType = 'N'; break;
			}
			if(ERPiaAPI.toast == 'Y'){
				uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.loginData.autologin_YN);
				console.log("test1234")
			}else{
				switch($rootScope.userType){
					case 'SCM':
						// $scope.loginData.Admin_Code = 'onz';
						// $scope.loginData.UserId = '1111';
						// $scope.loginData.Pwd = '1234';
						// $scope.loginData.Admin_Code = 'phj9775';
						// $scope.loginData.UserId = 'scmtest';
						// $scope.loginData.Pwd = 'scmtest';
					break;
					case 'ERPia':
						// $scope.loginData.Admin_Code = 'demopro';
						// $scope.loginData.UserId = 'demopro';
						// $scope.loginData.Pwd = 'demopro';
						// $scope.loginData.Admin_Code = 'onz';
						// $scope.loginData.UserId = 'test1234';
						// $scope.loginData.Pwd = 'test1234!';
					break;
				}
			}
		}
		//SCM 로그인
		if ($rootScope.userType == 'SCM') {
			loginService.comInfo('scm_login', $scope.loginData.Admin_Code, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.deviceInfo2.phoneNo)
			.then(function(comInfo){
				if (comInfo.data.list[0].ResultCk == '1'){
					$scope.userData.GerName = comInfo.data.list[0].GerName + '<br>(' + comInfo.data.list[0].G_Code + ')';
					$scope.userData.G_Code = comInfo.data.list[0].G_Code;
					$scope.userData.G_Sano = comInfo.data.list[0].Sano;
					$scope.userData.GerCode = comInfo.data.list[0].G_Code;
					if(comInfo.data.list[0].cntNotRead == null){
						$scope.userData.cntNotRead = 0;
					}else{
						$scope.userData.cntNotRead = comInfo.data.list[0].cntNotRead;
					}
					$scope.loginHTML = "로그아웃";
					$scope.ion_login = "ion-power";
					$rootScope.loginState = "S";
					$rootScope.mobile_Certify_YN = comInfo.data.list[0].mobile_CertifyYN;

					$scope.loginData.isLogin = 'Y';

					if($scope.loginData.chkAutoLogin == true){
						if(ERPiaAPI.toast == 'Y'){
							uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y');
							$scope.loginData.autologin_YN = 'Y';
						}else{
							uuidService.saveUUID('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y');
						}
					}else{
						if(ERPiaAPI.toast == 'Y'){
							uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N');
							$scope.loginData.autologin_YN = 'N';
						}else{
							uuidService.saveUUID('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N');
						}
					}

					$timeout(function() {
						$ionicLoading.hide();
						$scope.closeLogin();
						$scope.pushYNcheck();
					}, 1000);
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show(comInfo.data.list[0].ResultMsg, 'long', 'center');
					else alert(comInfo.data.list[0].ResultMsg);
				}
			},function(){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('login error', 'long', 'center');
					else alert('login error');
			});
		}else if ($rootScope.userType == 'ERPia'){
			//ERPia 로그인
			loginService.comInfo('ERPiaLogin', $scope.loginData.Admin_Code, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.deviceInfo2.phoneNo)
			.then(function(comInfo){// 4.11 로그인할때 핸드폰번호 추가
				if(comInfo.data.list[0].Result=='1'){
					$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
					$scope.loginHTML = "로그아웃";
					$scope.ion_login = "ion-power";

					$scope.userData.Com_Code = comInfo.data.list[0].Com_Code;
					$scope.userData.Com_Name = comInfo.data.list[0].Com_Name + '<br>(' + comInfo.data.list[0].Com_Code + ')';
					$scope.userData.package = comInfo.data.list[0].Pack_Name;
					$scope.userData.cnt_user = comInfo.data.list[0].User_Count + ' 명';
					$scope.userData.cnt_site = comInfo.data.list[0].Mall_ID_Count + ' 개';

					$rootScope.mobile_Certify_YN = comInfo.data.list[0].mobile_CertifyYN;

					$scope.loginData.isLogin = 'Y';

					loginService.comInfo('erpia_ComInfo', $scope.loginData.Admin_Code)
					.then(function(comTax){
						var d= new Date();
						var month = d.getMonth() + 1;
						var day = d.getDate();
						var data = comTax.data;

						Pay_Method = data.list[0].Pay_Method;
						Pay_State = data.list[0].Pay_State;
						Max_Pay_YM = data.list[0].Max_Pay_YM;
						Pay_Ex_Days = parseInt(data.list[0].Pay_Ex_Days);
						Pay_Day = parseInt(data.list[0].Pay_Day);
						Pay_Ex_Date = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
						Last_Pay_YM = data.list[0].Last_Pay_YM;
						if (Pay_Method != 'P')
						{
							if (Pay_State == 'Y')	//당월결재존재
							{
								if (Max_Pay_YM != '')
								{
									if (Pay_Ex_Days >= 0)
									{
										//G_Expire_Days = DateDiff("D", Now_Date, DateAdd("M", 1, Max_Pay_YM & "-01")) + CInt(Pay_Day) + CInt(Pay_Ex_Days) - 1
										Max_Pay_Y = Max_Pay_YM.split('-')[0];
										Max_Pay_M = Max_Pay_YM.split('-')[1];
										var d1 = new Date(Max_Pay_Y, Max_Pay_M, Pay_Day);
										var diffD = d1 - d;
										G_Expire_Date =  d.getFullYear() + '.' + (month<10 ? '0':'') + month + '.' + (day<10 ? '0' : '') + day;
										G_Expire_Days = Math.ceil(diffD/(24*3600*1000));
									}else{
										G_Expire_Days = '무제한';
										G_Expire_Date = '무제한';
									}
								}
							}else{
								if (Pay_Ex_Days < 0)		//당월결재미존재, 초과허용무제한
								{
									G_Expire_Days = '무제한';
									G_Expire_Date = '무제한';
								}else{
									if (Last_Pay_YM == '')	//당월결재미존재, 이전결재내역미존재
									{
										G_Expire_Days = "0";
										G_Expire_Date = "기간만료";
									}else{					//당월결재미존재, 이전결재내역존재
										Max_Pay_Y = Max_Pay_YM.split('-')[0];
										Max_Pay_M = Max_Pay_YM.split('-')[1];
										if (new Date(Max_Pay_Y, Max_Pay_M, Pay_Day) < d)
										{
											G_Expire_Days = "0"
											G_Expire_Date = "기간만료"
										}else{
											//G_Expire_Days = DateDiff("D", Now_Date, DateAdd("D", CInt(Pay_Day) + CInt(Pay_Ex_Days) - 1, DateAdd("M", 1, Last_Pay_YM & "-01")))
											//G_Expire_Date = DateAdd("D", CInt(Pay_Day) + CInt(Pay_Ex_Days) - 1, DateAdd("M", 1, Last_Pay_YM & "-01"))
										}
									}
								}
							}
						}else{
							G_Expire_Days = "무제한"
							if (CLng(IO_Amt) + CLng(Point_Ex_Amt) - CLng(Point_Out_StandBy_Amt) <= 0)
							{
								G_Expire_Date = "포인트부족"
							}else{
								G_Expire_Date = CLng(IO_Amt) + CLng(Point_Ex_Amt) - CLng(Point_Out_StandBy_Amt)
							}
						}

						//$scope.userData.cntNotRead = data.list[0].CNT_Tax_No_Read;	//계산서 미수신건
						$scope.userData.expire_date = G_Expire_Date; //"2015년<br>8월20일";
						$scope.userData.expire_days = G_Expire_Days;

						$scope.management_bill = "330,000원	<br><small>(VAT 포함)</small>";
						$scope.sms = "15000 개<br><small>(건당 19원)</small>";
						$scope.tax = "150 개<br><small>(건당 165원)</small>";
						$scope.e_money = "30,000원<br><small>(자동이체 사용중)</small>";
						$scope.every = "10,000 P";

						$rootScope.loginState = "E";

						tradeDetailService.getCntNotRead($scope.loginData.Admin_Code, 'Y')
						.then(function(response){
								$scope.userData.cntNotRead = response.list[0].cntNotRead;

						})

						if($scope.loginData.chkAutoLogin == true){
							if(ERPiaAPI.toast == 'Y'){
								uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y');
								$scope.loginData.autologin_YN = 'Y';
							}else{
								uuidService.saveUUID('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y');
							}
						}else{
							if(ERPiaAPI.toast == 'Y'){
								uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N');
								$scope.loginData.autologin_YN = 'N';
							}else{
								uuidService.saveUUID('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N');
							}
						}

						$timeout(function() {
							$ionicLoading.hide();
							$scope.closeLogin();
							$scope.pushYNcheck();
						}, 1000);
					},
					function(){
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('계정정보가 존재하지 않습니다', 'long', 'center');
						else alert('comTax error');
					})
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show(comInfo.data.list[0].Comment, 'long', 'center');
					else alert(comInfo.data.list[0].Comment);
				}
			},function(){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('계정정보가 존재하지 않습니다.', 'long', 'center');
				else alert('comInfo error');
			});
		}else if($rootScope.userType == 'Normal'){
			loginService.comInfo('ERPia_Ger_Login', $scope.loginData.Admin_Code, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.deviceInfo2.phoneNo)
			.then(function(comInfo){
				if(comInfo.data.list[0].result == '0'){
					$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
					$scope.loginData.UserId = comInfo.data.list[0].G_ID;

					$scope.userData.GerName = comInfo.data.list[0].GerName + '<br>(' + comInfo.data.list[0].G_Code + ')';
					$scope.userData.G_Code = comInfo.data.list[0].G_Code;
					$scope.userData.G_Sano = comInfo.data.list[0].Sano;
					$scope.userData.GerCode = comInfo.data.list[0].G_Code;
					$scope.userData.cntNotRead = comInfo.data.list[0].cntNotRead;

					$scope.loginHTML = "로그아웃";
					$scope.ion_login = "ion-power";
					$rootScope.loginState = "N";
					$rootScope.mobile_Certify_YN = 'Y';

					$scope.loginData.isLogin = 'Y';

					if($scope.loginData.chkAutoLogin == true){
						if(ERPiaAPI.toast == 'Y'){
							uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y');
							$scope.loginData.autologin_YN = 'Y';
						}else{
							uuidService.saveUUID('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y');
						}
					}else{
						if(ERPiaAPI.toast == 'Y'){
							uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N');
							$scope.loginData.autologin_YN = 'N';
						}else{
							uuidService.saveUUID('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N');
						}
					}

					$timeout(function() {
						$ionicLoading.hide();
						$scope.closeLogin();
					}, 1000);
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show(comInfo.data.list[0].comment, 'long', 'center');
					else alert(comInfo.data.list[0].comment);
				}
			})
		}else if($rootScope.userType == 'Guest'){
			$rootScope.loginState = "E"
			$scope.loginHTML = "로그아웃"; //<br>(" + comInfo.data.list[0].Com_Code + ")";
			$scope.ion_login = "ion-power";
			$scope.userData.Com_Name = '테스트용계정' + '<br>(' + 'ERPMobile' + ')';
			$scope.loginData.Admin_Code = 'ERPMobile';
			$scope.loginData.UserId = 'ERPMobile';
			$scope.loginData.isLogin = 'Y';

			$scope.userData.package = 'Professional';
			$scope.userData.cnt_user = '5 명';
			$scope.userData.cnt_site = '10 개';

			$scope.userData.cntNotRead = 10;	//계산서 미수신건
			$scope.userData.expire_date = '2016-04-31'; //"2015년<br>8월20일";
			$scope.userData.expire_days = 50;
			$state.go('app.sample_Main');
		}
		$scope.LoginAdminCodeCK($rootScope.userType);
		$scope.LoginPwdCK($rootScope.userType);
		$scope.LoginUserIdCK($rootScope.userType);
	};

  	$scope.loginHTML = "로그인";

  	// 약관 동의 클릭 이벤트
  	$scope.click_agreement = function(agrees){
		if(agrees.agree_1 && agrees.agree_2){
			$scope.agreeModal.hide();
			$scope.certificationModal.show();
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('약관에 동의해 주시기 바랍니다.', 'long', 'center');
			else alert('약관에 동의해 주시기 바랍니다.');
		}
	}

	// 약관 동의 취소 클릭 이벤트
	$scope.click_cancel = function(){
		$scope.agreeModal.hide();
		$scope.init('logout');
	}
	// 인증번호 전송 버튼 클릭 이벤트
	$scope.click_Certification = function(){
		CertifyService.certify($scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, 'erpia', 'a12345', '070-7012-3071', $scope.SMSData.recUserTel)
		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증번호를 발송했습니다.', 'long', 'center');
		else alert('인증번호를 발송했습니다.');
	}
	// 인증번호 입력 버튼 클릭 이벤트
	$scope.click_responseText = function(){
		if($rootScope.rndNum == $scope.SMSData.rspnText){
			CertifyService.check($scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $scope.SMSData.rspnText, $scope.SMSData.recUserTel)
			.then(function(response){
				console.log('rspnText : ', response);
				$scope.certificationModal.hide();
			})
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증번호가 일치하지 않습니다.', 'long', 'center');
			else alert('인증번호가 일치하지 않습니다.');
			return false;
		}
	}

	// 모달창을 띄워주는 함수
	$scope.showCheckSano = function(){
		$scope.check_sano_Modal.show();
	}
	// 로그인 화면에서 이알피아 아이콘을 클릭하면 사용자 선택화면으로 돌아간다.
	$scope.login_back = function(){
		$rootScope.loginMenu = "selectUser";
	}
	// 홈버튼 클릭 함수
	$scope.click_home = function(){
		if($rootScope.userType == 'ERPia') $location.href = '#/slidingtab'; //$state.go('app.slidingtab');
		else if($rootScope.userType == 'Guest') $location.href = '#/sample/Main'; //$state.go('app.sample_Main');
	}
	// 인증 모달 닫기 함수
	$scope.close_cert = function(){
		$scope.certificationModal.hide();
		$scope.init('logout');
	}
	$rootScope.deviceInfo2={};

	// function autoHypenPhone(str){
	// str = str.replace(/[^0-9]/g, '');
	// var tmp = '';
	// 	if( str.length < 4){
	// 		return str;
	// 	}else if(str.length < 7){
	// 		tmp += str.substr(0, 3);
	// 		tmp += '-';
	// 		tmp += str.substr(3);
	// 		return tmp;
	// 	}else if(str.length < 11){
	// 		tmp += str.substr(0, 3);
	// 		tmp += '-';
	// 		tmp += str.substr(3, 3);
	// 		tmp += '-';
	// 		tmp += str.substr(6);
	// 		return tmp;
	// 	}else{				
	// 		tmp += str.substr(0, 3);
	// 		tmp += '-';
	// 		tmp += str.substr(3, 4);
	// 		tmp += '-';
	// 		tmp += str.substr(7);
	// 		return tmp;
	// 	}
	// 	return str;
	// }

	// 단말기로 접속시 UUID의 정보를 불러와서 자동로그인 여부를 체크한 후 자동 로그인 시켜준다.
	 document.addEventListener("deviceready", function () {
	 	var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
		deviceInfo.get(function(result) {
		        console.log("result = " + result);
		        $rootScope.deviceInfo2 = JSON.parse(result);
		        var phoneNo=$rootScope.deviceInfo2.phoneNo;
		        if(phoneNo.substring(0,1)=="+"){
		         // $rootScope.deviceInfo2.phoneNo.replace(\+82, 00);
		         $rootScope.deviceInfo2.phoneNo=phoneNo.toString().replace("+82", "0");
		    }else{
		    	console.log("아니야",phoneNo.substring(0,1) );		    
		    }
		   	$scope.SMSData.recUserTel =  $rootScope.deviceInfo2.phoneNo;
			console.log("$scope.SMSData.recUserTel", $scope.SMSData.recUserTel);
		        console.log($rootScope.deviceInfo2.phoneNo);
		    }, function() {
		        console.log("error");
		    });
		$rootScope.deviceInfo.device = $cordovaDevice.getDevice();
		$rootScope.deviceInfo.cordova = $cordovaDevice.getCordova();
		$rootScope.deviceInfo.model = $cordovaDevice.getModel();
		$rootScope.deviceInfo.platform = $cordovaDevice.getPlatform();
		$rootScope.deviceInfo.uuid = $cordovaDevice.getUUID();
		$rootScope.deviceInfo.version = $cordovaDevice.getVersion();
		$scope.ckversion={};
	   	$scope.thisversioncurrent='Y';
	   	$scope.thisversion='';
	   	$scope.currentversion='';
		VersionCKService.currentVersion()
		.then(function(data){
			$timeout(function(){
				if(data != '<!--Parameter Check-->'){
					$rootScope.ckversion = data;
					console.log("currentVersionService", $rootScope.ckversion);
				if(ionic.Platform.isAndroid()==true){
						console.log('android');
						var version = $scope.version.Android_version.split('.');
						version = version[0]+'.'+version[1]+version[2];
					     	version = parseFloat(version);
					     	console.log("version", version);
						var ckversion = $rootScope.ckversion.Android_version.split('.');
						ckversion = ckversion[0]+'.'+ckversion[1]+ckversion[2];
						ckversion = parseFloat(ckversion);
						console.log("ckversion", ckversion);
						$scope.thisversion=$rootScope.version.Android_version;
						$scope.currentversion=$rootScope.ckversion.Android_version;
					if (version<ckversion) $scope.updatego();
					else $scope.thisversioncurrent='Y';
				}else{
					console.log('ios');
					var version = $scope.version.IOS_version.split('.');
					version = version[0]+'.'+version[1]+version[2];
				     	version = parseFloat(version);
				     	console.log("version", version);
					var ckversion = $rootScope.ckversion.IOS_version.split('.');
					ckversion = ckversion[0]+'.'+ckversion[1]+ckversion[2];
					ckversion = parseFloat(ckversion);
					console.log("ckversion", ckversion);
					$scope.thisversion=$rootScope.version.IOS_version;
					$scope.currentversion=$rootScope.ckversion.IOS_version;
					if (version<ckversion) $scope.updatego();
					else $scope.thisversioncurrent='Y';
				}
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회실패. 데이터접속을 확인해주세요.', 'short', 'center');
				else alert('조회실패. 데이터접속을 확인해주세요.');
			}
		      		}, 1000);
				console.log("지금버전은?: ",$scope.thisversioncurrent, "최신버전: ",$scope.currentversion, "지금버전: ",$scope.thisversion);
		});

			$scope.updatego=function(){
				      $ionicPopup.show({
				         title: '업데이트알림',
				         subTitle: '',
				         content: '버전이 업데이트 되었습니다.  업데이트창으로 이동합니다.',
				         buttons: [
				           {
				             text: '확인',
				             type: 'button-positive',
				             onTap: function(e) {
				             	if(ionic.Platform.isAndroid()==true) window.open('https://play.google.com/apps/testing/com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
						else location.href=window.open('https://play.google.com/apps/testing/com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
				             }
				           },
				         ]
				        })
			}
		uuidService.getUUID($rootScope.deviceInfo.uuid)
		.then(function(response){
			if(response.list[0].result == '1'){
				$rootScope.loginData.Admin_Code = response.list[0].admin_code;
				$rootScope.loginData.loginType = response.list[0].loginType;
				$rootScope.loginData.User_Id = response.list[0].ID;
				$rootScope.loginData.Pwd = response.list[0].pwd;
				$rootScope.loginData.autologin_YN = response.list[0].autoLogin_YN;
				$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
				console.log("getUUID")
			}
			if($rootScope.loginData.autologin_YN=='Y'){
				$rootScope.autoLogin = true;
				$rootScope.loginData.chkAutoLogin=true;
				$scope.doLogin($scope.loginData.Admin_Code, $scope.loginData.loginType, $scope.loginData.User_Id, $scope.loginData.Pwd, $scope.loginData.autologin_YN);
			}else{
				$rootScope.autoLogin = false;
				$rootScope.loginData.chkAutoLogin=false;
			}
		})


		console.log('autoLogin_YN' ,$localstorage.get("autoLoginYN"));
	 }, false);

	if($localstorage.get("autoLoginYN")=='Y'){
		uuidService.getUUID($rootScope.deviceInfo.uuid)
		.then(function(response){
		if(response.list[0].result == '1'){
			$rootScope.loginData.Admin_Code = response.list[0].admin_code;
			$rootScope.loginData.loginType = response.list[0].loginType;
			$rootScope.loginData.User_Id = response.list[0].ID;
			$rootScope.loginData.Pwd = response.list[0].pwd;
			$rootScope.loginData.autologin_YN = response.list[0].autoLogin_YN;
		}
		if($rootScope.loginData.autologin_YN=='Y'){
			$rootScope.autoLogin = true;
			$rootScope.loginData.chkAutoLogin=true;
			$scope.doLogin($scope.loginData.Admin_Code, $scope.loginData.loginType, $scope.loginData.User_Id, $scope.loginData.Pwd, $scope.loginData.autologin_YN);
		}else{
			$rootScope.autoLogin = false;
			$rootScope.loginData.chkAutoLogin=false;
		}
		})
	}

})
// 거래명세표 컨트롤러
.controller('tradeCtrl', function($scope, $rootScope, $state, $ionicSlideBoxDelegate, $cordovaToast, $ionicModal, $ionicHistory, $location
	, tradeDetailService, ERPiaAPI, $cordovaSocialSharing, $cordovaFileTransfer, $ionicPopup){

	$scope.email ={
		toemail : ''
	};

	$ionicModal.fromTemplateUrl('side/trade_Detail.html',{
		scope : $scope
	}).then(function(modal){
		$rootScope.trade_Detail_Modal = modal;
	});
	$scope.check = {};
	$scope.tradeList = {};

	$scope.YNcheck='not';

	$scope.reload_tradelist = function(){
	// 각각의 로그인 타입별로 보여지는 화면을 다르게 표시.
	if($rootScope.userType == 'SCM' || $rootScope.userType == "Normal"){
		$scope.tradeList.Title = '매출거래처 수신함';
		$scope.tradeList.MeaipMeachul = '매출일';
		$scope.tradeList.Publisher = '발행처';
		$scope.tradeList.isRead = '열람';
		tradeDetailService.tradeList($scope.loginData.Admin_Code, $scope.userData.GerCode)
			.then(function(response){
				console.log('list', response);
				if(response.list.length == 0) {
					$scope.haveList = 'N';
				}else{
					$scope.haveList = 'Y';
					$scope.items = response.list;
				}
				console.log('haveList', $scope.haveList);
			})
	}else if($rootScope.userType == 'ERPia'){
		$scope.tradeList.Title = '매출거래처 발송 내역';
		$scope.tradeList.MeaipMeachul = '매입일';
		$scope.tradeList.Publisher = '발송처';
		$scope.tradeList.isRead = '수신확인';
		tradeDetailService.getCntNotRead($scope.loginData.Admin_Code, 'N')
			.then(function(response){
				if(response.list.length == 0) {
					$scope.haveList = 'N';
				}else{
					$scope.haveList = 'Y';
					$scope.items = response.list;
				}
				console.log('haveList', $scope.haveList);
			})
	}

	}
$scope.reload_tradelist(); 
//여기해야됨
	$scope.tradechange = function(){
		if($scope.YNcheck == 'not'){
			$scope.YNcheck == 'all';
		}else{
			$scope.YNcheck == "not";
		}
	}

	function commaChange(Num)
	{
		fl="";
		Num = new String(Num);
		temp="";
		co=3;
		num_len=Num.length;
		while (num_len>0)
		{
			num_len=num_len-co;
			if(num_len<0)
			{
				co=num_len+co;
				num_len=0;
			}
			temp=","+Num.substr(num_len,co)+temp;
		}
		rResult =  fl+temp.substr(1);
		return rResult;
	}

	function checklist(obj){
		if(obj == null || obj == undefined){
			obj = '';
		}
		return obj;
	}

	function checklist2(obj){
		if(obj == null || obj == undefined){
			obj = '';
			return obj;
		}else{
			return commaChange(obj);
		}

	}

	$scope.tradenumber = function(detaillist, where){
		$rootScope.detaillist = detaillist;
		$rootScope.where = where;
		// var Sl_No = detaillist[0].SL_No;
		tradeDetailService.readDetail_key($scope.loginData.Admin_Code, $rootScope.Sl_No)
			.then(function(response){
				$rootScope.Key_New_No = response.list[0].Key_New_No;
				$scope.html3image($rootScope.detaillist, $rootScope.where);
			});
	}

	$scope.html3image = function(detaillist, where){
		for(var i = 0; i < detaillist.length; i++){
			var detail = detaillist[i];
			var j = i+1;
			var html_start =  "<html><body>";
			var html_view1 = "<table width=1080 ><tr><td name='td_User_Date' width=300 align=left>"+ detail.MeaChul_Date + '('+$scope.loginData.UserId+')'  + "</td><td width=420 align=center style='color:blue;'><u style='font-size:30px;'>거래명세표</u> (공급받는자용)</td><td name='td_Sl_No_Time' style='color:blue;' width=300 align=right>No."+ $rootScope.Key_New_No+"</td></tr></table>";
			var html_view2 = "<table width=1080 cellspacing=0 cellpadding=0 ><tr><td style='color:blue; border-left: solid #0100FF; border-right: solid #0100FF; border-top: solid #0100FF; border-bottom: solid #0100FF;' width=25 rowspan=4 align=center>공<br/>급<br/>자</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF; border-top: solid #0100FF;' width=45>등 록<br/>번 호</td><td name='td_SaNo1' style='border-bottom: solid #0100FF; border-top: solid #0100FF;' colspan=6>" + detail.R_Sano + "</td><td style='color:blue; border-top: solid #0100FF; border-bottom: solid #0100FF; border-left: solid #0100FF; border-right: solid #0100FF;'  width=25 rowspan=5 align=center>공<br/>급<br/>받<br/>는<br/>자</td><td style='color:blue; border-bottom: solid #0100FF; border-top: solid #0100FF; border-right: solid #0100FF;'  width=45>등 록<br/>번 호</td><td name='td_SaNo2' style='border-bottom: solid #0100FF; border-top: solid #0100FF; border-right: solid #0100FF;'  colspan=6>" + detail.Sano + "</td></tr>";
			var html_view3 = "<tr><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;'>상 호</td><td name='td_GerName1' style='border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=2>" + detail.R_Snm +"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' width=10 colspan=2>성 명</td><td name='td_userName1' style='border-bottom: solid #0100FF;'>" + detail.R_Boss + "</td><td style='color:blue; border-bottom: solid #0100FF; border-right: solid #0100FF;' align=right>(인)</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;''>상 호</td><td name='td_GerName2' style='border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=3>" + detail.Snm + "</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' width=45>성 명</td><td name='td_userName2' style='border-bottom: solid #0100FF;'>" + detail.Boss + "</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' align=right>(인)</td></tr>";
			var html_view4 = "<tr><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;'>주 소</td><td name='td_Addr1' style='border-bottom: solid #0100FF;'colspan=6>"+detail.R_Addr+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;'>주 소</td><td name='td_Addr2' style='border-bottom: solid #0100FF; border-right: solid #0100FF;' colspan=6>"+detail.Addr+"</td> </tr>";
			var html_view5 = "<tr><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;'>업 태</td><td name='td_UpType1' style='border-right: solid #0100FF; border-bottom: solid #0100FF;'>"+ detail.R_up +"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' width=45>종 목</td><td name='td_Category1' style='border-bottom: solid #0100FF;' colspan=4>"+detail.R_jong+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;''>업 태</td><td name='td_UpType2' style='border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=2>"+detail.Up+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' width=45>종 목</td><td name='td_Category2'style='border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=3>"+detail.Jong+"</td></tr>";
			var html_view6 = "<tr><td style='color:blue; border-left: solid #0100FF; border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=2>합계금액</td><td name='td_TotAmt' style='border-right: solid #0100FF; border-bottom: solid #0100FF;'>"+commaChange(detail.Hap)+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=2>전잔액</td><td name='td_PreJanAmt' style='border-bottom: solid #0100FF;' colspan=3>"+commaChange(detail.Pre_Jan_Amt)+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;'>담 당</td><td name='td_DamDang' style='border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=2>"+detail.G_GDamdang+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;'>전 화</td><td name='td_Tel' style='border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=3>"+detail.G_GDamdangTel+"</td></tr>";
			var html_view7 = "<tr><td style='color:blue; border-bottom: solid #0100FF; border-left: solid #0100FF; border-right: solid #0100FF;' colspan=2>입 금 액</td><td name='td_Deposit 'style='border-right: solid #0100FF; border-bottom: solid #0100FF;'>"+commaChange(detail.In_Amt)+"</td><td style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=2>현잔액</td><td name='td_NowJanAmt' style='border-bottom: solid #0100FF;' colspan=3>" + commaChange(detail.Cur_Jan_Amt )+ "</td><td style='color:blue; border-bottom: solid #0100FF; border-left: solid #0100FF; border-right: solid #0100FF;' colspan=2>인 수 자</td><td name='td_Receiver' style='border-bottom: solid #0100FF; '>"+detail.Boss+"</td><td style='color: blue; border-bottom: solid #0100FF; border-right: solid #0100FF;' align='right'>(인)</td>	<td name='td_Receiver_Mark' style='color:blue; border-right: solid #0100FF; border-bottom: solid #0100FF;' colspan=4>아래의 금액을&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;합니다.</td></tr></table>";

			//두번째 테이블
			var html_view8 = "<table bordercolor='#0100FF' border=3 width=1080 style='margin-top:10px;' cellspacing=0 cellpadding=0><thead style='color:blue; border-bottom: solid #0100FF;'><th width=550 style='border-right:2px solid #0100FF;'' colspan=3>품목 및 규격</th><th style='border-right:2px solid #0100FF;'' width=97>수 량</th><th style='border-right:2px solid #0100FF;'' width=140>단 가</th><th style='border-right:2px solid #0100FF;'' width=140>공 급 가 액</th><th width=140>세 액</th></thead>";
			var html_view9 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name1)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea1)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price1)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong1)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax1)+"</td></tr>";
			var html_view10 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name2)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea2)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price2)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong2)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax2)+"</td></tr>";
			var html_view11 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name3)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea3)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price3)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong3)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax3)+"</td></tr>";
			var html_view12 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name4)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea4)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price4)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong4)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax4)+"</td></tr>";
			var html_view13 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name5)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea5)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price5)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong5)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax5)+"</td></tr>";
			var html_view14 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name6)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea6)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price6)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong6)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax6)+"</td></tr>";
			var html_view15 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name7)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea7)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price7)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong7)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax7)+"</td></tr>";
			var html_view16 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name8)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea8)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price8)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong8)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax8)+"</td></tr>";
			var html_view17 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;'>"+ checklist(detail.G_name9)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist(detail.G_ea9)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_price9)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.G_Gong9)+"</td><td width=140 style='border-bottom: 2px solid #0100FF;' align=right>"+checklist2(detail.tax9)+"</td></tr>";
			var html_view18 = "<tr><td colspan=3 width=550 style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;'>"+ checklist(detail.G_name10)+"</td><td width=97 style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;' align=right>"+checklist(detail.G_ea10)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;' align=right>"+checklist2(detail.G_price10)+"</td><td width=140 style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;' align=right>"+checklist2(detail.G_Gong10)+"</td><td width=140 style='border-bottom: solid #0100FF;' align=right>"+checklist2(detail.tax10)+"</td></tr>";
			var html_view19 = "<tr><td rowspan=2 style='width:45px; height:100px; border-right:2px solid #0100FF;'>비 고<br/><br/>사 항</td><td width=450>"+ detail.bigo +"</td><td  style='height:25px; border-right: solid #0100FF; border-bottom: solid #0100FF; border-left:2px solid #0100FF;'>합계</td><td style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;' align=right>"+checklist(detail.numhap)+"</td><td style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;' align=right>"+checklist2(detail.pricehap)+"</td><td style='border-right:2px solid #0100FF; border-bottom: solid #0100FF;' align=right>"+checklist2(detail.Hap)+"</td><td style='border-bottom: solid #0100FF;' align=right>"+checklist2(detail.taxhap)+"</td></tr><tr><td colspan=6 ></td></tr></table><span align='center'>(" + j + "/" + detaillist.length + ")</span><br>"



			var html2_view1 = "<table width=1080 ><tr><td name='td_User_Date' width=300 align=left>"+ detail.MeaChul_Date + '('+$scope.loginData.UserId+')'  +"</td><td width=420 align=center style='color:red;'><u style='font-size:30px;'>거래명세표</u> (공급자용)</td><td name='td_Sl_No_Time' style='color:red' width=300 align=right>No."+ detail.Publish_No +"</td></tr></table>";
			var html2_view2 = "<table width=1080 cellspacing=0 cellpadding=0 ><tr><td style='color:red; border-left: solid #FF0000; border-right: solid #FF0000; border-top: solid #FF0000; border-bottom: solid #FF0000;' width=25 rowspan=4 align=center>공<br/>급<br/>자</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000; border-top: solid #FF0000;' width=45>등 록<br/>번 호</td><td name='td_SaNo1' style='border-bottom: solid #FF0000; border-top: solid #FF0000;' colspan=6>" + detail.R_Sano + "</td><td style='color:red; border-top: solid #FF0000; border-bottom: solid #FF0000; border-left: solid #FF0000; border-right: solid #FF0000;'  width=25 rowspan=5 align=center>공<br/>급<br/>받<br/>는<br/>자</td><td style='color:red; border-bottom: solid #FF0000; border-top: solid #FF0000; border-right: solid #FF0000;'  width=45>등 록<br/>번 호</td><td name='td_SaNo2' style='border-bottom: solid #FF0000; border-top: solid #FF0000; border-right: solid #FF0000;'  colspan=6>" + detail.Sano + "</td></tr>";
			var html2_view3 = "<tr><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;'>상 호</td><td name='td_GerName1' style='border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=2>" + detail.R_Snm +"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' width=10 colspan=2>성 명</td><td name='td_userName1' style='border-bottom: solid #FF0000;'>" + detail.R_Boss + "</td><td style='color:red; border-bottom: solid #FF0000; border-right: solid #FF0000;' align=right>(인)</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;''>상 호</td><td name='td_GerName2' style='border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=3>" + detail.Snm + "</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' width=45>성 명</td><td name='td_userName2' style='border-bottom: solid #FF0000;'>" + detail.Boss + "</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' align=right>(인)</td></tr>";
			var html2_view4 = "<tr><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;'>주 소</td><td name='td_Addr1' style='border-bottom: solid #FF0000;'colspan=6>"+detail.R_Addr+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;'>주 소</td><td name='td_Addr2' style='border-bottom: solid #FF0000; border-right: solid #FF0000;' colspan=6>"+detail.Addr+"</td> </tr>";
			var html2_view5 = "<tr><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;'>업 태</td><td name='td_UpType1' style='border-right: solid #FF0000; border-bottom: solid #FF0000;'>"+ detail.R_up +"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' width=45>종 목</td><td name='td_Category1' style='border-bottom: solid #FF0000;' colspan=4>"+detail.R_jong+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;''>업 태</td><td name='td_UpType2' style='border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=2>"+detail.Up+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' width=45>종 목</td><td name='td_Category2'style='border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=3>"+detail.Jong+"</td></tr>";
			var html2_view6 = "<tr><td style='color:red; border-left: solid #FF0000; border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=2>합계금액</td><td name='td_TotAmt' style='border-right: solid #FF0000; border-bottom: solid #FF0000;'>"+commaChange(detail.Hap)+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=2>전잔액</td><td name='td_PreJanAmt' style='border-bottom: solid #FF0000;' colspan=3>"+commaChange(detail.Pre_Jan_Amt)+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;'>담 당</td><td name='td_DamDang' style='border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=2>"+detail.G_GDamdang+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;'>전 화</td><td name='td_Tel' style='border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=3>"+detail.G_GDamdangTel+"</td></tr>";
			var html2_view7 = "<tr><td style='color:red; border-bottom: solid #FF0000; border-left: solid #FF0000; border-right: solid #FF0000;' colspan=2>입 금 액</td><td name='td_Deposit 'style='border-right: solid #FF0000; border-bottom: solid #FF0000;'>"+commaChange(detail.In_Amt)+"</td><td style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=2>현잔액</td><td name='td_NowJanAmt' style='border-bottom: solid #FF0000;' colspan=3>" + commaChange(detail.Cur_Jan_Amt) + "</td><td style='color:red; border-bottom: solid #FF0000; border-left: solid #FF0000; border-right: solid #FF0000;' colspan=2>인 수 자</td><td name='td_Receiver' style='border-bottom: solid #FF0000;'>"+detail.Boss+"</td><td style='color: red; border-bottom: solid #FF0000; border-right: solid #FF0000;' align='right'>(인)</td>	<td name='td_Receiver_Mark' style='color:red; border-right: solid #FF0000; border-bottom: solid #FF0000;' colspan=4>아래의 금액을&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;합니다.</td></tr></table>";


			//두번째 테이블

			var html2_view8 = "<table bordercolor='#FF0000' border=3 width=1080 style='margin-top:10px;' cellspacing=0 cellpadding=0><thead style='color:red; border-bottom: solid #FF0000;'><th width=550 style='border-right:2px solid #FF0000;'' colspan=3>품목 및 규격</th><th style='border-right:2px solid #FF0000;'' width=97>수 량</th><th style='border-right:2px solid #FF0000;'' width=140>단 가</th><th style='border-right:2px solid #FF0000;'' width=140>공 급 가 액</th><th width=140>세 액</th></thead>";
			var html2_view9 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name1)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea1)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price1)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong1)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax1)+"</td></tr>";
			var html2_view10 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name2)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea2)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price2)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong2)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax2)+"</td></tr>";
			var html2_view11 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name3)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea3)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price3)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong3)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax3)+"</td></tr>";
			var html2_view12 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name4)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea4)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price4)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong4)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax4)+"</td></tr>";
			var html2_view13 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name5)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea5)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price5)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong5)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax5)+"</td></tr>";
			var html2_view14 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name6)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea6)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price6)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong6)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax6)+"</td></tr>";
			var html2_view15 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name7)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea7)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price7)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong7)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax7)+"</td></tr>";
			var html2_view16 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name8)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea8)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price8)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong8)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax8)+"</td></tr>";
			var html2_view17 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;'>"+ checklist(detail.G_name9)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist(detail.G_ea9)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_price9)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.G_Gong9)+"</td><td width=140 style='border-bottom: 2px solid #FF0000;' align=right>"+checklist2(detail.tax9)+"</td></tr>";
			var html2_view18 = "<tr><td colspan=3 width=550 style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;'>"+ checklist(detail.G_name10)+"</td><td width=97 style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;' align=right>"+checklist(detail.G_ea10)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;' align=right>"+checklist2(detail.G_price10)+"</td><td width=140 style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;' align=right>"+checklist2(detail.G_Gong10)+"</td><td width=140 style='border-bottom: solid #FF0000;' align=right>"+checklist2(detail.tax10)+"</td></tr>";
			var html2_view19 = "<tr><td rowspan=2 style='width:45px; height:100px; border-right:2px solid #FF0000;'>비 고<br/><br/>사 항</td><td width=450>"+detail.bigo+"</td><td  style='height:25px; border-right: solid #FF0000; border-bottom: solid #FF0000; border-left:2px solid #FF0000;'>합계</td><td style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;' align=right>"+checklist(detail.numhap)+"</td><td style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;' align=right>"+checklist2(detail.pricehap)+"</td><td style='border-right:2px solid #FF0000; border-bottom: solid #FF0000;' align=right>"+checklist2(detail.Hap)+"</td><td style='border-bottom: solid #FF0000;' align=right>"+checklist2(detail.taxhap)+"</td></tr><tr><td colspan=6></td></tr></table><span align='center'>(" + j + "/" + detaillist.length + ")</span><br>"


			var html_end =  "</body></html>" ;

			var html_string = html_start + html_view1 + html_view2 + html_view3 + html_view4 + html_view5 + html_view6 + html_view7 + html_view8 + html_view9  + html_view10 + html_view11 + html_view12 + html_view13 + html_view14 + html_view15 + html_view16 + html_view17 + html_view18 + html_view19;
			var html_string2 = html_string + html2_view1 + html2_view2 + html2_view3 + html2_view4 + html2_view5 + html2_view6 + html2_view7 + html2_view8 + html2_view9 + html2_view10 + html2_view11 + html2_view12 + html2_view13 + html2_view14 + html2_view15 + html2_view16 + html2_view17 + html2_view18 + html2_view19 + html_end;

			var name =  $rootScope.Key_New_No;
			var admincode = detail.Admin_Code; // 저장될 파일명


			if($scope.userType == 'ERPia'){
				var Kind = 'ERPia';
			}else{
				var Kind = 'SCM';
			}
			// 저장될 이미지의 이름
			$scope.test(i,html_string,html_string2,name,admincode, Kind);
		}

		if($scope.userType == 'ERPia'){
			var login_kind = 'erpia';
		}else{
			var login_kind = 'comp';
		}
			var Mutual = detaillist[0].R_Snm;
		    	var url = "http://www.erpia.net/mobile/GereaView_Certify.asp?admin_code=" + detail.Admin_Code + "&user_id=" + $scope.loginData.UserId + "&login_kind=" + login_kind + "&sl_no=" + $rootScope.Key_New_No + '_01';
		    	$scope.shareAnywhere(url, where, Mutual);

}

	$scope.test = function(i,html_string,html_string2, name,admincode,Kind){
			var iframe = document . createElement ( 'iframe' );
			document . body . appendChild ( iframe );
			var iframedoc = iframe . contentDocument || iframe . contentWindow . document ;
		    	iframedoc.body.innerHTML = html_string2 ;
		    	html2canvas ( iframedoc.body ,  {
		       	onrendered :  function ( canvas )  {
			             document . body . appendChild ( canvas );
			             document . body . removeChild ( iframe );
			             /*캔버스 하나더 생성 => 캔버스 사이즈 조절*/
			             var extra_canvas = document.createElement("canvas");
		                    extra_canvas.setAttribute('width',700);
		                    extra_canvas.setAttribute('height',760);
		                    var ctx = extra_canvas.getContext('2d');
		                    ctx.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,700,760);


			             var imgageData = extra_canvas.toDataURL("image/png");
			             var newData = imgageData.replace('data:image/png;base64,',''); //파일
			             document . body . removeChild ( canvas );
			             var nameplus = i + 1;
			       if(nameplus < 10){
			       	var imgname = name + "_0" + nameplus;
			       }else{
			       	var imgname = name + "_" + nameplus ;
			       }

				console.log('check1=>>', imgname);
				console.log('check2=>>', admincode);

				$.ajax({
				  url: "http://image.erpia.net/fn_save_card_data_image.asp?Kind=" + Kind,
				  method: "POST",
				  data: { "imgData" : newData, "imgName" : imgname, "imgfolder" : admincode},//QueryString 방식이면, 이상하게 안됨
				   error : function (data) {
				    alert('죄송합니다. 잠시 후 다시 시도해주세요.');
				    return false;
				   }
				  });
				}

			});
	}
	
	$scope.shareAnywhere = function(url, where,Mutual) {
		// console.log('공유할꺼야 =>', $scope.userData.Com_Name);
		// var comname = $scope.userData.Com_Name.split('<br>');
		// var com_name = comname[0] + comname[1];
	       if(where == 'kakao'){
	       	$cordovaSocialSharing.shareVia("com.kakao.talk","[Erpia 거래명세표] "+'('+Mutual+')'+url);
	       }else if(where == 'sms'){
	        	$cordovaSocialSharing.shareViaSMS("[Erpia 거래명세표] "+'('+Mutual+')'+url);
	       }else{
                   $cordovaSocialSharing.shareViaEmail("[Erpia 거래명세표] "+'('+Mutual+')'+url, "[Erpia 거래명세표] "+'('+Mutual+')');
	       }
	       $scope.toemail ='';
	}

	/*거래명세표 보기 */
	$scope.readTradeDetail = function(dataParam){
		$rootScope.Sl_No = dataParam.substring(0, dataParam.indexOf('^'));
		var detail_title = dataParam.substring(dataParam.indexOf('^') + 1);
		tradeDetailService.readDetail($scope.loginData.Admin_Code, $rootScope.Sl_No)
			.then(function(response){
				console.log('readDetail', response);

				var numhap = 0; // 수량합계
				var num = 1;
				switch( num ){
					case 1:  response.list[0].numhap = response.list[0].G_ea1;
							 response.list[0].taxhap = response.list[0].tax1;
							 response.list[0].pricehap = response.list[0].G_price1;
							 if(response.list[0].G_ea2 == null) break;

					case 2:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea2);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax2);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price2);
							 if(response.list[0].G_ea3 == null) break;

					case 3:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea3);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax3);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price3);
							 if(response.list[0].G_ea4 == null) break;

					case 4:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea4);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax4);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price4);
							 if(response.list[0].G_ea5 == null) break;

					case 5:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea5);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax5);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price5);
							 if(response.list[0].G_ea6 == null) break;

					case 6:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea6);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax6);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price6);
							 if(response.list[0].G_ea7 == null) break;

					case 7:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea7);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax7);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price7);
							 if(response.list[0].G_ea8 == null) break;

					case 8:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea8);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax8);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price8);
							 if(response.list[0].G_ea9 == null) break;

					case 9:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea9);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax9);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price9);
							 if(response.list[0].G_ea10 == null) break;

					case 10:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea10);
							   response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax10);
							   response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price10);
							   break;
					default : console.log('여기올일 없을껄....');
				}
				response.list[0].bigo = ' ';
				$scope.detail_items = response.list;
				$rootScope.trade_Detail_Modal.show();
			})
		if($scope.userType != "ERPia") tradeDetailService.chkRead($scope.loginData.Admin_Code, $rootScope.Sl_No, $scope.loginData.UserId) // 읽었으면!
	}
	 /*거래명세표 사업자 번호 입력 모달 닫기*/
	$scope.close_sano = function(){
		$scope.check_sano_Modal.hide();
	}
	/*거래명세표 닫기*/
	$scope.close = function(){
		$scope.reload_tradelist();
		$scope.trade_Detail_Modal.hide();
	}
	// $scope.backToList = function(){
	// 	$ionicSlideBoxDelegate.previous();
	// }
	/*프린트 (거래명세표 화면에서 프린트 버튼의 주석을 해제해야 기능을 사용할 수 있음.. 블루투스 연결까지는 확인했으나 프린트 잉크가 없어서 테스트 못함.)*/
	$scope.print = function(){
		cordova.plugins.printer.isAvailable(
		    function (isAvailable) {
		    	// URI for the index.html
				//var page = 'www.erpia.net/mobile/trade_Detail.asp';
				var page = document.getElementById('divTradeDetail_Print_Area');
				cordova.plugins.printer.print(page, 'Document.html', function () {
				    alert('printing finished or canceled')
				});
		    }
		);
	}// 각각의 타입별로 안내메세지를 다르게 표시.

	$scope.check_Sano = function(){
		if($rootScope.userType == "SCM" || $rootScope.userType == "Normal" ){
			console.log('sano', $scope.userData.G_Sano.substring($scope.userData.G_Sano.lastIndexOf('-') + 1));
			if($scope.userData.G_Sano.substring($scope.userData.G_Sano.lastIndexOf('-') + 1) == $scope.userData.Sano){
				$scope.check_sano_Modal.hide();
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$scope.userData.Sano = '';
				$state.go('app.tradeList');
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('사업자 번호와 일치하지 않습니다.', 'long', 'center');
				else alert('사업자 번호와 일치하지 않습니다.');
			}
		}else if($rootScope.userType == "ERPia"){
			if($scope.loginData.Pwd == $scope.userData.Sano){
				$scope.check_sano_Modal.hide();
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.tradeList');
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('비밀번호가 일치하지 않습니다.', 'long', 'center');
				else alert('비밀번호가 일치하지 않습니다.');
			}
		}
	}
})
/*지우면 안되는 컨트롤러입니다.*/
.controller('configCtrl', function($scope, $rootScope) {

})

// 아래부터 설정 화면에 있는 컨트롤러들..
// 프로그램정보 컨트롤러
.controller('configCtrl_Info', function($scope, $rootScope, $ionicPlatform, $timeout, VersionCKService, $ionicScrollDelegate) {
	// 기본정보를 디폴트 값으로 넣었다.
	$scope.ckversion={};
   	$scope.thisversioncurrent='Y';
   	$scope.thisversion='';
   	$scope.currentversion='';
	VersionCKService.currentVersion()
	.then(function(data){
		$timeout(function(){
			if(data != '<!--Parameter Check-->'){
				$rootScope.ckversion = data;
				console.log("currentVersionService", $rootScope.ckversion);
			if(ionic.Platform.isAndroid()==true){
					console.log('android');
					var version = $scope.version.Android_version.split('.');
					version = version[0]+'.'+version[1]+version[2];
				     	version = parseFloat(version);
				     	console.log("version", version);
					var ckversion = $rootScope.ckversion.Android_version.split('.');
					ckversion = ckversion[0]+'.'+ckversion[1]+ckversion[2];
					ckversion = parseFloat(ckversion);
					console.log("ckversion", ckversion);
					$scope.thisversion=$rootScope.version.Android_version;
					$scope.currentversion=$rootScope.ckversion.Android_version;
				if (version<ckversion) $scope.thisversioncurrent='N';
				else $scope.thisversioncurrent='Y';
			}else{
				console.log('ios');
				var version = $scope.version.IOS_version.split('.');
				version = version[0]+'.'+version[1]+version[2];
			     	version = parseFloat(version);
			     	console.log("version", version);
				var ckversion = $rootScope.ckversion.IOS_version.split('.');
				ckversion = ckversion[0]+'.'+ckversion[1]+ckversion[2];
				ckversion = parseFloat(ckversion);
				console.log("ckversion", ckversion);
				$scope.thisversion=$rootScope.version.IOS_version;
				$scope.currentversion=$rootScope.ckversion.IOS_version;
				if (version<ckversion) $scope.thisversioncurrent='N';
				else $scope.thisversioncurrent='Y';
			}
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회실패. 데이터접속을 확인해주세요.', 'short', 'center');
			else alert('조회실패. 데이터접속을 확인해주세요.');
		}
	      		}, 1000);
			console.log("지금버전은?: ",$scope.thisversioncurrent, "최신버전: ",$scope.currentversion, "지금버전: ",$scope.thisversion);
	});
	console.log("지금버전은?: ",$scope.thisversioncurrent, "최신버전: ",$scope.currentversion, "지금버전: ",$scope.thisversion);
		$scope.updatebtn=function(){
			if(ionic.Platform.isAndroid()==true) window.open('https://play.google.com/apps/testing/com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
			else location.href=window.open('https://play.google.com/apps/testing/com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
		}

	/* 최상단으로 */
	$scope.scrollTop = function() {
    	$ionicScrollDelegate.scrollTop();
    };

})// 공지사항 컨트롤러
.controller('configCtrl_Notice', function($scope, $ionicPopup, $ionicHistory, NoticeService, $timeout, $cordovaToast, $ionicScrollDelegate, $ionicLoading) {
	$scope.items=[];
	$scope.myGoBack = function() {
		$ionicHistory.goBack();
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
	};
	$scope.toggle = false;
	NoticeService.getList($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_notice',1)
	.then(function(data){
			$scope.maxover=0;
			$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
				$timeout(function(){
					if(data != '<!--Parameter Check-->'){
				    		$scope.maxover=0;
						$scope.items = data.list;
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
						else alert('조회된 데이터가 없습니다.');
						$scope.moreloading=0;
						$scope.maxover = 1;
					}
	       			$scope.moreloading=0;
	         			$ionicLoading.hide();
	      		}, 1000);
	});
	    // $scope.toggle = false;
	// $scope.moreloading=0;
 //    	$scope.pageCnt=1;
 //    	$scope.maxover=0;

	// NoticeService.getList($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_notice',1)
	// .then(function(data){
	// 		$scope.maxover=0;
	// 		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
	// 			$timeout(function(){
	// 				if(data != '<!--Parameter Check-->'){
	// 			    		$scope.maxover=0;
	// 					$scope.items = data.list;
	// 				}else{
	// 					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
	// 					else alert('조회된 데이터가 없습니다.');
	// 					$scope.moreloading=0;
	// 					$scope.maxover = 1;
	// 				}
	//        			$scope.moreloading=0;
	//          			$ionicLoading.hide();
	//       		}, 1000);
	// });
	//     /* 더보기 버튼 클릭시 */
	// $scope.boards_more = function() {
	//   		if($scope.items.length>0){
	//   		console.log($scope.items.length);

	//   		if($scope.maxover==0){
	// 	        	$scope.pageCnt+=1;

	// 	      	$scope.moreloading=1;


	// 	      	BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_notice',$scope.pageCnt).then(function(data){
	//       	 		$scope.maxCnt=0;
	// 			$timeout(function(){
	// 				if(data != '<!--Parameter Check-->'){
	// 			    		$scope.maxover=0;
	// 					for(var i=0; i<data.list.length; i++){
	// 						$scope.items.push(data.list[i]);
	// 					}
	// 				}else{
	// 					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
	// 					else alert('조회된 데이터가 없습니다.');
	// 					$scope.moreloading=0;
	// 					$scope.maxover = 1;
	// 				}
	//        			$scope.moreloading=0;
	// 	         		$ionicLoading.hide();
	// 	      		}, 1000);
	// 	      		});
	// 		}
	//       }
	//     };
	    /* 최상단으로 */
	$scope.scrollTop = function() {
    		$ionicScrollDelegate.scrollTop();
    	};
	// $scope.sendSMS = function (message) {
	// 	  KakaoLinkPlugin.call("kakaotalk share...");
	// }

	// $scope.sendEmail = function (message, subject) {
	// 	message="테스트입니당.";
	// 	subject="[이알피아모바일]세금계산서"
	// 	fromemail="khs239@erpia.net"
	//     $cordovaSocialSharing.shareViaEmail(message, subject, null, fromemail, null);
	// }
})
// 통계리포트 설정 컨트롤러
.controller('configCtrl_statistics', function($scope, $rootScope, statisticService, publicFunction){
	statisticService.all('myPage_Config_Stat', 'select_Statistic', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId)
		.then(function(data){
			$scope.items = data;
		})
	// 아이템을 옮길때마다 내용을 서버에 저장시켜둔다.
	$scope.moveItem = function(item, fromIndex, toIndex) {
		fromIdx = $scope.items[fromIndex].Idx;
		fromTitle = $scope.items[fromIndex].title;
		fromVisible = $scope.items[fromIndex].visible;

		toIdx = $scope.items[toIndex].Idx;
		toTitle = $scope.items[toIndex].title;
		toVisible = $scope.items[toIndex].visible;

		$scope.items[fromIndex].Idx = toIdx;
		$scope.items[fromIndex].title = toTitle;
		$scope.items[fromIndex].visible = toVisible;

		$scope.items[toIndex].Idx = fromIdx;
		$scope.items[toIndex].title = fromTitle;
		$scope.items[toIndex].visible = fromVisible;

		var rsltList = '';
		for(var i = 0; i < $scope.items.length; i++){
			rsltList += $scope.items[i].cntOrder + '^';
			rsltList += $scope.items[i].Idx + '^';
			rsltList += $scope.items[i].visible + '^|';
		}
		console.log('rsltList', rsltList);
		statisticService.save('myPage_Config_Stat', 'save_Statistic', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList);
	};
	// 지우려고 만들었는데 2차 업데이트로 넘김.
	$scope.onItemDelete = function(item) {
		$scope.items.splice($scope.items.indexOf(item), 1);
	};
}) //알림설정 컨트롤러
.controller('configCtrl_alarm', function($scope, $rootScope, $location, alarmService){
	window.plugins.PushbotsPlugin.initialize("56fb66a04a9efa4f9a8b4569",{"android":{"sender_id":"832821752106"}});
	$scope.settingsList = [];
	var cntList = 6;
	$scope.fnAlarm = function(isCheckAll){
		// 푸쉬알림 체크시 전체 체크 되도록.
		if(isCheckAll == 'checkAll'){
			var arrAlarm = new Array();
			arrAlarm.push({idx:1,name:'공지사항',checked:true});
			arrAlarm.push({idx:2,name:'업데이트현황',checked:true});
			arrAlarm.push({idx:3,name:'지식 나눔방',checked:true});
			arrAlarm.push({idx:4,name:'업체문의 Q&A(답변)',checked:true});
			arrAlarm.push({idx:5,name:'거래명세서 도착',checked:true});
			arrAlarm.push({idx:6,name:'기타 이벤트',checked:true});
			$scope.settingsList = arrAlarm;
		}else{
			// 서버에 저장된 설정 값을 불러와서 알맞게 체크해줌.
			alarmService.select('select_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId)
			.then(function(data){
				// cntList = data.list.length;
				for(var i=0; i<cntList; i++){
					switch(data.list[i].idx){
						case 1: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '공지사항';
							break;
						case 2: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '업데이트 현황';
							break;
						case 3: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '지식 나눔방';
							break;
						case 4: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '업체문의 Q&A(답변)';
							break;
						case 5: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '거래명세서 도착';
							break;
						case 6: data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '기타 이벤트';
							break;
					}
				}
				if(data.list[0].alarm == 'F'){
					$scope.selectedAll = false;
					$scope.settingsList = [];
				}
				else{
					$scope.selectedAll = true;
					$scope.settingsList = data.list;
				}
			});
		}
	}
	// 실제로 알람 설정 내용을 서버에 저장하는 서비스
	$scope.check_alarm = function(check){
		// var deviceplatform = 0;
			// if (ionic.Platform.isIOS()){
			// 	deviceplatform = 0;
			// }else{
			//  	deviceplatform = 1;
			// }
		if(check) {
			rsltList = '0^T^|1^T^|2^T^|3^T^|4^T^|5^T^|6^T^|';
			var results = rsltList.match(/\^T\^/g);
			alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList);
			$scope.fnAlarm('checkAll');
			window.plugins.PushbotsPlugin.untag("no");
			window.plugins.PushbotsPlugin.tag("all");
		}else{
			$scope.settingsList = [];
			rsltList = '0^F^|1^F^|2^F^|3^F^|4^F^|5^F^|6^F^|';
			var results = rsltList.match(/\^F\^/g);
			alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList);
			window.plugins.PushbotsPlugin.untag("all");
			window.plugins.PushbotsPlugin.tag("no");
		}
		angular.forEach($scope.settingsList, function(item){
			item.checked = check;
		})
	}
	// 알람 내용이 변경될때마다 그 내용을 서버에 저장
	// $scope.check_change = function(item){
	// 	console.log(item);
	// 	// if(item.checked==true){
	// 	// 	var tagnum = item.idx.toString();
	// 	// 	Pushbots.tag(tagnum);
	// 	// 	console.log("Pushbots.tag",tagnum);
	// 	// }else{
	// 	// 	var tagnum = item.idx.toString();
	// 	// 	Pushbots.untag(tagnum);
	// 	// 	console.log("Pushbots.untag",tagnum);
	// 	// }
	// 	var rsltList = '';
	// 	console.log('settingsList', $scope.settingsList[0]);
	// 	for(var i=0; i<cntList; i++){
	// 		rsltList += $scope.settingsList[i].idx + '^';
	// 		rsltList += ($scope.settingsList[i].checked == true)?'T^|':'F^|';

	// 	}
	// 	alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, '0^U|' + rsltList)
	// }
	$scope.fnAlarm('loadAlarm');
})//로그인 설정 컨트롤러
.controller('configCtrl_login', function($scope, $rootScope, uuidService, $localstorage){
	$scope.loginData=$rootScope.loginData;
	if($rootScope.loginData.autologin_YN == 'Y'){
		$rootScope.autoLogin = true;
		// $localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
	}else{
		$rootScope.autoLogin = false;
		// $localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
	}

	$scope.autoLogin_YN = function(check){
		if(check==true){
			uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'Y')
			$rootScope.autoLogin = true;
			$rootScope.loginData.autologin_YN = 'Y';
			$localstorage.set("autoLoginYN", "Y");
		}else{
			uuidService.saveUUID($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, escape($scope.loginData.Pwd), 'N')
			$rootScope.autoLogin = false;
			$rootScope.loginData.autologin_YN = 'N';
			$localstorage.set("autoLoginYN", "N");
		}
	}
})
// 설정 화면 컨트롤러 끝 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCM 메인 화면 컨트롤러
.controller('ScmUser_HomeCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $sce, scmInfoService, AmChart_Service){
	$scope.ScmBaseData = function() {
		if($rootScope.loginState == "S") {
			// 날짜
			var d= new Date();
			var month = d.getMonth() + 1;
			var day = d.getDate();
			var nowTime = (d.getHours() < 10 ? '0':'') + d.getHours() + ":"
				nowTime += (d.getMinutes() < 10 ? '0':'') + d.getMinutes() + ":";
				nowTime += (d.getSeconds() < 10 ? '0':'') + d.getSeconds();
			//일주일전
			var w = new Date(Date.parse(d) -7 * 1000 * 60 * 60 * 24)
			var wMonth = w.getMonth() + 1;
			var wDay = w.getDate();

			var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
			var aWeekAgo = w.getFullYear() + '-' + (wMonth<10 ? '0':'') + wMonth + '-' + (wDay<10 ? '0' : '') + wDay;

			$scope.nowTime = '최근 조회 시간 :' + nowday + ' ' + nowTime;
			// 발주정보 조회
			scmInfoService.scmInfo('ScmMain', 'Balju', $scope.loginData.Admin_Code, $scope.G_Code, aWeekAgo, nowday)
			.then(function(scmInfo){
				var B_TOT = 0;
				for(var i=0; i<scmInfo.data.list.length; i++){
					switch(scmInfo.data.list[i].CntStts){
						case '0':
							$scope.B_NewBalju = scmInfo.data.list[i].Cnt + '';
							B_TOT += scmInfo.data.list[i].Cnt;
							break;
						case '1': $scope.B_BalJuConfirm = scmInfo.data.list[i].Cnt + '';
							B_TOT += scmInfo.data.list[i].Cnt;
							break;
						case 'b': $scope.B_ChulgoConfirm = scmInfo.data.list[i].Cnt + '';
							B_TOT += scmInfo.data.list[i].Cnt;
							break;
						case '2': $scope.B_MeaipComplete = scmInfo.data.list[i].Cnt + '';
							B_TOT += scmInfo.data.list[i].Cnt;
							break;
					}
				}
				$scope.B_TOT = B_TOT + '';

			});// 직배송 정보 조회
			scmInfoService.scmInfo('ScmMain', 'Direct', $scope.loginData.Admin_Code, $scope.G_Code, aWeekAgo, nowday)
			.then(function(scmInfo){
				var J_TOT = 0;
				for(var i=0; i<scmInfo.data.list.length; i++){
					switch(scmInfo.data.list[i].CntStts){
						case '0': $scope.J_NewBalju = scmInfo.data.list[i].Cnt + '';
							J_TOT += scmInfo.data.list[i].Cnt;
							break;
						case '1': $scope.J_BalJuConfirm = scmInfo.data.list[i].Cnt + '';
							J_TOT += scmInfo.data.list[i].Cnt;
							break;
						case 'b': $scope.J_ChulgoConfirm = scmInfo.data.list[i].Cnt + '';
							J_TOT += scmInfo.data.list[i].Cnt;
							break;
						case '2': $scope.J_MeaipComplete = scmInfo.data.list[i].Cnt + '';
							J_TOT += scmInfo.data.list[i].Cnt;
							break;
					}
				}
				$scope.J_TOT = J_TOT + '';
			}); //CRM 메뉴 조회
			scmInfoService.scmInfo('CrmMenu', '', $scope.loginData.Admin_Code, $scope.G_Code, aWeekAgo, nowday)
			.then(function(scmInfo){
				var C_TOT = 0;
				for(var i=0; i<scmInfo.data.list.length; i++){
					switch(scmInfo.data.list[i].CntStts){
						case '1': $scope.C_CancelCnt = scmInfo.data.list[i].Cnt + '';
							C_TOT += scmInfo.data.list[i].Cnt;
							break;
						case '2': $scope.C_ReturnCnt = scmInfo.data.list[i].Cnt + '';
							C_TOT += scmInfo.data.list[i].Cnt;
							break;
						case '3': $scope.C_ExchangeCnt = scmInfo.data.list[i].Cnt + '';
							C_TOT += scmInfo.data.list[i].Cnt;
							break;
					}
				}
				$scope.C_TOT = C_TOT + '';
			});
		}
	}
	$scope.ScmBaseData();
	//scm 차트
	$scope.load_scm_chart = function(){
	    AmChart_Service.scm_Chart('scm', 'scm', $scope.loginData.Admin_Code, 3, $scope.userData.G_Code)
	    .then(function(response){
	    	var chartData = response;
	    	console.log('chartData', chartData);
	    	var chart = AmCharts.makeChart("chart5", {
			   theme: "dark",
				type: "serial",
				dataProvider: chartData,
				startDuration: 1,
				prefixesOfBigNumbers: [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				valueAxes: [
					{
						id: "ValueAxis-1",
						title: "금액",
						titleRotation: 0,
						usePrefixes: true
					},
					{
						id: "ValueAxis-2",
						title: "수량",
						titleRotation: 0,
						position: "right"
					}
				],
				graphs: [{
//					balloonText: "수량: <b>[[value]]</b>",
					balloonText: "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					fillAlphas: 0.9,
					lineAlpha: 0.2,
					title: "수량",
					type: "column",
					valueAxis: "ValueAxis-2",
					valueField: "su"
				}, {
//					"balloonText": "금액: <b>[[value]]</b>",
					balloonText: "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					fillAlphas: 0.9,
					lineAlpha: 0.2,
					title: "금액",
					type: "column",
					clustered:false,
					columnWidth:0.5,
					valueAxis: "ValueAxis-1",
					valueField: "value"
				}],
				plotAreaFillAlphas: 0.1,
				categoryField: "name",
				categoryAxis: {
					gridPosition: "start",
					autoRotateAngle : 0,
					autoRotateCount: 1,
				},
				export: {
					enabled: true
				 },
                legend: {
                    align: "center",
                    markerType: "circle",
					balloonText : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});
	    })
	}
	$scope.load_scm_chart();
}) // 메인화면 컨트롤러
.controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http){
	console.log("MainCtrl");

	$scope.ERPiaCS_Link = function() {
        $state.go('app.erpia_cs');
        // $location.href = '#/app/erpia_main';
    }

    $scope.ERPiaCafe_Link = function() {
        window.open('http://cafe.naver.com/erpia10');
    }

    $scope.ERPiaBlog_Link = function() {
        window.open('http://blog.naver.com/zzata');
    }
})

.controller('CsCtrl', function($rootScope, $scope, $ionicModal, $ionicPopup, $timeout, $stateParams, $location, $http, csInfoService, TestService, $ionicHistory, ERPiaAPI, $cordovaToast){
	console.log("CsCtrl");
	$scope.csData = {
		interestTopic1 : 'no',
		interestTopic2 : 'no',
		interestTopic3 : 'no',
		sectors: 'no',
		inflowRoute: 'no'
	};
	$scope.cscustomagree = false;

	var csResigtData = [];

	$ionicModal.fromTemplateUrl('erpia_cs/csagreement.html', {
	    	scope: $scope
	    }).then(function(modal) {
	    	$scope.csagreeModal = modal;
	    });

    $scope.csagree=function(){
    	if($scope.cscustomagree == false) $scope.cscustomagree =true;
    	else $scope.cscustomagree = false;
    	console.log($scope.cscustomagree);
    }
    $scope.csagreemodalopen=function(){
    	$scope.csagreeModal.show();
     }
    $scope.csagreemodalclose=function(){
     	$scope.csagreeModal.hide();
     }
    $scope.dialNumber = function(number) {
        window.open('tel:' + number, '_system');
    }

    $scope.sectorslist = [
	    { id: 1, value: "제조업" },
	    { id: 2, value: "유통업" },
	    { id: 3, value: "프랜차이즈" },
	    { id: 4, value: "서비스" },
	    { id: 5, value: "비영리" },
	    { id: 6, value: "건설업" },
	    { id: 7, value: "기타" }
  	];

  	$scope.interestTopiclist = [
	    { id: 1, value: "재고관리" },
	    { id: 2, value: "물류관리" },
	    { id: 3, value: "온라인관리" },
	    { id: 4, value: "매장관리" },
	    { id: 5, value: "회계&장부관리" },
	    { id: 6, value: "판매관리" },
	    { id: 7, value: "해외판매" },
	    { id: 8, value: "정산관리" },
	    { id: 9, value: "미수관리" },
	    { id: 10, value: "발주관리" },
	    { id: 11, value: "그룹사관리" }
  	];

  	$scope.inflowRoutelist = [
	    { id: 1, value: "검색엔진" },
	    { id: 2, value: "인터넷광고" },
	    { id: 3, value: "블로그&카페" },
	    { id: 4, value: "지인소개" },
	    { id: 5, value: "신문&잡지광고" },
	    { id: 6, value: "신문기사" },
	    { id: 7, value: "기타" }
  	];

  	$scope.csRegist = function() {
  		var errMsg = "";
  		if($scope.csData.interestTopic1 != 'no' && $scope.csData.interestTopic2 == 'no' && $scope.cscustomagree != false){
  			$scope.csData.interestTopic2 = '';
  		}
  		if($scope.csData.interestTopic1 != 'no' && $scope.csData.interestTopic3 == 'no' && $scope.cscustomagree != false){
  			$scope.csData.interestTopic3 = '.';
  		}
  		csResigtData[0] = $scope.csData.comName;
	  	csResigtData[1] = $scope.csData.writer;
	  	csResigtData[2] = $scope.csData.subject;
	  	csResigtData[3] = $scope.csData.tel;
	  	csResigtData[4] = $scope.csData.sectors;
	  	csResigtData[5] = $scope.csData.interestTopic1;
	  	csResigtData[6] = $scope.csData.interestTopic2;
	  	csResigtData[7] = $scope.csData.interestTopic3;
	  	csResigtData[8] = $scope.csData.inflowRoute;
	  	csResigtData[9] = $scope.csData.contents;

	  	if(!$scope.csData.comName != ''){
	  		errMsg += "회사명";
	  	}
	  	if(!$scope.csData.subject != ''){
	  		errMsg += "/제목";
	  	}
	  	if(!$scope.csData.tel != ''){
	  		errMsg += "/연락처";
	  	}
	  	if($scope.csData.sectors == 'no'){
	  		errMsg += "/업종"
	  	}
	  	if(csResigtData[5] == 'no'){
	  		errMsg += "/관심항목";
	  	}
	  	if($scope.csData.inflowRoute == 'no'){
	  		errMsg += "/유입경로";
	  	}
	  	if(!$scope.csData.contents != ''){
	  		errMsg += "/문의사항";
	  	}
	  	if(errMsg != ""){
	  		console.log(errMsg + "쓰셈");
	  		if(errMsg.substring(0, 1) == "/"){
	  			errMsg = errMsg.replace("/", "");
	  		}
	  		$ionicPopup.alert({
			        title: '<b>경고</b>',
			        subTitle: '',
			        template: errMsg + ' 은(는)<br> 필수 입력 항목입니다.'
	    		})
	  	}else if($scope.cscustomagree == false){
	  		$ionicPopup.alert({
			        title: '<b>경고</b>',
			        subTitle: '',
			        template: '개인정보이용 및 활용동의(필수)를 해주시기 바랍니다.'
	    		})
	  	}else if($scope.csData.interestTopic1 == $scope.csData.interestTopic2 || $scope.csData.interestTopic1 == $scope.csData.interestTopic3 || $scope.csData.interestTopic2 == $scope.csData.interestTopic3){
	  		$ionicPopup.alert({
			        title: '<b>경고</b>',
			        subTitle: '',
			        template: '관심항목을 다르게 선택해주세요.'
	    		})
	  	}else{
			csInfoService.csInfo($scope.loginData.Admin_Code, $scope.loginData.UserId, 'Mobile_CS_Save', $rootScope.loginState, escape(csResigtData[0]),
								 escape(csResigtData[1]), escape(csResigtData[2]), escape(csResigtData[3]), escape(csResigtData[4]), escape(csResigtData[5]),
								 escape(csResigtData[6]), escape(csResigtData[7]), escape(csResigtData[8]), escape(csResigtData[9]))
		    .then(function(csInfo){
		    	if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록이 성공하였습니다.', 'long', 'center');
			else alert('등록이 성공하였습니다.');
			$rootScope.goto_with_clearHistory('#/app/main');
		    },function(){
		    	if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록이 실패하였습니다.', 'long', 'center');
			else alert('등록이 성공하였습니다.');
			});
		};
	};

	$scope.interestTopicRemove = function() {
		$scope.interestTopic1 = "";
		$scope.interestTopic2 = "";
		$scope.interestTopic3 = "";
		// $scope.interestTopicRemoveYN = "N";
		updated = 0;
	}
})

.controller('BoardSelectCtrl', function($rootScope, $scope, $state){
	console.log("BoardSelectCtrl");

	$scope.BoardSelect1 = function() {
		$rootScope.boardIndex = 0;
		$state.go("app.erpia_board-Main");
		console.log("app.erpia_board-Main", $rootScope.boardIndex);
	};
	$scope.BoardSelect2 = function() {
		$rootScope.boardIndex = 1;
		$state.go("app.erpia_board-Main");
		console.log("app.erpia_board-Main", $rootScope.boardIndex);
	};
	$scope.BoardSelect3 = function() {
		$rootScope.boardIndex = 2;
		$state.go("app.erpia_board-Main");
		console.log("app.erpia_board-Main", $rootScope.boardIndex);
	};
	$scope.BoardSelect4 = function() {
		$rootScope.boardIndex = 3;
		$state.go("app.erpia_board-Main");
		console.log("app.erpia_board-Main", $rootScope.boardIndex);
	};

})

.controller('BoardMainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $sce, $cordovaToast, ERPiaAPI, BoardService, $ionicScrollDelegate, $ionicLoading, $ionicHistory, $ionicSlideBoxDelegate, $ionicSideMenuDelegate){
	console.log("BoardMainCtrl");
	$scope.moreloading=0;
    	$scope.pageCnt=1;
    	$scope.maxover=0;
	$rootScope.useBoardCtrl = "Y";
	var idx = $rootScope.boardIndex;
	console.log("idx", $rootScope.boardIndex);

	$scope.onTouch = function(){
		$ionicSlideBoxDelegate.enableSlide(false);
		$ionicSideMenuDelegate.canDragContent(false);
	 };

	$scope.onRelease = function(){
		$ionicSlideBoxDelegate.enableSlide(true);
		$ionicSideMenuDelegate.canDragContent(false);
	};

	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
		$ionicSideMenuDelegate.canDragContent(false);
	 };

	$scope.previousSlide = function() {
		$ionicSlideBoxDelegate.previous();
		$ionicSideMenuDelegate.canDragContent(false);
	};

	$scope.backbtn = function(){
		$ionicHistory.goBack();
		$ionicSideMenuDelegate.canDragContent(true);
	}


	$scope.tabs2 = [{
		"text" : "공지사항"
	}, {
		"text" : "업데이트 현황"
	}, {
		"text" : "지식 나눔방"
	}, {
		"text" : "업체문의 Q&A"
	}];

	$scope.searchck={
		mode: 'Subject',
		SearchValue: '',
		mode1 : '',
		SearchValue1: ''
	};

	$scope.qnareqdata={
		subject: '',
		content: '',
		pwd: ''
	};

	 /*qna글쓰기모달*/
	$ionicModal.fromTemplateUrl('erpia_board/qnawriteModal.html', {
    		scope: $scope
	}).then(function(modal) {
	    	$scope.qnawriteModal = modal;
	});
	$scope.qnawrite_openModal = function() {
		$scope.qnareqdata.subject='';
		$scope.qnareqdata.content='';
		$scope.qnareqdata.pwd='';
	          $scope.qnawriteModal.show();
	};
	$scope.qnawrite_closeModal = function() {
	          $scope.qnawriteModal.hide();
	          $scope.defaultSearch();
	};

	$scope.qnawriteSubmit=function(){
		if($scope.qnareqdata.subject == '') alert('제목을 입력하세요.');
		else if($scope.qnareqdata.content == '') alert('내용을 입력하세요.');
		else if($scope.qnareqdata.pwd == '') alert('비밀번호를 입력하세요.');
		else{
			//Admin_Code, UserId, Subject, Content, pwd
		BoardService.QnAinsert($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.qnareqdata.subject, $scope.qnareqdata.content, $scope.qnareqdata.pwd).then(function(data){
			if(data.list[0].rslt == 'Y'){
				alert('게시글 등록 완료!');
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('게시글 등록에 성공하였습니다.', 'short', 'center');
				else alert('게시글 등록 완료');
				$scope.qnawrite_closeModal();
			}else{
				alert('등록에 성공하지 못하였습니다');
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록실패. 다시시도해주세요.', 'short', 'center');
				else alert('등록실패');
			}
		});
		}

	};


	$scope.defaultSearch=function(){
	$scope.pageCnt=1;
	switch($rootScope.boardIndex){
			case 0: 	$scope.searchck.SearchValue='';
				$scope.searchck.SearchValue1='';
				$scope.searchck.mode='Subject';
				$scope.searchck.mode1='';
				$scope.maxover=0;
				$scope.BoardUrl1 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_notice',1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->'){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				       			$ionicLoading.hide();
				      		}, 1000);

				}); break;
			case 1: 	$scope.searchck.SearchValue='';
				$scope.searchck.SearchValue1='';
				$scope.searchck.mode='Subject';
				$scope.searchck.mode1='';
				$scope.maxover=0;
				$scope.BoardUrl2 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_erpup',1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->'){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				       			$ionicLoading.hide();
				      		}, 1000);
				}); break;
			case 2: 	$scope.searchck.SearchValue='';
				$scope.searchck.SearchValue1='';
				$scope.searchck.mode='Subject';
				$scope.searchck.mode1='';
				$scope.maxover=0;
				$scope.BoardUrl3 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_FAQ',1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->'){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
							$ionicLoading.hide();
				       			$scope.moreloading=0;
				      		}, 1000);
				}); break;
			case 3: 	$scope.searchck.SearchValue='';
				$scope.searchck.SearchValue1='';
				$scope.searchck.mode='Subject';
				$scope.searchck.mode1='';
				$scope.maxover=0;
				$scope.BoardUrl4 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_Request',1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->'){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				       			$ionicLoading.hide();
				      		}, 1000);
				}); break;

		}

	console.log(">>>>페이지cnt", $scope.searchck.SearchValue)
	};


	$scope.bbsSearch = function(){
		$scope.pageCnt=1;
		$scope.searchck.SearchValue1=$scope.searchck.SearchValue;
		$scope.searchck.mode1 = $scope.searchck.mode;
		if($scope.searchck.SearchValue1 == ''){
			$scope.defaultSearch();
		}else{
		switch($rootScope.boardIndex){
			case 0 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
				$scope.BoardUrl1 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Notice', $scope.searchck.mode1, $scope.searchck.SearchValue1, 1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				         			$ionicLoading.hide();
				      		}, 1000);
				}); break;
			case 1 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
				$scope.BoardUrl2 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Erpup', $scope.searchck.mode1, $scope.searchck.SearchValue1, 1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				         			$ionicLoading.hide();
				      		}, 1000);
				}); break;
			case 2 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
				$scope.BoardUrl3 = BoardService.Board_sear($scope.loginData.Admin_Code, 'FAQ', $scope.searchck.mode1, $scope.searchck.SearchValue1, 1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				         			$ionicLoading.hide();
				      		}, 1000);
				}); break;
			case 3 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
				$scope.BoardUrl4 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Request', $scope.searchck.mode1, $scope.searchck.SearchValue1, 1)
				.then(function(data){
						$scope.maxover=0;
						$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
							    		$scope.maxover=0;
									$scope.items = data.list;
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;
				         			$ionicLoading.hide();
				      		}, 1000);
				}); break;
			}
		}
	}

	$scope.defaultSearch();


	$scope.searchClick=function(){
		BoardService.Board_sear($scope.loginData.Admin_Code, $rootScope.boardIndex, 1).then(function(data){$scope.items = data.list;});
	};
	/* 최상단으로 */
	$scope.scrollTop = function() {
    		$ionicScrollDelegate.scrollTop();
    	};

	$scope.onSlideMove = function(data) {
		switch(data.index){
			case 0: 	$rootScope.boardIndex = data.index;
				$scope.items=[];
				$scope.defaultSearch();
				break;
			case 1: $rootScope.boardIndex = data.index;
				$scope.items=[];
				$scope.defaultSearch();
				break;
			case 2: $rootScope.boardIndex = data.index;
				$scope.items=[];
				$scope.defaultSearch();
				break;
			case 3: $rootScope.boardIndex = data.index;
				$scope.items=[];
				$scope.defaultSearch();
				break;
		}
		$rootScope.useBoardCtrl = "N";
	};
    /* 더보기 버튼 클릭시 */
	$scope.boards_more = function() {
	  		if($scope.items.length>0){
	  		console.log($scope.items.length);
	  		console.log($rootScope.boardIndex);

	  		if($scope.maxover==0){
		        	$scope.pageCnt+=1;

		      	$scope.moreloading=1;
		      		if($scope.searchck.SearchValue1 == '' || $scope.searchck.SearchValue1 == undefined){
			      	switch($rootScope.boardIndex){
				      	case 0: $scope.BoardUrl1 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_notice',$scope.pageCnt).then(function(data){
				      		$scope.maxCnt=0;
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
							    		$scope.maxover=0;
							    		console.log('data.list', data.list)
									for(var i=0; i<data.list.length; i++){
										$scope.items.push(data.list[i]);
									}
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;

				      		}, 1000);
				      		}); break;
					case 1: $scope.BoardUrl2 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_erpup',$scope.pageCnt).then(function(data){
						$scope.maxCnt=0;
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
									for(var i=0; i<data.list.length; i++){
										$scope.maxover=0;
										$scope.items.push(data.list[i]);
									}
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;

				      		}, 1000);
				      		}); break;
					case 2: $scope.BoardUrl3 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_FAQ',$scope.pageCnt).then(function(data){
						$scope.maxCnt=0;
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
									for(var i=0; i<data.list.length; i++){
										$scope.maxover=0;
										$scope.items.push(data.list[i]);
									}
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;

				      		}, 1000);
				      		}); break;
					case 3: $scope.BoardUrl4 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_Request',$scope.pageCnt).then(function(data){
						$scope.maxCnt=0;
							$timeout(function(){
								if(data != '<!--Parameter Check-->' && data.list.length>0){
									for(var i=0; i<data.list.length; i++){
										$scope.maxover=0;
										$scope.items.push(data.list[i]);
									}
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.moreloading=0;
									$scope.maxover = 1;
								}
				       			$scope.moreloading=0;

				      		}, 1000);
				      		}); break;
						}
					}else{
					switch($rootScope.boardIndex){
						case 0 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
							$scope.BoardUrl1 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Notice', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
							.then(function(data){	$scope.maxCnt=0;
										$timeout(function(){
											if(data != '<!--Parameter Check-->' && data.list.length>0){
												for(var i=0; i<data.list.length; i++){
													$scope.maxover=0;
													$scope.items.push(data.list[i]);
												}
											}else{
												if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
												else alert('조회된 데이터가 없습니다.');
												$scope.moreloading=0;
												$scope.maxover = 1;
											}
							       			$scope.moreloading=0;

							      		}, 1000);
							}); break;
						case 1 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
							$scope.BoardUrl2 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Erpup', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
							.then(function(data){
									$scope.maxover=0;
										$timeout(function(){
											if(data != '<!--Parameter Check-->' && data.list.length>0){
												for(var i=0; i<data.list.length; i++){
													$scope.maxover=0;
													$scope.items.push(data.list[i]);
												}
											}else{
												if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
												else alert('조회된 데이터가 없습니다.');
												$scope.moreloading=0;
												$scope.maxover = 1;
											}
							       			$scope.moreloading=0;

							      		}, 1000);
							}); break;
						case 2 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
							$scope.BoardUrl3 = BoardService.Board_sear($scope.loginData.Admin_Code, 'FAQ', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
							.then(function(data){	$scope.maxCnt=0;
										$timeout(function(){
											if(data != '<!--Parameter Check-->' && data.list.length>0){
												for(var i=0; i<data.list.length; i++){
													console.log('data.list', data.list)
													$scope.maxover=0;
													$scope.items.push(data.list[i]);
												}
											}else{
												if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
												else alert('조회된 데이터가 없습니다.');
												console.log('data.list', data.list)
												$scope.moreloading=0;
												$scope.maxover = 1;
											}
							       			$scope.moreloading=0;

							      		}, 1000);
							}); break;
						case 3 : $scope.maxover=0; //Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt
							$scope.BoardUrl4 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Request', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
							.then(function(data){	$scope.maxCnt=0;
										$timeout(function(){
											if(data != '<!--Parameter Check-->' && data.list.length>0){
												for(var i=0; i<data.list.length; i++){
													$scope.maxover=0;
													$scope.items.push(data.list[i]);
												}
											}else{
												if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
												else alert('조회된 데이터가 없습니다.');
												$scope.moreloading=0;
												$scope.maxover = 1;
											}
							       			$scope.moreloading=0;

							      		}, 1000);
							}); break;
						}
					}
			}
	      }
	    };

})

.controller('PushCtrl', function($rootScope, $scope, $state, PushSelectService){
	console.log("PushCtrl");
	// Kind, Mode, Admin_Code, ChkAdmin, UserId
	$scope.PushList = function() {
		if($scope.loginData.Admin_Code != undefined){
			PushSelectService.select('Mobile_Push_Log', 'SELECT', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId)
			.then(function(data){
				$scope.items = data.list;
				console.log($scope.items);
			})
		} else {
			// alert('로그인 후 실행해주세요.');
			// $ionicHistory.nextViewOptions({
			// 	disableBack: true
			// });
			// $state.go("app.erpia_main");
		}
	}
	$scope.PushList();

	$scope.onItemDelete = function(item) {
    	$scope.items.splice($scope.items.indexOf(item), 1);
    	$scope.listSeq = item.idx;
    	PushSelectService.delete('Mobile_Push_Log', 'DELETE', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $scope.listSeq)
  	};

  	$scope.data = {
    	showDelete: false
  	};

  	// $scope.PushDetail = function() {
  	// 	$state.go('app.erpia_push.push-detail');
  	// };

})
.controller('PushDetailCtrl', function($scope, $stateParams, PushSelectService) {
	// $scope.myGoBack = function() {
	// 	$ionicHistory.goBack();
	// 	$ionicHistory.clearCache();
	// 	$ionicHistory.clearHistory();
	// 	$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
	// };
	$scope.pList = PushSelectService.get($stateParams.Seq)
})

.controller('PlaylistsCtrl', function($scope) {
	console.log("PlaylistsCtrl");
	$scope.playlists = g_playlists;
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
	console.log($stateParams);
	$scope.playlists = g_playlists;
	$scope.playlist = $scope.playlists[$stateParams.playlistId - 1];
})
.controller('DashCtrl', function($scope) {
	console.log("DashCtrl");
})

.controller('ChatsCtrl', function($scope, Chats) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		enableFriends : true
	}
})
// ERPia 차트 컨트롤러
.controller("IndexCtrl", function($rootScope, $scope, $stateParams, $q, $location, $window, $timeout, ERPiaAPI, statisticService, IndexService, $cordovaToast) {
	$scope.myStyle = {
	    "width" : "100%",
	    "height" : "100%"
	};
	$scope.dashBoard = {};
	var indexList = [];
	// 날짜
	var d= new Date();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	//일주일전
	var w = new Date(Date.parse(d) -7 * 1000 * 60 * 60 * 24)
	var wMonth = w.getMonth() + 1;
	var wDay = w.getDate();

	var nowTime = (d.getHours() < 10 ? '0':'') + d.getHours() + ":"
	nowTime += (d.getMinutes() < 10 ? '0':'') + d.getMinutes() + ":";
	nowTime += (d.getSeconds() < 10 ? '0':'') + d.getSeconds();
	var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
	var aWeekAgo = w.getFullYear() + '-' + (wMonth<10 ? '0':'') + wMonth + '-' + (wDay<10 ? '0' : '') + wDay;
	$rootScope.nowTime = '최근 조회 시간 :' + nowday + ' ' + nowTime;

	$scope.ERPiaBaseData = function(){
		$scope.loadingani();
		IndexService.dashBoard('erpia_dashBoard', $scope.loginData.Admin_Code, aWeekAgo, nowday)
		.then(function(processInfo){
			console.log('erpia_dashBoard', processInfo);

			$scope.dashBoard.E_NewOrder = processInfo.data.list[0].CNT_JuMun_New;
			$scope.dashBoard.E_BsComplete = processInfo.data.list[0].CNT_BS_NO;
			$scope.dashBoard.E_InputMno = processInfo.data.list[0].CNT_BS_No_M_No;
			$scope.dashBoard.E_CgComplete = processInfo.data.list[0].CNT_BS_Before_ChulGo;
			$scope.dashBoard.E_RegistMno = processInfo.data.list[0].CNT_BS_After_ChulGo_No_Upload;

			// 날짜
			var d= new Date();
			var month = d.getMonth() + 1;
			var day = d.getDate();
			var nowTime = (d.getHours() < 10 ? '0':'') + d.getHours() + ":"
			nowTime += (d.getMinutes() < 10 ? '0':'') + d.getMinutes() + ":";
			nowTime += (d.getSeconds() < 10 ? '0':'') + d.getSeconds();
			var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
			$rootScope.nowTime = '최근 조회 시간 :' + nowday + ' ' + nowTime;
		},
		function(){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('IndexService Error', 'long', 'center');
			else alert('IndexService Error');
		});
	}

	$scope.ERPiaBaseData();

	var request = null;
	var indexList = [];
	$scope.gu = 1;
	/*상세표보기*/
	function commaChange(Num)
	{
		fl=""
		Num = new String(Num)
		temp=""
		co=3
		num_len=Num.length
		while (num_len>0)
		{
			num_len=num_len-co
			if(num_len<0)
			{
				co=num_len+co;
				num_len=0
			}
			temp=","+Num.substr(num_len,co)+temp
		}
		rResult =  fl+temp.substr(1);
		return rResult;
	}
	// 차트에서 표시해줄 테이블 생성하는 함수
	function insertRow(data, kind)
	{
		var strHtml = "";
		var strSubject = "";
		var strSubgu="";

		switch($('input[name=gu_hidden]').val()){
			case "1": strSubgu = " (주간)"; break;
			case "2": strSubgu = " (월간)"; break;
			case "3": strSubgu = " (년간)"; break;
		}
		switch (kind)
		{
			case "meaip_jem" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>순번</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "거래처별 매입 점유율 TOP 10" + strSubgu;
				break;
			case "meachul_jem" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>사이트명</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>매출액</th></tr>";
				strSubject = "사이트별 매출 점유율"  + strSubgu ;
				break;
			case "brand_top5" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>브랜드명</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "브랜드별 매출 TOP 5" + strSubgu;
				break;
			case "meachul_top5" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>상품명</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "상품별 매출 TOP 5" + strSubgu;
				break;
			case "scm" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "SCM " + strSubgu;
				break;
			case "Meachul_ik" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>날짜</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>공급이익</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>매출이익</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>공급이익률</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>매출이익률</th></tr>";
				strSubject = "매출 이익율" + strSubgu;
				break;
			case "meachul_7" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>날짜</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "매출 실적 추이" + strSubgu;
				break;
			case "meaip_7" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>날짜</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "매입 현황" + strSubgu;
				break;
			case "beasonga" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>순번</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>건수</th></tr>";
				strSubject = "금일 출고 현황" + strSubgu;
				break;
			case "beasong_gu" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>순번</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>선불</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>착불</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>신용</th></tr>";
				strSubject = "택배사별 구분 건수 통계" + strSubgu;
				break;
			case "meachul_onoff" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "온오프라인 비교 매출" + strSubgu;
				break;
			case "banpum" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>날짜</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "매출 반품 현황" + strSubgu;
				break;
			case "banpum_top5" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>상품명</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "상품별 매출 반품 건수/반품액 TOP5" + strSubgu;
				break;
			case "meachul_cs" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>건수</th></tr>";
				strSubject = "CS 컴플레인 현황" + strSubgu;
				break;
			case "meaip_commgoods" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>번호</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>상품명</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>수량</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>금액</th></tr>";
				strSubject = "상품별 매입건수/매입액 TOP5" + strSubgu;
				break;
			case "JeGo_TurnOver" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>순번</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>구분</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>선불</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>착불</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>신용</th></tr>";
				strSubject = "재고 회전률 TOP5" + strSubgu;
				break;
			case "beasongb" :
				strHtml = "<tr><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>순번</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>날짜</th><th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>건수</th></tr>";
				strSubject = "출고현황" + strSubgu;
				break;
		}

		$("div[name=gridSubject]").html("<font style='color:#000000; font-weight:bold;'>" + strSubject + "</font>");
		/*상세 표보기 부분*/
		for (i=0, len=data.length; i<len; i++)
		{
			switch (kind)
			{
				case  "meaip_jem": case "meachul_jem" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "meachul_top5" : case "brand_top5" : case "banpum_top5" : case "meaip_7" : case "meaip_commgoods" : case "scm" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].su);
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "Meachul_ik" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml +  commaChange(data[i].value1) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value2) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].su1) + " %";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].su2) + " %";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "meachul_cs": case "beasonga": case "beasongb" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "meachul_onoff" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case  "meachul_7": case "banpum": case "meaip_7":
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].su);
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case  "beasong_gu" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value1) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + commaChange(data[i].value2) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				default :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + "<td style='; font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
			}
		}
		console.log('strHtml', strHtml);
		$("table[name=tbGrid]").html(strHtml);
	}

	// AmCharts에서 Json 데이터를 불러오는 함수
	AmCharts.loadJSON = function(url, load_kind) {
		// create the request
		if (window.XMLHttpRequest) {
		// IE7+, Firefox, Chrome, Opera, Safari
			var request = new XMLHttpRequest();
		} else {
		// code for IE6, IE5
			var request = new ActiveXObject('Microsoft.XMLHTTP');
		}


		request.open('POST', url, false);
		request.send();
		var tmpAlert = "최근갱신일 : <br>";

		if (load_kind == "refresh")
		{	$scope.loadingani();
			response = eval(request.responseText);
			// $rootScope.time_ref = response[0].in_date;
			$.each(response[0], function(index, jsonData){
				console.log(jsonData);
						tmpAlert += jsonData;
			});
			$("h3[name=refresh_date]").html(tmpAlert);
		}

		/*상세 표 보기!*/
		if (load_kind == "gridInfo")
		{
			response = eval(request.responseText);
			$.each(response[0], function(index, jsonData){
				tmpAlert += jsonData;
			});
			//상세보기 그리드 생성
			insertRow(response, $scope.kind);
		}

		if(load_kind == undefined){
					if(request.response.length < 5){
						// $("#loading2").css("display","block");
						$('div[name=loading2]').css('display','block');
					}else{
						// $("#loading2").css("display","none");
						$('div[name=loading2]').css('display','none');
						if(request.readyState == 1 || request.readyState == 2 || request.readyState == 3)
						{
							$("#loading").css("display","block");
						}
						else if(request.readyState == 4)
						{
							 if (request.status == 200)
							{
								$("#loading").css("display","none");
							}
						}
					}
		}
		return eval(request.responseText);
		// request.onreadystatechange = callback;







	};
	// ERPia 차트화면에서 위에 차트 이름을 보여주는 부분. (차트 이름을 변경시켜야 하므로 서버에 저장하고 이를 불러옴.)
	statisticService.title('myPage_Config_Stat', 'select_Title', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId)
	.then(function(data){
		$scope.tabs = data;
	})
	$scope.kind= '', $scope.htmlCode= '';

	// 차트를 슬라이드 할 때마다 차트가 생성되도록 하는 함수. 처음부터 모든 차트를 불러오면 너무 느려서 슬라이드할 때마다 불러오도록 변경함.
	$scope.onSlideMove = function(data) {
		console.log("You have selected " + data.index + " tab");
		$scope.loadingani();
		var titles =  [{Idx:0, title:"홈"}
			, {Idx:1, title:"meaip_jem"}
			, {Idx:2, title:"meachul_jem"}
			, {Idx:3, title:"brand_top5"}
			, {Idx:4, title:"meachul_top5"}
			// , {Idx:5, title:"scm"}
			, {Idx:6, title:"Meachul_ik"}
			, {Idx:7, title:"meachul_7"}
			, {Idx:8, title:"meaip_7"}
			, {Idx:9, title:"beasonga"}
			, {Idx:10, title:"beasong_gu"}
			, {Idx:11, title:"meachul_onoff"}
			, {Idx:12, title:"banpum"}
			, {Idx:13, title:"banpum_top5"}
			, {Idx:14, title:"meachul_cs"}
			, {Idx:15, title:"meaip_commgoods"}
			, {Idx:16, title:"JeGo_TurnOver"}
			, {Idx:17, title:"beasongb"}];
				// $rootScope.gubun_chart = $scope.kind;
		if (data.index > 0){
			statisticService.chart('myPage_Config_Stat', 'select_Chart', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, data.index)
			.then(function(response){
				$rootScope.kind = 'chart' + response.list[0].idx;
				switch (response.list[0].idx)
				{
					case '1' : $scope.kind = titles[1].title; break;
					case '2' : $scope.kind = titles[2].title; break;
					case '3' : $scope.kind = titles[3].title; break;
					case '4' : $scope.kind = titles[4].title; break;
					case '6' : $scope.kind = titles[5].title; break;
					case '7' : $scope.kind = titles[6].title; break;
					case '8' : $scope.kind = titles[7].title; break;
					case '9' : $scope.kind = titles[8].title; break;
					case '10' : $scope.kind = titles[9].title; break;
					case '11' : $scope.kind = titles[10].title; break;
					case '12' : $scope.kind = titles[11].title; break;
					case '13' : $scope.kind = titles[12].title; break;
					case '14' : $scope.kind = titles[13].title; break;
					case '15' : $scope.kind = titles[14].title; break;
					case '16' : $scope.kind = titles[15].title; break;
					case '17' : $scope.kind = titles[16].title; break;
				}

				// 차트를 그리는 부분 (장선임님이 만든 ASP 참조를 참조해서 만들어야함.)
				if($scope.kind === "beasonga"){
					$scope.htmlCode = '<ion-content>'	+'<input type="hidden" name="gu_hidden">' +
							'<div class="direct-chat" style="padding-top:20px;">'+
								'<div class="box-header" style="text-align: left; padding-left: 20px; vertical-align: top;">'+
									'<button class="fa fa-refresh" name="refreshW" style="-webkit-appearance:none; -webkit-border-radius: 0; width: 28px; height: 28px; color: #fff; background: #dd8369; text-align: center; vertical-align: middle; border: 0; margin-top: -18px; margin-right: 10px; padding: 0;" data-toggle="" onclick="javascript:refresh(\''+ $scope.kind +'\',\''+$scope.gu+'\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');" style="height:28px; width: 28px; vertical-align: top; color: #fff; border: 0; background-color: #dd8369;"></button>'+
									'<h3 class="box-title" name="refresh_date" style="color:#fff"></h3>'+
									'<div class="pull-right">'+
										'<button name="btnGrid" class="btn btn-box-tool" style="background: #ececed; height:28px; color: #444;"><i class="fa fa-bars"></i></button>'+
									'</div>'+
									// '<div name="loading">로딩중...</div>'+
									'<div name="loading2" style="position: absolute; top: 130px; left:10%; z-index: 50; width:80%; height:150px;  color: #fff; background: #9687a1; text-align: center; padding-top: 60px;">조회할 데이터가 없습니다.</div>'+
								'</div>'+

								'<div class="box-body" style="padding:10px 0px;">'+
									'<div id=\"'+$scope.kind+'\" style="width: 100%; height: 320px;"></div>'+
									'<div name="gridBody" style="background: #ececed; height: 320px;">'+
										'<ul class="contacts-list">'+
											'<li>'+
												'<div name="gridSubject" style="width: 100%; height: 40px; padding-top:10px; text-align:center; background:#a6b3cb; margin-bottom: 20px;"><font style="font-weight:bold;"></font></div>'+
												'<table name="tbGrid" class="table table-bordered" style="color:rgb(100, 100, 100); width:100%; font-size:12pt; margin-bottom:10px;">'+
												'</table>'+
												'<div style="width:100%; text-align:center;">'+
													'<button name="btnGridClose" class="btn bg-orange margin">닫기</button>'+
												'</div>'+
											'</li>'+
										'</ul>'+
									'</div>'+
								'</div>'+
							'</div>' + '</ion-content>';
				}else{
					$scope.htmlCode = '<ion-content>'	+'<input type="hidden" name="gu_hidden">' +
							'<div class="direct-chat" style="padding-top:20px;">'+
								'<div class="box-header" style="text-align: left; padding-left: 20px; vertical-align: top;">'+
									'<button class="fa fa-refresh" style="-webkit-appearance:none; -webkit-border-radius: 0; width: 28px; height: 28px; color: #fff; background: #dd8369; text-align: center; vertical-align: middle; border: 0; margin-top: -18px; margin-right: 10px; padding: 0;" name="refreshW" data-toggle="" onclick="javascript:refresh(\''+ $scope.kind +'\',\''+$scope.gu+'\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');" style="height:28px; width: 28px; vertical-align: top; color: #fff; border: 0; background-color: #dd8369;"></button>'+
									'<h3 class="box-title" name="refresh_date" style="color:#fff"></h3>'+
									'<div class="pull-right">'+
										'<button name="btnW" style="height:28px;" class="btn bg-purple btn-xs" onclick="makeCharts(\''+ $scope.kind +'\',\'1\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');">주간</button>'+
										'<button name="btnM" style="margin-left: 3px; height:28px;" class="btn bg-purple btn-xs" onclick="makeCharts(\''+ $scope.kind +'\',\'2\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');">월간</button>'+
										'<button name="btnY" style="margin-left: 3px; height:28px;" class="btn bg-purple btn-xs" onclick="makeCharts(\''+ $scope.kind +'\',\'3\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');">년간</button>&nbsp;&nbsp;&nbsp;&nbsp;'+
										'<button name="btnGrid" class="btn btn-box-tool" style="height:28px;"><i class="fa fa-bars"></i></button>'+
									'</div>'+
									'<div name="loading2" style="position: absolute; top: 130px; left:10%; z-index: 50; width:80%; height:150px;  color: #fff; background: #9687a1; text-align: center; padding-top: 60px;">조회할 데이터가 없습니다.</div>'+
								'</div>'+

								'<div class="box-body" style="padding:10px 0px;">'+
									'<div id=\"'+$scope.kind+'\" style="width: 100%; height: 320px;"></div>'+
									'<div name="gridBody" style="background: #ececed;">'+
										'<ul class="contacts-list">'+
											'<li>'+
												'<div name="gridSubject" style="width: 100%; height: 40px; padding-top:10px; text-align:center; background:#a6b3cb; margin-bottom: 20px;"><font style="font-weight:bold;"></font></div>'+
												'<table name="tbGrid" class="table table-bordered" style="color:rgb(100, 100, 100); width:100%; font-size:12pt; margin-bottom:10px;">'+
												'</table>'+
												'<div style="width:100%; text-align:center;">'+
													'<button name="btnGridClose" class="btn bg-orange margin">닫기</button>'+
												'</div>'+
											'</li>'+
										'</ul>'+
									'</div>'+
								'</div>'+
							'</div>'+ '</ion-content></ion-scroll>';
				}


				console.log(data.index);
				switch(data.index){
					case 1: $('#s1').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 2: $('#s2').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 3: $('#s3').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 4: $('#s4').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 5: $('#s5').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 6: $('#s6').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 7: $('#s7').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 8: $('#s8').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 9: $('#s9').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 10: $('#s10').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 11: $('#s11').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 12: $('#s12').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 13: $('#s13').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 14: $('#s14').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 15: $('#s15').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 16: $('#s16').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
					case 17: $('#s17').html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url); break;
				}

				$("button[name=btnW]").click(function() {
					$scope.loadingani();
					$("div[name=gridBody]").css('display', 'none');
					$('#' + $scope.kind).css('display', 'block');
				});
				$("button[name=btnM]").click(function() {
					$scope.loadingani();
					$("div[name=gridBody]").css('display', 'none');
					$('#' + $scope.kind).css('display', 'block');
				});
				$("button[name=btnY]").click(function() {
					$scope.loadingani();
					$("div[name=gridBody]").css('display', 'none');
					$('#' + $scope.kind).css('display', 'block');
				});

				if($('div[name=loading2]').css('display') == 'none'){  // 정보있을때
					$("button[name=btnGrid]").css('background', '#ececed');
					$("button[name=btnGrid]").css('color', '#444');
				}else{
					$("button[name=btnGrid]").css('background', '#7b7b7b');
					$("button[name=btnGrid]").css('color', '#686868');
				}


				$("button[name=btnGrid]").click(function() {
					$scope.loadingani();
					if($('div[name=loading2]').css('display') == 'none'){ // 정보있을때
						if ($('div[name=gridBody]').css('display') == 'none') {
							$('div[name=gridBody]').css('display','block');
							$('#' + $scope.kind).css('display', 'none');
							$scope.gu = $("input[name=gu_hidden]").val();
							AmCharts.loadJSON(ERPiaAPI.url + "/JSon_Proc_graph.asp?kind="+ $scope.kind +"&value_kind="+ $scope.kind +"&admin_code=" + $scope.loginData.Admin_Code + "&swm_gu=" + $scope.gu + "&Ger_code=" + $scope.userData.GerCode, "gridInfo");
						} else {
							$("div[name=gridBody]").css('display', 'none');
							$('#' + $scope.kind).css('display', 'block');

						}
					}
				});
				$("button[name=btnGridClose]").click(function() {
					$("div[name=gridBody]").css('display', 'none');
					$('#' + $scope.kind).css('display', 'block');
				});
			})
		}
    };
})

.controller('PushCtrl', function($scope, $rootScope, $ionicUser, $ionicPush) {
	// $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
	// 	alert("Successfully registered token " + data.token);
	// 	console.log('Ionic Push: Got token ', data.token, data.platform);
	// 	$scope.token = data.token;
	// });
	$scope.identifyUser = function() {
		var user = $ionicUser.get();
		if(!user.user_id) {
			// Set your user_id here, or generate a random one.
			user.user_id = $ionicUser.generateGUID();
		};

		// Metadata
		angular.extend(user, {
			name: 'Simon',
			bio: 'Author of Devdactic'
		});

		// Identify your user with the Ionic User Service
		$ionicUser.identify(user).then(function(){
			$scope.identified = true;
			console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
		});
	};
	// Registers a device for push notifications
	$scope.pushRegister = function() {
		console.log('Ionic Push: Registering user');
		// Should be called once the device is registered successfully with Apple or Google servers
		window.plugins.PushbotsPlugin.on("registered", function(token){
			console.log(token);
		});

		window.plugins.PushbotsPlugin.getRegistrationId(function(token){
		    console.log("Registration Id:" + token);

		     $rootScope.token = token;
		});
		// Register with the Ionic Push service.  All parameters are optional.

	};
})
//////////////////////////////////////////////////매입&매출 통합 다시 (앞) /////////////////////////////////////////////////////////////////////

/*매입&매출 환경설정 컨트롤러*/
.controller('MconfigCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $cordovaToast, $state, $location, $ionicPlatform, ERPiaAPI, MconfigService) {
	console.log('MconfigCtrl(매입&매출 기본값 조회 컨트롤러)');
	//단가지정배열(매출) 1. 매입가 2. 도매가 3. 인터넷가 4. 소매가 5. 권장소비자가
    $scope.MchulDn = [
      { num: 0, id: '거래처등록단가' },
      { num: 1, id: '매출가' },
      { num: 2, id: '도매가' },
      { num: 3, id: '인터넷가' },
      { num: 4, id: '소매가' },
      { num: 5, id: '권장소비자가' }
    ];
    //단가지정배열(매입) 1. 매입가 2. 도매가 3. 인터넷가 4. 소매가 5. 권장소비자가
    $scope.MeaipDn = [
      { num: 0, id: '거래처등록단가' },
      { num: 1, id: '매입가' },
      { num: 2, id: '도매가' },
      { num: 3, id: '인터넷가' },
      { num: 4, id: '소매가' },
      { num: 5, id: '권장소비자가' }
    ];
    //기본매출최근등록수불 1. 최근등록수불 2. 매출출고 3. 매출반품
    $scope.configbasicS = [
      { id: '최근등록수불', num: 1 },
      { id: '매출출고', num: 2 },
      { id: '매출반품', num: 3 }
    ];
    //기본매입최근등록수불 1. 최근등록수불 2. 매입입고 3. 매입반품
    $scope.configbasicM = [
      { id: '최근등록수불', num: 1 },
      { id: '매입입고', num: 2 },
      { id: '매입반품', num: 3 }
    ];
	$rootScope.setupData={};
    $rootScope.mejanglists=[];
    $rootScope.changolists=[];
    $rootScope.mejanglists=[];

    /*환경설정값 있는지 먼저 불러오기.*/
    MconfigService.basicSetup($scope.loginData.Admin_Code, $scope.loginData.UserId)
	.then(function(data){
		$rootScope.setupData = data;

		/*기본 매장조회*/
		MconfigService.basicM($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId)
		.then(function(data){
			$rootScope.mejanglists = data.list;
		})

		/*기본 창고조회*/
		MconfigService.basicC($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.setupData.basic_Place_Code)
		.then(function(data){
			$rootScope.changolists = data.list;
		})

	})

	/*매장에따른 연계창고 조회*/
	$scope.Link_Chango = function(){
		MconfigService.basicC($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.setupData.basic_Place_Code)
		.then(function(data){
			$rootScope.changolists = data.list;
			if($rootScope.setupData.basic_Place_Code == '000'){ //매장미지정을 선택할 경우 본사창고 디폴트
				$rootScope.setupData.basic_Ch_Code = '101';
			}else{
				$rootScope.setupData.basic_Ch_Code = '000';
			}

		})
	}

	/*뒤로 -> 취소 & 수정 & 저장*/
	$scope.configback=function(){
      $ionicPopup.show({
         title: '경고',
         subTitle: '',
         content: '저장하시겠습니까?',
         buttons: [
           { text: 'No',
            onTap: function(e){
              $ionicHistory.goBack();
            }
           },
           {
             text: 'Yes',
             type: 'button-positive',
             onTap: function(e) {
             	if($rootScope.setupData.basic_Ch_Code == '000'){//창고가 선택되지 않았을때.
             		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('창고를 선택해주세요.', 'short', 'center');
					else alert('창고를 선택해주세요.');
             	}else {
             		if($rootScope.setupData.state == 0) var mode = 'update';
             		else var mode = 'insert';

             		MconfigService.configIU($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.setupData, mode)
						.then(function(data){
							console.log('Y?',data.list[0].rslt);
							if(data.list[0].rslt == 'Y'){
								$ionicHistory.goBack();
							}else{
								alert('수정에 성공하지 못하였습니다');
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수정에 성공하지 못하였습니다', 'short', 'center');
								else alert('수정에 성공하지 못하였습니다');
							}

						})
             	}
             }
           },
         ]
        })
     }
})

/* 매입&매출 전표조회 컨트롤러 */
.controller('MLookupCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $ionicHistory, $timeout, $state, $ionicScrollDelegate, $ionicPopup, $cordovaToast, $ionicSlideBoxDelegate, ERPiaAPI, MLookupService, MiuService, MconfigService) {
	console.log('MLookupCtrl(매입&매출 전표조회&상제조회 컨트롤러)');
	console.log('구별 =>', $rootScope.distinction);
	$ionicHistory.clearCache();
	$ionicHistory.clearHistory();
	$scope.searchmode='normal';
	$scope.moreloading = 0;

	$scope.reqparams = {  //날짜검색에 필요한 파라미터
      sDate : '',
      eDate : ''
    };

	$scope.date = {
		sDate1 : '',
		eDate1 : ''
	};
	/*거래처명*/
	$scope.company = {
		username : '',
		name : '', // 거래처이름
		code : 0, // 거래처 코드
		dam : '0'
	};

	/* 형변환 */
	$scope.date.sDate1 = new Date();
	$scope.date.eDate1 = new Date();
	$scope.reqparams.sDate = new Date();
	$scope.reqparams.eDate = new Date();

	$scope.lasts = 5; //결과값은 기본으로 0~4까지 5개 띄운다
	$scope.chit_lists=[]; //조회된 전표리스트

	$scope.pageCnt = 1;
	$scope.balance = false;
	$rootScope.m_no ='';

	/* 최상단으로 */
	$scope.scrollTop = function() {
    	$ionicScrollDelegate.scrollTop();
    };

	/* 오늘날짜 구하기 */
	$scope.dateMinus=function(days){
	    var nday = new Date();  //오늘 날짜..
	    nday.setDate(nday.getDate() - days); //오늘 날짜에서 days만큼을 뒤로 이동
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();

	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;
	    return yy + "-" + mm + "-" + dd;
	}

	$scope.todate=$scope.dateMinus(0); // 오늘날짜


	$scope.onTouch = function(){
		$ionicSlideBoxDelegate.enableSlide(false);
	 };

	$scope.onRelease = function(){
		$ionicSlideBoxDelegate.enableSlide(true);
	};

	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
	 };

	$scope.previousSlide = function() {
		$ionicSlideBoxDelegate.previous();
	};

	$scope.mydate1=function(sdate1){
	    var nday = new Date(sdate1);  //선택1 날짜..
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();
	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;
	    $scope.reqparams.sDate = yy + "-" + mm + "-" + dd;
	    if($scope.reqparams.sDate =="1970-01-01"){
	    	    var nday = new Date();//오늘 날짜..
		    var yy = nday.getFullYear();
		    var mm = nday.getMonth()+1;
		    var dd = nday.getDate();
		    if( mm<10) mm="0"+mm;
		    if( dd<10) dd="0"+dd;
		    $scope.reqparams.sDate = yy + "-" + mm + "-" + dd;
	    }
	    $scope.date.sDate1=new Date($scope.reqparams.sDate);

	    if($scope.date.sDate1>$scope.date.eDate1){
		    $scope.reqparams.eDate = yy + "-" + mm + "-" + dd;
		    $scope.date.eDate1=new Date($scope.date.sDate1);
	    }


	};

	$scope.mydate2=function(edate1){
		    var nday = new Date(edate1);  //선택2 날짜
		    var yy = nday.getFullYear();
		    var mm = nday.getMonth()+1;
		    var dd = nday.getDate();

		    if( mm<10) mm="0"+mm;
		    if( dd<10) dd="0"+dd;

		    $scope.reqparams.eDate = yy + "-" + mm + "-" + dd;
		    if($scope.reqparams.eDate =="1970-01-01"){
		    	    var nday = new Date();//오늘 날짜..
			    var yy = nday.getFullYear();
			    var mm = nday.getMonth()+1;
			    var dd = nday.getDate();
			    if( mm<10) mm="0"+mm;
			    if( dd<10) dd="0"+dd;
			    $scope.reqparams.eDate = yy + "-" + mm + "-" + dd;
		    }
		    $scope.date.eDate1=new Date($scope.reqparams.eDate);

		    if($scope.date.eDate1 < $scope.date.sDate1){
		    	$scope.reqparams.sDate = yy + "-" + mm + "-" + dd;
		    	$scope.date.sDate1=new Date($scope.date.eDate1);
		    }

	};


	$scope.mydate1($scope.date.sDate1);
	$scope.mydate2($scope.date.eDate1);

	$scope.chit_lists = [];

	/*거래처 자동완성기능 (매입+매출 전표 마스터조회쪽)*/
    $scope.companyDatas = []; // 자동완성 배열

     $scope.company_auto = function() {
     	var cusname = escape($scope.company.username);
     	if($scope.companyDatas != undefined && $scope.companyDatas.length != 0){
     		$scope.companylatelyDatas = '';
     		$scope.companyDatas.splice(0, $scope.companyDatas.length); // 이전에 검색한 데이터 목록 초기화
     	}else{
     		$scope.companyDatas = '';
     	}
		MiuService.company_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, cusname)
		.then(function(data){
			$scope.companyDatas = data.list;
			$scope.companylatelyDatas = '';
		})
    }

    /*거래처 최근 검색목록*/
    $scope.company_lately =  function(){
    		if($scope.company.username.length == 0){
    			var gubun = 'Ger'
    			MiuService.companyAndgoods_lately($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun)
			.then(function(data){
				console.log(data);

				if(data != '<!--Parameter Check-->'){
					$scope.companylatelyDatas = [];
					for(var i = 0; i < data.list.length; i++){
						console.log('데이터 구별중....=>',i);
						if($rootScope.distinction == 'meaip'){
							if(data.list[i].SM_Gubun == 'M' && data.list[i].Search_Ger_Name.length != 0){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}else{
							if(data.list[i].SM_Gubun == 'S' && data.list[i].Search_Ger_Name.length != 0){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}
					}
				}
			})
    		}
    }

    /*거래처창고 조회후 값저장*/
    $scope.company_Func2=function(gname,gcode,gdam){
    		$scope.companylatelyDatas = ''; // data배열 초기화
	       $scope.company.name=gname;
	       $scope.company.username = gname;
		$scope.company.code=gcode;
		$scope.company.dam=gdam;
    }

   	 /*거래처창고 조회후 값저장*/
    	$scope.company_Func=function(gname,gcode,gdam){
	    	$scope.companyDatas = ''; // data배열 초기화
	       $scope.company.name=gname;
	       $scope.company.username = gname;
		$scope.company.code=gcode;
		$scope.company.dam=gdam;
       }

	/* 거래처명 + 기간검색 & 기간검색 */
	$scope.searches = function(){
		$scope.chit_atmSum = 0;
		$scope.chit_jiSum = 0;
		$scope.balance = false;
		$scope.money.emoon = 0;
		$scope.money.hap = 0;
		$scope.chit_lists = [];
		$scope.moreloading=1;
    		$scope.pageCnt=1;
    		$scope.maxover=0;
    		$scope.companylatelyDatas = '';
    		if($scope.company.username.length != 0){
    			var gubun = 'Ger';
	    		MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun, $scope.company.username, $scope.company.code)
			.then(function(data){
				console.log(data);
			})
    		}

		$scope.loadingani();
		$scope.sear_day(1);//날짜+거래처 검색 == 금일 일주일 일개월 버튼과 구별하기위함.
	}

	$scope.money = {
		emoon : 0,
		hap : 0,
		meaipchulsum : 0
	}

	/* 금일/ 일주일/ 일개월 / 날짜만검색 */
	$scope.sear_day = function(agoday) {
		$scope.chit_lists=[];
		$scope.chit_atmSum = 0;
		$scope.chit_jiSum = 0;
		$scope.pageCnt = 1;
		$scope.searchmode='normal'; //더보기 초기화
		$scope.loadingani();

		if(agoday != 1){
			$scope.reqparams.sDate = $scope.dateMinus(agoday);
		     	$scope.reqparams.eDate = $scope.dateMinus(0);
	     	}

	     	$scope.mydate1($scope.reqparams.sDate);
		$scope.mydate2($scope.reqparams.eDate);

		MLookupService.chit_lookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.name, 1)
		.then(function(data){
			$scope.maxover=0;
			$scope.chit_atmSum = 0;
			$scope.chit_jiSum = 0;
			$timeout(function(){
				if(data == '<!--Parameter Check-->'){//조회된 결과 없을경우
					$scope.moreloading=0;
					$scope.maxover = 1;
					$scope.balance = false;
					$scope.money.emoon = 0;
					$scope.money.hap = 0;
					$scope.chit_atmSum = 0;
					$scope.chit_jiSum = 0;
					$scope.money.meaipchulsum = 0;
				}else{
					$scope.money.meaipchulsum = 0;
					for(var m = 0; m < data.list.length; m++){
						$scope.chit_lists.push(data.list[m]);
						if($rootScope.distinction == 'meaip'){
							$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].Meaip_Amt);
						}else{
							$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].MeaChul_Amt);
						}
					}
					if($scope.company.code !=  0){
						MLookupService.eMoon($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.code)
						.then(function(data){
							$scope.balance = true;
							$scope.money.emoon = data.list[0].Jan_Amt;
							$scope.money.hap = data.list[0].All_Amt;
							$scope.chit_atmSum = data.list[0].IpKum_Amt;
							$scope.chit_jiSum = data.list[0].JiGup_Amt;
						})
					}else{
						$scope.balance = false;
						$scope.money.emoon = 0;
						$scope.money.hap = 0;
						$scope.chit_atmSum = 0;
						$scope.chit_jiSum = 0;
					}

				}
				$scope.moreloading=0;
			}, 1000);

		})
	};
	$scope.sear_day(0);

	/*전표 더보기*/
	$scope.search_more = function() {
		switch($scope.searchmode){
			case 'normal' :
				if($scope.chit_lists.length>0){
		  		console.log($scope.chit_lists.length);

		  		if($scope.maxover==0){
					$scope.pageCnt+=1;
				    $scope.moreloading=1;

					MLookupService.chit_lookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.name, $scope.pageCnt)
						.then(function(data){
							$timeout(function(){
							$scope.maxover=0;
							if(data == '<!--Parameter Check-->'){//조회된 결과 없을경우
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
								else alert('조회된 데이터가 없습니다.');
								$scope.moreloading=0;
								$scope.maxover = 1;
							}else{
								for(var m = 0; m < data.list.length; m++){
									$scope.chit_lists.push(data.list[m]);
									if($rootScope.distinction == 'meaip'){
										$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].Meaip_Amt);
									}else{
										$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].MeaChul_Amt);
									}
								}
							}
							$scope.moreloading=0;
						}, 1000);
						})
					}
				}
			break;

			case 'detail' :
				if($scope.chit_lists.length>0){
		  		console.log($scope.chit_lists.length);

		  		if($scope.maxover==0){
					$scope.pageCnt+=1;
				    $scope.moreloading=1;

				    MLookupService.detailSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams,$scope.company, $scope.detail.Place_Code, $scope.pageCnt, $scope.todate)
						.then(function(data){
							$timeout(function(){
							$scope.maxover=0;
							if(data == '<!--Parameter Check-->'){//조회된 결과 없을경우
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
								else alert('조회된 데이터가 없습니다.');
								$scope.moreloading=0;
								$scope.maxover = 1;
							}else{
								for(var m = 0; m < data.list.length; m++){
									$scope.chit_lists.push(data.list[m]);
									if($rootScope.distinction == 'meaip'){
										$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].Meaip_Amt);
									}else{
										$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].MeaChul_Amt);
									}
								}
							}
							$scope.moreloading=0;
						}, 1000);
						})
					}
				}
			break;
		}

	};

	/*거래처명 초기화*/
	$scope.clearcompany = function(){
		$scope.companyDatas = '';
		$scope.companylatelyDatas = '';
		$scope.company.username = '';
		$scope.company.name = '';
		$scope.company.code = 0;
	}

	/* 매입전표 조회 */
	$scope.chit_de = function(no){
	 	$rootScope.m_no = no;
	 	if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
    		$state.go('app.meaip_depage', {}, {location:'replace'});
    	}else{ /* 매출일 경우 */
    		$state.go('app.meachul_depage', {}, {location:'replace'});
    	}
	}

	 /*빠른등록(매입매출통합) 모달*/
	$ionicModal.fromTemplateUrl('meaipchul/quickreg_modal.html', {
    	scope: $scope
    }).then(function(modal) {
    	$scope.quickregM = modal;
    });

	$scope.quicklists = []; // 빠른등록리스트 저장배열

	 $scope.quickReg = function(){
	 	if($scope.quicklists[0] != undefined){
	 		$scope.quicklists.splice(0, $scope.quicklists.length); // 배열초기화
	 	}
	 	var mode = 'select_list';
	 	var no = '';
	 	MLookupService.quickReg($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, no)
		.then(function(data){
			if(data == '<!--Parameter Check-->'){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록된" 빠른등록" 템플렛이 없습니다. 자주거래되는 매입/매출전표를 빠른등록으로 등록하여 보다 빠르게 등록해보세요. (기등록된 전표 상세보기에서 ★를 눌러주세요.)', 'short', 'center');
				else alert('등록된" 빠른등록" 템플렛이 없습니다. 자주거래되는 매입/매출전표를 빠른등록으로 등록하여 보다 빠르게 등록해보세요. (기등록된 전표 상세보기에서 ★를 눌러주세요.)');
			}else{
				for(var i =0; i < data.list.length; i++){
					if($rootScope.distinction == 'meaip') var no = data.list[i].iL_No;
					else var no = data.list[i].Sl_No;
					$scope.quicklists.push({
						GerCode : data.list[i].GerCode,
						GerName : data.list[i].GerName,
						GoodsName : data.list[i].GoodsName,
						Subul_kind : data.list[i].Subul_kind,
						No : no,
						checked : false
					});
				}
			}
			$scope.quickregM.show();
		})

	}

	$scope.quickcheck = function(index){
	 	for(var i = 0; i < $scope.quicklists.length; i++){
			if(i == index){
				console.log('같음! true');
			}else{
				$scope.quicklists[i].checked = false;
			}
  		}
	}

	$scope.quickde = function(){
	 	for(var i = 0; i < $scope.quicklists.length; i++){
	 		if($scope.quicklists[i].checked == true){
	 			var no = $scope.quicklists[i].No;
	 			var star = 'ion-android-star';
	 			var mode = 'unused';
	 			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('빠른등록이 해제되었습니다.', 'short', 'center');
				else alert('빠른등록이 해제되었습니다.');
				MLookupService.quickReg($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, no)
					.then(function(data){
				})

	 			$scope.quicklists.splice(i, 1);//체크 배열 없애기.
	 			break;
	 		}else if(i == $scope.quicklists.length-1 && $scope.quicklists[i].checked != true){ // 마지막 항목까지 true아니면 선택된 것이 없는거야.
	 			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('선택 된 값이 없습니다.', 'short', 'center');
				else alert('선택 된 값이 없습니다.');
	 		}
	 	}

	}

	$scope.quick_i = function(){
		for(var i = 0; i < $scope.quicklists.length; i++){
			$scope.quickregM.hide();
			if($scope.quicklists[i].checked == true){
				if($rootScope.distinction == 'meaip'){
					$rootScope.iu = 'qi';
					$rootScope.mode = '등록';
					$rootScope.u_no = $scope.quicklists[i].No;
					$state.go('app.meaip_IU', {}, {location:'replace'});
				}else{
					$rootScope.iu = 'qi';
					$rootScope.mode = '등록';
					$rootScope.u_no = $scope.quicklists[i].No;
					$state.go('app.meachul_IU', {}, {location:'replace'});
				}
				break;
			}
		}
	}

	$scope.quickMcancle = function(){
		$scope.quickregM.hide();
	}

	/*등록페이지 전환*/
	$scope.meaipchul_i = function(){
		$rootScope.iu = 'i';
		$rootScope.mode='등록';
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		if($rootScope.distinction == 'meaip') $state.go('app.meaip_IU', {}, {location:'replace'});
		else $state.go('app.meachul_IU', {}, {location:'replace'});

	}

	$ionicModal.fromTemplateUrl('meaipchul/detailSet_modal.html', {
      scope: $scope
    }).then(function(modal){
      $scope.detailSet_modal = modal;
    });

    $scope.detail = {
    	Place_Code : '0'
    }

     $scope.slideChanged = function(index) {
		switch(index) {
			case 0: console.log('I am on slide 0'); break;
			case 1: $scope.Select_OptSet('L'); $scope.loadingani(); break;
			case 2: $scope.Select_OptSet('R'); $scope.loadingani(); break;
		}
	};

    /*조회셋 모달*/
    $scope.detailSet_openModal = function() {
    	//조회셋 초기화
    	$scope.company.username = '';
    	$scope.company.name = '';
    	$scope.company.code = 0;
    	$scope.company.dam = '0';
    	$scope.detail.Place_Code = '0';

        $scope.detailSet_modal.show();
        /*기본 매장조회*/
		MconfigService.basicM($scope.loginData.Admin_Code, $scope.loginData.UserId)
		.then(function(data){
			$scope.mejanglists = data.list;
		})
    };

    //*조회셋 검색*/
    $scope.detailset_up = function(){
    	$scope.searchmode='detail';
    	if($scope.company.dam == '0'){
    		$scope.company.dam = '';
    	}
    	if($scope.detail.Place_Code == '0'){
    		$scope.detail.Place_Code = '';
    	}
    	//조회셋 조회
    	MLookupService.detailSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams,$scope.company, $scope.detail.Place_Code, 1, $scope.todate)
		.then(function(data){
				console.log('detailSet =>' ,data);
			MLookupService.lqdetail_set($scope.loginData.Admin_Code, $scope.loginData.UserId,$scope.reqparams,$scope.company,$scope.detail.Place_Code,1)
				.then(function(data){
					console.log('lqdetail_set', data);
				})
			if(data == '<!--Parameter Check-->'){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 결과가 없습니다.', 'short', 'center');
				else alert('조회된 결과가 없습니다.');
			}else{
				$scope.chit_lists = [];//조회배열 초기화
				for(var m = 0; m < data.list.length; m++){
					$scope.chit_lists.push(data.list[m]);
					if($rootScope.distinction == 'meaip'){
						$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].Meaip_Amt);
					}else{
						$scope.money.meaipchulsum = $scope.money.meaipchulsum + parseInt(data.list[m].MeaChul_Amt);
					}
				}
			if($scope.company.code !=  0){
				MLookupService.eMoon($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.code)
				.then(function(data){
					$scope.balance = true;
					$scope.money.emoon = data.list[0].Jan_Amt;
					$scope.money.hap = data.list[0].All_Amt;
					$scope.chit_atmSum = data.list[0].IpKum_Amt;
					$scope.chit_jiSum = data.list[0].JiGup_Amt;
				})
			}else{
				$scope.balance = false;
				$scope.money.emoon = 0;
				$scope.money.hap = 0;
				$scope.chit_atmSum = 0;
				$scope.chit_jiSum = 0;
			}
				$scope.detailSet_modal.hide();
				//최근등록
			}
	  	})
    }
	$scope.OptsetList =[];
	$scope.Select_OptSet = function(mode) {
		MLookupService.Select_OptSet($scope.loginData.Admin_Code, $scope.loginData.UserId, mode)
		.then(function(data){
			$scope.OptsetList = data.list;
		})
    }

    $scope.quickdetail = function(){
    	MLookupService.lqdetail_set($scope.loginData.Admin_Code, $scope.loginData.UserId,$scope.reqparams,$scope.company,$scope.detail.Place_Code,2,$scope.todate)
		.then(function(data){
			console.log(data);
			if(data.list[0].rslt == 'Y'){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록되었습니다.', 'short', 'center');
				else alert('등록되었습니다.');
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록이 완료되지 않았습니다.<br>다시 시도해주세요.', 'short', 'center');
				else alert('등록이 완료되지 않았습니다.<br>다시 시도해주세요.');
			}
		})
		$scope.loadingani();
    }

    $scope.OpsetScopeCarry=function(index){
    	$ionicSlideBoxDelegate.slide(0, 500);
    	if($scope.OptsetList[index].sel_Ger_Name == null || $scope.OptsetList[index].sel_Ger_Name == '') $scope.OptsetList[index].sel_Ger_Name = '';
    	if($scope.OptsetList[index].sel_Ger_Code == null || $scope.OptsetList[index].sel_Ger_Code == '') $scope.OptsetList[index].sel_Ger_Code = '0';
	if($scope.OptsetList[index].sel_Damdang == null || $scope.OptsetList[index].sel_Damdang == '' || $scope.OptsetList[index].sel_Damdang == '미지정') $scope.OptsetList[index].sel_Damdang = '0';
	if($scope.OptsetList[index].sel_Place_Name == null || $scope.OptsetList[index].sel_Place_Name == '') $scope.OptsetList[index].sel_Place_Name = '';
    	if($scope.OptsetList[index].sel_Place_Code == null || $scope.OptsetList[index].sel_Place_Code == '') $scope.OptsetList[index].sel_Place_Code = '0';

    	if($scope.OptsetList[index].sel_Sdate == 'today'){
    		$scope.reqparams.sDate = $scope.todate;
    		$scope.date.sDate1 = new Date($scope.reqparams.sDate);
    	}else{
    		$scope.reqparams.sDate = $scope.OptsetList[index].sel_Sdate;
    		$scope.date.sDate1 = new Date($scope.reqparams.sDate);
    	}

    	if($scope.OptsetList[index].sel_Edate == 'today'){
    		$scope.reqparams.eDate = $scope.todate;
    		$scope.date.eDate1 = new Date($scope.reqparams.eDate);
    	}else{
    		$scope.reqparams.eDate = $scope.OptsetList[index].sel_Edate;
    		$scope.date.eDate1 = new Date($scope.reqparams.eDate);
    	}

		$scope.company.username = $scope.OptsetList[index].sel_Ger_Name;
		$scope.company.name = $scope.OptsetList[index].sel_Ger_Name;
		$scope.company.code = $scope.OptsetList[index].sel_Ger_Code;
		$scope.company.dam = $scope.OptsetList[index].sel_Damdang;
		$scope.detail.Place_Code = $scope.OptsetList[index].sel_Place_Code;
	}

	$scope.onTouch = function(){
		$ionicSlideBoxDelegate.enableSlide(false);
	 };

	$scope.onRelease = function(){
		$ionicSlideBoxDelegate.enableSlide(true);
	};

	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
	 };

	$scope.previousSlide = function() {
		$ionicSlideBoxDelegate.previous();
	};

	$scope.detailSet_Delete = function(index) {
		console.log(index);
        MLookupService.Delete_OptSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.OptsetList[index].idx)
		.then(function(data){
			console.log(data);
			if(data.list[0].rslt == 'Y'){
				$scope.OptsetList.splice(index,1);
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('삭제되었습니다.', 'short', 'center');
				else alert('삭제되었습니다.');

			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('삭제가 정상적으로 되지 않았습니다.<br>다시 시도해주세요.', 'short', 'center');
				else alert('삭제가 정상적으로 되지 않았습니다.<br>다시 시도해주세요.');
			}
		})
    };

	$scope.detailSet_closeModal = function() {
      $scope.detailSet_modal.hide();
    };
})


/* 매입&매출 전표상세조회 컨트롤러 */
.controller('MLookup_DeCtrl', function($scope, $rootScope, $ionicModal, $ionicPopup, $ionicHistory, $state, $cordovaToast, ERPiaAPI, MLookupService, MiuService, tradeDetailService) {

 	/*매출매입 상세조회*/
	MLookupService.chit_delookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.m_no)
		.then(function(data){
			$scope.chit_dedata = data.list;
			if($scope.chit_dedata[0].MobileQuickReg == 'N'){
	      		$scope.ionstar = "ion-android-star-outline";
	      	}else{
	      		$scope.ionstar = "ion-android-star";
	      	}
	      	//매장미지정일 경우
	      	if($scope.chit_dedata[0].Sale_Place_Name == null){
	      		$scope.chit_dedata[0].Sale_Place_Name = '매장미지정';
	      	}

	      	/* 총 수량 & 가격 */
			$scope.qtysum = 0;//총 수량
	        $scope.pricesum = 0;//총 가격

	        for (var i = 0; i < $scope.chit_dedata.length; i++) {
	          $scope.qtysum = parseInt($scope.qtysum) + parseInt($scope.chit_dedata[i].G_Qty);
	          $scope.gop = parseInt($scope.chit_dedata[i].G_Qty)*parseInt($scope.chit_dedata[i].G_Price);
	          $scope.pricesum = parseInt($scope.pricesum) + parseInt($scope.gop);
	      	}
	})

	/*빠른등록 사용&미사용*/
	$scope.m_quick = function(no,starname){
	 	if(starname == 'ion-android-star-outline'){
	 		$scope.ionstar = "ion-android-star";
	 		var mode = 'use';
	 		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('빠른등록이 등록되었습니다.', 'short', 'center');
			else alert('빠른등록이 등록되었습니다.');

	 	}else{
	 		$scope.ionstar = "ion-android-star-outline";
	 		var mode = 'unused';
	 		var ilno = ilno;

	 		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('빠른등록이 해제되었습니다.', 'short', 'center');
			else alert('빠른등록이 해제되었습니다.');
	 	}

	 	MLookupService.quickReg($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, no)
			.then(function(data){
		})
	}

	/*수정페이지 전환*/
	$scope.meaipchul_u = function(no){
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		MLookupService.u_before_check($scope.loginData.Admin_Code, $scope.loginData.UserId, no)
		.then(function(data){
			if(data.list[0].Rslt == 0){ // --------------- 세금계산서 및 배송정보 미존재
				$rootScope.iu = 'u';
				$rootScope.mode='수정';
				$rootScope.u_no = no;
				if($rootScope.distinction == 'meaip') $state.go('app.meaip_IU', {}, {location:'replace'});
				else $state.go('app.meachul_IU', {}, {location:'replace'});
			}else{
				$rootScope.iu = 'sb_u';
				if(data.list[0].Rslt == 1){ // --------------- 세금계산서 존재
					console.log('세금계산서');
					var data_alert = '세금계산서가 발행된 전표는<br>창고,매장만 수정 가능합니다.';

				}else if(data.list[0].Rslt == -2){  // --------------- 배송정보 존재
					console.log('배송정보 존재');
					var data_alert = '연계된 배송정보가 존재합니다.<br>이중출고의 위험이 있어 모바일에서는<br>배송정보 삭제가 불가하며, <br>일부(창고,매장,단가,지급정보)만 수정이 가능합니다.';
					$rootScope.iu = 'sb_ui';

				}else if(data.list[0].Rslt == -1){  // --------------- 세금계산서 & 배송정보 존재
					console.log('세금계산서 & 배송정보 존재');
					var data_alert = '세금계산서와 배송정보가 모두 존재합니다.<br>창고,매장만 수정가능합니다.';
					$rootScope.iu = 'sb_u';
				}
				$ionicPopup.show({
		         title: '경고',
		         subTitle: '',
		         content: data_alert,
		         buttons: [
		           { text: 'No',
		            onTap: function(e){
		            }},
		           {
		             text: 'Yes',
		             type: 'button-positive',
		             onTap: function(e) {
							$rootScope.mode='수정';
							$rootScope.u_no = no;
							if($rootScope.distinction == 'meaip') $state.go('app.meaip_IU', {}, {location:'replace'});
							else $state.go('app.meachul_IU', {}, {location:'replace'});
		             }
		           },
		         ]})
			}
		})
	}

	/*거래명세표 전환*/
	$scope.traddetail = function(no){
		tradeDetailService.readDetail($scope.loginData.Admin_Code, no)
			.then(function(response){
				console.log('readDetail _ meaipchul쪽=>', response);

				var numhap = 0; // 수량합계
				var num = 1;
				switch( num ){
					case 1:  response.list[0].numhap = response.list[0].G_ea1;
							 response.list[0].taxhap = response.list[0].tax1;
							 response.list[0].pricehap = response.list[0].G_price1;
							 if(response.list[0].G_ea2 == null) break;

					case 2:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea2);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax2);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price2);
							 if(response.list[0].G_ea3 == null) break;

					case 3:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea3);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax3);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price3);
							 if(response.list[0].G_ea4 == null) break;

					case 4:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea4);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax4);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price4);
							 if(response.list[0].G_ea5 == null) break;

					case 5:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea5);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax5);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price5);
							 if(response.list[0].G_ea6 == null) break;

					case 6:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea6);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax6);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price6);
							 if(response.list[0].G_ea7 == null) break;

					case 7:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea7);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax7);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price7);
							 if(response.list[0].G_ea8 == null) break;

					case 8:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea8);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax8);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price8);
							 if(response.list[0].G_ea9 == null) break;

					case 9:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea9);
							 response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax9);
							 response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price9);
							 if(response.list[0].G_ea10 == null) break;

					case 10:  response.list[0].numhap = parseInt(response.list[0].numhap) + parseInt(response.list[0].G_ea10);
							   response.list[0].taxhap = parseInt(response.list[0].taxhap) + parseInt(response.list[0].tax10);
							   response.list[0].pricehap = parseInt(response.list[0].pricehap) + parseInt(response.list[0].G_price10);
							   break;
					default : console.log('여기올일 없을껄....');
				}
				if($rootScope.distinction == 'meaip') response.list[0].bigo = '[반품]';
				else  response.list[0].bigo = ' ';
				$rootScope.detail_items = response.list;
				$rootScope.trade_Detail_Modal.show();
			})
		// tradeDetailService.chkRead($scope.loginData.Admin_Code, no, $scope.loginData.User_Id)
	}

	/*삭제*/
	$scope.chitDeleteF = function(no){
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		MLookupService.d_before_check($scope.loginData.Admin_Code, $scope.loginData.UserId, no)
			.then(function(data){
				var decheck = 'N';
				if(data.list[0].Rslt == 0){ // --------------- 세금계산서 및 배송정보 미존재
					var decheck = 'd';
					$rootScope.mode='삭제가능';
					$rootScope.u_no = no;
					$rootScope.tax_u = false;
					var data_alert = '정말로 삭제하시겠습니까?.';
				}else if(data.list[0].Rslt == 1){ // --------------- 세금계산서 존재
						console.log('세금계산서 존재');
						var data_alert = '세금계산서가 발행된 전표는 삭제가 불가능합니다.';

					}else if(data.list[0].Rslt == -2){
						var decheck = 'd';  // --------------- 배송정보 존재
						console.log('배송정보 존재');
						var data_alert = '연계된 배송정보가 존재합니다. 모두 삭제하시겠습니까?';

					}else if(data.list[0].Rslt == -1){  // --------------- 세금계산서 & 배송정보 존재
						console.log('세금계산서 & 배송정보 존재');
						var data_alert = '세금계산서와 배송정보가 모두 존재합니다. 삭제가 불가능합니다.';
					}
					$ionicPopup.show({
			         title: '경고',
			         subTitle: '',
			         content: data_alert,
			         buttons: [
			           { text: 'No',
			            onTap: function(e){
			            }},
			           {
			             text: 'Yes',
			             type: 'button-positive',
			             onTap: function(e) {
			             		if(decheck == 'd'){
			             			MiuService.d_data($scope.loginData.Admin_Code, $scope.loginData.UserId, no)
								.then(function(data){
									if(data.list[0].rslt == 'Y'){
										if(ERPiaAPI.toast == 'Y') $cordovaToast.show('전표가 삭제되었습니다.', 'short', 'center');
										else alert('전표가 삭제되었습니다.');
										 if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
										 	$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
										    $state.go('app.meaip_page', {}, {location:'replace'});
										}else{ /* 매출일 경우 */
											$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
										    $state.go('app.meachul_page', {}, {location:'replace'});
										}
									}
								})

			             		}else{
			             			//삭제안됬을경우 예외처리?
			             		}


			             }
			           },
			         ]
			        })

		})
	}


	/*뒤로 제어*/
    $scope.backControll=function(){

     	if($rootScope.distinction == 'meaip'){
     		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
     		$state.go('app.meaip_page', {}, {location:'replace'});
     	}else{
     		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
     		$state.go('app.meachul_page', {}, {location:'replace'});
     	}
     }

})

/* 매입&매출 등록 컨트롤러 */
.controller('MiuCtrl', function($scope, $rootScope, $ionicPopup, $ionicModal, $cordovaBarcodeScanner, $ionicHistory, $timeout, $state, $cordovaToast, ERPiaAPI, MconfigService, MiuService, MLookupService) {
	if($rootScope.iu == 'sb_u'){
		$scope.sbu = true;
	}else if($rootScope.iu == 'sb_ui'){
		$scope.sbu = true;
		$scope.sbb = true;
	}else{
		$scope.sbu = false;
	}
	console.log($rootScope.iu);
	/*날짜생성*/
	$scope.dateMinus=function(days){
	    var nday = new Date();  //오늘 날짜..
	    nday.setDate(nday.getDate() - days); //오늘 날짜에서 days만큼을 뒤로 이동
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();

	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;

	    return yy + "-" + mm + "-" + dd;
	}
	/*date형변환에 필요한 그릇*/
	$scope.date={
		todate : '',
		payday : '',
		todate1 : '',
		payday1 : ''
	}

	$scope.datetypes='';
	$scope.date.todate=$scope.dateMinus(0); //오늘날짜 스코프
	$scope.date.payday=$scope.dateMinus(0);
	$scope.date.todate1=new Date($scope.date.todate);
	$scope.date.payday1=new Date($scope.date.payday);


	/*매입일/매출일 날짜 형변환하기*/
	$scope.datechange=function(date,num){
		var nday = new Date(date);
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();

	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;



	    switch(num){
	    	case 1 : $scope.date.todate = yy + "-" + mm + "-" + dd;
	    		 if($scope.date.todate =="1970-01-01"){
			    	    var nday = new Date();//오늘 날짜..
				    var yy = nday.getFullYear();
				    var mm = nday.getMonth()+1;
				    var dd = nday.getDate();
				    if( mm<10) mm="0"+mm;
				    if( dd<10) dd="0"+dd;
				    $scope.date.todate = yy + "-" + mm + "-" + dd;
			  }
	    		 $scope.date.todate1=new Date($scope.date.todate);
	    		 break;
	    	case 2 : $scope.date.payday = yy + "-" + mm + "-" + dd;
	    		if($scope.date.payday =="1970-01-01"){
			    	    var nday = new Date();//오늘 날짜..
				    var yy = nday.getFullYear();
				    var mm = nday.getMonth()+1;
				    var dd = nday.getDate();
				    if( mm<10) mm="0"+mm;
				    if( dd<10) dd="0"+dd;
				    $scope.date.payday = yy + "-" + mm + "-" + dd;
			  }
	    		$scope.date.payday1 = new Date($scope.date.payday);
	    		break;
	    }

	};

	/*자동슬라이드*/
    $scope.basictype=true;
	$scope.basic2type=false;
	$scope.basic3type=false;
	$scope.upAnddown="ion-arrow-down-b";
	$scope.upAnddown2="ion-arrow-up-b";
	$scope.upAnddown3="ion-arrow-up-b";

	/*거래처 그릇*/
	 $scope.datas = {
	 	subulkind : 0,
	 	userGerName : '', // 사용자가 입력한 거래처명
	 	GerName : '',
	 	GerCode : 0,
	 	totalsumprices : 0, //합계
	 	remk : '' // 관리비고
	 }

	 /*체크데이터*/
	 $scope.m_check = {
	 	cusCheck : 'f',
	 	subulCheck  : 'f',
	 	meajangCheck : 'f',
	 	changoCheck : 'f'
	 }

	 /*매입&매출 기본정보*/
	 $scope.setupData={
	 	basic_Place_Code : 0,
	 	basic_Ch_Code : 0
	 };

	 /*상품등록 리스트*/
    $scope.goodsaddlists=[];
    $scope.checkedDatas=[];

    /*상품검색 selectBoxList*/
    $scope.modeselectlist=[
	    { Name: '상품명', Code: 'Select_GoodsName' },
	    { Name: '자체코드', Code: 'Select_G_OnCode' },
	    { Name: '상품코드', Code: 'Select_G_Code' },
	    { Name: '공인바코드', Code: 'Select_GI_Code' }
    ];

    /* goods Search modal */
    $ionicModal.fromTemplateUrl('meaipchul/goods_Modal.html', {
    scope: $scope
    }).then(function(modal) {
    $scope.goodsmodal = modal;
    });

    /*유저가 쓴 상품이름 & 검색 모드*/
    $scope.user = {
    	userGoodsName : '',
    	userMode : 'Select_GoodsName'
    };

    $scope.bar = 'N'; //바코드로 검색인가 아닌가 구별하기위함.

	 /* page up And down */
    $scope.Next=function(){
    	if($scope.basictype == true){
    		$scope.basictype= false;
    		$scope.upAnddown="ion-arrow-up-b";
    	}else{
    		$scope.basictype=true;
    		$scope.basic2type=false;
    		$scope.basic3type=false;
    		$scope.upAnddown="ion-arrow-down-b";
    		$scope.upAnddown2="ion-arrow-up-b";
    		$scope.upAnddown3="ion-arrow-up-b";
    	}
    }
    $scope.Next2=function(){
    	if($scope.basic2type == true){
    		$scope.basic2type= false;
    		$scope.upAnddown2="ion-arrow-up-b";
    	}else{
    		$scope.basic2type=true;
    		$scope.basictype=false;
    		$scope.basic3type=false;
    		$scope.upAnddown2="ion-arrow-down-b";
    		$scope.upAnddown="ion-arrow-up-b";
    		$scope.upAnddown3="ion-arrow-up-b";
    	}
    }
    $scope.Next3=function(){
    	if($scope.basic3type == true){
    		$scope.basic3type= false;
    		$scope.upAnddown3="ion-arrow-up-b";
    	}else{
    		$scope.basic3type=true;
    		$scope.basictype=false;
    		$scope.basic2type=false;
    		$scope.upAnddown3="ion-arrow-down-b";
    		$scope.upAnddown="ion-arrow-up-b";
    		$scope.upAnddown2="ion-arrow-up-b";
    	}
    }

    /*환경설정값 있는지 먼저 불러오기.*/
    MconfigService.basicSetup($scope.loginData.Admin_Code, $scope.loginData.UserId)
	.then(function(data){
		$scope.setupData = data;
		$scope.m_check.meajangCheck = 't';
		$scope.m_check.changoCheck = 't';

		if($rootScope.distinction == 'meaip'){  								//매입 수불구분확인 -------------------- 매입일경우
			var i = $scope.setupData.basic_Subul_Meaip;
			switch (i) {
			    case '1' :  switch($scope.setupData.basic_Subul_Meaip_Before){
			    		   		case 'I' : console.log('I'); $scope.datas.subulkind=111; break;
			    		   		case 'B' : console.log('B'); $scope.datas.subulkind=122; break;
			    		   		case 'N' : console.log('N'); break;
			    		   }
			    		   break;
			    case '2' : $scope.datas.subulkind=111; break;
			    case '3' : $scope.datas.subulkind=122; break;

			    default : console.log('수불카인드 오류'); $scope.m_check.subulCheck = 'f'; break; // 최근등록수불로 되어있는데 등록된 값 없을경우
			}
			if($scope.datas.subulkind == 0){
				$scope.m_check.subulCheck = 'f';
			}
		}else{  																//매출 수불구분확인 -------------------- 매출일경우
			var i = $scope.setupData.basic_Subul_Sale;
			switch (i) {
			    case '1' :  switch($scope.setupData.basic_Subul_Sale_Before){
			    		   		case 'C' : console.log('C'); $scope.datas.subulkind=221; break;
			    		   		case 'B' : console.log('B'); $scope.datas.subulkind=212; break;
			    		   		case 'N' : console.log('N'); break;
			    		    }
			    		   break;
			    case '2' : $scope.datas.subulkind=221; break;
			    case '3' : $scope.datas.subulkind=212; break;

			    default : console.log('수불카인드 오류'); $scope.m_check.subulCheck = 'f'; break; // 최근등록수불로 되어있는데 등록된 값 없을경우
			  }
			  if($scope.datas.subulkind == 0){
			  	$scope.m_check.subulCheck = 'f';
			  }

		}

		/*기본 매장조회*/
		MconfigService.basicM($scope.loginData.Admin_Code, $scope.loginData.UserId)
		.then(function(data){
			$scope.mejanglists = data.list;
		})

		/*기본 창고조회*/
		MconfigService.basicC($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.setupData.basic_Place_Code)
		.then(function(data){
			$scope.changolists = data.list;
		})

	})

    /*지급정보 구분 - one(현금) two(통장) th(어음) fo(카드)*/
    $scope.payment=[
    { one : false, name : '현금결제', checked : false },
    { two : false, name : '통장결제', checked : false },
    { th : false, name : '어음결제', checked : false },
    { fo : false, name : '카드결제', checked : false }
    ];

    $scope.pay={
     	use : true,
     	payprice : 0, // 지급액
     	paycardbank : '', //은행&카드 정보
     	gubun : 4,
     	acno : '', //지급전표 정보 (수정시 사용)
     	no : '', // 전표번호 (수정시 사용)
     	codenum : -1,
     	goods_del : 'N', // 상품 삭제 Y&N
     	goods_seq_end : 0,
     	delete : true
     };

     /*은행/카드 정보*/
     $scope.paycardbank=[];
     $scope.paytype = false;

     $scope.paylist=[];

	////////////////////////////////////////////// 수정일경우 데이터 불러오기 //////////////////////////////////////////////////////////
	if($rootScope.iu == 'u' || $rootScope.iu == 'qi' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui'){
		/*전표 상세조회 -- 날짜 paydate(입출일), todate(지급일)*/
		MLookupService.chit_delookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.u_no)
		.then(function(data){
			$scope.datas.remk = data.list[0].Remk;
			if($rootScope.distinction == 'meaip'){
				if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
					$scope.date.todate1 = new Date(data.list[0].Meaip_Date);
					$scope.date.todate = data.list[0].Meaip_Date;
				}else{
					$scope.date.todate1 = $scope.date.todate1=new Date($scope.dateMinus(0));
					$scope.date.todate = $scope.dateMinus(0);
				} //오늘날짜 스코프
				$scope.pay.acno = data.list[0].AC_No;
				$scope.pay.no = data.list[0].iL_No;
				$scope.pay.goods_seq_end = data.list[data.list.length-1].Seq;

				if(data.list[0].IpJi_Date.length > 0){
					if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
						$scope.date.payday1 = new Date(data.list[0].IpJi_Date);
						$scope.date.payday = data.list[0].IpJi_Date;
					}else{
						$scope.date.payday1=new Date($scope.date.payday);
						$scope.date.payday=$scope.dateMinus(0);
					}
				}
			}else{
				if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
					$scope.date.todate1 = new Date(data.list[0].MeaChul_Date);
					$scope.date.todate = data.list[0].MeaChul_Date;
				}else{
					$scope.date.todate1 = $scope.date.todate1=new Date($scope.dateMinus(0));
					$scope.date.todate = $scope.dateMinus(0);
				}
				$scope.pay.acno = data.list[0].AC_No;
				$scope.pay.no = data.list[0].Sl_No;
				$scope.pay.goods_seq_end = data.list[data.list.length-1].Seq;
				if(data.list[0].IpJi_Date.length > 0){
					if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
						$scope.date.payday1 = new Date(data.list[0].IpJi_Date);
						$scope.date.payday = data.list[0].IpJi_Date;
					}else{
						$scope.date.payday1=new Date($scope.date.payday);
						$scope.date.payday=$scope.dateMinus(0);
					}

				}
			}

			/*조회된 창고랑 매장*/
			if(data.list[0].Sale_Place_Code.length == 0){
				$scope.setupData.basic_Place_Code = '000';
			}else{
				$scope.setupData.basic_Place_Code = data.list[0].Sale_Place_Code;
			}
			$scope.setupData.basic_Ch_Code = data.list[0].Ccode;
			/*조회된 수불카인드*/

			$scope.datas.subulkind = data.list[0].Subul_kind;

			for(var i=0; i < data.list.length; i++){
				$scope.goodsaddlists.push({
					name : data.list[i].G_Name,
					num : parseInt(data.list[i].G_Qty),
					goodsprice : data.list[i].G_Price,
					code : data.list[i].G_Code,
					goods_seq : data.list[i].Seq,
					state : 'u' // 디비에있는 데이터인지 확인하기위해. / 티삭제시 필요
				});
			}

			$scope.m_check.meajangCheck = 't';
			$scope.m_check.changoCheck = 't';
			$scope.m_check.subulCheck = 't';

			$scope.company_Func(data.list[0].GerName,data.list[0].GerCode,data.list[0].G_GDamdang);
			$scope.checkup();

			/*지급구분*/
			if(data.list[0].IpJi_Gubun.length > 0){
				$scope.pay.use = false;
				if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' )  $scope.pay.delete=false;
				else  $scope.pay.delete=true;
				$scope.pay.payprice = parseInt(data.list[0].IpJi_Amt);
				switch(parseInt(data.list[0].IpJi_Gubun)){
					case 701 : $scope.payment[0].checked = true; $scope.pay.gubun = 0; break;
					case 721 : $scope.payment[0].checked = true; $scope.pay.gubun = 0; break;

					case 702 : $scope.payment[1].checked = true; $scope.pay.gubun = 1; break;
					case 722 : $scope.payment[1].checked = true; $scope.pay.gubun = 1; break;

					case 703 : $scope.payment[3].checked = true; $scope.pay.gubun = 3; break;
					case 723 : $scope.payment[3].checked = true; $scope.pay.gubun = 3; break;

					case 704 : $scope.payment[2].checked = true; $scope.pay.gubun = 2; break;
					case 724 : $scope.payment[2].checked = true; $scope.pay.gubun = 2; break;

					default : console.log('셀렉트 된 것이 없습니다.'); break;
				}
				if(data.list[0].IpJi_Gubun == 703 || data.list[0].IpJi_Gubun == 723){
					$scope.Payments_division(3);
					$scope.pay.paycardbank = data.list[0].Card_Code + ',' + data.list[0].Card_Name + ',' + data.list[0].Card_Num;
					$scope.pay.codenum = data.list[0].Card_Code;
					console.log(">>>pay.paycardbank",$scope.pay.paycardbank, data.list);
				}else if(data.list[0].IpJi_Gubun == 702 || data.list[0].IpJi_Gubun == 722){
					$scope.Payments_division(1);
					$scope.pay.paycardbank = data.list[0].Bank_Code + ',' + data.list[0].Bank_Name + ',' + data.list[0].Bank_Account;
					$scope.pay.codenum = data.list[0].Bank_Code;
					console.log(">>>pay.paycardbank",$scope.pay.paycardbank, data.list);
				}else{
					for(var i=0; i<2; i++){
						$scope.paylist.push({
			    			code : '',
			    			name : '',
			    			num : 0
			    		});
					}

				}
				$scope.payinsert();
			}

		})
	if($rootScope.iu == 'qi'){
		$rootScope.iu = 'i';
	}

	}
	////////////////////////////////////////////// 수정 끝 //////////////////////////////////////////////////////////////////////////////

	/*거래처명 초기화*/
	$scope.clearcompany = function(){
		$scope.datas.userGerName = '';
		$scope.datas.GerName = '';
		$scope.datas.GerCode = 0;
		$scope.companyDatas = '';
		$scope.companylatelyDatas = '';
	}

	/*매장에따른 연계창고 조회*/
	$scope.Link_Chango = function(){
		MconfigService.basicC($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.setupData.basic_Place_Code)
		.then(function(data){
			$scope.changolists = data.list;
			if($scope.setupData.basic_Place_Code == 000){ //매장미지정을 선택할 경우 본사창고 디폴트
				$scope.setupData.basic_Place_Code = '000';
				$scope.setupData.basic_Ch_Code = '101';
			}else{
				$scope.setupData.basic_Ch_Code = $scope.changolists[0].Code;
				$scope.m_check.changoCheck = 'f';
			}

		})
	}

	/*거래처 자동완성기능 (매입+매출 등록/수정쪽)*/
    $scope.companyDatas = []; // 자동완성 배열

     $scope.company_auto = function() {
     	var cusname = escape($scope.datas.userGerName);
     	if($scope.companyDatas != undefined && $scope.companyDatas.length != 0){
     		$scope.companylatelyDatas = '';
     		$scope.companyDatas.splice(0, $scope.companyDatas.length); // 이전에 검색한 데이터 목록 초기화
     	}else{
     		$scope.companyDatas = '';
     	}
		MiuService.company_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, cusname)
		.then(function(data){
			console.log(data);
			$scope.companyDatas = data.list;
			$scope.companylatelyDatas = '';
		})
    }

    /*거래처 최근 검색목록*/
    $scope.company_lately =  function(){
    		if($scope.datas.userGerName.length == 0){
    			$scope.companyDatas = '';
    			var gubun = 'Ger';
    			MiuService.companyAndgoods_lately($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun)
			.then(function(data){
				console.log(data);

				if(data != '<!--Parameter Check-->'){
					$scope.companylatelyDatas = [];
					for(var i = 0; i < data.list.length; i++){
						if($rootScope.distinction == 'meaip' && data.list[i].Search_Ger_Name.length != 0 ){
							if(data.list[i].SM_Gubun == 'M'){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}else{
							if(data.list[i].SM_Gubun == 'S' && data.list[i].Search_Ger_Name.length != 0 ){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}
					}
				}
			})
    		}
    }

   	/*거래처창고 조회후 값저장*/
    	$scope.company_Func2=function(gname,gcode){
    		$scope.companylatelyDatas = ''; // data배열 초기화
        	$scope.datas.userGerName = gname;
        	$scope.datas.GerName=gname;
		$scope.datas.GerCode=gcode;
		$scope.m_check.cusCheck = 't';
    	}

    /*거래처창고 조회후 값저장*/
    $scope.company_Func=function(gname,gcode){
    	$scope.companyDatas = ''; // data배열 초기화
	$scope.datas.GerName=gname;
	$scope.datas.userGerName = gname;
	$scope.datas.GerCode=gcode;
	$scope.m_check.cusCheck = 't';

	var gubun = 'Ger';
	MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun, gname, gcode)
	.then(function(data){
		console.log(data);
	})
    }

    /*거래처 상세조회 */
 	 $scope.CompDetailData={};
	  $scope.gerDetail=function(){
	  MiuService.company_detail_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.datas.GerCode)
		.then(function(data){
			if(data.G_Code == '업체정보가없습니다.'){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처명을 검색해주세요.', 'long', 'center');
				else alert('거래처명을 검색해주세요.');
			}else{
				$scope.CompDetailData = data.list[0];
				if($scope.CompDetailData.Use_Recent_DanGa_YN=='Y'){
					$scope.CompDetailData.Use_Recent_DanGa_YN='/ 최근단가 우선적용'
				}else{
					$scope.CompDetailData.Use_Recent_DanGa_YN=''
				}
				$ionicPopup.alert({
			        title: '<b>거래처정보</b>',
			        subTitle: '',
			        template: '<table><tr><td width="40%" style="border-right:1px solid black;">거래처명</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_Name+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">매출단가</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_DanGa_Gu+$scope.CompDetailData.Use_Recent_DanGa_YN+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">전화번호</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_Tel+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">배송지 주소</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_Juso+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">최근 매입일</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.Recent_purchase_date+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">최근 매출일</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.Recent_sales_date+'</td></tr></table>'

	    		})
			}
		})

	};

	$scope.Changosave = function(){
		$scope.m_check.changoCheck = 't';
	}

 /*상품조회모달*/
    $scope.goods_searchM = function(num){
    	$scope.moreloading=0;
    	$scope.pageCnt=1;
    	$scope.maxover=0;
    	var goodsname = escape($scope.user.userGoodsName);
    	if($scope.user.userMode == 'Select_GoodsName'){
	    	MiuService.goods_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.user.userMode, goodsname, $scope.setupData.basic_Ch_Code,$scope.pageCnt)
		.then(function(data){

			if($scope.user.userGoodsName.length != 0 && data != '<!--Parameter Check-->' && num == 1 ){ // 최근 상품 거래 조회목록에 저장.
				var gubun = 'Goods';
				MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun,goodsname)
				.then(function(data){
					console.log(data);
				})
			}
			$scope.goodslists = data.list;
		})
	}else{
		MiuService.goods_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.user.userMode, goodsname, $scope.setupData.basic_Ch_Code)
		.then(function(data){

			if($scope.user.userGoodsName.length != 0 && data != '<!--Parameter Check-->' && num == 1 ){ // 최근 상품 거래 조회목록에 저장.
				var gubun = 'Goods';
				MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun,goodsname)
				.then(function(data){
					console.log(data);
				})
			}
			$scope.goodslists = data.list;
			$scope.moreloading=0;
			$scope.maxover = 1;
			$scope.pageCnt=1;
		})
	}
		if($scope.checkedDatas.length != 0){
			$scope.checkedDatas.splice(0,$scope.checkedDatas.length);
		}
		$scope.goodlately_slists = '';
    	$scope.goodsmodal.show();
    }

    /*상품 최근 검색 조회*/
    $scope.goods_lately = function(){
    	if($scope.user.userGoodsName.length == 0 || $scope.user.userGoodsName.length == undefined){
    		var gubun = 'Goods';
    		MiuService.companyAndgoods_lately($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun)
			.then(function(data){
				console.log(data);
				if(data != '<!--Parameter Check-->'){
					$scope.goodlately_slists = data.list;
				}
			})
    	}
    }
    /*상품최근검색 목록 초기화*/
    $scope.clear_goods = function(){
    	$scope.goodlately_slists = '';
    	$scope.user.userGoodsName = '';
    }

    $scope.goods_lately_serarch = function(name){
    	$scope.user.userGoodsName = name;
    	$scope.goodlately_slists = '';
    	$scope.goods_searchM(2);
    	$rootScope.loadingani();
    }
//------------------상품 더보기(페이징)------------------------------------------
    /* 더보기 버튼 클릭시 */
	$scope.goods_more = function() {
			var goodsname = escape($scope.user.userGoodsName);
	  		if($scope.goodslists.length>0){
	  		console.log($scope.goodslists.length);


	  		if($scope.maxover==0){
		        $scope.pageCnt+=1;

		      	$scope.moreloading=1;
		      	MiuService.goods_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.user.userMode, goodsname, $scope.setupData.basic_Ch_Code,$scope.pageCnt)
				.then(function(data){
					$scope.maxCnt=0;
					$timeout(function(){
						if(data != '<!--Parameter Check-->'){
							for(var i=0; i<data.list.length; i++){
								$scope.goodslists.push(data.list[i]);
							}
						}else{
							$scope.moreloading=0;
							$scope.maxover = 1;
						}
		       		$scope.moreloading=0;

		      		}, 1000);
		  		})
			}
	      }
	    };
    //---------------------------상품정보 디테일 조회--------------------------------
    function commaChange(Num)
	{
		fl=""
		Num = new String(Num)
		temp=""
		co=3
		num_len=Num.length
		while (num_len>0)
		{
			num_len=num_len-co
			if(num_len<0)
			{
				co=num_len+co;
				num_len=0
			}
			temp=","+Num.substr(num_len,co)+temp
		}
		rResult =  fl+temp.substr(1);
		return rResult;
	}

   $scope.goodsDetail=function(indexnum){
   		$scope.G_NameS =  $scope.goodslists[indexnum].G_Name;
   		$scope.G_OnCodeS = $scope.goodslists[indexnum].G_OnCode;
   		//상품명, 자체코드가 11글자보다 크면 <BR>태그를 삽입하여 한줄 띄게 만든다 ( IONIC POPUP 깨지는 문제 해결방안)
   		if($scope.goodslists[indexnum].G_Name.length>7) $scope.G_NameS = $scope.goodslists[indexnum].G_Name.substring(0,8) + '<br>' + $scope.goodslists[indexnum].G_Name.substring(8,$scope.goodslists[indexnum].G_Name.length);
   		if($scope.goodslists[indexnum].G_OnCode.length>11) $scope.G_OnCodeS = $scope.goodslists[indexnum].G_OnCode.substring(0,10) + '<br>' + $scope.goodslists[indexnum].G_OnCode.substring(10,$scope.goodslists[indexnum].G_OnCode.length);
		$ionicPopup.alert({
		         title: '<b>상품 정보</b>',
		         subTitle: '',
		         template: '<table width="100%"><tr><td width="40%" style="border-right:1px solid black;">상품명</td><td width="55%" style="padding-left:5px">'+$scope.G_NameS+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">규격</td><td width="55%" style="padding-left:5px">'+$scope.goodslists[indexnum].G_Stand+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">로케이션</td><td width="55%" style="padding-left:5px">'+$scope.goodslists[indexnum].Location+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">자체코드</td><td width="55%" style="padding-left:5px">'+$scope.G_OnCodeS+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">매입가</td><td width="55%" style="padding-left:5px">'+commaChange($scope.goodslists[indexnum].G_Dn1)+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">도매가</td><td width="55%" style="padding-left:5px">'+commaChange($scope.goodslists[indexnum].G_Dn2)+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">인터넷가</td><td width="55%" style="padding-left:5px">'+commaChange($scope.goodslists[indexnum].G_Dn3)+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">소매가</td><td width="55%" style="padding-left:5px">'+commaChange($scope.goodslists[indexnum].G_Dn4)+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">권장소비자가</td><td width="55%" style="padding-left:5px">'+commaChange($scope.goodslists[indexnum].G_Dn5)+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">입수량</td><td width="55%" style="padding-left:5px">'+$scope.goodslists[indexnum].Box_In_Qty+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">재고</td><td width="55%" style="padding-left:5px">'+$scope.goodslists[indexnum].Jego+'</td></tr></table>'
		  })
 	};

/*상품체크박스*/
    $scope.goodsCheck=function(goodsdata){
    	$scope.checkcaught='no';
    	for(var i=0; i<$scope.checkedDatas.length; i++){
    		if($scope.checkedDatas[i] == goodsdata){
    			$scope.checkedDatas.splice(i, 1);
    			$scope.checkcaught='yes';
    			break;
    		}
    	}
    	if($scope.checkcaught != 'yes'){
	    		$scope.checkedDatas.push(goodsdata);
    	}
    }

    /*선택된 상품들을 등록리스트에 저장 --> 이중 $scope*/
    $scope.checkdataSave=function(){
    	console.log($scope.goodsaddlists);
		if($scope.goodsaddlists.length > 0){
			var check = 'N';
			for(var j=0; j < $scope.goodsaddlists.length; j++){
				for(var o=0; o < $scope.checkedDatas.length; o++){
					if($scope.goodsaddlists[j].code == $scope.checkedDatas[o].G_Code){
						var check = 'Y';
						$scope.checkedDatas.splice(o, 1);
						break;
					}
				}
			}
			if(check == 'Y'){
				$ionicPopup.alert({
					title : '경고',
				    template: '몇 개의 상품이 중복되었습니다<br> <b>* 중복된 상품은 추가되지 않습니다.</b>'
				});
			}
		}
		for(var i=0; i < $scope.checkedDatas.length; i++){
			if($rootScope.distinction == 'meaip'){
				var d = $scope.setupData.basic_Dn_Meaip;
			}else{
				var d = $scope.setupData.basic_Dn_Sale;
			}

			if(d == '0' && $scope.datas.GerCode != 0){
				MiuService.com_Dn($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.checkedDatas[i].G_Code, $scope.datas.GerCode,i,$scope.bar)
				  .then(function(data){
						if(data.data.list[0].G_Discount_Or_Up == undefined || data.data.list[0].G_Discount_Or_Up != 'D' && data.data.list[0].G_Discount_Or_Up != 'U'){
							var price = data.data.list[0].G_Dn0;
						}else{
							if(data.data.list[0].G_Discount_Or_Up == 'D'){ // 할인
								var yulsik = parseInt(data.data.list[0].G_Discount_Yul) * 0.01;
								var yul = parseInt(data.data.list[0].G_Dn0) * yulsik;
								var price = parseInt(data.data.list[0].G_Dn0) - parseInt(yul);
							}else{ // 할증
								var yulsik = parseInt(data.data.list[0].G_Discount_Yul) * 0.01;
								var yul = parseInt(data.data.list[0].G_Dn0) * yulsik;
								var price = parseInt(data.data.list[0].G_Dn0) + parseInt(yul);
							}
						}
						$scope.test1(price,data.i,data.bar);
				})

			}else{
				switch(d){
					case '0': console.log('거래처별 단가'); var price = $scope.checkedDatas[i].G_Dn3; break;
		    		case '1': console.log('매입가&매출가'); var price = $scope.checkedDatas[i].G_Dn1; break;
		    		case '2': console.log('도매가'); var price = $scope.checkedDatas[i].G_Dn2; break;
		    		case '3': console.log('인터넷가'); var price = $scope.checkedDatas[i].G_Dn3; break;
		    		case '4': console.log('소매가'); var price = $scope.checkedDatas[i].G_Dn4; break;
		    		case '5': console.log('권장소비자가'); var price = $scope.checkedDatas[i].G_Dn5; break;

		    		default : console.log('설정안되있습니다.'); break;
		    	}

		    	if($scope.bar == 'Y'){
		    		$scope.bargoods = {
		    			num : 1
		    		}
		    		$ionicPopup.show({
					    template: '<input type="number" ng-model="bargoods.num" style="text-align:right">',
					    title: '('+ $scope.checkedDatas[0].G_Code +')<br>' + $scope.checkedDatas[0].G_Name,
					    subTitle: '수량을 입력해주세요.',
					    scope: $scope,
					    buttons: [
						           { text: '확인',
						            onTap: function(e){
						            	if($scope.bargoods.num != 0){
						            		$scope.goodsaddlists.push({
												name : $scope.checkedDatas[0].G_Name,
												num : parseInt($scope.bargoods.num),
												goodsprice : parseInt(price),
												code : $scope.checkedDatas[0].G_Code
											});
											$scope.checkedDatas.splice(0, $scope.checkedDatas.length);
											$scope.bar = 'N';
						            	}else{
						            		alert('0개는 등록 할 수 없습니다. 다시 시도해주세요.');
						            	}

						            }},
						         ]
					  });
		    	}else{
		    		if($rootScope.iu == 'i'){
		    			$scope.goodsaddlists.push({
							name : $scope.checkedDatas[i].G_Name,
							num : 1,
							goodsprice : parseInt(price),
							code : $scope.checkedDatas[i].G_Code
						});
		    		}else{
		    			$scope.goodsaddlists.push({
							name : $scope.checkedDatas[i].G_Name,
							num : 1,
							goodsprice : parseInt(price),
							code : $scope.checkedDatas[i].G_Code,
							goods_seq : parseInt($scope.pay.goods_seq_end) + 1,
							state : 'i'
						});
						$scope.pay.goods_seq_end = parseInt($scope.pay.goods_seq_end) + 1;
		    		}

		    	}

			}
		}

		$scope.test1 = function(price,i,bar){
			if(bar == 'Y'){
	    		$scope.bargoods = {
	    			num : 1
	    		}
	    		$ionicPopup.show({
				    template: '<input type="number" ng-model="bargoods.num" style="text-align:right">',
				    title: '('+ $scope.checkedDatas[0].G_Code +')<br>' + $scope.checkedDatas[0].G_Name,
				    subTitle: '수량을 입력해주세요.',
				    scope: $scope,
				    buttons: [
					           { text: '확인',
					            onTap: function(e){
					            	if($scope.bargoods.num != 0){
					            		$scope.goodsaddlists.push({
											name : $scope.checkedDatas[0].G_Name,
											num : parseInt($scope.bargoods.num),
											goodsprice : parseInt(price),
											code : $scope.checkedDatas[0].G_Code
										});
										$scope.checkedDatas.splice(0, $scope.checkedDatas.length);
										$scope.bar = 'N';
					            	}else{
					            		alert('0개는 등록 할 수 없습니다. 다시 시도해주세요.');
					            	}
					            }},
					         ]
				  });
	    	}else{
	    		if($rootScope.iu == 'i'){
	    			$scope.goodsaddlists.push({
						name : $scope.checkedDatas[i].G_Name,
						num : 1,
						goodsprice : parseInt(price),
						code : $scope.checkedDatas[i].G_Code
					});
	    		}else{
	    			$scope.goodsaddlists.push({
						name : $scope.checkedDatas[i].G_Name,
						num : 1,
						goodsprice : parseInt(price),
						code : $scope.checkedDatas[i].G_Code,
						goods_seq : parseInt($scope.pay.goods_seq_end) + 1,
						state : 'i'
					});
					$scope.pay.goods_seq_end = parseInt($scope.pay.goods_seq_end) + 1;
	    		}

	    	}
		}

	    $scope.bar = 'N';
	    $scope.user.userGoodsName = '';
	    $scope.clear_goods();
	    $scope.goodsmodal.hide(); //goods_seq : data.list[i].Seq
	}

    /*상품조회모달 닫기*/
    $scope.goods_searchM_close = function(){
    	$scope.checkedDatas.splice(0,$scope.checkedDatas.length);
    	$scope.clear_goods();
    	$scope.goodsmodal.hide();
    }

     /*바코드 스캔하기*/
	$scope.scanBarcode = function() {
		if($scope.checkedDatas.length != 0){
			$scope.checkedDatas.splice(0, $scope.checkedDatas.length);
		}
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			if ($ionicHistory.backView()&&imageData.text=='') {
				console.log('뒤로가기');
			}else{
	            MiuService.barcode($scope.loginData.Admin_Code, $scope.loginData.UserId, imageData.text)
				.then(function(data){
					if(data == undefined){
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('일치하는 데이터가 없습니다.', 'short', 'center');
						else alert('일치하는 데이터가 없습니다.');
					}else{
						for(var b=0; b < data.list.length; b++){
							$scope.checkedDatas.push(data.list[b]);
							$scope.bar = 'Y';
						}
						$scope.checkdataSave();
					}
				})
			}
        }, function(error) {
            console.log("An error happened -> " + error);
        });

   	}
$scope.goods_seqlist = [];
    /* 해당 상품리스트항목 삭제 */
     $scope.goodsDelete=function(index){
     	if($rootScope.iu == 'u' && $scope.goodsaddlists[index].state == 'u'){
     		$scope.pay.goods_del = 'Y';
     		$scope.goods_seqlist.push({
     			seq : $scope.goodsaddlists[index].goods_seq
     		});
     		// $scope.goods_seq[index]
     	}
        $scope.goodsaddlists.splice(index,1);
     }

     /*상품 종합 합계 가격 구하기*/
    $scope.goods_totalprice1=function(){
     	$scope.datas.totalsumprices = 0;
     	for(var count=0;count<$scope.goodsaddlists.length;count++){
     		var sum = parseInt($scope.goodsaddlists[count].goodsprice) * parseInt($scope.goodsaddlists[count].num);
     		$scope.datas.totalsumprices = $scope.datas.totalsumprices + sum;
     	}
    };

	/*자동슬라이드업*/
	$scope.checkup=function(){
		if($scope.datas.subulkind != 0){// 수불구분
			$scope.m_check.subulCheck = 't';
		}

		if($rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui'){ // 세금계산서와 연계배송정보 존재 시 수정 => 창고와 매장만 수정가능
			$scope.basic2type=false;
    		$scope.upAnddown2="ion-arrow-up-b";
    		$scope.basictype= true;
    		$scope.upAnddown="ion-arrow-down-b";
		}else{
			if($scope.m_check.cusCheck == 't' && $scope.m_check.subulCheck == 't' && $scope.m_check.meajangCheck == 't' && $scope.m_check.changoCheck == 't'){
	        	/*상품폼 열기*/
	        	$scope.basic2type=true;
	    		$scope.upAnddown2="ion-arrow-down-b";
	    		/*매입폼닫기*/
	    		$scope.basictype= false;
	    		$scope.upAnddown="ion-arrow-up-b";
	        }
		}
    }


    /* ij modal */
    $ionicModal.fromTemplateUrl('meaipchul/meaipchul_ij.html', {
    	scope: $scope
    	}).then(function(modal) {
    	$scope.ijmodal = modal;
    });

    $scope.ijmodal_function = function(){
    	if($scope.datas.GerCode == 0 || $scope.datas.subulkind == 0 || $scope.goodsaddlists.length == 0){ // 거래처명 선택 x && 상품선택 x
    		if($scope.datas.GerCode == 0){
    			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처를 선택해주세요.', 'short', 'center');
				else alert('거래처를 선택해주세요.');
    			$scope.basictype=true;
				$scope.basic2type=false;
				$scope.basic3type=false;
				$scope.upAnddown="ion-arrow-down-b";
				$scope.upAnddown2="ion-arrow-up-b";
				$scope.upAnddown3="ion-arrow-up-b";

    		}else if($scope.datas.subulkind == 0){
    			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수불구분을 지정하지 않었습니다.', 'short', 'center');
				else alert('수불구분을 지정하지 않었습니다.');
    			$scope.basictype=true;
				$scope.basic2type=false;
				$scope.basic3type=false;
				$scope.upAnddown="ion-arrow-down-b";
				$scope.upAnddown2="ion-arrow-up-b";
				$scope.upAnddown3="ion-arrow-up-b";

    		}else{
    			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품정보가 존재하지 않습니다. 한번더 확인하세요.', 'short', 'center');
				else alert('상품정보가 존재하지 않습니다. 한번더 확인하세요.');
    			$scope.basictype=false;
				$scope.basic2type=true;
				$scope.basic3type=false;
				$scope.upAnddown="ion-arrow-up-b";
				$scope.upAnddown2="ion-arrow-down-b";
				$scope.upAnddown3="ion-arrow-up-b";

    		}
    	}else{
    		$scope.totalnum = 0;
	    	for(var i =0; i < $scope.goodsaddlists.length; i++){
	    		$scope.totalnum = parseInt($scope.totalnum) + parseInt($scope.goodsaddlists[i].num);

	    		if($scope.goodsaddlists[i].num == 0){
	    			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('0개의 상품은 등록할 수 없습니다.', 'short', 'center');
					else alert('0개의 상품은 등록할 수 없습니다.');
	    			$scope.basictype=false;
					$scope.basic2type=true;
					$scope.basic3type=false;
					$scope.upAnddown="ion-arrow-up-b";
					$scope.upAnddown2="ion-arrow-down-b";
					$scope.upAnddown3="ion-arrow-up-b";
	    			break;
	    		}else if(isNaN($scope.datas.totalsumprices) || $scope.goodsaddlists[i].num == null || $scope.goodsaddlists[i].num == undefined){ //상품가격이 제대로 입력되지 않았을시. -->isNaN == NaN걸러주는거
	    			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품정보를 바르게 적어주세요.', 'short', 'center');
					else alert('상품정보를 바르게 적어주세요.');
	    			$scope.basictype=false;
					$scope.basic2type=true;
					$scope.basic3type=false;
					$scope.upAnddown="ion-arrow-up-b";
					$scope.upAnddown2="ion-arrow-down-b";
					$scope.upAnddown3="ion-arrow-up-b";
	    			break;
	    		}else if(i == $scope.goodsaddlists.length-1 && $scope.goodsaddlists[i].goodsprice != null || i == $scope.goodsaddlists.length-1 && $scope.goodsaddlists[i].goodsprice != undefined){
	    			$scope.ijmodal.show();
	    		}
	    	}
    	}
    }

    $scope.paydelete = function(){
    	console.log('지급전표 삭제', $scope.pay.acno);
    	console.log('?',$scope.pay.gubun);
    	$ionicPopup.show({
	       title: '경고',
	       subTitle: '',
	       content: '지급전표를 삭제합니다.',
	       buttons: [
		       { text: 'No',
		       	onTap: function(e){
		       }},
		       {
		       text: 'Yes',
		       type: 'button-positive',
		       onTap: function(e) {
				$scope.pay.gubun = 4;
				$scope.pay.paycardbank = 'no';
			    	for(var i = 0; i<4; i++){
			    		$scope.payment[i].checked = false;
			    	}
			    	$scope.pay.use = true;
			    	$scope.pay.payprice =  0;
			}},
	]})

    }

    $scope.Payments_division=function(index){
    	/*지급액 활성화/비활성화*/
    	if($scope.payment[index].checked == true){
			$scope.pay.use = false;
		}else{
			$scope.pay.use = true;
		}

    	for(var i = 0; i < $scope.payment.length; i++){
			if(i != index){
				$scope.payment[i].checked = false;
			}
  		}

  		if(index == 1 && $scope.payment[index].checked == true || index == 3 && $scope.payment[index].checked == true){
  			$scope.pay.gubun = index;
  			$scope.paycardbank.splice(0,$scope.paycardbank.length);
  			$scope.paytype = true;
  			MiuService.ij_data($scope.loginData.Admin_Code, $scope.loginData.UserId, index)
			.then(function(data){
				if(index == 1){
					$scope.payname = '지급은행';
					if($scope.pay.paycardbank.length<3) $scope.pay.paycardbank = 'no';
					for(var i=0; i < data.list.length; i++){
						$scope.paycardbank.push({
							num : data.list[i].Bank_Account,
							name : data.list[i].Bank_Name,
							code : data.list[i].Bank_Code
						});
					}
				}else{
					$scope.payname = '지급카드';
					if($scope.pay.paycardbank.length<3) $scope.pay.paycardbank = 'no';
					for(var i=0; i < data.list.length; i++){
						$scope.paycardbank.push({
							num : data.list[i].Card_Num,
							name : data.list[i].Card_Name,
							code : data.list[i].Card_Code
						});
					}
				}

				console.log($scope.paycardbank[0].name);
  			})
  		}else{
  			$scope.pay.gubun = 0;
  			$scope.paytype = false;
  			$scope.pay.paycardbank = 'no';
  			for(var i=0; i<2; i++){
				$scope.paylist.push({
	    			code : '',
	    			name : '',
	    			num : 0
	    		});
			}
  		}
    }

    $scope.payinsert = function(){
    	if($scope.paylist.length > 0){
    		$scope.paylist.splice(0,2);
    	}
		$scope.pay_datas = $scope.pay.paycardbank.split(',');
    	if($scope.payment[1].checked == true){ // 은행
    		$scope.paylist.push({
    			code :  $scope.pay_datas[0],
    			name :  $scope.pay_datas[1],
    			num :  $scope.pay_datas[2]
    		});
    		$scope.paylist.push({
    			code : '',
    			name : '',
    			num : 0
    		});
    	}else{ //카드
    		$scope.paylist.push({
    			code : '',
    			name : '',
    			num : 0
    		});
    		$scope.paylist.push({
    			code :  $scope.pay_datas[0],
    			name :  $scope.pay_datas[1],
    			num :  $scope.pay_datas[2]
    		});
    	}
    }

    $scope.ijmodalCancel = function(){
    	$scope.ijmodal.hide();
    }


    $scope.insertGoodsF=function(){
    	console.log('$scope.pay.paycardbank',$scope.pay);
    	if($scope.pay.use == false && $scope.pay.payprice == 0){
    		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('지급액을 확인해주세요.', 'short', 'center');
			else alert('지급액을 확인해주세요.');
    	}else if($scope.payment[3].checked == true && $scope.pay.paycardbank == 'no' || $scope.payment[1].checked == true && $scope.pay.paycardbank == 'no'){
    			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('카드/통장을 선택해주세요.', 'short', 'center');
				else alert('카드/통장을 선택해주세요.');
    	}else{
	    	if($scope.payment[0].checked != true && $scope.payment[1].checked != true && $scope.payment[2].checked != true && $scope.payment[3].checked != true){
	    		$scope.pay.gubun = 4;
	    	}
	    	$ionicPopup.show({
		         title: '전표를 저장하시겠습니까?',
		         content: '',
		         buttons: [
		           { text: 'No',
		            onTap: function(e){
		            	console.log('no');
		            }},
		           {
		             text: 'Yes',
		             type: 'button-positive',
		             onTap: function(e) {
		                  console.log('yes');
		                  $ionicHistory.clearCache();
						  $ionicHistory.clearHistory();
		                  if($rootScope.iu == 'i'){
		                  	MiuService.i_data($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.pay, $scope.paylist, $scope.date, $scope.goodsaddlists,$scope.setupData,$scope.datas)
							  .then(function(data){
							  	$ionicPopup.show({
								         title: '전표가 저장되었습니다. <br> 확인하시겠습니까?',
								         content: '',
								         buttons: [
								           { text: 'No',
								            onTap: function(e){
								            	$scope.ijmodal.hide();
								            	if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
								            		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
										    		$state.go('app.meaip_page', {}, {location:'replace'});
										    	}else{ /* 매출일 경우 */
										    		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
										    		$state.go('app.meachul_page', {}, {location:'replace'});
										    	}
								            }},
								           {
								             text: 'Yes',
								             type: 'button-positive',
								             onTap: function(e) {
									                  	$scope.ijmodal.hide();
									            		if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
									            			$rootScope.m_no = data.list[0].iL_No;
												    		$state.go('app.meaip_depage', {}, {location:'replace'});
												    	}else{ /* 매출일 경우 */
												    		$rootScope.m_no = data.list[0].SL_No;
												    		$state.go('app.meachul_depage', {}, {location:'replace'});
												    	}

								                  	}
								           },
								         ]
							        })
							  })
		                  }else{
		                  	if($rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui') $rootScope.iu = 'u';
		                  	if($scope.pay.gubun == 4 && $scope.pay.delete == false){
		                  		MiuService.pay_delete($scope.loginData.Admin_Code, $scope.loginData.UserId,$scope.pay.acno)
		                  		.then(function(data){
		                  			console.log('삭제잘됨?', data);
		                  		});
		                  	}

		                    MiuService.u_data($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.pay, $scope.paylist, $scope.date, $scope.goodsaddlists,$scope.setupData,$scope.datas,$scope.goods_seqlist)
							  .then(function(data){
							  		$ionicPopup.alert({
								     title: '',
								     template: '전표가 수정되었습니다.'
								   });
							  		$scope.ijmodal.hide();
									$ionicHistory.clearCache();
									$ionicHistory.clearHistory();
									if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
										$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
							    		$state.go('app.meaip_page', {}, {location:'replace'});
							    	}else{ /* 매출일 경우 */
							    		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
							    		$state.go('app.meachul_page', {}, {location:'replace'});
							    	}
							  })
		                  	if($scope.pay.goods_del == 'Y'){
		                  		for(var i = 0; i < $scope.goods_seqlist.length; i++){
		                  			var seq = $scope.goods_seqlist[i].seq;
		                  			MiuService.seq_del($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.pay.no, seq)
									  .then(function(data){

									})
		                  		}
		                  		$scope.pay.goods_del = 'N';
		                  	}
		                  }
		             }
		           },
		         ]
	        })
		}

    }

    /*뒤로 제어*/
     $scope.backControll=function(){
      $ionicPopup.show({
         title: '경고',
         subTitle: '',
         content: '작성중인 내용이 지워집니다.<br> 계속진행하시겠습니까?',
         buttons: [
           { text: 'No',
            onTap: function(e){
            }},
           {
             text: 'Yes',
             type: 'button-positive',
             onTap: function(e) {
                if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
                	$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true}); // ------------------이소스 다음에 띄워질 페이지는 루트페이지(더이상 뒤로갈 곳이없음) 이다.
				    $state.go('app.meaip_page', {}, {location:'replace'});
				}else{ /* 매출일 경우 */
					$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
				    $state.go('app.meachul_page', {}, {location:'replace'});

				}

             }
           },
         ]
        })
     }

});

//////////////////////////////////////////////////매입&매출 통합 다시 (끝) /////////////////////////////////////////////////////////////////////
