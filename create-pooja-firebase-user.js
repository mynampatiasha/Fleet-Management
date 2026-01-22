const admin = require('firebase-admin');

async function createPoojaFirebaseUser() {
    console.log('🔥 Creating Pooja Joshi in Firebase Authentication');
    console.log('Email: pooja.joshi@wipro.com');
    console.log('Password: pooja.joshi');
    console.log('=' .repeat(50));

    try {
        // Initialize Firebase Admin if not already initialized
        if (!admin.apps.length) {
            // Check if we have the service account key
            try {
                const serviceAccount = require('./abra_fleet_backend/config/firebase-service-account.json');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: "https://abra-fleet-management-default-rtdb.firebaseio.com"
                });
                console.log('✅ Firebase Admin initialized with service account');
            } catch (serviceError) {
                console.log('⚠️  Service account not found, trying alternative initialization...');
                // Try to initialize with environment variables or default credentials
                admin.initializeApp();
                console.log('✅ Firebase Admin initialized with default credentials');
            }
        }

        const auth = admin.auth();

        // Check if user already exists
        console.log('🔍 Checking if user already exists in Firebase...');
        
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail('pooja.joshi@wipro.com');
            console.log('✅ User already exists in Firebase');
            console.log('   UID:', userRecord.uid);
            console.log('   Email:', userRecord.email);
            console.log('   Email Verified:', userRecord.emailVerified);
            console.log('   Disabled:', userRecord.disabled);
            
            // Update the user if needed
            if (userRecord.disabled) {
                await auth.updateUser(userRecord.uid, {
                    disabled: false
                });
                console.log('✅ User enabled');
            }
            
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('👤 User not found, creating new Firebase user...');
                
                // Create new user
                userRecord = await auth.createUser({
                    uid: 'pooja-joshi-wipro-uid', // Custom UID
                    email: 'pooja.joshi@wipro.com',
                    password: 'pooja.joshi',
                    displayName: 'Pooja Joshi',
                    emailVerified: true, // Set to true for testing
                    disabled: false
                });
                
                console.log('✅ Firebase user created successfully!');
                console.log('   UID:', userRecord.uid);
                console.log('   Email:', userRecord.email);
                
            } else {
                throw error;
            }
        }

        // Set custom claims for role-based access
        console.log('\n🏷️  Setting custom claims...');
        
        await auth.setCustomUserClaims(userRecord.uid, {
            role: 'client',
            organization: 'Wipro',
            permissions: ['billing_access', 'reports_view', 'client_dashboard'],
            isActive: true
        });
        
        console.log('✅ Custom claims set successfully');

        // Generate a custom token for testing
        console.log('\n🎫 Generating custom token for testing...');
        
        const customToken = await auth.createCustomToken(userRecord.uid, {
            role: 'client',
            organization: 'Wipro',
            email: 'pooja.joshi@wipro.com',
            name: 'Pooja Joshi'
        });
        
        console.log('✅ Custom token generated');
        console.log('Token (first 50 chars):', customToken.substring(0, 50) + '...');

        console.log('\n🎉 FIREBASE USER SETUP COMPLETE');
        console.log('=' .repeat(50));
        console.log('✅ Firebase user: CREATED/UPDATED');
        console.log('✅ Email verification: SET TO TRUE');
        console.log('✅ Custom claims: SET');
        console.log('✅ Role: client');
        console.log('✅ Organization: Wipro');
        console.log('✅ Status: ACTIVE');

        console.log('\n📋 LOGIN CREDENTIALS');
        console.log('Email: pooja.joshi@wipro.com');
        console.log('Password: pooja.joshi');
        console.log('Firebase UID:', userRecord.uid);

        console.log('\n💡 TESTING INSTRUCTIONS');
        console.log('1. Use these credentials in your Flutter app');
        console.log('2. The user should now authenticate successfully');
        console.log('3. Custom claims will provide role-based access');
        console.log('4. Backend will recognize the user automatically');

        return {
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
            customToken: customToken
        };

    } catch (error) {
        console.error('❌ Firebase user creation failed!');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        
        if (error.code === 'auth/email-already-exists') {
            console.log('\n💡 User already exists - try updating instead');
            return await updateExistingFirebaseUser();
        }
        
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

async function updateExistingFirebaseUser() {
    console.log('\n🔄 Updating existing Firebase user...');
    
    try {
        const auth = admin.auth();
        
        // Get existing user
        const userRecord = await auth.getUserByEmail('pooja.joshi@wipro.com');
        
        // Update user properties
        await auth.updateUser(userRecord.uid, {
            password: 'pooja.joshi',
            displayName: 'Pooja Joshi',
            emailVerified: true,
            disabled: false
        });
        
        // Update custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
            role: 'client',
            organization: 'Wipro',
            permissions: ['billing_access', 'reports_view', 'client_dashboard'],
            isActive: true
        });
        
        console.log('✅ Existing user updated successfully');
        console.log('   UID:', userRecord.uid);
        console.log('   Password: RESET');
        console.log('   Claims: UPDATED');
        
        return {
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
            updated: true
        };
        
    } catch (updateError) {
        console.error('❌ Update failed:', updateError.message);
        return {
            success: false,
            error: updateError.message
        };
    }
}

// Run the Firebase user creation
createPoojaFirebaseUser().then(result => {
    console.log('\n🎯 FINAL RESULT');
    console.log('=' .repeat(50));
    
    if (result.success) {
        console.log('🎉 SUCCESS! Firebase user is ready');
        console.log('✅ Email: pooja.joshi@wipro.com');
        console.log('✅ Password: pooja.joshi');
        console.log('✅ Firebase UID:', result.uid);
        console.log('✅ Status: READY FOR APP LOGIN');
        
        if (result.updated) {
            console.log('✅ Action: UPDATED EXISTING USER');
        } else {
            console.log('✅ Action: CREATED NEW USER');
        }
        
        console.log('\n🚀 You can now login with these credentials in your Flutter app!');
        
    } else {
        console.log('❌ FAILED to create/update Firebase user');
        console.log('Error:', result.error);
        console.log('Code:', result.code);
        
        console.log('\n💡 TROUBLESHOOTING:');
        console.log('1. Check Firebase project configuration');
        console.log('2. Verify service account permissions');
        console.log('3. Ensure Firebase Admin SDK is properly initialized');
    }
    
}).catch(console.error);