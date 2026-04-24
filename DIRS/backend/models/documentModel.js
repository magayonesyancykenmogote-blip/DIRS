import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    order_no: { type: String, required: true, trim: true },
    invoice_no: { type: String, required: true, trim: true },
    resident_name: { type: String, required: true, trim: true },
    document_type: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, required: true, trim: true },
    processed_by: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
