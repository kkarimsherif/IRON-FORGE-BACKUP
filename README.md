# IRON FORGE - Fitness Website and E-commerce Platform

IRON FORGE is a comprehensive fitness website and e-commerce platform that allows users to explore gym memberships, purchase fitness products, calculate BMI, and manage their fitness journey.

## Features

- **Membership Management**: View and purchase different membership plans
- **E-commerce**: Browse and purchase fitness products
- **BMI Calculator**: Calculate and track Body Mass Index
- **User Dashboard**: Manage profile, orders, and fitness progress
- **Payment Integration**: Secure checkout process with multiple payment options
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, EJS (Embedded JavaScript Templates)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Paymob integration (configurable)

## Project Structure

The project follows the MVC (Model-View-Controller) architecture:

```
iron-forge/
├── public/              # Static files (CSS, JS, images)
├── src/                 # Source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── views/               # EJS templates
│   └── partials/        # Reusable template parts
├── logs/                # Application logs
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
├── README.md            # Project documentation
└── server.js            # Application entry point
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/iron-forge.git
   cd iron-forge
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.

4. Start the development server:
   ```
   npm run dev
   ```

5. Visit `http://localhost:5003` in your browser.

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm run seed`: Seed the database with sample data
- `npm test`: Run tests

## License

This project is licensed under the ISC License.

## Contributors

- IRON FORGE Team

## Database Setup Instructions

Follow these steps to set up the MongoDB Atlas database connection:

### Option 1: Interactive Setup (Recommended)

Run the interactive setup tool that will guide you through the process:

```bash
node create-new-connection.js
```

This tool will:
1. Walk you through creating a new MongoDB Atlas user
2. Guide you to configure network access
3. Test the connection automatically
4. Create all necessary configuration files

### Option 2: Manual Configuration

If you prefer to set up the database manually:

1. **Create MongoDB Atlas User**:
   - Login to [MongoDB Atlas](https://cloud.mongodb.com)
   - Navigate to "Database Access"
   - Create a new user with these exact credentials:
     - Username: `ironforge`
     - Password: `IronForge2024`
     - User Privileges: "Atlas admin"

2. **Configure Network Access**:
   - Navigate to "Network Access" in MongoDB Atlas
   - Add a new IP address: `0.0.0.0/0` (Allow from anywhere)

3. **Create/Update `.env` File**:
   - Create a file named `.env` in the project root
   - Add this content:
   ```
   MONGODB_URI=mongodb+srv://ironforge:IronForge2024@ironforgedb.uktvahd.mongodb.net/IronForgeDB?retryWrites=true&w=majority
   PORT=5003
   CLIENT_URL=http://localhost:3000
   ```

4. **Run the Diagnostic Tool**:
   ```bash
   node check-all-configs.js
   ```

5. **Start the Application**:
   ```bash
   node final-app.js
   ```

## Troubleshooting

If you're encountering database connection issues:

1. **Run the Diagnostic Tool**:
   ```bash
   node check-all-configs.js
   ```

2. **Verify User Credentials**:
   - Make sure the MongoDB Atlas user exists with exact username/password
   - Check that the user has "Atlas admin" privileges

3. **Check Network Access**:
   - Verify that `0.0.0.0/0` is in the allowed IP addresses
   - Make sure the network access status is "Active"

4. **Connection String Format**:
   - The connection string should be in this format:
   ```
   mongodb+srv://ironforge:IronForge2024@ironforgedb.uktvahd.mongodb.net/IronForgeDB?retryWrites=true&w=majority
   ```

5. **Try the Interactive Setup**:
   ```bash
   node create-new-connection.js
   ```

## API Endpoints

Once the server is running, the following endpoints are available:

- `GET /` - Welcome message and server status
- `GET /health` - Health check endpoint
- `GET /api/auth/...` - Authentication endpoints
- `GET /api/users/...` - User management endpoints
- `GET /api/classes/...` - Gym classes endpoints
- `GET /api/products/...` - Product catalog endpoints
- `GET /api/orders/...` - Order management endpoints
- `GET /api/cart/...` - Shopping cart endpoints
- `GET /api/admin/...` - Admin panel endpoints
- `GET /api/reviews/...` - Review management endpoints
- `GET /api/notifications/...` - Notification endpoints

## Running the Application

After setting up the database, start the application:

```bash
node final-app.js
```

The server will run on port 5003 by default (http://localhost:5003). 