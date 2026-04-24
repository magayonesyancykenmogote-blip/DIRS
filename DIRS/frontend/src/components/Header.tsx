import { Settings, Upload, Languages, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // profile dropdown no longer needed; clicking avatar opens modal directly
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.png');

  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Document system does not require external auth in this UI stub.
    navigate('/login');
  };

  const openSignOutModal = () => setIsSignOutModalOpen(true);
  const closeSignOutModal = () => setIsSignOutModalOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-8">
      {/* 1. Logo & Title */}
      <div className="flex items-center gap-4">
        <img src={logoSrc} alt="Logo" className="w-12 h-12 object-contain" />
        <h1 className="text-2xl font-black text-[#0038A8] tracking-tighter">
          Barangay <span className="text-blue-600">DIRS</span>
        </h1>
      </div>

      {/* 2. Actions */}
      <div className="flex items-center gap-4">
        

        {/* SETTINGS DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2.5 rounded-full transition-all ${isSettingsOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Settings className="w-6 h-6" />
          </button>

          {isSettingsOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setIsSettingsOpen(false)} />
              <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl p-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{t("System Settings", "Ayos ng Sistema")}</p>
                <div className="space-y-2">
                  <button 
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-2xl transition-all text-left"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <Languages size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{t("Language", "Wika")}</p>
                      <p className="text-[9px] font-black text-emerald-600 uppercase">{language}</p>
                    </div>
                  </button>
                  <label className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl cursor-pointer transition-all border border-dashed border-gray-200">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                      <Upload size={16} />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{t("Change Logo", "Baguhin ang Logo")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setLogoSrc(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile button triggers sign-out modal directly */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <button
            onClick={() => {
              openSignOutModal();
              setIsSettingsOpen(false);
            }}
            className="w-10 h-10 bg-[#0038A8] rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-inner"
          >
            AD
          </button>
        </div>
      </div>


      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeSignOutModal} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {t('Sign Out?', 'Mag-sign out?')}
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeSignOutModal}
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300"
              >
                {t('No', 'Hindi')}
              </button>
              <button
                onClick={() => {
                  closeSignOutModal();
                  handleSignOut();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                {t('Yes', 'Oo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}