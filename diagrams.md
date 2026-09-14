# Terrava Architecture Diagrams

## Logical View Diagram

The Logical View shows the static structure of the Terrava system, including components, modules, and their relationships.

```mermaid
graph TB
    subgraph "Frontend Layer (React)"
        A[App.jsx]
        B[Pages]
        C[Components]
        D[Context Providers]
        E[AuthContext]
        F[NotificationContext]
        G[ToastContext]
        
        B --> B1[Home]
        B --> B2[Landing]
        B --> B3[Login/Register]
        B --> B4[Dashboard]
        B --> B5[AdminDashboard]
        B --> B6[CreateListing]
        B --> B7[ListingDetail]
        B --> B8[Transactions]
        B --> B9[BlockchainExplorer]
        B --> B10[MapExplore]
        
        C --> C1[Navbar]
        C --> C2[Sidebar]
        C --> C3[AdminSidebar]
        C --> C4[MapView]
        C --> C5[CreateListingForm]
        C --> C6[RecordPaymentModal]
        
        D --> E
        D --> F
        D --> G
    end
    
    subgraph "API Layer (Express Routes)"
        H[Auth Routes]
        I[Listing Routes]
        J[Transaction Routes]
        K[Blockchain Routes]
        L[Admin Routes]
        M[Inquiry Routes]
        N[Notification Routes]
        O[Installment Routes]
    end
    
    subgraph "Controller Layer"
        P[Auth Controller]
        Q[Listing Controller]
        R[Transaction Controller]
        S[Blockchain Controller]
        T[Admin Controller]
        U[Inquiry Controller]
        V[Notification Controller]
        W[Installment Controller]
    end
    
    subgraph "Business Logic Layer"
        X[Blockchain Service]
        Y[Installment Service]
        Z[Password Utility]
        AA[JWT Utility]
        AB[Email Utility]
        AC[EXIF Utility]
        AD[Ethereum Utility]
    end
    
    subgraph "Data Layer (Sequelize Models)"
        AE[User Model]
        AF[LandListing Model]
        AG[Transaction Model]
        AH[Block Model]
        AI[Inquiry Model]
        AJ[Favorite Model]
        AK[Notification Model]
        AL[InstallmentAccount Model]
        AM[MonthlyAmortization Model]
    end
    
    subgraph "Database Layer"
        AN[(PostgreSQL)]
        AO[(SQLite - Backup)]
    end
    
    subgraph "External Services"
        AP[Google OAuth]
        AQ[Ethereum Sepolia]
        AR[Nodemailer SMTP]
    end
    
    subgraph "Background Jobs"
        AS[Overdue Payment Cron]
    end
    
    %% Frontend to API
    B --> H
    B --> I
    B --> J
    B --> K
    B --> L
    B --> M
    B --> N
    B --> O
    
    %% API to Controllers
    H --> P
    I --> Q
    J --> R
    K --> S
    L --> T
    M --> U
    N --> V
    O --> W
    
    %% Controllers to Business Logic
    P --> Z
    P --> AA
    Q --> AC
    R --> X
    R --> Y
    R --> AD
    T --> AB
    
    %% Controllers to Models
    P --> AE
    Q --> AF
    R --> AG
    S --> AH
    U --> AI
    V --> AK
    W --> AL
    W --> AM
    
    %% Models to Database
    AE --> AN
    AF --> AN
    AG --> AN
    AH --> AN
    AI --> AN
    AJ --> AN
    AK --> AN
    AL --> AN
    AM --> AN
    
    %% External Integrations
    P --> AP
    R --> AQ
    T --> AR
    
    %% Background Jobs
    AS --> W
    AS --> AN
    
    %% Context usage
    B --> E
    B --> F
    B --> G
```

## Runtime View Diagram

The Runtime View shows the dynamic behavior and interaction patterns of the system during key operations.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Controller
    participant Blockchain
    participant Database
    participant Ethereum
    
    %% User Registration Flow
    User->>Frontend: Submit Registration Form
    Frontend->>API: POST /api/auth/register
    API->>Controller: authController.register()
    Controller->>Database: Check existing user
    Database-->>Controller: User not found
    Controller->>Database: Create user with hashed password
    Database-->>Controller: User created
    Controller->>Controller: Generate JWT token
    Controller-->>API: {user, token}
    API-->>Frontend: 200 OK with user data
    Frontend->>Frontend: Store token in localStorage
    Frontend-->>User: Redirect to Dashboard
    
    %% Land Listing Creation Flow
    User->>Frontend: Create Land Listing
    Frontend->>API: POST /api/listings (multipart/form-data)
    API->>Controller: listingController.create()
    Controller->>Controller: Validate polygon GeoJSON
    Controller->>Controller: Extract EXIF geotags from photos
    Controller->>Database: Create LandListing
    Database-->>Controller: Listing created
    Controller->>Controller: Notify all admins
    Controller-->>API: Listing data
    API-->>Frontend: 200 OK
    Frontend-->>User: Success message
    
    %% Payment Recording Flow
    User->>Frontend: Record Payment
    Frontend->>API: POST /api/transactions
    API->>Controller: transactionController.create()
    Controller->>Database: Verify listing exists
    Database-->>Controller: Listing found
    Controller->>Database: Create Transaction record
    Database-->>Controller: Transaction created
    Controller->>Blockchain: Load blockchain from DB
    Blockchain->>Database: Fetch all blocks
    Database-->>Blockchain: Block data
    Controller->>Blockchain: Add new block
    Blockchain->>Blockchain: Mine block (SHA-256)
    Blockchain->>Database: Persist new block
    Database-->>Blockchain: Block saved
    Blockchain-->>Controller: Block added
    Controller->>Database: Update listing status
    Controller->>Controller: Create/Update installment account
    Controller->>Controller: Send notifications to buyer & seller
    Controller->>Ethereum: Record payment on Sepolia
    Ethereum-->>Controller: Transaction hash
    Controller->>Database: Update transaction with eth_tx_hash
    Controller-->>API: Transaction with blockchain data
    API-->>Frontend: 200 OK
    Frontend-->>User: Payment recorded successfully
    
    %% Blockchain Validation Flow
    User->>Frontend: View Blockchain Explorer
    Frontend->>API: GET /api/blockchain/validate
    API->>Controller: blockchainController.validate()
    Controller->>Blockchain: Load chain
    Blockchain->>Database: Fetch all blocks
    Database-->>Blockchain: Block data
    Blockchain->>Blockchain: Validate chain integrity
    Blockchain->>Blockchain: Check hash linkage
    Blockchain->>Blockchain: Verify genesis block
    Blockchain-->>Controller: isValid: true/false
    Controller-->>API: Validation result
    API-->>Frontend: Chain status
    Frontend-->>User: Display blockchain visualization
    
    %% Admin Verification Flow
    User->>Frontend: Verify Listing
    Frontend->>API: PUT /api/listings/:id (is_verified: true)
    API->>Controller: listingController.update()
    Controller->>Database: Fetch listing
    Database-->>Controller: Listing data
    Controller->>Database: Update is_verified = true
    Controller->>Controller: Notify seller
    Controller-->>API: Updated listing
    API-->>Frontend: 200 OK
    Frontend-->>User: Listing verified
```

## Use Case View Diagram

The Use Case View shows the functional requirements from the perspective of different user roles.

```mermaid
graph TB
    subgraph "Actors"
        Admin((Admin))
        Seller((Seller))
        Buyer((Buyer))
        Guest((Guest))
    end
    
    subgraph "Authentication Use Cases"
        UC1[Register Account]
        UC2[Login]
        UC3[Google OAuth Login]
        UC4[Logout]
        UC5[Change Password]
        UC6[Update Profile]
        UC7[Upload Profile Photo]
    end
    
    subgraph "Land Listing Use Cases"
        UC8[Browse Land Listings]
        UC9[View Listing Details]
        UC10[Search & Filter Listings]
        UC11[View on Interactive Map]
        UC12[Compare Listings]
        UC13[Add to Favorites]
        UC14[Create Land Listing]
        UC15[Edit Land Listing]
        UC16[Delete Land Listing]
        UC17[Assign Buyer to Listing]
        UC18[Unassign Buyer]
    end
    
    subgraph "Transaction Use Cases"
        UC19[Send Inquiry to Seller]
        UC20[Reply to Inquiry]
        UC21[Record Payment]
        UC22[View Transaction History]
        UC23[View My Lands]
        UC24[View Sales Report]
    end
    
    subgraph "Installment Use Cases"
        UC25[View Installment Account]
        UC26[View Payment Schedule]
        UC27[Track Payment Progress]
    end
    
    subgraph "Blockchain Use Cases"
        UC28[View Blockchain Explorer]
        UC29[Validate Chain Integrity]
        UC30[View Block Details]
        UC31[Unlock Blockchain Ledger]
    end
    
    subgraph "Admin Use Cases"
        UC32[View Admin Dashboard]
        UC33[Verify Listings]
        UC34[Manage Users]
        UC35[Monitor Branches]
        UC36[View Verifications Queue]
        UC37[View Global Analytics]
        UC38[Manage System Logs]
    end
    
    subgraph "Notification Use Cases"
        UC39[View Notifications]
        UC40[Mark Notification as Read]
    end
    
    %% Guest access
    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC8
    Guest --> UC9
    Guest --> UC10
    Guest --> UC11
    
    %% Buyer access
    Buyer --> UC1
    Buyer --> UC2
    Buyer --> UC3
    Buyer --> UC4
    Buyer --> UC5
    Buyer --> UC6
    Buyer --> UC7
    Buyer --> UC8
    Buyer --> UC9
    Buyer --> UC10
    Buyer --> UC11
    Buyer --> UC12
    Buyer --> UC13
    Buyer --> UC19
    Buyer --> UC20
    Buyer --> UC22
    Buyer --> UC23
    Buyer --> UC25
    Buyer --> UC26
    Buyer --> UC27
    Buyer --> UC39
    Buyer --> UC40
    
    %% Seller access
    Seller --> UC1
    Seller --> UC2
    Seller --> UC3
    Seller --> UC4
    Seller --> UC5
    Seller --> UC6
    Seller --> UC7
    Seller --> UC8
    Seller --> UC9
    Seller --> UC10
    Seller --> UC11
    Seller --> UC12
    Seller --> UC14
    Seller --> UC15
    Seller --> UC16
    Seller --> UC17
    Seller --> UC18
    Seller --> UC19
    Seller --> UC20
    Seller --> UC21
    Seller --> UC22
    Seller --> UC24
    Seller --> UC25
    Seller --> UC26
    Seller --> UC27
    Seller --> UC39
    Seller --> UC40
    
    %% Admin access
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28
    Admin --> UC29
    Admin --> UC30
    Admin --> UC31
    Admin --> UC32
    Admin --> UC33
    Admin --> UC34
    Admin --> UC35
    Admin --> UC36
    Admin --> UC37
    Admin --> UC38
    Admin --> UC39
    Admin --> UC40
```

## Component Relationships

```mermaid
erDiagram
    USER ||--o{ LAND_LISTING : "creates (seller)"
    USER ||--o{ LAND_LISTING : "assigned (buyer)"
    USER ||--o{ TRANSACTION : "initiates (buyer)"
    USER ||--o{ TRANSACTION : "receives (seller)"
    USER ||--o{ TRANSACTION : "records (admin/seller)"
    USER ||--o{ INQUIRY : "sends (buyer)"
    USER ||--o{ INQUIRY : "receives (seller)"
    USER ||--o{ FAVORITE : "saves"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ INSTALLMENT_ACCOUNT : "owns (buyer)"
    USER ||--o{ INSTALLMENT_ACCOUNT : "manages (seller)"
    
    LAND_LISTING ||--o{ TRANSACTION : "has"
    LAND_LISTING ||--o{ INQUIRY : "receives"
    LAND_LISTING ||--o{ FAVORITE : "saved in"
    LAND_LISTING ||--o{ INSTALLMENT_ACCOUNT : "has"
    
    TRANSACTION ||--|| BLOCK : "recorded in"
    
    INSTALLMENT_ACCOUNT ||--o{ MONTHLY_AMORTIZATION : "has schedule"
    
    USER {
        integer id PK
        string email UK
        string password_hash
        string full_name
        enum role "buyer/seller/admin"
        string branch
        string phone
        date birthdate
        text address
        string photo_url
        boolean archived
    }
    
    LAND_LISTING {
        integer id PK
        integer seller_id FK
        integer assigned_buyer_id FK
        string title
        text description
        decimal price
        decimal area_sqm
        enum status "available/reserved/sold"
        string location_text
        string branch
        jsonb polygon_geojson
        jsonb photos
        jsonb photo_geotags
        boolean is_verified
        boolean archived
        string zoning_classification
        string land_title_status
        decimal total_contract_price
        decimal reservation_fee
        string minimum_down_payment_pct
        boolean cash_term_enabled
        decimal cash_term_discount_pct
        boolean in_house_financing_enabled
        integer in_house_max_term_years
        decimal in_house_interest_rate_pct
        boolean bank_government_loan_enabled
        decimal penalty_rate_pct
        decimal monthly_payment_amount
        string terrain_topography
        string lot_configuration
        jsonb utilities
        string lot_block_number
    }
    
    TRANSACTION {
        integer id PK
        integer listing_id FK
        integer buyer_id FK
        integer seller_id FK
        decimal amount
        enum payment_method "bank_transfer/cash/check/ewallet"
        string reference_number
        enum status "pending/verified/rejected"
        integer recorded_by FK
        string eth_tx_hash
    }
    
    BLOCK {
        integer id PK
        integer index
        timestamp timestamp
        integer transaction_id FK
        text transaction_data
        string previous_hash
        string hash
        integer nonce
    }
    
    INQUIRY {
        integer id PK
        integer listing_id FK
        integer buyer_id FK
        text message
        enum status "pending/replied/closed"
    }
    
    FAVORITE {
        integer id PK
        integer user_id FK
        integer listing_id FK
    }
    
    NOTIFICATION {
        integer id PK
        integer user_id FK
        string title
        text message
        string type
        jsonb data
        boolean read
    }
    
    INSTALLMENT_ACCOUNT {
        integer id PK
        integer listing_id FK
        integer buyer_id FK
        integer seller_id FK
        decimal total_amount
        decimal paid_amount
        decimal remaining_balance
        enum status "active/completed/defaulted"
        date start_date
        date maturity_date
    }
    
    MONTHLY_AMORTIZATION {
        integer id PK
        integer installment_account_id FK
        integer month_number
        date due_date
        decimal amount
        enum status "pending/paid/overdue/defaulted"
        decimal penalty_amount
    }
```

## Technology Stack Summary

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Maps**: Leaflet (GIS integration)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context API
- **Authentication**: JWT tokens stored in localStorage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Databases**: PostgreSQL (primary), SQLite (backup)
- **Authentication**: bcryptjs for password hashing, JWT for tokens
- **File Upload**: Multer with EXIF extraction
- **Email**: Nodemailer
- **Scheduling**: node-cron for overdue payment checks

### Blockchain
- **Private Chain**: Custom SHA-256 linked blockchain stored in PostgreSQL
- **Public Chain**: Ethereum Sepolia testnet integration
- **Smart Contracts**: Hardhat for deployment
- **Consensus**: Proof-of-Work (mining difficulty: 2)

### Key Features
- Multi-branch land management (6 branches)
- Role-based access control (buyer, seller, admin)
- GIS-based land mapping with polygon boundaries
- Photo geotagging for verification
- Installment payment tracking with amortization schedules
- Real-time notifications
- Blockchain payment verification
- Admin dashboard with analytics
