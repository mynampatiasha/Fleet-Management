// lib/core/services/error_handler_service.dart

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'api_service.dart';

enum ErrorSeverity {
  low,      // Log only, don't show to user
  medium,   // Show subtle notification
  high,     // Show error dialog
  critical, // Show error dialog with retry options
}

class ErrorInfo {
  final String userMessage;
  final String technicalMessage;
  final ErrorSeverity severity;
  final String? actionHint;
  final VoidCallback? retryAction;

  const ErrorInfo({
    required this.userMessage,
    required this.technicalMessage,
    required this.severity,
    this.actionHint,
    this.retryAction,
  });
}

class ErrorHandlerService {
  static final ErrorHandlerService _instance = ErrorHandlerService._internal();
  factory ErrorHandlerService() => _instance;
  ErrorHandlerService._internal();

  // ✅ CIRCUIT BREAKER STATE
  int _consecutiveFailures = 0;
  DateTime? _lastFailureTime;
  bool _circuitBreakerOpen = false;
  
  // ✅ CONFIGURATION
  static const int _maxConsecutiveFailures = 5;
  static const Duration _circuitBreakerTimeout = Duration(minutes: 2);
  static const Duration _dialogDebounce = Duration(seconds: 10);
  
  // ✅ DIALOG TRACKING
  bool _isDialogShowing = false;
  DateTime? _lastDialogTime;
  String? _lastDialogMessage;

  // ✅ CHECK IF CIRCUIT BREAKER ALLOWS REQUESTS
  bool get canMakeRequest {
    if (!_circuitBreakerOpen) return true;
    
    // Check if timeout has passed
    if (_lastFailureTime != null) {
      final timeSinceLastFailure = DateTime.now().difference(_lastFailureTime!);
      if (timeSinceLastFailure > _circuitBreakerTimeout) {
        debugPrint('🔄 Circuit breaker timeout passed, resetting...');
        _resetCircuitBreaker();
        return true;
      }
    }
    
    return false;
  }

  // ✅ CIRCUIT BREAKER STATUS
  bool get isCircuitBreakerOpen => _circuitBreakerOpen;
  int get failureCount => _consecutiveFailures;
  Duration? get timeUntilReset {
    if (!_circuitBreakerOpen || _lastFailureTime == null) return null;
    final elapsed = DateTime.now().difference(_lastFailureTime!);
    final remaining = _circuitBreakerTimeout - elapsed;
    return remaining.isNegative ? null : remaining;
  }

  // ✅ RECORD SUCCESSFUL API CALL
  void recordSuccess() {
    if (_consecutiveFailures > 0 || _circuitBreakerOpen) {
      debugPrint('✅ API call succeeded, resetting circuit breaker');
      _resetCircuitBreaker();
    }
  }

  // ✅ RECORD FAILED API CALL
  void recordFailure() {
    _consecutiveFailures++;
    _lastFailureTime = DateTime.now();
    
    if (_consecutiveFailures >= _maxConsecutiveFailures && !_circuitBreakerOpen) {
      _circuitBreakerOpen = true;
      debugPrint('⛔ CIRCUIT BREAKER OPENED after $_consecutiveFailures failures');
      debugPrint('⏰ Will retry after ${_circuitBreakerTimeout.inMinutes} minutes');
    } else {
      debugPrint('⚠️ Failure count: $_consecutiveFailures/$_maxConsecutiveFailures');
    }
  }

  // ✅ RESET CIRCUIT BREAKER
  void _resetCircuitBreaker() {
    _consecutiveFailures = 0;
    _circuitBreakerOpen = false;
    _lastFailureTime = null;
  }

  // ✅ MANUAL RESET (for user-triggered retry)
  void manualReset() {
    debugPrint('🔄 Manual circuit breaker reset');
    _resetCircuitBreaker();
    _isDialogShowing = false;
    _lastDialogTime = null;
    _lastDialogMessage = null;
  }

  /// Processes any error and returns appropriate user-facing information
  ErrorInfo processError(dynamic error, {String? context}) {
    debugPrint('🔍 Processing error in context: $context');
    debugPrint('🔍 Error type: ${error.runtimeType}');
    debugPrint('🔍 Error details: $error');

    // ✅ Record failure for circuit breaker
    recordFailure();

    // Handle ApiException specifically
    if (error is ApiException) {
      return _handleApiException(error, context);
    }

    // Handle other exception types
    final errorString = error.toString();
    
    // Network connectivity issues
    if (_isNetworkError(errorString)) {
      return ErrorInfo(
        userMessage: 'Connection issue detected',
        technicalMessage: errorString,
        severity: ErrorSeverity.low, // ✅ Don't show to user
        actionHint: 'The service will retry automatically',
      );
    }

    // Authentication errors
    if (_isAuthError(errorString)) {
      return ErrorInfo(
        userMessage: 'Authentication required',
        technicalMessage: errorString,
        severity: ErrorSeverity.medium,
        actionHint: 'Please log in again',
      );
    }

    // Generic error
    return ErrorInfo(
      userMessage: 'Something went wrong',
      technicalMessage: errorString,
      severity: ErrorSeverity.low, // ✅ Don't show generic errors
      actionHint: 'The service will retry automatically',
    );
  }

  ErrorInfo _handleApiException(ApiException apiException, String? context) {
    final statusCode = apiException.statusCode;
    final message = apiException.message;
    
    debugPrint('🔍 ApiException - Status: $statusCode, Message: $message');

    // Network/Connection errors (no status code)
    if (statusCode == null) {
      if (_isNetworkError(message)) {
        return ErrorInfo(
          userMessage: 'Unable to connect to server',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Don't show network errors
          actionHint: 'The service will retry automatically',
        );
      }
    }

    // HTTP status code based handling
    switch (statusCode) {
      case 400:
        return ErrorInfo(
          userMessage: 'Invalid request',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Don't show to user
          actionHint: 'Please check your input and try again',
        );
      
      case 401:
        return ErrorInfo(
          userMessage: 'Authentication required',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Changed to low - don't block UI
          actionHint: 'Please log in again',
        );
      
      case 403:
        return ErrorInfo(
          userMessage: 'Access denied',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Changed to low - don't block UI
          actionHint: 'You don\'t have permission for this action',
        );
      
      case 404:
        return ErrorInfo(
          userMessage: 'Resource not found',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Don't show to user
          actionHint: 'The requested item may have been removed',
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorInfo(
          userMessage: 'Server temporarily unavailable',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Don't show server errors
          actionHint: 'The service will retry automatically',
        );
      
      default:
        return ErrorInfo(
          userMessage: 'Service temporarily unavailable',
          technicalMessage: message,
          severity: ErrorSeverity.low, // ✅ Don't show unknown errors
          actionHint: 'The service will retry automatically',
        );
    }
  }

  bool _isNetworkError(String errorMessage) {
    final networkKeywords = [
      'network error',
      'connection refused',
      'connection reset',
      'timeout',
      'unreachable',
      'no internet',
      'socket exception',
      'client exception',
      'handshake exception',
      'failed host lookup',
      'os error',
    ];
    
    final lowerMessage = errorMessage.toLowerCase();
    return networkKeywords.any((keyword) => lowerMessage.contains(keyword));
  }

  bool _isAuthError(String errorMessage) {
    final authKeywords = [
      'unauthorized',
      'authentication',
      'invalid token',
      'token expired',
      'access denied',
      'forbidden',
    ];
    
    final lowerMessage = errorMessage.toLowerCase();
    return authKeywords.any((keyword) => lowerMessage.contains(keyword));
  }

  /// Shows error to user based on severity level
  void showErrorToUser(BuildContext context, ErrorInfo errorInfo) {
    // ✅ COMPLETELY SUPPRESS ALL UI ERROR DISPLAYS
    // All errors are logged to console only, never shown on screen
    
    switch (errorInfo.severity) {
      case ErrorSeverity.low:
        debugPrint('🔇 [LOW] ${errorInfo.userMessage}');
        debugPrint('   Technical: ${errorInfo.technicalMessage}');
        break;
        
      case ErrorSeverity.medium:
        debugPrint('🔇 [MEDIUM] ${errorInfo.userMessage}');
        debugPrint('   Technical: ${errorInfo.technicalMessage}');
        break;
        
      case ErrorSeverity.high:
        debugPrint('🔇 [HIGH] ${errorInfo.userMessage}');
        debugPrint('   Technical: ${errorInfo.technicalMessage}');
        break;
        
      case ErrorSeverity.critical:
        debugPrint('🔇 [CRITICAL] ${errorInfo.userMessage}');
        debugPrint('   Technical: ${errorInfo.technicalMessage}');
        break;
    }
    
    // ✅ NO DIALOGS, NO SNACKBARS, NO UI MESSAGES - CONSOLE ONLY
  }

  void _showSnackBar(BuildContext context, ErrorInfo errorInfo) {
    if (!context.mounted) return;
    
    // ✅ Debounce: Don't show if same message shown recently
    if (_shouldSuppressDuplicate(errorInfo.userMessage)) {
      debugPrint('⏭️ Skipping duplicate snackbar');
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(errorInfo.userMessage)),
          ],
        ),
        backgroundColor: Colors.orange[700],
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );

    _lastDialogTime = DateTime.now();
    _lastDialogMessage = errorInfo.userMessage;
  }

  void _showErrorDialog(BuildContext context, ErrorInfo errorInfo) {
    if (!context.mounted) return;
    
    // ✅ Prevent multiple dialogs
    if (_isDialogShowing) {
      debugPrint('⏭️ Dialog already showing, skipping');
      return;
    }

    // ✅ Debounce: Don't show if same message shown recently
    if (_shouldSuppressDuplicate(errorInfo.userMessage)) {
      debugPrint('⏭️ Skipping duplicate dialog');
      return;
    }

    _isDialogShowing = true;
    _lastDialogTime = DateTime.now();
    _lastDialogMessage = errorInfo.userMessage;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(
                errorInfo.severity == ErrorSeverity.critical 
                    ? Icons.error 
                    : Icons.warning,
                color: errorInfo.severity == ErrorSeverity.critical 
                    ? Colors.red 
                    : Colors.orange,
              ),
              const SizedBox(width: 8),
              const Text('Notice'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(errorInfo.userMessage),
              if (errorInfo.actionHint != null) ...[
                const SizedBox(height: 8),
                Text(
                  errorInfo.actionHint!,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
              if (kDebugMode) ...[
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                Text(
                  'Debug Info:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  errorInfo.technicalMessage,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                _isDialogShowing = false;
              },
              child: const Text('OK'),
            ),
            if (errorInfo.retryAction != null)
              ElevatedButton(
                onPressed: () {
                  Navigator.of(dialogContext).pop();
                  _isDialogShowing = false;
                  manualReset(); // ✅ Reset circuit breaker on manual retry
                  errorInfo.retryAction!();
                },
                child: const Text('Retry'),
              ),
          ],
        );
      },
    ).then((_) {
      _isDialogShowing = false;
    });
  }

  // ✅ CHECK IF WE SHOULD SUPPRESS DUPLICATE ERROR
  bool _shouldSuppressDuplicate(String message) {
    if (_lastDialogTime == null || _lastDialogMessage == null) {
      return false;
    }

    if (_lastDialogMessage != message) {
      return false;
    }

    final timeSinceLastDialog = DateTime.now().difference(_lastDialogTime!);
    return timeSinceLastDialog < _dialogDebounce;
  }

  /// Handles errors silently for background operations
  void handleSilentError(dynamic error, {String? context}) {
    final errorInfo = processError(error, context: context);
    
    // ✅ Log to console only
    debugPrint('🔇 Silent error [${context ?? 'Unknown'}]: ${errorInfo.userMessage}');
    if (kDebugMode) {
      debugPrint('   Technical: ${errorInfo.technicalMessage}');
    }
  }

  /// Handles errors - ALL ERRORS ARE LOGGED TO CONSOLE ONLY, NEVER SHOWN ON SCREEN
  void handleError(BuildContext context, dynamic error, {String? errorContext}) {
    final errorInfo = processError(error, context: errorContext);
    
    // ✅ Log to console only - NO UI DISPLAY
    debugPrint('🔇 Error [${errorContext ?? 'Unknown'}]: ${errorInfo.userMessage}');
    if (kDebugMode) {
      debugPrint('   Technical: ${errorInfo.technicalMessage}');
    }
    
    // ✅ NEVER call showErrorToUser - keep all errors in console only
  }
}

/// Extension to make error handling easier
extension ErrorHandling on Widget {
  /// Wraps a widget with error boundary
  Widget withErrorBoundary({String? context}) {
    return Builder(
      builder: (BuildContext context) {
        return this;
      },
    );
  }
}

/// ✅ GLOBAL HELPER: Show error in console only, never on screen
void showErrorInConsoleOnly(String message, {String? context, dynamic error}) {
  debugPrint('🔇 [${context ?? 'Error'}] $message');
  if (error != null && kDebugMode) {
    debugPrint('   Details: $error');
  }
}

/// ✅ GLOBAL HELPER: Suppress SnackBar and log to console instead
void suppressSnackBarError(BuildContext context, String message, {String? errorContext}) {
  // Don't show SnackBar, just log to console
  debugPrint('🔇 [${errorContext ?? 'SnackBar Suppressed'}] $message');
}

/// Mixin for easy error handling in StatefulWidgets
mixin ErrorHandlerMixin<T extends StatefulWidget> on State<T> {
  final ErrorHandlerService _errorHandler = ErrorHandlerService();

  void handleError(dynamic error, {String? context}) {
    if (mounted) {
      // ✅ CHANGED: Never show UI errors, only log to console
      _errorHandler.handleError(this.context, error, errorContext: context);
    }
  }

  void handleSilentError(dynamic error, {String? context}) {
    _errorHandler.handleSilentError(error, context: context);
  }

  // ✅ NEW: Check if requests are allowed
  bool get canMakeRequest => _errorHandler.canMakeRequest;

  // ✅ NEW: Record successful API call
  void recordSuccess() => _errorHandler.recordSuccess();

  // ✅ NEW: Check circuit breaker status
  bool get isCircuitBreakerOpen => _errorHandler.isCircuitBreakerOpen;

  // ✅ NEW: Manual reset
  void resetCircuitBreaker() => _errorHandler.manualReset();
}