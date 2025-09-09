"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { OnboardingUploadButton } from "@/components/onboarding-upload-button"
import { 
  CheckCircle, 
  Upload, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { SidebarInset } from "@/components/ui/sidebar"

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to Transactions App",
    description: "Let's get you started by uploading your transaction data"
  },
  {
    id: 2,
    title: "Prepare Your Data", 
    description: "Learn about the supported file format and how to export from your bank"
  },
  {
    id: 3,
    title: "Upload Transactions",
    description: "Upload your JSON transaction files to get started"
  },
  {
    id: 4,
    title: "Complete Setup",
    description: "Review your upload and start exploring your financial data"
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const router = useRouter()

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      handleStepComplete(currentStep)
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    handleStepComplete(currentStep)
    toast.success("Onboarding completed!", {
      description: "Welcome to your financial dashboard"
    })
    router.push("/")
  }

  const progressPercentage = (completedSteps.length / ONBOARDING_STEPS.length) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />
      case 2:
        return <DataPreparationStep onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return (
          <UploadStep 
            onNext={handleNext} 
            onPrevious={handlePrevious}
            _onFilesUploaded={setUploadedFiles}
            uploadedFiles={uploadedFiles}
          />
        )
      case 4:
        return (
          <CompletionStep 
            onFinish={handleFinish} 
            onPrevious={handlePrevious}
            uploadedFiles={uploadedFiles}
          />
        )
      default:
        return null
    }
  }

  return (
    <SidebarInset>
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Get Started with Transactions App
          </h1>
          <p className="text-muted-foreground mb-6">
            Let&apos;s set up your financial dashboard in just a few steps
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.length} of {ONBOARDING_STEPS.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-4 mb-8">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${completedSteps.includes(step.id) 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : currentStep === step.id 
                      ? 'border-primary text-primary' 
                      : 'border-muted text-muted-foreground'
                  }
                `}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {step.id < ONBOARDING_STEPS.length && (
                  <div className={`w-12 h-px ml-2 ${
                    completedSteps.includes(step.id) ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">Step {currentStep}:</span>
              {ONBOARDING_STEPS[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription>
              {ONBOARDING_STEPS[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
    </SidebarInset>
  )
}

// Individual Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <Sparkles className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Welcome to Your Financial Dashboard</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          This app helps you track expenses, manage budgets, and gain insights into your spending patterns. 
          To get started, you&apos;ll need to upload your transaction data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 border-primary/20">
          <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Upload Data</h3>
          <p className="text-sm text-muted-foreground">Import your bank transactions</p>
        </Card>
        <Card className="p-4 border-primary/20">
          <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Track Expenses</h3>
          <p className="text-sm text-muted-foreground">Categorize and monitor spending</p>
        </Card>
        <Card className="p-4 border-primary/20">
          <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Set Budgets</h3>
          <p className="text-sm text-muted-foreground">Create and manage budgets</p>
        </Card>
      </div>

      <Button onClick={onNext} size="lg" className="min-w-32">
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}

function DataPreparationStep({ onNext, onPrevious }: { onNext: () => void, onPrevious: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-primary mb-1">Supported File Format</h3>
          <p className="text-sm text-muted-foreground">
            This app accepts transaction data in JSON format. The JSON should contain a &apos;transactionList&apos; array with your bank transactions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Expected JSON Structure:</h3>
        <Card className="p-4 bg-muted/30">
          <pre className="text-sm overflow-x-auto">
                {`{
                "transactionList": [
                    {
                    "originalDate": "2024-01-15",
                    "transactionText": "Grocery Store",
                    "transactionAmount": {
                        "amount": {
                        "decimalValue": -45.67
                        },
                        "currencyCode": "USD"
                    },
                    "cardDetails": {
                        "merchant": {
                        "name": "Local Grocery",
                        "categoryCode": "5411"
                        }
                    }
                    }
                ]
                }`}
          </pre>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">How to Export from Your Bank:</h3>
        <div className="grid gap-3">
          <Card className="p-4">
            <h4 className="font-medium mb-2">Step 1: Log into your online banking</h4>
            <p className="text-sm text-muted-foreground">Access your bank&apos;s website or mobile app</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">Step 2: Navigate to transaction history</h4>
            <p className="text-sm text-muted-foreground">Find the section for account statements or transaction downloads</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">Step 3: Export as JSON</h4>
            <p className="text-sm text-muted-foreground">Look for JSON export option, or convert from CSV if necessary</p>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function UploadStep({ 
  onNext, 
  onPrevious, 
  _onFilesUploaded, 
  uploadedFiles 
}: { 
  onNext: () => void
  onPrevious: () => void
  _onFilesUploaded: (files: string[]) => void
  uploadedFiles: string[]
}) {
  const handleUploadSuccess = (fileName: string) => {
    _onFilesUploaded([...uploadedFiles, fileName])
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="w-12 h-12 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Upload Your Transaction Files</h3>
        <p className="text-muted-foreground mb-6">
          Select one or more JSON files containing your transaction data. 
          You can upload multiple files if you have data from different time periods.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="p-8 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 w-full max-w-md">
          <div className="text-center">
            <OnboardingUploadButton 
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Uploaded Files
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm">{file}</span>
                <Badge variant="secondary" className="ml-auto">Uploaded</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onNext}>
            Skip for Now
          </Button>
          <Button 
            onClick={onNext}
            disabled={uploadedFiles.length === 0}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function CompletionStep({ 
  onFinish, 
  onPrevious, 
  uploadedFiles 
}: { 
  onFinish: () => void
  onPrevious: () => void
  uploadedFiles: string[]
}) {
  return (
    <div className="text-center py-8 space-y-6">
      <div>
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-4">
          {uploadedFiles.length > 0 ? "Setup Complete!" : "Welcome to Your Dashboard!"}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {uploadedFiles.length > 0 
            ? "Congratulations! You&apos;ve successfully uploaded your transaction data. Your financial dashboard is now ready to use."
            : "You can always upload your transaction data later. For now, explore the features and get familiar with the dashboard."
          }
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            Successfully Processed
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded and processed
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">What&apos;s Next?</h3>
        <div className="grid gap-3 max-w-md mx-auto">
          <Card className="p-3 text-left">
            <h4 className="font-medium text-sm">✨ Explore your dashboard</h4>
            <p className="text-xs text-muted-foreground">View spending patterns and trends</p>
          </Card>
          <Card className="p-3 text-left">
            <h4 className="font-medium text-sm">🏷️ Categorize transactions</h4>
            <p className="text-xs text-muted-foreground">Organize expenses by category</p>
          </Card>
          <Card className="p-3 text-left">
            <h4 className="font-medium text-sm">💰 Set up budgets</h4>
            <p className="text-xs text-muted-foreground">Create monthly spending limits</p>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        {uploadedFiles.length > 0 ? (
          <Button onClick={onFinish} size="lg">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={onFinish} size="lg" variant="outline">
            Skip for Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
