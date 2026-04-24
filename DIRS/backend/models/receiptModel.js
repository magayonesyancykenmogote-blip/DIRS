import mongoose from 'mongoose';

const ReceiptSchema = new mongoose.Schema({
  receipt_id: { type: String, required: true, unique: true },
  order_no: { type: String, required: true },
  invoice_no: { type: String, required: true },
  resident_name: { type: String, required: true },
  document_type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, required: true },
  processed_by: { type: String, required: true },
  folder: { type: String, default: 'receipt' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Receipt', ReceiptSchema);
