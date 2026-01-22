// Simple test to debug Flutter HTTP issues
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  print('🔍 Testing Flutter HTTP client...');
  
  try {
    print('📡 Making request to health endpoint...');
    
    final response = await http.get(
      Uri.parse('http://localhost:3001/health'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ).timeout(
      const Duration(seconds: 10),
      onTimeout: () {
        print('❌ Request timed out after 10 seconds');
        throw Exception('Request timeout');
      },
    );
    
    print('✅ Request completed!');
    print('   Status: ${response.statusCode}');
    print('   Body: ${response.body}');
    
  } catch (e) {
    print('❌ Request failed: $e');
    print('   Error type: ${e.runtimeType}');
  }
}