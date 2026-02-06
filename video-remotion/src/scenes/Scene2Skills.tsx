import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

const Icon = ({type, size = 48}: {type: string; size?: number}) => {
  const icons: Record<string, string> = {
    nlp: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    json: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    format: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    skill: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    flowchart: 'M4 6h16v12H4z M8 10h8v4H8z',
    sequence: 'M4 6h16M4 12h16M4 18h16',
    class: 'M4 4h16v16H4z M8 8h8M8 12h8M8 16h8',
    er: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    arch: 'M3 21h18M5 21V7l8-4 8 4v14',
    network: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0',
    link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[type] || icons.skill} />
    </svg>
  );
};

const features = [
  {icon: 'nlp', title: '自然语言理解', desc: '理解用户需求'},
  {icon: 'json', title: 'JSON规范生成', desc: '自动构建图表结构'},
  {icon: 'format', title: '智能格式选择', desc: '推荐最佳图表格式'},
];

const diagramTypes = [
  {name: '流程图', icon: 'flowchart', color: '#1976d2'},
  {name: '时序图', icon: 'sequence', color: '#7b1fa2'},
  {name: '类图', icon: 'class', color: '#388e3c'},
  {name: 'ER图', icon: 'er', color: '#f57c00'},
  {name: '架构图', icon: 'arch', color: '#c2185b'},
  {name: '网络拓扑', icon: 'network', color: '#00796b'},
];

export const Scene2Skills: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame;

  const titleProgress = spring({
    frame: localFrame,
    fps,
    config: {damping: 200},
    durationInFrames: 20,
  });

  const featureProgress = spring({
    frame: localFrame - 20,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const diagramProgress = spring({
    frame: localFrame - 50,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const linkProgress = spring({
    frame: localFrame - 80,
    fps,
    config: {damping: 200},
    durationInFrames: 20,
  });

  const exitProgress = interpolate(localFrame, [190, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: 80,
        opacity: exitProgress,
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
          opacity: titleProgress,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 20,
            padding: '20px 40px',
            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
            borderRadius: 20,
            marginBottom: 40,
          }}
        >
          <div style={{color: '#ffffff'}}>
            <Icon type="skill" size={48} />
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            diagram-generator Skill
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 40,
        }}
      >
        {features.map((feature, index) => {
          const delay = index * 5;
          const itemProgress = spring({
            frame: localFrame - 30 - delay,
            fps,
            config: {damping: 200},
            durationInFrames: 20,
          });

          return (
            <div
              key={feature.title}
              style={{
                flex: 1,
                padding: 32,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transform: `translateY(${interpolate(itemProgress, [0, 1], [40, 0])}px)`,
                opacity: itemProgress,
              }}
            >
              <div style={{color: '#1976d2', marginBottom: 16}}>
                <Icon type={feature.icon} size={56} />
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: 10,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {feature.title}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: '#a0a0a0',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {feature.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          transform: `translateY(${interpolate(diagramProgress, [0, 1], [30, 0])}px)`,
          opacity: diagramProgress,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#a0a0a0',
            marginBottom: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          支持的图表类型
        </div>
        <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
          {diagramTypes.map((type, index) => {
            const delay = index * 3;
            const typeProgress = spring({
              frame: localFrame - 70 - delay,
              fps,
              config: {damping: 200},
              durationInFrames: 15,
            });

            return (
              <div
                key={type.name}
                style={{
                  padding: '16px 28px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 16,
                  border: `2px solid ${type.color}`,
                  color: '#ffffff',
                  fontSize: 22,
                  fontWeight: 500,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transform: `scale(${interpolate(typeProgress, [0, 1], [0.8, 1])})`,
                  opacity: typeProgress,
                }}
              >
                <div style={{color: type.color}}>
                  <Icon type={type.icon} size={28} />
                </div>
                {type.name}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          transform: `translateY(${interpolate(linkProgress, [0, 1], [20, 0])}px)`,
          opacity: linkProgress,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '16px 28px',
          background: 'rgba(25, 118, 210, 0.1)',
          borderRadius: 12,
          border: '1px solid rgba(25, 118, 210, 0.3)',
          marginTop: 'auto',
        }}
      >
        <div style={{color: '#1976d2'}}>
          <Icon type="link" size={24} />
        </div>
        <span
          style={{
            fontSize: 20,
            color: '#1976d2',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          skillsmp.com/zh/skills/openclaw-skills-skills-matthewyin-diagram-generator-skill-md
        </span>
      </div>
    </AbsoluteFill>
  );
};
