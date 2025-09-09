"use client"

import { toast } from "sonner"
import { Button } from "./ui/button"
import type { TransactionJSON } from "@/app/api/transactions/route"
import useSWRMutation from "swr/mutation"
import { useRef } from "react"
import { Upload, Loader2 } from "lucide-react"

interface OnboardingUploadButtonProps {
  onUploadSuccess?: (fileName: string) => void
  onUploadStart?: () => void
  onUploadComplete?: () => void
}

interface ResponseBodyPost {
  message: 'Transactions processed successfully',
  totalTransactions: number,
  newTransactions: number,
  skippedTransactions: number,
}

const uploadTransactions = async (url: string, { arg }: { arg: File }) => {
  const formData = new FormData()
  formData.append("transactions", arg)

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    throw new Error("Failed to upload transactions")
  }

  return res
}

export const OnboardingUploadButton = ({ 
  onUploadSuccess, 
  onUploadStart, 
  onUploadComplete 
}: OnboardingUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    onUploadStart?.()
    let successCount = 0

    // Process each file
    for (const file of Array.from(files)) {
      if (!file) continue
      
      if (file.type !== "application/json") {
        toast.error("Invalid file type", {
          description: `File "${file.name}" is not a JSON file. Please select JSON files only.`,
        })
        continue
      }

      try {
        // Validate JSON structure before uploading
        const fileContent = await file.text()
        const json = JSON.parse(fileContent) as TransactionJSON
        
        if (!json.transactionList || !Array.isArray(json.transactionList)) {
          toast.error("Invalid JSON structure", {
            description: `File "${file.name}" does not contain a valid transactionList array.`,
          })
          continue
        }

        const res = await trigger(file)
        if (res.ok) {
          const body = await res.json() as ResponseBodyPost
          toast.success(`Successfully uploaded: ${file.name}`, {
            description: `Processed ${body.totalTransactions} transactions: ${body.newTransactions} new, ${body.skippedTransactions} skipped`
          })
          onUploadSuccess?.(file.name)
          successCount++
        }
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        toast.error("Upload failed", {
          description: `File "${file.name}": ${error instanceof Error ? error.message : "Failed to process the file."}`
        })
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    onUploadComplete?.()

    if (successCount > 0) {
      toast.success("Upload completed!", {
        description: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`
      })
    }
  }

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* File Upload Button */}
      <Button
        size="lg"
        onClick={triggerFileUpload}
        disabled={isMutating}
        className="flex items-center gap-2 min-w-48"
      >
        {isMutating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Files...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Choose JSON Files
          </>
        )}
      </Button>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Select one or more JSON files containing your transaction data. 
        Each file should have a &apos;transactionList&apos; array.
      </p>
    </div>
  )
}
