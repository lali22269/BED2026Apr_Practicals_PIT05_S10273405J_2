// models/userModel.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

class UserModel {
    // CREATE - Create a new user
    static async createUser(user) {
        let pool = null;
        try {
            // Connect to the MSSQL database using your connection details
            pool = await sql.connect(dbConfig);
            
            // Create a SQL INSERT statement to insert the user data into the Users table
            const { username, email, password, firstName, lastName, role } = user;
            
            // Execute the query using the MSSQL library and handle any errors
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, password)
                .input('firstName', sql.NVarChar, firstName || null)
                .input('lastName', sql.NVarChar, lastName || null)
                .input('role', sql.NVarChar, role || 'user')
                .input('createdAt', sql.DateTime, new Date())
                .input('updatedAt', sql.DateTime, new Date())
                .query(`
                    INSERT INTO Users (username, email, password, firstName, lastName, role, createdAt, updatedAt)
                    OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.firstName, 
                           INSERTED.lastName, INSERTED.role, INSERTED.createdAt, INSERTED.updatedAt
                    VALUES (@username, @email, @password, @firstName, @lastName, @role, @createdAt, @updatedAt)
                `);
            
            // Retrieve the newly created user's information and return the user object
            return result.recordset[0];
            
        } catch (error) {
            console.error("Database error in createUser:", error);
            throw error;
        } finally {
            // Close the connection to the database
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // READ - Get all users
    static async getAllUsers() {
        let pool = null;
        try {
            // Connect to the MSSQL database
            pool = await sql.connect(dbConfig);
            
            // Create a SQL SELECT statement to retrieve all user data from the Users table
            const result = await pool.request()
                .query(`
                    SELECT id, username, email, firstName, lastName, role, 
                           createdAt, updatedAt 
                    FROM Users 
                    ORDER BY id
                `);
            
            // Return an array of user objects constructed from the retrieved data
            return result.recordset;
            
        } catch (error) {
            console.error("Database error in getAllUsers:", error);
            throw error;
        } finally {
            // Close the connection to the database
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // READ - Get user by ID
    static async getUserById(id) {
        let pool = null;
        try {
            // Connect to the MSSQL database
            pool = await sql.connect(dbConfig);
            
            // Create a SQL SELECT statement to retrieve a specific user by ID
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT id, username, email, firstName, lastName, role, 
                           createdAt, updatedAt 
                    FROM Users 
                    WHERE id = @id
                `);
            
            // Return the user object (or null if not found)
            return result.recordset.length > 0 ? result.recordset[0] : null;
            
        } catch (error) {
            console.error(`Database error in getUserById for ID ${id}:`, error);
            throw error;
        } finally {
            // Close the connection to the database
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // READ - Get user by username (Helper method)
    static async getUserByUsername(username) {
        let pool = null;
        try {
            pool = await sql.connect(dbConfig);
            
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .query(`
                    SELECT id, username, email, firstName, lastName, role, 
                           createdAt, updatedAt 
                    FROM Users 
                    WHERE username = @username
                `);
            
            return result.recordset.length > 0 ? result.recordset[0] : null;
            
        } catch (error) {
            console.error(`Database error in getUserByUsername for ${username}:`, error);
            throw error;
        } finally {
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // READ - Get user by email (Helper method)
    static async getUserByEmail(email) {
        let pool = null;
        try {
            pool = await sql.connect(dbConfig);
            
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query(`
                    SELECT id, username, email, firstName, lastName, role, 
                           createdAt, updatedAt 
                    FROM Users 
                    WHERE email = @email
                `);
            
            return result.recordset.length > 0 ? result.recordset[0] : null;
            
        } catch (error) {
            console.error(`Database error in getUserByEmail for ${email}:`, error);
            throw error;
        } finally {
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // UPDATE - Update user
    static async updateUser(id, updatedUser) {
        let pool = null;
        try {
            // Connect to the MSSQL database
            pool = await sql.connect(dbConfig);
            
            // First check if user exists
            const existingUser = await this.getUserById(id);
            if (!existingUser) {
                throw new Error(`User with ID ${id} not found`);
            }
            
            // Create a SQL UPDATE statement to update the user information
            const updates = [];
            const inputs = [
                { name: 'id', type: sql.Int, value: id },
                { name: 'updatedAt', type: sql.DateTime, value: new Date() }
            ];
            
            // Dynamically build update query based on provided fields
            const updatableFields = ['username', 'email', 'password', 'firstName', 'lastName', 'role'];
            
            updatableFields.forEach(field => {
                if (updatedUser[field] !== undefined && updatedUser[field] !== null) {
                    updates.push(`${field} = @${field}`);
                    inputs.push({ 
                        name: field, 
                        type: sql.NVarChar,
                        value: updatedUser[field] 
                    });
                }
            });
            
            if (updates.length === 0) {
                throw new Error('No fields provided for update');
            }
            
            updates.push('updatedAt = @updatedAt');
            
            // Execute the query using the MSSQL library and handle any errors
            const query = `
                UPDATE Users 
                SET ${updates.join(', ')}
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.firstName, 
                       INSERTED.lastName, INSERTED.role, INSERTED.createdAt, INSERTED.updatedAt
                WHERE id = @id
            `;
            
            const request = pool.request();
            inputs.forEach(param => {
                request.input(param.name, param.type, param.value);
            });
            
            const result = await request.query(query);
            
            if (result.recordset.length === 0) {
                throw new Error(`User with ID ${id} not found after update`);
            }
            
            // Return updated user information
            return {
                success: true,
                message: `User with ID ${id} updated successfully`,
                user: result.recordset[0]
            };
            
        } catch (error) {
            console.error(`Database error in updateUser for ID ${id}:`, error);
            throw error;
        } finally {
            // Close the connection to the database
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // DELETE - Delete user
    static async deleteUser(id) {
        let pool = null;
        try {
            // Connect to the MSSQL database
            pool = await sql.connect(dbConfig);
            
            // First check if user exists
            const existingUser = await this.getUserById(id);
            if (!existingUser) {
                throw new Error(`User with ID ${id} not found`);
            }
            
            // Create a SQL DELETE statement to delete the user with the specified ID
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Users WHERE id = @id');
            
            // Execute the query and handle any errors
            if (result.rowsAffected[0] === 0) {
                throw new Error(`User with ID ${id} could not be deleted`);
            }
            
            // Return a success message
            return {
                success: true,
                message: `User with ID ${id} deleted successfully`,
                deletedUser: existingUser
            };
            
        } catch (error) {
            console.error(`Database error in deleteUser for ID ${id}:`, error);
            throw error;
        } finally {
            // Close the connection to the database
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }

    // READ - Search users by username or email (Enhanced version)
    static async searchUsers(searchTerm) {
        let connection = null; // Declare connection outside try for finally access
        try {
            // Connect to the MSSQL database
            connection = await sql.connect(dbConfig);

            // Use parameterized query to prevent SQL injection
            // Search in username, email, firstName, and lastName fields
            const query = `
                SELECT id, username, email, firstName, lastName, role, 
                       createdAt, updatedAt 
                FROM Users
                WHERE username LIKE '%' + @searchTerm + '%'
                    OR email LIKE '%' + @searchTerm + '%'
                    OR firstName LIKE '%' + @searchTerm + '%'
                    OR lastName LIKE '%' + @searchTerm + '%'
                ORDER BY username
            `;

            const request = connection.request();
            request.input("searchTerm", sql.NVarChar, searchTerm); // Explicitly define type
            const result = await request.query(query);
            
            // Return the array of user objects
            return result.recordset;
            
        } catch (error) {
            console.error("Database error in searchUsers:", error); // More specific error logging
            throw error; // Re-throw the error for the controller to handle
        } finally {
            // Close the connection to the database
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing connection after searchUsers:", err);
                }
            }
        }
    }

    // READ - Get users with their books (Many-to-Many relationship)
    static async getUsersWithBooks() {
        let connection = null;
        try {
            // Connect to the MSSQL database
            connection = await sql.connect(dbConfig);

            // SQL query to join Users, UserBooks, and Books tables
            const query = `
                SELECT u.id AS user_id, u.username, u.email, 
                       b.id AS book_id, b.title, b.author
                FROM Users u
                LEFT JOIN UserBooks ub ON ub.user_id = u.id
                LEFT JOIN Books b ON ub.book_id = b.id
                ORDER BY u.username, b.title;
            `;

            const result = await connection.request().query(query);

            // Explanation of 'result' object and 'result.recordset':
            // The mssql package returns query results in a 'result' object.
            // 'result.recordset' is an array of JavaScript objects.
            // Each object in 'result.recordset' represents a row from the SQL query's output.
            // The keys of these objects correspond to the column aliases (e.g., 'user_id', 'username', 'book_id', 'title', 'author')
            // defined in the SQL SELECT statement.
            // For example, multiple rows from the SQL query like:
            // user_id | username | email             | book_id | title                         | author
            // --------|----------|-------------------|---------|-------------------------------|-----------------
            // 1       | user1    | user1@example.com | 1       | To Kill a Mockingbird         | Harper Lee
            // 1       | user1    | user1@example.com | 2       | The Hitchhiker's Guide to the Galaxy | Douglas Adams
            //
            // would be represented in 'result.recordset' as an array of objects:
            // [
            //   {
            //     user_id: 1,
            //     username: 'user1',
            //     email: 'user1@example.com',
            //     book_id: 1,
            //     title: 'To Kill a Mockingbird',
            //     author: 'Harper Lee'
            //   },
            //   {
            //     user_id: 1,
            //     username: 'user1',
            //     email: 'user1@example.com',
            //     book_id: 2,
            //     title: 'The Hitchhiker\'s Guide to the Galaxy',
            //     author: 'Douglas Adams'
            //   }
            // ]
            //
            // If a user has multiple books, there will be multiple rows for that user,
            // each with the same user information but different book information.
            // The subsequent JavaScript code then groups these rows by user.

            // Group users and their books
            const usersWithBooks = {};
            for (const row of result.recordset) {
                const userId = row.user_id;
                
                // If user doesn't exist in the map, create a new entry
                if (!usersWithBooks[userId]) {
                    usersWithBooks[userId] = {
                        id: userId,
                        username: row.username,
                        email: row.email,
                        books: [],
                    };
                }
                
                // Only add book if book_id is not null (for users with no books)
                if (row.book_id !== null) {
                    usersWithBooks[userId].books.push({
                        id: row.book_id,
                        title: row.title,
                        author: row.author,
                    });
                }
            }

            // Convert the object back to an array and return
            return Object.values(usersWithBooks);
            
        } catch (error) {
            console.error("Database error in getUsersWithBooks:", error);
            throw error;
        } finally {
            // Close the connection to the database
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing connection after getUsersWithBooks:", err);
                }
            }
        }
    }

    // Helper: Get user count
    static async getUserCount() {
        let pool = null;
        try {
            pool = await sql.connect(dbConfig);
            
            const result = await pool.request()
                .query('SELECT COUNT(*) as count FROM Users');
            
            return result.recordset[0].count;
            
        } catch (error) {
            console.error("Database error in getUserCount:", error);
            throw error;
        } finally {
            if (pool) {
                try {
                    await pool.close();
                } catch (err) {
                    console.error("Error closing connection:", err);
                }
            }
        }
    }
}

module.exports = UserModel;