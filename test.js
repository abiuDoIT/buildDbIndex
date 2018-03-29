const mongodb = require('mongodb').MongoClient;
const setIndex = require('./dist').setIndex;

const opt = {

}

async function run() {
    await setIndex({uri:"mongodb://127.0.0.1:27017",db:"test"},
    {
        offer:[
            {key:{offer_id:1,time:1}},
            {key:{ttl:1},options:{expireAfterSeconds:2600}}
        ],
        user:[{key:{userid:1},options:{unique:true}}]
    })
}

run().catch(console.error);