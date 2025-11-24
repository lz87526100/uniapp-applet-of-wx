'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('🚀 开始获取店铺列表');
  
  try {
    const { keyword = '' } = event;
    
    // 构建查询条件
    let query = db.collection('shopDetail');
    
    // 如果有搜索关键词
    if (keyword.trim()) {
      query = query.where({
        shopName: new RegExp(keyword, 'i')  // 不区分大小写搜索
      });
    }
    
    // 执行查询 - 按月销量降序排列
    const res = await query
      .field({
        _id: true,
        shopName: true,
        shopPic: true,
        phone: true,
        address: true,
        location: true,
        description: true,
        businessHours: true,
        rating: true,
        monthlyOrders: true
      })
      .orderBy('monthlyOrders', 'desc')
      .get();
    
    console.log('✅ 查询成功，数据条数:', res.data.length);
    
    // 转换数据结构，适配前端格式
    const shops = res.data.map(shop => ({
      id: shop._id,
      name: shop.shopName,
      address: shop.address,
      latitude: shop.location?.coordinates[1] || 0, // 纬度
      longitude: shop.location?.coordinates[0] || 0, // 经度
      rating: shop.rating ? (shop.rating / 10).toFixed(1) : '5.0', // 转换为小数评分
      monthlySales: shop.monthlyOrders || 0,
      businessHours: shop.businessHours || '营业中',
      description: shop.description || '欢迎光临！',
      phone: shop.phone || '',
      shopPic: shop.shopPic || ''
    }));
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: shops
    };
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
    return {
      errCode: 500,
      errMsg: '获取失败: ' + error.message
    };
  }
};