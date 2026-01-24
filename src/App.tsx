import { RouterProvider } from "react-router-dom";
import { ReactQueryClientProvider } from "@/provider/ReactQueryClientProvider";
import { UserProvider } from "@/context/useUserContext";
import { ToastContainer } from "react-toastify";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { router } from "@/routes";
import { Suspense } from "react";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground animate-pulse font-semibold">
        Đang tải trang...
      </p>
    </div>
  </div>
);

function App() {
  usePerformanceMonitor(import.meta.env.DEV);

  return (
    <ReactQueryClientProvider>
      <Suspense fallback={<PageLoader />}>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
        <RouterProvider router={router} />
      </Suspense>
    </ReactQueryClientProvider>
  );
}

export default App;
