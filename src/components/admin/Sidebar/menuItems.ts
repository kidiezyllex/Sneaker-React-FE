import { MenuItem } from '@/interface/types';
import {
  mdiChartBar,
  mdiTagMultiple,
  mdiRestart,
  mdiHanger,
  mdiDesk,
  mdiOrderBoolDescendingVariant,
  mdiAccount,
  mdiShoeSneaker,
  mdiFormatListBulleted,
  mdiTrademark,
  mdiShape,
  mdiLayers,
  mdiPalette,
  mdiMessageDraw,
  mdiTicketPercent,
  mdiBullhorn,
} from '@mdi/js';

export const menuItems: MenuItem[] = [
  {
    id: 'statistics',
    name: 'Thống kê',
    path: '/admin/statistics',
    icon: mdiChartBar,
  },
  {
    id: 'pos',
    name: 'Bán hàng tại quầy',
    path: '/admin/pos',
    icon: mdiDesk,
  },
  {
    id: 'orders',
    name: 'Quản lý đơn hàng',
    path: '/admin/orders',
    icon: mdiOrderBoolDescendingVariant,
  },
  {
    id: 'products',
    name: 'Quản lý sản phẩm',
    path: '/admin/products',
    icon: mdiShoeSneaker,
    subMenu: [
      {
        id: 'products-list',
        name: 'Sản phẩm',
        path: '/admin/products',
        icon: mdiFormatListBulleted,
      },
      {
        id: 'products-brands',
        name: 'Thương hiệu',
        path: '/admin/products/brands',
        icon: mdiTrademark,
      },
      {
        id: 'products-categories',
        name: 'Danh mục',
        path: '/admin/products/categories',
        icon: mdiShape,
      },
      {
        id: 'products-materials',
        name: 'Chất liệu',
        path: '/admin/products/materials',
        icon: mdiLayers,
      },
      {
        id: 'products-colors',
        name: 'Màu sắc',
        path: '/admin/products/colors',
        icon: mdiPalette,
      },
      {
        id: 'products-sizes',
        name: 'Kích thước',
        path: '/admin/products/sizes',
        icon: mdiMessageDraw,
      },
    ],
  },
  {
    id: 'discounts',
    name: 'Giảm giá',
    path: '/admin/discounts',
    icon: mdiTagMultiple,
    subMenu: [
      {
        id: 'discounts-vouchers',
        name: 'Mã giảm giá',
        path: '/admin/discounts/vouchers',
        icon: mdiTicketPercent,
      },
      {
        id: 'discounts-promotions',
        name: 'Đợt khuyến mãi',
        path: '/admin/discounts/promotions',
        icon: mdiBullhorn,
      },
    ],
  },
  {
    id: 'accounts',
    name: 'Quản lý tài khoản',
    path: '/admin/accounts',
    icon: mdiAccount,
  },
  {
    id: 'returns',
    name: 'Trả hàng',
    path: '/admin/returns',
    icon: mdiRestart,
  },
]; 
