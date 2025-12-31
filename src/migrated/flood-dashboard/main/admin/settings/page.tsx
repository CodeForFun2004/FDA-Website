import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui/common';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">System Configuration</h1>

      <Card>
        <CardHeader>
            <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">System Name</label>
                <Input defaultValue="FDA - Flood Monitoring System" />
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Contact Email (for alerts)</label>
                <Input defaultValue="admin@fda.gov" />
            </div>
            <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="demo" className="h-4 w-4" defaultChecked />
                <label htmlFor="demo" className="text-sm">Enable Demo Mode</label>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Threshold Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Water Level Warning (m)</label>
                    <Input type="number" defaultValue="3.5" />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Water Level Critical (m)</label>
                    <Input type="number" defaultValue="5.0" />
                </div>
            </div>
             <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
