const launches = require('./launches.mongo');
const planets = require('./planets.mongo'); 
const axios = require('axios');

//const launches = new Map();
const DEFAULT_FLIGHT_NUMBER = 100;

/*const launch = {
    flightNumber: 100, //flight_number
    mission: 'Kepler Exploration X', //name
    rocket: 'Explorer IS1', //rocket.name
    launchDate: new Date('Decembler 27, 2030'), //date_local
    target: 'Kepler-442 b', //not applicable
    customers: ['ZTM', 'NASA'], //payloads.customers for each payload
    upcoming: true, //upcoming
    success: true, //success
};*/

//Default launch set
//launches.set(launch.flightNumber, launch);
//saveLaunch(launch);
async function saveLaunch(launch){
    await launches.findOneAndUpdate({flightNumber: launch.flightNumber}, launch, {upsert: true});
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'; // SPACEX API

async function populateLaunches(){
    console.log('Downloading data');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    if(response.status != 200) {     //If downloading goes wrong
        console.log('problem downloading SpaceX');
        throw new Error('Launch SPACEX data failed');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        let customers = [];
        payloads.map((payload) => {
            customers.push(...payload['customers']);
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }
        console.log(`${launch.flightNumber} ${launch.mission}`);
        await saveLaunch(launch)

    }
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if(firstLaunch){
        console.log('SPACEX already loaded');
        return;
    }else {
        populateLaunches();
    }
    

}

async function findLaunch(filter){
    return await launches.findOne(filter);
}

async function getLatestFlightNumber(){
    const latestLaunch = await launches.findOne().sort('-flightNumber');//Sorting launches and getting highest
    if(!latestLaunch){// no launches yet
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    //return Array.from(launches.values());
    return await launches
    .find({}, {'_id': 0, '__v': 0})
    .sort({flightNumber: 1}) //Sorting ascending
    .skip(skip)
    .limit(limit);

}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({keplerName: launch.target});//check if planet listed
    if(!planet){
        throw new Error('No matching planet found');
    }
    
    const latestFlightNumber = await getLatestFlightNumber();
    const newLaunch = Object.assign(launch, {
        flightNumber: latestFlightNumber + 1,
        success: true,
        upcoming: true,
        customers: ['zero to mastery', 'NASA'],
    });
    await saveLaunch(newLaunch);
}

/*function addNewLaunch(launch){
    latestFlightNumber++;
    launches.set(
        latestFlightNumber,
        Object.assign(launch, {
            flightNumber: latestFlightNumber,
            customers: ['zero to mastery', 'NASA'],
            upcoming: true,
            success: true,
        })
    );
}*/
async function existsLaunchWithId(launchId){
    return await findLaunch({flightNumber: launchId});
}
async function abortLaunchById(launchId){
    const aborted = await launches.updateOne({flightNumber: launchId}, {
        upcoming: false,
        success: false,
    });
    
    return aborted.modifiedCount === 1 ;
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    //addNewLaunch,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
};