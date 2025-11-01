import { jsPDF } from "jspdf";

export async function generateAllQRDoc(
  items,
  heading,
  qrSize = 200,
  groupIndex = 0
) {
  if (!Array.isArray(items) || items.length === 0) {
    console.error("No QR data provided.");
    return;
  }

  try {
    // Create a new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add heading
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(heading, pageWidth / 2, 20, { align: "center" });

    // Collect QR code images
    const qrImages = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.qr) continue;

      const globalIndex = groupIndex * items.length + i;
      const qrId =
        item.path === "final" || item.path === "fooled"
          ? `qr-${item.color}-${item.path}-${item.qr}`
          : `qr-${globalIndex}`;

      const qrContainer = document.getElementById(qrId);
      if (!qrContainer) {
        console.warn(`QR container not found for ID: ${qrId}, skipping...`);
        continue;
      }

      const canvas = qrContainer.querySelector("canvas");
      if (!canvas) {
        console.warn(`Canvas not found for ${item.qr}, skipping...`);
        continue;
      }

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      qrImages.push(dataUrl);
    }

    // Layout configuration
    const margin = 15; // mm
    const spacing = 5; // mm spacing between QR codes

    const qrWidthMM = (qrSize * 25.4) / 96;
    const qrHeightMM = qrWidthMM; // Square QR codes

    const availableWidth = pageWidth - margin * 2;
    const qrsPerRow = Math.max(1, Math.floor((availableWidth + spacing) / (qrWidthMM + spacing)));

    let currentX = margin;
    let currentY = 35; // Start below heading
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add QR codes in a grid
    for (let i = 0; i < qrImages.length; i++) {
      const columnIndex = i % qrsPerRow;

      // Check if we need a new row
      if (columnIndex === 0 && i > 0) {
        currentY += qrHeightMM + spacing;
        currentX = margin;

        // Check if we need a new page
        if (currentY + qrHeightMM > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
      }

      // Add the QR code image
      doc.addImage(qrImages[i], "PNG", currentX, currentY, qrWidthMM, qrHeightMM);

      // Move to next column position
      currentX += qrWidthMM + spacing;
    }

    // Save the PDF
    const filename = `${heading.replace(/\s+/g, "_")}_QRs.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
}
