/**
 * Database Models - SQL Server
 * Contains all database operations for Users and Books
 */

const { executeQuery, executeStoredProcedure, sql } = require('../config/database');

/**
 * User Model - Database Operations
 */
class UserModel {
    /**
     * Get user by username
     */
    static async getByUsername(username) {
        try {
            const result = await executeStoredProcedure('sp_GetUserByUsername', {
                username: username
            });
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error in getByUsername:', error);
            throw error;
        }
    }

    /**
     * Create new user
     */
    static async createUser(username, passwordHash, role, email, fullName) {
        try {
            const result = await executeStoredProcedure('sp_RegisterUser', {
                username: username,
                passwordHash: passwordHash,
                role: role,
                email: email,
                fullName: fullName
            });
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    }

    /**
     * Check if username exists
     */
    static async usernameExists(username) {
        try {
            const result = await executeQuery(
                'SELECT COUNT(*) as count FROM Users WHERE username = @username',
                { username: username }
            );
            return result[0].count > 0;
        } catch (error) {
            console.error('Error in usernameExists:', error);
            throw error;
        }
    }
}

/**
 * Book Model - Database Operations
 */
class BookModel {
    /**
     * Get all books with availability status
     */
    static async getAllBooks() {
        try {
            const result = await executeStoredProcedure('sp_GetBooks');
            return result;
        } catch (error) {
            console.error('Error in getAllBooks:', error);
            throw error;
        }
    }

    /**
     * Get book by ID
     */
    static async getBookById(bookId) {
        try {
            const result = await executeQuery(
                `SELECT 
                    book_id AS id,
                    title,
                    author,
                    isbn,
                    category,
                    availability,
                    total_copies,
                    available_copies,
                    CASE 
                        WHEN availability = 'Y' AND available_copies > 0 THEN 'Available'
                        ELSE 'Not Available'
                    END AS availability_status,
                    published_year,
                    created_at,
                    updated_at
                FROM Books 
                WHERE book_id = @bookId`,
                { bookId: bookId }
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error in getBookById:', error);
            throw error;
        }
    }

    /**
     * Update book availability
     */
    static async updateAvailability(bookId, availability) {
        try {
            const result = await executeStoredProcedure('sp_UpdateBookAvailability', {
                book_id: bookId,
                availability: availability
            });
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error in updateAvailability:', error);
            throw error;
        }
    }

    /**
     * Create new book (Admin only)
     */
    static async createBook(title, author, isbn, category, totalCopies, publishedYear) {
        try {
            const result = await executeQuery(
                `INSERT INTO Books 
                    (title, author, isbn, category, total_copies, available_copies, published_year, availability)
                OUTPUT 
                    INSERTED.book_id AS id,
                    INSERTED.title,
                    INSERTED.author,
                    INSERTED.isbn,
                    INSERTED.category,
                    INSERTED.availability,
                    INSERTED.total_copies,
                    INSERTED.available_copies,
                    INSERTED.published_year
                VALUES 
                    (@title, @author, @isbn, @category, @totalCopies, @totalCopies, @publishedYear, 'Y')`,
                {
                    title: title,
                    author: author,
                    isbn: isbn,
                    category: category,
                    totalCopies: totalCopies,
                    publishedYear: publishedYear
                }
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error in createBook:', error);
            throw error;
        }
    }
}

module.exports = { UserModel, BookModel };