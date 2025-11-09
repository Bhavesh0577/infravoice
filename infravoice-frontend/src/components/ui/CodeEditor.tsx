'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

interface CodeFile {
  name: string;
  content: string;
  language: string;
}

interface CodeEditorProps {
  files: CodeFile[];
  onFileChange?: (fileName: string, content: string) => void;
  readonly?: boolean;
  className?: string;
}

export default function CodeEditor({ files, onFileChange, readonly = false, className }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.name || '');

  const currentFile = files.find((f) => f.name === activeFile);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readonly || !onFileChange) return;
    onFileChange(activeFile, e.target.value);
  };

  const tabs = files.map((file) => ({
    id: file.name,
    label: file.name,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  }));

  return (
    <div className={clsx('bg-white rounded-xl border-2 border-gray-200 overflow-hidden', className)}>
      <Tabs value={activeFile} onValueChange={setActiveFile} className="w-full">
        {/* File tabs */}
        {files.length > 1 && (
          <div className="border-b border-gray-200 bg-gray-50 px-4">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0">
              {files.map((file) => (
                <TabsTrigger
                  key={file.name}
                  value={file.name}
                  className="flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent rounded-none pb-2 px-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  {file.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

      {/* Editor header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-sm ml-4 font-mono">{currentFile?.name}</span>
        </div>
        {!readonly && (
          <div className="text-xs text-gray-400">Editable</div>
        )}
      </div>

      {/* Code content */}
      <div className="relative bg-gray-900">
        <textarea
          value={currentFile?.content || ''}
          onChange={handleContentChange}
          readOnly={readonly}
          className={clsx(
            'w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm',
            'resize-none focus:outline-none overflow-auto',
            readonly ? 'cursor-default' : 'focus:ring-2 focus:ring-teal-500 focus:ring-inset'
          )}
          spellCheck={false}
        />

        {/* Line numbers */}
        <div className="absolute top-0 left-0 p-4 pr-2 text-gray-500 font-mono text-sm select-none pointer-events-none">
          {currentFile?.content.split('\n').map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with file info */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="uppercase">{currentFile?.language || 'terraform'}</span>
          <span>{currentFile?.content.split('\n').length || 0} lines</span>
          <span>{currentFile?.content.length || 0} characters</span>
        </div>
        {!readonly && (
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Modified
          </span>
        )}
      </div>
      </Tabs>
    </div>
  );
}
