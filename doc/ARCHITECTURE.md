# 🏗️ KIẾN TRÚC HỆ THỐNG

**Loại:** Clean Layered Architecture  
**Ngôn ngữ:** Python 3.10+  
**Framework:** FastAPI + SQLAlchemy

---

## 📐 CẤU TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────┐
│                   TẦNG API                              │
│  FastAPI Routes + Request/Response Models               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                 TẦNG SERVICES                           │
│  Business Logic + Orchestration                         │
│  ├─ Prediction Service (xử lý hậu kỳ)                   │
│  ├─ Weather Service (APIs ngoài)                        │
│  ├─ Groq AI Consultant (LLM advice)                     │
│  └─ Cache Service (hiệu suất)                           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                 TẦNG DOMAIN                             │
│  Core Business Logic (ML, GEE, FE-20)                   │
│  ├─ ML Models (LSTM, Prithvi inference)                 │
│  ├─ FE-20 Engine (Area logic, Interpretability)         │
│  ├─ Historical Matching (21 real events 2006-2024)      │
│  ├─ Google Earth Engine (dữ liệu vệ tinh)               │
│  └─ Terrain Analysis (DEM, độ dốc, TWI)                 │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│            TẦNG INFRASTRUCTURE                          │
│  Database + External Services                           │
│  ├─ PostgreSQL (predictions, metadata JSONB)            │
│  ├─ C# Backend Sync (metadata persistence)              │
│  ├─ Terrain Cache (hiệu suất)                           │
│  └─ Repositories (data access pattern)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 CẤU TRÚC THƯ MỤC

```
src/flood_system/
├── main.py                   # FastAPI entrypoint
├── api/
│   ├── routes.py             # API endpoints
│   └── service.py            # Flash flood orchestration
├── domain/
│   ├── models.py             # Prithvi inference
│   ├── gee.py                # Google Earth Engine
│   └── terrain.py            # Phân tích DEM
├── services/
│   ├── prediction.py         # Xử lý hậu kỳ
│   ├── weather.py            # Weather APIs
│   └── cache.py              # In-memory cache
├── infrastructure/
│   ├── database.py           # SQLAlchemy setup
│   ├── repositories.py       # Data access
│   └── terrain_cache.py      # File-based cache
└── config/
    ├── settings.py           # Environment config
    ├── constants.py          # Hằng số nghiệp vụ
    ├── security.py           # API keys, xác thực
    └── utils.py              # Hàm tiện ích
```

---

## 🔄 LUỒNG DỮ LIỆU

### Yêu Cầu Dự Báo Lũ (Primary Ensemble):

```
1. User → API Request
    POST /api/v1/area/{area}/predict/flood-risk-ensemble

2. Tầng API → Tầng Service
    routes.py → service.FlashFloodPredictor

3. Service → Domain
    - Lấy địa hình (gee.py)
    - Lấy dữ liệu thời tiết (weather.py)
    - Chạy LSTM inference (service.py)
    - Chạy physics model (SCS-CN + Manning)
    - (Optional) AI Prithvi satellite verification

4. Domain → Infrastructure
    - Load model: data/models/flash_flood_model.pt
    - Query terrain cache

5. Service → Xử lý hậu kỳ
    - Tính contribution scores
    - Tính confidence breakdown
    - Tạo impact assessment

6. Infrastructure → Database
    - Lưu alert: repositories.save_flash_flood_alert()

7. API → User
    Phản hồi JSON với:
    - Ensemble prediction
    - Impact assessment
    - Confidence breakdown
```

---

## 🛠️ CÁC THÀNH PHẦN CHÍNH

### 1. FastAPI Application (main.py)
```python
from flood_system.api.routes import app

# Entrypoint:
# uvicorn flood_system.api.routes:app --reload
```

### 2. LSTM Flash Flood Model (api/service.py)
```python
class FlashFloodModel(nn.Module):
    - Input: (batch, 12, 5)
    - LSTM: hidden_size=64
    - Output: [probability, time_to_peak]
```

### 3. Repository Pattern (infrastructure/repositories.py)
```python
def save_flash_flood_alert(alert_data):
    session = get_session()
    try:
        session.add(alert)
        session.commit()
    except:
        session.rollback()
    finally:
        session.close()  # Guaranteed cleanup
```

### 4. Google Earth Engine (domain/gee.py)
```python
- auto_download_gee_image()
- get_dynamic_slope_from_gee()
- get_flash_flood_terrain_features()
```

### 5. Prithvi Inference (domain/models.py)
```python
- run_prithvi_inference()
- export_to_geojson()
- generate_thumbnail()
```

---

## 🔑 NGUYÊN TẮC THIẾT KẾ

### 1. Quy Tắc Phụ Thuộc
```
API → Services → Domain → Infrastructure
```
**Các tầng bên trong KHÔNG BAO GIỜ phụ thuộc vào tầng bên ngoài**

### 2. Trách Nhiệm Đơn Nhất
- **API:** Chỉ xử lý HTTP
- **Services:** Điều phối nghiệp vụ
- **Domain:** Logic cốt lõi (ML, GEE)
- **Infrastructure:** Quan tâm bên ngoài (DB, cache)

### 3. Mẫu Repository
```python
# SAI: Truy cập database trực tiếp trong API
def predict():
    db = SessionLocal()
    db.query(Alert).filter(...)  # ❌

# ĐÚNG: Dùng repository
def predict():
    alert = repositories.get_latest_alert()  # ✅
```

### 4. Cấu Hình Bên Ngoài
```python
# config/settings.py
class Config:
    DATABASE_URL = os.getenv("DATABASE_URL")
    GEE_PROJECT = os.getenv("GEE_PROJECT")
```

---

## 📊 CÔNG NGHỆ SỬ DỤNG

| Tầng | Công nghệ | Mục đích |
|------|-----------|----------|
| **API** | FastAPI | High-performance async API |
| **ML** | PyTorch | LSTM model inference |
| **Vision** | Prithvi | Phân đoạn ảnh vệ tinh |
| **Vệ tinh** | Google Earth Engine | DEM, độ dốc, dữ liệu Sentinel |
| **Database** | SQLite + SQLAlchemy | Tầng lưu trữ |
| **Cache** | Python dict (in-memory) | Tối ưu hiệu suất |
| **Validation** | Pydantic | Request/response models |
| **Testing** | pytest | Unit + integration tests |

---

## ⚡ TỐI ƯU HIỆU SUẤT

### 1. Cache Địa Hình
```python
# Cache dữ liệu DEM (tính toán chậm)
if cached := get_cached_terrain(bbox):
    return cached
terrain = compute_terrain(bbox)  # 2-3 giây
save_terrain_cache(bbox, terrain)
```

### 2. Database Connection Pool
```python
# SQLAlchemy pool mặc định: 5-20 connections
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20
)
```

### 3. Cache Phản Hồi API
```python
# Cache dữ liệu thời tiết/thủy triều (TTL 5 phút)
@cache(ttl=300)
def get_weather_data():
    return api.fetch()
```

---

## 🔐 BẢO MẬT

### 1. Xác Thực API Key
```python
@app.post("/predict")
async def predict(
    api_key: str = Depends(verify_api_key_dependency)
):
    # Chỉ cho phép requests đã xác thực
```

### 2. Validation Đầu Vào
```python
class FloodPredictionRequest(BaseModel):
    rainfall_sequence: List[float]
    
    @field_validator('rainfall_sequence')
    def validate_length(cls, v):
        if len(v) != 12:
            raise ValueError("Phải có 12 giờ")
        return v
```

### 3. Biến Môi Trường
```
# Không bao giờ hardcode:
API_KEY = "secret"  # ❌

# Dùng .env:
API_KEY = os.getenv("API_KEY")  # ✅
```

---

## 🧪 CHIẾN LƯỢC KIỂM THỬ

```
tests/
├── test_api.py          # Tests FastAPI endpoints
├── test_database.py     # Tests Repository pattern
├── test_predictor.py    # Tests LSTM inference
└── conftest.py          # Fixtures (mock GEE, mock DB)
```

**Coverage:** ~82%  
**Framework:** pytest + pytest-cov

---

## 🚀 TRIỂN KHAI

### Phát triển:
```bash
uvicorn flood_system.api.routes:app --reload
```

### Production (Docker):
```dockerfile
FROM python:3.10-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ /app/src/
CMD ["uvicorn", "flood_system.api.routes:app", "--host", "0.0.0.0"]
```

### Môi trường:
```bash
export DATABASE_URL="sqlite:///flood.db"
export GEE_PROJECT="ee-project-id"
export API_KEY="production-key"
```

---

## 📈 KHẢ NĂNG MỞ RỘNG

### Công Suất Hiện Tại:
- **Người dùng đồng thời:** 100-200
- **Requests/giây:** ~50 (không có vệ tinh)
- **Database Pool:** 10-20 connections
- **Thời gian phản hồi:** <100ms (chỉ API), 5-10 phút (có vệ tinh)

### Điểm Nghẽn:
1. **Google Earth Engine:** Giới hạn API bên ngoài
2. **Tải vệ tinh:** 2-3 phút
3. **Database:** File SQLite đơn lẻ

### Cải Thiện Tương Lai:
1. **Hệ thống hàng đợi:** Celery + Redis cho tác vụ dài
2. **Database:** PostgreSQL cho đồng thời
3. **Load Balancer:** Nhiều app instances
4. **Cache:** Redis cho distributed cache

---

## 🎯 LỢI ÍCH CỦA KIẾN TRÚC

### ✅ Khả Năng Kiểm Thử
- Mỗi tầng có thể test độc lập
- Mock các phụ thuộc bên ngoài (GEE, DB)
- Repository pattern đơn giản hóa DB mocking

### ✅ Khả Năng Bảo Trì
- Cấu trúc file rõ ràng
- Trách nhiệm đơn nhất mỗi module
- Dễ dàng xác định bugs

### ✅ Khả Năng Mở Rộng
- Stateless API (có thể scale ngang)
- Connection pooling
- Cache layer sẵn sàng

### ✅ Khả Năng Mở Rộng Tính Năng
- Thêm mô hình dự đoán mới → domain/
- Thêm APIs mới → api/routes.py
- Thêm nguồn dữ liệu mới → services/

---

**Triết Lý Kiến Trúc:**
> "Đơn giản, rõ ràng và đúng đắn tốt hơn phức tạp, thông minh và dễ vỡ."

**Mục Tiêu Thiết Kế:**
> Cấu trúc code nên đủ rõ ràng để developer mới hiểu trong 30 phút.
