module.exports = function (RED) {
    const mongoClient = require('mongodb').MongoClient;

    function listDb(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;

            if (url === 'undefined') {
                delete msg.url;

                msg.status = "error";
                msg.payload = "Please provide msg.url";

                node.send(msg);
            } else {
                delete msg.url;

                const client = new mongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

                // Connect
                client.connect().then(client => client.db().admin().listDatabases()).then(dbs => {
                    msg.status = "success";
                    msg.payload = {
                        "databases": dbs.databases,
                        "totalSize": dbs.totalSize
                    };

                    node.send(msg);
                }).finally(() => client.close());
            }
        });
    }

    RED.nodes.registerType("listDb", listDb);
}