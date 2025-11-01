import PDFDocument from "pdfkit/js/pdfkit.standalone";
import blobStream from "blob-stream";

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

  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      // Create a blob stream to capture the PDF
      const stream = doc.pipe(blobStream());

      // Add heading
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(heading, { align: "center" })
        .moveDown(2);

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
      const qrsPerRow = 3;
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const spacing = 20;
      const imageWidth = (pageWidth - spacing * (qrsPerRow - 1)) / qrsPerRow;
      const imageHeight = imageWidth; // Square QR codes

      let currentX = doc.page.margins.left;
      let currentY = doc.y;

      // Add QR codes in a grid
      for (let i = 0; i < qrImages.length; i++) {
        const columnIndex = i % qrsPerRow;

        // Check if we need a new row
        if (columnIndex === 0 && i > 0) {
          currentY += imageHeight + spacing;
          currentX = doc.page.margins.left;

          // Check if we need a new page
          if (currentY + imageHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            currentY = doc.page.margins.top;
          }
        }

        // Add the QR code image
        doc.image(qrImages[i], currentX, currentY, {
          width: imageWidth,
          height: imageHeight,
        });

        // Move to next column position
        currentX += imageWidth + spacing;
      }

      // Finalize the PDF
      doc.end();

      // When the stream is finished, save the blob
      stream.on("finish", function () {
        const blob = stream.toBlob("application/pdf");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${heading.replace(/\s+/g, "_")}_QRs.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      });

      stream.on("error", (error) => {
        console.error("PDF generation error:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      reject(error);
    }
  });
}
