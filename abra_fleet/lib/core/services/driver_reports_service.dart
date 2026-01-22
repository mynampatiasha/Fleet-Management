// lib/core/services/driver_reports_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:abra_fleet/app/config/api_config.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';

class DriverReportsService {
  // Make baseUrl public (remove underscore)
  static String get baseUrl => ApiConfig.baseUrl;
  
  // Initialize Dio with ApiConfig directly
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl, // Use ApiConfig.baseUrl directly
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    ),
  );
  
  // Make _getAuthToken public (remove underscore)
  Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  // Helper method to make authenticated requests
  Future<Map<String, String>> _getHeaders() async {
    final token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Fetch performance summary
  Future<PerformanceSummary> getPerformanceSummary({String? driverId}) async {
    try {
      final headers = await _getHeaders();
      // ApiConfig.baseUrl already contains the full base URL
      final url = driverId != null 
        ? '${ApiConfig.baseUrl}/api/driver/reports/performance-summary?driverId=$driverId'
        : '${ApiConfig.baseUrl}/api/driver/reports/performance-summary';
      
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PerformanceSummary.fromJson(data['data']);
      } else {
        throw Exception('Failed to load performance summary: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching performance summary: $e');
    }
  }

  /// Fetch daily analytics
  Future<DailyAnalytics> getDailyAnalytics({String? driverId, DateTime? date}) async {
    try {
      final headers = await _getHeaders();
      var url = '${ApiConfig.baseUrl}/api/driver/reports/daily-analytics';
      
      final params = <String, String>{};
      if (driverId != null) params['driverId'] = driverId;
      if (date != null) params['date'] = date.toIso8601String();
      
      if (params.isNotEmpty) {
        url += '?' + params.entries.map((e) => '${e.key}=${e.value}').join('&');
      }

      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return DailyAnalytics.fromJson(data['data']);
      } else {
        throw Exception('Failed to load daily analytics: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching daily analytics: $e');
    }
  }

  /// Fetch filtered trips
  Future<TripsResponse> getFilteredTrips({
    String? driverId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final headers = await _getHeaders();
      var url = '${ApiConfig.baseUrl}/api/driver/reports/trips';
      
      final params = <String, String>{};
      if (driverId != null) params['driverId'] = driverId;
      if (startDate != null) params['startDate'] = startDate.toIso8601String();
      if (endDate != null) params['endDate'] = endDate.toIso8601String();
      
      if (params.isNotEmpty) {
        url += '?' + params.entries.map((e) => '${e.key}=${e.value}').join('&');
      }

      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return TripsResponse.fromJson(data['data']);
      } else {
        throw Exception('Failed to load trips: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching trips: $e');
    }
  }

  /// Generate a report and return its details
  Future<GeneratedReport> generateReport({
    String? type,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final headers = await _getHeaders();
      Map<String, dynamic> body;

      if (type != null) {
        body = {'type': type};
      } else if (startDate != null) {
        body = {
          'type': 'custom',
          'startDate': startDate.toIso8601String(),
          if (endDate != null) 'endDate': endDate.toIso8601String(),
        };
      } else {
        throw Exception('Must provide either a report type or a start date.');
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/driver/reports/generate'),
        headers: headers,
        body: json.encode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return GeneratedReport.fromJson(data['data']);
      } else {
        final errorData = json.decode(response.body);
        final errorMessage = errorData['message'] ?? response.body;
        throw Exception('Failed to generate report: $errorMessage');
      }
    } catch (e) {
      throw Exception('Error generating report: $e');
    }
  }

  /// Downloads the report file
  Future<String> downloadReport(String reportId) async {
    final tempDir = await getTemporaryDirectory();
    final filePath = '${tempDir.path}/report-$reportId.pdf';
    
    try {
      final token = await getAuthToken();

      await _dio.download(
        '${ApiConfig.baseUrl}/api/driver/reports/download/$reportId',
        filePath,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return filePath;
    } catch (e) {
      // Fallback to local PDF generation if backend download fails
      try {
        final pdfBytes = await _generateLocalReportPDF(reportId);
        final file = File(filePath);
        await file.writeAsBytes(pdfBytes);
        return filePath;
      } catch (fallbackError) {
        throw Exception('Error downloading report: $e. Fallback error: $fallbackError');
      }
    }
  }

  /// Generate local PDF report with real data from APIs
  Future<Uint8List> _generateLocalReportPDF(String reportId) async {
    final pdf = pw.Document();
    final now = DateTime.now();
    final formatter = DateFormat('dd/MM/yyyy');
    
    // Get real data from APIs
    final performanceData = await getPerformanceSummary();
    final dailyData = await getDailyAnalytics();
    final tripsData = await getFilteredTrips();
    
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            // Header
            pw.Container(
              padding: const pw.EdgeInsets.only(bottom: 20),
              decoration: const pw.BoxDecoration(
                border: pw.Border(bottom: pw.BorderSide(width: 2, color: PdfColors.blue)),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('ABRA FLEET MANAGEMENT', 
                        style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
                      pw.SizedBox(height: 5),
                      pw.Text('Driver Performance Report', 
                        style: pw.TextStyle(fontSize: 16, color: PdfColors.grey700)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Report ID: $reportId', style: const pw.TextStyle(fontSize: 12)),
                      pw.Text('Generated: ${formatter.format(now)}', style: const pw.TextStyle(fontSize: 12)),
                      pw.Text('Driver: Demo Driver', style: const pw.TextStyle(fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            
            pw.SizedBox(height: 30),
            
            // Performance Summary Section
            pw.Text('PERFORMANCE SUMMARY', 
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
            pw.SizedBox(height: 15),
            
            pw.Container(
              padding: const pw.EdgeInsets.all(15),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: PdfColors.grey300),
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(5)),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                children: [
                  _buildStatColumn('Total Trips', '${performanceData.totalTrips}'),
                  _buildStatColumn('Average Rating', '${performanceData.avgRating}/5.0'),
                  _buildStatColumn('On-Time %', '${performanceData.onTimePercentage}%'),
                  _buildStatColumn('Total Distance', '${performanceData.totalKm} km'),
                ],
              ),
            ),
            
            pw.SizedBox(height: 30),
            
            // Today's Analytics Section
            pw.Text('TODAY\'S ANALYTICS', 
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
            pw.SizedBox(height: 15),
            
            pw.Container(
              padding: const pw.EdgeInsets.all(15),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: PdfColors.grey300),
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(5)),
              ),
              child: pw.Column(
                children: [
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Working Hours:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text(dailyData.workingHours),
                    ],
                  ),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Fuel Efficiency:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text(dailyData.fuelEfficiency),
                    ],
                  ),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Trips Today:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('${dailyData.tripsToday}'),
                    ],
                  ),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Distance Today:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('${dailyData.distanceToday} km'),
                    ],
                  ),
                ],
              ),
            ),
            
            pw.SizedBox(height: 30),
            
            // Recent Trips Section
            pw.Text('RECENT TRIPS', 
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
            pw.SizedBox(height: 15),
            
            pw.Table(
              border: pw.TableBorder.all(color: PdfColors.grey300),
              columnWidths: {
                0: const pw.FlexColumnWidth(2),
                1: const pw.FlexColumnWidth(2),
                2: const pw.FlexColumnWidth(1.5),
                3: const pw.FlexColumnWidth(1),
                4: const pw.FlexColumnWidth(1),
              },
              children: [
                // Header row
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColors.grey100),
                  children: [
                    _buildTableCell('Customer Name', isHeader: true),
                    _buildTableCell('Trip Number', isHeader: true),
                    _buildTableCell('Date', isHeader: true),
                    _buildTableCell('Distance', isHeader: true),
                    _buildTableCell('Rating', isHeader: true),
                  ],
                ),
                // Data rows
                ...tripsData.trips.take(10).map((trip) => pw.TableRow(
                  children: [
                    _buildTableCell(trip.customerName),
                    _buildTableCell(trip.tripNumber),
                    _buildTableCell(trip.startTime != null ? formatter.format(trip.startTime!) : 'N/A'),
                    _buildTableCell('${trip.distance.toStringAsFixed(1)} km'),
                    _buildTableCell(trip.rating != null ? '${trip.rating!.toStringAsFixed(1)}⭐' : 'N/A'),
                  ],
                )),
              ],
            ),
            
            pw.SizedBox(height: 30),
            
            // Trip Summary
            pw.Text('TRIP SUMMARY', 
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
            pw.SizedBox(height: 15),
            
            pw.Container(
              padding: const pw.EdgeInsets.all(15),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: PdfColors.grey300),
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(5)),
              ),
              child: pw.Column(
                children: [
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Total Trips:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('${tripsData.summary.totalTrips}'),
                    ],
                  ),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Completed Trips:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('${tripsData.summary.completedTrips}'),
                    ],
                  ),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Total Distance:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('${tripsData.summary.totalDistance} km'),
                    ],
                  ),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Total Duration:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('${tripsData.summary.totalDurationHours} hours'),
                    ],
                  ),
                ],
              ),
            ),
            
            pw.SizedBox(height: 40),
            
            // Footer
            pw.Container(
              padding: const pw.EdgeInsets.only(top: 20),
              decoration: const pw.BoxDecoration(
                border: pw.Border(top: pw.BorderSide(width: 1, color: PdfColors.grey300)),
              ),
              child: pw.Center(
                child: pw.Column(
                  children: [
                    pw.Text('This is a demo report generated for visualization purposes.',
                      style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                    pw.SizedBox(height: 5),
                    pw.Text('© 2024 ABRA Fleet Management System',
                      style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                  ],
                ),
              ),
            ),
          ];
        },
      ),
    );
    
    return pdf.save();
  }

  pw.Widget _buildStatColumn(String label, String value) {
    return pw.Column(
      children: [
        pw.Text(value, 
          style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
        pw.SizedBox(height: 5),
        pw.Text(label, 
          style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey700)),
      ],
    );
  }

  pw.Widget _buildTableCell(String text, {bool isHeader = false}) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(8),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          fontSize: isHeader ? 12 : 10,
          fontWeight: isHeader ? pw.FontWeight.bold : pw.FontWeight.normal,
        ),
      ),
    );
  }

  /// Get report history
  Future<List<ReportSummary>> getReportHistory({
    String? type,
    int limit = 10,
  }) async {
    try {
      final headers = await _getHeaders();
      var url = '$baseUrl/driver/reports/history?limit=$limit';
      if (type != null) url += '&type=$type';

      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data'] as List)
            .map((item) => ReportSummary.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to load report history: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching report history: $e');
    }
  }
}

// Data Models
class PerformanceSummary {
  final int totalTrips;
  final double avgRating;
  final int onTimePercentage;
  final int totalKm;

  PerformanceSummary({
    required this.totalTrips,
    required this.avgRating,
    required this.onTimePercentage,
    required this.totalKm,
  });

  factory PerformanceSummary.fromJson(Map<String, dynamic> json) {
    return PerformanceSummary(
      totalTrips: json['totalTrips'] ?? 0,
      avgRating: (json['avgRating'] ?? 0).toDouble(),
      onTimePercentage: json['onTimePercentage'] ?? 0,
      totalKm: json['totalKm'] ?? 0,
    );
  }
}

class DailyAnalytics {
  final String workingHours;
  final String fuelEfficiency;
  final int tripsToday;
  final String distanceToday;

  DailyAnalytics({
    required this.workingHours,
    required this.fuelEfficiency,
    required this.tripsToday,
    required this.distanceToday,
  });

  factory DailyAnalytics.fromJson(Map<String, dynamic> json) {
    return DailyAnalytics(
      workingHours: json['workingHours'] ?? '0h 0min',
      fuelEfficiency: json['fuelEfficiency'] ?? 'N/A',
      tripsToday: json['tripsToday'] ?? 0,
      distanceToday: json['distanceToday']?.toString() ?? '0',
    );
  }
}

class TripInfo {
  final String id;
  final String tripNumber;
  final DateTime? startTime;
  final DateTime? endTime;
  final String status;
  final double distance;
  final double? rating;
  final String customerName;

  TripInfo({
    required this.id,
    required this.tripNumber,
    this.startTime,
    this.endTime,
    required this.status,
    required this.distance,
    this.rating,
    required this.customerName,
  });

  factory TripInfo.fromJson(Map<String, dynamic> json) {
    return TripInfo(
      id: json['id'] ?? '',
      tripNumber: json['tripNumber'] ?? 'N/A',
      startTime: json['startTime'] != null ? DateTime.parse(json['startTime']) : null,
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime']) : null,
      status: json['status'] ?? 'unknown',
      distance: (json['distance'] ?? 0).toDouble(),
      rating: json['rating']?.toDouble(),
      customerName: json['customerName'] ?? 'N/A',
    );
  }
}

class TripsSummary {
  final int totalTrips;
  final int completedTrips;
  final String totalDistance;
  final String totalDurationHours;

  TripsSummary({
    required this.totalTrips,
    required this.completedTrips,
    required this.totalDistance,
    required this.totalDurationHours,
  });

  factory TripsSummary.fromJson(Map<String, dynamic> json) {
    return TripsSummary(
      totalTrips: json['totalTrips'] ?? 0,
      completedTrips: json['completedTrips'] ?? 0,
      totalDistance: json['totalDistance']?.toString() ?? '0',
      totalDurationHours: json['totalDurationHours']?.toString() ?? '0',
    );
  }
}

class TripsResponse {
  final List<TripInfo> trips;
  final TripsSummary summary;

  TripsResponse({required this.trips, required this.summary});

  factory TripsResponse.fromJson(Map<String, dynamic> json) {
    return TripsResponse(
      trips: (json['trips'] as List)
          .map((item) => TripInfo.fromJson(item))
          .toList(),
      summary: TripsSummary.fromJson(json['summary']),
    );
  }
}

class GeneratedReport {
  final String reportId;
  final Map<String, dynamic> report;

  GeneratedReport({required this.reportId, required this.report});

  factory GeneratedReport.fromJson(Map<String, dynamic> json) {
    return GeneratedReport(
      reportId: json['reportId'] ?? '',
      report: json['report'] ?? {},
    );
  }
}

class ReportSummary {
  final String id;
  final String type;
  final DateTime generatedAt;
  final Map<String, dynamic> summary;

  ReportSummary({
    required this.id,
    required this.type,
    required this.generatedAt,
    required this.summary,
  });

  factory ReportSummary.fromJson(Map<String, dynamic> json) {
    return ReportSummary(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      generatedAt: DateTime.parse(json['generatedAt']),
      summary: json['summary'] ?? {},
    );
  }
}