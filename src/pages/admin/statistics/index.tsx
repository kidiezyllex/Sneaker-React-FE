"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import {
  mdiCashMultiple,
  mdiPackageVariantClosed,
  mdiAccountGroup,
  mdiTrendingUp, mdiEye
} from "@mdi/js";
import "react-toastify/dist/ReactToastify.css";
import {
  useStatistics,
  useRevenueReport,
  useTopProducts,
  useStatisticsDetail,
} from "@/hooks/statistics";
import { formatDate, formatCurrency } from "@/utils/formatters";
import {
  IRevenueReportFilter,
  ITopProductsFilter,
} from "@/interface/request/statistics";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import StatCard from "./components/StatCard";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function StatisticsPage() {
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    isError: statisticsError,
  } = useStatistics({});

  const [revenueFilters, setRevenueFilters] = useState<IRevenueReportFilter>({
    type: "MONTHLY",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [topProductsFilters, setTopProductsFilters] =
    useState<ITopProductsFilter>({
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 2,
        1
      )
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      limit: 10,
    });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatisticsId, setSelectedStatisticsId] = useState<
    string | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    data: revenueData,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useRevenueReport(revenueFilters);
  const {
    data: topProductsData,
    isLoading: topProductsLoading,
    isError: topProductsError,
  } = useTopProducts(topProductsFilters);
  const { data: statisticsDetailData, isLoading: isDetailLoading } =
    useStatisticsDetail(selectedStatisticsId || "");

  const handleRevenueFilterChange = (
    key: keyof IRevenueReportFilter,
    value: any
  ) => {
    setRevenueFilters({ ...revenueFilters, [key]: value });
  };

  const handleTopProductsFilterChange = (
    key: keyof ITopProductsFilter,
    value: any
  ) => {
    setTopProductsFilters({ ...topProductsFilters, [key]: value });
  };

  const handleViewDetail = (statisticsId: string) => {
    setSelectedStatisticsId(statisticsId);
    setIsDetailModalOpen(true);
  };


  const currentMonthData = statisticsData?.data || {
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    newCustomers: 0,
    averageOrderValue: 0,
  };

  const totalRevenueValue =
    revenueData?.data?.reduce((sum, item) => sum + item.totalRevenue, 0) ||
    currentMonthData.totalRevenue ||
    0;

  const currentRevenueHistory = revenueData?.data || [];

  const topProducts = topProductsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/admin/statistics">
                Dashboard
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thống kê</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 rounded-xl p-4 pt-2 bg-white"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-6xl">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="statistics">Lịch sử</TabsTrigger>
        </TabsList>

        {/* Tổng quan */}
        <TabsContent value="overview" className="space-y-4">
          {statisticsLoading || revenueLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statisticsError || revenueError ? (
            <Card className="p-4">
              <p className="text-red-600">Lỗi khi tải dữ liệu thống kê</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard
                title="Tổng doanh thu"
                value={formatCurrency(totalRevenueValue)}
                icon={mdiCashMultiple}
                iconColor="text-primary"
                bgColor="bg-green-100"
              />
              <StatCard
                title="Số đơn hàng"
                value={currentMonthData?.totalOrders?.toString() || "0"}
                icon={mdiPackageVariantClosed}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatCard
                title="Lợi nhuận"
                value={formatCurrency(currentMonthData?.totalProfit || 0)}
                icon={mdiTrendingUp}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
              />
              <StatCard
                title="Khách hàng mới"
                value={currentMonthData?.newCustomers?.toString() || "0"}
                icon={mdiAccountGroup}
                iconColor="text-amber-600"
                bgColor="bg-amber-100"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Doanh thu theo thời gian</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={currentRevenueHistory.map((item) => ({
                        period: item.period,
                        revenue: item.totalRevenue,
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProducts
                          .slice(0, 5)
                          .map((item) => ({
                            name: item.productName
                              ? item.productName.length > 20
                                ? `${item.productName.substring(0, 20)}...`
                                : item.productName
                              : "N/A",
                            fullName: item.productName || "N/A",
                            quantity: item.totalSold,
                            revenue: item.totalRevenue,
                          }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        dataKey="quantity"
                        label={({
                          name,
                          percent,
                        }: {
                          name: string;
                          percent: number;
                        }) =>
                          percent > 0.05
                            ? `${name}: ${(percent * 100).toFixed(1)}%`
                            : ""
                        }
                        labelLine={false}
                      >
                        {topProducts.slice(0, 5).map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(
                          value: number,
                          name: string,
                          props: any
                        ) => [
                            `${value} sản phẩm`,
                            props.payload.fullName || name,
                          ]}
                        labelFormatter={() => "Sản phẩm bán chạy"}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string, entry: any) =>
                          entry.payload?.fullName?.length > 25
                            ? `${entry.payload.fullName.substring(0, 25)}...`
                            : entry.payload?.fullName || value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Doanh thu */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Báo cáo doanh thu</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="revType">Loại thống kê</Label>
                  <Select
                    value={revenueFilters.type || "MONTHLY"}
                    onValueChange={(value) =>
                      handleRevenueFilterChange("type", value)
                    }
                  >
                    <SelectTrigger id="revType">
                      <SelectValue placeholder="Chọn loại thống kê" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Theo ngày</SelectItem>
                      <SelectItem value="WEEKLY">Theo tuần</SelectItem>
                      <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                      <SelectItem value="YEARLY">Theo năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Từ ngày</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={revenueFilters.startDate}
                    onChange={(e) =>
                      handleRevenueFilterChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Đến ngày</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={revenueFilters.endDate}
                    onChange={(e) =>
                      handleRevenueFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-maintext">
                      Tổng doanh thu
                    </h3>
                    <p className="text-2xl font-semibold text-green-500 mt-2">
                      {formatCurrency(totalRevenueValue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-maintext">
                      Số đơn hàng
                    </h3>
                    <p className="text-2xl font-semibold mt-2 text-blue-500">
                      {currentRevenueHistory.reduce(
                        (sum: number, item) => sum + (item.totalOrders || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentRevenueHistory.map((item) => ({
                      period: item.period,
                      revenue: item.totalRevenue,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Chi tiết doanh thu
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRevenueHistory.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.totalRevenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sản phẩm bán chạy */}
        <TabsContent value="products" className="space-y-4 text-maintext">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Sản phẩm bán chạy</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="prodStartDate">Từ ngày</Label>
                  <Input
                    id="prodStartDate"
                    type="date"
                    value={topProductsFilters.startDate}
                    onChange={(e) =>
                      handleTopProductsFilterChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prodEndDate">Đến ngày</Label>
                  <Input
                    id="prodEndDate"
                    type="date"
                    value={topProductsFilters.endDate}
                    onChange={(e) =>
                      handleTopProductsFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prodLimit">Số lượng hiển thị</Label>
                  <Select
                    value={topProductsFilters.limit?.toString() || "10"}
                    onValueChange={(value) =>
                      handleTopProductsFilterChange("limit", parseInt(value))
                    }
                  >
                    <SelectTrigger id="prodLimit">
                      <SelectValue placeholder="Số lượng hiển thị" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 sản phẩm</SelectItem>
                      <SelectItem value="10">10 sản phẩm</SelectItem>
                      <SelectItem value="20">20 sản phẩm</SelectItem>
                      <SelectItem value="50">50 sản phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="w-full h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts
                        .slice(0, topProductsFilters.limit || 10)
                        .map((item) => ({
                          name: item.productName
                            ? item.productName.length > 20
                              ? `${item.productName.substring(0, 20)}...`
                              : item.productName
                            : "N/A",
                          fullName: item.productName || "N/A",
                          quantity: item.totalSold,
                          revenue: item.totalRevenue,
                        }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      dataKey="quantity"
                      label={({
                        name,
                        percent,
                      }: {
                        name: string;
                        percent: number;
                      }) =>
                        percent > 0.05
                          ? `${name}: ${(percent * 100).toFixed(1)}%`
                          : ""
                      }
                      labelLine={false}
                    >
                      {topProducts
                        .slice(0, topProductsFilters.limit || 10)
                        .map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value} sản phẩm`,
                        props.payload.fullName || name,
                      ]}
                      labelFormatter={() => "Sản phẩm bán chạy"}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string, entry: any) =>
                        entry.payload?.fullName?.length > 25
                          ? `${entry.payload.fullName.substring(0, 25)}...`
                          : entry.payload?.fullName || value
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">
                    Tổng số lượng bán
                  </h4>
                  <p className="text-2xl font-semibold text-blue-600">
                    {topProducts.reduce(
                      (sum: number, item: any) => sum + item.totalSold,
                      0
                    )}{" "}
                    sản phẩm
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-md">
                  <h4 className="text-lg font-semibold text-green-700 mb-2">
                    Tổng doanh thu
                  </h4>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatCurrency(
                      topProducts.reduce(
                        (sum: number, item) => sum + item.totalRevenue,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Thương hiệu</TableHead>
                      <TableHead className="text-right">Số lượng bán</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-maintext">
                          {item.productName || "N/A"}
                        </TableCell>
                        <TableCell className="text-maintext">
                          {item.productCode}
                        </TableCell>
                        <TableCell className="text-right text-maintext">
                          {item.totalSold}
                        </TableCell>
                        <TableCell className="text-right text-maintext">
                          {formatCurrency(item.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Lịch sử thống kê */}
        <TabsContent value="statistics" className="space-y-4 text-maintext">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Lịch sử thống kê</CardTitle>
            </CardHeader>
            <CardContent className="p-4">


              {statisticsLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : statisticsError ? (
                <p className="text-red-600">Lỗi khi tải dữ liệu thống kê</p>
              ) : !statisticsData?.data ? (
                <div className="flex items-center justify-center h-80 text-maintext">
                  <p>Không có dữ liệu thống kê</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày thống kê</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead className="text-right">
                            Số đơn hàng
                          </TableHead>
                          <TableHead className="text-right">
                            Doanh thu
                          </TableHead>
                          <TableHead className="text-right">
                            Lợi nhuận
                          </TableHead>
                          <TableHead className="text-center">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statisticsData?.data &&
                          (Array.isArray(statisticsData.data)
                            ? statisticsData.data
                            : [statisticsData.data]
                          ).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium text-maintext">
                                {formatDate(item.date)}
                              </TableCell>
                              <TableCell className="text-maintext">
                                <Badge variant="outline">
                                  {item.type === "DAILY"
                                    ? "Ngày"
                                    : item.type === "WEEKLY"
                                      ? "Tuần"
                                      : item.type === "MONTHLY"
                                        ? "Tháng"
                                        : "Năm"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-maintext">
                                {item.totalOrders}
                              </TableCell>
                              <TableCell className="text-right text-maintext">
                                {formatCurrency(item.totalRevenue)}
                              </TableCell>
                              <TableCell className="text-right text-maintext">
                                {formatCurrency(item.totalProfit)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleViewDetail(item.id || item.date)
                                  }
                                >
                                  <Icon
                                    path={mdiEye}
                                    size={0.8}
                                    className="mr-1"
                                  />
                                  Chi tiết
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent size="4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thống kê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isDetailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : statisticsDetailData?.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-700">
                      Tổng đơn hàng
                    </h4>
                    <p className="text-xl font-semibold text-blue-600">
                      {statisticsDetailData.data.totalOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-md">
                    <h4 className="text-sm font-medium text-green-700">
                      Doanh thu
                    </h4>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(statisticsDetailData.data.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-md">
                    <h4 className="text-sm font-medium text-purple-700">
                      Lợi nhuận
                    </h4>
                    <p className="text-xl font-semibold text-purple-600">
                      {formatCurrency(statisticsDetailData.data.totalProfit)}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-700">
                      Khách hàng mới
                    </h4>
                    <p className="text-xl font-semibold text-yellow-600">
                      {statisticsDetailData.data.customerCount?.new || 0}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h4 className="text-lg font-semibold mb-2">
                      Thông tin thống kê
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Loại:</span>
                        <Badge variant="outline">
                          {statisticsDetailData.data.type === "DAILY"
                            ? "Ngày"
                            : statisticsDetailData.data.type === "WEEKLY"
                              ? "Tuần"
                              : statisticsDetailData.data.type === "MONTHLY"
                                ? "Tháng"
                                : "Năm"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngày thống kê:</span>
                        <span>
                          {formatDate(statisticsDetailData.data.date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tổng khách hàng:</span>
                        <span>
                          {statisticsDetailData.data.customerCount?.total || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h4 className="text-lg font-semibold mb-2">
                      Thông tin bổ sung
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Được tạo:</span>
                        <span>
                          {formatDate(statisticsDetailData.data.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cập nhật cuối:</span>
                        <span>
                          {formatDate(statisticsDetailData.data.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-maintext">
                <p>Không thể tải chi tiết thống kê</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
