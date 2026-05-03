# SmartBillr SaaS Architecture

SmartBillr is a SaaS invoice generation platform for freelancers, small businesses, and teams that need both manual invoice creation and AI-assisted invoice drafting. The system is built around a secure billing core: users manage business profiles, clients, invoices, payments, PDFs, email delivery, dashboard analytics, and optional subscriptions.

> Note: this document uses the requested filename `architechture.md`. The canonical spelling is `architecture.md`.

## 1. Core Modules

SmartBillr is organized into the following product and backend modules:

1. Auth
2. User Profile
3. Business Profile
4. Clients
5. Invoices
6. Invoice Items
7. Payments
8. Dashboard Analytics
9. AI Invoice Generator
10. PDF and Email Invoice
11. Subscription and Plans
12. Settings

## 2. Tech Stack

### Frontend

The current frontend is built with React, Vite, and TypeScript. The architecture also supports a Next.js frontend if server rendering or app-router conventions are introduced later.

```txt
React / Vite / Next.js
TypeScript
Tailwind CSS
Zustand / Redux Toolkit
React Query
React Hook Form
Zod validation
React Router
Recharts for analytics
```

### Backend

The backend uses Node.js, Express, TypeScript, MongoDB, and Mongoose.

```txt
Node.js
Express.js
TypeScript
MongoDB
Mongoose
JWT Auth
Zod validation
Multer / Cloudinary for logos
PDFKit / Puppeteer for invoice PDF
Nodemailer / Resend for email
OpenAI API for AI invoice generation
Stripe / Razorpay for subscriptions and payment confirmation
Redis for caching, sessions, rate limiting, or token flows
```

## 3. High-Level Architecture

```txt
Client Browser
  |
  |-- React Frontend
  |     |-- Auth pages
  |     |-- Dashboard
  |     |-- Invoice builder
  |     |-- Client management
  |     |-- Business profile
  |     |-- Payment tracking
  |
Backend API
  |
  |-- Auth Service
  |-- User Service
  |-- Business Service
  |-- Client Service
  |-- Invoice Service
  |-- Payment Service
  |-- AI Service
  |-- PDF Service
  |-- Email Service
  |-- Analytics Service
  |-- Subscription Service
  |
MongoDB
  |
External Services
  |-- OpenAI
  |-- Stripe / Razorpay
  |-- Cloudinary
  |-- Nodemailer / Resend
  |-- Redis
```

## 4. Data Model

### User

```ts
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "inactive",
    },
  },
  { timestamps: true }
);
```

### Business Profile

```ts
const businessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    ownerName: String,
    email: String,
    phone: String,
    website: String,
    logo: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    taxId: String,
    gstNumber: String,
    currency: {
      type: String,
      default: "USD",
    },
    defaultPaymentTerms: {
      type: String,
      default: "Due on receipt",
    },
    bankDetails: {
      bankName: String,
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      iban: String,
      swiftCode: String,
    },
  },
  { timestamps: true }
);
```

### Client

```ts
const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    companyName: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    taxId: String,
    notes: String,
  },
  { timestamps: true }
);
```

### Invoice

```ts
const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Invoice",
    },
    issueDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        rate: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "partial", "overdue", "cancelled"],
      default: "draft",
    },
    paymentTerms: String,
    notes: String,
    termsAndConditions: String,
    pdfUrl: String,
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
```

### Payment

```ts
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "card", "upi", "paypal", "stripe", "razorpay"],
      required: true,
    },
    transactionId: String,
    notes: String,
  },
  { timestamps: true }
);
```

### Subscription

```ts
const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
    },
    provider: {
      type: String,
      enum: ["stripe", "razorpay"],
    },
    providerCustomerId: String,
    providerSubscriptionId: String,
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "inactive",
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);
```

## 5. API Routes

### Auth Routes

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/refresh-token
```

### User Routes

```txt
GET    /api/users/profile
PATCH  /api/users/profile
PATCH  /api/users/password
DELETE /api/users/account
POST   /api/users/avatar
```

### Business Routes

```txt
POST   /api/business
GET    /api/business
GET    /api/business/:id
PATCH  /api/business/:id
DELETE /api/business/:id
POST   /api/business/:id/logo
```

### Client Routes

```txt
POST   /api/clients
GET    /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id
GET    /api/clients/:id/invoices
```

### Invoice Routes

```txt
POST   /api/invoices
GET    /api/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id
DELETE /api/invoices/:id
POST   /api/invoices/:id/send
POST   /api/invoices/:id/download
POST   /api/invoices/:id/duplicate
PATCH  /api/invoices/:id/status
POST   /api/invoices/:id/mark-paid
POST   /api/invoices/:id/generate-pdf
```

### AI Invoice Routes

```txt
POST   /api/ai/generate-invoice
POST   /api/ai/improve-description
POST   /api/ai/suggest-items
POST   /api/ai/generate-email
```

Example AI input:

```json
{
  "clientName": "Acme Corp",
  "serviceDescription": "Built landing page and payment integration",
  "hoursWorked": 40,
  "rate": 30,
  "currency": "USD"
}
```

Example AI output:

```json
{
  "items": [
    {
      "description": "Landing page design and development",
      "quantity": 1,
      "rate": 800,
      "amount": 800
    },
    {
      "description": "Payment gateway integration",
      "quantity": 1,
      "rate": 400,
      "amount": 400
    }
  ],
  "notes": "Thank you for your business.",
  "termsAndConditions": "Payment due within 7 days."
}
```

### Payment Routes

```txt
POST   /api/payments
GET    /api/payments
GET    /api/payments/:id
PATCH  /api/payments/:id
DELETE /api/payments/:id
GET    /api/invoices/:invoiceId/payments
POST   /api/invoices/:invoiceId/payments
```

### Analytics Routes

```txt
GET /api/analytics/summary
GET /api/analytics/revenue
GET /api/analytics/invoices
GET /api/analytics/clients
GET /api/analytics/payments
GET /api/analytics/monthly-revenue
GET /api/analytics/outstanding-balance
```

Example summary response:

```json
{
  "totalRevenue": 12000,
  "totalInvoices": 45,
  "paidInvoices": 30,
  "unpaidInvoices": 10,
  "overdueInvoices": 5,
  "outstandingBalance": 3500
}
```

### Subscription Routes

```txt
GET    /api/subscriptions/plans
POST   /api/subscriptions/checkout
GET    /api/subscriptions/current
POST   /api/subscriptions/cancel
POST   /api/subscriptions/webhook
```

## 6. Backend Operations

### Auth Operations

```txt
Register user
Login user
Hash password
Generate JWT
Refresh token
Protect routes
Role-based access
Forgot password
Reset password
Email verification
```

### Business Operations

```txt
Create business profile
Update business info
Upload logo
Store bank details
Store tax details
Set default currency
Set default payment terms
```

### Client Operations

```txt
Add client
Update client
Delete client
List all clients
Search clients
View client invoice history
```

### Invoice Operations

```txt
Create manual invoice
Generate invoice using AI
Auto-generate invoice number
Calculate subtotal
Apply discount
Calculate tax
Calculate total
Calculate balance due
Save invoice as draft
Mark invoice as sent
Mark invoice as paid
Mark invoice as partially paid
Detect overdue invoices
Duplicate invoice
Download invoice PDF
Email invoice to client
Delete invoice
Filter invoices by status
Search invoices by client, name, or date
```

### Payment Operations

```txt
Record payment
Update invoice amountPaid
Update invoice balanceDue
Change invoice status automatically
Handle partial payments
Track payment method
Store transaction reference
```

### Analytics Operations

```txt
Total revenue
Monthly revenue
Pending payments
Overdue invoices
Paid vs unpaid invoices
Top clients
Recent invoices
Revenue by client
Revenue by month
Invoice status count
```

## 7. Invoice Calculation Logic

Invoice totals must always be calculated on the backend. Frontend calculations can be used for preview only.

```ts
const subtotal = items.reduce((sum, item) => {
  return sum + item.quantity * item.rate;
}, 0);

const discountAmount = discount || 0;
const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
const total = subtotal - discountAmount + taxAmount;
const balanceDue = total - amountPaid;
```

Status logic:

```ts
if (balanceDue === 0) {
  status = "paid";
} else if (amountPaid > 0) {
  status = "partial";
} else if (dueDate < today) {
  status = "overdue";
} else {
  status = "sent";
}
```

## 8. Recommended Folder Structure

### Backend

The current repository already follows a TypeScript version of this structure.

```txt
backend/
  src/
    config/
      db.ts
      cloudinary.ts
      nodemailer.ts
      redis.ts
      cors.ts

    models/
      user.model.ts
      business.model.ts
      client.model.ts
      invoice.model.ts
      payment.model.ts
      subscription.model.ts

    controllers/
      auth.controller.ts
      user.controller.ts
      businessInfo.controller.ts
      client.controller.ts
      invoice.controller.ts
      payment.controller.ts
      analytics.controller.ts
      ai.controller.ts
      subscription.controller.ts

    routes/
      auth.route.ts
      user.route.ts
      businessInfo.route.ts
      client.route.ts
      invoice.route.ts
      payment.route.ts
      analytics.route.ts
      ai.route.ts
      subscription.route.ts

    middlewares/
      requireAuth.middleware.ts
      error.middleware.ts
      validate.middleware.ts
      upload.middleware.ts
      rateLimit.middleware.ts

    services/
      ai.service.ts
      pdf.service.ts
      email.service.ts
      paymentGateway.service.ts
      invoiceNumber.service.ts

    schemas/
      auth.schema.ts
      businessInfo.schema.ts
      invoice.schema.ts
      env.schema.ts

    lib/
      auth.ts
      sendMail.ts
      uploadToCloudinary.ts
      deleteFromCloudinary.ts

    utils/
      ApiError.ts
      ApiResponse.ts
      calculateInvoice.ts
      generateToken.ts

    app.ts
    server.ts
```

### Frontend

```txt
frontend/
  src/
    app/
      auth/
      dashboard/
      invoices/
      clients/
      business/
      payments/
      settings/

    components/
      ui/
      invoice/
      dashboard/
      forms/

    services/
      api.ts
      authApi.ts
      invoiceApi.ts
      clientApi.ts

    hooks/
      useAuth.ts
      useInvoice.ts

    store/
      authStore.ts

    utils/
      formatCurrency.ts
      formatDate.ts
```

## 9. Dashboard Pages

```txt
/auth/login
/auth/register
/dashboard
/invoices
/invoices/new
/invoices/:id
/invoices/:id/edit
/clients
/clients/new
/clients/:id
/business
/payments
/settings
/billing
```

## 10. MVP Scope

Build the billing core first:

```txt
Register/Login
Business profile
Client CRUD
Manual invoice creation
Invoice PDF generation
Invoice list
Invoice status tracking
Payment recording
Dashboard summary
AI invoice generation
Email invoice
```

Do not start with subscriptions, advanced analytics, or complex automation. Those should follow once the invoice lifecycle is stable.

## 11. Critical Rules

These rules protect billing correctness and tenant isolation:

```txt
Every invoice must belong to one user.
Every client must belong to one user.
Never trust frontend calculations.
Always calculate totals on the backend.
Always validate invoice items.
Always protect routes with auth middleware.
Always check ownership before update/delete.
Never allow one user to access another user's invoice.
Store PDFs only after invoice data is valid.
Use webhooks for real payment confirmation.
```

## 12. Recommended Build Order

```txt
1. Setup backend server
2. Setup MongoDB models
3. Build auth
4. Build business profile
5. Build client CRUD
6. Build invoice CRUD
7. Add invoice calculation logic
8. Add PDF generation
9. Add email sending
10. Add payment recording
11. Add analytics dashboard
12. Add AI invoice generator
13. Add subscriptions
14. Add polish, filters, search, and settings
```

## 13. Implementation Priorities

The foundation is strongest when these concerns are handled early:

- Validate every request with Zod before it reaches business logic.
- Keep invoice calculation in a shared backend utility.
- Use MongoDB ownership filters such as `{ _id: invoiceId, user: req.user.id }`.
- Generate invoice PDFs only from persisted invoice records.
- Treat AI output as a draft and validate it before creating an invoice.
- Keep payment recording transactional where possible so invoice totals and payment records cannot drift.
- Add webhook signature verification before trusting Stripe or Razorpay events.
- Rate-limit auth, AI, email, and PDF generation endpoints.

## 14. Future Enhancements

After the MVP is stable, SmartBillr can expand with:

- Recurring invoices
- Invoice templates
- Multi-business support per user
- Team accounts and roles
- Tax presets by region
- Client portal
- Online payment links
- Advanced analytics exports
- Dunning reminders
- Audit logs
- Webhook integrations
