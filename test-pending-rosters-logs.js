// Test script to verify if the filtering logs are working
// Run this in your browser console while on the pending rosters page

console.log('🔍 TESTING: Checking if filtering logs are working...');

// Override console.log to catch all debug messages
const originalLog = console.log;
const capturedLogs = [];

console.log = function(...args) {
  const message = args.join(' ');
  capturedLogs.push(message);
  
  // Show filtering-related logs
  if (message.includes('FILTERING') || 
      message.includes('FILTERED OUT') || 
      message.includes('INCLUDED') ||
      message.includes('Received') && message.includes('rosters') ||
      message.includes('📥') ||
      message.includes('🔍') ||
      message.includes('✅') ||
      message.includes('🚫')) {
    originalLog('🎯 CAPTURED:', ...args);
  }
  
  // Call original console.log
  originalLog(...args);
};

console.log('✅ Log capture enabled. Now click the refresh button on pending rosters.');
console.log('🔍 Looking for filtering logs...');

// After 30 seconds, show summary
setTimeout(() => {
  console.log('\n📊 LOG CAPTURE SUMMARY:');
  console.log(`Total logs captured: ${capturedLogs.length}`);
  
  const filteringLogs = capturedLogs.filter(log => 
    log.includes('FILTERING') || 
    log.includes('FILTERED OUT') || 
    log.includes('INCLUDED') ||
    log.includes('Received') && log.includes('rosters')
  );
  
  console.log(`Filtering-related logs: ${filteringLogs.length}`);
  
  if (filteringLogs.length === 0) {
    console.log('❌ NO FILTERING LOGS FOUND!');
    console.log('🔧 This confirms the filtering code is not running.');
  } else {
    console.log('✅ Filtering logs found:');
    filteringLogs.forEach(log => console.log('  -', log));
  }
  
  // Restore original console.log
  console.log = originalLog;
}, 30000);