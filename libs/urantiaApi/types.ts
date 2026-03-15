/**
 * Types for the urantia-dev-api (api.urantia.dev) response shapes.
 */

// Paragraph as returned by the new API
export type ApiParagraph = {
  id: string; // globalId (e.g., "1:2.0.1")
  standardReferenceId: string;
  sortId: string;
  paperId: string;
  sectionId: string | null;
  partId: string;
  paperTitle: string;
  sectionTitle: string | null;
  paragraphId: string;
  text: string;
  htmlText: string;
  labels: string[] | null;
  audio: Record<string, Record<string, { format: string; url: string }>> | null;
};

// TOC paper (nested inside a part)
export type ApiTocPaper = {
  id: string;
  title: string;
  labels: string[] | null;
};

// TOC part (top-level)
export type ApiTocPart = {
  id: string;
  title: string;
  sponsorship: string | null;
  papers: ApiTocPaper[];
};

// GET /toc response
export type ApiTocResponse = {
  data: {
    parts: ApiTocPart[];
  };
};

// GET /papers/{id} response
export type ApiPaperDetailResponse = {
  data: {
    paper: {
      id: string;
      partId: string;
      title: string;
      sortId: string;
      labels: string[] | null;
    };
    paragraphs: ApiParagraph[];
  };
};

// GET /paragraphs/{ref} response
export type ApiParagraphResponse = {
  data: ApiParagraph;
};

// POST /search result item (htmlText is already enriched with highlight spans)
export type ApiSearchResult = ApiParagraph & {
  rank: number;
};

// POST /search response
export type ApiSearchResponse = {
  data: ApiSearchResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
