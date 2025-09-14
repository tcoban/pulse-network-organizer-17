import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateAndInsertHistoricalData } from '@/utils/generateHistoricalData';
import { Loader2, History } from 'lucide-react';

export const GenerateHistoricalDataButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      toast({
        title: "Generating Historical Data",
        description: "This may take a few minutes...",
      });

      const result = await generateAndInsertHistoricalData();
      
      toast({
        title: "Historical Data Generated!",
        description: `Successfully added rich historical data for ${result.successCount} contacts.`,
      });

    } catch (error) {
      console.error('Error generating historical data:', error);
      toast({
        title: "Error",
        description: "Failed to generate historical data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <History className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : 'Generate Historical Data'}
    </Button>
  );
};