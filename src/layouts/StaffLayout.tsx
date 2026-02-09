import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarLayout from './SidebarLayout'
import { staffMenuItems } from '@/constants/staffMenuItems'

const StaffLayout: React.FC = () => {
    return (
        <SidebarLayout items={staffMenuItems}>
            <Outlet />
        </SidebarLayout>
    )
}

export default StaffLayout 
