module.exports = function (RED) {
    const mongoClient = require('mongodb');

    function insertOne(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;
            var db_collection = msg.db_collection;
            var data = msg.payload;

            if (url === 'undefined' || db_name === 'undefined' || db_collection === 'undefined' || data === 'undefined') {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.payload;

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name, msg.db_collection and msg.payload";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.payload;

                mongoClient.connect(url, { useNewUrlParser: true }).then((client) => {
                    var db = client.db(db_name).collection(db_collection);

                    db.insertOne(data).then((result) => {
                        client.close();

                        msg.status = "success";
                        msg.payload = result.ops;
                        msg.insertedCount = result.insertedCount;

                        node.send(msg);
                    }).catch(() => {
                        client.close();
                        
                        msg.status = "error";
                        msg.payload = "Failed to Insert"

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

    RED.nodes.registerType("insertOne", insertOne);
}