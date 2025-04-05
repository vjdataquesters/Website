import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Styled Components
const Cursor = styled.div`
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.5);
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
  mix-blend-mode: screen;
`;

const CursorTrail = styled.div`
  position: fixed;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 215, 0, 0.2);
  transform: translate(-50%, -50%);
  z-index: 9998;
  pointer-events: none;
  transition: all 0.1s ease;
`;

const Nav = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
  opacity: 0;
`;

const Logo = styled.a`
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFD700;
  text-decoration: none;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  position: relative;
  padding: 5px 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #FFD700;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const HeroSection = styled.section`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  color: white;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 6rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  opacity: 0;
  transform: translateY(30px);
  margin-bottom: 1rem;
  letter-spacing: 5px;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transform: translateY(30px);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Date = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
  color: #FFD700;
  opacity: 0;
  transform: translateY(30px);
`;

const CTAButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: linear-gradient(45deg, #FFD700, #DAA520);
  color: black;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  opacity: 0;
  transform: scale(0.9);
  font-weight: bold;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  }
`;

const Highlight = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0) 60%);
  z-index: 1;
  pointer-events: none;
`;

const LandingTV = () => {
  const cursorRef = useRef(null);
  const cursorTrailRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const shockwavesRef = useRef([]);
  const particlesMeshRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Custom cursor
    const handleMouseMove = (e) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
      });
      
      gsap.to(cursorTrailRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5
      });
    };

    const handleMouseDown = (e) => {
      gsap.to(cursorRef.current, {
        scale: 0.7,
        duration: 0.2
      });
      // Create fewer lines on click
      for (let i = 0; i < 1; i++) {
        setTimeout(() => {
          createCracks(e.clientX, e.clientY, 1);
        }, i * 100);
      }
      createExplosion(e.clientX, e.clientY, 100);
    };

    const handleMouseUp = () => {
      gsap.to(cursorRef.current, {
        scale: 1,
        duration: 0.2
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xFFD700,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;

    camera.position.z = 20;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.x += 0.0003;
        particlesMeshRef.current.rotation.y += 0.0003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Initial animations
    setTimeout(() => {
      createMajorExplosion(window.innerWidth / 2, window.innerHeight / 2, 300);
      createDecorativeCircuits();

      setTimeout(() => {
        gsap.to('.nav', {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out'
        });

        gsap.to('.title', {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: 'power3.out'
        });

        gsap.to('.subtitle', {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.5,
          ease: 'power3.out'
        });

        gsap.to('.date', {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.7,
          ease: 'power3.out'
        });

        gsap.to('.cta-button', {
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 1.1,
          ease: 'elastic.out(1, 0.5)'
        });
      }, 800);
    }, 500);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, []);

  // Effect functions
  const createExplosion = (x, y, size) => {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.4) 30%, rgba(255,215,0,0) 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 2;
      mix-blend-mode: screen;
      left: ${x}px;
      top: ${y}px;
      width: 0px;
      height: 0px;
    `;
    document.body.appendChild(explosion);

    gsap.to(explosion, {
      width: size,
      height: size,
      opacity: 0,
      duration: 0.8,
      ease: 'expo.out',
      onComplete: () => {
        document.body.removeChild(explosion);
      }
    });

    createDebris(x, y, 10 + Math.floor(size/10));
    createCracks(x, y, 3 + Math.floor(size/50));
    createPulseRings(x, y);
  };

  const createMajorExplosion = (x, y, size) => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createExplosion(x, y, size * (1 - i * 0.2));
      }, i * 200);
    }

    createDebris(x, y, 50);
    createCracks(x, y, 12);

    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 215, 0, 0.3);
      z-index: 999;
      pointer-events: none;
    `;
    document.body.appendChild(flash);

    gsap.to(flash, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        document.body.removeChild(flash);
      }
    });
  };

  const createDebris = (x, y, count) => {
    for (let i = 0; i < count; i++) {
      const debris = document.createElement('div');
      debris.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background-color: #FFD700;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 2;
        left: ${x}px;
        top: ${y}px;
      `;
      document.body.appendChild(debris);

      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 150;
      const duration = 0.5 + Math.random() * 1;

      gsap.to(debris, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        duration: duration,
        ease: 'power2.out',
        onComplete: () => {
          document.body.removeChild(debris);
        }
      });
    }
  };

  const createCracks = (x, y, count) => {
    for (let i = 0; i < count; i++) {
      const crack = document.createElement('div');
      crack.style.cssText = `
        position: absolute;
        background-color: #FFD700;
        height: 2px;
        transform-origin: left center;
        z-index: 2;
        box-shadow: 0 0 8px 2px rgba(255,215,0,0.8);
        left: ${x}px;
        top: ${y}px;
        width: 0px;
      `;
      document.body.appendChild(crack);

      const angle = Math.random() * Math.PI * 2;
      const length = 50 + Math.random() * 100;

      crack.style.transform = `rotate(${angle}rad)`;

      gsap.to(crack, {
        width: length,
        duration: 0.3,
        ease: 'power3.out',
        onComplete: () => {
          gsap.to(crack, {
            opacity: 0,
            duration: 2,
            delay: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              document.body.removeChild(crack);
            }
          });
        }
      });
    }
  };

  const createPulseRings = (x, y) => {
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        border: 2px solid rgba(255,215,0,0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        z-index: 2;
        left: ${x}px;
        top: ${y}px;
        width: 10px;
        height: 10px;
      `;
      document.body.appendChild(ring);

      gsap.to(ring, {
        scale: 5 + i * 2,
        opacity: 0,
        duration: 1.5 + i * 0.5,
        delay: i * 0.2,
        ease: 'power2.out',
        onComplete: () => {
          document.body.removeChild(ring);
        }
      });
    }
  };

  const createDecorativeCircuits = () => {
    for (let i = 0; i < 5; i++) {
      // Main circuit
      const circuit = document.createElement('div');
      circuit.style.cssText = `
        position: absolute;
        width: ${100 + Math.random() * 200}px;
        height: ${100 + Math.random() * 200}px;
        border-radius: 50%;
        border: 1px solid rgba(255,215,0,0.3);
        z-index: 1;
        transform: translate(-50%, -50%);
        pointer-events: none;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
      `;
      document.body.appendChild(circuit);

      // Add inner circles
      const innerCircleCount = 3;
      for (let j = 0; j < innerCircleCount; j++) {
        const innerCircle = document.createElement('div');
        const scale = 0.8 - (j * 0.2);
        innerCircle.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(255,215,0,${0.2 + j * 0.1});
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${scale});
        `;
        circuit.appendChild(innerCircle);
      }

      // Add orbital dots
      const dotsCount = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < dotsCount; j++) {
        const dot = document.createElement('div');
        const angle = (j / dotsCount) * Math.PI * 2;
        const radius = parseInt(circuit.style.width) / 2;
        dot.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: #FFD700;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          box-shadow: 0 0 10px rgba(255,215,0,0.8);
          transform-origin: ${radius}px center;
          transform: translate(-50%, -50%) rotate(${angle}rad) translateX(${radius}px);
        `;
        circuit.appendChild(dot);

        // Animate orbital dots
        gsap.to(dot, {
          rotation: '+=360',
          duration: 8 + Math.random() * 4,
          repeat: -1,
          ease: 'none'
        });
      }

      // Add connecting lines
      const linesCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < linesCount; j++) {
        const line = document.createElement('div');
        const angle = (j / linesCount) * Math.PI * 2;
        const length = parseInt(circuit.style.width) / 2;
        line.style.cssText = `
          position: absolute;
          width: ${length}px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,215,0,0.1), rgba(255,215,0,0.4));
          top: 50%;
          left: 50%;
          transform-origin: left;
          transform: translate(0, -50%) rotate(${angle}rad);
        `;
        circuit.appendChild(line);

        // Animate line glow
        gsap.to(line, {
          opacity: 0.2,
          duration: 1 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }

      // Main circuit animations
      gsap.from(circuit, {
        opacity: 0,
        scale: 0,
        duration: 1,
        ease: 'power2.out'
      });

      // Rotation animation
      gsap.to(circuit, {
        rotation: 360,
        duration: 30 + Math.random() * 20,
        repeat: -1,
        ease: 'none'
      });

      // Pulse animation
      const pulseInterval = setInterval(() => {
        // Create pulse effect
        const pulse = document.createElement('div');
        pulse.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(255,215,0,0.3);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
        `;
        circuit.appendChild(pulse);

        gsap.to(pulse, {
          scale: 1.2,
          opacity: 0,
          duration: 1.5,
          ease: 'power2.out',
          onComplete: () => {
            circuit.removeChild(pulse);
          }
        });

        // Glow effect
        gsap.to(circuit, {
          boxShadow: '0 0 15px rgba(255,215,0,0.5)',
          duration: 0.5,
          yoyo: true,
          repeat: 1
        });
      }, 5000 + Math.random() * 5000);

      // Cleanup
      return () => clearInterval(pulseInterval);
    }
  };

  return (
    <>
      <Cursor ref={cursorRef} />
      <CursorTrail ref={cursorTrailRef} />

      <Nav className="nav">
        <Logo href="#">TECHNOVISTA</Logo>
        <NavLinks>
          <NavLink href="#">Home</NavLink>
          <NavLink href="#">Events</NavLink>
          <NavLink href="#">Schedule</NavLink>
          <NavLink href="#">Register</NavLink>
        </NavLinks>
      </Nav>

      <HeroSection id="hero">
        <CanvasContainer ref={canvasContainerRef} />
        <Highlight />

        <Content>
          <Title className="title">Technovista</Title>
          <Subtitle className="subtitle">Where Innovation Explodes Into Reality</Subtitle>
          <Date className="date">April 22-24, 2025</Date>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <CTAButton 
              className="cta-button"
              onClick={(e) => {
                gsap.to(e.target, {
                  scale: 0.95,
                  duration: 0.1,
                  onComplete: () => {
                    gsap.to(e.target, {
                      scale: 1,
                      duration: 0.3,
                      ease: 'elastic.out(1, 0.5)'
                    });
                    createMajorExplosion(
                      e.target.getBoundingClientRect().left + e.target.offsetWidth/2,
                      e.target.getBoundingClientRect().top + e.target.offsetHeight/2,
                      200
                    );
                  }
                });
              }}
            >
              Register Now
            </CTAButton>
            <CTAButton 
              className="cta-button"
              onClick={() => navigate('/technovista')}
            >
              Enter the Nexus
            </CTAButton>
          </div>
        </Content>
      </HeroSection>
    </>
  );
};

export default LandingTV;