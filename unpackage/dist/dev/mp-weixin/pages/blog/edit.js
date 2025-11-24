"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/system.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  (_easycom_uni_load_more2 + _easycom_uni_file_picker2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_file_picker)();
}
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
    const shopInfo = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const error = common_vendor.ref("");
    const shopId = common_vendor.ref("");
    const formData = common_vendor.ref({
      content: "",
      pics: [],
      rating: 0,
      shopId: ""
    });
    const imageStyles = {
      width: 220,
      height: 220,
      border: {
        color: "#e5e5e5",
        width: 1,
        style: "dashed",
        radius: "12rpx"
      }
    };
    const btnDisabled = common_vendor.computed(() => {
      return !(formData.value.content.length > 0 && formData.value.rating > 0);
    });
    const ratingText = common_vendor.computed(() => {
      const texts = ["请评分", "很差", "一般", "满意", "很好", "完美"];
      return texts[formData.value.rating] || texts[0];
    });
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:161", "页面参数:", options);
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:162", "接收到的shopId:", options.shopId);
      if (options.shopId) {
        shopId.value = options.shopId;
        formData.value.shopId = options.shopId;
        common_vendor.index.__f__("log", "at pages/blog/edit.vue:167", "设置后的shopId:", shopId.value);
        loadShopInfo(options.shopId);
      } else {
        error.value = "商家信息不存在";
        common_vendor.index.__f__("error", "at pages/blog/edit.vue:171", "未接收到shopId参数");
        common_vendor.index.showToast({
          title: "商家信息不存在",
          icon: "none"
        });
      }
    });
    async function loadShopInfo(id) {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:181", "开始加载商家信息，ID:", id);
      loading.value = true;
      error.value = "";
      try {
        const res = await common_vendor.tr.callFunction({
          name: "getShopDetail",
          data: { shopId: id }
        });
        common_vendor.index.__f__("log", "at pages/blog/edit.vue:192", "商家信息返回:", res);
        if (((_a = res.result) == null ? void 0 : _a.errCode) === 0) {
          shopInfo.value = res.result.data;
          common_vendor.index.setNavigationBarTitle({
            title: `评价${shopInfo.value.shopName}`
          });
        } else {
          error.value = ((_b = res.result) == null ? void 0 : _b.errMsg) || "加载商家信息失败";
          common_vendor.index.__f__("error", "at pages/blog/edit.vue:203", "加载失败:", error.value);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/blog/edit.vue:206", "加载商家信息失败:", e);
        error.value = "网络错误，请重试";
      } finally {
        loading.value = false;
      }
    }
    const setRating = (rating) => {
      formData.value.rating = rating;
    };
    const onContentInput = () => {
    };
    const onSubmit = async () => {
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:222", "提交数据", formData.value);
      const params = {
        content: formData.value.content,
        pics: formData.value.pics.map((item) => ({
          name: item.name,
          extname: item.extname,
          url: item.url
        })),
        publish_date: Date.now(),
        shop_id: formData.value.shopId,
        // 商家ID
        rating: formData.value.rating
        // 评分
      };
      try {
        common_vendor.index.showLoading({
          title: "发布中...",
          mask: true
        });
        const result = await articlesCloudObj.add(params);
        common_vendor.index.__f__("log", "at pages/blog/edit.vue:243", "返回结果", result);
        common_vendor.index.hideLoading();
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: "🎉 评价成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.$emit("reviewAdded", {
              shopId: formData.value.shopId,
              rating: formData.value.rating
            });
            common_vendor.index.navigateBack();
          }, 100);
          formData.value.content = "";
          formData.value.pics = [];
          formData.value.rating = 0;
        } else {
          common_vendor.index.showToast({
            title: "发布失败：" + (result.errMsg || result.message || "未知错误"),
            icon: "none",
            duration: 3e3
          });
        }
      } catch (error2) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/blog/edit.vue:276", "调用失败", error2);
        common_vendor.index.showToast({
          title: "网络错误：" + error2.message,
          icon: "none"
        });
      }
    };
    const onUploadSuccess = (e) => {
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:285", "上传成功", e);
      common_vendor.index.showToast({
        title: "图片上传成功",
        icon: "success",
        duration: 1500
      });
    };
    const onUploadFail = (err) => {
      common_vendor.index.__f__("error", "at pages/blog/edit.vue:294", "上传失败", err);
      common_vendor.index.showToast({
        title: "图片上传失败",
        icon: "error",
        duration: 2e3
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: shopInfo.value
      }, shopInfo.value ? common_vendor.e({
        b: shopInfo.value.shopPic || "/static/default-shop.jpg",
        c: shopInfo.value.shopPic || "/static/default-shop.jpg",
        d: common_vendor.t(shopInfo.value.shopName),
        e: shopInfo.value.rating > 0
      }, shopInfo.value.rating > 0 ? {
        f: common_vendor.t((shopInfo.value.rating / 10).toFixed(1))
      } : {}, {
        g: shopInfo.value.address
      }, shopInfo.value.address ? {
        h: common_vendor.t(shopInfo.value.address)
      } : {}) : {}, {
        i: loading.value
      }, loading.value ? {
        j: common_vendor.p({
          status: "loading",
          content: "加载商家信息..."
        })
      } : {}, {
        k: !loading.value && shopInfo.value
      }, !loading.value && shopInfo.value ? {
        l: common_vendor.t(formData.value.content.length),
        m: `分享你对${shopInfo.value.shopName}的评价...`,
        n: common_vendor.o([($event) => formData.value.content = $event.detail.value, onContentInput]),
        o: formData.value.content
      } : {}, {
        p: !loading.value && shopInfo.value
      }, !loading.value && shopInfo.value ? {
        q: common_vendor.t(formData.value.pics.length),
        r: common_vendor.o(onUploadSuccess),
        s: common_vendor.o(onUploadFail),
        t: common_vendor.o(($event) => formData.value.pics = $event),
        v: common_vendor.p({
          fileMediatype: "image",
          mode: "grid",
          limit: "9",
          ["image-styles"]: imageStyles,
          modelValue: formData.value.pics
        })
      } : {}, {
        w: !loading.value && shopInfo.value
      }, !loading.value && shopInfo.value ? {
        x: common_vendor.f(5, (n, k0, i0) => {
          return {
            a: n,
            b: formData.value.rating >= n ? 1 : "",
            c: common_vendor.o(($event) => setRating(n), n)
          };
        }),
        y: common_vendor.t(ratingText.value)
      } : {}, {
        z: !loading.value && shopInfo.value
      }, !loading.value && shopInfo.value ? {
        A: common_vendor.t(btnDisabled.value ? "请填写内容和评分" : "立即发布"),
        B: btnDisabled.value ? 1 : "",
        C: btnDisabled.value,
        D: common_vendor.o(onSubmit)
      } : {}, {
        E: !loading.value && shopInfo.value
      }, !loading.value && shopInfo.value ? {} : {}, {
        F: error.value
      }, error.value ? {
        G: common_vendor.t(error.value),
        H: common_vendor.o(($event) => loadShopInfo(shopId.value))
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-42e95e20"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/edit.js.map
