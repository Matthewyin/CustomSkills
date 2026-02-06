import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

const Icon = ({type, size = 48}: {type: string; size?: number}) => {
  const icons: Record<string, string> = {
    diagram: 'M4 4h16v16H4z M8 8h8v8H8z',
    version: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    tagline: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    drawio: 'M4 6h16v12H4z M8 10h8v4H8z',
    mermaid: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    excalidraw: 'M12 19l7-7 3 3-7 7-3-3z',
    skill: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    server: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[type] || icons.diagram} />
    </svg>
  );
};

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: {damping: 200},
    durationInFrames: 30,
  });

  const subtitleProgress = spring({
    frame: frame - 15,
    fps,
    config: {damping: 200},
    durationInFrames: 30,
  });

  const poweredByProgress = spring({
    frame: frame - 30,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const opacity = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleProgress,
          textAlign: 'center',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24}}>
          <div style={{color: '#1976d2'}}>
            <Icon type="diagram" size={80} />
          </div>
          <h1
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-2px',
              textShadow: '0 0 80px rgba(25, 118, 210, 0.6)',
            }}
          >
            Diagram Generator
          </h1>
        </div>
        
        <div
          style={{
            marginTop: 20,
            fontSize: 36,
            color: '#7b1fa2',
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Icon type="version" size={28} />
          v1.1.1
        </div>
      </div>

      <div
        style={{
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleProgress,
          marginTop: 64,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 48,
            color: '#e0e0e0',
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <span style={{color: '#1976d2'}}>
            <Icon type="tagline" size={40} />
          </span>
          一句话生成专业图表
        </p>
      </div>


      <div
        style={{
          transform: `translateY(${interpolate(poweredByProgress, [0, 1], [30, 0])}px)`,
          opacity: poweredByProgress,
          marginTop: 56,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: '#a0a0a0',
            marginBottom: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Powered by
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 28px',
              background: 'rgba(25, 118, 210, 0.2)',
              borderRadius: 12,
              border: '1px solid rgba(25, 118, 210, 0.5)',
            }}
          >
            <div style={{color: '#1976d2'}}>
              <Icon type="skill" size={28} />
            </div>
            <span
              style={{
                fontSize: 22,
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 500,
              }}
            >
              diagram-generator
            </span>
          </div>
          
          <div
            style={{
              fontSize: 24,
              color: '#a0a0a0',
            }}
          >
            &&
          </div>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 28px',
              background: 'rgba(123, 31, 162, 0.2)',
              borderRadius: 12,
              border: '1px solid rgba(123, 31, 162, 0.5)',
            }}
          >
            <div style={{color: '#7b1fa2'}}>
              <Icon type="server" size={28} />
            </div>
            <span
              style={{
                fontSize: 22,
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 500,
              }}
            >
              mcp-diagram-generator
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 60,
          display: 'flex',
          gap: 32,
          opacity: subtitleProgress,
        }}
      >
        {[
          {name: 'Draw.io', icon: 'drawio'},
          {name: 'Mermaid', icon: 'mermaid'},
          {name: 'Excalidraw', icon: 'excalidraw'},
        ].map((format, index) => (
          <div
            key={format.name}
            style={{
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: 24,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0]) * (index + 1) * 0.3}px)`,
              opacity: subtitleProgress,
            }}
          >
            <Icon type={format.icon} size={28} />
            {format.name}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
