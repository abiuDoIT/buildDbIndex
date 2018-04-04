import {MongoClient as mongodb, MongoClientOptions, IndexOptions} from 'mongodb';


export interface IMongoIndex {
    key: Record<string, number>;
    options?: IndexOptions;
}


export type IMongoIndexes = IMongoIndex[];
/**
 * {
 *     offer:[
 *          {key:{offer_id:1,time:-1}},
 *           {key:{ttl:1},options:{expireAfterSeconds:3600}}
 *       ],
 *       user:[{key:{username:1},options:{unique:true}}]
 *   }
 */
export type IConfig = Record<string, IMongoIndexes>;

export interface IConnectOpt {
    uri: string;
    db: string;
    options?: MongoClientOptions;
}

export async function setIndex(connectOpt: IConnectOpt, config: IConfig): Promise<any> {
    const conn = await mongodb.connect(connectOpt.uri, connectOpt.options);
    const db = conn.db(connectOpt.db);
    for (const col_name in config) {
        const col = db.collection(col_name);
        const indexes = config[col_name];
        for (const i in indexes) {
            const index = indexes[i];
            try {
                await col.createIndex(index.key, index.options);
                console.log(col.namespace, 'create index ', index.key, index.options || '');
            } catch (e) {
                if (e.code === 85) {
                    const exit_name = (e.message.match(/name\:\s+.+?name\:\s+"(.+?)",/) || e.message.match(/name\:\s+(.+?)\s/))[1];
                    await col.dropIndex(exit_name);
                    console.log(col.namespace, 'drop exit index with conflict ', exit_name);
                    await col.createIndex(index.key, index.options);
                    console.log(col.namespace, 'recreate index ', index.key, index.options);
                } else {
                    throw e;
                }
            }
        }
        const exit_indexes = await col.indexes();
        const all_index_key = indexes.map((data) => JSON.stringify(data.key));
        const to_drop_indexes = exit_indexes.filter(function(index: {key: number, name: string}) {
            if (all_index_key.indexOf(JSON.stringify(index.key)) === -1 && index.name !== '_id_') {
                return true;
            } else {
                return false;
            }
        });
        for (const i in to_drop_indexes) {
            const index = to_drop_indexes[i];
            await col.dropIndex(index.name);
            console.log(col.namespace, 'drop index useless', index);
        }
    }
    await conn.close();

}

