export interface DocumentType {
  id: string;
  name: string;
  description: string;
  fee: number;
  category: 'Clearance' | 'Certificate';
}

export const getDocumentTypes = (t: any): DocumentType[] => [
  // --- CERTIFICATES ---
  {
    id: '1',
    name: 'CERTIFICATE OF BUSINESS CLOSURE',
    description: t('Certifies that a business has officially ceased operations.', 'Nagpapatunay na ang negosyo ay opisyal nang sarado.'),
    fee: 100.00,
    category: 'Certificate'
  },
  {
    id: '2',
    name: 'GOOD MORAL CERTIFICATE',
    description: t('Attests to the upright character of a resident.', 'Pagpapatunay sa mabuting pagkatao ng isang residente.'),
    fee: 50.00,
    category: 'Certificate'
  },
  {
    id: '3',
    name: 'BARANGAY CERTIFICATION',
    description: t('General certification for individual residents.', 'Pangkalahatang sertipikasyon para sa mga residente.'),
    fee: 50.00,
    category: 'Certificate'
  },
  {
    id: '4',
    name: 'RESIDENCY CERTIFICATE',
    description: t('Official proof of residency in Barangay 166.', 'Opisyal na patunay ng paninirahan sa Barangay 166.'),
    fee: 50.00,
    category: 'Certificate'
  },
  {
    id: '5',
    name: 'INDIGENCY CERTIFICATE',
    description: t('Issued to low-income households for financial aid.', 'Ibinibigay sa mga pamilyang may mababang kita para sa tulong pinansyal.'),
    fee: 0.00,
    category: 'Certificate'
  },
  {
    id: '6',
    name: 'AGENCY ENDORSEMENT CERTIFICATE',
    description: t('For requirements in other government or private agencies.', 'Para sa mga pangangailangan sa ibang ahensya ng gobyerno o pribado.'),
    fee: 50.00, 
    category: 'Certificate'
  },
  {
    id: '7',
    name: 'FIRST TIME JOBSEEKER (RA 11261)',
    description: t('Waived fees for first-time jobseekers including Oath of Undertaking.', 'Libreng bayad para sa mga unang beses maghahanap ng trabaho.'),
    fee: 0.00,
    category: 'Certificate'
  },
  {
    id: '8',
    name: 'NON-RESIDENT CERTIFICATION',
    description: t('Certification for individuals not residing in this barangay.', 'Sertipikasyon para sa mga indibidwal na hindi nakatira sa barangay na ito.'),
    fee: 75.00,
    category: 'Certificate'
  },
  {
    id: '9',
    name: 'LOW/NO INCOME CERTIFICATE',
    description: t('Proof of financial status for scholarship or medical aid.', 'Patunay ng katayuang pinansyal para sa scholarship o tulong medikal.'),
    fee: 0.00,
    category: 'Certificate'
  },
  {
    id: '10',
    name: 'TRANSFER OF RESIDENCY',
    description: t('Required for moving residency to another location.', 'Kinakailangan para sa paglipat ng paninirahan sa ibang lugar.'),
    fee: 50.00,
    category: 'Certificate'
  },

  // --- CLEARANCES ---
  {
    id: '11',
    name: 'NEW BUSINESS PERMIT CLEARANCE',
    description: t('Required for initial business registration and application.', 'Kinakailangan para sa unang pagpaparehistro ng negosyo.'),
    fee: 150.00,
    category: 'Clearance'
  },
  {
    id: '12',
    name: 'CONSTRUCTION PERMIT CLEARANCE',
    description: t('For building, fencing, excavation, or work permits.', 'Para sa permit sa pagtatayo, bakod, o paghuhukay.'),
    fee: 200.00,
    category: 'Clearance'
  },
  {
    id: '13',
    name: 'BUSINESS PERMIT RENEWAL',
    description: t('Barangay clearance for annual business permit renewal.', 'Kliyarans ng barangay para sa taunang renewal ng permit sa negosyo.'),
    fee: 100.00,
    category: 'Clearance'
  }
];