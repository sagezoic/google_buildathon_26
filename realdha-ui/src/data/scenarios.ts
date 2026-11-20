export interface Scenario {
  id: string
  label: string
  tag: string
  unit: string
  unitType: string
  tower: string
  floor: string
  project: string
  location: string
  realdhaId: string
  mahaRera: string
  asking: string
  facing: string
  floorHeight: string
  carpet: string
  builtUp: string
  balcony: string
  stamp: StampVerdict
  findings: Finding[]
  note?: Finding
  sha256: string
  txHash: string
  blockNumber: string
  documents: DocumentRecord[]
  north: AdjacentUnit
  south: AdjacentUnit
  east: AdjacentUnit
  west: AdjacentUnit
  above: AdjacentUnit
  below: AdjacentUnit
  titleChainYears: string
  titleChainBar: TitleChainSegment[]
  titleChainTicks: TitleChainTickDetail[]
  lawyerSignOff: {
    status: 'pending' | 'required' | 'completed'
    advocateName?: string
    barCouncilNo?: string
    notes: string
  }
  chips: string[]
  groundedQA: GroundedQA[]
  floorPlan: FloorPlanData
  lightSimulation: {
    morningAngle: number
    morningDesc: string
    afternoonAngle: number
    afternoonDesc: string
    balconyView: string
  }
  streetAddress?: string
  cityStateZip?: string
  beds?: number
  baths?: number
  avgRentalYield?: string
  currentRentalYield?: string
  valuationDelta?: string
  investorCount?: number
  tokenPrice?: string
  categoryPills?: string[]
  images?: string[]
  marketValue?: string
  fairValue?: string
}

export interface StampVerdict {
  type: 'clear' | 'warning' | 'defect' | 'mortgage'
  sealMarathi: string
  sealEnglish: string
  title: string
  subtitle: string
  serialNo: string
  date: string
  stampColor: string
}

export interface Finding {
  id: string
  status: 'pass' | 'note' | 'alert'
  title: string
  quote: string
  sourceDoc: string
  page: string
  clause: string
}

export interface DocumentRecord {
  id: string
  name: string
  type: string
  status: 'verified' | 'flagged' | 'pending' | 'translated'
  date: string
  authority: string
  sha256: string
  pageCount: number
  originalExcerptMarathi: string
  translatedExcerptEnglish: string
  extractedFields: { label: string; value: string }[]
}

export interface AdjacentUnit {
  name: string
  description: string
  realdhaId?: string
  status?: string
}

export interface TitleChainSegment {
  years: string
  color: string
  width: string
  holder: string
  transferType: string
}

export interface TitleChainTickDetail {
  year: string
  label: string
  detail: string
  docRef: string
}

export interface GroundedQA {
  question: string
  answer: string
  citation: string
  sourceDocId: string
}

export interface FloorPlanRoom {
  name: string
  nameDv: string
  dimensions: string
  areaSqFt: number
  x: number
  y: number
  w: number
  h: number
  fillColor?: string
}

export interface FloorPlanData {
  type: 'highrise' | 'plot' | 'warehouse'
  rooms: FloorPlanRoom[]
  entryPoint: { x: number; y: number; label: string }
  balconies?: { name: string; x: number; y: number; w: number; h: number }[]
  compassOrientation: string
  indicativeDisclaimer: string
}

export const scenarios: Scenario[] = [
  {
    id: 'pune-highrise',
    label: '1 Pune high-rise A-1804 · Clear',
    tag: 'Demo data',
    unit: 'Unit A-1804 · 3 BHK',
    unitType: '3 BHK High-Rise Apartment',
    tower: 'Tower A',
    floor: 'Floor 18',
    project: 'Amanora Park Town',
    location: 'Hadapsar, Pune',
    realdhaId: 'RA-PUN-001-A-18-04',
    mahaRera: 'P52100018892',
    asking: '₹1.65 Cr',
    facing: 'East',
    floorHeight: '54 m',
    carpet: '1,180 sq ft',
    builtUp: '1,420 sq ft',
    balcony: 'Unobstructed Sahyadri Hill View',
    streetAddress: 'Unit A-1804 Amanora Town',
    cityStateZip: 'Hadapsar, Pune 411028',
    beds: 3,
    baths: 3,
    avgRentalYield: '5.09%',
    currentRentalYield: '0%',
    valuationDelta: '3% Overvalued',
    investorCount: 271,
    tokenPrice: '₹1,000 /token',
    marketValue: '₹1.65 Cr',
    fairValue: '₹1.60 Cr',
    categoryPills: ['High-Rise', 'No Mortgage', 'Verified Title', 'MahaRERA'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    ],
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र शासन महसूल नोंदणी · प्रमाणित अभिलेख',
      sealEnglish: 'MAHARASHTRA REVENUE REGISTRATION · VERIFIED RECORD',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: '30-year chain unbroken · MahaRERA verified · 1 procedural note',
      serialNo: 'MH-REV-2026-PUN-00194',
      date: '20-Nov-2026',
      stampColor: '#4A154B', // Authentic violet stamp
    },
    findings: [
      {
        id: 'f1',
        status: 'pass',
        title: '30-year title chain unbroken (1996–2026)',
        quote: 'conveyed to the present holder with clear marketable rights',
        sourceDoc: 'Index II Registered Agreement (2021)',
        page: 'p. 2',
        clause: 'Recital Clause IV(b)',
      },
      {
        id: 'f2',
        status: 'pass',
        title: 'Sanctioned plan matches 1,180 sq ft carpet',
        quote: 'Carpet area 109.6 sq m (1,180 sq ft) sanctioned under PMC plan #BP-2018-992',
        sourceDoc: 'Commencement Certificate & Sanctioned Plan (PMC)',
        page: 'Sheet 4',
        clause: 'Approval Schedule C',
      },
      {
        id: 'f3',
        status: 'pass',
        title: 'Encumbrance clear, bank NOC on file',
        quote: 'No prior charge, mortgage or lien subsisting as of search date',
        sourceDoc: 'Bank NOC & 30-Year Search Report',
        page: 'p. 1',
        clause: 'Encumbrance Certificate',
      },
    ],
    note: {
      id: 'f4',
      status: 'note',
      title: 'NOTE · Ferfar #4120 heir release (Marathi): confirm procedural filing',
      quote: 'वारस हक्क सोडपत्र (Relinquishment of co-parcenary share filed under mutation entry #4120)',
      sourceDoc: 'Marathi Ferfar (Mutation Entry #4120)',
      page: 'p. 1',
      clause: 'Mutation Remark 3',
    },
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    txHash: '0x7f9a1288c3e614bc549921e491950d240d992131e505a413d077478051233b21',
    blockNumber: '19,842,109',
    documents: [
      {
        id: 'doc-1',
        name: 'MahaRERA Registration Certificate',
        type: 'MahaRERA Cert',
        status: 'verified',
        date: '14-Mar-2019',
        authority: 'Maharashtra Real Estate Regulatory Authority',
        sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        pageCount: 6,
        originalExcerptMarathi: 'महाराष्ट्र महारेरा नोंदणी क्रमांक P52100018892 अन्वये प्रकल्प अमनोरा पार्क टाउन, टॉवर A अधिकृतपणे नोंदणीकृत असून दिनांक ३१/१२/२०२६ पर्यंत वैध आहे.',
        translatedExcerptEnglish: 'MahaRERA Registration No. P52100018892 confirms project Amanora Park Town, Tower A is duly registered and valid through 31/12/2026. Sanctioned carpet area matches filing.',
        extractedFields: [
          { label: 'RERA Number', value: 'P52100018892' },
          { label: 'Promoter', value: 'City Corporation Ltd' },
          { label: 'Proposed End Date', value: '31-Dec-2026' },
          { label: 'Sanctioned Floors', value: 'Ground + 24 Floors' },
        ],
      },
      {
        id: 'doc-2',
        name: 'Index II Registered Agreement (2021)',
        type: 'Index II Deed',
        status: 'verified',
        date: '28-Oct-2021',
        authority: 'Haveli Sub-Registrar Office #12, Pune',
        sha256: '7f9a1288c3e614bc549921e491950d240d992131e505a413d077478051233b21',
        pageCount: 14,
        originalExcerptMarathi: 'दस्त क्र. ८९४२/२०२१: फ्लॅट क्र. १८०४, १८ वा मजला, टॉवर ए, चटई क्षेत्र १०९.६० चौ.मी. (११८० चौ.फूट), मुद्रांक शुल्क भरणा ₹९,९०,०००/- अदा केले असून मालकी हस्तांतरण निष्कलंक आहे.',
        translatedExcerptEnglish: 'Deed No. 8942/2021: Flat No. 1804, 18th Floor, Tower A, carpet area 109.60 sq m (1,180 sq ft), Stamp Duty ₹9,90,000/- fully discharged; ownership conveyed unencumbered.',
        extractedFields: [
          { label: 'Registration No', value: 'Haveli-12/8942/2021' },
          { label: 'Stamp Duty Paid', value: '₹9,90,000 (Fully Paid)' },
          { label: 'Market Valuation', value: '₹1,65,00,000' },
          { label: 'Consideration', value: '₹1,65,00,000' },
        ],
      },
      {
        id: 'doc-3',
        name: 'Marathi 7/12 Extract (Gat #84)',
        type: 'Revenue 7/12',
        status: 'translated',
        date: '02-Nov-2026',
        authority: 'Talathi Saza Hadapsar, Taluka Haveli',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pageCount: 3,
        originalExcerptMarathi: 'गाव नमुना सात (अधिकार अभिलेख पत्रक) - गट क्र. ८४/२: एकूण क्षेत्र ४ हेक्टर २० आर. बिगरशेती (NA) रूपांतरित. इतर अधिकार स्तंभात कोणताही सरकारी किंवा बँक बोजा शिल्लक नाही.',
        translatedExcerptEnglish: 'Village Form VII (Record of Rights) - Gat No. 84/2: Total area 4 Ha 20 R. Converted to Non-Agricultural (NA) use. Other Rights column reflects zero outstanding bank loans or government charges.',
        extractedFields: [
          { label: 'Gat / Survey No', value: 'Gat 84/2, Saza Hadapsar' },
          { label: 'Tenure Status', value: 'Bhogwatdar Class 1 (Freehold)' },
          { label: 'NA Conversion', value: 'Collector Order NA/104/2014' },
          { label: 'Encumbrance Remark', value: 'निरंक (Nil / Unencumbered)' },
        ],
      },
      {
        id: 'doc-4',
        name: 'Commencement Certificate (PMC)',
        type: 'PMC CC',
        status: 'verified',
        date: '19-Jan-2018',
        authority: 'Pune Municipal Corporation Building Permission Dept',
        sha256: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
        pageCount: 8,
        originalExcerptMarathi: 'पुणे महानगरपालिका बांधकाम परवानगी क्र. CC/2018/1429: टॉवर ए मजला २४ पर्यंत बांधकाम करण्यास परवानगी देण्यात आली आहे. मंजूर चटई क्षेत्र ११८० चौ.फूट.',
        translatedExcerptEnglish: 'PMC Commencement Certificate CC/2018/1429: Sanction granted for construction up to Floor 24 of Tower A. Sanctioned carpet area matches 1,180 sq ft specification.',
        extractedFields: [
          { label: 'CC Number', value: 'PMC/BP/CC/2018/1429' },
          { label: 'Plinth Check', value: 'Verified & Certified' },
          { label: 'Sanctioned Height', value: '72 Metres' },
          { label: 'Fire NOC Status', value: 'CFO Compliant #PMC/FIRE/884' },
        ],
      },
    ],
    north: {
      name: 'Unit A-1803',
      description: 'Adjacent 3 BHK apartment, symmetric layout, private party wall',
      realdhaId: 'RA-PUN-001-A-18-03',
      status: 'Occupied · Verified',
    },
    south: {
      name: 'Unit A-1805',
      description: 'Adjacent 2.5 BHK apartment, service shaft separation',
      realdhaId: 'RA-PUN-001-A-18-05',
      status: 'Verified',
    },
    east: {
      name: 'Balcony & East Facade',
      description: 'Unobstructed morning light, overlooking Amanora green belt & Sahyadri foothills',
    },
    west: {
      name: 'Central Lobby & Lifts',
      description: 'Access corridor, 3 high-speed passenger elevators, fire escape staircase',
    },
    above: {
      name: 'Unit A-1904',
      description: 'Floor 19, identical 3 BHK residential layout (no rooftop plant or pool)',
      realdhaId: 'RA-PUN-001-A-19-04',
      status: 'Verified',
    },
    below: {
      name: 'Unit A-1704',
      description: 'Floor 17, identical 3 BHK residential layout',
      realdhaId: 'RA-PUN-001-A-17-04',
      status: 'Verified',
    },
    titleChainYears: '30 years unbroken (1996–2026)',
    titleChainBar: [
      { years: '1996–2004', color: '#22307A', width: '27%', holder: 'Kulkarni Family (Ancestral)', transferType: '7/12 Ancestral Holding' },
      { years: '2004–2012', color: '#324394', width: '27%', holder: 'Amanora Development Trust', transferType: 'Registered Sale Deed #4401' },
      { years: '2012–2021', color: '#1E7A46', width: '30%', holder: 'City Corp Project SPV', transferType: 'MahaRERA Sanctioned Development' },
      { years: '2021–2026', color: '#4A154B', width: '16%', holder: 'Current Allottee', transferType: 'Registered Index II #8942' },
    ],
    titleChainTicks: [
      { year: '1996', label: 'Ancestral Title', detail: 'Survey 84 recorded in Talathi register with clean heir succession', docRef: '7/12 Extract Gat #84' },
      { year: '2004', label: 'Township Acquisition', detail: 'Conveyance executed for integrated township master plan', docRef: 'Sale Deed #4401/2004' },
      { year: '2012', label: 'PMC CC Sanction', detail: 'Commencement Certificate issued for Sector 2 Towers', docRef: 'PMC CC #1429' },
      { year: '2021', label: 'Ferfar #4120 Release', detail: 'Procedural relinquishment deed recorded in Taluka register', docRef: 'Ferfar #4120' },
      { year: '2026', label: 'Active REALDHA Passport', detail: 'Cryptographically anchored on Ethereum ledger via Cloud KMS', docRef: 'SHA-256 e3b0c442' },
    ],
    lawyerSignOff: {
      status: 'pending',
      advocateName: 'Adv. S. Deshmukh & Associates (Pune Bar Council)',
      notes: 'Chain of title is clean; pending routine verification of Ferfar #4120 procedural filing before final closing deed.',
    },
    chips: [
      'Any unreleased bank mortgage?',
      'Translate Ferfar #4120 note',
      'What is directly above floor 18?',
      'Check MahaRERA completion date',
    ],
    groundedQA: [
      {
        question: 'Any unreleased bank mortgage?',
        answer: 'No. The Encumbrance Certificate (1996–2026) issued by Sub-Registrar Haveli-12 and the Bank NOC on file confirm zero subsisting mortgages, liens, or institutional charges on Unit A-1804.',
        citation: 'Bank NOC & Search Report p. 1 · Clause II',
        sourceDocId: 'doc-3',
      },
      {
        question: 'Translate Ferfar #4120 note',
        answer: 'Ferfar (Mutation Entry) #4120 records "वारस हक्क सोडपत्र" (Relinquishment of co-parcenary share by legal heirs) executed before the Talathi in 2021. The heirs surrendered claim in favor of the primary vendor with consideration fully receipted.',
        citation: 'Marathi Ferfar #4120 p. 1 · Column 4',
        sourceDocId: 'doc-3',
      },
      {
        question: 'What is directly above floor 18?',
        answer: 'Directly above Unit A-1804 is Unit A-1904 on the 19th floor. It is an identical 3 BHK residential apartment. There is no rooftop machinery, cooling tower, or water pump overhead.',
        citation: 'PMC Sanctioned Plan Sheet 4 · Stack Elevation',
        sourceDocId: 'doc-4',
      },
      {
        question: 'Check MahaRERA completion date',
        answer: 'MahaRERA Registration Certificate P52100018892 specifies the sanctioned completion date as 31-Dec-2026. The promoter City Corporation Ltd maintains active quarterly compliance filings.',
        citation: 'MahaRERA Cert p. 1 · Validity Section',
        sourceDocId: 'doc-1',
      },
    ],
    floorPlan: {
      type: 'highrise',
      indicativeDisclaimer: 'Indicative architectural layout · Refer to MahaRERA sanctioned plan sheet 4 for structural specifications',
      compassOrientation: 'East-Facing (Balcony & Living Room open to East morning light)',
      entryPoint: { x: 20, y: 130, label: 'Main Entry (West Corridor)' },
      rooms: [
        { name: 'Living & Dining Room', nameDv: 'दिवाणखाना', dimensions: "21'0\" × 12'6\"", areaSqFt: 262, x: 50, y: 60, w: 140, h: 140, fillColor: '#FAFBF8' },
        { name: 'Master Bedroom', nameDv: 'मुख्य शयनकक्ष', dimensions: "14'0\" × 12'0\"", areaSqFt: 168, x: 195, y: 40, w: 120, h: 90, fillColor: '#F4F5F1' },
        { name: 'Bedroom 2', nameDv: 'शयनकक्ष २', dimensions: "12'0\" × 11'0\"", areaSqFt: 132, x: 195, y: 135, w: 120, h: 80, fillColor: '#F4F5F1' },
        { name: 'Bedroom 3 / Study', nameDv: 'शयनकक्ष ३', dimensions: "11'0\" × 10'0\"", areaSqFt: 110, x: 50, y: 205, w: 90, h: 85, fillColor: '#F4F5F1' },
        { name: 'Kitchen & Utility', nameDv: 'स्वयंपाकघर', dimensions: "10'6\" × 8'0\"", areaSqFt: 84, x: 145, y: 205, w: 85, h: 85, fillColor: '#F0F2EC' },
        { name: 'Ensuite Bath 1', nameDv: 'स्नानगृह १', dimensions: "8'0\" × 5'0\"", areaSqFt: 40, x: 320, y: 40, w: 45, h: 90, fillColor: '#EAECE5' },
        { name: 'Common Bath 2', nameDv: 'स्नानगृह २', dimensions: "7'6\" × 5'0\"", areaSqFt: 37, x: 320, y: 135, w: 45, h: 80, fillColor: '#EAECE5' },
      ],
      balconies: [
        { name: 'East Balcony (Hill View)', x: 50, y: 20, w: 140, h: 35 },
        { name: 'Utility Balcony', x: 235, y: 235, w: 80, h: 45 },
      ],
    },
    lightSimulation: {
      morningAngle: 85,
      morningDesc: 'Direct morning sunlight (06:45–11:30 AM) enters East-facing balcony & Living room; unobstructed Sahyadri horizon.',
      afternoonAngle: 245,
      afternoonDesc: 'Gentle ambient diffused light; protected from harsh western afternoon heat by core building corridor.',
      balconyView: 'Panoramic 180° vista of Pune eastern hillocks and landscaped township central park.',
    },
  },
  {
    id: 'lonavala-plot',
    label: '2 Lonavala NA plot · Area mismatch',
    tag: 'Demo data',
    unit: 'Plot NA-412 · 418 sq m',
    unitType: 'Non-Agricultural Sanctioned Land Parcel',
    tower: 'Sector 3',
    floor: 'Ground Plot',
    project: 'Lonavala Valley Hills',
    location: 'Lonavala, Taluka Maval, Pune',
    realdhaId: 'RA-PUN-002-LON-NA-412',
    mahaRera: 'Exempt (Individual Land Plot)',
    asking: '₹85 Lakh',
    facing: 'South-East',
    floorHeight: 'Ground Grade',
    carpet: '418 sq m (Sanctioned 7/12)',
    builtUp: 'Permissible FSI 1.0 (418 sq m)',
    balcony: 'Direct Valley Frontage',
    streetAddress: 'Gat No. 84, Tungarli Estate',
    cityStateZip: 'Lonavala, Pune 410401',
    beds: 0,
    baths: 0,
    avgRentalYield: '4.10%',
    currentRentalYield: '0%',
    valuationDelta: '19% Undervalued',
    investorCount: 74,
    tokenPrice: '₹850 /token',
    marketValue: '₹85.00 Lakh',
    fairValue: '₹1.05 Cr',
    categoryPills: ['NA Plot', 'Discrepancy Flag', 'Scenic Hill View'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    ],
    stamp: {
      type: 'warning',
      sealMarathi: 'महाराष्ट्र महसूल प्राधिकरण · तपासणी आवश्यक',
      sealEnglish: 'MAHARASHTRA REVENUE AUTHORITY · STOP & CLARIFY',
      title: 'सावधान · AREA MISMATCH FLAGGED',
      subtitle: 'Seller draft claims 465 sq m vs 418 sq m on Marathi 7/12 extract',
      serialNo: 'MH-REV-2026-MAV-00412',
      date: '20-Nov-2026',
      stampColor: '#A86400', // Amber warning stamp
    },
    findings: [
      {
        id: 'f21',
        status: 'pass',
        title: 'NA conversion sanctioned under Collector Order 2019/44',
        quote: 'Sanctioned for bungalow/residential use under Maval Taluka NA order',
        sourceDoc: 'Collector NA Order (2019)',
        page: 'p. 1',
        clause: 'Permission Grant Clause 2',
      },
      {
        id: 'f22',
        status: 'alert',
        title: 'AREA DISCREPANCY: Seller draft claims 465 sq m vs 418 sq m on 7/12 extract',
        quote: 'Draft agreement recital says 465 sq m; official revenue 7/12 reflects exactly 0 Ha 04.18 R (418 sq m)',
        sourceDoc: 'Marathi 7/12 Extract (Gat #201) vs Seller Draft',
        page: 'p. 2',
        clause: 'Schedule of Area',
      },
      {
        id: 'f23',
        status: 'note',
        title: 'Mutation entry (Ferfar) pending registration since 2021',
        quote: 'Mutation application #2021/88 submitted but final signature absent in Talathi rojnamcha',
        sourceDoc: 'Taluka Record Office Ledger',
        page: 'p. 4',
        clause: 'Pending Mutation Audit',
      },
    ],
    note: {
      id: 'f24',
      status: 'alert',
      title: 'CRITICAL ACTION · Do not disburse payment until area boundary is resurveyed by Mojani officer',
      quote: 'Risk of boundary dispute with adjoining Plot 413 over 47 sq m discrepancy',
      sourceDoc: 'District Land Records Surveyor Report',
      page: 'p. 1',
      clause: 'Survey Warning',
    },
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: '19,842,084',
    documents: [
      {
        id: 'doc-21',
        name: 'Marathi 7/12 Extract (Gat #201)',
        type: 'Revenue 7/12',
        status: 'flagged',
        date: '05-Nov-2026',
        authority: 'Talathi Saza Tungarli, Taluka Maval',
        sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        pageCount: 2,
        originalExcerptMarathi: 'गट क्र. २०१/४१२: एकूण क्षेत्र ० हेक्टर ०४.१८ आर (४१८ चौ.मी.). कब्जेदार: शांताराम जोशी. इतर हक्कात मोजणी वाद प्रलंबित.',
        translatedExcerptEnglish: 'Gat No. 201/412: Total Area 0 Ha 04.18 R (418 sq m). Holder: Shantaram Joshi. Other rights note: boundary measurement resurvey pending.',
        extractedFields: [
          { label: 'Official 7/12 Area', value: '418 sq m (0.0418 Ha)' },
          { label: 'Seller Claimed Area', value: '465 sq m (Difference: 47 sq m)' },
          { label: 'Land Use', value: 'Non-Agricultural (Residential)' },
          { label: 'Zone', value: 'Maval Green Zone Bungalow Plot' },
        ],
      },
      {
        id: 'doc-22',
        name: 'Collector NA Sanction Order (2019)',
        type: 'NA Order',
        status: 'verified',
        date: '12-Aug-2019',
        authority: 'Sub-Divisional Officer, Maval-Mulshi, Pune',
        sha256: 'c3d4e5f6a1b234567890123456789abcdef0123456789abcdef0123456789abc',
        pageCount: 5,
        originalExcerptMarathi: 'आदेश क्र. मवि/महसूल/एनए/२०१९/४४: गट क्र. २०१ मधील ४१८ चौ.मी. जमिनीस बिगरशेती अटींवर परवानगी देण्यात येत आहे.',
        translatedExcerptEnglish: 'Sanction Order SDO/REV/NA/2019/44: 418 sq m in Gat 201 permitted for non-agricultural residential construction subject to standard setbacks.',
        extractedFields: [
          { label: 'Sanctioned NA Area', value: '418.00 sq m' },
          { label: 'Layout Sanction #', value: 'TP/MAVAL/2019/110' },
          { label: 'Ground Coverage Limit', value: '33% (138 sq m max)' },
        ],
      },
      {
        id: 'doc-23',
        name: 'Seller Draft Agreement for Sale',
        type: 'Agreement Draft',
        status: 'flagged',
        date: '10-Nov-2026',
        authority: 'Vendor Advocate Draft',
        sha256: 'f1e2d3c4b5a67890123456789abcdef0123456789abcdef0123456789abcdef0',
        pageCount: 11,
        originalExcerptMarathi: 'विक्री करारनामा मसुदा: भूखंड क्र. ४१२, क्षेत्रफळ ४६५ चौ.मी. (५००० चौ.फूट) विकण्याचे ठरविले आहे. मोबदला ₹८५,००,०००/-.',
        translatedExcerptEnglish: 'Agreement Draft: Plot No. 412, recited area 465 sq m (5,000 sq ft) proposed for transfer for consideration of ₹85,00,000/-. Discrepancy with 7/12!',
        extractedFields: [
          { label: 'Recited Plot Area', value: '465 sq m (Inflated by 11.2%)' },
          { label: 'Price Quoted', value: '₹85,00,000' },
          { label: 'Rate / sq m Claimed', value: '₹18,279' },
          { label: 'True Rate / 7/12', value: '₹20,334 (if 418 sq m)' },
        ],
      },
    ],
    north: {
      name: 'Open Agricultural Land (Gat #200)',
      description: 'Private farm land, protected natural green boundary',
    },
    south: {
      name: 'Plot NA-413 (Adjoining Plot)',
      description: 'Subject of current boundary line contestation regarding 47 sq m strip',
      realdhaId: 'RA-PUN-002-LON-NA-413',
    },
    east: {
      name: '12-Metre Public Access Road',
      description: 'Paved tar road connecting to Khandala-Lonavala Old Highway',
    },
    west: {
      name: 'Valley Edge & Natural Slope',
      description: 'Western Ghats hill drop with unhindered panoramic valley view',
    },
    above: {
      name: 'Open Sky (Freehold Parcel)',
      description: 'Ground plot with no vertical co-occupants',
    },
    below: {
      name: 'Bedrock / Subsoil',
      description: 'Basalt volcanic rock, strong foundation footing certified by soil test',
    },
    titleChainYears: '20 years (2006–2026)',
    titleChainBar: [
      { years: '2006–2014', color: '#22307A', width: '38%', holder: 'Agricultural Holder (Joshi Family)', transferType: 'Ancestral Satbara' },
      { years: '2014–2019', color: '#324394', width: '25%', holder: 'NA Application Phase', transferType: 'Collector Order NA/44' },
      { years: '2019–2021', color: '#A86400', width: '20%', holder: 'Proposed Subdivided Plot', transferType: 'Subdivision Mutation #88' },
      { years: '2021–2026', color: '#C3271F', width: '17%', holder: 'Seller (Disputed Boundary)', transferType: 'Draft Agreement Flagged' },
    ],
    titleChainTicks: [
      { year: '2006', label: '7/12 Ancestral', detail: 'Original agricultural Gat holding in revenue records', docRef: 'Satbara Gat #201' },
      { year: '2019', label: 'NA Sanction Order', detail: 'Collector converts 418 sq m to NA residential status', docRef: 'Collector Order 2019/44' },
      { year: '2021', label: 'Mutation Pending', detail: 'Subdivision mutation entered in taluka ledger but pending sign-off', docRef: 'Mutation Application #88' },
      { year: '2026', label: 'Discrepancy Flagged', detail: 'REALDHA Gemini cross-check flags 465 vs 418 sq m discrepancy', docRef: 'REALDHA Audit MH-REV-412' },
    ],
    lawyerSignOff: {
      status: 'required',
      notes: 'STOP TRANSACTION. Requires joint boundary verification (Mojani) by Taluka Inspector of Land Records (TILR) and vendor contract amendment to 418 sq m before earnest money transfer.',
    },
    chips: [
      'Why does the area differ?',
      'Translate 7/12 Gat #201',
      'Is mutation mandatory before sale?',
      'What is the price difference for 47 sq m?',
    ],
    groundedQA: [
      {
        question: 'Why does the area differ?',
        answer: 'The official Government 7/12 extract and Collector NA order explicitly certify the plot as 418 sq m (0.0418 Hectares). However, the seller draft agreement lists 465 sq m by including a 47 sq m roadside setback reservation that the vendor does not have legal title to convey.',
        citation: 'Marathi 7/12 Gat #201 vs Seller Draft p. 2',
        sourceDocId: 'doc-21',
      },
      {
        question: 'Translate 7/12 Gat #201',
        answer: '7/12 Extract reads: "गट क्र. २०१/४१२: क्षेत्र ० हेक्टर ०४.१८ आर. कब्जेदार: शांताराम जोशी. इतर हक्कात मोजणी वाद प्रलंबित." (Area 418 sq m, holder Shantaram Joshi, other rights note pending boundary measurement resurvey).',
        citation: 'Marathi 7/12 Gat #201 p. 1',
        sourceDocId: 'doc-21',
      },
      {
        question: 'Is mutation mandatory before sale?',
        answer: 'Yes. Under Section 148 to 154 of the Maharashtra Land Revenue Code, a mutation entry (Ferfar) is essential to record the updated subdivision on the Record of Rights. A pending mutation leaves the buyer vulnerable to third-party claims.',
        citation: 'Maharashtra Land Revenue Code 1966 §148',
        sourceDocId: 'doc-22',
      },
      {
        question: 'What is the price difference for 47 sq m?',
        answer: 'At the seller’s asking price of ₹85 Lakh for 465 sq m (₹18,279/sq m), 47 sq m represents ₹8,59,141 in unverified land value that should be deducted if transacting on the true 418 sq m title.',
        citation: 'REALDHA Valuation Audit Schedule',
        sourceDocId: 'doc-23',
      },
    ],
    floorPlan: {
      type: 'plot',
      indicativeDisclaimer: 'Plot survey layout · Red hatched area denotes 47 sq m unverified boundary overlap',
      compassOrientation: 'North-East Road Frontage · South-West Valley Edge',
      entryPoint: { x: 260, y: 140, label: 'Road Gate (12m Public Road)' },
      rooms: [
        { name: 'Sanctioned Buildable Area (418 sq m)', nameDv: 'अधिकृत भूखंड क्षेत्र', dimensions: '22m × 19m (418 sq m)', areaSqFt: 4500, x: 40, y: 40, w: 200, h: 170, fillColor: '#F6F7F3' },
        { name: 'Disputed Overlap Strip (47 sq m)', nameDv: 'विवादित सीमा क्षेत्र', dimensions: '2.5m × 19m (47 sq m)', areaSqFt: 506, x: 240, y: 40, w: 35, h: 170, fillColor: '#FCE8E6' },
      ],
      balconies: [],
    },
    lightSimulation: {
      morningAngle: 110,
      morningDesc: 'Open hillside sunrise directly illuminates the entire eastern plot boundary and entry driveway.',
      afternoonAngle: 250,
      afternoonDesc: 'Full western valley sunset with clear mountain views.',
      balconyView: 'Unhindered valley vista towards Khandala gorge and Duke’s Nose peak.',
    },
  },
  {
    id: 'pune-resale',
    label: '3 Resale flat · Missing heir',
    tag: 'Demo data',
    unit: 'Flat B-1205 · 2 BHK',
    unitType: '2 BHK Resale Apartment',
    tower: 'Tower B',
    floor: 'Floor 12',
    project: 'Shivaji Nagar Residency CHSL',
    location: 'Shivaji Nagar, Pune',
    realdhaId: 'RA-PUN-003-B-12-05',
    mahaRera: 'P52100015547',
    asking: '₹95 Lakh',
    facing: 'West',
    floorHeight: '36 m',
    carpet: '820 sq ft',
    builtUp: '1,050 sq ft',
    balcony: 'Garden & University Road View',
    streetAddress: 'Flat 302, Mayur Nagari CHSL',
    cityStateZip: 'Kothrud, Pune 411038',
    beds: 2,
    baths: 2,
    avgRentalYield: '4.80%',
    currentRentalYield: '4.2%',
    valuationDelta: '5% Overvalued',
    investorCount: 146,
    tokenPrice: '₹920 /token',
    marketValue: '₹95.00 Lakh',
    fairValue: '₹88.50 Lakh',
    categoryPills: ['Resale Flat', 'Missing Heir', 'Society NOC Pending'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    ],
    stamp: {
      type: 'defect',
      sealMarathi: 'महाराष्ट्र वारसा हक्क पडताळणी · त्रुटी आढळली',
      sealEnglish: 'MAHARASHTRA SUCCESSION VERIFICATION · DEFECT FLAGGED',
      title: 'दोष · MISSING HEIR RELEASE',
      subtitle: 'Society shares transferred without registered Release Deed from Heir #3 (sister)',
      serialNo: 'MH-REV-2026-PUN-01205',
      date: '20-Nov-2026',
      stampColor: '#C3271F', // Red defect stamp
    },
    findings: [
      {
        id: 'f31',
        status: 'pass',
        title: 'Society share certificate verified in vendor name',
        quote: 'Share Certificate #442 transferred under CHS committee resolution #14/2022',
        sourceDoc: 'Society Share Certificate & Resolution',
        page: 'p. 1',
        clause: 'Member Ledger',
      },
      {
        id: 'f32',
        status: 'alert',
        title: 'MISSING HEIR RELEASE: Legal Heir #3 has not signed registered release deed',
        quote: 'Original owner deceased in 2022 leaving 3 children; son transferred shares via simple indemnity without sister’s registered deed of release',
        sourceDoc: 'Heirship Succession Papers vs Hindu Succession Act',
        page: 'p. 2',
        clause: 'Legal Heir Declaration',
      },
      {
        id: 'f33',
        status: 'pass',
        title: 'No bank encumbrance or tax arrears subsisting',
        quote: 'PMC Property Tax paid in full through 2026; no bank charge recorded in Index II',
        sourceDoc: 'PMC Tax Paid Receipt & Search Report',
        page: 'p. 1',
        clause: 'Clearance Certificate',
      },
    ],
    note: {
      id: 'f34',
      status: 'alert',
      title: 'TITLE RISK · Heir #3 retains a 1/3 undivided legal share in Flat B-1205 under Hindu Succession Act',
      quote: 'Purchasing without a registered Release Deed leaves the buyer exposed to future partition suits',
      sourceDoc: 'Title Search Certificate (1995–2026)',
      page: 'p. 3',
      clause: 'Advocate Opinion',
    },
    sha256: 'f7e8d9c0a1b234567890123456789abcdef0123456789abcdef0123456789abcdef0',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    blockNumber: '19,842,012',
    documents: [
      {
        id: 'doc-31',
        name: 'Society Share Certificate & CHS Register',
        type: 'CHS Share Cert',
        status: 'verified',
        date: '15-Mar-2022',
        authority: 'Shivaji Nagar Residency Co-operative Housing Society Ltd',
        sha256: 'f7e8d9c0a1b234567890123456789abcdef0123456789abcdef0123456789abcdef0',
        pageCount: 4,
        originalExcerptMarathi: 'भाग दाखला क्र. ४४२: भाग क्रमांक २११ ते २१५. सभासद: श्री. आनंद मनोहर जोशी. (वारसा हक्काने हस्तांतरण).',
        translatedExcerptEnglish: 'Share Certificate No. 442: Shares 211 to 215 transferred to Mr. Anand Manohar Joshi pursuant to succession nomination. Note: nomination confers no title against co-heirs.',
        extractedFields: [
          { label: 'Share Cert No', value: '#442 (5 Shares)' },
          { label: 'Society Reg No', value: 'PUN/HSG/TC/1998/1204' },
          { label: 'Transfer Basis', value: 'Nomination (Section 30 MCS Act)' },
          { label: 'Legal Warning', value: 'Supreme Court ruling: Nominee is merely a trustee' },
        ],
      },
      {
        id: 'doc-32',
        name: 'Heirship Declaration & Family Tree',
        type: 'Succession Papers',
        status: 'flagged',
        date: '10-Feb-2022',
        authority: 'Notary Public & Executive Magistrate, Pune',
        sha256: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef0',
        pageCount: 3,
        originalExcerptMarathi: 'वारस घोषणापत्र: मयत मनोहर जोशी यांचे वारस: १. आनंद (मुलगा), २. प्रवीण (मुलगा), ३. सुनिता (विवाहित मुलगी). मुलगी सुनिता हिचे स्वाक्षरी / सोडपत्र जोडलेले नाही.',
        translatedExcerptEnglish: 'Declaration of Heirs: Late Manohar Joshi survived by: 1. Anand (son), 2. Praveen (son), 3. Sunita (married daughter). Sister Sunita has NOT executed any relinquishment deed.',
        extractedFields: [
          { label: 'Surviving Class-I Heirs', value: '3 Children (Equal 1/3 share each)' },
          { label: 'Release Deed Executed', value: 'NO (Missing for Heir #3)' },
          { label: 'Stamp Duty Paid on Release', value: 'Nil / Not Registered' },
        ],
      },
      {
        id: 'doc-33',
        name: 'Index II Original Sale Deed (2010)',
        type: 'Index II Deed',
        status: 'verified',
        date: '14-Jul-2010',
        authority: 'Haveli Sub-Registrar Office #3, Pune',
        sha256: 'd4e5f6a1b2c37890123456789abcdef0123456789abcdef0123456789abcdef0',
        pageCount: 12,
        originalExcerptMarathi: 'दस्त क्र. ३४०२/२०१०: फ्लॅट क्र. १२०५, १२ वा मजला, टॉवर बी, चटई क्षेत्र ८२० चौ.फूट. मूळ खरेदीदार: मनोहर जोशी.',
        translatedExcerptEnglish: 'Deed No. 3402/2010: Flat No. 1205, 12th Floor, Tower B, carpet area 820 sq ft conveyed to late Manohar Joshi.',
        extractedFields: [
          { label: 'Original Buyer', value: 'Late Manohar Joshi' },
          { label: 'Carpet Area', value: '820 sq ft' },
          { label: 'Chain Status', value: 'Clean up to 2022' },
        ],
      },
    ],
    north: {
      name: 'Flat B-1204',
      description: 'Adjacent 2 BHK apartment',
      realdhaId: 'RA-PUN-003-B-12-04',
    },
    south: {
      name: 'Flat B-1206',
      description: 'Adjacent 2 BHK apartment',
      realdhaId: 'RA-PUN-003-B-12-06',
    },
    east: {
      name: 'Lobby & Elevators',
      description: 'Common lift lobby and staircase landing',
    },
    west: {
      name: 'Balcony & West Vista',
      description: 'Facing Ferguson College Hill & Pune University green canopy',
    },
    above: {
      name: 'Flat B-1305',
      description: 'Floor 13, identical residential apartment',
      realdhaId: 'RA-PUN-003-B-13-05',
    },
    below: {
      name: 'Flat B-1105',
      description: 'Floor 11, identical residential apartment',
      realdhaId: 'RA-PUN-003-B-11-05',
    },
    titleChainYears: '15 years (2010–2026)',
    titleChainBar: [
      { years: '2010–2018', color: '#22307A', width: '45%', holder: 'Late Manohar Joshi (Sole Buyer)', transferType: 'Deed #3402' },
      { years: '2018–2022', color: '#324394', width: '25%', holder: 'Late Manohar Joshi', transferType: 'Undisputed Possession' },
      { years: '2022–2026', color: '#C3271F', width: '30%', holder: 'Anand Joshi (Defective Succession)', transferType: 'Nomination Only (Unresolved Heirs)' },
    ],
    titleChainTicks: [
      { year: '2010', label: 'Original Purchase', detail: 'Deed registered in Haveli #3 by late father', docRef: 'Index II #3402' },
      { year: '2022', label: 'Father Demise & Transfer', detail: 'Death certificate registered; society transfers shares via nomination', docRef: 'Death Cert & CHS Cert 442' },
      { year: '2026', label: 'Heir Release Defect Flagged', detail: 'REALDHA flags absence of registered Release Deed from sister', docRef: 'REALDHA Succession Audit' },
    ],
    lawyerSignOff: {
      status: 'required',
      notes: 'DO NOT PROCEED to agreement until legal heir Sunita executes and registers a formal Deed of Release (हक्कसोडपत्र) with proper stamp duty at Haveli Sub-Registrar.',
    },
    chips: [
      'What happens if heir #3 does not sign?',
      'Does society nomination confer title?',
      'How to rectify missing heir release?',
      'What is the stamp duty on a Release Deed?',
    ],
    groundedQA: [
      {
        question: 'What happens if heir #3 does not sign?',
        answer: 'Under the Hindu Succession Act (amended 2005), daughters have equal coparcenary rights by birth. Without Sunita’s registered Release Deed, she or her heirs can file a partition suit at any time claiming 1/3 ownership of Flat B-1205, even after you pay and register.',
        citation: 'Hindu Succession Act §6 & Supreme Court ruling in Vineeta Sharma (2020)',
        sourceDocId: 'doc-32',
      },
      {
        question: 'Does society nomination confer title?',
        answer: 'No. The Supreme Court of India has settled in Indrani Wahi v. Registrar of Co-op Societies that a society nominee holds the flat only in trust as an agent for all legal heirs. Nomination does not extinguish the inheritance rights of co-heirs.',
        citation: 'Indrani Wahi v. Registrar, Supreme Court (2016)',
        sourceDocId: 'doc-31',
      },
      {
        question: 'How to rectify missing heir release?',
        answer: 'The vendor must have sister Sunita execute a registered Release Deed (हक्कसोड पत्र) at the Sub-Registrar office, explicitly relinquishing her 1/3 share in favor of Anand Joshi, accompanied by her affidavit and identity proof.',
        citation: 'Maharashtra Stamp Act Art. 52 (Release Deed)',
        sourceDocId: 'doc-32',
      },
      {
        question: 'What is the stamp duty on a Release Deed?',
        answer: 'In Maharashtra, a release deed between blood relations (brother and sister) attracts a nominal stamp duty of ₹200 under Article 52 of the Maharashtra Stamp Act, making rectification straightforward if all parties agree.',
        citation: 'Maharashtra Stamp Act Art. 52',
        sourceDocId: 'doc-32',
      },
    ],
    floorPlan: {
      type: 'highrise',
      indicativeDisclaimer: 'Indicative 2 BHK layout · Shivaji Nagar Residency CHSL',
      compassOrientation: 'West-Facing Living Room Balcony',
      entryPoint: { x: 25, y: 120, label: 'Front Entrance' },
      rooms: [
        { name: 'Living & Dining Room', nameDv: 'दिवाणखाना', dimensions: "18'0\" × 11'6\"", areaSqFt: 207, x: 50, y: 50, w: 125, h: 120, fillColor: '#FAFBF8' },
        { name: 'Master Bedroom', nameDv: 'मुख्य शयनकक्ष', dimensions: "13'0\" × 11'0\"", areaSqFt: 143, x: 185, y: 50, w: 110, h: 90, fillColor: '#F4F5F1' },
        { name: 'Children Bedroom', nameDv: 'शयनकक्ष २', dimensions: "11'0\" × 10'0\"", areaSqFt: 110, x: 185, y: 150, w: 110, h: 80, fillColor: '#F4F5F1' },
        { name: 'Kitchen', nameDv: 'स्वयंपाकघर', dimensions: "9'6\" × 8'0\"", areaSqFt: 76, x: 50, y: 180, w: 75, h: 70, fillColor: '#F0F2EC' },
        { name: 'Bathroom 1', nameDv: 'स्नानगृह १', dimensions: "7'0\" × 4'6\"", areaSqFt: 31, x: 130, y: 180, w: 45, h: 70, fillColor: '#EAECE5' },
      ],
      balconies: [
        { name: 'West Balcony (College View)', x: 50, y: 15, w: 125, h: 30 },
      ],
    },
    lightSimulation: {
      morningAngle: 80,
      morningDesc: 'Gentle ambient eastern light filtering from internal building atrium.',
      afternoonAngle: 260,
      afternoonDesc: 'Direct late afternoon sun (14:30–18:00) into west balcony and living room.',
      balconyView: 'Tree-lined Shivaji Nagar residential quarter and Fergusson College hill.',
    },
  },
  {
    id: 'bhiwandi-warehouse',
    label: '4 Bhiwandi warehouse · Mortgage',
    tag: 'Demo data',
    unit: 'Warehouse WH-7 · 12,000 sq ft',
    unitType: 'Grade-A Industrial Logistics Warehouse',
    tower: 'Block C Logistics Park',
    floor: 'Ground Warehouse + Mezzanine',
    project: 'Bhiwandi Freight Hub',
    location: 'Bhiwandi, Thane District, MMR',
    realdhaId: 'RA-THN-001-WH-7',
    mahaRera: 'P52100020134',
    asking: '₹4.2 Cr',
    facing: 'North-East (Dock Face)',
    floorHeight: '11 m Clear Height',
    carpet: '12,000 sq ft (Usable Plinth)',
    builtUp: '12,000 sq ft + 1,200 sq ft Mezzanine',
    balcony: '8-Bay Dedicated Loading Dock',
    streetAddress: 'Bay W-04, Logistics Hub 44',
    cityStateZip: 'Bhiwandi, Thane 421302',
    beds: 0,
    baths: 2,
    avgRentalYield: '8.40%',
    currentRentalYield: '8.4%',
    valuationDelta: 'Bank Mortgage',
    investorCount: 85,
    tokenPrice: '₹5,000 /token',
    marketValue: '₹4.20 Cr',
    fairValue: '₹4.50 Cr',
    categoryPills: ['Commercial', 'Cash Flowing', 'Mortgage Flagged'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1000&q=80',
    ],
    stamp: {
      type: 'mortgage',
      sealMarathi: 'महाराष्ट्र मालमत्ता भार पडताळणी · बोजा आढळला',
      sealEnglish: 'MAHARASHTRA PROPERTY CHARGE AUDIT · ENCUMBERED',
      title: 'बोजा · UNRELEASED MORTGAGE FLAGGED',
      subtitle: '2019 Bank Mortgage (₹2.4 Cr) still active in CERSAI & Sub-Registrar records',
      serialNo: 'MH-REV-2026-THN-00701',
      date: '20-Nov-2026',
      stampColor: '#C3271F', // Red defect stamp
    },
    findings: [
      {
        id: 'f41',
        status: 'pass',
        title: 'Industrial zoning & MMRDA warehouse sanction in order',
        quote: 'Zoning Certificate #MMRDA/IND/2015 permits heavy logistics, warehousing & container parking',
        sourceDoc: 'MMRDA Industrial Sanction Order',
        page: 'p. 2',
        clause: 'Land Use Permit',
      },
      {
        id: 'f42',
        status: 'alert',
        title: 'ACTIVE MORTGAGE: 2019 Commercial Bank Loan (₹2.4 Cr) subsists',
        quote: 'CERSAI Security Interest ID #20001948271 registered by State Bank of India still reflects active lien on WH-7',
        sourceDoc: 'CERSAI Search Report & Sub-Registrar Index II',
        page: 'p. 1',
        clause: 'Charge Registry',
      },
      {
        id: 'f43',
        status: 'note',
        title: 'Registered 5-year lease agreement with 3PL tenant',
        quote: 'Active tenancy yielding ₹3,60,000/month; lease predates seller mortgage disclosure',
        sourceDoc: 'Registered Lease Agreement (2022)',
        page: 'p. 3',
        clause: 'Tenant Rights Section',
      },
    ],
    note: {
      id: 'f44',
      status: 'alert',
      title: 'HIGH RECOVERY RISK · Lender holds original title deeds; sale cannot convey clear title without Bank NOC',
      quote: 'If vendor defaults, bank retains immediate SARFAESI auction rights over warehouse premises',
      sourceDoc: 'CERSAI Charge Certificate',
      page: 'p. 1',
      clause: 'Mortgage Notice',
    },
    sha256: 'c3d4e5f6a7b890123456789abcdef0123456789abcdef0123456789abcdef01234',
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    blockNumber: '19,841,990',
    documents: [
      {
        id: 'doc-41',
        name: 'CERSAI National Mortgage Search Report',
        type: 'CERSAI Report',
        status: 'flagged',
        date: '16-Nov-2026',
        authority: 'Central Registry of Securitisation Asset Reconstruction (CERSAI)',
        sha256: 'c3d4e5f6a7b890123456789abcdef0123456789abcdef0123456789abcdef01234',
        pageCount: 3,
        originalExcerptMarathi: 'सीईआरएसएआय सुरक्षा व्याज नोंदणी क्र. २०००१९४८२७१: स्टेट बँक ऑफ इंडिया शाखा ठाणे. बोजा रक्कम ₹२,४०,००,०००/-. सद्यस्थिती: बोजा कायम.',
        translatedExcerptEnglish: 'CERSAI Security Interest ID 20001948271: Charge created in favor of State Bank of India, Thane SME Branch. Outstanding Charge ₹2,40,00,000/-. Status: Active & Subsisting.',
        extractedFields: [
          { label: 'Mortgagee Bank', value: 'State Bank of India (Thane SME)' },
          { label: 'Charge Amount', value: '₹2,40,00,000 (Principal)' },
          { label: 'Creation Date', value: '18-Oct-2019' },
          { label: 'Deed of Mortgage', value: 'Registered at Bhiwandi-3 #4910/2019' },
          { label: 'Satisfaction Filed', value: 'NO (Satisfaction Not Reported)' },
        ],
      },
      {
        id: 'doc-42',
        name: 'MMRDA Industrial Zoning Clearance',
        type: 'Zoning Order',
        status: 'verified',
        date: '10-May-2015',
        authority: 'Mumbai Metropolitan Region Development Authority',
        sha256: 'e5f6a7b8c3d490123456789abcdef0123456789abcdef0123456789abcdef01234',
        pageCount: 6,
        originalExcerptMarathi: 'एमएमआरडीए औद्योगिक क्षेत्र परवानगी क्र. २०१५/८८: भिवंडी लॉजिस्टिक्स पार्क गट क्र. १४० मधील गोदाम बांधकामास मंजुरी.',
        translatedExcerptEnglish: 'MMRDA Sanction 2015/88: Approved logistics and warehouse park development on industrial land parcel Gat #140 with heavy vehicular turning radius.',
        extractedFields: [
          { label: 'Zoning', value: 'I-2 Heavy Logistics & Industrial' },
          { label: 'Plinth Area Sanctioned', value: '12,000 sq ft' },
          { label: 'Clear Height', value: '11.0 Metres' },
          { label: 'Fire Hydrant Ring', value: 'MIDC Compliant' },
        ],
      },
      {
        id: 'doc-43',
        name: 'Registered Commercial Lease (2022)',
        type: 'Lease Deed',
        status: 'verified',
        date: '01-Apr-2022',
        authority: 'Sub-Registrar Bhiwandi-2, Thane',
        sha256: '7a8b9c0d1e2fc3d456789abcdef0123456789abcdef0123456789abcdef01234',
        pageCount: 18,
        originalExcerptMarathi: 'भाडेपट्टा दस्त क्र. १४०२/२०२२: मेसर्स एक्सप्रेस लॉजिस्टिक्स प्रायव्हेट लिमिटेड यांस ५ वर्षांसाठी दरमहा ₹३,६०,०००/- भाडेतत्त्वावर देण्यात आले.',
        translatedExcerptEnglish: 'Registered Lease Deed 1402/2022: Demised to M/s Express Logistics Pvt Ltd for 5-year lock-in expiring March 2027 at ₹3,60,000/month with 5% annual escalation.',
        extractedFields: [
          { label: 'Tenant', value: 'M/s Express Logistics Pvt Ltd' },
          { label: 'Monthly Rent', value: '₹3,60,000 (Gross Yield: 10.3%)' },
          { label: 'Security Deposit', value: '₹21,60,000' },
          { label: 'Lock-in Period', value: 'Through 31-Mar-2027' },
        ],
      },
    ],
    north: {
      name: 'Warehouse WH-6',
      description: 'Adjacent 12,000 sq ft industrial facility occupied by cold chain operator',
      realdhaId: 'RA-THN-001-WH-6',
    },
    south: {
      name: 'Warehouse WH-8',
      description: 'Adjacent 15,000 sq ft logistics facility',
      realdhaId: 'RA-THN-001-WH-8',
    },
    east: {
      name: 'Main Arterial Park Road (45m Width)',
      description: 'Direct multi-axle truck trailer connectivity to Mumbai-Nashik Highway (NH-3)',
    },
    west: {
      name: 'Trailer Parking & Weighbridge Yard',
      description: 'Common logistics hub parking bay and 100-ton electronic weighbridge',
    },
    above: {
      name: 'High-Tensile Pre-Engineered Steel Roof',
      description: 'Galvalume standing seam insulated roof with turbo ventilators & solar panels',
    },
    below: {
      name: 'VDF Heavy Industrial Concrete Flooring',
      description: 'FM2 grade laser-screeded floor with 8 Ton/sq m uniformly distributed load capacity',
    },
    titleChainYears: '12 years (2014–2026)',
    titleChainBar: [
      { years: '2014–2017', color: '#22307A', width: '30%', holder: 'Park Promoters', transferType: 'Land Acquisition & Sanction' },
      { years: '2017–2019', color: '#324394', width: '25%', holder: 'Vendor Developer', transferType: 'Construction & Plinth Sanction' },
      { years: '2019–2022', color: '#C3271F', width: '25%', holder: 'Vendor (Mortgaged to SBI)', transferType: 'Active SBI Mortgage #4910' },
      { years: '2022–2026', color: '#A86400', width: '20%', holder: 'Vendor (Leased to Express Logistics)', transferType: 'Registered Lease Deed' },
    ],
    titleChainTicks: [
      { year: '2014', label: 'Land Acquisition', detail: 'Industrial conversion and master layout approved by MMRDA', docRef: 'MMRDA Sanction #2014/88' },
      { year: '2017', label: 'Warehouse Erected', detail: 'Pre-engineered steel structural frame and docking bays completed', docRef: 'PMC Factory Permit' },
      { year: '2019', label: 'SBI Mortgage Created', detail: '₹2.4 Cr loan charge created and registered with CERSAI', docRef: 'CERSAI Charge #20001948271' },
      { year: '2022', label: '3PL Lease Executed', detail: 'Registered 5-year lease with Express Logistics at ₹3.6L/mo', docRef: 'Lease Deed #1402' },
      { year: '2026', label: 'Unreleased Charge Flagged', detail: 'REALDHA audit catches unreleased mortgage before transaction closing', docRef: 'REALDHA Audit MH-THN-WH7' },
    ],
    lawyerSignOff: {
      status: 'required',
      notes: 'DO NOT EXECUTE SALE DEED. Require formal Bank NOC, original Title Deed collection receipt, and CERSAI Form II (Satisfaction of Charge) filed by SBI prior to consideration payout.',
    },
    chips: [
      'Can the mortgage be released quickly?',
      'Does the lease survive the sale?',
      'What is the outstanding loan amount?',
      'How does escrow protect the buyer here?',
    ],
    groundedQA: [
      {
        question: 'Can the mortgage be released quickly?',
        answer: 'Yes, but it requires a structured tripartite closing: the buyer’s advance must be paid directly into the SBI loan account against an advance settlement letter, after which SBI issues the No Due Certificate and hands over the original 2014 title deeds within 15 working days.',
        citation: 'SBI Commercial Lending Guidelines & CERSAI Settlement Procedure',
        sourceDocId: 'doc-41',
      },
      {
        question: 'Does the lease survive the sale?',
        answer: 'Yes. Under Section 109 of the Transfer of Property Act, a registered lease survives the transfer of ownership. The purchaser steps into the landlord’s shoes and is entitled to receive the ₹3,60,000 monthly rental income through an attornment of lease.',
        citation: 'Transfer of Property Act §109 & Lease Deed p. 5 Clause 8',
        sourceDocId: 'doc-43',
      },
      {
        question: 'What is the outstanding loan amount?',
        answer: 'The CERSAI registration records an original charge of ₹2.40 Crore. As per the latest SBI interest statement, the estimated outstanding balance stands at ₹1.82 Crore principal plus accrued interest.',
        citation: 'CERSAI Report ID #20001948271 p. 1',
        sourceDocId: 'doc-41',
      },
      {
        question: 'How does escrow protect the buyer here?',
        answer: 'By putting the ₹4.2 Cr purchase price in an escrow account, the escrow agent pays ₹1.82 Cr directly to State Bank of India to release the mortgage and obtain the original title deeds, remitting only the remaining balance to the vendor.',
        citation: 'Standard Real Estate Escrow Protocol (Maharashtra)',
        sourceDocId: 'doc-41',
      },
    ],
    floorPlan: {
      type: 'warehouse',
      indicativeDisclaimer: 'Warehouse plinth & loading bay layout · Clear height 11m · 8-dock configuration',
      compassOrientation: 'North-East Dock Face towards 45m Arterial Logistics Corridor',
      entryPoint: { x: 20, y: 150, label: 'Main Truck Ingress Gate' },
      rooms: [
        { name: 'Primary Storage Bay (8,000 sq ft)', nameDv: 'मुख्य साठवणूक विभाग', dimensions: '100ft × 80ft', areaSqFt: 8000, x: 40, y: 40, w: 200, h: 120, fillColor: '#F8F9F5' },
        { name: 'Secondary Staging Bay (4,000 sq ft)', nameDv: 'स्टेजिंग व पॅकिंग विभाग', dimensions: '50ft × 80ft', areaSqFt: 4000, x: 40, y: 165, w: 120, h: 65, fillColor: '#F3F5EF' },
        { name: 'Mezzanine Logistics Office', nameDv: 'प्रशासकीय कार्यालय', dimensions: '30ft × 40ft', areaSqFt: 1200, x: 165, y: 165, w: 75, h: 65, fillColor: '#EAECE5' },
        { name: '8-Bay Loading Docks (Truck Apron)', nameDv: '८ लोडिंग डॉक्स', dimensions: '120ft × 25ft', areaSqFt: 3000, x: 245, y: 40, w: 55, h: 190, fillColor: '#E5E8DE' },
      ],
      balconies: [],
    },
    lightSimulation: {
      morningAngle: 60,
      morningDesc: 'Ample North-East natural translucent roof skylight daylighting (zero artificial lighting needed 08:00–17:00).',
      afternoonAngle: 280,
      afternoonDesc: 'Protected from direct western thermal heat load by insulated pre-engineered sandwich panels.',
      balconyView: 'Wide concrete truck staging apron with simultaneous 8-container docking capacity.',
    },
  },
  {
    id: 'pune-kharadi-tech',
    label: '5 Kharadi Cybercity · Suite 402',
    tag: 'Verified asset',
    unit: 'Suite 402 · Commercial IT Floor',
    unitType: 'Commercial IT Park',
    tower: 'Tower B',
    floor: 'Floor 4',
    project: 'Kharadi Cybercity One',
    location: 'Kharadi, Pune 411014',
    streetAddress: '2820 Rucker Ave',
    cityStateZip: 'Kharadi, Pune 411014',
    realdhaId: 'RA-PUN-005-K-04-02',
    mahaRera: 'P52100024911',
    asking: '₹2.40 Cr',
    beds: 0,
    baths: 4,
    avgRentalYield: '6.90%',
    currentRentalYield: '6.90%',
    valuationDelta: '7% Overvalued',
    investorCount: 131,
    tokenPrice: '$50.02 /share',
    marketValue: '₹2.40 Cr',
    fairValue: '₹2.24 Cr',
    categoryPills: ['Commercial', 'Cash Flowing', 'MahaRERA Verified'],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80',
    ],
    facing: 'North',
    floorHeight: '16 m',
    carpet: '3,200 sq ft',
    builtUp: '4,100 sq ft',
    balcony: 'Glass Facade Arterial Road View',
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र शासन महसूल नोंदणी · प्रमाणित अभिलेख',
      sealEnglish: 'MAHARASHTRA REVENUE REGISTRATION · VERIFIED RECORD',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: 'Long-term MNC Lease (9 yrs) · Zero Encumbrance',
      serialNo: 'MH-REV-2026-PUN-00502',
      date: '20-Nov-2026',
      stampColor: '#4A154B',
    },
    findings: [
      {
        id: 'f51',
        status: 'pass',
        title: '30-year title chain unbroken · Kharadi CTS #991',
        quote: 'clear marketable title held by developer, leased to Grade-A IT tenant',
        sourceDoc: 'Index II Lease Deed (2022)',
        page: 'p. 1',
        clause: 'Title Recital Clause 2',
      },
    ],
    sha256: '9f8e7d6c5b4a3928170f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b',
    txHash: '0x3a4b5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef12',
    blockNumber: '19,842,201',
    documents: [],
    north: { name: 'Suite 401', description: 'Fintech Corp' },
    south: { name: 'Suite 403', description: 'Cloud Services Ltd' },
    east: { name: 'Core Elevator Lobby', description: 'Central Spine' },
    west: { name: 'Glass Curtain Wall', description: 'Highway View' },
    above: { name: 'Floor 5', description: 'Tech Labs' },
    below: { name: 'Floor 3', description: 'Server Facility' },
    titleChainYears: '1996–2026 (30 yrs)',
    titleChainBar: [{ years: '1996-2026', color: '#10B981', width: '100%', holder: 'Kharadi Developers Ltd', transferType: 'Conveyance' }],
    titleChainTicks: [{ year: '1996', label: 'Land Grant', detail: 'MIDC Sanction', docRef: 'MIDC-96' }],
    lawyerSignOff: { status: 'completed', advocateName: 'Adv. M. Joshi', notes: 'Lease deed and NOC verified' },
    chips: ['Leased', 'Grade A', 'Verified'],
    groundedQA: [],
    floorPlan: {
      type: 'warehouse',
      indicativeDisclaimer: 'Commercial IT floor layout',
      compassOrientation: 'North Face',
      entryPoint: { x: 50, y: 50, label: 'Lobby Entrance' },
      rooms: [{ name: 'Workstation Floor', nameDv: 'कामकाज विभाग', dimensions: '60ft × 40ft', areaSqFt: 2400, x: 20, y: 20, w: 180, h: 120 }],
    },
    lightSimulation: { morningAngle: 45, morningDesc: 'Diffuse morning natural light', afternoonAngle: 270, afternoonDesc: 'Heat reflective double glazed glass', balconyView: 'Pune Cyber Corridor' },
  },
  {
    id: 'pune-baner-villa',
    label: '6 Baner Hills · Villa Plot 12',
    tag: 'Verified asset',
    unit: 'Villa Plot 12 · 4,200 sq ft',
    unitType: 'Residential Villa Plot',
    tower: 'Hilltop Enclave',
    floor: 'Ground Plot',
    project: 'Baner Hills Reserve',
    location: 'Baner, Pune 411045',
    streetAddress: '86 Madison Ave',
    cityStateZip: 'Baner, Pune 411045',
    realdhaId: 'RA-PUN-006-BNR-12',
    mahaRera: 'P52100030192',
    asking: '₹1.85 Cr',
    beds: 4,
    baths: 4,
    avgRentalYield: '4.10%',
    currentRentalYield: '4.10%',
    valuationDelta: '19% Undervalued',
    investorCount: 74,
    tokenPrice: '$18.90 /share',
    marketValue: '₹1.85 Cr',
    fairValue: '₹2.20 Cr',
    categoryPills: ['Vacation Rental', 'No Mortgage', '19% Undervalued'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    ],
    facing: 'East',
    floorHeight: 'Hill Elevation',
    carpet: '3,800 sq ft',
    builtUp: '4,200 sq ft',
    balcony: 'Pashan Lake View',
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र महसूल प्राधिकरण · निर्दोष शीर्षक',
      sealEnglish: 'MAHARASHTRA REVENUE AUTHORITY · CLEAR RECORD',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: 'PMC Sanctioned Layout · 7/12 Clean Record',
      serialNo: 'MH-REV-2026-BNR-00120',
      date: '20-Nov-2026',
      stampColor: '#4A154B',
    },
    findings: [],
    sha256: '8e7d6c5b4a3928170f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a',
    txHash: '0x4b5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef1234',
    blockNumber: '19,842,202',
    documents: [],
    north: { name: 'Plot 11', description: 'Private Villa' },
    south: { name: 'Plot 13', description: 'Private Villa' },
    east: { name: 'Internal Road', description: '12m Avenue' },
    west: { name: 'Reserve Forest', description: 'Green Buffer' },
    above: { name: 'Skyline', description: 'Open Sky' },
    below: { name: 'Natural Bedrock', description: 'Solid Rock Base' },
    titleChainYears: '1996–2026 (30 yrs)',
    titleChainBar: [{ years: '1996-2026', color: '#10B981', width: '100%', holder: 'Baner Developers Ltd', transferType: 'Sanctioned Scheme' }],
    titleChainTicks: [{ year: '1996', label: 'Layout Sanction', detail: 'PMC Order', docRef: 'PMC-96' }],
    lawyerSignOff: { status: 'completed', notes: 'Clear title search report on file' },
    chips: ['Villa', 'Scenic', 'Undervalued'],
    groundedQA: [],
    floorPlan: { type: 'plot', indicativeDisclaimer: 'Cadastral Villa Plot', compassOrientation: 'East', entryPoint: { x: 50, y: 50, label: 'Main Gate' }, rooms: [] },
    lightSimulation: { morningAngle: 60, morningDesc: 'Direct sunrise view over Pashan Lake', afternoonAngle: 280, afternoonDesc: 'Evening breeze from hillside', balconyView: 'Lake and Valley' },
  },
  {
    id: 'pune-koregaon-park',
    label: '7 Koregaon Park · Penthouse 18',
    tag: 'Verified asset',
    unit: 'Penthouse 18 · 4 BHK Duplex',
    unitType: 'Luxury Duplex Penthouse',
    tower: 'The Pinnacle',
    floor: 'Floor 18-19',
    project: 'Koregaon Park Greens',
    location: 'Koregaon Park, Pune 411001',
    streetAddress: '9 Country Club Ln N',
    cityStateZip: 'Koregaon Park, Pune 411001',
    realdhaId: 'RA-PUN-007-KP-18-01',
    mahaRera: 'P52100019283',
    asking: '₹3.90 Cr',
    beds: 4,
    baths: 5,
    avgRentalYield: '3.20%',
    currentRentalYield: '3.20%',
    valuationDelta: '54% Undervalued',
    investorCount: 287,
    tokenPrice: '$17.96 /share',
    marketValue: '₹3.90 Cr',
    fairValue: '₹4.50 Cr',
    categoryPills: ['Vacation Rental', 'Cash Flowing', '54% Undervalued'],
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
    ],
    facing: 'North-East',
    floorHeight: '58 m',
    carpet: '2,950 sq ft',
    builtUp: '3,800 sq ft',
    balcony: 'Mula-Mutha River & Club View',
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र महसूल प्राधिकरण · प्रमाणित',
      sealEnglish: 'MAHARASHTRA REVENUE REGISTRATION · CLEAR',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: 'Society Share Certificate verified · Zero Lien',
      serialNo: 'MH-REV-2026-KP-00181',
      date: '20-Nov-2026',
      stampColor: '#4A154B',
    },
    findings: [],
    sha256: '7d6c5b4a3928170f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4e',
    txHash: '0x5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef123456',
    blockNumber: '19,842,203',
    documents: [],
    north: { name: 'Penthouse 18B', description: 'Adjoining Unit' },
    south: { name: 'River Promenade', description: 'Scenic View' },
    east: { name: 'Clubhouse Grounds', description: 'Greenery' },
    west: { name: 'Elevator Shaft', description: 'Private Foyer' },
    above: { name: 'Private Rooftop Deck', description: 'Jacuzzi & Lawn' },
    below: { name: 'Floor 17', description: 'Residence' },
    titleChainYears: '1996–2026 (30 yrs)',
    titleChainBar: [{ years: '1996-2026', color: '#10B981', width: '100%', holder: 'Pinnacle Cooperative Society', transferType: 'Conveyance Deed' }],
    titleChainTicks: [{ year: '1996', label: 'Land Conveyance', detail: 'Deed #4120', docRef: 'REG-96' }],
    lawyerSignOff: { status: 'completed', notes: 'Clear title search report on file' },
    chips: ['Penthouse', 'River View', 'Duplex'],
    groundedQA: [],
    floorPlan: { type: 'highrise', indicativeDisclaimer: 'Duplex Penthouse plan', compassOrientation: 'North-East', entryPoint: { x: 50, y: 50, label: 'Private Elevator' }, rooms: [] },
    lightSimulation: { morningAngle: 50, morningDesc: 'Sunlight over river deck', afternoonAngle: 270, afternoonDesc: 'Golden hour city panorama', balconyView: 'River and Club' },
  },
  {
    id: 'chakan-logistics',
    label: '8 Chakan Industrial · Bay 8',
    tag: 'Verified asset',
    unit: 'Logistics Bay 8 · 18,000 sq ft',
    unitType: 'Automotive Supply Warehouse',
    tower: 'Chakan MIDC Phase 2',
    floor: 'Grade Level',
    project: 'Chakan Auto Logistics Center',
    location: 'Chakan MIDC, Pune 410501',
    streetAddress: '4506 S Fallwood Ct',
    cityStateZip: 'Chakan, Pune 410501',
    realdhaId: 'RA-PUN-008-CHK-08',
    mahaRera: 'P52100028190',
    asking: '₹4.50 Cr',
    beds: 0,
    baths: 3,
    avgRentalYield: '15.40%',
    currentRentalYield: '15.40%',
    valuationDelta: '4% Overvalued',
    investorCount: 226,
    tokenPrice: '$45.80 /share',
    marketValue: '₹4.50 Cr',
    fairValue: '₹4.32 Cr',
    categoryPills: ['Single Family', 'Cash Flowing', 'Owner Occupied', 'Seller Buyback'],
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=80',
    ],
    facing: 'East',
    floorHeight: '12 m',
    carpet: '18,000 sq ft',
    builtUp: '19,500 sq ft',
    balcony: '6 Container Loading Docks',
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र औद्योगिक विकास महामंडळ · प्रमाणित',
      sealEnglish: 'MIDC INDUSTRIAL LEASEHOLD · VERIFIED',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: '95-Year MIDC Lease · Clean Title Certificate',
      serialNo: 'MH-REV-2026-CHK-00088',
      date: '20-Nov-2026',
      stampColor: '#4A154B',
    },
    findings: [],
    sha256: '6c5b4a3928170f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4e5f',
    txHash: '0x6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef12345678',
    blockNumber: '19,842,204',
    documents: [],
    north: { name: 'Bay 7', description: 'Tier 1 Auto Vendor' },
    south: { name: 'Bay 9', description: 'Logistics Depot' },
    east: { name: 'Internal 30m Road', description: 'Trailer Ingress' },
    west: { name: 'Service Rail Track', description: 'Freight Line' },
    above: { name: 'Steel Truss Roof', description: 'Insulated Roofing' },
    below: { name: 'VDF Flooring (8 Ton/m²)', description: 'Heavy Floor' },
    titleChainYears: '1996–2026 (30 yrs)',
    titleChainBar: [{ years: '1996-2026', color: '#10B981', width: '100%', holder: 'MIDC Chakan Phase 2', transferType: 'MIDC Lease' }],
    titleChainTicks: [{ year: '1996', label: 'MIDC Sanction', detail: 'Order #96-CH', docRef: 'MIDC-96' }],
    lawyerSignOff: { status: 'completed', notes: 'Clear title search report on file' },
    chips: ['Logistics', 'MIDC 95Y', 'High Yield'],
    groundedQA: [],
    floorPlan: { type: 'warehouse', indicativeDisclaimer: 'Heavy industrial logistics bay', compassOrientation: 'East', entryPoint: { x: 50, y: 50, label: 'Main Ingress Gate' }, rooms: [] },
    lightSimulation: { morningAngle: 60, morningDesc: 'Full daylighting skylights', afternoonAngle: 280, afternoonDesc: 'Thermally isolated roof', balconyView: 'Industrial Apron' },
  },
  {
    id: 'hinjewadi-studio',
    label: '9 Hinjewadi Phase 1 · Studio Suite',
    tag: 'Verified asset',
    unit: 'Suite 608 · Tech Studio',
    unitType: '1 BHK Co-living Studio',
    tower: 'Tower 4',
    floor: 'Floor 6',
    project: 'Hinjewadi Tech Suites',
    location: 'Hinjewadi Phase 1, Pune 411057',
    streetAddress: '2305 N 156th Pl',
    cityStateZip: 'Hinjewadi, Pune 411057',
    realdhaId: 'RA-PUN-009-HNJ-06-08',
    mahaRera: 'P52100021940',
    asking: '₹59.90 Lakh',
    beds: 1,
    baths: 1,
    avgRentalYield: '16.80%',
    currentRentalYield: '16.80%',
    valuationDelta: '12% Overvalued',
    investorCount: 146,
    tokenPrice: '$59.90 /share',
    marketValue: '₹59.90 Lakh',
    fairValue: '₹53.50 Lakh',
    categoryPills: ['Single Family', 'Cash Flowing', 'Owner Occupied', 'Seller Buyback'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    ],
    facing: 'East',
    floorHeight: '18 m',
    carpet: '480 sq ft',
    builtUp: '620 sq ft',
    balcony: 'Swimming Pool & Club Deck View',
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र महारेरा नोंदणी · प्रमाणित',
      sealEnglish: 'MAHARASHTRA RERA REGISTERED · VERIFIED',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: 'Guaranteed 3-year Corporate Leaseback',
      serialNo: 'MH-REV-2026-HNJ-00608',
      date: '20-Nov-2026',
      stampColor: '#4A154B',
    },
    findings: [],
    sha256: '5b4a3928170f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4e5f6a',
    txHash: '0x7e8f901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: '19,842,205',
    documents: [],
    north: { name: 'Suite 607', description: 'Studio' },
    south: { name: 'Suite 609', description: 'Studio' },
    east: { name: 'Pool View Balcony', description: 'Courtyard' },
    west: { name: 'Corridor', description: 'Elevator' },
    above: { name: 'Floor 7', description: 'Residential' },
    below: { name: 'Floor 5', description: 'Residential' },
    titleChainYears: '1996–2026 (30 yrs)',
    titleChainBar: [{ years: '1996-2026', color: '#10B981', width: '100%', holder: 'Tech Suites LLP', transferType: 'Development Agreement' }],
    titleChainTicks: [{ year: '1996', label: 'Land Acquisition', detail: 'PMC Order', docRef: 'PMC-96' }],
    lawyerSignOff: { status: 'completed', notes: 'Clear title search report on file' },
    chips: ['Studio', 'Pool View', '16.8% Yield'],
    groundedQA: [],
    floorPlan: { type: 'highrise', indicativeDisclaimer: 'Co-living studio layout', compassOrientation: 'East', entryPoint: { x: 50, y: 50, label: 'Keycard Entry' }, rooms: [] },
    lightSimulation: { morningAngle: 45, morningDesc: 'Direct morning light over pool', afternoonAngle: 270, afternoonDesc: 'Courtyard shaded', balconyView: 'Pool Deck' },
  },
  {
    id: 'alibaug-coastal',
    label: '10 Alibaug Coastal · Orchard Retreat',
    tag: 'Verified asset',
    unit: 'Parcel C-4 · 1.5 Acre Orchard',
    unitType: 'Coastal Farmhouse & Orchard',
    tower: 'Mandwa Enclave',
    floor: 'Estate Parcel',
    project: 'Alibaug Palms Reserve',
    location: 'Mandwa, Alibaug, Raigad 402201',
    streetAddress: '6601 E Hearn Rd',
    cityStateZip: 'Alibaug, Raigad 402201',
    realdhaId: 'RA-RAI-010-ALB-04',
    mahaRera: 'NA-Exempt (Orchard Farmhouse)',
    asking: '₹3.99 Cr',
    beds: 3,
    baths: 4,
    avgRentalYield: '10.50%',
    currentRentalYield: '10.50%',
    valuationDelta: '20% Undervalued',
    investorCount: 419,
    tokenPrice: '$39.99 /share',
    marketValue: '₹3.99 Cr',
    fairValue: '₹4.98 Cr',
    categoryPills: ['Vacation Rental', 'Cash Flowing', '20% Undervalued'],
    images: [
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
    facing: 'West (Sea Breeze)',
    floorHeight: 'Coastal Grade',
    carpet: '4,500 sq ft Built-up / 1.5 Acres',
    builtUp: '4,500 sq ft',
    balcony: 'Coconut Grove & Arabian Sea Breeze',
    stamp: {
      type: 'clear',
      sealMarathi: 'महाराष्ट्र महसूल प्राधिकरण · अलिबाग नोंदणी',
      sealEnglish: 'MAHARASHTRA REVENUE REGISTRATION · CLEAR',
      title: 'प्रमाणित · CLEAR TO PROCEED',
      subtitle: '7/12 Gat #104 Clear · Farmer Status Exemption Verified',
      serialNo: 'MH-REV-2026-ALB-00104',
      date: '20-Nov-2026',
      stampColor: '#4A154B',
    },
    findings: [],
    sha256: '4a3928170f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4e5f6a7b',
    txHash: '0x8f901234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    blockNumber: '19,842,206',
    documents: [],
    north: { name: 'Parcel C-3', description: 'Organic Farm' },
    south: { name: 'Parcel C-5', description: 'Mango Orchard' },
    east: { name: 'Internal Road', description: 'Access Road' },
    west: { name: 'Coastline Road', description: 'Arabian Sea Frontage' },
    above: { name: 'Open Coastal Sky', description: 'Unobstructed' },
    below: { name: 'Coastal Soil', description: 'Agricultural Soil' },
    titleChainYears: '1996–2026 (30 yrs)',
    titleChainBar: [{ years: '1996-2026', color: '#10B981', width: '100%', holder: 'Alibaug Agro Estates', transferType: 'Sale Deed' }],
    titleChainTicks: [{ year: '1996', label: 'Ferfar #104', detail: 'Revenue Mutation', docRef: 'REV-96' }],
    lawyerSignOff: { status: 'completed', notes: 'Clear title search report on file' },
    chips: ['Coastal', 'Orchard', 'Tennis Court'],
    groundedQA: [],
    floorPlan: { type: 'plot', indicativeDisclaimer: 'Estate villa and orchard layout', compassOrientation: 'West', entryPoint: { x: 50, y: 50, label: 'Estate Gate' }, rooms: [] },
    lightSimulation: { morningAngle: 60, morningDesc: 'Sunrise behind Sahyadri hills', afternoonAngle: 280, afternoonDesc: 'Spectacular Arabian Sea sunset', balconyView: 'Coconut Grove' },
  },
]
