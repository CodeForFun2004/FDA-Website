// src/features/logs/mocks/logs-mock.ts
import type { SystemLog } from "../types";

export const generateLogs = (): SystemLog[] => [
    {
        id: 'log-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        level: 'CRITICAL',
        source: 'Alert',
        action: 'Threshold Exceeded',
        details: 'Water level at Me Suot reached 3.8m (Limit: 3.5m)',
        userOrDeviceId: 'dev-001'
    },
    {
        id: 'log-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'INFO',
        source: 'User',
        action: 'User Login',
        details: 'Admin user logged in via Web',
        userOrDeviceId: 'alice@fda.gov'
    },
    {
        id: 'log-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        level: 'WARNING',
        source: 'Sensor',
        action: 'Low Battery',
        details: 'Device battery dropped below 20%',
        userOrDeviceId: 'dev-004'
    },
    {
        id: 'log-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        level: 'ERROR',
        source: 'Sensor',
        action: 'Heartbeat Missed',
        details: 'Device failed to send heartbeat for 3 cycles',
        userOrDeviceId: 'dev-003'
    },
    {
        id: 'log-5',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        level: 'INFO',
        source: 'System',
        action: 'Daily Backup',
        details: 'Database backup completed successfully',
        userOrDeviceId: 'System'
    },
    {
        id: 'log-6',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        level: 'INFO',
        source: 'User',
        action: 'Config Update',
        details: 'Updated alert threshold for Zone Lien Chieu',
        userOrDeviceId: 'alice@fda.gov'
    },
    {
        id: 'log-7',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        level: 'INFO',
        source: 'Sensor',
        action: 'Calibration',
        details: 'Manual calibration performed. Offset: +0.1m',
        userOrDeviceId: 'dev-001'
    },
];
