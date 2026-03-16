import { useState } from "react";

export function useModals() {
  const [selectedGlobalIdExplain, setSelectedGlobalIdExplain] = useState<string>("");
  const [selectedGlobalIdRelatedWorks, setSelectedGlobalIdRelatedWorks] = useState<string>("");
  const [selectedGlobalIdShare, setSelectedGlobalIdShare] = useState<string>("");
  const [expandedGlobalId, setExpandedGlobalId] = useState<string>("");

  const onExplainClose = () => setSelectedGlobalIdExplain("");
  const onShareClick = (globalId: string) => () => setSelectedGlobalIdShare(globalId);
  const onShareClose = () => setSelectedGlobalIdShare("");
  const onRelatedWorksClose = () => setSelectedGlobalIdRelatedWorks("");

  const onNodeSettingsClick = (globalId: string, options?: { onlyOpen: boolean }) => () => {
    if (options?.onlyOpen) {
      setExpandedGlobalId(globalId);
      return;
    }
    if (expandedGlobalId === globalId) {
      setExpandedGlobalId("");
      return;
    }
    setExpandedGlobalId(globalId);
  };

  return {
    selectedGlobalIdExplain, setSelectedGlobalIdExplain,
    selectedGlobalIdRelatedWorks, setSelectedGlobalIdRelatedWorks,
    selectedGlobalIdShare,
    expandedGlobalId, setExpandedGlobalId,
    onExplainClose,
    onShareClick, onShareClose,
    onRelatedWorksClose,
    onNodeSettingsClick,
  };
}
