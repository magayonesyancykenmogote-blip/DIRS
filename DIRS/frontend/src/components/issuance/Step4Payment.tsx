import React from 'react';
import { Banknote, CreditCard, ShieldCheck, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { DocumentType } from '../../constants/documentTypes';

interface Step4Props {
  t: any;
  selectedDoc: DocumentType | null;
  selectedResident: any;
}

export const Step4Payment: React.FC<Step4Props> = ({ t, selectedDoc, selectedResident }) => {
  const getFullName = (resident: any) => {
    if (!resident) return '';
    const parts = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean);
    return parts.join(' ').toUpperCase() + (resident.extension ? ` ${resident.extension}` : '');
  };

  const fee = selectedDoc?.fee ?? 0;
  const isFree = fee === 0;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* 1. Main Payment Card */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Banknote size={180} />
        </div>

        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            <Banknote size={40} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {isFree ? t('No Collection Required', 'Walang Koleksyon') : t('Cash Collection', 'Pagkolekta ng Pera')}
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {t('Official Barangay Revenue', 'Opisyal na Kita ng Barangay')}
            </p>
          </div>

          {/* Amount Display */}
          <div className="py-10 border-y border-gray-50 flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-600 uppercase mb-2 bg-blue-50 px-3 py-1 rounded-full">
              {t('Total Amount to Collect', 'Kabuuang Halaga')}
            </span>
            <p className={`text-7xl font-black tracking-tighter ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
              ₱{fee.toFixed(2)}
            </p>
          </div>

          {/* Resident Quick ID */}
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <ShieldCheck size={14} />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-tight">
              {getFullName(selectedResident)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Instructions / Security Note */}
      <div className={`p-6 rounded-2xl border flex gap-4 items-center ${
        isFree 
          ? 'bg-green-50 border-green-100 text-green-700' 
          : 'bg-amber-50 border-amber-100 text-amber-700'
      }`}>
        {isFree ? (
          <CheckCircle2 size={24} className="shrink-0" />
        ) : (
          <AlertCircle size={24} className="shrink-0" />
        )}
        <div className="space-y-1">
          <p className="text-xs font-black uppercase">
            {isFree 
              ? t('Exempted from Payment', 'Libre sa Bayad') 
              : t('Action Required', 'Kailangang Gawin')}
          </p>
          <p className="text-[11px] font-bold leading-relaxed opacity-80">
            {isFree 
              ? t('This document is free under national mandates. Press continue to preview.', 'Ang dokumentong ito ay libre. Pindutin ang continue para sa preview.')
              : t('Please receive and count the cash. Ensure the amount matches the total above before confirming.', 'Pakitanggap at bilangin ang pera. Siguraduhing tama ang halaga bago kumpirmahin.')}
          </p>
        </div>
      </div>


    </div>
  );
};