"use client";

import React from "react";
import { useDashboardStats, useSensorReadings, useAlerts } from "../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  Button,
} from "../../components/ui/common";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Radio,
  AlertTriangle,
  MapPin,
  Plus,
  Droplets,
  ArrowUpRight,
} from "lucide-react";
import { formatDate } from "../../lib/utils";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
          <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
        </span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          {title}
        </p>
      </div>
    </CardContent>
  </Card>
);



export default function DashboardPage() {
  const { totalDevices, offlineDevices, activeAlerts, monitoredZones } =
    useDashboardStats();
  const { data: sensorData, isLoading: isLoadingSensors } = useSensorReadings();
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();

  if (isLoadingSensors || isLoadingAlerts) return <LoadingState />;

  const WaterTooltip = ({ active, label, payload }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-background px-4 py-3 shadow-md">
      <div className="text-sm font-medium text-foreground">
        {formatDate(label)}
      </div>
      <div className="text-sm text-primary">
        value : {payload[0].value}
      </div>
    </div>
  );
};


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          {/* <div className="w-40 h-12 bg-primary text-primary-foreground flex items-center justify-center">
            TEST
          </div> */}

          <p className="text-muted-foreground mt-1">
            Real-time flood monitoring summary
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Create Alert
          </Button>
          <Button className="rounded-full shadow-lg shadow-blue-500/20">
            <Plus className="mr-2 h-4 w-4" /> Add Device
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Devices"
          value={totalDevices}
          icon={Radio}
          colorClass="text-blue-600"
          bgClass="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Offline Devices"
          value={offlineDevices}
          icon={Activity}
          colorClass="text-red-600"
          bgClass="bg-red-100 dark:bg-red-900/30"
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts}
          icon={AlertTriangle}
          colorClass="text-orange-600"
          bgClass="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          title="Monitored Zones"
          value={monitoredZones}
          icon={MapPin}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100 dark:bg-emerald-900/30"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-none bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader>
            <CardTitle>Water Level Forecast</CardTitle>
            <p className="text-sm text-muted-foreground">
              River Sensor A1 - Last 24 Hours
            </p>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/50"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => new Date(t).getHours() + "h"}
                    className="text-xs text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  {/* <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelFormatter={(t) => formatDate(t)}
                  /> */}
                  <Tooltip content={<WaterTooltip />} />
F
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {alerts?.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div
                    className={`mt-1 p-2 rounded-full ${
                      alert.severity === "High"
                        ? "bg-red-100 text-red-600"
                        : alert.severity === "Medium"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.zone}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Droplets className="h-5 w-5" />
              </div>
              <h4 className="font-semibold">Rainfall Intensity</h4>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">12</p>
              <p className="text-lg opacity-80 mb-1">mm/hr</p>
            </div>
            <p className="text-sm mt-2 opacity-90 bg-white/20 inline-block px-2 py-1 rounded-md">
              Moderate Rain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-foreground">Avg Water Level</h4>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-foreground">2.4</p>
              <p className="text-lg text-muted-foreground mb-1">meters</p>
            </div>
            <p className="text-sm mt-2 text-emerald-600 font-medium">
              Safe (Below 4.0m)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-foreground">Safe Routes</h4>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-foreground">15</p>
              <p className="text-lg text-muted-foreground mb-1">Active</p>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              2 Blocked Routes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
