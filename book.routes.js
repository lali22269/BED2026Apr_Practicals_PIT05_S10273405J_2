/**
 * Book Routes
 * Handles book operations with authorization
 */

const express = require('express');
const router = express.Router();
const {
    getAllBooks,
    getBookById,
    updateBookAvailability,
    createBook
} = require('../controllers/book.controller');

const {
    verifyToken,
    isLibrarian,
    isMemberOrLibrarian
} = require('../middleware/auth.middleware');

// All book routes require authentication
router.use(verifyToken);

// Public for authenticated users (members and librarians)
router.get('/', isMemberOrLibrarian, getAllBooks);
router.get('/:bookId', isMemberOrLibrarian, getBookById);

// Librarian-only routes
router.put('/:bookId/availability', isLibrarian, updateBookAvailability);
router.post('/', isLibrarian, createBook);

module.exports = router;