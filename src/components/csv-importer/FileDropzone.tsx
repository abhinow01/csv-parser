"use client"
import { useCallback, useRef, useState } from "react";

interface Props {
    onFileSelected: (file : File)=>void;
    error?: string | null   
}

export function FileDropZone({onFileSelected , error} : Props){
    const [isDragging , setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File | undefined )=>{
        if(!file) return 
        if(!file.name.toLocaleLowerCase().endsWith(".csv")){
            onFileSelected(file)
            return 
        }
        onFileSelected(file);
    }, 
[onFileSelected]
);
return (
    <div className="w-full max-w-2xl mx-auto">
        <div
        onDragOver={(e)=>{
            e.preventDefault()
            setIsDragging(true)
        }}
        onDragLeave={(e)=>{
            setIsDragging(false)
        }}
        onDrop={(e)=>{
            e.preventDefault()
            setIsDragging(false)
            handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={()=>inputRef.current?.click()}
        className={
            `flex flex-col tems-center justify-center gap-3
            roundex-2xl border-2 border-dashed p-12 cursor-pointer
            transition-colors duration-150
            ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"}`
        }
        >
            <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Drag & drop your CSV here, or click to browse
        </p>
        <p className="text-xs text-gray-400">Only .csv files are supported</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        </div>
        {error && (
        <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
)
} 