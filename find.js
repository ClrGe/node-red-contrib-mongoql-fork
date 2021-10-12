/*****************************************************************************
    MongoDB queries inside Node-Red
                                             C. Gouarne 2021-10-12 11:24:37

    node-red find (MongoQL) --- Modified to support projections

*****************************************************************************/

module.exports = function (RED) {
    const mongoClient = require('mongodb');

    function findProj(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;
            var db_collection = msg.db_collection;
            var query = msg.query || {};
            var sort = msg.sort || {};
            var limit = msg.limit;
            var skip = msg.skip;
            var fields = msg.fields; // JMG

            if (typeof limit === 'string' && !isNaN(limit)) {
                limit = Number(limit);
            } else if (typeof limit === 'undefined') {
                limit = 0;
            }

            if (typeof skip === 'string' && !isNaN(skip)) {
                skip = skip(skip);
            } else if (typeof skip === 'undefined') {
                skip = 0;
            }

            if (url === 'undefined' || db_name === 'undefined' || db_collection === 'undefined') {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.query;
                delete msg.sort;
                delete msg.limit;
                delete msg.skip;
                delete msg.fields; // JMG

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name and msg.db_collection";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.query;
                delete msg.sort;
                delete msg.limit;
                delete msg.skip;
                delete msg.fields; // JMG

                mongoClient.connect(url, { useNewUrlParser: true }).then((client) => {
                    var db = client.db(db_name).collection(db_collection);

                    // JMG
                    db.find(query).project(fields).sort(sort).limit(limit).skip(skip).toArray().then((result) => {
                        client.close();

                        msg.status = "success";
                        msg.payload = result;

                        node.send(msg);
                    }).catch(() => {
                        client.close();
                        
                        msg.status = "error";
                        msg.payload = "Failed to Find"

                        node.send(msg);
                    });
                }).catch(() => {
                    msg.status = "error";
                    msg.payload = "Database or Collection Not Available";

                    node.send(msg);
                });
            }
        });
    }

    RED.nodes.registerType("findProj", findProj);
}