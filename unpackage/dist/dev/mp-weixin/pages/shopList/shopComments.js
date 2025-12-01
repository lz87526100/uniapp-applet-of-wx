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
const _sfc_main = {
  __name: "shopComments",
  setup(__props) {
    const shopId = common_vendor.ref("");
    const shopName = common_vendor.ref("");
    const comments = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const size = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const hasMore = common_vendor.ref(true);
    const totalComments = common_vendor.computed(() => total.value);
    const averageRating = common_vendor.computed(() => {
      if (comments.value.length === 0)
        return 0;
      const sum = comments.value.reduce((acc, comment) => acc + comment.rating, 0);
      return sum / comments.value.length;
    });
    const withImagesCount = common_vendor.computed(() => {
      return comments.value.filter((comment) => comment.images && comment.images.length > 0).length;
    });
    common_vendor.onLoad((options) => {
      if (options.shopId) {
        shopId.value = options.shopId;
        shopName.value = options.shopName || "店铺";
        common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:145", "✅ 接收到的参数:", { shopId: shopId.value, shopName: shopName.value });
        loadComments(true);
      } else {
        common_vendor.index.__f__("error", "at pages/shopList/shopComments.vue:148", "❌ 缺少店铺ID参数");
        common_vendor.index.showToast({
          title: "店铺ID不存在",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:161", "📱 上拉加载更多");
      if (hasMore.value && !loading.value) {
        loadMoreComments();
      }
    });
    async function loadComments(reset = false) {
      if (!shopId.value) {
        common_vendor.index.__f__("error", "at pages/shopList/shopComments.vue:170", "❌ 店铺ID为空");
        return;
      }
      if (reset) {
        page.value = 1;
        comments.value = [];
        hasMore.value = true;
        common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:178", "🔄 重置评论列表");
      }
      if (!hasMore.value) {
        common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:182", "⏹️ 没有更多评论可加载");
        return;
      }
      loading.value = true;
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:187", `🔄 加载第 ${page.value} 页评论，店铺ID: ${shopId.value}`);
      try {
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:193", "📡 调用云对象获取评论...");
        const res = await articlesCo.list({
          page: page.value,
          size: size.value
        });
        common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:199", "📡 云对象响应:", res);
        if (res.errCode === 0) {
          const shopReviews = (res.data || []).filter(
            (item) => item.shop_id === shopId.value
          );
          common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:207", `✅ 过滤后的店铺评论: ${shopReviews.length} 条`);
          const newComments = [];
          for (let item of shopReviews) {
            const processedComment = await processCommentData(item);
            newComments.push(processedComment);
          }
          common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:216", "🎯 处理后的评论数据:", newComments);
          if (reset) {
            comments.value = [...newComments];
          } else {
            comments.value = [...comments.value, ...newComments];
          }
          total.value = newComments.length;
          hasMore.value = newComments.length >= size.value;
          page.value += 1;
          common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:228", `✅ 加载评论成功，当前共 ${comments.value.length} 条评论`);
        } else {
          throw new Error(res.errMsg || "云对象返回错误");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopList/shopComments.vue:235", "❌ 加载评论失败:", error);
        common_vendor.index.showToast({
          title: "加载评论失败",
          icon: "none"
        });
        if (comments.value.length === 0) {
          common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:243", "🔄 使用测试数据作为备选");
          useTestData();
        }
      } finally {
        loading.value = false;
      }
    }
    async function processCommentData(item) {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:253", "🔍 处理单条评论数据:", item);
      const userInfo = item.user_id && item.user_id[0] ? item.user_id[0] : {};
      const userId = userInfo._id;
      let avatarUrl = await getAvatarUrl(userInfo, userId);
      let timeStr = "";
      if (item.publish_date) {
        const date = new Date(item.publish_date);
        timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      } else if (item.createTime) {
        const date = new Date(item.createTime);
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
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:283", "🖼️ 处理后的图片URLs:", imageUrls);
      return {
        id: item._id,
        userId,
        userName: userInfo.nickname || `用户${userId ? userId.slice(-4) : "0000"}`,
        avatar: avatarUrl,
        rating: item.rating || 5,
        time: timeStr,
        content: item.content || "暂无评论内容",
        images: imageUrls,
        likes: item.likes || Math.floor(Math.random() * 50)
      };
    }
    async function getAvatarUrl(userInfo, userId) {
      if (!userInfo || !userId)
        return "/static/default-avatar.png";
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
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/shopList/shopComments.vue:320", "转换云存储URL失败:", error);
          }
        }
      } else if (userInfo.avatar && userInfo.avatar.startsWith("http")) {
        avatarUrl = userInfo.avatar;
      }
      return avatarUrl;
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
    function loadMoreComments() {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:344", "📥 手动加载更多评论");
      if (!hasMore.value || loading.value)
        return;
      loadComments();
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
    function likeComment(comment) {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:363", "👍 点赞评论:", comment.id);
      common_vendor.index.showToast({
        title: "点赞成功",
        icon: "success"
      });
    }
    function replyComment(comment) {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:372", "💬 回复评论:", comment.id);
      common_vendor.index.showToast({
        title: "回复功能开发中",
        icon: "none"
      });
    }
    function goToCommentDetail(comment) {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:381", "🔄 跳转到评论详情:", comment.id);
      common_vendor.index.navigateTo({
        url: `/pages/blog/detail?id=${comment.id}&shopId=${shopId.value}`
      });
    }
    function useTestData() {
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:395", "🎯 使用测试数据作为备选");
      comments.value = [
        {
          id: "1",
          userId: "user1",
          userName: "美食家小明",
          avatar: "/static/default-avatar.png",
          rating: 5,
          time: "2024-01-15",
          content: "这家店的味道真的很不错，强烈推荐他们的招牌牛肉面！汤底浓郁，牛肉炖得很烂，面条劲道。",
          images: ["/static/food1.jpg", "/static/food2.jpg"],
          likes: 23
        },
        {
          id: "2",
          userId: "user2",
          userName: "吃货小张",
          avatar: "/static/default-avatar.png",
          rating: 4,
          time: "2024-01-14",
          content: "环境很好，服务态度也不错，就是价格稍微有点贵。不过味道确实值得这个价。",
          images: [],
          likes: 15
        }
      ];
      total.value = comments.value.length;
      hasMore.value = false;
      common_vendor.index.__f__("log", "at pages/shopList/shopComments.vue:422", `✅ 测试数据加载完成，共 ${comments.value.length} 条评论`);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: comments.value.length > 0
      }, comments.value.length > 0 ? {
        b: common_vendor.t(totalComments.value),
        c: common_vendor.t(averageRating.value.toFixed(1)),
        d: common_vendor.t(withImagesCount.value)
      } : {}, {
        e: common_vendor.f(comments.value, (comment, k0, i0) => {
          return common_vendor.e({
            a: comment.avatar,
            b: common_vendor.t(comment.userName),
            c: common_vendor.f(5, (n, k1, i1) => {
              return {
                a: n,
                b: n <= comment.rating ? 1 : ""
              };
            }),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.content),
            f: comment.images && comment.images.length > 0
          }, comment.images && comment.images.length > 0 ? common_vendor.e({
            g: common_vendor.f(comment.images.slice(0, 4), (img, index, i1) => {
              return {
                a: index,
                b: getSafeImageUrl(img),
                c: common_vendor.o(($event) => previewImage(comment.images, index), index)
              };
            }),
            h: comment.images.length > 4
          }, comment.images.length > 4 ? {
            i: common_vendor.t(comment.images.length - 4),
            j: common_vendor.o(($event) => previewImage(comment.images, 0), comment.id)
          } : {}) : {}, {
            k: common_vendor.t(comment.likes || 0),
            l: common_vendor.o(($event) => likeComment(comment), comment.id),
            m: common_vendor.o(($event) => replyComment(comment), comment.id),
            n: comment.id,
            o: common_vendor.o(($event) => goToCommentDetail(comment), comment.id)
          });
        }),
        f: hasMore.value
      }, hasMore.value ? {
        g: common_vendor.o(loadMoreComments)
      } : comments.value.length > 0 ? {} : {}, {
        h: comments.value.length > 0,
        i: !loading.value && comments.value.length === 0
      }, !loading.value && comments.value.length === 0 ? {} : {}, {
        j: loading.value
      }, loading.value ? {
        k: common_vendor.p({
          status: "loading",
          content: "加载中..."
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b51649e6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shopList/shopComments.js.map
