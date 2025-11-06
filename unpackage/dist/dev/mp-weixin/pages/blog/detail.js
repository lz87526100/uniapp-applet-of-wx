"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_self_tab_group2 = common_vendor.resolveComponent("self-tab-group");
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  (_easycom_self_tab_group2 + _easycom_uni_dateformat2)();
}
const _easycom_self_tab_group = () => "../../components/self-tab-group/self-tab-group.js";
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
if (!Math) {
  (_easycom_self_tab_group + _easycom_uni_dateformat)();
}
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const article = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const userAvatarCache = common_vendor.ref(/* @__PURE__ */ new Map());
    common_vendor.onLoad((options) => {
      if (options.id) {
        getArticleDetail(options.id);
      } else {
        common_vendor.index.showToast({ title: "缺少文章ID", icon: "none" });
        common_vendor.index.navigateBack();
      }
    });
    const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
    const setupUserInfoListeners = () => {
      common_vendor.index.$on("userInfoUpdated", (data) => {
        common_vendor.index.__f__("log", "at pages/blog/detail.vue:73", "详情页面收到用户信息更新:", data);
        updateUserAvatarInDetail(data);
      });
    };
    const updateUserAvatarInDetail = (userData) => {
      if (!userData.userId || !userData.avatar || !article.value)
        return;
      common_vendor.index.__f__("log", "at pages/blog/detail.vue:82", "开始更新详情页面用户头像，用户ID:", userData.userId);
      userAvatarCache.value.set(userData.userId, userData.avatar);
      if (article.value.user_id && article.value.user_id[0] && article.value.user_id[0]._id === userData.userId) {
        common_vendor.index.__f__("log", "at pages/blog/detail.vue:92", "更新详情页面头像");
        if (!article.value.user_id[0].avatar_file) {
          article.value.user_id[0].avatar_file = {};
        }
        article.value.user_id[0].avatar_file.url = userData.avatar;
        article.value.user_id[0].avatar_url = userData.avatar;
        article.value = { ...article.value };
      }
    };
    const getUserAvatar = (user) => {
      if (!user || !user._id)
        return "/static/defAvatar.png";
      const userId = user._id;
      if (userAvatarCache.value.has(userId)) {
        return userAvatarCache.value.get(userId);
      }
      let avatarUrl = "/static/defAvatar.png";
      if (user.avatar_url && user.avatar_url.startsWith("http")) {
        avatarUrl = user.avatar_url;
      } else if (user.avatar_file && user.avatar_file.url) {
        const fileUrl = user.avatar_file.url;
        if (fileUrl.startsWith("cloud:")) {
          convertCloudFileUrl(fileUrl, userId);
          return "/static/defAvatar.png";
        } else if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        }
      } else if (user.avatar && user.avatar.startsWith("http")) {
        avatarUrl = user.avatar;
      }
      if (avatarUrl !== "/static/defAvatar.png") {
        userAvatarCache.value.set(userId, avatarUrl);
      }
      return avatarUrl;
    };
    const convertCloudFileUrl = async (fileUrl, userId) => {
      try {
        common_vendor.index.__f__("log", "at pages/blog/detail.vue:155", "开始转换云存储URL:", fileUrl);
        const result = await common_vendor.tr.getTempFileURL({
          fileList: [fileUrl]
        });
        if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
          const httpUrl = result.fileList[0].tempFileURL;
          common_vendor.index.__f__("log", "at pages/blog/detail.vue:162", "云存储URL转换成功:", httpUrl);
          userAvatarCache.value.set(userId, httpUrl);
          if (article.value && article.value.user_id && article.value.user_id[0] && article.value.user_id[0]._id === userId) {
            if (!article.value.user_id[0].avatar_file) {
              article.value.user_id[0].avatar_file = {};
            }
            article.value.user_id[0].avatar_file.url = httpUrl;
            article.value.user_id[0].avatar_url = httpUrl;
            article.value = { ...article.value };
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:184", "转换云存储URL失败:", error);
      }
    };
    const handleAvatarError = (event) => {
      common_vendor.index.__f__("log", "at pages/blog/detail.vue:190", "头像加载失败:", event);
    };
    const initUserAvatarCache = () => {
      if (!article.value || !article.value.user_id || !article.value.user_id[0])
        return;
      const user = article.value.user_id[0];
      const userId = user._id;
      let avatarUrl = "/static/defAvatar.png";
      if (user.avatar_url && user.avatar_url.startsWith("http")) {
        avatarUrl = user.avatar_url;
      } else if (user.avatar_file && user.avatar_file.url) {
        const fileUrl = user.avatar_file.url;
        if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        } else if (fileUrl.startsWith("cloud:")) {
          convertCloudFileUrl(fileUrl, userId);
        }
      } else if (user.avatar && user.avatar.startsWith("http")) {
        avatarUrl = user.avatar;
      }
      if (avatarUrl !== "/static/defAvatar.png") {
        userAvatarCache.value.set(userId, avatarUrl);
        common_vendor.index.__f__("log", "at pages/blog/detail.vue:220", `缓存用户 ${userId} 头像:`, avatarUrl);
      }
    };
    async function getArticleDetail(id) {
      loading.value = true;
      try {
        const { errCode, data, errMsg } = await articlesCloudObj.getDetail(id);
        if (errCode === 0) {
          article.value = data;
          initUserAvatarCache();
          if (data.user_id && data.user_id[0]) {
            const user = data.user_id[0];
            common_vendor.index.__f__("log", "at pages/blog/detail.vue:237", "详情页面用户信息:", {
              id: user._id,
              nickname: user.nickname,
              avatar_url: user.avatar_url,
              avatar_file: user.avatar_file,
              avatar: user.avatar
            });
          }
        } else {
          common_vendor.index.showToast({ title: errMsg || "获取文章失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:249", "获取文章详情失败:", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function preview(pics, idx) {
      common_vendor.index.previewImage({
        urls: pics.map((p) => p.url),
        current: idx
      });
    }
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/blog/detail.vue:266", "详情页面加载");
      setupUserInfoListeners();
      const pendingUpdate = common_vendor.index.getStorageSync("userInfoPendingUpdate");
      if (pendingUpdate) {
        common_vendor.index.__f__("log", "at pages/blog/detail.vue:272", "详情页面发现待更新的用户信息:", pendingUpdate);
        updateUserAvatarInDetail(pendingUpdate);
        common_vendor.index.removeStorageSync("userInfoPendingUpdate");
      }
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/blog/detail.vue:280", "详情页面卸载");
      common_vendor.index.$off("userInfoUpdated");
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/blog/detail.vue:286", "详情页面显示");
      const lastUpdate = common_vendor.index.getStorageSync("lastUserInfoUpdate");
      if (lastUpdate) {
        common_vendor.index.__f__("log", "at pages/blog/detail.vue:290", "详情页面显示时检查到用户信息更新:", lastUpdate);
        updateUserAvatarInDetail(lastUpdate);
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: article.value
      }, article.value ? common_vendor.e({
        b: getUserAvatar(article.value.user_id[0]),
        c: common_vendor.o(handleAvatarError),
        d: common_vendor.t(((_a = article.value.user_id[0]) == null ? void 0 : _a.nickname) || "匿名"),
        e: common_vendor.p({
          date: article.value.publish_date,
          format: "MM-dd hh:mm",
          threshold: [6e4, 36e5 * 24 * 30]
        }),
        f: common_vendor.t(article.value.content),
        g: (_b = article.value.pics) == null ? void 0 : _b.length
      }, ((_c = article.value.pics) == null ? void 0 : _c.length) ? {
        h: common_vendor.f(article.value.pics, (pic, idx, i0) => {
          return {
            a: idx,
            b: pic.url,
            c: common_vendor.o(($event) => preview(article.value.pics, idx), idx)
          };
        })
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f02f3071"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/detail.js.map
