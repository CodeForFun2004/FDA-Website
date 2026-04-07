// src/features/alerts/mocks/alerts-mock.ts
import type { Alert } from '../types';

export const generateAlerts = (): Alert[] => [
  {
    id: 'al-1',
    title: '⚠️ Mực nước vượt ngưỡng cảnh báo',
    description:
      'Mực nước tại trạm Cầu Rồng đã tăng 0.5m trong 30 phút qua, vượt ngưỡng cảnh báo. Cần theo dõi và chuẩn bị phương án ứng phó.',
    severity: 'High',
    message: 'Water level rising 0.5m',
    zone: 'Me Suot Street',
    stationName: 'Trạm Cầu Rồng',
    stationAddress: '2 Tháng 9, Hải Châu, Đà Nẵng',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'New',
    coordinates: [16.0583, 108.1632],
    isRead: false,
    sensorType: 'Water Level',
    sensorValue: 4.12,
    sensorUnit: 'm',
    thresholdValue: 3.5
  },
  {
    id: 'al-2',
    title: '🌧️ Cảnh báo mưa lớn tại khu vực',
    description:
      'Lượng mưa lớn kéo dài tại khu vực Hòa Vang, có nguy cơ gây ngập cục bộ. Đề nghị người dân chuẩn bị phương án di tản.',
    severity: 'Medium',
    message: 'Localized heavy rain',
    zone: 'Hoa Vang',
    stationName: 'Trạm Hòa Vang',
    stationAddress: 'QL14B, Hòa Vang, Đà Nẵng',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'Acknowledged',
    coordinates: [16.01, 108.15],
    isRead: true,
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    acknowledgedBy: 'Nguyễn Văn A',
    sensorType: 'Rainfall',
    sensorValue: 28.5,
    sensorUnit: 'mm/hr',
    thresholdValue: 20
  },
  {
    id: 'al-3',
    title: '🔴 NGUY HIỂM: Mực nước sắp đạt mức báo động đỏ',
    description:
      'Mực nước tại trạm Cẩm Lệ đang tiếp tục tăng nhanh và sắp chạm ngưỡng báo động đỏ. Cần sơ tán dân cư vùng trũng ngay lập tức.',
    severity: 'Critical',
    message: 'Water level approaching critical threshold',
    zone: 'Cẩm Lệ District',
    stationName: 'Trạm Cẩm Lệ',
    stationAddress: 'Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'New',
    coordinates: [16.0229, 108.2058],
    isRead: false,
    sensorType: 'Water Level',
    sensorValue: 5.95,
    sensorUnit: 'm',
    thresholdValue: 4.5
  },
  {
    id: 'al-4',
    title: '📊 Cập nhật mực nước trạm Sơn Trà',
    description:
      'Mực nước đã giảm xuống mức an toàn sau đợt mưa. Tình hình đã ổn định.',
    severity: 'Low',
    message: 'Water level returned to normal',
    zone: 'Sơn Trà Peninsula',
    stationName: 'Trạm Sơn Trà',
    stationAddress: 'Bãi Bụt, Sơn Trà, Đà Nẵng',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'Resolved',
    coordinates: [16.103, 108.272],
    isRead: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    sensorType: 'Water Level',
    sensorValue: 2.1,
    sensorUnit: 'm',
    thresholdValue: 3.5
  },
  {
    id: 'al-5',
    title: '⚡ Thiết bị mất kết nối tại trạm Liên Chiểu',
    description:
      'Cảm biến mực nước tại trạm Liên Chiểu đã mất tín hiệu. Đội kỹ thuật đang kiểm tra.',
    severity: 'Medium',
    message: 'Sensor disconnected',
    zone: 'Liên Chiểu District',
    stationName: 'Trạm Liên Chiểu',
    stationAddress: 'Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'Acknowledged',
    coordinates: [16.0744, 108.1498],
    isRead: false,
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    acknowledgedBy: 'Trần Văn B',
    sensorType: 'Connection',
    sensorValue: 0,
    sensorUnit: 'status'
  },
  {
    id: 'al-6',
    title: '🌊 Triều cường cao bất thường',
    description:
      'Mực nước biển tại khu vực ven biển Ngũ Hành Sơn đang dâng cao hơn dự báo do ảnh hưởng triều cường kết hợp mưa lớn.',
    severity: 'High',
    message: 'Abnormal high tide detected',
    zone: 'Ngũ Hành Sơn',
    stationName: 'Trạm Ngũ Hành Sơn',
    stationAddress: 'Trường Sa, Ngũ Hành Sơn, Đà Nẵng',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'New',
    coordinates: [16.0017, 108.2543],
    isRead: false,
    sensorType: 'Sea Level',
    sensorValue: 3.8,
    sensorUnit: 'm',
    thresholdValue: 3.0
  }
];
