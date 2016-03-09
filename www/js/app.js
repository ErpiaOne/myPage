// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ionic.service.core','ionic.service.push', 'starter.controllers', 'tabSlideBox' ,'ngCordova', 'fcsa-number'
	, 'starter.services'])

 .constant('ERPiaAPI',{
 	url:'http://localhost:8100/include'
 	, imgUrl:'http://localhost:8100/erpia_update/img'
 	, toast:'N'
 })

//실제 사용시
// .constant('ERPiaAPI',{
// 	url:'http://www.erpia.net/include'
// 	, imgUrl:'http://erpia2.godohosting.com/erpia_update/img'
// 	, toast:'Y'
// })

.run(function($ionicPlatform, $ionicPush, $location, $ionicUser, $rootScope, $ionicHistory, $state, $ionicPopup) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		ionic.Platform.fullScreen();
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		
        if(window.StatusBar) {
			StatusBar.styleDefault();
		}
		$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
		    // alert("Successfully registered token " + data.token);
		    console.log('Ionic Push: Got token ', data.token, data.platform);
		    $rootScope.token = data.token;
		    //디바이스 토큰 값 받는곳
		});
		//★push regist
		console.log('Ionic Push: Registering user');
		var user = $ionicUser.get();
		if(!user.user_id) {
			// Set your user_id here, or generate a random one.
			user.user_id = $ionicUser.generateGUID();
			$rootScope.UserKey = user.user_id
		};

		// Metadata
		angular.extend(user, {
			name: 'ERPiaUser',
			bio: 'ERPiaPush'
		});
//----------------뒤로가기 마지막페이지일때 ....----
		$ionicPlatform.registerBackButtonAction(function(e){
		    if ($location.url()=='/app/main') { //현재 페이지 url이 메인일 때,
		      $ionicPopup.show({
				title: '경고',
				subTitle: '',
				content: '앱을 종료하시겠습니까?',
				buttons: [
					{ text: 'No',
						onTap: function(e){
							$rootScope.backButtonPressedOnceToExit = false;
						}
					},
					{
						text: 'Yes',
						type: 'button-positive',
						onTap: function(e) {
						 ionic.Platform.exitApp();
						}
					},
				]
			})
		     
		    }

		    else if ($ionicHistory.backView()) { // 상단에 뒤로가기버튼이 true일때,
		    	if($location.url()=='/app/meaip_depage'){
		    		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		    		location.href = '#/app/meaip_page';
		    	}else if($location.url()=='/app/meachul_depage'){
		    		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		    		location.href = '#/app/meachul_page';
				}else if($location.url()=='/app/meaip_IU'||$location.url()=='/app/meachul_IU'){  		
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
								    $ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		    						location.href = '#/app/meaip_page';
								}else{ /* 매출일 경우 */
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
				           { text: 'No',
				            onTap: function(e){
				              $ionicHistory.goBack(); 
				            }
				           },
				           {
				             text: 'Yes',
				             type: 'button-positive',
				             onTap: function(e) {
				             	if($scope.setupData.basic_Ch_Code == '000'){//창고가 선택되지 않았을때.
				             		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('창고를 선택해주세요.', 'long', 'center');
									else alert('창고를 선택해주세요.');
				             	}else {
				             		if($scope.setupData.state == 0) var mode = 'update';
				             		else var mode = 'insert';

				             		MconfigService.configIU($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.setupData, mode)
										.then(function(data){
											console.log('Y?',data.list[0].rslt);
											if(data.list[0].rslt == 'Y'){
												$ionicHistory.goBack();
											}else{
												alert('수정에 성공하지 못하였습니다');
												if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수정에 성공하지 못하였습니다', 'long', 'center');
												else alert('수정에 성공하지 못하였습니다');
											}
											
										})
				             	}
				             }
				           },
				         ]
				        })
		    	}else{$ionicHistory.goBack();}
		      		$rootScope.backButtonPressedOnceToExit = false;	
		    }else { // 현재페이지가 메인이 아니면서 더이상 뒤로갈 곳이 없을 때
		      $rootScope.backButtonPressedOnceToExit = false;
			   
		      window.plugins.toast.showShortCenter(
		        "메인으로 이동합니다.",function(a){},function(b){}
		      );
		      // $state.go('app.meaip_page', {}, {location:'replace'});
		     $ionicHistory.clearCache();
			 $ionicHistory.clearHistory();
			 $ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		     location.href = '#/app/main';

		     $rootScope.backButtonPressedOnceToExit = true;
		      // setTimeout(function(){
		      	
		      //    $rootScope.backButtonPressedOnceToExit = true;
		        
		      // },500);
		    }
		    e.preventDefault();
		    return false;
		  },101);
		// Identify your user with the Ionic User Service
		$ionicUser.identify(user).then(function(){
			//$scope.identified = true;
			console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
		});


		// Register with the Ionic Push service.  All parameters are optional.
		$ionicPush.register({
			canShowAlert: true, //Can pushes show an alert on your screen?
			canSetBadge: true, //Can pushes update app icon badges?
			canPlaySound: true, //Can notifications play a sound?
			canRunActionsOnWake: true, //Can run actions outside the app,
			
			onNotification: function(notification) {
				// Handle new push notifications here
				console.log(notification);
				//notification.message;  푸시 알람 내용
				if(notification.payload){	
					//notification.payload.payload.$state 푸시에서 명시한 로드될 화면
					if(notification.payload.payload.$state === "app.erpia_board-Main"){
						// alert("tab.chats");
						//$rootScope.boardIndex = $rootScope.BoardParam
						//$state.go("app.erpia_board-Main")
						if(notification.payload.payload.$BoardParam === "0"){
							$rootScope.boardIndex = notification.payload.payload.$BoardParam
						}else if(notification.payload.payload.$BoardParam === "1"){
							$rootScope.boardIndex = notification.payload.payload.$BoardParam
						}else if(notification.payload.payload.$BoardParam === "2"){
							$rootScope.boardIndex = notification.payload.payload.$BoardParam
						}else if(notification.payload.payload.$BoardParam === "4"){
							$rootScope.boardIndex = notification.payload.payload.$BoardParam
						}							
					}
				}
			}
		});
	});
	$rootScope.goHome = function(userType){
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		switch($rootScope.userType){
			case 'ERPia': location.href = '#/app/slidingtab'; break;
			case 'SCM' : location.href = '#/app/scmhome'; break;
			case 'Geust': location.href = '#/app/sample/Main'; break;
		} 
	}
	$rootScope.goto_with_clearHistory = function(goto_Href){
		$ionicHistory.clearCache();
		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		if(goto_Href == '#app/meachul_page') $rootScope.distinction = 'meachul';
		else if(goto_Href == '#app/meaip_page') $rootScope.distinction = 'meaip';
		location.href = goto_Href;
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

// 	// if none of the above states are matched, use this as the fallback
// 	$urlRouterProvider.otherwise('/app/slidingtab');
// });
// device token(iPhone6 plus) : 1d1070d82459a34181921255227fca4d55d87692f68e498e6e0d1e5d953a8abb

.config(['$ionicAppProvider', function($ionicAppProvider) {
	$ionicAppProvider.identify({
      	app_id: 'b94db7cd', //app id
      	// api_key:'eaed7668bef9fb66df87641b2b8e100084454e528d5f3150',		// public key 개발테스트시 
      	api_key:'7a751bc2857d64eeecdd7c9858dd2e0edb0315f621497ecc', 	// private key 실적용시
		// dev_push: true // 개발테스트시
		dev_push: false // 실적용시
	});
}])
// .config(function($ionicConfigProvider) {
// 	$ionicConfigProvider.views.maxCache(5);
// 	// note that you can also chain configs
// 	$ionicConfigProvider.backButton.text('Go Back').icon('ion-chevron-left');
// })

.config(['fcsaNumberConfigProvider', function(fcsaNumberConfigProvider) { // input에 숫자입력시 천자리마다 콤마를 찍어주는 플러그인 기본옵션부분
  fcsaNumberConfigProvider.setDefaultOptions({
    min: 0
  });
}])


.config(function($stateProvider, $urlRouterProvider, $ionicAppProvider) {
	$stateProvider
	
	.state('app', {
		url : '/app',
		abstract : true,
		templateUrl : 'side/menu.html',
		controller : 'AppCtrl'
	})

	.state('app.erpia_main', {
		url : '/main',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_main/main.html',
				controller : 'MainCtrl'
			}
		}
	})

	.state('app.erpia_login', {
		url : '/login',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_login/login.html'
			}
		}
	})
  
	.state('app.erpia_scmhome', {
		url : '/scmhome',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_scmhome/scmhome.html',
				controller : 'ScmUser_HomeCtrl'
			}
		}
	})

	.state('app.slidingtab', {
		url : '/slidingtab',
		views : {
			'menuContent' : {
				templateUrl : 'slidingtab/slidingTabsUsingRepeat.html',
				controller : 'IndexCtrl'
			}
		}
	})

	.state('app.agreement', {
		url : '/agreement',
		views : {
			'menuContent' : {
				templateUrl : 'side/agreement.html',
				controller : 'AppCtrl'
			}
		}
	})

	.state('app.mobile_certification', {
		url : '/certification',
		views : {
			'menuContent' : {
				templateUrl : 'side/certification.html',
				controller : 'AppCtrl'
			}
		}
	})
	/////////////////////////////////////trade////////////////////////////////////
	.state('app.check_Sano', {
		url : '/check_Sano',
		views : {
			'menuContent' : {
				templateUrl : 'side/check_Sano.html',
				//controller : 'tradeCtrl'
			}
		}
	})
	.state('app.tradeList', {
		url : '/tradeList',
		views : {
			'menuContent' : {
				templateUrl : 'side/tradeList.html',
				controller : 'tradeCtrl'
			}
		}
	})
	.state('app.trade_Detail', {
		url : '/trade_Detail',
		views : {
			'menuContent' : {
				templateUrl : 'side/trade_Detail.html',
				controller : 'tradeCtrl'
			}
		}
	})
	.state('app.trade_Detail_Print', {
		url : '/trade_Detail_Print',
		views : {
			'menuContent' : {
				templateUrl : 'side/trade_Detail_Print.html',
				controller : 'tradeCtrl'
			}
		}
	})
	.state('app.erpia_board', {
		url : '/board',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_board/board.html',
				controller : 'BoardSelectCtrl'
			}
		}
	})

	.state('app.erpia_board-Main', {
		url : '/board/Main',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_board/board-main.html',
				controller : 'BoardMainCtrl'
			}
		}
	})

	.state('app.erpia_cs', {
		url : '/cs',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_cs/cs.html',
				controller : 'CsCtrl'
			}
		}
	})

	.state('app.erpia_push', {
		url : '/push',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_push/push.html',
				controller : 'PushCtrl'
			}
		}
	})

	.state('app.erpia_push.push-detail', {
		url : '/PushList/:Seq',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_push/push-detail.html',
				controller : 'PushDetailCtrl'
			}
		}
	})

	.state('app.erpia_introduce', {
		url : '/introduce',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_introduce/erpiaIntroduce.html',
				// controller : 'CsCtrl'
			}
		}
	})

	.state('app.erpia_servicelist', {
		url : '/servicelist',
		views : {
			'menuContent' : {
				templateUrl : 'erpia_servicelist/erpiaServicelist.html',
				// controller : 'CsCtrl'
			}
		}
	})

	////////////////////////////////////config///////////////////////////////////
	.state('app.config', {
		url : '/config',
		views : {
			'menuContent' : {
				templateUrl : 'config/home.html',
				controller : 'configCtrl'
			}
		}
	})
	.state('app.config-Info', {
		url : '/config/Info',
		views : {
			'menuContent' : {
				templateUrl : 'config/Info.html',
				controller : 'configCtrl_Info'
			}
		}
	})
	.state('app.config-notice', {
		url : '/config/notice',
		views : {
			'menuContent' : {
				templateUrl : 'config/notice.html',
				controller : 'configCtrl_Info'
			}
		}
	})
	.state('app.config-custom', {
		url : '/config/custom',
		views : {
			'menuContent' : {
				templateUrl : 'config/custom.html',
				controller : 'configCtrl_Info'
			}
		}
	})
	.state('app.config-alarm', {
		url : '/config/alarm',
		views : {
			'menuContent' : {
				templateUrl : 'config/alarm.html',
				controller : 'configCtrl_alarm'
			}
		}
	})
	.state('app.config-statistics', {
		url : '/config/statistics',
		views : {
			'menuContent' : {
				templateUrl : 'config/statistics.html',
				controller : 'configCtrl_statistics'
			}
		}
	})
	.state('app.config-loginConfig', {
		url : '/config/loginConfig',
		views : {
			'menuContent' : {
				templateUrl : 'config/loginConfig.html',
				controller : 'configCtrl_login'
			}
		}
	})
	/////////////////////////////////////tab////////////////////////////////////
	.state('app.tab', {
		url : '/tab',
		views : {
			'menuContent' : {
				templateUrl : 'tab/tabs.html'				 
			}
		}
	})
 // 	.state('app.tab.dash', {
	// 	url : '/dash',
	// 	views : {
	// 		'tab-dash' : {
	// 			templateUrl : 'tab/tab-dash.html'
				
	// 		}
	// 	}
	// })

 //  	.state('app.tab.chats', {
	// 	url : '/chats',
	// 	views : {
	// 		'tab-chats' : {
	// 			templateUrl : 'tab/tab-chats.html',
	// 			controller : 'ChatsCtrl'
	// 		}
	// 	}
	// })

	// .state('app.tab.chat-detail', {
	// 	url : '/chats/:chatId',
	// 	views : {
	// 		'tab-chats' : {
	// 			templateUrl : 'tab/chat-detail.html',
	// 			controller : 'ChatDetailCtrl'
	// 		}
	// 	}
	// })

	// .state('app.tab.account', {
	// 	url : '/account',
	// 	views : {
	// 		'tab-account' : {
	// 			templateUrl : 'tab/tab-account.html',
	// 			controller : 'AccountCtrl'
	// 		}
	// 	}
	// })

  ////////////////////////////////side///////////////////////////////////
 //    .state('app.browse', {
	// 	url : '/browse',
	// 	views : {
	// 		'menuContent' : {
	// 			templateUrl : 'side/browse.html'
	// 		}
	// 	}
	// })

 //    .state('app.search', {
	// 	url : '/search',
	// 	views : {
	// 		'menuContent' : {
	// 			templateUrl : 'side/search.html'
	// 		}
	// 	}
	// })

	// .state('app.playlists', {
	// 	url : '/playlists',
	// 	views : {
	// 		'menuContent' : {
	// 			templateUrl : 'side/playlists.html',
	// 			controller : 'PlaylistsCtrl'
	// 		}
	// 	}
	// })

	// .state('app.single', {
	// 	url : '/playlists/:playlistId',
	// 	views : {
	// 		'menuContent' : {
	// 			templateUrl : 'side/playlist.html',
	// 			controller : 'PlaylistCtrl'
	// 		}
	// 	}
	// });

	// if none of the above states are matched, use this as the fallback




	/////////////////////////////////////////////////////////////매입&매출 통합 다시//////////////////////////////////////////////////////////
		///////////////////////////// 매출등록/수정페이지  /////////////////////////////////////
	
.state('app.m_Setup', { // 매입&매출 환경설정
	url : '/meaipchul/m_Setup',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/m_Setup.html',
			controller : 'MconfigCtrl'
		}
	}
})
.state('app.meaip_page', { // 매입전표조회
	url : '/meaip_page',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/meaip_page.html',
			controller : 'MLookupCtrl'
		}
	}
})
.state('app.meachul_page', { //매출전표조회
	url : '/meachul_page',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/meachul_page.html',
			controller : 'MLookupCtrl'
		}
	}
})
.state('app.meaip_depage', { //매입전표상세조회
	url : '/meaip_depage',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/meaip_depage.html',
			controller : 'MLookup_DeCtrl'
		}
	}
})
.state('app.meachul_depage', { //매출전표상세조회
	url : '/meachul_depage',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/meachul_depage.html',
			controller : 'MLookup_DeCtrl'
		}
	}
})
.state('app.meaip_IU', { //매입등록
	url : '/meaip_IU',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/meaip_IU.html',
			controller : 'MiuCtrl'
		}
	}
})
.state('app.meachul_IU', { //매출등록
	url : '/meachul_IU',
	views : {
		'menuContent' : {
			templateUrl : 'meaipchul/meachul_IU.html',
			controller : 'MiuCtrl'
		}
	}
});

	$urlRouterProvider.otherwise('/app/main');
});

