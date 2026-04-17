import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";

export default function LessonPDFExporter({ targetRef, fileName }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = async () => {
    if (!targetRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: "#fffefa",
        scale: 2
      });
      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName || "lesson"}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button className="action-button warn" onClick={exportPdf} disabled={isExporting}>
      {isExporting ? "Preparing PDF..." : "Download PDF"}
    </button>
  );
}
