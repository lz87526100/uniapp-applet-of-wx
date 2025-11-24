"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
const MAX_CACHE_SIZE = 30;
const _sfc_main = {
  __name: "shopDetail",
  setup(__props) {
    const shopInfo = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const error = common_vendor.ref("");
    const isFavorite = common_vendor.ref(false);
    const hasMenu = common_vendor.ref(true);
    const shopId = common_vendor.ref("");
    const activeCategory = common_vendor.ref(1);
    const reviews = common_vendor.ref([]);
    const reviewsLoading = common_vendor.ref(false);
    const reviewsPage = common_vendor.ref(1);
    const reviewsSize = common_vendor.ref(10);
    const reviewsTotal = common_vendor.ref(0);
    const hasMoreReviews = common_vendor.ref(true);
    const mapCenter = common_vendor.reactive({
      latitude: 25.034161,
      longitude: 118.482187
    });
    const mapScale = common_vendor.ref(16);
    const mapMarkers = common_vendor.ref([]);
    const mapContext = common_vendor.ref(null);
    const userAvatarCache = common_vendor.ref(/* @__PURE__ */ new Map());
    function goToReviewDetail(review) {
      var _a;
      if (!review || !review.id) {
        common_vendor.index.showToast({
          title: "评论信息不完整",
          icon: "none"
        });
        return;
      }
      const url = `/pages/blog/detail?id=${review.id}&shopId=${((_a = shopInfo.value) == null ? void 0 : _a._id) || ""}`;
      common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:359", "🔄 跳转到评论详情:", url);
      common_vendor.index.navigateTo({
        url,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/shopList/shopDetail.vue:364", "❌ 跳转失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败",
            icon: "none"
          });
        }
      });
    }
    const menuCategories = common_vendor.ref([
      { id: 1, name: "热销推荐" },
      { id: 2, name: "主食" },
      { id: 3, name: "小吃" },
      { id: 4, name: "饮料" },
      { id: 5, name: "套餐" }
    ]);
    const products = common_vendor.ref([
      {
        id: 1,
        categoryId: 1,
        name: "招牌牛肉面",
        description: "精选优质牛肉，汤底鲜美",
        price: 28,
        sales: 156,
        image: "/static/food1.jpg"
      },
      {
        id: 2,
        categoryId: 1,
        name: "特色炸鸡",
        description: "外酥里嫩，香脆可口",
        price: 22,
        sales: 89,
        image: "/static/food2.jpg"
      }
    ]);
    const isOpen = common_vendor.computed(() => {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a.businessHours))
        return true;
      const hoursStr = shopInfo.value.businessHours;
      const [start, end] = hoursStr.split("-");
      if (!start || !end)
        return true;
      const now = /* @__PURE__ */ new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHours * 60 + currentMinutes;
      const [startHours, startMinutes] = start.split(":").map(Number);
      const [endHours, endMinutes] = end.split(":").map(Number);
      const startTime = startHours * 60 + (startMinutes || 0);
      const endTime = endHours * 60 + (endMinutes || 0);
      return currentTime >= startTime && currentTime <= endTime;
    });
    const currentProducts = common_vendor.computed(() => {
      return products.value.filter((product) => product.categoryId === activeCategory.value);
    });
    const displayReviews = common_vendor.computed(() => {
      return reviews.value.slice(0, 3);
    });
    const hasReviews = common_vendor.computed(() => {
      return reviews.value.length > 0;
    });
    common_vendor.onLoad((options) => {
      if (options.id) {
        shopId.value = options.id;
        loadShopDetail(options.id);
      } else {
        error.value = "店铺ID不存在";
      }
    });
    common_vendor.onShow(() => {
      var _a, _b;
      if ((_b = (_a = shopInfo.value) == null ? void 0 : _a.location) == null ? void 0 : _b.coordinates) {
        setTimeout(() => {
          initMapMarkers();
        }, 100);
      }
    });
    async function loadShopDetail(id) {
      var _a, _b;
      loading.value = true;
      error.value = "";
      try {
        common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:463", "🔄 开始加载店铺详情，ID:", id);
        const res = await common_vendor.tr.callFunction({
          name: "getShopDetail",
          data: { shopId: id }
        });
        common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:470", "📡 店铺详情响应:", res);
        if (((_a = res.result) == null ? void 0 : _a.errCode) === 0) {
          shopInfo.value = res.result.data;
          common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:474", "✅ 店铺信息:", shopInfo.value);
          initMapMarkers();
          checkFavoriteStatus(id);
          common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:480", "🔄 开始加载评论...");
          await loadShopReviews(true);
        } else {
          error.value = ((_b = res.result) == null ? void 0 : _b.errMsg) || "加载失败";
          common_vendor.index.__f__("error", "at pages/shopList/shopDetail.vue:484", "❌ 店铺详情加载失败:", error.value);
          useTestData(id);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/shopList/shopDetail.vue:488", "❌ 加载店铺详情异常:", e);
        error.value = "网络错误，请重试";
        useTestData(id);
      } finally {
        loading.value = false;
      }
    }
    async function loadShopReviews(reset = false) {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a._id))
        return;
      if (reset) {
        reviewsPage.value = 1;
        reviews.value = [];
        hasMoreReviews.value = true;
      }
      if (!hasMoreReviews.value && !reset)
        return;
      reviewsLoading.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:511", "🔄 调用现有文章云对象...");
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.list({
          page: reviewsPage.value,
          size: reviewsSize.value
        });
        common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:521", "📡 文章云对象响应:", res);
        if (res.errCode === 0) {
          const shopReviews = (res.data || []).filter(
            (item) => item.shop_id === shopInfo.value._id
          );
          common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:529", "✅ 过滤后的店铺评论:", shopReviews.length, "条");
          const newReviews = [];
          for (let item of shopReviews) {
            const processedReview = await processReviewData(item);
            newReviews.push(processedReview);
          }
          common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:538", "🎯 处理后的评论数据:", newReviews);
          if (reset) {
            reviews.value = [...newReviews];
          } else {
            reviews.value = [...reviews.value, ...newReviews];
          }
          reviewsTotal.value = newReviews.length;
          hasMoreReviews.value = newReviews.length >= reviewsSize.value;
          reviewsPage.value += 1;
        } else {
          throw new Error(res.errMsg || "云对象返回错误");
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/shopList/shopDetail.vue:555", "❌ 评论加载失败:", error2);
        await loadReviewsDirect();
      } finally {
        reviewsLoading.value = false;
      }
    }
    async function processReviewData(item) {
      common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:566", "🔍 处理单条评论数据:", item);
      const userInfo = item.user_id && item.user_id[0] ? item.user_id[0] : {};
      const userId = userInfo._id;
      let avatarUrl = await getAvatarUrl(userInfo, userId);
      let timeStr = "";
      if (item.publish_date) {
        const date = new Date(item.publish_date);
        timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
      let imageUrls = [];
      if (item.pics && Array.isArray(item.pics)) {
        imageUrls = item.pics.map((pic) => {
          if (pic && typeof pic === "object" && pic.url) {
            return pic.url;
          } else if (typeof pic === "string") {
            return pic;
          }
          return null;
        }).filter((url) => url !== null);
      }
      common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:596", "🖼️ 处理后的图片URLs:", imageUrls);
      return {
        id: item._id,
        userId,
        userName: userInfo.nickname || `用户${userId ? userId.slice(-4) : "0000"}`,
        avatar: avatarUrl,
        rating: item.rating || 5,
        time: timeStr,
        content: item.content || "暂无评论内容",
        images: imageUrls
      };
    }
    async function getAvatarUrl(userInfo, userId) {
      if (!userInfo || !userId)
        return "/static/default-avatar.png";
      if (userAvatarCache.value.has(userId)) {
        return userAvatarCache.value.get(userId);
      }
      let avatarUrl = "/static/default-avatar.png";
      if (userInfo.avatar_url && userInfo.avatar_url.startsWith("http")) {
        avatarUrl = userInfo.avatar_url;
      } else if (userInfo.avatar_file && userInfo.avatar_file.url) {
        const fileUrl = userInfo.avatar_file.url;
        if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        } else if (fileUrl.startsWith("cloud:")) {
          try {
            const result = await common_vendor.tr.getTempFileURL({
              fileList: [fileUrl]
            });
            if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
              avatarUrl = result.fileList[0].tempFileURL;
            }
          } catch (error2) {
            common_vendor.index.__f__("error", "at pages/shopList/shopDetail.vue:639", "转换云存储URL失败:", error2);
          }
        }
      } else if (userInfo.avatar && userInfo.avatar.startsWith("http")) {
        avatarUrl = userInfo.avatar;
      }
      if (avatarUrl !== "/static/default-avatar.png") {
        updateAvatarCache(userId, avatarUrl);
      }
      return avatarUrl;
    }
    function updateAvatarCache(userId, avatarUrl) {
      if (userAvatarCache.value.size >= MAX_CACHE_SIZE) {
        const firstKey = userAvatarCache.value.keys().next().value;
        userAvatarCache.value.delete(firstKey);
      }
      userAvatarCache.value.set(userId, avatarUrl);
    }
    function onAvatarLoad(userId, avatarUrl) {
      if (!userId || userAvatarCache.value.has(userId))
        return;
      updateAvatarCache(userId, avatarUrl);
    }
    function handleAvatarError(event) {
      common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:673", "头像加载失败:", event);
      event.target.src = "/static/default-avatar.png";
    }
    function getSafeImageUrl(img) {
      if (typeof img === "string") {
        return img;
      } else if (img && typeof img === "object") {
        if (img.url)
          return img.url;
        if (img.path)
          return img.path;
        if (img.tempFileURL)
          return img.tempFileURL;
      }
      return "/static/default-image.png";
    }
    async function loadReviewsDirect() {
      try {
        const db = common_vendor.tr.database();
        const res = await db.collection("demo-articles").where({ shop_id: shopInfo.value._id }).orderBy("publish_date", "desc").limit(5).get();
        common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:700", "📊 直接查询结果:", res);
        if (res.data && res.data.length > 0) {
          const simpleReviews = [];
          for (let item of res.data) {
            const processedReview = await processReviewData(item);
            simpleReviews.push(processedReview);
          }
          reviews.value = [...simpleReviews];
          reviewsTotal.value = res.data.length;
          common_vendor.index.showToast({
            title: `加载${simpleReviews.length}条评论`,
            icon: "success"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/shopList/shopDetail.vue:718", "直接查询失败:", e);
      }
    }
    function viewAllReviews() {
      if (!shopInfo.value) {
        common_vendor.index.showToast({ title: "店铺信息不存在", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/blog/list?shopId=${shopInfo.value._id}&shopName=${encodeURIComponent(shopInfo.value.shopName || "")}`
      });
    }
    function previewImage(images, currentIndex) {
      if (!images || images.length === 0)
        return;
      const safeImages = images.map((img) => getSafeImageUrl(img));
      common_vendor.index.previewImage({
        urls: safeImages,
        current: safeImages[currentIndex] || safeImages[0]
      });
    }
    function initMapMarkers() {
      var _a, _b;
      if (!((_b = (_a = shopInfo.value) == null ? void 0 : _a.location) == null ? void 0 : _b.coordinates))
        return;
      const [longitude, latitude] = shopInfo.value.location.coordinates;
      mapCenter.latitude = latitude;
      mapCenter.longitude = longitude;
      mapMarkers.value = [{
        id: shopInfo.value._id,
        latitude,
        longitude,
        title: shopInfo.value.shopName,
        iconPath: "/static/logo/local.png",
        width: 30,
        height: 30,
        callout: {
          content: `${shopInfo.value.shopName}
⭐${(shopInfo.value.rating / 10).toFixed(1)} | 月售${shopInfo.value.monthlyOrders}单`,
          color: "#333",
          fontSize: 12,
          borderRadius: 8,
          bgColor: "#fff",
          padding: 8,
          display: "ALWAYS",
          textAlign: "center"
        }
      }];
      setTimeout(() => {
        mapContext.value = common_vendor.index.createMapContext("shopDetailMap", this);
      }, 300);
    }
    function useTestData(id) {
      shopInfo.value = {
        _id: id,
        shopName: "99自助餐",
        shopPic: "/static/default-shop.jpg",
        category: "自选餐",
        rating: 46,
        monthlyOrders: 1662,
        deliveryTime: "30-40",
        deliveryFee: 3,
        address: "福建省泉州市南安市康美镇康元路8号闽南科技学院第三食堂",
        businessHours: "09:00-21:30",
        description: "新店开业欢迎下单！汤面分装",
        phone: "18197236883",
        location: {
          type: "Point",
          coordinates: [118.478807, 25.032761]
        },
        isVerified: true
      };
      reviews.value = [];
      reviewsTotal.value = 0;
      initMapMarkers();
      hasMenu.value = true;
      checkFavoriteStatus(id);
      setTimeout(() => {
        loadShopReviews(true);
      }, 1e3);
    }
    function checkFavoriteStatus(id) {
      const favorites = common_vendor.index.getStorageSync("favoriteShops") || [];
      isFavorite.value = favorites.includes(id);
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function handleImageError(e) {
      common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:827", "图片加载失败:", e);
      e.target.src = "/static/default-shop.jpg";
    }
    function formatNumber(num) {
      if (num >= 1e4) {
        return (num / 1e4).toFixed(1) + "万";
      }
      return num.toString();
    }
    function handlePhoneCall() {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a.phone))
        return;
      common_vendor.index.showActionSheet({
        itemList: [`拨打 ${shopInfo.value.phone}`, "取消"],
        success: (res) => {
          if (res.tapIndex === 0) {
            makePhoneCall();
          }
        }
      });
    }
    function makePhoneCall() {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a.phone))
        return;
      common_vendor.index.makePhoneCall({
        phoneNumber: shopInfo.value.phone,
        fail: () => {
          common_vendor.index.showToast({
            title: "无法拨打电话",
            icon: "none"
          });
        }
      });
    }
    function openMapWithRoute() {
      var _a, _b;
      if (!((_b = (_a = shopInfo.value) == null ? void 0 : _a.location) == null ? void 0 : _b.coordinates)) {
        common_vendor.index.showToast({
          title: "暂无位置信息",
          icon: "none"
        });
        return;
      }
      const [longitude, latitude] = shopInfo.value.location.coordinates;
      common_vendor.index.openLocation({
        latitude,
        longitude,
        name: shopInfo.value.shopName,
        address: shopInfo.value.address,
        scale: 18,
        success: () => {
          common_vendor.index.__f__("log", "at pages/shopList/shopDetail.vue:885", "打开地图成功");
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "打开地图失败",
            icon: "none"
          });
        }
      });
    }
    function toggleFavorite() {
      if (!shopInfo.value)
        return;
      const favorites = common_vendor.index.getStorageSync("favoriteShops") || [];
      if (isFavorite.value) {
        const index = favorites.indexOf(shopInfo.value._id);
        if (index > -1) {
          favorites.splice(index, 1);
        }
        common_vendor.index.showToast({ title: "已取消收藏", icon: "success" });
      } else {
        favorites.push(shopInfo.value._id);
        common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
      }
      common_vendor.index.setStorageSync("favoriteShops", favorites);
      isFavorite.value = !isFavorite.value;
    }
    function shareShop() {
      if (!shopInfo.value)
        return;
      common_vendor.index.share({
        provider: "weixin",
        type: 0,
        title: `推荐店铺：${shopInfo.value.shopName}`,
        summary: shopInfo.value.description || "这家店很不错，推荐给你！",
        href: `/pages/shopList/shopDetail?id=${shopInfo.value._id}`,
        success: () => {
          common_vendor.index.showToast({ title: "分享成功", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "分享失败", icon: "none" });
        }
      });
    }
    function showContact() {
      if (!shopInfo.value)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/blog/edit?shopId=${shopInfo.value._id}`
      });
    }
    function switchCategory(categoryId) {
      activeCategory.value = categoryId;
    }
    function viewProductDetail(product) {
      common_vendor.index.navigateTo({
        url: `/pages/product/detail?id=${product.id}`
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: shopInfo.value
      }, shopInfo.value ? common_vendor.e({
        b: common_vendor.o(goBack),
        c: common_vendor.t(shopInfo.value.shopName),
        d: common_vendor.o(shareShop),
        e: shopInfo.value.shopPic || "/static/default-shop.jpg",
        f: common_vendor.o(handleImageError),
        g: shopInfo.value.shopPic || "/static/default-shop.jpg",
        h: common_vendor.o(handleImageError),
        i: common_vendor.t(shopInfo.value.shopName),
        j: shopInfo.value.isVerified
      }, shopInfo.value.isVerified ? {} : {}, {
        k: shopInfo.value.rating > 0
      }, shopInfo.value.rating > 0 ? {
        l: shopInfo.value.rating % 2 !== 0 ? 1 : "",
        m: common_vendor.t((shopInfo.value.rating / 10).toFixed(1))
      } : {}, {
        n: common_vendor.t(isOpen.value ? "🟢" : "🔴"),
        o: common_vendor.t(shopInfo.value.businessHours || (isOpen.value ? "营业中" : "已打烊")),
        p: isOpen.value ? 1 : "",
        q: !isOpen.value ? 1 : "",
        r: common_vendor.t(isFavorite.value ? "❤️" : "🤍"),
        s: common_vendor.o(toggleFavorite),
        t: common_vendor.o(showContact),
        v: shopInfo.value.phone
      }, shopInfo.value.phone ? {
        w: common_vendor.o(handlePhoneCall)
      } : {}, {
        x: common_vendor.t(formatNumber(shopInfo.value.monthlyOrders || 0)),
        y: common_vendor.t(shopInfo.value.deliveryTime || "30-40"),
        z: common_vendor.t((shopInfo.value.deliveryFee || 0) === 0 ? "免费" : `¥${shopInfo.value.deliveryFee}`),
        A: common_vendor.o(openMapWithRoute),
        B: mapCenter.latitude,
        C: mapCenter.longitude,
        D: mapMarkers.value,
        E: mapScale.value,
        F: common_vendor.o(openMapWithRoute),
        G: common_vendor.t(shopInfo.value.address),
        H: !shopInfo.value.location || !shopInfo.value.location.coordinates
      }, !shopInfo.value.location || !shopInfo.value.location.coordinates ? {} : {}, {
        I: shopInfo.value.description
      }, shopInfo.value.description ? {
        J: common_vendor.t(shopInfo.value.description)
      } : {}, {
        K: hasMenu.value
      }, hasMenu.value ? common_vendor.e({
        L: common_vendor.f(menuCategories.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.name),
            b: category.id,
            c: activeCategory.value === category.id ? 1 : "",
            d: common_vendor.o(($event) => switchCategory(category.id), category.id)
          };
        }),
        M: common_vendor.f(currentProducts.value, (product, k0, i0) => {
          return {
            a: product.image,
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.description),
            d: common_vendor.t(product.price),
            e: common_vendor.t(product.sales),
            f: common_vendor.o(($event) => viewProductDetail(product), product.id),
            g: product.id
          };
        }),
        N: currentProducts.value.length === 0
      }, currentProducts.value.length === 0 ? {} : {}) : {}, {
        O: hasReviews.value
      }, hasReviews.value ? {
        P: common_vendor.t(reviewsTotal.value),
        Q: common_vendor.o(viewAllReviews)
      } : {}, {
        R: hasReviews.value
      }, hasReviews.value ? common_vendor.e({
        S: common_vendor.f(displayReviews.value, (review, k0, i0) => {
          return common_vendor.e({
            a: review.avatar,
            b: common_vendor.o(handleAvatarError, review.id),
            c: common_vendor.o(($event) => onAvatarLoad(review.userId, review.avatar), review.id),
            d: common_vendor.t(review.userName),
            e: common_vendor.f(5, (n, k1, i1) => {
              return {
                a: n,
                b: n <= review.rating ? 1 : ""
              };
            }),
            f: common_vendor.t(review.time),
            g: common_vendor.t(review.content),
            h: review.images && review.images.length > 0
          }, review.images && review.images.length > 0 ? {
            i: common_vendor.f(review.images, (img, index, i1) => {
              return {
                a: index,
                b: getSafeImageUrl(img),
                c: common_vendor.o(($event) => previewImage(review.images, index), index),
                d: common_vendor.o(handleImageError, index)
              };
            })
          } : {}, {
            j: review.id,
            k: common_vendor.o(($event) => goToReviewDetail(review), review.id)
          });
        }),
        T: displayReviews.value.length < reviewsTotal.value
      }, displayReviews.value.length < reviewsTotal.value ? {
        U: common_vendor.t(reviewsTotal.value),
        V: common_vendor.o(viewAllReviews)
      } : {}) : {}, {
        W: reviewsLoading.value
      }, reviewsLoading.value ? {
        X: common_vendor.p({
          status: "loading",
          content: "加载评价中..."
        })
      } : {}, {
        Y: loading.value
      }, loading.value ? {
        Z: common_vendor.p({
          status: "loading",
          content: "加载中..."
        })
      } : {}) : error.value ? {
        ab: common_vendor.t(error.value),
        ac: common_vendor.o(($event) => loadShopDetail(shopId.value))
      } : {}, {
        aa: error.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e8b8aaf2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shopList/shopDetail.js.map
