module.exports = function (RED) {
    const mongoClient = require('mongodb');

    function countDoc(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;
            var db_collection = msg.db_collection;
            var query = msg.query || {};

            if (url === 'undefined' || db_name === 'undefined' || db_collection === 'undefined') {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.query;

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name and msg.db_collection";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.query;

                mongoClient.connect(url, { useNewUrlParser: true }).then((client) => {
                    var db = client.db(db_name).collection(db_collection);

                    db.find(query).count().then((result) => {
                        client.close();

                        msg.status = "success";
                        msg.payload = result;

                        node.send(msg);
                    }).catch(() => {
                        client.close();
                        
                        msg.status = "error";
                        msg.payload = "Failed to Count"

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

    RED.nodes.registerType("countDoc", countDoc);
}