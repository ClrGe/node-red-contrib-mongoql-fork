module.exports = function (RED) {
    const mongoClient = require('mongodb');

    function deleteMany(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = msg.url;
            var db_name = msg.db_name;
            var db_collection = msg.db_collection;
            var filter = msg.filter || {};

            if (url === 'undefined' || db_name === 'undefined' || db_collection === 'undefined' || filter === 'undefined') {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.filter;

                msg.status = "error";
                msg.payload = "Please provide msg.url, msg.db_name, msg.db_collection and msg.filter";

                node.send(msg);
            } else {
                delete msg.url;
                delete msg.db_name;
                delete msg.db_collection;
                delete msg.filter;

                mongoClient.connect(url, { useNewUrlParser: true }).then((client) => {
                    var db = client.db(db_name).collection(db_collection);

                    db.deleteMany(filter).then((result) => {
                        client.close();

                        msg.status = "success";
                        msg.payload = {
                            "deletedFilter": filter,
                            "deletedCount": result.deletedCount
                        };

                        node.send(msg);
                    }).catch(() => {
                        client.close();
                        
                        msg.status = "error";
                        msg.payload = "Failed to Delete"

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

    RED.nodes.registerType("deleteMany", deleteMany);
}