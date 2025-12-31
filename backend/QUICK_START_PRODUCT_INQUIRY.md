# Quick Start Guide - Product Inquiry API

## For Your Other Ecommerce Project

### 1. Base URL
```
http://your-server-url:5000/api/productinquiries
```

### 2. Most Common Endpoint - Submit Inquiry

**POST** `/api/productinquiries`

**Minimal Required Data:**
```json
{
  "username": "customer123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "country": "usa",
  "helpType": "pricing"
}
```

**With Product Link:**
```json
{
  "username": "customer123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "country": "usa",
  "helpType": "pricing",
  "productId": 123,
  "productName": "Samsung Galaxy S21"
}
```

### 3. Quick JavaScript Example

```javascript
// Simple function to submit inquiry
async function submitInquiry(formData) {
  const response = await fetch('http://localhost:5000/api/productinquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      country: formData.country,
      helpType: formData.helpType,
      productId: formData.productId || null,
      productName: formData.productName || null
    })
  });
  
  const result = await response.json();
  return result;
}

// Usage
submitInquiry({
  username: 'john_doe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  country: 'usa',
  helpType: 'pricing',
  productId: 123
}).then(data => {
  console.log('Success:', data);
}).catch(error => {
  console.error('Error:', error);
});
```

### 4. Help Type Options
- `"pricing"` - Volume Pricing
- `"shipping"` - Shipping Options
- `"specs"` - Product Specifications
- `"availability"` - Product Availability
- `"other"` - Other

### 5. Country Options
Any country name or code. Common examples:
- `"usa"`, `"uk"`, `"canada"`, `"australia"`, `"pakistan"`, `"india"`, `"uae"`

### 6. Response Format

**Success:**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 7. All Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/productinquiries` | Create new inquiry |
| GET | `/api/productinquiries` | List all inquiries (with filters) |
| GET | `/api/productinquiries/stats` | Get statistics |
| GET | `/api/productinquiries/:id` | Get single inquiry |
| PUT | `/api/productinquiries/:id` | Update inquiry |
| DELETE | `/api/productinquiries/:id` | Delete inquiry |

### 8. Filtering Inquiries (GET)

```
GET /api/productinquiries?status=pending&helpType=pricing&page=1&limit=20
```

Query Parameters:
- `status`: `pending`, `in_progress`, `resolved`, `closed`
- `helpType`: `pricing`, `shipping`, `specs`, `availability`, `other`
- `country`: Country name
- `productId`: Product ID
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Field to sort by
- `sortOrder`: `ASC` or `DESC`

