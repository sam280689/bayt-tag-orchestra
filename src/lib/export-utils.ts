import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportCandidate {
  name: string;
  email: string;
  profile_text?: string;
  created_at: string;
  tags: string;
}

export const exportToExcel = (candidates: ExportCandidate[], filename: string = 'candidates') => {
  const worksheet = XLSX.utils.json_to_sheet(candidates.map(candidate => ({
    Name: candidate.name,
    Email: candidate.email,
    Profile: candidate.profile_text || '',
    'Created Date': new Date(candidate.created_at).toLocaleDateString(),
    Tags: candidate.tags
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

  // Set column widths
  const wscols = [
    { wch: 20 }, // Name
    { wch: 30 }, // Email
    { wch: 50 }, // Profile
    { wch: 15 }, // Created Date
    { wch: 30 }  // Tags
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (candidates: ExportCandidate[], filename: string = 'candidates') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Candidates Export', 14, 22);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

  // Prepare table data
  const tableData = candidates.map(candidate => [
    candidate.name,
    candidate.email,
    candidate.profile_text ? (candidate.profile_text.length > 50 ? 
      candidate.profile_text.substring(0, 50) + '...' : candidate.profile_text) : '',
    new Date(candidate.created_at).toLocaleDateString(),
    candidate.tags
  ]);

  // Add table using autoTable directly
  autoTable(doc, {
    head: [['Name', 'Email', 'Profile', 'Created Date', 'Tags']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Name
      1: { cellWidth: 40 }, // Email
      2: { cellWidth: 60 }, // Profile
      3: { cellWidth: 25 }, // Created Date
      4: { cellWidth: 35 }  // Tags
    },
    margin: { top: 40 },
  });

  doc.save(`${filename}.pdf`);
};