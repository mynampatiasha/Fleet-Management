// ============================================================================
// INVOICE SERVICE - API Communication Layer (FIXED)
// ============================================================================
// File: lib/services/invoice_service.dart
// NOW USES ApiService for proper Firebase authentication
// ============================================================================

import 'dart:convert';
import 'package:abra_fleet/core/services/api_service.dart';

class InvoiceService {
  // Use ApiService singleton for all API calls
  static final ApiService _api = ApiService();
  
  // Base endpoint for invoices
  static const String _baseEndpoint = '/api/invoices';
  
  // ============================================================================
  // API METHODS
  // ============================================================================
  
  /// Get all invoices with optional filters
  static Future<InvoiceListResponse> getInvoices({
    String? status,
    String? customerId,
    DateTime? fromDate,
    DateTime? toDate,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      // Build query parameters
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      
      if (status != null) queryParams['status'] = status;
      if (customerId != null) queryParams['customerId'] = customerId;
      if (fromDate != null) queryParams['fromDate'] = fromDate.toIso8601String();
      if (toDate != null) queryParams['toDate'] = toDate.toIso8601String();
      
      print('📤 GET: $_baseEndpoint with filters: $queryParams');
      
      final data = await _api.get(_baseEndpoint, queryParams: queryParams);
      
      print('✅ Invoices fetched: ${data['data'].length}');
      
      return InvoiceListResponse.fromJson(data);
    } catch (e) {
      print('❌ Error fetching invoices: $e');
      rethrow;
    }
  }
  
  /// Get invoice statistics
  static Future<InvoiceStats> getStats() async {
    try {
      print('📤 GET: $_baseEndpoint/stats');
      
      final data = await _api.get('$_baseEndpoint/stats');
      
      print('✅ Stats fetched');
      
      return InvoiceStats.fromJson(data['data']);
    } catch (e) {
      print('❌ Error fetching stats: $e');
      rethrow;
    }
  }
  
  /// Get single invoice by ID
  static Future<Invoice> getInvoice(String invoiceId) async {
    try {
      print('📤 GET: $_baseEndpoint/$invoiceId');
      
      final data = await _api.get('$_baseEndpoint/$invoiceId');
      
      print('✅ Invoice fetched: ${data['data']['invoiceNumber']}');
      
      return Invoice.fromJson(data['data']);
    } catch (e) {
      print('❌ Error fetching invoice: $e');
      rethrow;
    }
  }
  
  /// Create new invoice
  static Future<Invoice> createInvoice(Map<String, dynamic> invoiceData) async {
    try {
      print('📤 POST: $_baseEndpoint');
      print('📦 Data: ${json.encode(invoiceData)}');
      
      final data = await _api.post(_baseEndpoint, body: invoiceData);
      
      print('✅ Invoice created: ${data['data']['invoiceNumber']}');
      
      return Invoice.fromJson(data['data']);
    } catch (e) {
      print('❌ Error creating invoice: $e');
      rethrow;
    }
  }
  
  /// Update existing invoice
  static Future<Invoice> updateInvoice(String invoiceId, Map<String, dynamic> invoiceData) async {
    try {
      print('📤 PUT: $_baseEndpoint/$invoiceId');
      print('📦 Data: ${json.encode(invoiceData)}');
      
      final data = await _api.put('$_baseEndpoint/$invoiceId', body: invoiceData);
      
      print('✅ Invoice updated: ${data['data']['invoiceNumber']}');
      
      return Invoice.fromJson(data['data']);
    } catch (e) {
      print('❌ Error updating invoice: $e');
      rethrow;
    }
  }
  
  /// Send invoice via email
  static Future<Invoice> sendInvoice(String invoiceId) async {
    try {
      print('📤 POST: $_baseEndpoint/$invoiceId/send');
      
      final data = await _api.post('$_baseEndpoint/$invoiceId/send');
      
      print('✅ Invoice sent: ${data['data']['invoiceNumber']}');
      
      return Invoice.fromJson(data['data']);
    } catch (e) {
      print('❌ Error sending invoice: $e');
      rethrow;
    }
  }
  
  /// Record payment for invoice
  static Future<PaymentResponse> recordPayment(
    String invoiceId,
    Map<String, dynamic> paymentData,
  ) async {
    try {
      print('📤 POST: $_baseEndpoint/$invoiceId/payment');
      print('📦 Payment: ${json.encode(paymentData)}');
      
      final data = await _api.post('$_baseEndpoint/$invoiceId/payment', body: paymentData);
      
      print('✅ Payment recorded: ₹${paymentData['amount']}');
      
      return PaymentResponse.fromJson(data['data']);
    } catch (e) {
      print('❌ Error recording payment: $e');
      rethrow;
    }
  }
  
  /// Download invoice PDF
  static Future<String> downloadPDF(String invoiceId) async {
    try {
      print('📤 GET: $_baseEndpoint/$invoiceId/pdf (PDF download)');
      
      // Return the URL for download
      final url = '${_api.baseUrl}$_baseEndpoint/$invoiceId/pdf';
      
      print('✅ PDF URL: $url');
      
      return url;
    } catch (e) {
      print('❌ Error getting PDF URL: $e');
      rethrow;
    }
  }
  
  /// Delete invoice (only drafts)
  static Future<void> deleteInvoice(String invoiceId) async {
    try {
      print('📤 DELETE: $_baseEndpoint/$invoiceId');
      
      await _api.delete('$_baseEndpoint/$invoiceId');
      
      print('✅ Invoice deleted');
    } catch (e) {
      print('❌ Error deleting invoice: $e');
      rethrow;
    }
  }
  
  // ============================================================================
  // BILLING CUSTOMERS MANAGEMENT
  // ============================================================================
  
  /// Get all billing customers with optional search and pagination
  static Future<BillingCustomerListResponse> getBillingCustomers({
    String? search,
    int page = 1,
    int limit = 50,
    bool activeOnly = true,
  }) async {
    try {
      // Build query parameters
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
        'active': activeOnly ? 'true' : 'all',
      };
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      print('📤 GET: $_baseEndpoint/customers');
      
      final data = await _api.get('$_baseEndpoint/customers', queryParams: queryParams);
      
      print('✅ Billing customers fetched: ${data['data'].length}');
      
      return BillingCustomerListResponse.fromJson(data);
    } catch (e) {
      print('❌ Error fetching billing customers: $e');
      rethrow;
    }
  }
  
  /// Get single billing customer by ID
  static Future<BillingCustomer> getBillingCustomer(String customerId) async {
    try {
      print('📤 GET: $_baseEndpoint/customers/$customerId');
      
      final data = await _api.get('$_baseEndpoint/customers/$customerId');
      
      print('✅ Billing customer fetched: ${data['data']['customerName']}');
      
      return BillingCustomer.fromJson(data['data']);
    } catch (e) {
      print('❌ Error fetching billing customer: $e');
      rethrow;
    }
  }
  
  /// Create new billing customer
  static Future<BillingCustomer> createBillingCustomer(Map<String, dynamic> customerData) async {
    try {
      print('📤 POST: $_baseEndpoint/customers');
      print('📦 Data: ${json.encode(customerData)}');
      
      final data = await _api.post('$_baseEndpoint/customers', body: customerData);
      
      print('✅ Billing customer created: ${data['data']['customerName']}');
      
      return BillingCustomer.fromJson(data['data']);
    } catch (e) {
      print('❌ Error creating billing customer: $e');
      rethrow;
    }
  }
  
  /// Update existing billing customer
  static Future<BillingCustomer> updateBillingCustomer(String customerId, Map<String, dynamic> customerData) async {
    try {
      print('📤 PUT: $_baseEndpoint/customers/$customerId');
      print('📦 Data: ${json.encode(customerData)}');
      
      final data = await _api.put('$_baseEndpoint/customers/$customerId', body: customerData);
      
      print('✅ Billing customer updated: ${data['data']['customerName']}');
      
      return BillingCustomer.fromJson(data['data']);
    } catch (e) {
      print('❌ Error updating billing customer: $e');
      rethrow;
    }
  }
  
  /// Deactivate billing customer (soft delete)
  static Future<void> deactivateBillingCustomer(String customerId) async {
    try {
      print('📤 DELETE: $_baseEndpoint/customers/$customerId');
      
      await _api.delete('$_baseEndpoint/customers/$customerId');
      
      print('✅ Billing customer deactivated');
    } catch (e) {
      print('❌ Error deactivating billing customer: $e');
      rethrow;
    }
  }
  
  /// Reactivate billing customer
  static Future<BillingCustomer> reactivateBillingCustomer(String customerId) async {
    try {
      print('📤 POST: $_baseEndpoint/customers/$customerId/activate');
      
      final data = await _api.post('$_baseEndpoint/customers/$customerId/activate');
      
      print('✅ Billing customer reactivated: ${data['data']['customerName']}');
      
      return BillingCustomer.fromJson(data['data']);
    } catch (e) {
      print('❌ Error reactivating billing customer: $e');
      rethrow;
    }
  }
  
  /// Get billing customer statistics
  static Future<BillingCustomerStats> getBillingCustomerStats() async {
    try {
      print('📤 GET: $_baseEndpoint/customers-stats');
      
      final data = await _api.get('$_baseEndpoint/customers-stats');
      
      print('✅ Billing customer stats fetched');
      
      return BillingCustomerStats.fromJson(data['data']);
    } catch (e) {
      print('❌ Error fetching billing customer stats: $e');
      rethrow;
    }
  }
}

// ============================================================================
// DATA MODELS (Keep all your existing models below)
// ============================================================================

/// Invoice Model
class Invoice {
  final String id;
  final String invoiceNumber;
  final String customerId;
  final String customerName;
  final String? customerEmail;
  final String? customerPhone;
  final Address? billingAddress;
  final Address? shippingAddress;
  final String? orderNumber;
  final DateTime invoiceDate;
  final String terms;
  final DateTime dueDate;
  final String? salesperson;
  final String? subject;
  final List<InvoiceItem> items;
  final String? customerNotes;
  final String? termsAndConditions;
  final double subTotal;
  final double tdsRate;
  final double tdsAmount;
  final double tcsRate;
  final double tcsAmount;
  final double gstRate;
  final double cgst;
  final double sgst;
  final double igst;
  final double totalAmount;
  final String status;
  final double amountPaid;
  final double amountDue;
  final List<Payment> payments;
  final DateTime createdAt;
  final DateTime updatedAt;

  Invoice({
    required this.id,
    required this.invoiceNumber,
    required this.customerId,
    required this.customerName,
    this.customerEmail,
    this.customerPhone,
    this.billingAddress,
    this.shippingAddress,
    this.orderNumber,
    required this.invoiceDate,
    required this.terms,
    required this.dueDate,
    this.salesperson,
    this.subject,
    required this.items,
    this.customerNotes,
    this.termsAndConditions,
    required this.subTotal,
    required this.tdsRate,
    required this.tdsAmount,
    required this.tcsRate,
    required this.tcsAmount,
    required this.gstRate,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.totalAmount,
    required this.status,
    required this.amountPaid,
    required this.amountDue,
    required this.payments,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['_id'] ?? json['id'],
      invoiceNumber: json['invoiceNumber'],
      customerId: json['customerId'],
      customerName: json['customerName'],
      customerEmail: json['customerEmail'],
      customerPhone: json['customerPhone'],
      billingAddress: json['billingAddress'] != null
          ? Address.fromJson(json['billingAddress'])
          : null,
      shippingAddress: json['shippingAddress'] != null
          ? Address.fromJson(json['shippingAddress'])
          : null,
      orderNumber: json['orderNumber'],
      invoiceDate: DateTime.parse(json['invoiceDate']),
      terms: json['terms'],
      dueDate: DateTime.parse(json['dueDate']),
      salesperson: json['salesperson'],
      subject: json['subject'],
      items: (json['items'] as List)
          .map((item) => InvoiceItem.fromJson(item))
          .toList(),
      customerNotes: json['customerNotes'],
      termsAndConditions: json['termsAndConditions'],
      subTotal: (json['subTotal'] ?? 0).toDouble(),
      tdsRate: (json['tdsRate'] ?? 0).toDouble(),
      tdsAmount: (json['tdsAmount'] ?? 0).toDouble(),
      tcsRate: (json['tcsRate'] ?? 0).toDouble(),
      tcsAmount: (json['tcsAmount'] ?? 0).toDouble(),
      gstRate: (json['gstRate'] ?? 18).toDouble(),
      cgst: (json['cgst'] ?? 0).toDouble(),
      sgst: (json['sgst'] ?? 0).toDouble(),
      igst: (json['igst'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'],
      amountPaid: (json['amountPaid'] ?? 0).toDouble(),
      amountDue: (json['amountDue'] ?? 0).toDouble(),
      payments: (json['payments'] as List?)
              ?.map((payment) => Payment.fromJson(payment))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

/// Invoice Item Model
class InvoiceItem {
  final String itemDetails;
  final double quantity;
  final double rate;
  final double discount;
  final String discountType;
  final double amount;

  InvoiceItem({
    required this.itemDetails,
    required this.quantity,
    required this.rate,
    required this.discount,
    required this.discountType,
    required this.amount,
  });

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    return InvoiceItem(
      itemDetails: json['itemDetails'] ?? '',
      quantity: (json['quantity'] ?? 0).toDouble(),
      rate: (json['rate'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      discountType: json['discountType'] ?? 'percentage',
      amount: (json['amount'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'itemDetails': itemDetails,
      'quantity': quantity,
      'rate': rate,
      'discount': discount,
      'discountType': discountType,
      'amount': amount,
    };
  }
}

/// Address Model
class Address {
  final String? street;
  final String? city;
  final String? state;
  final String? pincode;
  final String? country;

  Address({
    this.street,
    this.city,
    this.state,
    this.pincode,
    this.country,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'],
      city: json['city'],
      state: json['state'],
      pincode: json['pincode'],
      country: json['country'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'street': street,
      'city': city,
      'state': state,
      'pincode': pincode,
      'country': country,
    };
  }
}

/// Payment Model
class Payment {
  final String paymentId;
  final double amount;
  final DateTime paymentDate;
  final String paymentMethod;
  final String? referenceNumber;
  final String? notes;
  final DateTime recordedAt;

  Payment({
    required this.paymentId,
    required this.amount,
    required this.paymentDate,
    required this.paymentMethod,
    this.referenceNumber,
    this.notes,
    required this.recordedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      paymentId: json['paymentId'],
      amount: (json['amount'] ?? 0).toDouble(),
      paymentDate: DateTime.parse(json['paymentDate']),
      paymentMethod: json['paymentMethod'],
      referenceNumber: json['referenceNumber'],
      notes: json['notes'],
      recordedAt: DateTime.parse(json['recordedAt']),
    );
  }
}

/// Invoice List Response
class InvoiceListResponse {
  final List<Invoice> invoices;
  final Pagination pagination;

  InvoiceListResponse({
    required this.invoices,
    required this.pagination,
  });

  factory InvoiceListResponse.fromJson(Map<String, dynamic> json) {
    return InvoiceListResponse(
      invoices: (json['data'] as List)
          .map((invoice) => Invoice.fromJson(invoice))
          .toList(),
      pagination: Pagination.fromJson(json['pagination']),
    );
  }
}

/// Pagination Model
class Pagination {
  final int total;
  final int page;
  final int limit;
  final int pages;

  Pagination({
    required this.total,
    required this.page,
    required this.limit,
    required this.pages,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      pages: json['pages'],
    );
  }
}

/// Invoice Statistics
class InvoiceStats {
  final int totalInvoices;
  final double totalRevenue;
  final double totalPaid;
  final double totalDue;
  final Map<String, StatusStats> byStatus;

  InvoiceStats({
    required this.totalInvoices,
    required this.totalRevenue,
    required this.totalPaid,
    required this.totalDue,
    required this.byStatus,
  });

  factory InvoiceStats.fromJson(Map<String, dynamic> json) {
    final byStatusMap = <String, StatusStats>{};
    
    if (json['byStatus'] != null) {
      (json['byStatus'] as Map<String, dynamic>).forEach((key, value) {
        byStatusMap[key] = StatusStats.fromJson(value);
      });
    }
    
    return InvoiceStats(
      totalInvoices: json['totalInvoices'] ?? 0,
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      totalPaid: (json['totalPaid'] ?? 0).toDouble(),
      totalDue: (json['totalDue'] ?? 0).toDouble(),
      byStatus: byStatusMap,
    );
  }
}

/// Status Statistics
class StatusStats {
  final int count;
  final double amount;

  StatusStats({
    required this.count,
    required this.amount,
  });

  factory StatusStats.fromJson(Map<String, dynamic> json) {
    return StatusStats(
      count: json['count'] ?? 0,
      amount: (json['amount'] ?? 0).toDouble(),
    );
  }
}

/// Payment Response
class PaymentResponse {
  final Invoice invoice;
  final Payment payment;

  PaymentResponse({
    required this.invoice,
    required this.payment,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      invoice: Invoice.fromJson(json['invoice']),
      payment: Payment.fromJson(json['payment']),
    );
  }
}

// ============================================================================
// BILLING CUSTOMER MODELS
// ============================================================================

/// Billing Customer Model
class BillingCustomer {
  final String id;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String? companyName;
  final String? gstNumber;
  final Address? billingAddress;
  final Address? shippingAddress;
  final String? contactPerson;
  final String? website;
  final String? notes;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  BillingCustomer({
    required this.id,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    this.companyName,
    this.gstNumber,
    this.billingAddress,
    this.shippingAddress,
    this.contactPerson,
    this.website,
    this.notes,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BillingCustomer.fromJson(Map<String, dynamic> json) {
    return BillingCustomer(
      id: json['_id'] ?? json['id'],
      customerName: json['customerName'],
      customerEmail: json['customerEmail'],
      customerPhone: json['customerPhone'],
      companyName: json['companyName'],
      gstNumber: json['gstNumber'],
      billingAddress: json['billingAddress'] != null
          ? Address.fromJson(json['billingAddress'])
          : null,
      shippingAddress: json['shippingAddress'] != null
          ? Address.fromJson(json['shippingAddress'])
          : null,
      contactPerson: json['contactPerson'],
      website: json['website'],
      notes: json['notes'],
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customerName': customerName,
      'customerEmail': customerEmail,
      'customerPhone': customerPhone,
      'companyName': companyName,
      'gstNumber': gstNumber,
      'billingAddress': billingAddress?.toJson(),
      'shippingAddress': shippingAddress?.toJson(),
      'contactPerson': contactPerson,
      'website': website,
      'notes': notes,
      'isActive': isActive,
    };
  }
}

/// Billing Customer List Response
class BillingCustomerListResponse {
  final List<BillingCustomer> customers;
  final Pagination pagination;

  BillingCustomerListResponse({
    required this.customers,
    required this.pagination,
  });

  factory BillingCustomerListResponse.fromJson(Map<String, dynamic> json) {
    return BillingCustomerListResponse(
      customers: (json['data'] as List)
          .map((customer) => BillingCustomer.fromJson(customer))
          .toList(),
      pagination: Pagination.fromJson(json['pagination']),
    );
  }
}

/// Billing Customer Statistics
class BillingCustomerStats {
  final int totalCustomers;
  final int activeCustomers;
  final int inactiveCustomers;

  BillingCustomerStats({
    required this.totalCustomers,
    required this.activeCustomers,
    required this.inactiveCustomers,
  });

  factory BillingCustomerStats.fromJson(Map<String, dynamic> json) {
    return BillingCustomerStats(
      totalCustomers: json['totalCustomers'] ?? 0,
      activeCustomers: json['activeCustomers'] ?? 0,
      inactiveCustomers: json['inactiveCustomers'] ?? 0,
    );
  }
}