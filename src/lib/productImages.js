const fromUploads = (file) => new URL(`../../uploads/${file}`, import.meta.url).href;

// Program/product images for the fixed seeded product UUIDs.
const PRODUCT_IMAGE_BY_ID = {
  '11111111-1111-1111-1111-111111111111': fromUploads('brokolis.jpg'),
  '22222222-2222-2222-2222-222222222222': fromUploads('paaugliu4.jpg'),
  '33333333-3333-3333-3333-333333333333': fromUploads('grupine8.jpg'),
  '44444444-4444-4444-4444-444444444444': fromUploads('testavimas8.jpg'),
};

export function getProductImageUrl(productId) {
  if (!productId) return null;
  return PRODUCT_IMAGE_BY_ID[String(productId)] || null;
}
