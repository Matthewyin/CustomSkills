import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';

const Icon = ({type, size = 48}: {type: string; size?: number}) => {
  const icons: Record<string, string> = {
    generate: 'M12 5v14M5 12h14',
    validate: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    config: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M12 8v4l3 3',
    get: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    path: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    server: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[type] || icons.server} />
    </svg>
  );
};

const tools = [
  {name: 'generate_diagram', desc: '生成图表', icon: 'generate', color: '#1976d2'},
  {name: 'validate_diagram_spec', desc: '验证规范', icon: 'validate', color: '#388e3c'},
  {name: 'init_config', desc: '初始化配置', icon: 'config', color: '#f57c00'},
  {name: 'get_config', desc: '获取配置', icon: 'get', color: '#7b1fa2'},
  {name: 'set_output_path', desc: '设置输出路径', icon: 'path', color: '#c2185b'},
];

export const Scene3MCPServer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame;

  const titleProgress = spring({
    frame: localFrame,
    fps,
    config: {damping: 200},
    durationInFrames: 20,
  });

  const centerProgress = spring({
    frame: localFrame - 15,
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const exitProgress = interpolate(localFrame, [230, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitProgress,
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
          opacity: titleProgress,
          marginBottom: 72,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 20,
            padding: '20px 40px',
            background: 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)',
            borderRadius: 20,
          }}
        >
          <div style={{color: '#ffffff'}}>
            <Icon type="server" size={48} />
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            MCP Server 执行引擎
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#a0a0a0',
            marginTop: 20,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          5大核心工具
        </div>
      </div>

      <div style={{position: 'relative', width: 900, height: 550}}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${centerProgress})`,
            width: 180,
            height: 180,
            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 80px rgba(25, 118, 210, 0.6)',
            opacity: centerProgress,
          }}
        >
          <div style={{color: '#ffffff'}}>
            <Icon type="server" size={80} />
          </div>
        </div>

        {tools.map((tool, index) => {
          const angle = (index * 72 - 90) * (Math.PI / 180);
          const radius = 240;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const toolProgress = spring({
            frame: localFrame - 40 - index * 8,
            fps,
            config: {damping: 200},
            durationInFrames: 20,
          });

          return (
            <div
              key={tool.name}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${toolProgress})`,
                opacity: toolProgress,
              }}
            >
              <div
                style={{
                  width: 160,
                  padding: 24,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  border: `2px solid ${tool.color}`,
                  textAlign: 'center',
                }}
              >
                <div style={{color: tool.color, marginBottom: 12}}>
                  <Icon type={tool.icon} size={48} />
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: 6,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    wordBreak: 'break-all',
                  }}
                >
                  {tool.name}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#a0a0a0',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {tool.desc}
                </div>
              </div>

              <svg
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: Math.abs(x) + 40,
                  height: Math.abs(y) + 40,
                  transform: `translate(${x > 0 ? -x - 20 : 20}px, ${y > 0 ? -y - 20 : 20}px)`,
                  pointerEvents: 'none',
                }}
              >
                <line
                  x1={x > 0 ? x + 20 : 20}
                  y1={y > 0 ? y + 20 : 20}
                  x2={x > 0 ? 20 : Math.abs(x) + 20}
                  y2={y > 0 ? 20 : Math.abs(y) + 20}
                  stroke={tool.color}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  opacity={0.5}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
