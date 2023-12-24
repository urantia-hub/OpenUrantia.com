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
  text?: string;
  type: string;
};

interface UBNodeLeadingTextProps {
  globalId: string;
  paperId: string;
  paperTitle: string;
  sectionId: string;
  sectionTitle: string;
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
  text: string;
  type: string;
  typeRank: number;
  _highlightResult: {
    htmlText: {
      value: string;
    };
  };
}
