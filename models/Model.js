const SimpleMongo = require("./../libs/mongodb/SimpleMongo");
const CONSTANTS = require("./../config/constants");


module.exports = class Model extends SimpleMongo {

    constructor(table) {
        super(CONSTANTS.DATABASE_NAME,table );
    }

}
