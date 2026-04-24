import React from 'react';
import { CreditCard, FileText, User, MapPin, AlertCircle } from 'lucide-react';
import { DocumentType } from '../../constants/documentTypes';
import { Resident } from './Step1Resident';

type TranslateFn = (en: string, tl: string) => string;

interface Step3Props {
  t: TranslateFn;
  selectedResident: Resident | null;
  selectedDoc: DocumentType | null;
  purpose: string;
  setPurpose: (val: string) => void;
  remarks: string;
  setRemarks: (val: string) => void;
  invoiceNo: string;
  orderNo: string;
  processorName: string;
  handleNext: () => void;
}

export const Step3Details: React.FC<Step3Props> = ({
  t,
  selectedResident,
  selectedDoc,
  purpose,
  setPurpose,
  remarks,
  setRemarks,
  invoiceNo,
  orderNo,
  processorName,
}) => {
  const isFree = selectedDoc?.fee === 0;

  const getFullName = (resident: Resident) => {
    const parts = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean);
    return parts.join(' ').toUpperCase() + (resident.extension ? ` ${resident.extension}` : '');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* LEFT SIDE: DATA ENTRY */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-gray-50 pb-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs">3</span>
              {t('Purpose & Remarks', 'Layunin at Detalye')}
            </h2>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                {t('Issuing', 'I-iisyu')}
              </p>
              <p className="font-black text-blue-600 uppercase text-xs">
                {selectedDoc?.name}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Resident Context Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    {t('Requestor', 'Hinihiling ni')}
                  </p>
                  <p className="font-black text-gray-900 uppercase text-sm">
                    {selectedResident ? getFullName(selectedResident) : '---'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    {t('Address', 'Tirahan')}
                  </p>
                  <p className="font-bold text-gray-600 text-[11px] leading-tight">
                    {selectedResident?.address_text || '---'}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                  {t('Purpose of Request', 'Layunin ng Paghiling')} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-2xl text-sm font-bold transition-all outline-none" 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  placeholder={t('e.g. Local Employment, Scholarship, Medical Aid', 'hal. Paghahanap ng Trabaho, Scholarship')} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                  {t('Additional Remarks', 'Karagdagang Detalye')}
                </label>
                <textarea 
                  rows={2} 
                  className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-2xl text-sm font-bold resize-none transition-all outline-none" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)} 
                  placeholder={t('Optional notes to be printed on the document...', 'Opsyonal na detalye sa dokumento...')}
                />
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                  {t('Processor Name', 'Pangalan ng Processor')}
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none cursor-not-allowed"
                  value={processorName}
                  readOnly
                  placeholder={t('Processor name is set from login account', 'Ang pangalan ng processor ay mula sa naka-login na account')}
                />
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                  {t('Control / Order Number', 'Numero ng Kontrol')}
                </label>
                <div className="mt-2 flex gap-3">
                  <input 
                    type="text" 
                    className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold text-gray-600" 
                    value={orderNo} 
                    readOnly
                  />
                  <input 
                    type="text" 
                    className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold text-gray-600" 
                    value={invoiceNo} 
                    readOnly
                  />

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: SUMMARY & ACTION */}
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 sticky top-6 overflow-hidden relative min-h-0">
          {/* Decorative Background Element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                {t('Collection Summary', 'Buod ng Bayad')}
              </p>
              <CreditCard size={20} className="text-blue-400" />
            </div>

            <div className="space-y-1">
               <p className="text-5xl font-black tracking-tighter">
                ₱{(selectedDoc?.fee || 0).toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isFree ? 'bg-green-400 animate-pulse' : 'bg-blue-500'}`} />
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  {isFree ? t('No Payment Required', 'Libreng Serbisyo') : t('Standard Service Fee', 'Bayad sa Serbisyo')}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-500 uppercase">{t('Document Fee', 'Dokumento')}</span>
                <span className="text-gray-200 font-mono">₱{(selectedDoc?.fee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold border-b border-white/5 pb-4">
                <span className="text-gray-500 uppercase">{t('Convenience Fee', 'Karagdagang Bayad')}</span>
                <span className="text-gray-200 font-mono">₱0.00</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2">
                <span className="uppercase text-[10px] mt-2">{t('Total', 'Kabuuan')}</span>
                <span>₱{(selectedDoc?.fee || 0).toFixed(2)}</span>
              </div>
            </div>


          </div>
        </div>
        
        {/* Helper Note */}
        <div className="p-5 border border-gray-100 rounded-2xl bg-white flex gap-3">
           <AlertCircle size={16} className="text-gray-300 shrink-0 mt-0.5" />
           <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase">
             {t('Ensure all details are accurate. Purpose text will appear exactly as typed on the final document.', 
                'Siguraduhing tama ang lahat ng detalye. Ang layunin ay lalabas sa dokumento kung paano ito tinype.')}
           </p>
        </div>
      </div>
    </div>
  );
};