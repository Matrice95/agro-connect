import { jsPDF } from 'jspdf';

export interface Bulletin {
  id: string;
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: string;
  content: {
    introduction: string;
    weatherConditions: {
      temperature: {
        average: number;
        anomaly: number;
      };
      rainfall: {
        total: number;
        anomaly: number;
      };
      humidity: {
        average: number;
        anomaly: number;
      };
    };
    ndvi: {
      value: number;
      anomaly: number;
      interpretation: string;
    };
    recommendations: string[];
  };
  regions: string[];
  crops: string[];
  isLatest: boolean;
  publishedAt: Date;
}

export function generatePDF(bulletin: Bulletin): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  const lineHeight = 7;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Bulletin Agrométéorologique', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;

  // Period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const periodText = `Période du ${bulletin.period.start.toLocaleDateString('fr-FR')} au ${bulletin.period.end.toLocaleDateString('fr-FR')}`;
  doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;

  // Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé', 20, yPosition);
  yPosition += lineHeight;
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(bulletin.summary, pageWidth - 40);
  doc.text(summaryLines, 20, yPosition);
  yPosition += lineHeight * (summaryLines.length + 1);

  // Weather Conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Conditions Météorologiques', 20, yPosition);
  yPosition += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.text([
    `Température moyenne: ${bulletin.content.weatherConditions.temperature.average}°C (anomalie: ${bulletin.content.weatherConditions.temperature.anomaly}°C)`,
    `Précipitations totales: ${bulletin.content.weatherConditions.rainfall.total}mm (anomalie: ${bulletin.content.weatherConditions.rainfall.anomaly}mm)`,
    `Humidité relative moyenne: ${bulletin.content.weatherConditions.humidity.average}% (anomalie: ${bulletin.content.weatherConditions.humidity.anomaly}%)`
  ], 20, yPosition);
  yPosition += lineHeight * 4;

  // NDVI
  doc.setFont('helvetica', 'bold');
  doc.text('Indice de Végétation (NDVI)', 20, yPosition);
  yPosition += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.text([
    `Valeur: ${bulletin.content.ndvi.value}`,
    `Anomalie: ${bulletin.content.ndvi.anomaly}`,
    `Interprétation: ${bulletin.content.ndvi.interpretation}`
  ], 20, yPosition);
  yPosition += lineHeight * 4;

  // Recommendations
  doc.setFont('helvetica', 'bold');
  doc.text('Recommandations', 20, yPosition);
  yPosition += lineHeight;
  doc.setFont('helvetica', 'normal');
  bulletin.content.recommendations.forEach(recommendation => {
    doc.text(`• ${recommendation}`, 20, yPosition);
    yPosition += lineHeight;
  });

  // Footer
  doc.setFontSize(8);
  doc.text('© AgroConnect+ - Document généré le ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  return doc.output('datauristring');
}

export function searchBulletins(bulletins: Bulletin[], query: string): Bulletin[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return bulletins.filter(bulletin => {
    const searchableText = [
      bulletin.title,
      bulletin.summary,
      bulletin.content.introduction,
      ...bulletin.content.recommendations,
      ...bulletin.regions,
      ...bulletin.crops
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
}

export function filterBulletinsByDate(bulletins: Bulletin[], startDate: Date, endDate: Date): Bulletin[] {
  return bulletins.filter(bulletin => {
    const publishDate = new Date(bulletin.publishedAt);
    return publishDate >= startDate && publishDate <= endDate;
  });
}

export function sortBulletinsByDate(bulletins: Bulletin[], ascending = false): Bulletin[] {
  return [...bulletins].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}