type UBNode = {
  globalId: string;
  htmlText?: string;
  language: string;
  objectID: string;
  paperId: string;
  paperSectionId?: string;
  paperSectionParagraphId?: string;
  paperTitle: string;
  partId: string;
  sectionId?: string;
  sectionTitle?: string;
  standardReferenceId?: string;
  text?: string;
  type: string;
};

interface UBNodeLeadingTextProps {
  globalId: string;
  paperId: string;
  paperTitle: string;
  sectionId: string;
  sectionTitle: string;
  standardReferenceId: string;
}

interface SearchResult {
  globalId: string;
  htmlText: string;
  language: string;
  paperId: string;
  paperSectionId: string;
  paperSectionParagraphId: string;
  paperTitle: string;
  paragraphId: string;
  partId: string;
  sectionId: string;
  sectionTitle: string;
  sortId: string;
  standardReferenceId: string;
  text: string;
  type: string;
  typeRank: number;
  _highlightResult: {
    htmlText: {
      value: string;
    };
  };
}

interface ProgressResult {
  paperId: string;
  paperTitle: string;
  progress: number;
  readGlobalIds: string[];
  unreadGlobalIds: string[];
}

interface LastVisitedNode {
  globalId: string;
  paperId: string;
  paperTitle: string;
}
