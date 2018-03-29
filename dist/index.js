"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
function setIndex(connectOpt, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn = yield mongodb_1.MongoClient.connect(connectOpt.uri, connectOpt.options);
        let db = conn.db(connectOpt.db);
        for (let col_name in config) {
            let col = db.collection(col_name);
            let indexes = config[col_name];
            for (let i in indexes) {
                let index = indexes[i];
                try {
                    yield col.createIndex(index.key, index.options);
                    console.log(col.namespace, "create index ", index.key, index.options || '');
                }
                catch (e) {
                    if (e.code == 85) {
                        let exit_name = (e.message.match(/name\:\s+.+?name\:\s+"(.+?)",/) || e.message.match(/name\:\s+(.+?)\s/))[1];
                        yield col.dropIndex(exit_name);
                        console.log(col.namespace, "drop exit index with conflict ", exit_name);
                        yield col.createIndex(index.key, index.options);
                        console.log(col.namespace, "recreate index ", index.key, index.options);
                    }
                    else
                        throw e;
                }
            }
            let exit_indexes = yield col.indexes();
            let all_index_key = indexes.map(data => JSON.stringify(data.key));
            let to_drop_indexes = exit_indexes.filter(function (index) {
                if (all_index_key.indexOf(JSON.stringify(index.key)) == -1 && index.name != '_id_') {
                    return true;
                }
                else {
                    return false;
                }
            });
            for (let i in to_drop_indexes) {
                let index = to_drop_indexes[i];
                yield col.dropIndex(index.name);
                console.log(col.namespace, "drop index useless", index);
            }
        }
        yield conn.close();
    });
}
exports.setIndex = setIndex;
