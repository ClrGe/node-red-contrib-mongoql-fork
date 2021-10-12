module.exports = function (RED) {
    const mongoClient = require('mongodb').MongoClient;

    function dropDbCol(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;
            var db_collection = msg.db_collection;

            if (url === 'undefined' || db_name === 'undefined' || db_collection === 'undefined') {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name and msg.db_collection";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;

                mongoClient.connect(url, function (err, client) {
                    if (err) {
                        msg.status = "error";
                        msg.payload = err;

                        node.send(msg);

                        client.close();
                    };

                    var db = client.db(db_name);
                    db.collection(db_collection).drop(function (err, delOK) {
                        if (err) {
                            msg.status = "error";
                            msg.payload = err;

                            node.send(msg);
                        };

                        if (delOK) {
                            msg.status = "success";
                            msg.payload = "Collection Removed";

                            node.send(msg);
                        };
                        
                        client.close();
                    });
                });
            }
        });
    }

    RED.nodes.registerType("dropDbCol", dropDbCol);
}