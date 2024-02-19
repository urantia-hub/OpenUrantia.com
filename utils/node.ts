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

// Utility function to determine the globalId from a standardReferenceId.
// The standardReferenceId is of the form: [paperId]:[sectionId]:[paragraphId]
// The globalId is of the form: [partId]:[paperId].[sectionId].[paragraphId]
export function getGlobalIdFromStandardReferenceId(
  standardReferenceId?: string | null
): string {
  if (!standardReferenceId) return "";

  const [paperId, rest] = standardReferenceId?.split(":");
  const [sectionId, paragraphId] = rest?.split(".");

  if (
    Number.isNaN(Number(paperId)) ||
    Number.isNaN(Number(sectionId)) ||
    Number.isNaN(Number(paragraphId))
  ) {
    console.warn(`Invalid standardReferenceId format: ${standardReferenceId}`);
    return "";
  }

  if (Number(paperId) < 0 || Number(paperId) > 196) {
    console.warn(`Invalid paperId: ${paperId}`);
    return "";
  }

  if (Number(sectionId) < 0 || Number(sectionId) > 999) {
    console.warn(`Invalid sectionId: ${sectionId}`);
    return "";
  }

  if (Number(paragraphId) <= 0 || Number(paragraphId) > 999) {
    console.warn(`Invalid paragraphId: ${paragraphId}`);
    return "";
  }

  const partKey = getPartFromPaperId(Number(paperId));

  return `${partKey}:${paperId}.${sectionId}.${paragraphId}`;
}

// Utility function to determine the standardReferenceId from a globalId.
// The standardReferenceId is of the form: [paperId]:[sectionId]:[paragraphId]
// The globalId is of the form: [partId]:[paperId].[sectionId].[paragraphId]
export function getStandardReferenceIdFromGlobalId(
  globalId?: string | null
): string {
  if (!globalId) return "";

  const [partId, rest] = globalId?.split(":");
  const [paperId, sectionId, paragraphId] = rest?.split(".");

  if (
    Number.isNaN(Number(partId)) ||
    Number.isNaN(Number(paperId)) ||
    Number.isNaN(Number(sectionId)) ||
    Number.isNaN(Number(paragraphId))
  ) {
    console.warn(`Invalid globalId format: ${globalId}`);
    return "";
  }

  if (Number(partId) < 0 || Number(partId) > 4) {
    console.warn(`Invalid partId: ${partId}`);
    return "";
  }

  if (Number(paperId) < 0 || Number(paperId) > 196) {
    console.warn(`Invalid paperId: ${paperId}`);
    return "";
  }

  if (Number(sectionId) < 0 || Number(sectionId) > 999) {
    console.warn(`Invalid sectionId: ${sectionId}`);
    return "";
  }

  if (Number(paragraphId) <= 0 || Number(paragraphId) > 999) {
    console.warn(`Invalid paragraphId: ${paragraphId}`);
    return "";
  }

  return `${paperId}:${sectionId}:${paragraphId}`;
}

export function getPaperIdFromGlobalId(globalId: string): string {
  return globalId.split(":")[1].split(".")[0];
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
