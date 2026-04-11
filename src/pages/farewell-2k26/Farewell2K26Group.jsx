import React from "react";
import { Link } from "react-router-dom";
import { farewellData } from "./farewell-data";

function Farewell2K26Group() {
  return (
    <div style={{ background: 'var(--bg, #041014)', minHeight: '100vh', color: 'var(--white, #fff)', padding: '4rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '3rem', color: 'var(--teal, #2cd4bf)', marginBottom: '1rem' }}>Farewell 2K26</h1>
        <p style={{ color: 'var(--muted, #a1a1aa)', marginBottom: '3rem', fontSize: '1.2rem' }}>
          A tribute space built with gratitude. Select a member below to view their journey.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
          {Object.keys(farewellData).map(key => {
            const person = farewellData[key];
            return (
              <Link 
                key={key} 
                to={`/farewell-2k26/${key}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(45,212,191,0.2)',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}>
                  <img 
                    src={person.portrait} 
                    alt={person.name} 
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                  />
                  <h3 style={{ color: 'var(--white)', margin: '0 0 0.5rem 0' }}>{person.name}</h3>
                  <p style={{ color: 'var(--teal)', fontSize: '0.875rem', margin: 0 }}>{person.role}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Farewell2K26Group;
