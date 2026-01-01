import React, { useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RouterOptimizerProps {
  children: React.ReactNode;
  preloadRoutes?: string[];
  enablePrefetch?: boolean;
}

const routeCache = new Map<string, Promise<any>>();
const preloadedRoutes = new Set<string>();

const routeImports: Record<string, () => Promise<any>> = {
  "/": () => import("@/pages/HomePage"),
  "/about-us": () => import("@/pages/AboutUsPage"),
  "/products": () => import("@/pages/ProductsPage"),
  "/profile": () => import("@/pages/ProfilePage"),
  "/orders": () => import("@/pages/OrdersPage"),
  "/returns": () => import("@/pages/ReturnsPage"),
  "/checkout/shipping": () => import("@/pages/CheckoutShippingPage"),
  "/checkout/success": () => import("@/pages/CheckoutSuccessPage"),
  "/auth/login": () => import("@/pages/auth/LoginPage"),
  "/auth/register": () => import("@/pages/auth/RegisterPage"),
  "/admin": () => import("@/pages/admin/AdminDashboardPage"),
  "/admin/products": () => import("@/pages/admin/AdminProductsPage"),
  "/admin/orders": () => import("@/pages/admin/AdminOrdersPage"),
  "/admin/statistics": () => import("@/pages/admin/AdminStatisticsPage"),
};

const preloadRoute = async (routePath: string): Promise<void> => {
  if (preloadedRoutes.has(routePath)) {
    return;
  }

  const importFn = routeImports[routePath];
  if (!importFn) {
    return;
  }

  try {
    if (!routeCache.has(routePath)) {
      const importPromise = importFn();
      routeCache.set(routePath, importPromise);
    }

    await routeCache.get(routePath);
    preloadedRoutes.add(routePath);
  } catch (error) {
    console.warn(error);
  }
};

const preloadRoutes = async (
  routes: string[],
  priority: "high" | "medium" | "low" = "medium"
): Promise<void> => {
  const delay = priority === "high" ? 0 : priority === "medium" ? 100 : 500;

  for (const route of routes) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    preloadRoute(route);
  }
};

const useIntelligentPreloading = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    const getRelatedRoutes = (path: string): string[] => {
      if (path === "/") {
        return ["/products", "/about-us", "/auth/login"];
      }
      if (path === "/products") {
        return ["/auth/login", "/checkout/shipping"];
      }
      if (path === "/auth/login") {
        return ["/auth/register", "/profile"];
      }
      if (path.startsWith("/admin")) {
        return ["/admin/products", "/admin/orders", "/admin/statistics"];
      }
      return [];
    };

    const relatedRoutes = getRelatedRoutes(currentPath);
    if (relatedRoutes.length > 0) {
      setTimeout(() => {
        preloadRoutes(relatedRoutes, "low");
      }, 1000);
    }
  }, [location.pathname]);
};

const useLinkPreloading = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute("href");

            if (href && routeImports[href]) {
              preloadRoute(href);
            }
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => observer.observe(link));

    return () => observer.disconnect();
  }, []);
};

export const RouterOptimizer: React.FC<RouterOptimizerProps> = ({
  children,
  preloadRoutes: initialPreloadRoutes = [],
  enablePrefetch = true,
}) => {
  useEffect(() => {
    if (initialPreloadRoutes.length > 0) {
      preloadRoutes(initialPreloadRoutes, "high");
    }
  }, []);

  useIntelligentPreloading();

  if (enablePrefetch) {
    useLinkPreloading();
  }

  return <>{children}</>;
};

export const useRoutePreloader = () => {
  const preload = useCallback((routes: string | string[]) => {
    const routesToPreload = Array.isArray(routes) ? routes : [routes];
    preloadRoutes(routesToPreload, "medium");
  }, []);

  const isPreloaded = useCallback((route: string) => {
    return preloadedRoutes.has(route);
  }, []);

  return { preload, isPreloaded };
};

export const withRouteOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  relatedRoutes: string[] = []
) => {
  return React.memo((props: P) => {
    const { preload } = useRoutePreloader();

    useEffect(() => {
      if (relatedRoutes.length > 0) {
        setTimeout(() => preload(relatedRoutes), 500);
      }
    }, [preload]);

    return <Component {...props} />;
  });
};

export const OptimizedLink: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
  preload?: boolean;
  onMouseEnter?: () => void;
}> = ({ to, children, className, preload = true, onMouseEnter, ...props }) => {
  const navigate = useNavigate();

  const handleMouseEnter = useCallback(() => {
    if (preload) {
      preloadRoute(to);
    }
    onMouseEnter?.();
  }, [to, preload, onMouseEnter]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(to);
    },
    [navigate, to]
  );

  return (
    <a
      href={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};

export const getRouteMetrics = () => {
  return {
    preloadedRoutes: Array.from(preloadedRoutes),
    cacheSize: routeCache.size,
    clearCache: () => {
      routeCache.clear();
      preloadedRoutes.clear();
    },
  };
};

export default RouterOptimizer;
