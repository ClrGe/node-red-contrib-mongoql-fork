module.exports = function (RED) {
    const mongoClient = require('mongodb');
    var ObjectId = require('mongodb').ObjectId;

    function findById(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;
            var db_collection = msg.db_collection;
            var id = msg.id;

            if (url === 'undefined' || db_name === 'undefined' || db_collection === 'undefined' || id === 'undefined') {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.id;

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name, msg.db_collection and msg.id";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.id;

                id = new ObjectId(id);

                mongoClient.connect(url, { useNewUrlParser: true }).then((client) => {
                    var db = client.db(db_name).collection(db_collection);

                    db.find({ _id: id }).toArray().then((result) => {
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

    RED.nodes.registerType("findById", findById);
}