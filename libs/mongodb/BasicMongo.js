let Mongodb = require("./mongodb").getClass();

class BasicMongo extends Mongodb {

    constructor(databaseName, collectionName) {
        super();
        this.client = null;
        this.databaseName = databaseName;
        this.collectionName = collectionName;
        this.collection = false;
    }


    connect(options, cb) {
        super.connect(options, (client) => {
            this.client = client;
            this.collection = client.db(this.databaseName).collection(this.collectionName);
            cb && cb()
        })
    }


    getCollection() {
        return this.collection;
    }

}

module.exports = BasicMongo;