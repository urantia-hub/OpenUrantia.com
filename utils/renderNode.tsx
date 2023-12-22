const renderNode = (node: UBNode) => {
  switch (node.type) {
    case "paper": {
      return (
        <div key={node.globalId} className="mb-12 text-center">
          <p className="text-xl mb-2">Paper {node.paperId}</p>
          <h1 className="text-4xl font-bold mb-12" id={node.globalId}>
            {node.paperTitle}
          </h1>
        </div>
      );
    }
    case "section": {
      if (!node.sectionTitle) return null;
      return (
        <div key={node.globalId} className="mt-20 mb-12 text-center">
          <h2 className="text-3xl font-bold" id={node.globalId}>
            {node.sectionTitle}
          </h2>
        </div>
      );
    }
    case "paragraph": {
      return (
        <div key={node.globalId} className="mb-6 text-left" id={node.globalId}>
          <div className="text-lg leading-relaxed">
            <div className="flex items-center justify-between block mb-2 text-gray-400 text-sm">
              <span>{node.globalId}</span>
            </div>
            <p dangerouslySetInnerHTML={{ __html: node.htmlText as string }} />
          </div>
        </div>
      );
    }
    default: {
      return null;
    }
  }
};
