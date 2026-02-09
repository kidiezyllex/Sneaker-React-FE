import React from "react";

interface PageSkeletonProps {
  type?: "home" | "product" | "list";
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  type = "home",
}) => {
  if (type === "home") {
    return (
      <div className="animate-pulse">
        {/* Hero Banner Skeleton */}
        <div className="h-96 bg-gray-200 mb-8"></div>

        {/* Brand Logos Skeleton */}
        <div className="container mx-auto mb-12">
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="container mx-auto mb-12">
          <div className="h-8 bg-gray-200 w-64 mx-auto mb-8 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-md overflow-hidden shadow"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "product") {
    return (
      <div className="animate-pulse p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-md"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse p-8">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-md shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
