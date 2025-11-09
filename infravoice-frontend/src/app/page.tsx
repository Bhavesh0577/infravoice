'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Mic, 
  Code2, 
  Shield, 
  DollarSign, 
  Rocket, 
  Cloud,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Lock
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice-Powered",
      description: "Simply describe your infrastructure needs using natural language",
      color: "text-teal-600 bg-teal-50"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Auto-Generate Code",
      description: "Get production-ready Terraform code powered by AI",
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security Scanning",
      description: "Built-in Checkov integration for security compliance",
      color: "text-purple-600 bg-purple-50"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Cost Estimation",
      description: "Know your costs before deploying with Infracost",
      color: "text-green-600 bg-green-50"
    }
  ];

  const providers = [
    { name: "AWS", supported: true },
    { name: "GCP", supported: true },
    { name: "Azure", supported: true },
    { name: "Kubernetes", supported: false }
  ];

  const benefits = [
    "10x faster infrastructure deployment",
    "Reduce errors with AI-powered code generation",
    "Enterprise-grade security scanning",
    "Real-time cost transparency",
    "Multi-cloud support",
    "Version control integration"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                InfraVoice
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-50 border border-teal-200">
              <Sparkles className="w-4 h-4 text-teal-600 mr-2" />
              <span className="text-sm font-medium text-teal-900">
                AI-Powered Infrastructure as Code
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900">Deploy infrastructure</span>
              <span className="block bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                with your voice
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Transform natural language into production-ready Terraform code. 
              Generate, scan, estimate costs, and deploy—all from a single platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-lg px-8 py-6">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Building Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Zap className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Free tier available</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16">
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-teal-400 animate-pulse" />
                      <span className="text-gray-400">"Create an S3 bucket for storing images..."</span>
                    </div>
                    <div className="text-green-400 pl-6">✓ Code generated successfully</div>
                    <div className="text-blue-400 pl-6">✓ Security scan passed</div>
                    <div className="text-purple-400 pl-6">✓ Estimated cost: $0.023/month</div>
                    <div className="text-teal-400 pl-6">✓ Ready to deploy!</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to deploy faster
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From voice input to production deployment, InfraVoice streamlines your entire workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud Providers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Globe className="w-3 h-3 mr-2" />
              Multi-Cloud Support
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Deploy to any cloud provider
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {providers.map((provider, index) => (
              <Card key={index} className={`p-6 min-w-[200px] ${provider.supported ? 'border-teal-200 bg-teal-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cloud className={`w-8 h-8 ${provider.supported ? 'text-teal-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-lg">{provider.name}</span>
                  </div>
                  {provider.supported ? (
                    <Badge className="bg-teal-600">Supported</Badge>
                  ) : (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-600 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why teams choose InfraVoice
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-white text-gray-900">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise Security</CardTitle>
                <CardDescription className="text-base">
                  Built with security and compliance in mind
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-teal-600 mt-1" />
                  <div>
                    <p className="font-semibold">SOC 2 Compliant</p>
                    <p className="text-sm text-gray-600">Enterprise-grade security standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-teal-600 mt-1" />
                  <div>
                    <p className="font-semibold">Automated Security Scanning</p>
                    <p className="text-sm text-gray-600">Checkov integration for every deployment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-teal-600 mt-1" />
                  <div>
                    <p className="font-semibold">Data Encryption</p>
                    <p className="text-sm text-gray-600">End-to-end encryption for all data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to transform your infrastructure workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of teams deploying faster with InfraVoice
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-lg px-12 py-6">
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  InfraVoice
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                AI-powered infrastructure as code platform for modern DevOps teams.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 InfraVoice. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#" className="hover:text-teal-600">Features</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Pricing</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Documentation</Link></li>
                <li><Link href="#" className="hover:text-teal-600">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#" className="hover:text-teal-600">About</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Blog</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Careers</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
