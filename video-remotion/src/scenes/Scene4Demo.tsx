import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile} from 'remotion';

const Icon = ({type, size = 48}: {type: string; size?: number}) => {
  const icons: Record<string, string> = {
    terminal: 'M4 17l6-6-6-6M12 19h8',
    config: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    skill: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    server: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
    file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    check: 'M5 13l4 4L19 7',
    arrow: 'M5 12h14M12 5l7 7-7 7',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    robot: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    list: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    open: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[type] || icons.file} />
    </svg>
  );
};

const CodeWindow: React.FC<{title: string; children: React.ReactNode; delay: number; icon?: string}> = ({
  title,
  children,
  delay,
  icon = 'file',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 200},
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        background: '#1e1e1e',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
        opacity: progress,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        style={{
          background: '#2d2d2d',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{display: 'flex', gap: 8}}>
          <div style={{width: 14, height: 14, borderRadius: '50%', background: '#ff5f56'}}></div>
          <div style={{width: 14, height: 14, borderRadius: '50%', background: '#ffbd2e'}}></div>
          <div style={{width: 14, height: 14, borderRadius: '50%', background: '#27c93f'}}></div>
        </div>
        <div style={{color: '#a0a0a0'}}>
          <Icon type={icon} size={20} />
        </div>
        <div
          style={{
            marginLeft: 8,
            fontSize: 18,
            color: '#a0a0a0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {title}
        </div>
      </div>
      <div style={{padding: 24}}>{children}</div>
    </div>
  );
};

const ChatBubble: React.FC<{isUser: boolean; text: string; delay: number; icon?: string}> = ({
  isUser,
  text,
  delay,
  icon,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 200},
    durationInFrames: 15,
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
        opacity: progress,
      }}
    >
      <div
        style={{
          maxWidth: '90%',
          padding: '16px 20px',
          borderRadius: 20,
          background: isUser
            ? 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)'
            : 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          fontSize: 16,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1.6,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        {icon && <Icon type={icon} size={20} />}
        <span>{text}</span>
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{label: string; progress: number; color: string}> = ({
  label,
  progress,
  color,
}) => (
  <div style={{marginBottom: 16}}>
    <div
      style={{
        fontSize: 16,
        color: '#a0a0a0',
        marginBottom: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {label}
    </div>
    <div
      style={{
        height: 8,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: color,
          borderRadius: 4,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  </div>
);

const SkillStep: React.FC<{number: number; text: string; active: boolean; delay: number}> = ({
  number,
  text,
  active,
  delay,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 200},
    durationInFrames: 15,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        transform: `translateX(${interpolate(progress, [0, 1], [-20, 0])}px)`,
        opacity: active ? progress : 0.3,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: active ? '#1976d2' : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: '#ffffff',
        }}
      >
        {number}
      </div>
      <span
        style={{
          fontSize: 16,
          color: active ? '#ffffff' : '#666',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {text}
      </span>
      {active && (
        <div style={{color: '#27c93f', marginLeft: 'auto'}}>
          <Icon type="check" size={16} />
        </div>
      )}
    </div>
  );
};

export const Scene4Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame;

  const installProgress = Math.min(1, Math.max(0, (localFrame - 20) / 40));
  const configProgress = Math.min(1, Math.max(0, (localFrame - 70) / 30));
  const chatProgress = Math.min(1, Math.max(0, (localFrame - 110) / 40));
  const skillStep1 = Math.min(1, Math.max(0, (localFrame - 160) / 20));
  const skillStep2 = Math.min(1, Math.max(0, (localFrame - 185) / 20));
  const skillStep3 = Math.min(1, Math.max(0, (localFrame - 210) / 20));
  const skillStep4 = Math.min(1, Math.max(0, (localFrame - 235) / 20));
  const mcpProgress = Math.min(1, Math.max(0, (localFrame - 265) / 40));
  const fileProgress = Math.min(1, Math.max(0, (localFrame - 315) / 30));
  const folderProgress = Math.min(1, Math.max(0, (localFrame - 355) / 30));
  const imageProgress = Math.min(1, Math.max(0, (localFrame - 395) / 40));

  const exitProgress = interpolate(localFrame, [440, 450], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const drawioImage = staticFile('drawio-topology.png');
  const mermaidImage = staticFile('mermaid-topology.png');

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: 60,
        opacity: exitProgress,
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div style={{color: '#1976d2'}}>
          <Icon type="arrow" size={36} />
        </div>
        实战演示：从安装到生成
      </div>

      <div style={{display: 'flex', gap: 24, height: 'calc(100% - 80px)'}}>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
          <CodeWindow title="Terminal" delay={0} icon="terminal">
            <div style={{fontFamily: 'monospace', fontSize: 16, color: '#d4d4d4'}}>
              <div style={{color: '#27c93f', display: 'flex', alignItems: 'center', gap: 8}}>
                <Icon type="terminal" size={16} />
                $ npm install -g mcp-diagram-generator
              </div>
              {installProgress > 0 && (
                <div style={{marginTop: 12}}>
                  <ProgressBar
                    label="Installing..."
                    progress={installProgress}
                    color="#27c93f"
                  />
                  {installProgress >= 1 && (
                    <div style={{color: '#27c93f', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8}}>
                      <Icon type="check" size={16} />
                      Installed successfully
                    </div>
                  )}
                </div>
              )}
            </div>
          </CodeWindow>

          <CodeWindow title=".claude.json" delay={50} icon="config">
            <div style={{fontFamily: 'monospace', fontSize: 16}}>
              <span style={{color: '#d4d4d4'}}>{'{'}</span>
              <br />
              <span style={{color: '#d4d4d4'}}>{'  "mcpServers": {'}</span>
              <br />
              <span style={{color: '#d4d4d4'}}>{'    "diagram-generator": {'}</span>
              <br />
              <span style={{color: '#9cdcfe'}}>{'      "command": '}</span>
              <span style={{color: '#ce9178'}}>"npx"</span>
              <span style={{color: '#d4d4d4'}}>,</span>
              <br />
              <span style={{color: '#9cdcfe'}}>{'      "args": '}</span>
              <span style={{color: '#d4d4d4'}}>[</span>
              <span style={{color: '#ce9178'}}>"-y"</span>
              <span style={{color: '#d4d4d4'}}>, </span>
              <span style={{color: '#ce9178'}}>"mcp-diagram-generator"</span>
              <span style={{color: '#d4d4d4'}}>]</span>
              <br />
              <span style={{color: '#d4d4d4'}}>{'    }'}</span>
              <br />
              <span style={{color: '#d4d4d4'}}>{'  }'}</span>
              <br />
              <span style={{color: '#d4d4d4'}}>{'}'}</span>
              <br />
              {configProgress >= 1 && (
                <div style={{color: '#27c93f', marginTop: 12, display: 'flex', alignItems: 'center', gap: 8}}>
                  <Icon type="check" size={16} />
                  Configuration saved
                </div>
              )}
            </div>
          </CodeWindow>

          <CodeWindow title="Chat with AI" delay={100} icon="chat">
            <div style={{height: 200, overflow: 'hidden'}}>
              {localFrame > 110 && (
                <ChatBubble
                  isUser={true}
                  text="帮我生成一个数据中心网络拓扑图，包含生产环境、北京数据中心、核心区和业务区"
                  delay={110}
                />
              )}
              {localFrame > 150 && (
                <ChatBubble
                  isUser={false}
                  text="收到！我来为您生成数据中心网络拓扑图..."
                  delay={150}
                  icon="robot"
                />
              )}
            </div>
          </CodeWindow>
        </div>


        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>

          <CodeWindow title="diagram-generator Skill" delay={160} icon="skill">
            <div style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
              {localFrame > 160 && (
                <div>
                  <div style={{color: '#1976d2', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16}}>
                    <Icon type="brain" size={18} />
                    <strong>AI 正在处理您的请求...</strong>
                  </div>
                  
                  <SkillStep 
                    number={1} 
                    text="识别图表类型：网络拓扑" 
                    active={skillStep1 > 0}
                    delay={160}
                  />
                  <SkillStep 
                    number={2} 
                    text="提取关键实体：生产环境、数据中心、核心区、业务区" 
                    active={skillStep2 > 0}
                    delay={185}
                  />
                  <SkillStep 
                    number={3} 
                    text="选择输出格式：Draw.io（支持复杂层级）" 
                    active={skillStep3 > 0}
                    delay={210}
                  />
                  <SkillStep 
                    number={4} 
                    text="生成图表规范" 
                    active={skillStep4 > 0}
                    delay={235}
                  />
                  
                  {skillStep4 >= 1 && (
                    <div style={{marginTop: 12, padding: 12, background: 'rgba(25, 118, 210, 0.1)', borderRadius: 8}}>
                      <div style={{color: '#9cdcfe', fontSize: 13, fontFamily: 'monospace'}}>
                        {`{`}
                        <br/>
                        {`  "format": "drawio",`}
                        <br/>
                        {`  "elements": 15,`}
                        <br/>
                        {`  "edges": 12`}
                        <br/>
                        {`}`}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CodeWindow>

          <CodeWindow title="MCP Server" delay={265} icon="server">
            <div style={{fontFamily: 'monospace', fontSize: 16, color: '#d4d4d4'}}>
              {mcpProgress > 0 && (
                <div>
                  <div style={{color: '#7b1fa2', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8}}>
                    <Icon type="server" size={16} />
                    mcp-diagram-generator
                  </div>
                  <div
                    style={{
                      background: 'rgba(123, 31, 162, 0.2)',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{color: '#ce9178'}}>Calling: generate_diagram</div>
                    <div style={{color: '#9cdcfe', marginTop: 8}}>format: "drawio"</div>
                    <div style={{color: '#9cdcfe'}}>output: "topology/"</div>
                  </div>
                  <ProgressBar
                    label="Generating diagram..."
                    progress={mcpProgress}
                    color="#7b1fa2"
                  />
                  {mcpProgress >= 1 && (
                    <div style={{color: '#27c93f', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8}}>
                      <Icon type="check" size={16} />
                      Saved: topology/数据中心网络拓扑.drawio
                    </div>
                  )}
                </div>
              )}
            </div>
          </CodeWindow>

          <CodeWindow title="File Explorer" delay={315} icon="folder">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 120,
              }}
            >
              {fileProgress > 0 && (
                <div style={{textAlign: 'center', width: '100%'}}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: '12px 20px',
                      background: 'rgba(25, 118, 210, 0.1)',
                      borderRadius: 8,
                      marginBottom: 12,
                      transform: `scale(${interpolate(fileProgress, [0, 1], [0.9, 1])})`,
                      opacity: fileProgress,
                    }}
                  >
                    <div style={{color: '#1976d2'}}>
                      <Icon type="file" size={32} />
                    </div>
                    <div style={{textAlign: 'left'}}>
                      <div style={{color: '#ffffff', fontSize: 16}}>数据中心网络拓扑.drawio</div>
                      <div style={{color: '#a0a0a0', fontSize: 13}}>84 KB</div>
                    </div>
                  </div>
                  
                  {folderProgress > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: '#27c93f',
                        fontSize: 14,
                        transform: `translateY(${interpolate(folderProgress, [0, 1], [10, 0])}px)`,
                        opacity: folderProgress,
                      }}
                    >
                      <Icon type="folder" size={16} />
                      正在打开文件夹...
                      <Icon type="open" size={16} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CodeWindow>
        </div>
      </div>


      {imageProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: imageProgress,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 32,
              maxWidth: 1300,
              transform: `scale(${interpolate(imageProgress, [0, 1], [0.8, 1])})`,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#1a1a2e',
                marginBottom: 20,
                textAlign: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <div style={{color: '#1976d2'}}>
                <Icon type="image" size={28} />
              </div>
              数据中心网络拓扑
            </div>

            <div style={{display: 'flex', gap: 24, alignItems: 'flex-start'}}>
              <div style={{flex: 1}}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#666',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}
                >
                  Draw.io 格式
                </div>
                <Img
                  src={drawioImage}
                  style={{
                    maxWidth: 580,
                    maxHeight: 450,
                    borderRadius: 12,
                    border: '2px solid #e0e0e0',
                  }}
                />
              </div>

              <div style={{flex: 1}}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#666',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}
                >
                  Mermaid 格式
                </div>
                <Img
                  src={mermaidImage}
                  style={{
                    maxWidth: 580,
                    maxHeight: 450,
                    borderRadius: 12,
                    border: '2px solid #e0e0e0',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
