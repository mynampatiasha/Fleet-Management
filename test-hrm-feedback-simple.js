// test-hrm-feedback-simple.js
// Simple test to verify HRM feedback system

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testHRMFeedback() {
    console.log('\n🧪 TESTING HRM FEEDBACK SYSTEM');
    console.log('='.repeat(60));

    try {
        // Test without auth first to see if endpoints exist
        console.log('\n📋 Test 1: Check if feedback endpoints exist');
        console.log('-'.repeat(40));
        
        try {
            const response = await axios.get(`${BASE_URL}/api/feedback/stats`);
            console.log('❌ Endpoint accessible without auth (security issue)');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Endpoint properly protected (401 Unauthorized)');
            } else {
                console.log('⚠️  Unexpected response:', error.response?.status);
            }
        }

        // Test with a simple token (you'll need to update this)
        console.log('\n📊 Test 2: Get feedback statistics');
        console.log('-'.repeat(40));
        
        // You'll need to get a valid token from your Firebase auth
        const testToken = 'your-firebase-token-here';
        
        try {
            const statsResponse = await axios.get(
                `${BASE_URL}/api/feedback/stats?source=all`,
                {
                    headers: {
                        'Authorization': `Bearer ${testToken}`
                    }
                }
            );
            
            console.log('✅ Statistics retrieved:', statsResponse.data);
        } catch (error) {
            console.log('⚠️  Auth required. Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
        }

        console.log('\n📝 Test 3: Submit sample feedback');
        console.log('-'.repeat(40));
        
        const sampleFeedback = {
            customer_name: 'Test Customer',
            feedback_type: 'general',
            subject: 'Test Feedback',
            message: 'This is a test feedback message.',
            rating: 5
        };

        try {
            const submitResponse = await axios.post(
                `${BASE_URL}/api/feedback/customer/submit`,
                sampleFeedback,
                {
                    headers: {
                        'Authorization': `Bearer ${testToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Feedback submitted:', submitResponse.data);
        } catch (error) {
            console.log('⚠️  Submission failed. Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
        }

        console.log('\n📋 Test 4: Get all customer feedback (admin)');
        console.log('-'.repeat(40));
        
        try {
            const allFeedbackResponse = await axios.get(
                `${BASE_URL}/api/feedback/admin/all?source=customer&limit=5`,
                {
                    headers: {
                        'Authorization': `Bearer ${testToken}`
                    }
                }
            );
            
            console.log('✅ All feedback retrieved:');
            console.log(`   Total: ${allFeedbackResponse.data.data?.feedback?.length || 0}`);
            
            if (allFeedbackResponse.data.data?.feedback?.length > 0) {
                allFeedbackResponse.data.data.feedback.forEach((feedback, index) => {
                    console.log(`   ${index + 1}. ${feedback.customer_name || feedback.name}: ${feedback.subject}`);
                });
            }
        } catch (error) {
            console.log('⚠️  Failed to get feedback. Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
        }

        console.log('\n✅ HRM FEEDBACK TEST COMPLETED');
        console.log('='.repeat(60));
        console.log('\n📝 NEXT STEPS:');
        console.log('1. Update the testToken with a valid Firebase auth token');
        console.log('2. Ensure the backend is running on port 3001');
        console.log('3. Check that MongoDB is connected');
        console.log('4. Verify Firebase auth middleware is working');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error.message);
        console.error('='.repeat(60));
    }
}

// Run the test
testHRMFeedback();