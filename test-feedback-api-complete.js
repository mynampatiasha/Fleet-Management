// test-feedback-api-complete.js
// Complete test for all feedback API endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test admin token (you may need to update this)
const ADMIN_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4YzQwYWYzNzJkMGQyNzQxZWZiM2JmNzc5NzE4NzM2NzM5NzI2YzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXVkIjoiYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXV0aF90aW1lIjoxNzM1MjI5NzE5LCJ1c2VyX2lkIjoiVGVzdEFkbWluVXNlcjEyMyIsInN1YiI6IlRlc3RBZG1pblVzZXIxMjMiLCJpYXQiOjE3MzUyMjk3MTksImV4cCI6MTczNTIzMzMxOSwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiYWRtaW5AYWJyYWZsZWV0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.example';

async function testFeedbackAPI() {
    console.log('\n🧪 TESTING FEEDBACK API ENDPOINTS');
    console.log('='.repeat(80));

    try {
        // Test 1: Submit Customer Feedback
        console.log('\n📝 Test 1: Submit Customer Feedback');
        console.log('-'.repeat(50));
        
        const customerFeedback = {
            customer_name: 'John Customer',
            feedback_type: 'appreciation',
            subject: 'Great Service!',
            message: 'The fleet management service has been excellent. Very satisfied with the quality.',
            rating: 5
        };

        const customerResponse = await axios.post(
            `${BASE_URL}/api/feedback/customer/submit`,
            customerFeedback,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Customer feedback submitted:', customerResponse.data);

        // Test 2: Submit Driver Feedback
        console.log('\n🚗 Test 2: Submit Driver Feedback');
        console.log('-'.repeat(50));
        
        const driverFeedback = {
            driver_name: 'Mike Driver',
            feedback_type: 'suggestion',
            subject: 'Route Optimization Suggestion',
            message: 'I think we could improve fuel efficiency by optimizing the morning routes.',
            rating: 4
        };

        const driverResponse = await axios.post(
            `${BASE_URL}/api/feedback/driver/submit`,
            driverFeedback,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Driver feedback submitted:', driverResponse.data);

        // Test 3: Submit Employee Feedback
        console.log('\n👥 Test 3: Submit Employee Feedback');
        console.log('-'.repeat(50));
        
        const employeeFeedback = {
            employee_name: 'Sarah Employee',
            feedback_type: 'complaint',
            subject: 'System Performance Issue',
            message: 'The dashboard is loading very slowly during peak hours. This affects productivity.',
            rating: 2
        };

        const employeeResponse = await axios.post(
            `${BASE_URL}/api/feedback/employee/submit`,
            employeeFeedback,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Employee feedback submitted:', employeeResponse.data);

        // Test 4: Get All Customer Feedback (Admin)
        console.log('\n📋 Test 4: Get All Customer Feedback (Admin)');
        console.log('-'.repeat(50));
        
        const allCustomerFeedback = await axios.get(
            `${BASE_URL}/api/feedback/admin/all?source=customer&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            }
        );

        console.log('✅ Customer feedback retrieved:');
        console.log(`   Total: ${allCustomerFeedback.data.data.feedback.length}`);
        allCustomerFeedback.data.data.feedback.forEach((feedback, index) => {
            console.log(`   ${index + 1}. ${feedback.customer_name}: ${feedback.subject} (${feedback.feedback_type})`);
        });

        // Test 5: Get All Driver Feedback (Admin)
        console.log('\n🚗 Test 5: Get All Driver Feedback (Admin)');
        console.log('-'.repeat(50));
        
        const allDriverFeedback = await axios.get(
            `${BASE_URL}/api/feedback/admin/all?source=driver&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            }
        );

        console.log('✅ Driver feedback retrieved:');
        console.log(`   Total: ${allDriverFeedback.data.data.feedback.length}`);
        allDriverFeedback.data.data.feedback.forEach((feedback, index) => {
            console.log(`   ${index + 1}. ${feedback.driver_name}: ${feedback.subject} (${feedback.feedback_type})`);
        });

        // Test 6: Get All Employee Feedback (Admin)
        console.log('\n👥 Test 6: Get All Employee Feedback (Admin)');
        console.log('-'.repeat(50));
        
        const allEmployeeFeedback = await axios.get(
            `${BASE_URL}/api/feedback/admin/all?source=employee&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            }
        );

        console.log('✅ Employee feedback retrieved:');
        console.log(`   Total: ${allEmployeeFeedback.data.data.feedback.length}`);
        allEmployeeFeedback.data.data.feedback.forEach((feedback, index) => {
            console.log(`   ${index + 1}. ${feedback.employee_name}: ${feedback.subject} (${feedback.feedback_type})`);
        });

        // Test 7: Get ALL Feedback from All Sources
        console.log('\n🌐 Test 7: Get ALL Feedback from All Sources');
        console.log('-'.repeat(50));
        
        const allFeedback = await axios.get(
            `${BASE_URL}/api/feedback/admin/all?source=all&limit=50`,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            }
        );

        console.log('✅ All feedback retrieved:');
        console.log(`   Total: ${allFeedback.data.data.feedback.length}`);
        
        // Group by source
        const feedbackBySource = allFeedback.data.data.feedback.reduce((acc, feedback) => {
            const source = feedback.source || 'unknown';
            if (!acc[source]) acc[source] = [];
            acc[source].push(feedback);
            return acc;
        }, {});

        Object.keys(feedbackBySource).forEach(source => {
            console.log(`   ${source.toUpperCase()}: ${feedbackBySource[source].length} entries`);
        });

        // Test 8: Admin Reply to Feedback
        if (allCustomerFeedback.data.data.feedback.length > 0) {
            console.log('\n💬 Test 8: Admin Reply to Customer Feedback');
            console.log('-'.repeat(50));
            
            const firstFeedback = allCustomerFeedback.data.data.feedback[0];
            
            const replyResponse = await axios.post(
                `${BASE_URL}/api/feedback/admin/reply`,
                {
                    feedback_id: firstFeedback._id,
                    feedback_source: 'customer',
                    response: 'Thank you for your positive feedback! We appreciate your business and will continue to provide excellent service.'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Admin reply sent:', replyResponse.data);
        }

        // Test 9: Get Feedback Statistics
        console.log('\n📊 Test 9: Get Feedback Statistics');
        console.log('-'.repeat(50));
        
        const stats = await axios.get(
            `${BASE_URL}/api/feedback/stats?source=all`,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            }
        );

        console.log('✅ Feedback statistics:');
        console.log(`   Total: ${stats.data.data.total}`);
        console.log(`   Pending: ${stats.data.data.pending}`);
        console.log(`   Responded: ${stats.data.data.responded}`);
        console.log(`   Average Rating: ${stats.data.data.avg_rating}`);
        console.log(`   Recent (30 days): ${stats.data.data.recent_count}`);
        console.log('   By Type:', stats.data.data.by_type);

        console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('='.repeat(80));
    }
}

// Run the test
testFeedbackAPI();