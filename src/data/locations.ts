export interface TownLocality {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi?: string;
}

export interface Woreda {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi?: string;
  towns?: TownLocality[];
}

export interface ZoneCity {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi?: string;
  woredas: Woreda[];
}

export interface Region {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi?: string;
  zones: ZoneCity[];
}

export interface ProductLocation {
  regionId: string;
  regionNameEn: string;
  regionNameAm: string;
  regionNameTi?: string;
  zoneId: string;
  zoneNameEn: string;
  zoneNameAm: string;
  zoneNameTi?: string;
  woredaId: string;
  woredaNameEn: string;
  woredaNameAm: string;
  woredaNameTi?: string;
  townId?: string;
  townNameEn?: string;
  townNameAm?: string;
  townNameTi?: string;
  specificAddress?: string;
}

export const REGIONS: Region[] = [
  {
    id: 'addis-ababa',
    nameEn: 'Addis Ababa',
    nameAm: 'አዲስ አበባ',
    nameTi: 'ኣዲስ ኣበባ',
    zones: [
      {
        id: 'bole',
        nameEn: 'Bole Sub-City',
        nameAm: 'ቦሌ ክፍለ ከተማ',
        nameTi: 'ቦሌ ክፍለ ከተማ',
        woredas: [
          {
            id: 'bole-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [
              { id: 'edna-mall', nameEn: 'Edna Mall / Medhanialem', nameAm: 'ኤድና ሞል / መድኃኔዓለም' },
              { id: 'atlas', nameEn: 'Atlas / Urael', nameAm: 'አትላስ / ኡራኤል' },
            ],
          },
          {
            id: 'bole-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [
              { id: 'rwanda', nameEn: 'Rwanda / Japan Embassy', nameAm: 'ሩዋንዳ / ጃፓን ኤምባሲ' },
            ],
          },
          {
            id: 'bole-w03',
            nameEn: 'Woreda 03',
            nameAm: 'ወረዳ 03',
            towns: [
              { id: 'gerji', nameEn: 'Gerji Imperial', nameAm: 'ገርጂ ኢምፔሪያል' },
              { id: 'jakros', nameEn: 'Jakros', nameAm: 'ጃክሮስ' },
            ],
          },
          {
            id: 'bole-w04',
            nameEn: 'Woreda 04',
            nameAm: 'ወረዳ 04',
            towns: [{ id: 'bulbula', nameEn: 'Bulbula 93', nameAm: 'ቡልቡላ 93' }],
          },
          { id: 'bole-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'bole-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'bole-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'bole-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'bole-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'bole-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
          { id: 'bole-w11', nameEn: 'Woreda 11', nameAm: 'ወረዳ 11' },
          { id: 'bole-w12', nameEn: 'Woreda 12', nameAm: 'ወረዳ 12' },
          { id: 'bole-w13', nameEn: 'Woreda 13', nameAm: 'ወረዳ 13' },
          { id: 'bole-w14', nameEn: 'Woreda 14', nameAm: 'ወረዳ 14' },
        ],
      },
      {
        id: 'yeka',
        nameEn: 'Yeka Sub-City',
        nameAm: 'የካ ክፍለ ከተማ',
        nameTi: 'የካ ክፍለ ከተማ',
        woredas: [
          {
            id: 'yeka-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'megenagna', nameEn: 'Megenagna', nameAm: 'መገናኛ' }],
          },
          {
            id: 'yeka-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [{ id: 'kotebe', nameEn: 'Kotebe', nameAm: 'ኮተቤ' }],
          },
          {
            id: 'yeka-w03',
            nameEn: 'Woreda 03',
            nameAm: 'ወረዳ 03',
            towns: [{ id: 'ferensay', nameEn: 'Ferensay Legasion', nameAm: 'ፈረንሳይ ለጋሲዮን' }],
          },
          { id: 'yeka-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'yeka-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'yeka-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'yeka-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'yeka-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'yeka-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'yeka-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
          { id: 'yeka-w11', nameEn: 'Woreda 11', nameAm: 'ወረዳ 11' },
          { id: 'yeka-w12', nameEn: 'Woreda 12', nameAm: 'ወረዳ 12' },
          { id: 'yeka-w13', nameEn: 'Woreda 13', nameAm: 'ወረዳ 13' },
        ],
      },
      {
        id: 'kirkos',
        nameEn: 'Kirkos Sub-City',
        nameAm: 'ቂርቆስ ክፍለ ከተማ',
        nameTi: 'ቂርቆስ ክፍለ ከተማ',
        woredas: [
          {
            id: 'kirkos-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'kazanchis', nameEn: 'Kazanchis', nameAm: 'ካዛንቺስ' }],
          },
          {
            id: 'kirkos-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [{ id: 'beklobet', nameEn: 'Beklobet / Lancha', nameAm: 'በቅሎ ቤት / ላንቻ' }],
          },
          { id: 'kirkos-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'kirkos-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'kirkos-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'kirkos-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'kirkos-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'kirkos-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'kirkos-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'kirkos-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
          { id: 'kirkos-w11', nameEn: 'Woreda 11', nameAm: 'ወረዳ 11' },
        ],
      },
      {
        id: 'arada',
        nameEn: 'Arada Sub-City',
        nameAm: 'አራዳ ክፍለ ከተማ',
        nameTi: 'ኣራዳ ክፍለ ከተማ',
        woredas: [
          {
            id: 'arada-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'piassa', nameEn: 'Piassa / De Gaulle', nameAm: 'ፒያሳ / ደጎል' }],
          },
          {
            id: 'arada-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [{ id: 'arat-kilo', nameEn: 'Arat Kilo', nameAm: 'አራት ኪሎ' }],
          },
          { id: 'arada-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'arada-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'arada-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'arada-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'arada-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'arada-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'arada-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'arada-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
        ],
      },
      {
        id: 'addis-ketema',
        nameEn: 'Addis Ketema Sub-City',
        nameAm: 'አዲስ ከተማ ክፍለ ከተማ',
        nameTi: 'ኣዲስ ከተማ ክፍለ ከተማ',
        woredas: [
          {
            id: 'ak-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'merkato', nameEn: 'Merkato Military Tera', nameAm: 'መርካቶ ወታደር ተራ' }],
          },
          {
            id: 'ak-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [{ id: 'autobis-tera', nameEn: 'Autobis Tera', nameAm: 'አውቶቡስ ተራ' }],
          },
          { id: 'ak-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'ak-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'ak-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'ak-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'ak-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'ak-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'ak-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'ak-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
        ],
      },
      {
        id: 'lideta',
        nameEn: 'Lideta Sub-City',
        nameAm: 'ልደታ ክፍለ ከተማ',
        nameTi: 'ልደታ ክፍለ ከተማ',
        woredas: [
          {
            id: 'lideta-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'balcha', nameEn: 'Balcha / Mexico', nameAm: 'ባልቻ / ሜክሲኮ' }],
          },
          { id: 'lideta-w02', nameEn: 'Woreda 02', nameAm: 'ወረዳ 02' },
          { id: 'lideta-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'lideta-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'lideta-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'lideta-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'lideta-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'lideta-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'lideta-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'lideta-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
        ],
      },
      {
        id: 'nefas-silk',
        nameEn: 'Nefas Silk-Lafto Sub-City',
        nameAm: 'ንፋስ ስልክ ላፍቶ ክፍለ ከተማ',
        nameTi: 'ንፋስ ስልክ ላፍቶ ክፍለ ከተማ',
        woredas: [
          {
            id: 'nsl-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'sarbet', nameEn: 'Sarbet / Bisrate Gabriel', nameAm: 'ሳርቤት / ብስራተ ገብርኤል' }],
          },
          {
            id: 'nsl-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [{ id: 'lafto', nameEn: 'Lafto / Jomo', nameAm: 'ላፍቶ / ጆሞ' }],
          },
          { id: 'nsl-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'nsl-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'nsl-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'nsl-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'nsl-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'nsl-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'nsl-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'nsl-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
          { id: 'nsl-w11', nameEn: 'Woreda 11', nameAm: 'ወረዳ 11' },
          { id: 'nsl-w12', nameEn: 'Woreda 12', nameAm: 'ወረዳ 12' },
        ],
      },
      {
        id: 'kolfe-keranio',
        nameEn: 'Kolfe Keranio Sub-City',
        nameAm: 'ኮልፌ ቀራኒዮ ክፍለ ከተማ',
        nameTi: 'ኮልፌ ቀራኒዮ ክፍለ ከተማ',
        woredas: [
          { id: 'kk-w01', nameEn: 'Woreda 01', nameAm: 'ወረዳ 01' },
          { id: 'kk-w02', nameEn: 'Woreda 02', nameAm: 'ወረዳ 02' },
          { id: 'kk-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'kk-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'kk-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'kk-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'kk-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'kk-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'kk-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'kk-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
          { id: 'kk-w11', nameEn: 'Woreda 11', nameAm: 'ወረዳ 11' },
          { id: 'kk-w12', nameEn: 'Woreda 12', nameAm: 'ወረዳ 12' },
          { id: 'kk-w13', nameEn: 'Woreda 13', nameAm: 'ወረዳ 13' },
          { id: 'kk-w14', nameEn: 'Woreda 14', nameAm: 'ወረዳ 14' },
          { id: 'kk-w15', nameEn: 'Woreda 15', nameAm: 'ወረዳ 15' },
        ],
      },
      {
        id: 'gullele',
        nameEn: 'Gullele Sub-City',
        nameAm: 'ጉለሌ ክፍለ ከተማ',
        nameTi: 'ጉለሌ ክፍለ ከተማ',
        woredas: [
          {
            id: 'gullele-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'shiromeda', nameEn: 'Shiromeda', nameAm: 'ሽሮሜዳ' }],
          },
          { id: 'gullele-w02', nameEn: 'Woreda 02', nameAm: 'ወረዳ 02' },
          { id: 'gullele-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'gullele-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'gullele-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'gullele-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'gullele-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'gullele-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'gullele-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'gullele-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
        ],
      },
      {
        id: 'akaki-kality',
        nameEn: 'Akaki Kality Sub-City',
        nameAm: 'አቃቂ ቃሊቲ ክፍለ ከተማ',
        nameTi: 'ኣቓቒ ቓሊቲ ክፍለ ከተማ',
        woredas: [
          { id: 'akaki-w01', nameEn: 'Woreda 01', nameAm: 'ወረዳ 01' },
          { id: 'akaki-w02', nameEn: 'Woreda 02', nameAm: 'ወረዳ 02' },
          { id: 'akaki-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'akaki-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'akaki-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'akaki-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'akaki-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'akaki-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'akaki-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'akaki-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
          { id: 'akaki-w11', nameEn: 'Woreda 11', nameAm: 'ወረዳ 11' },
          { id: 'akaki-w12', nameEn: 'Woreda 12', nameAm: 'ወረዳ 12' },
        ],
      },
      {
        id: 'lemi-kura',
        nameEn: 'Lemi Kura Sub-City',
        nameAm: 'ለሚ ኩራ ክፍለ ከተማ',
        nameTi: 'ለሚ ኩራ ክፍለ ከተማ',
        woredas: [
          {
            id: 'lk-w01',
            nameEn: 'Woreda 01',
            nameAm: 'ወረዳ 01',
            towns: [{ id: 'cmc', nameEn: 'CMC Michael', nameAm: 'ሲኤምሲ ሚካኤል' }],
          },
          {
            id: 'lk-w02',
            nameEn: 'Woreda 02',
            nameAm: 'ወረዳ 02',
            towns: [{ id: 'ayat', nameEn: 'Ayat Zone 2', nameAm: 'አያት ዞን 2' }],
          },
          { id: 'lk-w03', nameEn: 'Woreda 03', nameAm: 'ወረዳ 03' },
          { id: 'lk-w04', nameEn: 'Woreda 04', nameAm: 'ወረዳ 04' },
          { id: 'lk-w05', nameEn: 'Woreda 05', nameAm: 'ወረዳ 05' },
          { id: 'lk-w06', nameEn: 'Woreda 06', nameAm: 'ወረዳ 06' },
          { id: 'lk-w07', nameEn: 'Woreda 07', nameAm: 'ወረዳ 07' },
          { id: 'lk-w08', nameEn: 'Woreda 08', nameAm: 'ወረዳ 08' },
          { id: 'lk-w09', nameEn: 'Woreda 09', nameAm: 'ወረዳ 09' },
          { id: 'lk-w10', nameEn: 'Woreda 10', nameAm: 'ወረዳ 10' },
        ],
      },
    ],
  },
  {
    id: 'tigray',
    nameEn: 'Tigray Region',
    nameAm: 'ትግራይ ክልል',
    nameTi: 'ትግራይ ክልል',
    zones: [
      {
        id: 'mekelle-zone',
        nameEn: 'Mekelle Special Zone',
        nameAm: 'መቐለ ልዩ ዞን',
        nameTi: 'መቐለ ፍሉይ ዞባ',
        woredas: [
          { id: 'kedamay-weyane', nameEn: 'Kedamay Weyane', nameAm: 'ቀዳማይ ወያነ', nameTi: 'ቀዳማይ ወያነ' },
          { id: 'hadnet', nameEn: 'Hadnet', nameAm: 'ሓድነት', nameTi: 'ሓድነት' },
          { id: 'ayder', nameEn: 'Ayder', nameAm: 'ዓይደር', nameTi: 'ዓይደር' },
          { id: 'semien', nameEn: 'Semien', nameAm: 'ሰሜን', nameTi: 'ሰሜን' },
          { id: 'hawelti', nameEn: 'Hawelti', nameAm: 'ሓወልቲ', nameTi: 'ሓወልቲ' },
          { id: 'adi-haqi', nameEn: 'Adi Haqi', nameAm: 'ዓዲ ሓቂ', nameTi: 'ዓዲ ሓቂ' },
          { id: 'quiha', nameEn: 'Quiha', nameAm: 'ኲሓ', nameTi: 'ኲሓ' },
        ],
      },
      {
        id: 'central-tigray',
        nameEn: 'Central Tigray Zone',
        nameAm: 'ማእከላዊ ትግራይ ዞን',
        nameTi: 'ማእከላይ ዞባ ትግራይ',
        woredas: [
          { id: 'axum-city', nameEn: 'Axum Town', nameAm: 'አክሱም ከተማ', nameTi: 'ከተማ ኣኽሱም' },
          { id: 'adwa-city', nameEn: 'Adwa Town', nameAm: 'ዓድዋ ከተማ', nameTi: 'ከተማ ዓድዋ' },
          { id: 'enticho', nameEn: 'Enticho', nameAm: 'ዕንቲጮ', nameTi: 'ዕንቲጮ' },
          { id: 'rama', nameEn: 'Rama', nameAm: 'ራማ', nameTi: 'ራማ' },
          { id: 'tahtay-maychew', nameEn: 'Tahtay Maychew', nameAm: 'ታሕታይ ማይጨው', nameTi: 'ታሕታይ ማይጨው' },
          { id: 'laelay-maychew', nameEn: 'Laelay Maychew', nameAm: 'ላዕላይ ማይጨው', nameTi: 'ላዕላይ ማይጨው' },
          { id: 'mereb-lehe', nameEn: 'Mereb Lehe', nameAm: 'መረብ ለኸ', nameTi: 'መረብ ለኸ' },
          { id: 'kola-tembien', nameEn: 'Kola Tembien (Abi Adi)', nameAm: 'ቆላ ተምቤን (ዓቢይ ዓዲ)', nameTi: 'ቆላ ተምቤን (ዓቢይ ዓዲ)' },
          { id: 'naeder-adet', nameEn: 'Naeder Adet', nameAm: 'ናዕዴር ዓዴት', nameTi: 'ናዕዴር ዓዴት' },
          { id: 'werie-lehe', nameEn: 'Werie Lehe', nameAm: 'ወረዒ ለኸ', nameTi: 'ወረዒ ለኸ' },
        ],
      },
      {
        id: 'eastern-tigray',
        nameEn: 'Eastern Tigray Zone',
        nameAm: 'ምስራቃዊ ትግራይ ዞን',
        nameTi: 'ምስራቓዊ ዞባ ትግራይ',
        woredas: [
          { id: 'adigrat-city', nameEn: 'Adigrat Town', nameAm: 'ዓዲግራት ከተማ', nameTi: 'ከተማ ዓዲግራት' },
          { id: 'wukro-city', nameEn: 'Wukro Town', nameAm: 'ውቅሮ ከተማ', nameTi: 'ከተማ ውቕሮ' },
          { id: 'ganta-afeshum', nameEn: 'Ganta Afeshum', nameAm: 'ጋንታ አፈሹም', nameTi: 'ጋንታ ኣፈሹም' },
          { id: 'gulomahda', nameEn: 'Gulomahda (Zalambessa)', nameAm: 'ጉሎማኸዳ (ዛላምበሳ)', nameTi: 'ጉሎማኸዳ (ዛላምበሳ)' },
          { id: 'saesi-tsaedaemba', nameEn: 'Saesi Tsaedaemba (Freweyni)', nameAm: 'ሳዕሲዕ ጻዕዳእምባ (ፍረወይኒ)', nameTi: 'ሳዕሲዕ ጻዕዳእምባ (ፍረወይኒ)' },
          { id: 'hawzen', nameEn: 'Hawzen', nameAm: 'ሓውዜን', nameTi: 'ሓውዜን' },
          { id: 'irob', nameEn: 'Irob', nameAm: 'ኢሮብ', nameTi: 'ዒሮብ' },
          { id: 'kilte-awlaelo', nameEn: 'Kilte Awlaelo', nameAm: 'ክልተ አውላዕሎ', nameTi: 'ክልተ ኣውላዕሎ' },
          { id: 'atsbi-wonberta', nameEn: 'Atsbi Wonberta', nameAm: 'አጽቢ ወንበርታ', nameTi: 'ኣጽቢ ወንበርታ' },
        ],
      },
      {
        id: 'north-western-tigray',
        nameEn: 'North Western Tigray Zone',
        nameAm: 'ሰሜን ምዕራብ ትግራይ ዞን',
        nameTi: 'ሰሜን ምዕራብ ዞባ ትግራይ',
        woredas: [
          { id: 'shire-city', nameEn: 'Shire Inda Selassie', nameAm: 'ሽረ እንዳስላሴ', nameTi: 'ሽረ እንዳስላሴ' },
          { id: 'sheraro-city', nameEn: 'Sheraro Town', nameAm: 'ሽራሮ ከተማ', nameTi: 'ከተማ ሽራሮ' },
          { id: 'asgede-tsimbla', nameEn: 'Asgede Tsimbla', nameAm: 'አስገደ ጽምብላ', nameTi: 'ኣስገደ ጽምብላ' },
          { id: 'medebay-zana', nameEn: 'Medebay Zana', nameAm: 'መደባይ ዛና', nameTi: 'መደባይ ዛና' },
          { id: 'tahtay-koraro', nameEn: 'Tahtay Koraro', nameAm: 'ታሕታይ ቆራሮ', nameTi: 'ታሕታይ ቆራሮ' },
          { id: 'tselemti', nameEn: 'Tselemti', nameAm: 'ጸለምቲ', nameTi: 'ጸለምቲ' },
          { id: 'laelay-adyabo', nameEn: 'Laelay Adyabo', nameAm: 'ላዕላይ ዓዲያቦ', nameTi: 'ላዕላይ ዓዲያቦ' },
        ],
      },
      {
        id: 'south-eastern-tigray',
        nameEn: 'South Eastern Tigray Zone',
        nameAm: 'ደቡብ ምስራቅ ትግራይ ዞን',
        nameTi: 'ደቡብ ምስራቕ ዞባ ትግራይ',
        woredas: [
          { id: 'degua-tembien', nameEn: 'Degua Tembien (Hagere Selam)', nameAm: 'ደጉዓ ተምቤን (ሀገረ ሰላም)', nameTi: 'ደጉዓ ተምቤን (ሃገረ ሰላም)' },
          { id: 'enderta', nameEn: 'Enderta', nameAm: 'እንዳርታ', nameTi: 'እንዳርታ' },
          { id: 'hintalo', nameEn: 'Hintalo', nameAm: 'ህንጣሎ', nameTi: 'ህንጣሎ' },
          { id: 'wajirat', nameEn: 'Wajirat', nameAm: 'ዋጅራት', nameTi: 'ዋጅራት' },
        ],
      },
      {
        id: 'southern-tigray',
        nameEn: 'Southern Tigray Zone',
        nameAm: 'ደቡባዊ ትግራይ ዞን',
        nameTi: 'ደቡባዊ ዞባ ትግራይ',
        woredas: [
          { id: 'maychew-city', nameEn: 'Maychew Town', nameAm: 'ማይጨው ከተማ', nameTi: 'ከተማ ማይጨው' },
          { id: 'korem-city', nameEn: 'Korem Town', nameAm: 'ኮረም ከተማ', nameTi: 'ከተማ ኮረም' },
          { id: 'alamata-city', nameEn: 'Alamata Town', nameAm: 'አላማጣ ከተማ', nameTi: 'ከተማ ኣላማጣ' },
          { id: 'raya-azebo', nameEn: 'Raya Azebo (Mehoni)', nameAm: 'ራያ አዘቦ (መሆኒ)', nameTi: 'ራያ ዓዘቦ (መሖኒ)' },
          { id: 'raya-alamata', nameEn: 'Raya Alamata', nameAm: 'ራያ አላማጣ', nameTi: 'ራያ ኣላማጣ' },
          { id: 'ofla', nameEn: 'Ofla', nameAm: 'ኦፍላ', nameTi: 'ኦፍላ' },
          { id: 'endamehoni', nameEn: 'Endamehoni', nameAm: 'እንዳመሖኒ', nameTi: 'እንዳመሖኒ' },
          { id: 'emba-alaje', nameEn: 'Emba Alaje', nameAm: 'እምባ አላጀ', nameTi: 'እምባ ኣላጀ' },
        ],
      },
      {
        id: 'western-tigray',
        nameEn: 'Western Tigray Zone',
        nameAm: 'ምዕራባዊ ትግራይ ዞን',
        nameTi: 'ምዕራባዊ ዞባ ትግራይ',
        woredas: [
          { id: 'humera-city', nameEn: 'Setit Humera', nameAm: 'ሰቲት ሑመራ', nameTi: 'ሰቲት ሑመራ' },
          { id: 'kafta-humera', nameEn: 'Kafta Humera', nameAm: 'ቃፍታ ሑመራ', nameTi: 'ቃፍታ ሑመራ' },
          { id: 'wolkait', nameEn: 'Wolkait', nameAm: 'ወልቃይት', nameTi: 'ወልቃይት' },
          { id: 'tsegede', nameEn: 'Tsegede', nameAm: 'ጸገዴ', nameTi: 'ጸገዴ' },
        ],
      },
    ],
  },
  {
    id: 'sidama',
    nameEn: 'Sidama Region',
    nameAm: 'ሲዳማ ክልል',
    nameTi: 'ሲዳማ ክልል',
    zones: [
      {
        id: 'hawassa-city',
        nameEn: 'Hawassa City',
        nameAm: 'ሀዋሳ ከተማ',
        nameTi: 'ሃዋሳ ከተማ',
        woredas: [
          { id: 'menahariya', nameEn: 'Menahariya', nameAm: 'መናሀሪያ' },
          { id: 'tabor', nameEn: 'Tabor', nameAm: 'ታቦር' },
          { id: 'hayk-dar', nameEn: 'Hayk Dar', nameAm: 'ሐይቅ ዳር' },
          { id: 'misrak', nameEn: 'Misrak', nameAm: 'ምስራቅ' },
        ],
      },
    ],
  },
  {
    id: 'amhara',
    nameEn: 'Amhara Region',
    nameAm: 'አማራ ክልል',
    nameTi: 'ኣምሓራ ክልል',
    zones: [
      {
        id: 'bahirdar-city',
        nameEn: 'Bahir Dar City',
        nameAm: 'ባህር ዳር ከተማ',
        nameTi: 'ባሕር ዳር ከተማ',
        woredas: [
          { id: 'gish-abay', nameEn: 'Gish Abay', nameAm: 'ግሽ አባይ' },
          { id: 'fasilo', nameEn: 'Fasilo', nameAm: 'ፋሲሎ' },
          { id: 'shimbit', nameEn: 'Shimbit', nameAm: 'ሽምቢት' },
        ],
      },
    ],
  },
];
