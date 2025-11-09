'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import VoiceRecorder from '@/components/ui/VoiceRecorder';
import CodeEditor from '@/components/ui/CodeEditor';
import SecurityReport from '@/components/ui/SecurityReport';
import CostEstimate from '@/components/ui/CostEstimate';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import voiceService from '@/services/voiceService';
import codeService, { CodeGenerationResponse } from '@/services/codeService';
import securityService, { SecurityScanResponse } from '@/services/securityService';
import costService, { CostEstimateResponse } from '@/services/costService';
import deploymentService from '@/services/deploymentService';

type DeploymentStep =
  | 'input'
  | 'transcribing'
  | 'generating'
  | 'reviewing'
  | 'scanning'
  | 'estimating'
  | 'ready'
  | 'deploying'
  | 'success';

export default function DeployPage() {
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<DeploymentStep>('input');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  // Input data
  const [textInput, setTextInput] = useState('');
  const [transcript, setTranscript] = useState('');
  const [cloudProvider, setCloudProvider] = useState<'aws' | 'gcp' | 'azure'>('aws');
  const [region, setRegion] = useState('us-east-1');

  // Generated code
  const [generatedCode, setGeneratedCode] = useState<CodeGenerationResponse | null>(null);
  const [codeFiles, setCodeFiles] = useState<any[]>([]);

  // Analysis results
  const [securityScan, setSecurityScan] = useState<SecurityScanResponse | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimateResponse | null>(null);

  // UI state
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1: Handle voice recording complete
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setCurrentStep('transcribing');
    setError('');

    try {
      const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const result = await voiceService.transcribe(file);
      setTranscript(result.transcript);
      setCurrentStep('input');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to transcribe audio');
      setCurrentStep('input');
    }
  };

  // Step 2: Generate Terraform code
  const handleGenerateCode = async () => {
    const description = inputMode === 'voice' ? transcript : textInput;

    if (!description.trim()) {
      setError('Please provide a description of your infrastructure');
      return;
    }

    setCurrentStep('generating');
    setError('');

    try {
      const result = await codeService.generate({
        description,
        cloud_provider: cloudProvider,
        region,
      });

      setGeneratedCode(result);

      // Create code files for the editor
      const files = [
        { name: 'main.tf', content: result.main_tf, language: 'terraform' },
        { name: 'variables.tf', content: result.variables_tf, language: 'terraform' },
        { name: 'outputs.tf', content: result.outputs_tf, language: 'terraform' },
      ];

      setCodeFiles(files);
      setCurrentStep('reviewing');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate code');
      setCurrentStep('input');
    }
  };

  // Step 3: Handle code editing
  const handleCodeChange = (fileName: string, content: string) => {
    setCodeFiles((files) =>
      files.map((file) => (file.name === fileName ? { ...file, content } : file))
    );
  };

  // Step 4: Run security scan
  const handleSecurityScan = async () => {
    setCurrentStep('scanning');
    setError('');

    try {
      const mainFile = codeFiles.find((f) => f.name === 'main.tf');
      const result = await securityService.scan(mainFile?.content || '', generatedCode?.deployment_id);
      setSecurityScan(result);
      setCurrentStep('estimating');

      // Automatically run cost estimate
      handleCostEstimate();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run security scan');
      setCurrentStep('reviewing');
    }
  };

  // Step 5: Get cost estimate
  const handleCostEstimate = async () => {
    try {
      const mainFile = codeFiles.find((f) => f.name === 'main.tf');
      const result = await costService.estimate(mainFile?.content || '', generatedCode?.deployment_id);
      setCostEstimate(result);
      setCurrentStep('ready');
    } catch (err: any) {
      console.error('Cost estimate failed:', err);
      // Don't block deployment if cost estimate fails
      setCurrentStep('ready');
    }
  };

  // Step 6: Deploy infrastructure
  const handleDeploy = async () => {
    if (!generatedCode?.deployment_id) return;

    setCurrentStep('deploying');
    setError('');

    try {
      await deploymentService.deploy(generatedCode.deployment_id);
      setCurrentStep('success');

      // Redirect to deployment details after 3 seconds
      setTimeout(() => {
        router.push(`/deployments/${generatedCode.deployment_id}`);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to deploy infrastructure');
      setCurrentStep('ready');
    }
  };

  // Reset to start over
  const handleStartOver = () => {
    setCurrentStep('input');
    setTextInput('');
    setTranscript('');
    setGeneratedCode(null);
    setCodeFiles([]);
    setSecurityScan(null);
    setCostEstimate(null);
    setError('');
  };

  // Progress steps for UI
  const steps = [
    { id: 'input', label: 'Input', icon: '🎤' },
    { id: 'generating', label: 'Generate', icon: '⚙️' },
    { id: 'reviewing', label: 'Review', icon: '👀' },
    { id: 'scanning', label: 'Security', icon: '🔒' },
    { id: 'estimating', label: 'Cost', icon: '💰' },
    { id: 'ready', label: 'Deploy', icon: '🚀' },
  ];

  const currentStepIndex = steps.findIndex(
    (s) => s.id === currentStep || (currentStep === 'transcribing' && s.id === 'input')
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New Deployment</h1>
        <p className="text-lg text-gray-600">
          Describe your infrastructure needs using voice or text
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    index <= currentStepIndex
                      ? 'bg-teal-600 text-white scale-110'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div
                  className={`text-sm mt-2 font-medium ${
                    index <= currentStepIndex ? 'text-teal-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-16 mx-2 transition-all ${
                    index < currentStepIndex ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step: Input (Voice or Text) */}
      {currentStep === 'input' && (
        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-1 inline-flex">
              <button
                onClick={() => setInputMode('voice')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  inputMode === 'voice'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎤 Voice Input
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⌨️ Text Input
              </button>
            </div>
          </div>

          {/* Voice input */}
          {inputMode === 'voice' && (
            <div>
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
              {transcript && (
                <div className="mt-6 bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Transcription</h3>
                    <Badge variant="default">Ready</Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* Text input */}
          {inputMode === 'text' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Describe Your Infrastructure</h3>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Example: Create an AWS EC2 instance with t3.medium size, running Ubuntu 22.04, with SSH access and a security group allowing port 80 and 443..."
                className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 transition-colors resize-none"
              />
            </div>
          )}

          {/* Cloud provider & region selection */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Deployment Configuration</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cloud-provider" className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud Provider
                </label>
                <select
                  id="cloud-provider"
                  name="cloud-provider"
                  value={cloudProvider}
                  onChange={(e) => setCloudProvider(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 transition-colors"
                >
                  <option value="aws">Amazon Web Services (AWS)</option>
                  <option value="gcp">Google Cloud Platform (GCP)</option>
                  <option value="azure">Microsoft Azure</option>
                </select>
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <Input
                  id="region"
                  name="region"
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., us-east-1"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Generate button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateCode}
              variant="default"
              size="lg"
              disabled={(!transcript && !textInput.trim()) || isProcessing}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Terraform Code
            </Button>
          </div>
        </div>
      )}

      {/* Step: Transcribing */}
      {currentStep === 'transcribing' && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transcribing Audio...</h3>
          <p className="text-gray-600">Converting your voice to text using AI</p>
        </div>
      )}

      {/* Step: Generating */}
      {currentStep === 'generating' && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Generating Terraform Code...</h3>
          <p className="text-gray-600">Our AI is creating production-ready infrastructure code</p>
        </div>
      )}

      {/* Step: Reviewing Code */}
      {currentStep === 'reviewing' && generatedCode && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Review Generated Code</h3>
                <p className="text-sm text-gray-500 mt-1">{generatedCode.message}</p>
              </div>
              <Badge variant="default">Code Generated</Badge>
            </div>

            {/* Resources */}
            {generatedCode.resources && generatedCode.resources.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Resources to be created:</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedCode.resources.map((resource, idx) => (
                    <Badge key={idx} variant="secondary">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <CodeEditor files={codeFiles} onFileChange={handleCodeChange} />

          {/* Actions */}
          <div className="flex justify-between">
            <Button onClick={handleStartOver} variant="outline">
              Start Over
            </Button>
            <div className="flex gap-4">
              <Button onClick={handleSecurityScan} variant="default" size="lg">
                Continue to Security Scan
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Scanning */}
      {currentStep === 'scanning' && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Running Security Scan...</h3>
          <p className="text-gray-600">Checking for security vulnerabilities with Checkov</p>
        </div>
      )}

      {/* Step: Estimating */}
      {currentStep === 'estimating' && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Calculating Costs...</h3>
          <p className="text-gray-600">Estimating infrastructure costs with Infracost</p>
        </div>
      )}

      {/* Step: Ready to Deploy */}
      {currentStep === 'ready' && securityScan && (
        <div className="space-y-6">
          {/* Security Report */}
          <SecurityReport scanResult={securityScan} />

          {/* Cost Estimate */}
          {costEstimate && <CostEstimate estimate={costEstimate} />}

          {/* Deploy Actions */}
          <div className="bg-white border-2 border-teal-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Deploy</h3>
                <p className="text-gray-600">
                  Review the security scan and cost estimate. Click deploy when ready.
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleStartOver} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleDeploy} variant="default" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Deploy Infrastructure
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Deploying */}
      {currentStep === 'deploying' && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Deploying Infrastructure...</h3>
          <p className="text-gray-600">
            This may take a few minutes. Please don't close this page.
          </p>
        </div>
      )}

      {/* Step: Success */}
      {currentStep === 'success' && (
        <div className="bg-white border-2 border-green-200 rounded-xl p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Deployment Successful! 🎉</h3>
          <p className="text-lg text-gray-600 mb-8">
            Your infrastructure has been deployed successfully.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleStartOver} variant="outline" size="lg">
              Create Another Deployment
            </Button>
            <Button onClick={() => router.push('/deployments')} variant="default" size="lg">
              View All Deployments
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

