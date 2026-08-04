import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, ShieldCheck, Check, X, ChevronDown, MapPin, Clock } from 'lucide-react';
import { Profile, FilterState, Language } from '../types';
import { ProfileCard } from './ProfileCard';
import { translations, ALGERIAN_WILAYAS, INTERESTS_LIST } from '../data/translations';

interface DiscoveryGridProps {
  profiles: Profile[];
  likedProfileIds: string[];
  language: Language;
  onLike: (profile: Profile) => void;
  onOpenDetails: (profile: Profile) => void;
}

export const DiscoveryGrid: React.FC<DiscoveryGridProps> = ({
  profiles,
  likedProfileIds,
  language,
  onLike,
  onOpenDetails,
}) => {
  const t = translations[language];

  const [filters, setFilters] = useState<FilterState>({
    gender: 'all',
    minAge: 20,
    maxAge: 45,
    city: 'all',
    cities: [],
    interest: 'all',
    verifiedOnly: false,
    activeLast7Days: false,
    searchQuery: '',
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isWilayaDropdownOpen, setIsWilayaDropdownOpen] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const wilayaDropdownRef = useRef<HTMLDivElement>(null);

  // Close wilaya dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wilayaDropdownRef.current &&
        !wilayaDropdownRef.current.contains(e.target as Node)
      ) {
        setIsWilayaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleWilaya = (wilaya: string) => {
    setFilters((prev) => {
      const exists = prev.cities.includes(wilaya);
      const newCities = exists
        ? prev.cities.filter((c) => c !== wilaya)
        : [...prev.cities, wilaya];
      return {
        ...prev,
        cities: newCities,
        city: newCities.length === 1 ? newCities[0] : 'all',
      };
    });
  };

  const removeWilaya = (wilaya: string) => {
    setFilters((prev) => {
      const newCities = prev.cities.filter((c) => c !== wilaya);
      return {
        ...prev,
        cities: newCities,
        city: newCities.length === 1 ? newCities[0] : 'all',
      };
    });
  };

  const clearWilayas = () => {
    setFilters((prev) => ({ ...prev, cities: [], city: 'all' }));
  };

  const selectAllWilayas = () => {
    setFilters((prev) => ({ ...prev, cities: [...ALGERIAN_WILAYAS], city: 'all' }));
  };

  // Calculate active filter count
  const activeWilayaCount = filters.cities.length;
  const activeFilterCount =
    (filters.gender !== 'all' ? 1 : 0) +
    (activeWilayaCount > 0 ? 1 : (filters.city !== 'all' ? 1 : 0)) +
    (filters.interest !== 'all' ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.activeLast7Days ? 1 : 0) +
    (filters.minAge > 20 || filters.maxAge < 45 ? 1 : 0) +
    (filters.searchQuery.trim() !== '' ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      gender: 'all',
      minAge: 20,
      maxAge: 45,
      city: 'all',
      cities: [],
      interest: 'all',
      verifiedOnly: false,
      activeLast7Days: false,
      searchQuery: '',
    });
    setWilayaSearch('');
  };

  // Filter logic
  const filteredProfiles = profiles.filter((p) => {
    // Gender filter
    if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
    
    // Age filter
    if (p.age < filters.minAge || p.age > filters.maxAge) return false;

    // Multi-Wilaya filter
    if (filters.cities.length > 0) {
      const match = filters.cities.some((c) => {
        const cClean = c.replace(/^[0-9]+\s*-\s*/, '').trim().toLowerCase();
        const pClean = p.city.replace(/^[0-9]+\s*-\s*/, '').trim().toLowerCase();
        return cClean === pClean || cClean.includes(pClean) || pClean.includes(cClean);
      });
      if (!match) return false;
    } else if (filters.city !== 'all') {
      const cClean = filters.city.replace(/^[0-9]+\s*-\s*/, '').trim().toLowerCase();
      const pClean = p.city.replace(/^[0-9]+\s*-\s*/, '').trim().toLowerCase();
      if (cClean !== pClean && !cClean.includes(pClean) && !pClean.includes(cClean)) return false;
    }

    // Interest filter
    if (filters.interest !== 'all' && !p.interests.some(i => i.toLowerCase().includes(filters.interest.toLowerCase()))) return false;

    // Verified only filter
    if (filters.verifiedOnly && !p.isVerified) return false;

    // Active in last 7 days filter
    if (filters.activeLast7Days) {
      if (!p.isOnline) {
        if (!p.lastSeen) return false;
        const ls = p.lastSeen.toLowerCase();
        if (ls.includes('w') || (ls.includes('m') && !ls.endsWith('m')) || ls.includes('y')) {
          return false;
        }
        if (ls.endsWith('d')) {
          const days = parseInt(ls, 10);
          if (!isNaN(days) && days > 7) return false;
        }
      }
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchProf = p.profession.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchBio && !matchProf) return false;
    }

    return true;
  });

  const filteredWilayasList = ALGERIAN_WILAYAS.filter((w) =>
    w.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Search Bar & Filter Toggle Header */}
      <div className="bg-[#0F172A] rounded-2xl p-4 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>

          {/* Filter Toggle & Quick Options */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                activeFilterCount > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-[#0A0F1D] border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>{t.filterTitle}</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 rtl:mr-1 px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Reset Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
                title={t.resetFilters}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Selected Wilayas Chips Summary (When Wilayas are selected) */}
        {filters.cities.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80">
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mr-1 rtl:ml-1 rtl:mr-0">
              <MapPin className="w-3 h-3 text-amber-400" />
              {language === 'fr' ? 'Wilayas sélectionnées:' : 'الولايات المختارة:'}
            </span>
            {filters.cities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-sm"
              >
                <span>{city}</span>
                <button
                  onClick={() => removeWilaya(city)}
                  className="hover:bg-amber-500/30 p-0.5 rounded-full text-amber-300 hover:text-white transition-colors"
                  title={language === 'fr' ? 'Supprimer' : 'إزالة'}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearWilayas}
              className="text-[11px] text-slate-400 hover:text-rose-400 underline font-medium ml-2 rtl:mr-2 rtl:ml-0"
            >
              {language === 'fr' ? 'Tout effacer' : 'مسح الكل'}
            </button>
          </div>
        )}

        {/* Collapsible Filter Panel */}
        {isFilterPanelOpen && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Gender Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                {language === 'fr' ? 'Rechercher' : 'البحث عن'}
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs font-medium text-slate-100 focus:border-amber-500"
              >
                <option value="all">{t.genderAll}</option>
                <option value="female">{t.genderFemale}</option>
                <option value="male">{t.genderMale}</option>
              </select>
            </div>

            {/* Multi-Wilaya Selection Dropdown */}
            <div className="space-y-1.5 relative" ref={wilayaDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">
                  {t.cityWilaya}
                </label>
                {filters.cities.length > 0 && (
                  <span className="text-[10px] text-amber-400 font-bold">
                    {filters.cities.length} {language === 'fr' ? 'sélectionnée(s)' : 'مختارة'}
                  </span>
                )}
              </div>

              {/* Multi-Wilaya Trigger Button */}
              <button
                type="button"
                onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
                className={`w-full px-3 py-2 rounded-xl bg-[#0A0F1D] border text-xs font-medium flex items-center justify-between transition-all ${
                  filters.cities.length > 0
                    ? 'border-amber-500/50 text-amber-300 bg-amber-500/5'
                    : 'border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="truncate pr-2 rtl:pl-2 rtl:pr-0">
                  {filters.cities.length === 0
                    ? t.allCities
                    : filters.cities.length === 1
                    ? filters.cities[0]
                    : language === 'fr'
                    ? `${filters.cities.length} Wilayas sélectionnées`
                    : `${filters.cities.length} ولاية مختارة`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isWilayaDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Multi-Wilaya Popup Drawer */}
              {isWilayaDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-3 space-y-2.5 animate-fadeIn min-w-[260px]">
                  {/* Search inside Wilayas */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 rtl:right-2.5 rtl:left-auto top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Filtrer wilaya...' : 'ابحث عن ولاية...'}
                      value={wilayaSearch}
                      onChange={(e) => setWilayaSearch(e.target.value)}
                      className="w-full pl-8 rtl:pr-8 rtl:pl-2 pr-2 py-1.5 rounded-lg bg-[#0A0F1D] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Actions Header: Select All / Clear All */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={selectAllWilayas}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      {language === 'fr' ? 'Tout sélectionner' : 'تحديد الكل'}
                    </button>
                    <button
                      type="button"
                      onClick={clearWilayas}
                      className="text-slate-400 hover:text-rose-400 font-semibold"
                    >
                      {language === 'fr' ? 'Effacer la sélection' : 'إلغاء الكل'}
                    </button>
                  </div>

                  {/* Wilaya Checkboxes List */}
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredWilayasList.length > 0 ? (
                      filteredWilayasList.map((wilaya) => {
                        const isSelected = filters.cities.includes(wilaya);
                        return (
                          <label
                            key={wilaya}
                            onClick={() => toggleWilaya(wilaya)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                                : 'hover:bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{wilaya}</span>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                                  : 'border-slate-700 bg-slate-900'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-slate-500 text-center py-2">
                        {language === 'fr' ? 'Aucune wilaya trouvée' : 'لم يتم العثور على أي ولاية'}
                      </p>
                    )}
                  </div>

                  {/* Footer OK / Apply Button */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsWilayaDropdownOpen(false)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{language === 'fr' ? 'OK - Valider' : 'OK - بداية البحث'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interest Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                {t.interests}
              </label>
              <select
                value={filters.interest}
                onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs font-medium text-slate-100 focus:border-amber-500"
              >
                <option value="all">{t.allInterests}</option>
                {INTERESTS_LIST.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
            </div>

            {/* Age Range Filter */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>{t.ageRange}</span>
                <span className="text-amber-400 font-bold">{filters.minAge} - {filters.maxAge} ans</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={filters.minAge}
                  onChange={(e) => setFilters({ ...filters, minAge: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={filters.maxAge}
                  onChange={(e) => setFilters({ ...filters, maxAge: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Verified Only & Active in Last 7 Days Checkboxes */}
            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="verifiedOnly" className="text-xs font-semibold text-slate-300 flex items-center space-x-1 rtl:space-x-reverse cursor-pointer select-none">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{t.verifiedOnly}</span>
                </label>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="activeLast7Days"
                  checked={!!filters.activeLast7Days}
                  onChange={(e) => setFilters({ ...filters, activeLast7Days: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="activeLast7Days" className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === 'fr' 
                      ? 'Actifs les 7 derniers jours' 
                      : 'نشطون في التطبيق خلال الـ 7 أيام الأخيرة'}
                  </span>
                </label>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Profile Counter Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          {filteredProfiles.length} {language === 'fr' ? 'profil(s) disponible(s)' : 'ملف(ات) متاح(ة)'}
        </span>
        {activeFilterCount > 0 && (
          <span className="text-amber-400 font-medium">
            {activeFilterCount} {t.activeFilters}
          </span>
        )}
      </div>

      {/* Responsive Gallery Grid: 2 cols on mobile, 3 cols tablet, 4 cols desktop */}
      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              language={language}
              isLiked={likedProfileIds.includes(profile.id)}
              onLike={onLike}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-[#0F172A] rounded-3xl p-8 border border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">
              {t.noProfilesFound}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t.adjustFiltersHint}
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-900/20 hover:bg-amber-400 transition-colors"
          >
            {t.resetFilters}
          </button>
        </div>
      )}

    </div>
  );
};
