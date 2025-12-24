'use client';

import React, { useState, useEffect } from 'react';

export default function BestTeam() {
  const [bestTeam, setBestTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestTeam();
  }, []);

  const fetchBestTeam = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/gameweek-teams/best-team/last-gameweek`);
      if (response.ok) {
        const data = await response.json();
        setBestTeam(data);
      } else {
        if (response.status === 404) {
          // Nema završenih kola ili timova
          setBestTeam(null);
        } else {
          alert('Greška: Nije moguće učitati najbolji tim');
        }
      }
    } catch (error) {
      console.error('Error fetching best team:', error);
      alert('Greška pri učitavanju najboljeg tima');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', padding: '32px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Najbolji Tim Kola</h1>
          <div>Učitavanje...</div>
        </div>
      </div>
    );
  }

  if (!bestTeam) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', padding: '32px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Najbolji Tim Kola</h1>
          <div style={{ color: '#bdbdbd', fontSize: 18 }}>Još nema završenih kola ili timova za prikaz.</div>
        </div>
      </div>
    );
  }

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

  // Helper za cijenu
  const formatPrice = (price) => `${Number(price).toFixed(1)}M`;

  // Helper za bodove
  const pointsColor = (points) => points > 0 ? '#22c55e' : points < 0 ? '#ef4444' : '#222';

  // Helper za prikaz poena sa objašnjenjem
  const getPlayerPointsDisplay = (player) => {
    let displayPoints = player.points;
    let explanation = '';
    
    if (player.is_captain) {
      displayPoints = player.points * 2;
      explanation = ` (${player.points} × 2)`;
    } else if (player.is_vice_captain) {
      explanation = ` (${player.points} × 1)`;
    }
    
    return { displayPoints, explanation };
  };

  // Razdvoji igrače na starting 11 i klupu
  const starting11Players = bestTeam.players.filter(player => !player.is_bench);
  const benchPlayers = bestTeam.players.filter(player => player.is_bench);

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '32px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, color: '#fff' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>🏆 Najbolji Tim Kola</h1>
          <div style={{ fontSize: 20, color: '#bdbdbd' }}>
            {bestTeam.gameweek_number}. kolo {bestTeam.gameweek_season}
          </div>
        </div>

        {/* Kartica sa osnovnim informacijama */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 16, 
          padding: 32, 
          marginBottom: 32,
          color: '#fff',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                {bestTeam.username}
              </div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>
                Formacija: {bestTeam.formation}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
                {bestTeam.total_points}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>bodova</div>
            </div>
          </div>
        </div>

        {/* Detaljni prikaz tima */}
        <>
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
        </>
      </div>
    </div>
  );
}

