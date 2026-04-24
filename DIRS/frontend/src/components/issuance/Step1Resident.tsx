import { Search, UserCheck, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface Resident {
  _id: string;
  resident_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension?: string;
  birthdate?: string;
  address_text: string;
  status: 'ACTIVE' | 'INACTIVE';
  archival_state: 'ACTIVE' | 'ARCHIVED';
  tags?: string[];
}

interface Step1Props {
  t: (text: string, fallback: string) => string;
  selectedResident: Resident | null;
  setSelectedResident: (resident: Resident | null) => void;
  onBlotterCheck?: (hasRecord: boolean) => void;
  setCheckingBlotter?: (isChecking: boolean) => void;
}

export const Step1Resident = ({ t, selectedResident, setSelectedResident, onBlotterCheck, setCheckingBlotter }: Step1Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [blotterWarning, setBlotterWarning] = useState<string | null>(null);
  const [checkingBlotter, setCheckingBlotterLocal] = useState(false);

  const fetchResidents = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/residents${params}`);
      const data = await res.json();
      const parsedResidents = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setResidents(parsedResidents);
    } catch (error) {
      console.error('Failed to fetch residents:', error);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const timeoutId = setTimeout(() => {
        fetchResidents(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (searchTerm === '') {
      fetchResidents();
    }
  }, [searchTerm]);

  const getFullName = (resident: Resident) => {
    const parts = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean);
    return parts.join(' ').toUpperCase() + (resident.extension ? ` ${resident.extension}` : '');
  };

  const getAge = (birthdate?: string) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const checkBlotterRecord = async (resident: Resident) => {
    setCheckingBlotterLocal(true);
    setCheckingBlotter?.(true);
    try {
      const response = await fetch('/api/residents/check-blotter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: resident.first_name,
          middle_name: resident.middle_name,
          last_name: resident.last_name,
          extension: resident.extension,
        }),
      });
      const data = await response.json();
      if (data.hasBlotterRecord) {
        setBlotterWarning(data.message);
        onBlotterCheck?.(true);
      } else {
        setBlotterWarning(null);
        onBlotterCheck?.(false);
      }
    } catch (error) {
      console.error('Failed to check blotter record:', error);
      setBlotterWarning(null);
      onBlotterCheck?.(false);
    } finally {
      setCheckingBlotterLocal(false);
      setCheckingBlotter?.(false);
    }
  };

  const filteredResidents = Array.isArray(residents)
    ? residents.filter((res) => {
        if (!searchTerm) return true;
        const fullName = getFullName(res).toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          res.resident_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  const results = filteredResidents.slice(0, 20);

  const invalidResidentBanner = selectedResident && blotterWarning ? (
    <div className="fixed bottom-6 right-6 z-50 max-w-[28rem] rounded-3xl border border-red-200 bg-red-50 p-4 shadow-2xl animate-bounce">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-700 mt-1" size={20} />
        <div>
          <div className="text-sm font-black uppercase tracking-wide text-red-800">
            {t('INVALID RESIDENT', 'DILANG BALIDONG RESIDENTE')}
          </div>
          <p className="text-xs font-bold uppercase text-red-700 tracking-wide">
            {t('RESIDENT HAS AN ACTIVE BLOTTER RECORD AND IS NOT ELIGIBLE FOR DOCUMENT ISSUANCE.', 'RESIDENT HAS AN ACTIVE BLOTTER RECORD AND IS NOT ELIGIBLE FOR DOCUMENT ISSUANCE.')}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex min-h-0 flex-col">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {t('Find Resident', 'Hanapin ang Residente')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('Search the resident list and select the correct applicant to continue the issuance process.', 'Hanapin ang residente at piliin ang tamang aplikante upang magpatuloy.')}
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Search by name or code...', 'Maghanap ayon sa pangalan o code...')}
                className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 py-4 pl-14 pr-5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[calc(100vh-20rem)]">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                {t('Loading residents...', 'Naglo-load ng residente...')}
              </div>
            ) : results.length > 0 ? (
              results.map((resident) => {
                const fullName = getFullName(resident);
                const age = getAge(resident.birthdate);
                const isActiveSelection = selectedResident?._id === resident._id;
                return (
                  <button
                    key={resident._id}
                    type="button"
                    onClick={() => {
                      setSelectedResident(resident);
                      checkBlotterRecord(resident);
                    }}
                    className={`group w-full rounded-3xl border p-4 text-left transition ${
                      isActiveSelection
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <UserCheck size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight">
                          {fullName}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {age ? `${age} yrs • ` : ''}{resident.address_text}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-400">
                {t('No residents match the search. Try another query.', 'Walang tumugmang residente. Subukan ang ibang paghahanap.')}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {t('Selected resident', 'Napiling residente')}
              </p>
              <h3 className="mt-3 text-xl font-black text-slate-900">
                {selectedResident ? getFullName(selectedResident) : t('No resident selected', 'Walang napiling residente')}
              </h3>
            </div>
            {selectedResident && (
              <div className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
                blotterWarning ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {blotterWarning ? t('Invalid', 'Hindi valid') : t('Valid', 'Valid')}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {selectedResident ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500 uppercase tracking-[0.24em]">{t('Age', 'Edad')}</span>
                    <span className="min-w-0 text-right break-words whitespace-normal">{getAge(selectedResident.birthdate) ?? t('Unknown', 'Hindi alam')}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500 uppercase tracking-[0.24em]">{t('Address', 'Tirahan')}</span>
                    <span className="min-w-0 text-right break-words whitespace-normal">{selectedResident.address_text}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500 uppercase tracking-[0.24em]">{t('Status', 'Katayuan')}</span>
                    <span className="min-w-0 text-right break-words whitespace-normal">{selectedResident.status}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-semibold text-slate-500 uppercase tracking-[0.24em]">{t('Resident code', 'Resident code')}</span>
                    <span className="min-w-0 text-right break-words whitespace-normal">{selectedResident.resident_code}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
                {t('Select a resident from the left list to continue.', 'Pumili ng residente sa kaliwang listahan upang magpatuloy.')}
              </div>
            )}
          </div>
        </div>
      </div>

      {invalidResidentBanner}
    </div>
  );
};



