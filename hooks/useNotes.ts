import { useState, useEffect } from "react";
import { Note } from "@prisma/client";

export function useNotes(paperId: string, status: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedGlobalIdNote, setSelectedGlobalIdNote] = useState<string>("");

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/user/nodes/notes?paperId=${paperId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotes();
  }, [paperId, status]);

  const onNoteClick = (globalId: string) => () => {
    setSelectedGlobalIdNote(globalId);
  };

  const onNoteClose = () => {
    setSelectedGlobalIdNote("");
    void fetchNotes();
  };

  return { notes, selectedGlobalIdNote, onNoteClick, onNoteClose };
}
