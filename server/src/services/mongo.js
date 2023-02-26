const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;


mongoose.connection.once('open', () => { //on yerine once yazınca bir kere triggered oluyor
    console.log('MongoDB connection ready!');
});
mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect(){
    await mongoose.connect(MONGO_URL, /*{
        useNewUrlParser: true, //how mongoose use connection string(mongo_url)
        useFindAndModify: false,//disables outdated way of updating data
        useCreateIndex: true,//enables new index func
        useUnifiedTopology: true,//updated way of talking to clusters of DB
    }*/);
}

async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
}