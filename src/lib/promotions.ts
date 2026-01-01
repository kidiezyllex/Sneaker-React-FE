import { IPromotion } from "@/interface/response/promotion";

export interface ProductWithDiscount {
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  appliedPromotion?: IPromotion;
}

export const calculateProductDiscount = (
  productId: string | number,
  originalPrice: number,
  activePromotions: any[]
): ProductWithDiscount => {
  
  if (!activePromotions || activePromotions.length === 0) {
    return {
      originalPrice,
      discountedPrice: originalPrice,
      discountPercent: 0,
    };
  }

  const now = new Date();
  const applicablePromotions = activePromotions.filter(promotion => {
    if (promotion.status !== 'ACTIVE' && promotion.status !== 'ACTIVE') {
      return false;
    }

    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (now < startDate || now > endDate) {
      return false;
    }

    let productIds = [];
    if (promotion.productIds) {
      if (typeof promotion.productIds === 'string') {
        try {
          productIds = JSON.parse(promotion.productIds);
        } catch (e) {
          productIds = [];
        }
      } else if (Array.isArray(promotion.productIds)) {
        productIds = promotion.productIds;
      }
    } else if (promotion.products) {
      productIds = promotion.products;
    }

    if (!productIds || productIds.length === 0) {
      return true;
    }

    const isApplicable = productIds.some((p: any) => {
      let promotionProductId: string;

      if (typeof p === 'string') {
        promotionProductId = p;
      } else if (p && typeof p === 'object') {
        promotionProductId = p.id || p._id || String(p);
      } else {
        promotionProductId = String(p);
      }

      const matches = promotionProductId === productId || promotionProductId === String(productId);
      return matches;
    });

    return isApplicable;
  });
  if (applicablePromotions.length === 0) {
    return {
      originalPrice,
      discountedPrice: originalPrice,
      discountPercent: 0,
    };
  }

  const bestPromotion = applicablePromotions.reduce((best, current) => {
    const bestDiscount = parseFloat(String(best.discountPercent));
    const currentDiscount = parseFloat(String(current.discountPercent));
    return currentDiscount > bestDiscount ? current : best;
  });

  const discountPercent = parseFloat(String(bestPromotion.discountPercent));
  const discountAmount = (originalPrice * discountPercent) / 100;
  const discountedPrice = originalPrice - discountAmount;
  
  const result = {
    originalPrice,
    discountedPrice: Math.max(0, Math.round(discountedPrice)),
    discountPercent: discountPercent,
    appliedPromotion: bestPromotion,
  };
  
  return result;
};

export const applyPromotionsToProducts = (
  products: any[],
  activePromotions: any[]
): any[] => {
  if (!activePromotions || activePromotions.length === 0) {
    return products;
  }

  return products.map(product => {
    const basePrice = product.variants?.[0]?.price || 0;

    if (basePrice === 0) {
      return {
        ...product,
        originalPrice: 0,
        discountedPrice: 0,
        discountPercent: 0,
        hasDiscount: false,
      };
    }

    const productId = String(product.id || product._id);

    const discountInfo = calculateProductDiscount(
      productId,
      basePrice,
      activePromotions
    );

    const result = {
      ...product,
      originalPrice: discountInfo.originalPrice,
      discountedPrice: discountInfo.discountedPrice,
      discountPercent: discountInfo.discountPercent,
      appliedPromotion: discountInfo.appliedPromotion,
      hasDiscount: discountInfo.discountPercent > 0,
    };

    return result;
  });
};

export const isPromotionActive = (promotion: any): boolean => {
  if (promotion.status !== 'ACTIVE' && promotion.status !== 'ACTIVE') return false;

  const now = new Date();
  
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);

  return now >= startDate && now <= endDate;
};

export const filterActivePromotions = (promotions: any[]): any[] => {
  if (!promotions || promotions.length === 0) return [];
  
  const now = new Date();
  const activePromotions = promotions.filter(promotion => {
    const isActive = isPromotionActive(promotion);
    return isActive;
  });
  return activePromotions;
};