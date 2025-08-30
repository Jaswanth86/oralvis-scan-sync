import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Stethoscope, Upload, Eye, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/50 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary rounded-full p-6">
              <Stethoscope className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">OralVis</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced Healthcare Scan Management System
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <a href="/auth">Get Started</a>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
            <p className="text-muted-foreground">
              Technicians can quickly upload oral health scans with patient information and notes.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Review</h3>
            <p className="text-muted-foreground">
              Dentists can review, analyze, and approve scans with detailed status tracking.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-muted-foreground">
              Role-based access control ensures patient data security and compliance.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join healthcare professionals using OralVis for efficient scan management.
          </p>
          <Button asChild size="lg" variant="outline">
            <a href="/auth">Sign In / Sign Up</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
