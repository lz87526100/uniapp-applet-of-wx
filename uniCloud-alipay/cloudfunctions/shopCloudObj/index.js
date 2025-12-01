'use strict';
const db = uniCloud.database();

// 高德地图API配置
const AMAP_CONFIG = {
  // 网页服务密钥
  WEB_KEY: 'becc8508eddef29e75d2b60ec9690cdd',
  // 微信小程序密钥
  WX_KEY: '2594bf79afe9fdd07f6ebc766d914c41',
  // 逆地理编码API
  REVERSE_GEOCODE_URL: 'https://restapi.amap.com/v3/geocode/regeo'
};

exports.main = async (event, context) => {
  console.log('🚀 shopCloudObj 开始处理请求，事件:', event);
  
  const { action, data = {} } = event;
  
  try {
    switch (action) {
      case 'getNearbyShops':
        return await getNearbyShops(data, db);
      case 'getAllShops':
        return await getAllShops(data, db);
      case 'getShopDetail':
        return await getShopDetail(data, db);
      case 'reverseGeocode':
        return await reverseGeocode(data);
      case 'toggleFavorite':
        return await toggleFavorite(data, context, db);
      case 'getFavoriteStatus':
        return await getFavoriteStatus(data, context, db);
      case 'getFavoriteList':
        return await getFavoriteList(data, context, db);
      case 'getFavoriteCount':
        return await getFavoriteCount(data, db);
      default:
        return {
          errCode: 400,
          errMsg: '未知的操作类型: ' + action
        };
    }
  } catch (error) {
    console.error('❌ 云对象执行失败:', error);
    return {
      errCode: 500,
      errMsg: '服务器内部错误: ' + error.message
    };
  }
};

// 获取附近店铺
async function getNearbyShops(data, db) {
  const { latitude, longitude, keyword, maxDistance = 10 } = data;
  
  console.log('📍 查询附近店铺:', { latitude, longitude, keyword, maxDistance });
  
  try {
    let query = db.collection('shopDetail');
    
    // 如果有关键词，添加搜索条件
    if (keyword && keyword.trim()) {
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
      .get();
    
    console.log('✅ 查询到店铺数量:', res.data.length);
    
    // 计算距离并过滤
    let shops = res.data.map(shop => {
      let distance = null;
      
      // 计算距离（如果店铺有位置信息）
      if (shop.location && shop.location.coordinates && latitude && longitude) {
        const [shopLng, shopLat] = shop.location.coordinates;
        distance = calculateDistance(latitude, longitude, shopLat, shopLng);
      }
      
      return {
        _id: shop._id,
        shopName: shop.shopName,
        shopPic: shop.shopPic,
        address: shop.address,
        rating: shop.rating,
        monthlyOrders: shop.monthlyOrders,
        businessHours: shop.businessHours,
        description: shop.description,
        phone: shop.phone,
        distance: distance ? distance.toFixed(2) : null,
        location: shop.location
      };
    });
    
    // 过滤距离（maxDistance公里内）
    shops = shops.filter(shop => {
      if (!shop.distance) return true; // 没有距离信息的也显示
      return parseFloat(shop.distance) <= maxDistance;
    });
    
    // 按距离排序
    shops.sort((a, b) => {
      const distA = a.distance ? parseFloat(a.distance) : 999;
      const distB = b.distance ? parseFloat(b.distance) : 999;
      return distA - distB;
    });
    
    console.log('📍 附近店铺数量:', shops.length);
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: shops
    };
    
  } catch (error) {
    console.error('❌ 获取附近店铺失败:', error);
    return {
      errCode: 500,
      errMsg: '获取附近店铺失败: ' + error.message,
      data: []
    };
  }
}

// 获取所有店铺（支持随机和关键词搜索）
async function getAllShops(data, db) {
  const { keyword, limit, random = false } = data;
  
  console.log('🏪 获取店铺列表:', { keyword, limit, random });
  
  try {
    let query = db.collection('shopDetail');
    
    if (keyword && keyword.trim()) {
      query = query.where({
        shopName: new RegExp(keyword, 'i')
      });
    }
    
    // 如果有数量限制，设置limit
    if (limit) {
      query = query.limit(limit);
    } else {
      query = query.limit(100);
    }
    
    // 如果是随机模式，先获取总数再随机跳过
    let finalQuery = query;
    if (random && !keyword) {
      const countRes = await db.collection('shopDetail').count();
      const total = countRes.total;
      
      if (total > 0) {
        const randomOffset = Math.floor(Math.random() * Math.max(0, total - (limit || 3)));
        finalQuery = query.skip(randomOffset);
        console.log(`🎲 随机模式 - 总数: ${total}, 跳过: ${randomOffset}`);
      }
    }
    
    const res = await finalQuery
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
    
    console.log('✅ 获取店铺列表成功，数量:', res.data.length);
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: res.data
    };
    
  } catch (error) {
    console.error('❌ 获取店铺列表失败:', error);
    return {
      errCode: 500,
      errMsg: '获取店铺列表失败: ' + error.message,
      data: []
    };
  }
}
// 获取店铺详情
async function getShopDetail(data, db) {
  const { shopId } = data;
  
  if (!shopId) {
    return {
      errCode: 400,
      errMsg: '店铺ID不能为空'
    };
  }
  
  console.log('🔍 获取店铺详情:', shopId);
  
  try {
    const res = await db.collection('shopDetail')
      .doc(shopId)
      .get();
    
    if (!res.data || res.data.length === 0) {
      return {
        errCode: 404,
        errMsg: '店铺不存在'
      };
    }
    
    const shop = res.data[0];
    console.log('✅ 获取店铺详情成功:', shop.shopName);
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: shop
    };
    
  } catch (error) {
    console.error('❌ 获取店铺详情失败:', error);
    return {
      errCode: 500,
      errMsg: '获取店铺详情失败: ' + error.message
    };
  }
}

// 逆地理编码 - 使用高德地图API
async function reverseGeocode(data) {
  const { latitude, longitude } = data;
  
  console.log('🗺️ 逆地理编码:', { latitude, longitude });
  
  if (!latitude || !longitude) {
    return {
      errCode: 400,
      errMsg: '经纬度不能为空'
    };
  }
  
  try {
    // 使用高德地图逆地理编码API
    // 注意：高德地图使用的是GCJ-02坐标系，与uni.getLocation返回的坐标系一致
    const result = await uniCloud.httpclient.request(
      `${AMAP_CONFIG.REVERSE_GEOCODE_URL}?key=${AMAP_CONFIG.WEB_KEY}&location=${longitude},${latitude}&extensions=base&output=JSON`,
      {
        method: 'GET',
        dataType: 'json',
        timeout: 5000
      }
    );
    
    console.log('🗺️ 高德地图API响应:', result);
    
    if (result.status === 200 && result.data) {
      const amapData = result.data;
      
      if (amapData.status === '1' && amapData.regeocode) {
        const addressComponent = amapData.regeocode.addressComponent;
        const formattedAddress = amapData.regeocode.formatted_address;
        
        // 构建详细地址信息
        const addressInfo = {
          // 完整地址
          formattedAddress: formattedAddress,
          // 省份
          province: addressComponent.province,
          // 城市
          city: addressComponent.city || addressComponent.province,
          // 区县
          district: addressComponent.district,
          // 乡镇
          township: addressComponent.township,
          // 详细地址
          street: addressComponent.streetNumber?.street || '',
          // 门牌号
          number: addressComponent.streetNumber?.number || ''
        };
        
        // 构建显示地址
        let displayAddress = '';
        if (addressComponent.city && addressComponent.city !== addressComponent.province) {
          displayAddress = `${addressComponent.province}${addressComponent.city}${addressComponent.district}`;
        } else {
          displayAddress = `${addressComponent.province}${addressComponent.district}`;
        }
        
        if (addressComponent.township) {
          displayAddress += addressComponent.township;
        }
        
        console.log('✅ 逆地理编码成功:', displayAddress);
        
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: {
            address: displayAddress,
            detail: addressInfo,
            fullAddress: formattedAddress
          }
        };
      } else {
        console.error('❌ 高德地图API返回错误:', amapData.info);
        return {
          errCode: 500,
          errMsg: `地址解析失败: ${amapData.info || '未知错误'}`,
          data: {
            address: `福建省泉州市南安市（纬度:${latitude.toFixed(4)}, 经度:${longitude.toFixed(4)}）`
          }
        };
      }
    } else {
      console.error('❌ 高德地图API请求失败:', result.status);
      return {
        errCode: 500,
        errMsg: '地图服务请求失败',
        data: {
          address: `福建省泉州市南安市（纬度:${latitude.toFixed(4)}, 经度:${longitude.toFixed(4)}）`
        }
      };
    }
    
  } catch (error) {
    console.error('❌ 逆地理编码失败:', error);
    
    // 失败时返回默认地址（根据您提供的店铺地址推断）
    return {
      errCode: 0, // 即使失败也返回成功，使用默认地址
      errMsg: '使用默认地址',
      data: {
        address: `福建省泉州市南安市（纬度:${latitude.toFixed(4)}, 经度:${longitude.toFixed(4)}）`,
        detail: {
          province: '福建省',
          city: '泉州市',
          district: '南安市'
        }
      }
    };
  }
}

// 搜索周边POI（可选功能）
async function searchPoi(data) {
  const { latitude, longitude, keyword = '美食', radius = 5000 } = data;
  
  console.log('🔍 搜索周边POI:', { latitude, longitude, keyword, radius });
  
  try {
    // 高德地图周边搜索API
    const result = await uniCloud.httpclient.request(
      `https://restapi.amap.com/v3/place/around?key=${AMAP_CONFIG.WEB_KEY}&location=${longitude},${latitude}&keywords=${encodeURIComponent(keyword)}&radius=${radius}&output=JSON`,
      {
        method: 'GET',
        dataType: 'json',
        timeout: 5000
      }
    );
    
    if (result.status === 200 && result.data && result.data.status === '1') {
      console.log('✅ POI搜索成功，数量:', result.data.pois.length);
      
      return {
        errCode: 0,
        errMsg: '搜索成功',
        data: result.data.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          location: {
            latitude: parseFloat(poi.location.split(',')[1]),
            longitude: parseFloat(poi.location.split(',')[0])
          },
          distance: parseInt(poi.distance),
          type: poi.type
        }))
      };
    } else {
      console.error('❌ POI搜索失败:', result.data?.info);
      return {
        errCode: 500,
        errMsg: `POI搜索失败: ${result.data?.info || '未知错误'}`
      };
    }
    
  } catch (error) {
    console.error('❌ POI搜索异常:', error);
    return {
      errCode: 500,
      errMsg: 'POI搜索异常: ' + error.message
    };
  }
}

// 切换收藏状态
async function toggleFavorite(data, context, db) {
  const { shopId } = data;
  const userId = getUserId(context);
  
  if (!userId) {
    return {
      errCode: 1001,
      errMsg: '用户未登录，请先登录'
    };
  }
  
  if (!shopId) {
    return {
      errCode: 400,
      errMsg: '店铺ID不能为空'
    };
  }
  
  console.log(`❤️ 切换收藏状态 - 用户: ${userId}, 店铺: ${shopId}`);
  
  try {
    const favoriteCollection = db.collection('shopFavorites');
    
    // 检查是否已收藏
    const existingFavorite = await favoriteCollection
      .where({
        user_id: userId,
        shop_id: shopId
      })
      .get();
    
    let isFavorite;
    
    if (existingFavorite.data.length > 0) {
      // 取消收藏
      await favoriteCollection
        .where({
          user_id: userId,
          shop_id: shopId
        })
        .remove();
      
      isFavorite = false;
      console.log('✅ 取消收藏成功');
    } else {
      // 添加收藏
      await favoriteCollection.add({
        user_id: userId,
        shop_id: shopId,
        status: 1,
        created_at: Date.now()
      });
      
      isFavorite = true;
      console.log('✅ 添加收藏成功');
    }
    
    return {
      errCode: 0,
      errMsg: '操作成功',
      data: { isFavorite }
    };
    
  } catch (error) {
    console.error('❌ 切换收藏状态失败:', error);
    return {
      errCode: 500,
      errMsg: '操作失败: ' + error.message
    };
  }
}

// 获取收藏状态
async function getFavoriteStatus(data, context, db) {
  const { shopId } = data;
  const userId = getUserId(context);
  
  if (!userId) {
    return {
      errCode: 0,
      errMsg: '用户未登录',
      data: { isFavorite: false }
    };
  }
  
  console.log(`🔍 获取收藏状态 - 用户: ${userId}, 店铺: ${shopId}`);
  
  try {
    const favoriteCollection = db.collection('shopFavorites');
    const res = await favoriteCollection
      .where({
        user_id: userId,
        shop_id: shopId
      })
      .get();

    const isFavorite = res.data.length > 0;
    console.log(`🎯 收藏状态: ${isFavorite}`);

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: { isFavorite }
    };
  } catch (error) {
    console.error('❌ 获取收藏状态失败:', error);
    return {
      errCode: 500,
      errMsg: '获取收藏状态失败: ' + error.message
    };
  }
}

// 获取收藏列表
async function getFavoriteList(data, context, db) {
  const { page = 1, size = 10 } = data;
  const userId = getUserId(context);
  
  if (!userId) {
    return {
      errCode: 1001,
      errMsg: '用户未登录'
    };
  }
  
  const offset = (page - 1) * size;
  console.log(`📋 获取收藏列表 - 用户: ${userId}, 页码: ${page}, 大小: ${size}`);

  try {
    const favoriteCollection = db.collection('shopFavorites');
    const shopCollection = db.collection('shopDetail');

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

    console.log('📊 收藏列表查询结果数量:', favoriteRes.data.length);

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
      errCode: 500,
      errMsg: '获取收藏列表失败: ' + error.message
    };
  }
}

// 获取店铺收藏数量
async function getFavoriteCount(data, db) {
  const { shopId } = data;
  
  console.log(`📊 获取店铺收藏数量 - 店铺: ${shopId}`);
  
  try {
    const favoriteCollection = db.collection('shopFavorites');
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
      errCode: 500,
      errMsg: '获取收藏数量失败: ' + error.message
    };
  }
}

// 计算两个坐标点之间的距离（公里）
function calculateDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const a = radLat1 - radLat2;
  const b = (lng1 * Math.PI) / 180 - (lng2 * Math.PI) / 180;
  
  let s = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
    )
  );
  
  s = s * 6378.137; // 地球半径（公里）
  s = Math.round(s * 10000) / 10000;
  
  return s;
}

// 获取用户ID
function getUserId(context) {
  if (context.uniIdToken && context.uniIdToken.uid) {
    return context.uniIdToken.uid;
  }
  if (context.OPENID) {
    return context.OPENID;
  }
  return null;
}

// 获取随机店铺
async function getRandomShops(data, db) {
  const { limit = 3 } = data;
  
  console.log(`🎲 获取随机店铺，数量: ${limit}`);
  
  try {
    // 获取店铺总数
    const countRes = await db.collection('shopDetail').count();
    const total = countRes.total;
    
    console.log(`📊 店铺总数: ${total}`);
    
    if (total === 0) {
      return {
        errCode: 0,
        errMsg: '获取成功',
        data: []
      };
    }
    
    // 生成随机偏移量
    const randomOffset = Math.floor(Math.random() * Math.max(0, total - limit));
    
    console.log(`🎯 随机偏移量: ${randomOffset}`);
    
    // 随机获取店铺
    const res = await db.collection('shopDetail')
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
      .skip(randomOffset)
      .limit(limit)
      .get();
    
    console.log(`✅ 获取随机店铺成功，数量: ${res.data.length}`);
    
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: res.data
    };
    
  } catch (error) {
    console.error('❌ 获取随机店铺失败:', error);
    return {
      errCode: 500,
      errMsg: '获取随机店铺失败: ' + error.message,
      data: []
    };
  }
}