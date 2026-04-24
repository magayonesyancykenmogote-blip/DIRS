import { Document } from "../models/documentModel.js";

export const getDocuments = async (req, res) => {
  try {
    const dateStr = req.query.date;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const all = req.query.all === 'true';
    let docs;

    if (all) {
      docs = await Document.find({}).sort({ createdAt: -1 });
    } else if (typeof startDate === 'string' && startDate.trim() !== '' && typeof endDate === 'string' && endDate.trim() !== '') {
      docs = await Document.find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ createdAt: -1 });
    } else if (typeof dateStr === 'string' && dateStr.trim() !== '') {
      docs = await Document.find({ date: dateStr }).sort({ createdAt: -1 });
    } else {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      docs = await Document.find({
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }).sort({ createdAt: -1 });
    }

    res.json({ count: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load documents" });
  }
};

export const createDocument = async (req, res) => {
  try {
    const {
      order_no,
      invoice_no,
      resident_name,
      document_type,
      amount,
      date,
      time,
      status,
      processed_by,
    } = req.body;

    const now = new Date();
    const fallbackDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fallbackTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!order_no || !invoice_no || !resident_name || !document_type || amount === undefined || amount === null || !status || !processed_by) {
      return res.status(400).json({ error: "Invalid transaction payload" });
    }

    const doc = await Document.create({
      order_no,
      invoice_no,
      resident_name,
      document_type,
      amount,
      date: date || fallbackDate,
      time: time || fallbackTime,
      status,
      processed_by,
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create document" });
  }
};
