# REBUILD PLAN — Skin Lesion Diagnosis App
## Backend: NestJS + Oracle DB + Docker Compose

> **Nguyên tắc**: Mỗi Phase phải được approve trước khi thực thi. Không gộp nhiều Phase.

---

## TỔNG QUAN KIẾN TRÚC MỚI

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Compose                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  NestJS      │  │  FastAPI     │  │  Oracle DB    │  │
│  │  :8000       │◄─►  :8001       │  │  Free 23c     │  │
│  │  (Backend)   │  │  (AI Server) │  │  :1521        │  │
│  └──────┬───────┘  └──────────────┘  └───────┬───────┘  │
│         └──────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
         ▲
   React Frontend (Vite) — không đổi nhiều
```

**Thay đổi core:**
- ❌ Loại bỏ: `mongoose`, `@nestjs/mongoose`, MongoDB
- ✅ Thêm mới: `typeorm`, `@nestjs/typeorm`, `oracledb`
- ✅ Unified User model (gộp Patient + Doctor vào 1 bảng USERS)
- ✅ Docker Compose cho toàn bộ stack
- ✅ Global prefix `/api/v1`

---

## DATABASE SCHEMA (Oracle DB)

### USERS (Bảng trung tâm thay cho Patient + Doctor riêng lẻ)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| email | VARCHAR2(255) | UNIQUE NOT NULL |
| password | VARCHAR2(255) | bcrypt hashed |
| role | VARCHAR2(10) | 'PATIENT' / 'DOCTOR' / 'ADMIN' |
| refresh_token | VARCHAR2(500) | |
| status | VARCHAR2(10) | DEFAULT 'active' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### PATIENT_PROFILES (1-1 với USERS)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| user_id | NUMBER | PK, FK → USERS.id |
| full_name | VARCHAR2(100) | NOT NULL |
| phone | VARCHAR2(20) | |
| birth_date | DATE | |
| avatar_url | VARCHAR2(500) | |
| gender | VARCHAR2(10) | |
| address | VARCHAR2(300) | |

### DOCTOR_PROFILES (1-1 với USERS)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| user_id | NUMBER | PK, FK → USERS.id |
| full_name | VARCHAR2(100) | NOT NULL |
| phone | VARCHAR2(20) | |
| avatar_url | VARCHAR2(500) | |
| discipline | VARCHAR2(100) | Chuyên khoa |
| experience_yrs | NUMBER(3) | Số năm kinh nghiệm |
| rating | NUMBER(2,1) | 1.0 - 5.0 |

### DIAGNOSES
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| patient_id | NUMBER | FK → USERS.id |
| prediction | VARCHAR2(20) | 'mel', 'nv', 'bcc'... |
| confidence | NUMBER(5,2) | % (ví dụ: 95.50) |
| image_url | VARCHAR2(500) | Ảnh upload lên Cloudinary |
| description | VARCHAR2(2000) | |
| is_deleted | NUMBER(1) | DEFAULT 0 (soft delete) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### APPOINTMENTS (thay thế CONSULT)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| patient_id | NUMBER | FK → USERS.id |
| doctor_id | NUMBER | FK → USERS.id |
| scheduled_date | VARCHAR2(30) | ISO datetime string |
| status | VARCHAR2(15) | PENDING/CONFIRMED/COMPLETED/CANCELLED |
| patient_notes | VARCHAR2(1000) | |
| doctor_result | VARCHAR2(2000) | Bác sĩ điền sau khám |
| is_deleted | NUMBER(1) | DEFAULT 0 |
| created_at | TIMESTAMP | |

### SKIN_LESIONS
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| name | VARCHAR2(50) | UNIQUE — 'MEL', 'NV'... |
| full_name | VARCHAR2(200) | Tên đầy đủ bệnh |
| description | VARCHAR2(2000) | |
| symptoms | VARCHAR2(1000) | |
| recommendation | VARCHAR2(1000) | |
| danger_level | VARCHAR2(20) | LOW/MEDIUM/HIGH/CRITICAL |

### PRODUCTS
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| title | VARCHAR2(200) | NOT NULL |
| slug | VARCHAR2(200) | UNIQUE |
| description | CLOB | |
| price | NUMBER(12,2) | NOT NULL |
| stock_quantity | NUMBER(6) | DEFAULT 0 |
| sold_count | NUMBER(8) | DEFAULT 0 |
| is_active | NUMBER(1) | DEFAULT 1 |
| image_url | VARCHAR2(500) | |
| is_deleted | NUMBER(1) | DEFAULT 0 |

### SKIN_LESION_PRODUCTS (ManyToMany junction)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| skin_lesion_id | NUMBER | FK → SKIN_LESIONS.id |
| product_id | NUMBER | FK → PRODUCTS.id |

### ORDERS
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| patient_id | NUMBER | FK → USERS.id |
| order_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| total_amount | NUMBER(12,2) | NOT NULL |
| status | VARCHAR2(15) | PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED |
| shipping_addr | VARCHAR2(300) | NOT NULL |
| payment_method | VARCHAR2(30) | NOT NULL |
| payment_status | VARCHAR2(15) | PENDING/PAID/FAILED/REFUNDED |
| notes | VARCHAR2(500) | |
| is_deleted | NUMBER(1) | DEFAULT 0 |

### ORDER_DETAILS
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | NUMBER | PK, IDENTITY |
| order_id | NUMBER | FK → ORDERS.id |
| product_id | NUMBER | FK → PRODUCTS.id |
| quantity | NUMBER(4) | NOT NULL |
| unit_price | NUMBER(12,2) | Giá tại thời điểm mua |
| subtotal | NUMBER(12,2) | quantity × unit_price |

---

## API ENDPOINTS — `/api/v1`

### Auth (Public)
```
POST   /api/v1/auth/register          → Đăng ký (role mặc định: PATIENT)
POST   /api/v1/auth/login             → Đăng nhập, trả access_token + refresh cookie
GET    /api/v1/auth/refresh           → Làm mới access_token qua refresh cookie
POST   /api/v1/auth/logout            → [JWT] Xoá refresh token
GET    /api/v1/auth/me                → [JWT] Lấy thông tin user hiện tại
```

### Users / Profiles
```
GET    /api/v1/users/profile          → [JWT] Xem profile của mình
PATCH  /api/v1/users/profile          → [JWT] Cập nhật profile
```

### Diagnose
```
POST   /api/v1/diagnose               → [PATIENT] Tạo kết quả chẩn đoán mới
GET    /api/v1/diagnose/my-history    → [PATIENT] Xem lịch sử chẩn đoán
GET    /api/v1/diagnose/:id           → [PATIENT|DOCTOR] Xem chi tiết 1 diagnose
```

### Appointment
```
POST   /api/v1/appointment            → [PATIENT] Đặt lịch hẹn bác sĩ
GET    /api/v1/appointment/my         → [PATIENT|DOCTOR] Xem lịch hẹn của mình
PATCH  /api/v1/appointment/:id/status → [DOCTOR] Cập nhật trạng thái (CONFIRMED/CANCELLED)
PATCH  /api/v1/appointment/:id/result → [DOCTOR] Điền kết quả khám
```

### Doctor (Public read, Admin write)
```
GET    /api/v1/doctor                 → Danh sách bác sĩ (public)
GET    /api/v1/doctor/:id             → Chi tiết bác sĩ (public)
POST   /api/v1/doctor                 → [ADMIN] Thêm bác sĩ
PATCH  /api/v1/doctor/:id             → [ADMIN] Cập nhật
DELETE /api/v1/doctor/:id             → [ADMIN] Soft delete
```

### Skin Lesion (Public read, Admin write)
```
GET    /api/v1/skin-lesion            → Danh sách bệnh lý (public)
GET    /api/v1/skin-lesion/:name      → Chi tiết theo tên (public)
POST   /api/v1/skin-lesion            → [ADMIN] Thêm bệnh lý
PATCH  /api/v1/skin-lesion/:id        → [ADMIN] Cập nhật
```

### Product (Public read, Admin write)
```
GET    /api/v1/product                → Danh sách sản phẩm (public)
GET    /api/v1/product/:id            → Chi tiết sản phẩm (public)
POST   /api/v1/product                → [ADMIN] Thêm sản phẩm
PATCH  /api/v1/product/:id            → [ADMIN] Cập nhật
DELETE /api/v1/product/:id            → [ADMIN] Soft delete
```

### Order
```
POST   /api/v1/order                  → [PATIENT] Đặt hàng (dùng Transaction)
GET    /api/v1/order/my               → [PATIENT] Xem đơn hàng của mình
GET    /api/v1/order                  → [ADMIN] Xem tất cả đơn hàng
PATCH  /api/v1/order/:id/status       → [ADMIN] Cập nhật trạng thái đơn
```

### Upload
```
POST   /api/v1/upload/image           → [JWT] Upload ảnh lên Cloudinary
```

---

## DOCKER COMPOSE STRUCTURE

```
project/
├── Backend/
│   ├── Dockerfile
│   └── .env
├── AI/
│   └── Dockerfile
├── docker-compose.yml
└── docker-compose.prod.yml
```

### docker-compose.yml (Dev)
```yaml
version: '3.9'

services:
  oracle-db:
    image: gvenzl/oracle-free:23-slim
    container_name: skinguard_oracle
    environment:
      ORACLE_PASSWORD: ${ORACLE_SYS_PASSWORD}
      APP_USER: ${ORACLE_USER}
      APP_USER_PASSWORD: ${ORACLE_PASSWORD}
    ports:
      - "1521:1521"
    volumes:
      - oracle_data:/opt/oracle/oradata
    healthcheck:
      test: ["CMD", "healthcheck.sh"]
      interval: 30s
      timeout: 10s
      retries: 15

  nestjs-backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: skinguard_backend
    ports:
      - "8000:8000"
    env_file:
      - ./Backend/.env
    depends_on:
      oracle-db:
        condition: service_healthy
    restart: unless-stopped

  fastapi-ai:
    build:
      context: ./AI
      dockerfile: Dockerfile
    container_name: skinguard_ai
    ports:
      - "8001:8001"
    restart: unless-stopped

volumes:
  oracle_data:
```

### Backend/Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 8000
CMD ["node", "dist/main"]
```

### AI/Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "model_server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Backend/.env (mới)
```env
PORT=8000

# Oracle DB
ORACLE_HOST=oracle-db
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=FREEPDB1
ORACLE_USER=skinguard_user
ORACLE_PASSWORD=StrongPass123!

# JWT
JWT_ACCESS_TOKEN_SECRET=replace_with_random_64char_string
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_TOKEN_SECRET=replace_with_another_random_64char_string
JWT_REFRESH_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Service
AI_SERVICE_URL=http://fastapi-ai:8001

# CORS
CORS_ORIGINS=http://localhost:5173,https://duckymomouwu.github.io
```

---

## PHASES — THỨ TỰ THỰC HIỆN

### Phase 1 — Foundation Setup
- [ ] Tạo `docker-compose.yml`, `Backend/Dockerfile`, `AI/Dockerfile`
- [ ] Xoá dependencies MongoDB, cài TypeORM + oracledb
- [ ] Cấu hình `TypeOrmModule` trong `AppModule`
- [ ] Cấu hình global prefix `/api/v1`
- **Acceptance**: `docker-compose up` → Oracle khởi động, NestJS kết nối thành công

### Phase 2 — User Module + Auth
- [ ] Tạo entity `User`, `PatientProfile`, `DoctorProfile`
- [ ] Viết lại `AuthService`: login, register, refresh token
- [ ] Cập nhật JWT Strategy dùng `user.role` thay vì `userType`
- [ ] Tạo `RolesGuard` với decorator `@Roles('PATIENT', 'DOCTOR', 'ADMIN')`
- **Acceptance**: Register → Login → nhận JWT → gọi `/auth/me` thành công

### Phase 3 — Medical Domain
- [ ] Entity + Service + Controller cho `Diagnose`
- [ ] Entity + Service + Controller cho `Appointment`
- [ ] Entity + Service + Controller cho `SkinLesion`
- **Acceptance**: Patient tạo Diagnose, Doctor xem + cập nhật Appointment

### Phase 4 — E-Commerce Domain
- [ ] Entity + Service + Controller cho `Product`
- [ ] Entity + Service + Controller cho `Order` + `OrderDetail`
- [ ] Implement Transaction khi tạo Order (tạo OrderDetails + trừ stock)
- **Acceptance**: Đặt hàng thành công, stock bị trừ, rollback khi lỗi

### Phase 5 — Upload & AI Integration
- [ ] Giữ nguyên Cloudinary upload
- [ ] NestJS gọi FastAPI `/predict` khi nhận ảnh chẩn đoán
- [ ] Lưu kết quả AI vào bảng `DIAGNOSES`
- **Acceptance**: Upload ảnh → AI trả kết quả → lưu DB → frontend nhận đúng

### Phase 6 — Admin APIs
- [ ] Các endpoint CRUD cho Admin
- [ ] Bảo vệ `/api/v1/admin/*` bằng `@Roles('ADMIN')`
- **Acceptance**: ADMIN truy cập được, PATIENT/DOCTOR bị chặn (403)

### Phase 7 — Final Docker + Deploy
- [ ] Test `docker-compose up --build` đầy đủ
- [ ] Kiểm tra health check Oracle
- [ ] Tạo `docker-compose.prod.yml` với biến môi trường production
- **Acceptance**: Toàn bộ stack chạy trong Docker, frontend kết nối được

---

## LƯU Ý TƯƠNG THÍCH FRONTEND

Frontend hiện tại cần **2 thay đổi nhỏ**:

1. **Base URL**: Thêm `/api/v1` vào `axiosInstance` base URL
   ```ts
   // src/api/Axios.ts
   baseURL: 'http://localhost:8000/api/v1'
   ```

2. **role vs userType**: Backend mới trả về `role: 'PATIENT'` thay vì `userType: 'patient'`.
   - Nếu muốn **không đổi frontend**: Backend sẽ map và trả về `userType: 'patient'` (chữ thường) trong JWT payload.
   - Nếu muốn **đồng bộ**: Sửa `AuthStore.tsx` từ `userType` sang `role`.

---

*Cập nhật lần cuối: 2026-05-04*
