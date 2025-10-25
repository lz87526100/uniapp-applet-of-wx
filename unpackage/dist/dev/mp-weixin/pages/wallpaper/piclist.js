"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_load_more2 + _easycom_unicloud_db2 + _easycom_uni_file_picker2 + _easycom_uni_data_select2 + _easycom_uni_popup2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_unicloud_db = () => "../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_unicloud_db + _easycom_uni_file_picker + _easycom_uni_data_select + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "piclist",
  setup(__props) {
    const db = common_vendor.tr.database();
    const udb = common_vendor.ref(null);
    const popup = common_vendor.ref(null);
    const formData = common_vendor.ref({
      description: "",
      picurl: {},
      classid: ""
    });
    const colList = common_vendor.ref([
      db.collection("demo-wallper").orderBy("createTime desc").getTemp(),
      db.collection("demo-classify").getTemp()
    ]);
    const disabled = common_vendor.computed(() => {
      if (formData.value.description && formData.value.classid && Object.keys(formData.value.picurl).length > 0) {
        return false;
      } else {
        return true;
      }
    });
    const preview = (url) => {
      common_vendor.index.previewImage({
        urls: [url]
      });
    };
    const handleAdd = () => {
      popup.value.open();
    };
    const onSubmit = async () => {
      common_vendor.index.showLoading();
      let res = await db.collection("demo-wallper").add(formData.value);
      common_vendor.index.showToast({
        title: "添加成功",
        icon: "none"
      });
      init();
      onCancel();
      common_vendor.index.__f__("log", "at pages/wallpaper/piclist.vue:154", res);
    };
    const onCancel = () => {
      popup.value.close();
    };
    const init = () => {
      formData.value = {
        description: "",
        picurl: {},
        classid: ""
      };
    };
    common_vendor.onReachBottom(() => {
      udb.value.loadMore();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleAdd),
        b: common_vendor.w(({
          hasMore,
          data,
          pagination,
          loading,
          error,
          options
        }, s0, i0) => {
          return common_vendor.e({
            a: error
          }, error ? {
            b: common_vendor.t(error)
          } : {}, {
            c: loading
          }, loading ? {} : {}, {
            d: common_vendor.f(data, (item, k1, i1) => {
              return {
                a: item.url,
                b: common_vendor.o(($event) => preview(item.url)),
                c: common_vendor.t(item.description),
                d: common_vendor.t(item.classname[0]),
                e: common_vendor.t(common_vendor.unref(common_vendor.dayjs)(item.createTime).format("MM-DD HH:mm"))
              };
            }),
            e: !hasMore && !loading
          }, !hasMore && !loading ? {
            f: "51ece828-1-" + i0 + ",51ece828-0",
            g: common_vendor.p({
              status: "noMore"
            })
          } : {}, {
            h: i0,
            i: s0
          });
        }, {
          name: "d",
          path: "b",
          vueId: "51ece828-0"
        }),
        c: common_vendor.sr(udb, "51ece828-0", {
          "k": "udb"
        }),
        d: common_vendor.p({
          collection: colList.value,
          ["page-size"]: 7,
          getcount: true,
          field: "description,createTime,classid.name as classname,picurl.url as url"
        }),
        e: common_vendor.o(($event) => formData.value.picurl = $event),
        f: common_vendor.p({
          ["return-type"]: "object",
          modelValue: formData.value.picurl
        }),
        g: formData.value.description,
        h: common_vendor.o(($event) => formData.value.description = $event.detail.value),
        i: common_vendor.o(($event) => formData.value.classid = $event),
        j: common_vendor.p({
          collection: "demo-classify",
          field: "name as text,_id as value",
          where: "status == true",
          orderby: "_id desc",
          clear: true,
          modelValue: formData.value.classid
        }),
        k: common_vendor.t(formData.value),
        l: common_vendor.o(onSubmit),
        m: disabled.value,
        n: common_vendor.o(onCancel),
        o: common_vendor.sr(popup, "51ece828-2", {
          "k": "popup"
        }),
        p: common_vendor.p({
          ["border-radius"]: "10px 10px 0 0",
          ["is-mask-click"]: false
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-51ece828"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallpaper/piclist.js.map
