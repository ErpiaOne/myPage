/* 더보기 메뉴 / 상품 & 거래처 조회 및 간편등록 컨트롤러 */
angular.module('starter.controllers').controller("EasyCtrl", function($rootScope, $scope, $timeout, $ionicModal, EasyService) {
console.log("간편 상품 거래처 컨트롤러");
	$scope.page = 0;

	/* 상품 조회모드 */
	$scope.sttsMode = [
		{ name: '전체(삭세상품제외)', val: '' },
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

	/* 상품 검색 */
	$scope.goodsSerch = function(gubun){
		$scope.page = $scope.page + 1;	// 페이징 넘버 +1
		if(gubun == 1){					// 첫페이지 조회시
			EasyService.goods_Select($rootScope.loginData.Admin_Code, $scope.GoodsInfo.stts, $scope.page, $scope.GoodsInfo.searchKey)
			.then(function(response){
				$scope.goods_result = response.data.list;
				$scope.moreBtn = $scope.goods_result.length-1;
			},function(){
				alert("error");
			});
		}else{							// 더보기 클릭시
			$scope.goods_result.splice($scope.moreBtn, 1);
			EasyService.goods_Select($rootScope.loginData.Admin_Code, $scope.GoodsInfo.stts, $scope.page, $scope.GoodsInfo.searchKey)
			.then(function(response){
				for(var i = 0 ; i < response.data.list.length; i++) {
					$scope.goods_result.push(response.data.list[i]);
				}
				$scope.moreBtn = $scope.goods_result.length-1;
			},function(){
				alert("error");
			});
		}
		
	}

	/* 거래처 검색 */
	$scope.gereacheiSerch = function(gubun){
		console.log('거래처 전체조회');
		$scope.page = $scope.page + 1; 	// 페이징 넘버 +1
		if(gubun == 1){					// 첫페이지 조회시
			EasyService.gereachei_Select($rootScope.loginData.Admin_Code, $scope.page, $scope.GereacheInfo.g_iogu, $scope.GereacheInfo.searchKey)
			.then(function(response){
				$scope.gereachei_result = response.data.list;
				$scope.moreBtn = $scope.gereachei_result.length-1;
			},function(){
				alert("error");
			});
		}else{							// 더보기 클릭시
			$scope.gereachei_result.splice($scope.moreBtn, 1);
			EasyService.gereachei_Select($rootScope.loginData.Admin_Code, $scope.page, g_iogu, searchKey)
			.then(function(response){
				for(var i = 0 ; i < response.data.list.length; i++) {
					$scope.gereachei_result.push(response.data.list[i]);
				}
				$scope.moreBtn = $scope.gereachei_result.length-1;
			},function(){
				alert("error");
			});
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

	/* 상품 등록모드 */
	$scope.goodsStts = [
		{ name: '상태', val: '' },
		{ name: '정상', val: '0' },
		{ name: '일시품절', val: '1' },
		{ name: '장기품절', val: '2' },
		{ name: '단종', val: '3' },
		{ name: '비활성화상품', val: '4' },
		{ name: '삭제상품', val: '9' }
	]

	/* 상품 유무형구분 */
	$scope.goods_shapeYN = [
		{ name: '유무형구분', val: '' },
		{ name: '전체(삭세상품제외)', val: 'Y' },
		{ name: '정상', val: 'N' }
	]

	/* 상품 수정등록 객체 */
	$scope.goods_Object = {
		goodsCode : '',			// 상품코드
		stts : '',				// 상태
		goodsName : '',			// 상품이름
		goodsStand : '',			// 상품규격
		ipAmt : 0,				// 매입가
		doAmt : 0,				// 도매가			
		interAmt : 0,			// 인터넷가
		soAmt : 0,				// 소매가
		userAmt : 0,			// 권장소비자가
		origin : '',				// 원산지
		making : '',			// 제조처
		G_OnCode : '',			// 자체코드
		location : '',			// 로케이션
		bigo : ''				// 비고
	}

	/* 상품/거래처 수정또는 등록페이지로 이동 */
	$scope.Goods_Gerea_IU = function(gubun){
		if(gubun == '0'){
			console.log("상품 간편 등록");
			$scope.goodsIU_M.show();
		}else if(gubun == '1'){
			console.log("거래처 간편 등록");
			$scope.accounIU_M.show();
		}
	}

	/* 수정/등록 모달 닫기 = 값 초기화 */
	$scope.M_close = function(gubun){
		if(gubun == '1'){
			$scope.goodsIU_M.hide();
		}else{
			$scope.accounIU_M.hide();
		}
	}	
});
