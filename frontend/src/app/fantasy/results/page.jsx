'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function FantasyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/gameweek-teams/results/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        toast({
          title: "Greška",
          description: "Nije moguće učitati rezultate",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Greška",
        description: "Greška pri učitavanju rezultata",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGameweekResult = async (gameweekId) => {
    try {
      const response = await fetch(`/gameweek-teams/results/${user.id}/${gameweekId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGameweek(data);
      } else {
        toast({
          title: "Greška",
          description: "Nije moguće učitati rezultat za ovo kolo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching gameweek result:', error);
      toast({
        title: "Greška",
        description: "Greška pri učitavanju rezultata kola",
        variant: "destructive",
      });
    }
  };

  const createSnapshot = async (gameweekId) => {
    try {
      const response = await fetch(`/gameweek-teams/snapshot/${user.id}/${gameweekId}`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({
          title: "Uspješno",
          description: "Snapshot tima je kreiran",
        });
        fetchResults(); // Refresh results
      } else {
        toast({
          title: "Greška",
          description: "Nije moguće kreirati snapshot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast({
        title: "Greška",
        description: "Greška pri kreiranju snapshot-a",
        variant: "destructive",
      });
    }
  };

  const createAutoSnapshots = async (gameweekId) => {
    try {
      const response = await fetch(`/gameweek-teams/auto-snapshot/${gameweekId}`, {
        method: 'POST',
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Uspješno",
          description: `Kreirano ${result.created_snapshots} snapshot-a`,
        });
        fetchResults(); // Refresh results
      } else {
        toast({
          title: "Greška",
          description: "Nije moguće kreirati automatske snapshote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating auto snapshots:', error);
      toast({
        title: "Greška",
        description: "Greška pri kreiranju automatskih snapshot-a",
        variant: "destructive",
      });
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'GK': return 'bg-yellow-100 text-yellow-800';
      case 'DF': return 'bg-blue-100 text-blue-800';
      case 'MF': return 'bg-green-100 text-green-800';
      case 'FW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCaptainBadge = (isCaptain, isViceCaptain) => {
    if (isCaptain) return <Badge className="bg-yellow-500 text-white">C</Badge>;
    if (isViceCaptain) return <Badge className="bg-orange-500 text-white">VC</Badge>;
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fantasy Rezultati</h1>
        <div className="text-center">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Fantasy Rezultati</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => createSnapshot(1)} 
            variant="outline"
            size="sm"
          >
            Kreiraj Snapshot (Kolo 1)
          </Button>
          <Button 
            onClick={() => createSnapshot(2)} 
            variant="outline"
            size="sm"
          >
            Kreiraj Snapshot (Kolo 2)
          </Button>
          <Button 
            onClick={() => createAutoSnapshots(1)} 
            variant="outline"
            size="sm"
          >
            Auto Snapshot (Kolo 1)
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Još nema rezultata iz završenih kola.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Pregled</TabsTrigger>
            <TabsTrigger value="details">Detalji</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {results.map((result) => (
                <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => fetchGameweekResult(result.gameweek_id)}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Kolo {result.gameweek_number}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.formation}</Badge>
                        <Badge className="bg-green-500 text-white">
                          {result.total_points.toFixed(1)} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      {new Date(result.created_at).toLocaleDateString('hr-HR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedGameweek ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Kolo {selectedGameweek.gameweek_number}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedGameweek.formation}</Badge>
                        <Badge className="bg-green-500 text-white">
                          {selectedGameweek.total_points.toFixed(1)} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Početnih 11</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {selectedGameweek.players
                          .filter(player => !player.is_bench)
                          .map((player) => (
                            <div key={player.id} className="flex justify-between items-center p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Badge className={getPositionColor(player.position)}>
                                  {player.position}
                                </Badge>
                                <span className="font-medium">{player.player_name}</span>
                                {getCaptainBadge(player.is_captain, player.is_vice_captain)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${player.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {player.points.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Klupa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {selectedGameweek.players
                          .filter(player => player.is_bench)
                          .map((player) => (
                            <div key={player.id} className="flex justify-between items-center p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Badge className={getPositionColor(player.position)}>
                                  {player.position}
                                </Badge>
                                <span className="font-medium">{player.player_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${player.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {player.points.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Kliknite na kolo iz pregleda da vidite detalje.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
