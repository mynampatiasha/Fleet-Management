// File: lib/features/admin/customer_management/widgets/route_optimization_input_dialog.dart
// Dialog for admin to input number of customers for route optimization

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class RouteOptimizationInputDialog extends StatefulWidget {
  final int maxCustomers;
  final Function(int, String) onOptimize; // Added mode parameter

  const RouteOptimizationInputDialog({
    super.key,
    required this.maxCustomers,
    required this.onOptimize,
  });

  @override
  State<RouteOptimizationInputDialog> createState() => _RouteOptimizationInputDialogState();
}

class _RouteOptimizationInputDialogState extends State<RouteOptimizationInputDialog> {
  final _controller = TextEditingController();
  String? _errorMessage;
  String _selectedMode = 'auto'; // 'auto' or 'manual'

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleOptimize() {
    debugPrint('\n' + '🎯'*40);
    debugPrint('ROUTE OPTIMIZATION INPUT DIALOG: OPTIMIZE BUTTON CLICKED');
    debugPrint('🎯'*40);
    
    final text = _controller.text.trim();
    debugPrint('📝 User Input:');
    debugPrint('   - Text entered: "${text}"');
    debugPrint('   - Selected mode: $_selectedMode');
    debugPrint('   - Max customers: ${widget.maxCustomers}');
    debugPrint('-'*80);
    
    if (text.isEmpty) {
      debugPrint('❌ Validation failed: Empty input');
      setState(() => _errorMessage = 'Please enter a number');
      return;
    }

    final number = int.tryParse(text);
    debugPrint('🔢 Parsed number: $number');
    
    if (number == null) {
      debugPrint('❌ Validation failed: Not a valid number');
      setState(() => _errorMessage = 'Please enter a valid number');
      return;
    }

    if (number < 1) {
      debugPrint('❌ Validation failed: Number less than 1');
      setState(() => _errorMessage = 'Number must be at least 1');
      return;
    }

    if (number > widget.maxCustomers) {
      debugPrint('❌ Validation failed: Number exceeds max customers ($number > ${widget.maxCustomers})');
      setState(() => _errorMessage = 'Maximum ${widget.maxCustomers} customers available');
      return;
    }

    debugPrint('✅ Validation passed!');
    debugPrint('📤 Closing dialog and calling onOptimize callback');
    debugPrint('   - Customer count: $number');
    debugPrint('   - Mode: $_selectedMode');
    debugPrint('🎯'*40 + '\n');
    
    Navigator.of(context).pop();
    widget.onOptimize(number, _selectedMode);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.route, color: Colors.green.shade700, size: 24),
          ),
          const SizedBox(width: 12),
          const Text('Route Optimization'),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'How many customers would you like to optimize for?',
            style: TextStyle(fontSize: 15),
          ),
          const SizedBox(height: 16),
          
          // Mode Selection
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                RadioListTile<String>(
                  value: 'auto',
                  groupValue: _selectedMode,
                  onChanged: (value) => setState(() => _selectedMode = value!),
                  title: const Text('Auto Mode', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('AI finds best vehicle and route automatically'),
                  secondary: Icon(Icons.auto_awesome, color: Colors.green.shade700),
                ),
                Divider(height: 1, color: Colors.grey.shade300),
                RadioListTile<String>(
                  value: 'manual',
                  groupValue: _selectedMode,
                  onChanged: (value) => setState(() => _selectedMode = value!),
                  title: const Text('Manual Mode', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('You select the vehicle and driver'),
                  secondary: Icon(Icons.touch_app, color: Colors.blue.shade700),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          TextField(
            controller: _controller,
            autofocus: true,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: InputDecoration(
              labelText: 'Number of Customers',
              hintText: 'e.g., 3',
              prefixIcon: const Icon(Icons.people),
              suffixText: '/ ${widget.maxCustomers}',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              errorText: _errorMessage,
            ),
            onChanged: (value) {
              if (_errorMessage != null) {
                setState(() => _errorMessage = null);
              }
            },
            onSubmitted: (_) => _handleOptimize(),
          ),
          
          const SizedBox(height: 16),
          
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _selectedMode == 'auto' ? Colors.green.shade50 : Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: _selectedMode == 'auto' ? Colors.green.shade200 : Colors.blue.shade200,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: _selectedMode == 'auto' ? Colors.green.shade700 : Colors.blue.shade700,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _selectedMode == 'auto'
                        ? 'AI will find the best customers to group and assign them to the optimal vehicle with TSP route optimization.'
                        : 'You will see the customers and choose which vehicle/driver to assign them to. Seat capacity will be tracked.',
                    style: TextStyle(
                      fontSize: 12,
                      color: _selectedMode == 'auto' ? Colors.green.shade900 : Colors.blue.shade900,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton.icon(
          onPressed: _handleOptimize,
          icon: Icon(_selectedMode == 'auto' ? Icons.auto_awesome : Icons.touch_app),
          label: Text(_selectedMode == 'auto' ? 'Auto Optimize' : 'Select Manually'),
          style: ElevatedButton.styleFrom(
            backgroundColor: _selectedMode == 'auto' ? Colors.green.shade700 : Colors.blue.shade700,
            foregroundColor: Colors.white,
          ),
        ),
      ],
    );
  }
}
