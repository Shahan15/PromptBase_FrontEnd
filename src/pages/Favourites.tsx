import { useState, useEffect } from 'react';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { favouritesApi, promptsApi } from '@/api/client';

interface Favourite {
  id: string;
  created_at: string;
  prompt_id: string;
}

interface Prompt {
  id: string;
  original_prompt: string;
  optimised_prompt: string;
  tags: string;
}

interface FavouriteWithPrompt extends Favourite {
  prompt?: Prompt;
}

export default function Favourites() {
  const [favourites, setFavourites] = useState<FavouriteWithPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFavourites = async () => {
    try {
      const [favData, promptsData] = await Promise.all([
        favouritesApi.getAll(),
        promptsApi.getPrompts(),
      ]);
      
      // Map prompts to favourites
      const favouritesWithPrompts = favData.map((fav: Favourite) => ({
        ...fav,
        prompt: promptsData.find((p: Prompt) => p.id === fav.prompt_id),
      }));
      
      setFavourites(favouritesWithPrompts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load favourites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRemove = async (favouriteId: string) => {
    setRemoving(favouriteId);
    try {
      await favouritesApi.delete(favouriteId);
      toast({
        title: 'Removed',
        description: 'Removed from favourites',
      });
      setFavourites((prev) => prev.filter((f) => f.id !== favouriteId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove favourite',
        variant: 'destructive',
      });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Favourites</h1>
          <p className="text-muted-foreground">Your saved favourite prompts</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favourites.length === 0 ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No favourites yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add prompts to your favourites from the Prompts page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favourites.map((fav) => (
              <Card key={fav.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {fav.prompt ? (
                        <>
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Original</span>
                            <p className="text-sm mt-1">{fav.prompt.original_prompt}</p>
                          </div>
                          <div>
                            <span className="text-xs text-primary uppercase tracking-wide">Optimized</span>
                            <p className="text-sm mt-1 text-foreground/90">{fav.prompt.optimised_prompt}</p>
                          </div>
                          {fav.prompt.tags && (
                            <div className="flex gap-1 flex-wrap">
                              {fav.prompt.tags.split(',').map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Prompt not found</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(fav.id)}
                      disabled={removing === fav.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {removing === fav.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
