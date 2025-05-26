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

export const UploadButton = ({dataRange}: UploadButtonProps) => {
      const fileInputRef = useRef<HTMLInputElement>(null)
    const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      toast("Invalid file type", {
        description: "Please upload a JSON file.",
      })
      return
    }

    try {
      const  fileContent = await file.text()
      const json = JSON.parse(fileContent) as TransactionJSON
      // Access first and last entry directly from the array
      // Use a property that exists on TransactionJSON, e.g., 'date'
      const firstEntryDate = new Date(json.transactionList[0]?.originalDate ?? "")
      const lastEntryDate = new Date(json.transactionList[json.transactionList.length - 1]?.originalDate ?? "")

      const dbFirstDate = new Date(dataRange?.firstInRange ?? "")
      const dbLastDate = new Date(dataRange?.lastInRange ?? "")
      console.log('dataRange?.firstInRange: ', dataRange?.firstInRange);
      if (dbFirstDate < firstEntryDate || dbLastDate > lastEntryDate) {
        toast("Date range mismatch", {
          description: `The uploaded transactions are from ${firstEntryDate.toLocaleDateString("da-DK", {dateStyle: "long"})} to ${lastEntryDate.toLocaleDateString("da-DK", {dateStyle: "long"})}, but your dashboard data is from ${dbFirstDate.toLocaleDateString("da-DK", {dateStyle: "long"})} to ${dbLastDate.toLocaleDateString("da-DK", {dateStyle: "long"})}. Please adjust the date range or upload transactions within the existing range.`,
        })
        return
      }
      
      const res = await trigger(file)

      // Show success message
      toast("Transactions uploaded successfully!", {
          // description: `Added ${validTransactions.length} transactions to your dashboard.${invalidTransactions.length > 0 ? ` ${invalidTransactions.length} invalid transactions were skipped.` : ""}`,
          // action: {
          //   label: "Undo",
          //   onClick: () => console.log("Undo"),
          // },
        })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error parsing JSON:", error)
      toast("Upload failed", {
        description: error instanceof Error ? error.message : "Failed to parse the JSON file.",
      })
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
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

