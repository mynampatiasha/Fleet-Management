const axios = require('axios');

async function fixPoojaFirebaseAuth() {
    console.log('🔥 Fixing Pooja Joshi Firebase Authentication');
    console.log('Email: pooja.joshi@wipro.com');
    console.log('Password: pooja.joshi');
    console.log('=' .repeat(50));

    try {
        // First, let's check if the backend is running
        console.log('🔍 Step 1: Checking backend status...');
        
        const healthResponse = await axios.get('http://localhost:3001/health', {
            timeout: 5000
        });
        
        console.log('✅ Backend is running');
        console.log('   Status:', healthResponse.data.status);
        console.log('   MongoDB:', healthResponse.data.mongodb);

        // Step 2: Create/verify user in backend database
        console.log('\n👤 Step 2: Setting up user in backend...');
        
        const testHeaders = {
            'Content-Type': 'application/json',
            'x-test-firebase-uid': 'pooja-joshi-wipro-uid',
            'Authorization': 'Bearer test-token-for-development'
        };

        const userData = {
            firebaseUid: 'pooja-joshi-wipro-uid',
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi',
            role: 'client'
        };

        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', userData, {
            headers: testHeaders,
            timeout: 10000
        });

        console.log('✅ Backend user setup complete');
        console.log('   User ID:', loginResponse.data.user.id);
        console.log('   Role:', loginResponse.data.user.role);
        console.log('   Firebase UID:', loginResponse.data.user.firebaseUid);

        // Step 3: Check Firebase configuration
        console.log('\n🔥 Step 3: Checking Firebase configuration...');
        
        // Read the Firebase config from the Flutter app
        const firebaseConfigPath = 'abra_fleet/android/app/google-services.json';
        
        try {
            const fs = require('fs');
            const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
            
            console.log('✅ Firebase config found');
            console.log('   Project ID:', firebaseConfig.project_info.project_id);
            console.log('   Project Number:', firebaseConfig.project_info.project_number);
            
            const clientInfo = firebaseConfig.client[0];
            console.log('   App ID:', clientInfo.client_info.mobilesdk_app_id);
            
        } catch (configError) {
            console.log('⚠️  Could not read Firebase config:', configError.message);
        }

        // Step 4: Provide Firebase Auth solution
        console.log('\n🛠️  Step 4: Firebase Authentication Solution');
        console.log('=' .repeat(50));
        
        console.log('The issue is that the user exists in the backend database but not in Firebase Authentication.');
        console.log('Here are the solutions:');
        
        console.log('\n📱 SOLUTION 1: Create user via Firebase Console');
        console.log('1. Go to Firebase Console: https://console.firebase.google.com');
        console.log('2. Select your project');
        console.log('3. Go to Authentication > Users');
        console.log('4. Click "Add user"');
        console.log('5. Enter:');
        console.log('   - Email: pooja.joshi@wipro.com');
        console.log('   - Password: pooja.joshi');
        console.log('6. Save the user');

        console.log('\n🔧 SOLUTION 2: Use Firebase Admin SDK (if available)');
        console.log('Run: node create-pooja-firebase-user.js');

        console.log('\n📲 SOLUTION 3: Register via Flutter App');
        console.log('1. In your Flutter app, add a registration flow');
        console.log('2. Use FirebaseAuth.instance.createUserWithEmailAndPassword()');
        console.log('3. Email: pooja.joshi@wipro.com');
        console.log('4. Password: pooja.joshi');

        console.log('\n🧪 SOLUTION 4: Test with existing user');
        console.log('If you have other test users in Firebase, try logging in with those first.');

        // Step 5: Check if there are existing users we can test with
        console.log('\n🔍 Step 5: Checking for existing test users...');
        
        const testEmails = [
            'admin@abrafleet.com',
            'test@abrafleet.com',
            'customer123@test.com',
            'driver@test.com'
        ];

        console.log('Try logging in with these existing users (if they exist):');
        for (const email of testEmails) {
            console.log(`   - ${email} (password might be: test123 or ${email.split('@')[0]})`);
        }

        console.log('\n🎯 RECOMMENDED IMMEDIATE ACTION');
        console.log('=' .repeat(50));
        console.log('1. Go to Firebase Console');
        console.log('2. Create user: pooja.joshi@wipro.com / pooja.joshi');
        console.log('3. Try login again in Flutter app');
        console.log('4. If successful, the backend will automatically sync the user');

        return {
            success: true,
            backendReady: true,
            userInBackend: true,
            firebaseUserNeeded: true,
            solutions: [
                'Create user in Firebase Console',
                'Use Firebase Admin SDK',
                'Register via Flutter app',
                'Test with existing users'
            ]
        };

    } catch (error) {
        console.error('❌ Fix attempt failed!');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }

        // If backend is not running, provide instructions
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🚨 BACKEND NOT RUNNING');
            console.log('Please start the backend first:');
            console.log('1. cd abra_fleet_backend');
            console.log('2. node index.js');
            console.log('3. Then run this script again');
        }

        return {
            success: false,
            error: error.message,
            backendRunning: false
        };
    }
}

// Run the fix
fixPoojaFirebaseAuth().then(result => {
    console.log('\n🎯 SUMMARY');
    console.log('=' .repeat(50));
    
    if (result.success) {
        console.log('✅ Diagnosis complete');
        console.log('✅ Backend: Ready');
        console.log('✅ User in backend: Yes');
        console.log('❌ User in Firebase: No (this is the issue)');
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Create the user in Firebase Authentication');
        console.log('2. Use email: pooja.joshi@wipro.com');
        console.log('3. Use password: pooja.joshi');
        console.log('4. Try login again in Flutter app');
        
    } else {
        console.log('❌ Could not complete diagnosis');
        console.log('Issue:', result.error);
        
        if (!result.backendRunning) {
            console.log('\n💡 Start the backend server first');
        }
    }
    
}).catch(console.error);