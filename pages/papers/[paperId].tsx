// UBNode modules.
import { useState } from "react";
import Link from "next/link";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Header from "@/components/Header";
import RelatedWorks from "@/components/RelatedWorks";
import Share from "@/components/Share";
import Spinner from "@/components/Spinner";

type PaperPageProps = {
  paperData: {
    data: {
      results: UBNode[];
    };
  };
};

const PaperPage = ({ paperData }: PaperPageProps) => {
  // Toggled states.
  const [copiedGlobalIds, setCopiedGlobalIds] = useState<string[]>([]);
  const [expandedGlobalIds, setExpandedGlobalIds] = useState<string[]>([]);
  const [savedGlobalIds, setSavedGlobalIds] = useState<string[]>([]);

  // Network states.
  const [savingGlobalIds, setSavingGlobalIds] = useState<string[]>([]);
  const [savingErrorGlobalIds, setSavingErrorGlobalIds] = useState<string[]>(
    []
  );

  // Modal states.
  const [selectedGlobalIdRelatedWorks, setSelectedGlobalIdRelatedWorks] =
    useState<string>("");
  const [selectedGlobalIdShare, setSelectedGlobalIdShare] =
    useState<string>("");

  // Show a spinner until the content has loaded.
  if (!paperData) {
    return <Spinner />;
  }

  const onRelatedWorksClose = () => {
    setSelectedGlobalIdRelatedWorks("");
  };

  const onRelatedWorksClick = (globalId: string) => () => {
    setSelectedGlobalIdRelatedWorks(globalId);
  };

  const onShareClose = () => {
    setSelectedGlobalIdShare("");
  };

  const onShareClick = (globalId: string) => () => {
    setSelectedGlobalIdShare(globalId);
  };

  const onNodeSettingsClose = (globalId: string) => {
    // Remove globalId from expanded list.
    const updatedNodeSettingsIds = expandedGlobalIds.filter(
      (id) => id !== globalId
    );
    setExpandedGlobalIds(updatedNodeSettingsIds);

    // Remove globalId from copied list.
    const updatedCopiedIds = copiedGlobalIds.filter((id) => id !== globalId);
    setCopiedGlobalIds(updatedCopiedIds);
  };

  const onNodeSettingsClick = (globalId: string) => () => {
    // Remove the id if it's already expanded.
    if (expandedGlobalIds.includes(globalId)) {
      onNodeSettingsClose(globalId);
      return;
    }

    // Add the id.
    setExpandedGlobalIds([...expandedGlobalIds, globalId]);
  };

  const onCopyClick = (globalId: string, text: string) => async () => {
    // Copy the text.
    await navigator.clipboard.writeText(text);

    // Escape early if it's already copied.
    if (copiedGlobalIds.includes(globalId)) {
      return;
    }

    // Add the id.
    setCopiedGlobalIds([...copiedGlobalIds, globalId]);
  };

  const deriveSaveText = (globalId: string) => {
    if (savingGlobalIds.includes(globalId)) {
      return "Saving";
    }

    if (savingErrorGlobalIds.includes(globalId)) {
      return "Saving Error";
    }

    if (savedGlobalIds.includes(globalId)) {
      return "Saved";
    }

    return "Save";
  };

  const saveGlobalId = async (
    globalId: string
  ): Promise<boolean | undefined> => {
    // Escape early if we are already saving.
    if (savingGlobalIds.includes(globalId)) {
      return;
    }

    // Set saving state + reset error for globalId.
    setSavingGlobalIds([...savingGlobalIds, globalId]);
    const updatedSavingErrorGlobalIds = savingErrorGlobalIds.filter(
      (id) => id !== globalId
    );
    setSavingErrorGlobalIds(updatedSavingErrorGlobalIds);

    try {
      // Make request.
      console.log(`Saving ${globalId} for user`);
      await new Promise((resolve) => setTimeout(() => resolve(true), 500));
    } catch (error: any) {
      console.error("Error attempting to save global ID for user:", error);
      setSavingErrorGlobalIds([...savingErrorGlobalIds, globalId]);
    } finally {
      const updatedSavingGlobalIds = savingGlobalIds.filter(
        (id) => id !== globalId
      );
      setSavingGlobalIds(updatedSavingGlobalIds);
    }

    return true;
  };

  const onSaveClick = (globalId: string) => async () => {
    // Escape early if it's already saved.
    if (savedGlobalIds.includes(globalId)) {
      return;
    }

    // Make request to save globalId for user.
    const success = await saveGlobalId(globalId);

    // Add the id.
    if (success) {
      setSavedGlobalIds([...savedGlobalIds, globalId]);
    }
  };

  const renderNode = (node: UBNode) => {
    switch (node.type) {
      case "paper": {
        return (
          <div key={node.globalId} className="mb-12 text-center">
            <p className="text-xl mb-2">Paper {node.paperId}</p>
            <h1 className="text-4xl font-bold mb-12">{node.paperTitle}</h1>
          </div>
        );
      }
      case "section": {
        if (!node.sectionTitle) return null;
        return (
          <div key={node.globalId} className="mt-20 mb-12 text-center">
            <h2 className="text-3xl font-bold">{node.sectionTitle}</h2>
          </div>
        );
      }
      case "paragraph": {
        return (
          <div key={node.globalId} className="mb-6 text-left">
            <div className="text-lg leading-relaxed">
              <div className="flex items-center justify-between block mb-2 text-gray-400 text-sm">
                <span>{node.globalId}</span>
                <div className="flex items-center">
                  {expandedGlobalIds.includes(node.globalId) && (
                    <div className="flex items-center mr-2">
                      <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none mr-2 text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onCopyClick(
                          node.globalId,
                          node.text as string
                        )}
                        type="button"
                      >
                        {copiedGlobalIds.includes(node.globalId)
                          ? "Copied!"
                          : "Copy"}
                      </button>
                      <span className="mr-2">|</span>
                      <button
                        className="bg-transparent border-none p-0 m-0 mr-2 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onRelatedWorksClick(node.globalId)}
                        type="button"
                      >
                        Comment
                      </button>
                      <span className="mr-2">|</span>
                      <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none mr-2 text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onRelatedWorksClick(node.globalId)}
                        type="button"
                      >
                        Related
                      </button>
                      <span className="mr-2">|</span>
                      <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none mr-2 text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onShareClick(node.globalId)}
                        type="button"
                      >
                        Share
                      </button>
                      <span className="mr-2">|</span>
                      <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onSaveClick(node.globalId)}
                        type="button"
                      >
                        {deriveSaveText(node.globalId)}
                      </button>
                    </div>
                  )}
                  <button
                    className="bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                    onClick={onNodeSettingsClick(node.globalId)}
                    type="button"
                  >
                    ⋯
                  </button>
                </div>
              </div>
              <p
                dangerouslySetInnerHTML={{ __html: node.htmlText as string }}
              />
            </div>
          </div>
        );
      }
      default: {
        return null;
      }
    }
  };

  // Get the nodes from the paper data.
  const nodes = paperData.data.results;

  // Parse the current paperId as a number
  const currentPaperId = parseInt(nodes[0].paperId);

  // Calculate the next and previous paper IDs
  const prevPaperId = currentPaperId > 1 ? currentPaperId - 1 : null;
  const nextPaperId = currentPaperId < 196 ? currentPaperId + 1 : null;

  // Calculate nodes for modals.
  const relatedWorksNode = selectedGlobalIdRelatedWorks
    ? paperData.data.results.find(
        (node) => node.globalId === selectedGlobalIdRelatedWorks
      )
    : undefined;
  const shareNode = selectedGlobalIdShare
    ? paperData.data.results.find(
        (node) => node.globalId === selectedGlobalIdShare
      )
    : undefined;

  // Page content
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag
        metaDescription={nodes[0].paperTitle}
        titlePrefix={`Paper ${nodes[0].paperId} - ${nodes[0].paperTitle}`}
      />

      <Header />

      {/* Related Works Modal */}
      {selectedGlobalIdRelatedWorks && (
        <RelatedWorks onClose={onRelatedWorksClose} node={relatedWorksNode} />
      )}

      {/* Share Modal */}
      {selectedGlobalIdShare && (
        <Share onClose={onShareClose} node={shareNode} />
      )}

      <main className="flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mt-2 mb-4">
          {prevPaperId ? (
            <Link className="flex-1" href={`/papers/${prevPaperId}`}>
              ← Paper {prevPaperId}
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          <Link className="flex-1 text-center" href="/read">
            Table of Contents
          </Link>
          {nextPaperId ? (
            <Link className="flex-1 text-right" href={`/papers/${nextPaperId}`}>
              Paper {nextPaperId} →
            </Link>
          ) : (
            <span className="flex-1 text-right" />
          )}
        </div>

        {/* Paper content */}
        <div className="mb-12">
          {nodes.map((node: UBNode) => renderNode(node))}
        </div>

        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mb-12">
          {prevPaperId ? (
            <Link href={`/papers/${prevPaperId}`}>← Paper {prevPaperId}</Link>
          ) : (
            <span />
          )}
          {nextPaperId ? (
            <Link href={`/papers/${nextPaperId}`}>Paper {nextPaperId} →</Link>
          ) : (
            <span />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { paperId } = context.params;

  // Fetch data from your API
  // const res = await fetch(
  //   `${process.env.URANTIA_DEV_API_HOST}/api/v1/urantia-book/read?paperId=${paperId}`
  // );
  // const paperData = await res.json();

  const paperData = {
    data: {
      results: [
        {
          globalId: "1:4.-.-",
          htmlText: null,
          language: "eng",
          objectID: "1:4.-.-",
          paperId: "4",
          paperSectionId: null,
          paperSectionParagraphId: null,
          paperTitle: "God’s Relation to the Universe",
          paragraphId: null,
          partId: "1",
          sectionId: null,
          sectionTitle: null,
          sortId: "1.004.000.000",
          text: null,
          type: "paper",
          typeRank: 1,
        },
        {
          globalId: "1:4.0.-",
          htmlText: null,
          language: "eng",
          objectID: "1:4.0.-",
          paperId: "4",
          paperSectionId: "4.0",
          paperSectionParagraphId: null,
          paperTitle: "God’s Relation to the Universe",
          paragraphId: null,
          partId: "1",
          sectionId: "0",
          sectionTitle: null,
          sortId: "1.004.000.000",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "1:4.0.1",
          htmlText:
            "THE Universal Father has an eternal purpose pertaining to the material, intellectual, and spiritual phenomena of the universe of universes, which he is executing throughout all time. God created the universes of his own free and sovereign will, and he created them in accordance with his all-wise and eternal purpose. It is doubtful whether anyone except the Paradise Deities and their highest associates really knows very much about the eternal purpose of God. Even the exalted citizens of Paradise hold very diverse opinions about the nature of the eternal purpose of the Deities.",
          language: "eng",
          objectID: "1:4.0.1",
          paperId: "4",
          paperSectionId: "4.0",
          paperSectionParagraphId: "4.0.1",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "1",
          partId: "1",
          sectionId: "0",
          sectionTitle: null,
          sortId: "1.004.000.001",
          text: "THE Universal Father has an eternal purpose pertaining to the material, intellectual, and spiritual phenomena of the universe of universes, which he is executing throughout all time. God created the universes of his own free and sovereign will, and he created them in accordance with his all-wise and eternal purpose. It is doubtful whether anyone except the Paradise Deities and their highest associates really knows very much about the eternal purpose of God. Even the exalted citizens of Paradise hold very diverse opinions about the nature of the eternal purpose of the Deities.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.0.2",
          htmlText:
            "It is easy to deduce that the purpose in creating the perfect central universe of Havona was purely the satisfaction of the divine nature. Havona may serve as the pattern creation for all other universes and as the finishing school for the pilgrims of time on their way to Paradise; however, such a supernal creation must exist primarily for the pleasure and satisfaction of the perfect and infinite Creators.",
          language: "eng",
          objectID: "1:4.0.2",
          paperId: "4",
          paperSectionId: "4.0",
          paperSectionParagraphId: "4.0.2",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "2",
          partId: "1",
          sectionId: "0",
          sectionTitle: null,
          sortId: "1.004.000.002",
          text: "It is easy to deduce that the purpose in creating the perfect central universe of Havona was purely the satisfaction of the divine nature. Havona may serve as the pattern creation for all other universes and as the finishing school for the pilgrims of time on their way to Paradise; however, such a supernal creation must exist primarily for the pleasure and satisfaction of the perfect and infinite Creators.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.0.3",
          htmlText:
            "The amazing plan for perfecting evolutionary mortals and, after their attainment of Paradise and the Corps of the Finality, providing further training for some undisclosed future work, does seem to be, at present, one of the chief concerns of the seven superuniverses and their many subdivisions; but this ascension scheme for spiritualizing and training the mortals of time and space is by no means the exclusive occupation of the universe intelligences. There are, indeed, many other fascinating pursuits which occupy the time and enlist the energies of the celestial hosts.",
          language: "eng",
          objectID: "1:4.0.3",
          paperId: "4",
          paperSectionId: "4.0",
          paperSectionParagraphId: "4.0.3",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "3",
          partId: "1",
          sectionId: "0",
          sectionTitle: null,
          sortId: "1.004.000.003",
          text: "The amazing plan for perfecting evolutionary mortals and, after their attainment of Paradise and the Corps of the Finality, providing further training for some undisclosed future work, does seem to be, at present, one of the chief concerns of the seven superuniverses and their many subdivisions; but this ascension scheme for spiritualizing and training the mortals of time and space is by no means the exclusive occupation of the universe intelligences. There are, indeed, many other fascinating pursuits which occupy the time and enlist the energies of the celestial hosts.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.-",
          htmlText: null,
          language: "eng",
          objectID: "1:4.1.-",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: null,
          paperTitle: "God’s Relation to the Universe",
          paragraphId: null,
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.000",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "1:4.1.1",
          htmlText:
            "For ages the inhabitants of Urantia have misunderstood the providence of God. There is a providence of divine outworking on your world, but it is not the childish, arbitrary, and material ministry many mortals have conceived it to be. The providence of God consists in the interlocking activities of the celestial beings and the divine spirits who, in accordance with cosmic law, unceasingly labor for the honor of God and for the spiritual advancement of his universe children.",
          language: "eng",
          objectID: "1:4.1.1",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.1",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "1",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.001",
          text: "For ages the inhabitants of Urantia have misunderstood the providence of God. There is a providence of divine outworking on your world, but it is not the childish, arbitrary, and material ministry many mortals have conceived it to be. The providence of God consists in the interlocking activities of the celestial beings and the divine spirits who, in accordance with cosmic law, unceasingly labor for the honor of God and for the spiritual advancement of his universe children.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.2",
          htmlText:
            "Can you not advance in your concept of God’s dealing with man to that level where you recognize that the watchword of the universe is <em>progress?</em> Through long ages the human race has struggled to reach its present position. Throughout all these millenniums Providence has been working out the plan of progressive evolution. The two thoughts are not opposed in practice, only in man’s mistaken concepts. Divine providence is never arrayed in opposition to true human progress, either temporal or spiritual. Providence is always consistent with the unchanging and perfect nature of the supreme Lawmaker.",
          language: "eng",
          objectID: "1:4.1.2",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.2",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "2",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.002",
          text: "Can you not advance in your concept of God’s dealing with man to that level where you recognize that the watchword of the universe is progress? Through long ages the human race has struggled to reach its present position. Throughout all these millenniums Providence has been working out the plan of progressive evolution. The two thoughts are not opposed in practice, only in man’s mistaken concepts. Divine providence is never arrayed in opposition to true human progress, either temporal or spiritual. Providence is always consistent with the unchanging and perfect nature of the supreme Lawmaker.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.3",
          htmlText:
            "“God is faithful” and “all his commandments are just.” “His faithfulness is established in the very skies.” “Forever, O Lord, your word is settled in heaven. Your faithfulness is to all generations; you have established the earth and it abides.” “He is a faithful Creator.”",
          language: "eng",
          objectID: "1:4.1.3",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.3",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "3",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.003",
          text: "“God is faithful” and “all his commandments are just.” “His faithfulness is established in the very skies.” “Forever, O Lord, your word is settled in heaven. Your faithfulness is to all generations; you have established the earth and it abides.” “He is a faithful Creator.”",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.4",
          htmlText:
            "There is no limitation of the forces and personalities which the Father may use to uphold his purpose and sustain his creatures. “The eternal God is our refuge, and underneath are the everlasting arms.” “He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.” “Behold, he who keeps us shall neither slumber nor sleep.” “We know that all things work together for good to those who love God,” “for the eyes of the Lord are over the righteous, and his ears are open to their prayers.”",
          language: "eng",
          objectID: "1:4.1.4",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.4",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "4",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.004",
          text: "There is no limitation of the forces and personalities which the Father may use to uphold his purpose and sustain his creatures. “The eternal God is our refuge, and underneath are the everlasting arms.” “He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.” “Behold, he who keeps us shall neither slumber nor sleep.” “We know that all things work together for good to those who love God,” “for the eyes of the Lord are over the righteous, and his ears are open to their prayers.”",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.5",
          htmlText:
            "God upholds “all things by the word of his power.” And when new worlds are born, he “sends forth his Sons and they are created.” God not only creates, but he “preserves them all.” God constantly upholds all things material and all beings spiritual. The universes are eternally stable. There is stability in the midst of apparent instability. There is an underlying order and security in the midst of the energy upheavals and the physical cataclysms of the starry realms.",
          language: "eng",
          objectID: "1:4.1.5",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.5",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "5",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.005",
          text: "God upholds “all things by the word of his power.” And when new worlds are born, he “sends forth his Sons and they are created.” God not only creates, but he “preserves them all.” God constantly upholds all things material and all beings spiritual. The universes are eternally stable. There is stability in the midst of apparent instability. There is an underlying order and security in the midst of the energy upheavals and the physical cataclysms of the starry realms.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.6",
          htmlText:
            "The Universal Father has not withdrawn from the management of the universes; he is not an inactive Deity. If God should retire as the present upholder of all creation, there would immediately occur a universal collapse. Except for God, there would be no such thing as <em>reality.</em> At this very moment, as during the remote ages of the past and in the eternal future, God continues to uphold. The divine reach extends around the circle of eternity. The universe is not wound up like a clock to run just so long and then cease to function; all things are constantly being renewed. The Father unceasingly pours forth energy, light, and life. The work of God is literal as well as spiritual. “He stretches out the north over the empty space and hangs the earth upon nothing.”",
          language: "eng",
          objectID: "1:4.1.6",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.6",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "6",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.006",
          text: "The Universal Father has not withdrawn from the management of the universes; he is not an inactive Deity. If God should retire as the present upholder of all creation, there would immediately occur a universal collapse. Except for God, there would be no such thing as reality. At this very moment, as during the remote ages of the past and in the eternal future, God continues to uphold. The divine reach extends around the circle of eternity. The universe is not wound up like a clock to run just so long and then cease to function; all things are constantly being renewed. The Father unceasingly pours forth energy, light, and life. The work of God is literal as well as spiritual. “He stretches out the north over the empty space and hangs the earth upon nothing.”",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.7",
          htmlText:
            "A being of my order is able to discover ultimate harmony and to detect far-reaching and profound co-ordination in the routine affairs of universe administration. Much that seems disjointed and haphazard to the mortal mind appears orderly and constructive to my understanding. But there is very much going on in the universes that I do not fully comprehend. I have long been a student of, and am more or less conversant with, the recognized forces, energies, minds, morontias, spirits, and personalities of the local universes and the superuniverses. I have a general understanding of how these agencies and personalities operate, and I am intimately familiar with the workings of the accredited spirit intelligences of the grand universe. Notwithstanding my knowledge of the phenomena of the universes, I am constantly confronted with cosmic reactions which I cannot fully fathom. I am continually encountering apparently fortuitous conspiracies of the interassociation of forces, energies, intellects, and spirits, which I cannot satisfactorily explain.",
          language: "eng",
          objectID: "1:4.1.7",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.7",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "7",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.007",
          text: "A being of my order is able to discover ultimate harmony and to detect far-reaching and profound co-ordination in the routine affairs of universe administration. Much that seems disjointed and haphazard to the mortal mind appears orderly and constructive to my understanding. But there is very much going on in the universes that I do not fully comprehend. I have long been a student of, and am more or less conversant with, the recognized forces, energies, minds, morontias, spirits, and personalities of the local universes and the superuniverses. I have a general understanding of how these agencies and personalities operate, and I am intimately familiar with the workings of the accredited spirit intelligences of the grand universe. Notwithstanding my knowledge of the phenomena of the universes, I am constantly confronted with cosmic reactions which I cannot fully fathom. I am continually encountering apparently fortuitous conspiracies of the interassociation of forces, energies, intellects, and spirits, which I cannot satisfactorily explain.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.8",
          htmlText:
            "I am entirely competent to trace out and to analyze the working of all phenomena directly resulting from the functioning of the Universal Father, the Eternal Son, the Infinite Spirit, and, to a large extent, the Isle of Paradise. My perplexity is occasioned by encountering what appears to be the performance of their mysterious co-ordinates, the three Absolutes of potentiality. These Absolutes seem to supersede matter, to transcend mind, and to supervene spirit. I am constantly confused and often perplexed by my inability to comprehend these complex transactions which I attribute to the presences and performances of the Unqualified Absolute, the Deity Absolute, and the Universal Absolute.",
          language: "eng",
          objectID: "1:4.1.8",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.8",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "8",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.008",
          text: "I am entirely competent to trace out and to analyze the working of all phenomena directly resulting from the functioning of the Universal Father, the Eternal Son, the Infinite Spirit, and, to a large extent, the Isle of Paradise. My perplexity is occasioned by encountering what appears to be the performance of their mysterious co-ordinates, the three Absolutes of potentiality. These Absolutes seem to supersede matter, to transcend mind, and to supervene spirit. I am constantly confused and often perplexed by my inability to comprehend these complex transactions which I attribute to the presences and performances of the Unqualified Absolute, the Deity Absolute, and the Universal Absolute.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.9",
          htmlText:
            "These Absolutes must be the not-fully-revealed presences abroad in the universe which, in the phenomena of space potency and in the function of other superultimates, render it impossible for physicists, philosophers, or even religionists to predict with certainty as to just how the primordials of force, concept, or spirit will respond to demands made in a complex reality situation involving supreme adjustments and ultimate values.",
          language: "eng",
          objectID: "1:4.1.9",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.9",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "9",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.009",
          text: "These Absolutes must be the not-fully-revealed presences abroad in the universe which, in the phenomena of space potency and in the function of other superultimates, render it impossible for physicists, philosophers, or even religionists to predict with certainty as to just how the primordials of force, concept, or spirit will respond to demands made in a complex reality situation involving supreme adjustments and ultimate values.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.10",
          htmlText:
            "There is also an organic unity in the universes of time and space which seems to underlie the whole fabric of cosmic events. This living presence of the evolving Supreme Being, this Immanence of the Projected Incomplete, is inexplicably manifested ever and anon by what appears to be an amazingly fortuitous co-ordination of apparently unrelated universe happenings. This must be the function of Providence—the realm of the Supreme Being and the Conjoint Actor.",
          language: "eng",
          objectID: "1:4.1.10",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.10",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "10",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.010",
          text: "There is also an organic unity in the universes of time and space which seems to underlie the whole fabric of cosmic events. This living presence of the evolving Supreme Being, this Immanence of the Projected Incomplete, is inexplicably manifested ever and anon by what appears to be an amazingly fortuitous co-ordination of apparently unrelated universe happenings. This must be the function of Providence—the realm of the Supreme Being and the Conjoint Actor.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.11",
          htmlText:
            "I am inclined to believe that it is this far-flung and generally unrecognizable control of the co-ordination and interassociation of all phases and forms of universe activity that causes such a variegated and apparently hopelessly confused medley of physical, mental, moral, and spiritual phenomena so unerringly to work out to the glory of God and for the good of men and angels.",
          language: "eng",
          objectID: "1:4.1.11",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.11",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "11",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.011",
          text: "I am inclined to believe that it is this far-flung and generally unrecognizable control of the co-ordination and interassociation of all phases and forms of universe activity that causes such a variegated and apparently hopelessly confused medley of physical, mental, moral, and spiritual phenomena so unerringly to work out to the glory of God and for the good of men and angels.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.1.12",
          htmlText:
            "But in the larger sense the apparent “accidents” of the cosmos are undoubtedly a part of the finite drama of the time-space adventure of the Infinite in his eternal manipulation of the Absolutes.",
          language: "eng",
          objectID: "1:4.1.12",
          paperId: "4",
          paperSectionId: "4.1",
          paperSectionParagraphId: "4.1.12",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "12",
          partId: "1",
          sectionId: "1",
          sectionTitle: "The Universe Attitude of the Father",
          sortId: "1.004.001.012",
          text: "But in the larger sense the apparent “accidents” of the cosmos are undoubtedly a part of the finite drama of the time-space adventure of the Infinite in his eternal manipulation of the Absolutes.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.-",
          htmlText: null,
          language: "eng",
          objectID: "1:4.2.-",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: null,
          paperTitle: "God’s Relation to the Universe",
          paragraphId: null,
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.000",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "1:4.2.1",
          htmlText:
            "Nature is in a limited sense the physical habit of God. The conduct, or action, of God is qualified and provisionally modified by the experimental plans and the evolutionary patterns of a local universe, a constellation, a system, or a planet. God acts in accordance with a well-defined, unchanging, immutable law throughout the wide-spreading master universe; but he modifies the patterns of his action so as to contribute to the co-ordinate and balanced conduct of each universe, constellation, system, planet, and personality in accordance with the local objects, aims, and plans of the finite projects of evolutionary unfolding.",
          language: "eng",
          objectID: "1:4.2.1",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.1",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "1",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.001",
          text: "Nature is in a limited sense the physical habit of God. The conduct, or action, of God is qualified and provisionally modified by the experimental plans and the evolutionary patterns of a local universe, a constellation, a system, or a planet. God acts in accordance with a well-defined, unchanging, immutable law throughout the wide-spreading master universe; but he modifies the patterns of his action so as to contribute to the co-ordinate and balanced conduct of each universe, constellation, system, planet, and personality in accordance with the local objects, aims, and plans of the finite projects of evolutionary unfolding.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.2",
          htmlText:
            "Therefore, nature, as mortal man understands it, presents the underlying foundation and fundamental background of a changeless Deity and his immutable laws, modified by, fluctuating because of, and experiencing upheavals through, the working of the local plans, purposes, patterns, and conditions which have been inaugurated and are being carried out by the local universe, constellation, system, and planetary forces and personalities. For example: As God’s laws have been ordained in Nebadon, they are modified by the plans established by the Creator Son and Creative Spirit of this local universe; and in addition to all this the operation of these laws has been further influenced by the errors, defaults, and insurrections of certain beings resident upon your planet and belonging to your immediate planetary system of Satania.",
          language: "eng",
          objectID: "1:4.2.2",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.2",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "2",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.002",
          text: "Therefore, nature, as mortal man understands it, presents the underlying foundation and fundamental background of a changeless Deity and his immutable laws, modified by, fluctuating because of, and experiencing upheavals through, the working of the local plans, purposes, patterns, and conditions which have been inaugurated and are being carried out by the local universe, constellation, system, and planetary forces and personalities. For example: As God’s laws have been ordained in Nebadon, they are modified by the plans established by the Creator Son and Creative Spirit of this local universe; and in addition to all this the operation of these laws has been further influenced by the errors, defaults, and insurrections of certain beings resident upon your planet and belonging to your immediate planetary system of Satania.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.3",
          htmlText:
            "Nature is a time-space resultant of two cosmic factors: first, the immutability, perfection, and rectitude of Paradise Deity, and second, the experimental plans, executive blunders, insurrectionary errors, incompleteness of development, and imperfection of wisdom of the extra-Paradise creatures, from the highest to the lowest. Nature therefore carries a uniform, unchanging, majestic, and marvelous thread of perfection from the circle of eternity; but in each universe, on each planet, and in each individual life, this nature is modified, qualified, and perchance marred by the acts, the mistakes, and the disloyalties of the creatures of the evolutionary systems and universes; and therefore must nature ever be of a changing mood, whimsical withal, though stable underneath, and varied in accordance with the operating procedures of a local universe.",
          language: "eng",
          objectID: "1:4.2.3",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.3",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "3",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.003",
          text: "Nature is a time-space resultant of two cosmic factors: first, the immutability, perfection, and rectitude of Paradise Deity, and second, the experimental plans, executive blunders, insurrectionary errors, incompleteness of development, and imperfection of wisdom of the extra-Paradise creatures, from the highest to the lowest. Nature therefore carries a uniform, unchanging, majestic, and marvelous thread of perfection from the circle of eternity; but in each universe, on each planet, and in each individual life, this nature is modified, qualified, and perchance marred by the acts, the mistakes, and the disloyalties of the creatures of the evolutionary systems and universes; and therefore must nature ever be of a changing mood, whimsical withal, though stable underneath, and varied in accordance with the operating procedures of a local universe.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.4",
          htmlText:
            "Nature is the perfection of Paradise divided by the incompletion, evil, and sin of the unfinished universes. This quotient is thus expressive of both the perfect and the partial, of both the eternal and the temporal. Continuing evolution modifies nature by augmenting the content of Paradise perfection and by diminishing the content of the evil, error, and disharmony of relative reality.",
          language: "eng",
          objectID: "1:4.2.4",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.4",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "4",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.004",
          text: "Nature is the perfection of Paradise divided by the incompletion, evil, and sin of the unfinished universes. This quotient is thus expressive of both the perfect and the partial, of both the eternal and the temporal. Continuing evolution modifies nature by augmenting the content of Paradise perfection and by diminishing the content of the evil, error, and disharmony of relative reality.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.5",
          htmlText:
            "God is not personally present in nature or in any of the forces of nature, for the phenomenon of nature is the superimposition of the imperfections of progressive evolution and, sometimes, the consequences of insurrectionary rebellion, upon the Paradise foundations of God’s universal law. As it appears on such a world as Urantia, nature can never be the adequate expression, the true representation, the faithful portrayal, of an all-wise and infinite God.",
          language: "eng",
          objectID: "1:4.2.5",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.5",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "5",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.005",
          text: "God is not personally present in nature or in any of the forces of nature, for the phenomenon of nature is the superimposition of the imperfections of progressive evolution and, sometimes, the consequences of insurrectionary rebellion, upon the Paradise foundations of God’s universal law. As it appears on such a world as Urantia, nature can never be the adequate expression, the true representation, the faithful portrayal, of an all-wise and infinite God.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.6",
          htmlText:
            "Nature, on your world, is a qualification of the laws of perfection by the evolutionary plans of the local universe. What a travesty to worship nature because it is in a limited, qualified sense pervaded by God; because it is a phase of the universal and, therefore, divine power! Nature also is a manifestation of the unfinished, the incomplete, the imperfect outworkings of the development, growth, and progress of a universe experiment in cosmic evolution.",
          language: "eng",
          objectID: "1:4.2.6",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.6",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "6",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.006",
          text: "Nature, on your world, is a qualification of the laws of perfection by the evolutionary plans of the local universe. What a travesty to worship nature because it is in a limited, qualified sense pervaded by God; because it is a phase of the universal and, therefore, divine power! Nature also is a manifestation of the unfinished, the incomplete, the imperfect outworkings of the development, growth, and progress of a universe experiment in cosmic evolution.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.7",
          htmlText:
            "The apparent defects of the natural world are not indicative of any such corresponding defects in the character of God. Rather are such observed imperfections merely the inevitable stop-moments in the exhibition of the ever-moving reel of infinity picturization. It is these very defect-interruptions of perfection-continuity which make it possible for the finite mind of material man to catch a fleeting glimpse of divine reality in time and space. The material manifestations of divinity appear defective to the evolutionary mind of man only because mortal man persists in viewing the phenomena of nature through natural eyes, human vision unaided by morontia mota or by revelation, its compensatory substitute on the worlds of time.",
          language: "eng",
          objectID: "1:4.2.7",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.7",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "7",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.007",
          text: "The apparent defects of the natural world are not indicative of any such corresponding defects in the character of God. Rather are such observed imperfections merely the inevitable stop-moments in the exhibition of the ever-moving reel of infinity picturization. It is these very defect-interruptions of perfection-continuity which make it possible for the finite mind of material man to catch a fleeting glimpse of divine reality in time and space. The material manifestations of divinity appear defective to the evolutionary mind of man only because mortal man persists in viewing the phenomena of nature through natural eyes, human vision unaided by morontia mota or by revelation, its compensatory substitute on the worlds of time.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.2.8",
          htmlText:
            "And nature is marred, her beautiful face is scarred, her features are seared, by the rebellion, the misconduct, the misthinking of the myriads of creatures who are a part of nature, but who have contributed to her disfigurement in time. No, nature is not God. Nature is not an object of worship.",
          language: "eng",
          objectID: "1:4.2.8",
          paperId: "4",
          paperSectionId: "4.2",
          paperSectionParagraphId: "4.2.8",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "8",
          partId: "1",
          sectionId: "2",
          sectionTitle: "God and Nature",
          sortId: "1.004.002.008",
          text: "And nature is marred, her beautiful face is scarred, her features are seared, by the rebellion, the misconduct, the misthinking of the myriads of creatures who are a part of nature, but who have contributed to her disfigurement in time. No, nature is not God. Nature is not an object of worship.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.-",
          htmlText: null,
          language: "eng",
          objectID: "1:4.3.-",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: null,
          paperTitle: "God’s Relation to the Universe",
          paragraphId: null,
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.000",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "1:4.3.1",
          htmlText:
            "All too long has man thought of God as one like himself. God is not, never was, and never will be jealous of man or any other being in the universe of universes. Knowing that the Creator Son intended man to be the masterpiece of the planetary creation, to be the ruler of all the earth, the sight of his being dominated by his own baser passions, the spectacle of his bowing down before idols of wood, stone, gold, and selfish ambition—these sordid scenes stir God and his Sons to be jealous <em>for</em> man, but never of him.",
          language: "eng",
          objectID: "1:4.3.1",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.1",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "1",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.001",
          text: "All too long has man thought of God as one like himself. God is not, never was, and never will be jealous of man or any other being in the universe of universes. Knowing that the Creator Son intended man to be the masterpiece of the planetary creation, to be the ruler of all the earth, the sight of his being dominated by his own baser passions, the spectacle of his bowing down before idols of wood, stone, gold, and selfish ambition—these sordid scenes stir God and his Sons to be jealous for man, but never of him.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.2",
          htmlText:
            "The eternal God is incapable of wrath and anger in the sense of these human emotions and as man understands such reactions. These sentiments are mean and despicable; they are hardly worthy of being called human, much less divine; and such attitudes are utterly foreign to the perfect nature and gracious character of the Universal Father.",
          language: "eng",
          objectID: "1:4.3.2",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.2",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "2",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.002",
          text: "The eternal God is incapable of wrath and anger in the sense of these human emotions and as man understands such reactions. These sentiments are mean and despicable; they are hardly worthy of being called human, much less divine; and such attitudes are utterly foreign to the perfect nature and gracious character of the Universal Father.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.3",
          htmlText:
            "Much, very much, of the difficulty which Urantia mortals have in understanding God is due to the far-reaching consequences of the Lucifer rebellion and the Caligastia betrayal. On worlds not segregated by sin, the evolutionary races are able to formulate far better ideas of the Universal Father; they suffer less from confusion, distortion, and perversion of concept.",
          language: "eng",
          objectID: "1:4.3.3",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.3",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "3",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.003",
          text: "Much, very much, of the difficulty which Urantia mortals have in understanding God is due to the far-reaching consequences of the Lucifer rebellion and the Caligastia betrayal. On worlds not segregated by sin, the evolutionary races are able to formulate far better ideas of the Universal Father; they suffer less from confusion, distortion, and perversion of concept.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.4",
          htmlText:
            "God repents of nothing he has ever done, now does, or ever will do. He is all-wise as well as all-powerful. Man’s wisdom grows out of the trials and errors of human experience; God’s wisdom consists in the unqualified perfection of his infinite universe insight, and this divine foreknowledge effectively directs the creative free will.",
          language: "eng",
          objectID: "1:4.3.4",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.4",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "4",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.004",
          text: "God repents of nothing he has ever done, now does, or ever will do. He is all-wise as well as all-powerful. Man’s wisdom grows out of the trials and errors of human experience; God’s wisdom consists in the unqualified perfection of his infinite universe insight, and this divine foreknowledge effectively directs the creative free will.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.5",
          htmlText:
            "The Universal Father never does anything that causes subsequent sorrow or regret, but the will creatures of the planning and making of his Creator personalities in the outlying universes, by their unfortunate choosing, sometimes occasion emotions of divine sorrow in the personalities of their Creator parents. But though the Father neither makes mistakes, harbors regrets, nor experiences sorrows, he is a being with a father’s affection, and his heart is undoubtedly grieved when his children fail to attain the spiritual levels they are capable of reaching with the assistance which has been so freely provided by the spiritual-attainment plans and the mortal-ascension policies of the universes.",
          language: "eng",
          objectID: "1:4.3.5",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.5",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "5",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.005",
          text: "The Universal Father never does anything that causes subsequent sorrow or regret, but the will creatures of the planning and making of his Creator personalities in the outlying universes, by their unfortunate choosing, sometimes occasion emotions of divine sorrow in the personalities of their Creator parents. But though the Father neither makes mistakes, harbors regrets, nor experiences sorrows, he is a being with a father’s affection, and his heart is undoubtedly grieved when his children fail to attain the spiritual levels they are capable of reaching with the assistance which has been so freely provided by the spiritual-attainment plans and the mortal-ascension policies of the universes.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.6",
          htmlText:
            "The infinite goodness of the Father is beyond the comprehension of the finite mind of time; hence must there always be afforded a contrast with comparative evil (not sin) for the effective exhibition of all phases of relative goodness. Perfection of divine goodness can be discerned by mortal imperfection of insight only because it stands in contrastive association with relative imperfection in the relationships of time and matter in the motions of space.",
          language: "eng",
          objectID: "1:4.3.6",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.6",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "6",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.006",
          text: "The infinite goodness of the Father is beyond the comprehension of the finite mind of time; hence must there always be afforded a contrast with comparative evil (not sin) for the effective exhibition of all phases of relative goodness. Perfection of divine goodness can be discerned by mortal imperfection of insight only because it stands in contrastive association with relative imperfection in the relationships of time and matter in the motions of space.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.3.7",
          htmlText:
            "The character of God is infinitely superhuman; therefore must such a nature of divinity be personalized, as in the divine Sons, before it can even be faith-grasped by the finite mind of man.",
          language: "eng",
          objectID: "1:4.3.7",
          paperId: "4",
          paperSectionId: "4.3",
          paperSectionParagraphId: "4.3.7",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "7",
          partId: "1",
          sectionId: "3",
          sectionTitle: "God’s Unchanging Character",
          sortId: "1.004.003.007",
          text: "The character of God is infinitely superhuman; therefore must such a nature of divinity be personalized, as in the divine Sons, before it can even be faith-grasped by the finite mind of man.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.-",
          htmlText: null,
          language: "eng",
          objectID: "1:4.4.-",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: null,
          paperTitle: "God’s Relation to the Universe",
          paragraphId: null,
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.000",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "1:4.4.1",
          htmlText:
            "God is the only stationary, self-contained, and changeless being in the whole universe of universes, having no outside, no beyond, no past, and no future. God is purposive energy (creative spirit) and absolute will, and these are self-existent and universal.",
          language: "eng",
          objectID: "1:4.4.1",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.1",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "1",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.001",
          text: "God is the only stationary, self-contained, and changeless being in the whole universe of universes, having no outside, no beyond, no past, and no future. God is purposive energy (creative spirit) and absolute will, and these are self-existent and universal.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.2",
          htmlText:
            "Since God is self-existent, he is absolutely independent. The very identity of God is inimical to change. “I, the Lord, change not.” God is immutable; but not until you achieve Paradise status can you even begin to understand how God can pass from simplicity to complexity, from identity to variation, from quiescence to motion, from infinity to finitude, from the divine to the human, and from unity to duality and triunity. And God can thus modify the manifestations of his absoluteness because divine immutability does not imply immobility; God has will—he <em>is</em> will.",
          language: "eng",
          objectID: "1:4.4.2",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.2",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "2",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.002",
          text: "Since God is self-existent, he is absolutely independent. The very identity of God is inimical to change. “I, the Lord, change not.” God is immutable; but not until you achieve Paradise status can you even begin to understand how God can pass from simplicity to complexity, from identity to variation, from quiescence to motion, from infinity to finitude, from the divine to the human, and from unity to duality and triunity. And God can thus modify the manifestations of his absoluteness because divine immutability does not imply immobility; God has will—he is will.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.3",
          htmlText:
            "God is the being of absolute self-determination; there are no limits to his universe reactions save those which are self-imposed, and his freewill acts are conditioned only by those divine qualities and perfect attributes which inherently characterize his eternal nature. Therefore is God related to the universe as the being of final goodness plus a free will of creative infinity.",
          language: "eng",
          objectID: "1:4.4.3",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.3",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "3",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.003",
          text: "God is the being of absolute self-determination; there are no limits to his universe reactions save those which are self-imposed, and his freewill acts are conditioned only by those divine qualities and perfect attributes which inherently characterize his eternal nature. Therefore is God related to the universe as the being of final goodness plus a free will of creative infinity.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.4",
          htmlText:
            "The Father-Absolute is the creator of the central and perfect universe and the Father of all other Creators. Personality, goodness, and numerous other characteristics, God shares with man and other beings, but infinity of will is his alone. God is limited in his creative acts only by the sentiments of his eternal nature and by the dictates of his infinite wisdom. God personally chooses only that which is infinitely perfect, hence the supernal perfection of the central universe; and while the Creator Sons fully share his divinity, even phases of his absoluteness, they are not altogether limited by that finality of wisdom which directs the Father’s infinity of will. Hence, in the Michael order of sonship, creative free will becomes even more active, wholly divine and well-nigh ultimate, if not absolute. The Father is infinite and eternal, but to deny the possibility of his volitional self-limitation amounts to a denial of this very concept of his volitional absoluteness.",
          language: "eng",
          objectID: "1:4.4.4",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.4",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "4",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.004",
          text: "The Father-Absolute is the creator of the central and perfect universe and the Father of all other Creators. Personality, goodness, and numerous other characteristics, God shares with man and other beings, but infinity of will is his alone. God is limited in his creative acts only by the sentiments of his eternal nature and by the dictates of his infinite wisdom. God personally chooses only that which is infinitely perfect, hence the supernal perfection of the central universe; and while the Creator Sons fully share his divinity, even phases of his absoluteness, they are not altogether limited by that finality of wisdom which directs the Father’s infinity of will. Hence, in the Michael order of sonship, creative free will becomes even more active, wholly divine and well-nigh ultimate, if not absolute. The Father is infinite and eternal, but to deny the possibility of his volitional self-limitation amounts to a denial of this very concept of his volitional absoluteness.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.5",
          htmlText:
            "God’s absoluteness pervades all seven levels of universe reality. And the whole of this absolute nature is subject to the relationship of the Creator to his universe creature family. Precision may characterize trinitarian justice in the universe of universes, but in all his vast family relationship with the creatures of time the God of universes is governed by <em>divine sentiment.</em> First and last—eternally—the infinite God is a <em>Father.</em> Of all the possible titles by which he might appropriately be known, I have been instructed to portray the God of all creation as the Universal Father.",
          language: "eng",
          objectID: "1:4.4.5",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.5",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "5",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.005",
          text: "God’s absoluteness pervades all seven levels of universe reality. And the whole of this absolute nature is subject to the relationship of the Creator to his universe creature family. Precision may characterize trinitarian justice in the universe of universes, but in all his vast family relationship with the creatures of time the God of universes is governed by divine sentiment. First and last—eternally—the infinite God is a Father. Of all the possible titles by which he might appropriately be known, I have been instructed to portray the God of all creation as the Universal Father.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.6",
          htmlText:
            "In God the Father freewill performances are not ruled by power, nor are they guided by intellect alone; the divine personality is defined as consisting in spirit and manifesting himself to the universes as love. Therefore, in all his personal relations with the creature personalities of the universes, the First Source and Center is always and consistently a loving Father. God is a Father in the highest sense of the term. He is eternally motivated by the perfect idealism of divine love, and that tender nature finds its strongest expression and greatest satisfaction in loving and being loved.",
          language: "eng",
          objectID: "1:4.4.6",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.6",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "6",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.006",
          text: "In God the Father freewill performances are not ruled by power, nor are they guided by intellect alone; the divine personality is defined as consisting in spirit and manifesting himself to the universes as love. Therefore, in all his personal relations with the creature personalities of the universes, the First Source and Center is always and consistently a loving Father. God is a Father in the highest sense of the term. He is eternally motivated by the perfect idealism of divine love, and that tender nature finds its strongest expression and greatest satisfaction in loving and being loved.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.7",
          htmlText:
            "In science, God is the First Cause; in religion, the universal and loving Father; in philosophy, the one being who exists by himself, not dependent on any other being for existence but beneficently conferring reality of existence on all things and upon all other beings. But it requires revelation to show that the First Cause of science and the self-existent Unity of philosophy are the God of religion, full of mercy and goodness and pledged to effect the eternal survival of his children on earth.",
          language: "eng",
          objectID: "1:4.4.7",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.7",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "7",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.007",
          text: "In science, God is the First Cause; in religion, the universal and loving Father; in philosophy, the one being who exists by himself, not dependent on any other being for existence but beneficently conferring reality of existence on all things and upon all other beings. But it requires revelation to show that the First Cause of science and the self-existent Unity of philosophy are the God of religion, full of mercy and goodness and pledged to effect the eternal survival of his children on earth.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.8",
          htmlText:
            "We crave the concept of the Infinite, but we worship the experience-idea of God, our anywhere and any-time capacity to grasp the personality and divinity factors of our highest concept of Deity.",
          language: "eng",
          objectID: "1:4.4.8",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.8",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "8",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.008",
          text: "We crave the concept of the Infinite, but we worship the experience-idea of God, our anywhere and any-time capacity to grasp the personality and divinity factors of our highest concept of Deity.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "1:4.4.9",
          htmlText:
            "The consciousness of a victorious human life on earth is born of that creature faith which dares to challenge each recurring episode of existence when confronted with the awful spectacle of human limitations, by the unfailing declaration: Even if I cannot do this, there lives in me one who can and will do it, a part of the Father-Absolute of the universe of universes. And that is “the victory which overcomes the world, even your faith.”",
          language: "eng",
          objectID: "1:4.4.9",
          paperId: "4",
          paperSectionId: "4.4",
          paperSectionParagraphId: "4.4.9",
          paperTitle: "God’s Relation to the Universe",
          paragraphId: "9",
          partId: "1",
          sectionId: "4",
          sectionTitle: "The Realization of God",
          sortId: "1.004.004.009",
          text: "The consciousness of a victorious human life on earth is born of that creature faith which dares to challenge each recurring episode of existence when confronted with the awful spectacle of human limitations, by the unfailing declaration: Even if I cannot do this, there lives in me one who can and will do it, a part of the Father-Absolute of the universe of universes. And that is “the victory which overcomes the world, even your faith.”",
          type: "paragraph",
          typeRank: 3,
        },
      ],
    },
  };

  return {
    props: {
      paperData,
    },
  };
}

export default PaperPage;
