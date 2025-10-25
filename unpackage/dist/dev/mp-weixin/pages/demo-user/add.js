"use strict";
const common_vendor = require("../../common/vendor.js");
const js_sdk_validator_demoUser = require("../../js_sdk/validator/demo-user.js");
const db = common_vendor.tr.database();
const dbCollectionName = "demo-user";
function getValidator(fields) {
  let result = {};
  for (let key in js_sdk_validator_demoUser.validator) {
    if (fields.indexOf(key) > -1) {
      result[key] = js_sdk_validator_demoUser.validator[key];
    }
  }
  return result;
}
function numberRange(start, end) {
  return Array.from(new Array(end + 1).keys()).slice(start);
}
const _sfc_main = {
  data() {
    let formData = {
      "name": "",
      "age": 18,
      "gender": 0,
      "avatar": null
    };
    return {
      formData,
      formOptions: {
        "age_data": numberRange(18, 35),
        "age_index": 18,
        "gender_localdata": [
          {
            "text": "保密",
            "value": 0
          },
          {
            "text": "男",
            "value": 1
          },
          {
            "text": "女",
            "value": 2
          }
        ]
      },
      rules: {
        ...getValidator(Object.keys(formData))
      }
    };
  },
  onReady() {
    this.$refs.form.setRules(this.rules);
  },
  methods: {
    pickerChange(e, name) {
      this.formOptions[name + "_index"] = e.detail.value;
      this.formData[name] = this.formOptions[name + "_data"][e.detail.value];
      this.binddata(name, this.formData[name]);
    },
    /**
     * 验证表单并提交
     */
    submit() {
      common_vendor.index.showLoading({
        mask: true
      });
      this.$refs.form.validate().then((res) => {
        return this.submitForm(res);
      }).catch(() => {
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    /**
     * 提交表单
     */
    submitForm(value) {
      return db.collection(dbCollectionName).add(value).then((res) => {
        common_vendor.index.showToast({
          icon: "none",
          title: "新增成功"
        });
        this.getOpenerEventChannel().emit("refreshData");
        setTimeout(() => common_vendor.index.navigateBack(), 500);
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_file_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_file_picker + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $data.formData.name = $event),
    b: common_vendor.p({
      placeholder: "请输入姓名",
      modelValue: $data.formData.name
    }),
    c: common_vendor.p({
      name: "name",
      label: "姓名",
      required: true
    }),
    d: common_vendor.t($data.formOptions.age_data[$data.formOptions.age_index] || "请选择..."),
    e: common_vendor.o(($event) => $options.pickerChange($event, "age")),
    f: $data.formOptions.age_data,
    g: $data.formOptions.age_index,
    h: common_vendor.p({
      name: "age",
      label: "年龄"
    }),
    i: common_vendor.o(($event) => $data.formData.gender = $event),
    j: common_vendor.p({
      localdata: $data.formOptions.gender_localdata,
      modelValue: $data.formData.gender
    }),
    k: common_vendor.p({
      name: "gender",
      label: "性别"
    }),
    l: common_vendor.o(($event) => $data.formData.avatar = $event),
    m: common_vendor.p({
      ["return-type"]: "object",
      modelValue: $data.formData.avatar
    }),
    n: common_vendor.p({
      name: "avatar",
      label: "头像"
    }),
    o: common_vendor.o((...args) => $options.submit && $options.submit(...args)),
    p: common_vendor.sr("form", "655b3b70-0"),
    q: common_vendor.p({
      model: $data.formData,
      ["validate-trigger"]: "submit",
      ["err-show-type"]: "toast"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo-user/add.js.map
