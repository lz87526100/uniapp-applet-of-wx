class FavoritesManager {
  constructor() {
    this.articlesCloudObj = null;
    this.init();
  }
  
  init() {
    try {
      this.articlesCloudObj = uniCloud.importObject('articlesCloudObj');
      console.log('✅ 云对象初始化成功');
    } catch (error) {
      console.error('❌ 初始化云对象失败:', error);
    }
  }
  
  // 获取当前用户ID - 修复版，兼容 id 和 _id
  getCurrentUserId() {
    try {
      // 方法1：从 uni-id-pages 存储获取
      let userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      console.log('🔍 uni-id-pages 用户信息:', userInfo);
      
      if (userInfo) {
        // 优先使用 _id，如果没有则使用 id
        const userId = userInfo._id || userInfo.id;
        if (userId) {
          console.log('✅ 找到用户ID:', userId);
          return userId;
        }
      }
      
      // 方法2：从 uni-id 标准存储获取
      userInfo = uni.getStorageSync('uni_id_userinfo');
      console.log('🔍 uni-id 标准用户信息:', userInfo);
      
      if (userInfo) {
        const userId = userInfo._id || userInfo.uid || userInfo.id;
        if (userId) {
          console.log('✅ 找到用户ID:', userId);
          return userId;
        }
      }
      
      console.warn('❌ 未找到有效的用户ID');
      return null;
      
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  }
  
  // 检查登录状态
  async checkLogin() {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return false;
    }
    
    return true;
  }

  // 调试方法
  async debugFavorites() {
    try {
      if (!this.articlesCloudObj) this.init();
      const result = await this.articlesCloudObj.debugFavorites();
      console.log('🐛 调试结果:', result);
      return result;
    } catch (error) {
      console.error('调试失败:', error);
    }
  }

  // 刷新token
  async refreshTokenIfNeeded() {
    try {
      const uniIdCo = uniCloud.importObject('uni-id-co');
      const result = await uniIdCo.refreshToken();
      console.log('🔄 token刷新结果:', result);
      return result.errCode === 0;
    } catch (error) {
      console.error('刷新token失败:', error);
      return false;
    }
  }
  
  // 添加收藏
  async addFavorite(articleId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return false;
      }
      
      // 刷新token
      await this.refreshTokenIfNeeded();
      
      if (!this.articlesCloudObj) this.init();
      
      console.log('📤 发送收藏请求:', { articleId, userId });
      
      const result = await this.articlesCloudObj.addFavorite({
        articleId,
        userId
      });
      
      console.log('📥 收藏响应:', result);
      
      if (result.errCode === 0) {
        uni.showToast({ title: '收藏成功', icon: 'success' });
        return true;
      } else {
        uni.showToast({ title: result.errMsg, icon: 'none' });
        return false;
      }
    } catch (error) {
      console.error('❌ 收藏失败:', error);
      uni.showToast({ title: '收藏失败', icon: 'none' });
      return false;
    }
  }
  
  // 取消收藏
  async removeFavorite(articleId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return false;
      }
      
      if (!this.articlesCloudObj) this.init();
      
      console.log('📤 发送取消收藏请求:', { articleId, userId });
      
      const result = await this.articlesCloudObj.removeFavorite({
        articleId,
        userId
      });
      
      console.log('📥 取消收藏响应:', result);
      
      if (result.errCode === 0) {
        uni.showToast({ title: '取消收藏', icon: 'success' });
        return true;
      } else {
        uni.showToast({ title: result.errMsg, icon: 'none' });
        return false;
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      uni.showToast({ title: '取消收藏失败', icon: 'none' });
      return false;
    }
  }
  
  // 检查收藏状态
  async checkFavorite(articleId) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return false;
      
      if (!this.articlesCloudObj) this.init();
      
      console.log('📤 检查收藏状态:', { articleId, userId });
      
      const result = await this.articlesCloudObj.checkFavorite({
        articleId,
        userId
      });
      
      console.log('📥 收藏状态响应:', result);
      
      return result.data?.isFavorited || false;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      return false;
    }
  }
  
  // 获取收藏列表 - 最终版
  async getFavoritesList(page = 1, size = 100) {
    try {
      const userId = this.getCurrentUserId();
      console.log('👤 当前用户ID:', userId);
      
      if (!userId) {
        console.log('用户未登录，返回空数组');
        return [];
      }
      
      // 刷新token
      await this.refreshTokenIfNeeded();
      
      // 先进行调试（可选）
      // await this.debugFavorites();
      
      if (!this.articlesCloudObj) {
        this.init();
        if (!this.articlesCloudObj) {
          console.error('❌ 云对象初始化失败');
          return [];
        }
      }
      
      console.log('📤 发送收藏列表请求:', { page, size, userId });
      
      const result = await this.articlesCloudObj.getFavoritesList({
        page,
        size,
        userId
      });
      
      console.log('📥 收藏列表响应:', result);
      
      if (result.errCode === 0) {
        console.log(`✅ 获取到 ${result.data.length} 条收藏`);
        return result.data || [];
      } else {
        console.warn('❌ 获取收藏列表失败:', result.errMsg);
        // 即使失败也返回空数组，不显示错误
        return [];
      }
    } catch (error) {
      console.error('❌ 获取收藏列表异常:', error);
      // 发生异常时返回空数组
      return [];
    }
  }
  
  // 批量检查收藏状态 - 增强错误处理
  async batchCheckFavorites(articleIds) {
    try {
      const userId = this.getCurrentUserId();
      
      if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
        console.log('文章ID列表为空，返回空对象');
        return {};
      }

      // 用户未登录时，所有文章都未收藏
      if (!userId) {
        console.log('用户未登录，所有文章默认未收藏');
        const emptyStatus = {};
        articleIds.forEach(id => {
          emptyStatus[id] = false;
        });
        return emptyStatus;
      }
      
      // 刷新token
      await this.refreshTokenIfNeeded();
      
      if (!this.articlesCloudObj) this.init();
      
      console.log('📤 发送批量检查请求:', { 
        articleCount: articleIds.length, 
        userId 
      });
      
      const result = await this.articlesCloudObj.batchCheckFavorites({
        articleIds,
        userId
      });
      
      console.log('📥 批量检查响应:', result);
      
      if (result.errCode === 0) {
        return result.data || {};
      } else {
        console.warn('批量检查返回错误:', result.errMsg);
        // 返回默认未收藏状态
        const defaultStatus = {};
        articleIds.forEach(id => {
          defaultStatus[id] = false;
        });
        return defaultStatus;
      }
    } catch (error) {
      console.error('❌ 批量检查收藏状态失败:', error);
      
      // 出错时返回默认未收藏状态
      const defaultStatus = {};
      articleIds.forEach(id => {
        defaultStatus[id] = false;
      });
      return defaultStatus;
    }
  }

  // 获取收藏数量（优化版）
  async getFavoritesCount() {
    try {
      const favoritesList = await this.getFavoritesList(1, 1000); // 获取足够多的数据来计数
      return favoritesList.length;
    } catch (error) {
      console.error('获取收藏数量失败:', error);
      return 0;
    }
  }
}

// 创建单例实例
const favoritesManager = new FavoritesManager();
export default favoritesManager;