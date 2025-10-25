//钩子函数
function beforeRegister({
    userRecord,
    clientInfo
}= {}){
    if(!userRecord.nickname){
        userRecord.nickname = "匿名"+Math.random().toString(36).substring(2,8)
    }
    // if(userRecord.role){
    //     userRecord.role.push('user')
    // }else{
    //     userRecord.role = ['user']
    // }
    return userRecord
} 

module.exports = {
    beforeRegister
}