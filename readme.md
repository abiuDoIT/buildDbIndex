## what to handle
build mongodb indexes by config file
## how to use
`npm install build-db-index`
```
async function build() {
    await setIndex({uri:"mongodb://127.0.0.1:27017",db:"test"},
    {
        offer:[
            {key:{offer_id:1,time:1}},
            {key:{ttl:1},options:{expireAfterSeconds:2600}}
        ],
        user:[{key:{userid:1},options:{unique:true}}]
    })
}

build().catch(console.error);
```
### excuted build(),the db 'test' will build the indexes of collection offer and user,
### and drop all indexes( of all collections defined in config) that not defined in config.
### If index exists(key and options are both same ),it will not take time to rebuild it.