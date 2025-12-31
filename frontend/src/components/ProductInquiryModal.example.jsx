/**
 * EXAMPLE: How to use ProductInquiryModal in your product pages
 * 
 * Import and use it like this:
 */

import { useState } from 'react';
import ProductInquiryModal from '@/components/ProductInquiryModal';

// Example 1: In a Product Details Page
const ProductDetailsPage = ({ product }) => {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      
      {/* Button to open inquiry modal */}
      <button onClick={() => setIsInquiryModalOpen(true)}>
        Request Quote / Inquiry
      </button>

      {/* Inquiry Modal */}
      <ProductInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        productName={product.title}
        productId={product.id}
      />
    </div>
  );
};

// Example 2: In a Product List/Card
const ProductCard = ({ product }) => {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <div className="product-card">
      <img src={product.mainImage} alt={product.title} />
      <h3>{product.title}</h3>
      <p>${product.price}</p>
      
      <button onClick={() => setIsInquiryModalOpen(true)}>
        Inquire About This Product
      </button>

      <ProductInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        productName={product.title}
        productId={product.id}
      />
    </div>
  );
};

// Example 3: General Inquiry (no specific product)
const GeneralInquiryButton = () => {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsInquiryModalOpen(true)}>
        Contact Us / General Inquiry
      </button>

      <ProductInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        // No productName or productId - general inquiry
      />
    </>
  );
};

export default ProductDetailsPage;

