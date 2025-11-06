//用在用户删除中
export function isPermission(userid){
    const {uid=""} = uniCloud.getCurrentUserInfo();
    if(uid == userid){
        return true
    }else{
        return false
    }
}