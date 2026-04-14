# FE-16: View Flood History & Trends – Backend Code Review

## Related Backend Features
- **FeatG44** – GetFloodHistory
- **FeatG45** – GetFloodTrends
- **FeatG46** – GetFloodStatistics

---

## Overall Score

| Category | Score | Notes |
|----------|-------|-------|
| Code Quality | 9/10 | Well-designed, aggregation functions tot |
| Security | 7/10 | Any user query any station |
| Performance | 5/10 | Raw readings khong pagination (52k+ records) |
| Completeness | 7/10 | Core OK, thieu multi-station, anomaly detection |

---

## 1. Key Findings
- Well-designed domain model voi separate handlers cho different granularities
- Aggregation functions cho weekly/monthly grouping tot
- Separation giua raw, hourly, va daily data ro rang

### Issues
- **CRITICAL**: GetFloodHistoryHandler fetch raw readings KHONG pagination - 6 thang data = 52,000+ records in memory
- Khong co query caching cho expensive analytical queries
- Any authenticated user co the query bat ky station nao
- DateTime conversions UTC ↔ DateOnly co the gay timezone bugs

---

## 2. Improvement Suggestions

### 2.1 Add pagination cho raw data
```csharp
var readings = await _sensorReadingRepository
    .GetByStationAndTimeRangeAsync(stationId, startDate, endDate,
        limit: 1000, offset: request.Page * 1000, ct);
```

### 2.2 Implement query caching
```csharp
var cacheKey = $"flood:history:{stationId}:{granularity}:{startDate:yyyyMMdd}";
var cached = await _cache.GetAsync<FloodHistoryDto>(cacheKey, ct);
if (cached != null) return cached;
// ... query ...
await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(30), ct);
```

### 2.3 Add area-based access control
```csharp
// Verify user has area containing this station:
var hasAccess = await _areaRepository
    .UserHasAreaWithStationAsync(userId, stationId, ct);
if (!hasAccess && !IsAdmin(userId))
    return Forbidden();
```

### 2.4 Add anomaly detection
```csharp
// Z-score method cho spike detection:
var mean = readings.Average(r => r.WaterLevel);
var stdDev = Math.Sqrt(readings.Average(r =>
    Math.Pow(r.WaterLevel - mean, 2)));
var anomalies = readings
    .Where(r => Math.Abs(r.WaterLevel - mean) > 2 * stdDev);
```
