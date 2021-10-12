module.exports = function (RED) {
    const mongoClient = require('mongodb').MongoClient;

    function dropDb(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;

            if (url === 'undefined' || db_name === 'undefined') {
                delete msg.url;
                delete msg.db_name;

                msg.status = "error";
                msg.payload = "Please provide msg.url and msg.db_name";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;

                mongoClient.connect(url, function (err, client) {
                    if (err) {
                        msg.status = "error";
                        msg.payload = err;

                        node.send(msg);

                        client.close();
                    };

                    var db = client.db(db_name);
                    db.dropDatabase(function (err, delOK) {
                        if (err) {
                            msg.status = "error";
                            msg.payload = err;

                            node.send(msg);
                        };

                        if (delOK) {
                            msg.status = "success";
                            msg.payload = "Database Removed";

                            node.send(msg);
                        };
                        
                        client.close();
                    });
                });
            }
        });
    }

    RED.nodes.registerType("dropDb", dropDb);
}