# 📋 Customer Group - What Is It?

## Overview

**Customer Group** is a categorization field in the billing system that helps you organize and segment your customers based on their business type or size.

## Purpose

Customer Groups allow you to:
1. **Segment customers** by business category
2. **Apply group-specific pricing** or discounts
3. **Generate reports** by customer segment
4. **Filter and search** customers easily
5. **Set different payment terms** per group
6. **Customize billing rules** for each group

## Available Groups (Current Setup)

In your system, there are 4 predefined customer groups:

### 1. **Enterprise** 🏢
- **Who:** Large corporations, big companies
- **Characteristics:**
  - High volume transactions
  - Multiple locations
  - Complex billing requirements
  - Long-term contracts
  - Negotiated rates
- **Example:** Tata Motors, Reliance Industries, Infosys

### 2. **SME** (Small & Medium Enterprises) 🏪
- **Who:** Small to medium-sized businesses
- **Characteristics:**
  - Moderate transaction volume
  - Growing businesses
  - Standard billing terms
  - Regular customers
- **Example:** Local transport companies, regional distributors

### 3. **Individual** 👤
- **Who:** Individual customers, sole proprietors
- **Characteristics:**
  - Personal accounts
  - Lower transaction volume
  - Simple billing needs
  - Pay-as-you-go
- **Example:** Individual travelers, freelancers, personal accounts

### 4. **Government** 🏛️
- **Who:** Government departments, public sector
- **Characteristics:**
  - Formal procurement process
  - Specific documentation requirements
  - Extended payment terms
  - Compliance requirements
- **Example:** Municipal corporations, government offices, PSUs

## How It Works in Your System

### Location in Form
```
Customer Information Tab
  ↓
Sales & Territory Section
  ↓
  - Customer Tier (Gold/Silver/Bronze/Platinum)
  - Sales Territory (Bangalore/Mumbai/Delhi...)
  - Customer Group ← HERE (Optional field)
  - Tags/Labels
```

### Field Details
- **Type:** Dropdown (Single selection)
- **Required:** No (Optional field)
- **Options:** Enterprise, SME, Individual, Government
- **Default:** None selected

## Use Cases

### 1. **Pricing Strategy**
```
Enterprise Group → 15% discount on bulk orders
SME Group → 10% discount
Individual Group → Standard pricing
Government Group → Special government rates
```

### 2. **Payment Terms**
```
Enterprise → Net 60 days
SME → Net 30 days
Individual → Immediate payment
Government → Net 90 days (as per policy)
```

### 3. **Reporting**
```
Generate reports like:
- Revenue by Customer Group
- Outstanding payments by Group
- Top customers in Enterprise segment
- Growth in SME segment
```

### 4. **Filtering**
```
In customer list, filter by:
- Show only Enterprise customers
- Show only Government customers
- Compare SME vs Individual performance
```

## Example Scenarios

### Scenario 1: Fleet Management Company
```
Customer: Asha Enterprises
Type: Organization
Group: SME
Tier: Gold
→ Gets SME pricing + Gold tier benefits
```

### Scenario 2: Government Contract
```
Customer: Bangalore Municipal Corporation
Type: Organization
Group: Government
Tier: Platinum
→ Gets government rates + extended payment terms
```

### Scenario 3: Individual Customer
```
Customer: Rajesh Kumar
Type: Individual
Group: Individual
Tier: Silver
→ Gets standard pricing + Silver benefits
```

## Difference: Customer Group vs Customer Type

| Feature | Customer Type | Customer Group |
|---------|--------------|----------------|
| **Purpose** | Legal classification | Business segmentation |
| **Options** | Individual, Organization, Vendor | Enterprise, SME, Individual, Government |
| **Required** | Yes | No (Optional) |
| **Use** | Determines form fields | Determines pricing/terms |
| **Example** | "Is this a person or company?" | "What size/type of business?" |

### Example Combination:
```
Customer Type: Organization (Legal entity)
Customer Group: Enterprise (Business size)

Customer Type: Individual (Person)
Customer Group: Individual (Personal account)

Customer Type: Organization (Legal entity)
Customer Group: Government (Public sector)
```

## Should You Use It?

### ✅ Use Customer Group When:
- You have different pricing for different customer segments
- You want to track revenue by business type
- You need to apply group-specific payment terms
- You want to filter customers by business category
- You have special rates for government/enterprise

### ❌ Skip Customer Group When:
- All customers get the same pricing
- You don't need business segmentation
- You prefer using Customer Tier for categorization
- Your business is too small to need this level of detail

## Recommendation for Your Fleet Management System

Based on your fleet management business, here's how you might use it:

### Suggested Mapping:
```
Enterprise Group:
- Large companies with 50+ vehicles
- Corporate contracts
- Dedicated fleet services

SME Group:
- Medium businesses with 10-50 vehicles
- Regular transport needs
- Standard contracts

Individual Group:
- Personal customers
- Occasional bookings
- Single vehicle rentals

Government Group:
- Government departments
- Public sector undertakings
- Tender-based contracts
```

## Current Status in Your Form

- ✅ Field is present and functional
- ✅ Optional (not required)
- ✅ 4 predefined groups
- ✅ Dropdown selection
- ✅ Saved with customer data

## Summary

**Customer Group** is a business segmentation tool that helps you:
- Categorize customers by business size/type
- Apply group-specific pricing and terms
- Generate meaningful business reports
- Filter and manage customers effectively

It's **optional** but useful if you have different pricing strategies or want to track performance by customer segment.

---

**Quick Answer:** Customer Group categorizes your customers as Enterprise, SME, Individual, or Government to help with pricing, reporting, and customer management. It's optional but useful for business segmentation.

