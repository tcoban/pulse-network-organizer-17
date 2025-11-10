import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Gift, 
  Users, 
  Target, 
  TrendingUp,
  Calendar,
  ArrowRight,
  PlayCircle,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  action?: string;
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Give Referrals',
    description: 'Click "Give a Referral" to track business you send to others. This builds your giving record and strengthens relationships.',
    icon: Gift,
    action: 'Try giving a referral now',
    color: 'text-blue-600'
  },
  {
    title: 'Track Network ROI',
    description: 'Monitor your Giver\'s Gain ratio and total business generated. The dashboard shows your networking impact in real-time.',
    icon: TrendingUp,
    action: 'View your metrics',
    color: 'text-green-600'
  },
  {
    title: 'Schedule 1-2-1 Meetings',
    description: 'Book one-to-one meetings with contacts to deepen relationships. These meetings are crucial for understanding how to help each other.',
    icon: Calendar,
    action: 'Schedule a meeting',
    color: 'text-purple-600'
  },
  {
    title: 'Find Introduction Matches',
    description: 'The AI matcher analyzes your contacts to suggest valuable introductions. Connect people who can help each other.',
    icon: Users,
    action: 'View matches',
    color: 'text-orange-600'
  },
  {
    title: 'Log Visibility Days',
    description: 'Track your weekly BNI commitments including referrals, meetings, and visibility activities. Stay accountable to your goals.',
    icon: Target,
    action: 'Log today\'s activities',
    color: 'text-pink-600'
  }
];

interface SystemTutorialProps {
  onComplete?: () => void;
}

export function SystemTutorial({ onComplete }: SystemTutorialProps) {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleComplete = () => {
    setOpen(false);
    onComplete?.();
    localStorage.setItem('bni_tutorial_completed', 'true');
  };

  const markStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    handleNext();
  };

  const currentStepData = tutorialSteps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Welcome to BNI CRM System</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleComplete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Learn how to maximize your networking with Giver's Gain principles
          </CardDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{currentStep + 1} of {tutorialSteps.length}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Navigation Pills */}
        <div className="flex gap-2 flex-wrap">
          {tutorialSteps.map((step, index) => (
            <Button
              key={index}
              variant={currentStep === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStepClick(index)}
              className="relative"
            >
              {completedSteps.includes(index) && (
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              )}
              Step {index + 1}
            </Button>
          ))}
        </div>

        {/* Current Step Content */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-accent`}>
                <Icon className={`h-8 w-8 ${currentStepData.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{currentStepData.title}</CardTitle>
                <CardDescription className="text-base">
                  {currentStepData.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStepData.action && (
              <div className="p-4 bg-accent/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Try it now:</span>
                </div>
                <p className="text-sm text-muted-foreground">{currentStepData.action}</p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Quick Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {currentStep === 0 && (
                  <>
                    <li>Record every referral you give, no matter how small</li>
                    <li>Include estimated value to track your giving impact</li>
                    <li>Follow up on referral status to maintain accountability</li>
                  </>
                )}
                {currentStep === 1 && (
                  <>
                    <li>Aim for a Giver's Gain ratio above 1.0</li>
                    <li>Monitor closed business value vs. estimates</li>
                    <li>Review your pipeline stages regularly</li>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <li>Schedule at least 2-3 one-to-ones per week</li>
                    <li>Prepare GAINS questions before each meeting</li>
                    <li>Follow up within 24 hours with action items</li>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <li>Review AI matches weekly for new opportunities</li>
                    <li>Make warm introductions via email or message</li>
                    <li>Track introduction outcomes for better matching</li>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <li>Log activities daily while they're fresh</li>
                    <li>Set weekly goals for consistency</li>
                    <li>Review progress each Friday to plan next week</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleComplete}
            >
              Skip Tutorial
            </Button>
            <Button
              onClick={markStepComplete}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Tutorial
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
