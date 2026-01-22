// File: lib/features/auth/presentation/screens/registration_screen.dart
// JWT-based registration screen - Firebase completely removed
// ✅ UPDATED: Now uses JWT authentication instead of Firebase

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:abra_fleet/features/auth/domain/repositories/auth_repository.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _scrollController = ScrollController();
  
  // Basic Information
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _alternativePhoneController = TextEditingController();
  
  // Organization Details
  final _companyNameController = TextEditingController();
  final _departmentSearchController = TextEditingController();
  String? _selectedDepartment;
  final _employeeIdController = TextEditingController();
  final _designationController = TextEditingController();
  
  // Branch Information
  final _branchSearchController = TextEditingController();
  String? _selectedBranch;
  bool _isBranchDropdownOpen = false;
  List<String> _filteredBranches = [];
  
  // Emergency Contact
  final _emergencyContactNameController = TextEditingController();
  final _emergencyContactPhoneController = TextEditingController();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String? _selectedRole;
  final List<String> _roles = ['driver', 'customer'];
  bool _isLoading = false;
  bool _isDepartmentDropdownOpen = false;
  List<String> _filteredDepartments = [];

  final List<String> _departments = [
    'Engineering',
    'Human Resources',
    'Finance',
    'Sales',
    'Marketing',
    'Operations',
    'IT Support',
    'Customer Service',
    'Product Management',
    'Legal',
    'Administration',
    'Research & Development',
  ];

  // Common branch locations in India for companies
  final List<String> _branches = [
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Mumbai',
    'Delhi',
    'Pune',
    'Kolkata',
    'Ahmedabad',
    'Gurgaon',
    'Noida',
    'Kochi',
    'Coimbatore',
    'Indore',
    'Bhubaneswar',
    'Jaipur',
    'Chandigarh',
    'Lucknow',
    'Nagpur',
    'Vadodara',
    'Thiruvananthapuram',
  ];

  @override
  void initState() {
    super.initState();
    _filteredDepartments = _departments;
    _filteredBranches = _branches;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _phoneController.dispose();
    _alternativePhoneController.dispose();
    _companyNameController.dispose();
    _departmentSearchController.dispose();
    _employeeIdController.dispose();
    _designationController.dispose();
    _branchSearchController.dispose();
    _emergencyContactNameController.dispose();
    _emergencyContactPhoneController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _filterDepartments(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredDepartments = _departments;
      } else {
        _filteredDepartments = _departments
            .where((dept) => dept.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  void _filterBranches(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredBranches = _branches;
      } else {
        _filteredBranches = _branches
            .where((branch) => branch.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  String _capitalizeRole(String role) {
    return role[0].toUpperCase() + role.substring(1);
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    if (_selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select your role'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authRepository = Provider.of<AuthRepository>(context, listen: false);
      
      // Prepare phone number
      String? phoneNumber = _phoneController.text.trim();
      if (phoneNumber.isNotEmpty && !phoneNumber.startsWith('+')) {
        phoneNumber = '+91$phoneNumber';
      }

      // Use JWT-based registration
      await authRepository.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
        name: _nameController.text.trim(),
        role: _selectedRole!.toLowerCase().trim(),
        phoneNumber: phoneNumber,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Registration successful! You can now login with your credentials.',
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 4),
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      String errorMessage = 'Registration failed';
      
      // Handle specific error messages
      if (e.toString().contains('User already exists') || 
          e.toString().contains('email-already-in-use')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (e.toString().contains('weak-password')) {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (e.toString().contains('invalid-email')) {
        errorMessage = 'Invalid email format.';
      } else {
        errorMessage = 'Registration failed: ${e.toString()}';
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 600;
    final maxWidth = isTablet ? 500.0 : screenWidth * 0.9;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Create Account',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        elevation: 4,
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          controller: _scrollController,
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Join Abra Travels Network',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your account will be activated after admin approval',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Basic Information Section
                  _buildSectionHeader('Basic Information', Icons.info_outline),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _nameController,
                    label: 'Full Name',
                    icon: Icons.person,
                    required: true,
                    validator: (value) => value?.isEmpty ?? true 
                        ? 'Please enter your full name' 
                        : null,
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _emailController,
                    label: 'Email Address',
                    icon: Icons.email,
                    required: true,
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value?.isEmpty ?? true) return 'Please enter your email';
                      if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value!)) {
                        return 'Enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _phoneController,
                    label: 'Phone Number',
                    icon: Icons.phone,
                    required: true,
                    keyboardType: TextInputType.phone,
                    hintText: '9876543210 or +919876543210',
                    validator: (value) {
                      if (value?.isEmpty ?? true) return 'Please enter phone number';
                      String cleaned = value!.replaceAll(RegExp(r'\s+'), '');
                      if (cleaned.startsWith('+91')) cleaned = cleaned.substring(3);
                      if (cleaned.length != 10 || !RegExp(r'^[6-9]\d{9}$').hasMatch(cleaned)) {
                        return 'Enter a valid 10-digit phone number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _alternativePhoneController,
                    label: 'Alternative Phone (Optional)',
                    icon: Icons.phone_android,
                    keyboardType: TextInputType.phone,
                    hintText: '9876543210',
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _passwordController,
                    label: 'Password',
                    icon: Icons.lock,
                    required: true,
                    obscureText: _obscurePassword,
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword 
                          ? Icons.visibility_off 
                          : Icons.visibility),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                    validator: (value) {
                      if (value?.isEmpty ?? true) return 'Please enter a password';
                      if (value!.length < 6) return 'Password must be at least 6 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _confirmPasswordController,
                    label: 'Confirm Password',
                    icon: Icons.lock,
                    required: true,
                    obscureText: _obscureConfirmPassword,
                    suffixIcon: IconButton(
                      icon: Icon(_obscureConfirmPassword 
                          ? Icons.visibility_off 
                          : Icons.visibility),
                      onPressed: () => setState(() => 
                          _obscureConfirmPassword = !_obscureConfirmPassword),
                    ),
                    validator: (value) {
                      if (value?.isEmpty ?? true) return 'Please confirm your password';
                      if (value != _passwordController.text) return 'Passwords do not match';
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  // Organization Details Section
                  _buildSectionHeader('Organization Details', Icons.business),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _companyNameController,
                    label: 'Company Name',
                    icon: Icons.business_center,
                    required: true,
                    hintText: 'Enter company name',
                    validator: (value) => value?.isEmpty ?? true 
                        ? 'Please enter company name' 
                        : null,
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _employeeIdController,
                    label: 'Employee ID (Optional)',
                    icon: Icons.badge,
                    hintText: 'Your employee identification number',
                  ),
                  const SizedBox(height: 16),

                  _buildSearchableDepartmentDropdown(),
                  const SizedBox(height: 16),

                  // Branch Selection
                  _buildSearchableBranchDropdown(),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _designationController,
                    label: 'Designation/Position (Optional)',
                    icon: Icons.work,
                    hintText: 'Your job title',
                  ),
                  const SizedBox(height: 24),

                  // Emergency Contact Section
                  _buildSectionHeader('Emergency Contact (Optional)', Icons.emergency),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _emergencyContactNameController,
                    label: 'Emergency Contact Name',
                    icon: Icons.contact_emergency,
                    hintText: 'Full name of emergency contact',
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    controller: _emergencyContactPhoneController,
                    label: 'Emergency Contact Phone',
                    icon: Icons.phone_in_talk,
                    hintText: '9876543210',
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 24),

                  // Role Selection
                  _buildSectionHeader('Account Type', Icons.badge),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedRole,
                    decoration: InputDecoration(
                      labelText: 'I am a...*',
                      prefixIcon: const Icon(Icons.badge_outlined),
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 16, 
                        horizontal: 16,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    items: _roles.map((String role) {
                      return DropdownMenuItem<String>(
                        value: role,
                        child: Text(_capitalizeRole(role)),
                      );
                    }).toList(),
                    onChanged: (newValue) => setState(() => _selectedRole = newValue),
                    validator: (value) => value == null ? 'Please select your role' : null,
                  ),
                  const SizedBox(height: 32),

                  // Register Button
                  SizedBox(
                    height: 50,
                    child: ElevatedButton.icon(
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.person_add_alt_1_rounded),
                      label: Text(
                        _isLoading ? 'Creating Account...' : 'Create Account',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: _isLoading ? null : _register,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Login Link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Already have an account?"),
                      TextButton(
                        onPressed: _isLoading ? null : () => Navigator.pop(context),
                        child: const Text('Sign In'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Theme.of(context).colorScheme.primary, size: 24),
        const SizedBox(width: 12),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1E293B),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hintText,
    bool required = false,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      validator: validator,
      decoration: InputDecoration(
        labelText: required ? '$label *' : label,
        hintText: hintText,
        prefixIcon: Icon(icon, size: 20),
        suffixIcon: suffixIcon,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  Widget _buildSearchableDepartmentDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: const TextSpan(
            text: 'Department',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
            children: [
              TextSpan(
                text: ' *',
                style: TextStyle(color: Colors.red),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        FormField<String>(
          validator: (value) {
            if (_selectedDepartment == null || _selectedDepartment!.isEmpty) {
              return 'Please select a department';
            }
            return null;
          },
          builder: (formFieldState) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _isDepartmentDropdownOpen = !_isDepartmentDropdownOpen;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: formFieldState.hasError
                            ? Colors.red
                            : Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.category, size: 20, color: Colors.grey),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _selectedDepartment ?? 'Select department',
                            style: TextStyle(
                              color: _selectedDepartment == null
                                  ? Colors.grey
                                  : Colors.black,
                            ),
                          ),
                        ),
                        Icon(
                          _isDepartmentDropdownOpen
                              ? Icons.arrow_drop_up
                              : Icons.arrow_drop_down,
                        ),
                      ],
                    ),
                  ),
                ),
                if (_isDepartmentDropdownOpen)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    constraints: const BoxConstraints(maxHeight: 300),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: TextField(
                            controller: _departmentSearchController,
                            decoration: InputDecoration(
                              hintText: 'Search departments...',
                              prefixIcon: const Icon(Icons.search, size: 20),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            onChanged: _filterDepartments,
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: _filteredDepartments.length,
                            itemBuilder: (context, index) {
                              final dept = _filteredDepartments[index];
                              return InkWell(
                                onTap: () {
                                  setState(() {
                                    _selectedDepartment = dept;
                                    _isDepartmentDropdownOpen = false;
                                    _departmentSearchController.clear();
                                    _filteredDepartments = _departments;
                                  });
                                  formFieldState.didChange(dept);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _selectedDepartment == dept
                                        ? Theme.of(context)
                                            .colorScheme
                                            .primary
                                            .withOpacity(0.1)
                                        : Colors.transparent,
                                  ),
                                  child: Text(
                                    dept,
                                    style: TextStyle(
                                      color: _selectedDepartment == dept
                                          ? Theme.of(context).colorScheme.primary
                                          : Colors.black,
                                      fontWeight: _selectedDepartment == dept
                                          ? FontWeight.w600
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                if (formFieldState.hasError)
                  Padding(
                    padding: const EdgeInsets.only(top: 8, left: 12),
                    child: Text(
                      formFieldState.errorText!,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildSearchableBranchDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: const TextSpan(
            text: 'Branch/Location',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
            children: [
              TextSpan(
                text: ' *',
                style: TextStyle(color: Colors.red),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        
        // Custom text input field that allows both typing and dropdown selection
        TextFormField(
          controller: _branchSearchController,
          decoration: InputDecoration(
            hintText: 'Enter or select your branch/location',
            prefixIcon: const Icon(Icons.location_city, size: 20),
            suffixIcon: IconButton(
              icon: Icon(
                _isBranchDropdownOpen 
                    ? Icons.arrow_drop_up 
                    : Icons.arrow_drop_down,
              ),
              onPressed: () {
                setState(() {
                  _isBranchDropdownOpen = !_isBranchDropdownOpen;
                  if (_isBranchDropdownOpen) {
                    _filterBranches(_branchSearchController.text);
                  }
                });
              },
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) {
            setState(() {
              _selectedBranch = value;
              if (_isBranchDropdownOpen) {
                _filterBranches(value);
              }
            });
          },
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Please enter your branch/location';
            }
            return null;
          },
        ),
        
        // Dropdown suggestions (only show when dropdown is open)
        if (_isBranchDropdownOpen && _filteredBranches.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            constraints: const BoxConstraints(maxHeight: 200),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    'Popular locations:',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _filteredBranches.length,
                    itemBuilder: (context, index) {
                      final branch = _filteredBranches[index];
                      return InkWell(
                        onTap: () {
                          setState(() {
                            _selectedBranch = branch;
                            _branchSearchController.text = branch;
                            _isBranchDropdownOpen = false;
                            _filteredBranches = _branches;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: _selectedBranch == branch
                                ? Theme.of(context)
                                    .colorScheme
                                    .primary
                                    .withOpacity(0.1)
                                : Colors.transparent,
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.location_on,
                                size: 16,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 8),
                              Text(
                                branch,
                                style: TextStyle(
                                  color: _selectedBranch == branch
                                      ? Theme.of(context).colorScheme.primary
                                      : Colors.black,
                                  fontWeight: _selectedBranch == branch
                                      ? FontWeight.w600
                                      : FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}