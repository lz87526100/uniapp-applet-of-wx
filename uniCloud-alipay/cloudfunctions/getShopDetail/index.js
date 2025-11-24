'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('🚀 开始获取店铺详情，ID:', event.shopId);
  
  try {
    const { shopId } = event;
    
    if (!shopId) {
      return {
        errCode: 400,
        errMsg: '店铺ID不能为空'
      };
    }
    
    // 查询单个店铺详情
    const res = await db.collection('shopDetail')
      .doc(shopId)
      .get();
    
    console.log('✅ 查询详情成功:', res.data);
    
    if (!res.data || res.data.length === 0) {
      return {
        errCode: 404,
        errMsg: '店铺不存在'
      };
    }
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: res.data[0]  // 返回单个店铺对象
    };
    
  } catch (error) {
    console.error('❌ 查询详情失败:', error);
    return {
      errCode: 500,
      errMsg: '获取失败: ' + error.message
    };
  }
};