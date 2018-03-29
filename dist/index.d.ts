import { MongoClientOptions, IndexOptions } from 'mongodb';
export interface IMongoIndex {
    key: Record<string, number>;
    options?: IndexOptions;
}
export declare type IMongoIndexes = IMongoIndex[];
/**
 * {
        offer:[
            {key:{offer_id:1,time:-1}},
            {key:{ttl:1},options:{expireAfterSeconds:3600}}
        ],
        user:[{key:{username:1},options:{unique:true}}]
    }
 */
export declare type IConfig = Record<string, IMongoIndexes>;
export interface IConnectOpt {
    uri: string;
    db: string;
    options?: MongoClientOptions;
}
export declare function setIndex(connectOpt: IConnectOpt, config: IConfig): Promise<any>;
