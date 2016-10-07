angular.module('starter.services', [])

/* InnerHtml을 사용하기 위한 compiler - 김형석[2015-12] */
.directive('compileData', function ( $compile ) {
	return {
		scope: true,
		link: function ( scope, element, attrs ) {
			var elmnt;
			attrs.$observe( 'template', function ( myTemplate ) {
				if ( angular.isDefined( myTemplate ) ) {
					elmnt = $compile( myTemplate )( scope );
					element.html(""); // dummy "clear"
					element.append( elmnt );
				}
			});
		}
	};
})

/* 플러그인(원시그널 푸쉬) 관련 설정 - 김형석[2015-12] */
.factory('app', function($rootScope, $state, $ionicPopup, $cordovaInAppBrowser, $ionicSlideBoxDelegate){
	return{
		didReceiveRemoteNotificationCallBack : function(jsonData) {		// 푸쉬알림을 받았을 때 발생하는 콜백 이벤트
			var browseroptions = {
				location: 'yes',
				clearcache: 'yes',
				toolbar: 'yes'
			};
			$rootScope.PushData = {};
			if (jsonData.additionalData && jsonData.additionalData.stacked_notifications) {
				var notifications = jsonData.additionalData.stacked_notifications;
				for (var i = 0; i < notifications.length; i++) {
					console.log(notifications[i]);
				}
			}else{
				$ionicPopup.show({
					title: '푸쉬알림',
					subTitle: '페이지를 이동하시겠습니까?',
					content: jsonData.message,
					buttons: [
						{ 
							text: 'No',
							onTap: function(e){ }
						},
						{
							text: '이동',
							type: 'button-positive',
							onTap: function(e) {
								$rootScope.PushData = jsonData.additionalData;
								if($rootScope.PushData && $rootScope.loginState =='E'){
									if($rootScope.PushData.state == "app.erpia_board-Main"){
										$state.go($rootScope.PushData.state);
										$rootScope.boardIndex = $rootScope.PushData.state;

										switch ($rootScope.PushData.BoardParam){
											case '0': $rootScope.boardIndex = 0; break;
											case '1': $rootScope.boardIndex = 1; break;
											case '2': $rootScope.boardIndex = 2; break;
											case '3': $rootScope.boardIndex = 3; break;
										}
										$ionicSlideBoxDelegate.slide($rootScope.boardIndex, 500);							
									}else if($rootScope.PushData.state == "app.tradeList"){		//거래명세서 도착
										$state.go("app.tradeList");
									}else if($rootScope.PushData.state != "" || $rootScope.PushData.state != undefined || $rootScope.PushData.state != "undefined"){ 	//기타 이벤트
										if (jsonData.additionalData) {
											if (jsonData.additionalData.launchURL){
												$cordovaInAppBrowser.open(jsonData.additionalData.launchURL, '_blank', browseroptions)
												.then(function(event) {
												// success
												})
												.catch(function(event) {
												// error
												});
											}
										}
									}
								}
							}
						},
					]
				})
			}
		}
	}
})

/* 플러그인 관련 설정(로컬스토리지) - 김형석[2015-12] */
.factory('$localstorage', ['$window', function($window) {
	return {
		set: function(key, value) {			// 로컬스토리지에 저장시 $localstorage.set(키, 저장할 내용 값)로 쓴다. 
			$window.localStorage[key] = value;
		},
		get: function(key, defaultValue) {		// 로컬스토리지에서 불러올 때  $localstorage.get(키, 기본값)로 쓴다. 
			return $window.localStorage[key] || defaultValue;
		},
		setObject: function(key, value) {		// 로컬스토리지에 배열처럼 쓰이는 오브젝트 저장시 $localstorage.setObject(키, 저장할 내용 값)로 쓴다. 
			$window.localStorage[key] = JSON.stringify(value);
		},
		getObject: function(key) {			// 로컬스토리지에서 배열처럼 쓰이는 오브젝트를 불러올 때  $localstorage.getObject(키, 기본값)로 쓴다. 
			return JSON.parse($window.localStorage[key] || '{}');
		}
	}
}])

/* 로그인관련Service - 김형석[2015-12] */
.factory('loginService', function($http, $q, $cordovaToast, ERPiaAPI){
	var comInfo = function(kind, Admin_Code, G_id, G_Pass, phoneNo, UUID){
		if(kind == 'scm_login'){			//scm로그인 
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'kind=Login_Scm&loginType=S&Admin_Code=' + Admin_Code + '&id=' + escape(G_id) + '&pwd=' + G_Pass + '&hp=' + phoneNo + '&mac=' + UUID;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}else if(kind == 'ERPiaLogin'){		//erpia로그인 
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile_Erpia.asp';
			var data = 'kind=Login_ERPia&loginType=E&Admin_Code=' + Admin_Code + '&id=' + escape(G_id) + '&pwd=' + G_Pass + '&hp=' + phoneNo + '&mac=' + UUID;
			
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}else if(kind == 'ComInfo_Erpia'){		// 이알피아 사용자 회사계정정보  불러오기
			var url = ERPiaAPI.url + '/Json_Proc_Mobile_Erpia.asp';
			var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}else if(kind == 'ERPia_Ger_Login'){	// 거래처모드(거래명세서모드) 로그인
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'kind=Login_Normal&loginType=N&Admin_Code=' + Admin_Code + '&id=' + escape(G_id) + '&pwd=' + G_Pass + '&hp=' + phoneNo + '&mac=' + UUID;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					for(var i=0; i < response.data.list.length; i++){
						if(response.data.list[i].cntNotRead == null){
							response.data.list[i].cntNotRead = 0;
						}
					}
					return response;
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('유효한 업체코드가 아닙니다.', 'long', 'center');
					else alert('유효한 업체코드가 아닙니다.');
					return $q.reject(response);
				}
			},function(response){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('유효한 업체코드가 아닙니다.', 'long', 'center');
				else alert('유효한 업체코드가 아닙니다.');
				return $q.reject(response);
			});
		}
	}
	return{
		comInfo: comInfo
	}
})

/* ERPia로그인시 계정권한관현 Service - 이경민[2016-07] */
.factory('PrivService', function($http, $q, ERPiaAPI){ 
	return{
		pricheck : function(Admin_Code, UserId){		// 메인홈(미처리건/미수신건...등등) 정보 조회
			var url = ERPiaAPI.url + '/JSon_Proc_Mypage_Scm_Manage.asp';
			var data = 'Kind=Mobile_Select_User_Priv&Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId);
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data.list;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}, priv_wonga_Check : function(Admin_Code, UserId){		// 메인홈(미처리건/미수신건...등등) 정보 조회
			var url = ERPiaAPI.url + '/JSon_Proc_Mypage_Scm_Manage.asp';
			var data = 'Kind=ERPia_WonGa_Priv&Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId);
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data.list;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});
		}, JegoOpen : function(Admin_Code, UserId, mac){		/* 재고현황 오픈 기념 */
			var url = ERPiaAPI.url + '/JSon_Proc_Mypage_Scm_Manage.asp';
			var data = 'Kind=Jego_Select&Admin_Code=' + Admin_Code + '&id=' + escape(UserId) + '&mac=' + mac + '&loginType=E';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data.list;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}
	};
})

/* ERPia모바일 버튼 로그 기록저장 Service - 이경민[2016-09] */
.factory('ActsService', function($http, $q, ERPiaAPI){ 
	return{
		Acts_save : function(admin_code, id, mac, loginType, M, T){		// 모바일 버튼 로그 기록저장
			var url = ERPiaAPI.url + '/JSon_Proc_Mypage_Scm_Manage.asp';
			var data = 'Kind=Mobile_Acts&admin_code=' + admin_code+ '&id=' + escape(id) +  '&mac=' + mac + '&loginType=' + loginType + '&Module_M=' + M + '&Module_T=' + T;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data.list;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}
	};
})

/* 이알피아계정정보 관련Service - 김형석[2015-12] */
.factory('ERPiaInfoService', function($http, ERPiaAPI){
	var ERPiaInfo = function(kind, Admin_Code, sDate, eDate){		// 이알피아 계정정보 불러오기 
		var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
		var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&sDate=' + sDate + '&eDate=' + eDate;
		return $http.get(url + '?' + data);
	}
	return{
		ERPiaInfo: ERPiaInfo
	}
})

/*로그인 할 때  SCM계정정보  관련Service - 김형석[2015-12]*/
.factory('scmInfoService', function($http, ERPiaAPI){
	var scmInfo = function(kind, BaljuMode, Admin_Code, GerCode, FDate, TDate){			//SCM계정정보 불러오기 
		var url = ERPiaAPI.url + '/JSon_Proc_Multi_Lhk.asp';
		var data = 'Value_Kind=list&kind=' + kind + '&BaljuMode=' + BaljuMode + '&Admin_Code=' + Admin_Code + '&GerCode=' + GerCode;
		data += '&FDate=' + FDate + '&TDate=' + TDate;
		return $http.get(url + '?' + data);
	}
	return{
		scmInfo: scmInfo
	}
})

/* erpia메인페이지관련 Service - 이경민[2015-12] */
.factory('IndexService', function($http, $q, ERPiaAPI){
	return{
		dashBoard : function(kind, Admin_Code, sDate, eDate){		// 메인홈(미처리건/미수신건...등등) 정보 조회
			var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
			var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&sDate=' + sDate + '&eDate=' + eDate;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});

		}, meachulamt : function(Admin_Code){					// 메인홈(금일매출액 & 전일매출액) 조회
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'Kind=Meachul_sum' + '&Admin_Code=' + Admin_Code;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});
		}
	};
})

/* 약관동의관련Service - 김형석[2015-12] */
.factory('CertifyService', function($http, $cordovaToast, $rootScope, ERPiaAPI){
	var url = ERPiaAPI.url + '/Json_Proc_Mobile.asp';

	/* 인증코드요청시  - 김형석 */
	var certify = function(Admin_Code, loginType, ID, G_Code, sms_id, sms_pwd, sendNum, rec_num, UUID, phoneno, DeviceInfo){
		$rootScope.rndNum = Math.floor(Math.random() * 1000000) + 1;

		if ($rootScope.rndNum < 100000) $rootScope.rndNum = '0' + $rootScope.rndNum;

		if(loginType == 'E'){
			url = ERPiaAPI.url + '/Json_Proc_Mobile_Erpia.asp';
			var data = 'Kind=F_Certify&Admin_Code=' + Admin_Code + '&ID=' + escape(ID);
			data += '&Certify_Code=' + $rootScope.rndNum + '&loginType=' + loginType + '&hp=' + rec_num  + '&mac=' + UUID;
			data += '&model=' + DeviceInfo.model + '&platform=' + DeviceInfo.platform + '&originalhp=' + phoneno;
		}else{
			var data = 'Kind=F_Certify&Admin_Code=' + Admin_Code + '&ID=' + escape(ID) + '&G_Code=' + G_Code;
			data += '&Certify_Code=' + $rootScope.rndNum + '&loginType=' + loginType + '&hp=' + rec_num  + '&mac=' + UUID;
			data += '&model=' + DeviceInfo.model + '&platform=' + DeviceInfo.platform + '&originalhp=' + phoneno;
		}
		return $http.get(url + '?' + data).success(function(response){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증코드를 전송했습니다.', 'long', 'center');

			if (response.list[0].Result == '1'){ //사용자 정보 및 인증코드 디비에 저장 후 
				var url = ERPiaAPI.url + '/SCP.asp';
				var data = 'sms_id=' + sms_id + '&sms_pwd=' + sms_pwd + '&send_num=' + sendNum + '&rec_num=' + rec_num;
				data += '&rndNum=' + $rootScope.rndNum + '&SendType=mobile_Certification';
				return $http.get(url + '?' + data);
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('전송실패', 'long', 'center');
				else console.log('전송실패');
			}
		})
	}

	/* 인증번호비교 - 김형석 */
	var check = function(Admin_Code, loginType, ID, G_Code, Input_Code, rec_num, UUID){
		var data ='';
		if(loginType == 'S' || loginType == 'N'){
			url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			data = 'Kind=C_Certify&Admin_Code=' + Admin_Code + '&ID=' + escape(ID) + '&G_Code=' + G_Code;
			data += '&Input_Code=' + Input_Code + '&loginType=' + loginType + '&hp=' + rec_num + '&mac=' + UUID;
		}else if(loginType=='E'){ 
			url = ERPiaAPI.url + '/Json_Proc_Mobile_Erpia.asp';
			// data = 'Kind=ERPiaCertify' + '&Admin_Code=' + Admin_Code + '&uid=' + ID + '&Input_Code=' + Input_Code + '&hp=' + 'test'  + '&mac=' + 'test';
			data = 'Kind=C_Certify&Admin_Code=' + Admin_Code + '&ID=' + escape(ID) + '&G_Code=' + G_Code;
			data += '&Input_Code=' + Input_Code + '&loginType=' + loginType + '&hp=' + rec_num + '&mac=' + UUID;
		}
		return $http.get(url + '?' + data).success(function(response){
			if (response.list[0].Result == '1'){
				switch(loginType){
					case 'S': location.href = "#/app/scmhome"; break;
					case 'E': location.href = "#/app/slidingtab"; break;
					case 'N': location.href = "#/app/main"; break;
				}
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show(response.list[0].Comment, 'long', 'center');
				else alert(response.list[0].Comment);
			}
		})
	}
	return{
		certify: certify,
		check: check
	}
})

/* 거래명세서관련Service - 이경민[216-01] */
.factory('tradeDetailService', function($http, $q, ERPiaAPI, $rootScope) {
	return{
		tradeList: function(Admin_Code, GerCode, type, pg){	// SCM & Nomal접속시 거래명세서 리스트조회
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'Kind=select_Trade_list' + '&Admin_Code=' + Admin_Code + '&GerCode=' + GerCode  + '&loginType=' + type + '&pg=' + pg + '&pg_line=' + 10;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		},readDetail_key: function(Admin_Code, Sl_No){		// 거래명세서조회시 key받아오는부분
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			if($rootScope.distinction == 'meaip') var data ='kind=select_Trade_Detail_Key&Admin_Code=' + Admin_Code + '&iL_No=' + Sl_No;
			else var data = 'Kind=select_Trade_Detail_Key' + '&Admin_Code=' + Admin_Code + '&Sl_No=' + Sl_No;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, readDetail: function(Admin_Code, Sl_No){			// 거래명세서 상세조회
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			if($rootScope.distinction == 'meaip') var data ='kind=select_Trade_Detail_Meaip&Admin_Code=' + Admin_Code + '&iL_No=' + Sl_No;
			else var data = 'Kind=select_Trade_Detail' + '&Admin_Code=' + Admin_Code + '&Sl_No=' + Sl_No;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					for(var i = 0; i > response.data.list.length; i++){
						if(response.data.list[i].G_name1 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea1) * parseInt(response.data.list[i].G_price1) - parseInt(response.data.list[i].G_Gong1);
							response.data.list[i].tax1 = tax;
						}else{
							response.data.list[i].tax1 = 0;
						}
						if(response.data.list[i].G_name2 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea2) * parseInt(response.data.list[i].G_price2) - parseInt(response.data.list[i].G_Gong2);
							response.data.list[i].tax2 = tax;
						}else{
							response.data.list[i].tax2 = '.';
						}
						if(response.data.list[i].G_name3 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea3) * parseInt(response.data.list[i].G_price3) - parseInt(response.data.list[i].G_Gong3);
							response.data.list[i].tax3 = tax;
						}else{
							response.data.list[i].tax3 = '.';
						}
						if(response.data.list[i].G_name4 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea4) * parseInt(response.data.list[i].G_price4) - parseInt(response.data.list[i].G_Gong4);
							response.data.list[i].tax4 = tax;
						}else{
							response.data.list[i].tax4 = '.';
						}
						if(response.data.list[i].G_name5 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea5) * parseInt(response.data.list[i].G_price5) - parseInt(response.data.list[i].G_Gong5);
							response.data.list[i].tax5 = tax;
						}else{
							response.data.list[i].tax5 = '.';
						}
						if(response.data.list[i].G_name6 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea6) * parseInt(response.data.list[i].G_price6) - parseInt(response.data.list[i].G_Gong6);
							response.data.list[i].tax6 = tax;
						}else{
							response.data.list[i].tax6 = '.';
						}
						if(response.data.list[i].G_name7 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea7) * parseInt(response.data.list[i].G_price7) - parseInt(response.data.list[i].G_Gong7);
							response.data.list[i].tax7 = tax;
						}else{
							response.data.list[i].tax7 = '.';
						}
						if(response.data.list[i].G_name8 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea8) * parseInt(response.data.list[i].G_price8) - parseInt(response.data.list[i].G_Gong8);
							response.data.list[i].tax8 = tax;
						}else{
							response.data.list[i].tax8 = '.';
						}
						if(response.data.list[i].G_name9 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea9) * parseInt(response.data.list[i].G_price9) - parseInt(response.data.list[i].G_Gong9);
							response.data.list[i].tax9 = tax;
						}else{
							response.data.list[i].tax9 = '.';
						}
						if(response.data.list[i].G_name10 != null){
							var tax = 0;
							var tax =  parseInt(response.data.list[i].G_ea10) * parseInt(response.data.list[i].G_price10) - parseInt(response.data.list[i].G_Gong10);
							response.data.list[i].tax10 = tax;
						}else{
							response.data.list[i].tax10 = '.';
						}
					}
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, getCntNotRead: function(Admin_Code, checkNotRead, loginType, pg){		// ERPIA거래명세서 조회
			if(checkNotRead == 'Y'){
				pg = 1;
			}
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'Kind=select_Trade_Admin&Admin_Code=' + Admin_Code + '&checkNotRead=' + checkNotRead + '&loginType=' + loginType + '&pg=' + pg + '&pg_line=10';

			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response.data == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

		}, chkRead: function(Admin_Code, Sl_No, user_id, loginType){				// SCM & Nomal 읽음조회
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'Kind=read_Trade_chk&Admin_Code=' + Admin_Code + '&Sl_No=' + Sl_No + '&id=' + escape(user_id) + '&loginType=' + loginType;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response.data == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		}
	};
})

/* 환경설정-공지사항 관련Service - 김형석 */
.factory('NoticeService', function($http, $q, ERPiaAPI){
	return{
		getList: function(){		// 공지사항 리스트불러오기
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'kind=myPage_Notice';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	};
})

/* 차트관련Service - 이경민[2015-11] */
.factory('statisticService', function($http, $q, ERPiaAPI, $cordovaToast) {
	var titles =  [
		{Idx:0, title:"Meachul_halfyear", name: '홈', icon: 'ion-home'}
		, {Idx:1, title:"meaip_jem", name:'거래처별 매입점유율 TOP10', icon: 'ion-social-buffer'}
		, {Idx:2, title:"meachul_jem", name:'사이트별 매출 점유율', icon: 'ion-monitor'}
		, {Idx:3, title:"brand_top5", name:'브랜드별 매출 TOP5', icon: 'ion-pricetags'}
		, {Idx:4, title:"meachul_top5", name:'상품별 매출 TOP5', icon: 'ion-cube'}
		// , {Idx:5, title:"Meachul_ik", name:'매출이익증감율', icon: 'ion-stats-bars'} // 매출이익증감율 삭제할것.....
		, {Idx:5, title:"meachul_7", name:'매출 실적 추이', icon: 'ion-clipboard'} 
		, {Idx:6, title:"meaip_7", name:'매입 현황', icon: 'ion-android-exit'}
		, {Idx:7, title:"beasonga", name:'금일 출고 현황', icon: 'ion-share'}
		, {Idx:8, title:"beasong_gu", name:'택배사별 구분 건수 통계', icon: 'ion-android-bus'}
		, {Idx:9, title:"meachul_onoff", name:'온오프라인 비교 매출', icon: 'ion-pie-graph'}
		, {Idx:10, title:"banpum", name:'매출반품현황', icon: 'ion-arrow-swap'}
		, {Idx:11, title:"banpum_top5", name:'상품별 매출 반품 건수/반품액 TOP5', icon: 'ion-arrow-return-left'}
		, {Idx:12, title:"meachul_cs", name:'CS 컴플레인 현황', icon: 'ion-person-stalker'}
		, {Idx:13, title:"meaip_commgoods", name:'상품별 매입건수/매입액 TOP5', icon: 'ion-ios-download'}
		, {Idx:14, title:"JeGo_TurnOver", name:'재고회전율TOP5', icon: 'ion-loop'}
		, {Idx:15, title:"beasongb", name:'출고현황', icon: 'ion-android-open'}
		];

	return{
		save : function(kind, mode, Admin_Code, loginType, G_Id, statistic,mac){		// 차트 리스트순서 변경후 저장
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=' + kind + '&mode=' + mode + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + escape(G_Id) + '&statistic=' + statistic+'&mac=' + mac;
			return $http.get(url + '?' + data).then(function(response) {
				if(typeof response.data == 'object'){
					if(response.data.list[0].result == 'Update Success' || response.data.list[0].result == 'Insert Success'){
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('저장되었습니다.', 'short', 'center');
						else alert('Update Success');
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('저장이 실패하였습니다. 잠시후 다시 시도해주세요.', 'short', 'center');
						else alert('저장이 실패하였습니다. 잠시후 다시 시도해주세요.');
					}
					return response.data;	
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, title : function(kind, mode, Admin_Code, loginType, G_Id, mac){			// 차트 타이틀전체조회
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=' + kind + '&mode=' + mode + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + escape(G_Id) +'&mac=' + mac;
			return $http.get(url + '?' + data).then(function(response) {
				if(typeof response.data == 'object'){
					for(var i=0; i<response.data.list.length; i++){
						var index = parseInt(response.data.list[i].Idx);
						response.data.list[i].title = titles[index].title; 
						response.data.list[i].name = titles[index].name; 
						response.data.list[i].icon = titles[index].icon;
					}
					return response.data.list;	
				}else{
				return $q.reject(response.data);
				}
			}, function(response){
				return $q.rejec(response.data);
			})

		}
	}
})

/* 차트 새로 개편 - 이경민 20160811 */
.factory('chart_statisticService', function($http, $q, ERPiaAPI) {
	return{
		chart : function(kind, mode, Admin_Code, loginType, G_Id, chart_idx,mac){			// 조회된 리스트의 저장되어있는 순번조회
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=myPage_Config_Stat&mode=select_Title&Admin_Code=' + Admin_Code + '&loginType=' + loginType;
			data += '&G_Id=' + escape(G_Id) +'&mac=' + mac;
			return $http.get(url + '?' + data).then(function(response) {
				if(typeof response.data == 'object'){
					if(response.data.list.length == 0){
							response.data.list[0] = {cntOrder : '0', idx : '0', url : "", visible : "Y"};
					}
					return response.data;	
				}else{
					return $q.reject(response.data);
				}
			})
		}
	}
})

/* 환경설정-푸쉬알림 설정 Service - 김형석[2016-03] */
.factory('alarmService', function($http, $q, ERPiaAPI){
	var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
	return{
		select : function(kind, Admin_Code, loginType, G_Id, mac){		// 푸쉬알림설정값 불러오기
			var data = 'Value_Kind=list&Kind=' + kind + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + escape(G_Id) +'&mac=' + mac;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, save : function(kind, Admin_Code, loginType, G_Id, alarm, mac){	// 푸쉬알림 설정값 저장하기
			var data = 'Value_Kind=list&Kind=' + kind + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + escape(G_Id) + '&alarm=' + alarm + '&mac=' + mac;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	}
})

/* 푸쉬유저체크 Service - 김형석[2016-04] */
.factory('pushInfoService', function($http, ERPiaAPI){
	var pushInfo = function(Admin_Code, UserId, kind, Mode, UserKey, Token, ChkAdmin, DeviceOS, sDate, eDate){ 			// 기존에 저장되어있는 푸쉬유저정보 있나  불러오기
		var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
		var data = 'Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId) + '&kind=' + kind + '&Mode=' + Mode + '&UserKey=' + UserKey + '&Token=' + Token 
		data += '&ChkAdmin=' + ChkAdmin + '&DeviceOS=' + DeviceOS + '&sDate=' + sDate + '&eDate=' + eDate;

		return $http.get(url + '?' + data); //여기까지함111
	}
	return{
		pushInfo: pushInfo
	}
})

/* CS관련 Service - 김형석[2016-04] */
.factory('csInfoService', function($http, ERPiaAPI){
	var csInfo = function(Admin_Code, UserId, kind, chkAdmin, comName, writer, subject, tel, sectors, interestTopic, inflowRoute, contents){		// 상담문의하기 정보 저장하기 
		console.log('csInfoService AND csInfo');
		var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
		var data = 'Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId )+ '&kind=' + kind + '&chkAdmin=' + chkAdmin + '&comName=' + comName 
		data += '&writer=' + writer + '&subject=' + subject + '&tel=' + tel + '&sectors=' + sectors + '&interestTopic=' + interestTopic
		data += '&inflowRoute=' + inflowRoute + '&contents=' + contents;
		return $http.get(url + '?' + data);
	}
		
	var cs_certify = function(rndNum,phoneno){			// 상담문의 모바일 인증번호 보내기 
		console.log('csInfoService AND cs_certify');
		var url = ERPiaAPI.url + '/SCP.asp';
		var data = 'sms_id=erpia&sms_pwd=a12345&send_num=070-7012-3071&rec_num=' + phoneno;
		data += '&rndNum=' + rndNum + '&SendType=mobile_Certification';
		return $http.get(url + '?' + data);
	}

	var cs_message = function(rndNum,phoneno, idx){			// 문의글 등록시 영업담당자에게 문자 발송 추가 - 이경민 20160928
		console.log('csInfoService AND cs_message');
		var url = ERPiaAPI.url + '/SCP.asp';
		var data = 'sms_id=erpia&sms_pwd=a12345&send_num=070-7012-3071&rec_num=' + '01056579731';
		data += '&rndNum=' + rndNum + '&SendType=mobile_CS&idx=' + idx;
		return $http.get(url + '?' + data);
	}

	return{
		csInfo: csInfo,
		cs_certify: cs_certify,
		cs_message: cs_message
	}
})

/* 로그인단말기 정보관련 Service - 김형석[2016-02] */
.factory('uuidService', function($http, $q, $rootScope, ERPiaAPI, $cordovaToast){
	return{
			//http://www.erpia.net/include/JSon_Proc_Mobile_Erpia.asp?Kind=get_Log&Admin_Code=onz&loginType=E&id=khs239
		get_Log : function(Admin_Code, loginType, id){			// 로그인 로그정보 불러오기 (나중에 리스트 뿌릴 때 사용할 예정 )
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile_Erpia.asp';
			var data = 'Kind=get_Log&Admin_Code=' + Admin_Code + 'loginType=' + loginType + '&id=' + escape(id);
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, save_Log : function(uuid, admin_code, loginType, id, phoneno, DeviceInfo){			// 로그인 로그정보저장
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile_Erpia.asp';
			var data = 'Kind=save_Log&Mac=' + uuid + '&admin_code=' + admin_code + '&loginType=' + loginType + '&id=' + escape(id);
			data += '&model=' + DeviceInfo.model + '&platform=' + DeviceInfo.platform + '&originalhp=' + phoneno;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	}
})

/* 게시판관련Service - 김형석[2016-03] */
.factory('BoardService', function($http, $q, ERPiaAPI, $cordovaToast){
	return{
		BoardInfo : function(Admin_Code, UserId, kind, pageCnt){						// 게시판 정보 불러오기(기본)
			var url = ERPiaAPI.url+'/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'kind='+kind+'&Admin_Code='+Admin_Code+'&pageCnt='+pageCnt+'&pageRow=5';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					for(var i=0; i<response.data.list.length; i++){
						oldContent = response.data.list[i].content;
						response.data.list[i].content = oldContent
							.replace(/http:\/\/erpia2.godohosting.com\/erpia_update\/img\/notice\/phj/g, ERPiaAPI.imgUrl + '/notice/phj')
							.replace(/&quot;/g,'')
							.replace(/<img src=/g, '<img width=100% src=');	
					}
					return response.data;
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
					else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
					return $q.reject(response.data);
				}
			}, function(response){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
				else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
				return $q.reject(response.data);
			})

		}, Board_sear : function(Admin_Code, SearchKind, SearchMode, SearchValue, pageCnt){	// 게시판 정보 불러오기(검색어로  검색 시)
			var url = ERPiaAPI.url+'/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'Admin_Code='+Admin_Code+'&kind=ERPia_Mypage_Board_Request_Search&Mode=search&SearchKind=' + SearchKind+ '&SearchMode='+SearchMode+'&SearchValue='+ escape(SearchValue)+'&pageCnt='+pageCnt+'&pageRow=5'
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					if(response.data.list.length>0){
						for(var i=0; i<response.data.list.length; i++){
							oldContent = response.data.list[i].content;
							response.data.list[i].content = oldContent
								.replace(/http:\/\/erpia2.godohosting.com\/erpia_update\/img\/notice\/phj/g, ERPiaAPI.imgUrl + '/notice/phj')
								.replace(/&quot;/g,'')
								.replace(/<img src=/g, '<img width=100% src=');
						}
					}
					return response.data;					
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
					else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
					return $q.reject(response.data);					
				}
			}, function(response){
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
					else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
					return $q.reject(response.data);
			})

		}, QnAinsert : function(Admin_Code, UserId, Subject, Content, pwd){				// 업체별 문의사항 저장
			var url = ERPiaAPI.url+'/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'Admin_Code='+Admin_Code+'&UserId=' + escape(UserId) + '&Kind=ERPia_Mypage_Board_Request_insert&Mode=insert&bSubject='+ escape(Subject)+'&bContent='+escape(Content)+'&bPwd='+pwd;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
					else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
					return $q.reject(response.data);
				}
			}, function(response){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
				else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
				return $q.reject(response.data);
			})
		}
	}
})

/* 푸쉬관련Service - 김형석[2016-03] */
.factory('PushSelectService', function($http, $q, ERPiaAPI){
	var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
	var PushList = [];
	return{
		select : function(UUID){					// 유저가 받은 푸쉬리스트 출력
			// var data = 'Kind=Mobile_Push_Log&Mode=SELECT&mac=' + UUID;
			var data = 'Kind=Mobile_Push_Log&Mode=SELECT&mac=' + UUID;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					PushList = response.data
					return PushList;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	}
})

/* APP시작 연동 - 이경민[2015-10] */
.factory('TestService', function($http, ERPiaAPI){
	var testInfo = function(Admin_Code, UserId, kind, Mode, basic_Subul_Sale_Before, basic_Subul_Meaip_Before){
		var url = ERPiaAPI.url + '/ERPiaApi_TestProject.asp';
		var data = 'Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId) + '&kind=' + kind + '&Mode=' + Mode
		data += '&basic_Subul_Sale_Before=' + basic_Subul_Sale_Before + '&basic_Subul_Meaip_Before=' + basic_Subul_Meaip_Before
		return $http.get(url + '?' + data);
	}
	return{
		testInfo: testInfo
	}
})

/* 차트관련Service - 이경민[2015-12] */
.factory('AmChart_Service', function($http, $q, ERPiaAPI){
	var url = ERPiaAPI.url + '/JSon_Proc_graph.asp';
	return{
		scm_Chart: function(Kind, Value_Kind, Admin_Code, swm_gu, Ger_code){		// scm차트정보 조회
			var data = 'Kind=' + Kind + '&Value_Kind=' + Value_Kind + '&admin_code=' + Admin_Code + '&swm_gu=' + swm_gu + '&Ger_code=' + Ger_code;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, erpia_Chart: function(Kind, Value_Kind, Admin_Code, swm_gu){			// erpia차트정보 조회
			var data = 'Kind=' + Kind + '&Value_Kind=' + Value_Kind + '&admin_code=' + Admin_Code + '&swm_gu=' + swm_gu;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			}) 
		}
	}
	ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meaip_jem&value_kind=meaip_jem&admin_code=" + admin_code + "&swm_gu=" + gu
})

/* 없어도 될듯????*/
.factory('publicFunction', function($ionicHistory){
	return{
		goHome: function(userType){		// 홈으로
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			switch(userType){
				case 'ERPia': location.href = '#/app/slidingtab'; break;
				case 'SCM' : location.href = '#/app/scmhome'; break;
				case 'Geust': location.href = '#/app/sample/Main'; break;
			}
		}
	}
})

////////////////////////////////////////////////////////////// 매입 & 매출 ///////////////////////////////////////////////////////////////////////////////////
/* 환경설정 - 이경민[2015-11] */
.factory('MconfigService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
	return{
		basicSetup: function(admin_code, userid, er_place){		 //환경설정
			console.log("MconfigService and basicSetup");

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&Userid=' + escape(userid)+ '&Kind=ERPia_Config&Mode=select';
			return $http.get(url + '?' + data).then(function(response){

				var data_setup = {
							state : 0,
							basic_Place_Code : '000',//기본매장코드('000'-매장미지정)
							basic_Ch_Code : '101',//기본창고코드
							basic_Dn_Sale : 0, //기본매출(거래처등록지정)
							basic_Dn_Meaip : 0, //기본매입(거래처등록지정)
							basic_Subul_Sale : 1, //기본매출등록수불
							basic_Subul_Meaip : 1, //기본매입등록수불
							basic_Subul_Meaip_Before : 'N',
							basic_Subul_Sale_Before : 'N'
						};

				if(typeof response == 'object'){	//조회된 환경설정이 있을경우.
					if(response.data != '<!--Parameter Check-->'){
						var data_setup = {
							state : 0,
							basic_Place_Code : response.data.list[0].basic_Place_Code,
							basic_Ch_Code : response.data.list[0].basic_Ch_Code,
							basic_Dn_Sale : response.data.list[0].basic_Dn_Sale,
							basic_Dn_Meaip : response.data.list[0].basic_Dn_Meaip,
							basic_Subul_Sale : response.data.list[0].basic_Subul_Sale,
							basic_Subul_Meaip : response.data.list[0].basic_Subul_Meaip,
							basic_Subul_Meaip_Before : response.data.list[0].basic_Subul_Meaip_Before,
							basic_Subul_Sale_Before : response.data.list[0].basic_Subul_Sale_Before
						};
					}
				if(er_place != '000'){
					data_setup.basic_Place_Code = er_place;
				}
				return data_setup;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
					return $q.reject(response.data);
			})

		}, erpia_basicSetup: function(admin_code, userid){		 //환경설정
			console.log("MconfigService and erpia_basicSetup");
			var url = ERPiaAPI.url +'/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'Admin_Code=' + admin_code + '&Userid=' + escape(userid)+ '&Kind=ERPia_Config_Sale_Place_Check';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){	//조회된 환경설정이 있을경우.
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
					return $q.reject(response.data);
			})

		}, basicM: function(admin_code, userid){			 // 기본매장조회
			console.log("MconfigService and basicM");
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=ERPia_Meaip_Select_Place_CName&Mode=Select_Place';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, basicC: function(admin_code, userid, meajang_code){ 	//창고조회 & 매장미지정일때 전체창고 조회
			console.log("MconfigService and basicC");
			if(meajang_code == '000'){
				meajang_code = '';
			}
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&User_id=' + escape(userid) + '&Kind=ERPia_Sale_Select_Place_CName&Mode=Select_CName&Sale_Place_Code=' + meajang_code;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, configIU: function(admin_code, userid, configdata, mode){	// 환경설정 수정등록
			console.log("mconfigService and configIU");
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			if(mode == 'insert'){
				var data = 'Admin_Code=' + admin_code + '&Userid=' + escape(userid) + '&Kind=ERPia_Config&Mode='+ mode +'&basic_Ch_Code='+ configdata.basic_Ch_Code +'&basic_Place_Code='+ configdata.basic_Place_Code +'&basic_Dn_Meaip='+ configdata.basic_Dn_Meaip +'&basic_Dn_Sale='+ configdata.basic_Dn_Sale +'&basic_Subul_Sale='+  configdata.basic_Subul_Sale +'&basic_Subul_Sale_Before=N&basic_Subul_Meaip='+ configdata.basic_Subul_Meaip +'&basic_Subul_Meaip_Before=N';
			}else{
				var data = 'Admin_Code=' + admin_code + '&Userid=' + escape(userid)+ '&Kind=ERPia_Config&Mode=update&basic_Ch_Code='+ configdata.basic_Ch_Code +'&basic_Place_Code='+ configdata.basic_Place_Code +'&basic_Dn_Meaip='+ configdata.basic_Dn_Meaip +'&basic_Dn_Sale='+ configdata.basic_Dn_Sale +'&basic_Subul_Sale='+  configdata.basic_Subul_Sale +'&basic_Subul_Sale_Before='+ configdata.basic_Subul_Sale_Before  +'&basic_Subul_Meaip='+ configdata.basic_Subul_Meaip +'&basic_Subul_Meaip_Before='+ configdata.basic_Subul_Meaip_Before;
			}
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	};
})

/* 전표 조회 & 상세조회 - 이경민[2016-01] */
.factory('MLookupService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
	return{
		chit_lookup: function(admin_code, userid, sedata, gername, pageCnt){		// 전표조회
			console.log("MLookupService and chit_lookup");
			// if(pageCnt == 1) var row = 6;
			// else var row = 5;

			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Master';
			else var kind = 'ERPia_Sale_Select_Master';

			if(pageCnt == -1){
				var gubun = 'Y'; // 총 매출&매입액 조회
			}else {
				var gubun = 'N'; // 전표조회
			}

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind +'&Mode=Select_Ger_Date&GerName='+ escape(gername) +'&pageCnt='+ pageCnt + '&pageRow='+ 5 +'&sDate='+ sedata.sDate +'&eDate='+ sedata.eDate + '&rslt_Amt=' + gubun ;
			if(gubun == 'N'){
				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						if(response.data == '<!--Parameter Check-->'){
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
							else alert('조회된 데이터가 없습니다.');
						}else{
							for(var i=0; i<response.data.list.length; i++){
								if(response.data.list[i].G_Name.length>=10||response.data.list[i].GerName.length>=7){
									//response.data.list[i].G_Name=response.data.list[i].G_Name.substr(0,14)+'...';
									//response.data.list[i].GerName=response.data.list[i].GerName.substr(0,10)+'...';
								}
							}
						}	
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
			}else{
				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						if(response.data == '<!--Parameter Check-->'){
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
							else alert('조회된 데이터가 없습니다.');
						}else{
							return response.data;
						}	
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
			}
			

		}, eMoon: function(admin_code, userid, sedata, gercode){			// 이월데이터 조회
				console.log("MLookupService and eMoon");
				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Master';
				else var kind = 'ERPia_Sale_Select_Master';

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind +'&Mode=Select_Before_Amt&sDate=' + sedata.sDate +'&eDate='+ sedata.eDate + '&GerCode=' + gercode;

				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

		}, chit_delookup: function(admin_code, userid, no){					// 전표상세 조회
				console.log("MLookupService and chit_delookup", no);
				if($rootScope.distinction == 'meaip'){
					var kind = 'ERPia_Meaip_Select_Detail'; var no = '&Il_No=' + no;
				}else{
					var kind = 'ERPia_Sale_Select_Detail'; var no = '&Sl_No=' + no;
				} 
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind +'&Mode='+ no;
				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

		}, quickReg: function(admin_code, userid, mode, no){				// 빠른등록리스트 조회
			console.log("MLookupService and quickReg");
			if($rootScope.distinction == 'meaip'){
				var no = '&Il_No=' + no; 
				var kind = 'ERPia_Meaip_Quick_Reg';
			}else{
				var no = '&Sl_No=' + no; 
				var kind='ERPia_Sale_Quick_Reg';
			} 

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind + '&Mode='+ mode + no;
			
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, u_before_check: function(admin_code, userid, no){			// 수정전 세금계산서나 배송정보가 있는지 확인
				console.log("MLookupService and u_before_check");

				if($rootScope.distinction == 'meaip'){
					var no = '&iL_No=' + no; var kind = 'ERPia_Meaip_Update_Goods';
				}else{
					var no = '&Sl_No=' + no; var kind='ERPia_Sale_Update_Goods';
				} 

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind + '&Mode=Update_Check'+ no;
				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

		}, d_before_check: function(admin_code, userid, no){			// 삭제전 세금계산서나 배송정보가 있는지 확인
				console.log("MLookupService and d_before_check");

				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_Check&iL_No=' + no;
				else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_Check&Sl_No=' + no;

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind;
				
				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		}, damdang: function(admin_code){					// 거래처 담당자 조회
				console.log("MLookupService and damdang");

				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Select_OptSet_Damdang';
				else var kind = 'ERPia_Select_OptSet_Damdang';

				var url = ERPiaAPI.url +'/JSon_Proc_MyPage_Scm_Manage.asp';
				var data = 'Admin_Code=' + admin_code + '&Kind=' + kind;

				return $http.get(url + '?' + data).then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

		}, detailSet: function(admin_code, userid, date, ger, mejang, pageCnt, todate, gubun){			// 상세조회셋 조회
				console.log("MLookupService and detailSet");

				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Master&Mode=Select_OptSet&GerName=' + escape(ger.name) + '&pageCnt='+ pageCnt + '&pageRow=5&sDate=' + date.sDate + '&eDate=' + date.eDate + '&sel_ipgoPlace=' + mejang + '&sel_user=' + escape(ger.damid) + '&rslt_Amt=' + gubun;
				else var kind = 'ERPia_Sale_Select_Master&Mode=Select_OptSet&GerName=' + escape(ger.name) + '&pageCnt='+ pageCnt + '&pageRow=5&sDate=' + date.sDate + '&eDate=' + date.eDate + '&sel_ipgoPlace=' + mejang + '&sel_user=' + escape(ger.damid) + '&rslt_Amt=' + gubun;

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';				
				var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind;

				if(gubun == 'N'){
					return $http.get(url + '?' + data).then(function(response){
						if(typeof response == 'object'){
							if(response.data == '<!--Parameter Check-->'){
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
								else alert('조회된 데이터가 없습니다.');
							}else{
								for(var i=0; i<response.data.list.length; i++){
									if(response.data.list[i].G_Name.length>=10||response.data.list[i].GerName.length>=7){
										response.data.list[i].G_Name=response.data.list[i].G_Name.substr(0,9)+'...';
										response.data.list[i].GerName=response.data.list[i].GerName.substr(0,9)+'...';
									}
								}
							}	
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
				}else{
					return $http.get(url + '?' + data).then(function(response){
						if(typeof response == 'object'){
							if(response.data == '<!--Parameter Check-->'){
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
								else alert('조회된 데이터가 없습니다.');
							}else{
								return response.data;
							}	
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
				}
				

		}, lqdetail_set: function(admin_code, userid, date, ger, mejang, gubun, todate){			// 최근검색 & 빠른검색 등록
			console.log("MLookupService and latelydetail_set");
			if(gubun == 1){	/* 최근등록 */
				var mode = 'Reg_Select_OptSet_Lately';
			}else{			/* 빠른검색등록 */
				var mode = 'Reg_Select_OptSet_Rapid';
			}
			if(todate == date.eDate) date.eDate = 'today';
			if(todate == date.sDate) date.sDate = 'today';

			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_OptSet';
			else var kind = 'ERPia_Sale_Select_OptSet';

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind + '&Mode=' + mode + '&GerCode=' + escape(ger.code) + '&sDate=' + date.sDate + '&eDate=' + date.eDate + '&sel_ipgoPlace=' + mejang + '&sel_user=' + ger.damid;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, Select_OptSet: function(Admin_Code, UserId, RL_Gubun, damlist){				// 최근검색 & 빠른검색 등록내역조회
			console.log("MLookupService and Select_OptSet");

			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_OptSet&Mode=Select_OptSet_List&RL_Gubun=' + RL_Gubun;
			else var kind = 'ERPia_Sale_Select_OptSet&Mode=Select_OptSet_List&RL_Gubun=' + RL_Gubun;

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId)+ '&Kind=' + kind;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					if(response.data == '<!--Parameter Check-->'){
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
						else alert('조회된 데이터가 없습니다.');
					}else{
						for(var i =0; i < response.data.list.length; i++){
							for(var j = 0; j < damlist.length; j++){
								if(response.data.list[i].sel_Damdang == damlist[j].user_id){
									response.data.list[i].sel_Damdang = damlist[j].user_name;
								}
							}
						}
					}	
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, Delete_OptSet: function(Admin_Code, UserId, sel_idx){					// 최근검색 & 빠른검색 등록내역 삭제
			console.log("MLookupService and Delete_OptSet");

			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_OptSet&Mode=Del_Select_OptSet_Rapid&sel_idx=' + sel_idx;
			else var kind = 'ERPia_Sale_Select_OptSet&Mode=Del_Select_OptSet_Rapid&sel_idx=' + sel_idx;

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + escape(UserId) + '&Kind=' + kind;
		
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	};
})

/* 매입 & 매출 등록 & 수정 통합 - 이경민[2016-01] */
.factory('MiuService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
	return{
		companyAndgoods_lately: function(admin_code, userid, gubun){			// 최근 검색 거래처 또는 상품내역 자동조회
			console.log("MiuService and companyAndgoods_lately");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Sel_G_Lately';
			else var kind = 'ERPia_Sale_Sel_G_Lately';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind +'&Mode=Sel_GerGoods_Search_Lately&G_Gubun=' + gubun;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		
		}, companyAndgoods_latelysave: function(admin_code, userid, gubun, username, code){		// 최근 거래처 또는 상품검색내역 저장
			console.log("MiuService and companyAndgoods_latelysave");
			
			if(gubun == 'Ger') var gername = escape(username);
			else var gername = username;
			
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Sel_G_Lately';
			else var kind = 'ERPia_Sale_Sel_G_Lately';

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind +'&Mode=Reg_Select_GerGoods_Search_Lately&G_Gubun=' + gubun + '&G_Gubun_Value=' + gername + '&GerCode=' + code;
			
			return $http.get(url + '?' + data).then(function(response){

				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		
		}, company_sear: function(admin_code, userid, com_name){						// 최근거래처검색내역 자동조회
			console.log("MiuService and company_sear");
			
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_GerName';
			else var kind = 'ERPia_Sale_Select_GerName';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid ) + '&Kind='+ kind +'&Mode=Select_Hangul&GerName=' + com_name + '&pageCnt=1&pageRow=5';

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		},company_detail_sear: function(admin_code, userid, GerCode){					// 거래처 상세정보 조회
			console.log("MiuService and company_detail_sear");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_GerName';
			else var kind = 'ERPia_Sale_Select_GerName';

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind='+ kind +'&Mode=select_detail&GerCode=' + GerCode;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					if(response.data != '<!--Parameter Check-->'){
						return response.data;
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('저장되어있는 초기값이 없습니다.', 'long', 'center');
						else console.log('저장되어있는 초기값이 없습니다.');
						var data = {
							G_Code : '업체정보가없습니다.',
							G_Name : '',
							G_DanGa_Gu : '',
							Use_Recent_DanGa_YN : '',
							G_Tel : '',
							G_Juso : '',
							Recent_purchase_date : '',
							Recent_sales_date : ''
						};
						return data;
					}
				}
			}, function(response){
				return $q.reject(response.data);
			})
			
		}, goods_sear: function(admin_code, userid, mode, goods_name, Ccode, pageCnt){		// 상품 모드별 검색
			console.log("MiuService and goods_sear");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Goods';
			else var kind = 'ERPia_Sale_Select_Goods';

			switch (mode) {
				case 'Select_GoodsName' : 	// 상품이름 검색
					mode = 'Select_Hangul'; 
					var dataDetail = '&GoodsName='+goods_name;
					var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid)+ '&Kind=' + kind + '&Mode=' + mode + dataDetail + '&Changgo_Code=' + Ccode + '&pageCnt=' +pageCnt+ '&pageRow=10';
					break;
				case 'Select_G_OnCode' : 		// 자체코드 검색
					var dataDetail = '&G_OnCode='+goods_name;
					var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind + '&Mode=' + mode + dataDetail + '&Changgo_Code=' + Ccode;
					break;
				case 'Select_G_Code' : 		// 상품코드 검색
					var dataDetail = '&GoodsCode='+goods_name; 
					var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind + '&Mode=' + mode + dataDetail + '&Changgo_Code=' + Ccode;
					break;
				case 'Select_GI_Code' : 		// 공인바코드 검색
					var dataDetail = '&GI_Code='+goods_name; 
					var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid) + '&Kind=' + kind + '&Mode=' + mode + dataDetail + '&Changgo_Code=' + Ccode;
					break;
				default : console.log('모드선택안됨 오류'); break;
			}	
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					if(response.data == '<!--Parameter Check-->'){
						if(pageCnt > 1){
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('마지막 데이터 입니다.', 'short', 'center');
							else alert('마지막 데이터 입니다.');
						}else{
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('일치하는 정보가 없습니다.', 'short', 'center');
							else alert('일치하는 정보가 없습니다.');
						}
					}else{
						for(var i=0; i<response.data.list.length; i++){
							var G_Name1='';
							if(response.data.list[i].G_Name.length > 13){
								for(var j=0; j<response.data.list[i].G_Name.length; j += 13){
									if(j == 0){
										G_Name1 = G_Name1 + response.data.list[i].G_Name.substring(0,13); 
									}else if(j+13 > response.data.list[i].G_Name.length){
										G_Name1 = G_Name1 + '<br>' + response.data.list[i].G_Name.substring(j,response.data.list[i].G_Name.length); 
										response.data.list[i].G_Name1 = G_Name1;
									}else{
										G_Name1 = G_Name1 + '<br>' + response.data.list[i].G_Name.substring(j,j+13);
										if(response.data.list[i].G_Name.length == j+13){
											response.data.list[i].G_Name1 = G_Name1;
										}
									}
								}
							}else{
								G_Name1 = response.data.list[i].G_Name;
								response.data.list[i].G_Name1 = G_Name1;
							}
						}
					}
					return response.data;
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요..', 'short', 'center');
					else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
					return $q.reject(response);
				}
			}, function(response){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('네트워크환경이 불안정합니다. 다시시도해주세요.', 'short', 'center');
				else alert('네트워크환경이 불안정합니다. 다시시도해주세요.');
				return $q.reject(response);
			})

		}, com_Dn : function(admin_code, userid, goods_code, ger_code,i,bar){			// 상품단가조회(할인/할증)
			console.log("MiuService and com_Dn");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Goods';
			else var kind = 'ERPia_Sale_Select_Goods';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + escape(userid )+ '&Kind='+ kind +'&Mode=Select_G_Dn0&GoodsCode=' + goods_code + '&GerCode=' + ger_code;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					var returndata = { 
						'data' : response.data,
						'i' : i,
						'bar' : bar
					};
					return returndata;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, barcode : function(admin_code, userid, barnum){				// 바코드사용 조회 (공인바코드 & 자체코드 & 상품코드)	
			console.log("MiuService and barcode");

			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Goods';
			else var kind = 'ERPia_Sale_Select_Goods';

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' +  escape(userid) + '&Kind='+ kind +'&Mode=';
			var mode1 = 'Select_GI_Code&GI_Code=';
			var mode2 = 'Select_G_OnCode&G_OnCode=';
			var mode3 = 'Select_G_Code&GoodsCode=';

			/* 공인 바코드 조회 */
			return $http.get(url + '?' + data + mode1 + barnum).then(function(response){
				if(typeof response == 'object'){
					if(response.data == '<!--Parameter Check-->'){
						/* 자체코드 조회 */
						return $http.get(url + '?' + data + mode2 + barnum).then(function(response){
							if(typeof response == 'object'){
								if(response.data == '<!--Parameter Check-->'){
									/* 상품코드 */
									return $http.get(url + '?' + data + mode3 + barnum).then(function(response){
										if(typeof response == 'object'){
											if(response.data == '<!--Parameter Check-->'){
												console.log('일치하는 상품 없음.');
											}else{
												console.log('상품코드 일때 ', response.data);
												return response.data;
											}
										}else{
											return $q.reject(response.data);
										}
									}, function(response){
										return $q.reject(response.data);
									})
								//////////////////////////////////////////////
								}else{
									console.log('자체코드 일때 ', response.data);
								return response.data;
								}
							}else{
								return $q.reject(response.data);
							}
						}, function(response){
							return $q.reject(response.data);
						})
					//////////////////////////////////////////////
					}else{
						console.log('공인바코드 일때 ', response.data);
						return response.data;
					}
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, ij_data : function(admin_code, userid, index){		// erpia에 등록되어있는 은행&카드 조회
			console.log("MiuService and ij_data");

			if(index == '1') var kind = 'ERPia_Meaip_Bank_Card_Select&Mode=Select_Bank';
			else var kind = 'ERPia_Meaip_Bank_Card_Select&Mode=Select_Card';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + escape(userid )+ '&Kind='+ kind;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, i_data : function(admin_code, userid, pay, paylist, date, goods, setup, datas){				// 매입&매출 등록
			console.log("MiuService and i_data");
			if(setup.basic_Ch_Code == '000'){
				setup.basic_Ch_Code = '';
			}else if(setup.basic_Place_Code == '000'){
				setup.basic_Place_Code = '';
			}
			/*매입등록*/
			if($rootScope.distinction == 'meaip'){
				var kind = 'ERPia_Meaip_Insert_Goods';
				var m_data = '<root><MeaipM><Admin_Code>'+ admin_code + '</Admin_Code><Meaip_Date>'+ date.todate +'</Meaip_Date><GuMeaCom_Code>'+ datas.GerCode +'</GuMeaCom_Code><Meaip_Amt>'+ datas.totalsumprices +'</Meaip_Amt><Sale_Place>'+ setup.basic_Place_Code +'</Sale_Place><Remk><![CDATA['+ escape('[모바일]')+escape(datas.remk) +']]></Remk></MeaipM><MeaipT>';
				var goods_xml = '';
				var middel = '</MeaipT>';
				// 상품
				for(var i = 0; i < goods.length; i++){
					var ii = i+1;
					var meaipgoods = '<item><seq>'+ ii + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA['+ escape(goods[i].stand) +']]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><G_vat>'+ parseInt(goods[i].goodsprice)/1.1 +'</G_vat></item>';
					var goods_xml = goods_xml + meaipgoods;
				}
				if(pay.gubun == 4){
					var end = '</root>&IpJi_YN=N';
				}else{
					switch(pay.gubun){
						case 0 : var pay_subul = 701; break;  // 현금
						case 1 : var pay_subul = 702; break;  // 통장
						case 2 : var pay_subul = 704; break;  // 어음
						case 3 : var pay_subul = 703; break;  // 카드
					}
					var jidata = '<item><Aseq>'+ 1 +'</Aseq><ij_Date>'+ date.payday +'</ij_Date><Comp_No>'+ datas.GerCode +'</Comp_No><Subul_kind>'+ pay_subul +'</Subul_kind><Bank_Code>'+ paylist[0].code +'</Bank_Code><Bank_Name> <![CDATA['+ escape(paylist[0].name) +']]> </Bank_Name><Bank_Account>'+ paylist[0].num +'</Bank_Account><Card_Code>'+ paylist[1].code +'</Card_Code><Card_Name><![CDATA['+ escape(paylist[1].name) +']]></Card_Name><Card_Num>'+ paylist[1].num +'</Card_Num><Hap_Amt>'+ pay.payprice +'</Hap_Amt></item>';
					var end = '<IpJi>' + jidata + '</IpJi></root>&IpJi_YN=Y';
				}
			}else{ /*매출등록*/
				var i_Cancel='';
				if(datas.subulkind==221) i_Cancel='J';	 //정상 : J, 반품: B 	//수불구분  매출221/반품212
				else i_Cancel='B';

				var kind = 'ERPia_Sale_Insert_Goods';
				var m_data = '<root><MeaChulM><Admin_Code>'+ admin_code + '</Admin_Code><MeaChul_date>'+ date.todate +'</MeaChul_date><Comp_no>'+ datas.GerCode +'</Comp_no><MeaChul_Amt>'+ datas.totalsumprices +'</MeaChul_Amt><i_Cancel>'+i_Cancel+'</i_Cancel><Remk><![CDATA['+ escape('[모바일]') + escape(datas.remk) +']]></Remk></MeaChulM><MeaChulT>';
				var goods_xml = '';
				var middel = '</MeaChulT>';
				// 상품
				for(var i = 0; i < goods.length; i++){
					var ii = i+1;
					var meachulgoods = '<item><seq>'+ ii + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA['+ escape(goods[i].stand) +']]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><PanMeaDanGa>'+ parseInt(goods[i].goodsprice) +'</PanMeaDanGa></item>';
					var goods_xml = goods_xml + meachulgoods;
				}
				if(pay.gubun == 4){
					var end = '</root>&IpJi_YN=N&Sale_Place_Code='+ setup.basic_Place_Code;
				}else{
					switch(pay.gubun){
						case 0 : var pay_subul = 721; break; 
						case 1 : var pay_subul = 722; break; 
						case 2 : var pay_subul = 724; break; 
						case 3 : var pay_subul = 723; break; 
					}
					var jidata = '<item><Aseq>'+ 1 +'</Aseq><ij_Date>'+ date.payday +'</ij_Date><Comp_No>'+ datas.GerCode +'</Comp_No><Subul_kind>'+ pay_subul +'</Subul_kind><Bank_Code>'+ paylist[0].code +'</Bank_Code><Bank_Name> <![CDATA['+ escape(paylist[0].name) +']]> </Bank_Name><Bank_Account>'+ paylist[0].num +'</Bank_Account><Card_Code>'+ paylist[1].code +'</Card_Code><Card_Name><![CDATA['+ escape(paylist[1].name) +']]></Card_Name><Card_Num>'+ paylist[1].num +'</Card_Num><Hap_Amt>'+ pay.payprice +'</Hap_Amt></item>';
					var end = '<IpJi>' + jidata + '</IpJi></root>&IpJi_YN=Y&Sale_Place_Code='+ setup.basic_Place_Code;
				}
			}
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + escape(userid) + '&Kind='+ kind + '&Mode=&RequestXml=';

			console.log('등록=>',url,'?',data, m_data, goods_xml, middel, end); //--> 데이터 오류나면 xml확인용
			return $http.post(url + '?' + data + m_data + goods_xml + middel + end).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, u_data : function(admin_code, userid, pay, paylist, date, goods, setup, datas){		// 매입&매출 수정
				console.log("MiuService and u_data");
				/*매입수정*/
				if(setup.basic_Ch_Code == '000'){
				setup.basic_Ch_Code = '';
				}else if(setup.basic_Place_Code == '000'){
					setup.basic_Place_Code = '';
				}
				if($rootScope.distinction == 'meaip'){
					var kind = 'ERPia_Meaip_Update_Goods&Mode=Update_Meaip&RequestXml=';
					var m_data = '<root><MeaipM><Admin_Code>'+ admin_code + '</Admin_Code><Meaip_Date>'+ date.todate +'</Meaip_Date><GuMeaCom_Code>'+ datas.GerCode +'</GuMeaCom_Code><Meaip_Amt>'+ datas.totalsumprices +'</Meaip_Amt><Sale_Place>'+ setup.basic_Place_Code +'</Sale_Place><Remk><![CDATA['+ escape(datas.remk) +']]></Remk></MeaipM><MeaipT>';
					var goods_xml = '';
					var middel = '</MeaipT>';
					// 상품
					for(var i = 0; i < goods.length; i++){
						var ii = i+1;
						var meaipgoods = '<item><seq>'+ goods[i].goods_seq + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA['+ escape(goods[i].stand) +']]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><G_vat>'+ parseInt(goods[i].goodsprice)/1.1 +'</G_vat><In_Or_Up>' + goods[i].state + '</In_Or_Up><localSeq>' + ii + '</localSeq></item>';
						var goods_xml = goods_xml + meaipgoods;
					}
					if(pay.gubun == 4){
						var end = '</root>&iL_No=' + pay.no + '&IpJi_YN=N&AC_No=' + pay.acno;
					}else{
						switch(pay.gubun){
							case 0 : var pay_subul = 701; break; 
							case 1 : var pay_subul = 702; break; 
							case 2 : var pay_subul = 704; break; 
							case 3 : var pay_subul = 703; break; 
						}
						var jidata = '<item><Aseq>'+ 1 +'</Aseq><ij_Date>'+ date.payday +'</ij_Date><Comp_No>'+ datas.GerCode +'</Comp_No><Subul_kind>'+ pay_subul +'</Subul_kind><Bank_Code>'+ paylist[0].code +'</Bank_Code><Bank_Name> <![CDATA['+ escape(paylist[0].name) +']]> </Bank_Name><Bank_Account>'+ paylist[0].num +'</Bank_Account><Card_Code>'+ paylist[1].code +'</Card_Code><Card_Name><![CDATA['+ escape(paylist[1].name) +']]></Card_Name><Card_Num>'+ paylist[1].num +'</Card_Num><Hap_Amt>'+ pay.payprice +'</Hap_Amt></item>';
						var end = '<IpJi>' + jidata + '</IpJi></root>&iL_No=' + pay.no + '&IpJi_YN=Y&AC_No=' + pay.acno ;
					}
				}else{ /*매출수정*/
					var i_Cancel='';
					if(datas.subulkind==221) i_Cancel='J'; 		//정상 : J, 반품: B //수불구분  매출221/반품212
					else i_Cancel='B';

					var kind = 'ERPia_Sale_Update_Goods&Mode=Update_MeaChul&RequestXml=';
					var m_data = '<root><MeaChulM><Admin_Code>'+ admin_code + '</Admin_Code><MeaChul_date>'+ date.todate +'</MeaChul_date><Comp_no>'+ datas.GerCode +'</Comp_no><MeaChul_Amt>'+ datas.totalsumprices +'</MeaChul_Amt><i_Cancel>'+i_Cancel+'</i_Cancel><Remk><![CDATA['+ escape(datas.remk) +']]></Remk></MeaChulM><MeaChulT>';
					var goods_xml = '';
					var middel = '</MeaChulT>';
					// 상품
					for(var i = 0; i < goods.length; i++){
						var ii = i+1;
						var meachulgoods = '<item><seq>'+ goods[i].goods_seq + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA['+ escape(goods[i].stand) +']]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><PanMeaDanGa>'+ parseInt(goods[i].goodsprice) +'</PanMeaDanGa><In_Or_Up>' + goods[i].state + '</In_Or_Up><localSeq>' + ii + '</localSeq></item>';
						var goods_xml = goods_xml + meachulgoods;
					}
					if(pay.gubun == 4){
						var end = '</root>&IpJi_YN=N&Sale_Place_Code='+ setup.basic_Place_Code + '&AC_No=' + pay.acno + '&Sl_No=' + pay.no;
					}else{
						switch(pay.gubun){
							case 0 : var pay_subul = 721; break; 
							case 1 : var pay_subul = 722; break; 
							case 2 : var pay_subul = 724; break; 
							case 3 : var pay_subul = 723; break; 
						}
						var jidata = '<item><Aseq>'+ 1 +'</Aseq><ij_Date>'+ date.payday +'</ij_Date><Comp_No>'+ datas.GerCode +'</Comp_No><Subul_kind>'+ pay_subul +'</Subul_kind><Bank_Code>'+ paylist[0].code +'</Bank_Code><Bank_Name> <![CDATA['+ escape(paylist[0].name) +']]> </Bank_Name><Bank_Account>'+ paylist[0].num +'</Bank_Account><Card_Code>'+ paylist[1].code +'</Card_Code><Card_Name><![CDATA['+ escape(paylist[1].name) +']]></Card_Name><Card_Num>'+ paylist[1].num +'</Card_Num><Hap_Amt>'+ pay.payprice +'</Hap_Amt></item>';
						var end = '<IpJi>' + jidata + '</IpJi></root>&Sl_No=' + pay.no + '&IpJi_YN=Y&Sale_Place_Code='+ setup.basic_Place_Code + '&AC_No=' + pay.acno;
					}
				}
				
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code +'&UserId=' + escape(userid) + '&Kind='+ kind;
				// console.log('수정데이터 확인 =>', url, '?', data,m_data, goods_xml, middel, end); //-->데이터 오류나면 xml확인용
				return $http.post(url + '?' + data + m_data + goods_xml + middel + end).then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

		}, subulupdate : function(admin_code, userid, subul){			// 최근 등록 수분 환경설정에 업데이트
			console.log("MiuService and subulupdate");


			if($rootScope.distinction == 'meaip'){
				if(subul== 111){
					var su = 'I';
				}else{
					var su = 'B';
				}
				var datas = 'Admin_Code=' + admin_code + '&Userid=' + escape(userid) + '&Kind=ERPia_Config&Mode=update_subul_before&basic_Subul_Sale_Before=&basic_Subul_Meaip_Before='  + su;
			}else{
				if(subul == 221){
					var su = 'C';
				}else{
					var su = 'B';
				}
				var datas = 'Admin_Code=' + admin_code + '&Userid=' + escape(userid) + '&Kind=ERPia_Config&Mode=update_subul_before&basic_Subul_Sale_Before='+ su+'&basic_Subul_Meaip_Before=';
			} 

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			return $http.get(url + '?' + datas).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})	

		}, seq_del : function(admin_code, userid, no, seq){			// 상품T 삭제
			console.log("MiuService and seq_del");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_MeaipT&iL_No=' + no + '&Tseq=' + seq;
			else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_MeaChulT&Sl_No=' + no + '&Tseq=' + seq;

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + escape(userid) + '&Kind='+ kind;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})	

		}, d_data : function(admin_code, userid, no){			// 전표삭제
			console.log("MiuService and seq_del");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_Meaip&iL_No=' + no;
			else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_MeaChul&Sl_No=' + no;
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + escape(userid) + '&Kind='+ kind;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, pay_delete : function(admin_code, userid, acno){			// 지급전표 삭제
			console.log("MiuService and pay_delete");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_Acct_Info&AC_No=' + acno;
			else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_Acct_Info&AC_No=' + acno;
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + escape(userid) + '&Kind='+ kind;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}	
	};
})
//////////////////////////////////////////////////////////////////// -- 매입&매출관련 끝 -- //////////////////////////////////////////////////////////////////////////////

/* 모바일APP 버전관련 Service - 김형석[2016-02] */
.factory('VersionCKService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
	return{
		currentVersion: function(){
			var url = ERPiaAPI.url2 +'/mobile/Mypage_ApkVer.asp';
			return $http.get(url).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	};
})

/* SCM관련 Service - 김형석[2016-02] */
.factory('SCMService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
	return{
		scmlogin: function(admin_code, g_code, ger_name){
			var url = ERPiaAPI.url2 +'/ERPiaSCM/Mobile_loginChk.asp';
			var data = 'hidAdmin_Code=' + admin_code +'&hidGerCode=' + g_code + '&hidGerName='+ escape(ger_name);
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
				
			}, function(response){
				return $q.reject(response.data);
			})
		}
		
	};

})
/* SCM/NORMAL모드 비밀번호변경 Service - 김형석[2016-06-22] */
//http://www.erpia.net/include/JSon_Proc_Mobile.asp?kind=PassChange&mode=SCM_PassChange&loginType=N&Admin_Code=onz&GerCode=00926&ID=onz&pwd=onz&changePass=1234&mac=ba8e205a02d20e66
//http://www.erpia.net/include/JSon_Proc_Mobile.asp?kind=PassChange&mode=Normal_PassChange&Admin_Code=onz&GerCode=00926&ID=aaaa&pwd=aaaaaaa!1&changePass=1234&mac=ba8e205a02d20e66


/* 비밀번호 변경전 검사 - 이경민[2016-07-13] */
.factory('PassChangeService', function($http, $q, $cordovaToast, ERPiaAPI){
	return{
		changepass: function(mode, Admin_Code, GerCode, UserID, G_Pass, changePass, UUID){
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'kind=PassChange&mode='+ mode +'&Admin_Code=' + Admin_Code + '&GerCode=' + GerCode + '&ID='+ escape(UserID);
			   data  += '&pwd='  +G_Pass + '&changePass=' + changePass + '&mac=' + UUID;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});
		}, changepass_YN: function(Admin_Code, UserID, G_Pass, loginType){
			var url = ERPiaAPI.url + '/JSon_Proc_Mobile.asp';
			var data = 'kind=pwdSet&Admin_Code='+ Admin_Code + '&id='+ escape(UserID) +'&pwd='+ G_Pass +'&loginType=' + loginType;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});
		}
		
	};
})

/* 재고조회관련 서비스 - 이경민[2016-09-12] */
.factory('jego_Service', function($http, $q, $cordovaToast, ERPiaAPI, $timeout){
	return{
		main_search: function(Admin_Code, UserId, ChanggoCode, keyword, YN, OneSelectCode, pageCnt){		// 재고조회 (통합 & 바코드)
			console.log('jego_Service', 'main_search');
			if(YN == 'Y') var word = keyword;
			else var word = escape(keyword);
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';
			var data = 'Admin_Code='+ Admin_Code +'&UserId='+ escape(UserId) +'&Kind=ERPia_Stock_Select_Master&Mode=Select_Master&pageCnt='+ pageCnt +'&pageRow=10&ChangGoCode='+ ChanggoCode +'&KeyWord=' + word + '&CodeSearchYN='+ YN +'&OneSelectCode=' + OneSelectCode;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					for(var i=0; i < response.data.list.length; i++){
						response.data.list[i].trfa = false;
					}
					return response.data;
				}else{
					return response.data;
				}
			},function(response){
				return $q.reject(response);
			}); 
		}, jego_changgoSearch : function(Admin_Code, UserId){		// 재고 창고리스트 조회
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code='+ Admin_Code +'&UserId='+ UserId +'&Kind=ERPia_Stock_Util&Mode=Util_Select_ChangGo';
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});		
		}, detail_search : function(Admin_Code, UserId, ChangGoCode, OneSelectCode){		// 통합 검색 재고 창고별 상세 조회
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code='+ Admin_Code +'&UserId='+ UserId +'&Kind=ERPia_Stock_Select_Master&Mode=Select_Master&ChangGoCode=ALL&KeyWord=&CodeSearchYN=N&OneSelectCode=' + OneSelectCode;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});
		}, Attention_list : function(Admin_Code, UserId, Mode){		// MyList & 관심항목 조회
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code='+ Admin_Code +'&UserId='+ UserId +'&Kind=ERPia_Stock_Util&Mode=' + Mode;
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});		
		}, detailJego_search : function(Admin_Code, UserId, Mode, changgo_key, jegoInfo, pageCnt){		// 상세검색을 통한 재고조회
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=ERPia_Stock_Select_Detail&Mode=' + Mode + '&pageCnt=' + pageCnt + '&pageRow=10&ChangGoCode=' + changgo_key + '&OneSelectCode=' + jegoInfo.OneSelectCode + '&GoodsName=' + escape(jegoInfo.pro_name) + '&GoodsStand=' + escape(jegoInfo.pro_stand) + '&GoodsOnCode=' + escape(jegoInfo.pro_OnCode) + '&GoodsBarCode=' + escape(jegoInfo.pro_barCode) + '&GoodsWich=' + escape(jegoInfo.detail_location) + '&GoodsBrand=' +escape(jegoInfo.detail_brand) + '&GoodsJeaJoChe=' + escape(jegoInfo.detail_Jejo) + '&GoodsKshimListCode=' + escape(jegoInfo.attent_Kshim_code) + '&GoodsMyListCode=' + escape(jegoInfo.attent_Mylist_code) + '&MeachulMonth=' + jegoInfo.MeachulMonth + '&MeachulListYN=' + jegoInfo.MeachulListYN + '&MeachulListCtlYN=' + jegoInfo.MeachulListCtlYN + '&JegoQtyCtl=' + jegoInfo.JegoQtyCtl + '&JegoQtyCtlYN=' + jegoInfo.JegoQtyCtlYN;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					for(var i=0; i < response.data.list.length; i++){
						response.data.list[i].trfa = false;
					} 
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});		
		}, proDetail : function(Admin_Code, UserId, code){		// 선택상품 상세조회
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=ERPia_Stock_Util&Mode=Util_Select_Goods_Detail&OneSelectCode=' + code + '&ChanggoCode=001'
			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});		
		}, search_Save : function(Admin_Code, UserId, changgo_key, jegoInfo, Mode, text){		// 조회셋 등록
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=ERPia_Stock_Util&Mode=' + Mode + '&pageCnt=&ChangGoCode=' + changgo_key + '&GoodsName=' + escape(jegoInfo.pro_name) + '&GoodsStand=' + escape(jegoInfo.pro_stand) + '&GoodsOnCode=' + escape(jegoInfo.pro_OnCode) + '&GoodsBarCode=' + escape(jegoInfo.pro_barCode) + '&GoodsWich=' + escape(jegoInfo.detail_location) + '&GoodsBrand=' +escape(jegoInfo.detail_brand) + '&GoodsJeaJoChe=' + escape(jegoInfo.detail_Jejo) + '&GoodsKshimListCode=' + escape(jegoInfo.attent_Kshim_code) + '&GoodsMyListCode=' + escape(jegoInfo.attent_Mylist_code) + '&MeachulMonth=' + jegoInfo.MeachulMonth + '&MeachulListYN=' + jegoInfo.MeachulListYN + '&MeachulListCtlYN=' + jegoInfo.MeachulListCtlYN + '&JegoQtyCtl=' + jegoInfo.JegoQtyCtl + '&JegoQtyCtlYN=' + jegoInfo.JegoQtyCtlYN + '&sel_name=' + escape(text);

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					return response.data;
				}else{Opset_de
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});		
		}, Opset_search : function(Admin_Code, UserId, gubun){		// 조회셋 리스트 조회
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=ERPia_Stock_Util&Mode=Util_Select_OptSet_List&RL_Gubun=' + gubun;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});	
		}, Opset_de : function(Admin_Code, UserId, index){		// 조회셋 리스트 삭제
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=ERPia_Stock_Util&Mode=Util_Del_Select_OptSet_Rapid&sel_idx=' + index;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});	
		}, meaipchul_GoodsSearch : function(Admin_Code, UserId, GCode){		// 조회셋 리스트 삭제
			var url = ERPiaAPI.url + '/ERPiaApi_Stock.asp';	
			var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=ERPia_Stock_Select_Master&Mode=Select_Master&pageCnt=1&pageRow=20&ChangGoCode=&KeyWord=&CodeSearchYN=N&OneSelectCode=&GoodsCodeList=' + GCode;

			return $http.get(url + '?' + data).then(function(response){
				if(typeof response.data == 'object' || typeof response.data == 'string'){
					for(var i=0; i < response.data.list.length; i++){
						response.data.list[i].trfa = false;
					}
					return response.data;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});	
		}
	};
});