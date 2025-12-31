# AI Agent API Documentation

## Base URL
```
http://localhost:5000/api/aiagents
```

## All Available Endpoints

### 1. Create AI Agent
**POST** `/api/aiagents`

**Request Body:**
```json
{
  "name": "Okta Platform",
  "slug": "okta-platform", // Optional - auto-generated from name if not provided
  "provider": "Okta, Inc",
  "logo": "https://example.com/logo.png",
  "shortDescription": "Secure your employees, contractors, and partners...",
  "description": "Full description text...",
  "overview": "Overview text...",
  "highlights": [
    "Highlight 1",
    "Highlight 2"
  ],
  "badges": [
    "Deployed on AWS",
    "Free Trial"
  ],
  "videoThumbnail": "https://example.com/video.jpg",
  "rating": 4.5,
  "awsReviews": 1,
  "externalReviews": 999,
  "freeTrial": true,
  "deployedOnAWS": true,
  "awsFreeTier": false,
  "deliveryMethodId": 1,
  "publisherId": 1,
  "soldBy": "Okta, Inc",
  "categoryIds": [1, 2, 3], // Array of category IDs
  "featuresContent": {
    "trustCenter": {
      "title": "Trust Center",
      "description": "Access real-time vendor security...",
      "buttonText": "View Trust Center",
      "buttonLink": "https://example.com/trust"
    },
    "buyerGuide": {
      "title": "Buyer Guide",
      "description": "Gain valuable insights...",
      "buttonText": "Get the Buyer Guide",
      "buttonLink": "https://example.com/guide"
    }
  },
  "resourcesContent": {
    "links": [
      {
        "title": "Customer Success Data Sheet",
        "url": "https://example.com/datasheet"
      }
    ],
    "videos": [
      {
        "title": "Product Overview",
        "url": "https://youtube.com/watch?v=xxx",
        "thumbnail": "https://example.com/thumb.jpg"
      }
    ]
  },
  "supportContent": {
    "vendorSupport": {
      "description": "Through our expert teams...",
      "email": "support@okta.com",
      "website": "https://support.okta.com/help"
    },
    "awsSupport": {
      "description": "AWS Support is a one-on-one...",
      "buttonText": "Get support",
      "buttonLink": "https://aws.amazon.com/support"
    }
  },
  "productComparisonContent": {
    "updatedWeekly": true,
    "products": [
      {
        "name": "OneLogin Workforce Identity",
        "provider": "OneLogin",
        "icon": "1L",
        "iconColor": "#0066CC"
      }
    ],
    "comparisonData": [
      {
        "category": "Accolades",
        "feature": "Reviews",
        "values": {
          "thisProduct": "Top 10 in Infrastructure",
          "product_1": "Top 100 in Applications"
        }
      }
    ]
  },
  "pricingContent": {
    "freeTrial": {
      "enabled": true,
      "description": "Try this product free...",
      "buttonText": "Try for free"
    },
    "pricing": {
      "description": "Pricing is based on...",
      "contracts": [
        {
          "title": "12-month contract",
          "duration": "12 months",
          "pricingRows": [
            {
              "whereToBuy": "Buy on AWS",
              "description": "Want to keep Identity at pace...",
              "cost": "Request a quote"
            }
          ]
        }
      ]
    },
    "refundPolicy": "All orders are non-cancellable...",
    "customPricing": {
      "enabled": true,
      "description": "Request a private offer...",
      "buttonText": "Request private offer"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Okta Platform",
    "slug": "okta-platform",
    ...
  }
}
```

---

### 2. Get All AI Agents
**GET** `/api/aiagents`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name, provider, or description
- `categoryId` - Filter by category ID
- `deliveryMethodId` - Filter by delivery method ID
- `publisherId` - Filter by publisher ID
- `freeTrial` - Filter by free trial (true/false)
- `deployedOnAWS` - Filter by deployed on AWS (true/false)
- `sortBy` - Sort field (name, rating, createdAt, etc.)
- `sortOrder` - Sort order (ASC, DESC)

**Example:**
```
GET /api/aiagents?page=1&limit=20&search=okta&categoryId=1&sortBy=rating&sortOrder=DESC
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Okta Platform",
      "slug": "okta-platform",
      "provider": "Okta, Inc",
      "rating": 4.5,
      "categories": [...],
      "deliveryMethod": {...},
      "publisher": {...}
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

### 3. Get Single AI Agent
**GET** `/api/aiagents/:id`

**Parameters:**
- `id` - AI Agent ID or slug

**Example:**
```
GET /api/aiagents/1
GET /api/aiagents/okta-platform
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Okta Platform",
    "slug": "okta-platform",
    "provider": "Okta, Inc",
    "logo": "https://example.com/logo.png",
    "shortDescription": "...",
    "description": "...",
    "overview": "...",
    "highlights": [...],
    "badges": [...],
    "rating": 4.5,
    "awsReviews": 1,
    "externalReviews": 999,
    "freeTrial": true,
    "deployedOnAWS": true,
    "awsFreeTier": false,
    "categories": [
      {
        "id": 1,
        "name": "Security",
        "slug": "security"
      }
    ],
    "deliveryMethod": {
      "id": 1,
      "name": "SaaS",
      "slug": "saas"
    },
    "publisher": {
      "id": 1,
      "name": "Okta, Inc",
      "slug": "okta-inc"
    },
    "featuresContent": {...},
    "resourcesContent": {...},
    "supportContent": {...},
    "productComparisonContent": {...},
    "pricingContent": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update AI Agent
**PUT** `/api/aiagents/:id`

**Parameters:**
- `id` - AI Agent ID

**Request Body:** (Same as Create, all fields optional)

**Example:**
```json
{
  "name": "Updated Name",
  "rating": 4.8,
  "featuresContent": {
    "trustCenter": {
      "title": "Updated Trust Center",
      "description": "Updated description..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Name",
    ...
  }
}
```

---

### 5. Delete AI Agent
**DELETE** `/api/aiagents/:id`

**Parameters:**
- `id` - AI Agent ID

**Response:**
```json
{
  "success": true,
  "message": "AI Agent deleted successfully"
}
```

---

### 6. Get Categories with Counts
**GET** `/api/aiagents/categories/counts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Security",
      "slug": "security",
      "count": 25
    },
    {
      "id": 2,
      "name": "Software Development",
      "slug": "software-development",
      "count": 50
    }
  ]
}
```

---

### 7. Get Delivery Methods with Counts
**GET** `/api/aiagents/delivery-methods/counts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SaaS",
      "slug": "saas",
      "count": 100
    },
    {
      "id": 2,
      "name": "Professional Services",
      "slug": "professional-services",
      "count": 50
    }
  ]
}
```

---

### 8. Get Publishers with Counts
**GET** `/api/aiagents/publishers/counts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Okta, Inc",
      "slug": "okta-inc",
      "count": 10
    },
    {
      "id": 2,
      "name": "Flexa Cloud",
      "slug": "flexa-cloud",
      "count": 25
    }
  ]
}
```

---

## Frontend Integration Example

### Using Axios Directly

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create AI Agent
const createAIAgent = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/aiagents`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating AI Agent:', error);
    throw error;
  }
};

// Get All AI Agents
const getAIAgents = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_BASE_URL}/aiagents?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI Agents:', error);
    throw error;
  }
};

// Get Single AI Agent
const getAIAgent = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aiagents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI Agent:', error);
    throw error;
  }
};

// Update AI Agent
const updateAIAgent = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/aiagents/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating AI Agent:', error);
    throw error;
  }
};

// Delete AI Agent
const deleteAIAgent = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/aiagents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting AI Agent:', error);
    throw error;
  }
};

// Get Categories with Counts
const getCategoriesWithCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aiagents/categories/counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get Delivery Methods with Counts
const getDeliveryMethodsWithCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aiagents/delivery-methods/counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery methods:', error);
    throw error;
  }
};

// Get Publishers with Counts
const getPublishersWithCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aiagents/publishers/counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw error;
  }
};
```

### Using Existing HTTP Service (Already in your project)

```javascript
import {
  createAIAgent,
  getAIAgents,
  getAIAgent,
  updateAIAgent,
  deleteAIAgent,
  getCategoriesWithCounts,
  getDeliveryMethodsWithCounts,
  getPublishersWithCounts
} from '@/http/AIAgent';

// Example usage in React component
const MyComponent = () => {
  // Get all AI Agents
  const fetchAgents = async () => {
    try {
      const response = await getAIAgents({
        page: 1,
        limit: 20,
        search: 'okta',
        categoryId: 1
      });
      console.log('AI Agents:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Get single agent
  const fetchAgent = async (id) => {
    try {
      const response = await getAIAgent(id);
      console.log('AI Agent:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Create agent
  const createAgent = async () => {
    try {
      const response = await createAIAgent({
        name: 'New Agent',
        provider: 'Provider Name',
        // ... other fields
      });
      console.log('Created:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Update agent
  const updateAgent = async (id) => {
    try {
      const response = await updateAIAgent(id, {
        name: 'Updated Name',
        rating: 4.8
      });
      console.log('Updated:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Delete agent
  const deleteAgent = async (id) => {
    try {
      await deleteAIAgent(id);
      console.log('Deleted successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };
};
```

---

## Complete Example: Fetch and Display AI Agents

```javascript
import { useState, useEffect } from 'react';
import { getAIAgents, getAIAgent } from '@/http/AIAgent';

const AIAgentsList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    categoryId: null
  });

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await getAIAgents(filters);
      setAgents(response.data.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>AI Agents</h1>
      {agents.map(agent => (
        <div key={agent.id}>
          <h2>{agent.name}</h2>
          <p>{agent.provider}</p>
          <p>Rating: {agent.rating}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## Notes

1. **Slug Generation**: If `slug` is not provided, it will be auto-generated from the `name` field
2. **Categories**: Use `categoryIds` array to associate multiple categories with an agent
3. **JSON Fields**: `featuresContent`, `resourcesContent`, `supportContent`, `productComparisonContent`, and `pricingContent` are JSON fields - send them as objects
4. **Pagination**: Default page size is 10, maximum is 100
5. **Search**: Searches across name, provider, and description fields
6. **Sorting**: Available sort fields: `name`, `rating`, `createdAt`, `updatedAt`

