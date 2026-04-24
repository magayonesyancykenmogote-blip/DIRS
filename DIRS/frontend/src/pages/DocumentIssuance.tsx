import { useState, useRef, useEffect } from 'react'; // Added useRef
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getNextInvoiceNumber } from '../lib/transactionDb';
import { saveReceipt } from '../lib/receiptDb';
import { getLocalISODate } from '../lib/dateUtils';

// Import Constants
import { getDocumentTypes, DocumentType } from '../constants/documentTypes';

// Import Modular Components
import { Step1Resident, Resident } from '../components/issuance/Step1Resident';
import { Step2Document } from '../components/issuance/Step2Document';
import { Step3Details } from '../components/issuance/Step3Details';
import { Step4Payment } from '../components/issuance/Step4Payment';
import { Step5Preview } from '../components/issuance/Step5Preview';
import { SuccessState } from '../components/issuance/SuccessState';
import { DocumentTemplate } from '../components/issuance/DocumentTemplate'; // Added this

export default function DocumentIssuance() {
  const { t } = useLanguage();
  const documentTypes = getDocumentTypes(t);
  
  // --- PRINT REF ---
  const componentRef = useRef<HTMLDivElement>(null);

  // --- UI STATES ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- DATA STATES ---
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [docFilter, setDocFilter] = useState<'CLEARANCE' | 'CERTIFICATE'>('CLEARANCE');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [processorName, setProcessorName] = useState('');
  const [hasBlotterRecord, setHasBlotterRecord] = useState(false);
  const [isCheckingBlotter, setIsCheckingBlotter] = useState(false);
  const [editableTemplate, setEditableTemplate] = useState('');

  const generateOrderNo = () => `ORD-${Date.now().toString().slice(-6)}`;

  const getFullName = (resident: Resident | null) => {
    if (!resident) return '';
    const parts = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean);
    return parts.join(' ').toUpperCase() + (resident.extension ? ` ${resident.extension}` : '');
  };

  const generateDocumentText = (resident: Resident | null, doc: DocumentType | null, purpose: string, orderNo: string) => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const residentName = resident ? getFullName(resident) : '[Full name of Applicant]';
    const residentAddress = resident?.address_text || '[House No./Street Name]';
    const isIndigency = doc?.name?.toLowerCase().includes('indigency') ?? false;

    let text = `OFFICE OF THE PUNONG BARANGAY

${doc?.name || 'CERTIFICATE OF INDIGENCY'}

To whom it may concern:

This is to certify that ${residentName}, of legal age is a bona fide resident of Barangay 166 Caybiga, Caloocan City, with postal address at ${residentAddress}.`;

    if (isIndigency) {
      text += `

This further certifies that the above-named individual belongs to a low-income family and is currently classified as an indigent member of this community, with no stable source of income sufficient for daily subsistence.`;
    }

    text += `

This certification is issued upon the request of the above-named person for the purpose of ${purpose || '[Employment / Scholarship / Training / Requirement]'} and for whatever legal intent it may serve.

Issued this ${day} of ${month}, ${year}.

OR No.: ${orderNo || '[Number]'}`;

    return text;
  };

  // --- PRINT LOGIC ---
  const handlePrint = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const residentName = selectedResident ? getFullName(selectedResident) : 'JOHN DOE M. SAMPLE';
    const residentAddress = selectedResident?.address_text || '#123 STREET NAME, BARANGAY, CITY';
    const residentStatus = selectedResident?.status || 'RES-000-000';
    const residentBirthdate = selectedResident?.birthdate
      ? new Date(selectedResident.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
      : 'JANUARY 01, 1995';

    const docTitle = selectedDoc?.category === 'Certificate'
      ? 'BARANGAY CERTIFICATE'
      : selectedDoc?.category === 'Clearance'
      ? 'BARANGAY CLEARANCE'
      : 'BARANGAY DOCUMENT';

    const documentHeading = selectedDoc?.category === 'Certificate' ? 'certificate' : 'clearance';

    const documentContent = editableTemplate?.trim() || `To whom it may concern:\n\nThis is to certify that the person whose information appears below has requested a record ${documentHeading} from this office.`;
    const formattedDocumentContent = documentContent
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join('');

    const printHTML = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Document Print</title>
          <style>
            @page { size: 6in 8in; margin: 0.08in; }
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              background-color: #f0f0f0;
              display: flex;
              justify-content: center;
              padding: 0;
            }
            .certificate-container {
              background-color: white;
              width: 100%;
              max-width: 5.85in;
              min-height: 7.5in;
              padding: 0.18in;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              border: 1px solid #ddd;
              position: relative;
              box-sizing: border-box;
              page-break-inside: avoid;
              overflow: hidden;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              border-bottom: 2px solid #2e7d32;
              padding-bottom: 6px;
              margin-bottom: 12px;
            }
            .header-text h1 {
              margin: 0;
              font-size: 18px;
              color: #2e7d32;
            }
            .header-text p {
              margin: 2px 0;
              font-size: 10px;
              font-weight: bold;
            }
            .doc-title {
              text-align: center;
              font-size: 22px;
              letter-spacing: 4px;
              color: #4caf50;
              margin: 8px 0;
              font-weight: bold;
            }
            .id-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              background-color: #4caf50;
              border: 1px solid #388e3c;
              margin-bottom: 12px;
              box-sizing: border-box;
            }
            .grid-item {
              text-align: center;
              border: 0.5px solid #fff;
              box-sizing: border-box;
            }
            .grid-label {
              color: white;
              font-weight: bold;
              padding: 3px;
              font-size: 11px;
            }
            .grid-value {
              background-color: #ffcc80;
              padding: 5px;
              font-size: 11px;
              font-family: monospace;
            }
            .content-section {
              margin-top: 18px;
              line-height: 1.65;
            }
            .content-section p {
              margin: 0 0 8px;
              font-size: 11px;
            }
            .row {
              display: flex;
              flex-wrap: wrap;
              margin-bottom: 4px;
              font-size: 11px;
            }
            .label {
              width: 110px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .dots {
              width: 18px;
              text-align: center;
            }
            .footer {
              margin-top: 44px;
              display: flex;
              justify-content: flex-start;
              text-align: center;
            }
            .sig-block {
              width: 160px;
            }
            .signature-img {
              display: block;
              width: 140px;
              height: auto;
            }
            .bottom-section {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 20px;
            }
            .disclaimer {
              font-size: 9px;
              color: #666;
              font-style: italic;
              text-align: left;
            }
            .bottom-logos {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .bottom-logo {
              width: 30px;
              height: 30px;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="header">
              <img src="/logo.png" alt="Barangay Logo" style="width: 80px; height: 80px; object-fit: contain;" />
              <div class="header-text">
                <p>Republic of the Philippines</p>
                <h1>OFFICE OF THE BARANGAY</h1>
                <p>CITY OF CALOOCAN</p>
              </div>
              <img src="/Republika.PNG" alt="Republic Logo" style="width: 80px; height: 80px; object-fit: contain;" />
            </div>

            <div class="doc-title">${docTitle}</div>

            <div class="id-grid">
              <div class="grid-item">
                <div class="grid-label">Household ID No.</div>
                <div class="grid-value">${orderNo || 'HN000-00000'}</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">Resident ID No.</div>
                <div class="grid-value">${residentStatus}</div>
              </div>
              <div class="grid-item">
                <div class="grid-label">Date of Issue</div>
                <div class="grid-value">${month}/${day}/${year}</div>
              </div>
            </div>

            <div class="content-section">
              ${formattedDocumentContent}
              <div class="row"><div class="label">Name</div><div class="dots">:</div><div>${residentName}</div></div>
              <div class="row"><div class="label">Address</div><div class="dots">:</div><div>${residentAddress}</div></div>
              <div class="row"><div class="label">Date of Birth</div><div class="dots">:</div><div>${residentBirthdate}</div></div>
              <div class="row"><div class="label">Purpose</div><div class="dots">:</div><div>${purpose || 'LOCAL EMPLOYMENT'}</div></div>
            </div>

            <div class="footer">
              <div class="sig-block">
                <img src="/Signature.PNG" alt="Signature" class="signature-img" />
              </div>
            </div>

            <div class="bottom-section">
              <div class="disclaimer">
                *Not Valid Without Official Barangay Signature
              </div>
              <div class="bottom-logos">
                <img src="/Republika.PNG" alt="Republic Logo" class="bottom-logo" />
                <img src="/QRCode.png" alt="QR Code" class="bottom-logo" />
              </div>
            </div>
          </div>
        </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      console.error('Failed to open print window');
      alert('Print window blocked. Please allow popups and try again.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }, 1000);
  };

  // --- NAVIGATION LOGIC ---
  const handleNext = () => {
    if (currentStep === 1 && hasBlotterRecord) {
      // Prevent proceeding if resident has blotter record
      return;
    }
    if (currentStep === 3 && selectedDoc?.fee === 0) {
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    if (currentStep === 5 && selectedDoc?.fee === 0) {
      setCurrentStep(3);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);

    const now = new Date();
    const formattedDate = getLocalISODate(now); // YYYY-MM-DD in local timezone
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!selectedResident || !selectedDoc) {
      setLoading(false);
      return;
    }

    const newTransaction = {
      id: `tx-${Date.now()}`,
      order_no: orderNo,
      invoice_no: invoiceNo || getNextInvoiceNumber(),
      resident_name: getFullName(selectedResident),
      document_type: selectedDoc.name,
      amount: selectedDoc.fee,
      date: formattedDate,
      time: formattedTime,
      status: 'Completed',
      processed_by: processorName || 'admin1'
    };

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: newTransaction.order_no,
          invoice_no: newTransaction.invoice_no,
          resident_name: newTransaction.resident_name,
          document_type: newTransaction.document_type,
          amount: newTransaction.amount,
          date: newTransaction.date,
          time: newTransaction.time,
          status: newTransaction.status,
          processed_by: newTransaction.processed_by,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save document to backend', await response.text());
      } else {
        console.log('Saved document to backend successfully');
        const updateTimestamp = Date.now().toString();
        try {
          window.localStorage.setItem('documentsUpdatedAt', updateTimestamp);
        } catch (error) {
          console.warn('Unable to write documentsUpdatedAt to localStorage', error);
        }

        window.dispatchEvent(new CustomEvent('documentsUpdated', {
          detail: { source: 'document-issuance', timestamp: Number(updateTimestamp) }
        }));
      }

      // Save receipt to backend after document is saved
      try {
        const receiptSaved = await saveReceipt({
          order_no: newTransaction.order_no,
          invoice_no: newTransaction.invoice_no,
          resident_name: newTransaction.resident_name,
          document_type: newTransaction.document_type,
          amount: newTransaction.amount,
          date: newTransaction.date,
          time: newTransaction.time,
          status: newTransaction.status,
          processed_by: newTransaction.processed_by,
        });

        if (receiptSaved) {
          console.log('Receipt saved successfully:', receiptSaved);
        } else {
          console.warn('Receipt save failed, but document was issued');
        }
      } catch (receiptError) {
        console.error('Receipt save error:', receiptError);
        // Continue despite receipt error - document was already issued
      }
    } catch (error) {
      console.error('Backend save error', error);
    }

    // We do not need localStorage persistence for final app; backend is the source of truth.
    setLoading(false);
    setIsSubmitted(true);
  };

  useEffect(() => {
    setProcessorName('admin1');
    setOrderNo(generateOrderNo());
    setInvoiceNo(getNextInvoiceNumber());
  }, []);

  useEffect(() => {
    if (selectedResident && selectedDoc && purpose) {
      const text = generateDocumentText(selectedResident, selectedDoc, purpose, orderNo);
      setEditableTemplate(text);
    }
  }, [selectedResident, selectedDoc, purpose, orderNo]);

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedResident(null);
    setSelectedDoc(null);
    setPurpose('');
    setRemarks('');
    setOrderNo(generateOrderNo());
    setInvoiceNo(getNextInvoiceNumber());
    setProcessorName('');
    setIsSubmitted(false);
    setHasBlotterRecord(false);
  };

  return (
    <div className={`flex flex-col ${currentStep === 5 && !isSubmitted ? 'h-auto' : 'flex-1'}`}>
      <div className="bg-[#F8FAFC] p-3 md:p-4 flex flex-col min-h-0">
        <div className={`max-w-7xl mx-auto w-full flex flex-col ${currentStep === 5 && !isSubmitted ? 'h-auto' : 'flex-1 min-h-0'}`}>
        
        {isSubmitted ? (
          <SuccessState 
            t={t} 
            selectedResident={selectedResident} 
            selectedDoc={selectedDoc} 
            orderNo={orderNo} 
            onReset={resetForm} 
            onPrint={handlePrint} // Triggers the print dialog
          />
        ) : (
          <>
            {/* PROGRESS TRACKER */}
            <div className="bg-white border rounded-2xl p-3 shadow-sm flex-shrink-0">
               <div className="flex justify-between items-center max-w-3xl mx-auto relative">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${
                      currentStep >= step ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > step ? <Check size={18} /> : step}
                    </div>
                    <span className={`text-[9px] font-black uppercase mt-2 tracking-widest ${
                      currentStep >= step ? 'text-blue-600' : 'text-gray-300'
                    }`}>
                      {step === 1 && t('Resident', 'Residente')}
                      {step === 2 && t('Document', 'Dokumento')}
                      {step === 3 && t('Details', 'Detalye')}
                      {step === 4 && t('Payment', 'Bayad')}
                      {step === 5 && t('Review', 'Preview')}
                    </span>
                  </div>
                ))}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0" />
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500 -z-0" 
                  style={{ width: `${(currentStep - 1) * 25}%` }}
                />
              </div>
            </div>

            {/* DYNAMIC STEP CONTENT */}
            <div className={`bg-white/50 backdrop-blur-sm border border-white rounded-2xl p-4 md:p-6 shadow-sm ${
              currentStep === 5 ? 'flex-shrink-0 h-auto' : 'flex-1 flex flex-col min-h-0'
            } my-3`}>
              {currentStep === 1 && (
                <Step1Resident 
                  t={t} 
                  selectedResident={selectedResident} 
                  setSelectedResident={setSelectedResident}
                  onBlotterCheck={setHasBlotterRecord}
                  setCheckingBlotter={setIsCheckingBlotter}
                />
              )}
              {currentStep === 2 && (
                <Step2Document 
                  t={t} 
                  docFilter={docFilter} 
                  setDocFilter={setDocFilter} 
                  selectedDoc={selectedDoc} 
                  setSelectedDoc={setSelectedDoc} 
                  documentTypes={documentTypes} 
                />
              )}
              {currentStep === 3 && (
                <Step3Details 
                  t={t} 
                  selectedResident={selectedResident} 
                  selectedDoc={selectedDoc}
                  purpose={purpose} setPurpose={setPurpose}
                  remarks={remarks} setRemarks={setRemarks}
                  invoiceNo={invoiceNo}
                  orderNo={orderNo}
                  processorName={processorName}
                  handleNext={handleNext}
                />
              )}
              {currentStep === 4 && (
                <Step4Payment 
                  t={t} 
                  selectedDoc={selectedDoc} 
                  selectedResident={selectedResident} 
                />
              )}
              {currentStep === 5 && (
                <Step5Preview 
                  t={t} 
                  selectedResident={selectedResident} 
                  selectedDoc={selectedDoc} 
                  purpose={purpose} 
                  orderNo={orderNo}
                  editableTemplate={editableTemplate}
                  setEditableTemplate={setEditableTemplate}
                />
              )}
            </div>

            {/* FOOTER NAVIGATION */}
            <div className={`flex justify-between items-center px-2 py-2 flex-shrink-0 ${
              currentStep === 5 ? 'mt-3' : ''
            }`}>
              <button 
                onClick={handleBack} 
                disabled={currentStep === 1 || loading} 
                className="flex items-center gap-1 font-black text-gray-400 uppercase text-[10px] disabled:opacity-0 hover:text-gray-600 transition-all"
              >
                <ChevronLeft size={14} /> {t('Back', 'Bumalik')}
              </button>
              
              <div className="flex gap-3 items-center">
                <button 
                  onClick={resetForm} 
                  className="text-gray-400 font-black uppercase text-[9px] hover:text-red-500 transition-all"
                >
                  {t('Cancel', 'Kanselahin')}
                </button>
                <button 
                  onClick={currentStep === 5 ? handleFinalSubmit : handleNext} 
                  disabled={
                    loading || 
                    (currentStep === 1 && (!selectedResident || hasBlotterRecord || isCheckingBlotter)) || 
                    (currentStep === 2 && !selectedDoc) ||
                    (currentStep === 3 && !purpose.trim())
                  }
                  className={`min-w-[160px] px-8 py-3 rounded-xl font-black uppercase text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    currentStep === 5 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {currentStep === 5 ? t('Confirm & Issue', 'Kumpirmahin at I-isyu') : t('Continue', 'Magpatuloy')}
                      {currentStep !== 5 && <ChevronRight size={12} />}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* --- HIDDEN PRINT TEMPLATE --- */}
      <DocumentTemplate 
        ref={componentRef}
        resident={selectedResident ? {
          name: getFullName(selectedResident),
          age: selectedResident.birthdate ? new Date().getFullYear() - new Date(selectedResident.birthdate).getFullYear() : undefined,
          address: selectedResident.address_text,
          status: selectedResident.status
        } : null}
        document={selectedDoc}
        purpose={purpose}
        orderNo={orderNo}
        remarks={remarks}
        customText={editableTemplate}
      />
    </div>
  );
}