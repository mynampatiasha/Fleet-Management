// Test script to verify enhanced location search functionality
const https = require('https');

async function testLocationSearch() {
    console.log('🔍 Testing Enhanced Location Search...\n');
    
    // Test 1: Basic search
    console.log('Test 1: Basic location search');
    try {
        const searchQuery = 'MG Road, Bengaluru, Karnataka, India';
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`;
        
        const response = await makeRequest(url);
        const results = JSON.parse(response);
        
        console.log(`✅ Found ${results.length} results for "${searchQuery}"`);
        
        if (results.length > 0) {
            const first = results[0];
            console.log(`   📍 ${first.display_name}`);
            console.log(`   📊 Coordinates: ${first.lat}, ${first.lon}`);
            console.log(`   🏷️  Type: ${first.type || 'N/A'}`);
            
            if (first.address) {
                console.log(`   🏠 Address components:`);
                Object.entries(first.address).forEach(([key, value]) => {
                    console.log(`      ${key}: ${value}`);
                });
            }
        }
    } catch (error) {
        console.log(`❌ Basic search failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Reverse geocoding
    console.log('Test 2: Reverse geocoding');
    try {
        const lat = 12.9716;
        const lon = 77.5946;
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
        
        const response = await makeRequest(url);
        const result = JSON.parse(response);
        
        console.log(`✅ Reverse geocoding for coordinates: ${lat}, ${lon}`);
        console.log(`   📍 ${result.display_name}`);
        
        if (result.address) {
            console.log(`   🏠 Address components:`);
            Object.entries(result.address).forEach(([key, value]) => {
                console.log(`      ${key}: ${value}`);
            });
        }
    } catch (error) {
        console.log(`❌ Reverse geocoding failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Nearby POI search
    console.log('Test 3: Nearby POI search');
    try {
        const lat = 12.9716;
        const lon = 77.5946;
        const radiusKm = 2;
        
        // Calculate bounding box
        const kmPerDegree = 111.0;
        const deltaLat = radiusKm / kmPerDegree;
        const deltaLon = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
        
        const minLon = lon - deltaLon;
        const minLat = lat - deltaLat;
        const maxLon = lon + deltaLon;
        const maxLat = lat + deltaLat;
        const viewbox = `${minLon},${minLat},${maxLon},${maxLat}`;
        
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=10&addressdetails=1&amenity=*&bounded=1&viewbox=${viewbox}`;
        
        const response = await makeRequest(url);
        const results = JSON.parse(response);
        
        console.log(`✅ Found ${results.length} nearby amenities within ${radiusKm}km`);
        
        results.slice(0, 5).forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.name || result.display_name}`);
            console.log(`      Type: ${result.type || 'N/A'}`);
            console.log(`      Category: ${result.category || 'N/A'}`);
        });
    } catch (error) {
        console.log(`❌ Nearby POI search failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Enhanced Location Search Test Complete!');
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'AbraFleet/1.0',
                'Accept': 'application/json'
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Run the test
testLocationSearch().catch(console.error);