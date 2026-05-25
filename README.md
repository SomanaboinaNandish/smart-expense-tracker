# Smart Expense Tracker System

A production-ready, full-stack enterprise expense management application featuring a Java Spring Boot 3-tier backend, Spring Security + stateless JWT authentication, preloaded categories, monthly budget thresholds with real-time alerts, and a React.js dashboard styled with premium glassmorphism.

---

## 🏗️ System Architecture & Tech Stack Decisions

### 1. Why Spring Boot & Java 17?
- **Java 17+ features**: Standardized record mappings, improved stream performance, and modern switch statements.
- **Layered Architecture (3-Tier)**: Separates concerns into:
  - **Controller Layer**: Exposes REST interfaces, performs payload validation (`@Valid`), and handles HTTP statuses.
  - **Service Layer**: Orchestrates transactions, manages business workflows, and enforces data ownership checks.
  - **Repository Layer**: Coordinates database transactions using JPA/Hibernate specifications.
  - **DTO Layer**: Prevents database entities from leaking directly to the presentation layers, securing API contracts and reducing network payload overhead.

### 2. Authentication & Security
- **Stateless JWTs**: Decouples API endpoints from server session caches, making it ready to scale behind a Load Balancer.
- **BCrypt Hashing**: Implements salt iterations to protect user password digests from rainbow table attacks.
- **Role-Based Guards**: Admin paths are locked using Spring Security method guards (`@PreAuthorize("hasRole('ADMIN')")`).

### 3. Dual Database Strategy (H2 & MySQL)
- **Zero-Config H2 defaults**: Local profiles launch using in-memory H2 out-of-the-box, allowing quick testing without a local MySQL instance.
- **Production MySQL settings**: Active profiles switch JPA mappings to structured schemas and support database transactions using ACID constraints.

### 4. React & Custom Glassmorphic Styling
- **Custom CSS Design System**: Styled using custom glassmorphism, glowing accents, and responsive flex grid containers without external libraries.
- **Chart.js integration**: Visualizes monthly financial balances and breakdowns.

---

## 📁 Project Structure

```text
smart-expense-tracker/
├── backend/
│   ├── src/main/java/com/example/expensetracker/
│   │   ├── config/             # SecurityConfig, SwaggerConfig, DataInitializer
│   │   ├── controller/         # REST Controllers
│   │   ├── dto/                # Request/Response payloads
│   │   ├── entity/             # JPA Entities
│   │   ├── exception/          # Custom exceptions & handler
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JWT security filters & principal
│   │   └── service/            # Core business logic services
│   ├── src/main/resources/     # application.properties (H2/MySQL profiles)
│   ├── src/test/               # Mockito and JUnit tests
│   ├── pom.xml                 # Maven POM
│   └── Dockerfile              # Multi-stage Docker config
├── frontend/
│   ├── src/
│   │   ├── components/         # Navigation elements
│   │   ├── context/            # AuthContext (state & tokens)
│   │   ├── pages/              # Dashboards, login panels, admins
│   │   ├── services/           # API fetch wrappers
│   │   ├── App.jsx
│   │   └── index.css           # CSS design variables
│   ├── package.json            # Node modules
│   └── vite.config.js          # Vite server settings
├── database/
│   └── schema.sql              # MySQL DDL script
├── postman/
│   └── Expense_Tracker_Postman_Collection.json
└── docker-compose.yml          # Container orchestration script
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Java Development Kit (JDK) 17+**
- **Node.js 18+** & npm

---

### Step 1: Run the Backend

#### Option A: Quick Run using H2 (Default, In-Memory DB)
1. Open a terminal inside `backend/`.
2. Clean and run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will automatically start on `http://localhost:8080` with in-memory H2.*
   - **H2 Console**: `http://localhost:8080/h2-console` (Credentials: URL `jdbc:h2:mem:expensedb`, Username `sa`, Password `password`).
   - **Swagger Docs**: `http://localhost:8080/swagger-ui.html`

#### Option B: Run using MySQL
1. Ensure your MySQL server is running and create the schema:
   ```sql
   CREATE DATABASE expensedb;
   ```
2. Open `backend/src/main/resources/application.properties` and change the active profile:
   ```properties
   spring.profiles.active=mysql
   ```
3. (Optional) Set your MySQL environment variables:
   - `DB_HOST` (default: `localhost`)
   - `DB_PORT` (default: `3306`)
   - `DB_USER` (default: `root`)
   - `DB_PASSWORD` (default: `root`)
4. Start the application:
   ```bash
   ./mvnw spring-boot:run
   ```

---

### Step 2: Run the Frontend

1. Open a new terminal inside the `frontend/` directory.
2. Install npm modules:
   ```bash
   npm install
   ```
3. Launch the local dev server:
   ```bash
   npm run dev
   ```
4. Access the React app at the address shown (usually `http://localhost:5173`).

---

### Step 3: Test Accounts (Pre-Loaded Demo Data)

Your application starts with pre-loaded demo credentials:
1. **Standard User**:
   - **Email**: `user@expense.com`
   - **Password**: `user123`
2. **System Administrator**:
   - **Email**: `admin@expense.com`
   - **Password**: `admin123`

---

## 🐳 Docker Deployment Setup

You can launch the entire system (MySQL database + Spring Boot backend) with one command.

1. Generate a production package jar on your local host:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   cd ..
   ```
2. Build and launch the containers:
   ```bash
   docker compose up --build
   ```
   *The database will seed automatically using `./database/schema.sql`. The Spring Boot backend container will run on port `8080`.*

---

## 🛠️ REST API Specification

### Authentication Module
- `POST /api/auth/register` - Registers a new user.
- `POST /api/auth/login` - Authenticates credentials and returns a stateless JWT token.
- `GET /api/auth/profile` - Fetches authenticated user info.

### Expense Management Module
- `POST /api/expenses` - Records a new expense. Calculates budget warning limits.
- `GET /api/expenses` - Lists paginated, sorted, and filtered expenses.
- `GET /api/expenses/{id}` - Retrieves a specific record.
- `PUT /api/expenses/{id}` - Updates an expense.
- `DELETE /api/expenses/{id}` - Removes an expense.
- `GET /api/expenses/export` - Downloads an Excel-compatible CSV file of filtered expenses.

### Budget Management Module
- `POST /api/budget` - Configures or updates a monthly limit.
- `GET /api/budget` - Fetches active budget thresholds, current spent totals, remaining values, and progress percentages.

### Analytics Module
- `GET /api/analytics/summary` - Aggregates total spent, budget usage percentages, categories breakdowns, and monthly trends.

### Admin Module
- `GET /api/admin/stats` - Exposes system counts and platform spending volume.
- `GET /api/admin/users` - Lists registered accounts.
- `DELETE /api/admin/user/{id}` - Deletes user and cascades delete actions to related databases.
rights : nandishsomanaboina
**Answer**:
- `@Transactional` allows read/write operations. Hibernate disables read-only optimizations, performs dirty checking on entities, and flushes changes to the database on transaction completion.
- `@Transactional(readOnly = true)` optimizes read operations. Hibernate disables dirty-checking, preventing state tracking from using extra CPU cycles and memory. Additionally, it optimizes database transaction locks to improve read throughput.
