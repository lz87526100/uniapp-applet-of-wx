"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "uni-data-select",
  mixins: [common_vendor.tr.mixinDatacom || {}],
  emits: [
    "open",
    "close",
    "update:modelValue",
    "input",
    "clear",
    "change"
  ],
  model: {
    prop: "modelValue",
    event: "update:modelValue"
  },
  options: {
    virtualHost: true
  },
  props: {
    localdata: {
      type: Array,
      default() {
        return [];
      }
    },
    value: {
      type: [String, Number, Array],
      default: ""
    },
    modelValue: {
      type: [String, Number, Array],
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    emptyTips: {
      type: String,
      default: "无选项"
    },
    clear: {
      type: Boolean,
      default: true
    },
    defItem: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 格式化输出 用法 field="_id as value, version as text, uni_platform as label" format="{label} - {text}"
    format: {
      type: String,
      default: ""
    },
    placement: {
      type: String,
      default: "bottom"
    },
    multiple: {
      type: Boolean,
      default: false
    },
    wrap: {
      type: Boolean,
      default: false
    },
    align: {
      type: String,
      default: "left"
    },
    hideRight: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: "default"
    }
  },
  data() {
    return {
      showSelector: false,
      current: "",
      mixinDatacomResData: [],
      apps: [],
      channels: [],
      cacheKey: "uni-data-select-lastSelectedValue"
    };
  },
  created() {
    this.debounceGet = this.debounce(() => {
      this.query();
    }, 300);
    if (this.collection && !this.localdata.length) {
      this.debounceGet();
    }
  },
  computed: {
    typePlaceholder() {
      const text = {
        "opendb-stat-app-versions": "版本",
        "opendb-app-channels": "渠道",
        "opendb-app-list": "应用"
      };
      const common = this.placeholder;
      const placeholder = text[this.collection];
      return placeholder ? common + placeholder : common;
    },
    valueCom() {
      if (this.value === "")
        return this.modelValue;
      if (this.modelValue === "")
        return this.value;
      return this.value;
    },
    textShow() {
      if (this.multiple) {
        const currentValues = this.getCurrentValues();
        if (Array.isArray(currentValues) && currentValues.length > 0) {
          const selectedItems = this.mixinDatacomResData.filter((item) => currentValues.includes(item.value));
          return selectedItems.map((item) => this.formatItemName(item)).join(", ");
        } else {
          return "";
        }
      } else {
        return this.current;
      }
    },
    shouldShowClear() {
      if (this.multiple) {
        const currentValues = this.getCurrentValues();
        return Array.isArray(currentValues) && currentValues.length > 0;
      } else {
        return !!this.current;
      }
    },
    shouldWrap() {
      return this.multiple && this.wrap && !!this.textShow;
    },
    getOffsetByPlacement() {
      switch (this.placement) {
        case "top":
          return "bottom:calc(100% + 12px);";
        case "bottom":
          return "top:calc(100% + 12px);";
      }
    },
    slotSelected() {
      return this.$slots ? this.$slots.selected : false;
    },
    slotEmpty() {
      return this.$slots ? this.$slots.empty : false;
    },
    slotOption() {
      return this.$slots ? this.$slots.option : false;
    }
  },
  watch: {
    showSelector: {
      handler(val, old) {
        val ? this.$emit("open") : this.$emit("close");
      }
    },
    localdata: {
      immediate: true,
      handler(val, old) {
        if (Array.isArray(val) && old !== val) {
          this.mixinDatacomResData = val;
        }
      }
    },
    valueCom(val, old) {
      this.initDefVal();
    },
    mixinDatacomResData: {
      immediate: true,
      handler(val) {
        if (val.length) {
          this.initDefVal();
        }
      }
    }
  },
  methods: {
    getSelectedItems() {
      const currentValues = this.getCurrentValues();
      let _minxData = this.mixinDatacomResData;
      _minxData = JSON.parse(JSON.stringify(this.mixinDatacomResData));
      if (this.multiple) {
        return _minxData.filter((item) => currentValues.includes(item.value)) || [];
      } else {
        return _minxData.filter((item) => item.value === currentValues) || [];
      }
    },
    debounce(fn, time = 100) {
      let timer = null;
      return function(...args) {
        if (timer)
          clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, time);
      };
    },
    // 检查项目是否已选中
    isSelected(item) {
      if (this.multiple) {
        const currentValues = this.getCurrentValues();
        return Array.isArray(currentValues) && currentValues.includes(item.value);
      } else {
        return this.getCurrentValues() === item.value;
      }
    },
    // 获取当前选中的值
    getCurrentValues() {
      if (this.multiple) {
        return Array.isArray(this.valueCom) ? this.valueCom : this.valueCom ? [this.valueCom] : [];
      } else {
        return this.valueCom;
      }
    },
    // 执行数据库查询
    query() {
      this.mixinDatacomEasyGet();
    },
    // 监听查询条件变更事件
    onMixinDatacomPropsChange() {
      if (this.collection) {
        this.debounceGet();
      }
    },
    initDefVal() {
      let defValue = this.multiple ? [] : "";
      if ((this.valueCom || this.valueCom === 0) && !this.isDisabled(this.valueCom)) {
        defValue = this.valueCom;
      } else {
        let strogeValue;
        if (this.collection) {
          strogeValue = this.getCache();
        }
        if (strogeValue || strogeValue === 0) {
          defValue = strogeValue;
        } else {
          let defItem = this.multiple ? [] : "";
          if (this.defItem > 0 && this.defItem <= this.mixinDatacomResData.length) {
            defItem = this.multiple ? [this.mixinDatacomResData[this.defItem - 1].value] : this.mixinDatacomResData[this.defItem - 1].value;
          }
          defValue = defItem;
        }
        if (defValue || defValue === 0 || this.multiple && Array.isArray(defValue) && defValue.length > 0) {
          this.emit(defValue);
        }
      }
      if (this.multiple) {
        const selectedValues = Array.isArray(defValue) ? defValue : defValue ? [defValue] : [];
        const selectedItems = this.mixinDatacomResData.filter((item) => selectedValues.includes(item.value));
        this.current = selectedItems.map((item) => this.formatItemName(item));
      } else {
        const def = this.mixinDatacomResData.find((item) => item.value === defValue);
        this.current = def ? this.formatItemName(def) : "";
      }
    },
    /**
     * @param {[String, Number, Array]} value
     * 判断用户给的 value 是否同时为禁用状态
     */
    isDisabled(value) {
      if (Array.isArray(value)) {
        return value.some((val) => {
          return this.mixinDatacomResData.some((item) => item.value === val && item.disable);
        });
      } else {
        let isDisabled = false;
        this.mixinDatacomResData.forEach((item) => {
          if (item.value === value) {
            isDisabled = item.disable;
          }
        });
        return isDisabled;
      }
    },
    clearVal() {
      const emptyValue = this.multiple ? [] : "";
      this.emit(emptyValue);
      this.current = this.multiple ? [] : "";
      if (this.collection) {
        this.removeCache();
      }
      this.$emit("clear");
    },
    checkBoxChange(res) {
      let range = res.detail.value;
      let currentValues = range && range.length > 0 ? range.map((item) => {
        const index = parseInt(item, 10);
        if (isNaN(index)) {
          common_vendor.index.__f__("error", "at uni_modules/uni-data-select/components/uni-data-select/uni-data-select.vue:426", `无效索引: ${item}`);
        }
        if (index < 0 || index >= this.mixinDatacomResData.length) {
          common_vendor.index.__f__("error", "at uni_modules/uni-data-select/components/uni-data-select/uni-data-select.vue:430", `索引越界: ${index}`);
        }
        return this.mixinDatacomResData[index].value;
      }) : [];
      const selectedItems = this.mixinDatacomResData.filter((dataItem) => currentValues.includes(dataItem.value));
      this.current = selectedItems.map((dataItem) => this.formatItemName(dataItem));
      this.emit(currentValues);
    },
    change(item) {
      if (!item.disable) {
        if (this.multiple) {
          let currentValues = this.getCurrentValues();
          if (!Array.isArray(currentValues)) {
            currentValues = currentValues ? [currentValues] : [];
          }
          const itemValue = item.value;
          const index = currentValues.indexOf(itemValue);
          if (index > -1) {
            currentValues.splice(index, 1);
          } else {
            currentValues.push(itemValue);
          }
          const selectedItems = this.mixinDatacomResData.filter((dataItem) => currentValues.includes(dataItem.value));
          this.current = selectedItems.map((dataItem) => this.formatItemName(dataItem));
          this.emit(currentValues);
        } else {
          this.showSelector = false;
          this.current = this.formatItemName(item);
          this.emit(item.value);
        }
      }
    },
    emit(val) {
      this.$emit("input", val);
      this.$emit("update:modelValue", val);
      this.$emit("change", val);
      if (this.collection) {
        this.setCache(val);
      }
    },
    toggleSelector() {
      if (this.disabled) {
        return;
      }
      this.showSelector = !this.showSelector;
    },
    formatItemName(item) {
      let {
        text,
        value,
        channel_code
      } = item;
      channel_code = channel_code ? `(${channel_code})` : "";
      if (this.format) {
        let str = "";
        str = this.format;
        for (let key in item) {
          str = str.replace(new RegExp(`{${key}}`, "g"), item[key]);
        }
        return str;
      } else {
        return this.collection.indexOf("app-list") > 0 ? `${text}(${value})` : text ? text : `未命名${channel_code}`;
      }
    },
    // 获取当前加载的数据
    getLoadData() {
      return this.mixinDatacomResData;
    },
    // 获取当前缓存key
    getCurrentCacheKey() {
      return this.collection;
    },
    // 获取缓存
    getCache(name = this.getCurrentCacheKey()) {
      let cacheData = common_vendor.index.getStorageSync(this.cacheKey) || {};
      return cacheData[name];
    },
    // 设置缓存
    setCache(value, name = this.getCurrentCacheKey()) {
      let cacheData = common_vendor.index.getStorageSync(this.cacheKey) || {};
      cacheData[name] = value;
      common_vendor.index.setStorageSync(this.cacheKey, cacheData);
    },
    // 删除缓存
    removeCache(name = this.getCurrentCacheKey()) {
      let cacheData = common_vendor.index.getStorageSync(this.cacheKey) || {};
      delete cacheData[name];
      common_vendor.index.setStorageSync(this.cacheKey, cacheData);
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.label
  }, $props.label ? {
    b: common_vendor.t($props.label + "：")
  } : {}, {
    c: $options.slotSelected
  }, $options.slotSelected ? {
    d: common_vendor.r("selected", {
      selectedItems: $options.getSelectedItems()
    }),
    e: $options.shouldWrap ? 1 : ""
  } : common_vendor.e({
    f: $options.textShow
  }, $options.textShow ? {
    g: common_vendor.t($options.textShow),
    h: common_vendor.n("align-" + $props.align),
    i: $options.shouldWrap ? 1 : ""
  } : {
    j: common_vendor.t($options.typePlaceholder),
    k: common_vendor.n("align-" + $props.align)
  }), {
    l: !$props.hideRight && $options.shouldShowClear && $props.clear && !$props.disabled
  }, !$props.hideRight && $options.shouldShowClear && $props.clear && !$props.disabled ? {
    m: common_vendor.p({
      type: "clear",
      color: "#c0c4cc",
      size: "24"
    }),
    n: common_vendor.o((...args) => $options.clearVal && $options.clearVal(...args))
  } : !$props.hideRight ? {
    p: common_vendor.p({
      type: $data.showSelector ? "top" : "bottom",
      size: "14",
      color: "#999"
    })
  } : {}, {
    o: !$props.hideRight,
    q: common_vendor.o((...args) => $options.toggleSelector && $options.toggleSelector(...args)),
    r: $options.shouldWrap ? 1 : "",
    s: $data.showSelector
  }, $data.showSelector ? {
    t: common_vendor.o((...args) => $options.toggleSelector && $options.toggleSelector(...args))
  } : {}, {
    v: $data.showSelector
  }, $data.showSelector ? common_vendor.e({
    w: common_vendor.n($props.placement == "bottom" ? "uni-popper__arrow_bottom" : "uni-popper__arrow_top"),
    x: $options.slotEmpty && $data.mixinDatacomResData.length === 0
  }, $options.slotEmpty && $data.mixinDatacomResData.length === 0 ? {
    y: common_vendor.r("empty", {
      empty: $props.emptyTips
    })
  } : common_vendor.e({
    z: $data.mixinDatacomResData.length === 0
  }, $data.mixinDatacomResData.length === 0 ? {
    A: common_vendor.t($props.emptyTips)
  } : {}), {
    B: $options.slotOption
  }, $options.slotOption ? {
    C: common_vendor.f($data.mixinDatacomResData, (itemData, index, i0) => {
      return {
        a: "option-" + i0,
        b: common_vendor.r("option", {
          item: itemData,
          itemSelected: $props.multiple ? $options.getCurrentValues().includes(itemData.value) : $options.getCurrentValues() == itemData.value
        }, i0),
        c: index,
        d: common_vendor.o(($event) => $options.change(itemData), index)
      };
    })
  } : common_vendor.e({
    D: !$props.multiple && $data.mixinDatacomResData.length > 0
  }, !$props.multiple && $data.mixinDatacomResData.length > 0 ? {
    E: common_vendor.f($data.mixinDatacomResData, (item, index, i0) => {
      return {
        a: common_vendor.t($options.formatItemName(item)),
        b: item.disable ? 1 : "",
        c: index,
        d: common_vendor.o(($event) => $options.change(item), index)
      };
    })
  } : {}, {
    F: $props.multiple && $data.mixinDatacomResData.length > 0
  }, $props.multiple && $data.mixinDatacomResData.length > 0 ? {
    G: common_vendor.f($data.mixinDatacomResData, (item, index, i0) => {
      return {
        a: index + "",
        b: $options.getCurrentValues().includes(item.value),
        c: item.disable,
        d: common_vendor.t($options.formatItemName(item)),
        e: item.disable ? 1 : "",
        f: index
      };
    }),
    H: common_vendor.o((...args) => $options.checkBoxChange && $options.checkBoxChange(...args))
  } : {}), {
    I: common_vendor.s($options.getOffsetByPlacement)
  }) : {}, {
    J: $props.disabled ? 1 : "",
    K: $options.shouldWrap ? 1 : "",
    L: $props.mode == "default" ? 1 : "",
    M: $props.mode == "underline" ? 1 : "",
    N: $data.current ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js.map
