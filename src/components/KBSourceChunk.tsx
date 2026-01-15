import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { KBChunk } from '../types/knowledge-base';

interface KBSourceChunkProps {
  chunk: KBChunk;
  index: number;
}

export function KBSourceChunk({ chunk, index }: KBSourceChunkProps) {
  return (
    <motion.div
      key={chunk.id || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs"
    >
      <div className="flex items-start gap-2">
        <Quote size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-gray-700 line-clamp-3 leading-relaxed">
            {chunk.content}
          </p>
          {chunk.metadata && (
            <div className="mt-2 flex gap-2 text-gray-500">
              {chunk.metadata.page_number && (
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  Page {chunk.metadata.page_number}
                </span>
              )}
              {chunk.metadata.section && (
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {chunk.metadata.section}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}