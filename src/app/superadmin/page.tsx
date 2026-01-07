'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/common';
import { Shield, Users, Settings, Database } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Super Admin Dashboard
        </h1>
        <p className='text-muted-foreground mt-1'>
          Full system control and management
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Users</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,234</div>
            <p className='text-muted-foreground text-xs'>
              +20% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Health</CardTitle>
            <Shield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>99.9%</div>
            <p className='text-muted-foreground text-xs'>Uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Database Size</CardTitle>
            <Database className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>45.2 GB</div>
            <p className='text-muted-foreground text-xs'>+2.1 GB this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Configurations
            </CardTitle>
            <Settings className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>156</div>
            <p className='text-muted-foreground text-xs'>Active configs</p>
          </CardContent>
        </Card>
      </div>

      <Card className='border-amber-200 bg-amber-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-amber-900'>
            <Shield className='h-5 w-5' />
            Super Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-amber-800'>
            You have full system access. Use these privileges responsibly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
