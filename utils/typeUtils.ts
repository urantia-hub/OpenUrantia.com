export const enforceGlobalId = (key: string, value: unknown) => {
  // Example: "1:2.0.1" = "[partId]:[paperId].[sectionId].[paragraphId]"
  enforceString(key, value);

  // Verify partId.
  const partId = (value as string)?.split(":")?.[0];
  enforceStringNumber("partId", partId);

  // Verify paperId.
  const paperId = (value as string)?.split(":")?.[1]?.split(".")?.[0];
  enforceStringNumber("paperId", paperId);

  // Verify sectionId.
  const sectionId = (value as string)?.split(":")?.[1]?.split(".")?.[1];
  enforceStringNumber("sectionId", sectionId);

  // Verify paragraphId.
  const paragraphId = (value as string)?.split(":")?.[1]?.split(".")?.[2];
  enforceStringNumber("paragraphId", paragraphId);
};

export const enforceStandardReferenceId = (key: string, value: unknown) => {
  // Example: "1:0.1" = "[paperId]:[sectionId].[paragraphId]"
  enforceString(key, value);

  // Verify paperId.
  const paperId = (value as string)?.split(":")?.[0];
  enforceStringNumber("paperId", paperId);

  // Verify sectionId.
  const sectionId = (value as string)?.split(":")?.[1]?.split(".")?.[0];
  enforceStringNumber("sectionId", sectionId);

  // Verify paragraphId.
  const paragraphId = (value as string)?.split(":")?.[1]?.split(".")?.[1];
  enforceStringNumber("paragraphId", paragraphId);
};

export const enforcePaperId = (key: string, value: unknown) => {
  // Any string number from "0" to "196".
  enforceStringNumber(key, value);

  const numberValue = Number(value);
  if (numberValue < 0 || numberValue > 196) {
    throw new Error(`Expected '${key}' to be between 0 and 196, got ${value}`);
  }
};

export const enforceBoolean = (key: string, value: unknown) => {
  if (typeof value !== "boolean") {
    throw new Error(`Expected '${key}' to be a boolean, got ${typeof value}`);
  }
};

export const enforceNumber = (key: string, value: unknown) => {
  if (typeof value !== "number") {
    throw new Error(`Expected '${key}' to be a number, got ${typeof value}`);
  }
};

export const enforceString = (key: string, value: unknown) => {
  if (typeof value !== "string") {
    throw new Error(`Expected '${key}' to be a string, got ${typeof value}`);
  }
};

export const enforceStringNumber = (key: string, value: unknown) => {
  enforceString(key, value);

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    throw new Error(`Expected '${key}' to be a number, got ${value}`);
  }
};

export const enforceArrayOfStrings = (key: string, value: unknown) => {
  if (!Array.isArray(value)) {
    throw new Error(
      `Expected '${key}' to be an array of strings, got ${typeof value}`
    );
  }

  value.forEach((item: unknown) => {
    enforceString(key, item);
  });
};
