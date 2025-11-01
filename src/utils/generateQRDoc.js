import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

export async function generateAllQRDoc(
  items,
  heading,
  qrSize = 250,
  groupIndex = 0
) {
  if (!Array.isArray(items) || items.length === 0) {
    console.error("No QR data provided.");
    return;
  }

  const children = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: heading,
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

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
    const base64Data = dataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }

    qrImages.push(bytes);
  }

  const qrsPerRow = 3;

  for (let i = 0; i < qrImages.length; i += qrsPerRow) {
    const imageRuns = [];

    for (let j = 0; j < qrsPerRow; j++) {
      const qrData = qrImages[i + j];

      if (qrData) {
        if (j > 0) {
          imageRuns.push(new TextRun({ text: "    " }));
        }

        imageRuns.push(
          new ImageRun({
            data: qrData,
            transformation: {
              width: qrSize,
              height: qrSize,
            },
          })
        );
      }
    }

    children.push(
      new Paragraph({
        children: imageRuns,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${heading.replace(/\s+/g, "_")}_QRs.docx`;
  saveAs(blob, filename);
}
