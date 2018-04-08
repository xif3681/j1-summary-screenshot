/**
 * Angularjs环境下分页
 * name: tm.pagination
 * Version: 1.0.0
 */
import uiModules from 'ui/modules';
import $ from 'jquery';
import 'ui/angular-bootstrap';
import template from './dis_pagination.html';
uiModules.get('kibana')
  .directive('disPagination', [function ($translate, $translatePartialLoader) {
    // $translatePartialLoader.addPart('../plugins/kibana/data');
    // $translate.refresh();
    return {
      restrict: 'EA',
      template: template,
      scope: {
        conf: '='
      },

      controller: function ($scope, $translatePartialLoader, $translate) {
        $translatePartialLoader.addPart('../plugins/kibana/data');
        $translate.refresh();
      },
      link: function (scope, element, attrs) {


        // 变更当前页
        scope.changeCurrentPage = function (item) {
          // if (item == '...') {
          //   return;
          // } else {
          //   scope.conf.currentPage = item;
          // }
          if (item.length > 3 && item.substring(0, 3) == '...') {
            scope.conf.currentPage = item.substring(3);
          } else if (item.length > 3 && item.substring(0, 1) == '1' && item.substring(1, 4) == '...') {
            scope.conf.currentPage = 1;
          } else {
            scope.conf.currentPage = item;
          }

        };
        scope.jumpPageKeyUp = function (e) {
          var keycode = window.event ? e.keyCode : e.which;

          if (keycode == 13) {
            scope.jumpToPage();
          }
        }
        // 定义分页的长度必须为奇数 (default:9)
        scope.conf.pagesLength = parseInt(scope.conf.pagesLength) ? parseInt(scope.conf.pagesLength) : 9;
        if (scope.conf.pagesLength % 2 === 0) {
          // 如果不是奇数的时候处理一下
          scope.conf.pagesLength = scope.conf.pagesLength - 1;
        }

        // conf.erPageOptions
        if (!scope.conf.perPageOptions) {
          scope.conf.perPageOptions = [10, 15, 20, 30, 50];
        }

        // pageList数组
        function getPagination() {
          // conf.currentPage
          scope.conf.currentPage = parseInt(scope.conf.currentPage) ? parseInt(scope.conf.currentPage) : 1;
          // conf.totalItems
          scope.conf.totalItems = parseInt(scope.conf.totalItems);

          // conf.itemsPerPage (default:15)
          // 先判断一下本地存储中有没有这个值
          if (scope.conf.rememberPerPage) {
            if (!parseInt(localStorage[scope.conf.rememberPerPage])) {
              localStorage[scope.conf.rememberPerPage] = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 15;
            }

            scope.conf.itemsPerPage = parseInt(localStorage[scope.conf.rememberPerPage]);
          } else {
            scope.conf.itemsPerPage = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 15;
          }

          // numberOfPages
          scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems / scope.conf.itemsPerPage);

          // judge currentPage > scope.numberOfPages
          if (scope.conf.currentPage < 1) {
            scope.conf.currentPage = 1;
          }

          if (scope.conf.currentPage > scope.conf.numberOfPages) {
            scope.conf.currentPage = scope.conf.numberOfPages;
          }

          // jumpPageNum
          scope.jumpPageNum = scope.conf.currentPage;

          // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
          var perPageOptionsLength = scope.conf.perPageOptions.length;
          // 定义状态
          var perPageOptionsStatus;
          for (var i = 0; i < perPageOptionsLength; i++) {
            if (scope.conf.perPageOptions[i] == scope.conf.itemsPerPage) {
              perPageOptionsStatus = true;
            }
          }
          // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
          if (!perPageOptionsStatus) {
            scope.conf.perPageOptions.push(scope.conf.itemsPerPage);
          }

          // 对选项进行sort
          scope.conf.perPageOptions.sort(function (a, b) {
            return a - b
          });

          scope.pageList = [];
          if (scope.conf.numberOfPages <= 6) {
            // 判断总页数如果小于等于分页的长度，若小于则直接显示
            for (i = 1; i <= scope.conf.numberOfPages; i++) {
              scope.pageList.push(i);
            }
          } else {
            // 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
            // 计算中心偏移量
            var offset = (scope.conf.pagesLength - 1) / 2;
            if (scope.conf.currentPage <= offset) {
              // 左边没有...
              for (i = 1; i <= offset + 1; i++) {
                scope.pageList.push(i);
              }
              scope.pageList.push('...' + scope.conf.numberOfPages);
              // scope.pageList.push(scope.conf.numberOfPages);
            } else if (scope.conf.currentPage > scope.conf.numberOfPages - offset) {
              scope.pageList.push(1 + '...');
              // scope.pageList.push('...');
              for (i = offset; i >= 1; i--) {
                scope.pageList.push(scope.conf.numberOfPages - i);
              }
              scope.pageList.push(scope.conf.numberOfPages);
            } else {
              // 最后一种情况，两边都有...
              scope.pageList.push(1 + '...');
              // scope.pageList.push('...');

              for (i = Math.ceil(offset / 2); i >= 1; i--) {
                scope.pageList.push(scope.conf.currentPage - i);
              }
              scope.pageList.push(scope.conf.currentPage);
              for (i = 1; i <= offset / 2; i++) {
                scope.pageList.push(scope.conf.currentPage + i);
              }

              // scope.pageList.push('...');
              scope.pageList.push('...' + scope.conf.numberOfPages);
            }
          }

          if (scope.conf.onChange) {
            scope.conf.onChange();
          }
          scope.$parent.conf = scope.conf;
        }

        // prevPage
        scope.prevPage = function () {
          if (scope.conf.currentPage > 1) {
            scope.conf.currentPage -= 1;
          }
        };
        // nextPage
        scope.nextPage = function () {
          if (scope.conf.currentPage < scope.conf.numberOfPages) {
            scope.conf.currentPage += 1;
          }
        };

        // 跳转页
        scope.jumpToPage = function () {
          scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g, '');
          if (scope.jumpPageNum !== '') {
            scope.conf.currentPage = scope.jumpPageNum;
          }
        };
        // 修改每页显示的条数
        scope.changeItemsPerPage = function (option) {
          scope.conf.itemsPerPage = option;
          // 清除本地存储的值方便重新设置
          if (scope.conf.rememberPerPage) {
            localStorage.removeItem(scope.conf.rememberPerPage);
          }
        };

        scope.$watch(function () {
          var newValue = scope.conf.currentPage + ' ' + scope.conf.totalItems + ' ';
          // 如果直接watch perPage变化的时候，因为记住功能的原因，所以一开始可能调用两次。
          //所以用了如下方式处理
          if (scope.conf.rememberPerPage) {
            // 由于记住的时候需要特别处理一下，不然可能造成反复请求
            // 之所以不监控localStorage[scope.conf.rememberPerPage]是因为在删除的时候会undefind
            // 然后又一次请求
            if (localStorage[scope.conf.rememberPerPage]) {
              newValue += localStorage[scope.conf.rememberPerPage];
            } else {
              newValue += scope.conf.itemsPerPage;
            }
          } else {
            newValue += scope.conf.itemsPerPage;
          }
          return newValue;

        }, getPagination);

      }
    };
  }]);

