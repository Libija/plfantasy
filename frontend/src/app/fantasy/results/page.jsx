'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '../../../hooks/use-auth';

export default function FantasyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0); // index za izabrano kolo
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) return;
    if (user && user.id) {
      fetchResults(user.id);
    }
  }, [authLoading, isLoggedIn, user]);

  const fetchResults = async (userId) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/fantasy/results/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.sort((a, b) => a.gameweek_number - b.gameweek_number));
        setSelectedIdx(data.length - 1); // default na zadnje kolo
      } else {
        alert('Greška: Nije moguće učitati rezultate');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Greška pri učitavanju rezultata');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fantasy Rezultati</h1>
        <div className="text-center">Učitavanje...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fantasy Rezultati</h1>
        <div className="text-center text-red-500">Morate biti prijavljeni da biste vidjeli rezultate.</div>
        </div>
    );
  }

  if (!results.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fantasy Rezultati</h1>
        <div className="text-center text-gray-500">Još nema rezultata iz završenih kola.</div>
      </div>
    );
  }

  // Navigacija kroz kola
  const prevGameweek = () => setSelectedIdx(idx => Math.max(0, idx - 1));
  const nextGameweek = () => setSelectedIdx(idx => Math.min(results.length - 1, idx + 1));
  const selected = results[selectedIdx];

  // Kartice: ukupno bodova i prosjek
  const totalPoints = selected.total_points;
  const avgPoints = (selected.players.reduce((acc, p) => acc + (p.points || 0), 0) / selected.players.length).toFixed(1);

  // Helper za badge boje
  const positionBadge = (pos) => {
    switch (pos) {
      case 'GK': return { background: '#ffe066', color: '#222' };
      case 'DF': return { background: '#228be6', color: '#fff' };
      case 'MF': return { background: '#51cf66', color: '#fff' };
      case 'FW': return { background: '#fa5252', color: '#fff' };
      default: return { background: '#dee2e6', color: '#222' };
    }
  };

  // Helper za prikaz tima (ako nema, prikazi '-')
  const getTeamName = (player) => player.team_name || '-';

  // Helper za cijenu
  const formatPrice = (price) => `${Number(price).toFixed(1)}M`;

  // Helper za bodove
  const pointsColor = (points) => points > 0 ? '#22c55e' : points < 0 ? '#ef4444' : '#222';

  // Helper za računanje poena sa bonus-ima
  const getPlayerDisplayPoints = (player) => {
    if (player.is_captain) {
      return player.points * 2; // Kapiten ×2
    } else if (player.is_vice_captain) {
      return player.points; // Vice-kapiten ×1
    } else {
      return player.points; // Ostali ×1
    }
  };

  // Helper za prikaz poena sa objašnjenjem
  const getPlayerPointsDisplay = (player) => {
    const displayPoints = getPlayerDisplayPoints(player);
    let explanation = '';
    
    if (player.is_captain) {
      explanation = ` (${player.points} × 2)`;
    } else if (player.is_vice_captain) {
      explanation = ` (${player.points} × 1)`;
    }
    
    return { displayPoints, explanation };
  };

  // Razdvoji igrače na starting 11 i klupu
  const starting11Players = selected.players.filter(player => !player.is_bench);
  const benchPlayers = selected.players.filter(player => player.is_bench);

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '32px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Navigacija */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 16 }}>
          <button onClick={prevGameweek} disabled={selectedIdx === 0} style={{ padding: '8px 18px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, opacity: selectedIdx === 0 ? 0.5 : 1, cursor: selectedIdx === 0 ? 'not-allowed' : 'pointer' }}>&larr; Prethodno kolo</button>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 20 }}>{selected.gameweek_number}. kolo</span>
          <button onClick={nextGameweek} disabled={selectedIdx === results.length - 1} style={{ padding: '8px 18px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, opacity: selectedIdx === results.length - 1 ? 0.5 : 1, cursor: selectedIdx === results.length - 1 ? 'not-allowed' : 'pointer' }}>Sljedeće kolo &rarr;</button>
                      </div>
        {/* Kartice */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ background: '#18181b', borderRadius: 12, padding: 28, minWidth: 220, textAlign: 'center', color: '#fff', boxShadow: '0 2px 8px #0002' }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{totalPoints}</div>
            <div style={{ color: '#bdbdbd', fontSize: 16 }}>Ukupno bodova</div>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{selected.gameweek_number}. kolo</div>
                    </div>
          <div style={{ background: '#18181b', borderRadius: 12, padding: 28, minWidth: 220, textAlign: 'center', color: '#fff', boxShadow: '0 2px 8px #0002' }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{avgPoints}</div>
            <div style={{ color: '#bdbdbd', fontSize: 16 }}>Prosječno po igraču</div>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>bodova</div>
                              </div>
                            </div>
        {/* Starting 11 */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18, color: '#111', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>⚽ Starting 11</span>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 400 }}>({starting11Players.length} igrača)</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, color: '#111' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#111', fontWeight: 700 }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left' }}>IGRAČ</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left' }}>POZICIJA</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>BODOVI</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>CIJENA</th>
                </tr>
              </thead>
              <tbody>
                {starting11Players.map((player) => (
                  <tr key={player.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {player.player_name}
                      {player.is_captain && <span style={{ marginLeft: 6, padding: '2px 8px', background: '#ffe066', color: '#222', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>C</span>}
                      {player.is_vice_captain && <span style={{ marginLeft: 4, padding: '2px 8px', background: '#ffa94d', color: '#222', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>VC</span>}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ ...positionBadge(player.position), padding: '2px 10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>{player.position}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: pointsColor(player.points) }}>
                      {(() => {
                        const { displayPoints, explanation } = getPlayerPointsDisplay(player);
                        return (
                          <span title={`Osnovni poeni: ${player.points}${explanation}`}>
                            {displayPoints}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatPrice(player.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Klupa */}
        {benchPlayers.length > 0 && (
          <div style={{ background: '#f8f9fa', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, border: '2px solid #e9ecef' }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18, color: '#111', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>🪑 Klupa</span>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 400 }}>({benchPlayers.length} igrača)</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, color: '#111' }}>
                <thead>
                  <tr style={{ background: '#e9ecef', color: '#111', fontWeight: 700 }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left' }}>IGRAČ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left' }}>POZICIJA</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>BODOVI</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>CIJENA</th>
                </tr>
                </thead>
                <tbody>
                  {benchPlayers.map((player) => (
                    <tr key={player.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {player.player_name}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ ...positionBadge(player.position), padding: '2px 10px', borderRadius: 8, fontWeight: 700, fontSize: 14, opacity: 0.7 }}>{player.position}</span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: pointsColor(player.points) }}>
                        {(() => {
                          const { displayPoints, explanation } = getPlayerPointsDisplay(player);
                          return (
                            <span title={`Osnovni poeni: ${player.points}${explanation}`}>
                              {displayPoints}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatPrice(player.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
              </div>
    </div>
  );
}