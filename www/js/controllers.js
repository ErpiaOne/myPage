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
.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicHistory, $cordovaToast, $ionicLoading, $cordovaDevice, $location, loginService, CertifyService, pushInfoService, uuidService, IndexService, tradeDetailService, ActsService, ERPiaAPI, $localstorage, $cordovaInAppBrowser, $ionicPlatform, alarmService, VersionCKService, $ionicPopup, app, $filter, SCMService, PrivService, $cordovaSocialSharing, $ionicSideMenuDelegate){
	
	$rootScope.autologin_index = 0;
	$rootScope.PushData = {};
	/* 인앱브라우져(사이트띄우는거) 기본설정  - 김형석[2016-05] */
	var browseroptions = {
		location: 'yes',
		clearcache: 'yes',
		toolbar: 'yes'  //위에 주소 툴바 나오게 yes
	};
	/* 탭부분 선택 여부 체크하여 구분 css - 이경민[2016-05] */
	$rootScope.tabitem = {
		gubun: 'loginout',		 // erpia로그인시 탭 - show면 보여주고 hidden이면 안보여줌 [이경민]
		tab1: 'tab-item active',
		tab2: 'tab-item',
		tab3: 'tab-item',
		tab4: 'tab-item',
		tab5: 'tab-item'
	}
	$ionicSideMenuDelegate.canDragContent(true);
	$scope.sidetab= function(tabgubun){
		switch (tabgubun) {
			case 'tab1' :
				$rootScope.tabitem.tab1 = 'tab-item active';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item';
				$rootScope.tabitem.tab5 = 'tab-item';
				break;
			case 'tab2' :
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item active';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item';
				$rootScope.tabitem.tab5 = 'tab-item';
				break;
			case 'tab3' :
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item active';
				$rootScope.tabitem.tab4 = 'tab-item';
				$rootScope.tabitem.tab5 = 'tab-item';
				break;
			case 'tab4' :
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item active';
				$rootScope.tabitem.tab5 = 'tab-item';
				break;
			case 'tab5' :
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item';
				$rootScope.tabitem.tab5 = 'tab-item active';
				break;
		}
	}

	$scope.useYN_Check = function(gubun){
		switch (gubun){
			case 1 : console.log('매입'); 
				if($rootScope.priv_meaip.useYN == '1' &&  $rootScope.priv_meaip.master_useYN != 'N'){
					$rootScope.goto_with_clearHistory("#app/meaip_page"); $scope.sidetab("tab2");
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('접근 권한이 없습니다.', 'long', 'center');
					else console.log('접근 권한이 없습니다.');
				}
				break;
			case 2 : console.log('매출'); 
				if($rootScope.priv_meachul.useYN == '1' &&  $rootScope.priv_meachul.master_useYN != 'N'){
					$rootScope.goto_with_clearHistory("#app/meachul_page"); $scope.sidetab("tab3");
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('접근 권한이 없습니다.', 'long', 'center');
					else console.log('접근 권한이 없습니다.');
				}
				break;
		}
	}

	/* 재고관리 - 이경민[2016-05] */
	$scope.jego = function(){
		if($rootScope.priv_jego.jego_YN == 'Y' && $rootScope.priv_jego.jego == 'Y'){
			$scope.loadingani();
			$rootScope.goto_with_clearHistory("#app/jegoMain"); $scope.sidetab("tab4");
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('권한이 없습니다.', 'long', 'center');
			else console.log('권한이 없습니다.');
		}
	}

	/* 버전관리 - 김형석[2016-01] */
	$rootScope.version={
   		Android_version : '1.1.2',
   		IOS_version : '1.0.2'	//업데이트시 필수로 변경!!
   	};

   	/* 로딩화면 - 김형석[2015-12] */
	$rootScope.loadingani=function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		$timeout(function(){
		$ionicLoading.hide();
	      }, 500);
	}
	$scope.logindata2 = {};

	$rootScope.loginState = "R"; 	// R: READY, E: ERPIA LOGIN TRUE, S: SCM LOGIN TRUE
	$rootScope.deviceInfo = {};  		// Device 정보를 담아두는 변수
	$scope.ion_login = "ion-power active";  // 로그인/로그아웃 시 변경되는 CSS

	/* 각각의 변수를 담아두는 공간. 초기화를 쉽게 하기 위해 만들었음 - 김형석[2016-01] */
	$rootScope.loginData = {};
	$rootScope.userData = {};
	$scope.SMSData = {};

	/* 동의화면 체크박스 초기화값 설정 -> 체크안되있게 - 이경민[2016-01] */
	$scope.agree_1 = {
		checked : false
	}
	$scope.agree_2 = {
		checked : false
	}

	$ionicPlatform.ready();

	/* 이용약관 모달창 - 김형석[2016-01] */
	$ionicModal.fromTemplateUrl('side/agreement.html',{
		scope : $scope
	}).then(function(modal){
		$scope.agreeModal = modal;
		$scope.agreeModal.hardwareBackButtonClose = false;
	});

	/* 인증 모달창 - 김형석[2016-01] */
	$ionicModal.fromTemplateUrl('side/certification.html',{
		scope : $scope
	}).then(function(modal){
		$scope.certificationModal = modal;
		$scope.certificationModal.hardwareBackButtonClose = false;
	});

	/* 거래명세표 조회시 뜨는 모달창 - 이경민[2016-01] */
	$ionicModal.fromTemplateUrl('side/check_Sano.html',{
		scope : $scope
	}).then(function(modal){
		$scope.check_sano_Modal = modal;
	});



	/* 로그인 설명 - 김형석[2016-01] */
	$scope.loginhelper = function(){
		 $ionicPopup.alert({
		         title: '<b>로그인도움말</b>',
		         subTitle: '',
		         content: '1.[ERPia]<br> ERPia 고객사 접속 경로입니다.<br><br>2.[SCM]<br> ERPia의 Web SCM 사용 거래처 접속 경로입니다.<br><br>3.[거래명세서]<br> ERPia 고객사의 거래처 접속 경로입니다.<br><br>4.[체험하기]<br> 모바일 ERPia를 체험해볼 수 있습니다.'
		 })
	}

	/* 푸쉬 태그 언태그부분 - 김형석[2016-04-15] */
	$scope.pushYNcheck=function(){
		if(ERPiaAPI.toast == 'Y'){
			window.plugins.OneSignal.init("881eee43-1f8a-4f60-9595-15b9aa7056b2", {googleProjectNumber: "832821752106", autoRegister: true}, app.didReceiveRemoteNotificationCallBack); 	//푸쉬 선언
		}
		var cntList = 6;
		alarmService.select('select_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $rootScope.deviceInfo.uuid)
		.then(function(data){
			if(data != '<!--Parameter Check-->'){
				$scope.settingsList = data.list;
				var cntList = data.list.length;
				for(var i=1; i<cntList; i++){
					switch(data.list[i].idx){
						case 1:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '공지사항';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key1", "1");
								else window.plugins.OneSignal.deleteTags(["key1"]);
							}
							break;
						case 2:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '업데이트 현황';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key2", "2");
								else window.plugins.OneSignal.deleteTags(["key2"]);
							}
							break;
						case 3:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '지식 나눔방';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key3", "3");
								else window.plugins.OneSignal.deleteTags(["key3"]);
							}
							break;
						case 4:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key4", "4");
								else window.plugins.OneSignal.deleteTags(["key4"]);
							}
							data.list[i].name = '업체문의 Q&A(답변)';
							break;
						case 5:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '거래명세서 도착';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key5", "5");
								else window.plugins.OneSignal.deleteTags(["key5"]);
							}
							break;
						case 6:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '기타 이벤트';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key6", "6");
								else window.plugins.OneSignal.deleteTags(["key6"]);
							}
							break;
					}
				}
			}else{
				var rsltList = '0^T^|1^T^|2^T^|3^T^|4^T^|5^T^|6^T^|';
				var results = rsltList.match(/\^T\^/g);
				alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList, $rootScope.deviceInfo.uuid);
				$scope.fnAlarm('checkAll');
				if(ERPiaAPI.toast == 'Y'){
					window.plugins.OneSignal.sendTags({key1: "1", key2: "2", key3: "3", key4: "4", key5: "5", key6: "6"});
				}
			}
		});
	}

	/* 초기화 함수 - 김형석[2015-12] */
	$scope.init = function(loginType){
		if(ERPiaAPI.toast == 'Y'){
			window.plugins.OneSignal.init("881eee43-1f8a-4f60-9595-15b9aa7056b2", {googleProjectNumber: "832821752106", autoRegister: true}, app.didReceiveRemoteNotificationCallBack); 	//푸쉬 선언
		}
		if(loginType == 'logout') {
			if(ERPiaAPI.toast == 'Y'){
				window.plugins.OneSignal.deleteTags(["key1", "key2", "key3", "key4", "key5", "key6"]);
			}
			console.log("로그아웃")
			$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
			$rootScope.loginState = "R";
			$rootScope.loginHTML = "로그인";
			$scope.ion_login = "ion-power active";
			$scope.icon_home = "";
			$rootScope.userType = "";
			$rootScope.autoLoginYN = "N";
			$rootScope.tabitem.gubun = 'loginout';
			$rootScope.loginMenu = "selectUser";
			$rootScope.sideMenuHide = 'true';
			$rootScope.autologin_index = 0;
			$localstorage.set("autoLoginYN", $rootScope.autoLoginYN);

			$timeout(function(){
				$ionicLoading.hide();
				$rootScope.loginData = {};
				$rootScope.userData = {};
				$scope.dashBoard = {};
				$rootScope.goto_with_clearHistory('#/app/login');
				$scope.login();
			}, 1000);
		}else{
			$scope.icon_home = "ion-home";
			$timeout(function(){
				$ionicLoading.hide();
				$rootScope.loginData = {};
				$rootScope.userData = {};
				$scope.dashBoard = {};
			}, 1000);
		}
	}

	/* 푸쉬유저체크 - 없으면 insert - 김형석[2016-01] */
	$scope.pushUserCheck = function() {
		var PushInsertCheck = '';
		var PushInsertCheck2 = "";
		pushInfoService.pushInfo($scope.loginData.Admin_Code, $scope.loginData.UserId, 'Mobile_Push_Token', 'SELECT', $rootScope.UserKey, $rootScope.token, '', '', '', '')
		.then(function(pushInfo){
			if(pushInfo.data.list.length != 0){
				PushInsertCheck = pushInfo.data.list[0].token;
			}
			if(PushInsertCheck == $rootScope.token){
				PushInsertCheck2 = "duplication";
			}else{
				PushInsertCheck2 = "NewToken";
				if(PushInsertCheck2 == "NewToken"){
					$scope.pushUserRegist();
				};
			}
		},function(){
			alert('pushUserCheck fail')
		});
	};

	$scope.pushUserRegist = function() {
		pushInfoService.pushInfo($scope.loginData.Admin_Code, $scope.loginData.UserId, 'Mobile_Push_Token', 'SAVE', $rootScope.UserKey, $rootScope.token, $rootScope.loginState, 'A', '', '')
		.then(function(pushInfo){
		},function(){
		/*alert('pushUserRegist fail')*/
		});
	};
	/* // 푸쉬유저체크 - 없으면 insert 끝 */

	/* 로그인창 닫기 함수 - 김형석[2016-01] */
	$scope.closeLogin = function() {
		if(ERPiaAPI.toast == 'Y'){
			window.plugins.OneSignal.init("881eee43-1f8a-4f60-9595-15b9aa7056b2", {googleProjectNumber: "832821752106", autoRegister: true}, app.didReceiveRemoteNotificationCallBack); 	//푸쉬 선언
			window.plugins.OneSignal.sendTags({"mac": $rootScope.deviceInfo.uuid});
		}
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		if($rootScope.mobile_Certify_YN == 'Y'){	 	// 모바일 아이디 인증이 되어있다면!!  각자 LOGIN TYPE에 맞는 메인으로 이동
			if($rootScope.loginState == "S"){
		           	$state.go("app.erpia_scmhome");
		           	$rootScope.tabitem.gubun = 'snlogin';
			}else if($rootScope.loginState == "E"){
				$rootScope.tabitem.gubun = 'elogin';
				$rootScope.tabitem.tab1 = 'tab-item active';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item';
				$rootScope.tabitem.tab5 = 'tab-item';
		     		$state.go("app.slidingtab");
			}else if($rootScope.loginState == 'N'){
				$rootScope.tabitem.gubun = 'snlogin';
				$state.go("app.erpia_introduce");
			}
		$rootScope.sideMenuHide = 'false';
		}else if($rootScope.loginState != "R") {	 	// logintype이 "R"(Ready) 이 아니라면 인증동의 창이 띄워지도록한다.
			$scope.agree_1.checked = false;
			$scope.agree_2.checked = false;
			$scope.SMSData.rspnText = '';
			$scope.agreeModal.show();
		}
		$scope.pushUserCheck();
	};



	$scope.gohomepage = function() {
		$cordovaInAppBrowser.open('http://www.erpia.net', '_blank', browseroptions)
		.then(function(event) {
		// success
		}).catch(function(event) {
		// error
		});
	}

	/* 로그인 체크박스 - 김형석[2016-04-13~2016-04-20] */
	$scope.loginckbox={
		AdminCodeCK : false,
		UserIdCK : false,
		PwdCK : false
	};
	$rootScope.loginMenu = "selectUser";	//사용자 선택화면


	/*  로그인페이지 실행시 실행되는 펑션( *LOGIN모드에 따라 기존에 체크로 저장했던 정보를 불러와서 뿌려줌) */
	$scope.login = function() {
		$scope.logindata2.EAdminCode = $filter('lowercase')($localstorage.get("EAdminCode"));
		$scope.logindata2.EUserId = 	$filter('lowercase')($localstorage.get("EUserId"));
		$scope.logindata2.EPwd = $localstorage.get("EPwd")
		$scope.logindata2.SAdminCode = $filter('lowercase')($localstorage.get("SAdminCode"));
		$scope.logindata2.SUserId = $filter('lowercase')($localstorage.get("SUserId"));
		$scope.logindata2.SPwd = $localstorage.get("SPwd")
		$scope.logindata2.NAdminCode = $filter('lowercase')($localstorage.get("NAdminCode"));
		$scope.logindata2.NUserId = $filter('lowercase')($localstorage.get("NUserId"));
		$scope.logindata2.NPwd = $localstorage.get("NPwd");

		$rootScope.loginMenu = 'selectUser';
		if($rootScope.loginState == 'R'){
			$scope.init('login');
			$rootScope.goto_with_clearHistory('#/app/login');
			if($rootScope.userType == "" || $rootScope.userType == undefined){
				$scope.selectType("ERPia");
			}else{
				$scope.selectType($rootScope.userType);
			}
		}else{
			$scope.footer_menu = 'G';
			$scope.init('logout');
		}
	};

	/* 로그인모드선택 - 김형석[2016-01] */
	$scope.selectType = function(userType){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		$timeout(function(){
		if(userType == 'ERPia'){
			$rootScope.loginMenu = "selectUser";
			$rootScope.userType = 'ERPia';
			$scope.footer_menu = 'U';
			if($localstorage.get("EAdminCode") == '' || $localstorage.get("EAdminCode") == undefined){
				$scope.loginckbox.AdminCodeCK = false;
			}else{
				$scope.loginckbox.AdminCodeCK = true;
				$rootScope.loginData.Admin_Code = $scope.logindata2.EAdminCode;
			}
			if($localstorage.get("EUserId") == '' || $localstorage.get("EUserId") == undefined){
				$scope.loginckbox.UserIdCK = false;
			}else{
				$scope.loginckbox.UserIdCK = true;
				$rootScope.loginData.UserId = $scope.logindata2.EUserId;
			}
			if($localstorage.get("EPwd") == '' ||  $localstorage.get("EPwd") == undefined){
				$scope.loginckbox.PwdCK = false;
			}else{
				$scope.loginckbox.PwdCK = true;
				$rootScope.loginData.Pwd = $scope.logindata2.EPwd;
			}
//test중 일때만.......................
			// $rootScope.loginData.Admin_Code = '6178600097'; //PC모드
			// $rootScope.loginData.loginType = 'E'; //PC모드
			// $rootScope.loginData.UserId = 'borntoroad';
			// $rootScope.loginData.Pwd = 'erpia!1010';

			$rootScope.loginData.Admin_Code = 'km0421'; //PC모드
			$rootScope.loginData.loginType = 'E'; //PC모드
			$rootScope.loginData.UserId = 'kaming311';
			$rootScope.loginData.Pwd = 'lkmbanana1!';

			// $rootScope.loginData.Admin_Code = 'kpage'; //PC모드
			// $rootScope.loginData.loginType = 'E'; //PC모드
			// $rootScope.loginData.UserId = 'kpage1089';
			// $rootScope.loginData.Pwd = 'erpia!1010';

			// $rootScope.loginData.Admin_Code = 'phj9775'; //PC모드
			// $rootScope.loginData.loginType = 'E'; //PC모드
			// $rootScope.loginData.UserId  = 'phj9775';
			// $rootScope.loginData.Pwd = '1234';
//test중 일때만.......................
		}else if(userType =='SCM'){
			$rootScope.loginMenu = "selectUser";
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
//test중 일때만.......................
			// $rootScope.loginData.Admin_Code = 'phj9775'; //PC모드
			// $rootScope.loginData.loginType = 'S'; //PC모드
			// $rootScope.loginData.UserId = '555';
			// $rootScope.loginData.Pwd = '555';


			// $rootScope.loginData.Admin_Code = '80850'; //PC모드
			// $rootScope.loginData.loginType = 'S'; //PC모드
			// $rootScope.loginData.UserId = '212-20-54825';
			// $rootScope.loginData.Pwd = '54825';
//test중 일때만.......................
		}else if(userType == 'Normal'){
			$rootScope.loginMenu = "selectUser";
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
//test중 일때만.......................
			// $rootScope.loginData.Admin_Code = 'onz'; //PC모드
			// $rootScope.loginData.loginType = 'N'; //PC모드
			// $rootScope.loginData.UserId = 'test1234';
			// $rootScope.loginData.Pwd = 'test1234!';
//test중 일때만.......................
		}else if(userType == 'Guest'){
			$rootScope.loginMenu = "selectUser"; $rootScope.userType = 'Guest'; $scope.footer_menu = 'G';
			$scope.doLogin();
		}else{
			$rootScope.loginMenu = 'selectUser';
		}
		$ionicLoading.hide();
		}, 1000);
	}

	/* 업체코드, 아이디, 패스워드 저장하기 - 김형석[2016-01] */
	/* ADMINCODE 저장체크시 localstorage에 저장  - 김형석[2016-01] */
	$scope.LoginAdminCodeCK=function(userType){
		if($scope.loginckbox.AdminCodeCK == true){
			switch(userType){
				case 'ERPia' : $localstorage.set("EAdminCode", $filter('lowercase')($rootScope.loginData.Admin_Code));break;
				case 'SCM' : $localstorage.set("SAdminCode", $filter('lowercase')($rootScope.loginData.Admin_Code));break;
				case 'Normal' : $localstorage.set("NAdminCode", $filter('lowercase')($rootScope.loginData.Admin_Code)); break;
			}
		}else{
			switch(userType){
				case 'ERPia' : $localstorage.set("EAdminCode", ''); break;
				case 'SCM' : $localstorage.set("SAdminCode", ''); break;
				case 'Normal' : $localstorage.set("NAdminCode", ''); break;
			}
		}
	};

	/* ID 저장체크시 localstorage에 저장  - 김형석[2016-01] */
	$scope.LoginUserIdCK=function(userType){
		if($scope.loginckbox.UserIdCK == true){
			switch(userType){
				case 'ERPia' : $localstorage.set("EUserId", $filter('lowercase')($rootScope.loginData.UserId)); break;
				case 'SCM' : $localstorage.set("SUserId", $filter('lowercase')($rootScope.loginData.UserId)); break;
				case 'Normal' : $localstorage.set("NUserId", $filter('lowercase')($rootScope.loginData.UserId)); break;
			}
		}else{
			switch(userType){
				case 'ERPia' : $localstorage.set("EUserId", ''); break;
				case 'SCM' : $localstorage.set("SUserId", ''); break;
				case 'Normal' : $localstorage.set("NUserId", ''); break;
			}
		}
	};

	/* PWD 저장체크시 localstorage에 저장 - 김형석[2016-01] */
	$scope.LoginPwdCK=function(userType){
		if($scope.loginckbox.PwdCK == true){
			switch(userType){
				case 'ERPia' : $localstorage.set("EPwd", $rootScope.loginData.Pwd); break;
				case 'SCM' : $localstorage.set("SPwd", $rootScope.loginData.Pwd); break;
				case 'Normal' : $localstorage.set("NPwd", $rootScope.loginData.Pwd); break;
			}
		}else{
			switch(userType){
				case 'ERPia' : $localstorage.set("EPwd", ''); break;
				case 'SCM' : $localstorage.set("SPwd", ''); break;
				case 'Normal' : $localstorage.set("NPwd", ''); break;
			}
		}
	};

	/* 로그인 함수 - 김형석[2016-01] */
	$scope.doLogin = function(admin_code, loginType, id, pwd, autologin_YN) {
		if(ERPiaAPI.toast == 'Y'){
			window.plugins.OneSignal.init("881eee43-1f8a-4f60-9595-15b9aa7056b2", {googleProjectNumber: "832821752106", autoRegister: true}, app.didReceiveRemoteNotificationCallBack);
		}else{
			$rootScope.deviceInfo.model  == 'web';
			$rootScope.deviceInfo.platform == 'web';

		}
		admin_code = $filter('lowercase')(admin_code);
		id = $filter('lowercase')(id);
		$ionicSideMenuDelegate.canDragContent(true);
		if (autologin_YN == 'Y') {
			switch(loginType){
				case 'E' : $rootScope.userType = 'ERPia'; $rootScope.loginMenu = 'User'; $scope.footer_menu = 'U'; break;
				case 'S' : $rootScope.userType = 'SCM'; $rootScope.loginMenu = 'User'; $scope.footer_menu = 'U'; break;
				case 'N' : $rootScope.userType = 'Normal'; $rootScope.loginMenu = 'User'; $scope.footer_menu = 'U'; break;
			}
			$rootScope.loginData.Admin_Code = $filter('lowercase')(admin_code);
			$rootScope.loginData.UserId = $filter('lowercase')(id);
			$rootScope.loginData.Pwd = pwd;
		}else{
			switch($rootScope.userType){
				case 'ERPia': userType ='E'; break;
				case 'SCM': userType = 'S'; break;
				case 'Normal': userType = 'N'; break;
			}
			if(ERPiaAPI.toast == 'Y'){		//uuid, admin_code, loginType, id, pwd, autoLogin_YN, UUID, phoneno, DeviceInfo
				$rootScope.loginData.Admin_Code = $filter('lowercase')($scope.loginData.Admin_Code);
				$rootScope.loginData.UserId = $filter('lowercase')($scope.loginData.UserId);
			}else{
				/* 테스트시  */
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

		// 권한설정 function
		$rootScope.priv_meaip = 
		{ 
			id : '' , // 메뉴이름
			master_useYN : '', // 대메뉴권한 사용여부
			useYN : '',  // 소메뉴 사용여부
			de : '', // 삭제권한 
			save : '', // 저장권한
			print : '' // 출력권한
		};

		$rootScope.priv_meachul = 	
		{ 
			id : '' ,
			master_useYN : '',
			useYN : '',
			de : '',
			save : '',
			print : ''
		};

		$rootScope.priv_jego ={ 
			jego_YN : '',
			jego : '' 
		}

		$rootScope.priv_wongaYN = 'Y'; // 원가 비공개 설정여부이기 때문에 Y면 원가 비공개 N이면 원가 공개 - 비공개 디폴트[이경민]
		$rootScope.priv_productYM = 'N' // 상품 조회등록수정 권한이 없을 경우 N -> 상품 상세정보 접근 불가 [이경민]

		/* SCM 로그인 - 김형석[2016-01] */
		if ($rootScope.userType == 'SCM') {
			loginService.comInfo('scm_login', $scope.loginData.Admin_Code, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo.uuid)
			.then(function(comInfo){
				if (comInfo.data.list[0].Result == '1'){
					if(ERPiaAPI.toast == 'Y'){
						window.plugins.OneSignal.sendTag("id", $scope.loginData.UserId);
						window.plugins.OneSignal.sendTag("usertype", "S");
						window.plugins.OneSignal.sendTag("admincode", $scope.loginData.Admin_Code);
						window.plugins.OneSignal.sendTag("gercode", comInfo.data.list[0].G_code);
						window.plugins.OneSignal.sendTag("key7", "7");
					}
					$rootScope.userData.GerName = comInfo.data.list[0].G_Name + '<br>(' + comInfo.data.list[0].G_code + ')';
					$rootScope.userData.G_Code = comInfo.data.list[0].G_code;
					$rootScope.userData.G_Sano = comInfo.data.list[0].Sano;
					$rootScope.userData.GerCode = comInfo.data.list[0].G_code;

					if(comInfo.data.list[0].cntNotRead == null) $rootScope.userData.cntNotRead = 0;
					else $rootScope.userData.cntNotRead = comInfo.data.list[0].cntNotRead;

					$rootScope.loginMenu = 'User';
					$rootScope.loginHTML = "로그아웃";
					$scope.ion_login = "ion-power";
					$rootScope.loginState = "S";
					$rootScope.mobile_Certify_YN = comInfo.data.list[0].mobile_CertifyYN;
					$scope.loginData.isLogin = 'Y';

					if($scope.loginData.chkAutoLogin == true){
						if(ERPiaAPI.toast == 'Y'){
							uuidService.save_Log($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo);
							$scope.loginData.autologin_YN = 'Y';
							$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
							$localstorage.set("autologinType", $rootScope.userType);
							$localstorage.set("autoUser_Id", $scope.loginData.UserId);
							$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
							$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
						}else{
							uuidService.save_Log('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, '', $rootScope.deviceInfo);
						}
					}else{
						if(ERPiaAPI.toast == 'Y'){
							uuidService.save_Log($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo);
							$scope.loginData.autologin_YN = 'N';
							$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
							$localstorage.set("autologinType", $rootScope.userType);
							$localstorage.set("autoUser_Id", $scope.loginData.UserId);
							$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
							$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
						}else{
							uuidService.save_Log('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, '', $rootScope.deviceInfo);
							}
					}
					$timeout(function() {
						$ionicLoading.hide();
						$scope.closeLogin();
						$scope.pushYNcheck();
					}, 1000);
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show(comInfo.data.list[0].Comment, 'long', 'center');
					else alert(comInfo.data.list[0].Comment);
				}
			},function(){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('login error', 'long', 'center');
				else alert('login error');
			});
		}else if ($rootScope.userType == 'ERPia'){
			$scope.dashBoard = {
				M_today : '',
				M_before : ''
			}
			/*금일 / 전일 매출액 조회 - 이경민[2016-05]*/
			IndexService.meachulamt($scope.loginData.Admin_Code)
			.then(function(response){
				$scope.dashBoard.M_today = response.list[0].today;
				$scope.dashBoard.M_before = response.list[0].before;
			})
			/* ERPia 로그인 - 김형석[2016-01] */
			loginService.comInfo('ERPiaLogin', $scope.loginData.Admin_Code, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo.uuid)
			.then(function(comInfo){
				if(comInfo.data.list[0].Result=='1'){
					$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
					$rootScope.loginHTML = "로그아웃";
					$scope.ion_login = "ion-power";
					if(ERPiaAPI.toast == 'Y'){
						window.plugins.OneSignal.sendTag("id", $scope.loginData.UserId);
						window.plugins.OneSignal.sendTag("usertype", "E");
						window.plugins.OneSignal.sendTag("admincode", $scope.loginData.Admin_Code);
						window.plugins.OneSignal.sendTag("gercode", "");
						window.plugins.OneSignal.sendTag("key7", "7");
					}
					$rootScope.userData.Com_Code = comInfo.data.list[0].Com_Code;
					$rootScope.userData.Com_Name = comInfo.data.list[0].Com_Name + '<br>(' + comInfo.data.list[0].Com_Code + ')';
					$rootScope.userData.package = comInfo.data.list[0].Pack_Name;
					$rootScope.userData.cnt_user = comInfo.data.list[0].User_Count + ' 명';
					$rootScope.userData.cnt_site = comInfo.data.list[0].Mall_ID_Count + ' 개';
					$rootScope.mobile_Certify_YN = comInfo.data.list[0].mobile_CertifyYN;

					$scope.loginData.isLogin = 'Y';
					$rootScope.loginMenu = 'User';
					loginService.comInfo('ComInfo_Erpia', $scope.loginData.Admin_Code)
					.then(function(comTax){
						var d= new Date();
						var month = d.getMonth() + 1;
						var day = d.getDate();
						var data = comTax.data;

						Pay_Method = data.list[0].Pay_Method;
						Pay_State = data.list[0].Pay_State;
						Max_Pay_YM = data.list[0].Max_Pay_YM;
						Pay_Ex_Days = parseInt(data.list[0].Pay_Ex_Days); // 당원결재여부?
						Pay_Day = parseInt(data.list[0].Pay_Day);
						Pay_Ex_Date = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
						Last_Pay_YM = data.list[0].Last_Pay_YM;
						Pay_Date = data.list[0].Max_Pay_YM;
						$rootScope.userData.expire_date = Last_Pay_YM; // 사용만료일
						$rootScope.userData.expire_days = Pay_Date; // 월관리비 결제일
						$scope.management_bill = "330,000원	<br><small>(VAT 포함)</small>";
						$scope.sms = "15000 개<br><small>(건당 19원)</small>";
						$scope.tax = "150 개<br><small>(건당 165원)</small>";
						$scope.e_money = "30,000원<br><small>(자동이체 사용중)</small>";
						$scope.every = "10,000 P";

						$rootScope.loginState = "E";

						tradeDetailService.getCntNotRead($scope.loginData.Admin_Code, 'Y', $rootScope.loginState)
						.then(function(response){
								$rootScope.userData.cntNotRead = response.list[0].cntNotRead;

						})

						if($scope.loginData.Pwd != 'erpia!1010'){ // 관리자 로그인일때는 로그를 저장하지 않는다.
							if($scope.loginData.chkAutoLogin == true){
								if(ERPiaAPI.toast == 'Y'){
									if($rootScope.autologin_index == 0){
										uuidService.save_Log($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo);
										$scope.loginData.autologin_YN = 'Y';
										$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
										$localstorage.set("autologinType", $rootScope.userType);
										$localstorage.set("autoUser_Id", $scope.loginData.UserId);
										$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
										$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
										console.log("autosave ", $rootScope.userType, $scope.loginData.UserId);
										$rootScope.autologin_index = 1;
									}else{
										console.log('로그인 로그 저장 NO');
									}
								}else{
									uuidService.save_Log('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, '', $rootScope.deviceInfo);
								}
							}else{
								if(ERPiaAPI.toast == 'Y'){
								uuidService.save_Log($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo);
									$scope.loginData.autologin_YN = 'N';
									$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
									$localstorage.set("autologinType", $rootScope.userType);
									$localstorage.set("autoUser_Id", $scope.loginData.UserId);
									$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
									$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
								}else{
									uuidService.save_Log('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, '' , $rootScope.deviceInfo);
								}
							}
						}else{
							console.log('관리자 로그인');
						}
						

						/* 로그인시 계정아이디 권한 추가 - 이경민[2016-07] */
						PrivService.pricheck($scope.loginData.Admin_Code, $scope.loginData.UserId)
						.then(function(data){
								/* 매입매출권한 */
								$rootScope.priv_meaip.id = data[0].Menu_NM;
								$rootScope.priv_meaip.master_useYN = data[0].Mpriv;
								$rootScope.priv_meaip.useYN = data[0].priv;
								$rootScope.priv_meaip.de = data[0].priv_Delete;
								$rootScope.priv_meaip.save = data[0].priv_Save;
								$rootScope.priv_meaip.print = data[0].priv_Print;
								$rootScope.priv_meachul.id = data[1].Menu_NM;
								$rootScope.priv_meachul.master_useYN = data[1].Mpriv;
								$rootScope.priv_meachul.useYN = data[1].priv;
								$rootScope.priv_meachul.de = data[1].priv_Delete;
								$rootScope.priv_meachul.save = data[1].priv_Save;
								$rootScope.priv_meachul.print = data[1].priv_Print;

								/* 재고권한 */
								$rootScope.priv_jego.jego_YN = data[2].Mpriv;
								if(data[2].priv == '0' && data[3].priv == '0' && data[4].priv == '0'){
									$rootScope.priv_jego.jego = 'N';
								}else{
									$rootScope.priv_jego.jego = 'Y';
								}

								/* 상품정보 권한 */
								if(data[5].Mpriv == 'N' || data[5].Mpriv == 'Y' && data[5].priv == 0 && data[6].priv == 0){
									$rootScope.priv_productYM = 'N';
								}else{
									$rootScope.priv_productYM = 'Y';
								}
						});

						/* 원가 공개 설정 여부 [이경민 - 2016-09-01] */ // Y가 원가 비공개 N이 원가 공개
						PrivService.priv_wonga_Check($scope.loginData.Admin_Code, $scope.loginData.UserId)
						.then(function(data){
								$rootScope.priv_wongaYN = data[0].WonGa;
						});

						/* 재고현황 오픈 기념 */
						PrivService.JegoOpen($scope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.deviceInfo.uuid)
						.then(function(data){
							$rootScope.jegocontroll = parseInt(data[0].rslt2);
							$rootScope.jego_open = parseInt(data[0].rslt);
						});

						$timeout(function() {
							$ionicLoading.hide();
							$scope.closeLogin();
							$scope.pushYNcheck();

						/* 여기가 푸쉬받은 주소 이동할지 말지 결정 - 김형석[2016-01] */
						if($rootScope.PushData.state == "app.erpia_board-Main"){
							$rootScope.boardIndex = $rootScope.PushData.state;
								if($rootScope.PushData.BoardParam == "0"){
									$rootScope.boardIndex = 0;
								}else if($rootScope.PushData.BoardParam == "1"){
									$rootScope.boardIndex = 1;
								}else if($rootScope.PushData.BoardParam == "2"){
									$rootScope.boardIndex = 2;
								}else if($rootScope.PushData.BoardParam == "3"){
									$rootScope.boardIndex = 3;
								}
								location.href= '#/app/board/Main';

							}else if($rootScope.PushData.state == "app.tradeList"){//거래명세서 도착
								$scope.showCheckSano();
							}else if($rootScope.PushData.state != "" || !isUndefined($rootScope.PushData.state) || $rootScope.PushData.state != "undefined"){ //기타 이벤트
								if (jsonData.additionalData || jsonData.additionalData != undefined) {
									if (jsonData.additionalData.launchURL){
										$cordovaInAppBrowser.open(jsonData.additionalData.launchURL, '_blank', browseroptions)
										.then(function(event) {
										// success
										}).catch(function(event) {
										// error
										});
									}
								}
							}
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
			loginService.comInfo('ERPia_Ger_Login', $scope.loginData.Admin_Code, $scope.loginData.UserId, escape($scope.loginData.Pwd), $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo.uuid)
			.then(function(comInfo){
				if(comInfo.data.list[0].Result == '1'){
					if(ERPiaAPI.toast == 'Y'){
						window.plugins.OneSignal.sendTag("id", $scope.loginData.UserId);
						window.plugins.OneSignal.sendTag("usertype", "N");
						window.plugins.OneSignal.sendTag("admincode", $scope.loginData.Admin_Code);
						window.plugins.OneSignal.sendTag("gercode", comInfo.data.list[0].G_code);
						window.plugins.OneSignal.sendTag("key7", "7");
					}

					$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
					$scope.loginData.UserId = comInfo.data.list[0].user_id;

					$rootScope.userData.GerName = comInfo.data.list[0].G_Name + '<br>(' + comInfo.data.list[0].G_code + ')';
					$rootScope.userData.G_Code = comInfo.data.list[0].G_code;
					$rootScope.userData.G_Sano = comInfo.data.list[0].Sano;
					$rootScope.userData.GerCode = comInfo.data.list[0].G_code;
					$rootScope.userData.cntNotRead = comInfo.data.list[0].cntNotRead;

					$rootScope.loginMenu = 'User';
					$rootScope.loginHTML = "로그아웃";
					$scope.ion_login = "ion-power";
					$rootScope.loginState = "N";
					$rootScope.mobile_Certify_YN = comInfo.data.list[0].mobile_CertifyYN;

					$scope.loginData.isLogin = 'Y';

					if($scope.loginData.chkAutoLogin == true){
						if(ERPiaAPI.toast == 'Y'){
					uuidService.save_Log($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo);
							$scope.loginData.autologin_YN = 'Y';
							$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
							$localstorage.set("autologinType", $rootScope.userType);
							$localstorage.set("autoUser_Id", $scope.loginData.UserId);
							$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
							$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
						}else{
						uuidService.save_Log('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, '', $rootScope.deviceInfo);

						}
					}else{
						if(ERPiaAPI.toast == 'Y'){
						uuidService.save_Log($rootScope.deviceInfo.uuid, $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo);
							$scope.loginData.autologin_YN = 'N';
							$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
							$localstorage.set("autologinType", $rootScope.userType);
							$localstorage.set("autoUser_Id", $scope.loginData.UserId);
							$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
							$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
						}else{
							uuidService.save_Log('webTest', $scope.loginData.Admin_Code, $rootScope.userType, $scope.loginData.UserId, '', $rootScope.deviceInfo);						}
					}
					$timeout(function() {
						$ionicLoading.hide();
						$scope.closeLogin();
					}, 1000);
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show(comInfo.data.list[0].Comment, 'long', 'center');
					else alert(comInfo.data.list[0].Comment);
				}
			})
		}else if($rootScope.userType == 'Guest'){
			$rootScope.loginState = "E";
			$rootScope.loginHTML = "로그아웃";
			$scope.ion_login = "ion-power";
			$rootScope.userData.Com_Name = '테스트용계정' + '<br>(' + 'ERPMobile' + ')';
			$scope.loginData.Admin_Code = 'ERPMobile';
			$scope.loginData.UserId = 'ERPMobile';
			$scope.loginData.isLogin = 'Y';

			$rootScope.loginMenu = 'User';
			$rootScope.userData.package = 'Professional';
			$rootScope.userData.cnt_user = '5 명';
			$rootScope.userData.cnt_site = '10 개';

			$rootScope.userData.cntNotRead = 10;	//계산서 미수신건
			$rootScope.userData.expire_date = '2020-04-31'; //"2015년<br>8월20일";
			$rootScope.userData.expire_days = 50;
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$rootScope.tabitem.gubun = 'Gest';
			$rootScope.sideMenuHide = 'false';


			/* 로그인시 계정아이디 권한 추가 - 이경민[2016-07] */
			PrivService.pricheck($scope.loginData.Admin_Code, $scope.loginData.UserId)
			.then(function(data){
					/* 매입매출 권한 */
					$rootScope.priv_meaip.id = data[0].Menu_NM;
					$rootScope.priv_meaip.master_useYN = data[0].Mpriv;
					$rootScope.priv_meaip.useYN = data[0].priv;
					$rootScope.priv_meaip.de = data[0].priv_Delete;
					$rootScope.priv_meaip.save = data[0].priv_Save;
					$rootScope.priv_meaip.print = data[0].priv_Print;

					$rootScope.priv_meachul.id = data[1].Menu_NM;
					$rootScope.priv_meachul.master_useYN = data[1].Mpriv;
					$rootScope.priv_meachul.useYN = data[1].priv;
					$rootScope.priv_meachul.de = data[1].priv_Delete;
					$rootScope.priv_meachul.save = data[1].priv_Save;
					$rootScope.priv_meachul.print = data[1].priv_Print;

					/* 재고권한 */
					$rootScope.priv_jego.jego_YN = data[2].Mpriv;
					if(data[2].priv == '0' && data[3].priv == '0' && data[4].priv == '0'){
						$rootScope.priv_jego.jego = 'N';
					}else{
						$rootScope.priv_jego.jego = 'Y';
					}

					/* 상품정보 권한 */
					if(data[5].Mpriv == 'N' || data[5].Mpriv == 'Y' && data[5].priv == 0 && data[6].priv == 0){
						$rootScope.priv_productYM = 'N';
					}else{
						$rootScope.priv_productYM = 'Y';
					}
			});

			/* 원가 공개 설정 여부 [이경민 - 2016-09-01] */ // Y가 원가 비공개 N이 원가 공개
			PrivService.priv_wonga_Check($scope.loginData.Admin_Code, $scope.loginData.UserId)
			.then(function(data){
					$rootScope.priv_wongaYN = data[0].WonGa;
			});

			$rootScope.goto_with_clearHistory('#/app/slidingtab');


		}
		$scope.LoginAdminCodeCK($rootScope.userType);
		$scope.LoginPwdCK($rootScope.userType);
		$scope.LoginUserIdCK($rootScope.userType);
	};

  	$rootScope.loginHTML = "로그인";

  	/* 약관동의 확인 - 김형석[216-01] */
	$scope.click_agreement = function(){
		if($scope.agree_1.checked == true && $scope.agree_2.checked == true){
			$scope.agreeModal.hide();
			$scope.certificationModal.show();
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('약관에 동의해 주시기 바랍니다.', 'long', 'center');
			else alert('약관에 동의해 주시기 바랍니다.');
		}
	}

	/* 약관 동의 취소 클릭 이벤트 - 이경민[2016-01] */
	$scope.click_cancel = function(){
		$scope.agreeModal.hide(); //모달 닫을 때 동의체크, 인증번호 초기화
		$scope.agree_1.checked = false;
		$scope.agree_2.checked = false;
		$scope.SMSData.rspnText = '';
		$scope.init('logout');
	}
	/* 인증번호 전송 버튼 클릭 이벤트 - 김형석[2016-01] */
	$scope.click_Certification = function(){
		if($scope.SMSData.recUserTel == '' || $scope.SMSData.recUserTel == undefined || $scope.SMSData.recUserTel == 'undefined'){
			$cordovaToast.show('핸드폰번호를 입력하세요.', 'long', 'center');
		}else{ //Admin_Code, loginType, ID, G_Code, sms_id, sms_pwd, sendNum, rec_num, UUID, phoneno, DeviceInfo
		CertifyService.certify($scope.loginData.Admin_Code, $rootScope.loginState, $rootScope.loginData.UserId, $rootScope.userData.G_Code, 'erpia', 'a12345', '070-7012-3071', $scope.SMSData.recUserTel, $rootScope.deviceInfo.uuid, $rootScope.deviceInfo2.phoneNo, $rootScope.deviceInfo)//수정 4.22
		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증번호를 발송했습니다.', 'long', 'center');
		else alert('인증번호를 발송했습니다.');
		}
	}
	/* 인증번호 입력 버튼 클릭 이벤트 - 김형석[2016-01]*/
	$scope.click_responseText = function(){
		if($rootScope.rndNum == $scope.SMSData.rspnText){
			CertifyService.check($scope.loginData.Admin_Code, $rootScope.loginState, $rootScope.loginData.UserId, $rootScope.userData.G_Code, $scope.SMSData.rspnText, $scope.SMSData.recUserTel, $rootScope.deviceInfo.uuid)
			.then(function(response){
				$scope.certificationModal.hide();
				$scope.SMSData.rspnText = '';

				if($rootScope.loginState == "S"){
			           	$state.go("app.erpia_scmhome");
			           	$rootScope.tabitem.gubun = 'snlogin';
				}else if($rootScope.loginState == "E"){
					$rootScope.tabitem.gubun = 'elogin';
					$rootScope.tabitem.tab1 = 'tab-item active';
					$rootScope.tabitem.tab2 = 'tab-item';
					$rootScope.tabitem.tab3 = 'tab-item';
					$rootScope.tabitem.tab4 = 'tab-item';
					$rootScope.tabitem.tab5 = 'tab-item';
			     		$state.go("app.slidingtab");
				}else if($rootScope.loginState == 'N'){
					$rootScope.tabitem.gubun = 'snlogin';
					$state.go("app.erpia_introduce");
				}
				$rootScope.sideMenuHide = 'false';

				console.log("loginstate: ", $rootScope.loginState)
			})
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증번호가 일치하지 않습니다.', 'long', 'center');
			else alert('인증번호가 일치하지 않습니다.');
			return false;
		}
	}
	/* 모달창을 띄워주는 함수 - 김형석[2016-01] */
	$scope.showCheckSano = function(){
		$rootScope.distinction = '';
		$scope.check_sano_Modal.show();
	}
	/* 로그인 화면에서 이알피아 아이콘을 클릭하면 사용자 선택화면으로 돌아간다. - 김형석[2016-01] */
	$scope.login_back = function(){
		$rootScope.loginMenu = "selectUser";
	}
	/* 홈버튼 클릭 함수 - 김형석[2015-11] */
	$scope.click_home = function(){
		if($rootScope.userType == 'ERPia') $location.href = '#/slidingtab'; //$state.go('app.slidingtab');
		else if($rootScope.userType == 'Guest') $location.href = '#/slidingtab'; //$state.go('app.sample_Main');
	}

	/* 인증 모달 닫기 함수 - 이경민[2016-01] */
	$scope.close_cert = function(){
		$scope.certificationModal.hide();
		$scope.SMSData.rspnText = '';
		$scope.agree_1.checked = true;
		$scope.agree_2.checked = true;
		$scope.init('logout');
	}
	$rootScope.deviceInfo2={};

	/* 단말기로 접속시 UUID의 정보를 불러와서 자동로그인 여부를 체크한 후 자동 로그인 시켜준다. - 김형석[2015-12]*/
	 document.addEventListener("deviceready", function () {
		$rootScope.loginState = 'R';
		if(ERPiaAPI.toast == 'Y') {
		 	var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
			deviceInfo.get(function(result) {
			        $rootScope.deviceInfo2 = JSON.parse(result);
			        var phoneNo=$rootScope.deviceInfo2.phoneNo;
			        if(phoneNo.substring(0,1)=="+"){
			         $rootScope.deviceInfo2.phoneNo=phoneNo.toString().replace("+82", "0");
			    }
			   	$scope.SMSData.recUserTel =  $rootScope.deviceInfo2.phoneNo;
			    }, function() {
			});

			$rootScope.deviceInfo.device = $cordovaDevice.getDevice();
			$rootScope.deviceInfo.cordova = $cordovaDevice.getCordova();
			$rootScope.deviceInfo.model = $cordovaDevice.getModel();
			$rootScope.deviceInfo.platform = $cordovaDevice.getPlatform();
			$rootScope.deviceInfo.uuid = $cordovaDevice.getUUID();
			$rootScope.deviceInfo.version = $cordovaDevice.getVersion();
		}else{
			$rootScope.deviceInfo2.phoneNo = '0000000000';
			$scope.SMSData.recUserTel =  $rootScope.deviceInfo2.phoneNo;

			$rootScope.deviceInfo.device = 'web';
			$rootScope.deviceInfo.cordova = 'web';
			$rootScope.deviceInfo.model = 'web';
			$rootScope.deviceInfo.platform = 'web';
			$rootScope.deviceInfo.uuid = 'web';
			$rootScope.deviceInfo.version = 'web';
		}
		$scope.ckversion={};
	   	$scope.thisversioncurrent='Y';
	   	$scope.thisversion='';
	   	$scope.currentversion='';
	   	$rootScope.loginData.autologin_YN = 'N';
	   	$rootScope.sideMenuHide = 'true';
	   	$ionicSideMenuDelegate.canDragContent(false);
		VersionCKService.currentVersion().then(function(data){
			$timeout(function(){
				if(data != '<!--Parameter Check-->'){
					$rootScope.ckversion = data;
					if(ionic.Platform.isAndroid()==true){
						if(data.Android_version == '999'){ 		// 긴급 점검 기능 추가 [이경민 - 2016-08-25]
							$scope.Emergency_update(data.text);
						}else {
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
						}
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
			});

		/* 업데이트 알림 - 김형석[2016-02] */
		$scope.updatego=function(){
			$ionicPopup.show({
				title: '<b>업데이트알림</b>',
				subTitle: '',
				content: '버전이 업데이트 되었습니다.  업데이트창으로 이동합니다.',
				buttons: [
					{
						text: '확인',
						type: 'button-positive',
						onTap: function(e) {
							if(ionic.Platform.isAndroid()==true) window.open('https://play.google.com/store/apps/details?id=com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
							else location.href=window.open('https://itunes.apple.com/kr/app/erpia-ialpia/id1100611372?mt=8&ign-mpt=uo%3D4','_system', 'location=yes,closebuttoncaption=Done');
						}
					},
				]
			})
		}

		/* 긴급 점검 알림 - 이경민[2016-08-25] */
		$scope.Emergency_update=function(text){
			$ionicPopup.show({
				title: "<b>긴급 점검</b>",
				content: "죄송합니다. 긴급 점검 중입니다. <br>" + text,
				buttons: [
				{
					text: '확인',
					type: 'button-positive',
					onTap: function(e) {
					ionic.Platform.exitApp();
					}
				}
				]
			})
		}

		$rootScope.loginData.autologin_YN = $localstorage.get("autoLoginYN");

		if($localstorage.get("autoLoginYN")=="Y"){
		$rootScope.loginData.Admin_Code = $localstorage.get("autoAdmin_Code");
		$rootScope.loginData.loginType = $localstorage.get("autologinType");
		if($localstorage.get("autologinType") == 'ERPia'){
			$rootScope.loginData.loginType = 'E';
			$rootScope.userType = 'ERPia';
		}else if($localstorage.get("autologinType") == 'SCM'){
			$rootScope.loginData.loginType = 'S';
			$rootScope.userType ='SCM';
		}else if($localstorage.get("autologinType") == 'Normal'){
			$rootScope.loginData.loginType = 'N';
			$rootScope.userType ='Normal';
		}

		$rootScope.loginData.User_Id = $localstorage.get("autoUser_Id");
		$rootScope.loginData.Pwd = $localstorage.get("autoPwd");
		$rootScope.loginData.autologin_YN = $localstorage.get("autoLoginYN");
		if($rootScope.loginData.autologin_YN=='Y'){
			$rootScope.autoLogin = true;
			$rootScope.loginData.chkAutoLogin=true;
			$timeout(function(){
				$scope.doLogin($scope.loginData.Admin_Code, $scope.loginData.loginType, $scope.loginData.User_Id, $scope.loginData.Pwd, $scope.loginData.autologin_YN);
	      		}, 1000);
		}else{
			$rootScope.autoLogin = false;
			$rootScope.loginData.chkAutoLogin=false;
		}
	}else{
		$rootScope.autoLogin = false;
		$rootScope.loginData.chkAutoLogin=false;
		if($rootScope.loginMenu == "selectUser"){
			$scope.login();
		}
	}
	 }, false);

	/* ERPIA URL 공유 - 이경민[2016-03] */
	$scope.shareURL = function(){
		var url = 'https://play.google.com/store/apps/details?id=com.ERPia.MyPage';
		$cordovaSocialSharing.share('ERPIA_Mobile' , '[ERPiaMobile 설치URL 공유]', null, url);
	}



	/* 버튼별 로그 기록 저장 - 이경민[20160907] */
	$rootScope.ActsLog = function(module_M, module_T){
		console.log('업데이트 전에 여기찾아라~~~');
		$timeout(function(){
			var current_URL = $location.url();
			if(current_URL == '/app/slidingtab' && $rootScope.tabitem.tab1 != 'tab-item active'){
				$rootScope.tabitem.tab1 = 'tab-item active';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item';
			}else if(current_URL == '/app/meaip_page' && $rootScope.tabitem.tab2 != 'tab-item active'){
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item active';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item';
			}else if(current_URL == '/app/meachul_page' && $rootScope.tabitem.tab3 != 'tab-item active'){
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item active';
				$rootScope.tabitem.tab4 = 'tab-item';
			}else if(current_URL == '/app/jegoMain' && $rootScope.tabitem.tab4 != 'tab-item active'){
				$rootScope.tabitem.tab1 = 'tab-item';
				$rootScope.tabitem.tab2 = 'tab-item';
				$rootScope.tabitem.tab3 = 'tab-item';
				$rootScope.tabitem.tab4 = 'tab-item active';
			}
			// if(module_T == 'jego_tab') $rootScope.jego_open = $rootScope.jegocontroll;
			// 업데이트전 확인사항 입니다.
			if($rootScope.userType == 'ERPia'){
				var admin_code = $rootScope.loginData.Admin_Code;
				var id = $rootScope.loginData.UserId;
				var mac = $rootScope.deviceInfo.uuid;
				var loginType = 'E';
			}else if($rootScope.userType == 'Guest' || $rootScope.userType == undefined){
				var admin_code = 'Guest';
				var id = 'Guest';
				var mac = 'Guest';
				var loginType = 'G';
			}else{
				console.log('저장안할껀데..?');
			}

			if(loginType == 'E' || loginType == 'G'){
				ActsService.Acts_save(admin_code, id, mac, loginType, module_M, module_T)
				.then(function(data){
				});
			}
			// $ionicLoading.hide();
		}, 1000);
	}
})

/*지우면 안되는 컨트롤러입니다.*/
.controller('configCtrl', function($scope, $rootScope, app, $state, $ionicHistory) {
})

/* 프로그램정보 컨트롤러 - 김형석[2016-01] */
.controller('configCtrl_Info', function($scope, $rootScope, $ionicPlatform, $timeout, VersionCKService, $ionicScrollDelegate, app, ERPiaAPI) {
	// 기본정보를 디폴트 값으로 넣었다.
	$scope.ckversion={};
   	$scope.thisversioncurrent='Y';
   	$scope.thisversion='';
   	$scope.currentversion='';

   	/* 공지사항 세모표시 - 이경민[2016-07-12] */
   	$scope.upAnddown = 'ion-arrow-down-b';
	$scope.upAnddown2 = 'ion-arrow-down-b';

	/* 세모아이콘 위로 아래로 - 이경민[2016-07-12] */
	$scope.upAnddownF = function(num){
		if(num == 1){
			if($scope.upAnddown == 'ion-arrow-down-b'){
				$scope.upAnddown = 'ion-arrow-up-b';
			}else{
				$scope.upAnddown = 'ion-arrow-down-b'
			}
		}else{
			if($scope.upAnddown2 == 'ion-arrow-down-b'){
				$scope.upAnddown2 = 'ion-arrow-up-b';
			}else{
				$scope.upAnddown2 = 'ion-arrow-down-b'
			}
		}
	}

	VersionCKService.currentVersion()
	.then(function(data){
		$timeout(function(){
			if(data != '<!--Parameter Check-->'){
				$rootScope.ckversion = data;
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
	});

	/*설정 - 현재버전확인 페이지에서 '업데이트하기' 버튼 클릭시 이벤트  - 김형석[2016-01] */
	$scope.updatebtn=function(){
		if(ionic.Platform.isAndroid()==true) window.open('https://play.google.com/apps/testing/com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
		else location.href=window.open('https://play.google.com/apps/testing/com.ERPia.MyPage','_system', 'location=yes,closebuttoncaption=Done');
	}

	/* 최상단으로 - 김형석[2015-12] */
	$scope.scrollTop = function() {
		$ionicScrollDelegate.scrollTop();
	};

})

/* 공지사항 컨트롤러 - 김형석[2016-01] */
.controller('configCtrl_Notice', function($scope, $rootScope, $ionicPopup, $ionicHistory, NoticeService, $timeout, $cordovaToast, $ionicScrollDelegate, $ionicLoading, app, ERPiaAPI) {
	$scope.items=[];
	
	/* 뒤로가기 상단바에서 버튼 클릭시 이벤트 - 김형석[2016-01] */
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

	/* 최상단으로 - 김형석[2016-01] */
	$scope.scrollTop = function() {
    		$ionicScrollDelegate.scrollTop();
    	};
})

/* 알림설정 컨트롤러 - 김형석[2016-01] */
.controller('configCtrl_alarm', function($scope, $rootScope, $location, alarmService, app, ERPiaAPI){
	if(ERPiaAPI.toast == 'Y'){
		window.plugins.OneSignal.init("881eee43-1f8a-4f60-9595-15b9aa7056b2", {googleProjectNumber: "832821752106", autoRegister: true}, app.didReceiveRemoteNotificationCallBack);
	}
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
		}else{ // 서버에 저장된 설정 값을 불러와서 알맞게 체크해줌.
			alarmService.select('select_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $rootScope.deviceInfo.uuid)
			.then(function(data){
				$scope.settingsList = data.list;
				var cntList = data.list.length;
				for(var i=1; i<cntList; i++){
					switch(data.list[i].idx){
						case 1:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '공지사항';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key1", "1");
								else window.plugins.OneSignal.deleteTags(["key1"]);
							}
							break;
						case 2:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '업데이트 현황';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key2", "2");
								else window.plugins.OneSignal.deleteTags(["key2"]);
							}
							break;
						case 3:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '지식 나눔방';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key3", "3");
								else window.plugins.OneSignal.deleteTags(["key3"]);
							}
							break;
						case 4:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key4", "4");
								else window.plugins.OneSignal.deleteTags(["key4"]);
							}
							data.list[i].name = '업체문의 Q&A(답변)';
							break;
						case 5:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '거래명세서 도착';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key5", "5");
								else window.plugins.OneSignal.deleteTags(["key5"]);
							}
							break;
						case 6:
							data.list[i].checked = (data.list[i].checked == 'T')?true:false;
							data.list[i].name = '기타 이벤트';
							if(ERPiaAPI.toast == 'Y'){
								if(data.list[i].checked == true) window.plugins.OneSignal.sendTag("key6", "6");
								else window.plugins.OneSignal.deleteTags(["key6"]);
							}
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
					$scope.settingsList.splice(0,1);
				}
			});
		}
	}

	/* 실제로 알람 설정 내용을 서버에 저장하는 서비스 - 김형석[2016-03] */
	$scope.check_alarm = function(check){
		if(check) {
			rsltList = '0^T^|1^T^|2^T^|3^T^|4^T^|5^T^|6^T^|';
			var results = rsltList.match(/\^T\^/g);
			alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList, $rootScope.deviceInfo.uuid);
			$scope.fnAlarm('checkAll');
			for(i=1; i<=6 ; i++){
				var tagnum = i.toString();
				if(ERPiaAPI.toast == 'Y'){
					window.plugins.OneSignal.sendTag("key"+tagnum, tagnum);
				}
			}
		}else{
			$scope.settingsList = [];
			rsltList = '0^F^|1^F^|2^F^|3^F^|4^F^|5^F^|6^F^|';
			var results = rsltList.match(/\^F\^/g);
			alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, rsltList, $rootScope.deviceInfo.uuid);
			for(i=1; i<=6 ; i++){
				var tagnum = i.toString();
				if(ERPiaAPI.toast == 'Y'){
					window.plugins.OneSignal.deleteTag("key"+tagnum);
				}
			}
		}
		angular.forEach($scope.settingsList, function(item){
		item.checked = check;
		})
	}

	/* 알람 내용이 변경될때마다 그 내용을 서버에 저장 - 김형석[2016-03] */
	$scope.check_change = function(item){
		if(item.checked==true){
			var tagnum = item.idx.toString();
			if(ERPiaAPI.toast == 'Y'){
				window.plugins.OneSignal.sendTag("key"+tagnum, tagnum);
			}
		}else{
			var tagnum = item.idx.toString();
			if(ERPiaAPI.toast == 'Y'){
				window.plugins.OneSignal.deleteTag("key"+tagnum);
			}
		}
		var rsltList = '';
		for(var i=0; i<cntList; i++){
			rsltList += $scope.settingsList[i].idx + '^';
			rsltList += ($scope.settingsList[i].checked == true)?'T^|':'F^|';
		}
		alarmService.save('save_Alarm', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, '0^U|' + rsltList, $rootScope.deviceInfo.uuid)
	}
	$scope.fnAlarm('loadAlarm');
})

/* 로그인 설정 컨트롤러 - 김형석[2016-01] */
.controller('configCtrl_login', function($scope, $rootScope, uuidService, $localstorage, app, ERPiaAPI, PassChangeService, $cordovaToast, $ionicHistory, uuidService, $state, $ionicModal){
	$scope.loginData=$rootScope.loginData;
	$scope.changepassdata={
		beforepwd :''
		,changepass :''
		,check_changepass : ''
	};
	$scope.log_list = {};

	PassChangeService.changepass_YN($rootScope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.loginData.Pwd, $rootScope.userType)
	.then(function(result){
		var check = result.list[0].setvalue;
		if(check == 'N'){
			$scope.change_YN = 'N';
		}else if(check == undefined){
			$scope.change_YN = 'Y';
		}

	})

	$ionicModal.fromTemplateUrl('config/loginLog.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.loginLogModal = modal;
	});

	$ionicModal.fromTemplateUrl('config/pwdchange.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.pwdchangeModal = modal;
	});

	$scope.loginLogModal_open = function(){
		$scope.get_Logfn();
		$scope.loginLogModal.show();
	};

	$scope.pwdchangeModal_open = function(){
		$scope.pwdchangeModal.show();
	};

	$scope.loginLogModal_close = function() {
		$scope.loginLogModal.hide();
	};

	$scope.pwdchangeModal_close = function() {
		$scope.pwdchangeModal.hide();
	};

	if($rootScope.loginData.autologin_YN == 'Y'){
		$rootScope.autoLogin = true;
		$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
	}else{
		$rootScope.autoLogin = false;
		$localstorage.set("autoLoginYN", $rootScope.loginData.autologin_YN);
	}

	/* 자동로그인 정보 체크유무에 따라  저장하기 - 김형석[2016-01] */
	$scope.autoLogin_YN = function(check){
		if(check==true){
			$rootScope.autoLogin = true;
			$rootScope.loginData.autologin_YN = 'Y';
			$localstorage.set("autoLoginYN", "Y");
			$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
			$localstorage.set("autologinType", $rootScope.userType);
			$localstorage.set("autoUser_Id", $scope.loginData.UserId);
			$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
		}else{
			$rootScope.autoLogin = false;
			$rootScope.loginData.autologin_YN = 'N';
			$localstorage.set("autoLoginYN", "N");
			$localstorage.set("autoAdmin_Code", $rootScope.loginData.Admin_Code);
			$localstorage.set("autologinType", $rootScope.userType);
			$localstorage.set("autoUser_Id", $scope.loginData.UserId);
			$localstorage.set("autoPwd", $rootScope.loginData.Pwd);
		}
	}
	$scope.passChange=function(){
		if($scope.changepassdata.beforepwd == $rootScope.loginData.Pwd && $scope.changepassdata.changepass == $scope.changepassdata.check_changepass && $scope.changepassdata.changepass.length >= 8 && $scope.changepassdata.changepass.length <= 12){
			if(ERPiaAPI.toast != 'Y') {
				$rootScope.deviceInfo.uuid = 'web';
			}

			if($rootScope.loginState == "S"){
				PassChangeService.changepass('SCM_PassChange', $rootScope.loginData.Admin_Code, $rootScope.userData.GerCode, $scope.loginData.UserId, $rootScope.loginData.Pwd, $scope.changepassdata.changepass, $rootScope.deviceInfo.uuid)
				.then(function(changepass){
						console.log(changepass.data.list[0].Result)
						if(changepass.data.list[0].Result == "1"){
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show(changepass.data.list[0].Comment, 'short', 'center');
							else alert(changepass.data.list[0].Comment);
							$rootScope.loginData.Pwd = $scope.changepassdata.changepass;
							$scope.pwdchangeModal_close();

						}else{
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show(changepass.data.list[0].Comment, 'short', 'center');
							else alert(changepass.data.list[0].Comment);
						}
					});
			}else{
				PassChangeService.changepass('NORMAL_PassChange', $rootScope.loginData.Admin_Code, $rootScope.userData.GerCode, $scope.loginData.UserId, $rootScope.loginData.Pwd, $scope.changepassdata.changepass, $rootScope.deviceInfo.uuid)
				.then(function(changepass){
						console.log(changepass.data.list[0].Result)
						if(changepass.data.list[0].Result == "1"){
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show(changepass.data.list[0].Comment, 'short', 'center');
							else alert(changepass.data.list[0].Comment);
							$rootScope.loginData.Pwd = $scope.changepassdata.changepass;
							$scope.pwdchangeModal_close();
						}else{
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show(changepass.data.list[0].Comment, 'short', 'center');
							else alert(changepass.data.list[0].Comment);
						}
					});
			}
		}else if($scope.changepassdata.changepass.length < 8 || $scope.changepassdata.changepass.length > 12){
				console.log($scope.changepassdata.beforepwd, $rootScope.loginData.Pwd)
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show("비밀번호는 8자~12자 이내입니다.", 'short', 'center');
				else alert("비밀번호는 8자~12자 이내입니다.");
		}else if($scope.changepassdata.beforepwd != $rootScope.loginData.Pwd || $scope.changepassdata.beforepwd == '' ){
				console.log($scope.changepassdata.beforepwd, $rootScope.loginData.Pwd)
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show("기존 비밀번호를 입력해주세요.", 'short', 'center');
				else alert("기존 비밀번호를 입력해주세요.");
		}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show("변경비밀번호가 일치하지 않습니다.", 'short', 'center');
				else alert("변경비밀번호가 일치하지 않습니다.");
		}

		/* 초기화추가 - 이경민[2016-07-12] */
		$scope.changepassdata.beforepwd = '';
		$scope.changepassdata.changepass = '';
		$scope.changepassdata.check_changepass = '';
	}

	$scope.get_Logfn=function(){
			$scope.log_list  = {};
			uuidService.get_Log($rootScope.loginData.Admin_Code, $scope.loginData.loginState,  $scope.loginData.UserId)
			.then(function(response){
					if(response != '<!--Parameter Check-->'){
						$scope.log_list = response.list;
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
						else alert('조회된 데이터가 없습니다.');

					}
			});
	}





})

/* SCM 메인 화면 컨트롤러 - 이경민[2015-10] */
.controller('ScmUser_HomeCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $sce, scmInfoService, AmChart_Service, app, ERPiaAPI){
	/* scm메인 데이터 조회 - 이경민[2015-11] */
	$scope.ScmBaseData = function() {
		$scope.loadingani();
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
			scmInfoService.scmInfo('ScmMain', 'Balju', $scope.loginData.Admin_Code, $rootScope.userData.G_Code, aWeekAgo, nowday)
			.then(function(scmInfo){
				console.log('요기와?', scmInfo);
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
			scmInfoService.scmInfo('ScmMain', 'Direct', $scope.loginData.Admin_Code, $rootScope.userData.G_Code, aWeekAgo, nowday)
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
			scmInfoService.scmInfo('CrmMenu', '', $scope.loginData.Admin_Code, $rootScope.userData.G_Code, aWeekAgo, nowday)
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

	/* scm 차트 - 이경민[2015-12] */
	$scope.load_scm_chart = function(){
	    AmChart_Service.scm_Chart('scm', 'scm', $scope.loginData.Admin_Code, 3, $rootScope.userData.G_Code)
	    .then(function(response){
	    	var chartData = response;
	    	if(chartData.length == 0){
	    		AmCharts.addInitHandler(function(kind) {
			//kind.height = containerwidth
			if (kind.dataProvider === undefined || kind.dataProvider.length === 0) {

			var dp = {};
			dp[kind.titleField] = "";
			dp[kind.valueField] = 1;
			dp[kind.categoryField] = '';
			kind.dataProvider.push(dp)

			var dp = {};
			dp[kind.titleField] = "";
			dp[kind.valueField] = 1;
			dp[kind.categoryField] = '';
			kind.dataProvider.push(dp)

			var dp = {};
			dp[kind.titleField] = "";
			dp[kind.valueField] = 1;
			dp[kind.categoryField] = '';
			kind.dataProvider.push(dp)

			kind.labelsEnabled = false;

			kind.addLabel("50%", "50%", "조회할 데이터가 없습니다.", "middle", 15);

			kind.alpha = 0.3;
			return;
		  }
		}, ["serial"]);
	    	}
	    		var chart = AmCharts.makeChart("chart5", {
			   	"type": "serial",
				"addClassNames": true,
				"theme": "dark",
				"autoMarginOffset": 20,
				"autoMargins": true,
				"marginBottom": 40,
				"marginRight": 50,
				"marginTop": 50,
				"marginLeft": 50,

				"balloon": {
					"adjustBorderColor": false,
					"horizontalPadding": 10,
					"verticalPadding": 8,
					"color": "#ffffff"
				  },
				"prefixesOfBigNumbers": [
							{
								"number": 10000,
								"prefix": ""
							}
				],
				"dataProvider": chartData,
				"valueAxes": [
						{
							"id": "ValueAxis-1",
							//"title": "금액",
							"titleRotation": 0,
							"usePrefixes": true,
							"position": "left"
						},
						{
							"id": "ValueAxis-2",
							//"title": "수량",
							"titleRotation": 0,
							"precision" : 0,
							"position": "right"
						}
					],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 20
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": "98%",
						"y": 20
					}
				],
				"startDuration": 1,
				  "graphs": [{
					"id": "graph1",
					"alphaField": "alpha",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"fillAlphas": 1,
					"title": "금액",
					"type": "column",
					"valueField": "value",
					"dashLengthField": "dashLengthColumn",
					"ValueAxis": "ValueAxis-1"
				  }, {
					"id": "graph2",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"bullet": "round",
					"lineThickness": 3,
					"bulletSize": 7,
					"bulletBorderAlpha": 1,
					"bulletColor": "#FFFFFF",
					"useLineColorForBulletBorder": true,
					"bulletBorderThickness": 3,
					"fillAlphas": 0,
					"lineAlpha": 1,
					"title": "수량",
					"valueField": "su",
					"valueAxis": "ValueAxis-2",
					"position" : "right"
				  }],
				"categoryField": "name",
				  "categoryAxis": {
					"gridPosition": "start",
					"axisAlpha": 0,
					"tickLength": 0
				  },
				  "export": {
					"enabled": true
				  },
                "legend": {
					"enabled": true,
					"autoMargins": true,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});
	    })
	}
	$scope.load_scm_chart();
}) //

/*(지금은 안쓰는 옛날) 메인화면 컨트롤러 - 김형석[2016-01 ]*/
.controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, app, ERPiaAPI){

	$scope.ERPiaCS_Link = function() {	// 예전 메인화면에서 상담하기 클릭
		$state.go('app.erpia_cs');
	}

	$scope.ERPiaCafe_Link = function() {	// 예전 메인화면에서 카페바로가하기 클릭
		window.open('http://cafe.naver.com/erpia10');
	}

	$scope.ERPiaBlog_Link = function() {	// 예전 메인화면에서 블로그바로가기 클릭
		window.open('http://blog.naver.com/zzata');
	}
})

/* CS관련 컨트롤러 - 김형석[2016-02] */
.controller('CsCtrl', function($rootScope, $scope, $ionicModal, $ionicPopup, $timeout, $stateParams, $location, $http, csInfoService, TestService, $ionicHistory, ERPiaAPI, $cordovaToast, app, $ionicSideMenuDelegate){
	if($rootScope.sideMenuHide == 'true'){
		$ionicSideMenuDelegate.canDragContent(false);
	}else{
		$ionicSideMenuDelegate.canDragContent(true);
	}
	$scope.csData = {	// 상담하기 폼에 들어가는 내용 및 체크박스,인증 정보저장할 변수 객체 생성
		comName: ''
		,writer: ''
		,subject: ''
		,tel: ''
		,sectors: ''
		,interestTopic : ''
		,contents: ''
		,inflowRoute: ''
		,cs_certify_no:''
		,cs_certify_click: false
		,cs_certify_ok: false
		,interestTopic1: ''
	};

	$scope.cscustomagree = false;
	var csResigtData = [];

	/* CS약관동의 모달 - 김형석[2016-01] */
	$ionicModal.fromTemplateUrl('erpia_cs/csagreement.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.csagreeModal = modal;
	});
	/* 관심항목 선택  모달 - 김형석[2016-01] */
	$ionicModal.fromTemplateUrl('erpia_cs/cs_interestsModal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.Cs_Interests_Modal = modal;
	});

	$scope.csagree=function(){					// 약관동의하기 체크
		if($scope.cscustomagree == false) $scope.cscustomagree =true;
		else $scope.cscustomagree = false;
	}
	$scope.csagreemodalopen=function(){			// 약관 모달 띄우기
		$scope.csagreeModal.show();
	}
	$scope.csagreemodalclose=function(){			// 약관 모달 닫기
		$scope.csagreeModal.hide();
	}
	$scope.Interests_Modalopen = function(){		// 관심항목선택 모달 띄우기
		$scope.Cs_Interests_Modal.show();
	}
	$scope.Interests_Modalclose = function(){		// 관심항목선택 모달 닫기
		$scope.Cs_Interests_Modal.hide();
	}
	$scope.dialNumber = function(number) {		// 이알피아로 전화걸기 배너 클릭시 전화걸기로 이동
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
	    { id: 1, value: "재고관리", checked : false },
	    { id: 2, value: "물류관리", checked : false },
	    { id: 3, value: "온라인관리", checked : false },
	    { id: 4, value: "매장관리", checked : false },
	    { id: 5, value: "회계&장부관리", checked : false },
	    { id: 6, value: "판매관리", checked : false },
	    { id: 7, value: "해외판매", checked : false },
	    { id: 8, value: "정산관리", checked : false },
	    { id: 9, value: "미수관리", checked : false },
	    { id: 10, value: "발주관리", checked : false },
	    { id: 11, value: "그룹사관리", checked : false }
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

  	$scope.csRegist = function() {	// 입력한 내용 검토 및 전송
  		var errMsg = "";

  		csResigtData[0] = $scope.csData.comName;
	  	csResigtData[1] = $scope.csData.writer;
	  	csResigtData[2] = $scope.csData.subject;
	  	csResigtData[3] = $scope.csData.tel;
	  	csResigtData[4] = $scope.csData.sectors;
	  	csResigtData[5] = $scope.csData.interestTopic;
	  	csResigtData[6] = $scope.csData.inflowRoute;
	  	csResigtData[7] = $scope.csData.contents;

	  	csResigtData[8] = $scope.csData.cs_certify_no;
	  	csResigtData[9] = $scope.csData.cs_certify_ok;

	  	if(!$scope.csData.comName != ''){
	  		errMsg += "회사명";
	  	}
	  	if(!$scope.csData.subject != ''){
	  		errMsg += "/제목";
	  	}
	  	if(!$scope.csData.tel != ''){
	  		errMsg += "/연락처";
	  	}
	  	if(!$scope.csData.cs_certify_no != ''){
	  		errMsg += "/휴대폰인증";
	  	}
	  	if($scope.csData.sectors == ''){
	  		errMsg += "/업종"
	  	}
	  	if($scope.csData.interestTopic == ''){
	  		errMsg += "/관심항목";
	  	}
	  	if(!$scope.csData.contents != ''){
	  		errMsg += "/문의사항";
	  	}
	  	if(errMsg != ""){
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
	  	}else{
			csInfoService.csInfo($scope.loginData.Admin_Code, $scope.loginData.UserId, 'Mobile_CS_Save', $rootScope.loginState, escape(csResigtData[0]),
			escape(csResigtData[1]), escape(csResigtData[2]), escape(csResigtData[3]), escape(csResigtData[4]), escape(csResigtData[5]),
			escape(csResigtData[6]), escape(csResigtData[7]))
			.then(function(csInfo){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록이 성공하였습니다.', 'long', 'center');
				else alert('등록이 성공하였습니다.');

				/* 문의글 등록시 영업담당자에게 문자 발송 추가 - [이경민-2016-09-28] */
				csInfoService.cs_message($rootScope.rndNum, $scope.csData.tel, csInfo.data.list[0].idx).then(function(response){
					console.log('ERPia 영업 담당자에게 전달완료.');
				})

				$rootScope.goto_with_clearHistory('#/app/login');
			},function(){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록이 실패하였습니다.', 'long', 'center');
				else alert('등록이 성공하였습니다.');
			});
		}
	};

	/* 관심항목 내용 초기화  - 김형석[2016-01] */
	$scope.interestTopicRemove = function() {
		$scope.csData.interestTopic = "";
		$scope.csData.interestTopic1 = '';
		updated = 0;
	};

	/* 관심항목 내용 저장(뿌려지는 interestTopic1은 1,2,3 형식/ 전송되는 interestTopic은 1^2^3^ 형식)  - 김형석[2016-01] */
	$scope.Interests_Save = function(){
		$scope.csData.interestTopic1 = '';
		$scope.csData.interestTopic = '';
		var commacount = 0;
		for(var i=0 ; i<$scope.interestTopiclist.length; i++){
			if($scope.interestTopiclist[i].checked == true){
				commacount++;
				$scope.csData.interestTopic +=   $scope.interestTopiclist[i].value+'^';
				$scope.csData.interestTopic1 +=  $scope.interestTopiclist[i].value+',';
				if(commacount == 3 || commacount == 6 || commacount == 9){
					$scope.csData.interestTopic1 += '\n';
				}
			}
		}
		$scope.csData.interestTopic1= $scope.csData.interestTopic1.slice(0, $scope.csData.interestTopic1.length-1);
	};

	/* 인증번호 요청버튼 클릭시 이벤트 (핸드폰번호 양식 검토 및 인증번호 발송) - 김형석[2016-02] */
	$scope.cs_certify_click_fn = function(phoneno){
		if(phoneno == null || phoneno == undefined|| phoneno == '' || phoneno.length<10){
			$ionicPopup.alert({
			        title: '<b>경고</b>',
			        subTitle: '',
			        content: '핸드폰번호를 입력해주세요'
			})
		}else{
			$rootScope.rndNum = Math.floor(Math.random() * 1000000) + 1;
			if ($rootScope.rndNum < 100000) $rootScope.rndNum = '0' + $rootScope.rndNum;

			csInfoService.cs_certify($rootScope.rndNum, $scope.csData.tel).then(function(response){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증번호를 발송했습니다.', 'long', 'center');
				else alert('인증번호를 발송했습니다.');
				$scope.certificationModal.hide();
				$scope.csData.cs_certify_no= '';
				$scope.csData.cs_certify_click = true;
			})

			
		}
	};
	/* 인증번호 확인버튼 클릭시 이벤트  - 김형석[2016-01] */
	$scope.cs_certify_Check_fn = function(certify_no){
		if(certify_no == null || certify_no == undefined|| certify_no == '' || certify_no.length<5){
		$ionicPopup.alert({
			title: '<b>경고</b>',
			subTitle: '',
			content: '인증번호를 정확히 입력해주세요'
		})
		}else if(certify_no == $rootScope.rndNum){
			$scope.csData.cs_certify_ok = true;
			$rootScope.rndNum = '';
			$ionicPopup.alert({
				title: '<b>인증성공</b>',
				subTitle: '',
				content: '인증에 성공하였습니다.'
			})
		}else{
			$ionicPopup.alert({
				title: '<b>경고</b>',
				subTitle: '',
				content: '인증번호가 일치하지 않습니다. <br>다시 입력해주세요.'
			})
		}
	};
})

/* 이알피아 고객센터(공지사항/ 업데이트현황/ 지식나눔방/ 업체별문의사항) 선택화면 컨트롤러  - 김형석[2016-01] */
.controller('BoardSelectCtrl', function($rootScope, $scope, $state, app, ERPiaAPI){

	$scope.BoardSelect1 = function() {		// 공지사항 버튼클릭시
		$rootScope.boardIndex = 0;
		$state.go("app.erpia_board-Main");
	};
	$scope.BoardSelect2 = function() {		// 업데이트현황 버튼클릭시
		$rootScope.boardIndex = 1;
		$state.go("app.erpia_board-Main");
	};
	$scope.BoardSelect3 = function() {		// 지식나눔방 버튼클릭시
		$rootScope.boardIndex = 2;
		$state.go("app.erpia_board-Main");
	};
	$scope.BoardSelect4 = function() {		// 업체별문의사항 버튼클릭시
		$rootScope.boardIndex = 3;
		$state.go("app.erpia_board-Main");
	};
})

/* 이알피아 고객센터(공지사항/ 업데이트현황/ 지식나눔방/ 업체별문의사항) 내용화면 컨트롤러 - 김형석[2016-01] */
.controller('BoardMainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $sce, $cordovaToast, ERPiaAPI, BoardService, $ionicScrollDelegate, $ionicLoading, $ionicHistory, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, app){
	console.log("BoardMainCtrl");
	$scope.moreloading=0;
    	$scope.pageCnt=1;
    	$scope.maxover=0;
	$rootScope.useBoardCtrl = "Y";
	var idx = $rootScope.boardIndex;			//푸쉬받은것에서 idx번호를 입력 후 어떤 종류의 게시판인지 판별
	$rootScope.PushData.state='';

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

	$scope.tabs2 = [
		{ "text" : "공지사항" }, 
		{ "text" : "업데이트 현황" },
		{ "text" : "지식 나눔방" },
		{ "text" : "업체문의 Q&A" }
	];

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

	 /* qna글쓰기모달 - 김형석[2016-04] */
	$ionicModal.fromTemplateUrl('erpia_board/qnawriteModal.html', {
    		scope: $scope
	}).then(function(modal) {
	    	$scope.qnawriteModal = modal;
	});
	/* 업체별QNA글쓰기 모달 열기 - 김형석[2016-04] */
	$scope.qnawrite_openModal = function() {
		$scope.qnareqdata.subject='';
		$scope.qnareqdata.content='';
		$scope.qnareqdata.pwd='';
	          $scope.qnawriteModal.show();
	};
	/* 업체별QNA글쓰기 모달  닫기 - 김형석[2016-04] */
	$scope.qnawrite_closeModal = function() {
	          $scope.qnawriteModal.hide();
	          $scope.defaultSearch();
	};
	/* 업체별QNA글쓴 내용 전송하기  - 김형석[2016-04] */
	$scope.qnawriteSubmit=function(){
		if($scope.qnareqdata.subject == '') {
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('제목을 입력하세요.', 'short', 'center');
			else console.log('제목을 입력하세요.');
		}else if($scope.qnareqdata.content == ''){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('내용을 입력하세요.', 'short', 'center');
			else console.log('내용을 입력하세요.');
		}
		else if($scope.qnareqdata.pwd == ''){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('비밀번호를 입력하세요.', 'short', 'center');
			else console.log('비밀번호를 입력하세요.');
		}
		else{
			$rootScope.ActsLog('board', 'board_QnaWrite');
			BoardService.QnAinsert($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.qnareqdata.subject, $scope.qnareqdata.content, $scope.qnareqdata.pwd).then(function(data){
				if(data.list[0].rslt == 'Y'){
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('게시글 등록에 성공하였습니다.', 'short', 'center');
					else console.log('게시글 등록 완료');
					$scope.qnawrite_closeModal();
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록실패. 다시시도해주세요.', 'short', 'center');
					else console.log('등록실패');
				}
			});
		}
	};

	/* 게시판 내용 기본조회(게시판 처음 들어갔을 때 초기조회) - 김형석[2016-04] */
	$scope.defaultSearch=function(){
		console.log('실행되?', $rootScope.boardIndex);
		switch ($rootScope.boardIndex){
			case 0 : var module_T = 'board_Notice'; break;
			case 1 : var module_T = 'board_Update'; break;
			case 2 : var module_T = 'board_Knowledge'; break;
			case 3 : var module_T = 'board_Qna'; break;
		}
		$rootScope.ActsLog('board', module_T);
		$scope.pageCnt=1;
		switch($rootScope.boardIndex){
			case 0:
				$scope.searchck.SearchValue='';
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

			case 1:
				$scope.searchck.SearchValue='';
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

			case 2:
				$scope.searchck.SearchValue='';
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

			case 3:
				$scope.searchck.SearchValue='';
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
	};
	if($rootScope.boardIndex == 0) $scope.defaultSearch();

	/*  게시판별 검색내용 입력 후 조회버튼 클릭시 조회 - 김형석[2016-04] */
	$scope.bbsSearch = function(){
		$scope.pageCnt=1;
		$scope.searchck.SearchValue1=$scope.searchck.SearchValue;
		$scope.searchck.mode1 = $scope.searchck.mode;
		if($scope.searchck.SearchValue1 == ''){
			$scope.defaultSearch();
		}else{
		switch($rootScope.boardIndex){
			case 0 :
				$scope.maxover=0;
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

			case 1 :
				$scope.maxover=0;
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

			case 2 :
				$scope.maxover=0;
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

			case 3 :
				$scope.maxover=0;
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
	// $scope.defaultSearch();

	/* 검색어 입력하고 검색버튼 클릭시 이벤트  - 김형석[2016-04] */
	$scope.searchClick=function(){
		BoardService.Board_sear($scope.loginData.Admin_Code, $rootScope.boardIndex, 1).then(function(data){$scope.items = data.list;});
	};

	/* 최상단으로 */
	$scope.scrollTop = function() {
    		$ionicScrollDelegate.scrollTop();
    	};

    	/* 게시판 슬라이드 인덱스 - 김형석[2016-04] */
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
   	/* 게시판더보기 버튼 클릭시 - 김형석[2016-03] */
	$scope.boards_more = function() {
		$rootScope.loadingani();
		if($scope.items.length>0){
			if($scope.maxover==0){
				$scope.pageCnt+=1;
				if($scope.searchck.SearchValue1 == '' || $scope.searchck.SearchValue1 == undefined){
					switch($rootScope.boardIndex){
						case 0:
							$scope.BoardUrl1 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_notice',$scope.pageCnt).then(function(data){
								$scope.maxCnt=0;
								$timeout(function(){
									if(data != '<!--Parameter Check-->' && data.list.length>0){
										$scope.maxover=0;
										for(var i=0; i<data.list.length; i++){
											$scope.items.push(data.list[i]);
										}
									}else{
										if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
										else alert('조회된 데이터가 없습니다.');
										$scope.maxover = 1;
									}
								}, 1000);
							}); break;

						case 1:
							$scope.BoardUrl2 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_erpup',$scope.pageCnt).then(function(data){
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
										$scope.maxover = 1;
									}
								}, 1000);
							}); break;

						case 2:
							$scope.BoardUrl3 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_FAQ',$scope.pageCnt).then(function(data){
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
										$scope.maxover = 1;
									}
								}, 1000);
							}); break;

						case 3:
							$scope.BoardUrl4 = BoardService.BoardInfo($scope.loginData.Admin_Code, $scope.loginData.UserId,'board_Request',$scope.pageCnt).then(function(data){
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
										$scope.maxover = 1;
									}
								}, 1000);
							}); break;
					}
				}else{
					switch($rootScope.boardIndex){
						case 0 :
							$scope.maxover=0;
							$scope.BoardUrl1 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Notice', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
							.then(function(data){
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
										$scope.maxover = 1;
									}
								}, 1000);
							}); break;

						case 1 :
						$scope.maxover=0;
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
									$scope.maxover = 1;
								}
							}, 1000);
						}); break;

						case 2 :
						$scope.maxover=0;
						$scope.BoardUrl3 = BoardService.Board_sear($scope.loginData.Admin_Code, 'FAQ', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
						.then(function(data){
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
									$scope.maxover = 1;
								}
							}, 1000);
						}); break;

						case 3 :
						$scope.maxover=0;
						$scope.BoardUrl4 = BoardService.Board_sear($scope.loginData.Admin_Code, 'Request', $scope.searchck.mode1, $scope.searchck.SearchValue1, $scope.pageCnt)
						.then(function(data){
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
									$scope.maxover = 1;
								}
							}, 1000);
						}); break;
					}
				}
			}
		}
	};
})

/* PUSH컨트롤러 - 김형석[2016-01] */
.controller('PushCtrl', function($rootScope, $scope, $state, PushSelectService, app, ERPiaAPI){
	console.log("PushCtrl");

	/* 내가 받은 push내용 리스트로 불러오기 - 김형석[2016-01] */
	$scope.PushList = function() {
		if($scope.loginData.Admin_Code != undefined){
			PushSelectService.select($rootScope.deviceInfo.uuid, $rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.loginData.loginType)
			.then(function(data){
				$scope.items = data.list;
			})
		}
	}

	/* 알림페이지 확인 및 이동 - 이경민[2016-10-06] */
	$scope.alramRead = function(index){
		console.log('읽자~ =>', $scope.items[index]);
		if($scope.items[index].Read_YN == 'N'){		// 푸시로그 업데이트 
			PushSelectService.update($rootScope.deviceInfo.uuid, $rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.loginData.loginType, index)
			.then(function(data){
				console.log('데이터 확인용 =>', data);
			})
		}else{

		}
	}

	$scope.PushList();
})

.controller('DashCtrl', function($scope, app) {
	console.log("DashCtrl");
})

.controller('ChatsCtrl', function($scope, Chats, app) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, app) {
	$scope.settings = {
		enableFriends : true
	}
});