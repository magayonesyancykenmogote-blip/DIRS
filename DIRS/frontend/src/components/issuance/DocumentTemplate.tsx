import React from 'react';
import { DocumentType } from '../../constants/documentTypes';

interface ResidentData {
  name: string;
  age?: number;
  address?: string;
  status?: string;
  birthdate?: string;
}

interface TemplateProps {
  resident: ResidentData | null;
  document: DocumentType | null;
  purpose: string;
  orderNo: string;
  remarks?: string;
  customText?: string;
}

export const DocumentTemplate = React.forwardRef<HTMLDivElement, TemplateProps>(
  ({ resident, document, purpose, orderNo }, ref) => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const docTitle = document?.category === 'Certificate'
      ? 'BARANGAY CERTIFICATE'
      : document?.category === 'Clearance'
      ? 'BARANGAY CLEARANCE'
      : 'BARANGAY DOCUMENT';

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          visibility: 'hidden',
          width: '100%',
          maxWidth: '5.7in',
          minHeight: '7.7in',
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          color: '#333',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <style>{`
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
        `}</style>

        <div className="certificate-container">
          <div className="header">
            <img src="/logo.png" alt="Barangay Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            <div className="header-text">
              <p>Republic of the Philippines</p>
              <h1>OFFICE OF THE BARANGAY</h1>
              <p>CITY OF CALOOCAN</p>
            </div>
            <img src="/Republika.PNG" alt="Republic Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          </div>

          <div className="doc-title">{docTitle}</div>

          <div className="id-grid">
            <div className="grid-item">
              <div className="grid-label">Household ID No.</div>
              <div className="grid-value">{orderNo || 'HN000-00000'}</div>
            </div>
            <div className="grid-item">
              <div className="grid-label">Resident ID No.</div>
              <div className="grid-value">{resident?.status || 'RES-000-000'}</div>
            </div>
            <div className="grid-item">
              <div className="grid-label">Date of Issue</div>
              <div className="grid-value">{`${month}/${day}/${year}`}</div>
            </div>
          </div>

          <div className="content-section">
            <p><i>To whom it may concern:</i></p>
            <p>This is to certify that the person whose information appears below has requested a record clearance from this office.</p>
            <div className="row"><div className="label">Name</div><div className="dots">:</div><div>{resident?.name || 'JOHN DOE M. SAMPLE'}</div></div>
            <div className="row"><div className="label">Address</div><div className="dots">:</div><div>{resident?.address || '#123 STREET NAME, BARANGAY, CITY'}</div></div>
            <div className="row"><div className="label">Date of Birth</div><div className="dots">:</div><div>{resident?.birthdate || 'JANUARY 01, 1995'}</div></div>
            <div className="row"><div className="label">Purpose</div><div className="dots">:</div><div>{purpose || 'LOCAL EMPLOYMENT'}</div></div>
          </div>

          <div className="footer">
            <div className="sig-block">
              <img src="/Signature.PNG" alt="Signature" className="signature-img" />
            </div>
          </div>

          <div className="bottom-section">
            <div className="disclaimer">
              *Not Valid Without Official Barangay Signature
            </div>
            <div className="bottom-logos">
              <img src="/Republika.PNG" alt="Republic Logo" className="bottom-logo" />
              <img src="/QRCode.png" alt="QR Code" className="bottom-logo" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
