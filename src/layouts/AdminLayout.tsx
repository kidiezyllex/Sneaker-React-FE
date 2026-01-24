import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarLayout from '@/components/admin/Sidebar'

const AdminLayout: React.FC = () => {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  )
}

export default AdminLayout 