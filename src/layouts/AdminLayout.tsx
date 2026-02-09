import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarLayout from './SidebarLayout'

const AdminLayout: React.FC = () => {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  )
}

export default AdminLayout 