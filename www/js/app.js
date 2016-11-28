angular.module('starter', ['ionic','ionic.service.core','ionic.service.push', 'starter.controllers', 'tabSlideBox' ,'ngCordova', 'fcsa-number'
	, 'starter.services'])

/* 웹사용 */
 .constant('ERPiaAPI',{
 	  url:'http://localhost:8100/include'
 	, url2:'http://localhost:8100'
 	, imgUrl:'http://localhost:8100/erpia_update/img'
 	, gurl:'http://168.126.146.37/20132354'
 	, toast:'N'
 })

/* 실제 사용 */
// .constant('ERPiaAPI',{
// 	url:'http://www.erpia.net/include',
// 	url2: 'http://www.erpia.net',
// 	imgUrl:'http://erpia2.godohosting.com/erpia_update/img',
// 	toast:'Y'
// })

/* 처음 실행 Ctrl - 김형석[2015-11]*/
.run(function($ionicPlatform, $ionicPush, $location, $timeout, $ionicUser, $rootScope, $ionicHistory, $state, $ionicPopup, uuidService, $cordovaNetwork, $ionicSideMenuDelegate, MconfigService, ERPiaAPI, $cordovaToast, $ionicSlideBoxDelegate) {
	$ionicPlatform.ready(function() {

	/* 새로 추가된 푸쉬 - 김형석[2016-04] */
	var notificationOpenedCallback = function(jsonData) {
		$rootScope.PushData = {};
		$rootScope.PushData = jsonData.additionalData;
		if($rootScope.PushData && $rootScope.loginState =='E'){
			// $rootScope.PushData.state 푸시에서 명시한 로드될 화면
			if($rootScope.PushData.state == "app.erpia_board-Main"){
				$state.go($rootScope.PushData.state);
				$rootScope.boardIndex = $rootScope.PushData.state;
				switch ($rootScope.PushData.BoardParam){
					case "0": $rootScope.boardIndex = 0; break;
					case "1": $rootScope.boardIndex = 1; break;
					case "2": $rootScope.boardIndex = 2; break;
					case "3": $rootScope.boardIndex = 3; break;
				}					
			}else if($rootScope.PushData.state == "app.tradeList"){//거래명세서 도착
				$state.go("app.tradeList");
				location.href='#/app/tradeList';
			}else if($rootScope.PushData.state != "" || $rootScope.PushData.state != undefined || $rootScope.PushData.state != "undefined"){ //기타 이벤트
				$state.go($rootScope.PushData.state);
			}
		}
	};

	/* 푸쉬 등록 - 김형석[2016-04] */
	if(ERPiaAPI.toast == 'Y'){
		window.plugins.OneSignal.init("881eee43-1f8a-4f60-9595-15b9aa7056b2", {googleProjectNumber: "832821752106"}, notificationOpenedCallback);
		window.plugins.OneSignal.enableInAppAlertNotification(false);
		window.plugins.OneSignal.registerForPushNotifications();

		window.plugins.OneSignal.getIds(function(ids) {
			$rootScope.token = ids.userId;
			$rootScope.UserKey = $rootScope.deviceInfo.uuid;
		});
	}

	/* Check for network connection - 김형석[2016-04] */
	if(window.StatusBar) {
		if (ionic.Platform.isIOS()){
			ionic.Platform.fullScreen();
				if(window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
				}
			StatusBar.hide();
		}else{
				if(window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				}
			StatusBar.styleDefault();
		}
	}



	/* 네트워크 상태 체크 - 김형석[2016-04] */
	$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
		if ($location.url()=='/app/login') { 
			$ionicPopup.show({
				title: "휴대폰의 데이터를 켜주시기바랍니다.",
				content: "앱을 종료합니다.",
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
		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경 불안정합니다. 데이터/와이파이접속을 확인해주세요.', 'short', 'center');
			else alert('네트워크환경 불안정합니다. 데이터접속을 확인해주세요.');
		}
	})

	$rootScope.$on('$cordovaNetwork:online', function(event, networkState){
		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('데이터접속이 정상입니다.', 'short', 'center');
		else alert('네트워크가 정상으로 돌아왔습니다.');
	})

	/* 뒤로가기 마지막페이지일때 - 김형석[2016-03]*/
	$ionicPlatform.registerBackButtonAction(function(e){
		$ionicSideMenuDelegate.canDragContent(true);
		if ($location.url()=='/app/login' ||  $location.url()=='/app/slidingtab'  || $location.url() == '/app/scmhome'  || $location.url() == '#/app/introduce') { //현재 페이지 url이 메인일 때,
			$ionicPopup.show({
				title: '경고',
				subTitle: '',
				content: '앱을 종료하시겠습니까?',
				buttons: [
					{ 	
						text: 'No',
						onTap: function(e){ $rootScope.backButtonPressedOnceToExit = false; }
					},
					{
						text: 'Yes',
						type: 'button-positive',
						onTap: function(e) { ionic.Platform.exitApp(); }
					},
				]
			})
		}else if ($ionicHistory.backView()) {		// 상단에 뒤로가기버튼이 true일때 
			if($location.url()=='/app/meaip_depage'){
				$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
				location.href = '#/app/meaip_page';
			}else if($location.url()=='/app/meachul_depage'){
				$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
				location.href = '#/app/meachul_page';
			}else if($location.url() == '/app/meaip_IU' || $location.url() == '/app/meachul_IU'){	
				$ionicPopup.show({
					title: '경고',
					subTitle: '',
					content: '작성중인 내용이 지워집니다.<br> 계속진행하시겠습니까?',
					buttons: [
						{ 
							text: 'No',
							onTap: function(e){}
						},
						{
							text: 'Yes',
							type: 'button-positive',
							onTap: function(e) {
								$rootScope.JegoGoods = [];
								$ionicHistory.clearCache();
								if($rootScope.distinction == 'meaip'){ 				// 매입일 경우 
									$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
									location.href = '#/app/meaip_page';
								}else{ 									// 매출일 경우 
									$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
									location.href = '#/app/meachul_page';
								}
							}
						},
					]
				})
			}else if($location.url()=='/app/meaipchul/m_Setup'){
				$ionicPopup.show({
					title: '경고',
					subTitle: '',
					content: '저장하시겠습니까?',
					buttons: [
						{ 
							text: 'No',
							onTap: function(e){ $ionicHistory.goBack(); }
						},
						{
							text: 'Yes',
							type: 'button-positive',
							onTap: function(e) {
								if($rootScope.setupData.basic_Ch_Code == '000'){			//창고가 선택되지 않았을때.
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('창고를 선택해주세요.', 'long', 'center');
									else alert('창고를 선택해주세요.');
								}else{
									if($rootScope.setupData.state == 0) var mode = 'update';
									else var mode = 'insert';

									MconfigService.configIU($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.setupData, mode)
									.then(function(data){
										if(data.list[0].rslt == 'Y'){
											$ionicHistory.goBack();
										}else{
											if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수정에 성공하지 못하였습니다', 'long', 'center');
											else alert('수정에 성공하지 못하였습니다');
										}
									})
								}
							}
						},
					]
				})
			}else{
				$ionicHistory.goBack();
			}
			$rootScope.backButtonPressedOnceToExit = false;	
		}else{ 			// 현재페이지가 메인이 아니면서 더이상 뒤로갈 곳이 없을 때
			$rootScope.backButtonPressedOnceToExit = false;
			
			$timeout(function(){
				var current_URL = $location.url();
				if(current_URL == '/app/login' && $rootScope.tabitem.tab1 != 'tab-item active'){
					$rootScope.tabitem.tab1 = 'tab-item active';
					$rootScope.tabitem.tab2 = 'tab-item';
					$rootScope.tabitem.tab3 = 'tab-item';
					$rootScope.tabitem.tab4 = 'tab-item';
				}
			}, 1000);
			console.log($rootScope.loginState)
			if($rootScope.loginState == "R"){   
				console.log("$rootScope.userType", $rootScope.userType)
					$ionicHistory.clearCache();
					$ionicHistory.clearHistory();
					$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
					switch($rootScope.userType){
					case 'ERPia': location.href = '#/app/login'; break;
					case 'SCM' : location.href = '#/app/login'; break;
					case 'Guest': location.href = '#/app/login'; break;
					default : location.href = '#/app/login'; break;
				} 
				
			}else{
				window.plugins.toast.showShortCenter(function(a){ },function(b){ });
				$ionicHistory.clearCache();
				$ionicHistory.clearHistory();
				$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
				console.log("$rootScope.userType", $rootScope.userType)
				switch($rootScope.userType){
					case 'ERPia': location.href = '#/app/slidingtab'; break;
					case 'SCM' : location.href = '#/app/scmhome'; break;
					case 'Guest': location.href = '#/app/slidingtab'; break;
					default : location.href = '#/app/login'; break;
				} 
			}
			$rootScope.backButtonPressedOnceToExit = true;
		}
		e.preventDefault();
		return false;
	},101);
});
	
	/* TYPE별 메인화면 - 김형석[2016-03] */
	$rootScope.goHome = function(userType){
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});

		switch($rootScope.userType){
			case 'ERPia': location.href = '#/app/slidingtab'; break;
			case 'SCM' : location.href = '#/app/scmhome'; break;
			case 'Guest': location.href = '#/app/slidingtab'; break;
			case 'Normal': location.href = '#/app/introduce'; break;
		} 
	}

	$rootScope.already = function(){
		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('준비중입니다.', 'long', 'center');
		else console.log('준비중입니다.');
	}

	$rootScope.goto_with_clearHistory = function(goto_Href){
		$rootScope.loadingani();
		if(goto_Href == '#app/jegoMain') $rootScope.distinction = '';
		if($location.url() == '/app/meaip_IU' && goto_Href != '#app/jegoMain' || $location.url() == '/app/meachul_IU' && goto_Href != '#app/jegoMain'){
			$ionicPopup.show({
				title: '경고',
				subTitle: '',
				content: '작성중인 내용이 지워집니다.<br> 계속진행하시겠습니까?',
				buttons: [
					{
						text: 'No',
						onTap: function(e){ }
					},
					{
						text: 'Yes',
						type: 'button-positive',
						onTap: function(e) {
							var no = 'Y'; 	// 매입&매출 백버튼 이슈사항 때문에 두번눌렸을 경우의 구분을 짓는 변수

								$ionicHistory.clearCache();
								$rootScope.JegoGoods = [];

								if(goto_Href == '#app/meachul_page'){
									if($rootScope.distinction == 'meachul') var no = 'N';
									else $rootScope.distinction = 'meachul';
								} 
								else if(goto_Href == '#app/meaip_page'){
									if($rootScope.distinction == 'meaip') var no = 'N';
									else $rootScope.distinction = 'meaip';
								}
								else if(goto_Href=='#app/config'){
									if($rootScope.distinction == 'config') var no = 'N';
									else $rootScope.distinction = 'config';
								}

								if(no == 'N'){
									if($rootScope.distinction == 'meaip'){
										$timeout(function(){
											$state.go('app.meaip_page');
										}, 500);
									}
									else if($rootScope.distinction == 'meachul'){
										$timeout(function(){
											$state.go('app.meachul_page');
										}, 500);
									}
									else{
										$timeout(function(){
											$state.go('app.config');
										}, 500);
									}
								}else{
									$ionicHistory.clearHistory();
									$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
									$timeout(function(){
										location.href = goto_Href;
									}, 500);
								}
						}
					},
				]
			})
		}else{
			var no = 'Y'; 	// 매입&매출 백버튼 이슈사항 때문에 두번눌렸을 경우의 구분을 짓는 변수
			if(goto_Href != '#app/meachul_IU' && goto_Href != '#app/meaip_IU'){
				$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
			}
			$ionicHistory.clearCache();
			$ionicHistory.clearHistory();
			

			if(goto_Href == '#app/meachul_page'){
				if($rootScope.distinction == 'meachul') var no = 'N';
				else $rootScope.distinction = 'meachul';
			} 
			else if(goto_Href == '#app/meaip_page'){
				if($rootScope.distinction == 'meaip') var no = 'N';
				else $rootScope.distinction = 'meaip';
			}else if(goto_Href=='#app/config'){
				if($rootScope.distinction == 'config') var no = 'N';
				else $rootScope.distinction = 'config';
			}

			if(no == 'N'){
				if($rootScope.distinction == 'meaip') $state.go('app.meaip_page');
				else if($rootScope.distinction == 'meachul') $state.go('app.meachul_page');
				else $state.go('app.config');
			}else{
				location.href = goto_Href;
			}
		}
	}

	$rootScope.goto_with_backButton = function(goto_Href){
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		location.href = goto_Href;	
	}

	$rootScope.goBack_with_clearHistory = function() {
		$ionicHistory.goBack();
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		//location.href = '#app/config';
	};

	$rootScope.rndNum = 0;	
})

/* 이건 나도 모르겠어 .. 아마 예전 아이오닉 푸쉬 사용했을 때 APP_ID 설정하려고 쓴것일듯  - 김형석[2016-04] */
.config(['$ionicAppProvider', function($ionicAppProvider) {
	$ionicAppProvider.identify({
	      	app_id: 'b94db7cd', //app id
	      	// api_key:'eaed7668bef9fb66df87641b2b8e100084454e528d5f3150',		// public key 개발테스트시 
	      	// api_key:'7a751bc2857d64eeecdd7c9858dd2e0edb0315f621497ecc', 	// private key 실적용시
	      	api_key:'7b8c938db644b36f10e1d586718b3529d5cbd9f3',			// ios
		// dev_push: true // 개발테스트시
		dev_push: false // 실적용시
	});
}])

 /* input에 숫자입력시 천자리마다 콤마를 찍어주는 플러그인 기본옵션부분 - 김형석[2015-11]*/
.config(['fcsaNumberConfigProvider', function(fcsaNumberConfigProvider) {
	fcsaNumberConfigProvider.setDefaultOptions({
		min: 0
	});
}])


.config(function($stateProvider, $urlRouterProvider, $ionicAppProvider) {
	$stateProvider
	
	/* 앱 사이드메뉴 - 이경민,김형석 */
	.state('app', {
		url : '/app',
		abstract : true,
		templateUrl : 'side/menu.html',
		controller : 'AppCtrl'
	})

	/* 처음접속시 로그인화면 - 김형석 */
	.state('app.erpia_login', {
		url : '/login',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_login/login.html',
				controller : 'AppCtrl'
			}
		}
	})

	/* 이알피아 메인화면(지금은 안씀) - 김형석 */
	.state('app.erpia_main', {
		url : '/main',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_main/main.html',
				controller : 'MainCtrl'
			}
		}
	})

	/* scm - 메인화면 - 이경민 */
	.state('app.erpia_scmhome', {
		url : '/scmhome',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_scmhome/scmhome.html',
				controller : 'ScmUser_HomeCtrl'
			}
		}
	})

	/* erpia - 메인화면 - 이경민 */
	.state('app.slidingtab', {
		url : '/slidingtab',
		views : {
			'menuContent' : {
				templateUrl : 'slidingtab/slidingTabsUsingRepeat.html',
				controller : 'IndexCtrl'
			}
		}
	})

	/* 최초로그인시 - 약관동의체크화면 - 김형석 */
	.state('app.agreement', {
		url : '/agreement',
		views : {
			'menuContent' : {
				templateUrl : 'side/agreement.html',
				controller : 'AppCtrl'
			}
		}
	})

	/* 최초로그인시 - 인증번호요청화면 - 김형석 */
	.state('app.mobile_certification', {
		url : '/certification',
		views : {
			'menuContent' : {
				templateUrl : 'side/certification.html',
				controller : 'AppCtrl'
			}
		}
	})

	/* 거래명세서 - 페이지접속 인증모달 - 이경민 */
	.state('app.check_Sano', {
		url : '/check_Sano',
		views : {
			'menuContent' : {
				templateUrl : 'side/check_Sano.html',
			}
		}
	})

	/* 거래명세서 - 리스트화면 - 이경민 */
	.state('app.tradeList', {
		url : '/tradeList',
		views : {
			'menuContent' : {
				templateUrl : 'side/tradeList.html',
				controller : 'tradeCtrl'
			}
		}
	})

	/* 거래명세서 - 상세조회화면 - 이경민 */
	.state('app.trade_Detail', {
		url : '/trade_Detail',
		views : {
			'menuContent' : {
				templateUrl : 'side/trade_Detail.html',
				controller : 'tradeCtrl'
			}
		}
	})

	/* 거래명세서 - 프린트화면(구현적용 안됨) - 이경민 */
	.state('app.trade_Detail_Print', {
		url : '/trade_Detail_Print',
		views : {
			'menuContent' : {
				templateUrl : 'side/trade_Detail_Print.html',
				controller : 'tradeCtrl'
			}
		}
	})

	/* 게시판 - 모드선택화면 - 김형석 */
	.state('app.erpia_board', {
		url : '/board',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_board/board.html',
				controller : 'BoardSelectCtrl'
			}
		}
	})

	/* 게시판 - 상세화면 - 김형석 */
	.state('app.erpia_board-Main', {
		url : '/board/Main',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_board/board-main.html',
				controller : 'BoardMainCtrl'
			}
		}
	})

	/* CS - 가입상담화면 - 김형석 */
	.state('app.erpia_cs', {
		url : '/cs',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_cs/cs.html',
				controller : 'CsCtrl'
			}
		}
	})

	/* push - push받은 목록화면 - 김형석 */
	.state('app.erpia_push', {
		url : '/push',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_push/push.html',
				controller : 'PushCtrl'
			}
		}
	})

	// /* push - push내용상세화면 - 김형석 */
	// .state('app.erpia_push.push-detail', {
	// 	url : '/PushList/:Seq',
	// 	views : {
	// 		'menuContent' : {
	// 			templateUrl : 'erpia_push/push-detail.html',
	// 			controller : 'PushDetailCtrl'
	// 		}
	// 	}
	// })

	/* 하단탭메뉴 - 로그인전 - ERPIA소개 - 이경민 */
	.state('app.erpia_introduce', {
		url : '/introduce',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_introduce/erpiaIntroduce.html',
				controller : 'CsCtrl'
			}
		}
	})

	/* 하단탭메뉴 - 로그인전 - ERPIA홈페이지 - 이경민 */
	.state('app.erpia_homepage', {
		url : '/homepage',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_introduce/erpia_homepage.html',
				controller : 'CsCtrl'
			}
		}
	})

	/* erpia부가서비스소개 화면 - 이경민 */
	.state('app.erpia_servicelist', {
		url : '/servicelist',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_servicelist/erpiaServicelist.html',
			}
		}
	})

	/* APP설정 - 리스트화면 - 김형석 */
	.state('app.config', {
		url : '/config',
		views : {
			'menuContent' : {
				templateUrl : 'config/home.html',
				controller : 'configCtrl'
			}
		}
	})

	/* APP설정 - 버전정보화면 - 김형석 */
	.state('app.config-Info', {
		url : '/config/Info',
		views : {
			'menuContent' : {
				templateUrl : 'config/Info.html',
				controller : 'configCtrl_Info'
			}
		}
	})

	/* APP설정 - 모바일공지사항 - 김형석 */
	.state('app.config-notice', {
		url : '/config/notice',
		views : {
			'menuContent' : {
				templateUrl : 'config/notice.html',
				controller : 'configCtrl_Notice'
			}
		}
	})

	/* APP설정 - 고객센터(약관/개인정보 취급방침) - 김형석 */
	.state('app.config-custom', {
		url : '/config/custom',
		views : {
			'menuContent' : {
				templateUrl : 'config/custom.html',
				controller : 'configCtrl_Info'
			}
		}
	})

	/* APP설정 - 푸쉬알림여부설정화면 - 김형석 */
	.state('app.config-alarm', {
		url : '/config/alarm',
		views : {
			'menuContent' : {
				templateUrl : 'config/alarm.html',
				controller : 'configCtrl_alarm'
			}
		}
	})

	/* APP설정 - 통계리포트 리스트설정화면 - 이경민 */
	.state('app.config-statistics', {
		url : '/config/statistics',
		views : {
			'menuContent' : {
				templateUrl : 'config/statistics.html',
				controller : 'configCtrl_statistics'
			}
		}
	})


	/* 환경설정 -> 로그인 설정 - 김형석 */
	.state('app.config-loginConfig', {
		url : '/config/loginConfig',
		views : {
			'menuContent' : {
				templateUrl : 'config/loginConfig.html',
				controller : 'configCtrl_login'
			}
		}
	})

	/* 환경설정 -> 비밀번호변경  설정 - 김형석 */
	.state('app.config-pwdchange', {
		url : '/config/pwdchange',
		views : {
			'menuContent' : {
				templateUrl : 'config/pwdchange.html',
				controller : 'configCtrl_login'
			}
		}
	})

	/* 환경설정 -> 로그조회  - 김형석 */
	.state('app.config-loginLog', {
		url : '/config/loginLog',
		views : {
			'menuContent' : {
				templateUrl : 'config/loginLog.html',
				controller : 'configCtrl_login'
			}
		}
	})

///////////////////////////////////////////////////////////// 매입&매출관련 //////////////////////////////////////////////////////////

	/* 매입&매출 환경설정 - 이경민 */
	.state('app.m_Setup', {
		url : '/meaipchul/m_Setup',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/m_Setup.html',
				controller : 'MconfigCtrl'
			}
		}
	})

	/* 매입전표조회 - 이경민 */
	.state('app.meaip_page', {
		url : '/meaip_page',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/meaip_page.html',
				controller : 'MLookupCtrl'
			}
		}
	})

	/* 매출전표조회 - 이경민 */
	.state('app.meachul_page', {
		url : '/meachul_page',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/meachul_page.html',
				controller : 'MLookupCtrl'
			}
		}
	})

	/* 매입전표상세조회 - 이경민 */
	.state('app.meaip_depage', {
		url : '/meaip_depage',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/meaip_depage.html',
				controller : 'MLookup_DeCtrl'
			}
		}
	})

	/* 매출전표상세조회 - 이경민 */
	.state('app.meachul_depage', {
		url : '/meachul_depage',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/meachul_depage.html',
				controller : 'MLookup_DeCtrl'
			}
		}
	})

	/* 매입등록 - 이경민 */
	.state('app.meaip_IU', {
		url : '/meaip_IU',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/meaip_IU.html',
				controller : 'MiuCtrl'
			}
		}
	})

	/* 매출등록 - 이경민 */
	.state('app.meachul_IU', {
		url : '/meachul_IU',
		views : {
			'menuContent' : {
				templateUrl : 'meaipchul/meachul_IU.html',
				controller : 'MiuCtrl'
			}
		}
	})


	/* 재고메인화면 - 이경민 */
	.state('app.jegoMain', {
		url : '/jegoMain',
		views : {
			'menuContent' : {
				templateUrl : 'jego_manage/jegoMain.html',
				controller : 'jegoCtrl'
			}
		}
	})

	/* 재고메인화면 - 이경민 */
	.state('app.jego_search', {
		url : '/jego_search',
		views : {
			'menuContent' : {
				templateUrl : 'jego_manage/jego_search.html',
				controller : 'jegoCtrl'
			},
		}
	})
	$urlRouterProvider.otherwise('/app/login');
});

