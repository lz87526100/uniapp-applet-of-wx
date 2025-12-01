"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_store_head2 = common_vendor.resolveComponent("store-head");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_store_head2 + _easycom_uni_load_more2)();
}
const _easycom_store_head = () => "../../components/store-head/store-head.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_store_head + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "shopList",
  setup(__props) {
    const shopsList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const hasMore = common_vendor.ref(true);
    const currentPage = common_vendor.ref(1);
    common_vendor.onMounted(() => {
      loadShops(1);
    });
    function goToMap() {
      common_vendor.index.__f__("log", "at pages/shopList/shopList.vue:113", "跳转到地图页面");
      common_vendor.index.navigateTo({
        url: "/pages/showMap/showMap"
      });
    }
    async function loadShops(page = 1) {
      var _a, _b;
      if (loading.value || loadingMore.value)
        return;
      if (page === 1) {
        loading.value = true;
        shopsList.value = [];
        hasMore.value = true;
        currentPage.value = 1;
      } else {
        loadingMore.value = true;
      }
      try {
        const res = await common_vendor.tr.callFunction({
          name: "getShopList",
          data: {
            keyword: searchKeyword.value,
            page,
            pageSize: 10
          }
        });
        if (((_a = res.result) == null ? void 0 : _a.errCode) === 0) {
          const newData = res.result.data || [];
          const formattedData = newData.map((shop) => ({
            _id: shop.id,
            // 使用转换后的id
            shopName: shop.name,
            shopPic: shop.shopPic,
            address: shop.address,
            rating: parseFloat(shop.rating) * 10,
            // 转回整数格式
            monthlyOrders: shop.monthlySales,
            // 使用转换后的字段
            businessHours: shop.businessHours,
            description: shop.description,
            phone: shop.phone
          }));
          if (page === 1) {
            shopsList.value = formattedData;
          } else {
            shopsList.value.push(...formattedData);
          }
          hasMore.value = newData.length === 10;
          currentPage.value = page;
        } else {
          common_vendor.index.showToast({ title: ((_b = res.result) == null ? void 0 : _b.errMsg) || "加载失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/shopList/shopList.vue:169", "加载店铺失败:", e);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      } finally {
        loading.value = false;
        loadingMore.value = false;
      }
    }
    function loadMore() {
      if (hasMore.value && !loadingMore.value) {
        loadShops(currentPage.value + 1);
      }
    }
    function handleImageError(e) {
      e.target.src = "/static/default-shop.jpg";
    }
    function goShopDetail(id) {
      if (!id)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/shopList/shopDetail?id=${encodeURIComponent(id)}`
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value && shopsList.value.length === 0
      }, loading.value && shopsList.value.length === 0 ? {
        b: common_vendor.f(5, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : common_vendor.e({
        c: common_vendor.f(shopsList.value, (shop, k0, i0) => {
          return common_vendor.e({
            a: shop.shopPic || "/static/default-shop.jpg",
            b: common_vendor.o(handleImageError, shop._id),
            c: common_vendor.t(shop.shopName),
            d: shop.rating > 0
          }, shop.rating > 0 ? {
            e: common_vendor.t((shop.rating / 10).toFixed(1))
          } : {}, {
            f: common_vendor.t(shop.address),
            g: shop.monthlyOrders !== void 0
          }, shop.monthlyOrders !== void 0 ? {
            h: common_vendor.t(shop.monthlyOrders)
          } : {}, {
            i: shop.deliveryTime
          }, shop.deliveryTime ? {
            j: common_vendor.t(shop.deliveryTime)
          } : {}, {
            k: shop._id,
            l: common_vendor.o(($event) => goShopDetail(shop._id), shop._id),
            m: `进入 ${shop.shopName} 店铺详情`
          });
        }),
        d: shopsList.value.length === 0 && !loading.value
      }, shopsList.value.length === 0 && !loading.value ? {
        e: common_vendor.t(searchKeyword.value ? `未找到"${searchKeyword.value}"相关店铺` : "暂无推荐商家"),
        f: common_vendor.o(($event) => loadShops(1))
      } : {}, {
        g: shopsList.value.length > 0
      }, shopsList.value.length > 0 ? {
        h: common_vendor.p({
          status: loadingMore.value ? "loading" : hasMore.value ? "more" : "noMore",
          iconType: "auto"
        })
      } : {}), {
        i: common_vendor.o(loadMore),
        j: common_vendor.o(goToMap)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a7db886"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shopList/shopList.js.map
