# Product Inquiry API Documentation

## Base URL
```
http://localhost:5000/api/productinquiries
```
(Replace `localhost:5000` with your actual server URL)

---

## 1. Create Product Inquiry

**Endpoint:** `POST /api/productinquiries`

**Description:** Submit a new product inquiry from a customer.

**Request Body:**
```json
{
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "companyName": "ABC Company",  // Optional
  "city": "New York",            // Optional
  "country": "usa",              // Required
  "helpType": "pricing",         // Required: pricing, shipping, specs, availability, other
  "productId": 123,              // Optional: Link to specific product
  "productName": "Samsung Galaxy S21",  // Optional
  "message": "I need bulk pricing for 100 units"  // Optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "companyName": "ABC Company",
    "city": "New York",
    "country": "usa",
    "helpType": "pricing",
    "productId": 123,
    "productName": "Samsung Galaxy S21",
    "message": "I need bulk pricing for 100 units",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "product": {
      "id": 123,
      "title": "Samsung Galaxy S21",
      "sku": "SAM-GAL-S21",
      "mainImage": "/uploads/products/samsung-s21.jpg"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/productinquiries \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "country": "usa",
    "helpType": "pricing",
    "productId": 123,
    "productName": "Samsung Galaxy S21"
  }'
```

**JavaScript/Fetch Example:**
```javascript
const response = await fetch('http://localhost:5000/api/productinquiries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    country: 'usa',
    helpType: 'pricing',
    productId: 123,
    productName: 'Samsung Galaxy S21'
  })
});

const data = await response.json();
console.log(data);
```

---

## 2. Get All Product Inquiries

**Endpoint:** `GET /api/productinquiries`

**Description:** Retrieve all product inquiries with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `in_progress`, `resolved`, `closed`)
- `helpType` (optional): Filter by help type (`pricing`, `shipping`, `specs`, `availability`, `other`)
- `country` (optional): Filter by country
- `productId` (optional): Filter by product ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (default: `createdAt`)
- `sortOrder` (optional): Sort order `ASC` or `DESC` (default: `DESC`)

**Example Request:**
```
GET /api/productinquiries?status=pending&page=1&limit=10&sortBy=createdAt&sortOrder=DESC
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "country": "usa",
      "helpType": "pricing",
      "productId": 123,
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "product": {
        "id": 123,
        "title": "Samsung Galaxy S21",
        "sku": "SAM-GAL-S21"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**cURL Example:**
```bash
curl "http://localhost:5000/api/productinquiries?status=pending&page=1&limit=10"
```

---

## 3. Get Single Product Inquiry

**Endpoint:** `GET /api/productinquiries/:id`

**Description:** Retrieve a specific product inquiry by ID.

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "companyName": "ABC Company",
    "city": "New York",
    "country": "usa",
    "helpType": "pricing",
    "productId": 123,
    "productName": "Samsung Galaxy S21",
    "message": "I need bulk pricing",
    "status": "pending",
    "notes": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "product": {
      "id": 123,
      "title": "Samsung Galaxy S21",
      "sku": "SAM-GAL-S21",
      "mainImage": "/uploads/products/samsung-s21.jpg"
    }
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Product inquiry not found"
}
```

**cURL Example:**
```bash
curl "http://localhost:5000/api/productinquiries/1"
```

---

## 4. Update Product Inquiry

**Endpoint:** `PUT /api/productinquiries/:id`

**Description:** Update an existing product inquiry (typically used by admin to update status or add notes).

**Request Body:**
```json
{
  "status": "in_progress",  // Optional: pending, in_progress, resolved, closed
  "notes": "Contacted customer via email",  // Optional
  "message": "Updated message",  // Optional
  "helpType": "pricing"  // Optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Inquiry updated successfully",
  "data": {
    "id": 1,
    "status": "in_progress",
    "notes": "Contacted customer via email",
    // ... other fields
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/productinquiries/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "notes": "Contacted customer via email"
  }'
```

---

## 5. Delete Product Inquiry

**Endpoint:** `DELETE /api/productinquiries/:id`

**Description:** Delete a product inquiry.

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Product inquiry deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/productinquiries/1
```

---

## 6. Get Inquiry Statistics

**Endpoint:** `GET /api/productinquiries/stats`

**Description:** Get statistics about product inquiries.

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "status": {
      "total": 150,
      "pending": 45,
      "inProgress": 20,
      "resolved": 70,
      "closed": 15
    },
    "helpTypes": [
      {
        "helpType": "pricing",
        "count": "60"
      },
      {
        "helpType": "shipping",
        "count": "30"
      },
      {
        "helpType": "specs",
        "count": "25"
      },
      {
        "helpType": "availability",
        "count": "20"
      },
      {
        "helpType": "other",
        "count": "15"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl "http://localhost:5000/api/productinquiries/stats"
```

---

## Field Definitions

### Required Fields
- `username` (string): Customer username
- `firstName` (string): Customer first name
- `lastName` (string): Customer last name
- `email` (string): Valid email address
- `country` (string): Country code/name
- `helpType` (enum): One of: `pricing`, `shipping`, `specs`, `availability`, `other`

### Optional Fields
- `companyName` (string): Company name
- `city` (string): City name
- `productId` (integer): ID of the product being inquired about
- `productName` (string): Name of the product
- `message` (text): Additional message from customer

### Status Values
- `pending`: New inquiry, not yet processed
- `in_progress`: Inquiry is being handled
- `resolved`: Inquiry has been resolved
- `closed`: Inquiry is closed

### Help Type Values
- `pricing`: Volume pricing inquiry
- `shipping`: Shipping options inquiry
- `specs`: Product specifications inquiry
- `availability`: Product availability inquiry
- `other`: Other type of inquiry

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (missing/invalid fields)
- `404`: Not Found
- `500`: Internal Server Error

---

## Complete Integration Example (React)

```javascript
// ProductInquiryService.js
const API_BASE_URL = 'http://localhost:5000/api/productinquiries';

export const submitInquiry = async (inquiryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit inquiry');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    throw error;
  }
};

export const getInquiries = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
};

export const getInquiryStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};
```

---

## Complete Integration Example (Axios)

```javascript
// productInquiryAPI.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/productinquiries';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productInquiryAPI = {
  // Create inquiry
  create: async (data) => {
    const response = await api.post('/', data);
    return response.data;
  },

  // Get all inquiries
  getAll: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get single inquiry
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Update inquiry
  update: async (id, data) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete inquiry
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};
```

---

## Testing with Postman

1. **Create Inquiry:**
   - Method: POST
   - URL: `http://localhost:5000/api/productinquiries`
   - Body (JSON):
   ```json
   {
     "username": "test_user",
     "firstName": "Test",
     "lastName": "User",
     "email": "test@example.com",
     "country": "usa",
     "helpType": "pricing"
   }
   ```

2. **Get All Inquiries:**
   - Method: GET
   - URL: `http://localhost:5000/api/productinquiries?status=pending`

3. **Get Statistics:**
   - Method: GET
   - URL: `http://localhost:5000/api/productinquiries/stats`

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Email validation is performed on the backend
- Product ID is optional - inquiries can be general (not linked to a specific product)
- The API automatically links to the Product model if `productId` is provided
- Status defaults to `pending` when creating a new inquiry

