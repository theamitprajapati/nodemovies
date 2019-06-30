const Model = require("./Model");
const COLLECTION = 'genres';

module.exports = class Movies_model extends Model {

    constructor() {
        super(COLLECTION);
    }

    entry(data, cb) {
        return this.insert(data, cb);
    }

    list(data, cb) {
        return this.find(data, cb);
    }

    update(keys,set,cb)
    {
        return this.updateOne(keys,set,cb);
    }

    deleteReport(data,cb)
    {
        return this.remove(data,cb);
    }



}
