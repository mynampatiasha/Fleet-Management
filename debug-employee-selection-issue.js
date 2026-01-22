const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugEmployeeSelection() {
    console.log('🔍 Debug: Employee Selection Issue');
    console.log('='.repeat(50));
    
    try {
        // First, let's get a fresh admin token
        console.log('\n1️⃣ Getting admin token...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@abrafleet.com',
            password: 'Admin123!'
        });
        
        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            console.log('✅ Admin token obtained');
            
            // Now fetch employees
            console.log('\n2️⃣ Fetching employees...');
            const employeesResponse = await axios.get(`${BASE_URL}/api/employee-management/employees`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { limit: 100 }
            });
            
            console.log('📊 Response Status:', employeesResponse.status);
            console.log('📊 Response Data Keys:', Object.keys(employeesResponse.data));
            
            if (employeesResponse.data.data && employeesResponse.data.data.length > 0) {
                console.log('\n3️⃣ Employee Data Structure:');
                const firstEmployee = employeesResponse.data.data[0];
                console.log('Employee Keys:', Object.keys(firstEmployee));
                console.log('Employee ID:', firstEmployee.id);
                console.log('Employee ID Type:', typeof firstEmployee.id);
                console.log('Employee Name:', firstEmployee.name_parson || firstEmployee.name);
                console.log('Employee Email:', firstEmployee.email);
                
                console.log('\n4️⃣ All Employee IDs:');
                employeesResponse.data.data.forEach((emp, index) => {
                    console.log(`  ${index + 1}. ID: "${emp.id}" (${typeof emp.id}) - ${emp.name_parson || emp.name}`);
                });
                
                console.log('\n5️⃣ Testing Selection Logic:');
                const selectedEmployeeId = null; // This is what _assignedTo starts as
                console.log('selectedEmployeeId:', selectedEmployeeId);
                console.log('selectedEmployeeId type:', typeof selectedEmployeeId);
                
                employeesResponse.data.data.forEach((emp, index) => {
                    const isSelected = emp.id == selectedEmployeeId;
                    const isSelectedStrict = emp.id === selectedEmployeeId;
                    console.log(`  ${index + 1}. "${emp.id}" == null: ${isSelected}, "${emp.id}" === null: ${isSelectedStrict}`);
                });
                
            } else {
                console.log('❌ No employees found');
            }
            
        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugEmployeeSelection();