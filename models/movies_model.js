const Model = require("./Model");
const COLLECTION = 'movies';

module.exports = class Movies_model extends Model {

    constructor() {
        super(COLLECTION);
    }

    entry(data, cb) {
        return this.insert(data, cb);
    }

    list(data, cb) {
        let pipeline = [

            {
                $lookup:
                    {
                        from: "genres",
                        foreignField: "id",
                        localField: "genre",
                        as: "genres"
                    }
            },
            {
                $match: data,
            },


        ]
        console.log(pipeline);
        return this.aggregate(pipeline, cb);
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
