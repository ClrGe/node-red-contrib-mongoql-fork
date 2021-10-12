module.exports = function (RED) {
    const mongoClient = require('mongodb').MongoClient;

    function listDbCol(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;

            if (url === 'undefined' || db_name === 'undefined') {
                delete msg.url;
                delete msg.db_name;

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;

                const client = new mongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

                client.connect().then(client => client.db(db_name).listCollections().toArray())
                    .then(cols => {
                        msg.status = "success";
                        msg.payload = cols

                        node.send(msg);
                    })
                    .finally(() => client.close());
            }
        });
    }

    RED.nodes.registerType("listDbCol", listDbCol);
}