// File: lib/features/admin/reports/presentation/screens/admin_reports_screen.dart
// Placeholder screen for Admin to view various reports, now with navigation.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:abra_fleet/features/admin/vehicle_management/presentation/providers/vehicle_provider.dart';
import 'package:abra_fleet/features/admin/driver_management/presentation/providers/driver_provider.dart';
import 'package:abra_fleet/features/admin/customer_management/presentation/providers/customer_provider.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  String _selectedTimeRange = 'This Month';
  final List<String> _timeRanges = ['This Week', 'This Month', 'Last 3 Months', 'This Year'];

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isDesktop = screenSize.width > 1200;
    final isTablet = screenSize.width > 800;

    return Consumer3<VehicleProvider, DriverProvider, CustomerProvider>(
      builder: (context, vehicleProvider, driverProvider, customerProvider, _) {
        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: SingleChildScrollView(
            padding: EdgeInsets.all(isDesktop ? 32 : 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with Time Range Selector
                _buildHeader(),
                const SizedBox(height: 32),

                // Key Metrics Row
                _buildKeyMetricsRow(vehicleProvider, driverProvider, customerProvider, isDesktop),
                const SizedBox(height: 32),

                // Charts Section
                if (isDesktop)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: _buildGrowthChart()),
                      const SizedBox(width: 24),
                      Expanded(flex: 1, child: _buildPieChart()),
                    ],
                  )
                else ...[
                  _buildGrowthChart(),
                  const SizedBox(height: 24),
                  _buildPieChart(),
                ],

                const SizedBox(height: 32),

                // Performance Metrics
                _buildPerformanceMetrics(isDesktop),
                const SizedBox(height: 32),

                // Detailed Analytics Tables
                _buildDetailedAnalytics(vehicleProvider, driverProvider, customerProvider, isDesktop),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Analytics Dashboard',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Comprehensive fleet management insights',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButton<String>(
              value: _selectedTimeRange,
              dropdownColor: Theme.of(context).primaryColor,
              underline: const SizedBox(),
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              items: _timeRanges.map((range) {
                return DropdownMenuItem(
                  value: range,
                  child: Text(range, style: const TextStyle(color: Colors.white)),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedTimeRange = value!;
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKeyMetricsRow(VehicleProvider vehicleProvider, DriverProvider driverProvider, CustomerProvider customerProvider, bool isDesktop) {
    final metrics = [
      {'title': 'Total Revenue', 'value': '\$45,230', 'change': '+12%', 'color': Colors.green, 'icon': Icons.attach_money},
      {'title': 'Active Trips', 'value': '127', 'change': '+8%', 'color': Colors.blue, 'icon': Icons.local_shipping},
      {'title': 'Fuel Efficiency', 'value': '24.5 MPG', 'change': '+3%', 'color': Colors.orange, 'icon': Icons.local_gas_station},
      {'title': 'Customer Satisfaction', 'value': '4.8/5', 'change': '+0.2', 'color': Colors.purple, 'icon': Icons.star},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: isDesktop ? 4 : 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: isDesktop ? 1.2 : 1.1,
      ),
      itemCount: metrics.length,
      itemBuilder: (context, index) {
        final metric = metrics[index];
        return _buildMetricCard(metric);
      },
    );
  }

  Widget _buildMetricCard(Map<String, dynamic> metric) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (metric['color'] as Color).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  metric['icon'] as IconData,
                  color: metric['color'] as Color,
                  size: 20,
                ),
              ),
              Text(
                metric['change'] as String,
                style: TextStyle(
                  color: metric['color'] as Color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const Spacer(),
          Text(
            metric['value'] as String,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            metric['title'] as String,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGrowthChart() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Growth Analytics',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 300,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(show: true, drawHorizontalLine: true),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32)),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: [
                      FlSpot(0, 3),
                      FlSpot(1, 4),
                      FlSpot(2, 3.5),
                      FlSpot(3, 5),
                      FlSpot(4, 4),
                      FlSpot(5, 6),
                      FlSpot(6, 5.5),
                    ],
                    isCurved: true,
                    color: Theme.of(context).primaryColor,
                    barWidth: 3,
                    dotData: FlDotData(show: true),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPieChart() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Fleet Distribution',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sections: [
                  PieChartSectionData(value: 40, color: Colors.blue, title: 'Trucks'),
                  PieChartSectionData(value: 30, color: Colors.green, title: 'Vans'),
                  PieChartSectionData(value: 20, color: Colors.orange, title: 'Cars'),
                  PieChartSectionData(value: 10, color: Colors.red, title: 'Others'),
                ],
                centerSpaceRadius: 40,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceMetrics(bool isDesktop) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Performance Metrics',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: isDesktop ? 3 : 1,
            childAspectRatio: isDesktop ? 4 : 8,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildPerformanceItem('Average Trip Time', '2.5 hrs', Icons.timer, Colors.blue),
              _buildPerformanceItem('Vehicle Utilization', '87%', Icons.speed, Colors.green),
              _buildPerformanceItem('Maintenance Cost', '\$1,240', Icons.build, Colors.orange),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceItem(String title, String value, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailedAnalytics(VehicleProvider vehicleProvider, DriverProvider driverProvider, CustomerProvider customerProvider, bool isDesktop) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detailed Analytics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 16),
        if (isDesktop)
          Row(
            children: [
              Expanded(child: _buildAnalyticsTable('Top Performing Vehicles', _getTopVehicles())),
              const SizedBox(width: 24),
              Expanded(child: _buildAnalyticsTable('Active Drivers', _getTopDrivers())),
            ],
          )
        else ...[
          _buildAnalyticsTable('Top Performing Vehicles', _getTopVehicles()),
          const SizedBox(height: 16),
          _buildAnalyticsTable('Active Drivers', _getTopDrivers()),
        ],
      ],
    );
  }

  Widget _buildAnalyticsTable(String title, List<Map<String, String>> data) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          ...data.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(item['name']!, style: const TextStyle(fontSize: 14)),
                Text(item['value']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  List<Map<String, String>> _getTopVehicles() {
    return [
      {'name': 'Vehicle V-001', 'value': '95%'},
      {'name': 'Vehicle V-003', 'value': '92%'},
      {'name': 'Vehicle V-007', 'value': '89%'},
      {'name': 'Vehicle V-012', 'value': '87%'},
    ];
  }

  List<Map<String, String>> _getTopDrivers() {
    return [
      {'name': 'John Doe', 'value': '4.9★'},
      {'name': 'Sarah Smith', 'value': '4.8★'},
      {'name': 'Mike Johnson', 'value': '4.7★'},
      {'name': 'Lisa Wang', 'value': '4.6★'},
    ];
  }
}