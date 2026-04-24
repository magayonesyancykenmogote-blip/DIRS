import Receipt from '../models/receiptModel.js';

// Create a new receipt
export const createReceipt = async (req, res) => {
  try {
    const { receipt_id, order_no, invoice_no, resident_name, document_type, amount, date, time, status, processed_by, folder } = req.body;

    const newReceipt = new Receipt({
      receipt_id,
      order_no,
      invoice_no,
      resident_name,
      document_type,
      amount,
      date,
      time,
      status,
      processed_by,
      folder: folder || 'receipt',
    });

    const savedReceipt = await newReceipt.save();
    res.status(201).json(savedReceipt);
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({ error: 'Failed to create receipt', details: error.message });
  }
};

// Get all receipts
export const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.status(200).json(receipts);
  } catch (error) {
    console.error('Fetch receipts error:', error);
    res.status(500).json({ error: 'Failed to fetch receipts', details: error.message });
  }
};

// Get receipt by ID
export const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    res.status(200).json(receipt);
  } catch (error) {
    console.error('Fetch receipt error:', error);
    res.status(500).json({ error: 'Failed to fetch receipt', details: error.message });
  }
};

// Get receipts by date range
export const getReceiptsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const receipts = await Receipt.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    res.status(200).json(receipts);
  } catch (error) {
    console.error('Fetch receipts by date error:', error);
    res.status(500).json({ error: 'Failed to fetch receipts by date', details: error.message });
  }
};

// Update a receipt
export const updateReceipt = async (req, res) => {
  try {
    const updatedReceipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedReceipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.status(200).json(updatedReceipt);
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({ error: 'Failed to update receipt', details: error.message });
  }
};

// Delete a receipt
export const deleteReceipt = async (req, res) => {
  try {
    const deletedReceipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!deletedReceipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.status(200).json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(500).json({ error: 'Failed to delete receipt', details: error.message });
  }
};
