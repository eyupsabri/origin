const http = require('http');


//const cluster = require('cluster');

const app = require('./app');
const {mongoConnect} = require('./services/mongo');
const {loadPlanetsData} = require('./models/planets.model');
const {loadLaunchData} = require('./models/launches.model');

const PORT = process.env.PORT || 8000; //3000 front-end i serve luyo
                                       //start script ten PORT atayabiliyon win icin az farkli
const server = http.createServer(app);


async function serverStart(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log("Listening on poort", PORT, "...");
    });
}

serverStart();

