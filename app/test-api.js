const fs = require('fs');
const path = require('path');

// Test API endpoints
async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing UDF Service API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test formats endpoint
    console.log('\n2. Testing formats endpoint...');
    const formatsResponse = await fetch(`${baseURL}/api/udf/formats`);
    const formatsData = await formatsResponse.json();
    console.log('✅ Supported formats:', formatsData);

    // Test UDF health endpoint
    console.log('\n3. Testing UDF service health...');
    const udfHealthResponse = await fetch(`${baseURL}/api/udf/health`);
    const udfHealthData = await udfHealthResponse.json();
    console.log('✅ UDF service health:', udfHealthData);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📚 API Documentation:');
    console.log('- GET  /health                    - General health check');
    console.log('- GET  /api/udf/formats          - Get supported formats');
    console.log('- GET  /api/udf/health           - UDF service health');
    console.log('- POST /api/udf/convert          - Convert file');
    console.log('- GET  /api/udf/download/:file   - Download converted file');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run tests
testAPI(); 