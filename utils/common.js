//用在用户删除中
export function isPermission(userid){
    const {uid=""} = uniCloud.getCurrentUserInfo();
    if(uid == userid){
        return true
    }else{
        return false
    }
}

// 状态格式化函数
export const stateFormat = (status) => {
    const statusMap = {
        0: '草稿',
        1: '已发布',
        2: '审核中',
        3: '审核失败',
        4: '已删除'
    }
    return statusMap[status] || '未知状态'
}

// 其他工具函数...
export const formatTime = (timestamp) => {
    // 时间格式化逻辑
}