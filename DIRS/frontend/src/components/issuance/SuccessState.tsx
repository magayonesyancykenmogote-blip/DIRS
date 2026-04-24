import React from 'react';
import { Check, Printer, PlusCircle, FileCheck, ArrowRight } from 'lucide-react';

interface SuccessStateProps {
  t: any;
  selectedResident: any;
  selectedDoc: any;
  orderNo: string;
  onReset: () => void;
  onPrint: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  t,
  selectedResident,
  selectedDoc,
  orderNo,
  onReset,
  onPrint,
}) => {
  const getFullName = (resident: any) => {
    if (!resident) return '';
    const parts = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean);
    return parts.join(' ').toUpperCase() + (resident.extension ? ` ${resident.extension}` : '');
  };
  return (
    <div className="max-w-2xl mx-auto py-4 px-4 animate-in fade-in zoom-in duration-500 h-full flex flex-col justify-center">
      <div className="text-center space-y-6">
        {/* Animated Success Icon */}
        <div className="relative inline-block mx-auto">
          <div className="absolute inset-0 bg-green-100 rounded-[2.5rem] animate-ping opacity-20" />
          <div className="relative w-20 h-20 bg-green-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-green-200">
            <Check size={40} className="text-white stroke-[4px]" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            {t('Issued Successfully!', 'Matagumpay na Naibigay!')}
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('Transaction complete and record saved', 'Tapos na ang transaksyon at naka-save na ang rekord')}
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm divide-y divide-gray-50 max-w-md mx-auto text-sm">
          <div className="pb-3 text-left flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase">{t('Resident', 'Residente')}</p>
              <p className="font-black text-gray-800 uppercase text-xs">{getFullName(selectedResident)}</p>
            </div>
            <FileCheck size={16} className="text-green-500" />
          </div>
          
          <div className="py-3 text-left flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase">{t('Control Number', 'Numero ng Kontrol')}</p>
              <p className="font-mono font-bold text-blue-600 text-xs">{orderNo || 'BRGY-166-SEQ-001'}</p>
            </div>
            <div className="px-2 py-1 bg-blue-50 rounded-lg">
              <p className="text-[9px] font-black text-blue-600 uppercase">Paid</p>
            </div>
          </div>

          <div className="pt-3 text-left">
            <p className="text-[9px] font-black text-gray-400 uppercase">{t('Document Type', 'Uri ng Dokumento')}</p>
            <p className="font-bold text-gray-700 uppercase text-xs">{selectedDoc?.name}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Print button clicked');
              onPrint();
            }}
            className="w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-black transition-all shadow-xl hover:-translate-y-1"
          >
            <Printer size={14} />
            {t('Print Document', 'I-print ang Dokumento')}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onReset();
            }}
            className="w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-50 px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-50 transition-all shadow-md"
          >
            <PlusCircle size={14} />
            {t('New Issuance', 'Bagong Transaksyon')}
          </button>
        </div>

        {/* Secondary Action */}
        <button 
           onClick={() => window.location.href = '/records'} 
           className="flex items-center gap-2 mx-auto text-[10px] font-black text-gray-400 uppercase hover:text-blue-600 transition-colors"
        >
          {t('View Records History', 'Tingnan ang Kasaysayan')}
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};