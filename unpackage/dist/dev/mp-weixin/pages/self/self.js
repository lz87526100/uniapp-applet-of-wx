"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_system = require("../../utils/system.js");
const common_style_favorites = require("../../common/style/favorites.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "self",
  setup(__props) {
    const userInfo = common_vendor.ref({
      _id: "",
      // 添加 _id 字段
      nickname: "咸虾米",
      avatar: "/static/logo.png"
    });
    const setupEventListeners = () => {
      common_vendor.index.$on("userInfoUpdated", (data) => {
        common_vendor.index.__f__("log", "at pages/self/self.vue:143", "通过全局事件接收到用户信息更新:", data);
        updateUserInfo(data);
      });
    };
    const updateUserInfo = (data) => {
      common_vendor.index.__f__("log", "at pages/self/self.vue:150", "开始更新用户信息:", data);
      if (data.userId === userInfo.value._id) {
        if (data.avatar && data.avatar !== userInfo.value.avatar) {
          userInfo.value.avatar = data.avatar;
          common_vendor.index.__f__("log", "at pages/self/self.vue:157", "头像已更新:", data.avatar);
        }
        if (data.nickname && data.nickname !== userInfo.value.nickname) {
          userInfo.value.nickname = data.nickname;
          common_vendor.index.__f__("log", "at pages/self/self.vue:162", "昵称已更新:", data.nickname);
        }
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (userInfoFromStorage) {
          if (data.nickname) {
            userInfoFromStorage.nickname = data.nickname;
          }
          if (data.avatar) {
            userInfoFromStorage.avatar = data.avatar;
          }
          common_vendor.index.setStorageSync("uni-id-pages-userInfo", userInfoFromStorage);
          common_vendor.index.__f__("log", "at pages/self/self.vue:175", "本地存储已更新");
        }
        common_vendor.index.setStorageSync("userInfoPendingUpdate", data);
        common_vendor.index.showToast({
          title: "资料已更新",
          icon: "success",
          duration: 1500
        });
      } else {
        common_vendor.index.__f__("log", "at pages/self/self.vue:188", "用户ID不匹配，不更新数据");
      }
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("userInfoUpdated");
    });
    const favoritesCount = common_vendor.ref(0);
    async function getFavoritesCount() {
      try {
        common_vendor.index.__f__("log", "at pages/self/self.vue:203", "开始获取收藏数量...");
        const favorites = await common_style_favorites.favoritesManager.getFavoritesList(1, 100);
        favoritesCount.value = favorites.length;
        common_vendor.index.__f__("log", "at pages/self/self.vue:206", "收藏数量:", favoritesCount.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/self.vue:208", "获取收藏数量失败:", error);
        favoritesCount.value = 0;
      }
    }
    const handleEditClick = () => {
      const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      common_vendor.index.__f__("log", "at pages/self/self.vue:217", "本地存储的用户信息:", userInfoFromStorage);
      if (userInfoFromStorage && userInfoFromStorage._id) {
        common_vendor.index.__f__("log", "at pages/self/self.vue:220", "编辑用户:", userInfoFromStorage._id);
        common_vendor.index.navigateTo({
          url: `/pages/self/editSelf?id=${userInfoFromStorage._id}`,
          events: {
            // 监听编辑页面发送的事件
            userInfoUpdated: (data) => {
              common_vendor.index.__f__("log", "at pages/self/self.vue:226", "通过事件通道接收到用户信息更新:", data);
              updateUserInfo(data);
            }
          },
          success: (res) => {
            res.eventChannel.emit("acceptUserInfo", {
              userInfo: userInfo.value
            });
          }
        });
      } else {
        common_vendor.index.__f__("error", "at pages/self/self.vue:238", "未找到用户信息，本地存储内容:", common_vendor.index.getStorageInfoSync());
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
      }
    };
    async function getUserInfo() {
      try {
        common_vendor.index.__f__("log", "at pages/self/self.vue:249", "开始获取用户信息...");
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        common_vendor.index.__f__("log", "at pages/self/self.vue:253", "uni-id-pages 存储的用户信息:", userInfoFromStorage);
        if (userInfoFromStorage && userInfoFromStorage._id) {
          try {
            const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
            const cloudResult = await articlesCloudObj.getUserInfoById(userInfoFromStorage._id);
            if (cloudResult.errCode === 0 && cloudResult.data) {
              common_vendor.index.__f__("log", "at pages/self/self.vue:262", "云函数返回的用户信息:", cloudResult.data);
              const cloudUserData = cloudResult.data;
              let avatarUrl2 = "/static/logo.png";
              if (cloudUserData.avatar_url) {
                avatarUrl2 = cloudUserData.avatar_url;
              } else if (cloudUserData.avatar_file && cloudUserData.avatar_file.url) {
                try {
                  const result = await common_vendor.tr.getTempFileURL({
                    fileList: [cloudUserData.avatar_file.url]
                  });
                  if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
                    avatarUrl2 = result.fileList[0].tempFileURL;
                  }
                } catch (urlError) {
                  common_vendor.index.__f__("error", "at pages/self/self.vue:277", "URL转换失败:", urlError);
                }
              }
              userInfo.value = {
                _id: cloudUserData._id || userInfoFromStorage._id,
                nickname: cloudUserData.nickname || userInfoFromStorage.nickname || "咸虾米",
                avatar: avatarUrl2
              };
              const updatedStorage = {
                ...userInfoFromStorage,
                nickname: cloudUserData.nickname || userInfoFromStorage.nickname,
                avatar: avatarUrl2
              };
              common_vendor.index.setStorageSync("uni-id-pages-userInfo", updatedStorage);
              common_vendor.index.__f__("log", "at pages/self/self.vue:296", "从云函数同步用户信息成功:", userInfo.value);
              return;
            }
          } catch (cloudError) {
            common_vendor.index.__f__("warn", "at pages/self/self.vue:300", "云函数获取失败，使用本地缓存:", cloudError);
          }
          const userData = userInfoFromStorage;
          let avatarUrl = "/static/logo.png";
          if (userData.avatar && userData.avatar !== "/static/logo.png") {
            avatarUrl = userData.avatar;
          } else if (userData.avatar_file && userData.avatar_file.url) {
            try {
              const result = await common_vendor.tr.getTempFileURL({
                fileList: [userData.avatar_file.url]
              });
              if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
                avatarUrl = result.fileList[0].tempFileURL;
              }
            } catch (urlError) {
              common_vendor.index.__f__("error", "at pages/self/self.vue:319", "URL转换失败:", urlError);
            }
          }
          userInfo.value = {
            _id: userData._id || "",
            nickname: userData.nickname || "咸虾米",
            avatar: avatarUrl
          };
          common_vendor.index.__f__("log", "at pages/self/self.vue:328", "从本地存储获取用户信息成功:", userInfo.value);
          return;
        }
        common_vendor.index.__f__("log", "at pages/self/self.vue:333", "本地存储无用户信息，尝试数据库查询...");
        const db = common_vendor.tr.database();
        const usersRes = await db.collection("uni-id-users").field("_id,nickname,avatar_file").limit(10).get();
        common_vendor.index.__f__("log", "at pages/self/self.vue:340", "数据库查询结果:", usersRes);
        if (usersRes.data && usersRes.data.length > 0) {
          const userData = usersRes.data[0];
          let avatarUrl = "/static/logo.png";
          if (userData.avatar_file && userData.avatar_file.url) {
            try {
              const result = await common_vendor.tr.getTempFileURL({
                fileList: [userData.avatar_file.url]
              });
              if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
                avatarUrl = result.fileList[0].tempFileURL;
              }
            } catch (urlError) {
              common_vendor.index.__f__("error", "at pages/self/self.vue:356", "URL转换失败:", urlError);
            }
          }
          userInfo.value = {
            _id: userData._id || "",
            // 获取用户ID
            nickname: userData.nickname || "咸虾米",
            avatar: avatarUrl
          };
          common_vendor.index.__f__("log", "at pages/self/self.vue:365", "从数据库获取用户信息成功:", userInfo.value);
        } else {
          userInfo.value = {
            _id: "",
            nickname: "咸虾米",
            avatar: "/static/logo.png"
          };
          common_vendor.index.__f__("log", "at pages/self/self.vue:373", "使用默认用户信息");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/self.vue:377", "获取用户信息失败:", error);
        userInfo.value = {
          _id: "",
          nickname: "咸虾米",
          avatar: "/static/logo.png"
        };
      }
      common_vendor.index.stopPullDownRefresh();
    }
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "是否退出当前账号？",
        success: function(res) {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("uni_id_token");
            common_vendor.index.removeStorageSync("uni_id_token_expired");
            common_vendor.index.removeStorageSync("uni-id-pages-userInfo");
            common_vendor.index.removeStorageSync("uni_id_userinfo");
            common_vendor.index.removeStorageSync("userInfoPendingUpdate");
            common_vendor.index.reLaunch({
              url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd"
            });
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/self/self.vue:432", "页面显示，重新获取用户信息");
      getUserInfo();
      const pendingUpdate = common_vendor.index.getStorageSync("userInfoPendingUpdate");
      if (pendingUpdate) {
        common_vendor.index.__f__("log", "at pages/self/self.vue:440", "发现待更新的用户信息:", pendingUpdate);
        updateUserInfo(pendingUpdate);
        common_vendor.index.removeStorageSync("userInfoPendingUpdate");
      }
      setupEventListeners();
      getFavoritesCount();
    });
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/self/self.vue:454", "下拉刷新，重新获取用户信息");
      getUserInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(utils_system.getNavBarHeight)() + "px",
        b: userInfo.value.avatar,
        c: common_vendor.t(userInfo.value.nickname),
        d: common_vendor.p({
          type: "right",
          size: "20",
          color: "#999"
        }),
        e: common_vendor.o(handleEditClick),
        f: common_vendor.p({
          ["custom-prefix"]: "iconfont",
          type: "xxm-highlight-fill",
          size: "18",
          color: "#fff"
        }),
        g: common_vendor.p({
          type: "right",
          size: "22",
          color: "#ccc"
        }),
        h: common_vendor.p({
          ["custom-prefix"]: "iconfont",
          type: "xxm-edit-fill",
          size: "18",
          color: "#fff"
        }),
        i: common_vendor.p({
          type: "right",
          size: "22",
          color: "#ccc"
        }),
        j: common_vendor.p({
          ["custom-prefix"]: "iconfont",
          type: "xxm-star-fill",
          size: "18",
          color: "#fff"
        }),
        k: common_vendor.t(favoritesCount.value),
        l: common_vendor.p({
          type: "right",
          size: "22",
          color: "#ccc"
        }),
        m: common_vendor.p({
          ["custom-prefix"]: "iconfont",
          type: "xxm-message-fill",
          size: "18",
          color: "#fff"
        }),
        n: common_vendor.p({
          type: "right",
          size: "22",
          color: "#ccc"
        }),
        o: common_vendor.p({
          ["custom-prefix"]: "iconfont",
          type: "xxm-pushpin-fill",
          size: "18",
          color: "#fff"
        }),
        p: common_vendor.p({
          type: "right",
          size: "22",
          color: "#ccc"
        }),
        q: common_vendor.p({
          ["custom-prefix"]: "iconfont",
          type: "xxm-api-fill",
          size: "18",
          color: "#fff"
        }),
        r: common_vendor.p({
          type: "right",
          size: "22",
          color: "#ccc"
        }),
        s: common_vendor.o(handleLogout)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f94a969d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/self.js.map
