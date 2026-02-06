import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

const Icon = ({type, size = 48}: {type: string; size?: number}) => {
  const icons: Record<string, string> = {
    email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
    arrow: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    drawio: 'M4 6h16v12H4z M8 10h8v4H8z',
    mermaid: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    excalidraw: 'M12 19l7-7 3 3-7 7-3-3z',
    skill: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[type] || icons.arrow} />
    </svg>
  );
};

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame;

  const titleProgress = spring({
    frame: localFrame,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const contentProgress = spring({
    frame: localFrame - 20,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const linksProgress = spring({
    frame: localFrame - 50,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const socialProgress = spring({
    frame: localFrame - 80,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
          opacity: titleProgress,
          textAlign: 'center',
          marginBottom: 48,
        }}
      >
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            marginBottom: 16,
          }}
        >
          自然语言 → 专业图表
        </h2>
        <p
          style={{
            fontSize: 32,
            color: '#a0a0a0',
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 300,
          }}
        >
          只需一句话
        </p>
      </div>

      <div
        style={{
          transform: `translateY(${interpolate(contentProgress, [0, 1], [30, 0])}px)`,
          opacity: contentProgress,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 28,
          padding: 48,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#7b1fa2',
            marginBottom: 20,
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Created by
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 28,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AlkaidY
        </div>

        <div
          style={{
            transform: `translateY(${interpolate(linksProgress, [0, 1], [20, 0])}px)`,
            opacity: linksProgress,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{color: '#1976d2'}}>
              <Icon type="email" size={22} />
            </div>
            <span
              style={{
                fontSize: 20,
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              tccio2023@gmail.com
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{color: '#ffffff'}}>
              <Icon type="github" size={22} />
            </div>
            <span
              style={{
                fontSize: 18,
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              github.com/Matthewyin/mcp-skills
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              background: 'rgba(25, 118, 210, 0.1)',
              borderRadius: 12,
              border: '1px solid rgba(25, 118, 210, 0.3)',
            }}
          >
            <div style={{color: '#1976d2'}}>
              <Icon type="link" size={22} />
            </div>
            <span
              style={{
                fontSize: 16,
                color: '#1976d2',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              skillsmp.com/zh/skills/openclaw-skills-skills-matthewyin-diagram-generator-skill-md
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 48,
          display: 'flex',
          gap: 32,
          transform: `translateY(${interpolate(socialProgress, [0, 1], [20, 0])}px)`,
          opacity: socialProgress,
        }}
      >
        {[
          {name: 'Draw.io', icon: 'drawio'},
          {name: 'Mermaid', icon: 'mermaid'},
          {name: 'Excalidraw', icon: 'excalidraw'},
        ].map((format) => (
          <div
            key={format.name}
            style={{
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#a0a0a0',
              fontSize: 18,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Icon type={format.icon} size={22} />
            {format.name}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
