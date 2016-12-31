/* 더보기 메뉴 / 상품 & 거래처 조회 및 간편등록 컨트롤러 */
angular.module('starter.controllers').controller("EasyCtrl", function(ERPiaAPI, $cordovaToast, $rootScope, $scope, $timeout, $ionicLoading, $ionicScrollDelegate, $ionicModal, $ionicPopup, EasyService) {
console.log("간편 상품 거래처 컨트롤러");
	$scope.page = 0;

	/* 상품 조회모드 */
	$scope.sttsMode = [
		{ name: '전체(삭제상품제외)', val: '' },
		{ name: '정상', val: '0' },
		{ name: '일시품절', val: '1' },
		{ name: '장기품절', val: '2' },
		{ name: '단종', val: '3' },
		{ name: '비활성화상품', val: '4' },
		{ name: '삭제상품', val: '9' }
	]

	/* 상품 조회 검색어 */
	$scope.GoodsInfo = {
		stts : '',			// 상품상태 : 0.정상, 1.일시품절, 2.장기품절, 3.단종, 4.비활성상품, 9.삭제상품 / 공란이면 0~4까지 검색
		searchKey : ''		// 검색어
	}

	/* 거래처 조회모드 */
	$scope.sttsMode2 = [
		{ name: '전체', val: '' },
		{ name: '매입처', val: '601' },
		{ name: '매출처', val: '602' },
		{ name: '입출처', val: '603' }
	]

	/* 거래처 조회 검색어 */
	$scope.GereacheInfo = {
		g_iogu : '', 	// ''전체 / 601.매입처 / 602.매출처 / 603.입출처
		searchKey : '' 
	}

	/* 검색어 초기화 */
	$scope.searchKey_Clear = function(gubun){
		if (gubun == 1) $scope.GoodsInfo.searchKey = '';
		else $scope.GereacheInfo.searchKey = '';
	}	

	/* 페이지 초기화 함수 */
	$scope.pagenum = function(){
		$scope.page = 0;
	}

	$scope.loading = function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		$timeout(function(){
			$ionicLoading.hide();
		},1000);
	}

	/* 상품 검색 */
	$scope.goodsSerch = function(gubun){
		$scope.page = $scope.page + 1;	// 페이징 넘버 +1
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		if(gubun == 1){				// 첫페이지 조회시
			EasyService.goods_Select($rootScope.loginData.Admin_Code, $scope.GoodsInfo.stts, $scope.page, $scope.GoodsInfo.searchKey)
			.then(function(response){
				if(response.data == '<!--Parameter Check-->'){
					$scope.goods_result = [{ G_Code: 'N' }];
					$scope.moreBtn = 'N';
				}else{
					$scope.goods_result = response.data.list;
					if($scope.goods_result.length == 21){
						$scope.goods_result.splice(20,1);
						$scope.moreBtn = 'Y';
					}else{
						$scope.moreBtn = 'N';
					}
					$ionicScrollDelegate.scrollTop();
				}
				$timeout(function(){
					$ionicLoading.hide();
				},1000);
			},function(){
				$ionicLoading.hide();
				alert("error");
			});
		}else{						// 더보기 클릭시
			EasyService.goods_Select($rootScope.loginData.Admin_Code, $scope.GoodsInfo.stts, $scope.page, $scope.GoodsInfo.searchKey)
			.then(function(response){
				if(response.data.list.length == 21){
					$scope.moreBtn = 'Y';
					for(var i = 0 ; i < response.data.list.length-1; i++) {
						$scope.goods_result.push(response.data.list[i]);
					}
				}else{
					$scope.moreBtn = 'N';
					for(var i = 0 ; i < response.data.list.length; i++) {
						$scope.goods_result.push(response.data.list[i]);
					}
				}
				$timeout(function(){
					$ionicLoading.hide();
				},1000);
			},function(){
				$ionicLoading.hide();
				alert("error");
			});
		}
		
	}

	$scope.scrollTop = function(){
		$ionicScrollDelegate.scrollTop();
	}

	/* 상품 삭제 OR 복원 */
	$scope.goodsde = function(gu, code){
		console.log('상품코드', code);
		if(gu == 1){
			$ionicPopup.show({
				title: '<b>확인</b>',
				content: '해당상품을 삭제하시겠습니까?',
				buttons: [
					{ 
						text: '취소', onTap: function(e){} 
					},
					{ 
						text: '확인', 
						type: 'button-positive', 
						onTap: function(e){
							EasyService.goodsde($rootScope.loginData.Admin_Code, 'Goods_de', code)
							.then(function(response){
								console.log(response);
								if(response.data.list[0].success == 'False'){
									$ionicPopup.show({
										title: '<b>실패</b>',
										content: '상품의 재고, 출고대기, 대표상품지정여부를 확인해주세요.',
										buttons: [
											{ 
												text: '확인', 
												type: 'button-positive', 
												onTap: function(e){} 
											}
										]
									})
								}else{
									$scope.page = 0;
									$timeout(function(){
										$scope.goodsSerch(1);
									}, 300);
									$ionicScrollDelegate.scrollTop();
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('삭제상품으로 변경되었습니다.', 'short', 'center');
									else console.log('삭제상품으로 변경되었습니다.');
								}
								$timeout(function(){
									$ionicLoading.hide();
								},1000);
							},function(){
								$ionicLoading.hide();
								alert("error");
							});
						} 
					}
				]
			})
		}else{
			$ionicPopup.show({
				title: '<b>확인</b>',
				content: '해당상품을 복원하시겠습니까?',
				buttons: [
					{ 
						text: '취소', onTap: function(e){} 
					},
					{ 
						text: '확인', 
						type: 'button-positive', 
						onTap: function(e){
							EasyService.goodsde($rootScope.loginData.Admin_Code, 'Goods_re', code)
							.then(function(response){
								if(response.data.list[0].success == 'False'){
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품수정이 실패했습니다.<br> 잠시후 다시시도해주세요.', 'short', 'center');
									else console.log('상품수정이 실패했습니다.<br> 잠시후 다시시도해주세요.');
								}else{
									$scope.page = 0;
									$timeout(function(){
										$scope.goodsSerch(1);
									}, 300);
									$ionicScrollDelegate.scrollTop();
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('정상상품으로 변경되었습니다.', 'short', 'center');
									else console.log('정상상품으로 변경되었습니다.');
								}
								$timeout(function(){
									$ionicLoading.hide();
								},1000);
							},function(){
								$ionicLoading.hide();
								alert("error");
							});
						} 
					}
				]
			})
		}	
	}

	/* 거래처 검색 */
	$scope.gereacheiSerch = function(gubun){
		console.log('거래처 전체조회');
		$scope.page = $scope.page + 1; 	// 페이징 넘버 +1
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		if(gubun == 1){					// 첫페이지 조회시
			EasyService.gereachei_Select($rootScope.loginData.Admin_Code, $scope.page, $scope.GereacheInfo.g_iogu, $scope.GereacheInfo.searchKey)
			.then(function(response){
				if(response.data == '<!--Parameter Check-->'){
					$scope.gereachei_result = [{ GerCode: 'N' }];
					$scope.moreBtn = 'N';
				}else{
					$scope.gereachei_result = response.data.list;
					if($scope.gereachei_result.length == 21){
						$scope.gereachei_result.splice(20,1);
						$scope.moreBtn = 'Y';
					}else{
						$scope.moreBtn = 'N';
					}
					$ionicScrollDelegate.scrollTop();
				}
				$timeout(function(){
					$ionicLoading.hide();
				},1000);
			},function(){
				$ionicLoading.hide();
				alert("error");
			});
		}else{							// 더보기 클릭시
			EasyService.gereachei_Select($rootScope.loginData.Admin_Code, $scope.page, $scope.GereacheInfo.g_iogu, $scope.GereacheInfo.searchKey)
			.then(function(response){
				if(response.data.list.length == 21){
					$scope.moreBtn = 'Y';
					for(var i = 0 ; i < response.data.list.length-1; i++) {
						$scope.gereachei_result.push(response.data.list[i]);
					}
				}else{
					$scope.moreBtn = 'N';
					for(var i = 0 ; i < response.data.list.length; i++) {
						$scope.gereachei_result.push(response.data.list[i]);
					}
				}
				$timeout(function(){
					$ionicLoading.hide();
				},1000);
			},function(){
				$ionicLoading.hide();
				alert("error");
			});
		}
	}

	/* 거래처 삭제 */
	$scope.gereacheide = function(gu, code){
		if(gu == 1){
			$ionicPopup.show({
				title: '<b>확인</b>',
				content: '해당거래처를를 삭제하시겠습니까?',
				buttons: [
					{ 
						text: '취소', onTap: function(e){} 
					},
					{ 
						text: '확인', 
						type: 'button-positive', 
						onTap: function(e){
							EasyService.gereacheide($rootScope.loginData.Admin_Code, 'Gereachei_de', code)
							.then(function(response){
								console.log(response);
								if(response.data.list[0].success == 'False'){
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처수정이 실패했습니다.<br> 잠시후 다시시도해주세요.', 'short', 'center');
									else console.log('거래처수정이 실패했습니다.<br> 잠시후 다시시도해주세요.');
								}else{
									$scope.page = 0;
									$timeout(function(){
										$scope.gereacheiSerch(1);
									}, 300);
									$ionicScrollDelegate.scrollTop();
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처가 삭제되었습니다.', 'short', 'center');
									else console.log('거래처가 삭제되었습니다.');
								}
								$timeout(function(){
									$ionicLoading.hide();
								},1000);
							},function(){
								$ionicLoading.hide();
								alert("error");
							});
						} 
					}
				]
			})
		}else{
			$ionicPopup.show({
				title: '<b>확인</b>',
				content: '해당거래처를를 복원하시겠습니까?',
				buttons: [
					{ 
						text: '취소', onTap: function(e){} 
					},
					{ 
						text: '확인', 
						type: 'button-positive', 
						onTap: function(e){
							EasyService.gereacheide($rootScope.loginData.Admin_Code, 'Gereachei_re', code)
							.then(function(response){
								console.log(response);
								if(response.data.list[0].success == 'False'){
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처수정이 실패했습니다.<br> 잠시후 다시시도해주세요.', 'short', 'center');
									else console.log('거래처수정이 실패했습니다.<br> 잠시후 다시시도해주세요.');
								}else{
									$scope.page = 0;
									$timeout(function(){
										$scope.gereacheiSerch(1);
									}, 300);
									$ionicScrollDelegate.scrollTop();
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처가 복원되었습니다.', 'short', 'center');
									else console.log('거래처가 복원되었습니다.');
								}
								$timeout(function(){
									$ionicLoading.hide();
								},1000);
							},function(){
								$ionicLoading.hide();
								alert("error");
							});
						} 
					}
				]
			})
		}
	}

	/* 키보드 엔터이슈 - 이경민[2016-11-28] */
	$scope.checkIfEnterKeyWasPressed = function($event, gubun){
		var keyCode = $event.which || $event.keyCode;
		if (keyCode === 13) {
			if(gubun == 1){
				$scope.pagenum();
				$scope.goodsSerch(1);
			}else{
				$scope.pagenum();
				$scope.gereacheiSerch(1);
			}
		}
	}

	if($rootScope.distinction == 'Goods'){
		$scope.goodsSerch(1);
	}else if($rootScope.distinction == 'Account'){
		$scope.gereacheiSerch(1);
	}

	/* ---------------------------------------------------------------------------------------------------------------------------------------------- 간편 등록 */

	/* 거래처 간편 등록 모달 */
	$ionicModal.fromTemplateUrl('tab/account_IU.html',{
		scope : $scope
	}).then(function(modal){

		$scope.accounIU_M = modal;
	});

	/* 상품 간편 등록 모달 */
	$ionicModal.fromTemplateUrl('tab/goods_IU.html',{
		scope : $scope
	}).then(function(modal){
		$scope.goodsIU_M = modal;
	});

	/* 우편번호 검색 모달 */
	$ionicModal.fromTemplateUrl('tab/post.html',{
		scope : $scope
	}).then(function(modal){
		$scope.postSelect_M = modal;
	});

	$scope.postSearch = function(){
		EasyService.test()
		.then(function(response){
			console.log('등록또는 수정후 결과값 ->',response);
		},function(){
			$ionicLoading.hide();
			alert("error");
		});
		// $scope.postSelect_M.show();
	}

	$scope.post_close = function(){
		$scope.postSelect_M.hide();
	}

	/* 상품 등록모드 */
	$scope.goodsStts = [
		{ name: '상태', val: '' },
		{ name: '정상', val: '0' },
		{ name: '일시품절', val: '1' },
		{ name: '장기품절', val: '2' },
		{ name: '단종', val: '3' },
		{ name: '비활성화상품', val: '4' }
		// { name: '삭제상품', val: '9' }
	]

	/* 상품 유무형구분 */
	$scope.goods_shapeYN = [
		{ name: '유무형구분', val: '' },
		{ name: '유형', val: 'Y' },
		{ name: '무형', val: 'N' }
	]

	/* 상품 수정등록 객체 */
	$scope.goods_Object = {
		goodsCode : '',			// 상품코드
		stts : '',				// 상태
		goodsName : '',			// 상품이름
		goodsStand : '',			// 상품규격
		barcode : '',
		ipAmt : 0,				// 매입가
		doAmt : 0,				// 도매가			
		interAmt : 0,			// 인터넷가
		soAmt : 0,				// 소매가
		userAmt : 0,			// 권장소비자가
		umgubun : '',			// 유무형구분
		origin : '',				// 원산지
		making : '',			// 제조처
		G_OnCode : '',			// 자체코드
		location : '',			// 로케이션
		bigo : ''				// 비고
	}

	/* 거래처 등록모드 */
	$scope.gereacheiGioGu = [
		{ name: '입출구분 선택', val: '' },
		{ name: '입출처', val: '603' },
		{ name: '매입처', val: '601' },
		{ name: '매출처', val: '602' }
	]

	/* 거래처 수정등록 객체 */
	$scope.gereachei_Object = {
		GerCode : '',
		GerName : '',
		G_Sano : '',
		G_ioGu : '',
		G_up : '',
		G_Jong : '',
		G_Ceo : '',
		G_Post1 : '',
		G_Juso1 : '',
		G_GDamdang : '',
		Hp : '',
		Tax_GDamdang : '',
		Tax_GDamdangTel : '',
		Tax_EMail : '',
		bigo : ''
	}

	$scope.goodsUpdate = function(gubun, $index){
		if(gubun == 1 ){
			if($rootScope.privproduct_Save == 'Y'){
				$scope.goods_Object.goodsCode = $scope.goods_result[$index].G_Code;
				$scope.goods_Object.stts = $scope.goods_result[$index].Dis_Use;
				$scope.goods_Object.goodsName = $scope.goods_result[$index].G_Name;
				$scope.goods_Object.goodsStand = $scope.goods_result[$index].G_Stand;
				$scope.goods_Object.location = $scope.goods_result[$index].G_Wich;
				$scope.goods_Object.barcode = $scope.goods_result[$index].Barcode;
				$scope.goods_Object.ipAmt = parseInt($scope.goods_result[$index].G_Dn1);
				$scope.goods_Object.doAmt = parseInt($scope.goods_result[$index].G_Dn2);
				$scope.goods_Object.interAmt = parseInt($scope.goods_result[$index].G_Dn3);
				$scope.goods_Object.soAmt = parseInt($scope.goods_result[$index].G_Dn4);
				$scope.goods_Object.userAmt = parseInt($scope.goods_result[$index].G_Dn5);
				$scope.goods_Object.umgubun = $scope.goods_result[$index].UM_GUBUN;
				$scope.goods_Object.bigo = $scope.goods_result[$index].bigo;

				$rootScope.GGMode = "수정";
				$scope.goodsIU_M.show();
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('접근 권한이 없습니다.', 'long', 'center');
				else console.log('접근 권한이 없습니다.');
			}
		}else {
			if($rootScope.privGereachei_Save == 'Y'){
				$scope.gereachei_Object.GerCode = $scope.gereachei_result[$index].GerCode;
				$scope.gereachei_Object.GerName = $scope.gereachei_result[$index].GerName;
				$scope.gereachei_Object.G_Sano = $scope.gereachei_result[$index].G_Sano;
				$scope.gereachei_Object.G_ioGu = $scope.gereachei_result[$index].G_ioGu;
				$scope.gereachei_Object.G_up = $scope.gereachei_result[$index].G_up;
				$scope.gereachei_Object.G_Jong = $scope.gereachei_result[$index].G_Jong;
				$scope.gereachei_Object.G_Ceo = $scope.gereachei_result[$index].G_Ceo;
				$scope.gereachei_Object.G_Post1 = $scope.gereachei_result[$index].G_Post1;
				$scope.gereachei_Object.G_Juso1 = $scope.gereachei_result[$index].G_Juso1;
				$scope.gereachei_Object.G_GDamdang = $scope.gereachei_result[$index].G_GDamdang;
				$scope.gereachei_Object.Hp = $scope.gereachei_result[$index].G_GDamdangTel;
				$scope.gereachei_Object.Tax_GDamdang = $scope.gereachei_result[$index].Tax_GDamdang;
				$scope.gereachei_Object.Tax_GDamdangTel = $scope.gereachei_result[$index].Tax_GDamdangTel;
				$scope.gereachei_Object.Tax_EMail = $scope.gereachei_result[$index].Tax_EMail;
				$scope.gereachei_Object.bigo = $scope.gereachei_result[$index].G_Remk;

				$scope.updown1 = 'ion-arrow-up-b';
				$scope.updown2 = 'ion-arrow-down-b';
				$scope.updown3 = 'ion-arrow-down-b';

				$rootScope.GGMode = "수정";
				$scope.accounIU_M.show();
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('접근 권한이 없습니다.', 'long', 'center');
				else console.log('접근 권한이 없습니다.');
			}
		}
	}

	/* 상품/거래처 등록페이지로 이동 */
	$scope.Goods_Gerea_IU = function(gubun){
		if(gubun == '0'){
			if($rootScope.privproduct_Save == 'Y'){
				$rootScope.GGMode = "등록";
				$scope.goodsIU_M.show();
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('접근 권한이 없습니다.', 'long', 'center');
				else console.log('접근 권한이 없습니다.');
			}
			
		}else if(gubun == '1'){
			if($rootScope.privGereachei_Save == 'Y'){
				$scope.updown1 = 'ion-arrow-up-b';
				$scope.updown2 = 'ion-arrow-down-b';
				$scope.updown3 = 'ion-arrow-down-b';

				$rootScope.GGMode = "등록";
				$scope.accounIU_M.show();
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('접근 권한이 없습니다.', 'long', 'center');
				else console.log('접근 권한이 없습니다.');
			}
		}
	}

	/* 거래처 페이지 컨트롤 */
	$scope.updown = function(gubun){
		switch(gubun){
			case 1 : 
					if($scope.updown1 == 'ion-arrow-up-b') $scope.updown1 = 'ion-arrow-down-b';
					else $scope.updown1 = 'ion-arrow-up-b';
					break;
			case 2 :
					if($scope.updown2 == 'ion-arrow-up-b') $scope.updown2 = 'ion-arrow-down-b';
					else $scope.updown2 = 'ion-arrow-up-b';
					break;
			case 3 :
					if($scope.updown3 == 'ion-arrow-up-b') $scope.updown3 = 'ion-arrow-down-b';
					else $scope.updown3 = 'ion-arrow-up-b';
					break;
		}
	}

	/* 초기화 펑션 */
	$scope.gg_reset = function(gubun){
		if(gubun == 1){
			$scope.goods_Object.goodsCode = '';
			$scope.goods_Object.stts = '';
			$scope.goods_Object.goodsName = '';
			$scope.goods_Object.goodsStand = '';
			$scope.goods_Object.barcode = '';
			$scope.goods_Object.ipAmt = 0;
			$scope.goods_Object.doAmt = 0;
			$scope.goods_Object.interAmt = 0;
			$scope.goods_Object.soAmt = 0;
			$scope.goods_Object.userAmt = 0;
			$scope.goods_Object.umgubun = '';
			$scope.goods_Object.location = '';
			$scope.goods_Object.bigo = '';
		}else{
			$scope.gereachei_Object.GerCode = '';
			$scope.gereachei_Object.GerName = '';
			$scope.gereachei_Object.G_Sano = '';
			$scope.gereachei_Object.G_ioGu = '';
			$scope.gereachei_Object.G_up = '';
			$scope.gereachei_Object.G_Jong = '';
			$scope.gereachei_Object.G_Ceo = '';
			$scope.gereachei_Object.G_Post1 = '';
			$scope.gereachei_Object.G_Juso1 = '';
			$scope.gereachei_Object.G_GDamdang = '';
			$scope.gereachei_Object.Hp = '';
			$scope.gereachei_Object.Tax_GDamdang = '';
			$scope.gereachei_Object.Tax_GDamdangTel = '';
			$scope.gereachei_Object.Tax_EMail = '';
			$scope.gereachei_Object.bigo = '';
		}
	}

	// $scope.gereacheiClear = function(gubun){
	// 	console.log('안와?');
	// 	switch (gubun){
	// 		case 1: $scope.gereachei_Object.GerName = ''; break;
	// 		case 2: $scope.gereachei_Object.G_Sano = ''; break;
	// 		case 3: $scope.gereachei_Object.G_up = ''; break;
	// 		case 4: $scope.gereachei_Object.G_Jong = ''; break;
	// 		case 5: $scope.gereachei_Object.G_Ceo = ''; break;
	// 		case 6: $scope.gereachei_Object.G_Juso1 = ''; break;
	// 		case 7: $scope.gereachei_Object.G_GDamdang = ''; break;
	// 		case 8: $scope.gereachei_Object.Hp = ''; break;
	// 		case 9: $scope.gereachei_Object.Tax_GDamdang = ''; break;
	// 		case 10: $scope.gereachei_Object.Tax_GDamdangTel = ''; break;
	// 		case 11: $scope.gereachei_Object.Tax_EMail = ''; break;
	// 	}
	// }

	/* 수정/등록 모달 닫기 = 값 초기화 */
	$scope.M_close = function(gubun){
		if(gubun == '1'){
			$ionicPopup.show({
				title: '<b>' + $rootScope.GGMode + '확인</b>',
				content: '작성중인 내용이 지워집니다.<br> 계속진행하시겠습니까?',
				buttons: [
					{ 
						text: '취소', onTap: function(e){} 
					},
					{ 
						text: '확인', 
						type: 'button-positive', 
						onTap: function(e){
							$scope.gg_reset(1);
							$scope.goodsIU_M.hide();
						} 
					}
				]
			})
		}else{
			$ionicPopup.show({
				title: '<b>' + $rootScope.GGMode + '확인</b>',
				content: '작성중인 내용이 지워집니다.<br> 계속진행하시겠습니까?',
				buttons: [
					{ 
						text: '취소', onTap: function(e){} 
					},
					{ 
						text: '확인', 
						type: 'button-positive', 
						onTap: function(e){
							$scope.gg_reset(2);
							$scope.accounIU_M.hide();
						} 
					}
				]
			})
		}
	}	

	/* 등록/수정 */
	$scope.goodsGereachei_IU = function(gubun){
		/* 상품 등록/수정 */
		if(gubun == 1){
			if($scope.goods_Object.goodsName.length == 0){
				$ionicPopup.show({
					title: '<b>경고</b>',
					content: '상품명은 필수기재사항입니다',
					buttons: [
						{ text: '확인', type: 'button-positive', onTap: function(e){} }
					]
				})
			}else{

				$ionicPopup.show({
					title: '<b>' + $rootScope.GGMode + '확인</b>',
					content: '상품을 ' + $rootScope.GGMode + '하시겠습니까?',
					buttons: [
						{ 
							text: '취소', onTap: function(e){} 
						},
						{ 
							text: '확인', 
							type: 'button-positive', 
							onTap: function(e){
								$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
								if($scope.goods_Object.ipAmt == null || $scope.goods_Object.ipAmt.length == undefined) $scope.goods_Object.ipAmt = 0;
								if($scope.goods_Object.doAmt == null || $scope.goods_Object.doAmt.length == undefined) $scope.goods_Object.doAmt = 0;
								if($scope.goods_Object.interAmt == null || $scope.goods_Object.interAmt.length == undefined) $scope.goods_Object.interAmt = 0;
								if($scope.goods_Object.soAmt == null || $scope.goods_Object.soAmt.length == undefined) $scope.goods_Object.soAmt = 0;
								if($scope.goods_Object.userAmt == null || $scope.goods_Object.userAmt.length == undefined) $scope.goods_Object.userAmt = 0;

								EasyService.goods_IU($rootScope.loginData.Admin_Code, $scope.loginData.UserId, $scope.goods_Object)
								.then(function(response){
									console.log('등록또는 수정후 결과값 ->',response);
									$ionicLoading.hide();
									if(response.data.list[0].success == "True"){
										$ionicPopup.show({
											title: '<b>' + $rootScope.GGMode + '완료</b>',
											content: '상품이 ' + $rootScope.GGMode + '되었습니다.',
											buttons: [
												{
													text: '확인',
													type: 'button-positive',
													onTap: function(e){
														$scope.gg_reset(1);
														$scope.pagenum();
														$scope.goodsSerch(1);
														$scope.goodsIU_M.hide();
													}
												}
											]
										})
									}else{
										$ionicPopup.show({
											title: '<b>' + $rootScope.GGMode + '실패</b>',
											content: '일시적 오류가 발생하였습니다. <br>잠시후 다시시도해주세요.',
											buttons: [
												{ text: '확인', type: 'button-positive', onTap: function(e){} }
											]
										})
									}
								},function(){
									$ionicLoading.hide();
									alert("error");
								});
							} 
						}
					]
				})
			}
		}
		/* 거래처 등록/수정 */
		else{
			if($scope.gereachei_Object.GerName.length == 0){
				$ionicPopup.show({
					title: '<b>경고</b>',
					content: '거래처명은 필수기재사항입니다',
					buttons: [
						{ text: '확인', type: 'button-positive', onTap: function(e){} }
					]
				})
			}else{
				$ionicPopup.show({
					title: '<b>' + $rootScope.GGMode + '확인</b>',
					content: '상품을 ' + $rootScope.GGMode + '하시겠습니까?',
					buttons: [
						{ 
							text: '취소', onTap: function(e){} 
						},
						{ 
							text: '확인', 
							type: 'button-positive', 
							onTap: function(e){
								$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
								EasyService.gereachei_IU($rootScope.loginData.Admin_Code, $scope.loginData.UserId, $scope.gereachei_Object)
								.then(function(response){
									$ionicLoading.hide();
									if(response.data.list[0].success == "True"){
										$ionicPopup.show({
											title: '<b>' + $rootScope.GGMode + '완료</b>',
											content: '거래처가 ' + $rootScope.GGMode + '되었습니다.',
											buttons: [
												{
													text: '확인',
													type: 'button-positive',
													onTap: function(e){
														$scope.gg_reset();
														$scope.pagenum();
														$scope.gereacheiSerch(1);
														$scope.accounIU_M.hide();
													}
												}
											]
										})
									}else{
										$ionicPopup.show({
											title: '<b>' + $rootScope.GGMode + '실패</b>',
											content: '일시적 오류가 발생하였습니다. <br>잠시후 다시시도해주세요.',
											buttons: [
												{ text: '확인', type: 'button-positive', onTap: function(e){} }
											]
										})
									}
								},function(){
									$ionicLoading.hide();
									alert("error");
								});
							} 
						}
					]
				})
			}
		}
	}
});
