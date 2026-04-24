import React from 'react';
import { FileText, Printer, Calendar, User, Tag } from 'lucide-react';
import { DocumentType } from '../../constants/documentTypes';

interface Step5Props {
  t: any;
  selectedResident: any;
  selectedDoc: DocumentType | null;
  purpose: string;
  orderNo: string;
  editableTemplate: string;
  setEditableTemplate: (template: string) => void;
}

export const Step5Preview: React.FC<Step5Props> = ({ 
  t, 
  selectedResident, 
  selectedDoc, 
  purpose, 
  orderNo,
  editableTemplate,
  setEditableTemplate
}) => {
  const getFullName = (resident: any) => {
    if (!resident) return '';
    const parts = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean);
    return parts.join(' ').toUpperCase() + (resident.extension ? ` ${resident.extension}` : '');
  };

  const currentDate = new Date().toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          {t('Final Review', 'Huling Pagsusuri')}
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {t('Review details before official printing', 'Suriin ang detalye bago opisyal na i-print')}
        </p>
      </div>

      {/* The "Virtual Receipt" Card */}
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-2xl overflow-hidden">
        {/* Top Branding Bar */}
        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText size={18} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              {t('Document Preview', 'Preview ng Dokumento')}
            </p>
          </div>
          <span className="text-[10px] font-black py-1 px-3 bg-white/10 rounded-full border border-white/10 uppercase">
            {selectedDoc?.category}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <User size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{t('Resident Name', 'Pangalan')}</p>
              </div>
              <p className="font-black text-xl text-gray-900 uppercase leading-tight">
                {getFullName(selectedResident)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Tag size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{t('Document Title', 'Dokumento')}</p>
              </div>
              <p className="font-black text-xl text-blue-600 uppercase leading-tight">
                {selectedDoc?.name}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{t('Date Issued', 'Petsa')}</p>
              </div>
              <p className="font-black text-gray-900 uppercase">{currentDate}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Printer size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{t('Reference No.', 'Numero')}</p>
              </div>
              <p className="font-mono font-black text-gray-900">
                {orderNo || 'AUTO-GEN-2024'}
              </p>
            </div>
          </div>

          {/* Purpose Box */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              {t('Purpose of Request', 'Layunin')}
            </p>
            <p className="font-bold text-gray-700">"{purpose}"</p>
          </div>

          {/* Footer Totals */}
          <div className="pt-8 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
            <div>
              <p className="text-4xl font-black text-gray-900">₱{(selectedDoc?.fee || 0).toFixed(2)}</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                {t('Total Paid Amount', 'Kabuuang Bayad')}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-600 justify-end mb-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <p className="text-xs font-black uppercase tracking-tighter">
                  {t('Ready to Issue', 'Handa nang I-isyu')}
                </p>
              </div>
              <p className="text-[9px] font-bold text-gray-400">
                {t('Verified by Barangay Staff', 'Sinuri ng Kawani ng Barangay')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Editable Document Template */}
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-2xl overflow-hidden">
        <div className="bg-gray-900 p-6 text-white">
          <h3 className="text-lg font-black uppercase tracking-tight">
            {t('Document Content', 'Nilalaman ng Dokumento')}
          </h3>
          <p className="text-xs font-medium text-gray-300 mt-1">
            {t('Review and edit the document text before issuing', 'Suriin at baguhin ang teksto ng dokumento bago i-isyu')}
          </p>
        </div>
        
        <div className="p-6">
          <textarea
            value={editableTemplate}
            onChange={(e) => setEditableTemplate(e.target.value)}
            className="w-full h-96 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('Document content will appear here...', 'Lalabas dito ang nilalaman ng dokumento...')}
          />
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-center text-gray-400 font-medium px-10">
        {t('By clicking "Confirm & Issue", a permanent record will be created in the database and the document will be prepared for printing.', 
           'Sa pagpindot ng "Confirm & Issue", magkakaroon ng permanenteng rekord sa database at ihahanda ang dokumento para sa pag-print.')}
      </p>
    </div>
  );
};