class ShopFavoritesManager {
  constructor() {
    this.cloudObj = null;
    this.init();
  }
  
  init() {
    try {
      this.cloudObj = uniCloud.importObject('shopFavoritesCloudobj');
      console.log('店铺收藏云对象初始化成功');
    } catch (error) {
      console.error('店铺收藏云对象初始化失败:', error);
    }
  }
  
  // 获取当前用户ID（复用已有逻辑）
  getCurrentUserId() {
    try {
      let userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      if (userInfo) {
        return userInfo._id || userInfo.id;
      }
      
      userInfo = uni.getStorageSync('uni_id_userinfo');
      if (userInfo) {
        return userInfo._id || userInfo.uid || userInfo.id;
      }
      
      return null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  }
  
  // 检查登录状态
  checkLogin() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return false;
    }
    return true;
  }
  
  // 添加店铺收藏
  async addFavorite(shopId) {
    if (!this.checkLogin()) return false;
    
    try {
      if (!this.cloudObj) this.init();
      
      const result = await this.cloudObj.addFavorite({
        shop_id: shopId,
        user_id: this.getCurrentUserId()
      });
      
      if (result.errCode === 0) {
        uni.showToast({ title: '收藏成功', icon: 'success' });
        return true;
      } else if (result.errCode === 200) {
        uni.showToast({ title: '已收藏该店铺', icon: 'none' });
        return true;
      } else {
        uni.showToast({ title: result.errMsg, icon: 'none' });
        return false;
      }
    } catch (error) {
      console.error('添加店铺收藏失败:', error);
      uni.showToast({ title: '收藏失败', icon: 'none' });
      return false;
    }
  }
  
  // 取消店铺收藏
  async removeFavorite(shopId) {
    if (!this.checkLogin()) return false;
    
    try {
      if (!this.cloudObj) this.init();
      
      const result = await this.cloudObj.removeFavorite({
        shop_id: shopId,
        user_id: this.getCurrentUserId()
      });
      
      if (result.errCode === 0) {
        uni.showToast({ title: '取消收藏成功', icon: 'success' });
        return true;
      } else {
        uni.showToast({ title: result.errMsg, icon: 'none' });
        return false;
      }
    } catch (error) {
      console.error('取消店铺收藏失败:', error);
      uni.showToast({ title: '取消收藏失败', icon: 'none' });
      return false;
    }
  }
  
  // 检查店铺收藏状态
  async checkFavorite(shopId) {
    const userId = this.getCurrentUserId();
    if (!userId) return false;
    
    try {
      if (!this.cloudObj) this.init();
      
      const result = await this.cloudObj.checkFavorite({
        shop_id: shopId,
        user_id: userId
      });
      
      return result.errCode === 0 && result.data?.isFavorited;
    } catch (error) {
      console.error('检查店铺收藏状态失败:', error);
      return false;
    }
  }
  
  // 获取用户收藏的店铺列表
  async getUserFavorites(page = 1, size = 10) {
    if (!this.checkLogin()) return [];
    
    try {
      if (!this.cloudObj) this.init();
      
      const result = await this.cloudObj.getUserFavorites({
        user_id: this.getCurrentUserId(),
        page,
        size
      });
      
      return result.errCode === 0 ? result.data : [];
    } catch (error) {
      console.error('获取用户店铺收藏列表失败:', error);
      return [];
    }
  }
}

// 创建单例实例
const shopFavoritesManager = new ShopFavoritesManager();
export default shopFavoritesManager;