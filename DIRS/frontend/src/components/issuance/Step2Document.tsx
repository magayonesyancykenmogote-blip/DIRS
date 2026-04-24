import React from 'react';
import { ChevronRight, CheckCircle2, FileText, Info } from 'lucide-react';
import { DocumentType } from '../../constants/documentTypes';

interface Step2Props {
  t: any;
  docFilter: 'CLEARANCE' | 'CERTIFICATE';
  setDocFilter: (filter: 'CLEARANCE' | 'CERTIFICATE') => void;
  selectedDoc: DocumentType | null;
  setSelectedDoc: (doc: DocumentType | null) => void;
  documentTypes: DocumentType[];
}

export const Step2Document: React.FC<Step2Props> = ({
  t,
  docFilter,
  setDocFilter,
  selectedDoc,
  setSelectedDoc,
  documentTypes,
}) => {
  
  // Filter list based on the active tab (Clearance vs Certificate)
  const filteredDocs = documentTypes.filter(
    (d) => d.category.toUpperCase() === docFilter
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Header Section */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          {t('Select Document', 'Pumili ng Dokumento')}
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {t('Choose the type of document to be issued', 'Pumili ng uri ng dokumentong ibibigay')}
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Category Switcher */}
        <div className="flex bg-gray-800 p-1.5 rounded-2xl w-fit mx-auto border border-gray-700 shadow-inner">
          {(['CLEARANCE', 'CERTIFICATE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setDocFilter(type);
                setSelectedDoc(null); // Reset selection when switching tabs to avoid confusion
              }}
              className={`px-8 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${
                docFilter === type
                  ? 'bg-white text-blue-600 shadow-md transform scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t(type, type === 'CLEARANCE' ? 'KLIYARANS' : 'SERTIPIKO')}
            </button>
          ))}
        </div>

        {/* 2. Selection Dropdown */}
        <div className="relative group">
          <select
            className="w-full appearance-none bg-white border-2 border-gray-100 hover:border-blue-400 p-5 rounded-[2rem] font-black text-sm uppercase tracking-tight cursor-pointer transition-all outline-none shadow-sm group-hover:shadow-md"
            value={selectedDoc?.id || ''}
            onChange={(e) => {
              const doc = documentTypes.find((d) => d.id === e.target.value);
              if (doc) setSelectedDoc(doc);
            }}
          >
            <option value="" disabled>
              {t('--- Click to browse ---', '--- I-click para pumili ---')}
            </option>
            {filteredDocs.map((doc) => (
              <option key={doc.id} value={doc.id} className="font-sans py-2">
                {doc.name} {doc.fee > 0 ? `— ₱${doc.fee.toFixed(2)}` : `(${t('FREE', 'LIBRE')})`}
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
            <ChevronRight size={20} className="rotate-90" />
          </div>
        </div>

        {/* 3. Detailed View (Selected Document Card) */}
        {selectedDoc ? (
          <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              selectedDoc.category === 'Clearance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 border border-blue-100'
            }`}>
              {selectedDoc.category === 'Clearance' ? <CheckCircle2 size={28} /> : <FileText size={28} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-blue-600 text-white uppercase">
                  {t(selectedDoc.category.toUpperCase(), selectedDoc.category === 'Clearance' ? 'KLIYARANS' : 'SERTIPIKO')}
                </span>
                {selectedDoc.fee === 0 && (
                  <span className="text-[8px] font-black px-2 py-0.5 rounded bg-green-500 text-white uppercase">
                    {t('FREE', 'LIBRE')}
                  </span>
                )}
              </div>
              <h3 className="font-black text-gray-900 uppercase text-lg mt-1 leading-tight">
                {selectedDoc.name}
              </h3>
              <p className="text-[11px] text-gray-500 font-bold leading-tight mt-1 italic">
                {selectedDoc.description}
              </p>
            </div>

            <div className="text-right border-l border-blue-200 pl-6">
              <p className={`text-2xl font-black ${selectedDoc.fee === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                {selectedDoc.fee > 0 ? `₱${selectedDoc.fee.toFixed(2)}` : 'FREE'}
              </p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                {t('Service Fee', 'Bayad')}
              </p>
            </div>
          </div>
        ) : (
          /* Empty State Placeholder */
          <div className="mt-6 p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-300">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <FileText size={32} className="opacity-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              {t('No Document Selected', 'Walang Piniling Dokumento')}
            </p>
          </div>
        )}
      </div>

      {/* Helper Info Note */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <Info size={16} className="text-gray-400 mt-0.5" />
        <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
          {t(
            'Note: Some documents (e.g., Indigency, First-Time Jobseeker) are issued free of charge as per national laws and barangay ordinances.',
            'Paalala: Ang ilang dokumento (tulad ng Indigency, First-Time Jobseeker) ay ibinibigay nang walang bayad base sa batas at ordinansa.'
          )}
        </p>
      </div>
    </div>
  );
};