import React from 'react';

/**
 * Rich text renderer component for AI responses
 * Parses markdown-like syntax and renders visual components
 */
function RichTextRenderer({ content, isStreaming = false }) {
  if (!content) return null;

  /**
   * Parse content and extract different sections
   */
  const parseContent = (text) => {
    const sections = [];
    let currentIndex = 0;
    
    // Regular expressions for different content types
    const patterns = [
      { 
        regex: /^#{1,6}\s+(.+)$/gm, 
        type: 'heading',
        render: (match, level, text) => ({ type: 'heading', level: level.length, text, match })
      },
      { 
        regex: /^\*\*(.+?)\*\*$/gm, 
        type: 'bold',
        render: (match, text) => ({ type: 'bold', text, match })
      },
      { 
        regex: /^\*(.+?)\*$/gm, 
        type: 'italic',
        render: (match, text) => ({ type: 'italic', text, match })
      },
      { 
        regex: /^```(\w+)?\n([\s\S]*?)```$/gm, 
        type: 'code_block',
        render: (match, language, code) => ({ type: 'code_block', language, code, match })
      },
      { 
        regex: /^`(.+?)`$/gm, 
        type: 'inline_code',
        render: (match, code) => ({ type: 'inline_code', code, match })
      },
      { 
        regex: /^-\s+(.+)$/gm, 
        type: 'list_item',
        render: (match, text) => ({ type: 'list_item', text, match })
      },
      { 
        regex: /^(\d+)\.\s+(.+)$/gm, 
        type: 'numbered_item',
        render: (match, number, text) => ({ type: 'numbered_item', number, text, match })
      },
      { 
        regex: /^> (.+)$/gm, 
        type: 'quote',
        render: (match, text) => ({ type: 'quote', text, match })
      },
      { 
        regex: /^!\[(.+?)\]\((.+?)\)$/gm, 
        type: 'image',
        render: (match, alt, src) => ({ type: 'image', alt, src, match })
      },
      { 
        regex: /^\[(.+?)\]\((.+?)\)$/gm, 
        type: 'link',
        render: (match, text, href) => ({ type: 'link', text, href, match })
      }
    ];

    // Find all matches
    const matches = [];
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        matches.push({
          ...pattern.render(...match),
          start: match.index,
          end: match.index + match[0].length
        });
      }
    });

    // Sort by position and build sections
    matches.sort((a, b) => a.start - b.start);
    
    let lastEnd = 0;
    matches.forEach(match => {
      // Add text before this match
      if (match.start > lastEnd) {
        const beforeText = text.slice(lastEnd, match.start);
        if (beforeText.trim()) {
          sections.push({ type: 'text', content: beforeText });
        }
      }
      
      // Add the match
      sections.push(match);
      lastEnd = match.end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      const remainingText = text.slice(lastEnd);
      if (remainingText.trim()) {
        sections.push({ type: 'text', content: remainingText });
      }
    }

    return sections;
  };

  /**
   * Render a single section
   */
  const renderSection = (section, index) => {
    switch (section.type) {
      case 'heading':
        const HeadingTag = `h${Math.min(section.level, 6)}`;
        return (
          <HeadingTag 
            key={index}
            className={`font-bold text-gray-900 dark:text-white mt-4 mb-2 ${
              section.level === 1 ? 'text-xl' :
              section.level === 2 ? 'text-lg' :
              section.level === 3 ? 'text-base' : 'text-sm'
            }`}
          >
            {section.text}
          </HeadingTag>
        );

      case 'bold':
        return (
          <div key={index} className="font-bold text-gray-900 dark:text-white my-1">
            {section.text}
          </div>
        );

      case 'italic':
        return (
          <div key={index} className="italic text-gray-700 dark:text-gray-300 my-1">
            {section.text}
          </div>
        );

      case 'code_block':
        return (
          <div key={index} className="my-3">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">
                  {section.language || 'Code'}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(section.code)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{section.code}</pre>
            </div>
          </div>
        );

      case 'inline_code':
        return (
          <code 
            key={index}
            className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono"
          >
            {section.code}
          </code>
        );

      case 'list_item':
        return (
          <div key={index} className="flex items-start my-1">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 dark:text-gray-300">{section.text}</span>
          </div>
        );

      case 'numbered_item':
        return (
          <div key={index} className="flex items-start my-1">
            <span className="text-blue-500 mr-2 mt-1 font-semibold">{section.number}.</span>
            <span className="text-gray-700 dark:text-gray-300">{section.text}</span>
          </div>
        );

      case 'quote':
        return (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
            <p className="text-gray-700 dark:text-gray-300 italic">"{section.text}"</p>
          </div>
        );

      case 'image':
        return (
          <div key={index} className="my-3">
            <img 
              src={section.src} 
              alt={section.alt}
              className="max-w-full h-auto rounded-lg shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        );

      case 'link':
        return (
          <a 
            key={index}
            href={section.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
          >
            {section.text}
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );

      case 'text':
        return (
          <div key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {section.content.split('\n').map((line, lineIndex) => (
              line.trim() ? (
                <p key={lineIndex} className="mb-2">{line}</p>
              ) : (
                <br key={lineIndex} />
              )
            ))}
          </div>
        );

      default:
        return (
          <div key={index} className="text-gray-700 dark:text-gray-300">
            {section.content || section.text}
          </div>
        );
    }
  };

  // Parse content into sections
  const sections = parseContent(content);

  return (
    <div className="rich-content">
      {sections.map((section, index) => renderSection(section, index))}
      
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="inline-flex items-center ml-2">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextRenderer;
