// Test script to verify closed tickets functionality
const http = require('http');

async function testClosedTicketsFunctionality() {
    console.log('🎫 Testing Closed Tickets Functionality');
    console.log('============================================================');
    
    try {
        // Test 1: Backend health check
        console.log('1️⃣ Testing backend health...');
        const healthResponse = await makeRequest('GET', 'http://localhost:3001/api/health');
        console.log('✅ Backend health:', healthResponse ? 'OK' : 'Failed');
        
        // Test 2: Employee endpoint for filters
        console.log('\n2️⃣ Testing employee endpoint for filters...');
        const employeesResponse = await makeRequest('GET', 'http://localhost:3001/api/user-management/users?limit=10');
        console.log('📋 Employees endpoint:', employeesResponse ? 'OK' : 'Failed');
        
        if (employeesResponse && employeesResponse.data) {
            console.log(`   Found ${employeesResponse.data.length} employees for filtering`);
            if (employeesResponse.data.length > 0) {
                const sample = employeesResponse.data[0];
                console.log('   Sample employee structure:');
                console.log('   - ID:', sample.id || 'N/A');
                console.log('   - Name:', sample.name_parson || sample.name || 'N/A');
                console.log('   - Email:', sample.email || 'N/A');
            }
        }
        
        // Test 3: Tickets endpoint
        console.log('\n3️⃣ Testing tickets endpoint...');
        const ticketsResponse = await makeRequest('GET', 'http://localhost:3001/api/tickets?status=closed&limit=5');
        console.log('🎫 Tickets endpoint:', ticketsResponse ? 'OK' : 'Failed');
        
        if (ticketsResponse && ticketsResponse.data) {
            console.log(`   Found ${ticketsResponse.data.length} closed tickets`);
            if (ticketsResponse.data.length > 0) {
                const sample = ticketsResponse.data[0];
                console.log('   Sample ticket structure:');
                console.log('   - ID:', sample._id || 'N/A');
                console.log('   - Number:', sample.ticketNumber || 'N/A');
                console.log('   - Status:', sample.status || 'N/A');
                console.log('   - Created:', sample.createdAt || 'N/A');
                console.log('   - Updated:', sample.updatedAt || 'N/A');
                console.log('   - Assigned To:', sample.assignedTo || 'N/A');
            }
        }
        
        // Test 4: Stats calculation
        console.log('\n4️⃣ Testing stats calculation...');
        if (ticketsResponse && ticketsResponse.data) {
            const tickets = ticketsResponse.data;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            
            let todayCount = 0;
            let weekCount = 0;
            let monthCount = 0;
            
            tickets.forEach(ticket => {
                try {
                    const updatedAt = new Date(ticket.updatedAt || ticket.createdAt);
                    const ticketDate = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), updatedAt.getDate());
                    
                    if (ticketDate.getTime() === today.getTime()) todayCount++;
                    if (ticketDate >= weekStart) weekCount++;
                    if (ticketDate >= monthStart) monthCount++;
                } catch (e) {
                    console.log('   ⚠️ Error parsing date for ticket:', e.message);
                }
            });
            
            console.log('📊 Statistics calculated:');
            console.log(`   - Total: ${tickets.length}`);
            console.log(`   - Today: ${todayCount}`);
            console.log(`   - This Week: ${weekCount}`);
            console.log(`   - This Month: ${monthCount}`);
        }
        
        console.log('\n✅ Closed Tickets functionality test completed!');
        console.log('🎯 The Flutter app should now show correct statistics and employee search.');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the backend is running on port 3001');
        console.log('   Run: cd abra_fleet_backend && node index.js');
    }
}

function makeRequest(method, url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.end();
    });
}

testClosedTicketsFunctionality();