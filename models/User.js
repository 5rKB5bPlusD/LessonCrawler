
var config = require('../wx_config.json');
var mongoose = require('mongoose');
mongoose.connect(config.mongodb.db);
var db = mongoose.connection;
db.on('error', function() {
  throw new Error('unable to connect to database at ' + config.mongodb.db);
});
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  uid: {type: String},
  stuID: {type: String},
  password: {type: String}
}, {autoIndex: false});
mongoose.model('User', UserSchema);

