let BasicMongo = require("./BasicMongo");
let slugify = require("slugify");
let crypto = require('crypto');

function processQuery(filter) {
    if (filter.tags) {
        //if there is a comma
        if (filter.tags.indexOf(",") >= 0)
            filter.tags = {"$all": filter.tags.split(",")};
    }
    if (filter.tagsOR) {
        filter.tags = {"$in": filter.tagsOR.split(",")};
        delete filter.tagsOR;
    }
    if (filter.tagsNOT) {
        filter.tags = {"$nin": filter.tagsNOT.split(",")};
        delete filter.tagsNOT;
    }
    if (filter.tagsAND) {
        filter.tags = {"$in": filter.tagsAND.split(",")};
        delete filter.tagsAND;
    }

    return filter
}

//TODO: Add a simple batch execution method.
class SimpleMongo extends BasicMongo {
    constructor(databaseName, collectionName, cb) {
        super(databaseName, collectionName);
        this.options = {
            docID: "_id",
            slugifyID: false,
            hashID: false,
            beforeInsert: (doc) => doc
        };
        this.connect({}, cb);
    }

    executeBulk(options, cb) {
        let bulk = this.collection.initializeUnorderedBulkOp();
        options.data.forEach((doc) => {
            options.method(doc, null, bulk);
        });
        return bulk.execute(cb);
    }

    insert(list, cb) {
        if (!Array.isArray(list))
            list = [list];

        // console.log(list);
        list = list.map((item) => {
            item["_id"] = item[this.options.docID];
            if (this.options.slugifyID)
                item['_id'] = slugify(item['_id'], {lower: true});
            else if (this.options.hashID)
                item['_id'] = crypto.createHash('md5').update(item['_id'].toLowerCase()).digest("hex");


            item['meta'] = {
                "timestamp": {
                    "created": +(new Date()),
                    "updated": +(new Date()),
                }
            };
            return this.options.beforeInsert(item);
        });
        return this.collection.insertMany(list, {}, cb);
    }


    update(options, cb, bulk) {
        //accept list of document with _id as find key & runs a bulk update.
        if (Array.isArray(options)) {
            return this.executeBulk({
                data: options.map((doc) => {
                    //update each doc to act as update.
                    return {
                        update: doc,
                        upsert: true
                    }
                }),
                method: this.update //current method as update.
            }, cb);
        }
        options.update = options.update || {};
        options.key = options.key || "_id";

        //if key is set in update field, add it to query & delete it from update.
        if (options.update[options.key]) {
            options.query = options.query || {};
            options.query[options.key] = options.update[options.key];
            delete options.update[options.key];
        }

        let ops = {
            "$set": options.update
        };

        
        ops['$set']['meta.timestamp.update'] = +(new Date());


        // console.log(options);
        //if bulk is set
        if (bulk) {
            //if upsert then use upsert method, else simple  update
            if (options.upsert)
                return bulk.find(options.query).upsert().updateOne(ops);
            else
                return bulk.find(options.query).updateOne(ops);
        }




        if(options.multi)
            return this.collection.updateMany(options.query, ops, {
            upsert: options.upsert || false
            }, cb);

        return this.collection.updateOne(options.query, ops, {
            upsert: options.upsert || false
        }, cb);
    }

    distinct(options, cb) {
        return this.collection.distinct(options.key || "_id",
            options.query || {},
            options.options || {},
            cb)
    }

    find(options, cb) {
        return this.collection.find(options.query, {
            projection: options.projection || {},
            sort: { meta: -1 } || {}
        }).toArray(cb);
    }

    remove(options, cb) {
        if (!options.query)
            throw new Error("Please specify query. No default query for remove, As it can lead to removal of unexpected data.");
        return this.collection.remove(options.query, {}, cb)
    }


    count(options, cb) {
        return this.collection.count(options.query, {}, cb)
    }

    getDistributionBy(options, cb) {
        let pipeline = [];
        let field = options.by;
        let filter = options.query || options.filter;
        let groupby = {
            _id: field,
            count: {$sum: 1},
        };
        if (filter)
            pipeline.push({$match: filter});
        pipeline.push({$group: groupby});

        return this.collection.aggregate(pipeline, {}).toArray((err, data) => {
            cb(err, data);
        })
    }

    aggregate(options, cb) {
        return this.collection.aggregate(options, {}).toArray((err, data) => {
            cb(err, data);
        })
    }



    updateOne(key,set, cb) {
        console.log(key);
        console.log(set);
        return this.collection.updateOne(key,set,(err, data) => {
            cb(err, data);
        });
    }

    last_inserted(options, cb) {
        return this.collection.find(options.query, {
            projection: options.projection || {}
        }).sort({_id: -1}).limit(1).toArray(cb);
    }

    listFields() {
        // db.things.aggregate([
        //     {"$project":{"arrayofkeyvalue":{"$objectToArray":"$$ROOT"}}},
        //     {"$unwind":"$arrayofkeyvalue"},
        //     {"$group":{"_id":null,"allkeys":{"$addToSet":"$arrayofkeyvalue.k"}}}
        // ])
    }
}


module.exports = SimpleMongo;