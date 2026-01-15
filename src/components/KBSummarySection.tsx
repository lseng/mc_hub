import { motion } from 'motion/react';
import { FileText } from 'lucide-react';
import { KBResponse } from '../types/knowledge-base';

interface KBSummarySectionProps {
  summary: KBResponse;
}

export function KBSummarySection({ summary }: KBSummarySectionProps) {

  return (
    <div className="border-b border-gray-200 flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-2 p-4 pb-3 flex-shrink-0">
        <FileText size={18} className="text-[#406780]" />
        <h3 className="font-medium text-gray-900 not-prose">Document Summary</h3>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 px-4 pb-4 overflow-y-auto flex-1 prose prose-sm max-w-none"
      >
        {/* Main Summary */}
        {(summary.summary || summary.answer) && (
          <div>
            <p className="text-gray-700 leading-relaxed mb-0">
              {summary.summary || summary.answer}
            </p>
          </div>
        )}

        {/* Key Points */}
        {summary.key_points && summary.key_points.length > 0 && (
          <div className="not-prose">
            <h4 className="font-medium text-gray-800 text-sm mb-2">Key Points</h4>
            <ul className="list-disc ml-5 space-y-1">
              {summary.key_points.map((point, index) => (
                <li key={index} className="text-gray-700 text-sm leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        {summary.sections && summary.sections.length > 0 && (
          <div className="not-prose">
            <h4 className="font-medium text-gray-800 text-sm mb-2">Key Sections</h4>
            <ul className="ml-5 space-y-1">
              {summary.sections.map((section, index) => (
                <li key={index} className="text-gray-700 text-sm leading-relaxed">
                  <strong>{section.title}</strong>
                  {section.hint && <span className="text-gray-600"> — {section.hint}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        

      </motion.div>
    </div>
  );
}