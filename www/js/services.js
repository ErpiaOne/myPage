angular.module('starter.services', [])

//InnerHtml을 사용하기 위한 compiler
.directive('compileData', function ( $compile ) {
	return {
		scope: true,
		link: function ( scope, element, attrs ) {
			var elmnt;
			attrs.$observe( 'template', function ( myTemplate ) {
				if ( angular.isDefined( myTemplate ) ) {
					// compile the provided template against the current scope
					elmnt = $compile( myTemplate )( scope );

					element.html(""); // dummy "clear"

					element.append( elmnt );
				}
			});
		}
	};
})

.factory('loginService', function($http, $q, $cordovaToast, ERPiaAPI){
	var comInfo = function(kind, Admin_Code, G_id, G_Pass){
		if(kind == 'scm_login'){
			var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
			var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&G_id=' + G_id + '&G_Pass=' + G_Pass;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response.data == 'object'){
						return response;
					}else{
						return $q.reject(response);
					}
				},function(response){
					return $q.reject(response);
				});
		}else if(kind == 'ERPiaLogin'){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&uid=' + G_id + '&pwd=' + G_Pass;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response.data == 'object'){
						return response;
					}else{
						return $q.reject(response);
					}
				},function(response){
					return $q.reject(response);
				});
		}else if(kind =='erpia_ComInfo'){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response.data == 'object'){
						return response;
					}else{
						return $q.reject(response);
					}
				},function(response){
					return $q.reject(response);
				});
		}else if(kind == 'ERPia_Ger_Login'){
			var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
			var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&id=' + G_id + '&pwd=' + G_Pass;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response.data == 'object'){
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
.factory('ERPiaInfoService', function($http, ERPiaAPI){
	var ERPiaInfo = function(kind, Admin_Code, sDate, eDate){
		var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
		var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&sDate=' + sDate + '&eDate=' + eDate;
		return $http.get(url + '?' + data);
	}
	return{
		ERPiaInfo: ERPiaInfo
	}
})

.factory('scmInfoService', function($http, ERPiaAPI){
	var scmInfo = function(kind, BaljuMode, Admin_Code, GerCode, FDate, TDate){
		var url = ERPiaAPI.url + '/JSon_Proc_Multi_Lhk.asp';
		var data = 'Value_Kind=list&kind=' + kind + '&BaljuMode=' + BaljuMode + '&Admin_Code=' + Admin_Code + '&GerCode=' + GerCode;
		data += '&FDate=' + FDate + '&TDate=' + TDate;
		return $http.get(url + '?' + data);
	}
	return{
		scmInfo: scmInfo
	}
})
.factory('IndexService', function($http, $q, ERPiaAPI){
	var dashBoard = function(kind, Admin_Code, sDate, eDate){
		var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
		var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code + '&sDate=' + sDate + '&eDate=' + eDate;
		return $http.get(url + '?' + data)
			.then(function(response){
				if(typeof response.data == 'object'){
					return response;
				}else{
					return $q.reject(response);
				}
			},function(response){
				return $q.reject(response);
			});
	}
	return{
		dashBoard: dashBoard
	}
})
.factory('CertifyService', function($http, $cordovaToast, $rootScope, ERPiaAPI){
	var url = ERPiaAPI.url + '/Json_Proc_MyPage_Scm.asp';
	var certify = function(Admin_Code, loginType, ID, sms_id, sms_pwd, sendNum, rec_num){
		$rootScope.rndNum = Math.floor(Math.random() * 1000000) + 1;
		if ($rootScope.rndNum < 100000) $rootScope.rndNum = '0' + $rootScope.rndNum;
		console.log($rootScope.rndNum);
		var data = 'Kind=mobile_Certification&Value_Kind=list' + '&Admin_Code=' + Admin_Code + '&ID=' + ID;
		data += '&Certify_Code=' + $rootScope.rndNum + '&loginType=' + loginType;
		return $http.get(url + '?' + data)
		.success(function(response){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('인증코드를 전송했습니다.', 'long', 'center');

			if (response.list[0].Result == '1'){
				var url = ERPiaAPI.url + '/SCP.asp';
				var data = 'sms_id=' + sms_id + '&sms_pwd=' + sms_pwd + '&send_num=' + sendNum + '&rec_num=' + rec_num;
				data += '&rndNum=' + $rootScope.rndNum + '&SendType=mobile_Certification';
				return $http.get(url + '?' + data);
				//location.href="#/app/certification";
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('전송실패', 'long', 'center');
				else console.log('전송실패');
			}
		})
	}
	var check = function(Admin_Code, loginType, ID, Input_Code){
		var data ='';
		if(loginType == 'S' || loginType == 'N'){
			data = 'Kind=check_Certification&Value_Kind=list' + '&Admin_Code=' + Admin_Code + '&ID=' + ID;
			data += '&Input_Code=' + Input_Code + '&loginType=' + loginType;
		}else if(loginType=='E'){
			url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
			data = 'Kind=ERPiaCertify' + '&Admin_Code=' + Admin_Code + '&uid=' + ID;
		}
		return $http.get(url + '?' + data)
		.success(function(response){
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
.factory('tradeDetailService', function($http, $q, ERPiaAPI) {
	return{
		tradeList: function(Admin_Code, GerCode){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Kind=select_Trade' + '&Admin_Code=' + Admin_Code + '&GerCode=' + GerCode;
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
		}, readDetail: function(Admin_Code, Sl_No){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Kind=select_Trade_Detail' + '&Admin_Code=' + Admin_Code + '&Sl_No=' + Sl_No;
			return $http.get(url + '?' + data)
				.then(function(response){
					console.log('readDetail_Service : ', response.data.list[0].G_ea1);
					if(typeof response.data == 'object'){
						var tot_Ea = 0;
						for(var i=0; i<response.data.length; i++){
							tot_Ea += Number(((response.data.list[i].G_ea1)?response.data.list[0].G_ea1:0));
							tot_Ea += Number(((response.data.list[i].G_ea2)?response.data.list[0].G_ea2:0));
							tot_Ea += Number(((response.data.list[i].G_ea3)?response.data.list[0].G_ea3:0));
							tot_Ea += Number(((response.data.list[i].G_ea4)?response.data.list[0].G_ea4:0));
							tot_Ea += Number(((response.data.list[i].G_ea5)?response.data.list[0].G_ea5:0));
							tot_Ea += Number(((response.data.list[i].G_ea6)?response.data.list[0].G_ea6:0));
							tot_Ea += Number(((response.data.list[i].G_ea7)?response.data.list[0].G_ea7:0));
							tot_Ea += Number(((response.data.list[i].G_ea8)?response.data.list[0].G_ea8:0));
							tot_Ea += Number(((response.data.list[i].G_ea9)?response.data.list[0].G_ea9:0));
							tot_Ea += Number(((response.data.list[i].G_ea10)?response.data.list[0].G_ea10:0));
							response.data.list[i].tot_Ea = tot_Ea;
						}
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		}, getCntNotRead: function(Admin_Code, checkNotRead){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Kind=select_Trade_Admin&Admin_Code=' + Admin_Code + '&checkNotRead=' + checkNotRead;
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
		}, chkRead: function(Admin_Code, Sl_No, user_id){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Kind=read_Trade_Detail&Admin_Code=' + Admin_Code + '&Sl_No=' + Sl_No + '&user_id=' + user_id;
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
.factory('NoticeService', function($http, $q, ERPiaAPI){
	return{
		//http://erpia2.godohosting.com/erpia_update/img
		getList: function(){
		var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
		var data = 'Kind=myPage_Notice&Value_Kind=encode&cntRow=10';
		return $http.get(url + '?' + data)
			.then(function(response){
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
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
	};
})
.factory('statisticService', function($http, $q, ERPiaAPI) {
	var titles =  [{Idx:0, title:"홈"}
				, {Idx:1, title:"거래처별 매입 점유율 TOP 10"}
				, {Idx:2, title:"사이트별 매출 점유율"}
				, {Idx:3, title:"브랜드별 매출 TOP5"}
				, {Idx:4, title:"상품별 매출 TOP5"}
				, {Idx:5, title:"매출이익증감율"}
				, {Idx:6, title:"매출 실적 추이"}
				, {Idx:7, title:"매입 현황"}
				, {Idx:8, title:"재고 회전율 TOP5"}
				, {Idx:9, title:"택배사별 구분 건수 통계"}
				, {Idx:10, title:"온오프라인 비교 매출"}
				, {Idx:11, title:"매출반품현황"}
				, {Idx:12, title:"상품별 매출 반품 건수/반품액 TOP5"}
				, {Idx:13, title:"CS 컴플레인 현황"}
				, {Idx:14, title:"상품별 매입건수/매입액 TOP5"}
				, {Idx:15, title:"최근배송현황"}
				, {Idx:16, title:"배송현황"}];
	return{
		all : function(kind, mode, Admin_Code, loginType, G_Id) {
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=' + kind + '&mode=' + mode + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + G_Id;
			return $http.get(url + '?' + data)
				.then(function(response) {
					if(typeof response.data == 'object'){
						for(var i=0; i<response.data.list.length; i++){
							switch(response.data.list[i].Idx){
								case "1": response.data.list[i].title = titles[1].title; break;
								case "2": response.data.list[i].title = titles[2].title; break;
								case "3": response.data.list[i].title = titles[3].title; break;
								case "4": response.data.list[i].title = titles[4].title; break;
								case "6": response.data.list[i].title = titles[5].title; break;
								case "7": response.data.list[i].title = titles[6].title; break;
								case "8": response.data.list[i].title = titles[7].title; break;
								case "9": response.data.list[i].title = titles[8].title; break;
								case "10": response.data.list[i].title = titles[9].title; break;
								case "11": response.data.list[i].title = titles[10].title; break;
								case "12": response.data.list[i].title = titles[11].title; break;
								case "13": response.data.list[i].title = titles[12].title; break;
								case "14": response.data.list[i].title = titles[13].title; break;
								case "15": response.data.list[i].title = titles[14].title; break;
								case "16": response.data.list[i].title = titles[15].title; break;
								case "17": response.data.list[i].title = titles[16].title; break;
							}
						}
						return response.data.list;	
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		},save : function(kind, mode, Admin_Code, loginType, G_Id, statistic){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=' + kind + '&mode=' + mode + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + G_Id + '&statistic=' + statistic;
			return $http.get(url + '?' + data)
				.then(function(response) {
					if(typeof response.data == 'object'){
						return response.data;	
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		}, title : function(kind, mode, Admin_Code, loginType, G_Id){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=' + kind + '&mode=' + mode + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + G_Id;
			return $http.get(url + '?' + data)
				.then(function(response) {
					if(typeof response.data == 'object'){
						for(var i=0; i<response.data.list.length; i++){
							switch(response.data.list[i].Idx){
								case "0": response.data.list[i].title = titles[0].title; break;
								case "1": response.data.list[i].title = titles[1].title; break;
								case "2": response.data.list[i].title = titles[2].title; break;
								case "3": response.data.list[i].title = titles[3].title; break;
								case "4": response.data.list[i].title = titles[4].title; break;
								case "6": response.data.list[i].title = titles[5].title; break;
								case "7": response.data.list[i].title = titles[6].title; break;
								case "8": response.data.list[i].title = titles[7].title; break;
								case "9": response.data.list[i].title = titles[8].title; break;
								case "10": response.data.list[i].title = titles[9].title; break;
								case "11": response.data.list[i].title = titles[10].title; break;
								case "12": response.data.list[i].title = titles[11].title; break;
								case "13": response.data.list[i].title = titles[12].title; break;
								case "14": response.data.list[i].title = titles[13].title; break;
								case "15": response.data.list[i].title = titles[14].title; break;
								case "16": response.data.list[i].title = titles[15].title; break;
								case "17": response.data.list[i].title = titles[16].title; break;
							}
						}
						return response.data.list;	
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.rejec(response.data);
				})
		}, chart : function(kind, mode, Admin_Code, loginType, G_Id, chart_idx){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
			var data = 'Value_Kind=list&Kind=' + kind + '&mode=' + mode + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType;
				data += '&G_Id=' + G_Id + '&chart_idx=' + chart_idx;
			return $http.get(url + '?' + data)
				.then(function(response) {
					if(typeof response.data == 'object'){
						return response.data;	
					}else{
						return $q.reject(response.data);
					}
				})
		}
	}
})
.factory('alarmService', function($http, $q, ERPiaAPI){
	var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm.asp';
	return{
		select : function(kind, Admin_Code, loginType, G_Id){
			var data = 'Value_Kind=list&Kind=' + kind + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + G_Id;
			return $http.get(url + '?' + data)
				.then(function(response){
					console.log('response', response);
					if(typeof response.data == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		}, save : function(kind, Admin_Code, loginType, G_Id, alarm){
			var data = 'Value_Kind=list&Kind=' + kind + '&Admin_Code=' + Admin_Code + '&loginType=' + loginType + '&G_Id=' + G_Id + '&alarm=' + alarm;
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

	}
})
.factory('pushInfoService', function($http, ERPiaAPI){
	var pushInfo = function(Admin_Code, UserId, kind, Mode, UserKey, Token, ChkAdmin, DeviceOS, sDate, eDate){
		var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
		var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&kind=' + kind + '&Mode=' + Mode + '&UserKey=' + UserKey + '&Token=' + Token 
		data += '&ChkAdmin=' + ChkAdmin + '&DeviceOS=' + DeviceOS + '&sDate=' + sDate + '&eDate=' + eDate;
		console.log(url + '?' + data)
		return $http.get(url + '?' + data);
	}
	return{
		pushInfo: pushInfo
	}
})
.factory('csInfoService', function($http, ERPiaAPI){
	var csInfo = function(Admin_Code, UserId, kind, chkAdmin, comName, writer, subject, tel, sectors, interestTopic1,interestTopic2, interestTopic3, inflowRoute, contents){
		var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
		var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&kind=' + kind + '&chkAdmin=' + chkAdmin + '&comName=' + comName 
		data += '&writer=' + writer + '&subject=' + subject + '&tel=' + tel + '&sectors=' + sectors + '&interestTopic1=' + interestTopic1
		data += '&interestTopic2=' + interestTopic2 + '&interestTopic3=' + interestTopic3 + '&inflowRoute=' + inflowRoute + '&contents=' + contents 
		console.log(url + '?' + data)
		return $http.get(url + '?' + data);
	}
	return{
		csInfo: csInfo
	}
})
.factory('uuidService', function($http, $q, ERPiaAPI){
	return{
		getUUID : function(uuid){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'Kind=getUUID&uuid=' + uuid;
			return $http.get(url + '?' + data)
			.then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}, saveUUID : function(uuid, admin_code, loginType, id, pwd, autoLogin_YN){
			var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
			var data = 'Kind=saveUUID&uuid=' + uuid + '&admin_code=' + admin_code + '&loginType=' + loginType;
			data += '&id=' + id + '&pwd=' + pwd + '&autoLogin_YN=' + autoLogin_YN;
			return $http.get(url + '?' + data)
			.then(function(response){
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
.factory('BoardService', function($http, $q, ERPiaAPI){
	// return{
		//http://erpia2.godohosting.com/erpia_update/img
		// getList: function(){
	var BoardInfo = function(Admin_Code, UserId, kind){
		var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
		var data = 'kind=' + kind + '&Admin_Code=' + Admin_Code;

		console.log(url + '?' + data)
		return $http.get(url + '?' + data)
			.then(function(response){
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
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}
		return{
			BoardInfo: BoardInfo
		}
	// };
})
.factory('PushSelectService', function($http, $q, ERPiaAPI){
	var url = ERPiaAPI.url + '/JSon_Proc_MyPage_Scm_Manage.asp';
	var PushList = [];
	return{
		select : function(Kind, Mode, Admin_Code, ChkAdmin, UserId){
			var data = 'Value_Kind=list&Kind=' + Kind + '&Mode=' + Mode + '&Admin_Code=' + Admin_Code + '&ChkAdmin=' + ChkAdmin + '&UserId=' + UserId;
			return $http.get(url + '?' + data)
				.then(function(response){
					console.log('response', response);
					if(typeof response.data == 'object'){
						PushList = response.data
						return PushList;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
		}, save : function(Kind, Mode, Admin_Code, ChkAdmin, UserId, alarm){
			var data = 'Value_Kind=list&Kind=' + Kind + '&Mode=' + Mode + '&Admin_Code=' + Admin_Code + '&ChkAdmin=' + ChkAdmin + '&UserId=' + UserId + '&alarm=' + alarm;
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
		}, view : function(Kind, Mode, Admin_Code, ChkAdmin, UserId, idx){
			var data = 'Value_Kind=list&Kind=' + Kind + '&Mode=' + Mode + '&Admin_Code=' + Admin_Code + '&ChkAdmin=' + ChkAdmin + '&UserId=' + UserId + '&idx=' + idx;
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
		}, delete : function(Kind, Mode, Admin_Code, ChkAdmin, UserId, idx){
			var data = 'Value_Kind=list&Kind=' + Kind + '&Mode=' + Mode + '&Admin_Code=' + Admin_Code + '&ChkAdmin=' + ChkAdmin + '&UserId=' + UserId + '&idx=' + idx;
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
		},getData : function(Seq) {
			var data = 'Value_Kind=list&Kind=' + Kind + '&Mode=' + Mode + '&Admin_Code=' + Admin_Code + '&ChkAdmin=' + ChkAdmin + '&UserId=' + UserId;
			return $http.get(url + '?' + data)
				.then(function(response){
					console.log('response', response);
					if(typeof response.data == 'object'){
						PushList = response.data;
						for (var i = 0; i < PushList.length; i++) {
							if (PushList[i+1].Seq === parseInt(Seq)) {
								return PushList[i+1];
							}
						}
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
			})
		}
	}
})
.factory('TestService', function($http, ERPiaAPI){
	var testInfo = function(Admin_Code, UserId, kind, Mode, basic_Subul_Sale_Before, basic_Subul_Meaip_Before){
		var url = ERPiaAPI.url + '/ERPiaApi_TestProject.asp';
		var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&kind=' + kind + '&Mode=' + Mode
			// data += '&basic_Ch_Code=' + basic_Ch_Code + '&basic_Place_Code=' + basic_Place_Code + '&basic_Dn_Sale=' + basic_Dn_Sale + '&basic_Dn_Meaip=' + basic_Dn_Meaip
			// data += '&basic_Subul_Sale=' + basic_Subul_Sale + '&basic_Subul_Sale_Before=' + basic_Subul_Sale_Before + '&basic_Subul_Meaip=' + basic_Subul_Meaip + '&basic_Subul_Meaip_Before=' + basic_Subul_Meaip_Before
			data += '&basic_Subul_Sale_Before=' + basic_Subul_Sale_Before + '&basic_Subul_Meaip_Before=' + basic_Subul_Meaip_Before
		console.log(url + '?' + data)
		return $http.get(url + '?' + data);
	}
	return{
		testInfo: testInfo
	}
})
.factory('testLhkServicse', function($http, $q, ERPiaAPI){
	return{
		test: function(){
		var url = ERPiaAPI.url + '/psm/02/html/Graph.asp';
		var data = 'Admin_Code=onz&swm_gu=1&kind=chart7';
		return $http.get(url + '?' + data)
			.then(function(response){
				console.log('testChart', typeof response);
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
.factory('AmChart_Service', function($http, $q, ERPiaAPI){
	var url = ERPiaAPI.url + '/JSon_Proc_graph.asp';
	return{
		scm_Chart: function(Kind, Value_Kind, Admin_Code, swm_gu, Ger_code){
			var data = 'Kind=' + Kind + '&Value_Kind=' + Value_Kind + '&admin_code=' + Admin_Code + '&swm_gu=' + swm_gu + '&Ger_code=' + Ger_code;
			return $http.get(url + '?' + data)
			.then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})
		}, erpia_Chart: function(Kind, Value_Kind, Admin_Code, swm_gu){
			var data = 'Kind=' + Kind + '&Value_Kind=' + Value_Kind + '&admin_code=' + Admin_Code + '&swm_gu=' + swm_gu;
			return $http.get(url + '?' + data)
			.then(function(response){
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
.factory('publicFunction', function($ionicHistory){
	return{
		goHome: function(userType){
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
.factory('Chats', function() {
	// Might use a resource here that returns a JSON array

	// Some fake testing data
	var chats = [{
		id : 0,
		name : 'Ben Sparrow',
		lastText : 'You on your way?',
		face : 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
	}, {
		id : 1,
		name : 'Max Lynx',
		lastText : 'Hey, it\'s me',
		face : 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
	}, {
		id : 2,
		name : 'Adam Bradleyson',
		lastText : 'I should buy a boat',
		face : 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
	}, {
		id : 3,
		name : 'Perry Governor',
		lastText : 'Look at my mukluks!',
		face : 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
	}, {
		id : 4,
		name : 'Mike Harrington',
		lastText : 'This is wicked good ice cream.',
		face : 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
	}];

	return {
		all : function() {
			return chats;
		},
		remove : function(chat) {
			chats.splice(chats.indexOf(chat), 1);
		},
		get : function(chatId) {
			for (var i = 0; i < chats.length; i++) {
				if (chats[i].id === parseInt(chatId)) {
					return chats[i];
				}
			}
			return null;
		}
	};
})


.factory('meaipService', function($http, ERPiaAPI, $q, $cordovaToast){
	return{
		insertm : function(code, id, meaipdata, goodsdata, atc, paycardbank, date, meaiptotal){
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var basicdata = 'Admin_Code='+ code +'&User_id='+ id +'&Kind=ERPia_Meaip_Insert_Goods&Mode=&RequestXml=';
				var meaip = '<root><MeaipM><Admin_Code>'+ code + '</Admin_Code><Meaip_Date>'+ date.todate +'</Meaip_Date><GuMeaCom_Code>'+ atc.GerCode +'</GuMeaCom_Code><Meaip_Amt>'+ meaiptotal.totalsumprices +'</Meaip_Amt><Sale_Place>'+ meaipdata.basic_Place_Code +'</Sale_Place><Remk><![CDATA['+ escape(atc.remk) +']]></Remk></MeaipM><MeaipT>';
				var goods = '';
				for(var i=0; i < goodsdata.length; i++){
					var ii = i+1;
					var goodstemporary = '<item><seq>'+ ii + '</seq><ChangGo_Code>'+ meaipdata.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ atc.subulkind +'</subul_kind><G_Code>'+ goodsdata[i].code +'</G_Code><G_name><![CDATA['+ escape(goodsdata[i].name) +']]></G_name><G_stand><![CDATA[]]></G_stand><G_Price>'+ goodsdata[i].goodsprice +'</G_Price><G_Qty>'+ goodsdata[i].num +'</G_Qty><G_vat>'+ parseInt(goodsdata[i].goodsprice)*0.9 +'</G_vat></item>';
					var goods = goods + goodstemporary;
				}
				var middel = '</MeaipT><IpJi>';
				
				var end = '</IpJi></root>&IpJi_YN=';
				if(atc.paysubul == 0){
					var sum = url + '?' + basicdata+ meaip + goods + '</MeaipT></root>&IpJi_YN=N';
				}else{
					var jidata = '<item><Aseq>'+ 1 +'</Aseq><ij_Date>'+ date.payday +'</ij_Date><Comp_No>'+ atc.GerCode +'</Comp_No><Subul_kind>'+ atc.paysubul +'</Subul_kind><Bank_Code>'+ paycardbank[0].code +'</Bank_Code><Bank_Name> <![CDATA['+ escape(paycardbank[0].name) +']]> </Bank_Name><Bank_Account>'+ paycardbank[0].num +'</Bank_Account><Card_Code>'+ paycardbank[1].code +'</Card_Code><Card_Name><![CDATA['+ escape(paycardbank[1].name) +']]></Card_Name><Card_Num>'+ paycardbank[1].num +'</Card_Num><Hap_Amt>'+ atc.payprice +'</Hap_Amt></item>';
					var sum = url + '?' + basicdata+ meaip + goods + middel + jidata + end + 'Y';
				}
				console.log('인서트 확인 =>', sum);
				return $http.get(sum)
					.then(function(response){
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





//////////////////////////////////////////////////////////////매입 & 매출 통합 다시 ///////////////////////////////////////////////////////////////////////////////////
/* 환경설정 */
.factory('MconfigService', function($http, ERPiaAPI, $q, $cordovaToast){
	return{
		basicSetup: function(admin_code, userid){ //환경설정
			console.log("MconfigService and basicSetup");
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&Userid=' + userid + '&Kind=ERPia_Config&Mode=select';
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response == 'object'){
						//조회된 환경설정이 있을경우.
						if(response.data != '<!--Parameter Check-->'){
							var data = {
									state : 0,
									basic_Place_Code : response.data.list[0].basic_Place_Code,
									basic_Ch_Code : response.data.list[0].basic_Ch_Code,
									basic_Dn_Sale : response.data.list[0].basic_Dn_Sale,
									basic_Dn_Meaip : response.data.list[0].basic_Dn_Meaip,
									basic_Subul_Sale : response.data.list[0].basic_Subul_Sale,
									basic_Subul_Meaip : response.data.list[0].basic_Subul_Meaip,
									basic_Subul_Meaip_Before : response.data.list[0].basic_Subul_Meaip_Before
							};
							return data;
						}else{ //조회된 환경설정이 없을경우.
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('저장되어있는 초기값이 없습니다.', 'short', 'center');
							else console.log('저장되어있는 초기값이 없습니다.');
								var data = {
									state : 1,
									basic_Place_Code : '000',
									basic_Ch_Code : 101,
									basic_Dn_Sale : 0, //기본매출(거래처등록지정)
									basic_Dn_Meaip : 0, //기본매입(거래처등록지정)
									basic_Subul_Sale : 1, //기본매출등록수불
									basic_Subul_Meaip : 1, //기본매입등록수불
									basic_Subul_Meaip_Before : 'N'
								};
								return data;
						}
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
						return $q.reject(response.data);
					})

		}, basicM: function(admin_code, userid){ //기본매장찾기basicC
		console.log("MconfigService and basicM");
		var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
		var data = 'Admin_Code=' + admin_code + '&User_id=' + userid + '&Kind=ERPia_Meaip_Select_Place_CName&Mode=Select_Place';
		return $http.get(url + '?' + data)
			.then(function(response){
				if(typeof response == 'object'){
					return response.data;
				}else{
					return $q.reject(response.data);
				}
			}, function(response){
				return $q.reject(response.data);
			})

		}, basicC: function(admin_code, userid, meajang_code){ //창고조회 & 매장미지정일때 전체창고 조회
				console.log("MconfigService and basicC");
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&User_id=' + userid + '&Kind=ERPia_Sale_Select_Place_CName&Mode=Select_CName&Sale_Place_Code=' + meajang_code;
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, configIU: function(admin_code, userid, configdata, mode){
				console.log("mconfigService and configIU");
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				if(mode == 'insert'){
					var data = 'Admin_Code=' + admin_code + '&Userid=' + userid + '&Kind=ERPia_Config&Mode='+ mode +'&basic_Ch_Code='+ configdata.basic_Ch_Code +'&basic_Place_Code='+ configdata.basic_Place_Code +'&basic_Dn_Meaip='+ configdata.basic_Dn_Meaip +'&basic_Dn_Sale='+ configdata.basic_Dn_Sale +'&basic_Subul_Sale='+  configdata.basic_Subul_Sale +'&basic_Subul_Sale_Before=N&basic_Subul_Meaip='+ configdata.basic_Subul_Meaip +'&basic_Subul_Meaip_Before=N';
				}else{
					var data = 'Admin_Code=' + admin_code + '&Userid=' + userid + '&Kind=ERPia_Config&Mode=update&basic_Ch_Code='+ configdata.basic_Ch_Code +'&basic_Place_Code='+ configdata.basic_Place_Code +'&basic_Dn_Meaip='+ configdata.basic_Dn_Meaip +'&basic_Dn_Sale='+ configdata.basic_Dn_Sale +'&basic_Subul_Sale='+  configdata.basic_Subul_Sale +'&basic_Subul_Sale_Before='+ configdata.basic_Subul_Sale_Before  +'&basic_Subul_Meaip='+ configdata.basic_Subul_Meaip +'&basic_Subul_Meaip_Before='+ configdata.basic_Subul_Meaip_Before;
				}
				return $http.get(url + '?' + data)
					.then(function(response){
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

/*전표 조회 & 상세조회*/
.factory('MLookupService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
return{
	 chit_lookup: function(admin_code, userid, sedata, gername, pageCnt){
				console.log("MLookupService and chit_lookup");
				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Master';
				else var kind = 'ERPia_Sale_Select_Master';

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode=Select_Ger_Date&GerName='+ escape(gername) +'&pageCnt='+ pageCnt + '&pageRow=5&sDate='+ sedata.sDate +'&eDate='+ sedata.eDate;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						console.log('MLookupService');
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
		}, eMoon: function(admin_code, userid, sedata, gercode){
				console.log("MLookupService and eMoon");
				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Master';
				else var kind = 'ERPia_Sale_Select_Master';

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode=Select_Before_Amt&sDate=' + sedata.sDate +'&eDate='+ sedata.eDate + '&GerCode=' + gercode;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, chit_delookup: function(admin_code, userid, no){
				console.log("MLookupService and chit_delookup", no);
				if($rootScope.distinction == 'meaip'){
					var kind = 'ERPia_Meaip_Select_Detail'; var no = '&Il_No=' + no;
				}else{
					var kind = 'ERPia_Sale_Select_Detail'; var no = '&Sl_No=' + no;
				} 
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode='+ no;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, quickReg: function(admin_code, userid, mode, no){
				console.log("MLookupService and quickReg");

				if($rootScope.distinction == 'meaip'){
					var no = '&Il_No=' + no; var kind = 'ERPia_Meaip_Quick_Reg';
				}else{
					var no = '&Sl_No=' + no; var kind='ERPia_Sale_Quick_Reg';
				} 

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind=' + kind + '&Mode='+ mode + no;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, u_before_check: function(admin_code, userid, no){
				console.log("MLookupService and u_before_check");

				if($rootScope.distinction == 'meaip'){
					var no = '&iL_No=' + no; var kind = 'ERPia_Meaip_Update_Goods';
				}else{
					var no = '&Sl_No=' + no; var kind='ERPia_Sale_Update_Goods';
				} 

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind=' + kind + '&Mode=Update_Check'+ no;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, d_before_check: function(admin_code, userid, no){
				console.log("MLookupService and u_before_check");

				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_Check&iL_No=' + no;
				else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_Check&Sl_No=' + no;

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind=' + kind;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, detailSet: function(admin_code, userid, date, ger, mejang){
				console.log("MLookupService and detailSet");

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind=ERPia_Meaip_Select_Master&Mode=Select_OptSet&GerName=' + escape(ger.name) + '&pageCnt=1&pageRow=5&sDate=' + date.sDate + '&eDate=' + date.eDate + '&sel_ipgoPlace=' + mejang + '&sel_user=' + escape(ger.dam);
				console.log(url, '?', data);
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, lqdetail_set: function(admin_code, userid, date, ger, mejang, gubun){
				console.log("MLookupService and latelydetail_set");
				if(gubun == 1){
					console.log('최근등록');
					var mode = 'Reg_Select_OptSet_Lately';
				}else{
					console.log('빠른검색등록');
					var mode = 'Reg_Select_OptSet_Rapid';
				}
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind=ERPia_Meaip_Select_OptSet&Mode=' + mode + '&GerCode=' + escape(ger.code) + '&sDate=' + date.sDate + '&eDate=' + date.eDate + '&sel_ipgoPlace=' + mejang;
				
				return $http.get(url + '?' + data)
					.then(function(response){
						console.log(mode,' ???=>', response.data);
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
		}, Select_OptSet: function(Admin_Code, UserId, RL_Gubun){
				console.log("MLookupService and Select_OptSet");

				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_OptSet&Mode=Select_OptSet_List&RL_Gubun=' + RL_Gubun;
				else var kind = 'ERPia_Sale_Select_OptSet&Mode=Select_OptSet_List&RL_Gubun=' + RL_Gubun;

				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + Admin_Code + '&UserId=' + UserId + '&Kind=' + kind;
			
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							if(response.data == '<!--Parameter Check-->'){
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
								else alert('조회된 데이터가 없습니다.');
							}else{
							}	
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

/* 매입 & 매출 등록 & 수정 통합 */
.factory('MiuService', function($http, ERPiaAPI, $q, $cordovaToast, $rootScope){
return{
	company_sear: function(admin_code, userid, com_name){
				console.log("MiuService and company_sear");
				if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_GerName';
				else var kind = 'ERPia_Sale_Select_GerName';
				
				var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
				var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode=select&GerName=' + com_name + '&pageCnt=1&pageRow=5';
				return $http.get(url + '?' + data)
					.then(function(response){
						if(typeof response == 'object'){
							return response.data;
						}else{
							return $q.reject(response.data);
						}
					}, function(response){
						return $q.reject(response.data);
					})
	
	},company_detail_sear: function(admin_code, userid, GerCode){
			console.log("MiuService and company_detail_sear");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_GerName';
			else var kind = 'ERPia_Sale_Select_GerName';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode=select_detail&GerCode=' + GerCode;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response == 'object'){
							if(response.data != '<!--Parameter Check-->'){
								return response.data;
							}else{
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('저장되어있는 초기값이 없습니다.', 'short', 'center');
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
	
	}, goods_sear: function(admin_code, userid, mode, goods_name, Ccode, pageCnt){
			console.log("MiuService and goods_sear");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Goods';
			else var kind = 'ERPia_Sale_Select_Goods';

			switch (mode) {
			    case 'Select_GoodsName' : console.log('Select_GoodsName'); mode = 'Select_Hangul';  var dataDetail = '&GoodsName='+goods_name; break;
			    case 'Select_G_OnCode' : console.log('Select_G_OnCode'); var dataDetail = '&G_OnCode='+goods_name; break;
			    case 'Select_G_Code' : console.log('Select_G_Code'); var dataDetail = '&GoodsCode='+goods_name; break;
			    case 'Select_GI_Code' : console.log('Select_GI_Code'); var dataDetail = '&GI_Code='+goods_name; break;

			    default : console.log('셀렉트 된 것이 없습니다.'); break;
			}
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind=' + kind + '&Mode=' + mode + dataDetail + '&Changgo_Code=' + Ccode + '&pageCnt=' +pageCnt+ '&pageRow=10';
			console.log(data);
			return $http.get(url + '?' + data)
				.then(function(response){
					console.log('dmadma?=', response.data);
					if(typeof response == 'object'){
						if(response.data == '<!--Parameter Check-->'){
							if(pageCnt > 1){
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('마지막 데이터 입니다.', 'short', 'center');
								else alert('마지막 데이터 입니다.');
							}else{
								if(ERPiaAPI.toast == 'Y'){
									$cordovaToast.show('일치하는 정보가 없습니다.', 'short', 'center');
								} 
								else{
									alert('일치하는 정보가 없습니다.');
									console.log('=======================>',response);
								} 

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
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('일치하는 정보가 없습니다.', 'short', 'center');
						else alert('일치하는 정보가 없습니다.2');
						return $q.reject(response);
					}
				}, function(response){
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('일치하는 정보가 없습니다.', 'short', 'center');
						else alert('일치하는 정보가 없습니다.3');
						return $q.reject(response);
				})

	}, com_Dn : function(admin_code, userid, goods_code, ger_code,i,bar){
			console.log("MiuService and com_Dn");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Goods';
			else var kind = 'ERPia_Sale_Select_Goods';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode=Select_G_Dn0&GoodsCode=' + goods_code + '&GerCode=' + ger_code;

			return $http.get(url + '?' + data)
				.then(function(response){
					console.log('MLookupService', response);
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

	}, barcode : function(admin_code, userid, barnum){
			console.log("MiuService and barcode");

			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Select_Goods';
			else var kind = 'ERPia_Sale_Select_Goods';

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code + '&UserId=' + userid + '&Kind='+ kind +'&Mode=';
			var mode1 = 'Select_GI_Code&GI_Code=';
			var mode2 = 'Select_G_OnCode&G_OnCode=';
			var mode3 = 'Select_G_Code&GoodsCode=';

			/*공인 바코드 조회*/
			return $http.get(url + '?' + data + mode1 + barnum).then(function(response){
					console.log('공인바코드');
					if(typeof response == 'object'){
							if(response.data == '<!--Parameter Check-->'){
								/*자체코드 조회*/
								return $http.get(url + '?' + data + mode2 + barnum).then(function(response){
										console.log('자체코드');
										if(typeof response == 'object'){
												if(response.data == '<!--Parameter Check-->'){
														/*상품코드*/
														return $http.get(url + '?' + data + mode3 + barnum).then(function(response){
																console.log('상품코드');
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
	}, ij_data : function(admin_code, userid, index){
			console.log("MiuService and ij_data", index);

			if(index == '1') var kind = 'ERPia_Meaip_Bank_Card_Select&Mode=Select_Bank';
			else var kind = 'ERPia_Meaip_Bank_Card_Select&Mode=Select_Card';
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + userid + '&Kind='+ kind;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

	}, i_data : function(admin_code, userid, pay, paylist, date, goods, setup, datas){
			console.log("MiuService and i_data");

			/*매입등록*/
			if($rootScope.distinction == 'meaip'){
				var kind = 'ERPia_Meaip_Insert_Goods';
				var m_data = '<root><MeaipM><Admin_Code>'+ admin_code + '</Admin_Code><Meaip_Date>'+ date.todate +'</Meaip_Date><GuMeaCom_Code>'+ datas.GerCode +'</GuMeaCom_Code><Meaip_Amt>'+ datas.totalsumprices +'</Meaip_Amt><Sale_Place>'+ setup.basic_Place_Code +'</Sale_Place><Remk><![CDATA['+ escape(datas.remk) +']]></Remk></MeaipM><MeaipT>';
				var goods_xml = '';
				var middel = '</MeaipT>';
				// 상품
				for(var i = 0; i < goods.length; i++){
					var ii = i+1;
					var meaipgoods = '<item><seq>'+ ii + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA[]]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><G_vat>'+ parseInt(goods[i].goodsprice)*0.9 +'</G_vat></item>';
					var goods_xml = goods_xml + meaipgoods;
				}
				if(pay.gubun == 4){
					var end = '</root>&IpJi_YN=N';
				}else{
					switch(pay.gubun){
						case 0 : var pay_subul = 701; break; 
						case 1 : var pay_subul = 702; break; 
						case 2 : var pay_subul = 704; break; 
						case 3 : var pay_subul = 703; break; 
					}
					var jidata = '<item><Aseq>'+ 1 +'</Aseq><ij_Date>'+ date.payday +'</ij_Date><Comp_No>'+ datas.GerCode +'</Comp_No><Subul_kind>'+ pay_subul +'</Subul_kind><Bank_Code>'+ paylist[0].code +'</Bank_Code><Bank_Name> <![CDATA['+ escape(paylist[0].name) +']]> </Bank_Name><Bank_Account>'+ paylist[0].num +'</Bank_Account><Card_Code>'+ paylist[1].code +'</Card_Code><Card_Name><![CDATA['+ escape(paylist[1].name) +']]></Card_Name><Card_Num>'+ paylist[1].num +'</Card_Num><Hap_Amt>'+ pay.payprice +'</Hap_Amt></item>';
					var end = '<IpJi>' + jidata + '</IpJi></root>&IpJi_YN=Y';
				}
			}else{ /*매출등록*/
				var i_Cancel='';
				if(datas.subulkind==221){ //정상 : J, 반품: B //수불구분  매출221/반품212
					i_Cancel='J'
				}else{
					i_Cancel='B'
				}
				var kind = 'ERPia_Sale_Insert_Goods';
				var m_data = '<root><MeaChulM><Admin_Code>'+ admin_code + '</Admin_Code><MeaChul_date>'+ date.todate +'</MeaChul_date><Comp_no>'+ datas.GerCode +'</Comp_no><MeaChul_Amt>'+ datas.totalsumprices +'</MeaChul_Amt><i_Cancel>'+i_Cancel+'</i_Cancel><Remk><![CDATA['+ escape(datas.remk) +']]></Remk></MeaChulM><MeaChulT>';
				var goods_xml = '';
				var middel = '</MeaChulT>';
				// 상품
				for(var i = 0; i < goods.length; i++){
					var ii = i+1;
					var meachulgoods = '<item><seq>'+ ii + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA[]]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><PanMeaDanGa>'+ parseInt(goods[i].goodsprice)*0.9 +'</PanMeaDanGa></item>';
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
			var data = 'Admin_Code=' + admin_code +'&UserId=' + userid + '&Kind='+ kind + '&Mode=&RequestXml=';

			// console.log('?',data, m_data, goods_xml, middel, end); --> 데이터 오류나면 xml확인용
			return $http.post(url + '?' + data + m_data + goods_xml + middel + end)
				.then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

	}, u_data : function(admin_code, userid, pay, paylist, date, goods, setup, datas){
			console.log("MiuService and u_data");
			/*매입수정*/
			if($rootScope.distinction == 'meaip'){
				var kind = 'ERPia_Meaip_Update_Goods&Mode=Update_Meaip&RequestXml=';
				var m_data = '<root><MeaipM><Admin_Code>'+ admin_code + '</Admin_Code><Meaip_Date>'+ date.todate +'</Meaip_Date><GuMeaCom_Code>'+ datas.GerCode +'</GuMeaCom_Code><Meaip_Amt>'+ datas.totalsumprices +'</Meaip_Amt><Sale_Place>'+ setup.basic_Place_Code +'</Sale_Place><Remk><![CDATA['+ escape(datas.remk) +']]></Remk></MeaipM><MeaipT>';
				var goods_xml = '';
				var middel = '</MeaipT>';
				// 상품
				for(var i = 0; i < goods.length; i++){
					var ii = i+1;
					var meaipgoods = '<item><seq>'+ goods[i].goods_seq + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA[]]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><G_vat>'+ parseInt(goods[i].goodsprice)*0.9 +'</G_vat><In_Or_Up>' + goods[i].state + '</In_Or_Up><localSeq>' + ii + '</localSeq></item>';
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
				if(datas.subulkind==221){ //정상 : J, 반품: B //수불구분  매출221/반품212
					i_Cancel='J'
				}else{
					i_Cancel='B'
				}
				var kind = 'ERPia_Sale_Update_Goods&Mode=Update_MeaChul&RequestXml=';
				var m_data = '<root><MeaChulM><Admin_Code>'+ admin_code + '</Admin_Code><MeaChul_date>'+ date.todate +'</MeaChul_date><Comp_no>'+ datas.GerCode +'</Comp_no><MeaChul_Amt>'+ datas.totalsumprices +'</MeaChul_Amt><i_Cancel>'+i_Cancel+'</i_Cancel><Remk><![CDATA['+ escape(datas.remk) +']]></Remk></MeaChulM><MeaChulT>';
				var goods_xml = '';
				var middel = '</MeaChulT>';
				// 상품
				for(var i = 0; i < goods.length; i++){
					var ii = i+1;
					var meachulgoods = '<item><seq>'+ goods[i].goods_seq + '</seq><ChangGo_Code>'+ setup.basic_Ch_Code +'</ChangGo_Code><subul_kind>'+ datas.subulkind +'</subul_kind><G_Code>'+ goods[i].code +'</G_Code><G_name><![CDATA['+ escape(goods[i].name) +']]></G_name><G_stand><![CDATA[]]></G_stand><G_Price>'+ goods[i].goodsprice +'</G_Price><G_Qty>'+ goods[i].num +'</G_Qty><PanMeaDanGa>'+ parseInt(goods[i].goodsprice)*0.9 +'</PanMeaDanGa><In_Or_Up>' + goods[i].state + '</In_Or_Up><localSeq>' + ii + '</localSeq></item>';
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
			var data = 'Admin_Code=' + admin_code +'&UserId=' + userid + '&Kind='+ kind;
			// console.log('수정데이터 확인!!!!!!!!!!!! =>', url, '?', data,m_data, goods_xml, middel, end); -->데이터 오류나면 xml확인용
			return $http.post(url + '?' + data + m_data + goods_xml + middel + end)
				.then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})
	}, seq_del : function(admin_code, userid, no, seq){
			console.log("MiuService and seq_del==>");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_MeaipT&iL_No=' + no + '&Tseq=' + seq;
			else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_MeaChulT&Sl_No=' + no + '&Tseq=' + seq;

			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + userid + '&Kind='+ kind;
			return $http.get(url + '?' + data)
				.then(function(response){
					if(typeof response == 'object'){
						return response.data;
					}else{
						return $q.reject(response.data);
					}
				}, function(response){
					return $q.reject(response.data);
				})

	}, d_data : function(admin_code, userid, no){
			console.log("MiuService and seq_del");
			if($rootScope.distinction == 'meaip') var kind = 'ERPia_Meaip_Delete_Goods&Mode=Delete_Meaip&iL_No=' + no;
			else var kind = 'ERPia_Sale_Delete_Goods&Mode=Delete_MeaChul&Sl_No=' + no;
			
			var url = ERPiaAPI.url +'/ERPiaApi_TestProject.asp';
			var data = 'Admin_Code=' + admin_code +'&UserId=' + userid + '&Kind='+ kind;
			
			return $http.get(url + '?' + data)
				.then(function(response){
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////