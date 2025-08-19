"use client"

import { toast } from "sonner"
import { Button } from "./ui/button"
import type { TransactionJSON } from "@/app/api/transactions/route"
import useSWRMutation from "swr/mutation"
import type { TransactionRange } from "@/app/api/transactions/general/route"
import { useRef } from "react"

interface UploadButtonProps {
  dataRange?: TransactionRange
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

export const UploadButton = ({ dataRange }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Process each file
    for (const file of Array.from(files)) {
      if (!file) continue
      
      if (file.type !== "application/json") {
        toast("Invalid file type", {
          description: `File "${file.name}" is not a JSON file. Skipping.`,
        })
        continue
      }

      try {
        const fileContent = await file.text()
        const json = JSON.parse(fileContent) as TransactionJSON
        // Access first and last entry directly from the array
        // Use a property that exists on TransactionJSON, e.g., 'date'
        const firstEntryDate = new Date(json.transactionList[0]?.originalDate ?? "")
        const lastEntryDate = new Date(json.transactionList[json.transactionList.length - 1]?.originalDate ?? "")

        const dbFirstDate = new Date(dataRange?.firstInRange ?? "")
        const dbLastDate = new Date(dataRange?.lastInRange ?? "")
        if (dbFirstDate < firstEntryDate || dbLastDate > lastEntryDate) {
          toast("Date range mismatch", {
            description: `File "${file.name}": The uploaded transactions are from ${firstEntryDate.toLocaleDateString("da-DK", { dateStyle: "long" })} to ${lastEntryDate.toLocaleDateString("da-DK", { dateStyle: "long" })}, but your dashboard data is from ${dbFirstDate.toLocaleDateString("da-DK", { dateStyle: "long" })} to ${dbLastDate.toLocaleDateString("da-DK", { dateStyle: "long" })}. Skipping this file.`,
          })
          continue
        }

        const res = await trigger(file)
        if (res.ok) {
          const body = await res.json() as ResponseBodyPost
          toast.success(`${file.name}: ${body.message}`, {
            description: `Processed ${body.totalTransactions} transactions: ${body.newTransactions} new, ${body.skippedTransactions} skipped`
          })
        }
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        toast("Upload failed", {
          description: `File "${file.name}": ${error instanceof Error ? error.message : "Failed to parse the JSON file."}`
        })
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }


  return (
    <div className="flex items-center gap-2">
      {/* File Upload Button */}
      <Button
        variant="outline"
        onClick={triggerFileUpload}
        disabled={isMutating}
        className="flex items-center gap-2"
      >
        {isMutating ? (
          <>
            {/* You may need to import Loader2 from lucide-react or your icon library */}
            {/* <Loader2 className="h-4 w-4 animate-spin" /> */}
            Uploading...
          </>
        ) : (
          <>
            {/* You may need to import Upload from lucide-react or your icon library */}
            {/* <Upload className="h-4 w-4" /> */}
            Upload JSON
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
    </div>
  );
}

