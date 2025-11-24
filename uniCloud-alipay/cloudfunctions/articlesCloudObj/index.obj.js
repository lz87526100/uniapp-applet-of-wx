'use strict';
const dbJQL = uniCloud.databaseForJQL();

// 全局辅助方法：格式化时间（单独提取，避免this指向问题）
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
	_before: function () {
		// 通用预处理器
	},

    async getUserInfo() {
        try {
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });

            // 获取客户端信息
            const clientInfo = this.getClientInfo();
            console.log('客户端信息:', clientInfo);
            
            // 方法1：直接通过客户端信息中的uid查询
            if (clientInfo.uid) {
                console.log('通过UID查询用户:', clientInfo.uid);
                const userRes = await dbJQL.collection('uni-id-users')
                    .doc(clientInfo.uid)
                    .field('nickname,avatar_file')
                    .get();
                
                console.log('通过UID查询结果:', userRes);
                
                if (userRes.data) {
                    return {
                        errCode: 0,
                        data: userRes.data
                    };
                }
            }
            
            // 方法2：如果方法1失败，使用uni-id云对象
            try {
                console.log('尝试使用uni-id云对象');
                const uniIdCo = uniCloud.importObject('uni-id');
                const uniIdRes = await uniIdCo.getUserInfo();
                
                if (uniIdRes.errCode === 0) {
                    return {
                        errCode: 0,
                        data: {
                            nickname: uniIdRes.userInfo.nickname,
                            avatar_file: uniIdRes.userInfo.avatar_file
                        }
                    };
                }
            } catch (uniIdError) {
                console.error('uni-id云对象调用失败:', uniIdError);
            }
            
            // 方法3：最后尝试直接查询（仅限开发环境）
            console.log('尝试直接查询用户表');
            const db = uniCloud.database();
            const allUsers = await db.collection('uni-id-users')
                .field('nickname,avatar_file')
                .limit(10)
                .get();
                
            console.log('所有用户:', allUsers);
            
            if (allUsers.data && allUsers.data.length > 0) {
                // 这里需要找到当前登录的用户
                // 在实际项目中应该通过token或其他方式确定当前用户
                const currentUser = allUsers.data.find(user => user._id === clientInfo.uid) || allUsers.data[0];
                return {
                    errCode: 0,
                    data: currentUser
                };
            }
            
            return { errCode: 404, errMsg: '用户不存在' };
            
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return { errCode: 500, errMsg: '获取用户信息失败' };
        }
    },

    // 根据用户ID获取用户详细信息
    async getUserInfoById(userId) {
        try {
            if (!userId) {
                return { errCode: 400, errMsg: '用户ID不能为空' };
            }

            console.log('查询用户详细信息，用户ID:', userId);

            // 使用直接数据库查询
            const db = uniCloud.database();
            const userRes = await db.collection('uni-id-users')
                .doc(userId)
                .field({
                    _id: true,
                    nickname: true,
                    avatar_file: true,
                    register_date: true,
                    last_login_ip: true
                })
                .get();

            console.log('直接数据库查询结果:', JSON.stringify(userRes, null, 2));

            // 直接数据库查询的数据结构更简单
            if (userRes.data && userRes.data.length > 0) {
                const userData = userRes.data[0];
                console.log('找到用户数据:', userData);
                
                // 处理头像URL
                let avatarUrl = '';
                if (userData.avatar_file && userData.avatar_file.url) {
                    try {
                        const urlResult = await uniCloud.getTempFileURL({
                            fileList: [userData.avatar_file.url]
                        });
                        console.log('头像URL转换结果:', urlResult);
                        if (urlResult.fileList && urlResult.fileList[0] && urlResult.fileList[0].tempFileURL) {
                            avatarUrl = urlResult.fileList[0].tempFileURL;
                        }
                    } catch (urlError) {
                        console.error('头像URL转换失败:', urlError);
                    }
                }

                return {
                    errCode: 0,
                    data: {
                        ...userData,
                        avatar_url: avatarUrl
                    }
                };
            } else {
                console.log('未找到用户数据');
                return {
                    errCode: 404,
                    errMsg: '用户不存在'
                };
            }

        } catch (error) {
            console.error('获取用户信息失败:', error);
            return {
                errCode: 500,
                errMsg: '获取用户信息失败: ' + error.message
            };
        }
    },

    // 更新用户信息 - 简化版
    async updateUserInfo(updateData) {
        try {
            const { userId, nickname, avatarFile } = updateData;
            
            if (!userId) {
                return { errCode: 400, errMsg: '用户ID不能为空' };
            }

            const clientInfo = this.getClientInfo();
            
            console.log('=== 调试信息 ===');
            console.log('前端传递的userId:', userId);
            console.log('当前登录用户ID:', clientInfo.uid);
            console.log('两者是否相等:', userId === clientInfo.uid);
            console.log('clientInfo完整信息:', clientInfo);
            
            // 临时注释权限检查用于测试
            // if (userId !== clientInfo.uid) {
            //     return { 
            //         errCode: 403, 
            //         errMsg: '无权限更新其他用户信息' 
            //     };
            // }

            console.log('开始更新用户信息...');

            // 构建更新数据
            const updateFields = {};
            if (nickname !== undefined && nickname !== null) {
                updateFields.nickname = String(nickname).trim();
            }
            if (avatarFile !== undefined && avatarFile !== null) {
                updateFields.avatar_file = { url: String(avatarFile) };
            }

            if (Object.keys(updateFields).length === 0) {
                return { errCode: 400, errMsg: '没有要更新的字段' };
            }

            // 使用直接数据库更新
            const db = uniCloud.database();
            const updateRes = await db.collection('uni-id-users')
                .doc(userId)
                .update(updateFields);

            console.log('用户信息更新结果:', updateRes);

            if (updateRes.updated === 1) {
                return {
                    errCode: 0,
                    errMsg: '更新成功'
                };
            } else {
                return { 
                    errCode: 500, 
                    errMsg: '更新失败' 
                };
            }

        } catch (error) {
            console.error('更新用户信息失败:', error);
            return { 
                errCode: 500, 
                errMsg: '更新用户信息失败: ' + error.message 
            };
        }
    },

    async add(params = {}) {
        try {
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });

            console.log('📝 开始添加内容，参数:', params);
            console.log('🔍 shop_id 参数:', params.shop_id); // 调试shop_id

            // 构建基础数据
            const baseData = {
                content: params.content || '',
                pics: params.pics || [],
                publish_date: params.publish_date || Date.now(),
                user_id: this.getClientInfo().uid,
                // 确保shop_id正确赋值
                shop_id: params.shop_id || null,
                rating: params.rating || null
            };

            console.log('📦 最终保存的数据:', baseData);

            // 保存到数据库
            const result = await dbJQL.collection("demo-articles").add(baseData);

            console.log('✅ 保存成功:', result);

            return {
                errCode: 0,
                data: result,
                errMsg: '发布成功'
            };

        } catch (error) {
            console.error('❌ 发布失败:', error);
            return {
                errCode: 500,
                errMsg: '发布失败: ' + error.message
            };
        }
    },
  
    // 在云函数中修改 list 方法
    async list(params = {}) {
        const dbJQL = uniCloud.databaseForJQL({
            clientInfo: this.getClientInfo()
        });
        
        const { page = 1, size = 8 } = params; // 默认每页8条
        
        let articlesTemp = dbJQL.collection("demo-articles")
            .orderBy("publish_date desc")
            .getTemp();
        
        let userTemp = dbJQL.collection("uni-id-users")
            .field("_id,nickname,avatar_file")
            .getTemp();
        
        // 添加分页逻辑
        const offset = (page - 1) * size;
        
        const result = await dbJQL.collection(articlesTemp, userTemp)
            .skip(offset)
            .limit(size)
            .get();
        
        return {
            errCode: 0,
            data: result.data,
            total: result.affectedDocs // 或者使用 count 获取总数
        };
    },
    
    async remove(id){
        const dbJQL = uniCloud.databaseForJQL({
            clientInfo:this.getClientInfo()
        });
        return await dbJQL.collection("demo-articles").doc(id).remove(); 
    },
    
    async getDetail(id) {
        const dbJQL = uniCloud.databaseForJQL({
            clientInfo: this.getClientInfo()
        });
        
        const res = await dbJQL.collection('demo-articles,uni-id-users')
            .where(`_id == '${id}'`)
            .field('content,publish_date,pics,user_id{_id, nickname, avatar_file}')
            .get();
        
        return res.data && res.data.length > 0 
            ? { errCode: 0, data: res.data[0] }
            : { errCode: 1, errMsg: '文章不存在' };
    },
    
    // ========== 收藏功能相关方法 ==========
    // 调试方法：检查登录状态
    async debugLoginStatus() {
        const clientInfo = this.getClientInfo();
        console.log('🔍 完整的客户端信息:', JSON.stringify(clientInfo, null, 2));
        
        // 检查所有可能的用户ID字段
        const possibleFields = ['uid', 'userId', 'userID', 'openid', 'unionid'];
        const foundFields = {};
        
        possibleFields.forEach(field => {
            foundFields[field] = clientInfo[field];
        });
        
        console.log('🆔 用户ID字段检查:', foundFields);
        
        return {
            errCode: 0,
            data: {
                clientInfo: clientInfo,
                uid: clientInfo.uid,
                hasUniIdToken: !!clientInfo.uniIdToken,
                foundFields: foundFields
            }
        };
    },

    // 添加收藏 - 使用前端传递的用户ID
    async addFavorite(data) {
        try {
            const { articleId, userId } = data; // 接收前端传递的 userId
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });

            // 调试信息
            const clientInfo = this.getClientInfo();
            console.log('🔍 addFavorite - 调试信息:');
            console.log('📦 前端传递的数据:', { articleId, userId });
            console.log('🖥️ 客户端信息 clientInfo:', clientInfo);
            console.log('🆔 clientInfo.uid:', clientInfo.uid);

            if (!articleId) {
                return { errCode: 1, errMsg: '文章ID不能为空' };
            }

            if (!userId) {
                return { errCode: 401, errMsg: '用户ID不能为空' };
            }

            console.log('✅ 使用前端传递的用户ID:', userId);

            // 检查是否已收藏
            const existing = await dbJQL.collection('favorites')
                .where({
                    article_id: articleId,
                    user_id: userId
                })
                .get();

            console.log('📋 收藏检查结果:', existing);

            if (existing.data.length > 0) {
                return { errCode: 1, errMsg: '已收藏过该文章' };
            }

            // 添加收藏记录
            const result = await dbJQL.collection('favorites').add({
                article_id: articleId,
                user_id: userId,
                create_date: Date.now()
            });

            console.log('🎉 收藏成功:', result);
            return { errCode: 0, data: result, errMsg: '收藏成功' };

        } catch (error) {
            console.error('❌ 收藏失败:', error);
            return { errCode: 2, errMsg: '收藏失败: ' + error.message };
        }
    },

    // 取消收藏 - 同样使用前端传递的用户ID
    async removeFavorite(data) {
        try {
            const { articleId, userId } = data;
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });

            console.log('removeFavorite - 参数:', { articleId, userId });

            if (!articleId) {
                return { errCode: 1, errMsg: '文章ID不能为空' };
            }

            if (!userId) {
                return { errCode: 401, errMsg: '用户ID不能为空' };
            }

            const result = await dbJQL.collection('favorites')
                .where({
                    article_id: articleId,
                    user_id: userId
                })
                .remove();

            return { errCode: 0, data: result, errMsg: '取消收藏成功' };

        } catch (error) {
            console.error('取消收藏失败:', error);
            return { errCode: 2, errMsg: '取消收藏失败' };
        }
    },

    // 检查收藏状态 - 使用前端传递的用户ID
    async checkFavorite(data) {
        try {
            const { articleId, userId } = data;
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });

            console.log('checkFavorite - 参数:', { articleId, userId });

            if (!articleId) {
                return { errCode: 1, errMsg: '文章ID不能为空' };
            }

            if (!userId) {
                return { 
                    errCode: 0, 
                    data: { isFavorited: false } 
                };
            }

            const result = await dbJQL.collection('favorites')
                .where({
                    article_id: articleId,
                    user_id: userId
                })
                .get();

            return { 
                errCode: 0, 
                data: { isFavorited: result.data.length > 0 } 
            };

        } catch (error) {
            console.error('检查收藏状态失败:', error);
            return { errCode: 2, errMsg: '检查收藏状态失败' };
        }
    },

    // 批量检查收藏状态 - 修复版
    async batchCheckFavorites(data) {
        try {
            const { articleIds, userId } = data;
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });

            console.log('🔍 batchCheckFavorites - 参数:', { articleIds, userId });

            if (!articleIds || !Array.isArray(articleIds)) {
                return { errCode: 1, errMsg: '文章ID列表不能为空' };
            }

            // 用户未登录时返回所有未收藏
            if (!userId) {
                const statusMap = {};
                articleIds.forEach(articleId => {
                    statusMap[articleId] = false;
                });
                console.log('👤 用户未登录，返回默认未收藏状态');
                return { errCode: 0, data: statusMap };
            }

            console.log('🔍 开始查询收藏状态，文章数量:', articleIds.length);

            // 使用 JQL 查询收藏状态
            const result = await dbJQL.collection('favorites')
                .where({
                    article_id: dbJQL.command.in(articleIds),
                    user_id: userId
                })
                .get();

            console.log('📊 收藏查询结果:', result);

            // 创建收藏状态映射表
            const favoritesMap = {};
            if (result.data && result.data.length > 0) {
                result.data.forEach(item => {
                    favoritesMap[item.article_id] = true;
                });
            }

            // 为每个文章ID设置收藏状态
            const statusMap = {};
            articleIds.forEach(articleId => {
                statusMap[articleId] = !!favoritesMap[articleId];
            });

            console.log('🎯 最终收藏状态:', statusMap);
            return { 
                errCode: 0, 
                data: statusMap 
            };

        } catch (error) {
            console.error('❌ 批量检查收藏状态失败:', error);
            
            // 出错时返回默认未收藏状态
            const defaultStatus = {};
            if (data.articleIds && Array.isArray(data.articleIds)) {
                data.articleIds.forEach(articleId => {
                    defaultStatus[articleId] = false;
                });
            }
            return { 
                errCode: 0, 
                data: defaultStatus,
                errMsg: '检查失败，使用默认状态' 
            };
        }
    },

    // 获取收藏列表 - 详细调试版
    async getFavoritesList(data) {
        try {
            const { page = 1, size = 10, userId } = data;
            
            console.log('🔍 getFavoritesList - 开始执行');
            console.log('📦 前端传递的数据:', data);

            if (!userId) {
                return { errCode: 401, errMsg: '用户ID不能为空' };
            }

            const db = uniCloud.database();
            
            // 1. 查询收藏记录
            const favoritesRes = await db.collection('favorites')
                .where({
                    user_id: userId
                })
                .orderBy('create_date', 'desc')
                .get();

            console.log('📚 收藏记录查询结果:', favoritesRes);
            console.log('📚 收藏记录数量:', favoritesRes.data ? favoritesRes.data.length : 0);

            if (!favoritesRes.data || favoritesRes.data.length === 0) {
                return {
                    errCode: 0,
                    data: [],
                    total: 0
                };
            }

            // 2. 获取文章ID列表
            const articleIds = favoritesRes.data.map(item => item.article_id);
            console.log('📝 需要查询的文章ID:', articleIds);

            // 3. 逐个检查每个文章ID是否存在
            const articlesMap = {};
            
            for (let articleId of articleIds) {
                console.log(`🔍 正在查询文章: ${articleId}`);
                
                try {
                    const articleRes = await db.collection('demo-articles')
                        .doc(articleId)
                        .get();
                    
                    console.log(`📄 文章 ${articleId} 查询结果:`, articleRes);
                    
                    if (articleRes.data && articleRes.data.length > 0) {
                        articlesMap[articleId] = articleRes.data[0];
                        console.log(`✅ 找到文章: ${articleId} - 内容: ${articleRes.data[0].content}`);
                    } else {
                        console.log(`❌ 文章不存在: ${articleId}`);
                    }
                } catch (error) {
                    console.error(`🚫 查询文章 ${articleId} 失败:`, error);
                }
            }

            // 4. 批量查询作为备用方案
            console.log('🔄 开始批量查询文章...');
            const batchRes = await db.collection('demo-articles')
                .where({
                    _id: db.command.in(articleIds)
                })
                .get();
            
            console.log('📦 批量查询结果:', batchRes);
            console.log('📦 批量查询找到的文章数量:', batchRes.data ? batchRes.data.length : 0);

            // 合并查询结果
            if (batchRes.data) {
                batchRes.data.forEach(article => {
                    if (!articlesMap[article._id]) {
                        articlesMap[article._id] = article;
                        console.log(`✅ 通过批量查询找到文章: ${article._id}`);
                    }
                });
            }

            // 5. 组合数据
            const resultData = favoritesRes.data.map(favorite => {
                const article = articlesMap[favorite.article_id];
                if (article) {
                    return {
                        ...favorite,
                        article: article
                    };
                } else {
                    console.log(`🚫 最终确认文章不存在: ${favorite.article_id}`);
                    return {
                        ...favorite,
                        article: { 
                            _id: favorite.article_id,
                            content: '内容已删除',
                            publish_date: favorite.create_date
                        }
                    };
                }
            });

            console.log('🎯 最终返回数据:', resultData);

            return {
                errCode: 0,
                data: resultData,
                total: favoritesRes.affectedDocs || 0
            };

        } catch (error) {
            console.error('❌ 获取收藏列表失败:', error);
            return { 
                errCode: 500, 
                errMsg: '获取收藏列表失败: ' + error.message 
            };
        }
    },

    // 调试收藏功能
    async debugFavorites() {
        try {
            const clientInfo = this.getClientInfo();
            const db = uniCloud.database();
            
            console.log('🔍 调试收藏功能:');
            console.log('🖥️ ClientInfo:', clientInfo);
            console.log('🆔 UID:', clientInfo.uid);
            console.log('🔑 Token:', clientInfo.uniIdToken ? '存在' : '不存在');

            // 测试直接数据库查询
            const testUserId = '68fa178b2c5de7e572670bad';
            console.log('🧪 测试用户ID:', testUserId);
            
            const testRes = await db.collection('favorites')
                .where({
                    user_id: testUserId
                })
                .get();

            console.log('📊 测试查询结果:', testRes);

            return {
                errCode: 0,
                data: {
                    clientInfo: clientInfo,
                    testQuery: testRes,
                    message: '调试完成'
                }
            };
        } catch (error) {
            console.error('调试失败:', error);
            return {
                errCode: 500,
                errMsg: '调试失败: ' + error.message
            };
        }
    },

    // 在 articlesCloudObj 中添加
    async debugAuthStatus() {
        const clientInfo = this.getClientInfo();
        console.log('🔍 云函数认证状态调试:');
        console.log('🖥️ 完整clientInfo:', JSON.stringify(clientInfo, null, 2));
        console.log('🆔 uid:', clientInfo.uid);
        console.log('🔑 uniIdToken:', clientInfo.uniIdToken);
        console.log('📱 appId:', clientInfo.appId);
        
        // 尝试获取用户信息
        try {
            const dbJQL = uniCloud.databaseForJQL({
                clientInfo: this.getClientInfo()
            });
            
            if (clientInfo.uid) {
                const userRes = await dbJQL.collection('uni-id-users')
                    .doc(clientInfo.uid)
                    .field('_id,nickname')
                    .get();
                console.log('👤 用户查询结果:', userRes);
            }
        } catch (error) {
            console.error('用户查询失败:', error);
        }
        
        return {
            errCode: 0,
            data: {
                uid: clientInfo.uid,
                hasToken: !!clientInfo.uniIdToken,
                clientInfo: clientInfo
            }
        };
    },

    // 调试方法：直接测试文章查询
    async debugArticleQuery(articleId) {
      try {
        const db = uniCloud.database();
        console.log('🔍 调试文章查询:', articleId);
        
        const result = await db.collection('demo-articles')
          .doc(articleId)
          .get();
        
        console.log('📄 文章查询结果:', result);
        
        return {
          errCode: 0,
          data: result
        };
      } catch (error) {
        console.error('❌ 文章查询失败:', error);
        return {
          errCode: 500,
          errMsg: error.message
        };
      }
    },

async getShopReviews(params = {}) {
  try {
    const { shopId, page = 1, size = 10 } = params;
    
    console.log('🔍 查询店铺评论，参数:', { shopId, page, size });
    
    if (!shopId) {
      return { errCode: 400, errMsg: '店铺ID不能为空' };
    }

    const dbJQL = uniCloud.databaseForJQL({
      clientInfo: this.getClientInfo()
    });
    
    const offset = (page - 1) * size;
    
    console.log('📊 分页参数:', { offset, size });
    
    // 方法1：使用正确的JQL联表查询语法
    const result = await dbJQL.collection('demo-articles,uni-id-users')
      .where(`shop_id == '${shopId}'`)
      .field(`
        _id, 
        content, 
        rating, 
        pics, 
        publish_date,
        user_id{_id, nickname, avatar_file}
      `)
      .orderBy('publish_date desc')
      .skip(offset)
      .limit(size)
      .get();
    
    console.log('📄 查询结果:', result);
    console.log('👥 用户信息样例:', result.data && result.data[0] ? result.data[0].user_id : '无数据');
    
    // 获取评论总数
    const totalRes = await dbJQL.collection('demo-articles')
      .where(`shop_id == '${shopId}'`)
      .count();
    
    console.log('📈 评论总数:', totalRes.total);
    
    return {
      errCode: 0,
      data: result.data || [],
      total: totalRes.total || 0
    };
    
  } catch (error) {
    console.error('❌ 查询店铺评论失败:', error);
    return { 
      errCode: 500, 
      errMsg: '查询评论失败: ' + error.message
    };
  }
},
// ========== 用户文章统计方法 ==========

// 获取用户文章数量
async getUserArticlesCount(params = {}) {
  try {
    const { userId } = params;
    
    console.log('📊 获取用户文章数量，用户ID:', userId);
    
    if (!userId) {
      return { 
        errCode: 400, 
        errMsg: '用户ID不能为空' 
      };
    }

    const dbJQL = uniCloud.databaseForJQL({
      clientInfo: this.getClientInfo()
    });
    
    // 统计用户发布的文章数量
    const countRes = await dbJQL.collection('demo-articles')
      .where(`user_id == '${userId}'`)
      .count();
    
    console.log('📈 用户文章统计结果:', countRes);
    
    return {
      errCode: 0,
      data: countRes.total || 0
    };
    
  } catch (error) {
    console.error('❌ 获取用户文章数量失败:', error);
    return { 
      errCode: 500, 
      errMsg: '获取文章数量失败: ' + error.message
    };
  }
},

// 获取用户发布的文章列表
async getUserArticles(params = {}) {
  try {
    const { userId, page = 1, size = 10 } = params;
    
    console.log('📝 获取用户文章列表，参数:', { userId, page, size });
    
    if (!userId) {
      return { 
        errCode: 400, 
        errMsg: '用户ID不能为空' 
      };
    }

    const dbJQL = uniCloud.databaseForJQL({
      clientInfo: this.getClientInfo()
    });
    
    const offset = (page - 1) * size;
    
    let articlesTemp = dbJQL.collection("demo-articles")
      .where(`user_id == '${userId}'`)
      .orderBy("publish_date desc")
      .getTemp();
    
    let userTemp = dbJQL.collection("uni-id-users")
      .field("_id,nickname,avatar_file")
      .getTemp();
    
    const result = await dbJQL.collection(articlesTemp, userTemp)
      .skip(offset)
      .limit(size)
      .get();
    
    // 获取总数
    const totalRes = await dbJQL.collection('demo-articles')
      .where(`user_id == '${userId}'`)
      .count();
    
    return {
      errCode: 0,
      data: result.data || [],
      total: totalRes.total || 0
    };
    
  } catch (error) {
    console.error('❌ 获取用户文章列表失败:', error);
    return { 
      errCode: 500, 
      errMsg: '获取文章列表失败: ' + error.message
    };
  }
}
    
};