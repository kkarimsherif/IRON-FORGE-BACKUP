# MongoDB Atlas Setup Guide for Iron Forge

This guide will help you set up MongoDB Atlas for your Iron Forge application to store user data when they register or log in.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account if you don't have one already.
2. After signing up and logging in, click on "Build a Database".
3. Choose the "FREE" tier (M0) and select your preferred cloud provider (AWS, Google Cloud, or Azure) and region closest to your users.
4. Click "Create" to create your cluster.

## Step 2: Set Up Database Access

1. While your cluster is being created, click on "Database Access" in the left sidebar.
2. Click "Add New Database User".
3. Choose "Password" as the authentication method.
4. Enter a username and password. **Remember these credentials as you'll need them for your application**.
5. Under "Database User Privileges", choose "Atlas admin" for simplicity.
6. Click "Add User" to create the database user.

## Step 3: Set Up Network Access

1. Click on "Network Access" in the left sidebar.
2. Click "Add IP Address".
3. For development purposes, you can click "Allow Access from Anywhere" (not recommended for production).
4. Click "Confirm" to save the IP access list entry.

## Step 4: Get Your Connection String

1. Go back to "Database" in the left sidebar.
2. Click "Connect" on your cluster.
3. Choose "Connect your application".
4. Select "Node.js" as your driver and the appropriate version.
5. Copy the connection string. It will look something like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Important**: For the setup script, you need either:
   - The individual parts (username, password, and cluster URL)
   - OR the full connection string

   If using the cluster URL only, it should be in the format: `cluster0.abcde.mongodb.net`
   
   If using the full connection string, provide the entire string as shown above.

## Step 5: Set Up Your Application

### Option 1: Using the Setup Script

1. Run the setup script we created:
   ```
   node setup-mongodb-atlas.js
   ```
2. Choose whether you want to enter the full connection string or the individual parts.
3. Follow the prompts to enter your MongoDB Atlas credentials.
4. The script will create a `.env` file with your connection string and test the connection.

### Option 2: Manual Setup

1. Create a `.env` file in the root of your project with the following content:
   ```
   # Server Configuration
   PORT=5003
   NODE_ENV=development

   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/iron-forge?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d

   # Email Configuration (optional for now)
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@ironforge.com
   ```
2. Replace `<username>`, `<password>`, and `<cluster>` with your actual MongoDB Atlas credentials.
3. Generate a random string for `JWT_SECRET` (you can use an online generator or create a random string).

## Step 6: Start Your Application

1. Install the required dependencies if you haven't already:
   ```
   npm install dotenv mongoose
   ```
2. Start your application:
   ```
   npm start
   ```

## Verify Your Setup

1. Register a new user on your website.
2. Go to MongoDB Atlas, click on "Browse Collections" for your cluster.
3. You should see a database named "iron-forge" with a collection named "users" containing your registered user.

## Troubleshooting

If you encounter any issues:

1. **Connection Error**: Make sure your MongoDB Atlas username, password, and cluster URL are correct in your `.env` file.
2. **Network Error**: Ensure your IP address is allowed in the Network Access settings.
3. **Authentication Error**: Check that your database user has the correct permissions.
4. **URI Format Error**: If you see "mongodb+srv URI cannot have port number", make sure you're only using the hostname part of the cluster URL (e.g., `cluster0.abcde.mongodb.net`) and not the full URL with protocol.

For more help, refer to the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/). 