import { MenuItem } from '@/interface/types';
import {
    mdiRestart,
    mdiDesk,
    mdiOrderBoolDescendingVariant,
} from '@mdi/js';

export const staffMenuItems: MenuItem[] = [
    {
        id: 'pos',
        name: 'Bán hàng tại quầy',
        path: '/staff/pos',
        icon: mdiDesk,
    },
    {
        id: 'orders',
        name: 'Quản lý đơn hàng',
        path: '/staff/orders',
        icon: mdiOrderBoolDescendingVariant,
    },
    {
        id: 'returns',
        name: 'Quản lý đơn trả hàng',
        path: '/staff/returns',
        icon: mdiRestart,
    },
];
