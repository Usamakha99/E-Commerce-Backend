export const MENU_ITEMS = [{
  key: 'general',
  label: 'GENERAL',
  isTitle: true
}, {
  key: 'dashboards',
  icon: 'iconamoon:home-duotone',
  label: 'Dashboards',
  url: '/dashboard/analytics'
}, {
  key: 'apps',
  label: 'APPS',
  isTitle: true
}, {
  key: 'ecommerce',
  icon: 'iconamoon:shopping-bag-duotone',
  label: 'Ecommerce',
  children: [{
    key: 'ecommerce-products',
    label: 'Products',
    parentKey: 'ecommerce',
    children: [{
      key: 'ecommerce-products-list',
      label: 'Products List',
      url: '/ecommerce/products',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-product',
      label: 'Create Product',
      url: '/ecommerce/products/create',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-brand',
      label: 'Create Brand',
      url: '/ecommerce/brands/create',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-category',
      label: 'Create Category',
      url: '/ecommerce/categories/create',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-subcategory',
      label: 'Create SubCategory',
      url: '/ecommerce/subcategories/create',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-techproduct',
      label: 'Create TechProduct',
      url: '/ecommerce/TechProducts/create',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-techproductname',
      label: 'Create TechProductName',
      url: '/ecommerce/TechProductNames/create',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-product-tags',
      label: 'Product Tags',
      url: '/ecommerce/producttags',
      parentKey: 'ecommerce-products'
    }, {
      key: 'ecommerce-create-product-tag',
      label: 'Create Product Tag',
      url: '/ecommerce/producttags/create',
      parentKey: 'ecommerce-products'
    }]
  }, {
    key: 'ecommerce-ai-agents',
    label: 'AI Agents',
    parentKey: 'ecommerce',
    children: [{
      key: 'ecommerce-ai-agents-list',
      label: 'AI Agents List',
      url: '/ecommerce/aiagents',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-create-ai-agent',
      label: 'Create AI Agent',
      url: '/ecommerce/aiagents/create',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-ai-categories',
      label: 'AI Categories',
      url: '/ecommerce/aicategories',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-create-ai-category',
      label: 'Create AI Category',
      url: '/ecommerce/aicategories/create',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-delivery-methods',
      label: 'Delivery Methods',
      url: '/ecommerce/deliverymethods',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-create-delivery-method',
      label: 'Create Delivery Method',
      url: '/ecommerce/deliverymethods/create',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-publishers',
      label: 'Publishers',
      url: '/ecommerce/publishers',
      parentKey: 'ecommerce-ai-agents'
    }, {
      key: 'ecommerce-create-publisher',
      label: 'Create Publisher',
      url: '/ecommerce/publishers/create',
      parentKey: 'ecommerce-ai-agents'
    }]
  }, {
    key: 'ecommerce-inquiries',
    label: 'Product Inquiries',
    url: '/ecommerce/inquiries',
    parentKey: 'ecommerce'
  }, {
    key: 'ecommerce-customers',
    label: 'Customers',
    url: '/ecommerce/customers',
    parentKey: 'ecommerce'
  }, {
    key: 'ecommerce-sellers',
    label: 'Sellers',
    url: '/ecommerce/sellers',
    parentKey: 'ecommerce'
  }, {
    key: 'ecommerce-orders',
    label: 'Orders',
    url: '/ecommerce/orders',
    parentKey: 'ecommerce'
  }, {
    key: 'ecommerce-inventory',
    label: 'Inventory',
    url: '/ecommerce/inventory',
    parentKey: 'ecommerce'
  }]
}, {
  key: 'apps-invoices',
  icon: 'iconamoon:invoice-duotone',
  label: 'Invoices',
  children: [{
    key: 'invoices',
    label: 'Invoices List',
    url: '/invoices',
    parentKey: 'apps-invoices'
  }]
}, {
  key: 'custom',
  label: 'Custom',
  isTitle: true
}, {
  key: 'pages',
  label: 'Pages',
  isTitle: false,
  icon: 'iconamoon:copy-duotone',
  children: [{
    key: 'page-profile',
    label: 'Profile',
    url: '/pages/profile',
    parentKey: 'pages'
  }]
}];