/**
 * Book Controller
 * Handles book operations with authorization
 */

const { BookModel } = require('../models/database.model');

/**
 * Get all books with availability
 * Accessible by both members and librarians
 * GET /books
 */
async function getAllBooks(req, res) {
    try {
        const books = await BookModel.getAllBooks();

        res.json({
            success: true,
            count: books.length,
            data: books
        });

    } catch (error) {
        console.error('Get all books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books',
            error: error.message
        });
    }
}

/**
 * Get book by ID
 * Accessible by both members and librarians
 * GET /books/:id
 */
async function getBookById(req, res) {
    try {
        const { bookId } = req.params;
        const book = await BookModel.getBookById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            data: book
        });

    } catch (error) {
        console.error('Get book by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch book',
            error: error.message
        });
    }
}

/**
 * Update book availability
 * Accessible only by librarians
 * PUT /books/:bookId/availability
 */
async function updateBookAvailability(req, res) {
    try {
        const { bookId } = req.params;
        const { availability } = req.body;

        // Validate availability
        if (!availability || !['Y', 'N'].includes(availability.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Availability must be "Y" or "N"'
            });
        }

        // Check if book exists
        const existingBook = await BookModel.getBookById(bookId);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Update availability
        const updatedBook = await BookModel.updateAvailability(
            bookId,
            availability.toUpperCase()
        );

        if (!updatedBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found after update'
            });
        }

        res.json({
            success: true,
            message: 'Book availability updated successfully',
            data: updatedBook
        });

    } catch (error) {
        console.error('Update book availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update book availability',
            error: error.message
        });
    }
}

/**
 * Create new book (Librarian only)
 * POST /books
 */
async function createBook(req, res) {
    try {
        const { title, author, isbn, category, totalCopies, publishedYear } = req.body;

        // Validate required fields
        if (!title || !author) {
            return res.status(400).json({
                success: false,
                message: 'Title and author are required'
            });
        }

        const newBook = await BookModel.createBook(
            title,
            author,
            isbn,
            category,
            totalCopies || 1,
            publishedYear
        );

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: newBook
        });

    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create book',
            error: error.message
        });
    }
}

module.exports = {
    getAllBooks,
    getBookById,
    updateBookAvailability,
    createBook
};