// src/features/dashboard/api/geocode.ts

export type GeoLocation = {
    lat: number;
    lng: number;
};

/**
 * Mock Geocoding for Da Nang to allow map demo without Geocoding API key
 */
export const mockGeocode = async (address: string): Promise<GeoLocation | null> => {
    const normalized = address.toLowerCase();

    // Da Nang Landmarks
    if (normalized.includes('cầu rồng') || normalized.includes('cau rong'))
        return { lat: 16.0610, lng: 108.2208 };
    if (normalized.includes('sân bay') || normalized.includes('airport'))
        return { lat: 16.0538, lng: 108.1994 };
    if (normalized.includes('hòa khánh') || normalized.includes('hoa khanh'))
        return { lat: 16.0825, lng: 108.1481 };
    if (normalized.includes('hải châu') || normalized.includes('hai chau'))
        return { lat: 16.0748, lng: 108.2230 };
    if (normalized.includes('ngũ hành sơn') || normalized.includes('marble'))
        return { lat: 16.0076, lng: 108.2562 };
    if (normalized.includes('bách khoa') || normalized.includes('polytechnic'))
        return { lat: 16.0736, lng: 108.1498 };
    if (normalized.includes('tòa hành chính') || normalized.includes('city hall'))
        return { lat: 16.0777, lng: 108.2244 };
    if (normalized.includes('linh ứng') || normalized.includes('linh ung'))
        return { lat: 16.1004, lng: 108.2762 };
    if (normalized.includes('chợ cồn') || normalized.includes('con market'))
        return { lat: 16.0697, lng: 108.2148 };
    if (normalized.includes('mẹ suốt') || normalized.includes('me suot'))
        return { lat: 16.0583, lng: 108.1632 };

    // Specific locations for demo
    if (normalized.includes('fpt') || normalized.includes('software'))
        return { lat: 15.9722, lng: 108.2495 }; // FPT Complex
    if (normalized.includes('co.op') || normalized.includes('coop'))
        return { lat: 16.0605, lng: 108.1895 }; // Co.opmart Dien Bien Phu (Thanh Khe)

    return null; // Return null if not found in mock DB
};
