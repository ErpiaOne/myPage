/* 더보기 메뉴 / 상품 & 거래처 조회 및 간편등록 컨트롤러 */
angular.module('starter.controllers').controller("EasyCtrl", function($rootScope, $scope, EasyService) {
console.log("간편 상품 거래처 컨트롤러");
	$scope.page1 = 0;
	$scope.GoodsInfo = {
		stts : '',			// 상품상태 : 0.정상, 1.일시품절, 2.장기품절, 3.단종, 4.비활성상품, 9.삭제상품 / 공란이면 0~4까지 검색
		searchKey : ''		// 검색어
	}

	$scope.goodsSerch = function(){
		console.log('상품 전체조회');
		$scope.page = $scope.page + 1;
		EasyService.goods_Select($rootScope.loginData.Admin_Code, stts, $scope.page, searchKey)
		.then(function(pushInfo){
			
		},function(){
			alert("error");
		});
	}


	$scope.gereacheiSerch = function(){
		console.log('거래처 전체조회');
		$scope.page = $scope.page + 1;
		EasyService.gereachei_Select($rootScope.loginData.Admin_Code, $scope.page, g_iogu, searchKey)
		.then(function(pushInfo){
			
		},function(){
			alert("error");
		});
	}

});
