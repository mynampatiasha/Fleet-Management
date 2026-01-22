// lib/features/driver/dashboard/presentation/screens/trips_driver_page.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';
import 'package:abra_fleet/features/auth/presentation/screens/welcome_screen.dart';

// --- UI Constants - Matching the Dashboard ---
const Color kPrimaryColor = Color(0xFF0D47A1);
const Color kScaffoldBackgroundColor = Color(0xFFF1F5F9);
const Color kCardBackgroundColor = Colors.white;
const Color kPrimaryTextColor = Color(0xFF1E293B);
const Color kSecondaryTextColor = Color(0xFF64748B);
const Color kSuccessColor = Color(0xFF059669); // For Start Trip button

class TripsDriverPage extends StatelessWidget {
  const TripsDriverPage({Key? key}) : super(key: key);

  Future<void> _handleLogout(BuildContext context) async {
    // ... (This would be the same logout logic as in the profile page)
    final authRepository = Provider.of<AuthRepository>(context, listen: false);
    final confirmLogout = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
              title: const Text('Confirm Logout'),
              content: const Text('Are you sure you want to log out?'),
              actions: [
                TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
                TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Logout')),
              ],
            ));
    if (confirmLogout == true && context.mounted) {
      await authRepository.signOut();
      Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const WelcomeScreen()), (Route<dynamic> route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kScaffoldBackgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('My Trips', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: kPrimaryColor,
        actions: [
          IconButton(icon: const Icon(Icons.notifications, color: Colors.white), onPressed: () {}),
          IconButton(icon: const Icon(Icons.logout, color: Colors.white), tooltip: 'Logout', onPressed: () => _handleLogout(context)),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildStartNewTripCard(),
            const SizedBox(height: 16),
            _buildScheduledTripsCard(),
            const SizedBox(height: 16),
            _buildRecentTripsCard(),
          ],
        ),
      ),
    );
  }

  // --- Reusable Widgets ---
  Widget _buildCard({required String title, required Widget child, IconData? icon}) {
    // ... (Same _buildCard widget as profile page)
     return Card(
      elevation: 2.0,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15.0)),
      color: kCardBackgroundColor,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Row(children: [
                if (icon != null) Icon(icon, color: kPrimaryTextColor, size: 22),
                if (icon != null) const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: kPrimaryTextColor)),
              ],),
            const SizedBox(height: 15.0),
            child,
          ],
        ),
      ),
    );
  }
  
  Widget _buildStyledButton({required VoidCallback onPressed, required String text, required Color backgroundColor, IconData? icon}) {
     // ... (Same _buildStyledButton widget as profile page)
      return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        icon: Icon(icon, size: 18),
        label: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12.0),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
          elevation: 2,
        ),
      ),
    );
  }
  
  // --- Page Sections ---
  Widget _buildStartNewTripCard() {
    return _buildCard(
      title: 'Start New Trip',
      icon: Icons.rocket_launch,
      child: Column(
        children: [
          _buildFormTextField(label: 'Trip ID', initialValue: 'TR-1235', readOnly: true),
          const SizedBox(height: 12),
          _buildFormTextField(label: 'Starting Odometer', hint: 'Enter current reading'),
          const SizedBox(height: 16),
          _buildStyledButton(onPressed: () {}, text: 'Start Trip', icon: Icons.play_arrow, backgroundColor: kSuccessColor),
        ],
      ),
    );
  }

  Widget _buildScheduledTripsCard() {
    return _buildCard(
      title: 'Scheduled Trips',
      icon: Icons.schedule,
      child: Column(
        children: [
          _buildTripItem(
            timeAndId: '10:30 AM - TR-1235',
            route: 'Noida → Gurgaon',
            details: '3 Customers assigned',
            status: 'Pending',
            statusColor: const Color(0xFFFEF3C7),
            statusTextColor: const Color(0xFF92400E),
          ),
          const SizedBox(height: 10),
          _buildTripItem(
            timeAndId: '12:00 PM - TR-1236',
            route: 'Gurgaon → Delhi',
            details: '4 Customers assigned',
            status: 'Pending',
            statusColor: const Color(0xFFFEF3C7),
            statusTextColor: const Color(0xFF92400E),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentTripsCard() {
    return _buildCard(
      title: 'Recent Trips',
      icon: Icons.history,
      child: Column(
        children: [
           _buildTripItem(
            timeAndId: '9:15 AM - TR-1234',
            route: 'Cyber City → CP (Current)',
            details: '4 Customers | 45.2 KM',
            status: 'Active',
            statusColor: kPrimaryColor.withOpacity(0.1),
            statusTextColor: kPrimaryColor,
          ),
          const SizedBox(height: 10),
          _buildTripItem(
            timeAndId: '8:00 AM - TR-1233',
            route: 'Home → Office',
            details: '5 Customers | 32.1 KM',
            status: 'Completed',
            statusColor: const Color(0xFFD1FAE5),
            statusTextColor: const Color(0xFF065F46),
          ),
        ],
      ),
    );
  }

  // --- Helper Widgets ---
   Widget _buildFormTextField({required String label, String? hint, String? initialValue, bool readOnly = false}) {
    // ... (This widget can remain as is, its styling is neutral)
     return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: kPrimaryTextColor, fontSize: 14)),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: initialValue,
          readOnly: readOnly,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: readOnly ? Colors.grey[200] : Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0), borderSide: BorderSide(color: Colors.grey.shade300)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0), borderSide: BorderSide(color: Colors.grey.shade300)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0), borderSide: const BorderSide(color: kPrimaryColor, width: 2.0)),
          ),
        ),
      ],
    );
  }

   Widget _buildTripItem({required String timeAndId, required String route, required String details, required String status, required Color statusColor, required Color statusTextColor}) {
     // ... (This widget can also remain as is)
      return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10.0),
        border: Border(left: BorderSide(color: kPrimaryColor, width: 4.0)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(timeAndId, style: const TextStyle(fontWeight: FontWeight.bold, color: kPrimaryTextColor)),
              const SizedBox(height: 4),
              Text(route, style: const TextStyle(color: kSecondaryTextColor, fontSize: 14)),
              const SizedBox(height: 4),
              Text(details, style: const TextStyle(color: kSecondaryTextColor, fontSize: 14)),
            ]),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 5.0),
            decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(15.0)),
            child: Text(status, style: TextStyle(color: statusTextColor, fontWeight: FontWeight.w600, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}