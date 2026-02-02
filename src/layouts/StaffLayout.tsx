import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarLayout from '@/components/admin/Sidebar'
import { staffMenuItems } from '@/components/admin/Sidebar/staffMenuItems'

const StaffLayout: React.FC = () => {
    return (
        <SidebarLayout items={staffMenuItems}>
            <Outlet />
        </SidebarLayout>
    )
}

export default StaffLayout 
