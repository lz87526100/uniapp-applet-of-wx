"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/system.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_load_more2 + _easycom_uni_icons2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "editSelf",
  setup(__props) {
    const state = common_vendor.reactive({
      loading: false,
      userId: "",
      formData: {
        nickname: "",
        avatar: "/static/logo.png"
      },
      userInfo: {
        _id: "",
        register_date: 0,
        last_login_ip: ""
      },
      // 记录数据是否有更新
      hasUpdates: false,
      updatedData: {
        avatar: "",
        nickname: ""
      },
      originalData: {
        nickname: "",
        avatar: ""
      }
    });
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:105", "页面加载，参数:", options);
      const currentUserInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:109", "存储的用户信息:", currentUserInfo);
      if (currentUserInfo && currentUserInfo._id) {
        state.userId = currentUserInfo._id;
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:113", "设置用户ID为:", state.userId);
        loadUserInfo();
      } else {
        common_vendor.index.__f__("error", "at pages/self/editSelf.vue:116", "未找到用户信息");
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:129", "编辑页面显示，检查数据同步");
      if (state.userId) {
        loadUserInfo();
      }
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:137", "页面隐藏，返回数据");
      returnDataToPreviousPage();
    });
    common_vendor.onUnload(() => {
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:143", "页面卸载，返回数据");
      returnDataToPreviousPage();
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:149", "页面卸载，返回数据");
      returnDataToPreviousPage();
    });
    const returnDataToPreviousPage = () => {
      if (state.hasUpdates) {
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:163", "有数据更新，发送给上一页");
        const updateData = {
          userId: state.userId,
          avatar: state.updatedData.avatar || state.formData.avatar,
          nickname: state.updatedData.nickname || state.formData.nickname
        };
        common_vendor.index.$emit("userInfoUpdated", updateData);
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:173", "通过全局事件发送数据:", updateData);
        const eventChannel = this.getOpenerEventChannel();
        if (eventChannel) {
          eventChannel.emit("userInfoUpdated", updateData);
          common_vendor.index.__f__("log", "at pages/self/editSelf.vue:179", "通过事件通道发送数据");
        }
        getApp().globalData.lastUserInfoUpdate = updateData;
        common_vendor.index.setStorageSync("lastUserInfoUpdate", updateData);
        state.hasUpdates = false;
        common_vendor.index.showToast({
          title: "资料已更新",
          icon: "success",
          duration: 1500
        });
      }
    };
    const loadUserInfo = async () => {
      state.loading = true;
      try {
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:204", "加载用户信息，用户ID:", state.userId);
        const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
        const result = await articlesCloudObj.getUserInfoById(state.userId);
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:208", "用户信息加载结果:", result);
        if (result.errCode === 0 && result.data) {
          const userData = result.data;
          state.formData.nickname = userData.nickname || "";
          state.formData.avatar = userData.avatar_url || "/static/logo.png";
          state.userInfo._id = userData._id || state.userId;
          state.userInfo.register_date = userData.register_date || 0;
          state.userInfo.last_login_ip = userData.last_login_ip || "--";
          state.originalData.nickname = state.formData.nickname;
          state.originalData.avatar = state.formData.avatar;
          state.updatedData.nickname = state.formData.nickname;
          state.updatedData.avatar = state.formData.avatar;
          common_vendor.index.__f__("log", "at pages/self/editSelf.vue:228", "用户信息设置完成");
        } else {
          throw new Error(result.errMsg || "获取用户信息失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/editSelf.vue:233", "加载用户信息失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        state.loading = false;
      }
    };
    const changeAvatar = async () => {
      common_vendor.index.__f__("log", "at pages/self/editSelf.vue:245", "点击修改头像，用户ID:", state.userId);
      try {
        common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: async (chooseResult) => {
            common_vendor.index.__f__("log", "at pages/self/editSelf.vue:254", "选择图片成功:", chooseResult);
            if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
              const tempFilePath = chooseResult.tempFilePaths[0];
              common_vendor.index.__f__("log", "at pages/self/editSelf.vue:258", "选择的图片路径:", tempFilePath);
              common_vendor.index.showLoading({
                title: "上传中...",
                mask: true
              });
              try {
                const uploadResult = await common_vendor.tr.uploadFile({
                  filePath: tempFilePath,
                  cloudPath: `user-avatar/${state.userId}/${Date.now()}.jpg`
                });
                common_vendor.index.__f__("log", "at pages/self/editSelf.vue:273", "上传结果:", uploadResult);
                if (uploadResult.fileID) {
                  let avatarUrl = tempFilePath;
                  try {
                    const urlResult = await common_vendor.tr.getTempFileURL({
                      fileList: [uploadResult.fileID]
                    });
                    if (urlResult.fileList && urlResult.fileList[0] && urlResult.fileList[0].tempFileURL) {
                      avatarUrl = urlResult.fileList[0].tempFileURL;
                    }
                  } catch (urlError) {
                    common_vendor.index.__f__("warn", "at pages/self/editSelf.vue:286", "获取永久URL失败，使用临时URL:", urlError);
                  }
                  const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
                  const updateResult = await articlesCloudObj.updateUserInfo({
                    userId: state.userId,
                    avatarFile: uploadResult.fileID
                  });
                  common_vendor.index.__f__("log", "at pages/self/editSelf.vue:296", "数据库更新:", updateResult);
                  if (updateResult.errCode === 0) {
                    state.formData.avatar = avatarUrl;
                    state.updatedData.avatar = avatarUrl;
                    state.hasUpdates = true;
                    common_vendor.index.hideLoading();
                    common_vendor.index.showToast({
                      title: "头像更新成功",
                      icon: "success"
                    });
                    updateLocalUserInfo();
                    common_vendor.index.__f__("log", "at pages/self/editSelf.vue:313", "头像更新完成，标记为有更新");
                  } else {
                    throw new Error(updateResult.errMsg);
                  }
                } else {
                  throw new Error("上传失败");
                }
              } catch (uploadError) {
                common_vendor.index.hideLoading();
                common_vendor.index.__f__("error", "at pages/self/editSelf.vue:322", "上传失败:", uploadError);
                common_vendor.index.showToast({
                  title: "上传失败: " + uploadError.message,
                  icon: "none"
                });
              }
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/self/editSelf.vue:331", "选择图片取消或失败:", error);
            if (error.errMsg !== "chooseImage:fail cancel") {
              common_vendor.index.showToast({
                title: "选择图片失败",
                icon: "none"
              });
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/editSelf.vue:341", "头像上传异常:", error);
      }
    };
    const handleNicknameBlur = async () => {
      if (!state.formData.nickname || !state.formData.nickname.trim()) {
        common_vendor.index.showToast({
          title: "用户名不能为空",
          icon: "none"
        });
        state.formData.nickname = state.originalData.nickname;
        return;
      }
      const trimmedNickname = state.formData.nickname.trim();
      if (trimmedNickname === state.originalData.nickname) {
        return;
      }
      state.loading = true;
      try {
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:366", "自动保存用户名:", {
          userId: state.userId,
          nickname: trimmedNickname
        });
        const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
        const updateResult = await articlesCloudObj.updateUserInfo({
          userId: state.userId,
          nickname: trimmedNickname
        });
        common_vendor.index.__f__("log", "at pages/self/editSelf.vue:377", "保存结果:", updateResult);
        if (updateResult.errCode === 0) {
          state.updatedData.nickname = trimmedNickname;
          state.originalData.nickname = trimmedNickname;
          state.hasUpdates = true;
          common_vendor.index.showToast({
            title: "用户名更新成功",
            icon: "success"
          });
          updateLocalUserInfo();
          common_vendor.index.__f__("log", "at pages/self/editSelf.vue:393", "用户名更新完成，标记为有更新");
        } else {
          throw new Error(updateResult.errMsg || "保存失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/editSelf.vue:399", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败: " + error.message,
          icon: "none"
        });
        state.formData.nickname = state.originalData.nickname;
      } finally {
        state.loading = false;
      }
    };
    const updateLocalUserInfo = () => {
      try {
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (userInfoFromStorage) {
          userInfoFromStorage.nickname = state.formData.nickname.trim();
          if (state.updatedData.avatar) {
            userInfoFromStorage.avatar = state.updatedData.avatar;
          }
          common_vendor.index.setStorageSync("uni-id-pages-userInfo", userInfoFromStorage);
          common_vendor.index.__f__("log", "at pages/self/editSelf.vue:421", "本地存储更新成功");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/editSelf.vue:424", "更新本地存储失败:", error);
      }
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "--";
      try {
        const date = new Date(parseInt(timestamp));
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      } catch (e) {
        return "--";
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: state.loading
      }, state.loading ? {
        b: common_vendor.p({
          status: "loading",
          content: "加载中..."
        })
      } : {
        c: state.formData.avatar,
        d: common_vendor.p({
          type: "camera",
          size: "24",
          color: "#fff"
        }),
        e: common_vendor.o(changeAvatar),
        f: common_vendor.o(handleNicknameBlur),
        g: state.formData.nickname,
        h: common_vendor.o(($event) => state.formData.nickname = $event.detail.value),
        i: common_vendor.t(state.userInfo._id || "--"),
        j: common_vendor.t(formatDate(state.userInfo.register_date)),
        k: common_vendor.t(state.userInfo.last_login_ip || "--")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85b14a32"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/editSelf.js.map
