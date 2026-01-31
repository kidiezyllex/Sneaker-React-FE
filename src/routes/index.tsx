import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { LazyComponentLoader } from "@/components/Common/LazyComponentLoader";
import { UserProvider } from "@/context/useUserContext";

// Layouts
import RootLayout from "@/layouts/RootLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Loading Component
const PageLoader = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-600 animate-pulse font-semibold">
                Đang tải trang...
            </p>
        </div>
    </div>
);

// Root wrapper with UserProvider
const RootWrapper = () => (
    <UserProvider>
        <Outlet />
    </UserProvider>
);

const load = (Component: React.LazyExoticComponent<any>) => (
    <LazyComponentLoader fallback={<PageLoader />}>
        <Component />
    </LazyComponentLoader>
);

// Lazy Pages
// Client
const HomePage = React.lazy(() => import("@/pages/home"));
const AboutUsPage = React.lazy(() => import("@/pages/about-us"));
const AccountPage = React.lazy(() => import("@/pages/account"));
const ProductsPage = React.lazy(() => import("@/pages/products"));
const ProductDetailPage = React.lazy(() => import("@/pages/products/detail"));
const ProfilePage = React.lazy(() => import("@/pages/profile"));
const OrdersPage = React.lazy(() => import("@/pages/orders"));
const OrderDetailPage = React.lazy(() => import("@/pages/orders/detail"));
const ReturnsPage = React.lazy(() => import("@/pages/returns"));
const CheckoutShippingPage = React.lazy(() => import("@/pages/checkout"));
const CheckoutSuccessPage = React.lazy(() => import("@/pages/checkout/success"));
const PaymentResultPage = React.lazy(() => import("@/pages/payment/PaymentResultPage"));

// Auth
const LoginPage = React.lazy(() => import("@/pages/auth/login"));
const RegisterPage = React.lazy(() => import("@/pages/auth/register"));

// Admin
const AdminStatisticsPage = React.lazy(() => import("@/pages/admin/statistics"));
const AdminAccountsPage = React.lazy(() => import("@/pages/admin/accounts"));
const AdminAccountCreatePage = React.lazy(() => import("@/pages/admin/accounts/create"));
const AdminAccountEditPage = React.lazy(() => import("@/pages/admin/accounts/edit"));

const AdminDiscountsPage = React.lazy(() => import("@/pages/admin/discounts"));
const AdminPromotionsPage = React.lazy(() => import("@/pages/admin/discounts/promotions"));
const AdminPromotionCreatePage = React.lazy(() => import("@/pages/admin/discounts/promotions/create"));
const AdminPromotionEditPage = React.lazy(() => import("@/pages/admin/discounts/promotions/edit"));
const AdminVouchersPage = React.lazy(() => import("@/pages/admin/discounts/vouchers"));
const AdminVoucherCreatePage = React.lazy(() => import("@/pages/admin/discounts/vouchers/create"));
const AdminVoucherEditPage = React.lazy(() => import("@/pages/admin/discounts/vouchers/edit"));

const AdminOrdersPage = React.lazy(() => import("@/pages/admin/orders"));
const AdminOrderDetailPage = React.lazy(() => import("@/pages/admin/orders/detail"));
const AdminOrderCreatePage = React.lazy(() => import("@/pages/admin/orders/create"));

const AdminPosPage = React.lazy(() => import("@/pages/admin/pos"));

const AdminProductsPage = React.lazy(() => import("@/pages/admin/products"));
const AdminProductBrandsPage = React.lazy(() => import("@/pages/admin/products/brands"));
const AdminProductCategoriesPage = React.lazy(() => import("@/pages/admin/products/categories"));
const AdminProductColorsPage = React.lazy(() => import("@/pages/admin/products/colors"));
const AdminProductCreatePage = React.lazy(() => import("@/pages/admin/products/create"));
const AdminProductEditPage = React.lazy(() => import("@/pages/admin/products/edit"));
const AdminProductMaterialsPage = React.lazy(() => import("@/pages/admin/products/materials"));
const AdminProductSizesPage = React.lazy(() => import("@/pages/admin/products/sizes"));

const AdminReturnsPage = React.lazy(() => import("@/pages/admin/returns"));
const AdminReturnCreatePage = React.lazy(() => import("@/pages/admin/returns/create"));
const AdminReturnEditPage = React.lazy(() => import("@/pages/admin/returns/edit"));

const NotFoundPage = React.lazy(() => import("@/pages/error"));

export const router = createBrowserRouter([
    {
        element: <RootWrapper />,
        children: [
            {
                path: "/",
                element: <RootLayout />,
                children: [
                    { index: true, element: load(HomePage) },
                    { path: "about-us", element: load(AboutUsPage) },
                    { path: "account", element: load(AccountPage) },
                    { path: "products", element: load(ProductsPage) },
                    { path: "products/:slug", element: load(ProductDetailPage) },
                    { path: "profile", element: load(ProfilePage) },
                    { path: "orders", element: load(OrdersPage) },
                    { path: "orders/:id", element: load(OrderDetailPage) },
                    { path: "returns", element: load(ReturnsPage) },
                    { path: "checkout/shipping", element: load(CheckoutShippingPage) },
                    { path: "checkout/success", element: load(CheckoutSuccessPage) },
                    { path: "payment-result", element: load(PaymentResultPage) },
                ],
            },
            {
                path: "auth",
                children: [
                    { path: "login", element: load(LoginPage) },
                    { path: "register", element: load(RegisterPage) },
                ],
            },
            {
                path: "admin",
                element: <AdminLayout />,
                children: [
                    { index: true, element: <Navigate to="/admin/statistics" replace /> },
                    { path: "statistics", element: load(AdminStatisticsPage) },

                    { path: "accounts", element: load(AdminAccountsPage) },
                    { path: "accounts/create", element: load(AdminAccountCreatePage) },
                    { path: "accounts/edit/:id", element: load(AdminAccountEditPage) },

                    { path: "discounts", element: load(AdminDiscountsPage) },
                    { path: "discounts/promotions", element: load(AdminPromotionsPage) },
                    { path: "discounts/promotions/create", element: load(AdminPromotionCreatePage) },
                    { path: "discounts/promotions/edit/:id", element: load(AdminPromotionEditPage) },
                    { path: "discounts/vouchers", element: load(AdminVouchersPage) },
                    { path: "discounts/vouchers/create", element: load(AdminVoucherCreatePage) },
                    { path: "discounts/vouchers/edit/:id", element: load(AdminVoucherEditPage) },

                    { path: "orders", element: load(AdminOrdersPage) },
                    { path: "orders/:orderId", element: load(AdminOrderDetailPage) },
                    { path: "orders/create", element: load(AdminOrderCreatePage) },

                    { path: "pos", element: load(AdminPosPage) },

                    { path: "products", element: load(AdminProductsPage) },
                    { path: "products/brands", element: load(AdminProductBrandsPage) },
                    { path: "products/categories", element: load(AdminProductCategoriesPage) },
                    { path: "products/colors", element: load(AdminProductColorsPage) },
                    { path: "products/create", element: load(AdminProductCreatePage) },
                    { path: "products/edit/:id", element: load(AdminProductEditPage) },
                    { path: "products/materials", element: load(AdminProductMaterialsPage) },
                    { path: "products/sizes", element: load(AdminProductSizesPage) },

                    { path: "returns", element: load(AdminReturnsPage) },
                    { path: "returns/create", element: load(AdminReturnCreatePage) },
                    { path: "returns/edit/:id", element: load(AdminReturnEditPage) },
                ],
            },
            { path: "*", element: load(NotFoundPage) },
        ],
    },
]);
