import {MongoClient as mongodb,MongoClientOptions,IndexOptions} from 'mongodb'


export interface IMongoIndex{
    key:Record<string,number>;
    options?:IndexOptions;
}


export type IMongoIndexes = IMongoIndex[];
/**
 * {
        offer:[
            {key:{offer_id:1,time:-1}},
            {key:{ttl:1},options:{expireAfterSeconds:3600}}
        ],
        user:[{key:{username:1},options:{unique:true}}]
    }
 */
export type IConfig = Record<string,IMongoIndexes>;

export interface IConnectOpt{
    uri:string;
    db:string;
    options?:MongoClientOptions
}

export async function setIndex(connectOpt:IConnectOpt,config:IConfig):Promise<any> {
    let conn = await mongodb.connect(connectOpt.uri,connectOpt.options);
    let db = conn.db(connectOpt.db);
    for(let col_name in config){
        let col = db.collection(col_name);
        let indexes = config[col_name];
        for(let i in indexes){
            let index = indexes[i];
            try{
                await col.createIndex(index.key,index.options)
                console.log(col.namespace,"create index ",index.key,index.options||'')            
            }catch(e){
                if(e.code ==85){
                    let exit_name = (e.message.match(/name\:\s+.+?name\:\s+"(.+?)",/)||e.message.match(/name\:\s+(.+?)\s/))[1];
                    await col.dropIndex(exit_name)
                    console.log(col.namespace,"drop exit index with conflict ",exit_name)
                    await col.createIndex(index.key,index.options) 
                    console.log(col.namespace,"recreate index ",index.key,index.options)
                }
                else 
                    throw e
            }
        }
        let exit_indexes = await col.indexes();
        let all_index_key = indexes.map(data=>JSON.stringify(data.key))
        let to_drop_indexes = exit_indexes.filter(function(index:{key:number,name:string}){
            if(all_index_key.indexOf(JSON.stringify(index.key))==-1 && index.name!='_id_'){
                return true;
            }else{
                return false;
            }
        })
        for(let i in to_drop_indexes){
            let index = to_drop_indexes[i];
            await col.dropIndex(index.name)
            console.log(col.namespace,"drop index useless",index)
        }
    }
    await conn.close();
    
}

