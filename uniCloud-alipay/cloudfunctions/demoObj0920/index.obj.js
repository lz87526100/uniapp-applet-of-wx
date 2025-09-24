//传统方式的数据库不进行数据校验
const db = uniCloud.database();
//JQL会进行数据校验
const dbJQL = uniCloud.databaseForJQL();
//数据库的操作符
const dbCmd = db.command;

module.exports = {
    //拦截器 页面加载前的预处理查询是否登录
	_before: function () { 	
        this.startTime = Date.now();
        this.params = {name:"张三"};
        //获取客户端信息接口  getClienInfo()为内置方法
        this.clientInfo= this.getClientInfo();  
         // 拦截
         if(false){
             throw new Error("没有权限查看")
         }
    },
	async getUser({size = 2} =params){
        // return typeof size;
        // 输出IP
        // console.log(this.clientInfo.clientIP);
        //格式转换 没看懂什么意思
        if (!isNaN(size)){
            size = Number(size)
        }else{
            return {errMsg:"参数格式有误，需要number类型"}
        }
        
        let res = await dbJQL.collection("demo-user").limit(size).get();
       return res; 
    },
    
    async addUser(params = {}){
        // return typeof like;
        let res = await dbJQL.collection('demo-user').add(params)
        return res;
        console.log(res);
    } ,
    
    async updateUser(id=""){
        // ？ 需要原数据才能进行修改
        // let res = await dbJQL.collection("demo-user").doc(id).update({
        //     like:["飞起"]
        // })
        // console.log(res);
        
        let res = await dbJQL.collection("demo-user").doc(id).update({
            //通过 db.command 在原数据追加数据
            like:dbCmd.push(["飞起"])
        })
        console.log(res);
    },
    
    async removeUser(id=""){
        let res = await dbJQL.collection("demo-user").doc(id).remove(); 
        console.log(res);
    },
    //随机用户数据生成
    async demo(){
        
        let username = "匿名" + Math.random().toString(36).substring(3,9);
        let rdage = Math.floor(Math.random() * ( 35 - 10 + 1))  + 10;
        let res = await dbJQL.collection("demo-user").add({
            name:username,
            age:rdage
        })
        
        return res;
    }
    ,
    //统一包装返回内容和格式
    _after(error,result){
        if(error){
            throw error
        }
        //统一输出内容
        // result.timeCost = Date.now() - this.startTime
        // result.author="测试"
        
        return result;
    },
    
    async _timing(){
        let username = "匿名" + Math.random().toString(36).substring(3,9);
        let rdage = Math.floor(Math.random() * ( 34 - 18 + 1))  + 18;
        let res = await dbJQL.collection("demo-user").add({
            name:username,
            age:rdage
        })
        
        return res;
    }
}
