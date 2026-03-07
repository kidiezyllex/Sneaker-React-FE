import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils/formatters";
import { getSizeLabel } from "@/utils/sizeMapping";
import { useProductFilters } from "@/hooks/product";
import type { IProductFilter } from "@/interface/request/product";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiRefresh } from "@mdi/js";

interface ProductFiltersProps {
  filters: IProductFilter;
  onChange: (filters: Partial<IProductFilter>) => void;
}

export const ProductFilters = ({ filters, onChange }: ProductFiltersProps) => {
  // Use the unified filters api
  const { data: filtersData, isLoading, isError } = useProductFilters();

  const filterOptions = filtersData?.data;

  // Local state for Price Slider to ensure smooth sliding
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 5000000,
  ]);

  // Sync price slider with filters when external changes occur (like reset)
  useEffect(() => {
    if (filterOptions?.priceRange) {
      setSelectedPriceRange([
        filters.minPrice || filterOptions.priceRange.min,
        filters.maxPrice || filterOptions.priceRange.max,
      ]);
    }
  }, [filters.minPrice, filters.maxPrice, filterOptions?.priceRange]);

  const handlePriceChange = (values: number[]) => {
    setSelectedPriceRange(values as [number, number]);
  };

  const handlePriceCommit = (values: number[]) => {
    onChange({
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  // Brand Helper
  const selectedBrandId = filters.brands ? (Array.isArray(filters.brands) ? filters.brands[0] : filters.brands) : undefined;
  const handleBrandChange = (brandId: string) => {
    onChange({ brands: selectedBrandId === brandId ? undefined : brandId });
  };

  // Category Helper
  const selectedCategoryId = filters.categories ? (Array.isArray(filters.categories) ? filters.categories[0] : filters.categories) : undefined;
  const handleCategoryChange = (categoryId: string) => {
    onChange({ categories: selectedCategoryId === categoryId ? undefined : categoryId });
  };

  // Material Helper
  const handleMaterialChange = (materialId: string) => {
    onChange({ material: filters.material === materialId ? undefined : materialId });
  };

  const handleResetFilters = () => {
    if (filterOptions?.priceRange) {
      setSelectedPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
    }
    onChange({
      categories: undefined,
      brands: undefined,
      material: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      color: undefined,
      size: undefined,
    });
    toast.info("Đã đặt lại bộ lọc");
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 space-y-6 w-60 max-w-60">
        <div className="border-b pb-2">
          <Skeleton className="h-5 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2 w-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !filterOptions) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 w-60 text-center py-8">
        <p className="text-red-500 text-sm mb-4">Không thể tải bộ lọc</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const { brands, categories, materials, colors, sizes, priceRange } = filterOptions;

  return (
    <div className="bg-white rounded-xl shadow-md w-60 max-w-60 sticky top-4 overflow-hidden">
      <div className="flex items-center gap-2 py-3 border-b px-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-800">Bộ lọc sản phẩm</h3>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
        {/* Price Slider */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-gray-700">Khoảng giá</h3>
          <div className="px-2">
            <Slider
              value={selectedPriceRange}
              min={priceRange.min}
              max={priceRange.max}
              step={100000}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceCommit}
            />
            <div className="flex justify-between mt-3 text-[11px] text-primary font-bold">
              <span>{formatPrice(selectedPriceRange[0])}</span>
              <span>{formatPrice(selectedPriceRange[1])}</span>
            </div>
          </div>
        </section>

        {/* Brands */}
        {brands?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Thương hiệu</h3>
            <div className="pr-1 thin-scrollbar grid grid-cols-2 gap-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center gap-3 group">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrandId === String(brand.id)}
                    onCheckedChange={() => handleBrandChange(String(brand.id))}
                  />
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm text-gray-600 group-hover:text-primary transition-colors cursor-pointer select-none"
                  >
                    {brand.name}
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {categories?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Danh mục</h3>
            <div className="pr-1 thin-scrollbar grid grid-cols-2 gap-2 overflow-hidden">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 group">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={selectedCategoryId === String(cat.id)}
                    onCheckedChange={() => handleCategoryChange(String(cat.id))}
                  />
                  <label
                    htmlFor={`cat-${cat.id}`}
                    className="text-sm text-gray-600 group-hover:text-primary transition-colors cursor-pointer select-none"
                  >
                    {cat.name}
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Materials */}
        {materials?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Chất liệu</h3>
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 thin-scrollbar">
              {materials.map((mat) => (
                <div key={mat.id} className="flex items-center gap-3 group">
                  <Checkbox
                    id={`mat-${mat.id}`}
                    checked={filters.material === String(mat.id)}
                    onCheckedChange={() => handleMaterialChange(String(mat.id))}
                  />
                  <label
                    htmlFor={`mat-${mat.id}`}
                    className="text-sm text-gray-600 group-hover:text-primary transition-colors cursor-pointer select-none"
                  >
                    {mat.name}
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Colors */}
        {colors?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Màu sắc</h3>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color) => (
                <button
                  key={color.id}
                  className={`w-7 h-7 rounded-full border shadow-sm relative transition-all duration-200 ${filters.color === String(color.id)
                    ? "ring-2 ring-primary ring-offset-2 scale-110"
                    : "border-gray-200 hover:border-primary"
                    }`}
                  style={{ backgroundColor: color.code }}
                  title={color.name}
                  onClick={() => onChange({ color: filters.color === String(color.id) ? undefined : String(color.id) })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sizes */}
        {sizes?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Kích cỡ</h3>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  className={`min-w-[40px] h-9 px-2 border rounded text-sm font-bold transition-all duration-200 ${filters.size === String(size.id)
                    ? "bg-primary text-white border-primary shadow-lg -translate-y-0.5"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                    }`}
                  onClick={() => onChange({ size: filters.size === String(size.id) ? undefined : String(size.id) })}
                >
                  {size.value ? getSizeLabel(size.value) : size.id}
                </button>
              ))}
            </div>
          </section>
        )}

        <Button
          variant="outline"
          onClick={handleResetFilters}
        >
          <Icon path={mdiRefresh} size={0.8} />
          Đặt lại toàn bộ
        </Button>
      </div>

      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
};
