'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('🚀 开始处理请求，事件:', event);
  console.log('🔑 上下文:', {
    APPID: context.APPID,
    OPENID: context.OPENID,
    uniIdToken: context.uniIdToken,
    APP_PLATFORM: context.APP_PLATFORM
  });
  
  try {
    const { 
      keyword = '',
      action, // 操作类型
      data = {} // 操作数据
    } = event;
    
    // 获取用户ID - 多种方式尝试
    let userId = null;
    
    // 方式1: 从 uniIdToken 获取
    if (context.uniIdToken && context.uniIdToken.uid) {
      userId = context.uniIdToken.uid;
      console.log('✅ 从 uniIdToken 获取用户ID:', userId);
    }
    // 方式2: 从 OPENID 获取（微信小程序）
    else if (context.OPENID) {
      userId = context.OPENID;
      console.log('✅ 从 OPENID 获取用户ID:', userId);
    }
    // 方式3: 手动解析 token（备选方案）
    else {
      console.log('❌ 无法自动获取用户ID，尝试手动解析');
      // 这里可以添加手动解析 token 的逻辑
    }
    
    console.log('👤 最终用户ID:', userId);

    // 如果是收藏相关操作
    if (action) {
      return await handleFavoriteAction(action, data, userId, context);
    }
    
    // 原有的获取店铺列表逻辑
    return await getShopList(keyword, userId);
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
    return {
      errCode: 500,
      errMsg: '操作失败: ' + error.message,
      data: null
    };
  }
};

// 其他函数保持不变...

// 处理收藏相关操作
async function handleFavoriteAction(action, data, userId, context) {
  // 使用正确的表名 shopFavorites
  const favoriteCollection = db.collection('shopFavorites');
  const shopCollection = db.collection('shopDetail');

  console.log(`🔄 处理收藏操作: ${action}`, data);
  console.log('👤 操作用户ID:', userId);

  // 检查用户登录状态
  if (!userId) {
    console.log('❌ 用户未登录，无法进行收藏操作');
    return {
      errCode: 1001,
      errMsg: '用户未登录，请先登录',
      data: null
    };
  }

  switch (action) {
    case 'toggleFavorite':
      return await toggleFavorite(userId, data.shopId, favoriteCollection, shopCollection);
    case 'getFavoriteStatus':
      return await getFavoriteStatus(userId, data.shopId, favoriteCollection);
    case 'getFavoriteList':
      return await getFavoriteList(userId, data, favoriteCollection, shopCollection);
    case 'getFavoriteCount':
      return await getFavoriteCount(data.shopId, favoriteCollection);
    default:
      return {
        errCode: 1002,
        errMsg: '未知操作类型',
        data: null
      };
  }
}

async function toggleFavorite() {
  if (!shopInfo.value) return;
  
  try {
    console.log('🔄 切换收藏状态，店铺ID:', shopInfo.value._id);
    
    // 调用云函数切换收藏状态
    const result = await uniCloud.callFunction({
      name: 'getShopList', // 使用您的云函数名称
      data: {
        action: 'toggleFavorite', // 指定操作类型
        data: {
          shopId: shopInfo.value._id // 传递店铺ID
        }
      }
    });
    
    console.log('📡 收藏操作响应:', result);
    
    if (result.result.errCode === 0) {
      // 更新收藏状态
      isFavorite.value = result.result.data.isFavorite;
      
      // 显示操作结果
      if (isFavorite.value) {
        uni.showToast({ 
          title: '收藏成功', 
          icon: 'success',
          duration: 1500
        });
      } else {
        uni.showToast({ 
          title: '已取消收藏', 
          icon: 'success',
          duration: 1500
        });
      }
      
      // 更新本地存储
      updateLocalFavorites();
      
    } else {
      // 处理错误情况
      let errorMsg = result.result.errMsg || '操作失败';
      
      // 如果是未登录错误，提示用户登录
      if (result.result.errCode === 1001) {
        errorMsg = '请先登录后再收藏';
        
        // 可以跳转到登录页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
      }
      
      uni.showToast({ 
        title: errorMsg, 
        icon: 'none',
        duration: 2000
      });
    }
    
  } catch (error) {
    console.error('❌ 收藏操作失败:', error);
    uni.showToast({ 
      title: '网络错误，请重试', 
      icon: 'none',
      duration: 2000
    });
  }
}

// 更新本地收藏状态
function updateLocalFavorites() {
  const favorites = uni.getStorageSync('favoriteShops') || [];
  
  if (isFavorite.value) {
    // 添加到收藏
    if (!favorites.includes(shopInfo.value._id)) {
      favorites.push(shopInfo.value._id);
      console.log('✅ 添加到本地收藏');
    }
  } else {
    // 取消收藏
    const index = favorites.indexOf(shopInfo.value._id);
    if (index > -1) {
      favorites.splice(index, 1);
      console.log('✅ 从本地收藏移除');
    }
  }
  
  uni.setStorageSync('favoriteShops', favorites);
}

// 在页面加载时检查收藏状态
async function checkFavoriteStatus(id) {
  try {
    // 先检查本地存储
    const favorites = uni.getStorageSync('favoriteShops') || [];
    isFavorite.value = favorites.includes(id);
    
    // 再从服务器获取准确的收藏状态
    const result = await uniCloud.callFunction({
      name: 'getShopList',
      data: {
        action: 'getFavoriteStatus',
        data: {
          shopId: id
        }
      }
    });
    
    console.log('🔍 服务器收藏状态:', result);
    
    if (result.result.errCode === 0) {
      isFavorite.value = result.result.data.isFavorite;
      console.log('🎯 最终收藏状态:', isFavorite.value);
      
      // 同步本地存储
      updateLocalFavorites();
    } else {
      console.warn('⚠️ 获取服务器收藏状态失败，使用本地状态');
    }
    
  } catch (error) {
    console.error('❌ 检查收藏状态失败:', error);
    // 失败时使用本地存储状态
  }
}
// 获取收藏状态
async function getFavoriteStatus(userId, shopId, favoriteCollection) {
  console.log(`🔍 获取收藏状态 - 用户: ${userId}, 店铺: ${shopId}`);
  
  try {
    const res = await favoriteCollection
      .where({
        user_id: userId,
        shop_id: shopId
      })
      .get();

    console.log('📊 收藏状态查询结果:', res);

    const isFavorite = res.data.length > 0;
    console.log(`🎯 收藏状态: ${isFavorite}`);

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: {
        isFavorite: isFavorite,
        favoriteInfo: res.data[0] || null,
        queryCount: res.data.length
      }
    };
  } catch (error) {
    console.error('❌ 获取收藏状态失败:', error);
    return {
      errCode: 1007,
      errMsg: '获取收藏状态失败: ' + error.message,
      data: null
    };
  }
}

// 获取收藏列表
async function getFavoriteList(userId, data = {}, favoriteCollection, shopCollection) {
  const { page = 1, size = 10 } = data;
  const offset = (page - 1) * size;

  console.log(`📋 获取收藏列表 - 用户: ${userId}, 页码: ${page}, 大小: ${size}`);

  try {
    // 联表查询获取完整的店铺信息
    const favoriteRes = await favoriteCollection
      .aggregate()
      .match({
        user_id: userId,
        status: 1
      })
      .sort({
        created_at: -1
      })
      .skip(offset)
      .limit(size)
      .lookup({
        from: 'shopDetail',
        localField: 'shop_id',
        foreignField: '_id',
        as: 'shopInfo'
      })
      .end();

    console.log('📊 收藏列表查询结果:', favoriteRes);

    // 处理查询结果
    const favorites = favoriteRes.data.map(item => {
      const shop = item.shopInfo[0] || {};
      return {
        favoriteId: item._id,
        createdAt: item.created_at,
        shopInfo: {
          _id: shop._id,
          shopName: shop.shopName,
          shopPic: shop.shopPic,
          rating: shop.rating,
          monthlyOrders: shop.monthlyOrders,
          deliveryTime: shop.deliveryTime,
          deliveryFee: shop.deliveryFee,
          address: shop.address,
          businessHours: shop.businessHours,
          description: shop.description,
          phone: shop.phone,
          location: shop.location
        }
      };
    });

    // 获取总数
    const countRes = await favoriteCollection
      .where({
        user_id: userId,
        status: 1
      })
      .count();

    console.log(`📈 收藏总数: ${countRes.total}`);

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: {
        list: favorites,
        total: countRes.total,
        page,
        size,
        hasMore: favorites.length >= size
      }
    };
  } catch (error) {
    console.error('❌ 获取收藏列表失败:', error);
    return {
      errCode: 1008,
      errMsg: '获取收藏列表失败: ' + error.message,
      data: null
    };
  }
}

// 获取店铺收藏数量
async function getFavoriteCount(shopId, favoriteCollection) {
  console.log(`📊 获取店铺收藏数量 - 店铺: ${shopId}`);
  
  try {
    const res = await favoriteCollection
      .where({
        shop_id: shopId,
        status: 1
      })
      .count();

    console.log(`🎯 店铺收藏数量: ${res.total}`);

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: {
        favoriteCount: res.total
      }
    };
  } catch (error) {
    console.error('❌ 获取收藏数量失败:', error);
    return {
      errCode: 1009,
      errMsg: '获取收藏数量失败: ' + error.message,
      data: null
    };
  }
}

// 原有的获取店铺列表函数
async function getShopList(keyword, userId) {
  console.log(`🏪 获取店铺列表 - 关键词: "${keyword}", 用户: ${userId}`);
  
  try {
    // 构建查询条件
    let query = db.collection('shopDetail');
    
    // 如果有搜索关键词
    if (keyword.trim()) {
      query = query.where({
        shopName: new RegExp(keyword, 'i')
      });
    }
    
    // 执行查询
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
    
    console.log('✅ 店铺查询成功，数据条数:', res.data.length);
    
    // 如果用户已登录，获取收藏状态
    let favoriteShops = [];
    if (userId) {
      try {
        const favoriteCollection = db.collection('shopFavorites');
        const favoriteRes = await favoriteCollection
          .where({
            user_id: userId,
            status: 1
          })
          .field({
            shop_id: true
          })
          .get();
        
        favoriteShops = favoriteRes.data.map(item => item.shop_id);
        console.log(`❤️ 用户收藏的店铺数量: ${favoriteShops.length}`);
      } catch (favoriteError) {
        console.warn('⚠️ 获取收藏状态失败:', favoriteError);
      }
    }
    
    // 转换数据结构
    const shops = res.data.map(shop => ({
      id: shop._id,
      name: shop.shopName,
      address: shop.address,
      latitude: shop.location?.coordinates[1] || 0,
      longitude: shop.location?.coordinates[0] || 0,
      rating: shop.rating ? (shop.rating / 10).toFixed(1) : '5.0',
      monthlySales: shop.monthlyOrders || 0,
      businessHours: shop.businessHours || '营业中',
      description: shop.description || '欢迎光临！',
      phone: shop.phone || '',
      shopPic: shop.shopPic || '',
      isFavorite: userId ? favoriteShops.includes(shop._id) : false
    }));
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: shops
    };
    
  } catch (error) {
    console.error('❌ 获取店铺列表失败:', error);
    return {
      errCode: 500,
      errMsg: '获取店铺列表失败: ' + error.message,
      data: null
    };
  }
}