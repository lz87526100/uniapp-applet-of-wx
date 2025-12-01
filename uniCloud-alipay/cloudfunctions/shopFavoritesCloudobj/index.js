'use strict';
const db = uniCloud.database();
const dbJQL = uniCloud.databaseForJQL();

module.exports = {
  _before: function() {
    // 通用预处理器，可添加权限校验等
  },

  /**
   * 添加店铺收藏
   * @param {Object} params 参数对象
   * @param {string} params.shop_id 店铺ID
   * @param {string} params.user_id 用户ID
   */
  async addFavorite(params) {
    try {
      const { shop_id, user_id } = params;
      
      if (!shop_id || !user_id) {
        return { errCode: 400, errMsg: '店铺ID和用户ID不能为空' };
      }
      
      // 检查是否已收藏
      const exists = await db.collection('shop_favorites')
        .where({ shop_id, user_id, status: 1 })
        .get();
      
      if (exists.data && exists.data.length > 0) {
        return { errCode: 200, errMsg: '已收藏该店铺', data: { isFavorited: true } };
      }
      
      // 添加收藏记录
      const result = await db.collection('shop_favorites').add({
        shop_id,
        user_id,
        status: 1,
        created_at: Date.now(),
        updated_at: Date.now()
      });
      
      return {
        errCode: 0,
        errMsg: '收藏成功',
        data: { id: result.id }
      };
    } catch (error) {
      console.error('添加收藏失败:', error);
      return { errCode: 500, errMsg: '收藏失败: ' + error.message };
    }
  },

  /**
   * 取消店铺收藏
   * @param {Object} params 参数对象
   * @param {string} params.shop_id 店铺ID
   * @param {string} params.user_id 用户ID
   */
  async removeFavorite(params) {
    try {
      const { shop_id, user_id } = params;
      
      if (!shop_id || !user_id) {
        return { errCode: 400, errMsg: '店铺ID和用户ID不能为空' };
      }
      
      // 更新收藏状态为取消
      const result = await db.collection('shop_favorites')
        .where({ shop_id, user_id, status: 1 })
        .update({
          status: 0,
          updated_at: Date.now()
        });
      
      if (result.updated === 0) {
        return { errCode: 404, errMsg: '未找到收藏记录' };
      }
      
      return { errCode: 0, errMsg: '取消收藏成功' };
    } catch (error) {
      console.error('取消收藏失败:', error);
      return { errCode: 500, errMsg: '取消收藏失败: ' + error.message };
    }
  },

  /**
   * 检查店铺收藏状态
   * @param {Object} params 参数对象
   * @param {string} params.shop_id 店铺ID
   * @param {string} params.user_id 用户ID
   */
  async checkFavorite(params) {
    try {
      const { shop_id, user_id } = params;
      
      if (!shop_id || !user_id) {
        return { errCode: 400, errMsg: '店铺ID和用户ID不能为空' };
      }
      
      const result = await db.collection('shop_favorites')
        .where({ shop_id, user_id, status: 1 })
        .get();
      
      return {
        errCode: 0,
        data: { isFavorited: result.data && result.data.length > 0 }
      };
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      return { errCode: 500, errMsg: '检查收藏状态失败: ' + error.message };
    }
  },

  /**
   * 获取用户收藏的店铺列表
   * @param {Object} params 参数对象
   * @param {string} params.user_id 用户ID
   * @param {number} [params.page=1] 页码
   * @param {number} [params.size=10] 每页数量
   */
  async getUserFavorites(params) {
    try {
      const { user_id, page = 1, size = 10 } = params;
      
      if (!user_id) {
        return { errCode: 400, errMsg: '用户ID不能为空' };
      }
      
      const skip = (page - 1) * size;
      
      // 关联查询店铺信息
      const result = await dbJQL.collection('shop_favorites', 'shopDetail')
        .where({ 'shop_favorites.user_id': user_id, 'shop_favorites.status': 1 })
        .field({
          'shop_favorites._id': true,
          'shop_favorites.created_at': true,
          'shopDetail._id': true,
          'shopDetail.shopName': true,
          'shopDetail.shopPic': true,
          'shopDetail.address': true,
          'shopDetail.rating': true
        })
        .skip(skip)
        .limit(size)
        .get();
      
      return {
        errCode: 0,
        data: result.data,
        total: result.total
      };
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      return { errCode: 500, errMsg: '获取收藏列表失败: ' + error.message };
    }
  }
};