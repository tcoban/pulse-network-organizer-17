import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { insertSyntheticContacts } from '@/utils/insertSyntheticContacts';
import { Database, Users, Loader2 } from 'lucide-react';

interface SyntheticDataGeneratorProps {
  onComplete?: () => void;
}

const SyntheticDataGenerator = ({ onComplete }: SyntheticDataGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ successCount: number; errorCount: number } | null>(null);
  const { toast } = useToast();

  const handleGenerateContacts = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(null);

    try {
      toast({
        title: "Generating contacts...",
        description: "Creating 150 synthetic contacts for ETH Zurich economic research institute.",
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const results = await insertSyntheticContacts();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(results);

      toast({
        title: "Contacts generated successfully!",
        description: `${results.successCount} contacts created${results.errorCount > 0 ? `, ${results.errorCount} failed` : ''}.`,
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('Error generating contacts:', error);
      toast({
        title: "Error generating contacts",
        description: "There was an error creating the synthetic contacts. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Synthetic Data Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Generate 150 realistic contacts for an academic economic research institute at ETH Zurich.
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Includes:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Swiss National Bank & Government officials</li>
            <li>• International organization experts (IMF, OECD, World Bank)</li>
            <li>• Academic researchers from top universities</li>
            <li>• Financial sector professionals</li>
            <li>• Think tank researchers and policy analysts</li>
          </ul>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating contacts...
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% complete
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Users className="h-4 w-4" />
              Generation Complete!
            </div>
            <div className="text-xs text-muted-foreground">
              ✓ {results.successCount} contacts created successfully
              {results.errorCount > 0 && (
                <div className="text-red-600">
                  ✗ {results.errorCount} contacts failed to create
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleGenerateContacts} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Generate 150 Contacts
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SyntheticDataGenerator;