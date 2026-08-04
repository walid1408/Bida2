import React, { useState, useRef } from 'react';
import { UserProfile, Language } from '../types';
import { translations, ALGERIAN_WILAYAS, INTERESTS_LIST } from '../data/translations';
import { Check, Plus, Trash2, User, Save, ChevronDown, ChevronUp, Camera, RefreshCw, Upload } from 'lucide-react';
import { DEFAULT_FEMALE_AVATAR, DEFAULT_MALE_AVATAR, getDefaultAvatar } from '../data/defaultAvatars';

interface UserProfileEditorProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  language: Language;
}

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({
  userProfile,
  setUserProfile,
  language
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  // Hidden File Input Ref for changing profile photo directly from local device
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number>(0);

  const handleInterestToggle = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter((i) => i !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };

  const handleSave = () => {
    setUserProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const triggerPhotoUpload = (index: number) => {
    setEditingPhotoIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhotoUrl = event.target.result as string;
          const updatedPhotos = [...formData.photos];
          if (editingPhotoIndex < updatedPhotos.length) {
            updatedPhotos[editingPhotoIndex] = newPhotoUrl;
          } else {
            updatedPhotos.push(newPhotoUrl);
          }
          setFormData({ ...formData, photos: updatedPhotos });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetDefaultAvatar = (gender: 'male' | 'female') => {
    const avatar = getDefaultAvatar(gender);
    const updatedPhotos = [...formData.photos];
    if (updatedPhotos.length > 0) {
      updatedPhotos[0] = avatar;
    } else {
      updatedPhotos.push(avatar);
    }
    setFormData({ ...formData, gender, photos: updatedPhotos });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-100 flex items-center space-x-2.5 rtl:space-x-reverse">
            <User className="w-6 h-6 text-amber-400" />
            <span>{t.editProfileTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'fr' 
              ? 'Gérez vos photos, informations personnelles et préférences de présentation.'
              : 'قم بإدارة صورك، معلوماتك الشخصية وتفضيلات العرض.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-900/30 hover:brightness-110 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{t.saveChanges}</span>
        </button>
      </div>

      {/* Toast Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center space-x-2 rtl:space-x-reverse shadow-sm">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.profileUpdated}</span>
        </div>
      )}

      {/* Hidden File Input for Device Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Photos Grid */}
        <div className="space-y-6">

          {/* User Photos Grid */}
          <div className="bg-[#0F172A] rounded-3xl p-5 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>{t.myPhotos}</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-semibold">
                {language === 'fr' ? 'Cliquer pour changer' : 'اضغط لتغيير الصورة'}
              </span>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 gap-3">
              {formData.photos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => triggerPhotoUpload(idx)}
                  className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-800 cursor-pointer bg-slate-900 shadow-md transition-all hover:border-amber-500/60"
                  title={language === 'fr' ? 'Cliquer pour changer cette photo' : 'اضغط لتغيير هذه الصورة'}
                >
                  <img src={photo} alt={`Photo ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Hover / Permanent Overlay Badge */}
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/60 flex flex-col items-center justify-center gap-1 transition-all">
                    <div className="p-2 rounded-full bg-amber-500 text-slate-950 shadow-lg scale-90 group-hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-extrabold text-white bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {idx === 0
                        ? (language === 'fr' ? 'Photo principale' : 'الصورة الرئيسية')
                        : (language === 'fr' ? 'Changer' : 'تغيير')}
                    </span>
                  </div>

                  {formData.photos.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPhotos = formData.photos.filter((_, i) => i !== idx);
                        setFormData({ ...formData, photos: newPhotos });
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white shadow-md transition-all"
                      title={language === 'fr' ? 'Supprimer' : 'حذف'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {formData.photos.length < 4 && (
                <button
                  onClick={() => triggerPhotoUpload(formData.photos.length)}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/50 transition-all bg-[#0A0F1D] group"
                >
                  <div className="p-2 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold mt-1.5">{t.addPhoto}</span>
                </button>
              )}
            </div>

            {/* Default Avatar Preset Switcher Buttons */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                {language === 'fr' ? 'Photos par défaut :' : 'الصور الافتراضية:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetDefaultAvatar('male')}
                  className="py-2 px-2.5 rounded-xl bg-[#0A0F1D] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>👨</span>
                  <span>{language === 'fr' ? 'Avatar Homme' : 'صورة رجل'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDefaultAvatar('female')}
                  className="py-2 px-2.5 rounded-xl bg-[#0A0F1D] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>👩</span>
                  <span>{language === 'fr' ? 'Avatar Femme' : 'صورة امرأة'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Personal Information Form */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-slate-100">
              {language === 'fr' ? 'Informations principales' : 'المعلومات الأساسية'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fr' ? 'Les trois éléments essentiels de votre profil.' : 'العناصر الثلاثة الأساسية لملفك الشخصي.'}
            </p>
          </div>
          
          <div className="space-y-4">
            
            {/* Nom d'utilisateur / Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'fr' ? "Nom d'utilisateur" : 'اسم المستخدم'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'fr' ? "Ex: Karim_23" : 'مثال: كريم_23'}
                className="w-full px-4 py-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-sm font-medium text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Wilaya / Région */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'fr' ? 'Wilaya / Région' : 'الولاية'}
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-sm font-medium text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{language === 'fr' ? 'Âge' : 'السن'}</span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {language === 'fr' ? '18 ans minimum' : '18 سنة على الأقل'}
                </span>
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: Math.max(18, Number(e.target.value) || 18) })}
                className="w-full px-4 py-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-sm font-medium text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Optional Additional Profile Details Toggle */}
          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <button
              type="button"
              onClick={() => setShowAdditional(!showAdditional)}
              className="w-full flex items-center justify-between py-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>
                {language === 'fr' ? 'Informations complémentaires (Optionnel)' : 'معلومات إضافية اختيارية (المهنة، النبذة...)'}
              </span>
              {showAdditional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdditional && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                {/* Profession */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.profession}
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.bio}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Looking for */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.lookingFor}
                  </label>
                  <input
                    type="text"
                    value={formData.lookingFor}
                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Interests Pills Picker */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.myInterests}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTERESTS_LIST.map((interest) => {
                      const isSelected = formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-sm'
                              : 'bg-[#0A0F1D] text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {interest} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/30 hover:brightness-110 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveChanges}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
