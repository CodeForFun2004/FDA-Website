// src/features/zones/mocks/zones-mock.ts
import type { Zone } from "../types";

// Updated Zones to cover ALL Districts of Da Nang
export const generateZones = (): Zone[] => [
    // 1. Quận Liên Chiểu (High Risk Area usually)
    {
        id: 'z-lienchieu',
        name: 'Q. Liên Chiểu',
        type: 'District',
        riskLevel: 'Flooded',
        deviceCount: 12,
        population: 170000,
        coordinates: [
            [16.140, 108.100], [16.140, 108.150], [16.080, 108.170],
            [16.050, 108.140], [16.080, 108.080]
        ],
        center: [16.090, 108.130],
        details: 'Khu vực trọng điểm ngập lụt, đặc biệt tại Hòa Khánh, Mẹ Suốt.'
    },
    // 2. Quận Thanh Khê
    {
        id: 'z-thanhkhe',
        name: 'Q. Thanh Khê',
        type: 'District',
        riskLevel: 'Watch',
        deviceCount: 10,
        population: 180000,
        coordinates: [
            [16.070, 108.170], [16.075, 108.195], [16.055, 108.200], [16.045, 108.175]
        ],
        center: [16.060, 108.185],
        details: 'Nguy cơ ngập cục bộ tại khu vực Khe Cạn.'
    },
    // 3. Quận Hải Châu (Center)
    {
        id: 'z-haichau',
        name: 'Q. Hải Châu',
        type: 'District',
        riskLevel: 'Safe',
        deviceCount: 15,
        population: 200000,
        coordinates: [
            [16.080, 108.210], [16.085, 108.225], [16.030, 108.220], [16.035, 108.200]
        ],
        center: [16.060, 108.215],
        details: 'Trung tâm hành chính, hạ tầng thoát nước tương đối tốt.'
    },
    // 4. Quận Sơn Trà (Peninsula)
    {
        id: 'z-sontra',
        name: 'Q. Sơn Trà',
        type: 'District',
        riskLevel: 'Safe',
        deviceCount: 8,
        population: 150000,
        coordinates: [
            [16.120, 108.230], [16.120, 108.300], [16.060, 108.260], [16.065, 108.230]
        ],
        center: [16.090, 108.250],
        details: 'Địa hình cao, ít ngập, lưu ý sạt lở bán đảo.'
    },
    // 5. Quận Ngũ Hành Sơn
    {
        id: 'z-nguhanhson',
        name: 'Q. Ngũ Hành Sơn',
        type: 'District',
        riskLevel: 'Watch',
        deviceCount: 6,
        population: 90000,
        coordinates: [
            [16.060, 108.230], [16.060, 108.260], [15.980, 108.280], [15.980, 108.240]
        ],
        center: [16.020, 108.250],
        details: 'Khu vực ven sông Cổ Cò, nguy cơ triều cường.'
    },
    // 6. Quận Cẩm Lệ
    {
        id: 'z-camle',
        name: 'Q. Cẩm Lệ',
        type: 'District',
        riskLevel: 'Watch',
        deviceCount: 9,
        population: 140000,
        coordinates: [
            [16.040, 108.170], [16.035, 108.220], [15.990, 108.210], [16.000, 108.160]
        ],
        center: [16.015, 108.190],
        details: 'Vùng trũng thấp phía Nam thành phố.'
    },
    // 7. Huyện Hòa Vang (Large outer area)
    {
        id: 'z-hoavang',
        name: 'H. Hòa Vang',
        type: 'District',
        riskLevel: 'Flooded',
        deviceCount: 20,
        population: 200000,
        coordinates: [
            [16.150, 108.050], [16.150, 108.100], [16.000, 108.160],
            [15.950, 108.200], [15.950, 108.000]
        ],
        center: [16.050, 108.080],
        details: 'Vùng nông thôn rộng lớn, thường xuyên ngập lụt do lũ thượng nguồn.'
    },
    // Flood Hotspots (Points)
    {
        id: 'z-hotspot-1',
        name: 'Đường Mẹ Suốt',
        type: 'Custom',
        riskLevel: 'Flooded',
        deviceCount: 2,
        population: 5000,
        coordinates: [],
        center: [16.0583, 108.1632], // Near Da Nang University of Education
        details: 'Ngập sâu cục bộ > 1m khi mưa lớn.'
    },
    {
        id: 'z-hotspot-2',
        name: 'Khe Cạn - Thanh Khê',
        type: 'Custom',
        riskLevel: 'Watch',
        deviceCount: 1,
        population: 3000,
        coordinates: [],
        center: [16.0620, 108.1810],
        details: 'Khu vực trũng, thoát nước chậm.'
    },
    {
        id: 'z-hotspot-3',
        name: 'Hòa Khánh Nam',
        type: 'Custom',
        riskLevel: 'Flooded',
        deviceCount: 3,
        population: 8000,
        coordinates: [],
        center: [16.0750, 108.1500],
        details: 'Ngập diện rộng do nước từ núi đổ về.'
    }
];
