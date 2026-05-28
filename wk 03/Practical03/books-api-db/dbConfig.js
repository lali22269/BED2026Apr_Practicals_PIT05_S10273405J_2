module.exports = {
  user: "booksapi_user", // Replace with your SQL Server login username
  password: "692222", // Replace with your SQL Server login password
  server: "DESKTOP-MA6R6RO\\SQLEXPRESS01",
  database: "bed_db",
  trustServerCertificate: true,
  options: {
    port: 1433, // Default SQL Server port
    connectionTimeout: 60000, // Connection timeout in milliseconds
  },
};