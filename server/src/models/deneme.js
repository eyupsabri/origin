
let payloads = [
    {
        customers: [
            "cemre",
            "husnu"
        ]
    },
    {
        customers: [
            "zargan",
            "doncic"
        ]
    }
]; 

let yeni = [];
payloads.map((payload) => {
    console.log(...payload['customers']);
    
    yeni.push(...payload['customers']);
});

console.log(yeni);

