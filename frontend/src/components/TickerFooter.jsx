export function TickerFooter({ signals }) {
  const rawSignals = (signals || []).slice(0, 15);
  
  // If empty, standard static messages
  const defaultMessages = [
    { source: "SYSTEM", title: "Awaiting next ingestion wave..." },
    { source: "STATUS", title: "Surveillance nodes fully operational" }
  ];

  const feedItems = rawSignals.length > 0 
    ? rawSignals.map(s => ({ 
        source: (s.source || "NEWS").toUpperCase().replace('HTTPS://', '').split('/')[0],
        title: s.title 
      }))
    : defaultMessages;

  // Create a distinct React node for an item
  const renderItems = (list) => list.map((item, i) => (
    <span key={i} className="ticker-item">
      <span className="ticker-source-pill">{item.source}</span>
      <span className="ticker-headline-txt">{item.title}</span>
      <span className="ticker-bullet">&bull;</span>
    </span>
  ));

  return (
    <footer className="ticker-footer">
      <div className="ticker-wrap">
        <div className="ticker-content">
          {renderItems(feedItems)}
          {/* Duplicate set to enable seamless, gapless infinite horizontal loop */}
          {renderItems(feedItems)}
        </div>
      </div>
    </footer>
  );
}
