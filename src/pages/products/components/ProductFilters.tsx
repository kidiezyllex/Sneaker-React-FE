import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils/formatters";
import { getSizeLabel } from "@/utils/sizeMapping";
import { useProducts } from "@/hooks/product";
import type { IProductFilter } from "@/interface/request/product";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiRefresh } from "@mdi/js";

interface ProductFiltersProps {
  filters: IProductFilter;
  onChange: (filters: Partial<IProductFilter>) => void;
}

export const ProductFilters = ({ filters, onChange }: ProductFiltersProps) => {
  const productsQuery = useProducts({ page: 1, limit: 8, status: "ACTIVE" });
  const products = productsQuery.data?.data || [];
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    filters.brands
      ? Array.isArray(filters.brands)
        ? filters.brands[0]
        : filters.brands
      : undefined
  );

  useEffect(() => {
    if (filters.brands) {
      setSelectedBrand(
        Array.isArray(filters.brands) ? filters.brands[0] : filters.brands
      );
    } else {
      setSelectedBrand(undefined);
    }
  }, [filters.brands]);

  const handleBrandChange = (brandId: string) => {
    if (selectedBrand === brandId) {
      setSelectedBrand(undefined);
      onChange({ brands: undefined });
    } else {
      setSelectedBrand(brandId);
      onChange({ brands: brandId });
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    filters.categories
      ? Array.isArray(filters.categories)
        ? filters.categories[0]
        : filters.categories
      : undefined
  );

  useEffect(() => {
    if (filters.categories) {
      setSelectedCategory(
        Array.isArray(filters.categories)
          ? filters.categories[0]
          : filters.categories
      );
    } else {
      setSelectedCategory(undefined);
    }
  }, [filters.categories]);

  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(undefined);
      onChange({ categories: undefined });
    } else {
      setSelectedCategory(categoryId);
      onChange({ categories: categoryId });
    }
  };

  const handleColorChange = (colorId: string) => {
    onChange({
      color: filters.color === colorId ? undefined : colorId,
    });
  };

  const handleSizeChange = (sizeId: string) => {
    onChange({
      size: filters.size === sizeId ? undefined : sizeId,
    });
  };

  const brands = useMemo(() => {
    if (!products || products.length === 0) return [];

    const uniqueBrands = Array.from(
      new Set(
        products.map((product) => {
          const brand =
            typeof product.brand === "object"
              ? product.brand
              : { id: product.brand, name: product.brand };
          return JSON.stringify(brand);
        })
      )
    ).map((brandStr) => JSON.parse(brandStr));

    return uniqueBrands;
  }, [products]);

  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];

    const uniqueCategories = Array.from(
      new Set(
        products.map((product) => {
          const category =
            typeof product.category === "object"
              ? product.category
              : { id: product.category, name: product.category };
          return JSON.stringify(category);
        })
      )
    ).map((categoryStr) => JSON.parse(categoryStr));

    return uniqueCategories;
  }, [products]);

  const colors = useMemo(() => {
    if (!products || products.length === 0) return [];

    const allColors = products.flatMap((product) =>
      product.variants.map(
        (variant) =>
          variant.color || {
            id: 0,
            name: "Unknown",
            code: "#000000",
          }
      )
    );

    const uniqueColors = Array.from(
      new Set(allColors.map((color) => JSON.stringify(color)))
    ).map((colorStr) => JSON.parse(colorStr));

    return uniqueColors;
  }, [products]);

  const sizes = useMemo(() => {
    if (!products || products.length === 0) return [];

    const allSizes = products.flatMap((product) =>
      product.variants.map((variant) => variant.size || { id: 0, value: 0 })
    );

    const uniqueSizes = Array.from(
      new Set(allSizes.map((size) => JSON.stringify(size)))
    )
      .map((sizeStr) => JSON.parse(sizeStr))
      .sort((a, b) => (a.value || 0) - (b.value || 0));

    return uniqueSizes;
  }, [products]);

  const priceRange = useMemo(() => {
    if (!products || products.length === 0) {
      return { min: 0, max: 5000000 };
    }

    const prices = products.flatMap((product) =>
      product.variants.map((variant) => variant.price || 0)
    );

    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 5000000),
    };
  }, [products]);

  const [selectedPriceRange, setSelectedPriceRange] = useState<
    [number, number]
  >([filters.minPrice || priceRange.min, filters.maxPrice || priceRange.max]);

  const handlePriceChange = (values: number[]) => {
    setSelectedPriceRange(values as [number, number]);

    const timerId = setTimeout(() => {
      onChange({
        minPrice: values[0],
        maxPrice: values[1],
      });
    }, 300);

    return () => clearTimeout(timerId);
  };

  const handleResetFilters = () => {
    setSelectedPriceRange([priceRange.min, priceRange.max]);
    setSelectedCategory(undefined);
    onChange({
      categories: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      color: undefined,
      size: undefined,
    });
    toast.info("Đã đặt lại bộ lọc");
  };

  if (productsQuery.isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 space-y-4 w-52 max-w-52">
        <div className="border-b pb-2">
          <Skeleton className="h-5 w-32" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Colors Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Sizes Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-10 rounded" />
            ))}
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md w-52 max-w-52">
      <div className="flex items-center gap-2 py-2 border-b px-4">
        <h3 className="font-semibold text-sm">Bộ lọc sản phẩm</h3>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">Giá</h3>
          <div>
            <Slider
              defaultValue={[priceRange.min, priceRange.max]}
              min={priceRange.min}
              max={priceRange.max}
              step={100000}
              value={selectedPriceRange}
              onValueChange={(value) =>
                handlePriceChange(value as [number, number])
              }
            />
            <div className="flex justify-between mt-2 text-sm text-maintext">
              <span>{formatPrice(selectedPriceRange[0])}</span>
              <span>{formatPrice(selectedPriceRange[1])}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Thương hiệu</h3>
          <div className="space-y-2 max-h-48 grid grid-cols-2 overflow-y-auto">
            {brands.map((brand) => (
              <div key={(brand as any)?.id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${(brand as any)?.id}`}
                  checked={selectedBrand === String((brand as any)?.id)}
                  onCheckedChange={() =>
                    handleBrandChange(String((brand as any)?.id))
                  }
                />
                <label
                  htmlFor={`brand-${(brand as any)?.id}`}
                  className="text-sm"
                >
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Danh mục</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={(category as any)?.id}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`category-${(category as any)?.id}`}
                  checked={selectedCategory === String((category as any)?.id)}
                  onCheckedChange={() =>
                    handleCategoryChange(String((category as any)?.id))
                  }
                />
                <label
                  htmlFor={`category-${(category as any)?.id}`}
                  className="text-sm"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Màu sắc</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                className={`w-8 h-8 rounded-full border overflow-hidden relative transition-all duration-300 ${filters.color === String(color.id)
                  ? "ring-2 ring-primary ring-offset-2"
                  : "border-gray-300"
                  }`}
                style={{ backgroundColor: color.code }}
                title={color.name}
                onClick={() => handleColorChange(String(color.id))}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Kích cỡ</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                className={`px-2 py-1 border rounded text-sm transition-all duration-300 ${filters.size === String(size.id)
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 hover:border-primary"
                  }`}
                onClick={() => handleSizeChange(String(size.id))}
              >
                {size.value ? getSizeLabel(size.value) : size.name || size.id}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleResetFilters}>
          <Icon path={mdiRefresh} size={0.8} />
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
};
