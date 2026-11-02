import { jsPDF } from 'jspdf';

// Gera o certificado INTEIRAMENTE no navegador. O nome da criança nunca é enviado
// nem salvo na API/PostgreSQL (regra da LGPD do projeto).
export function gerarCertificado({ nome, codigo }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const cx = 148.5;
  doc.setLineWidth(1.2); doc.rect(10, 10, 277, 190);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(34); doc.text('Certificado de conclusão', cx, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(16); doc.text('Certificamos que', cx, 80, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(30); doc.text(nome, cx, 105, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(16);
  doc.text('completou a trilha de lógica de programação do Nexus.', cx, 130, { align: 'center' });
  doc.setFontSize(11); doc.text('Emitido em ' + new Date().toLocaleDateString('pt-BR'), cx, 175, { align: 'center' });
  doc.save(`certificado-${codigo}.pdf`);
}
