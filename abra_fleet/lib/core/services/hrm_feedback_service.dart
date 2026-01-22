// lib/core/services/hrm_feedback_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/hrm_feedback/domain/models/hrm_feedback_model.dart';
import 'package:abra_fleet/app/config/api_config.dart';

class HrmFeedbackService {
  final String baseUrl = ApiConfig.baseUrl;

  // Get auth token
  Future<String?> _getAuthToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('jwt_token');
    } catch (e) {
      print('❌ Error getting auth token: $e');
      return null;
    }
  }

  // Submit Customer Feedback
  Future<Map<String, dynamic>> submitCustomerFeedback({
    required String customerName,
    required String feedbackType,
    required String subject,
    required String message,
    required int rating,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📤 Submitting customer feedback...');
      print('   Subject: $subject');
      print('   Type: $feedbackType');
      print('   Rating: $rating');

      final response = await http.post(
        Uri.parse('$baseUrl/api/feedback/customer/submit'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'customer_name': customerName,
          'feedback_type': feedbackType,
          'subject': subject,
          'message': message,
          'rating': rating,
        }),
      );

      print('📥 Response status: ${response.statusCode}');
      print('📥 Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Feedback submitted successfully');
        return {
          'success': true,
          'message': data['message'],
          'feedback_id': data['data']?['feedback_id'],
          'ticket_id': data['data']?['ticket_id'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to submit feedback');
      }
    } catch (e) {
      print('❌ Error submitting customer feedback: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  // Submit Employee Feedback
  Future<Map<String, dynamic>> submitEmployeeFeedback({
    required String employeeName,
    required String feedbackType,
    required String subject,
    required String message,
    required int rating,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📤 Submitting employee feedback...');

      final response = await http.post(
        Uri.parse('$baseUrl/api/feedback/employee/submit'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'employee_name': employeeName,
          'feedback_type': feedbackType,
          'subject': subject,
          'message': message,
          'rating': rating,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Employee feedback submitted successfully');
        return {
          'success': true,
          'message': data['message'],
          'feedback_id': data['data']?['feedback_id'],
          'ticket_id': data['data']?['ticket_id'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to submit feedback');
      }
    } catch (e) {
      print('❌ Error submitting employee feedback: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  // Submit Driver Feedback
  Future<Map<String, dynamic>> submitDriverFeedback({
    required String driverName,
    required String feedbackType,
    required String subject,
    required String message,
    required int rating,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📤 Submitting driver feedback...');

      final response = await http.post(
        Uri.parse('$baseUrl/api/feedback/driver/submit'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'driver_name': driverName,
          'feedback_type': feedbackType,
          'subject': subject,
          'message': message,
          'rating': rating,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Driver feedback submitted successfully');
        return {
          'success': true,
          'message': data['message'],
          'feedback_id': data['data']?['feedback_id'],
          'ticket_id': data['data']?['ticket_id'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to submit feedback');
      }
    } catch (e) {
      print('❌ Error submitting driver feedback: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  // Get My Feedback (Customer or Employee)
  Future<List<HrmFeedbackModel>> getMyFeedback(String source) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📥 Fetching my feedback (source: $source)...');

      final response = await http.get(
        Uri.parse('$baseUrl/api/feedback/my-feedback/$source'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List<dynamic> feedbackList = data['data'] ?? [];
        print('✅ Fetched ${feedbackList.length} feedback entries');

        return feedbackList
            .map((json) => HrmFeedbackModel.fromJson({
                  ...json,
                  'source': source,
                }))
            .toList();
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch feedback');
      }
    } catch (e) {
      print('❌ Error fetching my feedback: $e');
      return [];
    }
  }

  // Submit User Reply to Admin Response
  Future<Map<String, dynamic>> submitUserReply({
    required String source,
    required String originalFeedbackId,
    required String userName,
    required String originalSubject,
    required String replyMessage,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📤 Submitting user reply...');

      final response = await http.post(
        Uri.parse('$baseUrl/api/feedback/reply/$source'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'original_feedback_id': originalFeedbackId,
          'user_name': userName,
          'original_subject': originalSubject,
          'reply_message': replyMessage,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Reply submitted successfully');
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to submit reply');
      }
    } catch (e) {
      print('❌ Error submitting reply: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  // Get All Feedback (Admin) - Simple version for HRM screens
  Future<List<HrmFeedbackModel>> getAllFeedback(String source) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📥 Fetching all $source feedback (admin)...');

      final response = await http.get(
        Uri.parse('$baseUrl/api/feedback/admin/all?source=$source&limit=100'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List<dynamic> feedbackList = data['data']['feedback'] ?? [];
        print('✅ Fetched ${feedbackList.length} $source feedback entries (admin)');

        return feedbackList
            .map((json) => HrmFeedbackModel.fromJson(json))
            .toList();
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch feedback');
      }
    } catch (e) {
      print('❌ Error fetching all $source feedback: $e');
      return [];
    }
  }

  // Get All Feedback from ALL sources (Admin) - For comprehensive HRM view
  Future<Map<String, dynamic>> getAllFeedbackFromAllSources({
    String? name,
    String? type,
    String? status,
    String? dateFrom,
    String? dateTo,
    int page = 1,
    int limit = 100,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📥 Fetching ALL feedback from all sources (admin)...');

      final queryParams = {
        'source': 'all', // Get from all sources
        if (name != null && name.isNotEmpty) 'name': name,
        if (type != null && type != 'all') 'type': type,
        if (status != null && status != 'all') 'status': status,
        if (dateFrom != null && dateFrom.isNotEmpty) 'date_from': dateFrom,
        if (dateTo != null && dateTo.isNotEmpty) 'date_to': dateTo,
        'page': page.toString(),
        'limit': limit.toString(),
      };

      final uri = Uri.parse('$baseUrl/api/feedback/admin/all')
          .replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List<dynamic> feedbackList = data['data']['feedback'] ?? [];
        print('✅ Fetched ${feedbackList.length} feedback entries from all sources (admin)');

        final feedback = feedbackList
            .map((json) => HrmFeedbackModel.fromJson(json))
            .toList();

        return {
          'success': true,
          'feedback': feedback,
          'pagination': data['data']['pagination'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch feedback');
      }
    } catch (e) {
      print('❌ Error fetching all feedback from all sources: $e');
      return {
        'success': false,
        'message': e.toString(),
        'feedback': <HrmFeedbackModel>[],
        'pagination': {
          'total': 0,
          'page': 1,
          'limit': 100,
          'totalPages': 0,
        },
      };
    }
  }

  // Get All Feedback (Admin) - Detailed version with pagination
  Future<Map<String, dynamic>> getAllFeedbackDetailed({
    String source = 'all',
    String? name,
    String? type,
    String? status,
    String? dateFrom,
    String? dateTo,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📥 Fetching all feedback (admin)...');

      final queryParams = {
        'source': source,
        if (name != null && name.isNotEmpty) 'name': name,
        if (type != null && type != 'all') 'type': type,
        if (status != null && status != 'all') 'status': status,
        if (dateFrom != null && dateFrom.isNotEmpty) 'date_from': dateFrom,
        if (dateTo != null && dateTo.isNotEmpty) 'date_to': dateTo,
        'page': page.toString(),
        'limit': limit.toString(),
      };

      final uri = Uri.parse('$baseUrl/api/feedback/admin/all')
          .replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List<dynamic> feedbackList = data['data']['feedback'] ?? [];
        print('✅ Fetched ${feedbackList.length} feedback entries (admin)');

        final feedback = feedbackList
            .map((json) => HrmFeedbackModel.fromJson(json))
            .toList();

        return {
          'success': true,
          'feedback': feedback,
          'pagination': data['data']['pagination'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch feedback');
      }
    } catch (e) {
      print('❌ Error fetching all feedback: $e');
      return {
        'success': false,
        'message': e.toString(),
        'feedback': <HrmFeedbackModel>[],
        'pagination': {
          'total': 0,
          'page': 1,
          'limit': 20,
          'totalPages': 0,
        },
      };
    }
  }

  // Admin Reply to Feedback
  Future<Map<String, dynamic>> adminReplyToFeedback({
    required String feedbackId,
    required String feedbackSource,
    required String response,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📤 Sending admin reply...');

      final apiResponse = await http.post(
        Uri.parse('$baseUrl/api/feedback/admin/reply'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'feedback_id': feedbackId,
          'feedback_source': feedbackSource,
          'response': response,
        }),
      );

      final data = jsonDecode(apiResponse.body);

      if (apiResponse.statusCode == 200 && data['success'] == true) {
        print('✅ Admin reply sent successfully');
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        throw Exception(data['message'] ?? 'Failed to send response');
      }
    } catch (e) {
      print('❌ Error sending admin reply: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  // Get Feedback Statistics
  Future<HrmFeedbackStats?> getFeedbackStats({String source = 'all'}) async {
    try {
      final token = await _getAuthToken();
      if (token == null) throw Exception('Not authenticated');

      print('📊 Fetching feedback statistics...');

      final response = await http.get(
        Uri.parse('$baseUrl/api/feedback/stats?source=$source'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Statistics fetched successfully');
        return HrmFeedbackStats.fromJson(data['data']);
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch statistics');
      }
    } catch (e) {
      print('❌ Error fetching statistics: $e');
      return null;
    }
  }
}