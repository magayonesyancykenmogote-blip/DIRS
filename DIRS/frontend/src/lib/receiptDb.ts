// Receipt storage and retrieval functions

export interface Receipt {
  _id?: string;
  receipt_id: string;
  order_no: string;
  invoice_no: string;
  resident_name: string;
  document_type: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  processed_by: string;
  folder: 'receipt'; // Always 'receipt' for organization
  createdAt?: string;
}

/**
 * Save a receipt to MongoDB
 */
export async function saveReceipt(receiptData: Omit<Receipt, '_id' | 'receipt_id' | 'folder' | 'createdAt'>): Promise<Receipt | null> {
  try {
    const receipt: Receipt = {
      ...receiptData,
      receipt_id: `RCP-${Date.now()}`,
      folder: 'receipt'
    };

    const response = await fetch('/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receipt),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to save receipt:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Receipt save error:', error);
    return null;
  }
}

/**
 * Fetch all receipts
 */
export async function fetchAllReceipts(): Promise<Receipt[]> {
  try {
    const response = await fetch('/api/receipts');
    if (!response.ok) {
      console.error('Failed to fetch receipts');
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return [];
  }
}

/**
 * Fetch receipts by date range
 */
export async function fetchReceiptsByDateRange(startDate: string, endDate: string): Promise<Receipt[]> {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    const response = await fetch(`/api/receipts/by-date?${params}`);
    if (!response.ok) {
      console.error('Failed to fetch receipts by date');
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch receipts by date:', error);
    return [];
  }
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(receiptId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/receipts/${receiptId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete receipt:', error);
    return false;
  }
}
