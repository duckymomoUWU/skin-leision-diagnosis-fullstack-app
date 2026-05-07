<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/NestJS-9-E0234E?logo=nestjs" alt="NestJS 9" />
  <img src="https://img.shields.io/badge/FastAPI-PyTorch-009688?logo=fastapi" alt="FastAPI + PyTorch" />
  <img src="https://img.shields.io/badge/OracleDB-Free%2023c-F80000?logo=oracle" alt="OracleDB Free 23c" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
</p>

<h1 align="center">🩺 SkinGuard — Skin Lesion Diagnosis App</h1>

<p align="center">
  <strong>Fullstack Web Application</strong> — Chẩn đoán tổn thương da bằng AI, kết hợp giữa học sâu (Deep Learning) và nền tảng web hiện đại. Hỗ trợ bệnh nhân, bác sĩ và quản trị viên trong quy trình khám, chẩn đoán và điều trị bệnh lý về da.
</p>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Tính năng chính](#-tính-năng-chính)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [API Endpoints](#-api-endpoints)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
  - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
  - [Chạy với Docker (Khuyến nghị)](#1-chạy-với-docker-khuyến-nghị)
  - [Chạy thủ công (Development)](#2-chạy-thủ-công-development)
- [Biến môi trường](#-biến-môi-trường)
- [Mô hình AI](#-mô-hình-ai)
- [Deployment](#-deployment)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

---

## 📌 Tổng quan

**SkinGuard** là ứng dụng full-stack cho phép:

- 🔬 **Tải lên hình ảnh tổn thương da** và nhận kết quả chẩn đoán từ mô hình AI (PyTorch CNN) với **7 loại bệnh lý về da**.
- 👨‍⚕️ **Đặt lịch hẹn với bác sĩ da liễu** để được tư vấn chuyên sâu.
- 🛒 **Mua sắm sản phẩm chăm sóc da** phù hợp với từng loại bệnh lý.
- 📊 **Quản lý bệnh nhân, bác sĩ, đơn hàng** qua giao diện Admin.
- 🔐 **Xác thực JWT** với phân quyền PATIENT / DOCTOR / ADMIN.

---

## 🏗️ Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────────┐
│                        Docker Compose                            │
│                                                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐              │
│  │     Frontend        │    │     Backend         │              │
│  │  React + Vite       │    │  NestJS + TypeORM   │              │
│  │  Redux + RTK        │◄──►│  :8000              │              │
│  │  TypeScript         │    │  Passport JWT       │              │
│  │  :5173              │    │  Cloudinary Upload   │              │
│  └─────────────────────┘    └──────────┬──────────┘              │
│                                        │ HTTP                    │
│                                        ▼                         │
│                             ┌─────────────────────┐              │
│                             │    AI Service       │              │
│                             │  FastAPI + PyTorch  │              │
│                             │  :8001              │              │
│                             │  /predict           │              │
│                             └─────────────────────┘              │
│                                        │                         │
│                                        ▼                         │
│                             ┌─────────────────────┐              │
│                             │    Oracle DB        │              │
│                             │  Free 23c           │              │
│                             │  :1521              │              │
│                             └─────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Công nghệ | Mục đích |
|-----------|----------|
| **React 19** | UI Library |
| **TypeScript 5.7** | Static typing |
| **Vite 6** | Build tool & dev server |
| **Redux Toolkit + Redux Persist** | State management |
| **React Router DOM 6** | Điều hướng |
| **Axios** | HTTP client |
| **Sass Embedded** | CSS preprocessing |

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| **NestJS 9** | Node.js framework |
| **TypeORM** | ORM cho Oracle DB |
| **Passport + JWT** | Xác thực & phân quyền |
| **bcryptjs** | Mã hóa mật khẩu |
| **Cloudinary SDK** | Upload & quản lý hình ảnh |
| **class-validator** | Validation dữ liệu đầu vào |
| **EJS** | Server-side rendering (optional) |

### AI / Machine Learning
| Công nghệ | Mục đích |
|-----------|----------|
| **FastAPI** | Python REST framework |
| **PyTorch** | Deep Learning framework |
| **TorchVision** | Image transforms & augmentation |
| **Pillow** | Xử lý hình ảnh |
| **CNN (Custom)** | Mô hình phân loại 7 loại bệnh da |

### Database
| Công nghệ | Mục đích |
|-----------|----------|
| **Oracle Database Free 23c** | Hệ quản trị CSDL quan hệ |
| **gvenzl/oracle-free** | Docker image chính thức |

### Infrastructure
| Công nghệ | Mục đích |
|-----------|----------|
| **Docker Compose** | Container orchestration |
| **Docker** | Containerization |
| **GitHub Pages** | Frontend deployment |

---

## ✨ Tính năng chính

### 🔐 Hệ thống xác thực & phân quyền
- Đăng ký / Đăng nhập với JWT (access token + refresh token)
- 3 vai trò: **PATIENT**, **DOCTOR**, **ADMIN**
- Refresh token lưu trong HTTP-only cookie
- Bảo vệ route với PrivateRoute

### 🔬 Chẩn đoán AI
- Upload hình ảnh tổn thương da
- Gửi đến FastAPI server → PyTorch model → Dự đoán 1 trong 7 loại bệnh
- Kết quả bao gồm: **loại bệnh** + **độ tin cậy (%)**
- Lưu trữ hình ảnh qua **Cloudinary**
- Lịch sử chẩn đoán cho từng bệnh nhân

### 🧑‍⚕️ Đặt lịch hẹn bác sĩ
- Bệnh nhân đặt lịch hẹn với bác sĩ da liễu
- Bác sĩ xác nhận / hủy lịch hẹn
- Bác sĩ điền kết quả khám sau khi tư vấn
- Quản lý trạng thái: PENDING → CONFIRMED → COMPLETED / CANCELLED

### 🛒 Thương mại điện tử
- Danh mục sản phẩm chăm sóc da
- Liên kết sản phẩm với loại bệnh lý da
- Giỏ hàng, đặt hàng, quản lý đơn hàng
- Theo dõi trạng thái đơn hàng & thanh toán

### 📊 Quản trị hệ thống (Admin Dashboard)
- Quản lý người dùng (bệnh nhân, bác sĩ)
- Quản lý sản phẩm, đơn hàng
- Quản lý bệnh lý da (Skin Lesions)
- Cấu hình AI, vai trò & phân quyền
- Cài đặt chung & thanh toán

---

## 📁 Cấu trúc dự án

```
skin-leision-diagnosis-fullstack-app/
├── AI/                              # FastAPI + PyTorch AI Service
│   ├── Dockerfile                   # Docker image cho AI service
│   ├── model.py                     # Định nghĩa mô hình CNN
│   ├── model.pth                    # Pre-trained weights
│   ├── model_server.py              # FastAPI server (endpoint /predict)
│   ├── requirements.txt             # Python dependencies
│   └── readme.md
│
├── Backend/                         # NestJS Backend
│   ├── Dockerfile                   # Docker image cho backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── view/                        # EJS templates
│   │   └── home.ejs
│   └── src/
│       ├── main.ts                  # Entry point (CORS, global prefix, validation)
│       ├── app.module.ts            # Root module (TypeORM, modules)
│       ├── auth/                    # Xác thực (JWT, Passport, Local)
│       ├── users/                   # Quản lý người dùng (User, Patient, Doctor)
│       ├── diagnose/                # Chẩn đoán (upload ảnh, gọi AI)
│       ├── skin-leision/            # Danh mục bệnh lý da
│       ├── appointment/             # Lịch hẹn bác sĩ
│       ├── product/                 # Sản phẩm chăm sóc da
│       ├── order/                   # Đơn hàng
│       ├── order_detail/            # Chi tiết đơn hàng
│       └── cloudinary/              # Cloudinary upload service
│
├── FrontEnd/                        # React + Vite Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── main.tsx                 # Entry point
│       ├── App.tsx                  # Root component (Redux + Router)
│       ├── api/                     # Axios client
│       ├── components/              # UI Components (Admin, Client, Cart...)
│       ├── pages/                   # Pages (Home, About, Profile, Cart...)
│       ├── routes/                  # Route definitions
│       ├── services/                # Service layer
│       ├── stores/                  # Redux store & slices
│       └── types/                   # TypeScript type definitions
│
├── Docs/                            # Tài liệu
│   ├── AGENTS.md                    # Agent operating rules
│   ├── Promt.md                     # Development prompts
│   └── REBUILD_PLAN.md              # Kiến trúc & kế hoạch rebuild
│
├── docker-compose.yml               # Docker Compose (Oracle + Backend + AI)
├── package.json                     # Root package (concurrently)
└── README.md                        # Bạn đang đọc đấy ☺️
```

---

## 🗄️ Cơ sở dữ liệu

### Các bảng chính (Oracle Database Free 23c)

| Bảng | Mô tả |
|------|-------|
| **users** | Người dùng (PATIENT / DOCTOR / ADMIN) |
| **patient_profiles** | Thông tin chi tiết bệnh nhân (1-1 với users) |
| **doctor_profiles** | Thông tin chi tiết bác sĩ (1-1 với users) |
| **diagnoses** | Kết quả chẩn đoán AI |
| **skin_lesions** | Danh mục bệnh lý da (7 loại) |
| **appointments** | Lịch hẹn bệnh nhân - bác sĩ |
| **products** | Sản phẩm chăm sóc da |
| **skin_lesion_products** | Liên kết sản phẩm ↔ bệnh lý (Many-to-Many) |
| **orders** | Đơn hàng |
| **order_details** | Chi tiết đơn hàng |

> Tất cả các bảng business đều hỗ trợ **soft delete** (`is_deleted` column).

---

## 🌐 API Endpoints

Tất cả API được prefix với `/api/v1`.

### 🔑 Auth (Public)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký tài khoản (mặc định PATIENT) |
| POST | `/auth/login` | Đăng nhập → access_token + refresh cookie |
| GET | `/auth/refresh` | Làm mới access_token |
| POST | `/auth/logout` | [JWT] Xóa refresh token |
| GET | `/auth/me` | [JWT] Thông tin user hiện tại |

### 👤 Users
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/users/profile` | [JWT] Xem profile của mình |
| PATCH | `/users/profile` | [JWT] Cập nhật profile |

### 🔬 Diagnose
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/diagnose` | [PATIENT] Tạo chẩn đoán mới (upload ảnh) |
| GET | `/diagnose/my-history` | [PATIENT] Lịch sử chẩn đoán |
| GET | `/diagnose/:id` | [*] Chi tiết chẩn đoán |

### 📅 Appointment
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/appointment` | [PATIENT] Đặt lịch hẹn |
| GET | `/appointment/my` | [*] Xem lịch hẹn của mình |
| PATCH | `/appointment/:id/status` | [DOCTOR] Cập nhật trạng thái |
| PATCH | `/appointment/:id/result` | [DOCTOR] Điền kết quả khám |

### 🧑‍⚕️ Doctor
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/doctor` | Danh sách bác sĩ (public) |
| GET | `/doctor/:id` | Chi tiết bác sĩ (public) |
| POST | `/doctor` | [ADMIN] Thêm bác sĩ |
| PATCH | `/doctor/:id` | [ADMIN] Cập nhật |
| DELETE | `/doctor/:id` | [ADMIN] Soft delete |

### 🩻 Skin Lesion
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/skin-lesion` | Danh sách bệnh lý (public) |
| GET | `/skin-lesion/:name` | Chi tiết bệnh lý (public) |
| POST | `/skin-lesion` | [ADMIN] Thêm bệnh lý |
| PATCH | `/skin-lesion/:id` | [ADMIN] Cập nhật |

### 🛍️ Product & Order
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| CRUD | `/products` | Quản lý sản phẩm |
| CRUD | `/orders` | Quản lý đơn hàng |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) (khuyến nghị)
- Node.js 18+ & npm
- Python 3.10+
- Oracle DB (tự động qua Docker)

---

### 1️⃣ Chạy với Docker (Khuyến nghị)

Docker Compose sẽ khởi chạy toàn bộ hệ thống gồm **Oracle DB**, **Backend NestJS** và **AI FastAPI**:

```bash
# Clone dự án
git clone https://github.com/Conductor15/skin-leision-diagnosis-fullstack-app.git
cd skin-leision-diagnosis-fullstack-app

# Khởi chạy toàn bộ hệ thống
docker compose up -d

# Kiểm tra trạng thái
docker compose ps
```

Sau khi chạy:
| Service | URL |
|---------|-----|
| **Backend API** | http://localhost:8000/api/v1 |
| **AI Service** | http://localhost:8001/predict |
| **Oracle DB** | localhost:1521 |

> **Lưu ý**: Frontend chạy riêng biệt với Vite dev server (xem bên dưới).

### 2️⃣ Chạy thủ công (Development)

#### Bước 1: Backend (NestJS)

```bash
cd Backend
npm install

# Cấu hình .env (xem bảng Biến môi trường bên dưới)

npm run start:dev
```

> Backend sẽ chạy tại **http://localhost:8000**

#### Bước 2: AI Service (FastAPI)

```bash
cd AI
pip install -r requirements.txt
uvicorn model_server:app --reload --port 8001
```

> AI Service sẽ chạy tại **http://localhost:8001**

#### Bước 3: Frontend (React + Vite)

```bash
cd FrontEnd
npm install
npm run dev
```

> Frontend sẽ chạy tại **http://localhost:5173**

#### Bước 4: Chạy tất cả cùng lúc

Từ thư mục gốc (cần cài đặt & chạy riêng AI Service và Oracle DB trước):
```bash
npm start
```

---

## 🔐 Biến môi trường

### Backend `.env`

```env
# Server
PORT=8000

# Oracle Database
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_USER=skinguard_user
ORACLE_PASSWORD=StrongPass123!
ORACLE_SERVICE_NAME=FREEPDB1

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service
AI_SERVICE_URL=http://localhost:8001

# CORS
CORS_ORIGINS=http://localhost:5173,https://duckymomouwu.github.io
```

### Docker Compose
Các biến môi trường cho Oracle DB được cấu hình trong `docker-compose.yml`:
- `ORACLE_SYS_PASSWORD`: Mật khẩu sys (mặc định: `StrongPass123!`)
- `ORACLE_USER`: User ứng dụng (mặc định: `skinguard_user`)
- `ORACLE_PASSWORD`: Mật khẩu user (mặc định: `StrongPass123!`)

---

## 🤖 Mô hình AI

### Kiến trúc mô hình

Mô hình là **CNN (Convolutional Neural Network)** tự xây dựng với 4 khối tích chập:

| Block | Layers | Output Channels |
|-------|--------|-----------------|
| Block 1 | Conv → SiLU → BN → Conv → SiLU → BN → MaxPool → Dropout | 32 |
| Block 2 | Conv → SiLU → BN → Conv → SiLU → BN → MaxPool → Dropout | 64 |
| Block 3 | 3× (Conv → SiLU → BN) → MaxPool → Dropout | 128 |
| Block 4 | 3× (Conv → SiLU → BN) → MaxPool → Dropout | 256 |
| Classifier | AdaptiveAvgPool → Flatten → Dropout → Linear(128) → Dropout → Linear(7) | 7 |

### 7 loại bệnh lý da được hỗ trợ

| Mã | Bệnh lý | Mức độ nguy hiểm |
|----|---------|------------------|
| **akiec** | Actinic Keratosis / Bowen's Disease | Cao |
| **bcc** | Basal Cell Carcinoma | Cao |
| **bkl** | Benign Keratosis-like Lesions | Thấp |
| **df** | Dermatofibroma | Thấp |
| **mel** | Melanoma | Rất cao |
| **nv** | Melanocytic Nevi | Thấp |
| **vasc** | Vascular Lesions | Trung bình |

### Tiền xử lý ảnh
- Resize về **256×256** pixels
- Normalize với mean/std được tính từ tập dữ liệu HAM10000
- Đầu vào: 3 kênh màu RGB

---

## 🌍 Deployment

### Frontend (GitHub Pages)

Frontend được cấu hình sẵn để deploy lên GitHub Pages:

```bash
cd FrontEnd
npm run deploy
```

URL: `https://Conductor15.github.io/skin-leision-diagnosis-fullstack-app/`

> **Lưu ý**: GitHub Pages chỉ phục vụ frontend tĩnh. Backend và AI Service cần được deploy riêng (VPS, Render, Railway, v.v.).

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork dự án
2. Tạo nhánh feature: `git checkout -b feature/amazing-feature`
3. Commit thay đổi: `git commit -m 'Add amazing feature'`
4. Push lên nhánh: `git push origin feature/amazing-feature`
5. Tạo Pull Request

> 📖 Xem thêm [Docs/AGENTS.md](Docs/AGENTS.md) để biết quy tắc làm việc với AI Agent trong dự án.

---

## 📄 Giấy phép

Dự án được phát triển với mục đích học tập và nghiên cứu. Vui lòng liên hệ tác giả để biết thêm chi tiết.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Conductor15">Conductor15</a> & <a href="https://github.com/duckymomouwu">duckymomouwu</a>
</p>

