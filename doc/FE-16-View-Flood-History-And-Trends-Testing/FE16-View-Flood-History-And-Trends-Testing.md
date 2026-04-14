# FE-16 - View Flood History & Trends - Testing Guide

> Feature Name: View Flood History & Trends
> Status: Implemented APIs available
> Backend Features: Feat44 (Flood History), Feat45 (Flood Trends), Feat46 (Flood Statistics)
> Authorization: User policy
> Scope: Actual endpoint behavior and testcase guidance

---

## 1. Executive Summary

FE-16 exposes chart-oriented read APIs for flood history, trend aggregation, and statistical summaries.

Implemented endpoints in code:
- GET /api/v1/flood-history
- GET /api/v1/flood-trends
- GET /api/v1/flood-statistics

These endpoints are protected by Policies("User") and map a shared flood-history status model into HTTP responses.

---

## 2. Implemented API Matrix

| Feature | Endpoint | Method | Auth | Main Result Codes |
|---------|----------|--------|------|-------------------|
| Feat44 | /api/v1/flood-history | GET | User | 200, 400, 401, 403, 404, 429, 500 |
| Feat45 | /api/v1/flood-trends | GET | User | 200, 400, 401, 403, 404, 429, 500 |
| Feat46 | /api/v1/flood-statistics | GET | User | 200, 400, 401, 403, 404, 429, 500 |

---

## 3. Request Models

### 3.1 Feat44 - Flood History

Endpoint: GET /api/v1/flood-history

Supported query parameters:
- stationId
- stationIds
- areaId
- startDate
- endDate
- granularity
- limit
- cursor

Behavior notes:
- Granularity defaults to hourly in the request DTO.
- The endpoint maps query values into a GetFloodHistoryRequest.
- Response includes both data and pagination fields.

Primary test scenarios:
- Get flood history with default parameters
- Get flood history by single station
- Get flood history by area
- Get flood history with custom date range
- Get flood history with invalid granularity
- Get flood history without authorization

### 3.2 Feat45 - Flood Trends

Endpoint: GET /api/v1/flood-trends

Supported query parameters:
- stationId
- period
- startDate
- endDate
- granularity
- compareWithPrevious

Behavior notes:
- stationId is required by the request DTO shape.
- period supports values like last7days, last30days, last90days, last365days, custom.
- compareWithPrevious toggles comparative trend output.

Primary test scenarios:
- Get trends for a station with default period
- Get trends with custom date range
- Get trends grouped by daily, weekly, monthly
- Get trends with invalid granularity
- Get trends without authorization

### 3.3 Feat46 - Flood Statistics

Endpoint: GET /api/v1/flood-statistics

Supported query parameters:
- stationId
- stationIds
- areaId
- period
- includeBreakdown
- includeComparison

Behavior notes:
- Statistics endpoint returns summary values and optional breakdown/comparison sections.
- Request DTO defaults to period=last30days, includeBreakdown=true, includeComparison=false.

Primary test scenarios:
- Get statistics with default period
- Get statistics by area
- Get statistics with breakdown enabled
- Get statistics with comparison enabled
- Get statistics without authorization

---

## 4. Response Code Guidance

The endpoint layer maps application result codes as follows:
- Success -> 200 OK
- BadRequest -> 400 Bad Request
- Unauthorized -> 401 Unauthorized
- Forbidden -> 403 Forbidden
- NotFound -> 404 Not Found
- TooManyRequests -> 429 Too Many Requests
- Fallback -> 500 Internal Server Error

Integration tests should reflect these mappings in testcase comments.

---

## 5. Recommended Automated Test Strategy

For the current test project style, prefer lightweight endpoint-level tests that verify:
- Correct route is reachable
- Query parameter combinations are accepted or rejected correctly
- Unauthorized access is blocked
- Successful responses contain expected top-level fields when data is available
- Data-dependent scenarios tolerate 404 when seeded data is absent

Suggested assertions:
- Positive scenarios: allow 200 and, where data is environment-dependent, optionally 404.
- Negative parameter scenarios: expect 400 when validation is deterministic.
- Unauthorized scenarios: expect 401 or 403 depending on authentication and policy resolution.

---

## 6. Mismatch and Clarification Notes

The older planning document references backend feature names FeatG39, FeatG40, and FeatG41. The implemented endpoint folders and current API surface in code are Feat44, Feat45, and Feat46.

For test generation and QA, the implemented routes in code should be treated as the source of truth.

---

## 7. Output for Test File Generation

This document is intended to support creation of:
- FE16_ViewFloodHistoryAndTrendsTests.cs

The test file should group cases by:
- Feat44 Flood History
- Feat45 Flood Trends
- Feat46 Flood Statistics

Each testcase comment should include:
- Test case ID
- Precondition
- Confirm Return
- Result Type
