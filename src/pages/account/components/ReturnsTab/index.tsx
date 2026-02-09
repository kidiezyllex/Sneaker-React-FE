import { useState } from "react";
import { Icon } from "@mdi/react";
import { mdiKeyboardReturn, mdiEye } from "@mdi/js";
import { useMyReturns } from "@/hooks/return";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/utils/formatters";
import { IReturn } from "@/interface/response/return";
import { ReturnStatusBadge } from "../components/Badges";
import ReturnDetailDialog from "./ReturnDetailDialog";

const ReturnsTab = () => {
  const { data: returnsData, isLoading, isError, refetch } = useMyReturns();
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [returnDetailOpen, setReturnDetailOpen] = useState(false);

  const handleViewReturnDetails = (returnId: string) => {
    setSelectedReturnId(returnId);
    setReturnDetailOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon
                path={mdiKeyboardReturn}
                size={0.8}
                className="text-primary"
              />
            </div>
            <span>Đơn trả hàng của bạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-10 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-red-500">
                Đã xảy ra lỗi khi tải đơn trả hàng. Vui lòng thử lại sau.
              </p>
            </div>
          ) : !returnsData?.data?.content ||
            returnsData.data.content.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600 mb-4">
                Bạn chưa có đơn trả hàng nào.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] px-3 py-2">
                      Mã trả hàng
                    </TableHead>
                    <TableHead className="px-3 py-2">Ngày tạo</TableHead>
                    <TableHead className="px-3 py-2">Đơn hàng gốc</TableHead>
                    <TableHead className="px-3 py-2">Sản phẩm</TableHead>
                    <TableHead className="text-right px-3 py-2">
                      Số tiền hoàn
                    </TableHead>
                    <TableHead className="px-3 py-2">Trạng thái</TableHead>
                    <TableHead className="text-center px-3 py-2">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsData.data.content.map((returnItem: IReturn) => {
                    return (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium px-3 py-2">
                          {returnItem.code}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          {formatDate(returnItem.createdAt)}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          {returnItem.originalOrder.code}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {(() => {
                              const returnItemsList = typeof returnItem.items === 'string'
                                ? (() => { try { return JSON.parse(returnItem.items); } catch { return []; } })()
                                : returnItem.items;

                              return returnItemsList.slice(0, 3).map((item: any, index: number) => {
                                const orderItem = returnItem.originalOrder.items?.find(
                                  (oi: any) => oi.variant?.id === item.variantId
                                );
                                const variant = orderItem?.variant;
                                const product = variant?.product;
                                const imageUrl = variant?.images?.[0]?.imageUrl;

                                return (
                                  <div key={index} className="relative">
                                    <img
                                      src={imageUrl || "/images/white-image.png"}
                                      alt={product?.name || "Sản phẩm"}
                                      className="w-12 h-12 object-contain rounded border"
                                      title={product?.name || "Sản phẩm"}
                                    />
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                                      {item.quantity}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                            {(() => {
                              const returnItemsList = typeof returnItem.items === 'string'
                                ? (() => { try { return JSON.parse(returnItem.items); } catch { return []; } })()
                                : returnItem.items;
                              return returnItemsList.length > 3 && (
                                <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-sm text-gray-600">
                                  +{returnItemsList.length - 3}
                                </div>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium px-3 py-2">
                          {formatPrice(returnItem.totalRefund)}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <ReturnStatusBadge status={returnItem.status} />
                        </TableCell>
                        <TableCell className="text-center px-3 py-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleViewReturnDetails(returnItem.id.toString())
                            }
                            title="Xem chi tiết"
                          >
                            <Icon path={mdiEye} size={0.8} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {returnsData.data.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4 border-t mt-4">
                  <div className="text-sm text-gray-500 font-medium">
                    Trang <span className="text-primary">{returnsData.data.number + 1}</span> / {returnsData.data.totalPages}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết trả hàng */}
      <ReturnDetailDialog
        returnId={selectedReturnId}
        open={returnDetailOpen}
        onOpenChange={setReturnDetailOpen}
        onCancel={() => refetch()}
      />
    </>
  );
};

export default ReturnsTab;
