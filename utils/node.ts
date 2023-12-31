// Utility function to determine the part number from the paper ID
function getPartFromPaperId(paperId: number): string {
  if (paperId >= 1 && paperId <= 31) {
    return "1";
  } else if (paperId >= 32 && paperId <= 56) {
    return "2";
  } else if (paperId >= 57 && paperId <= 119) {
    return "3";
  } else if (paperId >= 120 && paperId <= 196) {
    return "4";
  } else {
    return "0";
  }
}

// Function to zero-pad a number to a specified length
function zeroPad(number: number, length: number): string {
  return number.toString().padStart(length, "0");
}

// Function to create a sortable ID (sortId) from a globalId
export function createSortId(globalId: string): string {
  // Assuming globalId format: partId:paperId.paperSectionId.paperSectionParagraphId
  const parts = globalId.split(/[.:]/); // Split by '.' and ':'
  if (parts.length !== 4) {
    throw new Error(`Invalid globalId format: ${globalId}`);
  }

  const [partId, paperId, sectionId, paragraphId] = parts.map(Number);
  const partKey = getPartFromPaperId(paperId);
  const paperKey = zeroPad(paperId, 3);
  const sectionKey = zeroPad(sectionId, 3);
  const paragraphKey = zeroPad(paragraphId, 3);

  return `${partKey}.${paperKey}.${sectionKey}.${paragraphKey}`;
}
