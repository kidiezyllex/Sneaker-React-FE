"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";
import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import {
  mdiMagnify, mdiInvoicePlus,
  mdiClose,
  mdiCart,
  mdiChevronDown,
  mdiViewGridOutline,
  mdiTableLarge,
  mdiInvoiceListOutline
} from "@mdi/js";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CommonPagination } from "@/components/ui/common-pagination";

import { useProducts, useSearchProducts } from "@/hooks/product";
import { usePromotions } from "@/hooks/promotion";
import {
  applyPromotionsToProducts,
  filterActivePromotions,
} from "@/lib/promotions";
import { IProductFilter } from "@/interface/request/product";

import { usePOSCartStore, POSCartItem } from "@/stores/usePOSCartStore";
import { usePendingCartsStore } from "@/stores/usePendingCartsStore";

import { getSizeLabel } from "@/utils/sizeMapping";

import { Input } from "@/components/ui/input";
import { useAccounts } from "@/hooks/account";
import { useValidateVoucher } from "@/hooks/voucher";
import { useCreatePOSOrder } from "@/hooks/order";
import POSRightSection from "./components/POSRightSection";
import InvoiceDialog from "./components/InvoiceDialog";
import ProductTableView from "./components/ProductTableView";
import ProductGridView from "./components/ProductGridView";
import ProductDetailDialog from "./components/ProductDetailDialog";
import { Button } from "@/components/ui/button";

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex -space-x-1">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-full mt-3" />
    </div>
  </div>
);

interface ApiVariant {
  id: string;
  colorId?: { id: string; name: string; code: string; images?: string[] }; // Color information if applicable
  sizeId?: { id: string; name: string; value?: string }; // Size information if applicable
  price: number;
  stock: number;
  images?: string[];
  sku?: string;
  actualSizeId?: string;
}

interface ApiProduct {
  id: string;
  name: string;
  brand: { id: string; name: string } | string;
  category: { id: string; name: string } | string;
  description?: string;
  variants: ApiVariant[];
  status?: string;
  createdAt: string;
}

const getVariantImageUrl = (variant: any) => {
  if (
    !variant?.images ||
    !Array.isArray(variant.images) ||
    variant.images.length === 0
  ) {
    return "/images/white-image.png";
  }

  const firstImage = variant.images[0];
  if (typeof firstImage === "string") {
    return firstImage;
  } else if (typeof firstImage === "object" && firstImage?.imageUrl) {
    return firstImage.imageUrl;
  } else if (typeof firstImage === "object" && firstImage?.url) {
    return firstImage.url;
  }

  return "/images/white-image.png";
};

const convertVariantToApiVariant = (variant: any): ApiVariant => {
  if (!variant) {
    return {
      id: "",
      price: 0,
      stock: 0,
      images: [],
    };
  }

  let colorData = undefined;
  if (variant.color) {
    colorData = {
      id: variant.color.id?.toString() || "",
      name: variant.color.name || "N/A",
      code: variant.color.code || "#000000",
      images: variant.color.images || [],
    };
  } else if (variant.colorId) {
    if (typeof variant.colorId === "object") {
      colorData = {
        id: variant.colorId.id?.toString() || "",
        name: variant.colorId.name || "N/A",
        code: variant.colorId.code || "#000000",
        images: variant.colorId.images || [],
      };
    } else {
      colorData = {
        id: variant.colorId.toString(),
        name: "N/A",
        code: "#000000",
        images: [],
      };
    }
  }

  let sizeData = undefined;
  if (variant.size) {
    sizeData = {
      id: variant.size.id?.toString() || "",
      name:
        variant.size.name ||
        (variant.size.value ? getSizeLabel(Number(variant.size.value)) : "N/A"),
      value: variant.size.value?.toString(),
    };
  } else if (variant.sizeId) {
    if (typeof variant.sizeId === "object") {
      sizeData = {
        id: variant.sizeId.id?.toString() || "",
        name:
          variant.sizeId.name ||
          (variant.sizeId.value
            ? getSizeLabel(Number(variant.sizeId.value))
            : "N/A"),
        value: variant.sizeId.value?.toString(),
      };
    } else {
      sizeData = {
        id: variant.sizeId.toString(),
        name: "N/A",
        value: undefined,
      };
    }
  }

  return {
    id: variant.id?.toString() || variant._id?.toString() || "",
    colorId: colorData,
    sizeId: sizeData,
    price: parseFloat(variant.price?.toString() || "0"),
    stock: parseInt(variant.stock?.toString() || "0"),
    images:
      variant.images?.map((img: any) =>
        typeof img === "string" ? img : img.imageUrl || img.url
      ) || [],
    sku: variant.sku || "",
    actualSizeId: sizeData?.id || "",
  };
};

const convertProductToApiProduct = (product: any): ApiProduct => {
  if (!product) {
    return {
      id: "",
      name: "Unknown Product",
      brand: "Unknown",
      category: "Unknown",
      variants: [],
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: product.id?.toString() || product._id?.toString() || "",
    name: product.name || "Unknown Product",
    brand: product.brand || "Unknown",
    category: product.category || "Unknown",
    description: product.description,
    variants: product.variants?.map(convertVariantToApiVariant) || [],
    status: product.status,
    createdAt: product.createdAt || new Date().toISOString(),
  };
};

export default function POSPage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(
    null
  );
  const [selectedApiVariant, setSelectedApiVariant] =
    useState<ApiVariant | null>(null);

  const {
    carts: pendingCarts,
    activeCartId,
    createNewCart,
    setActiveCart,
    addItemToCart: addItemToPendingCart,
    updateItemQuantityInCart: updateItemQuantityInPendingCart,
    clearCartItems: clearPendingCartItems,
    removeItemFromCart,
    deleteCart,
    getActiveCart,
  } = usePendingCartsStore();

  const {
    items: mainCartItems,
    addToCart: addToCartStore,
    clearCart: clearCartStore,
    updateQuantity: updateQuantityStore,
  } = usePOSCartStore();

  const activeCart = getActiveCart();
  const cartItems = useMemo(() => {
    if (activeCartId && activeCart) {
      return activeCart.items;
    }
    return mainCartItems;
  }, [activeCartId, activeCart, mainCartItems]);

  const [pagination, setPagination] = useState({ page: 1, limit: 6 });
  const [filters, setFilters] = useState<IProductFilter>({ status: "ACTIVE" });
  const [sortOption, setSortOption] = useState<string>("newest");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeCategoryName, setActiveCategoryName] =
    useState<string>("Tất cả sản phẩm");

  // State for POSRightSection (Checkout Logic)
  const [couponCode, setCouponCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("guest");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState<number | string>(0);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // State for Product Detail Dialog
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any>(null);

  const { data: usersData } = useAccounts({ limit: 100 });
  const validateVoucherMutation = useValidateVoucher();
  const createPOSOrderMutation = useCreatePOSOrder();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === "PERCENTAGE") {
      const calculated = (subtotal * appliedVoucher.value) / 100;
      return Math.min(calculated, appliedVoucher.maxDiscount || calculated);
    }
    return Math.min(appliedVoucher.value, subtotal);
  }, [subtotal, appliedVoucher]);

  const total = useMemo(() => subtotal - discount, [subtotal, discount]);

  const changeDue = useMemo(() => {
    const received =
      typeof cashReceived === "number"
        ? cashReceived
        : parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  }, [cashReceived, total]);

  const onApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await validateVoucherMutation.mutateAsync({
        code: couponCode,
        orderValue: subtotal,
        userId: selectedUserId !== "guest" ? selectedUserId : undefined,
      });
      if (response && response.data) {
        setAppliedVoucher(response.data);
        toast.success(
          <CustomToast title="Đã áp dụng mã giảm giá thành công!" />
        );
      }
    } catch (error: any) {
      toast.error(
        <CustomToast
          title={error?.response?.data?.message || "Mã giảm giá không hợp lệ"}
          type="error"
        />
      );
      setAppliedVoucher(null);
    }
  };

  const onCheckout = async () => {
    if (cartItems.length === 0) return;

    const orderData = {
      accountId: selectedUserId !== "guest" ? selectedUserId : undefined,
      customerName:
        selectedUserId === "guest" && customerName ? customerName : undefined,
      customerPhone:
        selectedUserId === "guest" && customerPhone ? customerPhone : undefined,
      voucherId: appliedVoucher?.id,
      paymentMethod,
      items: cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: total,
      subTotal: subtotal,
      discountAmount: discount,
      cashReceived: paymentMethod === "cash" ? Number(cashReceived) : total,
    };

    try {
      const response = await createPOSOrderMutation.mutateAsync(orderData);
      if (response && response.data) {
        setCreatedOrder(response.data);
        setIsInvoiceDialogOpen(true);
        toast.success(<CustomToast title="Thanh toán đơn hàng thành công!" />);

        // Reset state after success
        if (activeCartId) {
          clearPendingCartItems(activeCartId);
        } else {
          clearCartStore();
        }
        setAppliedVoucher(null);
        setCouponCode("");
        setCustomerName("");
        setCustomerPhone("");
        setSelectedUserId("guest");
        setCashReceived(0);
      }
    } catch (error: any) {
      toast.error(
        <CustomToast
          title={error?.response?.data?.message || "Thanh toán thất bại"}
          type="error"
        />
      );
    }
  };

  const onUserSelect = (id: string) => {
    setSelectedUserId(id);
    if (id !== "guest") {
      const user = usersData?.data?.accounts?.find((u: any) => u.id === id);
      if (user) {
        setCustomerName(user.fullName || "");
        setCustomerPhone(user.phoneNumber || "");
      }
    } else {
      setCustomerName("");
      setCustomerPhone("");
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    if (activeCartId) {
      clearPendingCartItems(activeCartId);
    } else {
      clearCartStore();
    }
    setAppliedVoucher(null);
    setCouponCode("");
    toast.success(<CustomToast title="Đã làm mới giỏ hàng." />);
  };

  const onRemoveCartItem = (id: string) => {
    if (activeCartId) {
      removeItemFromCart(activeCartId, id);
    } else {
      const { removeFromCart } = usePOSCartStore.getState();
      removeFromCart(id);
    }
    toast.info(
      <CustomToast title="Đã xóa sản phẩm khỏi giỏ hàng" type="info" />
    );
  };

  const onUpdateQuantity = (id: string, delta: number) => {
    if (activeCartId) {
      updateItemQuantityInPendingCart(activeCartId, id, delta);
    } else {
      updateQuantityStore(id, delta);
    }
  };

  // Sync state when switching carts
  useEffect(() => {
    if (activeCartId && activeCart) {
      setAppliedVoucher(activeCart.appliedVoucher || null);
      setCouponCode(activeCart.couponCode || "");
    } else {
      setAppliedVoucher(null);
      setCouponCode("");
    }
  }, [activeCartId, activeCart]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsSearching(searchQuery.trim().length > 0);
    }, 300); // Reduce from 500ms to 300ms for better UX

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setFilters((prevFilters) => {
      const isAllProducts = activeCategoryName === "Tất cả sản phẩm";

      if (isAllProducts) {
        const { categories, ...restFilters } = prevFilters;
        return categories ? restFilters : prevFilters;
      } else {
        const newCategories = [activeCategoryName];
        if (prevFilters.categories?.[0] === activeCategoryName) {
          return prevFilters; // No change needed
        }
        return { ...prevFilters, categories: newCategories };
      }
    });

    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeCategoryName]);

  const productsHookParams: IProductFilter = useMemo(
    () => ({
      ...pagination,
      ...filters,
    }),
    [pagination.page, pagination.limit, filters.status, filters.categories]
  );

  const productsQuery = useProducts(productsHookParams);

  const searchQueryParams = useMemo(() => {
    if (!isSearching) return { keyword: "" };
    return {
      keyword: searchQuery,
      status: "ACTIVE" as const,
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.categories && { categories: filters.categories }),
    };
  }, [
    isSearching,
    searchQuery,
    pagination.page,
    pagination.limit,
    filters.categories,
  ]);

  const searchQueryHook = useSearchProducts(searchQueryParams);

  const {
    data: rawData,
    isLoading: apiIsLoading,
    isError: apiIsError,
  } = isSearching ? searchQueryHook : productsQuery;

  const promotionsParams = useMemo(() => ({ status: "ACTIVE" as const }), []);
  const { data: promotionsData } = usePromotions(promotionsParams);
  const dataWithPromotions = useMemo(() => {
    if (!rawData) return rawData;

    let products = Array.isArray(rawData.data)
      ? rawData.data
      : (rawData.data as any)?.products;

    if (!products || !Array.isArray(products)) {
      if (Array.isArray(rawData)) products = rawData;
      else return rawData;
    }

    if (promotionsData?.data?.promotions?.length > 0) {
      const activePromotions = filterActivePromotions(
        promotionsData.data.promotions
      );
      products = applyPromotionsToProducts([...products], activePromotions);
    }

    return {
      ...rawData,
      data: products,
      pagination:
        rawData.pagination ||
        (rawData as any).meta?.pagination ||
        (rawData.data as any)?.pagination,
    };
  }, [rawData, promotionsData?.data?.promotions]);

  const processedProducts = useMemo(() => {
    const products = dataWithPromotions?.data;
    if (!products || !Array.isArray(products) || products.length === 0)
      return [];

    if (sortOption === "default" || sortOption === "newest") {
      return products;
    }

    return [...products].sort((a, b) => {
      const priceA = (a as any).hasDiscount
        ? (a as any).discountedPrice
        : a.variants[0]?.price || 0;
      const priceB = (b as any).hasDiscount
        ? (b as any).discountedPrice
        : b.variants[0]?.price || 0;

      switch (sortOption) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        default:
          return 0;
      }
    });
  }, [dataWithPromotions?.data, sortOption]);

  const dynamicCategories = useMemo(() => {
    const baseCategories = [{ id: "all", name: "Tất cả sản phẩm" }];
    const products = dataWithPromotions?.data;

    if (!products || !Array.isArray(products) || products.length === 0)
      return baseCategories;

    const uniqueCatObjects = new Map<string, { id: string; name: string }>();

    for (const product of products) {
      const category = product.category;
      if (category && typeof category === "object") {
        const catId = (category as any).id?.toString();
        const catName = category.name;
        if (catId && catName && !uniqueCatObjects.has(catId)) {
          uniqueCatObjects.set(catId, { id: catId, name: catName });
        }
      } else if (typeof category === "string") {
        if (!uniqueCatObjects.has(category)) {
          uniqueCatObjects.set(category, { id: category, name: category });
        }
      }
    }

    return [...baseCategories, ...Array.from(uniqueCatObjects.values())];
  }, [dataWithPromotions?.data]);

  const handleProductSelect = (product: any) => {
    const productWithPromotion = { ...product };

    const convertedProduct = convertProductToApiProduct(product);

    if ((product as any).hasDiscount) {
      (convertedProduct as any).hasDiscount = (product as any).hasDiscount;
      (convertedProduct as any).discountedPrice = (
        product as any
      ).discountedPrice;
      (convertedProduct as any).originalPrice = (product as any).originalPrice;
      (convertedProduct as any).discountPercent = (
        product as any
      ).discountPercent;
      (convertedProduct as any).appliedPromotion = (
        product as any
      ).appliedPromotion;
    }

    setSelectedProduct(convertedProduct);

    if (convertedProduct.variants && convertedProduct.variants.length > 0) {
      const variantWithStock = convertedProduct.variants.find(
        (v) => v.stock > 0
      );
      const selectedVariant = variantWithStock || convertedProduct.variants[0];
      setSelectedApiVariant(selectedVariant);

      if (!variantWithStock) {
        toast.warn(
          <CustomToast
            title="Sản phẩm này hiện tại đã hết hàng."
            type="warning"
          />,
          { icon: false }
        );
      }
    } else {
      setSelectedApiVariant(null);
      toast.warn(
        <CustomToast title="Sản phẩm này không có biến thể." type="warning" />,
        { icon: false }
      );
    }
  };

  const handleColorSelectFromDetail = (colorId: string) => {
    if (!selectedProduct) return;

    const variantsWithThisColor = selectedProduct.variants.filter(
      (v) => v.colorId?.id === colorId
    );
    if (variantsWithThisColor.length === 0) return;

    const variantWithStock = variantsWithThisColor.find((v) => v.stock > 0);
    if (variantWithStock) {
      setSelectedApiVariant(variantWithStock);
    } else {
      setSelectedApiVariant(variantsWithThisColor[0]);
      toast.warn(<CustomToast title="Màu này đã hết hàng." type="warning" />, {
        icon: false,
      });
    }
  };

  const handleSizeSelectFromDetail = (sizeId: string) => {
    if (!selectedProduct || !selectedApiVariant?.colorId) return;

    const variantWithThisSizeAndColor = selectedProduct.variants.find(
      (v) =>
        v.colorId?.id === selectedApiVariant.colorId?.id &&
        v.sizeId?.id === sizeId
    );

    if (variantWithThisSizeAndColor) {
      setSelectedApiVariant(variantWithThisSizeAndColor);
      if (variantWithThisSizeAndColor.stock === 0) {
        toast.warn(
          <CustomToast
            title="Kích thước này với màu đã chọn đã hết hàng."
            type="warning"
          />,
          { icon: false }
        );
      }
    }
  };
  const addItemToCorrectCart = (
    product: any,
    variant: any,
    isAlreadyConverted = false,
    quantityToAdd = 1
  ) => {
    const convertedProduct = isAlreadyConverted
      ? product
      : convertProductToApiProduct(product);
    const convertedVariant = isAlreadyConverted
      ? variant
      : convertVariantToApiVariant(variant);

    const cartItemId = `${convertedProduct.id}-${convertedVariant.id}`;

    let finalPrice = convertedVariant.price;
    let originalPrice = undefined;
    let discountPercent = undefined;
    let hasDiscount = false;

    if ((product as any).hasDiscount) {
      finalPrice = (product as any).discountedPrice;
      originalPrice = (product as any).originalPrice;
      discountPercent = (product as any).discountPercent;
      hasDiscount = true;
    } else if (promotionsData?.data?.promotions?.length > 0) {
      const activePromotions = filterActivePromotions(
        promotionsData.data.promotions
      );
      const productWithPromotions = applyPromotionsToProducts(
        [convertedProduct],
        activePromotions
      );
      const promotedProduct = productWithPromotions[0];

      if (promotedProduct?.hasDiscount) {
        finalPrice = promotedProduct.discountedPrice;
        originalPrice = promotedProduct.originalPrice;
        discountPercent = promotedProduct.discountPercent;
        hasDiscount = true;
      }
    }

    const newItem: POSCartItem = {
      id: cartItemId,
      productId: convertedProduct.id,
      variantId: convertedVariant.id,
      name: convertedProduct.name,
      colorName: convertedVariant.colorId?.name || "N/A",
      colorCode: convertedVariant.colorId?.code || "#000000",
      sizeName: convertedVariant.sizeId?.name || "N/A",
      price: finalPrice,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      hasDiscount: hasDiscount,
      quantity: quantityToAdd,
      image: getVariantImageUrl(convertedVariant) || "/placeholder.svg",
      stock: convertedVariant.stock,
      actualColorId: convertedVariant.colorId?.id || "",
      actualSizeId: convertedVariant.sizeId?.id || "",
    };

    if (activeCartId) {
      const existingItem = cartItems.find((item) => item.id === cartItemId);
      const activeCartName =
        pendingCarts.find((cart) => cart.id === activeCartId)?.name ||
        "Giỏ hàng";

      if (existingItem) {
        if (existingItem.quantity + quantityToAdd <= convertedVariant.stock) {
          updateItemQuantityInPendingCart(activeCartId, cartItemId, quantityToAdd);
          toast.success(
            <CustomToast
              title={`Đã cập nhật số lượng sản phẩm trong ${activeCartName}.`}
            />,
            { icon: false }
          );
        } else {
          toast.warn(
            <CustomToast
              title="Số lượng sản phẩm trong kho không đủ."
              type="warning"
            />,
            { icon: false }
          );
        }
      } else {
        addItemToPendingCart(activeCartId, newItem);
        toast.success(
          <CustomToast title={`Đã thêm sản phẩm vào ${activeCartName}`} />,
          { icon: false }
        );
      }
    } else {
      const existingItem = mainCartItems.find((item) => item.id === cartItemId);
      if (existingItem) {
        if (existingItem.quantity + quantityToAdd <= convertedVariant.stock) {
          updateQuantityStore(cartItemId, quantityToAdd);
          toast.success(
            <CustomToast title="Đã cập nhật số lượng sản phẩm." />,
            { icon: false }
          );
        } else {
          toast.warn(
            <CustomToast
              title="Số lượng sản phẩm trong kho không đủ."
              type="warning"
            />,
            { icon: false }
          );
        }
      } else {
        addToCartStore(newItem);
        toast.success(<CustomToast title="Đã thêm sản phẩm vào giỏ hàng" />, {
          icon: false,
        });
      }
    }
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedApiVariant) {
      toast.error(
        <CustomToast
          title="Vui lòng chọn sản phẩm và biến thể."
          type="error"
        />,
        { icon: false }
      );
      return;
    }

    if (selectedApiVariant.stock <= 0) {
      toast.error(<CustomToast title="Sản phẩm đã hết hàng." type="error" />, {
        icon: false,
      });
      return;
    }

    addItemToCorrectCart(selectedProduct, selectedApiVariant, true);
  };



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "c") {
        if (cartItems.length > 0) {
          handleClearCart();
          setSelectedProduct(null);
          setSelectedApiVariant(null);
        }
      }

      if (e.altKey && e.key === "s") {
        const searchInput = document.getElementById("product-search");
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartItems, activeCartId]);

  const uniqueColorsForSelectedProduct = useMemo(() => {
    if (!selectedProduct?.variants?.length) return [];
    const colorMap = new Map<string, ApiVariant["colorId"]>();

    for (const variant of selectedProduct.variants) {
      if (variant.colorId?.id && !colorMap.has(variant.colorId.id)) {
        colorMap.set(variant.colorId.id, variant.colorId);
      }
    }

    return Array.from(colorMap.values()).filter(Boolean) as NonNullable<
      ApiVariant["colorId"]
    >[];
  }, [selectedProduct?.id, selectedProduct?.variants?.length]);

  const availableSizesForSelectedColor = useMemo(() => {
    if (!selectedProduct?.variants?.length || !selectedApiVariant?.colorId?.id)
      return [];
    const sizeMap = new Map<string, ApiVariant["sizeId"]>();

    for (const variant of selectedProduct.variants) {
      if (
        variant.colorId?.id === selectedApiVariant.colorId.id &&
        variant.sizeId?.id &&
        !sizeMap.has(variant.sizeId.id)
      ) {
        sizeMap.set(variant.sizeId.id, variant.sizeId);
      }
    }

    return Array.from(sizeMap.values()).filter(Boolean) as NonNullable<
      ApiVariant["sizeId"]
    >[];
  }, [selectedProduct?.id, selectedApiVariant?.colorId?.id]);

  const getBrandName = useCallback(
    (brand: ApiProduct["brand"]) =>
      typeof brand === "object" ? brand.name : brand,
    []
  );



  const handleCreateNewCart = () => {
    const newCartId = createNewCart();
    if (!newCartId) {
      toast.warn(
        <CustomToast
          title="Không thể tạo thêm giỏ hàng. Tối đa 5 Hoá đơn chờ!"
          type="warning"
        />,
        { icon: false }
      );
      return;
    }
    toast.success(
      <CustomToast
        title={`Đã tạo giỏ hàng mới: Giỏ hàng ${pendingCarts.length + 1}`}
      />,
      { icon: false }
    );
  };

  const handleSwitchCart = (cartId: string) => {
    setActiveCart(cartId);
    const cart = pendingCarts.find((c) => c.id === cartId);
    if (cart) {
      toast.info(
        <CustomToast title={`Đã chuyển sang ${cart.name}`} type="info" />,
        { icon: false }
      );
    }
  };

  const handleOpenDetailDialog = (product: any) => {
    setSelectedProductForDetail(product);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="h-full">
      {/* Header với breadcrumb navigation */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link to={location.pathname.startsWith('/staff') ? '/staff/pos' : '/admin/statistics'}>
                  Dashboard
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bán hàng tại quầy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Phần quản lý các giỏ hàng đang chờ */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Icon path={mdiInvoiceListOutline} size={0.8} />
              <span>Hoá đơn chờ</span>
              <div className="bg-green-50 px-3 py-1 rounded-full text-sm text-primary">({pendingCarts.length}/5)</div>
            </h3>
            <p className="text-base text-gray-600">
              Lưu trữ tạm thời các đơn hàng đang phục vụ để luân chuyển nhanh chóng (Tối đa 5 hoá đơn chờ cùng lúc)
            </p>
          </div>
          <Button
            onClick={handleCreateNewCart}
            disabled={pendingCarts.length >= 5}
          >
            <Icon path={mdiInvoicePlus} size={0.8} />
            Thêm mới
          </Button>
        </div>

        {/* Danh sách các giỏ hàng đang chờ */}
        {pendingCarts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pendingCarts.slice(0, 5).map((cart, index) => (
              <motion.button
                key={cart.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "relative flex items-center gap-2 p-2 rounded-md border-2 transition-all duration-200 min-w-[140px] group",
                  activeCartId === cart.id
                    ? "border-primary bg-primary/5 text-primary shadow-md"
                    : "border-border bg-white text-maintext hover:border-primary/50 hover:bg-primary/5"
                )}
                onClick={() => handleSwitchCart(cart.id)}
              >
                {/* Hiển thị thông tin giỏ hàng */}
                <div className="flex items-center gap-1 flex-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      cart.items.length > 0 ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  <Icon
                    path={mdiCart}
                    size={0.6}
                    className={cn(
                      activeCartId === cart.id
                        ? "text-primary"
                        : "text-maintext/50"
                    )}
                  />
                  <span className="text-sm font-medium truncate">
                    {cart.name}{" "}
                    <span className="text-sm text-maintext/70 font-semibold">
                      (
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                      )
                    </span>
                  </span>
                </div>
                {/* Nút xóa giỏ hàng */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCart(cart.id);
                    toast.info(
                      <CustomToast title={`Đã xóa ${cart.name}`} type="info" />
                    );
                  }}
                  className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icon path={mdiClose} size={0.8} />
                </button>
              </motion.button>
            ))}

            {pendingCarts.length > 5 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[100px] h-[46px] border-2 border-primary/50 flex items-center justify-center text-sm"
                  >
                    +{pendingCarts.length - 4} khác
                    <Icon path={mdiChevronDown} size={0.8} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {pendingCarts.slice(4).map((cart) => (
                    <DropdownMenuItem
                      key={cart.id}
                      className="flex items-center justify-between"
                      onClick={() => handleSwitchCart(cart.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            cart.items.length > 0
                              ? "bg-green-500"
                              : "bg-gray-300"
                          )}
                        />
                        <span>{cart.name}</span>
                        {cart.items.length > 0 && (
                          <Badge variant="secondary" showIcon={false}>
                            {cart.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Layout chính chia làm 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cột trái - Danh sách sản phẩm */}
        <div className="lg:col-span-2 overflow-hidden flex flex-col">
          {/* Thanh tìm kiếm và lọc */}
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Icon
                  path={mdiMagnify}
                  size={0.8}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext"
                />
                <Input
                  id="product-search"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs
              value={activeCategoryName}
              onValueChange={(value) => {
                setActiveCategoryName(value);
                setSelectedProduct(null);
                setSelectedApiVariant(null);
              }}
              className="w-full"
            >
              <TabsList>
                {dynamicCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.name}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Khu vực hiển thị sản phẩm */}
          <div className="bg-white rounded-xl p-4 flex-1 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 min-h-[400px] pt-2">
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger
                    value="grid"
                    className="flex items-center gap-1 text-maintext/70"
                  >
                    <Icon path={mdiViewGridOutline} size={0.8} />
                    Lưới
                  </TabsTrigger>
                  <TabsTrigger
                    value="table"
                    className="flex items-center gap-1 text-maintext/70"
                  >
                    <Icon path={mdiTableLarge} size={0.8} />
                    Bảng
                  </TabsTrigger>
                </TabsList>

                <div className="text-sm text-maintext">
                  Hiển thị{" "}
                  {apiIsLoading ? (
                    <Skeleton className="h-4 w-5 inline-block" />
                  ) : (
                    processedProducts.length
                  )}{" "}
                  / {dataWithPromotions?.pagination?.total || 0} sản phẩm
                </div>
              </div>

              {apiIsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(pagination.limit)].map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : apiIsError ? (
                <div className="text-center py-10 text-red-500">
                  Lỗi khi tải sản phẩm. Vui lòng thử lại.
                </div>
              ) : processedProducts.length === 0 ? (
                <div className="text-center py-10 text-maintext">
                  Không tìm thấy sản phẩm nào.
                </div>
              ) : (
                <>
                  <TabsContent value="grid" className="mt-0">
                    <ProductGridView
                      processedProducts={processedProducts}
                      handleProductSelect={handleProductSelect}
                      handleOpenDetailDialog={handleOpenDetailDialog}
                      getBrandName={getBrandName}
                      getVariantImageUrl={getVariantImageUrl}
                    />
                  </TabsContent>

                  <TabsContent value="table" className="mt-0">
                    <ProductTableView
                      processedProducts={processedProducts}
                      handleProductSelect={handleProductSelect}
                      handleOpenDetailDialog={handleOpenDetailDialog}
                      addItemToCorrectCart={addItemToCorrectCart}
                      getBrandName={getBrandName}
                      getVariantImageUrl={getVariantImageUrl}
                    />
                  </TabsContent>

                  {dataWithPromotions?.pagination &&
                    dataWithPromotions.pagination.totalPages > 1 && (
                      <CommonPagination
                        className="flex justify-center mt-6"
                        pagination={dataWithPromotions.pagination}
                        onPageChange={(page) =>
                          setPagination((p) => ({ ...p, page }))
                        }
                      />
                    )}
                </>
              )}
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-1">
          <POSRightSection
            cartItems={cartItems}
            subtotal={subtotal}
            total={total}
            discount={discount}
            appliedVoucher={appliedVoucher}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={onApplyCoupon}
            onRemoveCartItem={onRemoveCartItem}
            onUpdateQuantity={onUpdateQuantity}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            selectedUserId={selectedUserId}
            onUserSelect={onUserSelect}
            usersData={usersData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            changeDue={changeDue}
            onCheckout={onCheckout}
            checkoutIsLoading={createPOSOrderMutation.isPending}
            activeCartId={activeCartId}
            pendingCarts={pendingCarts}
          />
        </div>
      </div>

      {/* Dialog hiển thị hoá đơn sau khi thanh toán */}
      {createdOrder && (
        <InvoiceDialog
          isOpen={isInvoiceDialogOpen}
          onClose={() => {
            setIsInvoiceDialogOpen(false);
            setCreatedOrder(null);
          }}
          order={createdOrder}
        />
      )}
      {/* Dialog chi tiết sản phẩm POS */}
      <ProductDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        product={selectedProductForDetail}
        addItemToCorrectCart={addItemToCorrectCart}
      />
    </div>
  );
}
