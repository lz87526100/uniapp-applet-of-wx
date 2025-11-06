"use strict";
const common_vendor = require("../../common/vendor.js");
const common_style_favorites = require("../../common/style/favorites.js");
if (!Array) {
  const _component_uni_nav_bar = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  (_component_uni_nav_bar + _easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_dateformat2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_dateformat)();
}
const itemHeight = 320;
const bufferSize = 5;
const _sfc_main = {
  __name: "favorites",
  setup(__props) {
    const favoritesList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const scrollTop = common_vendor.ref(0);
    const canRefresh = common_vendor.ref(true);
    const visibleItems = common_vendor.computed(() => {
      if (favoritesList.value.length <= 15) {
        return favoritesList.value;
      }
      const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize);
      const endIndex = Math.min(
        favoritesList.value.length,
        startIndex + Math.ceil(800 / itemHeight) + bufferSize * 2
      );
      return favoritesList.value.slice(startIndex, endIndex);
    });
    function onScroll(e) {
      scrollTop.value = e.detail.scrollTop;
      canRefresh.value = e.detail.scrollTop <= 10;
    }
    function onRefresh() {
      if (!canRefresh.value || refreshing.value) {
        refreshing.value = false;
        return;
      }
      refreshing.value = true;
      loadFavoritesData();
    }
    function formatPicUrl(pic) {
      if (!pic)
        return "";
      let url = "";
      if (typeof pic === "string") {
        url = pic;
      } else if (typeof pic.url === "string") {
        url = pic.url;
      } else if (typeof pic.src === "string") {
        url = pic.src;
      }
      return (url || "").trim();
    }
    function cleanFavoriteItem(item) {
      if (!item || typeof item !== "object") {
        return {
          _id: "",
          article_id: "",
          create_date: /* @__PURE__ */ new Date(),
          article: {
            content: "内容已删除",
            pics: []
          }
        };
      }
      const article = item.article || {};
      let content = "内容已删除";
      if (typeof article.content === "string") {
        content = article.content.trim() || "内容已删除";
      }
      const rawPics = Array.isArray(article.pics) ? article.pics : [];
      const cleanedPics = rawPics.map((pic, index) => {
        try {
          const url = formatPicUrl(pic);
          if (!url)
            return null;
          return {
            url,
            id: `pic_${item._id}_${index}_${Date.now()}`,
            width: Number(pic.width) || 200,
            height: Number(pic.height) || 200
          };
        } catch (error) {
          common_vendor.index.__f__("warn", "at pages/self/favorites.vue:214", "清理图片数据失败:", error);
          return null;
        }
      }).filter((pic) => pic !== null).slice(0, 9);
      return {
        _id: String(item._id || ""),
        article_id: String(item.article_id || ""),
        create_date: item.create_date || /* @__PURE__ */ new Date(),
        article: {
          content,
          pics: cleanedPics
        }
      };
    }
    common_vendor.onMounted(() => {
      loadFavoritesData();
    });
    function getItemContent(item) {
      var _a;
      return ((_a = item.article) == null ? void 0 : _a.content) ? formatContent(item.article.content) : "内容已删除";
    }
    function hasPics(item) {
      var _a, _b;
      return ((_b = (_a = item.article) == null ? void 0 : _a.pics) == null ? void 0 : _b.length) > 0;
    }
    function getDisplayPics(item) {
      var _a, _b;
      return ((_b = (_a = item.article) == null ? void 0 : _a.pics) == null ? void 0 : _b.slice(0, 3)) || [];
    }
    function getAllPics(item) {
      var _a;
      return ((_a = item.article) == null ? void 0 : _a.pics) || [];
    }
    function getPicCount(item) {
      var _a, _b;
      return ((_b = (_a = item.article) == null ? void 0 : _a.pics) == null ? void 0 : _b.length) || 0;
    }
    function formatContent(content) {
      if (!content)
        return "";
      const trimmed = content.trim();
      return trimmed.length > 80 ? trimmed.substring(0, 80) + "..." : trimmed;
    }
    function onImageLoad(e) {
      const { url, index } = e.currentTarget.dataset;
      common_vendor.index.__f__("log", "at pages/self/favorites.vue:266", "图片加载成功:", url);
    }
    function onImageError(e) {
      const { url, index } = e.currentTarget.dataset;
      common_vendor.index.__f__("warn", "at pages/self/favorites.vue:271", "图片加载失败:", url);
    }
    let previewTimer = null;
    function previewImage(pics, currentIndex) {
      if (previewTimer) {
        clearTimeout(previewTimer);
      }
      previewTimer = setTimeout(() => {
        if (!pics || pics.length === 0)
          return;
        const urls = pics.map((pic) => formatPicUrl(pic)).filter((url) => url && typeof url === "string");
        if (urls.length === 0)
          return;
        common_vendor.index.previewImage({
          urls,
          current: currentIndex
        });
      }, 150);
    }
    async function loadFavoritesData() {
      try {
        loading.value = true;
        const favorites = await common_style_favorites.favoritesManager.getFavoritesList(1, 100);
        favoritesList.value = favorites.map(cleanFavoriteItem);
        await common_vendor.nextTick$1();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/favorites.vue:308", "加载收藏列表失败:", error);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    }
    function loadMore() {
      if (loadingMore.value || finished.value)
        return;
      loadingMore.value = true;
      setTimeout(() => {
        loadingMore.value = false;
      }, 500);
    }
    async function removeFavorite(articleId) {
      const { confirm } = await common_vendor.index.showModal({
        title: "取消收藏",
        content: "确定要取消收藏这篇文章吗？",
        confirmColor: "#FF5B5B"
      });
      if (confirm) {
        try {
          const success = await common_style_favorites.favoritesManager.removeFavorite(articleId);
          if (success) {
            common_vendor.index.showToast({ title: "取消收藏成功", icon: "success" });
            loadFavoritesData();
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/self/favorites.vue:341", "取消收藏失败:", error);
          common_vendor.index.showToast({ title: "取消收藏失败", icon: "none" });
        }
      }
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "我的收藏",
          ["left-icon"]: "back",
          ["background-color"]: "transparent",
          color: "#222",
          ["status-bar"]: true
        }),
        c: refreshing.value
      }, refreshing.value ? {
        d: common_vendor.p({
          status: "loading",
          content: "刷新中..."
        })
      } : {}, {
        e: loading.value && favoritesList.value.length === 0
      }, loading.value && favoritesList.value.length === 0 ? {
        f: common_vendor.f(6, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : common_vendor.e({
        g: common_vendor.f(visibleItems.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemContent(item)),
            b: hasPics(item)
          }, hasPics(item) ? common_vendor.e({
            c: common_vendor.f(getDisplayPics(item), (pic, idx, i1) => {
              return {
                a: pic.id + "_" + idx,
                b: pic.url,
                c: idx,
                d: pic.url,
                e: common_vendor.o(($event) => previewImage(getAllPics(item), idx), pic.id + "_" + idx),
                f: common_vendor.o(onImageLoad, pic.id + "_" + idx),
                g: common_vendor.o(onImageError, pic.id + "_" + idx)
              };
            }),
            d: getPicCount(item) > 3
          }, getPicCount(item) > 3 ? {
            e: common_vendor.t(getPicCount(item) - 3)
          } : {}) : {}, {
            f: "79688c99-2-" + i0,
            g: "79688c99-3-" + i0,
            h: common_vendor.p({
              date: item.create_date,
              format: "MM-dd hh:mm"
            }),
            i: "79688c99-4-" + i0,
            j: common_vendor.o(($event) => removeFavorite(item.article_id), item._id + "_" + item.article_id),
            k: item._id + "_" + item.article_id,
            l: common_vendor.o(($event) => _ctx.goToDetail(item), item._id + "_" + item.article_id)
          });
        }),
        h: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#8B9AB6"
        }),
        i: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#FF5B5B"
        }),
        j: loadingMore.value
      }, loadingMore.value ? {
        k: common_vendor.p({
          status: "loading",
          content: "正在加载..."
        })
      } : finished.value && favoritesList.value.length > 0 ? {} : favoritesList.value.length === 0 && !loading.value ? {} : {}, {
        l: finished.value && favoritesList.value.length > 0,
        m: favoritesList.value.length === 0 && !loading.value
      }), {
        n: common_vendor.o(loadMore),
        o: refreshing.value,
        p: common_vendor.o(onRefresh),
        q: common_vendor.o(onScroll)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-79688c99"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/favorites.js.map
