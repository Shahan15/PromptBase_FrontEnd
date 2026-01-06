import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Wand2, FileText, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { promptsApi, favouritesApi } from '@/api/client';
import { Layout } from '@/components/Layout';

export default function Dashboard() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const { toast } = useToast();

  const handleFavourite = async () => {
    if (!refinedPrompt || !originalPrompt) return;

    setIsFavouriting(true);
    try {
      await favouritesApi.create(originalPrompt, refinedPrompt);
      setIsFavourited(true);
      toast({
        title: 'Added to favourites!',
        description: 'This prompt has been saved to your favourites.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to favourite',
        description: error.response?.data?.detail || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsFavouriting(false);
    }
  };

  const handleRefine = async () => {
    if (!originalPrompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt to refine.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefining(true);
    setRefinedPrompt('');
    setIsFavourited(false);

    try {
      const response = await promptsApi.createPrompt(originalPrompt);
      setRefinedPrompt(response.optimised_prompt);
      toast({
        title: 'Prompt refined!',
        description: 'Your prompt has been optimized successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Refinement failed',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    if (!refinedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(refinedPrompt);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Refined prompt copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Transform Your Prompts
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Enter your prompt and let AI optimize it for better, more precise results.
        </p>
      </div>

        {/* Split View */}
        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-6 items-start max-w-7xl mx-auto">
          {/* Left Panel - Original Prompt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Original Prompt</span>
            </div>
            <div className="relative">
              <Textarea
                placeholder="Enter your prompt here... 

Example: Write me an email to my boss asking for a raise"
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                className="min-h-[400px] bg-card border-border resize-none text-base leading-relaxed p-4 focus:border-primary focus:ring-primary/20"
                disabled={isRefining}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {originalPrompt.length} characters
              </div>
            </div>
          </div>

          {/* Center - Action Button */}
          <div className="flex flex-col items-center justify-center lg:pt-10">
            <Button
              onClick={handleRefine}
              disabled={isRefining || !originalPrompt.trim()}
              size="lg"
              className="h-14 px-8 text-base font-medium glow-primary hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Improve Prompt
                </>
              )}
            </Button>
            <div className="hidden lg:flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>AI-powered optimization</span>
            </div>
          </div>

          {/* Right Panel - Refined Prompt */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Refined Prompt</span>
              </div>
              {refinedPrompt && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavourite}
                    disabled={isFavouriting || isFavourited}
                    className="h-8 text-xs"
                  >
                    {isFavourited ? (
                      <>
                        <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                        Favourited
                      </>
                    ) : isFavouriting ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Heart className="w-3 h-3 mr-1" />
                        Favourite
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            <div className="relative">
              <div
                className={`min-h-[400px] bg-card border border-border rounded-lg p-4 text-base leading-relaxed overflow-auto ${
                  !refinedPrompt ? 'flex items-center justify-center' : ''
                } ${refinedPrompt ? 'gradient-border' : ''}`}
              >
                {isRefining ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-sm">Optimizing your prompt...</span>
                  </div>
                ) : refinedPrompt ? (
                  <p className="whitespace-pre-wrap">{refinedPrompt}</p>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Your refined prompt will appear here</p>
                  </div>
                )}
              </div>
              {refinedPrompt && (
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {refinedPrompt.length} characters
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="glass rounded-xl p-6 border border-border">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Tips for better prompts
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Be specific about the task and desired outcome</li>
              <li>• Include relevant context and constraints</li>
              <li>• Specify the format you want the response in</li>
            </ul>
          </div>
      </div>
    </Layout>
  );
}
