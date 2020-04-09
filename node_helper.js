const NodeHelper = require("node_helper");
const BringClient = require("./BringClient");

let list;
let client;
let config;

module.exports = NodeHelper.create({
    start: function () {
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_LIST") {
            if (!this.client) {
                this.initClient(payload);
            } else {
                this.getList(payload);
                this.config = payload;
            }
            return true;
        } else if (notification === "PURCHASED_ITEM") {
            if (payload.purchase) {
                this.client.recently(payload.name, payload.listId).then(() => {
                    //this.sendSocketNotification("RELOAD_LIST");
                    this.getList(this.config);
                });
            } else {
                this.client.purchase(payload.name, payload.listId).then(() => {
                    //this.sendSocketNotification("RELOAD_LIST");
                    this.getList(this.config);
                });
            }

            return true;
        }
    },

    getList: function (payload) {
        if (this.client.mustLogin()) {
            this.initClient(payload);
        } else {
            this.client.getList(true, payload.listName).then(list => {
                this.list = list;
                this.sendSocketNotification("LIST_DATA", list);
            });
        }
    },

    initClient: function (payload) {
        this.client = new BringClient(payload, this.path);
        // Wait for Login
        setTimeout(() => {
            if (!this.client.mustLogin()) {
                this.client.getLists().then(lists => {
                    this.getList(payload);
                });
            }
        }, 1500);
    }
});
