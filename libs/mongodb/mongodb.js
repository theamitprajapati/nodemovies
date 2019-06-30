let MongoClient = require('mongodb').MongoClient;

//A variable to store global database connection pool.
let connectionCache = {};

class MongoDB {
    constructor() {
        this.client = false;
    }

    getClass() {
        return MongoDB;
    }

    getCollection(options) {
        return this.client.db(options.database || "tik").collection(options.collection);
    }

    connect(options, cb) {
        options = options || {};
        options.url = options.url || 'mongodb://localhost:27017';

        //if connection is already cached, then return it, else return by connecting.
        if (connectionCache[options.url]) {
            this.client = connectionCache[options.url];
            return cb && cb(this.client)
        } else {
            MongoClient.connect(options.url, (err, client) => {
                connectionCache[options.url] = client;
                this.client = client;
                cb && cb(this.client);
            });
        }
    }
}

module.exports = new MongoDB();