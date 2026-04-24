import express from 'express';
import * as receiptController from '../controllers/receiptController.js';

const router = express.Router();

// Create a new receipt
router.post('/', receiptController.createReceipt);

// Get all receipts
router.get('/', receiptController.getAllReceipts);

// Get receipt by ID
router.get('/:id', receiptController.getReceiptById);

// Get receipts by date range
router.get('/by-date', receiptController.getReceiptsByDateRange);

// Update a receipt
router.put('/:id', receiptController.updateReceipt);

// Delete a receipt
router.delete('/:id', receiptController.deleteReceipt);

export default router;
