import React, { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Language } from '../types';
import { REGIONS, Region, ZoneCity, Woreda, TownLocality } from '../data/locations';

export interface LocationSelection {
  regionId: string;
  zoneId: string;
  woredaId: string;
  townId?: string;
  specificAddress?: string;
}

interface LocationPickerProps {
  language: Language;
  value: LocationSelection;
  onChange: (value: LocationSelection) => void;
  isFilter?: boolean; // If true, allows "All" selections
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  language,
  value,
  onChange,
  isFilter = false,
}) => {
  const isAm = language === 'am';
  const isTi = language === 'ti';

  // Get active region, zone, woreda
  const currentRegion = REGIONS.find((r) => r.id === value.regionId);
  const currentZone = currentRegion?.zones.find((z) => z.id === value.zoneId);
  const currentWoreda = currentZone?.woredas.find((w) => w.id === value.woredaId);

  // When Region changes: reset zone, woreda, town
  const handleRegionChange = (newRegionId: string) => {
    if (newRegionId === 'all') {
      onChange({ regionId: 'all', zoneId: 'all', woredaId: 'all', townId: 'all' });
      return;
    }
    const regionObj = REGIONS.find((r) => r.id === newRegionId);
    const defaultZone = isFilter ? 'all' : regionObj?.zones[0]?.id || '';
    const zoneObj = regionObj?.zones.find((z) => z.id === defaultZone);
    const defaultWoreda = isFilter ? 'all' : zoneObj?.woredas[0]?.id || '';
    onChange({
      regionId: newRegionId,
      zoneId: defaultZone,
      woredaId: defaultWoreda,
      townId: isFilter ? 'all' : '',
      specificAddress: value.specificAddress,
    });
  };

  // When Zone changes: reset woreda, town
  const handleZoneChange = (newZoneId: string) => {
    if (newZoneId === 'all') {
      onChange({ ...value, zoneId: 'all', woredaId: 'all', townId: 'all' });
      return;
    }
    const zoneObj = currentRegion?.zones.find((z) => z.id === newZoneId);
    const defaultWoreda = isFilter ? 'all' : zoneObj?.woredas[0]?.id || '';
    onChange({
      ...value,
      zoneId: newZoneId,
      woredaId: defaultWoreda,
      townId: isFilter ? 'all' : '',
    });
  };

  // When Woreda changes: reset town
  const handleWoredaChange = (newWoredaId: string) => {
    onChange({
      ...value,
      woredaId: newWoredaId,
      townId: isFilter ? 'all' : '',
    });
  };

  const handleTownChange = (newTownId: string) => {
    onChange({
      ...value,
      townId: newTownId,
    });
  };

  const getRegionName = (r: Region) => (isTi && r.nameTi ? r.nameTi : isAm ? r.nameAm : r.nameEn);
  const getZoneName = (z: ZoneCity) => (isTi && z.nameTi ? z.nameTi : isAm ? z.nameAm : z.nameEn);
  const getWoredaName = (w: Woreda) => (isTi && w.nameTi ? w.nameTi : isAm ? w.nameAm : w.nameEn);
  const getTownName = (t: TownLocality) => (isTi && t.nameTi ? t.nameTi : isAm ? t.nameAm : t.nameEn);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Region Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isTi ? '1. ክልል' : isAm ? '1. ክልል (Region)' : '1. Region'}
          </label>
          <select
            value={value.regionId}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
          >
            {isFilter && (
              <option value="all">
                {isTi ? 'መላእ ኢትዮጵያ' : isAm ? 'መላው ኢትዮጵያ' : 'All Regions (Ethiopia)'}
              </option>
            )}
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {getRegionName(r)}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Zone or City Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isTi ? '2. ዞባ / ክፍለ ከተማ' : isAm ? '2. ዞን / ክፍለ ከተማ (Zone/City)' : '2. Zone / Sub-City'}
          </label>
          <select
            value={value.zoneId}
            disabled={!currentRegion && value.regionId !== 'all'}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer disabled:opacity-50"
          >
            {isFilter && (
              <option value="all">
                {isTi ? 'ኩሎም ዞባታት' : isAm ? 'ሁሉም ዞኖች / ክፍለ ከተሞች' : 'All Zones / Sub-Cities'}
              </option>
            )}
            {currentRegion?.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {getZoneName(z)}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Woreda Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isTi ? '3. ወረዳ' : isAm ? '3. ወረዳ (Woreda)' : '3. Woreda'}
          </label>
          <select
            value={value.woredaId}
            disabled={!currentZone && value.zoneId !== 'all'}
            onChange={(e) => handleWoredaChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer disabled:opacity-50"
          >
            {isFilter && (
              <option value="all">
                {isTi ? 'ኩሎም ወረዳታት' : isAm ? 'ሁሉም ወረዳዎች' : 'All Woredas'}
              </option>
            )}
            {currentZone?.woredas.map((w) => (
              <option key={w.id} value={w.id}>
                {getWoredaName(w)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Town / Locality (Where applicable and not in filter mode) */}
      {!isFilter && currentWoreda?.towns && currentWoreda.towns.length > 0 && (
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isTi ? '4. ከባቢ / መንደር' : isAm ? '4. አካባቢ / ሰፈር (Town / Locality)' : '4. Locality / Landmark'}
          </label>
          <select
            value={value.townId || ''}
            onChange={(e) => handleTownChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
          >
            <option value="">{isAm ? '-- አካባቢ ይምረጡ --' : '-- Select Locality / Landmark --'}</option>
            {currentWoreda.towns.map((t) => (
              <option key={t.id} value={t.id}>
                {getTownName(t)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
