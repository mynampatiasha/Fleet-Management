const fs = require('fs');

// Read the SOS router file
const sosRouterContent = fs.readFileSync('abra_fleet_backend/routes/sos_router.js', 'utf8');

// Extract the POLICE_STATION_DATABASE section
const databaseStart = sosRouterContent.indexOf('const POLICE_STATION_DATABASE = {');
const databaseEnd = sosRouterContent.indexOf('};', databaseStart) + 2;
const databaseSection = sosRouterContent.substring(databaseStart, databaseEnd);

// Count police stations by city
const cities = ['bangalore', 'delhi', 'mumbai', 'hyderabad', 'chennai', 'pune', 'kolkata'];
const counts = {};
let totalCount = 0;

cities.forEach(city => {
    // Find the city section
    const cityPattern = new RegExp(`'${city}':\\s*\\[([\\s\\S]*?)\\]`, 'i');
    const cityMatch = databaseSection.match(cityPattern);
    
    if (cityMatch) {
        // Count { name: entries in this city section
        const citySection = cityMatch[1];
        const stationMatches = citySection.match(/{\s*name:/g);
        const count = stationMatches ? stationMatches.length : 0;
        counts[city] = count;
        totalCount += count;
        
        console.log(`${city.toUpperCase()}: ${count} police stations`);
    } else {
        counts[city] = 0;
        console.log(`${city.toUpperCase()}: 0 police stations (not found)`);
    }
});

console.log('\n' + '='.repeat(50));
console.log(`TOTAL POLICE STATIONS: ${totalCount}`);
console.log('='.repeat(50));

// Breakdown by city
console.log('\nDETAILED BREAKDOWN:');
Object.entries(counts).forEach(([city, count]) => {
    const percentage = ((count / totalCount) * 100).toFixed(1);
    console.log(`• ${city.charAt(0).toUpperCase() + city.slice(1)}: ${count} stations (${percentage}%)`);
});

// Additional analysis
console.log('\nANALYSIS:');
console.log(`• Average stations per city: ${(totalCount / cities.length).toFixed(1)}`);
console.log(`• Largest coverage: ${Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0]} (${Math.max(...Object.values(counts))} stations)`);
console.log(`• Smallest coverage: ${Object.entries(counts).reduce((a, b) => counts[a[0]] < counts[b[0]] ? a : b)[0]} (${Math.min(...Object.values(counts))} stations)`);

// Verify specific areas mentioned in the request
console.log('\nSPECIFIC AREA VERIFICATION:');
const kasthuri = databaseSection.includes('Kasthuri Nagar Police Station');
const kalyan = databaseSection.includes('Kalyan Nagar Police Station');
console.log(`• Kasthuri Nagar Police Station: ${kasthuri ? '✅ INCLUDED' : '❌ MISSING'}`);
console.log(`• Kalyan Nagar Police Station: ${kalyan ? '✅ INCLUDED' : '❌ MISSING'}`);

// Sample nearby stations for Kasthuri Nagar area
if (kasthuri) {
    console.log('\nNEARBY STATIONS FOR KASTHURI NAGAR AREA:');
    const nearbyStations = [
        'Kasthuri Nagar Police Station',
        'Kalyan Nagar Police Station', 
        'Banaswadi Police Station',
        'HBR Layout Police Station',
        'RT Nagar Police Station',
        'Ramamurthy Nagar Police Station',
        'Lingarajapuram Police Station'
    ];
    
    nearbyStations.forEach(station => {
        const included = databaseSection.includes(station);
        console.log(`  • ${station}: ${included ? '✅' : '❌'}`);
    });
}