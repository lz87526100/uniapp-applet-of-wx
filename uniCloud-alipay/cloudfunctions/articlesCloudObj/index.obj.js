const dbJQL = uniCloud.databaseForJQL();
module.exports = {
	_before: function () { // 通用预处理器
	},
    async add(params={}){
        const dbJQL =  uniCloud.databaseForJQL({
            clientInfo:this.getClientInfo()
        });
        return await dbJQL.collection("demo-articles").add(params);//异步等待
    },
    
    async list(){
    const dbJQL =  uniCloud.databaseForJQL({
            clientInfo:this.getClientInfo()
        });
        
        let articlesTemp =  dbJQL.collection("demo-articles").orderBy("publish_date desc").getTemp();//异步等待
        let userTemp =  dbJQL.collection("uni-id-users").field("_id,nickname").getTemp();//异步等待
        
        return dbJQL.collection(articlesTemp,userTemp).get();
        
    },
    
    async remove(id){
        const dbJQL =  uniCloud.databaseForJQL({
                clientInfo:this.getClientInfo()
            });
        return await dbJQL.collection("demo-articles").doc(id).remove(); 
    }
    
    
}