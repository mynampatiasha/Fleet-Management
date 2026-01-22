// Test script to check what URL Flutter is using
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  // Load environment
  try {
    await dotenv.load(fileName: ".env");
    debugPrint("✅ Environment variables loaded");
  } catch (e) {
    debugPrint("⚠️ Warning: Could not load .env file: $e");
  }
  
  // Check what URL we're using
  final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:3001';
  debugPrint("🌐 Base URL from env: $baseUrl");
  
  // Test the health endpoint
  try {
    final healthUrl = '$baseUrl/health';
    debugPrint("🧪 Testing health endpoint: $healthUrl");
    
    final response = await http.get(Uri.parse(healthUrl));
    debugPrint("✅ Health check: ${response.statusCode}");
    debugPrint("📄 Response: ${response.body}");
  } catch (e) {
    debugPrint("❌ Health check failed: $e");
  }
  
  // Test the assignment endpoint (should get 401, not 404)
  try {
    final assignUrl = '$baseUrl/api/assignment/assign-group';
    debugPrint("🧪 Testing assignment endpoint: $assignUrl");
    
    final response = await http.post(
      Uri.parse(assignUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'rosterIds': ['507f1f77bcf86cd799439011'],
        'vehicleId': '507f1f77bcf86cd799439013'
      }),
    );
    
    debugPrint("📊 Assignment endpoint: ${response.statusCode}");
    debugPrint("📄 Response: ${response.body}");
    
    if (response.statusCode == 404) {
      debugPrint("❌ 404 ERROR - Endpoint not found!");
      debugPrint("❌ This means Flutter is hitting the wrong URL");
    } else if (response.statusCode == 401) {
      debugPrint("✅ 401 UNAUTHORIZED - Endpoint exists, just needs auth");
    }
    
  } catch (e) {
    debugPrint("❌ Assignment test failed: $e");
  }
}