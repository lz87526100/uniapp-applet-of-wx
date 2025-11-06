"use strict";
const common_vendor = require("../vendor.js");
class FavoritesManager {
  constructor() {
    this.articlesCloudObj = null;
    this.init();
  }
  init() {
    try {
      this.articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
      common_vendor.index.__f__("log", "at common/style/favorites.js:10", "✅ 云对象初始化成功");
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:12", "❌ 初始化云对象失败:", error);
    }
  }
  // 获取当前用户ID - 修复版，兼容 id 和 _id
  getCurrentUserId() {
    try {
      let userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      common_vendor.index.__f__("log", "at common/style/favorites.js:21", "🔍 uni-id-pages 用户信息:", userInfo);
      if (userInfo) {
        const userId = userInfo._id || userInfo.id;
        if (userId) {
          common_vendor.index.__f__("log", "at common/style/favorites.js:27", "✅ 找到用户ID:", userId);
          return userId;
        }
      }
      userInfo = common_vendor.index.getStorageSync("uni_id_userinfo");
      common_vendor.index.__f__("log", "at common/style/favorites.js:34", "🔍 uni-id 标准用户信息:", userInfo);
      if (userInfo) {
        const userId = userInfo._id || userInfo.uid || userInfo.id;
        if (userId) {
          common_vendor.index.__f__("log", "at common/style/favorites.js:39", "✅ 找到用户ID:", userId);
          return userId;
        }
      }
      common_vendor.index.__f__("warn", "at common/style/favorites.js:44", "❌ 未找到有效的用户ID");
      return null;
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:48", "获取用户ID失败:", error);
      return null;
    }
  }
  // 检查登录状态
  async checkLogin() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      return false;
    }
    return true;
  }
  // 调试方法
  async debugFavorites() {
    try {
      if (!this.articlesCloudObj)
        this.init();
      const result = await this.articlesCloudObj.debugFavorites();
      common_vendor.index.__f__("log", "at common/style/favorites.js:70", "🐛 调试结果:", result);
      return result;
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:73", "调试失败:", error);
    }
  }
  // 刷新token
  async refreshTokenIfNeeded() {
    try {
      const uniIdCo = common_vendor.tr.importObject("uni-id-co");
      const result = await uniIdCo.refreshToken();
      common_vendor.index.__f__("log", "at common/style/favorites.js:82", "🔄 token刷新结果:", result);
      return result.errCode === 0;
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:85", "刷新token失败:", error);
      return false;
    }
  }
  // 添加收藏
  async addFavorite(articleId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return false;
      }
      await this.refreshTokenIfNeeded();
      if (!this.articlesCloudObj)
        this.init();
      common_vendor.index.__f__("log", "at common/style/favorites.js:104", "📤 发送收藏请求:", { articleId, userId });
      const result = await this.articlesCloudObj.addFavorite({
        articleId,
        userId
      });
      common_vendor.index.__f__("log", "at common/style/favorites.js:111", "📥 收藏响应:", result);
      if (result.errCode === 0) {
        common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
        return true;
      } else {
        common_vendor.index.showToast({ title: result.errMsg, icon: "none" });
        return false;
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:121", "❌ 收藏失败:", error);
      common_vendor.index.showToast({ title: "收藏失败", icon: "none" });
      return false;
    }
  }
  // 取消收藏
  async removeFavorite(articleId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return false;
      }
      if (!this.articlesCloudObj)
        this.init();
      common_vendor.index.__f__("log", "at common/style/favorites.js:138", "📤 发送取消收藏请求:", { articleId, userId });
      const result = await this.articlesCloudObj.removeFavorite({
        articleId,
        userId
      });
      common_vendor.index.__f__("log", "at common/style/favorites.js:145", "📥 取消收藏响应:", result);
      if (result.errCode === 0) {
        common_vendor.index.showToast({ title: "取消收藏", icon: "success" });
        return true;
      } else {
        common_vendor.index.showToast({ title: result.errMsg, icon: "none" });
        return false;
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:155", "取消收藏失败:", error);
      common_vendor.index.showToast({ title: "取消收藏失败", icon: "none" });
      return false;
    }
  }
  // 检查收藏状态
  async checkFavorite(articleId) {
    var _a;
    try {
      const userId = this.getCurrentUserId();
      if (!userId)
        return false;
      if (!this.articlesCloudObj)
        this.init();
      common_vendor.index.__f__("log", "at common/style/favorites.js:169", "📤 检查收藏状态:", { articleId, userId });
      const result = await this.articlesCloudObj.checkFavorite({
        articleId,
        userId
      });
      common_vendor.index.__f__("log", "at common/style/favorites.js:176", "📥 收藏状态响应:", result);
      return ((_a = result.data) == null ? void 0 : _a.isFavorited) || false;
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:180", "检查收藏状态失败:", error);
      return false;
    }
  }
  // 获取收藏列表 - 最终版
  async getFavoritesList(page = 1, size = 100) {
    try {
      const userId = this.getCurrentUserId();
      common_vendor.index.__f__("log", "at common/style/favorites.js:189", "👤 当前用户ID:", userId);
      if (!userId) {
        common_vendor.index.__f__("log", "at common/style/favorites.js:192", "用户未登录，返回空数组");
        return [];
      }
      await this.refreshTokenIfNeeded();
      if (!this.articlesCloudObj) {
        this.init();
        if (!this.articlesCloudObj) {
          common_vendor.index.__f__("error", "at common/style/favorites.js:205", "❌ 云对象初始化失败");
          return [];
        }
      }
      common_vendor.index.__f__("log", "at common/style/favorites.js:210", "📤 发送收藏列表请求:", { page, size, userId });
      const result = await this.articlesCloudObj.getFavoritesList({
        page,
        size,
        userId
      });
      common_vendor.index.__f__("log", "at common/style/favorites.js:218", "📥 收藏列表响应:", result);
      if (result.errCode === 0) {
        common_vendor.index.__f__("log", "at common/style/favorites.js:221", `✅ 获取到 ${result.data.length} 条收藏`);
        return result.data || [];
      } else {
        common_vendor.index.__f__("warn", "at common/style/favorites.js:224", "❌ 获取收藏列表失败:", result.errMsg);
        return [];
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:229", "❌ 获取收藏列表异常:", error);
      return [];
    }
  }
  // 批量检查收藏状态 - 增强错误处理
  async batchCheckFavorites(articleIds) {
    try {
      const userId = this.getCurrentUserId();
      if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
        common_vendor.index.__f__("log", "at common/style/favorites.js:241", "文章ID列表为空，返回空对象");
        return {};
      }
      if (!userId) {
        common_vendor.index.__f__("log", "at common/style/favorites.js:247", "用户未登录，所有文章默认未收藏");
        const emptyStatus = {};
        articleIds.forEach((id) => {
          emptyStatus[id] = false;
        });
        return emptyStatus;
      }
      await this.refreshTokenIfNeeded();
      if (!this.articlesCloudObj)
        this.init();
      common_vendor.index.__f__("log", "at common/style/favorites.js:260", "📤 发送批量检查请求:", {
        articleCount: articleIds.length,
        userId
      });
      const result = await this.articlesCloudObj.batchCheckFavorites({
        articleIds,
        userId
      });
      common_vendor.index.__f__("log", "at common/style/favorites.js:270", "📥 批量检查响应:", result);
      if (result.errCode === 0) {
        return result.data || {};
      } else {
        common_vendor.index.__f__("warn", "at common/style/favorites.js:275", "批量检查返回错误:", result.errMsg);
        const defaultStatus = {};
        articleIds.forEach((id) => {
          defaultStatus[id] = false;
        });
        return defaultStatus;
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:284", "❌ 批量检查收藏状态失败:", error);
      const defaultStatus = {};
      articleIds.forEach((id) => {
        defaultStatus[id] = false;
      });
      return defaultStatus;
    }
  }
  // 获取收藏数量（优化版）
  async getFavoritesCount() {
    try {
      const favoritesList = await this.getFavoritesList(1, 1e3);
      return favoritesList.length;
    } catch (error) {
      common_vendor.index.__f__("error", "at common/style/favorites.js:301", "获取收藏数量失败:", error);
      return 0;
    }
  }
}
const favoritesManager = new FavoritesManager();
exports.favoritesManager = favoritesManager;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/style/favorites.js.map
